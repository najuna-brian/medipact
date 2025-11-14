/**
 * Admin API Routes
 * 
 * Admin-only routes for managing hospitals, verifications, etc.
 * Protected with JWT authentication.
 */

import express from 'express';
import { getHospital, getAllHospitals, updateHospital } from '../db/hospital-db.js';
import { verifyHospital, rejectHospitalVerification } from '../services/hospital-verification-service.js';
import { getAllResearchers, getResearcher, updateResearcher } from '../db/researcher-db.js';
import { verifyResearcher, rejectResearcherVerification } from '../services/researcher-registry-service.js';
import { verifyAdminToken, extractTokenFromHeader } from '../services/admin-auth-service.js';
import { completeWithdrawal, retryFailedWithdrawals } from '../services/withdrawal-service.js';
import { getPendingWithdrawals, getWithdrawalHistoryForUser } from '../db/withdrawal-db.js';
import { triggerWithdrawalJob } from '../services/automatic-withdrawal-job.js';
import { all } from '../db/database.js';

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
        registrationNumber: hospital.registrationNumber,
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
      registrationNumber: hospital.registrationNumber,
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

/**
 * GET /api/admin/researchers
 * List all researchers with verification status
 */
router.get('/researchers', async (req, res) => {
  try {
    const researchers = await getAllResearchers();
    
    const formattedResearchers = researchers.map(r => {
      let verificationDocuments = null;
      if (r.verificationDocuments) {
        try {
          verificationDocuments = typeof r.verificationDocuments === 'string' 
            ? JSON.parse(r.verificationDocuments) 
            : r.verificationDocuments;
        } catch (e) {
          verificationDocuments = { raw: r.verificationDocuments };
        }
      }
      
      return {
        researcherId: r.researcherId,
        hederaAccountId: r.hederaAccountId,
        email: r.email,
        organizationName: r.organizationName,
        contactName: r.contactName,
        country: r.country,
        registrationNumber: r.registrationNumber,
        verificationStatus: r.verificationStatus,
        accessLevel: r.accessLevel,
        verifiedAt: r.verifiedAt,
        verifiedBy: r.verifiedBy,
        registeredAt: r.registeredAt,
        verificationDocuments: verificationDocuments
      };
    });
    
    res.json({ 
      researchers: formattedResearchers,
      total: formattedResearchers.length
    });
  } catch (error) {
    console.error('Error fetching researchers:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch researchers' });
  }
});

/**
 * GET /api/admin/researchers/:researcherId
 * Get detailed researcher information
 */
router.get('/researchers/:researcherId', async (req, res) => {
  try {
    const { researcherId } = req.params;
    const researcher = await getResearcher(researcherId);
    
    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }
    
    let verificationDocuments = null;
    if (researcher.verificationDocuments) {
      try {
        verificationDocuments = typeof researcher.verificationDocuments === 'string' 
          ? JSON.parse(researcher.verificationDocuments) 
          : researcher.verificationDocuments;
      } catch (e) {
        verificationDocuments = { raw: researcher.verificationDocuments };
      }
    }
    
    res.json({
      ...researcher,
      registrationNumber: researcher.registrationNumber,
      verificationDocuments: verificationDocuments
    });
  } catch (error) {
    console.error('Error fetching researcher:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch researcher' });
  }
});

/**
 * POST /api/admin/researchers/:researcherId/verify
 * Approve researcher verification
 */
router.post('/researchers/:researcherId/verify', async (req, res) => {
  try {
    const { researcherId } = req.params;
    const adminId = req.admin.username;
    
    const researcher = await verifyResearcher(
      researcherId,
      adminId,
      async (id, updates) => {
        return await updateResearcher(id, updates);
      }
    );
    
    res.json({
      message: 'Researcher verified successfully',
      researcher: {
        ...researcher,
        verificationPrompt: false
      }
    });
  } catch (error) {
    console.error('Error verifying researcher:', error);
    res.status(500).json({ error: error.message || 'Failed to verify researcher' });
  }
});

/**
 * POST /api/admin/researchers/:researcherId/reject
 * Reject researcher verification
 */
router.post('/researchers/:researcherId/reject', async (req, res) => {
  try {
    const { researcherId } = req.params;
    const { reason } = req.body;
    const adminId = req.admin.username;
    
    const researcher = await rejectResearcherVerification(
      researcherId,
      adminId,
      reason || 'Verification documents did not meet requirements',
      async (id, updates) => {
        return await updateResearcher(id, updates);
      }
    );
    
    res.json({
      message: 'Researcher verification rejected',
      researcher: {
        ...researcher,
        verificationPrompt: true,
        verificationMessage: 'Your verification was rejected. Please submit new documents.'
      }
    });
  } catch (error) {
    console.error('Error rejecting researcher:', error);
    res.status(500).json({ error: error.message || 'Failed to reject researcher' });
  }
});

