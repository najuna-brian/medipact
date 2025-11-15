/**
 * Balance Database Operations
 * 
 * Helper functions for querying users with balances.
 */

import { all } from './database.js';

/**
 * Get all patients with balance above threshold
 * Note: This requires checking Hedera balances, so it's a helper for the service layer
 */
export async function getAllPatientsWithAutoWithdraw() {
  const patients = await all(
    `SELECT 
      upi,
      hedera_account_id as hederaAccountId,
      payment_method as paymentMethod,
      withdrawal_threshold_usd as withdrawalThresholdUSD,
      auto_withdraw_enabled as autoWithdrawEnabled
     FROM patient_identities 
     WHERE status = 'active' 
       AND auto_withdraw_enabled = true
       AND payment_method IS NOT NULL
       AND hedera_account_id IS NOT NULL`
  );
  return patients;
}

/**
 * Get all hospitals with balance above threshold
 */
export async function getAllHospitalsWithAutoWithdraw() {
  const hospitals = await all(
    `SELECT 
      hospital_id as hospitalId,
      hedera_account_id as hederaAccountId,
      payment_method as paymentMethod,
      withdrawal_threshold_usd as withdrawalThresholdUSD,
      auto_withdraw_enabled as autoWithdrawEnabled,
      contact_email as contactEmail
     FROM hospitals 
     WHERE status = 'active' 
       AND auto_withdraw_enabled = true
       AND payment_method IS NOT NULL
       AND hedera_account_id IS NOT NULL`
  );
  
  // Filter out any invalid hospitals
  return hospitals.filter(h => h && h.hospitalId);
}

