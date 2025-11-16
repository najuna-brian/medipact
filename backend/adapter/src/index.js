/**
 * MediPact CSV Adapter - Main Entry Point
 *
 * PRIMARY USE-CASE (TODAY):
 * - Hospital uploads a CSV export of EHR data (no direct EMR integration needed)
 * - Adapter applies DOUBLE ANONYMIZATION:
 *   - Stage 1: Storage anonymization (kept in MediPact backend)
 *   - Stage 2: Chain anonymization (max privacy for blockchain proofs)
 * - Adapter generates:
 *   - Consent proofs on Hedera HCS (per patient, NO PII)
 *   - Optional on-chain consent records in ConsentManager (per anonymous patient ID)
 *   - Provenance records linking Storage H1 and Chain H2 for each record
 *
 * IMPORTANT:
 * - This adapter is currently the "consent CREATION" path for CSV uploads.
 * - The consent-FIRST pre-check (checking ConsentManager before processing) is implemented
 *   in the universal EMR adapter (index-universal.js) and can be extended here later.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { parseCSV, writeAnonymizedCSV } from './anonymizer/anonymize.js';
import { anonymizeWithDemographics, anonymizeCSVRecordsForChain } from './anonymizer/demographic-anonymize.js';
import { hashPatientRecord, hashConsentForm, hashBatch, generateProvenanceProof } from './utils/hash.js';
import { formatHbar, hbarToUsd, usdToLocal, formatCurrency, calculateRevenueSplit } from './utils/currency.js';
import { 
  createHederaClient, 
  initializeMedipactTopics, 
  submitMessage, 
  getHashScanLink 
} from './hedera/hcs-client.js';
import { 
  recordConsentOnChain,
  executeRealPayout
} from './hedera/evm-client.js';
import { distributeRevenueAfterProcessing } from './services/revenue-integration.js';
import { csvToFHIRBundle } from './transformers/csv-to-fhir-transformer.js';
import { processFHIRResource } from './handlers/resource-handler.js';
import { storeFHIRResources } from './storage/fhir-storage.js';
import { Hbar } from '@hashgraph/sdk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_FILE = path.join(__dirname, '../data/raw_data.csv');
const OUTPUT_FILE = path.join(__dirname, '../data/anonymized_data.csv');

/**
 * Process a single patient record with double anonymization
 * @param {Object} storageAnonymizedRecord - Storage-anonymized record (Stage 1)
 * @param {Object} chainAnonymizedRecord - Chain-anonymized record (Stage 2)
 * @param {string} dataTopicId - HCS topic ID for data proofs
 * @param {Client} client - Hedera client
 * @returns {Promise<Object>} Processing result with transaction info
 */
async function processPatientRecord(storageAnonymizedRecord, chainAnonymizedRecord, dataTopicId, client) {
  // Stage 1: Storage hash
  const storageHash = hashPatientRecord(storageAnonymizedRecord);
  
  // Stage 2: Chain hash
  const chainHash = hashPatientRecord(chainAnonymizedRecord);
  
  // Generate provenance proof
  const provenanceProof = generateProvenanceProof(
    storageHash,
    chainHash,
    storageAnonymizedRecord['Anonymous PID'],
    'CSVRecord'
  );
  
  // Create provenance record
  const provenanceRecord = {
    storage: {
      hash: storageHash,
      anonymizationLevel: 'storage',
      timestamp: new Date().toISOString()
    },
    chain: {
      hash: chainHash,
      anonymizationLevel: 'chain',
      derivedFrom: storageHash,
      timestamp: new Date().toISOString()
    },
    anonymousPatientId: storageAnonymizedRecord['Anonymous PID'],
    resourceType: 'CSVRecord',
    timestamp: new Date().toISOString(),
    provenanceProof
  };
  
  // Submit provenance record to HCS
  const transactionId = await submitMessage(client, dataTopicId, JSON.stringify(provenanceRecord));
  
  return {
    anonymousPID: storageAnonymizedRecord['Anonymous PID'],
    storageHash,
    chainHash,
    provenanceProof,
    transactionId,
    hashScanLink: getHashScanLink(transactionId)
  };
}

