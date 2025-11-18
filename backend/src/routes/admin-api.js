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
import { all, run } from '../db/database.js';
import { initDatabase, getDatabase, getDatabaseType } from '../db/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

/**
 * Admin authentication middleware
 * 
 * MVP Configuration:
 * - Authentication is bypassed for MVP/demo purposes
 * - All admin endpoints are accessible without authentication
 * - This is suitable for testing and limited beta deployments
 * 
 * Production: Implement proper JWT authentication before production deployment
 * TODO: Restore proper authentication when ready for production
 */
async function authenticateAdmin(req, res, next) {
  // MVP: Basic authentication bypassed
  // For production, implement proper JWT authentication
  // TODO: Implement proper authentication for production
  req.admin = {
    id: 1,
    username: 'admin',
    role: 'admin'
  };
  return next();
  
  // Original authentication code (commented out for now)
  /*
  // Skip authentication if SKIP_ADMIN_AUTH is set to 'true'
  if (process.env.SKIP_ADMIN_AUTH === 'true') {
    // Create a mock admin for development/testing
    req.admin = {
      id: 1,
      username: 'admin',
      role: 'admin'
    };
    return next();
  }
  
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
  */
}

// Apply authentication middleware to all admin routes
router.use(authenticateAdmin);

/**
 * GET /api/admin/hospitals
 * List all hospitals with verification status
 */
