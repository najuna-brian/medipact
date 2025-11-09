/**
 * Hospital API Routes
 * 
 * RESTful API for hospital registration and management.
 */

import express from 'express';
import crypto from 'crypto';
import { registerHospital, getHospital, updateHospital } from '../services/hospital-registry-service.js';
import { verifyHospital } from '../services/hospital-registry-service.js';
import { createHospital, getHospital as getHospitalFromDB, updateHospital as updateHospitalInDB, verifyHospitalApiKey, hospitalExists } from '../db/hospital-db.js';
import { submitVerificationDocuments, getVerificationStatus, isHospitalVerified } from '../services/hospital-verification-service.js';

const router = express.Router();

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
 * POST /api/hospital/register
 * Register a new hospital
 */
router.post('/register', async (req, res) => {
  try {
    const { name, country, location, fhirEndpoint, contactEmail } = req.body;
    
    if (!name || !country) {
      return res.status(400).json({ 
        error: 'Hospital name and country are required' 
      });
    }
    
    // Generate API key for hospital (in production, this should be more secure)
    const apiKey = crypto.randomBytes(32).toString('hex');
    
    const hospital = await registerHospital(
      { name, country, location, fhirEndpoint, contactEmail, apiKey },
      async (hospitalId) => {
        // Check if hospital exists
        return await hospitalExists(hospitalId);
      },
      async (hospitalRecord) => {
        // Store hospital in database
        return await createHospital(hospitalRecord);
      }
    );
    
    // Return hospital with API key (only on creation)
    // Note: hospital object from registerHospital doesn't include apiKey for security
    res.json({
      message: 'Hospital registered successfully',
      hospital: {
        ...hospital,
        apiKey, // Only returned on creation - hospital should save this securely
        hederaAccountId: hospital.hederaAccountId // Include Hedera Account ID
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

export default router;

