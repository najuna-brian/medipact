/**
 * Hospital Patients API Routes
 * 
 * Endpoints for hospitals to manage patient registrations (bulk, manual, etc.)
 */

import express from 'express';
import { processBulkRegistration } from '../services/bulk-patient-service.js';
import { generateUPI, getOrCreateUPI } from '../services/patient-identity-service.js';
import { linkHospitalToUPI } from '../services/hospital-linkage-service.js';
import { createPatient, patientExists, getPatient } from '../db/patient-db.js';
import { createLinkage, getLinkagesByHospital } from '../db/linkage-db.js';
import { upsertPatientContact } from '../db/patient-contacts-db.js';
import { verifyHospitalApiKey, getHospital as getHospitalFromDB } from '../db/hospital-db.js';
import { isHospitalVerified } from '../services/hospital-verification-service.js';

const router = express.Router();

// Middleware for hospital authentication
async function authenticateHospital(req, res, next) {
  const hospitalId = req.headers['x-hospital-id'];
  const apiKey = req.headers['x-api-key'];
  
  if (!hospitalId || !apiKey) {
    return res.status(401).json({ error: 'Missing hospital credentials' });
  }
  
  const isValid = await verifyHospitalApiKey(hospitalId, apiKey);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid hospital credentials' });
  }
  
  // Check if hospital is verified
  const verified = await isHospitalVerified(hospitalId, getHospitalFromDB);
  if (!verified) {
    return res.status(403).json({ 
      error: 'Hospital verification required. Please complete verification first.' 
    });
  }
  
  req.hospitalId = hospitalId;
  next();
}

/**
 * POST /api/hospital/:hospitalId/patients/bulk
 * Bulk register patients from CSV/JSON
 */
router.post('/:hospitalId/patients/bulk', authenticateHospital, async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { data, format } = req.body; // format: 'csv' or 'json'
    
    if (!data) {
      return res.status(400).json({ error: 'Patient data is required' });
    }
    
    // Process bulk registration
    const result = await processBulkRegistration(
      data,
      hospitalId,
      async (upi) => {
        return await patientExists(upi);
      },
      async (upi, patientData) => {
        await createPatient(upi, patientData);
        // Create/update contact information
        if (patientData.email || patientData.phone || patientData.nationalId) {
          await upsertPatientContact(upi, {
            email: patientData.email,
            phone: patientData.phone,
            nationalId: patientData.nationalId
          });
        }
      },
      async (linkage) => {
        await createLinkage(linkage);
      },
      async (upi) => {
        return await getPatient(upi);
      }
    );
    
    res.json({
      message: 'Bulk registration completed',
      result
    });
  } catch (error) {
    console.error('Error processing bulk registration:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/hospital/:hospitalId/patients
 * List all patients linked to this hospital
 */
router.get('/:hospitalId/patients', authenticateHospital, async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    // Verify hospital ID matches authenticated hospital
    if (hospitalId !== req.hospitalId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const linkages = await getLinkagesByHospital(hospitalId);
    
    res.json({
      hospitalId,
      totalPatients: linkages.length,
      patients: linkages.map(l => ({
        upi: l.upi,
        hospitalPatientId: l.hospitalPatientId,
        linkedAt: l.linkedAt,
        verified: l.verified,
        verificationMethod: l.verificationMethod
      }))
    });
  } catch (error) {
    console.error('Error fetching hospital patients:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/hospital/:hospitalId/patients
 * Register a single patient
 */
router.post('/:hospitalId/patients', authenticateHospital, async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { name, dateOfBirth, phone, nationalId, email, hospitalPatientId } = req.body;
    
    if (!name || !dateOfBirth) {
      return res.status(400).json({ 
        error: 'Name and Date of Birth are required' 
      });
    }
    
    if (!hospitalPatientId) {
      return res.status(400).json({ 
        error: 'Hospital Patient ID is required' 
      });
    }
    
    // Generate or get UPI
    let hederaAccountId = null;
    const upi = await getOrCreateUPI(
      { name, dateOfBirth, phone, nationalId },
      async (upi) => {
        return await patientExists(upi);
      },
      async (upi, patientData) => {
        // Create Hedera account for new patient
        const { createHederaAccount } = await import('../services/hedera-account-service.js');
        const { encrypt } = await import('../services/encryption-service.js');
        
        try {
          const hederaAccount = await createHederaAccount(0); // Platform pays
          hederaAccountId = hederaAccount.accountId;
          const encryptedPrivateKey = encrypt(hederaAccount.privateKey);
          
          await createPatient(upi, {
            ...patientData,
            hederaAccountId,
            encryptedPrivateKey
          });
        } catch (error) {
          console.error('Failed to create Hedera account for patient:', error);
          // Continue without Hedera account
          await createPatient(upi, patientData);
        }
      }
    );
    
    // If patient already existed, get their Hedera Account ID
    if (!hederaAccountId) {
      const patient = await getPatient(upi);
      hederaAccountId = patient?.hederaAccountId || null;
    }
    
    // Create/update contact information
    if (email || phone || nationalId) {
      await upsertPatientContact(upi, { email, phone, nationalId });
    }
    
    // Create hospital linkage
    await linkHospitalToUPI(
      upi,
      hospitalId,
      hospitalPatientId,
      {
        verified: true,
        verificationMethod: 'hospital_registration'
      },
      async (linkage) => {
        await createLinkage(linkage);
      }
    );
    
    res.json({
      message: 'Patient registered successfully',
      upi,
      hederaAccountId,
      hospitalPatientId
    });
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

