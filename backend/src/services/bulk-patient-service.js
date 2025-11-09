/**
 * Bulk Patient Registration Service
 * 
 * Handles bulk registration of patients from CSV/JSON files.
 * Supports batch processing with progress tracking.
 * Creates Hedera accounts for each patient.
 */

import { generateUPI, getOrCreateUPI } from './patient-identity-service.js';
import { createHederaAccount } from './hedera-account-service.js';
import { encrypt } from './encryption-service.js';

/**
 * Parse CSV data
 * @param {string} csvData - CSV string
 * @returns {Array<Object>} Parsed records
 */
function parseCSV(csvData) {
  const lines = csvData.trim().split('\n');
  if (lines.length < 2) return [];
  
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  const records = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());
    const record = {};
    headers.forEach((header, index) => {
      record[header] = values[index] || '';
    });
    records.push(record);
  }
  
  return records;
}

/**
 * Validate patient record
 * @param {Object} record - Patient record
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
function validatePatientRecord(record) {
  const errors = [];
  
  if (!record.name || !record.name.trim()) {
    errors.push('Name is required');
  }
  
  if (!record.dateofbirth && !record.dob && !record['date of birth']) {
    errors.push('Date of Birth is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Normalize patient record from CSV/JSON
 * @param {Object} record - Raw record
 * @returns {Object} Normalized patient record
 */
function normalizePatientRecord(record) {
  return {
    name: record.name || record.fullname || record['full name'] || '',
    dateOfBirth: record.dateofbirth || record.dob || record['date of birth'] || record.birthdate || '',
    phone: record.phone || record.telephone || record.mobile || record['phone number'] || '',
    nationalId: record.nationalid || record['national id'] || record.idnumber || record['id number'] || '',
    email: record.email || record.emailaddress || record['email address'] || ''
  };
}

/**
 * Process bulk patient registration
 * @param {Array<Object>|string} data - Array of patient records or CSV string
 * @param {string} hospitalId - Hospital ID
 * @param {Function} patientExists - Function to check if patient exists
 * @param {Function} createPatient - Function to create patient
 * @param {Function} createLinkage - Function to create hospital linkage
 * @param {Function} getPatient - Function to get patient by UPI (optional, for retrieving Account ID)
 * @returns {Promise<Object>} Bulk registration result
 */
export async function processBulkRegistration(
  data,
  hospitalId,
  patientExists,
  createPatient,
  createLinkage,
  getPatient = null
) {
  // Parse data if CSV string
  let records = data;
  if (typeof data === 'string') {
    records = parseCSV(data);
  }
  
  const results = {
    total: records.length,
    successful: 0,
    failed: 0,
    errors: [],
    patients: []
  };
  
  for (let i = 0; i < records.length; i++) {
    const record = records[i];
    
    try {
      // Normalize record
      const normalized = normalizePatientRecord(record);
      
      // Validate
      const validation = validatePatientRecord(normalized);
      if (!validation.valid) {
        results.failed++;
        results.errors.push({
          row: i + 1,
          errors: validation.errors,
          record: normalized
        });
        continue;
      }
      
      // Generate or get UPI
      const upi = await getOrCreateUPI(
        normalized,
        patientExists,
        async (upi, patientData) => {
          // Create Hedera account for new patient
          let hederaAccount = null;
          let encryptedPrivateKey = null;
          
          try {
            hederaAccount = await createHederaAccount(0); // Platform pays
            encryptedPrivateKey = encrypt(hederaAccount.privateKey);
          } catch (error) {
            console.error(`Failed to create Hedera account for patient ${upi}:`, error);
            // Continue without Hedera account - can be created later
          }
          
          // Include all normalized data (including email/phone/nationalId) for contact creation
          // Also include Hedera account info
          await createPatient(upi, {
            ...normalized,
            hederaAccountId: hederaAccount?.accountId || null,
            encryptedPrivateKey: encryptedPrivateKey || null
          });
        }
      );
      
      // Get patient to retrieve Hedera Account ID if it exists
      let hederaAccountId = null;
      if (getPatient) {
        try {
          const patient = await getPatient(upi);
          hederaAccountId = patient?.hederaAccountId || null;
        } catch (error) {
          // Ignore errors - account ID may not exist yet
        }
      }
      
      // Create hospital linkage
      const hospitalPatientId = record.patientid || record['patient id'] || record.id || `PAT-${i + 1}`;
      await createLinkage({
        upi,
        hospitalId,
        hospitalPatientId,
        verified: true,
        verificationMethod: 'bulk_import'
      });
      
      results.successful++;
      results.patients.push({
        upi,
        hederaAccountId,
        hospitalPatientId,
        name: normalized.name
      });
      
    } catch (error) {
      results.failed++;
      results.errors.push({
        row: i + 1,
        errors: [error.message],
        record: record
      });
    }
  }
  
  return results;
}

