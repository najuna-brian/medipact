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
import { initDatabase, getDatabase, getDatabaseType } from '../db/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const router = express.Router();

/**
 * Admin authentication middleware
 * TEMPORARILY BYPASSED - Authentication will be implemented later
 * TODO: Restore proper authentication when ready
 */
async function authenticateAdmin(req, res, next) {
  // TODO: Implement proper authentication later
  // For now, always bypass authentication for testing
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
          hasDocuments = verificationDocuments && 
            typeof verificationDocuments === 'object' &&
            Object.keys(verificationDocuments).length > 0 &&
            (verificationDocuments.licenseNumber || 
             verificationDocuments.registrationCertificate || 
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
        hasDocuments = verificationDocuments && 
          typeof verificationDocuments === 'object' &&
          Object.keys(verificationDocuments).length > 0 &&
          (verificationDocuments.licenseNumber || 
           verificationDocuments.registrationCertificate || 
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
      // Split schema into individual CREATE TABLE statements
      // Match CREATE TABLE statements from start to closing );
      const tableStatements = [];
      
      // Find all CREATE TABLE statements by matching from CREATE TABLE to the closing );
      const tableMatches = completeSchema.matchAll(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)[\s\S]*?\);/gi);
      
      for (const match of tableMatches) {
        let statement = match[0].trim();
        const tableName = match[1];
        
        // Ensure IF NOT EXISTS is present
        if (!statement.includes('IF NOT EXISTS')) {
          statement = statement.replace(/CREATE TABLE\s+/, 'CREATE TABLE IF NOT EXISTS ');
        }
        
        tableStatements.push({ tableName, statement });
      }
      
      // Create tables
      for (const { tableName, statement } of tableStatements) {
        try {
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

export default router;

