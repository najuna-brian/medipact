/**
 * Hash Generation Utilities
 * 
 * Functions for generating cryptographic hashes of:
 * - Consent forms
 * - Anonymized medical data
 */

import crypto from 'crypto';

/**
 * Generate SHA-256 hash of data
 * @param {string|Object} data - Data to hash (string or object)
 * @returns {string} Hexadecimal hash string
 */
export function generateHash(data) {
  let dataString;
  
  if (typeof data === 'object') {
    // Convert object to JSON string for consistent hashing
    dataString = JSON.stringify(data);
  } else {
    dataString = String(data);
  }

  return crypto.createHash('sha256')
    .update(dataString, 'utf8')
    .digest('hex');
}

/**
 * Generate hash of anonymized patient record
 * @param {Object} record - Anonymized patient record
 * @returns {string} Hash of the record
 */
export function hashPatientRecord(record) {
  // Create a deterministic representation of the record
  // Sort keys to ensure consistent hashing
  const sortedRecord = Object.keys(record)
    .sort()
    .reduce((obj, key) => {
      obj[key] = record[key];
      return obj;
    }, {});

  return generateHash(sortedRecord);
}

/**
 * Generate hash of consent form data (NO original patient ID - only anonymous ID)
 * @param {string} anonymousPatientId - Anonymous patient ID (e.g., PID-001)
 * @param {string} consentDate - Date of consent
 * @param {string} consentType - Type of consent (e.g., "data_sharing")
 * @returns {string} Hash of consent form
 */
export function hashConsentForm(anonymousPatientId, consentDate, consentType = 'data_sharing') {
  const consentData = {
    anonymousPatientId,  // PID-XXX only (NO original patient ID)
    consentDate,
    consentType,
    timestamp: new Date().toISOString()
  };

  return generateHash(consentData);
}

/**
 * Generate hash of multiple records (batch hash)
 * @param {Array} records - Array of anonymized records
 * @returns {string} Combined hash of all records
 */
export function hashBatch(records) {
  const combinedData = records.map(r => hashPatientRecord(r)).join('');
  return generateHash(combinedData);
}

/**
 * Generate provenance proof hash linking storage and chain hashes
 * Proves that chain hash was derived from storage hash
 * 
 * @param {string} storageHash - Hash of storage-anonymized data (Stage 1)
 * @param {string} chainHash - Hash of chain-anonymized data (Stage 2)
 * @param {string} anonymousPatientId - Anonymous patient ID
 * @param {string} resourceType - Resource type
 * @returns {string} Provenance proof hash
 */
export function generateProvenanceProof(storageHash, chainHash, anonymousPatientId, resourceType) {
  const provenanceData = {
    storageHash,
    chainHash,
    anonymousPatientId,
    resourceType,
    timestamp: new Date().toISOString()
  };
  
  return generateHash(provenanceData);
}
