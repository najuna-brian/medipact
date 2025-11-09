/**
 * Patient Contacts Database Operations
 * 
 * CRUD operations for patient contact information (email, phone, national ID).
 * Used for patient lookup and authentication.
 */

import { run, get, all } from './database.js';
import crypto from 'crypto';

/**
 * Normalize phone number (digits only)
 */
function normalizePhone(phone) {
  if (!phone) return null;
  return phone.replace(/\D/g, '');
}

/**
 * Normalize email (lowercase)
 */
function normalizeEmail(email) {
  if (!email) return null;
  return email.toLowerCase().trim();
}

/**
 * Normalize national ID
 */
function normalizeNationalId(nationalId) {
  if (!nationalId) return null;
  return nationalId.trim().toUpperCase();
}

/**
 * Generate contact ID
 */
function generateContactId(upi) {
  return crypto.randomBytes(16).toString('hex');
}

/**
 * Create or update patient contact
 */
export async function upsertPatientContact(upi, contactInfo) {
  const email = normalizeEmail(contactInfo.email);
  const phone = normalizePhone(contactInfo.phone);
  const nationalId = normalizeNationalId(contactInfo.nationalId);

  // Check if contact already exists for this UPI
  const existing = await get(
    `SELECT id FROM patient_contacts WHERE upi = ?`,
    [upi]
  );

  if (existing) {
    // Update existing contact
    await run(
      `UPDATE patient_contacts 
       SET email = ?, phone = ?, national_id = ?, updated_at = CURRENT_TIMESTAMP
       WHERE upi = ?`,
      [email, phone, nationalId, upi]
    );
    return await getPatientContactByUPI(upi);
  } else {
    // Create new contact
    const id = generateContactId(upi);
    await run(
      `INSERT INTO patient_contacts (id, upi, email, phone, national_id, verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [id, upi, email, phone, nationalId]
    );
    return await getPatientContactByUPI(upi);
  }
}

/**
 * Get patient contact by UPI
 */
export async function getPatientContactByUPI(upi) {
  return await get(
    `SELECT * FROM patient_contacts WHERE upi = ?`,
    [upi]
  );
}

/**
 * Find UPI by email
 */
export async function findUPIByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  const contact = await get(
    `SELECT upi FROM patient_contacts WHERE email = ?`,
    [normalizedEmail]
  );
  return contact ? contact.upi : null;
}

/**
 * Find UPI by phone
 */
export async function findUPIByPhone(phone) {
  const normalizedPhone = normalizePhone(phone);
  const contact = await get(
    `SELECT upi FROM patient_contacts WHERE phone = ?`,
    [normalizedPhone]
  );
  return contact ? contact.upi : null;
}

/**
 * Find UPI by national ID
 */
export async function findUPIByNationalId(nationalId) {
  const normalizedId = normalizeNationalId(nationalId);
  const contact = await get(
    `SELECT upi FROM patient_contacts WHERE national_id = ?`,
    [normalizedId]
  );
  return contact ? contact.upi : null;
}

/**
 * Verify patient contact
 */
export async function verifyPatientContact(upi, verificationMethod = 'email') {
  await run(
    `UPDATE patient_contacts 
     SET verified = 1, updated_at = CURRENT_TIMESTAMP
     WHERE upi = ?`,
    [upi]
  );
  return await getPatientContactByUPI(upi);
}

/**
 * Delete patient contact
 */
export async function deletePatientContact(upi) {
  await run(
    `DELETE FROM patient_contacts WHERE upi = ?`,
    [upi]
  );
}

