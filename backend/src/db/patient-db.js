/**
 * Patient Database Operations
 * 
 * CRUD operations for patient identities.
 */

import { getDatabase } from './database.js';
import { promisify } from 'util';

const getDb = () => getDatabase();
const run = (query, params) => promisify(getDb().run.bind(getDb()))(query, params);
const get = (query, params) => promisify(getDb().get.bind(getDb()))(query, params);
const all = (query, params) => promisify(getDb().all.bind(getDb()))(query, params);

/**
 * Create patient identity
 */
export async function createPatient(upi, patientData = {}) {
  await run(
    `INSERT INTO patient_identities (upi, created_at, last_updated, status)
     VALUES (?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'active')`,
    [upi]
  );
  return { upi, ...patientData, createdAt: new Date().toISOString() };
}

/**
 * Check if patient exists
 */
export async function patientExists(upi) {
  const result = await get(
    `SELECT COUNT(*) as count FROM patient_identities WHERE upi = ?`,
    [upi]
  );
  return result.count > 0;
}

/**
 * Get patient by UPI
 */
export async function getPatient(upi) {
  return await get(
    `SELECT * FROM patient_identities WHERE upi = ? AND status = 'active'`,
    [upi]
  );
}

/**
 * Update patient
 */
export async function updatePatient(upi, updates) {
  const fields = [];
  const values = [];

  if (updates.status) {
    fields.push('status = ?');
    values.push(updates.status);
  }

  if (fields.length > 0) {
    fields.push('last_updated = CURRENT_TIMESTAMP');
    values.push(upi);
    await run(
      `UPDATE patient_identities SET ${fields.join(', ')} WHERE upi = ?`,
      values
    );
  }

  return await getPatient(upi);
}

