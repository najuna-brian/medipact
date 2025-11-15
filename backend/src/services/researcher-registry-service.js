/**
 * Researcher Registry Service
 * 
 * Manages researcher accounts and registration.
 * Each researcher gets a unique researcher ID and Hedera Account ID.
 */

import crypto from 'crypto';
import { createHederaAccount } from './hedera-account-service.js';
import { encrypt } from './encryption-service.js';

/**
 * Generate unique researcher ID
 * @param {string} email - Researcher email
 * @param {string} organizationName - Organization name
 * @returns {string} Researcher ID (RES-XXX)
 */
function generateResearcherID(email, organizationName) {
  const identifier = `${email}-${organizationName}`.toLowerCase().replace(/\s+/g, '-');
  const hash = crypto.createHash('sha256')
    .update(identifier, 'utf8')
    .digest('hex')
    .substring(0, 12)
    .toUpperCase();
  
  return `RES-${hash}`;
}

/**
 * Register a new researcher
 * @param {Object} researcherInfo - Researcher information
 *   - email: string (required)
 *   - organizationName: string (required)
 *   - contactName: string (optional)
 *   - country: string (optional)
 * @param {Function} researcherExists - Function to check if researcher exists (email) => Promise<boolean>
 * @param {Function} researcherCreate - Function to create researcher record
 * @returns {Promise<Object>} Researcher record with researcherId and hederaAccountId
 */
export async function registerResearcher(researcherInfo, researcherExists, researcherCreate) {
  if (!researcherInfo.email || !researcherInfo.organizationName) {
    throw new Error('Email and organization name are required');
  }
  
  // Registration number and verification documents should only be submitted during verification, not registration

  const researcherId = generateResearcherID(researcherInfo.email, researcherInfo.organizationName);
  
  // Check if researcher already exists
  const exists = await researcherExists(researcherInfo.email);
  if (exists) {
    throw new Error(
      `Researcher with email "${researcherInfo.email}" is already registered. Please login instead.`
    );
  }
  
  // Create Hedera account for researcher
  let hederaAccount = null;
  let encryptedPrivateKey = null;
  
  try {
    console.log(`Creating Hedera account for researcher: ${researcherId}`);
    hederaAccount = await createHederaAccount(0); // Platform pays for account creation
    encryptedPrivateKey = encrypt(hederaAccount.privateKey);
    console.log(`✅ Hedera account created: ${hederaAccount.accountId}`);
  } catch (error) {
    console.error('Failed to create Hedera account for researcher:', error);
    // Continue registration even if Hedera account creation fails
    // Account can be created later if needed
  }
  
  const researcherRecord = {
    researcherId,
    hederaAccountId: hederaAccount?.accountId || null,
    evmAddress: hederaAccount?.evmAddress || null,
    encryptedPrivateKey: encryptedPrivateKey || null,
    email: researcherInfo.email,
    organizationName: researcherInfo.organizationName,
    contactName: researcherInfo.contactName || null,
    country: researcherInfo.country || null,
    registrationNumber: 'PENDING', // Placeholder until verification (NOT NULL constraint - will be updated during verification)
    verificationDocuments: '{}', // Empty JSON object for NOT NULL constraint, will be set during verification
    verificationStatus: 'pending', // Start as pending (database constraint only allows 'pending', 'verified', 'rejected')
    accessLevel: 'basic' // Unverified researchers start with basic access
  };
  
  // Create researcher record
  const researcher = await researcherCreate(researcherRecord);
  
  return {
    researcherId: researcher.researcherId,
    hederaAccountId: researcher.hederaAccountId,
    email: researcher.email,
    organizationName: researcher.organizationName,
    contactName: researcher.contactName,
    country: researcher.country,
    verificationStatus: researcher.verificationStatus,
    accessLevel: researcher.accessLevel,
    registeredAt: researcher.registeredAt
  };
}

/**
 * Verify researcher (admin action)
 * @param {string} researcherId - Researcher ID
 * @param {string} adminId - Admin user ID
 * @param {Function} researcherUpdate - Function to update researcher
 * @returns {Promise<Object>} Updated researcher record
 */
export async function verifyResearcher(researcherId, adminId, researcherUpdate) {
  return await researcherUpdate(researcherId, {
    verificationStatus: 'verified',
    accessLevel: 'verified',
    verifiedAt: new Date().toISOString(),
    verifiedBy: adminId
  });
}

/**
 * Reject researcher verification (admin action)
 * @param {string} researcherId - Researcher ID
 * @param {string} adminId - Admin user ID
 * @param {string} reason - Rejection reason
 * @param {Function} researcherUpdate - Function to update researcher
 * @returns {Promise<Object>} Updated researcher record
 */
export async function rejectResearcherVerification(researcherId, adminId, reason, researcherUpdate) {
  return await researcherUpdate(researcherId, {
    verificationStatus: 'rejected',
    verifiedBy: adminId,
    verificationDocuments: JSON.stringify({ rejectionReason: reason })
  });
}

