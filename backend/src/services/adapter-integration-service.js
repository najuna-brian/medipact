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
 * IMPORTANT: The hospitalId parameter must be the ORIGINAL hospital that collected the patient's data.
 * This ensures that only the hospital that originally collected the data receives revenue from it.
 * 
 * Revenue Split: 60% patient, 25% hospital (original collector), 15% platform
 * 
 * @param {Object} params
 *   - patientUPI: string - Patient UPI
 *   - hospitalId: string - Hospital ID (MUST be the original hospital that collected this patient's data)
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
    // This ensures operator (mainnet account) only pays for accounts that will receive payments
    if (!patient.hederaAccountId) {
      console.log(`Creating Hedera account for patient ${patientUPI} (lazy creation - just before payment)`);
      
      try {
        const { createHederaAccount } = await import('./hedera-account-service.js');
        const { encrypt } = await import('./encryption-service.js');
        const { updatePatientAccount } = await import('../db/patient-db.js');
        
        // Create account (operator/mainnet account pays ~$0.05)
        const hederaAccount = await createHederaAccount(0);
        const encryptedPrivateKey = encrypt(hederaAccount.privateKey);
        
        // Save to database
        await updatePatientAccount(patientUPI, {
          hederaAccountId: hederaAccount.accountId,
          evmAddress: hederaAccount.evmAddress,
          encryptedPrivateKey: encryptedPrivateKey
        });
        
        // Update patient object for this transaction
        patient.hederaAccountId = hederaAccount.accountId;
        patient.evmAddress = hederaAccount.evmAddress;
        
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
    
    // Distribute revenue using Hedera Account IDs and EVM addresses
    // Pass patient and hospital objects so EVM addresses can be retrieved
    const result = await distributeRevenue({
      patientAccountId: patient.hederaAccountId,
      hospitalAccountId: hospital.hederaAccountId,
      totalAmount: hbarAmount,
      revenueSplitterAddress,
      getPatient: () => Promise.resolve(patient), // Pass patient object with evmAddress
      getHospital: () => Promise.resolve(hospital) // Pass hospital object with evmAddress
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
 * Each sale should have: { patientUPI, hospitalId, amount }
 * The hospitalId should be the hospital that provided the data for that specific patient
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
        hospitalId: sale.hospitalId, // Use the specific hospital that provided this patient's data
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

/**
 * Distribute revenue for a dataset purchase
 * 
 * IMPORTANT: Revenue Distribution Model
 * - Total payment is split equally among all patients in the dataset
 * - For each patient, revenue is split: 60% patient, 25% hospital, 15% platform
 * - Each patient's 25% hospital share goes to the ORIGINAL hospital that collected that patient's data
 * - This ensures the hospital that originally collected the data is the sole beneficiary
 * - If a patient's data was collected by Hospital A, only Hospital A receives revenue from that patient's data
 * - Multiple hospitals can be in a dataset, but each receives revenue only for their own patients
 * 
 * Example:
 * - Dataset has 100 patients: 60 from Hospital A, 40 from Hospital B
 * - Total payment: 1000 HBAR
 * - Amount per patient: 10 HBAR
 * - Hospital A receives: 60 patients × 10 HBAR × 25% = 150 HBAR
 * - Hospital B receives: 40 patients × 10 HBAR × 25% = 100 HBAR
 * 
 * @param {Object} params
 *   - datasetId: string - Dataset ID
 *   - totalAmount: number - Total payment amount in tinybars
 *   - revenueSplitterAddress: string (optional) - Contract address
 *   - filters: Object (optional) - Query filters to get patients from dataset
 * @returns {Promise<Object>} Distribution results
 */
export async function distributeDatasetRevenue({
  datasetId,
  totalAmount,
  revenueSplitterAddress = null,
  filters = null
}) {
  try {
    // Import here to avoid circular dependencies
    const { getDataset } = await import('../db/dataset-db.js');
    const { getPatientsWithHospitals } = await import('../db/fhir-db.js');
    
    // Get dataset to extract filters if not provided
    let queryFilters = filters;
    if (!queryFilters && datasetId) {
      const dataset = await getDataset(datasetId);
      if (!dataset) {
        throw new Error(`Dataset ${datasetId} not found`);
      }
      
      // Build filters from dataset metadata
      queryFilters = {
        country: dataset.country,
        hospitalId: dataset.hospitalId, // This might be null if dataset has multiple hospitals
        startDate: dataset.dateRangeStart,
        endDate: dataset.dateRangeEnd,
        conditionCodes: dataset.conditionCodes
      };
    }
    
    if (!queryFilters) {
      throw new Error('Dataset filters required to get patients');
    }
    
    // Get all patients in the dataset with their hospital IDs
    // Each patient is linked to their ORIGINAL hospital that collected their data
    const patients = await getPatientsWithHospitals(queryFilters);
    
    if (patients.length === 0) {
      throw new Error('No patients found in dataset');
    }
    
    // Calculate equal split per patient
    const totalTinybars = Number(totalAmount);
    const amountPerPatient = Math.floor(totalTinybars / patients.length);
    const remainder = totalTinybars - (amountPerPatient * patients.length); // Handle rounding
    
    console.log(`\n💰 Distributing revenue for dataset ${datasetId || 'query'}:`);
    console.log(`   Total amount: ${totalTinybars} tinybars`);
    console.log(`   Patients: ${patients.length}`);
    console.log(`   Amount per patient: ${amountPerPatient} tinybars`);
    if (remainder > 0) {
      console.log(`   Remainder: ${remainder} tinybars (will be added to last patient)`);
    }
    
    // Prepare sales array with equal amounts per patient
    // CRITICAL: Each patient's revenue goes to their ORIGINAL hospital (the one that collected their data)
    const sales = [];
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      // Add remainder to last patient to ensure total is correct
      const patientAmount = i === patients.length - 1 
        ? amountPerPatient + remainder 
        : amountPerPatient;
      
      // Each patient's hospitalId is the ORIGINAL hospital that collected their data
      // This ensures the collecting hospital is the sole beneficiary
      sales.push({
        patientUPI: patient.upi,
        hospitalId: patient.hospitalId, // Original hospital that collected this patient's data
        amount: patientAmount
      });
    }
    
    // Distribute using bulk distribution
    const results = await distributeBulkRevenue(sales, revenueSplitterAddress);
    
    // Calculate summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    // Group by hospital to show distribution
    const hospitalSummary = {};
    results.forEach(result => {
      if (result.success && result.hospitalId) {
        if (!hospitalSummary[result.hospitalId]) {
          hospitalSummary[result.hospitalId] = {
            hospitalId: result.hospitalId,
            patientCount: 0,
            totalAmount: 0
          };
        }
        hospitalSummary[result.hospitalId].patientCount++;
        hospitalSummary[result.hospitalId].totalAmount += result.distribution?.split?.hospital 
          ? Number(result.distribution.split.hospital.replace(' ℏ', '')) * 100000000 
          : 0;
      }
    });
    
    return {
      success: true,
      datasetId,
      totalAmount: totalTinybars,
      totalPatients: patients.length,
      amountPerPatient,
      distribution: {
        successful,
        failed,
        results,
        hospitalSummary: Object.values(hospitalSummary)
      }
    };
  } catch (error) {
    console.error('Error distributing dataset revenue:', error);
    throw error;
  }
}

