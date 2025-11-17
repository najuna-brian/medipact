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
import { upsertPatientContact, findUPIByEmail, findUPIByPhone, findUPIByNationalId } from '../db/patient-contacts-db.js';
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
        // Create/update contact information with latest entry (merge to latest)
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
      },
      {
        // Provide contact lookup functions - enables automatic linking by email/phone
        findUPIByEmail,
        findUPIByPhone,
        findUPIByNationalId
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
 * Includes both explicitly registered patients and patients from CSV uploads
 * Multiple encounters for the same patient are tracked separately but linked to same UPI
 */
router.get('/:hospitalId/patients', authenticateHospital, async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    // Verify hospital ID matches authenticated hospital
    if (hospitalId !== req.hospitalId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { get, all } = await import('../db/database.js');
    const { getDatabaseType } = await import('../db/database.js');
    const dbType = getDatabaseType();
    
    // Get explicitly registered patients (from hospital_linkages)
    const linkages = await getLinkagesByHospital(hospitalId);
    
    // Get distinct patients from FHIR resources (CSV uploads)
    // Count by UPI to avoid duplicates - same patient, different encounters = one patient
    // Handle missing tables gracefully (FHIR tables may not exist if migration hasn't run)
    let fhirPatients = [];
    try {
      console.log(`[Hospital Patients] Fetching FHIR patients for hospital ${hospitalId}`);
      if (dbType === 'postgresql') {
        // Check if fhir_encounters table exists
        const { get } = await import('../db/database.js');
        const tableCheck = await get(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'fhir_encounters'
          ) as exists`
        );
        const hasEncountersTable = tableCheck?.exists || false;
        
        const result = await all(
          `SELECT DISTINCT ON (upi)
            "anonymousPatientId",
            upi,
            "hospitalId",
            "createdAt",
            ${hasEncountersTable ? `(SELECT COUNT(*) FROM fhir_encounters WHERE "anonymousPatientId" = fp."anonymousPatientId" AND "hospitalId" = $1)` : '0'} as "encounterCount",
            (SELECT COUNT(*) FROM fhir_conditions WHERE "anonymousPatientId" = fp."anonymousPatientId" AND "hospitalId" = $1) as "conditionCount",
            (SELECT COUNT(*) FROM fhir_observations WHERE "anonymousPatientId" = fp."anonymousPatientId" AND "hospitalId" = $1) as "observationCount"
          FROM fhir_patients fp
          WHERE "hospitalId" = $1 AND upi IS NOT NULL
          ORDER BY upi, "createdAt" DESC`,
          [hospitalId]
        );
        fhirPatients = result.rows || result;
      } else {
        // SQLite - check if table exists
        const { get } = await import('../db/database.js');
        let hasEncountersTable = false;
        try {
          const tableCheck = await get(
            `SELECT name FROM sqlite_master WHERE type='table' AND name='fhir_encounters'`
          );
          hasEncountersTable = !!tableCheck;
        } catch (e) {
          // Table doesn't exist
        }
        
        // SQLite - get distinct UPIs with latest record info
        const rows = await all(
          `SELECT 
            fp1."anonymousPatientId" as anonymousPatientId,
            fp1.upi,
            fp1."hospitalId" as hospitalId,
            fp1."createdAt" as createdAt,
            ${hasEncountersTable ? `(SELECT COUNT(*) FROM fhir_encounters WHERE "anonymousPatientId" = fp1."anonymousPatientId" AND "hospitalId" = ?)` : '0'} as encounterCount,
            (SELECT COUNT(*) FROM fhir_conditions WHERE "anonymousPatientId" = fp1."anonymousPatientId" AND "hospitalId" = ?) as conditionCount,
            (SELECT COUNT(*) FROM fhir_observations WHERE "anonymousPatientId" = fp1."anonymousPatientId" AND "hospitalId" = ?) as observationCount
          FROM fhir_patients fp1
          INNER JOIN (
            SELECT upi, MAX("createdAt") as max_created
            FROM fhir_patients
            WHERE "hospitalId" = ? AND upi IS NOT NULL
            GROUP BY upi
          ) fp2 ON fp1.upi = fp2.upi AND fp1."createdAt" = fp2.max_created
          WHERE fp1."hospitalId" = ?`,
          [hospitalId, hospitalId, hospitalId, hospitalId, hospitalId]
        );
        fhirPatients = rows.map(row => ({
          anonymousPatientId: row.anonymousPatientId,
          upi: row.upi,
          hospitalId: row.hospitalId,
          createdAt: row.createdAt,
          encounterCount: parseInt(row.encounterCount || 0),
          conditionCount: parseInt(row.conditionCount || 0),
          observationCount: parseInt(row.observationCount || 0)
        }));
      }
    } catch (error) {
      // If fhir_patients table doesn't exist, just return empty array
      console.error(`[Hospital Patients] Error fetching FHIR patients for hospital ${hospitalId}:`, error.message);
      console.error(`[Hospital Patients] Error details:`, {
        message: error.message,
        code: error.code,
        tableExists: !error.message.includes('does not exist') && !error.message.includes('no such table')
      });
      if (error.message.includes('does not exist') || error.message.includes('no such table')) {
        console.warn('FHIR tables not found, returning empty patient list:', error.message);
        fhirPatients = [];
      } else {
        throw error;
      }
    }
    
    console.log(`[Hospital Patients] Found ${fhirPatients.length} FHIR patients for hospital ${hospitalId}`);
    
    // Combine both sources, using UPI as the unique key
    // If same UPI exists in both, prefer the registered one (has verification info)
    const patientMap = new Map();
    
    // Add explicitly registered patients first
    linkages.forEach(linkage => {
      patientMap.set(linkage.upi, {
        upi: linkage.upi,
        hospitalPatientId: linkage.hospitalPatientId,
        linkedAt: linkage.linkedAt,
        verified: linkage.verified,
        verificationMethod: linkage.verificationMethod,
        source: 'registered',
        encounterCount: 0,
        conditionCount: 0,
        observationCount: 0
      });
    });
    
    // Add FHIR patients (from CSV uploads)
    // If UPI already exists (registered), update with record counts
    // If new UPI, add as CSV patient
    fhirPatients.forEach(fhirPatient => {
      if (!fhirPatient.upi) return; // Skip if no UPI
      
      if (patientMap.has(fhirPatient.upi)) {
        // Patient already registered - just update record counts
        const existing = patientMap.get(fhirPatient.upi);
        existing.encounterCount = parseInt(fhirPatient.encounterCount || 0);
        existing.conditionCount = parseInt(fhirPatient.conditionCount || 0);
        existing.observationCount = parseInt(fhirPatient.observationCount || 0);
        existing.hasCSVRecords = true;
      } else {
        // New patient from CSV - add them
        patientMap.set(fhirPatient.upi, {
          upi: fhirPatient.upi,
          hospitalPatientId: fhirPatient.anonymousPatientId,
          linkedAt: fhirPatient.createdAt,
          verified: false,
          verificationMethod: null,
          source: 'csv_upload',
          encounterCount: parseInt(fhirPatient.encounterCount || 0),
          conditionCount: parseInt(fhirPatient.conditionCount || 0),
          observationCount: parseInt(fhirPatient.observationCount || 0),
          hasCSVRecords: true
        });
      }
    });
    
    const allPatients = Array.from(patientMap.values());
    
    // Calculate total record count (all encounters, conditions, observations for this hospital)
    const totalRecords = allPatients.reduce((sum, p) => 
      sum + (p.encounterCount || 0) + (p.conditionCount || 0) + (p.observationCount || 0), 0
    );
    
    console.log(`[Hospital Patients] Hospital ${hospitalId} stats:`, {
      totalPatients: allPatients.length,
      registeredPatients: linkages.length,
      csvUploadPatients: fhirPatients.length,
      totalRecords,
      fhirPatientsCount: fhirPatients.length
    });
    
    res.json({
      hospitalId,
      totalPatients: allPatients.length, // Distinct UPIs
      registeredPatients: linkages.length,
      csvUploadPatients: fhirPatients.length,
      totalRecords, // Total encounters/conditions/observations
      patients: allPatients.sort((a, b) => 
        new Date(b.linkedAt || 0) - new Date(a.linkedAt || 0)
      )
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
    
    // Generate or get UPI with contact lookup (email/phone priority)
    // This allows patients to use email/phone without knowing their UPI
    const upi = await getOrCreateUPI(
      { name, dateOfBirth, phone, nationalId, email },
      async (upi) => {
        return await patientExists(upi);
      },
      async (upi, patientData) => {
        // Create Hedera account for patient immediately (same as hospitals and researchers)
        let hederaAccountId = null;
        let encryptedPrivateKey = null;
        let evmAddress = null;
        
        try {
          const { createHederaAccount } = await import('../services/hedera-account-service.js');
          const { encrypt } = await import('../services/encryption-service.js');
          console.log(`Creating Hedera account for patient: ${upi}`);
          const hederaAccount = await createHederaAccount(0); // Platform pays for account creation
          encryptedPrivateKey = encrypt(hederaAccount.privateKey);
          hederaAccountId = hederaAccount.accountId;
          evmAddress = hederaAccount.evmAddress;
          console.log(`✅ Hedera account created: ${hederaAccount.accountId}`);
        } catch (error) {
          console.error(`Failed to create Hedera account for patient ${upi}:`, error);
          // Continue registration even if Hedera account creation fails
          // Account can be created later if needed
        }
        
        await createPatient(upi, {
          ...patientData,
          hederaAccountId: hederaAccountId || null,
          evmAddress: evmAddress || null,
          encryptedPrivateKey: encryptedPrivateKey || null
        });
      },
      {
        // Provide contact lookup functions - enables automatic linking by email/phone
        findUPIByEmail,
        findUPIByPhone,
        findUPIByNationalId
      }
    );
    
    // Get patient to retrieve Hedera account (created during registration)
    const patient = await getPatient(upi);
    const hederaAccountId = patient?.hederaAccountId || null;
    
    // Create/update contact information with latest entry (merge to latest)
    // This ensures contact info is always up-to-date
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

