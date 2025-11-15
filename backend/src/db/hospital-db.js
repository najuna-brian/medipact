/**
 * Hospital Database Operations
 * 
 * CRUD operations for hospitals.
 */

import { run, get, all } from './database.js';
import bcrypt from 'bcrypt';
import { encrypt, decrypt } from '../services/encryption-service.js';

const BCRYPT_ROUNDS = 10; // Lower rounds for API keys (they're checked more frequently)

/**
 * Hash API key using bcrypt
 */
async function hashApiKey(apiKey) {
  return await bcrypt.hash(apiKey, BCRYPT_ROUNDS);
}

/**
 * Compare API key with hash using bcrypt
 */
async function compareApiKey(apiKey, hash) {
  return await bcrypt.compare(apiKey, hash);
}

/**
 * Create hospital
 */
export async function createHospital(hospitalData) {
  const apiKeyHash = hospitalData.apiKey 
    ? await hashApiKey(hospitalData.apiKey)
    : null;

  // Log for debugging registration
  if (hospitalData.apiKey) {
    console.log(`[REGISTRATION] Hospital ${hospitalData.hospitalId}: API key length=${hospitalData.apiKey.length}, hash generated=${!!apiKeyHash}`);
    if (apiKeyHash) {
      console.log(`[REGISTRATION] Hash prefix: ${apiKeyHash.substring(0, 20)}...`);
    }
  } else {
    console.warn(`[REGISTRATION] No API key provided for hospital ${hospitalData.hospitalId}`);
  }

  // Encrypt sensitive payment data
  const encryptedBankAccount = hospitalData.bankAccountNumber 
    ? encrypt(hospitalData.bankAccountNumber) 
    : null;
  const encryptedMobileMoney = hospitalData.mobileMoneyNumber 
    ? encrypt(hospitalData.mobileMoneyNumber) 
    : null;

  await run(
    `INSERT INTO hospitals (
      hospital_id, hedera_account_id, evm_address, encrypted_private_key, name, country, location, fhir_endpoint, 
      contact_email, registration_number, api_key_hash, verification_status, verification_documents,
      payment_method, bank_account_number, bank_name, mobile_money_provider, mobile_money_number,
      withdrawal_threshold_usd, auto_withdraw_enabled,
      registered_at, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, 'active')`,
    [
      hospitalData.hospitalId,
      hospitalData.hederaAccountId || null,
      hospitalData.evmAddress || null,
      hospitalData.encryptedPrivateKey || null,
      hospitalData.name,
      hospitalData.country,
      hospitalData.location || null,
      hospitalData.fhirEndpoint || null,
      hospitalData.contactEmail || null,
      hospitalData.registrationNumber || 'PENDING', // Default to 'PENDING' for NOT NULL constraint
      apiKeyHash,
      hospitalData.verificationStatus || 'pending',
      hospitalData.verificationDocuments || null,
      hospitalData.paymentMethod || null,
      encryptedBankAccount, // Store encrypted
      hospitalData.bankName || null,
      hospitalData.mobileMoneyProvider || null,
      encryptedMobileMoney, // Store encrypted
      hospitalData.withdrawalThresholdUSD || 100.00,
      hospitalData.autoWithdrawEnabled !== false ? 1 : 0
    ]
  );

  // Verify API key hash was stored correctly
  if (apiKeyHash) {
    const verifyHash = await get(
      `SELECT api_key_hash FROM hospitals WHERE hospital_id = ?`,
      [hospitalData.hospitalId]
    );
    if (!verifyHash || !verifyHash.api_key_hash) {
      console.error(`[REGISTRATION] ERROR: API key hash was NOT stored for hospital ${hospitalData.hospitalId}!`);
      console.error(`[REGISTRATION] Generated hash: ${apiKeyHash.substring(0, 20)}...`);
    } else {
      console.log(`[REGISTRATION] Verified: API key hash stored successfully for hospital ${hospitalData.hospitalId}`);
      console.log(`[REGISTRATION] Stored hash length: ${verifyHash.api_key_hash.length}`);
    }
  }

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
  const hospital = await get(
    `SELECT 
      hospital_id as hospitalId,
      hedera_account_id as hederaAccountId,
      evm_address as evmAddress,
      name,
      country,
      location,
      fhir_endpoint as fhirEndpoint,
      contact_email as contactEmail,
      registration_number as registrationNumber,
      payment_method as paymentMethod,
      bank_account_number as bankAccountNumber,
      bank_name as bankName,
      mobile_money_provider as mobileMoneyProvider,
      mobile_money_number as mobileMoneyNumber,
      withdrawal_threshold_usd as withdrawalThresholdUSD,
      auto_withdraw_enabled as autoWithdrawEnabled,
      last_withdrawal_at as lastWithdrawalAt,
      total_withdrawn_usd as totalWithdrawnUSD,
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
  
  // Decrypt sensitive payment data
  if (hospital) {
    if (hospital.bankAccountNumber) {
      try {
        hospital.bankAccountNumber = decrypt(hospital.bankAccountNumber);
      } catch (error) {
        // If decryption fails, might be plaintext (for migration)
        console.warn(`Failed to decrypt bank account for hospital ${hospitalId}, might be plaintext`);
      }
    }
    if (hospital.mobileMoneyNumber) {
      try {
        hospital.mobileMoneyNumber = decrypt(hospital.mobileMoneyNumber);
      } catch (error) {
        // If decryption fails, might be plaintext (for migration)
        console.warn(`Failed to decrypt mobile money number for hospital ${hospitalId}, might be plaintext`);
      }
    }
  }
  
  return hospital;
}

/**
 * Get hospital by Hedera Account ID
 */
export async function getHospitalByHederaAccount(hederaAccountId) {
  return await get(
    `SELECT 
      hospital_id as hospitalId,
      hedera_account_id as hederaAccountId,
      evm_address as evmAddress,
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
    WHERE hedera_account_id = ? AND status = 'active'`,
    [hederaAccountId]
  );
}

/**
 * Verify hospital API key using bcrypt
 */
export async function verifyHospitalApiKey(hospitalId, apiKey) {
  // Get hospital with API key hash
  // Use quoted alias to preserve case in PostgreSQL
  const hospital = await get(
    `SELECT api_key_hash as "apiKeyHash", name, status
     FROM hospitals 
     WHERE hospital_id = ?`,
    [hospitalId]
  );
  
  if (!hospital) {
    console.error(`[AUTH] Hospital ${hospitalId} not found in database`);
    return false;
  }
  
  // Debug: Log all available keys to see what PostgreSQL actually returns
  console.log(`[AUTH DEBUG] Hospital ${hospitalId} result keys:`, Object.keys(hospital));
  console.log(`[AUTH DEBUG] Hospital ${hospitalId} apiKeyHash value:`, hospital.apiKeyHash);
  console.log(`[AUTH DEBUG] Hospital ${hospitalId} api_key_hash value:`, hospital.api_key_hash);
  console.log(`[AUTH DEBUG] Hospital ${hospitalId} apikeyhash value:`, hospital.apikeyhash);
  
  if (hospital.status !== 'active') {
    console.error(`[AUTH] Hospital ${hospitalId} (${hospital.name || 'unknown'}) is not active (status: ${hospital.status})`);
    return false;
  }
  
  // Try multiple possible column names (PostgreSQL might lowercase differently)
  const apiKeyHash = hospital.apiKeyHash || hospital.api_key_hash || hospital.apikeyhash;
  
  if (!apiKeyHash) {
    console.error(`[AUTH] Hospital ${hospitalId} (${hospital.name || 'unknown'}) has no API key hash stored`);
    console.error(`[AUTH] Available keys in result:`, Object.keys(hospital));
    return false;
  }
  
  // Check if hash is bcrypt format
  const isBcryptHash = apiKeyHash.startsWith('$2a$') || 
                       apiKeyHash.startsWith('$2b$') || 
                       apiKeyHash.startsWith('$2y$');
  
  if (isBcryptHash) {
    // Use bcrypt comparison
    try {
      const isValid = await compareApiKey(apiKey, apiKeyHash);
      if (!isValid) {
        console.error(`[AUTH] API key mismatch for hospital ${hospitalId} (${hospital.name || 'unknown'})`);
        console.error(`[AUTH] Received API key length: ${apiKey?.length}, first 10 chars: ${apiKey?.substring(0, 10)}...`);
        console.error(`[AUTH] Stored hash prefix: ${apiKeyHash.substring(0, 20)}...`);
      }
      return isValid;
    } catch (error) {
      console.error(`[AUTH] Error comparing API key for hospital ${hospitalId}:`, error);
      return false;
    }
  } else {
    // Legacy SHA-256 hash - support for migration
    const crypto = await import('crypto');
    const apiKeyHashComputed = crypto.createHash('sha256').update(apiKey).digest('hex');
    const isValid = apiKeyHash.trim() === apiKeyHashComputed.trim();
    if (!isValid) {
      console.error(`[AUTH] API key mismatch for hospital ${hospitalId} (SHA-256 comparison failed)`);
    }
    return isValid;
  }
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
  if (updates.paymentMethod !== undefined) {
    fields.push('payment_method = ?');
    values.push(updates.paymentMethod);
  }
  if (updates.bankAccountNumber !== undefined) {
    fields.push('bank_account_number = ?');
    // Encrypt before storing
    const encrypted = updates.bankAccountNumber ? encrypt(updates.bankAccountNumber) : null;
    values.push(encrypted);
  }
  if (updates.bankName !== undefined) {
    fields.push('bank_name = ?');
    values.push(updates.bankName);
  }
  if (updates.mobileMoneyProvider !== undefined) {
    fields.push('mobile_money_provider = ?');
    values.push(updates.mobileMoneyProvider);
  }
  if (updates.mobileMoneyNumber !== undefined) {
    fields.push('mobile_money_number = ?');
    // Encrypt before storing
    const encrypted = updates.mobileMoneyNumber ? encrypt(updates.mobileMoneyNumber) : null;
    values.push(encrypted);
  }
  if (updates.withdrawalThresholdUSD !== undefined) {
    fields.push('withdrawal_threshold_usd = ?');
    values.push(updates.withdrawalThresholdUSD);
  }
  if (updates.autoWithdrawEnabled !== undefined) {
    fields.push('auto_withdraw_enabled = ?');
    values.push(updates.autoWithdrawEnabled ? 1 : 0);
  }
  if (updates.lastWithdrawalAt !== undefined) {
    fields.push('last_withdrawal_at = ?');
    values.push(updates.lastWithdrawalAt);
  }
  if (updates.totalWithdrawnUSD !== undefined) {
    fields.push('total_withdrawn_usd = ?');
    values.push(updates.totalWithdrawnUSD);
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
  if (updates.hederaAccountId !== undefined) {
    fields.push('hedera_account_id = ?');
    values.push(updates.hederaAccountId);
  }
  if (updates.evmAddress !== undefined) {
    fields.push('evm_address = ?');
    values.push(updates.evmAddress);
  }
  if (updates.encryptedPrivateKey !== undefined) {
    fields.push('encrypted_private_key = ?');
    values.push(updates.encryptedPrivateKey);
  }
  if (updates.registration_number !== undefined) {
    fields.push('registration_number = ?');
    values.push(updates.registration_number);
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
 * For admin view - shows all hospitals regardless of status
 */
export async function getAllHospitals() {
  const { getDatabaseType } = await import('./database.js');
  const dbType = getDatabaseType();
  
  // PostgreSQL lowercases unquoted identifiers, so we need to quote aliases
  const sql = dbType === 'postgresql'
    ? `SELECT 
        hospital_id as "hospitalId",
        hedera_account_id as "hederaAccountId",
        evm_address as "evmAddress",
        name,
        country,
        location,
        fhir_endpoint as "fhirEndpoint",
        contact_email as "contactEmail",
        registration_number as "registrationNumber",
        registered_at as "registeredAt",
        status,
        verification_status as "verificationStatus",
        verification_documents as "verificationDocuments",
        verified_at as "verifiedAt",
        verified_by as "verifiedBy"
      FROM hospitals 
      ORDER BY registered_at DESC`
    : `SELECT 
        hospital_id as hospitalId,
        hedera_account_id as hederaAccountId,
        evm_address as evmAddress,
        name,
        country,
        location,
        fhir_endpoint as fhirEndpoint,
        contact_email as contactEmail,
        registration_number as registrationNumber,
        registered_at as registeredAt,
        status,
        verification_status as verificationStatus,
        verification_documents as verificationDocuments,
        verified_at as verifiedAt,
        verified_by as verifiedBy
      FROM hospitals 
      ORDER BY registered_at DESC`;
  
  return await all(sql);
}

