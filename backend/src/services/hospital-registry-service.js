/**
 * Hospital Registry Service
 * 
 * Manages hospital accounts and registration.
 * Each hospital gets a unique hospital ID and Hedera Account ID.
 */

import crypto from 'crypto';
import { createHederaAccount } from './hedera-account-service.js';
import { encrypt } from './encryption-service.js';

/**
 * Generate unique hospital ID
 * @param {string} hospitalName - Hospital name
 * @param {string} country - Hospital country
 * @returns {string} Hospital ID (HOSP-XXX)
 */
function generateHospitalID(hospitalName, country) {
  // Create deterministic ID from hospital name and country
  const identifier = `${hospitalName}-${country}`.toLowerCase().replace(/\s+/g, '-');
  const hash = crypto.createHash('sha256')
    .update(identifier, 'utf8')
    .digest('hex')
    .substring(0, 12)
    .toUpperCase();
  
  return `HOSP-${hash}`;
}

/**
 * Register a new hospital
 * @param {Object} hospitalInfo - Hospital information
 *   - name: string (required)
 *   - country: string (required)
 *   - contactEmail: string (optional)
 *   - location: string (optional)
 *   - fhirEndpoint: string (optional)
 * @param {Function} hospitalExists - Function to check if hospital exists (hospitalId) => Promise<boolean>
 * @param {Function} hospitalCreate - Function to create hospital record
 * @returns {Promise<Object>} Hospital record with hospitalId
 */
export async function registerHospital(hospitalInfo, hospitalExists, hospitalCreate) {
  if (!hospitalInfo.name || !hospitalInfo.country) {
    throw new Error('Hospital name and country are required');
  }
  
  // Registration number and verification documents should only be submitted during verification, not registration

  const hospitalId = generateHospitalID(hospitalInfo.name, hospitalInfo.country);
  
  // Check if hospital already exists
  const exists = await hospitalExists(hospitalId);
  if (exists) {
    throw new Error(
      `Hospital "${hospitalInfo.name}" in "${hospitalInfo.country}" is already registered. ` +
      `Hospital ID: ${hospitalId}. Please login instead or contact support if you need to recover your API key.`
    );
  }
  
  // Create Hedera account for hospital
  let hederaAccount = null;
  let encryptedPrivateKey = null;
  
  try {
    console.log(`Creating Hedera account for hospital: ${hospitalId}`);
    hederaAccount = await createHederaAccount(0); // Platform pays for account creation
    encryptedPrivateKey = encrypt(hederaAccount.privateKey);
    console.log(`✅ Hedera account created: ${hederaAccount.accountId}`);
  } catch (error) {
    console.error('Failed to create Hedera account for hospital:', error);
    // Continue registration even if Hedera account creation fails
    // Account can be created later if needed
  }
  
  const hospitalRecord = {
    hospitalId,
    hederaAccountId: hederaAccount?.accountId || null,
    evmAddress: hederaAccount?.evmAddress || null,
    encryptedPrivateKey: encryptedPrivateKey || null,
    name: hospitalInfo.name,
    country: hospitalInfo.country,
    location: hospitalInfo.location || null,
    fhirEndpoint: hospitalInfo.fhirEndpoint || null,
    contactEmail: hospitalInfo.contactEmail || null,
    registrationNumber: '', // Will be set during verification (empty string for NOT NULL constraint)
    apiKey: hospitalInfo.apiKey || null, // Include API key for hashing
    verificationDocuments: '{}', // Empty JSON object for NOT NULL constraint, will be set during verification
    verificationStatus: 'pending', // Start as pending (database constraint only allows 'pending', 'verified', 'rejected')
    registeredAt: new Date().toISOString(),
    status: 'active'
  };

  await hospitalCreate(hospitalRecord);
  
  // Return record without API key and private key (for security)
  const { apiKey, encryptedPrivateKey: _, ...recordWithoutKeys } = hospitalRecord;
  return recordWithoutKeys;
}

/**
 * Verify hospital credentials
 * @param {string} hospitalId - Hospital ID
 * @param {string} apiKey - API key or token
 * @param {Function} hospitalVerify - Function to verify hospital (hospitalId, apiKey) => Promise<boolean>
 * @returns {Promise<boolean>} True if verified
 */
export async function verifyHospital(hospitalId, apiKey, hospitalVerify) {
  return await hospitalVerify(hospitalId, apiKey);
}

/**
 * Get hospital information
 * @param {string} hospitalId - Hospital ID
 * @param {Function} hospitalGet - Function to get hospital (hospitalId) => Promise<Object>
 * @returns {Promise<Object>} Hospital record
 */
export async function getHospital(hospitalId, hospitalGet) {
  return await hospitalGet(hospitalId);
}

/**
 * Update hospital information
 * @param {string} hospitalId - Hospital ID
 * @param {Object} updates - Fields to update
 * @param {Function} hospitalUpdate - Function to update hospital
 * @returns {Promise<Object>} Updated hospital record
 */
export async function updateHospital(hospitalId, updates, hospitalUpdate) {
  return await hospitalUpdate(hospitalId, updates);
}

