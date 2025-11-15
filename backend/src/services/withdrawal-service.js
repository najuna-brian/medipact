/**
 * Withdrawal Service
 * 
 * Handles automatic and manual withdrawals from Hedera accounts
 * to bank accounts or mobile money.
 */

import { TransferTransaction, AccountId, Hbar } from '@hashgraph/sdk';
import { createHederaClient } from './hedera-client.js';
import { decrypt } from './encryption-service.js';
import { getPatient } from '../db/patient-db.js';
import { getHospital } from '../db/hospital-db.js';
import { updatePatient } from '../db/patient-db.js';
import { updateHospital } from '../db/hospital-db.js';
import { createWithdrawal, updateWithdrawalStatus, getWithdrawal } from '../db/withdrawal-db.js';
import { getPatientBalance, getHospitalBalance } from './balance-service.js';
import { usdToHBAR } from './pricing-service.js';
import { sendWithdrawalNotification, sendBalanceThresholdNotification } from './notification-service.js';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000; // 5 seconds
const MAX_RETRY_DELAY_MS = 60000; // 1 minute

/**
 * Retry helper with exponential backoff
 */
async function retryWithBackoff(fn, maxRetries = MAX_RETRIES, delay = RETRY_DELAY_MS) {
  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries) {
        const backoffDelay = Math.min(delay * Math.pow(2, attempt - 1), MAX_RETRY_DELAY_MS);
        console.warn(`[RETRY] Attempt ${attempt}/${maxRetries} failed, retrying in ${backoffDelay}ms:`, error.message);
        await new Promise(resolve => setTimeout(resolve, backoffDelay));
      }
    }
  }
  throw lastError;
}

/**
 * Process automatic withdrawals for users with balance above threshold
 */
