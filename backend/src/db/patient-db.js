/**
 * Patient Database Operations
 * 
 * CRUD operations for patient identities.
 */

import { run, get, all } from './database.js';
import { encrypt, decrypt } from '../services/encryption-service.js';

/**
 * Create patient identity
 */
export async function createPatient(upi, patientData = {}) {
  // Encrypt sensitive payment data
  const encryptedBankAccount = patientData.bankAccountNumber 
    ? encrypt(patientData.bankAccountNumber) 
    : null;
  const encryptedMobileMoney = patientData.mobileMoneyNumber 
    ? encrypt(patientData.mobileMoneyNumber) 
    : null;

  await run(
    `INSERT INTO patient_identities (
      upi, hedera_account_id, evm_address, encrypted_private_key,
      payment_method, bank_account_number, bank_name, mobile_money_provider, mobile_money_number,
      withdrawal_threshold_usd, auto_withdraw_enabled,
      created_at, last_updated, status
    )
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'active')`,
    [
      upi, 
      patientData.hederaAccountId || null, 
      patientData.evmAddress || null, 
      patientData.encryptedPrivateKey || null,
      patientData.paymentMethod || null,
      encryptedBankAccount, // Store encrypted
      patientData.bankName || null,
      patientData.mobileMoneyProvider || null,
      encryptedMobileMoney, // Store encrypted
      patientData.withdrawalThresholdUSD || 10.00,
      patientData.autoWithdrawEnabled !== false ? 1 : 0
    ]
  );
  return { 
    upi, 
    hederaAccountId: patientData.hederaAccountId,
    evmAddress: patientData.evmAddress,
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
      evm_address as evmAddress,
      payment_method as paymentMethod,
      bank_account_number as bankAccountNumber,
      bank_name as bankName,
      mobile_money_provider as mobileMoneyProvider,
      mobile_money_number as mobileMoneyNumber,
      withdrawal_threshold_usd as withdrawalThresholdUSD,
      auto_withdraw_enabled as autoWithdrawEnabled,
      last_withdrawal_at as lastWithdrawalAt,
      total_withdrawn_usd as totalWithdrawnUSD,
      created_at as createdAt,
      last_updated as lastUpdated,
      status
     FROM patient_identities 
     WHERE upi = ? AND status = 'active'`,
    [upi]
  );
  
  // Decrypt sensitive payment data
  if (patient) {
    if (patient.bankAccountNumber) {
      try {
        patient.bankAccountNumber = decrypt(patient.bankAccountNumber);
      } catch (error) {
        // If decryption fails, might be plaintext (for migration)
        console.warn(`Failed to decrypt bank account for patient ${upi}, might be plaintext`);
      }
    }
    if (patient.mobileMoneyNumber) {
      try {
        patient.mobileMoneyNumber = decrypt(patient.mobileMoneyNumber);
      } catch (error) {
        // If decryption fails, might be plaintext (for migration)
        console.warn(`Failed to decrypt mobile money number for patient ${upi}, might be plaintext`);
      }
    }
  }
  
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
      evm_address as evmAddress,
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

  if (updates.evmAddress !== undefined) {
    fields.push('evm_address = ?');
    values.push(updates.evmAddress);
  }

  if (updates.encryptedPrivateKey) {
    fields.push('encrypted_private_key = ?');
    values.push(updates.encryptedPrivateKey);
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

/**
 * Update patient account (alias for updatePatient)
 */
export async function updatePatientAccount(upi, updates) {
  return await updatePatient(upi, updates);
}

