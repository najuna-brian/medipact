/**
 * Patient Database Operations
 * 
 * CRUD operations for patient identities.
 */

import { run, get, all } from './database.js';

/**
 * Create patient identity
 */
export async function createPatient(upi, patientData = {}) {
  await run(
    `INSERT INTO patient_identities (upi, hedera_account_id, encrypted_private_key, created_at, last_updated, status)
     VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'active')`,
    [upi, patientData.hederaAccountId || null, patientData.encryptedPrivateKey || null]
  );
  return { 
    upi, 
    hederaAccountId: patientData.hederaAccountId,
    ...patientData, 
    createdAt: new Date().toISOString() 
  };
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
  const patient = await get(
    `SELECT 
      upi,
      hedera_account_id as hederaAccountId,
      created_at as createdAt,
      last_updated as lastUpdated,
      status
     FROM patient_identities 
     WHERE upi = ? AND status = 'active'`,
    [upi]
  );
  return patient;
}

/**
 * Get patient by Hedera Account ID
 */
export async function getPatientByHederaAccount(hederaAccountId) {
  const patient = await get(
    `SELECT 
      upi,
      hedera_account_id as hederaAccountId,
      created_at as createdAt,
      last_updated as lastUpdated,
      status
     FROM patient_identities 
     WHERE hedera_account_id = ? AND status = 'active'`,
    [hederaAccountId]
  );
  return patient;
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

  if (updates.hederaAccountId) {
    fields.push('hedera_account_id = ?');
    values.push(updates.hederaAccountId);
  }

  if (updates.encryptedPrivateKey) {
    fields.push('encrypted_private_key = ?');
    values.push(updates.encryptedPrivateKey);
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

