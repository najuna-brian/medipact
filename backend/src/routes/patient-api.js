/**
 * Patient API Routes
 * 
 * RESTful API for patient identity and medical history access.
 */

import express from 'express';
import { generateUPI, matchPatientToUPI, getOrCreateUPI, isValidUPI } from '../services/patient-identity-service.js';
import { getPatientHospitalLinkages, linkHospitalToUPI, removeHospitalLinkage } from '../services/hospital-linkage-service.js';
import { getPatientMedicalHistory, getHospitalMedicalHistory, getPatientSummary } from '../services/patient-history-service.js';
import { verifyHospital } from '../services/hospital-registry-service.js';
import { createPatient, patientExists, getPatient } from '../db/patient-db.js';
import { getLinkagesByUPI, getLinkage, createLinkage, removeLinkage } from '../db/linkage-db.js';
import { lookupPatientUPI, registerPatientWithContact } from '../services/patient-lookup-service.js';
import { findUPIByEmail, findUPIByPhone, findUPIByNationalId, upsertPatientContact } from '../db/patient-contacts-db.js';
import { processBulkRegistration } from '../services/bulk-patient-service.js';
import { requirePatientAccess, restrictPlatformAccess } from '../middleware/access-control.js';

const router = express.Router();

// Middleware for patient authentication (placeholder - implement actual auth)
async function authenticatePatient(req, res, next) {
  // TODO: Implement patient authentication
  // For now, accept UPI from URL params, query, or body
  const upi = req.params.upi || req.query.upi || req.body.upi;
  if (!upi || !isValidUPI(upi)) {
    return res.status(401).json({ error: 'Invalid or missing UPI' });
  }
  req.patientUPI = upi;
  next();
}

// Middleware for hospital authentication (placeholder - implement actual auth)
async function authenticateHospital(req, res, next) {
  // TODO: Implement hospital authentication
  const hospitalId = req.headers['x-hospital-id'];
  const apiKey = req.headers['x-api-key'];
  
  if (!hospitalId || !apiKey) {
    return res.status(401).json({ error: 'Missing hospital credentials' });
  }
  
  // Verify hospital
  const isValid = await verifyHospital(hospitalId, apiKey, async (id, key) => {
    // TODO: Implement actual verification
    return true; // Placeholder
  });
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid hospital credentials' });
  }
  
  req.hospitalId = hospitalId;
  next();
}

/**
 * @swagger
 * /api/patient/register:
 *   post:
 *     summary: Register a new patient
 *     description: Register a new patient and generate UPI (Universal Patient Identifier) with contact information. Creates a Hedera account for revenue distribution.
 *     tags: [Patient]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - dateOfBirth
 *             properties:
 *               name:
 *                 type: string
 *                 example: "John Doe"
 *                 description: Patient's full name
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-15"
 *                 description: Patient's date of birth
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *                 description: Patient's phone number (optional)
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "john.doe@example.com"
 *                 description: Patient's email address (optional)
 *               nationalId:
 *                 type: string
 *                 example: "123456789"
 *                 description: Patient's national ID (optional)
 *     responses:
 *       200:
 *         description: Patient registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 upi:
 *                   type: string
 *                   example: "UPI-ABC123XYZ"
 *                   description: Universal Patient Identifier
 *                 patient:
 *                   $ref: '#/components/schemas/Patient'
 *                 message:
 *                   type: string
 *                   example: "Patient registered successfully"
 *       400:
 *         description: Bad request - missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
/**
 * POST /api/patient/register
 * Register a new patient and generate UPI (with contact information)
 */
