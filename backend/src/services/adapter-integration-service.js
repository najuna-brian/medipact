/**
 * Adapter Integration Service
 * 
 * Integrates the MediPact adapter with the backend for revenue distribution.
 * Uses Hedera Account IDs from the database for revenue splits.
 */

import { distributeRevenue } from './revenue-distribution-service.js';
import { getPatient } from '../db/patient-db.js';
import { getHospital } from '../db/hospital-db.js';
import { Hbar } from '@hashgraph/sdk';

/**
 * Distribute revenue from data sale using patient UPI and hospital ID
 * 
 * @param {Object} params
 *   - patientUPI: string - Patient UPI
 *   - hospitalId: string - Hospital ID
 *   - totalAmount: number - Total revenue in tinybars
 *   - revenueSplitterAddress: string (optional) - RevenueSplitter contract address
 * @returns {Promise<Object>} Distribution result
 */
export async function distributeRevenueFromSale({
  patientUPI,
  hospitalId,
  totalAmount,
  revenueSplitterAddress = null
}) {
  try {
    // Get patient and hospital to retrieve Hedera Account IDs
    const patient = await getPatient(patientUPI);
    const hospital = await getHospital(hospitalId);
    
    if (!patient) {
      throw new Error(`Patient with UPI ${patientUPI} not found`);
    }
    
    if (!hospital) {
      throw new Error(`Hospital ${hospitalId} not found`);
    }
    
    // Lazy account creation: Create account only when revenue needs to be distributed
    if (!patient.hederaAccountId) {
      console.log(`Creating Hedera account for patient ${patientUPI} (lazy creation)`);
      
      try {
        const { createHederaAccount } = await import('./hedera-account-service.js');
        const { encrypt } = await import('./encryption-service.js');
        const { updatePatientAccount } = await import('../db/patient-db.js');
        
        // Create account (platform pays $0.05)
        const hederaAccount = await createHederaAccount(0);
        const encryptedPrivateKey = encrypt(hederaAccount.privateKey);
        
        // Save to database
        await updatePatientAccount(patientUPI, {
          hederaAccountId: hederaAccount.accountId,
          encryptedPrivateKey: encryptedPrivateKey
        });
        
        // Update patient object for this transaction
        patient.hederaAccountId = hederaAccount.accountId;
        
        console.log(`✅ Hedera account created for patient ${patientUPI}: ${hederaAccount.accountId}`);
      } catch (error) {
        console.error(`Failed to create Hedera account for patient ${patientUPI}:`, error);
        throw new Error(`Cannot distribute revenue: Failed to create Hedera account for patient`);
      }
    }
    
    if (!hospital.hederaAccountId) {
      throw new Error(`Hospital ${hospitalId} does not have a Hedera Account ID`);
    }
    
    // Convert tinybars to Hbar
    const hbarAmount = Hbar.fromTinybars(totalAmount);
    
    // Distribute revenue using Hedera Account IDs
    const result = await distributeRevenue({
      patientAccountId: patient.hederaAccountId,
      hospitalAccountId: hospital.hederaAccountId,
      totalAmount: hbarAmount,
      revenueSplitterAddress
    });
    
    return {
      success: true,
      patientUPI,
      hospitalId,
      patientAccountId: patient.hederaAccountId,
      hospitalAccountId: hospital.hederaAccountId,
      distribution: result
    };
  } catch (error) {
    console.error('Error distributing revenue from sale:', error);
    throw error;
  }
}

/**
 * Distribute revenue for multiple patients (bulk distribution)
 * 
 * @param {Array<Object>} sales - Array of { patientUPI, hospitalId, amount }
 * @param {string} revenueSplitterAddress - Optional contract address
 * @returns {Promise<Array>} Distribution results
 */
export async function distributeBulkRevenue(sales, revenueSplitterAddress = null) {
  const results = [];
  
  for (const sale of sales) {
    try {
      const result = await distributeRevenueFromSale({
        patientUPI: sale.patientUPI,
        hospitalId: sale.hospitalId,
        totalAmount: sale.amount,
        revenueSplitterAddress
      });
      results.push({ success: true, ...result });
    } catch (error) {
      results.push({
        success: false,
        patientUPI: sale.patientUPI,
        hospitalId: sale.hospitalId,
        error: error.message
      });
    }
  }
  
  return results;
}

