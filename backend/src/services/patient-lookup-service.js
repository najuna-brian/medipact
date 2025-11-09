/**
 * Patient Lookup Service
 * 
 * Enables patients to find their UPI using email, phone, or national ID.
 * Creates Hedera accounts for new patients.
 */

import { generateUPI } from './patient-identity-service.js';
import { createHederaAccount } from './hedera-account-service.js';
import { encrypt } from './encryption-service.js';

/**
 * Lookup patient UPI by contact information
 * @param {Object} lookupInfo - Lookup information
 *   - email: string (optional)
 *   - phone: string (optional)
 *   - nationalId: string (optional)
 * @param {Function} findUPIByEmail - Function to find UPI by email
 * @param {Function} findUPIByPhone - Function to find UPI by phone
 * @param {Function} findUPIByNationalId - Function to find UPI by national ID
 * @returns {Promise<string|null>} UPI if found, null otherwise
 */
export async function lookupPatientUPI(
  lookupInfo,
  findUPIByEmail,
  findUPIByPhone,
  findUPIByNationalId
) {
  // Try email first
  if (lookupInfo.email) {
    const upi = await findUPIByEmail(lookupInfo.email);
    if (upi) return upi;
  }
  
  // Try phone
  if (lookupInfo.phone) {
    const upi = await findUPIByPhone(lookupInfo.phone);
    if (upi) return upi;
  }
  
  // Try national ID
  if (lookupInfo.nationalId) {
    const upi = await findUPIByNationalId(lookupInfo.nationalId);
    if (upi) return upi;
  }
  
  return null;
}

/**
 * Register patient with contact information
 * @param {Object} patientInfo - Patient information
 *   - name: string (required)
 *   - dateOfBirth: string (required)
 *   - phone: string (optional)
 *   - nationalId: string (optional)
 *   - email: string (optional)
 * @param {Function} generateUPIFunc - Function to generate UPI
 * @param {Function} createPatient - Function to create patient
 * @param {Function} upsertContact - Function to create/update contact
 * @returns {Promise<Object>} Patient record with UPI
 */
export async function registerPatientWithContact(
  patientInfo,
  generateUPIFunc,
  createPatient,
  upsertContact
) {
  // Generate UPI
  const upi = generateUPIFunc({
    name: patientInfo.name,
    dateOfBirth: patientInfo.dateOfBirth,
    phone: patientInfo.phone,
    nationalId: patientInfo.nationalId
  });
  
  // Create Hedera account for patient
  let hederaAccount = null;
  let encryptedPrivateKey = null;
  
  try {
    console.log(`Creating Hedera account for patient: ${upi}`);
    hederaAccount = await createHederaAccount(0); // Platform pays for account creation
    encryptedPrivateKey = encrypt(hederaAccount.privateKey);
    console.log(`✅ Hedera account created: ${hederaAccount.accountId}`);
  } catch (error) {
    console.error('Failed to create Hedera account for patient:', error);
    // Continue registration even if Hedera account creation fails
    // Account can be created later if needed
  }
  
  // Create patient identity with Hedera account
  await createPatient(upi, {
    hederaAccountId: hederaAccount?.accountId || null,
    encryptedPrivateKey: encryptedPrivateKey || null,
    name: patientInfo.name,
    dateOfBirth: patientInfo.dateOfBirth,
    phone: patientInfo.phone,
    nationalId: patientInfo.nationalId
  });
  
  // Create/update contact information
  if (patientInfo.email || patientInfo.phone || patientInfo.nationalId) {
    await upsertContact(upi, {
      email: patientInfo.email,
      phone: patientInfo.phone,
      nationalId: patientInfo.nationalId
    });
  }
  
  return {
    upi,
    hederaAccountId: hederaAccount?.accountId || null,
    message: 'Patient registered successfully',
    createdAt: new Date().toISOString()
  };
}

