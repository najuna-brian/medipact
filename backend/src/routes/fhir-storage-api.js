/**
 * FHIR Resource Storage API
 * 
 * Endpoints for storing processed FHIR resources from the universal adapter.
 * Supports ALL FHIR R4 resource types.
 */

import express from 'express';
import { getDatabase, getDatabaseType } from '../db/database.js';
import { promisify } from 'util';

const router = express.Router();

/**
 * Middleware to authenticate adapter requests
 */
async function authenticateAdapter(req, res, next) {
  // Express normalizes headers to lowercase, but check both cases for safety
  const hospitalId = req.headers['x-hospital-id'] || req.headers['X-Hospital-ID'];
  const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];

  console.log(`[FHIR Storage API] Authentication check:`, {
    path: req.path,
    method: req.method,
    hasHospitalId: !!hospitalId,
    hasApiKey: !!apiKey,
    hospitalId: hospitalId || 'MISSING',
    headers: Object.keys(req.headers).filter(h => h.toLowerCase().includes('hospital') || h.toLowerCase().includes('api'))
  });

  if (!hospitalId || !apiKey) {
    console.error(`[FHIR Storage API] Authentication failed:`, {
      path: req.path,
      hospitalId: hospitalId || 'MISSING',
      apiKey: apiKey ? 'PRESENT' : 'MISSING',
      allHeaders: Object.keys(req.headers)
    });
    return res.status(401).json({ error: 'Missing hospital ID or API key' });
  }

  // CRITICAL FIX: Actually verify the API key matches the hospital's stored hash
  const { verifyHospitalApiKey } = await import('../db/hospital-db.js');
  const isValid = await verifyHospitalApiKey(hospitalId, apiKey);
  
  if (!isValid) {
    console.error(`[FHIR Storage API] Invalid API key for hospital: ${hospitalId}`);
    console.error(`[FHIR Storage API] API key verification failed - rejecting request`);
    return res.status(401).json({ error: 'Invalid hospital credentials' });
  }

  req.hospitalId = hospitalId;
  console.log(`[FHIR Storage API] ✅ Authentication passed for hospital: ${hospitalId}`);
  console.log(`[FHIR Storage API] Request details:`, {
    method: req.method,
    path: req.path,
    bodyKeys: Object.keys(req.body || {}),
    resourceCount: req.body?.resources?.length || 0
  });
  next();
}

/**
 * Check if a table exists in the database
 */
