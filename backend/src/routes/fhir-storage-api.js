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
  const hospitalId = req.headers['x-hospital-id'];
  const apiKey = req.headers['x-api-key'];

  if (!hospitalId || !apiKey) {
    return res.status(401).json({ error: 'Missing hospital ID or API key' });
  }

  // TODO: Verify API key matches hospital's API key
  req.hospitalId = hospitalId;
  next();
}

/**
 * Generic storage function for any resource type
 */
async function storeResources(req, res, tableName) {
  try {
    const { hospitalId, resources } = req.body;

    if (!hospitalId || !resources || !Array.isArray(resources)) {
      return res.status(400).json({
        error: 'hospitalId and resources array are required',
      });
    }

    const db = getDatabase();
    const dbType = getDatabaseType();
    const results = {
      created: 0,
      errors: []
    };

    for (const resource of resources) {
      try {
        if (dbType === 'postgresql') {
          await storeResourcePostgreSQL(db, tableName, resource, hospitalId);
        } else {
          await storeResourceSQLite(db, tableName, resource, hospitalId);
        }
        results.created++;
      } catch (error) {
        results.errors.push({
          resource: resource.id || resource.anonymousPatientId || 'unknown',
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Stored ${results.created} ${tableName} resources`,
      results
    });
  } catch (error) {
    console.error(`Error storing ${tableName}:`, error);
    res.status(500).json({ error: error.message });
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

