/**
 * MediPact Universal Adapter - Main Entry Point
 * 
 * Universal adapter that can connect to ANY healthcare system and extract ALL FHIR resources.
 * Supports: FHIR, OpenMRS, OpenELIS, Medic, and any future systems.
 */

import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import fs from 'fs';
import { UniversalExtractor } from './extractors/universal-extractor.js';
import { processFHIRResources } from './handlers/resource-handler.js';
import { storeFHIRResources } from './storage/fhir-storage.js';
import { anonymizeFHIRBundle, anonymizeForChain } from './fhir/fhir-anonymizer.js';
import { hashPatientRecord, hashBatch, generateProvenanceProof } from './utils/hash.js';
import { 
  createHederaClient, 
  initializeMedipactTopics, 
  submitMessage, 
  getHashScanLink 
} from './hedera/hcs-client.js';
import { recordConsentOnChain } from './hedera/evm-client.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Main adapter function
 */
async function main() {
  console.log('=== MediPact Universal Adapter ===\n');

  try {
    // Step 1: Load configuration
    console.log('1. Loading configuration...');
    const systemsConfig = loadSystemsConfig();
    
    if (!systemsConfig || systemsConfig.systems.length === 0) {
      throw new Error('No systems configured. Create adapter/config/systems.json');
    }

    console.log(`   ✓ Loaded ${systemsConfig.systems.length} system(s)\n`);

    // Step 2: Initialize Hedera client
    console.log('2. Initializing Hedera client...');
    const client = createHederaClient();
    console.log('   ✓ Client initialized\n');

    // Step 3: Initialize HCS topics
    console.log('3. Setting up HCS topics...');
    const { consentTopicId, dataTopicId } = await initializeMedipactTopics(client);
    console.log(`   ✓ Consent Topic: ${consentTopicId}`);
    console.log(`   ✓ Data Topic: ${dataTopicId}\n`);

    // Step 4: Process each system
    const allResults = [];

    for (const systemConfig of systemsConfig.systems) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`Processing System: ${systemConfig.name || systemConfig.systemId}`);
      console.log(`Type: ${systemConfig.systemType}`);
      console.log(`${'='.repeat(60)}\n`);

      try {
        const result = await processSystem(systemConfig, {
          consentTopicId,
          dataTopicId,
          client
        });

        allResults.push({
          systemId: systemConfig.systemId,
          success: true,
          result
        });
      } catch (error) {
        console.error(`\n✗ Failed to process system ${systemConfig.systemId}:`, error.message);
        allResults.push({
          systemId: systemConfig.systemId,
          success: false,
          error: error.message
        });
      }
    }

    // Step 5: Summary
    console.log('\n' + '='.repeat(60));
    console.log('=== Processing Complete ===\n');
    
    allResults.forEach(r => {
      if (r.success) {
        console.log(`✓ ${r.systemId}: ${r.result.summary.totalResources} resources extracted`);
      } else {
        console.log(`✗ ${r.systemId}: ${r.error}`);
      }
    });

    // Close client
    client.close();
    console.log('\n✓ All done!');

  } catch (error) {
    console.error('Error in adapter:', error);
    process.exit(1);
  }
}

/**
 * Process a single system
 */
