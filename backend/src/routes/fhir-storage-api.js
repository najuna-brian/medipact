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
  const hospitalId = req.headers['x-hospital-id'] || req.headers['x-hospital-id'] || req.headers['X-Hospital-ID'];
  const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];

  if (!hospitalId || !apiKey) {
    return res.status(401).json({ error: 'Missing hospital ID or API key' });
  }

  // TODO: Verify API key matches hospital's API key
  req.hospitalId = hospitalId;
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
 */
async function storeResourcePostgreSQL(db, tableName, resource, hospitalId) {
  const columns = Object.keys(resource).filter(k => k !== 'id');
  const values = columns.map(col => resource[col]);
  const placeholders = columns.map((_, i) => `$${i + 1}`);

  const query = `
    INSERT INTO ${tableName} (${columns.join(', ')}, hospital_id)
    VALUES (${placeholders.join(', ')}, $${columns.length + 1})
    ON CONFLICT DO NOTHING
  `;

  await db.query(query, [...values, hospitalId]);
}

/**
 * Store resource in SQLite
 */
async function storeResourceSQLite(db, tableName, resource, hospitalId) {
  const run = promisify(db.run.bind(db));
  
  const columns = Object.keys(resource).filter(k => k !== 'id');
  const values = columns.map(col => resource[col]);
  const placeholders = columns.map(() => '?');

  const query = `
    INSERT OR IGNORE INTO ${tableName} (${columns.join(', ')}, hospital_id)
    VALUES (${placeholders.join(', ')}, ?)
  `;

  await run(query, [...values, hospitalId]);
}

// ============================================================================
// Storage Endpoints for Each Resource Type
// ============================================================================

router.post('/store-fhir-patients', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_patients', 'patient');
});

router.post('/store-fhir-encounters', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_encounters', 'encounter');
});

router.post('/store-fhir-conditions', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_conditions', 'condition');
});

router.post('/store-fhir-observations', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_observations', 'observation');
});

router.post('/store-fhir-medication-requests', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_medication_requests', 'medicationRequest');
});

router.post('/store-fhir-medication-administrations', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_medication_administrations', 'medicationAdministration');
});

router.post('/store-fhir-medication-statements', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_medication_statements', 'medicationStatement');
});

router.post('/store-fhir-procedures', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_procedures', 'procedure');
});

router.post('/store-fhir-diagnostic-reports', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_diagnostic_reports', 'diagnosticReport');
});

router.post('/store-fhir-imaging-studies', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_imaging_studies', 'imagingStudy');
});

router.post('/store-fhir-specimens', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_specimens', 'specimen');
});

router.post('/store-fhir-allergies', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_allergies', 'allergy');
});

router.post('/store-fhir-immunizations', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_immunizations', 'immunization');
});

router.post('/store-fhir-care-plans', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_care_plans', 'carePlan');
});

router.post('/store-fhir-care-teams', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_care_teams', 'careTeam');
});

router.post('/store-fhir-devices', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_devices', 'device');
});

router.post('/store-fhir-organizations', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_organizations', 'organization');
});

router.post('/store-fhir-practitioners', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_practitioners', 'practitioner');
});

router.post('/store-fhir-locations', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_locations', 'location');
});

router.post('/store-fhir-coverage', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_coverage', 'coverage');
});

router.post('/store-fhir-related-persons', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_related_persons', 'relatedPerson');
});

router.post('/store-fhir-provenance', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_provenance', 'provenance');
});

router.post('/store-fhir-audit-events', authenticateAdapter, async (req, res) => {
  await storeResources(req, res, 'fhir_audit_events', 'auditEvent');
});

export default router;

