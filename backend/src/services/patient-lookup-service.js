/**
 * Patient Lookup Service
 * 
 * Enables patients to find their UPI using email, phone, or national ID.
 * Hedera accounts are created immediately during registration (same as hospitals and researchers).
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
 * Uses contact lookup to automatically link to existing UPI if email/phone matches
 * @param {Object} patientInfo - Patient information
 *   - name: string (required)
 *   - dateOfBirth: string (required)
 *   - phone: string (optional)
 *   - nationalId: string (optional)
 *   - email: string (optional)
 * @param {Function} getOrCreateUPIFunc - Function to get or create UPI (with contact lookup)
 * @param {Function} createPatient - Function to create patient
 * @param {Function} upsertContact - Function to create/update contact
 * @returns {Promise<Object>} Patient record with UPI
 */
export async function registerPatientWithContact(
  patientInfo,
  getOrCreateUPIFunc,
  createPatient,
  upsertContact
) {
  // Get or create UPI (will check email/phone first, then generate deterministically)
  const upi = await getOrCreateUPIFunc({
    name: patientInfo.name,
    dateOfBirth: patientInfo.dateOfBirth,
    phone: patientInfo.phone,
    nationalId: patientInfo.nationalId,
    email: patientInfo.email
  });
  
  // Get patient to check if already exists (from contact lookup match)
  let patient = null;
  try {
    // Try to get existing patient
    const { getPatient } = await import('../db/patient-db.js');
    patient = await getPatient(upi);
  } catch (error) {
    // Patient doesn't exist yet, will create below
  }
  
  // Only create patient if it doesn't exist (contact lookup may have found existing UPI)
  let hederaAccountId = null;
  let encryptedPrivateKey = null;
  let evmAddress = null;
  
  if (!patient) {
    // Create Hedera account for patient immediately (same as hospitals and researchers)
    try {
      console.log(`Creating Hedera account for patient: ${upi}`);
      const hederaAccount = await createHederaAccount(0); // Platform pays for account creation
      encryptedPrivateKey = encrypt(hederaAccount.privateKey);
      hederaAccountId = hederaAccount.accountId;
      evmAddress = hederaAccount.evmAddress;
      console.log(`✅ Hedera account created: ${hederaAccount.accountId}`);
    } catch (error) {
      console.error('Failed to create Hedera account for patient:', error);
      // Continue registration even if Hedera account creation fails
      // Account can be created later if needed
    }
    
    // Create patient identity with Hedera account
    await createPatient(upi, {
      hederaAccountId: hederaAccountId || null,
      evmAddress: evmAddress || null,
      encryptedPrivateKey: encryptedPrivateKey || null,
      name: patientInfo.name,
      dateOfBirth: patientInfo.dateOfBirth,
      phone: patientInfo.phone,
      nationalId: patientInfo.nationalId
    });
  } else {
    // Patient already exists, use their existing account
    hederaAccountId = patient.hederaAccountId;
  }
  
  // Create/update contact information with latest entry (merge to latest)
  // This ensures contact info is always up-to-date
  if (patientInfo.email || patientInfo.phone || patientInfo.nationalId) {
    await upsertContact(upi, {
      email: patientInfo.email,
      phone: patientInfo.phone,
      nationalId: patientInfo.nationalId
    });
  }
  
  return {
    upi,
    hederaAccountId: hederaAccountId || null,
    message: patient ? 'Patient linked to existing account' : 'Patient registered successfully with Hedera account.',
    createdAt: new Date().toISOString()
  };
}