async function tableExists(db, dbType, tableName) {
  try {
    if (dbType === 'postgresql') {
      const result = await db.query(
        `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
        [tableName]
      );
      return result.rows[0]?.exists || false;
    } else {
      // SQLite
      const { get } = await import('../db/database.js');
      const result = await get(
        `SELECT name FROM sqlite_master WHERE type='table' AND name=?`,
        [tableName]
      );
      return !!result;
    }
  } catch (error) {
    console.error(`[FHIR Storage] Error checking table existence for ${tableName}:`, error.message);
    return false;
  }
}

/**
 * Generic storage function for any resource type
 */
async function storeResources(req, res, tableName) {
  try {
    console.log(`[FHIR Storage API] Received request for ${tableName}:`, {
      hospitalId: req.body.hospitalId,
      resourceCount: req.body.resources?.length || 0,
      timestamp: new Date().toISOString()
    });
    
    const { hospitalId, resources } = req.body;

    if (!hospitalId || !resources || !Array.isArray(resources)) {
      console.error(`[FHIR Storage API] Invalid request for ${tableName}:`, {
        hasHospitalId: !!hospitalId,
        hasResources: !!resources,
        isArray: Array.isArray(resources)
      });
      return res.status(400).json({
        error: 'hospitalId and resources array are required',
      });
    }

    const db = getDatabase();
    const dbType = getDatabaseType();
    
    // Check if table exists before attempting to store
    const exists = await tableExists(db, dbType, tableName);
    if (!exists) {
      const errorMsg = `Table ${tableName} does not exist. Please run the FHIR migration: POST /api/admin/migrate/fhir`;
      console.error(`[FHIR Storage API] ${errorMsg}`);
      return res.status(500).json({
        success: false,
        error: errorMsg,
        tableName,
        hint: 'Run the FHIR migration endpoint to create all required tables'
      });
    }

    const results = {
      created: 0,
      errors: []
    };

    for (const resource of resources) {
      try {
        // Log patient resources to see if they have UPIs
        if (tableName === 'fhir_patients') {
          console.log(`[FHIR Storage] Storing patient:`, {
            anonymousPatientId: resource.anonymousPatientId,
            upi: resource.upi || 'NULL',
            hospitalId: hospitalId,
            hasUPI: !!resource.upi
          });
        }
        
        if (dbType === 'postgresql') {
          await storeResourcePostgreSQL(db, tableName, resource, hospitalId);
        } else {
          await storeResourceSQLite(db, tableName, resource, hospitalId);
        }
        results.created++;
      } catch (error) {
        // Check if error is due to missing table (shouldn't happen after check, but just in case)
        const isTableMissing = error.message?.includes('does not exist') || 
                              error.message?.includes('no such table') ||
                              error.code === '42P01'; // PostgreSQL: undefined_table
        
        console.error(`[FHIR Storage] Error storing ${tableName} resource:`, {
          resource: resource.id || resource.anonymousPatientId || 'unknown',
          error: error.message,
          code: error.code,
          constraint: error.constraint,
          detail: error.detail,
          isTableMissing,
          stack: error.stack?.substring(0, 300) // First 300 chars of stack
        });
        
        results.errors.push({
          resource: resource.id || resource.anonymousPatientId || 'unknown',
          error: error.message,
          detail: error.detail || error.constraint,
          isTableMissing
        });
      }
    }

    // If all resources failed and it's due to missing table, return error
    if (results.created === 0 && results.errors.length > 0) {
      const allTableMissing = results.errors.every(e => e.isTableMissing);
      if (allTableMissing) {
        const errorMsg = `Table ${tableName} does not exist. Please run the FHIR migration: POST /api/admin/migrate/fhir`;
        console.error(`[FHIR Storage API] ${errorMsg}`);
        return res.status(500).json({
          success: false,
          error: errorMsg,
          tableName,
          hint: 'Run the FHIR migration endpoint to create all required tables',
          results
        });
      }
    }

    const success = results.created > 0;
    res.json({
      success,
      message: success 
        ? `Stored ${results.created} ${tableName} resources` 
        : `Failed to store ${tableName} resources: ${results.errors.length} errors`,
      results
    });
  } catch (error) {
    console.error(`Error storing ${tableName}:`, error);
    res.status(500).json({ 
      success: false,
      error: error.message,
      tableName
    });
  }
}

/**
 * Store resource in PostgreSQL
 * Uses camelCase field names directly with quoted identifiers
 * This matches the project standard: camelCase in JS/API and DB
 */
async function storeResourcePostgreSQL(db, tableName, resource, hospitalId) {
  // Quote camelCase column names for PostgreSQL
  const quoteColumn = (str) => `"${str}"`;
  
  // Filter out id and use camelCase column names directly (quoted)
  const originalKeys = Object.keys(resource).filter(k => k !== 'id');
  const columns = originalKeys.map(k => quoteColumn(k));
  const values = originalKeys.map(key => resource[key]);
  
  const placeholders = columns.map((_, i) => `$${i + 1}`);
  
  // Determine conflict target based on table (use quoted camelCase column names)
  let conflictClause = '';
  if (tableName === 'fhir_patients') {
    conflictClause = 'ON CONFLICT ("anonymousPatientId", "hospitalId") DO NOTHING';
  } else if (tableName === 'fhir_encounters') {
    conflictClause = 'ON CONFLICT ("encounterId", "hospitalId") DO NOTHING';
  } else {
    // For other tables without unique constraints, try simple insert
    conflictClause = '';
  }

  const query = conflictClause
    ? `INSERT INTO ${tableName} (${columns.join(', ')}, "hospitalId")
       VALUES (${placeholders.join(', ')}, $${columns.length + 1})
       ${conflictClause}`
    : `INSERT INTO ${tableName} (${columns.join(', ')}, "hospitalId")
       VALUES (${placeholders.join(', ')}, $${columns.length + 1})`;

  try {
    await db.query(query, [...values, hospitalId]);
  } catch (error) {
    // If conflict clause fails or constraint doesn't exist, try without it
    if (error.message.includes('ON CONFLICT') || error.code === '42601' || error.code === '42P01') {
      const simpleQuery = `
        INSERT INTO ${tableName} (${columns.join(', ')}, "hospitalId")
        VALUES (${placeholders.join(', ')}, $${columns.length + 1})
      `;
      await db.query(simpleQuery, [...values, hospitalId]);
    } else {
      throw error;
    }
  }
}

/**
 * Store resource in SQLite
 * Uses camelCase field names with quoted identifiers (SQLite supports this)
 */
async function storeResourceSQLite(db, tableName, resource, hospitalId) {
  const run = promisify(db.run.bind(db));
  
  // Quote camelCase column names for SQLite (SQLite supports quoted identifiers)
  const quoteColumn = (str) => `"${str}"`;
  
  const originalKeys = Object.keys(resource).filter(k => k !== 'id');
  const columns = originalKeys.map(k => quoteColumn(k));
  const values = originalKeys.map(key => resource[key]);
  const placeholders = columns.map(() => '?');

  const query = `
    INSERT OR IGNORE INTO ${tableName} (${columns.join(', ')}, "hospitalId")
    VALUES (${placeholders.join(', ')}, ?)
  `;

  await run(query, [...values, hospitalId]);
}

// ============================================================================
// Storage Endpoints for Each Resource Type
// ============================================================================

router.post('/store-fhir-patients', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_patients');
});

router.post('/store-fhir-encounters', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_encounters');
});

router.post('/store-fhir-conditions', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_conditions');
});

router.post('/store-fhir-observations', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_observations');
});

router.post('/store-fhir-medication-requests', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_medication_requests');
});

router.post('/store-fhir-medication-administrations', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_medication_administrations');
});

router.post('/store-fhir-medication-statements', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_medication_statements');
});

router.post('/store-fhir-procedures', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_procedures');
});

router.post('/store-fhir-diagnostic-reports', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_diagnostic_reports');
});

router.post('/store-fhir-imaging-studies', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_imaging_studies');
});

router.post('/store-fhir-specimens', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_specimens');
});

router.post('/store-fhir-allergies', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_allergies');
});

router.post('/store-fhir-immunizations', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_immunizations');
});

router.post('/store-fhir-care-plans', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_care_plans');
});

router.post('/store-fhir-care-teams', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_care_teams');
});

router.post('/store-fhir-devices', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_devices');
});

router.post('/store-fhir-organizations', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_organizations');
});

router.post('/store-fhir-practitioners', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_practitioners');
});

router.post('/store-fhir-locations', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_locations');
});

router.post('/store-fhir-coverage', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_coverage');
});

router.post('/store-fhir-related-persons', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_related_persons');
});

router.post('/store-fhir-provenance', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_provenance');
});

router.post('/store-fhir-audit-events', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_audit_events');
});

export default router;

