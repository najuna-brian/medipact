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
      BACKEND_API_URL: process.env.FRONTEND_URL || process.env.BACKEND_API_URL || 'http://localhost:3002',
    };

    // Execute adapter script
    let stdout = '';
    let stderr = '';
    try {
      const result = await execAsync(
        `cd "${adapterDir}" && node "${adapterScript}"`,
        {
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          env,
        }
      );
      stdout = result.stdout || '';
      stderr = result.stderr || '';
    } catch (error) {
      stdout = error.stdout || '';
      stderr = error.stderr || '';
      console.error('Adapter execution error:', error.message);
      console.error('Adapter stdout:', stdout);
      console.error('Adapter stderr:', stderr);
      
      // Clean up file
      await fs.unlink(inputFile).catch(() => {});
      
      return res.status(500).json({
        error: 'Adapter execution failed',
        details: stderr || stdout || error.message,
      });
    }

    // Parse adapter output to extract results
    // Adapter outputs "✓ Consent Topic: 0.0.xxxxx" or "Consent Topic: 0.0.xxxxx"
    const consentTopicMatch = stdout.match(/[✓]?\s*Consent Topic: (0\.0\.\d+)/);
    const dataTopicMatch = stdout.match(/[✓]?\s*Data Topic: (0\.0\.\d+)/);
    // Match actual adapter output format (with optional "  - " prefix from summary)
    const recordsMatch = stdout.match(/\s*-\s*FHIR resources processed: (\d+)/) || 
                         stdout.match(/FHIR resources processed: (\d+)/) ||
                         stdout.match(/\s*-\s*CSV records read: (\d+)/) ||
                         stdout.match(/CSV records read: (\d+)/);
    const consentProofsMatch = stdout.match(/\s*-\s*Consent proofs: (\d+)/) ||
                               stdout.match(/Consent proofs: (\d+)/);
    const dataProofsMatch = stdout.match(/\s*-\s*Provenance proofs \(double anonymization\): (\d+)/) ||
                            stdout.match(/Provenance proofs \(double anonymization\): (\d+)/) ||
                            stdout.match(/\s*-\s*Provenance proofs: (\d+)/) ||
                            stdout.match(/Provenance proofs: (\d+)/);

    const recordsProcessed = recordsMatch ? parseInt(recordsMatch[1], 10) : 0;
    const consentProofs = consentProofsMatch ? parseInt(consentProofsMatch[1], 10) : 0;
    const dataProofs = dataProofsMatch ? parseInt(dataProofsMatch[1], 10) : 0;
    const consentTopicId = consentTopicMatch ? consentTopicMatch[1] : null;
    const dataTopicId = dataTopicMatch ? dataTopicMatch[1] : null;

    // Debug: Log what we extracted
    console.log('[CSV Upload] Parsed results:', {
      recordsProcessed,
      consentProofs,
      dataProofs,
      consentTopicId,
      dataTopicId,
      stdoutPreview: stdout.substring(0, 1000) // First 1000 chars for debugging
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

