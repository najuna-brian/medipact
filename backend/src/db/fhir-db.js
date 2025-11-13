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
  const dbType = db.constructor.name;
  
  const {
    anonymousPatientId,
    upi,
    country,
    region,
    ageRange,
    gender,
    hospitalId
  } = patientData;
  
  if (dbType === 'Client') {
    // PostgreSQL
    const result = await db.query(
      `INSERT INTO fhir_patients (
        anonymous_patient_id, upi, country, region, age_range, gender, hospital_id
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [anonymousPatientId, upi, country, region, ageRange, gender, hospitalId]
    );
    return mapPatientRow(result.rows[0]);
  } else {
    // SQLite
    const run = promisify(db.run.bind(db));
    await run(
      `INSERT INTO fhir_patients (
        anonymous_patient_id, upi, country, region, age_range, gender, hospital_id
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
  const dbType = db.constructor.name;
  
  if (dbType === 'Client') {
    const result = await db.query(
      'SELECT * FROM fhir_patients WHERE anonymous_patient_id = $1',
      [anonymousPatientId]
    );
    return result.rows.length > 0 ? mapPatientRow(result.rows[0]) : null;
  } else {
    const get = promisify(db.get.bind(db));
    const row = await get(
      'SELECT * FROM fhir_patients WHERE anonymous_patient_id = ?',
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
  const dbType = db.constructor.name;
  
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
  
  if (dbType === 'Client') {
    const result = await db.query(
      `INSERT INTO fhir_conditions (
        anonymous_patient_id, upi, condition_code, condition_name,
        diagnosis_date, hospital_id, severity, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *`,
      [anonymousPatientId, upi, conditionCode, conditionName, diagnosisDate, hospitalId, severity, status]
    );
    return mapConditionRow(result.rows[0]);
  } else {
    const run = promisify(db.run.bind(db));
    await run(
      `INSERT INTO fhir_conditions (
        anonymous_patient_id, upi, condition_code, condition_name,
        diagnosis_date, hospital_id, severity, status
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
  const dbType = db.constructor.name;
  
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
  
  if (dbType === 'Client') {
    const result = await db.query(
      `INSERT INTO fhir_observations (
        anonymous_patient_id, upi, observation_code, observation_name,
        value, unit, effective_date, hospital_id, reference_range, interpretation
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [anonymousPatientId, upi, observationCode, observationName, value, unit, effectiveDate, hospitalId, referenceRange, interpretation]
    );
    return mapObservationRow(result.rows[0]);
  } else {
    const run = promisify(db.run.bind(db));
    await run(
      `INSERT INTO fhir_observations (
        anonymous_patient_id, upi, observation_code, observation_name,
        value, unit, effective_date, hospital_id, reference_range, interpretation
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
  
  // Country filter
  if (filters.country) {
    conditions.push(`p.country = ${placeholder(paramIndex)}`);
    params.push(filters.country);
    paramIndex++;
  }
  
  // Date range filter
  if (filters.startDate) {
    conditions.push(`(c.diagnosis_date >= ${placeholder(paramIndex)} OR o.effective_date >= ${placeholder(paramIndex)})`);
    params.push(filters.startDate);
    paramIndex++;
  }
  
  if (filters.endDate) {
    conditions.push(`(c.diagnosis_date <= ${placeholder(paramIndex)} OR o.effective_date <= ${placeholder(paramIndex)})`);
    params.push(filters.endDate);
    paramIndex++;
  }
  
  // Condition filter
  if (filters.conditionCode) {
    conditions.push(`c.condition_code = ${placeholder(paramIndex)}`);
    params.push(filters.conditionCode);
    paramIndex++;
  }
  
  if (filters.conditionName) {
    conditions.push(`c.condition_name LIKE ${placeholder(paramIndex)}`);
    params.push(`%${filters.conditionName}%`);
    paramIndex++;
  }
  
  // Observation filter
  if (filters.observationCode) {
    conditions.push(`o.observation_code = ${placeholder(paramIndex)}`);
    params.push(filters.observationCode);
    paramIndex++;
  }
  
  if (filters.observationName) {
    conditions.push(`o.observation_name LIKE ${placeholder(paramIndex)}`);
    params.push(`%${filters.observationName}%`);
    paramIndex++;
  }
  
  // Age range filter
  if (filters.ageMin || filters.ageMax) {
    // This would need age calculation logic
    // For now, we'll filter by age_range if available
    if (filters.ageRange) {
      conditions.push(`p.age_range = ${placeholder(paramIndex)}`);
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
    conditions.push(`p.hospital_id = ${placeholder(paramIndex)}`);
    params.push(filters.hospitalId);
    paramIndex++;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  // Add consent filter if validateConsent is true
  const consentJoin = filters.validateConsent !== false 
    ? `INNER JOIN patient_consents pc ON p.anonymous_patient_id = pc.anonymous_patient_id 
       AND pc.status = 'active' 
       AND (pc.expires_at IS NULL OR pc.expires_at > CURRENT_TIMESTAMP)`
    : '';
  
  // Query to get distinct patients matching filters
  const query = `
    SELECT DISTINCT p.*
    FROM fhir_patients p
    ${consentJoin}
    LEFT JOIN fhir_conditions c ON p.anonymous_patient_id = c.anonymous_patient_id
    LEFT JOIN fhir_observations o ON p.anonymous_patient_id = o.anonymous_patient_id
    ${whereClause}
    LIMIT ${filters.limit || 1000}
  `;
  
  if (dbType === 'postgresql') {
    const result = await db.query(query, params);
    return result.rows.map(mapPatientRow);
  } else {
    const all = promisify(db.all.bind(db));
    const rows = await all(query, params);
    return rows.map(mapPatientRow);
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
  
  // Same filter logic as queryFHIRResources
  if (filters.country) {
    conditions.push(`p.country = ${placeholder(paramIndex)}`);
    params.push(filters.country);
    paramIndex++;
  }
  
  if (filters.startDate) {
    conditions.push(`(c.diagnosis_date >= ${placeholder(paramIndex)} OR o.effective_date >= ${placeholder(paramIndex)})`);
    params.push(filters.startDate);
    paramIndex++;
  }
  
  if (filters.endDate) {
    conditions.push(`(c.diagnosis_date <= ${placeholder(paramIndex)} OR o.effective_date <= ${placeholder(paramIndex)})`);
    params.push(filters.endDate);
    paramIndex++;
  }
  
  if (filters.conditionCode) {
    conditions.push(`c.condition_code = ${placeholder(paramIndex)}`);
    params.push(filters.conditionCode);
    paramIndex++;
  }
  
  if (filters.observationCode) {
    conditions.push(`o.observation_code = ${placeholder(paramIndex)}`);
    params.push(filters.observationCode);
    paramIndex++;
  }
  
  if (filters.hospitalId) {
    conditions.push(`p.hospital_id = ${placeholder(paramIndex)}`);
    params.push(filters.hospitalId);
    paramIndex++;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  // Add consent filter if validateConsent is true
  const consentJoin = filters.validateConsent !== false
    ? `INNER JOIN patient_consents pc ON p.anonymous_patient_id = pc.anonymous_patient_id 
       AND pc.status = 'active' 
       AND (pc.expires_at IS NULL OR pc.expires_at > CURRENT_TIMESTAMP)`
    : '';
  
  const query = `
    SELECT COUNT(DISTINCT p.anonymous_patient_id) as count
    FROM fhir_patients p
    ${consentJoin}
    LEFT JOIN fhir_conditions c ON p.anonymous_patient_id = c.anonymous_patient_id
    LEFT JOIN fhir_observations o ON p.anonymous_patient_id = o.anonymous_patient_id
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
  
  if (filters.country) {
    conditions.push(`p.country = ${placeholder(paramIndex)}`);
    params.push(filters.country);
    paramIndex++;
  }
  
  if (filters.hospitalId) {
    conditions.push(`p.hospital_id = ${placeholder(paramIndex)}`);
    params.push(filters.hospitalId);
    paramIndex++;
  }
  
  if (filters.startDate) {
    conditions.push(`(c.diagnosis_date >= ${placeholder(paramIndex)} OR o.effective_date >= ${placeholder(paramIndex)})`);
    params.push(filters.startDate);
    paramIndex++;
  }
  
  if (filters.endDate) {
    conditions.push(`(c.diagnosis_date <= ${placeholder(paramIndex)} OR o.effective_date <= ${placeholder(paramIndex)})`);
    params.push(filters.endDate);
    paramIndex++;
  }
  
  if (filters.conditionCode) {
    conditions.push(`c.condition_code = ${placeholder(paramIndex)}`);
    params.push(filters.conditionCode);
    paramIndex++;
  }
  
  if (filters.observationCode) {
    conditions.push(`o.observation_code = ${placeholder(paramIndex)}`);
    params.push(filters.observationCode);
    paramIndex++;
  }
  
  // Handle conditionCodes array (from dataset metadata)
  if (filters.conditionCodes && Array.isArray(filters.conditionCodes) && filters.conditionCodes.length > 0) {
    const placeholders = filters.conditionCodes.map(() => placeholder(paramIndex++)).join(', ');
    conditions.push(`c.condition_code IN (${placeholders})`);
    params.push(...filters.conditionCodes);
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  
  // Get distinct patients with their hospital IDs
  const query = `
    SELECT DISTINCT p.upi, p.hospital_id as hospitalId
    FROM fhir_patients p
    LEFT JOIN fhir_conditions c ON p.anonymous_patient_id = c.anonymous_patient_id
    LEFT JOIN fhir_observations o ON p.anonymous_patient_id = o.anonymous_patient_id
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
  return {
    id: row.id,
    anonymousPatientId: row.anonymous_patient_id,
    upi: row.upi,
    country: row.country,
    region: row.region,
    ageRange: row.age_range,
    gender: row.gender,
    hospitalId: row.hospital_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

/**
 * Map database row to camelCase object (Condition)
 */
function mapConditionRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    anonymousPatientId: row.anonymous_patient_id,
    upi: row.upi,
    conditionCode: row.condition_code,
    conditionName: row.condition_name,
    diagnosisDate: row.diagnosis_date,
    hospitalId: row.hospital_id,
    severity: row.severity,
    status: row.status,
    createdAt: row.created_at
  };
}

/**
 * Map database row to camelCase object (Observation)
 */
function mapObservationRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    anonymousPatientId: row.anonymous_patient_id,
    upi: row.upi,
    observationCode: row.observation_code,
    observationName: row.observation_name,
    value: row.value,
    unit: row.unit,
    effectiveDate: row.effective_date,
    hospitalId: row.hospital_id,
    referenceRange: row.reference_range,
    interpretation: row.interpretation,
    createdAt: row.created_at
  };
}

