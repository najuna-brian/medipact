/**
 * FHIR Resource Database Operations
 * 
 * CRUD operations for FHIR resources (patients, conditions, observations).
 */

import { getDatabase, getDatabaseType } from './database.js';
import { promisify } from 'util';

/**
 * Create FHIR patient record
 */
export async function createFHIRPatient(patientData) {
  const db = getDatabase();
  const dbType = getDatabaseType();
  
  const {
    anonymousPatientId,
    upi,
    country,
    region,
    ageRange,
    gender,
    hospitalId
  } = patientData;
  
  if (dbType === 'postgresql') {
    // PostgreSQL uses camelCase with quoted identifiers
    const result = await db.query(
      `INSERT INTO fhir_patients (
        "anonymousPatientId", upi, country, region, "ageRange", gender, "hospitalId"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [anonymousPatientId, upi, country, region, ageRange, gender, hospitalId]
    );
    return mapPatientRow(result.rows[0]);
  } else {
    // SQLite uses camelCase with quoted identifiers
    const run = promisify(db.run.bind(db));
    await run(
      `INSERT INTO fhir_patients (
        "anonymousPatientId", upi, country, region, "ageRange", gender, "hospitalId"
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [anonymousPatientId, upi, country, region, ageRange, gender, hospitalId]
    );
    return getFHIRPatientByAnonymousId(anonymousPatientId);
  }
}

/**
 * Get FHIR patient by anonymous ID
 */
export async function getFHIRPatientByAnonymousId(anonymousPatientId) {
  const db = getDatabase();
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    // PostgreSQL uses camelCase with quoted identifiers
    const result = await db.query(
      'SELECT * FROM fhir_patients WHERE "anonymousPatientId" = $1',
      [anonymousPatientId]
    );
    return result.rows.length > 0 ? mapPatientRow(result.rows[0]) : null;
  } else {
    // SQLite uses camelCase with quoted identifiers
    const get = promisify(db.get.bind(db));
    const row = await get(
      'SELECT * FROM fhir_patients WHERE "anonymousPatientId" = ?',
      [anonymousPatientId]
    );
    return row ? mapPatientRow(row) : null;
  }
}

/**
 * Create FHIR condition record
 */
