/**
 * Revenue Distribution Database Operations
 * 
 * Functions for recording and querying revenue distribution payouts.
 */

import { getDatabaseType, run, all, get } from './database.js';

/**
 * Record a revenue distribution payout
 * 
 * @param {Object} payout - Payout details
 * @param {string} payout.id - Distribution ID
 * @param {string} payout.purchaseId - Purchase ID
 * @param {string} payout.patientUPI - Patient UPI (optional)
 * @param {string} payout.hospitalId - Hospital ID (optional)
 * @param {string} payout.recipientType - 'patient', 'hospital', or 'platform'
 * @param {string} payout.recipientAccountId - Hedera Account ID
 * @param {string} payout.recipientEvmAddress - EVM address (optional)
 * @param {number} payout.amountHBAR - Amount in HBAR
 * @param {number} payout.amountTinybars - Amount in tinybars
 * @param {string} payout.transactionId - Hedera transaction ID
 * @param {string} payout.distributionMethod - 'direct', 'contract-dynamic', or 'contract-fixed'
 * @param {string} payout.contractAddress - Contract address (optional)
 * @param {string} payout.status - 'pending', 'completed', or 'failed'
 * @param {string} payout.errorMessage - Error message (optional)
 */
export async function recordRevenueDistribution(payout) {
  const dbType = getDatabaseType();
  const distributionId = payout.id || `RD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
  
  if (dbType === 'postgresql') {
    await run(
      `INSERT INTO revenue_distributions (
        id, purchase_id, patient_upi, hospital_id, recipient_type, recipient_account_id,
        recipient_evm_address, amount_hbar, amount_tinybars, transaction_id,
        distribution_method, contract_address, status, error_message, distributed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_TIMESTAMP)
      ON CONFLICT (id) DO UPDATE SET
        status = EXCLUDED.status,
        error_message = EXCLUDED.error_message`,
      [
        distributionId,
        payout.purchaseId,
        payout.patientUPI || null,
        payout.hospitalId || null,
        payout.recipientType,
        payout.recipientAccountId,
        payout.recipientEvmAddress || null,
        payout.amountHBAR,
        payout.amountTinybars,
        payout.transactionId,
        payout.distributionMethod || 'direct',
        payout.contractAddress || null,
        payout.status || 'completed',
        payout.errorMessage || null
      ]
    );
  } else {
    await run(
      `INSERT OR REPLACE INTO revenue_distributions (
        id, purchase_id, patient_upi, hospital_id, recipient_type, recipient_account_id,
        recipient_evm_address, amount_hbar, amount_tinybars, transaction_id,
        distribution_method, contract_address, status, error_message, distributed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
      [
        distributionId,
        payout.purchaseId,
        payout.patientUPI || null,
        payout.hospitalId || null,
        payout.recipientType,
        payout.recipientAccountId,
        payout.recipientEvmAddress || null,
        payout.amountHBAR,
        payout.amountTinybars,
        payout.transactionId,
        payout.distributionMethod || 'direct',
        payout.contractAddress || null,
        payout.status || 'completed',
        payout.errorMessage || null
      ]
    );
  }
  
  return distributionId;
}

/**
 * Get all revenue distributions for a purchase
 * 
 * @param {string} purchaseId - Purchase ID
 * @returns {Promise<Array>} Array of distribution records
 */
export async function getRevenueDistributionsByPurchase(purchaseId) {
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    return await all(
      `SELECT 
        id,
        purchase_id as "purchaseId",
        patient_upi as "patientUPI",
        hospital_id as "hospitalId",
        recipient_type as "recipientType",
        recipient_account_id as "recipientAccountId",
        recipient_evm_address as "recipientEvmAddress",
        amount_hbar as "amountHBAR",
        amount_tinybars as "amountTinybars",
        transaction_id as "transactionId",
        distribution_method as "distributionMethod",
        contract_address as "contractAddress",
        status,
        error_message as "errorMessage",
        distributed_at as "distributedAt"
      FROM revenue_distributions
      WHERE purchase_id = $1
      ORDER BY distributed_at DESC`,
      [purchaseId]
    );
  } else {
    return await all(
      `SELECT 
        id,
        purchase_id as purchaseId,
        patient_upi as patientUPI,
        hospital_id as hospitalId,
        recipient_type as recipientType,
        recipient_account_id as recipientAccountId,
        recipient_evm_address as recipientEvmAddress,
        amount_hbar as amountHBAR,
        amount_tinybars as amountTinybars,
        transaction_id as transactionId,
        distribution_method as distributionMethod,
        contract_address as contractAddress,
        status,
        error_message as errorMessage,
        distributed_at as distributedAt
      FROM revenue_distributions
      WHERE purchase_id = ?
      ORDER BY distributed_at DESC`,
      [purchaseId]
    );
  }
}

