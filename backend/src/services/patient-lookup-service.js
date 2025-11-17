/**
 * Patient Lookup Service
 * 
 * Enables patients to find their UPI using email, phone, or national ID.
 * Hedera accounts are created immediately during registration (same as hospitals and researchers).
 * 
 * Access Control:
 * - Patients can lookup their own UPI (owner)
 * - Only hospitals linked to the patient can lookup
 */

import { generateUPI } from './patient-identity-service.js';
import { createHederaAccount } from './hedera-account-service.js';
import { encrypt } from './encryption-service.js';
import {
  verifyPatientOwnershipBySignature,
  verifyPatientOwnershipByContact,
  verifyPatientSession
} from './patient-authentication-service.js';

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

/**
 * Check if requester can lookup patient UPI
 * Access Control:
 * - Patients can lookup their own UPI (must prove ownership)
 * - Only hospitals linked to the patient can lookup
 * 
 * @param {Object} contactInfo - {email?, phone?, nationalId?}
 * @param {string} requesterType - "patient" | "hospital"
 * @param {string} requesterId - UPI (if patient) or hospitalId (if hospital)
 * @param {Object} authProof - Proof of ownership
 *   - signature?: {challenge: string, signature: string} (Tier 1)
 *   - contactInfo?: {email?, phone?, nationalId?} (Tier 2)
 *   - sessionToken?: string (Tier 3)
 * @returns {Promise<{allowed: boolean, upi?: string, reason?: string}>}
 */
export async function checkLookupPermission(contactInfo, requesterType, requesterId, authProof = {}) {
  // 1. Find patient UPI from contact info
  const { findUPIByEmail, findUPIByPhone, findUPIByNationalId } = await import('../db/patient-contacts-db.js');
  const upi = await lookupPatientUPI(
    contactInfo,
    findUPIByEmail,
    findUPIByPhone,
    findUPIByNationalId
  );
  
  if (!upi) {
    return { allowed: false, reason: 'Patient not found' };
  }
  
  // 2. Check if requester is the patient (owner)
  if (requesterType === 'patient') {
    // Verify ownership
    let ownershipVerified = false;
    
    if (authProof.signature) {
      // Tier 1: Signature verification
      const result = await verifyPatientOwnershipBySignature(
        requesterId, // UPI
        authProof.signature.challenge,
        authProof.signature.signature
      );
      ownershipVerified = result.verified;
    } else if (authProof.contactInfo) {
      // Tier 2: Contact verification
      const result = await verifyPatientOwnershipByContact(
        requesterId, // UPI
        authProof.contactInfo
      );
      ownershipVerified = result.verified;
    } else if (authProof.sessionToken) {
      // Tier 3: Session verification
      const session = await verifyPatientSession(authProof.sessionToken);
      ownershipVerified = session.valid && session.upi === requesterId;
    } else {
      // Fallback: If requesterId matches found UPI and contact info matches, allow
      // This is for the "Forgot UPI" recovery flow
      if (requesterId === upi) {
        const { getPatientContactByUPI } = await import('../db/patient-contacts-db.js');
        const contact = await getPatientContactByUPI(upi);
        if (contact) {
          let matches = 0;
          if (contactInfo.email && contact.email && contact.email.toLowerCase() === contactInfo.email.toLowerCase()) matches++;
          if (contactInfo.phone && contact.phone && normalizePhone(contact.phone) === normalizePhone(contactInfo.phone)) matches++;
          if (contactInfo.nationalId && contact.nationalId && contact.nationalId === contactInfo.nationalId) matches++;
          ownershipVerified = matches >= 1; // At least one match for recovery
        }
      }
    }
    
    if (ownershipVerified && requesterId === upi) {
      return { allowed: true, upi };
    }
    
    return { allowed: false, reason: 'Ownership verification failed' };
  }
  
  // 3. Check if requester is a linked hospital
  if (requesterType === 'hospital') {
    const { getLinkagesByUPI } = await import('../db/linkage-db.js');
    const linkages = await getLinkagesByUPI(upi);
    const isLinked = linkages.some(link => 
      link.hospitalId === requesterId && link.status === 'active'
    );
    
    if (isLinked) {
      return { allowed: true, upi };
    }
    
    return { 
      allowed: false, 
      reason: 'Hospital not linked to this patient. Only linked hospitals can lookup patient UPIs.' 
    };
  }
  
  return { allowed: false, reason: 'Unauthorized requester type' };
}

/**
 * Normalize phone number for comparison
 */
function normalizePhone(phone) {
  return phone.replace(/\D/g, ''); // Remove all non-digits
}

