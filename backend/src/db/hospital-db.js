/**
 * Hospital Database Operations
 * 
 * CRUD operations for hospitals.
 */

import { getDatabase } from './database.js';
import crypto from 'crypto';
import { promisify } from 'util';

const getDb = () => getDatabase();
const run = (query, params) => promisify(getDb().run.bind(getDb()))(query, params);
const get = (query, params) => promisify(getDb().get.bind(getDb()))(query, params);
const all = (query, params) => promisify(getDb().all.bind(getDb()))(query, params);

/**
 * Hash API key
 */
function hashApiKey(apiKey) {
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

/**
 * Create hospital
 */
export async function createHospital(hospitalData) {
  const apiKeyHash = hospitalData.apiKey 
    ? hashApiKey(hospitalData.apiKey)
    : null;

  await run(
    `INSERT INTO hospitals (
      hospital_id, name, country, location, fhir_endpoint, 
      contact_email, api_key_hash, registered_at, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'active')`,
    [
      hospitalData.hospitalId,
      hospitalData.name,
      hospitalData.country,
      hospitalData.location || null,
      hospitalData.fhirEndpoint || null,
      hospitalData.contactEmail || null,
      apiKeyHash
    ]
  );

  return {
    ...hospitalData,
    registeredAt: new Date().toISOString(),
    status: 'active'
  };
}

/**
 * Check if hospital exists by ID
 */
export async function hospitalExists(hospitalId) {
  const result = await get(
    `SELECT COUNT(*) as count FROM hospitals WHERE hospital_id = ?`,
    [hospitalId]
  );
  return result.count > 0;
}

/**
 * Get hospital by ID
 */
export async function getHospital(hospitalId) {
  return await get(
    `SELECT 
      hospital_id as hospitalId,
      name,
      country,
      location,
      fhir_endpoint as fhirEndpoint,
      contact_email as contactEmail,
      registered_at as registeredAt,
      status,
      verification_status as verificationStatus,
      verification_documents as verificationDocuments,
      verified_at as verifiedAt,
      verified_by as verifiedBy
    FROM hospitals 
    WHERE hospital_id = ? AND status = 'active'`,
    [hospitalId]
  );
}

/**
 * Verify hospital API key
 */
export async function verifyHospitalApiKey(hospitalId, apiKey) {
  const apiKeyHash = hashApiKey(apiKey);
  const result = await get(
    `SELECT COUNT(*) as count 
     FROM hospitals 
     WHERE hospital_id = ? AND api_key_hash = ? AND status = 'active'`,
    [hospitalId, apiKeyHash]
  );
  return result.count > 0;
}

/**
 * Update hospital
 */
export async function updateHospital(hospitalId, updates) {
  const fields = [];
  const values = [];

  if (updates.name) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.country) {
    fields.push('country = ?');
    values.push(updates.country);
  }
  if (updates.location !== undefined) {
    fields.push('location = ?');
    values.push(updates.location);
  }
  if (updates.fhirEndpoint !== undefined) {
    fields.push('fhir_endpoint = ?');
    values.push(updates.fhirEndpoint);
  }
  if (updates.contactEmail !== undefined) {
    fields.push('contact_email = ?');
    values.push(updates.contactEmail);
  }
  if (updates.status) {
    fields.push('status = ?');
    values.push(updates.status);
  }
  if (updates.verification_status !== undefined) {
    fields.push('verification_status = ?');
    values.push(updates.verification_status);
  }
  if (updates.verification_documents !== undefined) {
    fields.push('verification_documents = ?');
    values.push(updates.verification_documents);
  }
  if (updates.verified_at !== undefined) {
    fields.push('verified_at = ?');
    values.push(updates.verified_at);
  }
  if (updates.verified_by !== undefined) {
    fields.push('verified_by = ?');
    values.push(updates.verified_by);
  }

  if (fields.length > 0) {
    values.push(hospitalId);
    await run(
      `UPDATE hospitals SET ${fields.join(', ')} WHERE hospital_id = ?`,
      values
    );
  }

  return await getHospital(hospitalId);
}

/**
 * Get all hospitals
 */
export async function getAllHospitals() {
  return await all(
    `SELECT 
      hospital_id as hospitalId,
      name,
      country,
      location,
      fhir_endpoint as fhirEndpoint,
      contact_email as contactEmail,
      registered_at as registeredAt,
      status,
      verification_status as verificationStatus,
      verification_documents as verificationDocuments,
      verified_at as verifiedAt,
      verified_by as verifiedBy
    FROM hospitals 
    WHERE status = 'active'
    ORDER BY registered_at DESC`
  );
}

