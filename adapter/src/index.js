/**
 * MediPact Adapter - Main Entry Point
 * 
 * This script processes hospital EHR data, anonymizes it, and submits
 * proof hashes to Hedera Consensus Service (HCS).
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { parseCSV, writeAnonymizedCSV } from './anonymizer/anonymize.js';
import { anonymizeWithDemographics } from './anonymizer/demographic-anonymize.js';
import { hashPatientRecord, hashConsentForm, hashBatch } from './utils/hash.js';
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
import { Hbar } from '@hashgraph/sdk';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const INPUT_FILE = path.join(__dirname, '../data/raw_data.csv');
const OUTPUT_FILE = path.join(__dirname, '../data/anonymized_data.csv');

/**
 * Process a single patient record
 * @param {Object} anonymizedRecord - Anonymized patient record
 * @param {string} dataTopicId - HCS topic ID for data proofs
 * @param {Client} client - Hedera client
 * @returns {Promise<Object>} Processing result with transaction info
 */
async function processPatientRecord(anonymizedRecord, dataTopicId, client) {
  // Generate hash of the anonymized record
  const dataHash = hashPatientRecord(anonymizedRecord);
  
  // Submit data proof to HCS
  const transactionId = await submitMessage(client, dataTopicId, dataHash);
  
  return {
    anonymousPID: anonymizedRecord['Anonymous PID'],
    dataHash,
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

    // Step 5: Anonymize data with demographics
    console.log('5. Anonymizing patient data with demographics...');
    const anonymizationResult = anonymizeWithDemographics(
      rawRecords,
      hospitalInfo
    );
    const { records: anonymizedRecords, patientMapping, upiMapping } = anonymizationResult;
    console.log(`   ✓ Anonymized ${anonymizedRecords.length} records`);
    console.log(`   ✓ Mapped ${patientMapping.size} unique patients`);
    if (upiMapping) {
      console.log(`   ✓ UPI mapping: ${upiMapping.size} patients with UPI`);
    }
    console.log(`   ✓ Demographics preserved: Age Range, Country, Gender, Occupation Category\n`);

    // Step 6: Write anonymized data to CSV
    console.log('6. Writing anonymized data...');
    await writeAnonymizedCSV(anonymizedRecords, OUTPUT_FILE);
    console.log('   ✓ Anonymized data saved\n');

    // Step 7: Process consent proofs (one per unique patient) - NO original patient ID
    console.log('7. Processing consent proofs...');
    const consentResults = [];
    const patientDataHashes = new Map(); // Track data hashes per patient
    
    // First, generate data hashes for each patient
    for (const [originalPatientId, anonymousPID] of patientMapping) {
      // Find all records for this patient
      const patientRecords = anonymizedRecords.filter(r => r['Anonymous PID'] === anonymousPID);
      if (patientRecords.length > 0) {
        // Generate hash of all records for this patient
        const dataHash = hashBatch(patientRecords);
        patientDataHashes.set(anonymousPID, dataHash);
      }
    }
    
    // Process consent proofs (NO original patient ID)
    for (const [originalPatientId, anonymousPID] of patientMapping) {
      const dataHash = patientDataHashes.get(anonymousPID);
      if (dataHash) {
        const result = await processConsentProof(anonymousPID, dataHash, consentTopicId, client);
        consentResults.push(result);
        console.log(`   ✓ Consent proof for ${anonymousPID}: ${result.hashScanLink}`);
      }
    }
    console.log('');

    // Step 8: Process data proofs (one per record)
    console.log('8. Processing data proofs...');
    const dataResults = [];
    for (const record of anonymizedRecords) {
      const result = await processPatientRecord(record, dataTopicId, client);
      dataResults.push(result);
      console.log(`   ✓ Data proof for ${result.anonymousPID}: ${result.hashScanLink}`);
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.log('');

    // Step 9: Display summary
    console.log('=== Processing Complete ===\n');
    console.log('Summary:');
    console.log(`  - Records processed: ${anonymizedRecords.length}`);
    console.log(`  - Unique patients: ${patientMapping.size}`);
    console.log(`  - Consent proofs: ${consentResults.length}`);
    console.log(`  - Data proofs: ${dataResults.length}`);
    console.log(`  - Output file: ${OUTPUT_FILE}\n`);

    // Step 10: Display topic links
    console.log('HCS Topics:');
    console.log(`  Consent Topic: https://hashscan.io/testnet/topic/${consentTopicId}`);
    console.log(`  Data Topic: https://hashscan.io/testnet/topic/${dataTopicId}\n`);

    // Step 11: Payout simulation (placeholder)
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
    const backendApiUrl = process.env.BACKEND_API_URL || 'http://localhost:3002';
    
    if (hospitalId && backendApiUrl) {
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
