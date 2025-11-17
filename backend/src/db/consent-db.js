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
 * Get consent statistics for a hospital
 * Returns counts of:
 * - Patients with on-chain consent (hcs_topic_id is not null)
 * - Total active consents
 * - Records associated with active consents (from FHIR tables)
 */
/**
 * Helper function to get the correct column name (handles both snake_case and camelCase)
 * Checks which column exists and returns the appropriate name
 */
async function getColumnName(tableName, camelCaseName, snakeCaseName) {
  const dbType = getDatabaseType();
  if (dbType !== 'postgresql') {
    // SQLite always uses camelCase
    return `"${camelCaseName}"`;
  }
  
  const db = getDatabase();
  try {
    // Check if camelCase column exists
    const camelCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND column_name = $2
    `, [tableName, camelCaseName]);
    
    if (camelCheck.rows.length > 0) {
      return `"${camelCaseName}"`;
    }
    
    // Check if snake_case column exists
    const snakeCheck = await db.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = $1 AND column_name = $2
    `, [tableName, snakeCaseName]);
    
    if (snakeCheck.rows.length > 0) {
      return snakeCaseName;
    }
    
    // Default to camelCase (for new tables)
    return `"${camelCaseName}"`;
  } catch (error) {
    // If table doesn't exist, default to camelCase
    return `"${camelCaseName}"`;
  }
}

