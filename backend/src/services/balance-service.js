/**
 * Balance Service
 * 
 * Queries Hedera account balances and converts to USD.
 * Provides balance information for patients and hospitals.
 */

import { AccountBalanceQuery, AccountId, Hbar } from '@hashgraph/sdk';
import { createHederaClient } from './hedera-client.js';
import { getPatient } from '../db/patient-db.js';
import { getHospital } from '../db/hospital-db.js';
import { hbarToUSD } from './pricing-service.js';

/**
 * Get account balance for a patient
 * 
 * @param {string} upi - Patient UPI
 * @returns {Promise<{balanceHBAR: number, balanceUSD: number, hederaAccountId: string, evmAddress: string}>}
 */
export async function getPatientBalance(upi) {
  const patient = await getPatient(upi);
  
  if (!patient) {
    throw new Error(`Patient with UPI ${upi} not found`);
  }
  
  if (!patient.hederaAccountId) {
    // Account should exist (created during registration)
    // Return zero balance if account doesn't exist
    return {
      balanceHBAR: 0,
      balanceUSD: 0,
      hederaAccountId: null,
      evmAddress: null
    };
  }
  
  return await getAccountBalance(patient.hederaAccountId, patient.evmAddress);
}

/**
 * Get account balance for a hospital
 * 
 * @param {string} hospitalId - Hospital ID
 * @returns {Promise<{balanceHBAR: number, balanceUSD: number, hederaAccountId: string, evmAddress: string}>}
 */
export async function getHospitalBalance(hospitalId) {
  const hospital = await getHospital(hospitalId);
  
  if (!hospital) {
    throw new Error(`Hospital ${hospitalId} not found`);
  }
  
  if (!hospital.hederaAccountId) {
    return {
      balanceHBAR: 0,
      balanceUSD: 0,
      hederaAccountId: null,
      evmAddress: null
    };
  }
  
  return await getAccountBalance(hospital.hederaAccountId, hospital.evmAddress);
}

/**
 * Get account balance from Hedera
 * 
 * @param {string} hederaAccountId - Hedera Account ID (0.0.xxxxx)
 * @param {string} evmAddress - EVM address (optional)
 * @returns {Promise<{balanceHBAR: number, balanceUSD: number, hederaAccountId: string, evmAddress: string}>}
 */
export async function getAccountBalance(hederaAccountId, evmAddress = null) {
  const client = createHederaClient();
  
  try {
    const accountId = AccountId.fromString(hederaAccountId);
    
    // Query account balance
    const balance = await new AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(client);
    
    // Convert tinybars to HBAR
    const balanceHBAR = Number(balance.hbars.toTinybars()) / 100000000;
    
    // Convert to USD (async)
    const balanceUSD = await hbarToUSD(balanceHBAR);
    
    return {
      balanceHBAR,
      balanceUSD,
      hederaAccountId,
      evmAddress: evmAddress || null
    };
  } catch (error) {
    console.error(`Error querying balance for account ${hederaAccountId}:`, error);
    throw new Error(`Failed to query account balance: ${error.message}`);
  } finally {
    client.close();
  }
}

/**
 * Get balance with payment method info for patient
 * 
 * @param {string} upi - Patient UPI
 * @returns {Promise<Object>}
 */
export async function getPatientBalanceWithDetails(upi) {
  const patient = await getPatient(upi);
  
  if (!patient) {
    throw new Error(`Patient with UPI ${upi} not found`);
  }
  
  const balance = await getPatientBalance(upi);
  
  return {
    ...balance,
    paymentMethod: patient.paymentMethod || null,
    bankAccountNumber: patient.bankAccountNumber || null,
    bankName: patient.bankName || null,
    mobileMoneyProvider: patient.mobileMoneyProvider || null,
    mobileMoneyNumber: patient.mobileMoneyNumber || null,
    withdrawalThresholdUSD: patient.withdrawalThresholdUSD || 10.00,
    autoWithdrawEnabled: patient.autoWithdrawEnabled !== false, // Default true
    lastWithdrawalAt: patient.lastWithdrawalAt || null,
    totalWithdrawnUSD: patient.totalWithdrawnUSD || 0.00
  };
}

/**
 * Get balance with payment method info for hospital
 * 
 * @param {string} hospitalId - Hospital ID
 * @returns {Promise<Object>}
 */
export async function getHospitalBalanceWithDetails(hospitalId) {
  const hospital = await getHospital(hospitalId);
  
  if (!hospital) {
    throw new Error(`Hospital ${hospitalId} not found`);
  }
  
  const balance = await getHospitalBalance(hospitalId);
  
  return {
    ...balance,
    paymentMethod: hospital.paymentMethod || null,
    bankAccountNumber: hospital.bankAccountNumber || null,
    bankName: hospital.bankName || null,
    mobileMoneyProvider: hospital.mobileMoneyProvider || null,
    mobileMoneyNumber: hospital.mobileMoneyNumber || null,
    withdrawalThresholdUSD: hospital.withdrawalThresholdUSD || 100.00,
    autoWithdrawEnabled: hospital.autoWithdrawEnabled !== false, // Default true
    lastWithdrawalAt: hospital.lastWithdrawalAt || null,
    totalWithdrawnUSD: hospital.totalWithdrawnUSD || 0.00
  };
}

/**
 * Get account balance for a researcher
 * 
 * @param {string} researcherId - Researcher ID
 * @returns {Promise<{balanceHBAR: number, balanceUSD: number, hederaAccountId: string, evmAddress: string}>}
 */
export async function getResearcherBalance(researcherId) {
  const { getResearcher } = await import('../db/researcher-db.js');
  const researcher = await getResearcher(researcherId);
  
  if (!researcher) {
    throw new Error(`Researcher ${researcherId} not found`);
  }
  
  if (!researcher.hederaAccountId) {
    // Account should exist (created during registration)
    // Return zero balance if account doesn't exist
    return {
      balanceHBAR: 0,
      balanceUSD: 0,
      hederaAccountId: null,
      evmAddress: null
    };
  }
  
  return await getAccountBalance(researcher.hederaAccountId, researcher.evmAddress);
}

/**
 * Get balance with details for researcher
 * 
 * @param {string} researcherId - Researcher ID
 * @returns {Promise<Object>}
 */
export async function getResearcherBalanceWithDetails(researcherId) {
  const { getResearcher } = await import('../db/researcher-db.js');
  const researcher = await getResearcher(researcherId);
  
  if (!researcher) {
    throw new Error(`Researcher ${researcherId} not found`);
  }
  
  const balance = await getResearcherBalance(researcherId);
  
  return {
    ...balance,
    // Researchers don't have withdrawal settings (they pay, not receive)
    paymentMethod: null,
    bankAccountNumber: null,
    bankName: null,
    mobileMoneyProvider: null,
    mobileMoneyNumber: null,
    withdrawalThresholdUSD: 0,
    autoWithdrawEnabled: false,
    lastWithdrawalAt: null,
    totalWithdrawnUSD: 0
  };
}

/**
 * Get platform account balance
 * 
 * @returns {Promise<{balanceHBAR: number, balanceUSD: number, hederaAccountId: string}>}
 */
export async function getPlatformBalance() {
  const platformAccountId = process.env.PLATFORM_HEDERA_ACCOUNT_ID || process.env.OPERATOR_ID;
  
  if (!platformAccountId) {
    return {
      balanceHBAR: 0,
      balanceUSD: 0,
      hederaAccountId: null
    };
  }
  
  return await getAccountBalance(platformAccountId);
}