/**
 * Generate consent proof hash for a patient (NO original patient ID)
 * @param {string} anonymousPatientId - Anonymous patient ID (e.g., PID-001)
 * @param {string} dataHash - Hash of the anonymized data
 * @param {string} consentTopicId - HCS topic ID for consent proofs
 * @param {Client} client - Hedera client
 * @returns {Promise<Object>} Consent proof result
 */
async function processConsentProof(anonymousPatientId, dataHash, consentTopicId, client) {
  // Use data hash as consent hash (no original patient ID)
  const consentHash = hashConsentForm(anonymousPatientId, new Date().toISOString());
  const transactionId = await submitMessage(client, consentTopicId, consentHash);
  
  // Record consent on-chain using ConsentManager contract (NO original patient ID)
  if (process.env.CONSENT_MANAGER_ADDRESS) {
    try {
      const onChainTxId = await recordConsentOnChain(
        client,
        process.env.CONSENT_MANAGER_ADDRESS,
        anonymousPatientId,
        consentTopicId,
        dataHash
      );
      console.log(`   ✓ Successfully recorded consent proof on-chain in ConsentManager contract: ${getHashScanLink(onChainTxId)}`);
    } catch (error) {
      console.error(`   ⚠️  Failed to record consent on-chain: ${error.message}`);
      // Continue execution even if on-chain recording fails
    }
  }
  
  return {
    anonymousPatientId,
    consentHash,
    dataHash,
    transactionId,
    hashScanLink: getHashScanLink(transactionId)
  };
}

/**
 * Main adapter function
 */