async function processSystem(systemConfig, hederaContext) {
  const { consentTopicId, dataTopicId, client } = hederaContext;

  // Step 1: Extract data
  const extractor = new UniversalExtractor(systemConfig);
  const extractionResult = await extractor.extractAll({
    resourceTypes: systemConfig.resources?.enabled || null,
    filters: {
      startDate: systemConfig.resources?.lastSync || null
    }
  });

  console.log(`\n📊 Extraction Summary:`);
  console.log(`   Total Resources: ${extractionResult.summary.totalResources}`);
  Object.entries(extractionResult.summary.byType).forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

  // Step 2: Build patient mapping
  const patientMapping = buildPatientMapping(extractionResult.resources);
  console.log(`\n   Unique Patients: ${patientMapping.size}`);

  // Step 3: Process and anonymize resources
  console.log('\n2. Processing and anonymizing resources...');
  const hospitalInfo = {
    country: process.env.HOSPITAL_COUNTRY || systemConfig.hospitalCountry || 'Unknown',
    location: process.env.HOSPITAL_LOCATION || systemConfig.hospitalLocation || null
  };

  const context = {
    hospitalId: systemConfig.hospitalId,
    hospitalInfo,
    patientMapping,
    upi: null // Will be looked up if needed
  };

  const processedResources = [];
  const patientDataHashes = new Map();

  // Process each resource type
  for (const [resourceType, resources] of Object.entries(extractionResult.resources)) {
    if (resources.length === 0) continue;

    console.log(`   Processing ${resourceType}...`);

    for (const resource of resources) {
      try {
        const processed = await processFHIRResource(resource, context);
        processedResources.push(processed);

        // Track storage hashes for consent proofs (use Stage 1 anonymization)
        if (resourceType === 'Patient') {
          const anonymousId = processed.processed.anonymousPatientId;
          if (anonymousId && !patientDataHashes.has(anonymousId)) {
            // Find all resources for this patient (storage-anonymized)
            const patientResources = processedResources
              .filter(p => p.processed.anonymousPatientId === anonymousId)
              .map(p => p.anonymized);  // Use storage-anonymized data for consent
            
            if (patientResources.length > 0) {
              // Use storage hash for consent (Stage 1)
              const storageDataHash = hashBatch(patientResources);
              patientDataHashes.set(anonymousId, storageDataHash);
            }
          }
        }
      } catch (error) {
        console.error(`     ✗ Error processing ${resourceType} ${resource.id}:`, error.message);
      }
    }
  }

  console.log(`   ✓ Processed ${processedResources.length} resources\n`);

  // Step 4: Store to backend
  console.log('3. Storing resources to backend...');
  const apiKey = systemConfig.connection?.apiKey || process.env.HOSPITAL_API_KEY;
  
  if (apiKey && systemConfig.hospitalId) {
    try {
      const storageResult = await storeFHIRResources(
        processedResources,
        systemConfig.hospitalId,
        apiKey
      );
      console.log(`   ✓ Stored: ${storageResult.successful} successful, ${storageResult.failed} failed\n`);
    } catch (error) {
      console.error(`   ✗ Storage failed: ${error.message}\n`);
    }
  } else {
    console.log('   ⚠️  Skipping storage (no API key or hospital ID)\n');
  }

  // Step 5: Submit consent proofs to HCS
  console.log('4. Submitting consent proofs to HCS...');
  const consentResults = [];

  for (const [anonymousId, dataHash] of patientDataHashes) {
    try {
      const consentHash = hashBatch([{ anonymousId, dataHash, timestamp: new Date().toISOString() }]);
      const transactionId = await submitMessage(client, consentTopicId, consentHash);

      // Record on-chain if configured
      if (process.env.CONSENT_MANAGER_ADDRESS) {
        try {
          await recordConsentOnChain(
            client,
            process.env.CONSENT_MANAGER_ADDRESS,
            anonymousId,
            consentTopicId,
            dataHash
          );
        } catch (error) {
          console.warn(`     ⚠️  On-chain recording failed: ${error.message}`);
        }
      }

      consentResults.push({
        anonymousId,
        transactionId,
        hashScanLink: getHashScanLink(transactionId)
      });
    } catch (error) {
      console.error(`     ✗ Consent proof failed for ${anonymousId}:`, error.message);
    }
  }

  console.log(`   ✓ Submitted ${consentResults.length} consent proofs\n`);

  // Step 6: Submit data proofs to HCS with double anonymization
  console.log('5. Applying Stage 2 (Chain) anonymization and submitting provenance proofs to HCS...');
  const dataResults = [];

  for (const processed of processedResources) {
    try {
      // Stage 1: Storage anonymization (already done in processFHIRResource)
      const storageHash = hashPatientRecord(processed.anonymized);
      
      // Stage 2: Chain anonymization (further generalization)
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
      
      // Create provenance record with both hashes
      const provenanceRecord = {
        // Stage 1: Storage Anonymization
        storage: {
          hash: storageHash,
          anonymizationLevel: 'storage',
          timestamp: new Date().toISOString()
        },
        
        // Stage 2: Chain Anonymization
        chain: {
          hash: chainHash,
          anonymizationLevel: 'chain',
          derivedFrom: storageHash,  // PROOF: Chain came from storage
          timestamp: new Date().toISOString()
        },
        
        // Metadata
        anonymousPatientId,
        resourceType: processed.resourceType,
        hospitalId: systemConfig.hospitalId,
        timestamp: new Date().toISOString(),
        
        // Provenance proof linking both hashes
        provenanceProof
      };
      
      // Submit provenance record to HCS (both hashes in one message)
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
      console.error(`     ✗ Data proof failed:`, error.message);
    }
  }

  console.log(`   ✓ Submitted ${dataResults.length} provenance proofs (with double anonymization)\n`);

  // Disconnect
  await extractor.disconnect();

  return {
    summary: extractionResult.summary,
    processed: processedResources.length,
    consentProofs: consentResults.length,
    dataProofs: dataResults.length
  };
}

/**
 * Build patient mapping from extracted resources
 */
function buildPatientMapping(resources) {
  const mapping = new Map();
  let pidIndex = 0;

  // Find all Patient resources
  const patients = resources.Patient || [];

  patients.forEach(patient => {
    const originalId = patient.id || patient.identifier?.[0]?.value;
    if (originalId && !mapping.has(originalId)) {
      const anonymousId = `PID-${String(pidIndex + 1).padStart(3, '0')}`;
      mapping.set(originalId, anonymousId);
      pidIndex++;
    }
  });

  return mapping;
}

/**
 * Load systems configuration
 */
function loadSystemsConfig() {
  const configPath = path.join(__dirname, '../config/systems.json');
  const examplePath = path.join(__dirname, '../config/systems.example.json');

  if (fs.existsSync(configPath)) {
    const content = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(content);
  } else if (fs.existsSync(examplePath)) {
    console.warn('   ⚠️  Using example config. Create config/systems.json for your systems.');
    const content = fs.readFileSync(examplePath, 'utf-8');
    return JSON.parse(content);
  } else {
    throw new Error('No systems configuration found. Create adapter/config/systems.json');
  }
}

// Run the adapter
main();

