/**
 * Hospital API Routes
 * 
 * RESTful API for hospital registration and management.
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import { registerHospital, getHospital, updateHospital } from '../services/hospital-registry-service.js';
import { verifyHospital } from '../services/hospital-registry-service.js';
import { createHospital, getHospital as getHospitalFromDB, updateHospital as updateHospitalInDB, verifyHospitalApiKey, hospitalExists } from '../db/hospital-db.js';
import { submitVerificationDocuments, getVerificationStatus, isHospitalVerified } from '../services/hospital-verification-service.js';
import { getConsentStatistics } from '../db/consent-db.js';

const router = express.Router();
const execAsync = promisify(exec);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'), false);
    }
  }
});

// Middleware for hospital authentication
async function authenticateHospital(req, res, next) {
  // Express normalizes headers to lowercase, but check both cases for safety
  const hospitalId = req.headers['x-hospital-id'] || req.headers['X-Hospital-ID'];
  const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
  
  if (!hospitalId || !apiKey) {
    console.error('Missing hospital credentials:', { 
      'x-hospital-id': req.headers['x-hospital-id'],
      'X-Hospital-ID': req.headers['X-Hospital-ID'],
      'x-api-key': req.headers['x-api-key'] ? 'present' : 'missing',
      'X-API-Key': req.headers['X-API-Key'] ? 'present' : 'missing',
      allHeaders: Object.keys(req.headers)
    });
    return res.status(401).json({ error: 'Missing hospital credentials' });
  }
  
  const isValid = await verifyHospital(hospitalId, apiKey, async (id, key) => {
    // Verify hospital API key
    return await verifyHospitalApiKey(id, key);
  });
  
  if (!isValid) {
    console.error('Invalid hospital credentials:', { hospitalId, apiKeyLength: apiKey?.length });
    return res.status(401).json({ error: 'Invalid hospital credentials' });
  }
  
  req.hospitalId = hospitalId;
  next();
}

/**
 * @swagger
 * /api/hospital/register:
 *   post:
 *     summary: Register a new hospital
 *     description: Register a new hospital account. Creates a Hedera account automatically for revenue distribution. Returns an API key for authentication.
 *     tags: [Hospital]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - country
 *             properties:
 *               name:
 *                 type: string
 *                 example: "City General Hospital"
 *                 description: Hospital name
 *               country:
 *                 type: string
 *                 example: "United States"
 *                 description: Hospital country
 *               location:
 *                 type: string
 *                 example: "New York, NY"
 *                 description: Hospital location (optional)
 *               fhirEndpoint:
 *                 type: string
 *                 format: uri
 *                 example: "https://hospital.example.com/fhir"
 *                 description: FHIR R4 endpoint URL (optional)
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 example: "admin@hospital.example.com"
 *                 description: Contact email (optional)
 *     responses:
 *       200:
 *         description: Hospital registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Hospital registered successfully"
 *                 hospital:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Hospital'
 *                     - type: object
 *                       properties:
 *                         apiKey:
 *                           type: string
 *                           description: API key for authentication (save securely!)
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Internal server error
 */