async function main() {
  console.log('=== MediPact Adapter ===\n');
  
  try {
    // Step 1: Load hospital configuration (REQUIRED)
    console.log('1. Loading hospital configuration...');
    if (!process.env.HOSPITAL_COUNTRY) {
      throw new Error('HOSPITAL_COUNTRY environment variable is required');
    }
    
    const hospitalInfo = {
      country: process.env.HOSPITAL_COUNTRY,  // REQUIRED
      location: process.env.HOSPITAL_LOCATION || null  // Optional
    };
    console.log(`   ✓ Hospital Country: ${hospitalInfo.country}`);
    if (hospitalInfo.location) {
      console.log(`   ✓ Hospital Location: ${hospitalInfo.location}`);
    }
    console.log('');

    // Step 2: Initialize Hedera client
    console.log('2. Initializing Hedera client...');
    const client = createHederaClient();
    console.log('   ✓ Client initialized\n');

    // Step 3: Initialize HCS topics (create if needed)
    console.log('3. Setting up HCS topics...');
    const { consentTopicId, dataTopicId } = await initializeMedipactTopics(client);
    console.log(`   ✓ Consent Topic: ${consentTopicId}`);
    console.log(`   ✓ Data Topic: ${dataTopicId}\n`);

    // Step 4: Read and parse CSV file
    console.log('4. Reading EHR data...');
    const rawRecords = await parseCSV(INPUT_FILE);
    console.log(`   ✓ Read ${rawRecords.length} records from ${INPUT_FILE}\n`);

    // Step 5: Convert CSV to FHIR Bundle (all 10 domains)
    console.log('5. Converting CSV to FHIR R4 Bundle (all 10 domains)...');
    const fhirBundle = csvToFHIRBundle(rawRecords, {
      country: hospitalInfo.country,
      location: hospitalInfo.location,
      hospitalId: process.env.HOSPITAL_ID || null
    });
    console.log(`   ✓ Created FHIR Bundle with ${fhirBundle.entry.length} resources`);
    const resourceCounts = {};
    fhirBundle.entry.forEach(entry => {
      const type = entry.resource.resourceType;
      resourceCounts[type] = (resourceCounts[type] || 0) + 1;
    });
    Object.entries(resourceCounts).forEach(([type, count]) => {
      console.log(`     - ${type}: ${count}`);
    });
    console.log('');

    // Step 6: Process FHIR resources (anonymize and prepare for storage)
    console.log('6. Processing and anonymizing FHIR resources...');
    const processedResources = [];
    const patientMapping = new Map();
    let pidIndex = 0;

    // First pass: Build patient mapping from Patient resources
    for (const entry of fhirBundle.entry) {
      if (entry.resource.resourceType === 'Patient') {
        const originalId = entry.resource.id;
        const anonymousId = `PID-${String(pidIndex + 1).padStart(3, '0')}`;
        patientMapping.set(originalId, anonymousId);
        // Also add with Patient/ prefix for lookup flexibility
        patientMapping.set(`Patient/${originalId}`, anonymousId);
        console.log(`   Mapping: ${originalId} -> ${anonymousId}`);
        pidIndex++;
      }
    }
    
    console.log(`   ✓ Built patient mapping for ${patientMapping.size / 2} patients\n`);

    // Second pass: Process all resources
    const context = {
      hospitalId: process.env.HOSPITAL_ID || null,
      hospitalInfo,
      patientMapping,
      upi: null
    };

    for (const entry of fhirBundle.entry) {
      try {
        const processed = await processFHIRResource(entry.resource, context);
        processedResources.push(processed);
      } catch (error) {
        // Log error but continue processing other resources
        // Some resources may fail due to missing patient mappings, which is OK
        console.error(`     ✗ Error processing ${entry.resource.resourceType} ${entry.resource.id}:`, error.message);
        // Only skip if it's a critical error (not just missing patient mapping)
        if (!error.message.includes('Patient mapping not found')) {
          // For non-patient-mapping errors, we might want to handle differently
        }
      }
    }

    console.log(`   ✓ Processed ${processedResources.length} FHIR resources\n`);

    // Step 7: Store FHIR resources to backend (if configured)
    const apiKey = process.env.HOSPITAL_API_KEY;
    const backendApiUrl = process.env.BACKEND_API_URL;
    if (apiKey && backendApiUrl && context.hospitalId) {
      console.log('7. Storing FHIR resources to backend...');
      try {
        const storageResult = await storeFHIRResources(
          processedResources,
          context.hospitalId,
          apiKey
        );
        console.log(`   ✓ Stored: ${storageResult.successful} successful, ${storageResult.failed} failed\n`);
      } catch (error) {
        console.error(`   ✗ Storage failed: ${error.message}\n`);
      }
    } else {
      console.log('7. Skipping backend storage (no API key, backend URL, or hospital ID)\n');
    }

    // Step 8: Generate anonymized CSV for legacy compatibility
    console.log('8. Generating anonymized CSV (legacy format)...');
    const anonymizationResult = anonymizeWithDemographics(
      rawRecords,
      hospitalInfo
    );
    const { records: anonymizedRecords, patientMapping: csvPatientMapping, upiMapping } = anonymizationResult;
    
    // Only write CSV if we have records (k-anonymity might suppress all)
    if (anonymizedRecords && anonymizedRecords.length > 0) {
      await writeAnonymizedCSV(anonymizedRecords, OUTPUT_FILE);
      console.log(`   ✓ Anonymized CSV saved: ${anonymizedRecords.length} records\n`);
    } else {
      console.log(`   ⚠️  No anonymized records to write (k-anonymity suppression or no valid records)\n`);
    }

    // Step 9: Process consent proofs (one per unique patient) - NO original patient ID
    console.log('9. Processing consent proofs...');
    const consentResults = [];
    const patientDataHashes = new Map(); // Track data hashes per patient
    
    // Generate data hashes for each patient from processed FHIR resources
    const patientResources = new Map();
    processedResources.forEach(processed => {
      const anonymousId = processed.processed.anonymousPatientId;
      if (anonymousId) {
        if (!patientResources.has(anonymousId)) {
          patientResources.set(anonymousId, []);
        }
        patientResources.get(anonymousId).push(processed.anonymized);
      }
    });
    
    // Generate consent hashes
    for (const [anonymousPID, resources] of patientResources) {
      const dataHash = hashBatch(resources);
      patientDataHashes.set(anonymousPID, dataHash);
    }
    
    // Process consent proofs (NO original patient ID)
    for (const [anonymousPID, dataHash] of patientDataHashes) {
      const result = await processConsentProof(anonymousPID, dataHash, consentTopicId, client);
      consentResults.push(result);
      console.log(`   ✓ Consent proof for ${anonymousPID}: ${result.hashScanLink}`);
    }
    console.log('');

    // Step 10: Apply Stage 2 (Chain) anonymization and create provenance proofs
    console.log('10. Applying Stage 2 (Chain) anonymization and creating provenance proofs...');
    const dataResults = [];
    
    for (const processed of processedResources) {
      try {
        // Stage 1: Storage anonymization (already done in processFHIRResource)
        const storageHash = hashPatientRecord(processed.anonymized);
        
        // Stage 2: Chain anonymization (further generalization)
        const { anonymizeForChain } = await import('./fhir/fhir-anonymizer.js');
        const chainAnonymized = await anonymizeForChain(
          processed.anonymized,
          processed.resourceType,
          context
        );
        const chainHash = hashPatientRecord(chainAnonymized);
        
        // Get anonymous patient ID
        const anonymousPatientId = processed.processed.anonymousPatientId || 
                                   processed.processed.id || 
                                   'unknown';
        
        // Generate provenance proof linking both hashes
        const provenanceProof = generateProvenanceProof(
          storageHash,
          chainHash,
          anonymousPatientId,
          processed.resourceType
        );
        
        // Create provenance record
        const provenanceRecord = {
          storage: {
            hash: storageHash,
            anonymizationLevel: 'storage',
            timestamp: new Date().toISOString()
          },
          chain: {
            hash: chainHash,
            anonymizationLevel: 'chain',
            derivedFrom: storageHash,
            timestamp: new Date().toISOString()
          },
          anonymousPatientId,
          resourceType: processed.resourceType,
          hospitalId: context.hospitalId,
          timestamp: new Date().toISOString(),
          provenanceProof
        };
        
        // Submit provenance record to HCS
        const transactionId = await submitMessage(
          client, 
          dataTopicId, 
          JSON.stringify(provenanceRecord)
        );

        dataResults.push({
          resourceType: processed.resourceType,
          anonymousId: anonymousPatientId,
          storageHash,
          chainHash,
          provenanceProof,
          transactionId,
          hashScanLink: getHashScanLink(transactionId)
        });

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        console.error(`     ✗ Provenance proof failed for ${processed.resourceType}:`, error.message);
      }
    }
    console.log(`   ✓ Created ${dataResults.length} provenance proofs\n`);

    // Step 11: Display summary
    console.log('=== Processing Complete ===\n');
    console.log('Summary:');
    console.log(`  - CSV records read: ${rawRecords.length}`);
    console.log(`  - FHIR resources created: ${fhirBundle.entry.length}`);
    console.log(`  - FHIR resources processed: ${processedResources.length}`);
    console.log(`  - Unique patients: ${patientMapping.size}`);
    console.log(`  - Consent proofs: ${consentResults.length}`);
    console.log(`  - Provenance proofs (double anonymization): ${dataResults.length}`);
    console.log(`  - Output file: ${OUTPUT_FILE}\n`);
    
    // Display resource type breakdown
    console.log('FHIR Resource Breakdown:');
    Object.entries(resourceCounts).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });
    console.log('');

    // Step 12: Display topic links
    const { getHederaNetwork } = await import('./utils/network-config.js');
    const network = getHederaNetwork();
    const networkPath = network === 'mainnet' ? '' : `${network}.`;
    console.log('HCS Topics:');
    console.log(`  Consent Topic: https://hashscan.io/${networkPath}topic/${consentTopicId}`);
    console.log(`  Data Topic: https://hashscan.io/${networkPath}topic/${dataTopicId}\n`);

    // Step 13: Payout simulation (placeholder)
    // Note: This is a simulation for demo purposes.
    // In production, this would use actual HBAR transfers via TransferTransaction.
    // Currency conversion rates are example values and should be fetched from:
    //   - HBAR/USD: Hedera Network Exchange Rate or CoinGecko API
    //   - USD/Local: Exchange rate API (e.g., exchangerate-api.com, fixer.io)
    console.log('=== Payout Simulation ===');
    const totalRecords = anonymizedRecords.length;
    
    // Simulated pricing: 0.01 HBAR per record
    // HBAR has 8 decimal places (1 HBAR = 100,000,000 tinybars)
    const hbarPerRecord = 0.01;
    const totalHbar = totalRecords * hbarPerRecord;
    
    // Revenue split: 60% patient, 25% hospital, 15% MediPact
    const split = calculateRevenueSplit(totalHbar, {
      patient: 60,
      hospital: 25,
      medipact: 15
    });
    
    // Currency conversion rates (example values for simulation)
    // In production, fetch from:
    //   - HBAR/USD: Hedera network exchange rate or CoinGecko
    //   - USD/Local: Exchange rate API
    const hbarToUsdRate = 0.05; // Example: 1 HBAR = $0.05 USD
    
    // Local currency configuration (optional)
    // Set LOCAL_CURRENCY_CODE in .env to enable local currency display
    // Set USD_TO_LOCAL_RATE in .env for the exchange rate
    const localCurrencyCode = process.env.LOCAL_CURRENCY_CODE || null;
    const usdToLocalRate = process.env.USD_TO_LOCAL_RATE ? parseFloat(process.env.USD_TO_LOCAL_RATE) : null;
    
    // Convert to USD (primary currency)
    const totalUsd = hbarToUsd(totalHbar, hbarToUsdRate);
    const patientShareUsd = hbarToUsd(split.patient, hbarToUsdRate);
    const hospitalShareUsd = hbarToUsd(split.hospital, hbarToUsdRate);
    const medipactShareUsd = hbarToUsd(split.medipact, hbarToUsdRate);
    const perPatientShareUsd = patientShareUsd / patientMapping.size;
    
    console.log(`Total Revenue: ${formatHbar(totalHbar)} HBAR`);
    console.log(`  Patient Share (60%): ${formatHbar(split.patient)} HBAR`);
    console.log(`  Hospital Share (25%): ${formatHbar(split.hospital)} HBAR`);
    console.log(`  MediPact Share (15%): ${formatHbar(split.medipact)} HBAR`);
    
    console.log(`\nCurrency Conversion (Example Rates):`);
    console.log(`  1 HBAR = ${formatCurrency(hbarToUsdRate, 'USD')}`);
    
    console.log(`\nRevenue in USD:`);
    console.log(`  Total: ${formatCurrency(totalUsd, 'USD')}`);
    console.log(`  Patient Share: ${formatCurrency(patientShareUsd, 'USD')}`);
    console.log(`  Hospital Share: ${formatCurrency(hospitalShareUsd, 'USD')}`);
    console.log(`  MediPact Share: ${formatCurrency(medipactShareUsd, 'USD')}`);
    console.log(`  Per Patient: ${formatCurrency(perPatientShareUsd, 'USD')}`);
    
    // Display local currency if configured
    if (localCurrencyCode && usdToLocalRate) {
      const patientShareLocal = usdToLocal(patientShareUsd, usdToLocalRate);
      const perPatientShareLocal = usdToLocal(perPatientShareUsd, usdToLocalRate);
      
      console.log(`\nCurrency Conversion (Example Rates):`);
      console.log(`  1 USD = ${usdToLocalRate.toLocaleString()} ${localCurrencyCode}`);
      
      console.log(`\nRevenue in ${localCurrencyCode} (for reference):`);
      console.log(`  Patient Share: ${formatCurrency(patientShareLocal, localCurrencyCode)}`);
      console.log(`  Per Patient: ${formatCurrency(perPatientShareLocal, localCurrencyCode)}`);
    } else if (localCurrencyCode || usdToLocalRate) {
      console.log(`\n⚠️  Local currency partially configured. Set both LOCAL_CURRENCY_CODE and USD_TO_LOCAL_RATE in .env`);
    }
    
    console.log(`\nPAYOUT SIMULATED: ${formatCurrency(perPatientShareUsd, 'USD')} per patient (${patientMapping.size} patients)\n`);

    // Step 12: Execute real revenue distribution using backend API
    // This uses Hedera Account IDs for direct HBAR transfers
    const hospitalId = process.env.HOSPITAL_ID;
    const revenueBackendApiUrl = process.env.BACKEND_API_URL || 'http://localhost:3002';
    
    if (hospitalId && revenueBackendApiUrl) {
      console.log('=== 7. EXECUTE REVENUE DISTRIBUTION ===');
      try {
        // Calculate records per patient for proportional distribution
        const recordsPerPatient = new Map();
        for (const [originalPatientId, anonymousPID] of patientMapping) {
          const patientRecords = anonymizedRecords.filter(r => r['Anonymous PID'] === anonymousPID);
          recordsPerPatient.set(originalPatientId, patientRecords.length);
        }

        // Convert total HBAR to tinybars
        const totalTinybars = Math.floor(totalHbar * 100000000);

        // Distribute revenue using backend API
        const distributionResult = await distributeRevenueAfterProcessing({
          patientMapping,
          upiMapping: upiMapping || null,
          rawRecords: rawRecords, // Pass raw records for UPI lookup
          hospitalId,
          totalRevenue: totalTinybars,
          recordsPerPatient
        });

        if (distributionResult.success) {
          console.log(`   ✓ Revenue distribution successful!`);
          console.log(`   ✓ Total patients: ${distributionResult.total}`);
          console.log(`   ✓ Successful: ${distributionResult.successful}`);
          console.log(`   ✓ Failed: ${distributionResult.failed}`);
          
          // Show transaction IDs
          if (distributionResult.results && distributionResult.results.length > 0) {
            console.log(`\n   Transaction Details:`);
            distributionResult.results.forEach((result, index) => {
              if (result.success && result.distribution) {
                console.log(`     Patient ${index + 1}: ${result.distribution.transactionId}`);
                if (result.distribution.transfers) {
                  console.log(`       Patient: ${result.distribution.transfers.patient.amount}`);
                  console.log(`       Hospital: ${result.distribution.transfers.hospital.amount}`);
                }
              }
            });
          }
          console.log('');
        } else if (distributionResult.skipped) {
          console.log(`   ⚠️  Revenue distribution skipped: ${distributionResult.reason}\n`);
        } else {
          console.error(`   ⚠️  Revenue distribution failed: ${distributionResult.error}\n`);
        }
      } catch (error) {
        console.error(`   ⚠️  Failed to execute revenue distribution: ${error.message}`);
        console.log(`   Continuing with simulation-only mode...\n`);
      }
    } else {
      console.log('⚠️  HOSPITAL_ID or BACKEND_API_URL not configured. Skipping revenue distribution.');
      console.log('   Set HOSPITAL_ID and BACKEND_API_URL in .env to enable revenue distribution.\n');
    }

    // Step 13: Legacy RevenueSplitter contract support (optional)
    // Transfer HBAR to RevenueSplitter contract which will automatically split the revenue
    if (process.env.REVENUE_SPLITTER_ADDRESS && !hospitalId) {
      console.log('=== 8. EXECUTE LEGACY PAYOUT (RevenueSplitter Contract) ===');
      try {
        const totalHbarPayout = new Hbar(totalHbar);
        const payoutTxId = await executeRealPayout(
          client,
          process.env.REVENUE_SPLITTER_ADDRESS,
          totalHbarPayout
        );
        console.log(`   ✓ Real payout executed successfully!`);
        console.log(`   ✓ Transaction ID: ${payoutTxId}`);
        console.log(`   ✓ HashScan: ${getHashScanLink(payoutTxId)}`);
        console.log(`   ✓ RevenueSplitter contract will automatically distribute:`);
        console.log(`     - Patient Share (60%): ${formatHbar(split.patient)} HBAR`);
        console.log(`     - Hospital Share (25%): ${formatHbar(split.hospital)} HBAR`);
        console.log(`     - MediPact Share (15%): ${formatHbar(split.medipact)} HBAR\n`);
      } catch (error) {
        console.error(`   ⚠️  Failed to execute real payout: ${error.message}`);
        console.log(`   Continuing with simulation-only mode...\n`);
      }
    }

    // Close client
    client.close();
    
    console.log('✓ All done!');
    
  } catch (error) {
    console.error('Error in adapter:', error);
    process.exit(1);
  }
}

// Run the adapter
main();
