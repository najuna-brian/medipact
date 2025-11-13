/**
 * Researcher Database Operations
 * 
 * CRUD operations for researcher accounts.
 */

import { run, get, all } from './database.js';
import crypto from 'crypto';

/**
 * Generate unique researcher ID
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
 * Create researcher
 */
export async function createResearcher(researcherData) {
  const researcherId = generateResearcherID(
    researcherData.email,
    researcherData.organizationName
  );

  // Store verification documents as JSON string
  const verificationDocumentsJson = typeof researcherData.verificationDocuments === 'string' 
    ? researcherData.verificationDocuments 
    : JSON.stringify(researcherData.verificationDocuments || {});

  await run(
    `INSERT INTO researchers (
      researcher_id, hedera_account_id, evm_address, encrypted_private_key, email, organization_name,
      contact_name, country, registration_number, verification_status, verification_documents, access_level, registered_at, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'active')`,
    [
      researcherId,
      researcherData.hederaAccountId || null,
      researcherData.evmAddress || null,
      researcherData.encryptedPrivateKey || null,
      researcherData.email,
      researcherData.organizationName,
      researcherData.contactName || null,
      researcherData.country || null,
      researcherData.registrationNumber || null,
      researcherData.verificationStatus || 'pending',
      verificationDocumentsJson,
      researcherData.accessLevel || 'basic'
    ]
  );

  return {
    researcherId,
    ...researcherData,
    registeredAt: new Date().toISOString(),
    status: 'active'
  };
}

/**
 * Check if researcher exists by email
 */
export async function researcherExists(email) {
  const result = await get(
    `SELECT COUNT(*) as count FROM researchers WHERE email = ?`,
    [email]
  );
  return result.count > 0;
}

/**
 * Get researcher by ID
 */
export async function getResearcher(researcherId) {
  return await get(
    `SELECT 
      researcher_id as researcherId,
      hedera_account_id as hederaAccountId,
      evm_address as evmAddress,
      email,
      organization_name as organizationName,
      contact_name as contactName,
      country,
      registration_number as registrationNumber,
      verification_status as verificationStatus,
      verification_documents as verificationDocuments,
      verified_at as verifiedAt,
      verified_by as verifiedBy,
      access_level as accessLevel,
      registered_at as registeredAt,
      status
    FROM researchers 
    WHERE researcher_id = ? AND status = 'active'`,
    [researcherId]
  );
}

/**
 * Get researcher by email
 */
export async function getResearcherByEmail(email) {
  return await get(
    `SELECT 
      researcher_id as researcherId,
      hedera_account_id as hederaAccountId,
      evm_address as evmAddress,
      email,
      organization_name as organizationName,
      contact_name as contactName,
      country,
      registration_number as registrationNumber,
      verification_status as verificationStatus,
      verification_documents as verificationDocuments,
      verified_at as verifiedAt,
      verified_by as verifiedBy,
      access_level as accessLevel,
      registered_at as registeredAt,
      status
    FROM researchers 
    WHERE email = ? AND status = 'active'`,
    [email]
  );
}

/**
 * Get researcher by Hedera Account ID
 */
export async function getResearcherByHederaAccount(hederaAccountId) {
  return await get(
    `SELECT 
      researcher_id as researcherId,
      hedera_account_id as hederaAccountId,
      evm_address as evmAddress,
      email,
      organization_name as organizationName,
      contact_name as contactName,
      country,
      verification_status as verificationStatus,
      access_level as accessLevel,
      registered_at as registeredAt,
      status
    FROM researchers 
    WHERE hedera_account_id = ? AND status = 'active'`,
    [hederaAccountId]
  );
}

/**
 * Update researcher
 */
export async function updateResearcher(researcherId, updates) {
  const fields = [];
  const values = [];

  if (updates.verificationStatus) {
    fields.push('verification_status = ?');
    values.push(updates.verificationStatus);
  }

  if (updates.verificationDocuments !== undefined) {
    fields.push('verification_documents = ?');
    values.push(updates.verificationDocuments);
  }

  if (updates.verifiedAt !== undefined) {
    fields.push('verified_at = ?');
    values.push(updates.verifiedAt);
  }

  if (updates.verifiedBy) {
    fields.push('verified_by = ?');
    values.push(updates.verifiedBy);
  }

  if (updates.accessLevel) {
    fields.push('access_level = ?');
    values.push(updates.accessLevel);
  }

  if (updates.hederaAccountId) {
    fields.push('hedera_account_id = ?');
    values.push(updates.hederaAccountId);
  }

  if (updates.evmAddress !== undefined) {
    fields.push('evm_address = ?');
    values.push(updates.evmAddress);
  }

  if (updates.encryptedPrivateKey) {
    fields.push('encrypted_private_key = ?');
    values.push(updates.encryptedPrivateKey);
  }

  if (fields.length > 0) {
    values.push(researcherId);
    await run(
      `UPDATE researchers SET ${fields.join(', ')} WHERE researcher_id = ?`,
      values
    );
  }

  return await getResearcher(researcherId);
}

/**
 * Get all researchers (for admin)
 */
export async function getAllResearchers() {
  const researchers = await all(
    `SELECT 
      researcher_id as researcherId,
      hedera_account_id as hederaAccountId,
      evm_address as evmAddress,
      email,
      organization_name as organizationName,
      contact_name as contactName,
      country,
      registration_number as registrationNumber,
      verification_status as verificationStatus,
      verification_documents as verificationDocuments,
      verified_at as verifiedAt,
      verified_by as verifiedBy,
      access_level as accessLevel,
      registered_at as registeredAt,
      status
    FROM researchers
    WHERE status = 'active'
    ORDER BY registered_at DESC`
  );

  return researchers;
}