/**
 * POST /api/hospital/register
 * Register a new hospital
 */
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      country, 
      location, 
      fhirEndpoint, 
      contactEmail,
      // Payment method fields (optional)
      paymentMethod,
      bankAccountNumber,
      bankName,
      mobileMoneyProvider,
      mobileMoneyNumber,
      withdrawalThresholdUSD,
      autoWithdrawEnabled
    } = req.body;
    
    // Validate required fields
    if (!name || !country) {
      return res.status(400).json({ 
        error: 'Hospital name and country are required' 
      });
    }
    
    // Registration number and verification documents should only be submitted during verification, not registration
    
    // Generate API key for hospital (in production, this should be more secure)
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    const hospital = await registerHospital(
      { name, country, location, fhirEndpoint, contactEmail, apiKey },
      async (hospitalId) => {
        // Check if hospital exists
        return await hospitalExists(hospitalId);
      },
      async (hospitalRecord) => {
        // Add payment method fields to hospital record
        const hospitalWithPayment = {
          ...hospitalRecord,
          paymentMethod: paymentMethod || null,
          bankAccountNumber: bankAccountNumber || null,
          bankName: bankName || null,
          mobileMoneyProvider: mobileMoneyProvider || null,
          mobileMoneyNumber: mobileMoneyNumber || null,
          withdrawalThresholdUSD: withdrawalThresholdUSD || 100.00,
          autoWithdrawEnabled: autoWithdrawEnabled !== false // Default true
        };
        // Store hospital in database
        return await createHospital(hospitalWithPayment);
      }
    );
    
    // Return hospital with API key (only on creation)
    // Note: hospital object from registerHospital doesn't include apiKey for security
    res.json({
      message: 'Hospital registered successfully',
      hospital: {
        ...hospital,
        apiKey, // Only returned on creation - hospital should save this securely
        hederaAccountId: hospital.hederaAccountId, // Include Hedera Account ID
        verificationPrompt: true,
        verificationMessage: 'Please verify your account to access full features and better pricing.'
      }
    });
  } catch (error) {
    console.error('Error registering hospital:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/hospital/{hospitalId}:
 *   get:
 *     summary: Get hospital information
 *     description: Retrieve hospital details by hospital ID. Requires hospital authentication.
 *     tags: [Hospital]
 *     security:
 *       - HospitalAuth: []
 *       - HospitalApiKey: []
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hospital ID
 *     responses:
 *       200:
 *         description: Hospital information
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Hospital'
 *       404:
 *         description: Hospital not found
 *       401:
 *         description: Authentication failed
 */
/**
 * GET /api/hospital/:hospitalId
 * Get hospital information
 */
router.get('/:hospitalId', authenticateHospital, async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    const hospital = await getHospital(
      hospitalId,
      async (hospitalId) => {
        // Get hospital from database
        return await getHospitalFromDB(hospitalId);
      }
    );
    
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }
    
    res.json(hospital);
  } catch (error) {
    console.error('Error fetching hospital:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/hospital/{hospitalId}:
 *   put:
 *     summary: Update hospital information
 *     description: Update hospital details. Requires hospital authentication.
 *     tags: [Hospital]
 *     security:
 *       - HospitalAuth: []
 *       - HospitalApiKey: []
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *         description: Hospital ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               country:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Hospital updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 hospital:
 *                   $ref: '#/components/schemas/Hospital'
 *       401:
 *         description: Authentication failed
 *       404:
 *         description: Hospital not found
 */
/**
 * PUT /api/hospital/:hospitalId
 * Update hospital information
 */
router.put('/:hospitalId', authenticateHospital, async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const updates = req.body;
    
    const hospital = await updateHospital(
      hospitalId,
      updates,
      async (hospitalId, updates) => {
        // Update hospital in database
        return await updateHospitalInDB(hospitalId, updates);
      }
    );
    
    res.json({
      message: 'Hospital updated successfully',
      hospital
    });
  } catch (error) {
    console.error('Error updating hospital:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/hospital/{hospitalId}/verify:
 *   post:
 *     summary: Submit verification documents
 *     description: Submit documents for hospital verification. Requires hospital authentication.
 *     tags: [Hospital]
 *     security:
 *       - HospitalAuth: []
 *       - HospitalApiKey: []
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - documents
 *             properties:
 *               documents:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Verification documents submitted successfully
 *       400:
 *         description: Missing documents
 *       401:
 *         description: Authentication failed
 */
/**
 * POST /api/hospital/:hospitalId/verify
 * Submit verification documents
 */
router.post('/:hospitalId/verify', authenticateHospital, async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { documents } = req.body;
    
    if (!documents) {
      return res.status(400).json({ error: 'Verification documents are required' });
    }
    
    const hospital = await submitVerificationDocuments(
      hospitalId,
      documents,
      async (hospitalId, updates) => {
        return await updateHospitalInDB(hospitalId, updates);
      }
    );
    
    res.json({
      message: 'Verification documents submitted successfully',
      hospital
    });
  } catch (error) {
    console.error('Error submitting verification documents:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/hospital/{hospitalId}/verification-status:
 *   get:
 *     summary: Get verification status
 *     description: Get the current verification status of the hospital. Requires hospital authentication.
 *     tags: [Hospital]
 *     security:
 *       - HospitalAuth: []
 *       - HospitalApiKey: []
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Verification status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [pending, verified, rejected]
 *       401:
 *         description: Authentication failed
 *       404:
 *         description: Hospital not found
 */
/**
 * GET /api/hospital/:hospitalId/verification-status
 * Get verification status
 */
router.get('/:hospitalId/verification-status', authenticateHospital, async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    const status = await getVerificationStatus(
      hospitalId,
      async (hospitalId) => {
        return await getHospitalFromDB(hospitalId);
      }
    );
    
    res.json(status);
  } catch (error) {
    console.error('Error fetching verification status:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/hospital/{hospitalId}/consent/statistics:
 *   get:
 *     summary: Get consent statistics for a hospital
 *     description: Retrieve consent statistics including total consents, active consents, and consent breakdown. Requires hospital authentication.
 *     tags: [Hospital]
 *     security:
 *       - HospitalAuth: []
 *       - HospitalApiKey: []
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Consent statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalConsents:
 *                   type: integer
 *                 activeConsents:
 *                   type: integer
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Access denied
 */
/**
 * GET /api/hospital/:hospitalId/consent/statistics
 * Get consent statistics for a hospital
 */
router.get('/:hospitalId/consent/statistics', authenticateHospital, async (req, res) => {
  try {
    const { hospitalId } = req.params;
    
    // Verify hospital ID matches authenticated hospital
    if (hospitalId !== req.hospitalId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const statistics = await getConsentStatistics(hospitalId);
    
    res.json(statistics);
  } catch (error) {
    console.error('Error fetching consent statistics:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/hospital/{hospitalId}/processing-history:
 *   get:
 *     summary: Get processing history for a hospital
 *     description: Retrieve history of CSV uploads and data processing. Shows records processed, consent proofs, data proofs, and HashScan links. Requires hospital authentication.
 *     tags: [Hospital]
 *     security:
 *       - HospitalAuth: []
 *       - HospitalApiKey: []
 *     parameters:
 *       - in: path
 *         name: hospitalId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of records to return
 *     responses:
 *       200:
 *         description: Processing history
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   hospitalId:
 *                     type: string
 *                   fileName:
 *                     type: string
 *                   recordsProcessed:
 *                     type: integer
 *                   consentProofs:
 *                     type: integer
 *                   dataProofs:
 *                     type: integer
 *                   status:
 *                     type: string
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: Authentication failed
 *       403:
 *         description: Access denied
 */
/**
 * GET /api/hospital/:hospitalId/processing-history
 * Get processing history for a hospital
 */
router.get('/:hospitalId/processing-history', authenticateHospital, async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    // Verify hospital ID matches authenticated hospital
    if (hospitalId !== req.hospitalId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const { getProcessingHistory } = await import('../db/processing-history-db.js');
    const history = await getProcessingHistory(hospitalId, limit);
    
    console.log(`[Processing History] Fetched ${history?.length || 0} records for hospital ${hospitalId}`);
    
    res.json(history || []);
  } catch (error) {
    console.error('Error fetching processing history:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @swagger
 * /api/hospital/upload-csv:
 *   post:
 *     summary: Upload and process CSV file using the adapter
 *     description: Upload a CSV file containing patient data. The adapter will process, anonymize, and submit proofs to Hedera HCS. This is the primary endpoint for CSV data uploads.
 *     tags: [Hospital]
 *     security:
 *       - HospitalAuth: []
 *       - HospitalApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - hospitalCountry
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: CSV file containing patient data
 *               hospitalCountry:
 *                 type: string
 *                 example: "Uganda"
 *                 description: Hospital country (required)
 *               hospitalLocation:
 *                 type: string
 *                 example: "Kampala"
 *                 description: Hospital location (optional)
 *     responses:
 *       200:
 *         description: CSV processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 recordsProcessed:
 *                   type: integer
 *                   example: 20
 *                 consentProofs:
 *                   type: integer
 *                   example: 10
 *                 dataProofs:
 *                   type: integer
 *                   example: 10
 *                 consentTopicId:
 *                   type: string
 *                   example: "0.0.7296443"
 *                 dataTopicId:
 *                   type: string
 *                   example: "0.0.7296444"
 *                 revenue:
 *                   type: object
 *       400:
 *         description: Bad request (missing file or hospitalCountry)
 *       401:
 *         description: Authentication failed
 *       500:
 *         description: Processing error
 */
/**
 * POST /api/hospital/upload-csv
 * Upload and process CSV file using the adapter
 */
router.post('/upload-csv', authenticateHospital, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }

    const hospitalId = req.hospitalId;
    const hospitalCountry = req.body.hospitalCountry;
    const hospitalLocation = req.body.hospitalLocation || null;
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];

    if (!hospitalCountry) {
      return res.status(400).json({ error: 'Hospital country is required' });
    }

    // Get adapter directory - adapter is now in backend/adapter
    // Try environment variable first, then default to backend/adapter
    let adapterDir = process.env.ADAPTER_PATH;
    
    if (!adapterDir) {
      // Adapter is in backend/adapter (relative to backend/src/routes)
      adapterDir = path.join(__dirname, '../../adapter');
    } else {
      adapterDir = path.resolve(adapterDir);
    }
    
    // Verify adapter directory exists
    try {
      await fs.access(adapterDir);
    } catch {
      return res.status(500).json({
        error: 'Adapter not found',
        details: `Adapter directory not found at: ${adapterDir}`,
        hint: 'The adapter should be located at backend/adapter. Please ensure it exists or set ADAPTER_PATH environment variable.'
      });
    }

    const adapterDataDir = path.join(adapterDir, 'data');
    const adapterScript = path.join(adapterDir, 'src', 'index.js');
    const inputFile = path.join(adapterDataDir, 'raw_data.csv');

    // Verify adapter script exists
    try {
      await fs.access(adapterScript);
    } catch {
      return res.status(500).json({
        error: 'Adapter script not found',
        details: `Adapter script not found at: ${adapterScript}`,
        adapterDir,
        hint: 'Please verify ADAPTER_PATH environment variable or ensure adapter/src/index.js exists.'
      });
    }

    // Ensure adapter data directory exists
    await fs.mkdir(adapterDataDir, { recursive: true });

    // Save uploaded file to adapter's data directory
    await fs.writeFile(inputFile, req.file.buffer);

    // Prepare environment variables for adapter
    const env = {
      ...process.env,
      OPERATOR_ID: process.env.OPERATOR_ID,
      OPERATOR_KEY: process.env.OPERATOR_KEY,
      HEDERA_NETWORK: process.env.HEDERA_NETWORK || 'testnet',
      CONSENT_MANAGER_ADDRESS: process.env.CONSENT_MANAGER_ADDRESS,
      REVENUE_SPLITTER_ADDRESS: process.env.REVENUE_SPLITTER_ADDRESS,
      LOCAL_CURRENCY_CODE: process.env.LOCAL_CURRENCY_CODE,
      USD_TO_LOCAL_RATE: process.env.USD_TO_LOCAL_RATE,
      HOSPITAL_COUNTRY: hospitalCountry,
      HOSPITAL_LOCATION: hospitalLocation,
      HOSPITAL_ID: hospitalId,
      HOSPITAL_API_KEY: apiKey,
      // Adapter runs in same container as backend, so use localhost
      // This avoids network issues and is faster
        BACKEND_API_URL: process.env.BACKEND_API_URL || `http://localhost:${process.env.PORT || 8080}`,
    };

    // Execute adapter script
    let stdout = '';
    let stderr = '';
    try {
      console.log('[CSV Upload] Executing adapter script:', adapterScript);
      console.log('[CSV Upload] Adapter environment:', {
        hasApiKey: !!env.HOSPITAL_API_KEY,
        backendUrl: env.BACKEND_API_URL,
        hospitalId: env.HOSPITAL_ID
      });
      
      const result = await execAsync(
        `cd "${adapterDir}" && node "${adapterScript}"`,
        {
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          env,
        }
      );
      stdout = result.stdout || '';
      stderr = result.stderr || '';
      
      // Log adapter output for debugging
      console.log('[CSV Upload] Adapter stdout length:', stdout.length);
      console.log('[CSV Upload] Adapter stderr length:', stderr.length);
      if (stdout.includes('STORAGE SUMMARY') || stdout.includes('storeFHIRResources')) {
        console.log('[CSV Upload] Adapter storage output found in stdout');
        // Extract storage summary
        const storageMatch = stdout.match(/=== STORAGE SUMMARY ===[\s\S]*?Successful: (\d+)[\s\S]*?Failed: (\d+)/);
        if (storageMatch) {
          console.log('[CSV Upload] Storage summary:', {
            successful: storageMatch[1],
            failed: storageMatch[2]
          });
        }
      }
      if (stderr.includes('storeFHIRResources') || stderr.includes('Adapter Storage')) {
        console.log('[CSV Upload] Adapter storage logs found in stderr');
        // Log first 2000 chars of stderr for debugging
        console.log('[CSV Upload] Adapter stderr preview:', stderr.substring(0, 2000));
      }
    } catch (error) {
      stdout = error.stdout || '';
      stderr = error.stderr || '';
      console.error('[CSV Upload] Adapter execution error:', error.message);
      console.error('[CSV Upload] Adapter stdout:', stdout.substring(0, 2000));
      console.error('[CSV Upload] Adapter stderr:', stderr.substring(0, 2000));
      
      // Clean up file
      await fs.unlink(inputFile).catch(() => {});
      
      return res.status(500).json({
        error: 'Adapter execution failed',
        details: stderr || stdout || error.message,
      });
    }

    // Parse adapter output to extract results
    // Try multiple patterns to catch different output formats
    const consentTopicMatch = stdout.match(/[✓]?\s*Consent Topic: (0\.0\.\d+)/) ||
                              stdout.match(/Consent Topic:\s*(0\.0\.\d+)/);
    const dataTopicMatch = stdout.match(/[✓]?\s*Data Topic: (0\.0\.\d+)/) ||
                           stdout.match(/Data Topic:\s*(0\.0\.\d+)/);
    
    // Try multiple patterns for records (with different spacing/formatting)
    const recordsMatch = stdout.match(/[-\s]*FHIR resources processed:\s*(\d+)/i) || 
                         stdout.match(/[-\s]*CSV records read:\s*(\d+)/i) ||
                         stdout.match(/FHIR resources processed:\s*(\d+)/i) ||
                         stdout.match(/CSV records read:\s*(\d+)/i) ||
                         stdout.match(/resources processed:\s*(\d+)/i);
    
    const consentProofsMatch = stdout.match(/[-\s]*Consent proofs:\s*(\d+)/i) ||
                               stdout.match(/Consent proofs:\s*(\d+)/i);
    
    const dataProofsMatch = stdout.match(/[-\s]*Provenance proofs \(double anonymization\):\s*(\d+)/i) ||
                            stdout.match(/Provenance proofs \(double anonymization\):\s*(\d+)/i) ||
                            stdout.match(/[-\s]*Provenance proofs:\s*(\d+)/i) ||
                            stdout.match(/Provenance proofs:\s*(\d+)/i) ||
                            stdout.match(/[-\s]*Data proofs:\s*(\d+)/i) ||
                            stdout.match(/Data proofs:\s*(\d+)/i);

    let recordsProcessed = recordsMatch ? parseInt(recordsMatch[1], 10) : 0;
    let consentProofs = consentProofsMatch ? parseInt(consentProofsMatch[1], 10) : 0;
    let dataProofs = dataProofsMatch ? parseInt(dataProofsMatch[1], 10) : 0;
    const consentTopicId = consentTopicMatch ? consentTopicMatch[1] : null;
    const dataTopicId = dataTopicMatch ? dataTopicMatch[1] : null;

    // Fallback: Count records directly from database if parsing failed
    if (recordsProcessed === 0) {
      try {
        const { getDatabase, getDatabaseType } = await import('../db/database.js');
        const dbType = getDatabaseType();
        const db = getDatabase();
        
        // Count all FHIR resources for this hospital
        const countQueries = [];
        const tables = ['fhir_patients', 'fhir_conditions', 'fhir_observations', 
                       'fhir_encounters', 'fhir_medication_requests', 'fhir_procedures',
                       'fhir_imaging_studies', 'fhir_allergies', 'fhir_coverage'];
        
        for (const table of tables) {
          try {
            if (dbType === 'postgresql') {
              const result = await db.query(
                `SELECT COUNT(*) as count FROM ${table} WHERE hospital_id = $1`,
                [hospitalId]
              );
              if (result.rows && result.rows[0]) {
                recordsProcessed += parseInt(result.rows[0].count || 0);
              }
            } else {
              const { get } = await import('../db/database.js');
              const result = await get(
                `SELECT COUNT(*) as count FROM ${table} WHERE hospital_id = ?`,
                [hospitalId]
              );
              recordsProcessed += parseInt(result?.count || 0);
            }
          } catch (error) {
            // Table might not exist, skip it
            if (!error.message.includes('does not exist') && !error.message.includes('no such table')) {
              console.warn(`[CSV Upload] Error counting ${table}:`, error.message);
            }
          }
        }
        
        if (recordsProcessed > 0) {
          console.log(`[CSV Upload] Fallback: Counted ${recordsProcessed} records from database`);
        }
      } catch (error) {
        console.warn('[CSV Upload] Fallback count failed:', error.message);
      }
    }

    // Debug: Log what we extracted
    console.log('[CSV Upload] Parsed results:', {
      recordsProcessed,
      consentProofs,
      dataProofs,
      consentTopicId,
      dataTopicId,
      stdoutLength: stdout.length,
      stdoutPreview: stdout.substring(0, 2000) // First 2000 chars for debugging
    });

    // Calculate revenue split
    const hbarPerRecord = 0.01;
    const totalHbar = recordsProcessed * hbarPerRecord;
    const hbarToUsdRate = 0.05;
    const totalUsd = totalHbar * hbarToUsdRate;
    
    const revenue = {
      totalHbar,
      totalUsd,
      patient: {
        hbar: totalHbar * 0.6,
        usd: totalUsd * 0.6,
        percentage: 60,
      },
      hospital: {
        hbar: totalHbar * 0.25,
        usd: totalUsd * 0.25,
        percentage: 25,
      },
      medipact: {
        hbar: totalHbar * 0.15,
        usd: totalUsd * 0.15,
        percentage: 15,
      },
    };

    // Clean up input file
    await fs.unlink(inputFile).catch(() => {});

    // Save processing history
    const { createProcessingHistory } = await import('../db/processing-history-db.js');
    await createProcessingHistory({
      hospitalId,
      fileName: req.file.originalname,
      recordsProcessed,
      consentProofs,
      dataProofs,
      consentTopicId,
      dataTopicId,
      status: 'completed',
    });

    res.json({
      recordsProcessed,
      consentProofs,
      dataProofs,
      consentTopicId,
      dataTopicId,
      transactions: [], // Adapter output parsing can be enhanced to extract transaction IDs
      revenue,
    });
  } catch (error) {
    console.error('Error processing CSV upload:', error);
    res.status(500).json({
      error: 'Processing failed',
      details: error.message,
    });
  }
});

export default router;

