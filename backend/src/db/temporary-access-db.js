/**
 * Temporary Hospital Access Database Operations
 * 
 * CRUD operations for temporary cross-hospital data access requests.
 */

import { run, get, all, getDatabaseType, getDatabase } from './database.js';

/**
 * Create temporary access request
 */
export async function createTemporaryAccessRequest(requestData) {
  const dbType = getDatabaseType();
  const now = new Date().toISOString();
  
  const {
    upi,
    requestingHospitalId,
    originalHospitalId,
    accessType = 'read',
    durationMinutes,
    purpose,
    patientNotes = null
  } = requestData;
  
  if (dbType === 'postgresql') {
    const result = await run(
      `INSERT INTO temporary_hospital_access (
        upi, requesting_hospital_id, original_hospital_id,
        access_type, duration_minutes, purpose, patient_notes,
        status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        upi, requestingHospitalId, originalHospitalId,
        accessType, durationMinutes, purpose, patientNotes,
        'pending', now, now
      ]
    );
    return mapAccessRequestRow(result.rows[0]);
  } else {
    await run(
      `INSERT INTO temporary_hospital_access (
        upi, requesting_hospital_id, original_hospital_id,
        access_type, duration_minutes, purpose, patient_notes,
        status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        upi, requestingHospitalId, originalHospitalId,
        accessType, durationMinutes, purpose, patientNotes,
        'pending', now, now
      ]
    );
    // Get the last inserted ID
    const lastId = await get('SELECT last_insert_rowid() as id');
    return getTemporaryAccessRequest(lastId.id);
  }
}

/**
 * Get temporary access request by ID
 */
export async function getTemporaryAccessRequest(requestId) {
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    const result = await get(
      `SELECT 
        id, upi, requesting_hospital_id as "requestingHospitalId",
        original_hospital_id as "originalHospitalId",
        access_type as "accessType", duration_minutes as "durationMinutes",
        purpose, status, approved_at as "approvedAt",
        expires_at as "expiresAt", revoked_at as "revokedAt",
        patient_notes as "patientNotes", created_at as "createdAt",
        updated_at as "updatedAt"
      FROM temporary_hospital_access
      WHERE id = $1`,
      [requestId]
    );
    return result ? mapAccessRequestRow(result) : null;
  } else {
    const row = await get(
      `SELECT * FROM temporary_hospital_access WHERE id = ?`,
      [requestId]
    );
    return row ? mapAccessRequestRow(row) : null;
  }
}

/**
 * Get pending requests for a patient
 */
export async function getPendingAccessRequestsForPatient(upi) {
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    const db = getDatabase();
    const result = await db.query(
      `SELECT 
        ta.id, ta.upi, ta.requesting_hospital_id as "requestingHospitalId",
        ta.original_hospital_id as "originalHospitalId",
        ta.access_type as "accessType", ta.duration_minutes as "durationMinutes",
        ta.purpose, ta.status, ta.created_at as "createdAt",
        h1.name as "requestingHospitalName",
        h2.name as "originalHospitalName"
      FROM temporary_hospital_access ta
      LEFT JOIN hospitals h1 ON ta.requesting_hospital_id = h1.hospital_id
      LEFT JOIN hospitals h2 ON ta.original_hospital_id = h2.hospital_id
      WHERE ta.upi = $1 AND ta.status = 'pending'
      ORDER BY ta.created_at DESC`,
      [upi]
    );
    return result.rows.map(mapAccessRequestRow);
  } else {
    const rows = await all(
      `SELECT 
        ta.*,
        h1.name as requesting_hospital_name,
        h2.name as original_hospital_name
      FROM temporary_hospital_access ta
      LEFT JOIN hospitals h1 ON ta.requesting_hospital_id = h1.hospital_id
      LEFT JOIN hospitals h2 ON ta.original_hospital_id = h2.hospital_id
      WHERE ta.upi = ? AND ta.status = 'pending'
      ORDER BY ta.created_at DESC`,
      [upi]
    );
    return rows.map(row => ({
      id: row.id,
      upi: row.upi,
      requestingHospitalId: row.requesting_hospital_id,
      requestingHospitalName: row.requesting_hospital_name,
      originalHospitalId: row.original_hospital_id,
      originalHospitalName: row.original_hospital_name,
      accessType: row.access_type,
      durationMinutes: row.duration_minutes,
      purpose: row.purpose,
      status: row.status,
      createdAt: row.created_at
    }));
  }
}

/**
 * Get active access requests for a hospital
 */
export async function getActiveAccessRequestsForHospital(hospitalId) {
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    const db = getDatabase();
    const result = await db.query(
      `SELECT 
        ta.id, ta.upi, ta.requesting_hospital_id as "requestingHospitalId",
        ta.original_hospital_id as "originalHospitalId",
        ta.access_type as "accessType", ta.duration_minutes as "durationMinutes",
        ta.purpose, ta.status, ta.approved_at as "approvedAt",
        ta.expires_at as "expiresAt", ta.created_at as "createdAt"
      FROM temporary_hospital_access ta
      WHERE ta.requesting_hospital_id = $1 
        AND ta.status IN ('approved', 'active')
        AND (ta.expires_at IS NULL OR ta.expires_at > CURRENT_TIMESTAMP)
      ORDER BY ta.expires_at ASC`,
      [hospitalId]
    );
    return result.rows.map(mapAccessRequestRow);
  } else {
    const rows = await all(
      `SELECT * FROM temporary_hospital_access
      WHERE requesting_hospital_id = ? 
        AND status IN ('approved', 'active')
        AND (expires_at IS NULL OR expires_at > datetime('now'))
      ORDER BY expires_at ASC`,
      [hospitalId]
    );
    return rows.map(mapAccessRequestRow);
  }
}

