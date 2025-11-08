/**
 * Hospital Registry Service
 * 
 * Manages hospital accounts and registration.
 * Each hospital gets a unique hospital ID for linking patient records.
 */

import crypto from 'crypto';

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
 *   - location: string (optional)
 *   - fhirEndpoint: string (optional)
 *   - contactEmail: string (optional)
 * @param {Function} hospitalExists - Function to check if hospital exists (hospitalId) => Promise<boolean>
 * @param {Function} hospitalCreate - Function to create hospital record
 * @returns {Promise<Object>} Hospital record with hospitalId
 */
export async function registerHospital(hospitalInfo, hospitalExists, hospitalCreate) {
  if (!hospitalInfo.name || !hospitalInfo.country) {
    throw new Error('Hospital name and country are required');
  }

  const hospitalId = generateHospitalID(hospitalInfo.name, hospitalInfo.country);
  
  // Check if hospital already exists
  const exists = await hospitalExists(hospitalId);
  if (exists) {
    throw new Error(
      `Hospital "${hospitalInfo.name}" in "${hospitalInfo.country}" is already registered. ` +
      `Hospital ID: ${hospitalId}. Please login instead or contact support if you need to recover your API key.`
    );
  }
  
  const hospitalRecord = {
    hospitalId,
    name: hospitalInfo.name,
    country: hospitalInfo.country,
    location: hospitalInfo.location || null,
    fhirEndpoint: hospitalInfo.fhirEndpoint || null,
    contactEmail: hospitalInfo.contactEmail || null,
    apiKey: hospitalInfo.apiKey || null, // Include API key for hashing
    registeredAt: new Date().toISOString(),
    status: 'active'
  };

  await hospitalCreate(hospitalRecord);
  
  // Return record without API key (for security)
  const { apiKey, ...recordWithoutKey } = hospitalRecord;
  return recordWithoutKey;
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

