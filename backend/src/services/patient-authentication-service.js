/**
 * Patient Authentication Service
 * 
 * Provides multiple tiers of patient ownership verification:
 * - Tier 1: Hedera account signature (strongest)
 * - Tier 2: Contact info verification (medium)
 * - Tier 3: Session token (convenient after initial verification)
 */

import { getPatient } from '../db/patient-db.js';
import { getPatientContact } from '../db/patient-contacts-db.js';
import { PrivateKey, PublicKey } from '@hashgraph/sdk';
import crypto from 'crypto';

// In-memory challenge storage (in production, use Redis or database)
const challengeStore = new Map(); // upi -> {challenge, expiresAt}
const sessionStore = new Map(); // sessionToken -> {upi, expiresAt, verificationMethod}

/**
 * Generate ownership challenge for patient to sign
 * @param {string} upi - Patient UPI
 * @returns {Promise<{challenge: string, expiresAt: Date}>}
 */
export async function generateOwnershipChallenge(upi) {
  // Verify patient exists
  const patient = await getPatient(upi);
  if (!patient || !patient.hederaAccountId) {
    throw new Error('Patient not found or no Hedera account');
  }
  
  // Generate random challenge
  const randomBytes = crypto.randomBytes(32);
  const timestamp = Date.now();
  const challenge = `MEDIPACT_OWNERSHIP_${upi}_${timestamp}_${randomBytes.toString('hex')}`;
  
  // Store challenge (expires in 5 minutes)
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
  challengeStore.set(upi, { challenge, expiresAt });
  
  // Clean up expired challenges
  cleanupExpiredChallenges();
  
  return { challenge, expiresAt: expiresAt.toISOString() };
}

/**
 * Verify patient ownership using Hedera account signature
 * @param {string} upi - Patient UPI
 * @param {string} challenge - Challenge string
 * @param {string} signature - Signature (hex string)
 * @returns {Promise<{verified: boolean, patient?: Object, reason?: string}>}
 */
export async function verifyPatientOwnershipBySignature(upi, challenge, signature) {
  // 1. Get patient record
  const patient = await getPatient(upi);
  if (!patient || !patient.hederaAccountId) {
    return { verified: false, reason: 'Patient not found or no Hedera account' };
  }
  
  // 2. Verify challenge exists and not expired
  const storedChallenge = challengeStore.get(upi);
  if (!storedChallenge || storedChallenge.challenge !== challenge) {
    return { verified: false, reason: 'Invalid or expired challenge' };
  }
  
  if (new Date() > storedChallenge.expiresAt) {
    challengeStore.delete(upi);
    return { verified: false, reason: 'Challenge expired' };
  }
  
  // 3. Verify signature
  try {
    // Decrypt patient's private key (in production, use secure key management)
    const { decrypt } = await import('./encryption-service.js');
    const privateKeyString = decrypt(patient.encryptedPrivateKey);
    const privateKey = PrivateKey.fromStringECDSA(privateKeyString);
    const publicKey = privateKey.publicKey;
    
    // Verify signature
    const messageBytes = Buffer.from(challenge, 'utf-8');
    const signatureBytes = Buffer.from(signature, 'hex');
    const isValid = publicKey.verify(messageBytes, signatureBytes);
    
    if (isValid) {
      // Remove used challenge
      challengeStore.delete(upi);
      return { verified: true, patient };
    }
    
    return { verified: false, reason: 'Invalid signature' };
  } catch (error) {
    console.error('Signature verification error:', error);
    return { verified: false, reason: 'Signature verification failed' };
  }
}

/**
 * Verify patient ownership using contact info
 * @param {string} upi - Patient UPI
 * @param {Object} contactInfo - {email?, phone?, nationalId?}
 * @returns {Promise<{verified: boolean, patient?: Object, reason?: string}>}
 */
export async function verifyPatientOwnershipByContact(upi, contactInfo) {
  // 1. Get patient record
  const patient = await getPatient(upi);
  if (!patient) {
    return { verified: false, reason: 'Patient not found' };
  }
  
  // 2. Get patient contacts
  const contact = await getPatientContact(upi);
  
  if (!contact) {
    return { verified: false, reason: 'No contact information on file' };
  }
  
  // 3. Verify at least one contact matches
  let matches = 0;
  if (contactInfo.email && contact.email && contact.email.toLowerCase() === contactInfo.email.toLowerCase()) {
    matches++;
  }
  if (contactInfo.phone && contact.phone && normalizePhone(contact.phone) === normalizePhone(contactInfo.phone)) {
    matches++;
  }
  if (contactInfo.nationalId && contact.nationalId && contact.nationalId === contactInfo.nationalId) {
    matches++;
  }
  
  // Require at least 2 matches for security (or 1 if it's a strong identifier like nationalId)
  const verified = matches >= 2 || (matches === 1 && contactInfo.nationalId && contact.nationalId);
  
  if (verified) {
    return { verified: true, patient };
  }
  
  return { verified: false, reason: 'Contact information does not match' };
}

/**
 * Create patient session after ownership verification
 * @param {string} upi - Patient UPI
 * @param {string} verificationMethod - 'signature' | 'contact' | 'recovery'
 * @returns {Promise<{sessionToken: string, expiresAt: Date}>}
 */
export async function createPatientSession(upi, verificationMethod = 'contact') {
  // Generate session token
  const sessionToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  // Store session
  sessionStore.set(sessionToken, {
    upi,
    expiresAt,
    verificationMethod,
    createdAt: new Date()
  });
  
  // Clean up expired sessions
  cleanupExpiredSessions();
  
  return {
    sessionToken,
    expiresAt: expiresAt.toISOString()
  };
}

/**
 * Verify patient session token
 * @param {string} sessionToken - Session token
 * @returns {Promise<{valid: boolean, upi?: string, reason?: string}>}
 */
export async function verifyPatientSession(sessionToken) {
  const session = sessionStore.get(sessionToken);
  
  if (!session) {
    return { valid: false, reason: 'Invalid session token' };
  }
  
  if (new Date() > session.expiresAt) {
    sessionStore.delete(sessionToken);
    return { valid: false, reason: 'Session expired' };
  }
  
  return { valid: true, upi: session.upi, verificationMethod: session.verificationMethod };
}

/**
 * Revoke patient session
 * @param {string} sessionToken - Session token
 */
export async function revokePatientSession(sessionToken) {
  sessionStore.delete(sessionToken);
}

/**
 * Normalize phone number for comparison
 */
function normalizePhone(phone) {
  return phone.replace(/\D/g, ''); // Remove all non-digits
}

/**
 * Clean up expired challenges
 */
function cleanupExpiredChallenges() {
  const now = new Date();
  for (const [upi, data] of challengeStore.entries()) {
    if (now > data.expiresAt) {
      challengeStore.delete(upi);
    }
  }
}

/**
 * Clean up expired sessions
 */
function cleanupExpiredSessions() {
  const now = new Date();
  for (const [token, session] of sessionStore.entries()) {
    if (now > session.expiresAt) {
      sessionStore.delete(token);
    }
  }
}

// Cleanup every 5 minutes
setInterval(() => {
  cleanupExpiredChallenges();
  cleanupExpiredSessions();
}, 5 * 60 * 1000);