export async function processAutomaticWithdrawals() {
  const { getAllPatientsWithAutoWithdraw, getAllHospitalsWithAutoWithdraw } = await import('../db/balance-db.js');
  
  const results = {
    processed: 0,
    skipped: 0,
    errors: []
  };
  
  try {
    // Get all patients with auto-withdraw enabled
    const patients = await getAllPatientsWithAutoWithdraw();
    
    for (const patient of patients) {
      try {
        // Check balance
        const balance = await getPatientBalance(patient.upi);
        
        // Check if balance meets threshold
        if (balance.balanceUSD >= (patient.withdrawalThresholdUSD || 10.00)) {
          // Send threshold notification if balance just reached threshold
          try {
            await sendBalanceThresholdNotification(
              'patient',
              patient.upi,
              patient.email,
              patient.phone,
              balance.balanceUSD,
              patient.withdrawalThresholdUSD || 10.00
            );
          } catch (error) {
            console.error('Failed to send threshold notification:', error);
          }
          
          // Initiate withdrawal
          await initiatePatientWithdrawal(patient.upi);
          results.processed++;
        } else {
          results.skipped++;
        }
      } catch (error) {
        console.error(`Error processing withdrawal for patient ${patient.upi}:`, error);
        results.errors.push({ type: 'patient', id: patient.upi, error: error.message });
      }
    }
    
    // Get all hospitals with auto-withdraw enabled
    const hospitals = await getAllHospitalsWithAutoWithdraw();
    
    for (const hospital of hospitals) {
      // Skip if hospitalId is missing
      if (!hospital || !hospital.hospitalId) {
        console.warn(`[WITHDRAWAL] Skipping hospital with missing hospitalId:`, hospital);
        continue;
      }
      
      try {
        // Check balance
        const balance = await getHospitalBalance(hospital.hospitalId);
        
        // Check if balance meets threshold
        if (balance.balanceUSD >= (hospital.withdrawalThresholdUSD || 100.00)) {
          // Send threshold notification
          try {
            await sendBalanceThresholdNotification(
              'hospital',
              hospital.hospitalId,
              hospital.contactEmail,
              null,
              balance.balanceUSD,
              hospital.withdrawalThresholdUSD || 100.00
            );
          } catch (error) {
            console.error('Failed to send threshold notification:', error);
          }
          
          // Initiate withdrawal
          await initiateHospitalWithdrawal(hospital.hospitalId);
          results.processed++;
        } else {
          results.skipped++;
        }
      } catch (error) {
        console.error(`Error processing withdrawal for hospital ${hospital.hospitalId}:`, error);
        results.errors.push({ type: 'hospital', id: hospital.hospitalId, error: error.message });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error processing automatic withdrawals:', error);
    throw error;
  }
}

/**
 * Initiate withdrawal for a patient
 * 
 * @param {string} upi - Patient UPI
 * @param {number} amountUSD - Amount to withdraw in USD (optional, if not provided, withdraws all)
 * @returns {Promise<Object>}
 */
export async function initiatePatientWithdrawal(upi, amountUSD = null) {
  const patient = await getPatient(upi);
  
  if (!patient) {
    throw new Error(`Patient with UPI ${upi} not found`);
  }
  
  if (!patient.hederaAccountId) {
    throw new Error('Patient does not have a Hedera account yet');
  }
  
  if (!patient.paymentMethod) {
    throw new Error('Patient has not configured a payment method');
  }
  
  // Get current balance
  const balance = await getPatientBalance(upi);
  
  if (balance.balanceUSD <= 0) {
    throw new Error('Insufficient balance');
  }
  
  // Determine withdrawal amount
  const withdrawAmountUSD = amountUSD || balance.balanceUSD;
  
  if (withdrawAmountUSD > balance.balanceUSD) {
    throw new Error('Insufficient balance for requested amount');
  }
  
  // Convert USD to HBAR (using current exchange rate)
  const withdrawAmountHBAR = await usdToHBAR(withdrawAmountUSD);
  
  // Get destination account
  const destinationAccount = patient.paymentMethod === 'bank' 
    ? patient.bankAccountNumber 
    : patient.mobileMoneyNumber;
  
  if (!destinationAccount) {
    throw new Error('Payment destination account not configured');
  }
  
  // Create withdrawal record
  const withdrawal = await createWithdrawal({
    upi,
    hospitalId: null,
    userType: 'patient',
    amountHBAR: withdrawAmountHBAR,
    amountUSD: withdrawAmountUSD,
    paymentMethod: patient.paymentMethod,
    destinationAccount,
    status: 'pending'
  });
  
  // Process withdrawal (this would integrate with payment gateway)
  // For now, we'll mark it as processing and return
  // In production, you'd:
  // 1. Convert HBAR to fiat via exchange
  // 2. Send to bank/mobile money via payment gateway
  // 3. Update withdrawal status
  
  try {
    // TODO: Integrate with payment gateway (Flutterwave, Paystack, etc.)
    // For now, we'll simulate the process
    
    // Update withdrawal status to processing
    await updateWithdrawalStatus(withdrawal.id, 'processing');
    
    // In production, you'd:
    // - Convert HBAR to fiat
    // - Send to bank/mobile money
    // - Update status to 'completed' or 'failed'
    
    // For now, we'll leave it as 'processing' - admin can complete manually
    
    return {
      withdrawalId: withdrawal.id,
      amountUSD: withdrawAmountUSD,
      amountHBAR: withdrawAmountHBAR,
      paymentMethod: patient.paymentMethod,
      destinationAccount: destinationAccount.replace(/(.{4})(.*)(.{4})/, '$1****$3'), // Mask account
      status: 'processing',
      message: 'Withdrawal initiated. It will be processed shortly.'
    };
  } catch (error) {
    await updateWithdrawalStatus(withdrawal.id, 'failed');
    throw error;
  }
}

/**
 * Initiate withdrawal for a hospital
 * 
 * @param {string} hospitalId - Hospital ID
 * @param {number} amountUSD - Amount to withdraw in USD (optional)
 * @returns {Promise<Object>}
 */
export async function initiateHospitalWithdrawal(hospitalId, amountUSD = null) {
  const hospital = await getHospital(hospitalId);
  
  if (!hospital) {
    throw new Error(`Hospital ${hospitalId} not found`);
  }
  
  if (!hospital.hederaAccountId) {
    throw new Error('Hospital does not have a Hedera account yet');
  }
  
  if (!hospital.paymentMethod) {
    throw new Error('Hospital has not configured a payment method');
  }
  
  // Get current balance
  const balance = await getHospitalBalance(hospitalId);
  
  if (balance.balanceUSD <= 0) {
    throw new Error('Insufficient balance');
  }
  
  // Determine withdrawal amount
  const withdrawAmountUSD = amountUSD || balance.balanceUSD;
  
  if (withdrawAmountUSD > balance.balanceUSD) {
    throw new Error('Insufficient balance for requested amount');
  }
  
  // Convert USD to HBAR (using current exchange rate)
  const withdrawAmountHBAR = await usdToHBAR(withdrawAmountUSD);
  
  // Get destination account
  const destinationAccount = hospital.paymentMethod === 'bank' 
    ? hospital.bankAccountNumber 
    : hospital.mobileMoneyNumber;
  
  if (!destinationAccount) {
    throw new Error('Payment destination account not configured');
  }
  
  // Create withdrawal record
  const withdrawal = await createWithdrawal({
    upi: null,
    hospitalId,
    userType: 'hospital',
    amountHBAR: withdrawAmountHBAR,
    amountUSD: withdrawAmountUSD,
    paymentMethod: hospital.paymentMethod,
    destinationAccount,
    status: 'pending'
  });
  
  try {
    // Update withdrawal status to processing
    await updateWithdrawalStatus(withdrawal.id, 'processing');
    
    // Send processing notification
    try {
      await sendWithdrawalNotification({
        userType: 'hospital',
        userId: hospitalId,
        email: hospital.contactEmail,
        phone: null,
        status: 'processing',
        withdrawal: { ...withdrawal, status: 'processing' }
      });
    } catch (error) {
      console.error('Failed to send processing notification:', error);
    }
    
    return {
      withdrawalId: withdrawal.id,
      amountUSD: withdrawAmountUSD,
      amountHBAR: withdrawAmountHBAR,
      paymentMethod: hospital.paymentMethod,
      destinationAccount: destinationAccount.replace(/(.{4})(.*)(.{4})/, '$1****$3'),
      status: 'processing',
      message: 'Withdrawal initiated. It will be processed shortly.'
    };
  } catch (error) {
    await updateWithdrawalStatus(withdrawal.id, 'failed');
    throw error;
  }
}

/**
 * Complete a withdrawal (called by admin after processing payment)
 */
export async function completeWithdrawal(withdrawalId, transactionId = null) {
  const withdrawal = await updateWithdrawalStatus(
    withdrawalId, 
    'completed', 
    transactionId,
    new Date().toISOString()
  );
  
  // Update user's last withdrawal and total withdrawn
  if (withdrawal.userType === 'patient' && withdrawal.upi) {
    const patient = await getPatient(withdrawal.upi);
    await updatePatient(withdrawal.upi, {
      lastWithdrawalAt: new Date().toISOString(),
      totalWithdrawnUSD: (patient.totalWithdrawnUSD || 0) + withdrawal.amountUSD
    });
    
    // Send completion notification
    try {
      await sendWithdrawalNotification({
        userType: 'patient',
        userId: withdrawal.upi,
        email: patient.email,
        phone: patient.phone,
        status: 'completed',
        withdrawal: { ...withdrawal, transactionId }
      });
    } catch (error) {
      console.error('Failed to send completion notification:', error);
    }
  } else if (withdrawal.userType === 'hospital' && withdrawal.hospitalId) {
    const hospital = await getHospital(withdrawal.hospitalId);
    await updateHospital(withdrawal.hospitalId, {
      lastWithdrawalAt: new Date().toISOString(),
      totalWithdrawnUSD: (hospital.totalWithdrawnUSD || 0) + withdrawal.amountUSD
    });
    
    // Send completion notification
    try {
      await sendWithdrawalNotification({
        userType: 'hospital',
        userId: withdrawal.hospitalId,
        email: hospital.contactEmail,
        phone: null,
        status: 'completed',
        withdrawal: { ...withdrawal, transactionId }
      });
    } catch (error) {
      console.error('Failed to send completion notification:', error);
    }
  }
  
  return withdrawal;
}

/**
 * Check if user should have automatic withdrawal (balance >= threshold)
 */
export async function shouldAutoWithdraw(upi = null, hospitalId = null) {
  if (upi) {
    const patient = await getPatient(upi);
    if (!patient || !patient.autoWithdrawEnabled || !patient.paymentMethod) {
      return false;
    }
    const balance = await getPatientBalance(upi);
    return balance.balanceUSD >= (patient.withdrawalThresholdUSD || 10.00);
  } else if (hospitalId) {
    const hospital = await getHospital(hospitalId);
    if (!hospital || !hospital.autoWithdrawEnabled || !hospital.paymentMethod) {
      return false;
    }
    const balance = await getHospitalBalance(hospitalId);
    return balance.balanceUSD >= (hospital.withdrawalThresholdUSD || 100.00);
  }
  return false;
}

/**
 * Retry failed withdrawals
 * Can be called manually by admin or scheduled
 */
export async function retryFailedWithdrawals(limit = 10) {
  const { all } = await import('../db/database.js');
  const failedWithdrawals = await all(
    `SELECT * FROM withdrawal_history 
     WHERE status = 'failed' 
     ORDER BY created_at DESC 
     LIMIT ?`,
    [limit]
  );

  const results = {
    attempted: 0,
    succeeded: 0,
    failed: 0,
    errors: []
  };

  for (const withdrawal of failedWithdrawals) {
    results.attempted++;
    try {
      if (withdrawal.user_type === 'patient' && withdrawal.upi) {
        await initiatePatientWithdrawal(withdrawal.upi, withdrawal.amount_usd);
      } else if (withdrawal.user_type === 'hospital' && withdrawal.hospital_id) {
        await initiateHospitalWithdrawal(withdrawal.hospital_id, withdrawal.amount_usd);
      }
      results.succeeded++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        withdrawalId: withdrawal.id,
        error: error.message
      });
      console.error(`[RETRY] Failed to retry withdrawal ${withdrawal.id}:`, error);
    }
  }

  return results;
}

