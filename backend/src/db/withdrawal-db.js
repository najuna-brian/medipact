/**
 * Withdrawal Database Operations
 * 
 * CRUD operations for withdrawal history.
 */

import { run, get, all } from './database.js';

/**
 * Create withdrawal record
 */
export async function createWithdrawal(withdrawalData) {
  const { upi, hospitalId, userType, amountHBAR, amountUSD, paymentMethod, destinationAccount, transactionId, status } = withdrawalData;
  
  await run(
    `INSERT INTO withdrawal_history (
      upi, hospital_id, user_type, amount_hbar, amount_usd, 
      payment_method, destination_account, transaction_id, status, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
    [upi || null, hospitalId || null, userType, amountHBAR, amountUSD, paymentMethod, destinationAccount, transactionId || null, status || 'pending']
  );
  
  return withdrawalData;
}

/**
 * Get withdrawal by ID
 */
export async function getWithdrawal(withdrawalId) {
  const withdrawal = await get(
    `SELECT 
      id,
      upi,
      hospital_id as hospitalId,
      user_type as userType,
      amount_hbar as amountHBAR,
      amount_usd as amountUSD,
      payment_method as paymentMethod,
      destination_account as destinationAccount,
      transaction_id as transactionId,
      status,
      processed_at as processedAt,
      created_at as createdAt
     FROM withdrawal_history 
     WHERE id = ?`,
    [withdrawalId]
  );
  return withdrawal;
}

/**
 * Get withdrawals for a patient
 */
export async function getPatientWithdrawals(upi, limit = 50) {
  const withdrawals = await all(
    `SELECT 
      id,
      upi,
      hospital_id as hospitalId,
      user_type as userType,
      amount_hbar as amountHBAR,
      amount_usd as amountUSD,
      payment_method as paymentMethod,
      destination_account as destinationAccount,
      transaction_id as transactionId,
      status,
      processed_at as processedAt,
      created_at as createdAt
     FROM withdrawal_history 
     WHERE upi = ? 
     ORDER BY created_at DESC 
     LIMIT ?`,
    [upi, limit]
  );
  return withdrawals;
}

/**
 * Get withdrawals for a hospital
 */
export async function getHospitalWithdrawals(hospitalId, limit = 50) {
  const withdrawals = await all(
    `SELECT 
      id,
      upi,
      hospital_id as hospitalId,
      user_type as userType,
      amount_hbar as amountHBAR,
      amount_usd as amountUSD,
      payment_method as paymentMethod,
      destination_account as destinationAccount,
      transaction_id as transactionId,
      status,
      processed_at as processedAt,
      created_at as createdAt
     FROM withdrawal_history 
     WHERE hospital_id = ? 
     ORDER BY created_at DESC 
     LIMIT ?`,
    [hospitalId, limit]
  );
  return withdrawals;
}

/**
 * Get pending withdrawals
 */
export async function getPendingWithdrawals(limit = 100) {
  const withdrawals = await all(
    `SELECT 
      id,
      upi,
      hospital_id as hospitalId,
      user_type as userType,
      amount_hbar as amountHBAR,
      amount_usd as amountUSD,
      payment_method as paymentMethod,
      destination_account as destinationAccount,
      transaction_id as transactionId,
      status,
      processed_at as processedAt,
      created_at as createdAt
     FROM withdrawal_history 
     WHERE status IN ('pending', 'processing')
     ORDER BY created_at ASC 
     LIMIT ?`,
    [limit]
  );
  return withdrawals;
}

/**
 * Update withdrawal status
 */
export async function updateWithdrawalStatus(withdrawalId, status, transactionId = null, processedAt = null) {
  const fields = ['status = ?'];
  const values = [status];
  
  if (transactionId) {
    fields.push('transaction_id = ?');
    values.push(transactionId);
  }
  
  if (processedAt) {
    fields.push('processed_at = ?');
    values.push(processedAt);
  } else if (status === 'completed' || status === 'failed') {
    fields.push('processed_at = CURRENT_TIMESTAMP');
  }
  
  values.push(withdrawalId);
  
  await run(
    `UPDATE withdrawal_history SET ${fields.join(', ')} WHERE id = ?`,
    values
  );
  
  return await getWithdrawal(withdrawalId);
}

/**
 * Get withdrawal history for a user (patient or hospital)
 */
export async function getWithdrawalHistoryForUser(upiOrHospitalId, userType, limit = 100, offset = 0) {
  const column = userType === 'patient' ? 'upi' : 'hospital_id';
  const withdrawals = await all(
    `SELECT 
      id,
      upi,
      hospital_id as hospitalId,
      user_type as userType,
      amount_hbar as amountHBAR,
      amount_usd as amountUSD,
      payment_method as paymentMethod,
      destination_account as destinationAccount,
      transaction_id as transactionId,
      status,
      processed_at as processedAt,
      created_at as createdAt
     FROM withdrawal_history 
     WHERE ${column} = ? 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [upiOrHospitalId, limit, offset]
  );
  return withdrawals;
}

