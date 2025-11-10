/**
 * Consent Database Operations
 * 
 * CRUD operations for patient consent records.
 */

import { run, get, all, getDatabaseType } from './database.js';

/**
 * Create a consent record
 */
export async function createConsent(consentData) {
  const dbType = getDatabaseType();
  const now = new Date().toISOString();
  
  if (dbType === 'postgresql') {
    const result = await run(
      `INSERT INTO patient_consents (
        anonymous_patient_id, upi, consent_type, status, hcs_topic_id, 
        consent_topic_id, data_hash, granted_at, expires_at, hospital_id,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id`,
      [
        consentData.anonymousPatientId,
        consentData.upi,
        consentData.consentType,
        consentData.status || 'active',
        consentData.hcsTopicId || null,
        consentData.consentTopicId || null,
        consentData.dataHash || null,
        consentData.grantedAt || now,
        consentData.expiresAt || null,
        consentData.hospitalId || null,
        now,
        now
      ]
    );
    return result.lastID || result.rows?.[0]?.id;
  } else {
    const result = await run(
      `INSERT INTO patient_consents (
        anonymous_patient_id, upi, consent_type, status, hcs_topic_id, 
        consent_topic_id, data_hash, granted_at, expires_at, hospital_id,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        consentData.anonymousPatientId,
        consentData.upi,
        consentData.consentType,
        consentData.status || 'active',
        consentData.hcsTopicId || null,
        consentData.consentTopicId || null,
        consentData.dataHash || null,
        consentData.grantedAt || now,
        consentData.expiresAt || null,
        consentData.hospitalId || null,
        now,
        now
      ]
    );
    return result.lastID;
  }
}

/**
 * Get consent by anonymous patient ID
 */
export async function getConsentByAnonymousId(anonymousPatientId) {
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    return await get(
      `SELECT 
        id, anonymous_patient_id as "anonymousPatientId", upi, 
        consent_type as "consentType", status, hcs_topic_id as "hcsTopicId",
        consent_topic_id as "consentTopicId", data_hash as "dataHash",
        granted_at as "grantedAt", expires_at as "expiresAt",
        revoked_at as "revokedAt", revoked_by as "revokedBy",
        hospital_id as "hospitalId", created_at as "createdAt",
        updated_at as "updatedAt"
      FROM patient_consents 
      WHERE anonymous_patient_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1`,
      [anonymousPatientId]
    );
  } else {
    const row = await get(
      `SELECT 
        id, anonymous_patient_id as anonymousPatientId, upi, 
        consent_type as consentType, status, hcs_topic_id as hcsTopicId,
        consent_topic_id as consentTopicId, data_hash as dataHash,
        granted_at as grantedAt, expires_at as expiresAt,
        revoked_at as revokedAt, revoked_by as revokedBy,
        hospital_id as hospitalId, created_at as createdAt,
        updated_at as updatedAt
      FROM patient_consents 
      WHERE anonymous_patient_id = ? 
      ORDER BY created_at DESC 
      LIMIT 1`,
      [anonymousPatientId]
    );
    return mapConsentRow(row);
  }
}

/**
 * Get all active consents for a list of anonymous patient IDs
 * Returns a Set of anonymous patient IDs that have active consent
 */
export async function getActiveConsentIds(anonymousPatientIds) {
  if (!anonymousPatientIds || anonymousPatientIds.length === 0) {
    return new Set();
  }

  const dbType = getDatabaseType();
  const placeholders = anonymousPatientIds.map((_, i) => 
    dbType === 'postgresql' ? `$${i + 1}` : '?'
  ).join(',');
  
  const query = `
    SELECT DISTINCT anonymous_patient_id
    FROM patient_consents
    WHERE anonymous_patient_id IN (${placeholders})
      AND status = 'active'
      AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
  `;

  let rows;
  if (dbType === 'postgresql') {
    const result = await all(query, anonymousPatientIds);
    rows = result.rows || result;
  } else {
    rows = await all(query, anonymousPatientIds);
  }

  const consentIds = new Set();
  for (const row of rows) {
    const id = dbType === 'postgresql' 
      ? row.anonymous_patient_id 
      : row.anonymousPatientId || row.anonymous_patient_id;
    consentIds.add(id);
  }
  
  return consentIds;
}

/**
 * Check if a patient has active consent
 */
export async function hasActiveConsent(anonymousPatientId) {
  const consent = await getConsentByAnonymousId(anonymousPatientId);
  if (!consent) return false;
  
  if (consent.status !== 'active') return false;
  
  // Check if expired
  if (consent.expiresAt) {
    const expiresAt = new Date(consent.expiresAt);
    if (expiresAt < new Date()) return false;
  }
  
  return true;
}

/**
 * Revoke consent
 */
export async function revokeConsent(anonymousPatientId, revokedBy = null) {
  const now = new Date().toISOString();
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    await run(
      `UPDATE patient_consents 
       SET status = 'revoked', revoked_at = $1, revoked_by = $2, updated_at = $3
       WHERE anonymous_patient_id = $4 AND status = 'active'`,
      [now, revokedBy, now, anonymousPatientId]
    );
  } else {
    await run(
      `UPDATE patient_consents 
       SET status = 'revoked', revoked_at = ?, revoked_by = ?, updated_at = ?
       WHERE anonymous_patient_id = ? AND status = 'active'`,
      [now, revokedBy, now, anonymousPatientId]
    );
  }
}

/**
 * Get consents by UPI
 */
export async function getConsentsByUPI(upi) {
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    const result = await all(
      `SELECT 
        id, anonymous_patient_id as "anonymousPatientId", upi, 
        consent_type as "consentType", status, hcs_topic_id as "hcsTopicId",
        consent_topic_id as "consentTopicId", data_hash as "dataHash",
        granted_at as "grantedAt", expires_at as "expiresAt",
        revoked_at as "revokedAt", revoked_by as "revokedBy",
        hospital_id as "hospitalId", created_at as "createdAt",
        updated_at as "updatedAt"
      FROM patient_consents 
      WHERE upi = $1 
      ORDER BY created_at DESC`,
      [upi]
    );
    return result.rows || result;
  } else {
    const rows = await all(
      `SELECT 
        id, anonymous_patient_id as anonymousPatientId, upi, 
        consent_type as consentType, status, hcs_topic_id as hcsTopicId,
        consent_topic_id as consentTopicId, data_hash as dataHash,
        granted_at as grantedAt, expires_at as expiresAt,
        revoked_at as revokedAt, revoked_by as revokedBy,
        hospital_id as hospitalId, created_at as createdAt,
        updated_at as updatedAt
      FROM patient_consents 
      WHERE upi = ? 
      ORDER BY created_at DESC`,
      [upi]
    );
    return rows.map(mapConsentRow);
  }
}

/**
 * Map database row to camelCase object (for SQLite)
 */
function mapConsentRow(row) {
  if (!row) return null;
  
  return {
    id: row.id,
    anonymousPatientId: row.anonymousPatientId || row.anonymous_patient_id,
    upi: row.upi,
    consentType: row.consentType || row.consent_type,
    status: row.status,
    hcsTopicId: row.hcsTopicId || row.hcs_topic_id,
    consentTopicId: row.consentTopicId || row.consent_topic_id,
    dataHash: row.dataHash || row.data_hash,
    grantedAt: row.grantedAt || row.granted_at,
    expiresAt: row.expiresAt || row.expires_at,
    revokedAt: row.revokedAt || row.revoked_at,
    revokedBy: row.revokedBy || row.revoked_by,
    hospitalId: row.hospitalId || row.hospital_id,
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at,
  };
}