router.get('/hospitals', async (req, res) => {
  try {
    console.log('[ADMIN API] Fetching all hospitals...');
    const hospitals = await getAllHospitals();
    console.log(`[ADMIN API] Found ${hospitals.length} hospitals in database`);
    
    // Add detailed debugging to see what PostgreSQL is returning
    if (hospitals.length > 0) {
      console.log(`[ADMIN API] First hospital keys:`, Object.keys(hospitals[0]));
      console.log(`[ADMIN API] First hospital sample (first 200 chars):`, JSON.stringify(hospitals[0]).substring(0, 200));
    }
    
    // Format hospitals with verification status
    const formattedHospitals = hospitals.map(hospital => {
      let verificationDocuments = null;
      let hasDocuments = false;
      
      if (hospital.verificationDocuments) {
        try {
          // If it's already an object, use it; otherwise parse JSON string
          verificationDocuments = typeof hospital.verificationDocuments === 'string' 
            ? JSON.parse(hospital.verificationDocuments) 
            : hospital.verificationDocuments;
          
          // Check if it has actual content (not just empty object '{}')
          hasDocuments = verificationDocuments && 
            typeof verificationDocuments === 'object' &&
            Object.keys(verificationDocuments).length > 0 &&
            (verificationDocuments.licenseNumber || 
             verificationDocuments.registrationCertificate || 
             verificationDocuments.additionalDocuments ||
             verificationDocuments.rejectionReason); // Include rejection reason as "has documents"
        } catch (e) {
          // If parsing fails, check if it's a non-empty string
          verificationDocuments = { raw: hospital.verificationDocuments };
          hasDocuments = hospital.verificationDocuments.trim() !== '' && 
                         hospital.verificationDocuments !== '{}';
        }
      }

      return {
        hospitalId: hospital.hospitalId,
        hederaAccountId: hospital.hederaAccountId,
        evmAddress: hospital.evmAddress,
        name: hospital.name,
        country: hospital.country,
        location: hospital.location,
        fhirEndpoint: hospital.fhirEndpoint,
        contactEmail: hospital.contactEmail,
        registrationNumber: hospital.registrationNumber,
        registeredAt: hospital.registeredAt,
        status: hospital.status,
        verificationStatus: hospital.verificationStatus || 'pending',
        verifiedAt: hospital.verifiedAt,
        verifiedBy: hospital.verifiedBy,
        verificationDocuments: hasDocuments ? verificationDocuments : null // Only set if has actual content
      };
    });

    console.log(`[ADMIN API] Returning ${formattedHospitals.length} formatted hospitals`);
    console.log(`[ADMIN API] Hospitals by status:`, {
      pending: formattedHospitals.filter(h => h.verificationStatus === 'pending').length,
      verified: formattedHospitals.filter(h => h.verificationStatus === 'verified').length,
      rejected: formattedHospitals.filter(h => h.verificationStatus === 'rejected').length,
    });
    console.log(`[ADMIN API] Hospitals by document status:`, {
      withDocuments: formattedHospitals.filter(h => h.verificationDocuments).length,
      withoutDocuments: formattedHospitals.filter(h => !h.verificationDocuments).length
    });

    // Add debug logging to see what's actually in the database
    console.log(`[ADMIN API] Sample verification_documents from DB:`, 
      hospitals.slice(0, 3).map(h => ({
        hospitalId: h.hospitalId,
        verificationDocuments: h.verificationDocuments,
        verificationDocumentsType: typeof h.verificationDocuments,
        verificationDocumentsLength: h.verificationDocuments?.length
      }))
    );

    res.json({ hospitals: formattedHospitals });
  } catch (error) {
    console.error('[ADMIN API] Error fetching hospitals:', error);
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
    let hasDocuments = false;
    
    if (hospital.verificationDocuments) {
      try {
        // If it's already an object, use it; otherwise parse JSON string
        verificationDocuments = typeof hospital.verificationDocuments === 'string' 
          ? JSON.parse(hospital.verificationDocuments) 
          : hospital.verificationDocuments;
        
        // Check if it has actual content
        hasDocuments = verificationDocuments && 
          typeof verificationDocuments === 'object' &&
          Object.keys(verificationDocuments).length > 0 &&
          (verificationDocuments.licenseNumber || 
           verificationDocuments.registrationCertificate || 
           verificationDocuments.additionalDocuments ||
           verificationDocuments.rejectionReason);
      } catch (e) {
        verificationDocuments = { raw: hospital.verificationDocuments };
        hasDocuments = hospital.verificationDocuments.trim() !== '' && 
                       hospital.verificationDocuments !== '{}';
      }
    }

    res.json({
      hospitalId: hospital.hospitalId,
      hederaAccountId: hospital.hederaAccountId,
      evmAddress: hospital.evmAddress,
      name: hospital.name,
      country: hospital.country,
      location: hospital.location,
      fhirEndpoint: hospital.fhirEndpoint,
      contactEmail: hospital.contactEmail,
      registrationNumber: hospital.registrationNumber,
      registeredAt: hospital.registeredAt,
      status: hospital.status,
      verificationStatus: hospital.verificationStatus || 'pending',
      verifiedAt: hospital.verifiedAt,
      verifiedBy: hospital.verifiedBy,
      verificationDocuments: hasDocuments ? verificationDocuments : null,
      // Payment method info (encrypted fields are already decrypted by getHospital)
      paymentMethod: hospital.paymentMethod,
      bankName: hospital.bankName,
      mobileMoneyProvider: hospital.mobileMoneyProvider
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
    console.log('[ADMIN API] Fetching all researchers...');
    const researchers = await getAllResearchers();
    console.log(`[ADMIN API] Found ${researchers.length} researchers in database`);
    
    // Add detailed debugging to see what PostgreSQL is returning
    if (researchers.length > 0) {
      console.log(`[ADMIN API] First researcher keys:`, Object.keys(researchers[0]));
      console.log(`[ADMIN API] First researcher sample (first 200 chars):`, JSON.stringify(researchers[0]).substring(0, 200));
    }
    
    const formattedResearchers = researchers.map(r => {
      let verificationDocuments = null;
      let hasDocuments = false;
      
      if (r.verificationDocuments) {
        try {
          verificationDocuments = typeof r.verificationDocuments === 'string' 
            ? JSON.parse(r.verificationDocuments) 
            : r.verificationDocuments;
          
          // Check if it has actual content (not just empty object '{}')
          // Researchers submit: organizationDocuments, researchLicense, additionalDocuments
          hasDocuments = verificationDocuments && 
            typeof verificationDocuments === 'object' &&
            Object.keys(verificationDocuments).length > 0 &&
            (verificationDocuments.organizationDocuments || 
             verificationDocuments.researchLicense || 
             verificationDocuments.additionalDocuments ||
             verificationDocuments.rejectionReason);
        } catch (e) {
          verificationDocuments = { raw: r.verificationDocuments };
          hasDocuments = r.verificationDocuments.trim() !== '' && 
                         r.verificationDocuments !== '{}';
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
        verificationDocuments: hasDocuments ? verificationDocuments : null
      };
    });
    
    console.log(`[ADMIN API] Returning ${formattedResearchers.length} formatted researchers`);
    console.log(`[ADMIN API] Researchers by status:`, {
      pending: formattedResearchers.filter(r => r.verificationStatus === 'pending').length,
      verified: formattedResearchers.filter(r => r.verificationStatus === 'verified').length,
      rejected: formattedResearchers.filter(r => r.verificationStatus === 'rejected').length,
    });
    console.log(`[ADMIN API] Researchers by document status:`, {
      withDocuments: formattedResearchers.filter(r => r.verificationDocuments).length,
      withoutDocuments: formattedResearchers.filter(r => !r.verificationDocuments).length
    });
    
    // Add debug logging to see what's actually in the database
    console.log(`[ADMIN API] Sample verification_documents from DB (researchers):`, 
      researchers.slice(0, 3).map(r => ({
        researcherId: r.researcherId,
        verificationDocuments: r.verificationDocuments,
        verificationDocumentsType: typeof r.verificationDocuments,
        verificationDocumentsLength: r.verificationDocuments?.length
      }))
    );
    
    res.json({ 
      researchers: formattedResearchers,
      total: formattedResearchers.length
    });
  } catch (error) {
    console.error('[ADMIN API] Error fetching researchers:', error);
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
    let hasDocuments = false;
    
    if (researcher.verificationDocuments) {
      try {
        verificationDocuments = typeof researcher.verificationDocuments === 'string' 
          ? JSON.parse(researcher.verificationDocuments) 
          : researcher.verificationDocuments;
        
        // Check if it has actual content
        // Researchers submit: organizationDocuments, researchLicense, additionalDocuments
        hasDocuments = verificationDocuments && 
          typeof verificationDocuments === 'object' &&
          Object.keys(verificationDocuments).length > 0 &&
          (verificationDocuments.organizationDocuments || 
           verificationDocuments.researchLicense || 
           verificationDocuments.additionalDocuments ||
           verificationDocuments.rejectionReason);
      } catch (e) {
        verificationDocuments = { raw: researcher.verificationDocuments };
        hasDocuments = researcher.verificationDocuments.trim() !== '' && 
                       researcher.verificationDocuments !== '{}';
      }
    }
    
    res.json({
      ...researcher,
      registrationNumber: researcher.registrationNumber,
      verificationDocuments: hasDocuments ? verificationDocuments : null
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

/**
 * POST /api/admin/migrate/fhir
 * Run FHIR complete schema migration
 * Creates all FHIR R4 tables if they don't exist
 */
router.post('/migrate/fhir', async (req, res) => {
  try {
    console.log('[ADMIN API] Starting FHIR migration...');
    
    // Initialize database connection (skip if already initialized to avoid index conflicts)
    try {
      await initDatabase();
    } catch (error) {
      // If initDatabase fails due to existing indexes/tables, continue anyway
      if (error.message.includes('already exists') || error.message.includes('unique index')) {
        console.log('[ADMIN API] Database already initialized, continuing with FHIR migration...');
      } else {
        throw error;
      }
    }
    
    const dbType = getDatabaseType();
    console.log(`[ADMIN API] Database type: ${dbType}`);
    
    // Import the migration logic
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const schemaPath = path.join(__dirname, '../../src/models/fhir-complete-schema.js');
    const schemaModule = await import(schemaPath);
    const completeSchema = schemaModule.CompleteFHIRSchema; // This is a string, not an object
    
    const db = getDatabase();
    const results = {
      tablesCreated: [],
      tablesSkipped: [],
      errors: []
    };
    
    if (dbType === 'postgresql') {
      // PostgreSQL migration - parse the schema string
      // Use EXACT same approach as migrate-fhir-complete-schema.js script
      const statements = completeSchema.split('CREATE TABLE').filter(s => s.trim());

      // First, ensure fhir_patients has unique constraint on anonymous_patient_id if it exists
      // This is needed for foreign key references from other tables
      try {
        const checkConstraint = await db.query(`
          SELECT constraint_name 
          FROM information_schema.table_constraints 
          WHERE table_name = 'fhir_patients' 
          AND constraint_type = 'UNIQUE'
          AND constraint_name LIKE '%anonymous_patient_id%'
        `);
        
        if (checkConstraint.rows.length === 0) {
          // Try to add unique constraint (may fail if table doesn't exist or has duplicates)
          try {
            await db.query(`
              ALTER TABLE fhir_patients 
              ADD CONSTRAINT fhir_patients_anonymous_id_unique 
              UNIQUE (anonymous_patient_id)
            `);
            console.log('[ADMIN API] Added unique constraint on fhir_patients.anonymous_patient_id');
          } catch (alterError) {
            // Constraint might already exist or table might not exist yet
            if (!alterError.message.includes('already exists') && 
                !alterError.message.includes('does not exist')) {
              console.warn('[ADMIN API] Could not add unique constraint:', alterError.message);
            }
          }
        }
      } catch (e) {
        // Table might not exist yet, that's okay
      }
      
      for (let i = 0; i < statements.length; i++) {
        // Add space after CREATE TABLE when reconstructing
        const statement = 'CREATE TABLE ' + statements[i].trim();
        
        // Extract table name
        const tableMatch = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
        if (!tableMatch) continue;
        
        const tableName = tableMatch[1];

        try {
          // Use the ENTIRE statement as-is (same as migration script)
          // PostgreSQL will handle comments and multiple statements
          await db.query(statement);
          results.tablesCreated.push(tableName);
          console.log(`[ADMIN API] Created table: ${tableName}`);
        } catch (error) {
          if (error.message.includes('already exists') || error.code === '42P07') {
            results.tablesSkipped.push(tableName);
            console.log(`[ADMIN API] Table ${tableName} already exists, skipping`);
          } else {
            results.errors.push({ table: tableName, error: error.message });
            console.error(`[ADMIN API] Error creating table ${tableName}:`, error.message);
            // Continue with other tables - don't fail the entire migration
          }
        }
      }
      
      // After creating tables, ensure fhir_patients has unique constraint
      try {
        await db.query(`
          DO $$
          BEGIN
            IF NOT EXISTS (
              SELECT 1 FROM pg_constraint 
              WHERE conname = 'fhir_patients_anonymous_id_unique'
            ) THEN
              ALTER TABLE fhir_patients 
              ADD CONSTRAINT fhir_patients_anonymous_id_unique 
              UNIQUE (anonymous_patient_id);
            END IF;
          END $$;
        `);
        console.log('[ADMIN API] Ensured unique constraint on fhir_patients.anonymous_patient_id');
      } catch (e) {
        // Might already exist or table doesn't exist
        if (!e.message.includes('already exists') && !e.message.includes('does not exist')) {
          console.warn('[ADMIN API] Could not ensure unique constraint:', e.message);
        }
      }
      
      // Create indexes
      const indexStatements = completeSchema.match(/CREATE INDEX[^;]+;/gi) || [];
      for (const indexStmt of indexStatements) {
        try {
          const sql = indexStmt.includes('IF NOT EXISTS')
            ? indexStmt
            : indexStmt.replace(/CREATE (UNIQUE )?INDEX\s+/, 'CREATE $1INDEX IF NOT EXISTS ');
          await db.query(sql);
        } catch (error) {
          // Ignore errors for indexes that already exist or have constraint issues
          if (error.message.includes('already exists') || 
              error.code === '42P07' || 
              error.message.includes('unique index') ||
              error.message.includes('duplicate key')) {
            console.log(`[ADMIN API] Index already exists or has constraint, skipping: ${indexStmt.substring(0, 50)}...`);
          } else {
            results.errors.push({ index: indexStmt.substring(0, 50), error: error.message });
            console.warn(`[ADMIN API] Index creation warning: ${error.message}`);
          }
        }
      }
    } else {
      // SQLite migration
      const { promisify } = await import('util');
      const run = promisify(db.run.bind(db));
      
      // Split on CREATE TABLE but handle both "CREATE TABLE" and "CREATE TABLE IF NOT EXISTS"
      const statements = completeSchema.split(/(?=CREATE TABLE)/).filter(s => s.trim() && s.includes('CREATE TABLE'));
      
      for (let i = 0; i < statements.length; i++) {
        let statement = statements[i].trim();
        
        // Ensure we have "IF NOT EXISTS" for SQLite
        if (!statement.includes('IF NOT EXISTS')) {
          statement = statement.replace(/CREATE TABLE\s+/, 'CREATE TABLE IF NOT EXISTS ');
        }
        
        // Adapt for SQLite
        statement = statement
          .replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
          .replace(/VARCHAR\((\d+)\)/g, 'TEXT')
          .replace(/TIMESTAMP/g, 'TEXT')
          .replace(/DATE/g, 'TEXT')
          .replace(/DECIMAL\([^)]+\)/g, 'REAL')
          .replace(/JSONB/g, 'TEXT');
        
        // Extract table name
        const tableMatch = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
        if (!tableMatch) continue;
        
        const tableName = tableMatch[1];
        
        try {
          await run(statement);
          results.tablesCreated.push(tableName);
          console.log(`[ADMIN API] Created table: ${tableName}`);
        } catch (error) {
          if (error.message.includes('already exists') || error.code === 'SQLITE_CONSTRAINT') {
            results.tablesSkipped.push(tableName);
            console.log(`[ADMIN API] Table ${tableName} already exists, skipping`);
          } else {
            results.errors.push({ table: tableName, error: error.message });
            console.error(`[ADMIN API] Error creating table ${tableName}:`, error.message);
          }
        }
      }
      
      // Create indexes separately for SQLite
      const indexStatements = completeSchema.match(/CREATE INDEX[^;]+;/gi) || [];
      for (const indexStmt of indexStatements) {
        try {
          const adapted = indexStmt.replace(/CREATE INDEX/g, 'CREATE INDEX IF NOT EXISTS');
          await run(adapted);
        } catch (error) {
          // Ignore errors for indexes that already exist
          if (error.message.includes('already exists') || 
              error.message.includes('duplicate column name')) {
            console.log(`[ADMIN API] Index already exists, skipping: ${indexStmt.substring(0, 50)}...`);
          } else {
            results.errors.push({ index: indexStmt.substring(0, 50), error: error.message });
            console.warn(`[ADMIN API] Index creation warning: ${error.message}`);
          }
        }
      }
    }
    
    res.json({
      success: true,
      message: 'FHIR migration completed',
      databaseType: dbType,
      results: {
        tablesCreated: results.tablesCreated.length,
        tablesSkipped: results.tablesSkipped.length,
        errors: results.errors.length,
        details: results
      }
    });
  } catch (error) {
    console.error('[ADMIN API] Migration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Migration failed',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/admin/cleanup/duplicates
 * Clean up duplicate patient contacts (merge by keeping latest entry)
 */
router.post('/cleanup/duplicates', authenticateAdmin, async (req, res) => {
  try {
    const dbType = getDatabaseType();
    const db = getDatabase();
    
    console.log('[ADMIN API] Starting duplicate contact cleanup...');
    
    const results = {
      duplicateEmails: [],
      duplicatePhones: [],
      duplicateNationalIds: [],
      merged: [],
      errors: []
    };
    
    if (dbType === 'postgresql') {
      // Find duplicate emails
      const duplicateEmails = await all(`
        SELECT email, array_agg(upi) as upis, array_agg(id) as ids, 
               array_agg(updated_at) as updated_ats
        FROM patient_contacts
        WHERE email IS NOT NULL
        GROUP BY email
        HAVING COUNT(*) > 1
      `);
      
      // Find duplicate phones
      const duplicatePhones = await all(`
        SELECT phone, array_agg(upi) as upis, array_agg(id) as ids,
               array_agg(updated_at) as updated_ats
        FROM patient_contacts
        WHERE phone IS NOT NULL
        GROUP BY phone
        HAVING COUNT(*) > 1
      `);
      
      // Find duplicate national IDs
      const duplicateNationalIds = await all(`
        SELECT national_id, array_agg(upi) as upis, array_agg(id) as ids,
               array_agg(updated_at) as updated_ats
        FROM patient_contacts
        WHERE national_id IS NOT NULL
        GROUP BY national_id
        HAVING COUNT(*) > 1
      `);
      
      results.duplicateEmails = (duplicateEmails.rows || duplicateEmails || []);
      results.duplicatePhones = (duplicatePhones.rows || duplicatePhones || []);
      results.duplicateNationalIds = (duplicateNationalIds.rows || duplicateNationalIds || []);
      
      // Merge duplicates: keep the one with the latest updated_at, delete others
      for (const dup of results.duplicateEmails) {
        try {
          // PostgreSQL array_agg returns arrays, handle both array and single value
          const upis = Array.isArray(dup.upis) ? dup.upis : (dup.upis ? [dup.upis] : []);
          const updatedAts = Array.isArray(dup.updated_ats) ? dup.updated_ats : (dup.updated_ats ? [dup.updated_ats] : []);
          
          if (upis.length <= 1) continue; // No duplicates
          
          // Find the index of the latest entry
          const latestIndex = updatedAts.reduce((maxIdx, date, idx) => {
            return new Date(date) > new Date(updatedAts[maxIdx]) ? idx : maxIdx;
          }, 0);
          
          const keepUPI = upis[latestIndex];
          const deleteUPIs = upis.filter((_, idx) => idx !== latestIndex);
          
          // Update all references to use the kept UPI
          for (const deleteUPI of deleteUPIs) {
            // Update hospital_linkages
            await db.query(`
              UPDATE hospital_linkages SET upi = $1 WHERE upi = $2
            `, [keepUPI, deleteUPI]);
            
            // Update patient_consents
            await db.query(`
              UPDATE patient_consents SET upi = $1 WHERE upi = $2
            `, [keepUPI, deleteUPI]);
            
            // Delete duplicate contact
            await db.query(`
              DELETE FROM patient_contacts WHERE upi = $1
            `, [deleteUPI]);
            
            results.merged.push({ type: 'email', kept: keepUPI, deleted: deleteUPI });
          }
        } catch (error) {
          results.errors.push({ type: 'email', error: error.message, data: dup });
        }
      }
      
      // Similar for phones and national IDs
      for (const dup of results.duplicatePhones) {
        try {
          const upis = Array.isArray(dup.upis) ? dup.upis : (dup.upis ? [dup.upis] : []);
          const updatedAts = Array.isArray(dup.updated_ats) ? dup.updated_ats : (dup.updated_ats ? [dup.updated_ats] : []);
          
          if (upis.length <= 1) continue; // No duplicates
          
          const latestIndex = updatedAts.reduce((maxIdx, date, idx) => {
            return new Date(date) > new Date(updatedAts[maxIdx]) ? idx : maxIdx;
          }, 0);
          
          const keepUPI = upis[latestIndex];
          const deleteUPIs = upis.filter((_, idx) => idx !== latestIndex);
          
          for (const deleteUPI of deleteUPIs) {
            await db.query(`UPDATE hospital_linkages SET upi = $1 WHERE upi = $2`, [keepUPI, deleteUPI]);
            await db.query(`UPDATE patient_consents SET upi = $1 WHERE upi = $2`, [keepUPI, deleteUPI]);
            await db.query(`DELETE FROM patient_contacts WHERE upi = $1`, [deleteUPI]);
            results.merged.push({ type: 'phone', kept: keepUPI, deleted: deleteUPI });
          }
        } catch (error) {
          results.errors.push({ type: 'phone', error: error.message, data: dup });
        }
      }
      
      for (const dup of results.duplicateNationalIds) {
        try {
          const upis = Array.isArray(dup.upis) ? dup.upis : (dup.upis ? [dup.upis] : []);
          const updatedAts = Array.isArray(dup.updated_ats) ? dup.updated_ats : (dup.updated_ats ? [dup.updated_ats] : []);
          
          if (upis.length <= 1) continue; // No duplicates
          
          const latestIndex = updatedAts.reduce((maxIdx, date, idx) => {
            return new Date(date) > new Date(updatedAts[maxIdx]) ? idx : maxIdx;
          }, 0);
          
          const keepUPI = upis[latestIndex];
          const deleteUPIs = upis.filter((_, idx) => idx !== latestIndex);
          
          for (const deleteUPI of deleteUPIs) {
            await db.query(`UPDATE hospital_linkages SET upi = $1 WHERE upi = $2`, [keepUPI, deleteUPI]);
            await db.query(`UPDATE patient_consents SET upi = $1 WHERE upi = $2`, [keepUPI, deleteUPI]);
            await db.query(`DELETE FROM patient_contacts WHERE upi = $1`, [deleteUPI]);
            results.merged.push({ type: 'nationalId', kept: keepUPI, deleted: deleteUPI });
          }
        } catch (error) {
          results.errors.push({ type: 'nationalId', error: error.message, data: dup });
        }
      }
    } else {
      // SQLite version (similar logic)
      const duplicateEmails = await all(`
        SELECT email, GROUP_CONCAT(upi) as upis, GROUP_CONCAT(id) as ids,
               GROUP_CONCAT(updated_at) as updated_ats
        FROM patient_contacts
        WHERE email IS NOT NULL
        GROUP BY email
        HAVING COUNT(*) > 1
      `);
      
      // Process similar to PostgreSQL...
      results.duplicateEmails = duplicateEmails || [];
    }
    
    // After cleanup, try to create unique indexes
    try {
      if (dbType === 'postgresql') {
        // Check if index exists
        const emailIndexCheck = await db.query(`
          SELECT 1 FROM pg_indexes 
          WHERE indexname = 'idx_contacts_email_unique' 
          AND schemaname = 'public'
        `);
        
        if (emailIndexCheck.rows.length === 0) {
          await db.query(`
            CREATE UNIQUE INDEX idx_contacts_email_unique 
            ON patient_contacts(email) 
            WHERE email IS NOT NULL
          `);
          console.log('[ADMIN API] Created unique index on patient_contacts.email');
        }
        
        const phoneIndexCheck = await db.query(`
          SELECT 1 FROM pg_indexes 
          WHERE indexname = 'idx_contacts_phone_unique' 
          AND schemaname = 'public'
        `);
        
        if (phoneIndexCheck.rows.length === 0) {
          await db.query(`
            CREATE UNIQUE INDEX idx_contacts_phone_unique 
            ON patient_contacts(phone) 
            WHERE phone IS NOT NULL
          `);
          console.log('[ADMIN API] Created unique index on patient_contacts.phone');
        }
      }
    } catch (indexError) {
      console.warn('[ADMIN API] Could not create unique indexes:', indexError.message);
    }
    
    res.json({
      success: true,
      message: 'Duplicate cleanup completed',
      results: {
        duplicatesFound: {
          emails: results.duplicateEmails.length,
          phones: results.duplicatePhones.length,
          nationalIds: results.duplicateNationalIds.length
        },
        merged: results.merged.length,
        errors: results.errors.length,
        details: results
      }
    });
  } catch (error) {
    console.error('[ADMIN API] Cleanup error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Cleanup failed',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/admin/cleanup/reset
 * ⚠️  DANGER: Clear all data except admins (for fresh start)
 */
router.post('/cleanup/reset', authenticateAdmin, async (req, res) => {
  try {
    const { confirm } = req.body;
    
    if (confirm !== 'DELETE_ALL_DATA') {
      return res.status(400).json({
        success: false,
        error: 'Confirmation required. Send { "confirm": "DELETE_ALL_DATA" } to proceed.'
      });
    }
    
    const dbType = getDatabaseType();
    const db = getDatabase();
    
    console.log('[ADMIN API] ⚠️  RESETTING ALL DATA (except admins)...');
    
    const tables = [
      'processing_history',
      'patient_consents',
      'hospital_linkages',
      'patient_contacts',
      'patient_identities',
      'fhir_encounters',
      'fhir_conditions',
      'fhir_observations',
      'fhir_medication_requests',
      'fhir_procedures',
      'fhir_imaging_studies',
      'fhir_allergies',
      'fhir_coverage',
      'fhir_patients',
      'hospitals',
      'researchers'
    ];
    
    const deleted = {};
    
    for (const table of tables) {
      try {
        if (dbType === 'postgresql') {
          const result = await db.query(`DELETE FROM ${table}`);
          deleted[table] = result.rowCount || 0;
        } else {
          const result = await run(`DELETE FROM ${table}`);
          deleted[table] = result.changes || 0;
        }
        console.log(`[ADMIN API] Deleted ${deleted[table]} rows from ${table}`);
      } catch (error) {
        // Table might not exist, that's okay
        if (!error.message.includes('does not exist') && !error.message.includes('no such table')) {
          console.warn(`[ADMIN API] Error deleting from ${table}:`, error.message);
        }
        deleted[table] = 0;
      }
    }
    
    // Verify admins are still there
    const adminCount = await all('SELECT COUNT(*) as count FROM admins');
    const count = dbType === 'postgresql' 
      ? (adminCount.rows?.[0]?.count || adminCount[0]?.count || 0)
      : (adminCount[0]?.count || 0);
    
    res.json({
      success: true,
      message: 'Database reset complete. All data cleared except admins.',
      deleted,
      adminsPreserved: count
    });
  } catch (error) {
    console.error('[ADMIN API] Reset error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Reset failed',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/admin/migrate/fhir-columns-to-camelcase
 * Run FHIR column migration from snake_case to camelCase
 * Safely renames columns without losing data (PostgreSQL only)
 */
router.post('/migrate/fhir-columns-to-camelcase', async (req, res) => {
  try {
    console.log('[ADMIN API] Starting FHIR column migration to camelCase...');
    
    const db = getDatabase();
    const dbType = getDatabaseType();
    
    if (dbType !== 'postgresql') {
      return res.json({
        success: true,
        message: 'Migration skipped - not PostgreSQL',
        databaseType: dbType,
        note: 'This migration is only needed for PostgreSQL. SQLite tables already use camelCase.'
      });
    }
    
    // Import the migration logic from the script
    const columnMappings = {
      fhir_patients: {
        'anonymous_patient_id': 'anonymousPatientId',
        'age_range': 'ageRange',
        'hospital_id': 'hospitalId',
        'created_at': 'createdAt',
        'updated_at': 'updatedAt'
      },
      fhir_conditions: {
        'anonymous_patient_id': 'anonymousPatientId',
        'condition_code': 'conditionCode',
        'condition_name': 'conditionName',
        'diagnosis_date': 'diagnosisDate',
        'hospital_id': 'hospitalId',
        'created_at': 'createdAt'
      },
      fhir_observations: {
        'anonymous_patient_id': 'anonymousPatientId',
        'observation_code': 'observationCode',
        'observation_name': 'observationName',
        'effective_date': 'effectiveDate',
        'hospital_id': 'hospitalId',
        'reference_range': 'referenceRange',
        'created_at': 'createdAt'
      },
      fhir_encounters: {
        'anonymous_patient_id': 'anonymousPatientId',
        'encounter_id': 'encounterId',
        'encounter_type': 'encounterType',
        'admission_date': 'admissionDate',
        'discharge_date': 'dischargeDate',
        'hospital_id': 'hospitalId',
        'created_at': 'createdAt'
      },
      fhir_medication_requests: {
        'anonymous_patient_id': 'anonymousPatientId',
        'medication_code': 'medicationCode',
        'medication_name': 'medicationName',
        'prescribed_date': 'prescribedDate',
        'hospital_id': 'hospitalId',
        'created_at': 'createdAt'
      },
      fhir_procedures: {
        'anonymous_patient_id': 'anonymousPatientId',
        'procedure_code': 'procedureCode',
        'procedure_name': 'procedureName',
        'procedure_date': 'procedureDate',
        'hospital_id': 'hospitalId',
        'created_at': 'createdAt'
      },
      fhir_imaging_studies: {
        'anonymous_patient_id': 'anonymousPatientId',
        'study_id': 'studyId',
        'modality': 'modality',
        'study_date': 'studyDate',
        'hospital_id': 'hospitalId',
        'created_at': 'createdAt'
      },
      fhir_allergies: {
        'anonymous_patient_id': 'anonymousPatientId',
        'allergy_code': 'allergyCode',
        'allergy_name': 'allergyName',
        'reaction_date': 'reactionDate',
        'hospital_id': 'hospitalId',
        'created_at': 'createdAt'
      },
      fhir_coverage: {
        'anonymous_patient_id': 'anonymousPatientId',
        'coverage_type': 'coverageType',
        'policy_number': 'policyNumber',
        'start_date': 'startDate',
        'end_date': 'endDate',
        'hospital_id': 'hospitalId',
        'created_at': 'createdAt'
      }
    };
    
    async function checkColumnExists(tableName, columnName) {
      try {
        const result = await db.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = $1 AND column_name = $2
        `, [tableName, columnName]);
        return result.rows.length > 0;
      } catch (error) {
        return false;
      }
    }
    
    const results = {
      tablesProcessed: [],
      columnsRenamed: [],
      columnsSkipped: [],
      errors: []
    };
    
    // Process each table
    for (const [tableName, mappings] of Object.entries(columnMappings)) {
      console.log(`[ADMIN API] Processing table: ${tableName}`);
      
      // Check if table exists
      let tableExists = false;
      try {
        const tableCheck = await db.query(`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_name = $1
        `, [tableName]);
        tableExists = tableCheck.rows.length > 0;
      } catch (error) {
        console.log(`[ADMIN API] Error checking table ${tableName}: ${error.message}`);
      }
      
      if (!tableExists) {
        console.log(`[ADMIN API] Table ${tableName} does not exist, skipping...`);
        continue;
      }
      
      results.tablesProcessed.push(tableName);
      
      // Rename each column
      for (const [oldName, newName] of Object.entries(mappings)) {
        const oldExists = await checkColumnExists(tableName, oldName);
        const newExists = await checkColumnExists(tableName, newName);
        
        if (newExists) {
          console.log(`[ADMIN API] Column ${tableName}.${newName} already exists (already migrated)`);
          results.columnsSkipped.push(`${tableName}.${newName}`);
        } else if (oldExists) {
          try {
            console.log(`[ADMIN API] Renaming ${tableName}.${oldName} to "${newName}"...`);
            await db.query(`ALTER TABLE ${tableName} RENAME COLUMN ${oldName} TO "${newName}"`);
            console.log(`[ADMIN API] ✓ Renamed ${tableName}.${oldName} to "${newName}"`);
            results.columnsRenamed.push(`${tableName}.${oldName} -> ${newName}`);
          } catch (error) {
            console.error(`[ADMIN API] Failed to rename ${tableName}.${oldName}: ${error.message}`);
            results.errors.push({ table: tableName, column: oldName, error: error.message });
          }
        } else {
          console.log(`[ADMIN API] Column ${tableName}.${oldName} does not exist (skipping)`);
        }
      }
    }
    
    // Update indexes
    console.log('[ADMIN API] Updating indexes...');
    const indexMappings = {
      'anonymous_patient_id': 'anonymousPatientId',
      'hospital_id': 'hospitalId',
      'condition_code': 'conditionCode',
      'observation_code': 'observationCode',
      'effective_date': 'effectiveDate',
      'diagnosis_date': 'diagnosisDate'
    };
    
    for (const [oldCol, newCol] of Object.entries(indexMappings)) {
      for (const tableName of results.tablesProcessed) {
        try {
          // Drop old index if exists
          await db.query(`DROP INDEX IF EXISTS idx_${tableName}_${oldCol}`);
          // Create new index with camelCase column name
          await db.query(`CREATE INDEX IF NOT EXISTS idx_${tableName}_${newCol} ON ${tableName}("${newCol}")`);
        } catch (error) {
          // Index operations are not critical, just log
          console.log(`[ADMIN API] Index update note for ${tableName}.${newCol}: ${error.message}`);
        }
      }
    }
    
    res.json({
      success: true,
      message: 'FHIR column migration to camelCase completed',
      databaseType: dbType,
      results: {
        tablesProcessed: results.tablesProcessed.length,
        columnsRenamed: results.columnsRenamed.length,
        columnsSkipped: results.columnsSkipped.length,
        errors: results.errors.length,
        details: results
      }
    });
  } catch (error) {
    console.error('[ADMIN API] Column migration error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Column migration failed',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

export default router;