/**
 * Get all revenue distributions for a patient
 * 
 * @param {string} patientUPI - Patient UPI
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} Array of distribution records
 */
export async function getRevenueDistributionsByPatient(patientUPI, limit = 50) {
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    return await all(
      `SELECT 
        id,
        purchase_id as "purchaseId",
        patient_upi as "patientUPI",
        hospital_id as "hospitalId",
        recipient_type as "recipientType",
        recipient_account_id as "recipientAccountId",
        recipient_evm_address as "recipientEvmAddress",
        amount_hbar as "amountHBAR",
        amount_tinybars as "amountTinybars",
        transaction_id as "transactionId",
        distribution_method as "distributionMethod",
        contract_address as "contractAddress",
        status,
        error_message as "errorMessage",
        distributed_at as "distributedAt"
      FROM revenue_distributions
      WHERE patient_upi = $1
      ORDER BY distributed_at DESC
      LIMIT $2`,
      [patientUPI, limit]
    );
  } else {
    return await all(
      `SELECT 
        id,
        purchase_id as purchaseId,
        patient_upi as patientUPI,
        hospital_id as hospitalId,
        recipient_type as recipientType,
        recipient_account_id as recipientAccountId,
        recipient_evm_address as recipientEvmAddress,
        amount_hbar as amountHBAR,
        amount_tinybars as amountTinybars,
        transaction_id as transactionId,
        distribution_method as distributionMethod,
        contract_address as contractAddress,
        status,
        error_message as errorMessage,
        distributed_at as distributedAt
      FROM revenue_distributions
      WHERE patient_upi = ?
      ORDER BY distributed_at DESC
      LIMIT ?`,
      [patientUPI, limit]
    );
  }
}

/**
 * Get all revenue distributions for a hospital
 * 
 * @param {string} hospitalId - Hospital ID
 * @param {number} limit - Maximum number of records to return
 * @returns {Promise<Array>} Array of distribution records
 */
export async function getRevenueDistributionsByHospital(hospitalId, limit = 50) {
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    return await all(
      `SELECT 
        id,
        purchase_id as "purchaseId",
        patient_upi as "patientUPI",
        hospital_id as "hospitalId",
        recipient_type as "recipientType",
        recipient_account_id as "recipientAccountId",
        recipient_evm_address as "recipientEvmAddress",
        amount_hbar as "amountHBAR",
        amount_tinybars as "amountTinybars",
        transaction_id as "transactionId",
        distribution_method as "distributionMethod",
        contract_address as "contractAddress",
        status,
        error_message as "errorMessage",
        distributed_at as "distributedAt"
      FROM revenue_distributions
      WHERE hospital_id = $1
      ORDER BY distributed_at DESC
      LIMIT $2`,
      [hospitalId, limit]
    );
  } else {
    return await all(
      `SELECT 
        id,
        purchase_id as purchaseId,
        patient_upi as patientUPI,
        hospital_id as hospitalId,
        recipient_type as recipientType,
        recipient_account_id as recipientAccountId,
        recipient_evm_address as recipientEvmAddress,
        amount_hbar as amountHBAR,
        amount_tinybars as amountTinybars,
        transaction_id as transactionId,
        distribution_method as distributionMethod,
        contract_address as contractAddress,
        status,
        error_message as errorMessage,
        distributed_at as distributedAt
      FROM revenue_distributions
      WHERE hospital_id = ?
      ORDER BY distributed_at DESC
      LIMIT ?`,
      [hospitalId, limit]
    );
  }
}