router.post('/register', async (req, res) => {
  try {
    const { 
      name, 
      dateOfBirth, 
      phone, 
      nationalId, 
      email,
      // Payment method fields (optional)
      paymentMethod,
      bankAccountNumber,
      bankName,
      mobileMoneyProvider,
      mobileMoneyNumber,
      withdrawalThresholdUSD,
      autoWithdrawEnabled
    } = req.body;
    
    if (!name || !dateOfBirth) {
      return res.status(400).json({ 
        error: 'Name and Date of Birth are required' 
      });
    }
    
    const result = await registerPatientWithContact(
      { name, dateOfBirth, phone, nationalId, email },
      generateUPI,
      async (upi, patientData) => {
        // Add payment method fields to patient data
        const patientWithPayment = {
          ...patientData,
          paymentMethod: paymentMethod || null,
          bankAccountNumber: bankAccountNumber || null,
          bankName: bankName || null,
          mobileMoneyProvider: mobileMoneyProvider || null,
          mobileMoneyNumber: mobileMoneyNumber || null,
          withdrawalThresholdUSD: withdrawalThresholdUSD || 10.00,
          autoWithdrawEnabled: autoWithdrawEnabled !== false // Default true
        };
        await createPatient(upi, patientWithPayment);
      },
      async (upi, contactInfo) => {
        await upsertPatientContact(upi, contactInfo);
      }
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error registering patient:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/patient/lookup
 * Lookup patient UPI by email, phone, or national ID
 */
router.post('/lookup', async (req, res) => {
  try {
    const { email, phone, nationalId } = req.body;
    
    if (!email && !phone && !nationalId) {
      return res.status(400).json({ 
        error: 'At least one of email, phone, or nationalId is required' 
      });
    }
    
    const upi = await lookupPatientUPI(
      { email, phone, nationalId },
      findUPIByEmail,
      findUPIByPhone,
      findUPIByNationalId
    );
    
    if (upi) {
      res.json({ upi, found: true });
    } else {
      res.json({ found: false, message: 'Patient not found' });
    }
  } catch (error) {
    console.error('Error looking up patient:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/patient/match
 * Match patient to existing UPI
 */
router.post('/match', async (req, res) => {
  try {
    const { name, dateOfBirth, phone, nationalId } = req.body;
    
    if (!name || !dateOfBirth) {
      return res.status(400).json({ 
        error: 'Name and Date of Birth are required' 
      });
    }
    
    const upi = await matchPatientToUPI(
      { name, dateOfBirth, phone, nationalId },
      async (upi) => {
        // Check if UPI exists in database
        return await patientExists(upi);
      }
    );
    
    if (upi) {
      res.json({ upi, exists: true });
    } else {
      res.json({ exists: false, message: 'Patient not found' });
    }
  } catch (error) {
    console.error('Error matching patient:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/patient/:upi/history
 * Get complete medical history across all hospitals
 * Only patient can decrypt their own data - platform sees encrypted data
 */
router.get('/:upi/history', authenticatePatient, requirePatientAccess, restrictPlatformAccess, async (req, res) => {
  try {
    const { upi } = req.params;
    
    const history = await getPatientMedicalHistory(
      upi,
      async (upi) => {
        // Get linkages from database
        return await getLinkagesByUPI(upi);
      },
      async (hospitalId, hospitalPatientId) => {
        // TODO: Get records from hospital system
        // return await fetchHospitalRecords(hospitalId, hospitalPatientId);
        return []; // Placeholder - will be implemented when hospital systems are integrated
      }
    );
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching patient history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/patient/:upi/history/:hospitalId
 * Get medical history from specific hospital
 * Only patient can decrypt their own data - platform sees encrypted data
 */
router.get('/:upi/history/:hospitalId', authenticatePatient, requirePatientAccess, restrictPlatformAccess, async (req, res) => {
  try {
    const { upi, hospitalId } = req.params;
    
    const history = await getHospitalMedicalHistory(
      upi,
      hospitalId,
      async (upi, hospitalId) => {
        // Get linkage from database
        return await getLinkage(upi, hospitalId);
      },
      async (hospitalId, hospitalPatientId) => {
        // TODO: Get records from hospital
        // return await fetchHospitalRecords(hospitalId, hospitalPatientId);
        return []; // Placeholder - will be implemented when hospital systems are integrated
      }
    );
    
    res.json(history);
  } catch (error) {
    console.error('Error fetching hospital history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/patient/:upi/summary
 * Get patient summary statistics
 */
router.get('/:upi/summary', authenticatePatient, async (req, res) => {
  try {
    const { upi } = req.params;
    
    // Get complete history first
    const history = await getPatientMedicalHistory(
      upi,
      async (upi) => {
        // Get linkages from database
        return await getLinkagesByUPI(upi);
      },
      async (hospitalId, hospitalPatientId) => {
        // TODO: Get records from hospital system
        // return await fetchHospitalRecords(hospitalId, hospitalPatientId);
        return []; // Placeholder - will be implemented when hospital systems are integrated
      }
    );
    
    // Get summary from history (include patient record for Hedera Account ID)
    const summary = await getPatientSummary(
      upi, 
      async () => history,
      async (upi) => {
        return await getPatient(upi);
      }
    );
    
    res.json(summary);
  } catch (error) {
    console.error('Error fetching patient summary:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/patient/:upi/hospitals
 * Get list of hospitals patient is linked to
 */
router.get('/:upi/hospitals', authenticatePatient, async (req, res) => {
  try {
    const { upi } = req.params;
    
    const linkages = await getPatientHospitalLinkages(
      upi,
      async (upi) => {
        // Get linkages from database
        return await getLinkagesByUPI(upi);
      }
    );
    
    res.json({
      upi,
      hospitals: linkages.map(l => ({
        hospitalId: l.hospitalId,
        hospitalName: l.hospitalName || l.hospitalId,
        hospitalPatientId: l.hospitalPatientId,
        linkedAt: l.linkedAt,
        verified: l.verified
      }))
    });
  } catch (error) {
    console.error('Error fetching patient hospitals:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/patient/:upi/link-hospital
 * Link patient to a new hospital
 */
router.post('/:upi/link-hospital', authenticatePatient, authenticateHospital, async (req, res) => {
  try {
    const { upi } = req.params;
    const { hospitalPatientId, verificationMethod } = req.body;
    const { hospitalId } = req;
    
    if (!hospitalPatientId) {
      return res.status(400).json({ 
        error: 'hospitalPatientId is required' 
      });
    }
    
    const linkage = await linkHospitalToUPI(
      upi,
      hospitalId,
      hospitalPatientId,
      {
        verified: true,
        verificationMethod: verificationMethod || 'hospital_verification'
      },
      async (linkage) => {
        // Store linkage in database
        return await createLinkage(linkage);
      }
    );
    
    res.json({
      message: 'Hospital linked successfully',
      linkage
    });
  } catch (error) {
    console.error('Error linking hospital:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/patient/:upi/link-hospital/:hospitalId
 * Remove hospital linkage
 */
router.delete('/:upi/link-hospital/:hospitalId', authenticatePatient, async (req, res) => {
  try {
    const { upi, hospitalId } = req.params;
    
    await removeHospitalLinkage(
      upi,
      hospitalId,
      async (upi, hospitalId) => {
        // Remove linkage from database
        await removeLinkage(upi, hospitalId);
      }
    );
    
    res.json({
      message: 'Hospital linkage removed successfully'
    });
  } catch (error) {
    console.error('Error removing hospital linkage:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/patient/retrieve-upi
 * Retrieve UPI via email/phone (sends UPI to patient)
 */
router.post('/retrieve-upi', async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    if (!email && !phone) {
      return res.status(400).json({ 
        error: 'Email or phone is required' 
      });
    }
    
    const upi = await lookupPatientUPI(
      { email, phone },
      findUPIByEmail,
      findUPIByPhone,
      () => Promise.resolve(null)
    );
    
    if (!upi) {
      return res.status(404).json({ 
        error: 'Patient not found' 
      });
    }
    
    // TODO: Send UPI via email/SMS
    // For now, just return it (in production, send via email/SMS service)
    res.json({
      message: 'UPI retrieved successfully',
      upi: upi,
      sentVia: email ? 'email' : 'sms'
    });
  } catch (error) {
    console.error('Error retrieving UPI:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

