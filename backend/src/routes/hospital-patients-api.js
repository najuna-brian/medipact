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
import { checkLookupPermission } from '../services/patient-lookup-service.js';
import { verifyHospitalApiKey, getHospital as getHospitalFromDB } from '../db/hospital-db.js';
import { isHospitalVerified } from '../services/hospital-verification-service.js';
import { sendUPINotification } from '../services/notification-service.js';
import { getPatientContactByUPI } from '../db/patient-contacts-db.js';

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

/**
 * POST /api/hospital/:hospitalId/patients/lookup
 * Lookup patient UPI by email, phone, or national ID
 * 
 * Access Control:
 * - Only hospitals linked to the patient can lookup
 * - All lookups are logged to HCS for audit trail
 */
router.post('/:hospitalId/patients/lookup', authenticateHospital, async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { email, phone, nationalId } = req.body;
    
    if (!email && !phone && !nationalId) {
      return res.status(400).json({ 
        error: 'At least one of email, phone, or nationalId is required' 
      });
    }
    
    // Check lookup permission (hospital must be linked to patient)
    const permission = await checkLookupPermission(
      { email, phone, nationalId },
      'hospital',
      hospitalId,
      {} // No auth proof needed for hospitals (they're authenticated via API key)
    );
    
    if (!permission.allowed) {
      return res.status(403).json({ 
        found: false,
        error: permission.reason || 'Access denied' 
      });
    }
    
    // Record lookup on HCS for audit trail
    try {
      const { createHederaClient, initializeMedipactTopics, submitMessage } = await import('../adapter/src/hedera/hcs-client.js');
      const client = createHederaClient();
      const { lookupTopicId } = await initializeMedipactTopics(client);
      
      // Create lookup hash (no PII)
      const crypto = (await import('crypto')).default;
      const contactHash = crypto.createHash('sha256')
        .update(`${email || ''}${phone || ''}${nationalId || ''}`)
        .digest('hex');
      const upiHash = crypto.createHash('sha256')
        .update(permission.upi)
        .digest('hex');
      
      const lookupRecord = {
        lookupHash: contactHash,
        upiHash: upiHash,
        hospitalId: hospitalId,
        timestamp: new Date().toISOString(),
        requestType: 'lookup'
      };
      
      await submitMessage(client, lookupTopicId, JSON.stringify(lookupRecord));
    } catch (hcsError) {
      // Log but don't fail the request
      console.warn('Failed to record lookup on HCS:', hcsError.message);
    }
    
    res.json({ 
      upi: permission.upi, 
      found: true,
      message: 'Patient UPI found. Share this with the patient so they can access their account.'
    });
  } catch (error) {
    console.error('Error looking up patient:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/hospital/:hospitalId/qr-code
 * Generate QR code for hospital linking
 * Patients can scan this QR code to link to the hospital
 */
router.get('/:hospitalId/qr-code', authenticateHospital, async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    // Create signed token (expires in 1 hour)
    const crypto = (await import('crypto')).default;
    const timestamp = Date.now();
    const expiresAt = timestamp + (60 * 60 * 1000); // 1 hour
    const tokenData = {
      hospitalId,
      timestamp,
      expiresAt
    };
    
    // Sign token with hospital API key (from headers)
    const apiKey = req.headers['x-api-key'];
    const signature = crypto
      .createHmac('sha256', apiKey)
      .update(JSON.stringify(tokenData))
      .digest('hex');
    
    const signedToken = {
      ...tokenData,
      signature
    };
    
    // Encode token as base64 for QR code
    const tokenString = Buffer.from(JSON.stringify(signedToken)).toString('base64');
    
    // QR code data format: medipact://link-hospital?token=<base64-token>
    const qrData = `medipact://link-hospital?token=${tokenString}`;
    
    // Generate QR code (using qrcode library)
    const QRCode = (await import('qrcode')).default;
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      width: 300,
      margin: 2
    });
    
    res.json({
      qrCode: qrCodeDataUrl,
      token: tokenString,
      expiresAt: new Date(expiresAt).toISOString(),
      message: 'QR code generated successfully. Patients can scan this to link to your hospital.'
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/hospital/:hospitalId/verify-token
 * Verify QR code token for hospital linking
 * Used by patients to verify the token before linking
 */
router.get('/:hospitalId/verify-token', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { token } = req.query;
    
    if (!token || typeof token !== 'string') {
      return res.status(400).json({ valid: false, error: 'Token is required' });
    }
    
    // Decode token
    let tokenData;
    try {
      tokenData = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    } catch (err) {
      return res.status(400).json({ valid: false, error: 'Invalid token format' });
    }
    
    // Verify hospital ID matches
    if (tokenData.hospitalId !== hospitalId) {
      return res.status(400).json({ valid: false, error: 'Hospital ID mismatch' });
    }
    
    // Verify token hasn't expired
    if (Date.now() > tokenData.expiresAt) {
      return res.status(400).json({ valid: false, error: 'Token has expired' });
    }
    
    // Verify signature (we need to get the hospital's API key)
    const { getHospital } = await import('../db/hospital-db.js');
    const hospital = await getHospital(hospitalId);
    
    if (!hospital || !hospital.apiKey) {
      return res.status(404).json({ valid: false, error: 'Hospital not found' });
    }
    
    const crypto = (await import('crypto')).default;
    const expectedSignature = crypto
      .createHmac('sha256', hospital.apiKey)
      .update(JSON.stringify({
        hospitalId: tokenData.hospitalId,
        timestamp: tokenData.timestamp,
        expiresAt: tokenData.expiresAt
      }))
      .digest('hex');
    
    if (tokenData.signature !== expectedSignature) {
      return res.status(401).json({ valid: false, error: 'Invalid token signature' });
    }
    
    // Token is valid
    res.json({
      valid: true,
      hospitalId: tokenData.hospitalId,
      expiresAt: new Date(tokenData.expiresAt).toISOString(),
      // Return API key for linking (in production, this should be more secure)
      apiKey: hospital.apiKey
    });
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(500).json({ valid: false, error: error.message });
  }
});

/**
 * GET /api/hospital/:hospitalId/patients/export
 * Export patient list with UPIs (CSV or JSON format)
 */
router.get('/:hospitalId/patients/export', authenticateHospital, async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const format = req.query.format || 'json'; // 'json' or 'csv'
    
    // Verify hospital ID matches authenticated hospital
    if (hospitalId !== req.hospitalId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get all patients (same logic as GET /patients)
    const linkages = await getLinkagesByHospital(hospitalId);
    const { get, all } = await import('../db/database.js');
    const { getDatabaseType } = await import('../db/database.js');
    const dbType = getDatabaseType();
    
    let fhirPatients = [];
    try {
      if (dbType === 'postgresql') {
        const result = await all(
          `SELECT DISTINCT ON (upi)
            "anonymousPatientId",
            upi,
            "hospitalId",
            "createdAt"
          FROM fhir_patients
          WHERE "hospitalId" = $1 AND upi IS NOT NULL
          ORDER BY upi, "createdAt" DESC`,
          [hospitalId]
        );
        fhirPatients = result.rows || result;
      } else {
        const rows = await all(
          `SELECT 
            fp1."anonymousPatientId" as anonymousPatientId,
            fp1.upi,
            fp1."hospitalId" as hospitalId,
            fp1."createdAt" as createdAt
          FROM fhir_patients fp1
          INNER JOIN (
            SELECT upi, MAX("createdAt") as max_created
            FROM fhir_patients
            WHERE "hospitalId" = ? AND upi IS NOT NULL
            GROUP BY upi
          ) fp2 ON fp1.upi = fp2.upi AND fp1."createdAt" = fp2.max_created
          WHERE fp1."hospitalId" = ?`,
          [hospitalId, hospitalId]
        );
        fhirPatients = rows;
      }
    } catch (error) {
      console.error('Error fetching FHIR patients:', error);
      fhirPatients = [];
    }
    
    // Combine patients
    const patientMap = new Map();
    linkages.forEach(linkage => {
      patientMap.set(linkage.upi, {
        upi: linkage.upi,
        hospitalPatientId: linkage.hospitalPatientId,
        linkedAt: linkage.linkedAt,
        source: 'registered'
      });
    });
    
    fhirPatients.forEach(fhirPatient => {
      if (!fhirPatient.upi) return;
      if (!patientMap.has(fhirPatient.upi)) {
        patientMap.set(fhirPatient.upi, {
          upi: fhirPatient.upi,
          hospitalPatientId: fhirPatient.anonymousPatientId,
          linkedAt: fhirPatient.createdAt,
          source: 'csv_upload'
        });
      }
    });
    
    const allPatients = Array.from(patientMap.values());
    
    // Get contact info for each patient
    const patientsWithContacts = await Promise.all(
      allPatients.map(async (patient) => {
        const contact = await getPatientContactByUPI(patient.upi);
        return {
          ...patient,
          email: contact?.email || '',
          phone: contact?.phone || '',
          nationalId: contact?.nationalId || ''
        };
      })
    );
    
    if (format === 'csv') {
      // Generate CSV
      const csvHeader = 'UPI,Hospital Patient ID,Email,Phone,National ID,Source,Linked At\n';
      const csvRows = patientsWithContacts.map(p => {
        const row = [
          p.upi,
          p.hospitalPatientId || '',
          p.email || '',
          p.phone || '',
          p.nationalId || '',
          p.source || '',
          p.linkedAt || ''
        ];
        return row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
      }).join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="patients-${hospitalId}-${Date.now()}.csv"`);
      res.send(csvHeader + csvRows);
    } else {
      // JSON format
      res.json({
        hospitalId,
        totalPatients: patientsWithContacts.length,
        exportedAt: new Date().toISOString(),
        patients: patientsWithContacts
      });
    }
  } catch (error) {
    console.error('Error exporting patients:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/hospital/:hospitalId/patients/:upi/notify
 * Send UPI notification to a specific patient
 */
router.post('/:hospitalId/patients/:upi/notify', authenticateHospital, async (req, res) => {
  try {
    const { hospitalId, upi } = req.params;
    
    // Verify hospital ID matches authenticated hospital
    if (hospitalId !== req.hospitalId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get patient contact info
    const contact = await getPatientContactByUPI(upi);
    if (!contact || (!contact.email && !contact.phone)) {
      return res.status(400).json({ 
        error: 'Patient has no email or phone number on file' 
      });
    }
    
    // Get hospital name
    const hospital = await getHospitalFromDB(hospitalId);
    const hospitalName = hospital?.name || 'MediPact';
    
    // Get patient name (from patient_identities or contact)
    const patient = await getPatient(upi);
    
    // Send notification
    const results = await sendUPINotification({
      upi,
      email: contact.email || null,
      phone: contact.phone || null,
      name: patient?.name || 'Patient'
    }, hospitalName);
    
    res.json({
      success: true,
      upi,
      notifications: results,
      message: 'Notification sent successfully'
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/hospital/:hospitalId/patients/notify-bulk
 * Send UPI notifications to multiple patients
 */
router.post('/:hospitalId/patients/notify-bulk', authenticateHospital, async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { upis } = req.body; // Array of UPIs
    
    if (!Array.isArray(upis) || upis.length === 0) {
      return res.status(400).json({ error: 'UPIs array is required' });
    }
    
    // Verify hospital ID matches authenticated hospital
    if (hospitalId !== req.hospitalId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get hospital name
    const hospital = await getHospitalFromDB(hospitalId);
    const hospitalName = hospital?.name || 'MediPact';
    
    const results = [];
    
    for (const upi of upis) {
      try {
        const contact = await getPatientContactByUPI(upi);
        if (!contact || (!contact.email && !contact.phone)) {
          results.push({
            upi,
            success: false,
            error: 'No email or phone on file'
          });
          continue;
        }
        
        const patient = await getPatient(upi);
        const notificationResults = await sendUPINotification({
          upi,
          email: contact.email || null,
          phone: contact.phone || null,
          name: patient?.name || 'Patient'
        }, hospitalName);
        
        results.push({
          upi,
          success: true,
          notifications: notificationResults
        });
      } catch (error) {
        results.push({
          upi,
          success: false,
          error: error.message
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;
    
    res.json({
      success: true,
      total: upis.length,
      successful: successCount,
      failed: failureCount,
      results
    });
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

