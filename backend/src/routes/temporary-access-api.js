/**
 * Temporary Access API Routes
 * 
 * Endpoints for hospitals to request temporary access to patient data
 * and for patients to approve/reject these requests.
 */

import express from 'express';
import {
  requestTemporaryAccess,
  approveTemporaryAccessRequest,
  rejectTemporaryAccessRequest,
  revokeTemporaryAccessRequest,
  checkTemporaryAccess,
  getTimeRemaining,
  formatDuration
} from '../services/temporary-access-service.js';
import {
  getPendingAccessRequestsForPatient,
  getActiveAccessRequestsForHospital,
  getTemporaryAccessRequest
} from '../db/temporary-access-db.js';
import { verifyHospitalApiKey } from '../db/hospital-db.js';
import { getPatient } from '../db/patient-db.js';

const router = express.Router();

/**
 * Middleware to authenticate hospital
 */
async function authenticateHospital(req, res, next) {
  const hospitalId = req.headers['x-hospital-id'] || req.headers['X-Hospital-ID'];
  const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
  
  if (!hospitalId || !apiKey) {
    return res.status(401).json({ error: 'Missing hospital credentials' });
  }
  
  const isValid = await verifyHospitalApiKey(hospitalId, apiKey);
  
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid hospital credentials' });
  }
  
  req.hospitalId = hospitalId;
  next();
}

/**
 * Middleware to authenticate patient
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
  req.patientUPI = upi;
  next();
}

/**
 * POST /api/hospital/temporary-access/request
 * Hospital requests temporary access to patient data
 */
router.post('/hospital/temporary-access/request', authenticateHospital, async (req, res) => {
  try {
    const { upi, originalHospitalId, accessType, durationMinutes, durationHours, purpose } = req.body;
    const requestingHospitalId = req.hospitalId;
    
    if (!upi || !originalHospitalId) {
      return res.status(400).json({ 
        error: 'Missing required fields: upi, originalHospitalId' 
      });
    }
    
    // Calculate duration in minutes
    let durationMinutesCalculated = durationMinutes;
    if (durationHours && !durationMinutes) {
      durationMinutesCalculated = durationHours * 60;
    }
    
    if (!durationMinutesCalculated) {
      return res.status(400).json({ 
        error: 'Missing required field: durationMinutes or durationHours' 
      });
    }
    
    const request = await requestTemporaryAccess({
      upi,
      requestingHospitalId,
      originalHospitalId,
      accessType: accessType || 'telemedicine',
      durationMinutes: durationMinutesCalculated,
      purpose: purpose || 'Telemedicine consultation'
    });
    
    res.json({
      message: 'Temporary access request created. Waiting for patient approval.',
      request: {
        ...request,
        durationFormatted: formatDuration(request.durationMinutes)
      }
    });
  } catch (error) {
    console.error('Error creating temporary access request:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/hospital/temporary-access/active
 * Get active temporary access requests for hospital
 */
router.get('/hospital/temporary-access/active', authenticateHospital, async (req, res) => {
  try {
    const activeRequests = await getActiveAccessRequestsForHospital(req.hospitalId);
    
    // Add time remaining to each request
    const requestsWithTimeRemaining = activeRequests.map(request => ({
      ...request,
      timeRemainingMinutes: getTimeRemaining(request),
      durationFormatted: formatDuration(request.durationMinutes)
    }));
    
    res.json({
      requests: requestsWithTimeRemaining,
      count: requestsWithTimeRemaining.length
    });
  } catch (error) {
    console.error('Error fetching active access requests:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/patient/:upi/temporary-access/pending
 * Get pending temporary access requests for patient
 */
router.get('/patient/:upi/temporary-access/pending', authenticatePatient, async (req, res) => {
  try {
    const requests = await getPendingAccessRequestsForPatient(req.patientUPI);
    
    // Add formatted duration
    const requestsWithDuration = requests.map(request => ({
      ...request,
      durationFormatted: formatDuration(request.durationMinutes)
    }));
    
    res.json({
      requests: requestsWithDuration,
      count: requestsWithDuration.length
    });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/patient/:upi/temporary-access/:requestId/approve
 * Patient approves temporary access request
 */
router.post('/patient/:upi/temporary-access/:requestId/approve', authenticatePatient, async (req, res) => {
  try {
    const { requestId } = req.params;
    const requestIdNum = parseInt(requestId);
    
    if (isNaN(requestIdNum)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }
    
    const approved = await approveTemporaryAccessRequest(requestIdNum, req.patientUPI);
    
    res.json({
      message: 'Temporary access approved successfully',
      request: {
        ...approved,
        timeRemainingMinutes: getTimeRemaining(approved),
        durationFormatted: formatDuration(approved.durationMinutes)
      }
    });
  } catch (error) {
    console.error('Error approving access request:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/patient/:upi/temporary-access/:requestId/reject
 * Patient rejects temporary access request
 */
router.post('/patient/:upi/temporary-access/:requestId/reject', authenticatePatient, async (req, res) => {
  try {
    const { requestId } = req.params;
    const requestIdNum = parseInt(requestId);
    
    if (isNaN(requestIdNum)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }
    
    const rejected = await rejectTemporaryAccessRequest(requestIdNum, req.patientUPI);
    
    res.json({
      message: 'Temporary access request rejected',
      request: rejected
    });
  } catch (error) {
    console.error('Error rejecting access request:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/patient/:upi/temporary-access/:requestId/revoke
 * Patient revokes active temporary access
 */
router.post('/patient/:upi/temporary-access/:requestId/revoke', authenticatePatient, async (req, res) => {
  try {
    const { requestId } = req.params;
    const requestIdNum = parseInt(requestId);
    
    if (isNaN(requestIdNum)) {
      return res.status(400).json({ error: 'Invalid request ID' });
    }
    
    const revoked = await revokeTemporaryAccessRequest(requestIdNum, req.patientUPI);
    
    res.json({
      message: 'Temporary access revoked successfully',
      request: revoked
    });
  } catch (error) {
    console.error('Error revoking access:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/hospital/temporary-access/check
 * Check if hospital has active temporary access to patient data
 */
router.get('/hospital/temporary-access/check', authenticateHospital, async (req, res) => {
  try {
    const { upi, originalHospitalId } = req.query;
    
    if (!upi) {
      return res.status(400).json({ error: 'UPI is required' });
    }
    
    const hasAccess = await checkTemporaryAccess(
      req.hospitalId,
      upi,
      originalHospitalId || null
    );
    
    res.json({
      hasAccess,
      hospitalId: req.hospitalId,
      upi,
      originalHospitalId: originalHospitalId || null
    });
  } catch (error) {
    console.error('Error checking temporary access:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

