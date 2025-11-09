/**
 * Admin API Routes
 * 
 * Admin-only routes for managing hospitals, verifications, etc.
 * Protected with JWT authentication.
 */

import express from 'express';
import { getHospital, getAllHospitals, updateHospital } from '../db/hospital-db.js';
import { verifyHospital, rejectHospitalVerification } from '../services/hospital-verification-service.js';
import { verifyAdminToken, extractTokenFromHeader } from '../services/admin-auth-service.js';

const router = express.Router();

/**
 * Admin authentication middleware
 */
async function authenticateAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || req.headers['x-admin-token'];
    const token = extractTokenFromHeader(authHeader);
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Authentication required',
        message: 'Please provide a valid admin token'
      });
    }
    
    const admin = await verifyAdminToken(token);
    req.admin = admin;
    next();
  } catch (error) {
    console.error('Admin authentication error:', error);
    res.status(401).json({ 
      error: 'Invalid or expired token',
      message: error.message 
    });
  }
}

// Apply authentication middleware to all admin routes
router.use(authenticateAdmin);

/**
 * GET /api/admin/hospitals
 * List all hospitals with verification status
 */
router.get('/hospitals', async (req, res) => {
  try {
    const hospitals = await getAllHospitals();
    
    // Format hospitals with verification status
    const formattedHospitals = hospitals.map(hospital => {
      let verificationDocuments = null;
      if (hospital.verificationDocuments) {
        try {
          // If it's already an object, use it; otherwise parse JSON string
          verificationDocuments = typeof hospital.verificationDocuments === 'string' 
            ? JSON.parse(hospital.verificationDocuments) 
            : hospital.verificationDocuments;
        } catch (e) {
          verificationDocuments = { raw: hospital.verificationDocuments };
        }
      }

      return {
        hospitalId: hospital.hospitalId,
        name: hospital.name,
        country: hospital.country,
        location: hospital.location,
        contactEmail: hospital.contactEmail,
        registeredAt: hospital.registeredAt,
        verificationStatus: hospital.verificationStatus || 'pending',
        verifiedAt: hospital.verifiedAt,
        verifiedBy: hospital.verifiedBy,
        verificationDocuments: verificationDocuments
      };
    });

    res.json({ hospitals: formattedHospitals });
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch hospitals' });
  }
});

/**
 * GET /api/admin/hospitals/:hospitalId
 * Get detailed hospital information including verification documents
 */
router.get('/hospitals/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const hospital = await getHospital(hospitalId);

    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    let verificationDocuments = null;
    if (hospital.verificationDocuments) {
      try {
        // If it's already an object, use it; otherwise parse JSON string
        verificationDocuments = typeof hospital.verificationDocuments === 'string' 
          ? JSON.parse(hospital.verificationDocuments) 
          : hospital.verificationDocuments;
      } catch (e) {
        verificationDocuments = { raw: hospital.verificationDocuments };
      }
    }

    res.json({
      hospitalId: hospital.hospitalId,
      name: hospital.name,
      country: hospital.country,
      location: hospital.location,
      fhirEndpoint: hospital.fhirEndpoint,
      contactEmail: hospital.contactEmail,
      registeredAt: hospital.registeredAt,
      verificationStatus: hospital.verificationStatus || 'pending',
      verifiedAt: hospital.verifiedAt,
      verifiedBy: hospital.verifiedBy,
      verificationDocuments: verificationDocuments
    });
  } catch (error) {
    console.error('Error fetching hospital:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch hospital' });
  }
});

/**
 * POST /api/admin/hospitals/:hospitalId/verify
 * Approve hospital verification
 */
router.post('/hospitals/:hospitalId/verify', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const adminId = req.admin.username; // Get from authenticated admin session

    const hospital = await getHospital(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    const updated = await verifyHospital(
      hospitalId,
      adminId,
      async (id, updates) => await updateHospital(id, updates)
    );

    res.json({
      success: true,
      hospital: {
        hospitalId: updated.hospitalId,
        name: updated.name,
        verificationStatus: updated.verificationStatus,
        verifiedAt: updated.verifiedAt,
        verifiedBy: updated.verifiedBy
      }
    });
  } catch (error) {
    console.error('Error verifying hospital:', error);
    res.status(500).json({ error: error.message || 'Failed to verify hospital' });
  }
});

/**
 * POST /api/admin/hospitals/:hospitalId/reject
 * Reject hospital verification
 */
router.post('/hospitals/:hospitalId/reject', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.username; // Get from authenticated admin session

    if (!reason || reason.trim().length === 0) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }

    const hospital = await getHospital(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    const updated = await rejectHospitalVerification(
      hospitalId,
      adminId,
      reason,
      async (id, updates) => await updateHospital(id, updates)
    );

    res.json({
      success: true,
      hospital: {
        hospitalId: updated.hospitalId,
        name: updated.name,
        verificationStatus: updated.verificationStatus,
        verifiedBy: updated.verifiedBy
      }
    });
  } catch (error) {
    console.error('Error rejecting hospital:', error);
    res.status(500).json({ error: error.message || 'Failed to reject hospital' });
  }
});

export default router;