/**
 * Get all revenue distributions (admin view)
 * 
 * @param {number} limit - Maximum number of records to return
 * @param {number} offset - Offset for pagination
 * @returns {Promise<Array>} Array of distribution records
 */
export async function getAllRevenueDistributions(limit = 100, offset = 0) {
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    return await all(
      `SELECT 
        id,
        purchase_id as "purchaseId",
        patient_upi as "patientUPI",
        hospital_id as "hospitalId",
        recipient_type as "recipientType",
        recipient_account_id as "recipientAccountId",
        recipient_evm_address as "recipientEvmAddress",
        amount_hbar as "amountHBAR",
        amount_tinybars as "amountTinybars",
        transaction_id as "transactionId",
        distribution_method as "distributionMethod",
        contract_address as "contractAddress",
        status,
        error_message as "errorMessage",
        distributed_at as "distributedAt"
      FROM revenue_distributions
      ORDER BY distributed_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );
  } else {
    return await all(
      `SELECT 
        id,
        purchase_id as purchaseId,
        patient_upi as patientUPI,
        hospital_id as hospitalId,
        recipient_type as recipientType,
        recipient_account_id as recipientAccountId,
        recipient_evm_address as recipientEvmAddress,
        amount_hbar as amountHBAR,
        amount_tinybars as amountTinybars,
        transaction_id as transactionId,
        distribution_method as distributionMethod,
        contract_address as contractAddress,
        status,
        error_message as errorMessage,
        distributed_at as distributedAt
      FROM revenue_distributions
      ORDER BY distributed_at DESC
      LIMIT ? OFFSET ?`,
      [limit, offset]
    );
  }
}

/**
 * Get revenue distribution statistics
 * 
 * @returns {Promise<Object>} Statistics object
 */
export async function getRevenueDistributionStats() {
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    const stats = await get(
      `SELECT 
        COUNT(*) as "totalDistributions",
        COUNT(DISTINCT purchase_id) as "totalPurchases",
        COUNT(DISTINCT patient_upi) FILTER (WHERE patient_upi IS NOT NULL) as "totalPatients",
        COUNT(DISTINCT hospital_id) FILTER (WHERE hospital_id IS NOT NULL) as "totalHospitals",
        SUM(amount_hbar) FILTER (WHERE status = 'completed') as "totalDistributedHBAR",
        SUM(amount_hbar) FILTER (WHERE recipient_type = 'patient' AND status = 'completed') as "totalPatientHBAR",
        SUM(amount_hbar) FILTER (WHERE recipient_type = 'hospital' AND status = 'completed') as "totalHospitalHBAR",
        SUM(amount_hbar) FILTER (WHERE recipient_type = 'platform' AND status = 'completed') as "totalPlatformHBAR",
        COUNT(*) FILTER (WHERE status = 'failed') as "failedDistributions"
      FROM revenue_distributions`,
      []
    );
    return stats;
  } else {
    const stats = await get(
      `SELECT 
        COUNT(*) as totalDistributions,
        COUNT(DISTINCT purchase_id) as totalPurchases,
        COUNT(DISTINCT patient_upi) as totalPatients,
        COUNT(DISTINCT hospital_id) as totalHospitals,
        SUM(CASE WHEN status = 'completed' THEN amount_hbar ELSE 0 END) as totalDistributedHBAR,
        SUM(CASE WHEN recipient_type = 'patient' AND status = 'completed' THEN amount_hbar ELSE 0 END) as totalPatientHBAR,
        SUM(CASE WHEN recipient_type = 'hospital' AND status = 'completed' THEN amount_hbar ELSE 0 END) as totalHospitalHBAR,
        SUM(CASE WHEN recipient_type = 'platform' AND status = 'completed' THEN amount_hbar ELSE 0 END) as totalPlatformHBAR,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failedDistributions
      FROM revenue_distributions`,
      []
    );
    return stats;
  }
}

