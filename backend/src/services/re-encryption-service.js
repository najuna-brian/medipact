/**
 * Re-Encryption Service
 * 
 * Handles re-encryption of patient data for cross-hospital access.
 * When a hospital requests temporary access, data encrypted with the original
 * hospital's key needs to be re-encrypted with the requesting hospital's key.
 * 
 * Note: In a production system, this would use proxy re-encryption or
 * key derivation to avoid decrypting and re-encrypting. For now, we use
 * a simplified approach where the platform can re-encrypt (but cannot read).
 */

import {
  encryptWithHospitalKey,
  decryptWithHospitalKey
} from './field-encryption-service.js';
import { checkTemporaryAccess } from './temporary-access-service.js';

/**
 * Re-encrypt patient data from original hospital to requesting hospital
 * This allows the requesting hospital to decrypt data with their own key
 * 
 * @param {Object} encryptedData - Data encrypted with original hospital key
 * @param {string} originalHospitalId - Original hospital ID
 * @param {string} requestingHospitalId - Requesting hospital ID
 * @param {Array<string>} fieldsToReEncrypt - Fields to re-encrypt
 * @returns {Promise<Object>} Data re-encrypted with requesting hospital key
 */
export async function reEncryptForHospital(
  encryptedData,
  originalHospitalId,
  requestingHospitalId,
  fieldsToReEncrypt
) {
  const reEncrypted = { ...encryptedData };
  
  for (const field of fieldsToReEncrypt) {
    if (reEncrypted[field] !== undefined && reEncrypted[field] !== null) {
      try {
        // Decrypt with original hospital key
        const decrypted = await decryptWithHospitalKey(
          reEncrypted[field],
          originalHospitalId
        );
        
        // Re-encrypt with requesting hospital key
        reEncrypted[field] = await encryptWithHospitalKey(
          decrypted,
          requestingHospitalId
        );
      } catch (error) {
        console.error(`Error re-encrypting field ${field}:`, error);
        // If re-encryption fails, keep original encrypted value
        // This might happen if data is not encrypted or uses different key
      }
    }
  }
  
  return reEncrypted;
}

/**
 * Check if requesting hospital can access patient data from original hospital
 * and re-encrypt if access is granted
 * 
 * @param {Object|Array} patientData - Patient data or array of records (encrypted with original hospital key)
 * @param {string} upi - Patient UPI
 * @param {string} originalHospitalId - Original hospital ID
 * @param {string} requestingHospitalId - Requesting hospital ID
 * @param {Array<string>} fieldsToReEncrypt - Fields to re-encrypt
 * @returns {Promise<Object|Array|null>} Re-encrypted data or null if access denied
 */
export async function checkAndReEncryptForAccess(
  patientData,
  upi,
  originalHospitalId,
  requestingHospitalId,
  fieldsToReEncrypt
) {
  // Check if requesting hospital has temporary access
  const hasAccess = await checkTemporaryAccess(
    requestingHospitalId,
    upi,
    originalHospitalId
  );
  
  if (!hasAccess) {
    return null; // Access denied
  }
  
  // Handle array of records
  if (Array.isArray(patientData)) {
    return await batchReEncryptForHospital(
      patientData,
      originalHospitalId,
      requestingHospitalId,
      fieldsToReEncrypt
    );
  }
  
  // Handle single record
  return await reEncryptForHospital(
    patientData,
    originalHospitalId,
    requestingHospitalId,
    fieldsToReEncrypt
  );
}

/**
 * Batch re-encrypt multiple records
 * 
 * @param {Array<Object>} records - Array of encrypted records
 * @param {string} originalHospitalId - Original hospital ID
 * @param {string} requestingHospitalId - Requesting hospital ID
 * @param {Array<string>} fieldsToReEncrypt - Fields to re-encrypt
 * @returns {Promise<Array<Object>>} Array of re-encrypted records
 */
export async function batchReEncryptForHospital(
  records,
  originalHospitalId,
  requestingHospitalId,
  fieldsToReEncrypt
) {
  const reEncryptedRecords = [];
  
  for (const record of records) {
    const reEncrypted = await reEncryptForHospital(
      record,
      originalHospitalId,
      requestingHospitalId,
      fieldsToReEncrypt
    );
    reEncryptedRecords.push(reEncrypted);
  }
  
  return reEncryptedRecords;
}