export async function getConsentStatistics(hospitalId) {
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    // Get correct column names (handles both snake_case and camelCase)
    const fpAnonymousId = await getColumnName('fhir_patients', 'anonymousPatientId', 'anonymous_patient_id');
    const fpHospitalId = await getColumnName('fhir_patients', 'hospitalId', 'hospital_id');
    const fcAnonymousId = await getColumnName('fhir_conditions', 'anonymousPatientId', 'anonymous_patient_id');
    const fcHospitalId = await getColumnName('fhir_conditions', 'hospitalId', 'hospital_id');
    const foAnonymousId = await getColumnName('fhir_observations', 'anonymousPatientId', 'anonymous_patient_id');
    const foHospitalId = await getColumnName('fhir_observations', 'hospitalId', 'hospital_id');
    // Count patients with on-chain consent (hcs_topic_id is not null)
    const onChainResult = await get(
      `SELECT COUNT(DISTINCT anonymous_patient_id) as count
       FROM patient_consents
       WHERE hospital_id = $1
         AND status = 'active'
         AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)
         AND hcs_topic_id IS NOT NULL`,
      [hospitalId]
    );
    
    // Count total active consents
    const activeConsentsResult = await get(
      `SELECT COUNT(*) as count
       FROM patient_consents
       WHERE hospital_id = $1
         AND status = 'active'
         AND (expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP)`,
      [hospitalId]
    );
    
    // Count records (FHIR resources) associated with active consents
    // This counts all FHIR resources (patients, conditions, observations) for patients with active consent
    // Uses dynamic column names to handle both snake_case (pre-migration) and camelCase (post-migration)
    const recordsResult = await get(
      `SELECT COUNT(*) as count
       FROM (
         SELECT DISTINCT p.anonymous_patient_id
         FROM patient_consents p
         WHERE p.hospital_id = $1
           AND p.status = 'active'
           AND (p.expires_at IS NULL OR p.expires_at > CURRENT_TIMESTAMP)
       ) consented_patients
       LEFT JOIN fhir_patients fp ON fp.${fpAnonymousId} = consented_patients.anonymous_patient_id AND fp.${fpHospitalId} = $1
       LEFT JOIN fhir_conditions fc ON fc.${fcAnonymousId} = consented_patients.anonymous_patient_id AND fc.${fcHospitalId} = $1
       LEFT JOIN fhir_observations fo ON fo.${foAnonymousId} = consented_patients.anonymous_patient_id AND fo.${foHospitalId} = $1
       WHERE fp.${fpAnonymousId} IS NOT NULL
          OR fc.${fcAnonymousId} IS NOT NULL
          OR fo.${foAnonymousId} IS NOT NULL`,
      [hospitalId, hospitalId, hospitalId]
    );
    
    // Also count total FHIR records for this hospital (all resource types)
    // Count all FHIR resource types, not just patients, conditions, observations
    // Handle missing tables gracefully (FHIR tables may not exist if migration hasn't run)
    let totalRecordsResult;
    try {
      console.log(`[Consent Stats] Counting total records for hospital ${hospitalId}`);
      // Check which FHIR tables exist
      const { all } = await import('./database.js');
      const tableCheck = await all(
        `SELECT table_name 
         FROM information_schema.tables 
         WHERE table_schema = 'public' 
         AND table_name IN (
           'fhir_patients', 'fhir_conditions', 'fhir_observations', 
           'fhir_encounters', 'fhir_medication_requests', 'fhir_procedures',
           'fhir_imaging_studies', 'fhir_allergies', 'fhir_coverage'
         )`
      );
      
      const existingTables = Array.isArray(tableCheck) 
        ? tableCheck.map(t => t.table_name)
        : [];
      
      console.log(`[Consent Stats] Found ${existingTables.length} FHIR tables: ${existingTables.join(', ')}`);
      
      // Build query with only existing tables (using dynamic column names)
      const countQueries = [];
      if (existingTables.includes('fhir_patients')) {
        const hospitalIdCol = await getColumnName('fhir_patients', 'hospitalId', 'hospital_id');
        countQueries.push(`(SELECT COUNT(*) FROM fhir_patients WHERE ${hospitalIdCol} = $1)`);
      }
      if (existingTables.includes('fhir_conditions')) {
        const hospitalIdCol = await getColumnName('fhir_conditions', 'hospitalId', 'hospital_id');
        countQueries.push(`(SELECT COUNT(*) FROM fhir_conditions WHERE ${hospitalIdCol} = $1)`);
      }
      if (existingTables.includes('fhir_observations')) {
        const hospitalIdCol = await getColumnName('fhir_observations', 'hospitalId', 'hospital_id');
        countQueries.push(`(SELECT COUNT(*) FROM fhir_observations WHERE ${hospitalIdCol} = $1)`);
      }
      if (existingTables.includes('fhir_encounters')) {
        const hospitalIdCol = await getColumnName('fhir_encounters', 'hospitalId', 'hospital_id');
        countQueries.push(`(SELECT COUNT(*) FROM fhir_encounters WHERE ${hospitalIdCol} = $1)`);
      }
      if (existingTables.includes('fhir_medication_requests')) {
        const hospitalIdCol = await getColumnName('fhir_medication_requests', 'hospitalId', 'hospital_id');
        countQueries.push(`(SELECT COUNT(*) FROM fhir_medication_requests WHERE ${hospitalIdCol} = $1)`);
      }
      if (existingTables.includes('fhir_procedures')) {
        const hospitalIdCol = await getColumnName('fhir_procedures', 'hospitalId', 'hospital_id');
        countQueries.push(`(SELECT COUNT(*) FROM fhir_procedures WHERE ${hospitalIdCol} = $1)`);
      }
      if (existingTables.includes('fhir_imaging_studies')) {
        const hospitalIdCol = await getColumnName('fhir_imaging_studies', 'hospitalId', 'hospital_id');
        countQueries.push(`(SELECT COUNT(*) FROM fhir_imaging_studies WHERE ${hospitalIdCol} = $1)`);
      }
      if (existingTables.includes('fhir_allergies')) {
        const hospitalIdCol = await getColumnName('fhir_allergies', 'hospitalId', 'hospital_id');
        countQueries.push(`(SELECT COUNT(*) FROM fhir_allergies WHERE ${hospitalIdCol} = $1)`);
      }
      if (existingTables.includes('fhir_coverage')) {
        const hospitalIdCol = await getColumnName('fhir_coverage', 'hospitalId', 'hospital_id');
        countQueries.push(`(SELECT COUNT(*) FROM fhir_coverage WHERE ${hospitalIdCol} = $1)`);
      }
      
      if (countQueries.length === 0) {
        console.warn(`[Consent Stats] No FHIR tables found for hospital ${hospitalId}`);
        totalRecordsResult = { count: 0 };
      } else {
        const query = `SELECT ${countQueries.join(' + ')} as count`;
        console.log(`[Consent Stats] Executing query: ${query.substring(0, 200)}...`);
        totalRecordsResult = await get(query, [hospitalId]);
        console.log(`[Consent Stats] Total records result:`, totalRecordsResult);
      }
    } catch (error) {
      // If query fails (tables don't exist), return 0
      console.error(`[Consent Stats] Error counting total records for hospital ${hospitalId}:`, error.message);
      console.error(`[Consent Stats] Error stack:`, error.stack);
      if (error.message.includes('does not exist') || error.code === '42P01') {
        console.warn('FHIR tables not found, returning 0 for total records:', error.message);
        totalRecordsResult = { count: 0 };
      } else {
        throw error;
      }
    }
    
    const stats = {
      patientsWithOnChainConsent: parseInt(onChainResult?.count || 0),
      totalActiveConsents: parseInt(activeConsentsResult?.count || 0),
      recordsWithActiveConsent: parseInt(recordsResult?.count || 0),
      totalRecords: parseInt(totalRecordsResult?.count || 0)
    };
    
    console.log(`[Consent Stats] Hospital ${hospitalId} statistics (PostgreSQL):`, stats);
    
    return stats;
  } else {
    // SQLite version
    const onChainResult = await get(
      `SELECT COUNT(DISTINCT anonymous_patient_id) as count
       FROM patient_consents
       WHERE hospital_id = ?
         AND status = 'active'
         AND (expires_at IS NULL OR expires_at > datetime('now'))
         AND hcs_topic_id IS NOT NULL`,
      [hospitalId]
    );
    
    const activeConsentsResult = await get(
      `SELECT COUNT(*) as count
       FROM patient_consents
       WHERE hospital_id = ?
         AND status = 'active'
         AND (expires_at IS NULL OR expires_at > datetime('now'))`,
      [hospitalId]
    );
    
    // For SQLite, use camelCase with quoted identifiers for FHIR tables
    // Count all FHIR resource records (not just distinct patients) - matches PostgreSQL behavior
    const recordsResult = await get(
      `SELECT COUNT(*) as count
       FROM (
         SELECT DISTINCT p.anonymous_patient_id
         FROM patient_consents p
         WHERE p.hospital_id = ?
           AND p.status = 'active'
           AND (p.expires_at IS NULL OR p.expires_at > datetime('now'))
       ) consented_patients
       LEFT JOIN fhir_patients fp ON fp."anonymousPatientId" = consented_patients.anonymous_patient_id AND fp."hospitalId" = ?
       LEFT JOIN fhir_conditions fc ON fc."anonymousPatientId" = consented_patients.anonymous_patient_id AND fc."hospitalId" = ?
       LEFT JOIN fhir_observations fo ON fo."anonymousPatientId" = consented_patients.anonymous_patient_id AND fo."hospitalId" = ?
       WHERE fp."anonymousPatientId" IS NOT NULL 
          OR fc."anonymousPatientId" IS NOT NULL 
          OR fo."anonymousPatientId" IS NOT NULL`,
      [hospitalId, hospitalId, hospitalId, hospitalId]
    );
    
    // Count all FHIR resource types for SQLite
    // Handle missing tables gracefully
    let totalRecordsResult;
    try {
      // Check which FHIR tables exist
      const { all } = await import('./database.js');
      const tableCheck = await all(
        `SELECT name as table_name 
         FROM sqlite_master 
         WHERE type='table' 
         AND name IN (
           'fhir_patients', 'fhir_conditions', 'fhir_observations', 
           'fhir_encounters', 'fhir_medication_requests', 'fhir_procedures',
           'fhir_imaging_studies', 'fhir_allergies', 'fhir_coverage'
         )`
      );
      
      const existingTables = Array.isArray(tableCheck) 
        ? tableCheck.map(t => t.table_name)
        : [];
      
      // Build query with only existing tables (using camelCase with quoted identifiers)
      const countQueries = [];
      const params = [];
      if (existingTables.includes('fhir_patients')) {
        countQueries.push('(SELECT COUNT(*) FROM fhir_patients WHERE "hospitalId" = ?)');
        params.push(hospitalId);
      }
      if (existingTables.includes('fhir_conditions')) {
        countQueries.push('(SELECT COUNT(*) FROM fhir_conditions WHERE "hospitalId" = ?)');
        params.push(hospitalId);
      }
      if (existingTables.includes('fhir_observations')) {
        countQueries.push('(SELECT COUNT(*) FROM fhir_observations WHERE "hospitalId" = ?)');
        params.push(hospitalId);
      }
      if (existingTables.includes('fhir_encounters')) {
        countQueries.push('(SELECT COUNT(*) FROM fhir_encounters WHERE "hospitalId" = ?)');
        params.push(hospitalId);
      }
      if (existingTables.includes('fhir_medication_requests')) {
        countQueries.push('(SELECT COUNT(*) FROM fhir_medication_requests WHERE "hospitalId" = ?)');
        params.push(hospitalId);
      }
      if (existingTables.includes('fhir_procedures')) {
        countQueries.push('(SELECT COUNT(*) FROM fhir_procedures WHERE "hospitalId" = ?)');
        params.push(hospitalId);
      }
      if (existingTables.includes('fhir_imaging_studies')) {
        countQueries.push('(SELECT COUNT(*) FROM fhir_imaging_studies WHERE "hospitalId" = ?)');
        params.push(hospitalId);
      }
      if (existingTables.includes('fhir_allergies')) {
        countQueries.push('(SELECT COUNT(*) FROM fhir_allergies WHERE "hospitalId" = ?)');
        params.push(hospitalId);
      }
      if (existingTables.includes('fhir_coverage')) {
        countQueries.push('(SELECT COUNT(*) FROM fhir_coverage WHERE "hospitalId" = ?)');
        params.push(hospitalId);
      }
      
      if (countQueries.length === 0) {
        totalRecordsResult = { count: 0 };
      } else {
        totalRecordsResult = await get(
          `SELECT ${countQueries.join(' + ')} as count`,
          params
        );
      }
    } catch (error) {
      // If query fails (tables don't exist), return 0
      if (error.message.includes('does not exist') || error.message.includes('no such table')) {
        console.warn('FHIR tables not found, returning 0 for total records:', error.message);
        totalRecordsResult = { count: 0 };
      } else {
        throw error;
      }
    }
    
    return {
      patientsWithOnChainConsent: parseInt(onChainResult?.count || 0),
      totalActiveConsents: parseInt(activeConsentsResult?.count || 0),
      recordsWithActiveConsent: parseInt(recordsResult?.count || 0),
      totalRecords: parseInt(totalRecordsResult?.count || 0)
    };
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

