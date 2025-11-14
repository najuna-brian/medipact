/**
 * Patient Preferences API Routes
 * 
 * Endpoints for patients to manage their data sharing preferences.
 */

import express from 'express';
import {
  getOrCreatePatientPreferences,
  getPatientPreferences,
  updatePatientPreferences
} from '../db/patient-preferences-db.js';
import {
  checkPatientDataAccess,
  requestPatientApproval,
  approveResearcher,
  blockResearcher,
  getPendingApprovalRequests,
  getApprovedResearchers
} from '../services/patient-preferences-service.js';
import { getPatientAccessHistory, recordDataAccess } from '../db/patient-preferences-db.js';
import { getPatient } from '../db/patient-db.js';

const router = express.Router();

/**
 * Middleware to authenticate patient
 * TODO: Implement proper patient authentication with Hedera signatures
 */
async function authenticatePatient(req, res, next) {
  const { upi } = req.params;
  
  if (!upi) {
    return res.status(400).json({ error: 'UPI is required' });
  }
  
  // Verify patient exists
  const patient = await getPatient(upi);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  
  // TODO: Verify patient signature with Hedera account
  // For now, accept UPI from params
  
  req.patientUPI = upi;
  req.patient = patient;
  next();
}

/**
 * GET /api/patient/:upi/preferences
 * Get patient data sharing preferences
 */
router.get('/:upi/preferences', authenticatePatient, async (req, res) => {
  try {
    const preferences = await getOrCreatePatientPreferences(req.patientUPI);
    res.json(preferences);
  } catch (error) {
    console.error('Error fetching patient preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/patient/:upi/preferences
 * Update patient data sharing preferences
 */
router.put('/:upi/preferences', authenticatePatient, async (req, res) => {
  try {
    const updates = req.body;
    
    // Validate updates
    const allowedFields = [
      'globalSharingEnabled',
      'allowVerifiedResearchers',
      'allowUnverifiedResearchers',
      'allowBulkPurchases',
      'allowSensitiveDataSharing',
      'approvedResearcherIds',
      'blockedResearcherIds',
      'approvedResearcherCategories',
      'blockedResearcherCategories',
      'notifyOnDataAccess',
      'notifyOnNewResearcher',
      'minimumPricePerRecord'
    ];
    
    const validUpdates = {};
    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        validUpdates[key] = updates[key];
      }
    }
    
    const updated = await updatePatientPreferences(req.patientUPI, validUpdates);
    res.json(updated);
  } catch (error) {
    console.error('Error updating patient preferences:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/patient/:upi/approvals/pending
 * Get pending approval requests
 */
router.get('/:upi/approvals/pending', authenticatePatient, async (req, res) => {
  try {
    const requests = await getPendingApprovalRequests(req.patientUPI);
    res.json({ requests, count: requests.length });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/patient/:upi/approvals/approved
 * Get approved researchers
 */
router.get('/:upi/approvals/approved', authenticatePatient, async (req, res) => {
  try {
    const approved = await getApprovedResearchers(req.patientUPI);
    res.json({ researchers: approved, count: approved.length });
  } catch (error) {
    console.error('Error fetching approved researchers:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/patient/:upi/approvals/:researcherId/approve
 * Patient approves a researcher
 */
router.post('/:upi/approvals/:researcherId/approve', authenticatePatient, async (req, res) => {
  try {
    const { researcherId } = req.params;
    const { conditions } = req.body;
    
    const approval = await approveResearcher(req.patientUPI, researcherId, conditions);
    res.json({
      message: 'Researcher approved successfully',
      approval
    });
  } catch (error) {
    console.error('Error approving researcher:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/patient/:upi/approvals/:researcherId/block
 * Patient blocks a researcher
 */
router.post('/:upi/approvals/:researcherId/block', authenticatePatient, async (req, res) => {
  try {
    const { researcherId } = req.params;
    
    const preferences = await blockResearcher(req.patientUPI, researcherId);
    res.json({
      message: 'Researcher blocked successfully',
      preferences
    });
  } catch (error) {
    console.error('Error blocking researcher:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/patient/:upi/approvals/:researcherId/reject
 * Patient rejects a researcher request
 */
router.post('/:upi/approvals/:researcherId/reject', authenticatePatient, async (req, res) => {
  try {
    const { researcherId } = req.params;
    
    const { setPatientResearcherApproval } = await import('../db/patient-preferences-db.js');
    const approval = await setPatientResearcherApproval(
      req.patientUPI,
      researcherId,
      'rejected'
    );
    
    res.json({
      message: 'Researcher request rejected',
      approval
    });
  } catch (error) {
    console.error('Error rejecting researcher:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/patient/:upi/access-history
 * Get data access history for patient
 */
router.get('/:upi/access-history', authenticatePatient, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const history = await getPatientAccessHistory(req.patientUPI, limit);
    res.json({ history, count: history.length });
  } catch (error) {
    console.error('Error fetching access history:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/researcher/:researcherId/request-access
 * Researcher requests access to patient data
 */
router.post('/researcher/:researcherId/request-access', async (req, res) => {
  try {
    const { researcherId } = req.params;
    const { upi, recordCount, purpose, isSensitive } = req.body;
    
    if (!upi) {
      return res.status(400).json({ error: 'Patient UPI is required' });
    }
    
    // Check if access is already allowed
    const accessCheck = await checkPatientDataAccess(
      upi,
      researcherId,
      null,
      { recordCount, isSensitive }
    );
    
    if (accessCheck.allowed) {
      return res.json({
        status: 'approved',
        message: 'Access already allowed based on patient preferences',
        accessCheck
      });
    }
    
    if (accessCheck.requiresApproval) {
      // Create approval request
      const request = await requestPatientApproval(upi, researcherId, {
        recordCount,
        purpose,
        isSensitive
      });
      
      return res.json({
        status: 'pending',
        message: 'Approval request created. Waiting for patient approval.',
        request
      });
    }
    
    // Access denied
    res.status(403).json({
      status: 'denied',
      message: accessCheck.reason,
      accessCheck
    });
  } catch (error) {
    console.error('Error requesting access:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