/**
 * Approve temporary access request
 */
export async function approveTemporaryAccess(requestId) {
  const dbType = getDatabaseType();
  const now = new Date().toISOString();
  
  // Get request to calculate expiration
  const request = await getTemporaryAccessRequest(requestId);
  if (!request) {
    throw new Error('Access request not found');
  }
  
  // Calculate expiration time
  const expiresAt = new Date(Date.now() + request.durationMinutes * 60 * 1000).toISOString();
  
  if (dbType === 'postgresql') {
    await run(
      `UPDATE temporary_hospital_access
      SET status = 'active', approved_at = $1, expires_at = $2, updated_at = $3
      WHERE id = $4`,
      [now, expiresAt, now, requestId]
    );
  } else {
    await run(
      `UPDATE temporary_hospital_access
      SET status = 'active', approved_at = ?, expires_at = ?, updated_at = ?
      WHERE id = ?`,
      [now, expiresAt, now, requestId]
    );
  }
  
  return await getTemporaryAccessRequest(requestId);
}

/**
 * Reject temporary access request
 */
export async function rejectTemporaryAccess(requestId) {
  const dbType = getDatabaseType();
  const now = new Date().toISOString();
  
  if (dbType === 'postgresql') {
    await run(
      `UPDATE temporary_hospital_access
      SET status = 'rejected', updated_at = $1
      WHERE id = $2`,
      [now, requestId]
    );
  } else {
    await run(
      `UPDATE temporary_hospital_access
      SET status = 'rejected', updated_at = ?
      WHERE id = ?`,
      [now, requestId]
    );
  }
  
  return await getTemporaryAccessRequest(requestId);
}

/**
 * Revoke temporary access
 */
export async function revokeTemporaryAccess(requestId) {
  const dbType = getDatabaseType();
  const now = new Date().toISOString();
  
  if (dbType === 'postgresql') {
    await run(
      `UPDATE temporary_hospital_access
      SET status = 'revoked', revoked_at = $1, updated_at = $2
      WHERE id = $3`,
      [now, now, requestId]
    );
  } else {
    await run(
      `UPDATE temporary_hospital_access
      SET status = 'revoked', revoked_at = ?, updated_at = ?
      WHERE id = ?`,
      [now, now, requestId]
    );
  }
  
  return await getTemporaryAccessRequest(requestId);
}

/**
 * Check if hospital has active temporary access to patient data
 */
export async function hasActiveTemporaryAccess(requestingHospitalId, upi, originalHospitalId = null) {
  const dbType = getDatabaseType();
  
  let query, params;
  
  if (originalHospitalId) {
    if (dbType === 'postgresql') {
      query = `SELECT COUNT(*) as count
        FROM temporary_hospital_access
        WHERE requesting_hospital_id = $1 
          AND upi = $2
          AND original_hospital_id = $3
          AND status = 'active'
          AND expires_at > CURRENT_TIMESTAMP`;
      params = [requestingHospitalId, upi, originalHospitalId];
    } else {
      query = `SELECT COUNT(*) as count
        FROM temporary_hospital_access
        WHERE requesting_hospital_id = ? 
          AND upi = ?
          AND original_hospital_id = ?
          AND status = 'active'
          AND expires_at > datetime('now')`;
      params = [requestingHospitalId, upi, originalHospitalId];
    }
  } else {
    if (dbType === 'postgresql') {
      query = `SELECT COUNT(*) as count
        FROM temporary_hospital_access
        WHERE requesting_hospital_id = $1 
          AND upi = $2
          AND status = 'active'
          AND expires_at > CURRENT_TIMESTAMP`;
      params = [requestingHospitalId, upi];
    } else {
      query = `SELECT COUNT(*) as count
        FROM temporary_hospital_access
        WHERE requesting_hospital_id = ? 
          AND upi = ?
          AND status = 'active'
          AND expires_at > datetime('now')`;
      params = [requestingHospitalId, upi];
    }
  }
  
  const result = await get(query, params);
  return (result.count || 0) > 0;
}

/**
 * Expire old access requests (cleanup job)
 */
export async function expireOldAccessRequests() {
  const dbType = getDatabaseType();
  const now = new Date().toISOString();
  
  if (dbType === 'postgresql') {
    const result = await run(
      `UPDATE temporary_hospital_access
      SET status = 'expired', updated_at = $1
      WHERE status = 'active'
        AND expires_at <= CURRENT_TIMESTAMP`,
      [now]
    );
    return result.rowCount || 0;
  } else {
    await run(
      `UPDATE temporary_hospital_access
      SET status = 'expired', updated_at = ?
      WHERE status = 'active'
        AND expires_at <= datetime('now')`,
      [now]
    );
    // SQLite doesn't return row count easily, so we'll just return success
    return 1;
  }
}

/**
 * Map database row to camelCase object
 */
function mapAccessRequestRow(row) {
  if (!row) return null;
  
  return {
    id: row.id,
    upi: row.upi || row.UPI,
    requestingHospitalId: row.requestingHospitalId || row.requesting_hospital_id,
    requestingHospitalName: row.requestingHospitalName || row.requesting_hospital_name,
    originalHospitalId: row.originalHospitalId || row.original_hospital_id,
    originalHospitalName: row.originalHospitalName || row.original_hospital_name,
    accessType: row.accessType || row.access_type,
    durationMinutes: row.durationMinutes || row.duration_minutes,
    purpose: row.purpose,
    status: row.status,
    approvedAt: row.approvedAt || row.approved_at,
    expiresAt: row.expiresAt || row.expires_at,
    revokedAt: row.revokedAt || row.revoked_at,
    patientNotes: row.patientNotes || row.patient_notes,
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at
  };
}

