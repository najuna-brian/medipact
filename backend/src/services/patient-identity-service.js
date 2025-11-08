/**
 * Patient Identity Service
 * 
 * Manages unique patient identities (UPI) that persist across hospitals.
 * Generates deterministic UPIs based on patient PII to prevent duplicates
 * and enable cross-hospital medical history access.
 */

import crypto from 'crypto';

/**
 * Normalize patient name for consistent hashing
 * @param {string} name - Patient name
 * @returns {string} Normalized name
 */
function normalizeName(name) {
  if (!name) return '';
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Multiple spaces to single space
    .replace(/[^\w\s]/g, ''); // Remove special characters
}

/**
 * Normalize phone number for consistent hashing
 * @param {string} phone - Phone number
 * @returns {string} Normalized phone (digits only)
 */
function normalizePhone(phone) {
  if (!phone) return '';
  return phone.replace(/\D/g, ''); // Digits only
}

/**
 * Normalize date of birth for consistent hashing
 * @param {string} dob - Date of birth
 * @returns {string} Normalized DOB (YYYY-MM-DD format)
 */
function normalizeDOB(dob) {
  if (!dob) return '';
  try {
    const date = new Date(dob);
    if (isNaN(date.getTime())) return '';
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  } catch (error) {
    return '';
  }
}

/**
 * Generate SHA-256 hash
 * @param {string} data - Data to hash
 * @returns {string} Hexadecimal hash
 */
function generateHash(data) {
  return crypto.createHash('sha256')
    .update(data, 'utf8')
    .digest('hex');
}

/**
 * Generate Unique Patient Identity (UPI) from patient PII
 * 
 * UPI is a deterministic hash based on stable patient identifiers.
 * Same patient = same UPI, enabling cross-hospital record linking.
 * 
 * @param {Object} patientPII - Patient PII
 *   - name: string (required)
 *   - dateOfBirth: string (required)
 *   - phone: string (optional but recommended)
 *   - nationalId: string (optional)
 * @returns {string} Unique Patient Identity (UPI-XXXXXXXX)
 */
export function generateUPI(patientPII) {
  if (!patientPII.name || !patientPII.dateOfBirth) {
    throw new Error('Name and Date of Birth are required to generate UPI');
  }

  // Normalize identifiers
  const normalizedData = {
    name: normalizeName(patientPII.name),
    dateOfBirth: normalizeDOB(patientPII.dateOfBirth),
    phone: normalizePhone(patientPII.phone || ''),
    nationalId: (patientPII.nationalId || '').trim().toLowerCase()
  };

  // Create deterministic identity data
  // Order matters for consistency
  const identityString = JSON.stringify({
    name: normalizedData.name,
    dob: normalizedData.dateOfBirth,
    phone: normalizedData.phone,
    nationalId: normalizedData.nationalId
  });

  // Generate hash
  const hash = generateHash(identityString);
  
  // Format as UPI (first 16 characters of hash, uppercase)
  const upi = `UPI-${hash.substring(0, 16).toUpperCase()}`;
  
  return upi;
}

/**
 * Match patient to existing UPI
 * 
 * Generates UPI from patient PII and checks if it exists in registry.
 * Used to prevent duplicate patient records.
 * 
 * @param {Object} patientPII - Patient PII
 * @param {Function} upiLookup - Function to check if UPI exists (upi) => Promise<boolean>
 * @returns {Promise<string|null>} Existing UPI or null if new patient
 */
export async function matchPatientToUPI(patientPII, upiLookup) {
  try {
    const upi = generateUPI(patientPII);
    const exists = await upiLookup(upi);
    return exists ? upi : null;
  } catch (error) {
    console.error('Error matching patient to UPI:', error);
    return null;
  }
}

/**
 * Create or retrieve UPI for patient
 * 
 * If patient exists (matched by UPI), returns existing UPI.
 * If new patient, creates new UPI.
 * 
 * @param {Object} patientPII - Patient PII
 * @param {Function} upiLookup - Function to check if UPI exists
 * @param {Function} upiCreate - Function to create new UPI (upi, patientPII) => Promise<void>
 * @returns {Promise<string>} UPI (existing or newly created)
 */
export async function getOrCreateUPI(patientPII, upiLookup, upiCreate) {
  // Try to match existing patient
  const existingUPI = await matchPatientToUPI(patientPII, upiLookup);
  
  if (existingUPI) {
    return existingUPI;
  }
  
  // Create new UPI
  const newUPI = generateUPI(patientPII);
  await upiCreate(newUPI, patientPII);
  
  return newUPI;
}

/**
 * Verify UPI format
 * @param {string} upi - UPI to verify
 * @returns {boolean} True if valid format
 */
export function isValidUPI(upi) {
  if (!upi) return false;
  const upiPattern = /^UPI-[A-F0-9]{16}$/;
  return upiPattern.test(upi);
}

/**
 * Extract hash from UPI
 * @param {string} upi - UPI
 * @returns {string} Hash portion (without UPI- prefix)
 */
export function extractUPIHash(upi) {
  if (!isValidUPI(upi)) {
    throw new Error(`Invalid UPI format: ${upi}`);
  }
  return upi.substring(4); // Remove "UPI-" prefix
}

