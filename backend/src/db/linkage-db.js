/**
 * Hospital Linkage Database Operations
 * 
 * CRUD operations for hospital linkages.
 */

import { getDatabase } from './database.js';
import { randomUUID } from 'crypto';
import { promisify } from 'util';

const getDb = () => getDatabase();
const run = (query, params) => promisify(getDb().run.bind(getDb()))(query, params);
const get = (query, params) => promisify(getDb().get.bind(getDb()))(query, params);
const all = (query, params) => promisify(getDb().all.bind(getDb()))(query, params);

/**
 * Create hospital linkage
 */
export async function createLinkage(linkageData) {
  const id = randomUUID();

  await run(
    `INSERT INTO hospital_linkages (
      id, upi, hospital_id, hospital_patient_id, linked_at,
      verified, verification_method, encrypted_pii, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      linkageData.upi,
      linkageData.hospitalId,
      linkageData.hospitalPatientId,
      linkageData.linkedAt || new Date().toISOString(),
      linkageData.verified ? 1 : 0,
      linkageData.verificationMethod || 'hospital_verification',
      linkageData.encryptedPII || null,
      linkageData.status || 'active'
    ]
  );

  return {
    id,
    ...linkageData,
    linkedAt: linkageData.linkedAt || new Date().toISOString()
  };
}

/**
 * Get all linkages for a patient
 */
export async function getLinkagesByUPI(upi) {
  const linkages = await all(
    `SELECT 
      l.id,
      l.upi,
      l.hospital_id as hospitalId,
      l.hospital_patient_id as hospitalPatientId,
      l.linked_at as linkedAt,
      l.verified,
      l.verification_method as verificationMethod,
      l.status,
      h.name as hospitalName
    FROM hospital_linkages l
    LEFT JOIN hospitals h ON l.hospital_id = h.hospital_id
    WHERE l.upi = ? AND l.status = 'active'
    ORDER BY l.linked_at DESC`,
    [upi]
  );

  return linkages.map(l => ({
    ...l,
    verified: l.verified === 1
  }));
}

/**
 * Get linkage by UPI and hospital ID
 */
export async function getLinkage(upi, hospitalId) {
  const linkage = await get(
    `SELECT 
      l.id,
      l.upi,
      l.hospital_id as hospitalId,
      l.hospital_patient_id as hospitalPatientId,
      l.linked_at as linkedAt,
      l.verified,
      l.verification_method as verificationMethod,
      l.status,
      h.name as hospitalName
    FROM hospital_linkages l
    LEFT JOIN hospitals h ON l.hospital_id = h.hospital_id
    WHERE l.upi = ? AND l.hospital_id = ? AND l.status = 'active'`,
    [upi, hospitalId]
  );

  if (linkage) {
    linkage.verified = linkage.verified === 1;
  }

  return linkage;
}

/**
 * Check if linkage exists
 */
export async function linkageExists(upi, hospitalId) {
  const result = await get(
    `SELECT COUNT(*) as count 
     FROM hospital_linkages 
     WHERE upi = ? AND hospital_id = ? AND status = 'active'`,
    [upi, hospitalId]
  );
  return result.count > 0;
}

/**
 * Remove linkage (soft delete)
 */
export async function removeLinkage(upi, hospitalId) {
  await run(
    `UPDATE hospital_linkages 
     SET status = 'disconnected' 
     WHERE upi = ? AND hospital_id = ?`,
    [upi, hospitalId]
  );
}

/**
 * Verify linkage
 */
export async function verifyLinkage(upi, hospitalId, verificationMethod) {
  await run(
    `UPDATE hospital_linkages 
     SET verified = 1, verification_method = ? 
     WHERE upi = ? AND hospital_id = ?`,
    [verificationMethod, upi, hospitalId]
  );
  return await getLinkage(upi, hospitalId);
}

/**
 * Get all linkages for a hospital
 */
export async function getLinkagesByHospital(hospitalId) {
  const linkages = await all(
    `SELECT 
      l.id,
      l.upi,
      l.hospital_id as hospitalId,
      l.hospital_patient_id as hospitalPatientId,
      l.linked_at as linkedAt,
      l.verified,
      l.verification_method as verificationMethod,
      l.status
    FROM hospital_linkages l
    WHERE l.hospital_id = ? AND l.status = 'active'
    ORDER BY l.linked_at DESC`,
    [hospitalId]
  );

  return linkages.map(l => ({
    ...l,
    verified: l.verified === 1
  }));
}