/**
 * POST /api/admin/withdrawals/trigger-monthly
 * Trigger monthly withdrawals for all users with balance above threshold
 */
router.post('/withdrawals/trigger-monthly', async (req, res) => {
  try {
    const results = await triggerWithdrawalJob();
    res.json({
      message: 'Monthly withdrawals initiated',
      results: {
        processed: results.processed,
        skipped: results.skipped,
        errors: results.errors.length > 0 ? results.errors : undefined
      }
    });
  } catch (error) {
    console.error('Error triggering monthly withdrawals:', error);
    res.status(500).json({ error: error.message || 'Failed to trigger withdrawals' });
  }
});

/**
 * GET /api/admin/withdrawals/pending
 * Get all pending withdrawals
 */
router.get('/withdrawals/pending', async (req, res) => {
  try {
    const { limit = 100 } = req.query;
    const withdrawals = await getPendingWithdrawals(parseInt(limit));
    res.json(withdrawals);
  } catch (error) {
    console.error('Error getting pending withdrawals:', error);
    res.status(500).json({ error: error.message || 'Failed to get pending withdrawals' });
  }
});

/**
 * POST /api/admin/withdrawals/:withdrawalId/complete
 * Complete a withdrawal (after processing payment)
 */
router.post('/withdrawals/:withdrawalId/complete', async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { transactionId } = req.body;
    
    const withdrawal = await completeWithdrawal(withdrawalId, transactionId);
    res.json({
      message: 'Withdrawal completed',
      withdrawal
    });
  } catch (error) {
    console.error('Error completing withdrawal:', error);
    res.status(500).json({ error: error.message || 'Failed to complete withdrawal' });
  }
});

/**
 * GET /api/admin/withdrawals
 * Get all withdrawals with filters
 */
router.get('/withdrawals', async (req, res) => {
  try {
    const { status, userType, limit = 100, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM withdrawal_history WHERE 1=1';
    const params = [];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    if (userType) {
      query += ' AND user_type = ?';
      params.push(userType);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    
    const withdrawals = await all(query, params);
    
    res.json({
      withdrawals,
      count: withdrawals.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Error getting withdrawals:', error);
    res.status(500).json({ error: error.message || 'Failed to get withdrawals' });
  }
});

/**
 * GET /api/admin/withdrawals/failed
 * Get all failed withdrawals
 */
router.get('/withdrawals/failed', async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    const failedWithdrawals = await all(
      `SELECT * FROM withdrawal_history 
       WHERE status = 'failed' 
       ORDER BY created_at DESC 
       LIMIT ?`,
      [parseInt(limit)]
    );
    
    res.json({
      withdrawals: failedWithdrawals,
      count: failedWithdrawals.length
    });
  } catch (error) {
    console.error('Error getting failed withdrawals:', error);
    res.status(500).json({ error: error.message || 'Failed to get failed withdrawals' });
  }
});

/**
 * POST /api/admin/withdrawals/retry-failed
 * Retry failed withdrawals
 */
router.post('/withdrawals/retry-failed', async (req, res) => {
  try {
    const { limit = 10 } = req.body;
    const results = await retryFailedWithdrawals(limit);
    
    res.json({
      message: 'Retry process completed',
      results
    });
  } catch (error) {
    console.error('Error retrying failed withdrawals:', error);
    res.status(500).json({ error: error.message || 'Failed to retry withdrawals' });
  }
});

/**
 * GET /api/admin/withdrawals/stats
 * Get withdrawal statistics
 */
router.get('/withdrawals/stats', async (req, res) => {
  try {
    const stats = await all(
      `SELECT 
        status,
        user_type,
        COUNT(*) as count,
        SUM(amount_usd) as total_usd,
        SUM(amount_hbar) as total_hbar
       FROM withdrawal_history
       GROUP BY status, user_type`
    );
    
    const summary = await all(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed,
        SUM(CASE WHEN status = 'completed' THEN amount_usd ELSE 0 END) as total_completed_usd
       FROM withdrawal_history`
    );
    
    res.json({
      summary: summary[0] || {},
      breakdown: stats
    });
  } catch (error) {
    console.error('Error getting withdrawal stats:', error);
    res.status(500).json({ error: error.message || 'Failed to get withdrawal stats' });
  }
});

export default router;

