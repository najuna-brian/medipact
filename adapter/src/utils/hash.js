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
 * Generate hash of consent form data
 * @param {string} patientId - Patient ID (before anonymization)
 * @param {string} consentDate - Date of consent
 * @param {string} consentType - Type of consent (e.g., "data_sharing")
 * @returns {string} Hash of consent form
 */
export function hashConsentForm(patientId, consentDate, consentType = 'data_sharing') {
  const consentData = {
    patientId,
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