export async function createFHIRCondition(conditionData) {
  const db = getDatabase();
  const dbType = getDatabaseType();
  
  const {
    anonymousPatientId,
    upi,
    conditionCode,
    conditionName,
    diagnosisDate,
    hospitalId,
    severity,
    status
  } = conditionData;
  
  if (dbType === 'postgresql') {
    // PostgreSQL uses camelCase with quoted identifiers
    const result = await db.query(
      `INSERT INTO fhir_conditions (
        "anonymousPatientId", upi, "conditionCode", "conditionName",
        "diagnosisDate", "hospitalId", severity, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [anonymousPatientId, upi, conditionCode, conditionName, diagnosisDate, hospitalId, severity, status]
    );
    return mapConditionRow(result.rows[0]);
  } else {
    // SQLite uses camelCase with quoted identifiers
    const run = promisify(db.run.bind(db));
    await run(
      `INSERT INTO fhir_conditions (
        "anonymousPatientId", upi, "conditionCode", "conditionName",
        "diagnosisDate", "hospitalId", severity, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [anonymousPatientId, upi, conditionCode, conditionName, diagnosisDate, hospitalId, severity, status]
    );
    // Return the created record (simplified - in production, fetch it)
    return { anonymousPatientId, conditionCode, conditionName, diagnosisDate };
  }
}

/**
 * Create FHIR observation record
 */
export async function createFHIRObservation(observationData) {
  const db = getDatabase();
  const dbType = getDatabaseType();
  
  const {
    anonymousPatientId,
    upi,
    observationCode,
    observationName,
    value,
    unit,
    effectiveDate,
    hospitalId,
    referenceRange,
    interpretation
  } = observationData;
  
  if (dbType === 'postgresql') {
    // PostgreSQL uses camelCase with quoted identifiers
    const result = await db.query(
      `INSERT INTO fhir_observations (
        "anonymousPatientId", upi, "observationCode", "observationName",
        value, unit, "effectiveDate", "hospitalId", "referenceRange", interpretation
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [anonymousPatientId, upi, observationCode, observationName, value, unit, effectiveDate, hospitalId, referenceRange, interpretation]
    );
    return mapObservationRow(result.rows[0]);
  } else {
    // SQLite uses camelCase with quoted identifiers
    const run = promisify(db.run.bind(db));
    await run(
      `INSERT INTO fhir_observations (
        "anonymousPatientId", upi, "observationCode", "observationName",
        value, unit, "effectiveDate", "hospitalId", "referenceRange", interpretation
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [anonymousPatientId, upi, observationCode, observationName, value, unit, effectiveDate, hospitalId, referenceRange, interpretation]
    );
    return { anonymousPatientId, observationCode, observationName, effectiveDate, value, unit };
  }
}

/**
 * Query FHIR resources with filters
 */
export async function queryFHIRResources(filters) {
  const db = getDatabase();
  const dbType = getDatabaseType();
  
  // Build query based on filters
  const conditions = [];
  const params = [];
  let paramIndex = 1;
  
  // Determine placeholder style based on database type
  const placeholder = dbType === 'postgresql' 
    ? (idx) => `$${idx}`
    : () => '?';
  
  // Helper to get column reference with proper quoting for camelCase
  // PostgreSQL: quoted identifiers (case-sensitive)
  // SQLite: unquoted identifiers (case-insensitive, but use camelCase for consistency)
  const col = (columnName) => dbType === 'postgresql' 
    ? `"${columnName}"` 
    : columnName;
  
  // Country filter
  if (filters.country) {
    conditions.push(`p.country = ${placeholder(paramIndex)}`);
    params.push(filters.country);
    paramIndex++;
  }
  
  // Build dynamic joins based on filters
  const joins = [];
  let needsConditionJoin = false;
  let needsObservationJoin = false;
  let needsMedicationJoin = false;
  let needsProcedureJoin = false;
  let needsEncounterJoin = false;
  let needsImagingJoin = false;
  let needsAllergyJoin = false;
  let needsCoverageJoin = false;
  
  // Condition filter
  if (filters.conditionCode || filters.conditionName) {
    needsConditionJoin = true;
    if (filters.conditionCode) {
      conditions.push(`c.${col('conditionCode')} = ${placeholder(paramIndex)}`);
      params.push(filters.conditionCode);
      paramIndex++;
    }
    if (filters.conditionName) {
      conditions.push(`c.${col('conditionName')} LIKE ${placeholder(paramIndex)}`);
      params.push(`%${filters.conditionName}%`);
      paramIndex++;
    }
  }
  
  // Observation filter
  if (filters.observationCode || filters.observationName) {
    needsObservationJoin = true;
    if (filters.observationCode) {
      conditions.push(`o.${col('observationCode')} = ${placeholder(paramIndex)}`);
      params.push(filters.observationCode);
      paramIndex++;
    }
    if (filters.observationName) {
      conditions.push(`o.${col('observationName')} LIKE ${placeholder(paramIndex)}`);
      params.push(`%${filters.observationName}%`);
      paramIndex++;
    }
  }
  
  // Medication filter (Domain 5)
  if (filters.medicationCode || filters.medicationName) {
    needsMedicationJoin = true;
    if (filters.medicationCode) {
      conditions.push(`mr.${col('medicationCode')} = ${placeholder(paramIndex)}`);
      params.push(filters.medicationCode);
      paramIndex++;
    }
    if (filters.medicationName) {
      conditions.push(`mr.${col('medicationName')} LIKE ${placeholder(paramIndex)}`);
      params.push(`%${filters.medicationName}%`);
      paramIndex++;
    }
  }
  
  // Procedure filter (Domain 6)
  if (filters.procedureCode || filters.procedureName) {
    needsProcedureJoin = true;
    if (filters.procedureCode) {
      conditions.push(`pr.${col('procedureCode')} = ${placeholder(paramIndex)}`);
      params.push(filters.procedureCode);
      paramIndex++;
    }
    if (filters.procedureName) {
      conditions.push(`pr.${col('procedureName')} LIKE ${placeholder(paramIndex)}`);
      params.push(`%${filters.procedureName}%`);
      paramIndex++;
    }
  }
  
  // Encounter filter (Domain 2)
  if (filters.encounterType || filters.encounterClass) {
    needsEncounterJoin = true;
    if (filters.encounterType) {
      conditions.push(`e.${col('encounterType')} LIKE ${placeholder(paramIndex)}`);
      params.push(`%${filters.encounterType}%`);
      paramIndex++;
    }
    if (filters.encounterClass) {
      conditions.push(`e.${col('encounterClass')} = ${placeholder(paramIndex)}`);
      params.push(filters.encounterClass);
      paramIndex++;
    }
  }
  
  // Resource type filter - determine which joins are needed
  if (filters.resourceType) {
    const resourceTypeJoins = {
      'Encounter': () => { needsEncounterJoin = true; },
      'MedicationRequest': () => { needsMedicationJoin = true; },
      'Procedure': () => { needsProcedureJoin = true; },
      'ImagingStudy': () => { needsImagingJoin = true; },
      'AllergyIntolerance': () => { needsAllergyJoin = true; },
      'Coverage': () => { needsCoverageJoin = true; },
      'Condition': () => { needsConditionJoin = true; },
      'Observation': () => { needsObservationJoin = true; }
    };
    if (resourceTypeJoins[filters.resourceType]) {
      resourceTypeJoins[filters.resourceType]();
    }
  }
  
  // Date range filter - check all resource types
  if (filters.startDate) {
    const dateConditions = [];
    if (needsConditionJoin) dateConditions.push(`c.${col('diagnosisDate')} >= ${placeholder(paramIndex)}`);
    if (needsObservationJoin) dateConditions.push(`o.${col('effectiveDate')} >= ${placeholder(paramIndex)}`);
    if (needsMedicationJoin) dateConditions.push(`mr.${col('authoredOn')} >= ${placeholder(paramIndex)}`);
    if (needsProcedureJoin) dateConditions.push(`pr.${col('performedDate')} >= ${placeholder(paramIndex)}`);
    if (needsEncounterJoin) dateConditions.push(`e.${col('periodStart')} >= ${placeholder(paramIndex)}`);
    
    if (dateConditions.length > 0) {
      conditions.push(`(${dateConditions.join(' OR ')})`);
      // Add the same date param for each condition
      dateConditions.forEach(() => params.push(filters.startDate));
      paramIndex += dateConditions.length;
    } else {
      // If no specific joins, check patient createdAt as fallback
      conditions.push(`p.${col('createdAt')} >= ${placeholder(paramIndex)}`);
      params.push(filters.startDate);
      paramIndex++;
    }
  }
  
  if (filters.endDate) {
    const dateConditions = [];
    if (needsConditionJoin) dateConditions.push(`c.${col('diagnosisDate')} <= ${placeholder(paramIndex)}`);
    if (needsObservationJoin) dateConditions.push(`o.${col('effectiveDate')} <= ${placeholder(paramIndex)}`);
    if (needsMedicationJoin) dateConditions.push(`mr.${col('authoredOn')} <= ${placeholder(paramIndex)}`);
    if (needsProcedureJoin) dateConditions.push(`pr.${col('performedDate')} <= ${placeholder(paramIndex)}`);
    if (needsEncounterJoin) dateConditions.push(`e.${col('periodEnd')} <= ${placeholder(paramIndex)}`);
    
    if (dateConditions.length > 0) {
      conditions.push(`(${dateConditions.join(' OR ')})`);
      dateConditions.forEach(() => params.push(filters.endDate));
      paramIndex += dateConditions.length;
    } else {
      conditions.push(`p.${col('createdAt')} <= ${placeholder(paramIndex)}`);
      params.push(filters.endDate);
      paramIndex++;
    }
  }
  
  // Age range filter
  if (filters.ageMin || filters.ageMax) {
    // This would need age calculation logic
    // For now, we'll filter by ageRange if available
    if (filters.ageRange) {
      conditions.push(`p.${col('ageRange')} = ${placeholder(paramIndex)}`);
      params.push(filters.ageRange);
      paramIndex++;
    }
  }
  
  // Gender filter
  if (filters.gender) {
    conditions.push(`p.gender = ${placeholder(paramIndex)}`);
    params.push(filters.gender);
    paramIndex++;
  }
  
  // Hospital filter
  if (filters.hospitalId) {
    conditions.push(`p.${col('hospitalId')} = ${placeholder(paramIndex)}`);
    params.push(filters.hospitalId);
    paramIndex++;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  // Add consent filter if validateConsent is explicitly true
  // Note: patient_consents table uses snake_case (anonymous_patient_id)
  // while fhir_patients uses camelCase (anonymousPatientId)
  // When validateConsent is false/undefined, uploaded patients are considered to have implicit consent
  // (no consent record needed - they consented by allowing their data to be uploaded)
  const patientIdCol = col('anonymousPatientId');
  const consentJoin = filters.validateConsent === true
    ? (() => {
        // For SQLite, use unquoted identifiers (case-insensitive matching)
        // For PostgreSQL, use quoted identifiers
        const consentPatientIdCol = dbType === 'postgresql' 
          ? 'pc."anonymous_patient_id"' 
          : 'pc.anonymous_patient_id';
        return `INNER JOIN patient_consents pc ON p.${patientIdCol} = ${consentPatientIdCol}
         AND pc.status = 'active' 
         AND (pc.expires_at IS NULL OR pc.expires_at > CURRENT_TIMESTAMP)`;
      })()
    : '';
  
  // Build dynamic joins using camelCase
  if (needsConditionJoin) joins.push(`LEFT JOIN fhir_conditions c ON p.${patientIdCol} = c.${patientIdCol}`);
  if (needsObservationJoin) joins.push(`LEFT JOIN fhir_observations o ON p.${patientIdCol} = o.${patientIdCol}`);
  if (needsMedicationJoin) joins.push(`LEFT JOIN fhir_medication_requests mr ON p.${patientIdCol} = mr.${patientIdCol}`);
  if (needsProcedureJoin) joins.push(`LEFT JOIN fhir_procedures pr ON p.${patientIdCol} = pr.${patientIdCol}`);
  if (needsEncounterJoin) joins.push(`LEFT JOIN fhir_encounters e ON p.${patientIdCol} = e.${patientIdCol}`);
  if (needsImagingJoin) joins.push(`LEFT JOIN fhir_imaging_studies img ON p.${patientIdCol} = img.${patientIdCol}`);
  if (needsAllergyJoin) joins.push(`LEFT JOIN fhir_allergies al ON p.${patientIdCol} = al.${patientIdCol}`);
  if (needsCoverageJoin) joins.push(`LEFT JOIN fhir_coverage cov ON p.${patientIdCol} = cov.${patientIdCol}`);
  
  // Query to get distinct patients matching filters
  const query = `
    SELECT DISTINCT p.*
    FROM fhir_patients p
    ${consentJoin}
    ${joins.join('\n    ')}
    ${whereClause}
    LIMIT ${filters.limit || 1000}
  `;
  
  // Debug: Log query for troubleshooting
  if (process.env.DEBUG_QUERIES === 'true') {
    console.log('[queryFHIRResources] Generated query:', query);
    console.log('[queryFHIRResources] Params:', params);
  }
  
  if (dbType === 'postgresql') {
    const result = await db.query(query, params);
    return result.rows.map(mapPatientRow);
  } else {
    const all = promisify(db.all.bind(db));
    try {
      const rows = await all(query, params);
      return rows.map(mapPatientRow);
    } catch (error) {
      // Log the actual query that failed for debugging
      console.error('[queryFHIRResources] Query failed:', error.message);
      console.error('[queryFHIRResources] Query was:', query);
      console.error('[queryFHIRResources] Params:', params);
      throw error;
    }
  }
}

/**
 * Count matching patients for query
 */
export async function countFHIRPatients(filters) {
  const db = getDatabase();
  const dbType = getDatabaseType();
  
  const conditions = [];
  const params = [];
  let paramIndex = 1;
  
  // Determine placeholder style based on database type
  const placeholder = dbType === 'postgresql' 
    ? (idx) => `$${idx}`
    : () => '?';
  
  // Helper to get column reference with proper quoting for camelCase
  const col = (columnName) => dbType === 'postgresql' 
    ? `"${columnName}"` 
    : columnName;
  
  // Build dynamic joins based on filters (same logic as queryFHIRResources)
  const joins = [];
  let needsConditionJoin = false;
  let needsObservationJoin = false;
  let needsMedicationJoin = false;
  let needsProcedureJoin = false;
  let needsEncounterJoin = false;
  
  if (filters.country) {
    conditions.push(`p.country = ${placeholder(paramIndex)}`);
    params.push(filters.country);
    paramIndex++;
  }
  
  if (filters.conditionCode || filters.conditionName) {
    needsConditionJoin = true;
    if (filters.conditionCode) {
      conditions.push(`c.${col('conditionCode')} = ${placeholder(paramIndex)}`);
      params.push(filters.conditionCode);
      paramIndex++;
    }
    if (filters.conditionName) {
      conditions.push(`c.${col('conditionName')} LIKE ${placeholder(paramIndex)}`);
      params.push(`%${filters.conditionName}%`);
      paramIndex++;
    }
  }
  
  if (filters.observationCode || filters.observationName) {
    needsObservationJoin = true;
    if (filters.observationCode) {
      conditions.push(`o.${col('observationCode')} = ${placeholder(paramIndex)}`);
      params.push(filters.observationCode);
      paramIndex++;
    }
    if (filters.observationName) {
      conditions.push(`o.${col('observationName')} LIKE ${placeholder(paramIndex)}`);
      params.push(`%${filters.observationName}%`);
      paramIndex++;
    }
  }
  
  if (filters.medicationCode || filters.medicationName) {
    needsMedicationJoin = true;
    if (filters.medicationCode) {
      conditions.push(`mr.${col('medicationCode')} = ${placeholder(paramIndex)}`);
      params.push(filters.medicationCode);
      paramIndex++;
    }
    if (filters.medicationName) {
      conditions.push(`mr.${col('medicationName')} LIKE ${placeholder(paramIndex)}`);
      params.push(`%${filters.medicationName}%`);
      paramIndex++;
    }
  }
  
  if (filters.procedureCode || filters.procedureName) {
    needsProcedureJoin = true;
    if (filters.procedureCode) {
      conditions.push(`pr.${col('procedureCode')} = ${placeholder(paramIndex)}`);
      params.push(filters.procedureCode);
      paramIndex++;
    }
    if (filters.procedureName) {
      conditions.push(`pr.${col('procedureName')} LIKE ${placeholder(paramIndex)}`);
      params.push(`%${filters.procedureName}%`);
      paramIndex++;
    }
  }
  
  if (filters.encounterType || filters.encounterClass) {
    needsEncounterJoin = true;
    if (filters.encounterType) {
      conditions.push(`e.${col('encounterType')} LIKE ${placeholder(paramIndex)}`);
      params.push(`%${filters.encounterType}%`);
      paramIndex++;
    }
    if (filters.encounterClass) {
      conditions.push(`e.${col('encounterClass')} = ${placeholder(paramIndex)}`);
      params.push(filters.encounterClass);
      paramIndex++;
    }
  }
  
  if (filters.resourceType) {
    const resourceTypeJoins = {
      'Encounter': () => { needsEncounterJoin = true; },
      'MedicationRequest': () => { needsMedicationJoin = true; },
      'Procedure': () => { needsProcedureJoin = true; },
      'Condition': () => { needsConditionJoin = true; },
      'Observation': () => { needsObservationJoin = true; }
    };
    if (resourceTypeJoins[filters.resourceType]) {
      resourceTypeJoins[filters.resourceType]();
    }
  }
  
  // Date range filter - check all resource types
  if (filters.startDate) {
    const dateConditions = [];
    if (needsConditionJoin) dateConditions.push(`c.${col('diagnosisDate')} >= ${placeholder(paramIndex)}`);
    if (needsObservationJoin) dateConditions.push(`o.${col('effectiveDate')} >= ${placeholder(paramIndex)}`);
    if (needsMedicationJoin) dateConditions.push(`mr.${col('authoredOn')} >= ${placeholder(paramIndex)}`);
    if (needsProcedureJoin) dateConditions.push(`pr.${col('performedDate')} >= ${placeholder(paramIndex)}`);
    if (needsEncounterJoin) dateConditions.push(`e.${col('periodStart')} >= ${placeholder(paramIndex)}`);
    
    if (dateConditions.length > 0) {
      conditions.push(`(${dateConditions.join(' OR ')})`);
      dateConditions.forEach(() => params.push(filters.startDate));
      paramIndex += dateConditions.length;
    } else {
      conditions.push(`p.${col('createdAt')} >= ${placeholder(paramIndex)}`);
      params.push(filters.startDate);
      paramIndex++;
    }
  }
  
  if (filters.endDate) {
    const dateConditions = [];
    if (needsConditionJoin) dateConditions.push(`c.${col('diagnosisDate')} <= ${placeholder(paramIndex)}`);
    if (needsObservationJoin) dateConditions.push(`o.${col('effectiveDate')} <= ${placeholder(paramIndex)}`);
    if (needsMedicationJoin) dateConditions.push(`mr.${col('authoredOn')} <= ${placeholder(paramIndex)}`);
    if (needsProcedureJoin) dateConditions.push(`pr.${col('performedDate')} <= ${placeholder(paramIndex)}`);
    if (needsEncounterJoin) dateConditions.push(`e.${col('periodEnd')} <= ${placeholder(paramIndex)}`);
    
    if (dateConditions.length > 0) {
      conditions.push(`(${dateConditions.join(' OR ')})`);
      dateConditions.forEach(() => params.push(filters.endDate));
      paramIndex += dateConditions.length;
    } else {
      conditions.push(`p.${col('createdAt')} <= ${placeholder(paramIndex)}`);
      params.push(filters.endDate);
      paramIndex++;
    }
  }
  
  if (filters.hospitalId) {
    conditions.push(`p.${col('hospitalId')} = ${placeholder(paramIndex)}`);
    params.push(filters.hospitalId);
    paramIndex++;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  // Add consent filter if validateConsent is explicitly true
  // When validateConsent is false/undefined, uploaded patients are considered to have implicit consent
  const patientIdCol = col('anonymousPatientId');
  const consentJoin = filters.validateConsent === true
    ? (() => {
        const consentPatientIdCol = dbType === 'postgresql' 
          ? 'pc."anonymous_patient_id"' 
          : 'pc.anonymous_patient_id';
        return `INNER JOIN patient_consents pc ON p.${patientIdCol} = ${consentPatientIdCol}
         AND pc.status = 'active' 
         AND (pc.expires_at IS NULL OR pc.expires_at > CURRENT_TIMESTAMP)`;
      })()
    : '';
  
  // Build dynamic joins using camelCase
  if (needsConditionJoin) joins.push(`LEFT JOIN fhir_conditions c ON p.${patientIdCol} = c.${patientIdCol}`);
  if (needsObservationJoin) joins.push(`LEFT JOIN fhir_observations o ON p.${patientIdCol} = o.${patientIdCol}`);
  if (needsMedicationJoin) joins.push(`LEFT JOIN fhir_medication_requests mr ON p.${patientIdCol} = mr.${patientIdCol}`);
  if (needsProcedureJoin) joins.push(`LEFT JOIN fhir_procedures pr ON p.${patientIdCol} = pr.${patientIdCol}`);
  if (needsEncounterJoin) joins.push(`LEFT JOIN fhir_encounters e ON p.${patientIdCol} = e.${patientIdCol}`);
  
  const query = `
    SELECT COUNT(DISTINCT p.${patientIdCol}) as count
    FROM fhir_patients p
    ${consentJoin}
    ${joins.join('\n    ')}
    ${whereClause}
  `;
  
  if (dbType === 'postgresql') {
    const result = await db.query(query, params);
    return parseInt(result.rows[0].count);
  } else {
    const get = promisify(db.get.bind(db));
    const row = await get(query, params);
    return parseInt(row.count);
  }
}

/**
 * Get distinct patients with their hospital IDs from fhir_patients
 * Used for revenue distribution to ensure each patient's hospital gets their share
 * 
 * @param {Object} filters - Query filters (country, hospitalId, dateRange, etc.)
 * @returns {Promise<Array>} Array of { upi, hospitalId } objects
 */
export async function getPatientsWithHospitals(filters = {}) {
  const db = getDatabase();
  const dbType = getDatabaseType();
  
  const conditions = [];
  const params = [];
  let paramIndex = 1;
  
  const placeholder = dbType === 'postgresql' 
    ? (idx) => `$${idx}`
    : () => '?';
  
  // Helper to get column reference with proper quoting for camelCase
  const col = (columnName) => dbType === 'postgresql' 
    ? `"${columnName}"` 
    : columnName;
  
  const patientIdCol = col('anonymousPatientId');
  
  if (filters.country) {
    conditions.push(`p.country = ${placeholder(paramIndex)}`);
    params.push(filters.country);
    paramIndex++;
  }
  
  if (filters.hospitalId) {
    conditions.push(`p.${col('hospitalId')} = ${placeholder(paramIndex)}`);
    params.push(filters.hospitalId);
    paramIndex++;
  }
  
  // Build dynamic joins
  const joins = [];
  let needsConditionJoin = false;
  let needsObservationJoin = false;
  let needsMedicationJoin = false;
  let needsProcedureJoin = false;
  let needsEncounterJoin = false;
  
  if (filters.conditionCode || filters.conditionName) {
    needsConditionJoin = true;
    if (filters.conditionCode) {
      conditions.push(`c.${col('conditionCode')} = ${placeholder(paramIndex)}`);
      params.push(filters.conditionCode);
      paramIndex++;
    }
    if (filters.conditionName) {
      conditions.push(`c.${col('conditionName')} LIKE ${placeholder(paramIndex)}`);
      params.push(`%${filters.conditionName}%`);
      paramIndex++;
    }
  }
  
  if (filters.observationCode || filters.observationName) {
    needsObservationJoin = true;
    if (filters.observationCode) {
      conditions.push(`o.${col('observationCode')} = ${placeholder(paramIndex)}`);
      params.push(filters.observationCode);
      paramIndex++;
    }
    if (filters.observationName) {
      conditions.push(`o.${col('observationName')} LIKE ${placeholder(paramIndex)}`);
      params.push(`%${filters.observationName}%`);
      paramIndex++;
    }
  }
  
  if (filters.medicationCode || filters.medicationName) {
    needsMedicationJoin = true;
    if (filters.medicationCode) {
      conditions.push(`mr.${col('medicationCode')} = ${placeholder(paramIndex)}`);
      params.push(filters.medicationCode);
      paramIndex++;
    }
    if (filters.medicationName) {
      conditions.push(`mr.${col('medicationName')} LIKE ${placeholder(paramIndex)}`);
      params.push(`%${filters.medicationName}%`);
      paramIndex++;
    }
  }
  
  if (filters.procedureCode || filters.procedureName) {
    needsProcedureJoin = true;
    if (filters.procedureCode) {
      conditions.push(`pr.${col('procedureCode')} = ${placeholder(paramIndex)}`);
      params.push(filters.procedureCode);
      paramIndex++;
    }
    if (filters.procedureName) {
      conditions.push(`pr.${col('procedureName')} LIKE ${placeholder(paramIndex)}`);
      params.push(`%${filters.procedureName}%`);
      paramIndex++;
    }
  }
  
  if (filters.encounterType || filters.encounterClass) {
    needsEncounterJoin = true;
    if (filters.encounterType) {
      conditions.push(`e.${col('encounterType')} LIKE ${placeholder(paramIndex)}`);
      params.push(`%${filters.encounterType}%`);
      paramIndex++;
    }
    if (filters.encounterClass) {
      conditions.push(`e.${col('encounterClass')} = ${placeholder(paramIndex)}`);
      params.push(filters.encounterClass);
      paramIndex++;
    }
  }
  
  // Handle conditionCodes array (from dataset metadata)
  if (filters.conditionCodes && Array.isArray(filters.conditionCodes) && filters.conditionCodes.length > 0) {
    needsConditionJoin = true;
    const placeholders = filters.conditionCodes.map(() => placeholder(paramIndex++)).join(', ');
    conditions.push(`c.${col('conditionCode')} IN (${placeholders})`);
    params.push(...filters.conditionCodes);
  }
  
  // Date range filter - check all resource types
  if (filters.startDate) {
    const dateConditions = [];
    if (needsConditionJoin) dateConditions.push(`c.${col('diagnosisDate')} >= ${placeholder(paramIndex)}`);
    if (needsObservationJoin) dateConditions.push(`o.${col('effectiveDate')} >= ${placeholder(paramIndex)}`);
    if (needsMedicationJoin) dateConditions.push(`mr.${col('authoredOn')} >= ${placeholder(paramIndex)}`);
    if (needsProcedureJoin) dateConditions.push(`pr.${col('performedDate')} >= ${placeholder(paramIndex)}`);
    if (needsEncounterJoin) dateConditions.push(`e.${col('periodStart')} >= ${placeholder(paramIndex)}`);
    
    if (dateConditions.length > 0) {
      conditions.push(`(${dateConditions.join(' OR ')})`);
      dateConditions.forEach(() => params.push(filters.startDate));
      paramIndex += dateConditions.length;
    } else {
      conditions.push(`p.${col('createdAt')} >= ${placeholder(paramIndex)}`);
      params.push(filters.startDate);
      paramIndex++;
    }
  }
  
  if (filters.endDate) {
    const dateConditions = [];
    if (needsConditionJoin) dateConditions.push(`c.${col('diagnosisDate')} <= ${placeholder(paramIndex)}`);
    if (needsObservationJoin) dateConditions.push(`o.${col('effectiveDate')} <= ${placeholder(paramIndex)}`);
    if (needsMedicationJoin) dateConditions.push(`mr.${col('authoredOn')} <= ${placeholder(paramIndex)}`);
    if (needsProcedureJoin) dateConditions.push(`pr.${col('performedDate')} <= ${placeholder(paramIndex)}`);
    if (needsEncounterJoin) dateConditions.push(`e.${col('periodEnd')} <= ${placeholder(paramIndex)}`);
    
    if (dateConditions.length > 0) {
      conditions.push(`(${dateConditions.join(' OR ')})`);
      dateConditions.forEach(() => params.push(filters.endDate));
      paramIndex += dateConditions.length;
    } else {
      conditions.push(`p.${col('createdAt')} <= ${placeholder(paramIndex)}`);
      params.push(filters.endDate);
      paramIndex++;
    }
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  // Build dynamic joins using camelCase
  if (needsConditionJoin) joins.push(`LEFT JOIN fhir_conditions c ON p.${patientIdCol} = c.${patientIdCol}`);
  if (needsObservationJoin) joins.push(`LEFT JOIN fhir_observations o ON p.${patientIdCol} = o.${patientIdCol}`);
  if (needsMedicationJoin) joins.push(`LEFT JOIN fhir_medication_requests mr ON p.${patientIdCol} = mr.${patientIdCol}`);
  if (needsProcedureJoin) joins.push(`LEFT JOIN fhir_procedures pr ON p.${patientIdCol} = pr.${patientIdCol}`);
  if (needsEncounterJoin) joins.push(`LEFT JOIN fhir_encounters e ON p.${patientIdCol} = e.${patientIdCol}`);
  
  // Get distinct patients with their hospital IDs
  const query = `
    SELECT DISTINCT p.upi, p.${col('hospitalId')} as hospitalId
    FROM fhir_patients p
    ${joins.join('\n    ')}
    ${whereClause}
  `;
  
  if (dbType === 'postgresql') {
    const result = await db.query(query, params);
    return result.rows.map(row => ({
      upi: row.upi,
      hospitalId: row.hospitalid
    }));
  } else {
    const all = promisify(db.all.bind(db));
    const rows = await all(query, params);
    return rows.map(row => ({
      upi: row.upi,
      hospitalId: row.hospitalId
    }));
  }
}

/**
 * Map database row to camelCase object (Patient)
 */
function mapPatientRow(row) {
  if (!row) return null;
  // Handle both camelCase (from PostgreSQL/SQLite with camelCase schema) and snake_case (legacy)
  return {
    id: row.id,
    anonymousPatientId: row.anonymousPatientId || row.anonymous_patient_id,
    upi: row.upi,
    country: row.country,
    region: row.region,
    ageRange: row.ageRange || row.age_range,
    gender: row.gender,
    hospitalId: row.hospitalId || row.hospital_id,
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at
  };
}

/**
 * Map database row to camelCase object (Condition)
 */
function mapConditionRow(row) {
  if (!row) return null;
  // Handle both camelCase (from PostgreSQL/SQLite with camelCase schema) and snake_case (legacy)
  return {
    id: row.id,
    anonymousPatientId: row.anonymousPatientId || row.anonymous_patient_id,
    upi: row.upi,
    conditionCode: row.conditionCode || row.condition_code,
    conditionName: row.conditionName || row.condition_name,
    diagnosisDate: row.diagnosisDate || row.diagnosis_date,
    hospitalId: row.hospitalId || row.hospital_id,
    severity: row.severity,
    status: row.status,
    createdAt: row.createdAt || row.created_at
  };
}

/**
 * Map database row to camelCase object (Observation)
 */
function mapObservationRow(row) {
  if (!row) return null;
  // Handle both camelCase (from PostgreSQL/SQLite with camelCase schema) and snake_case (legacy)
  return {
    id: row.id,
    anonymousPatientId: row.anonymousPatientId || row.anonymous_patient_id,
    upi: row.upi,
    observationCode: row.observationCode || row.observation_code,
    observationName: row.observationName || row.observation_name,
    value: row.value,
    unit: row.unit,
    effectiveDate: row.effectiveDate || row.effective_date,
    hospitalId: row.hospitalId || row.hospital_id,
    referenceRange: row.referenceRange || row.reference_range,
    interpretation: row.interpretation,
    createdAt: row.createdAt || row.created_at
  };
}

