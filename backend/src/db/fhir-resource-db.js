/**
 * FHIR Resource Database Operations
 * 
 * Functions to query individual FHIR resource types for CSV export and API access
 */

import { getDatabase, getDatabaseType } from './database.js';
import { promisify } from 'util';

/**
 * Query patients with filters
 */
export async function queryPatients(filters = {}) {
  const db = getDatabase();
  const dbType = getDatabaseType();
  const all = dbType === 'postgresql' 
    ? async (query, params) => {
        const result = await db.query(query, params);
        return result.rows;
      }
    : promisify(db.all.bind(db));
  
  const conditions = [];
  const params = [];
  let paramIndex = 1;
  const placeholder = dbType === 'postgresql' ? (idx) => `$${idx}` : () => '?';
  const col = (name) => dbType === 'postgresql' ? `"${name}"` : name;
  
  if (filters.country) {
    conditions.push(`country = ${placeholder(paramIndex)}`);
    params.push(filters.country);
    paramIndex++;
  }
  
  if (filters.ageRange) {
    conditions.push(`${col('ageRange')} = ${placeholder(paramIndex)}`);
    params.push(filters.ageRange);
    paramIndex++;
  }
  
  if (filters.gender) {
    conditions.push(`gender = ${placeholder(paramIndex)}`);
    params.push(filters.gender);
    paramIndex++;
  }
  
  if (filters.startDate) {
    conditions.push(`${col('createdAt')} >= ${placeholder(paramIndex)}`);
    params.push(filters.startDate);
    paramIndex++;
  }
  
  if (filters.endDate) {
    conditions.push(`${col('createdAt')} <= ${placeholder(paramIndex)}`);
    params.push(filters.endDate);
    paramIndex++;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit ? `LIMIT ${filters.limit}` : '';
  
  const query = `
    SELECT 
      ${col('anonymousPatientId')} as "anonymousPatientId",
      upi,
      country,
      region,
      ${col('ageRange')} as "ageRange",
      gender,
      ${col('hospitalId')} as "hospitalId"
    FROM fhir_patients
    ${whereClause}
    ${limit}
  `;
  
  const rows = await all(query, params);
  return rows.map(row => ({
    anonymousPatientId: row.anonymousPatientId,
    upi: row.upi,
    country: row.country,
    region: row.region || null,
    ageRange: row.ageRange || null,
    gender: row.gender || null,
    hospitalId: row.hospitalId
  }));
}

/**
 * Query conditions with filters
 */
export async function queryConditions(filters = {}) {
  const db = getDatabase();
  const dbType = getDatabaseType();
  const all = dbType === 'postgresql' 
    ? async (query, params) => {
        const result = await db.query(query, params);
        return result.rows;
      }
    : promisify(db.all.bind(db));
  
  const conditions = [];
  const params = [];
  let paramIndex = 1;
  const placeholder = dbType === 'postgresql' ? (idx) => `$${idx}` : () => '?';
  const col = (name) => dbType === 'postgresql' ? `"${name}"` : name;
  
  if (filters.country) {
    conditions.push(`p.country = ${placeholder(paramIndex)}`);
    params.push(filters.country);
    paramIndex++;
  }
  
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
  
  if (filters.startDate) {
    conditions.push(`c.${col('diagnosisDate')} >= ${placeholder(paramIndex)}`);
    params.push(filters.startDate);
    paramIndex++;
  }
  
  if (filters.endDate) {
    conditions.push(`c.${col('diagnosisDate')} <= ${placeholder(paramIndex)}`);
    params.push(filters.endDate);
    paramIndex++;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit ? `LIMIT ${filters.limit}` : '';
  
  const query = `
    SELECT 
      c.${col('anonymousPatientId')} as "anonymousPatientId",
      c.upi,
      c.${col('conditionCode')} as "conditionCode",
      c.${col('conditionName')} as "conditionName",
      c.${col('diagnosisDate')} as "diagnosisDate",
      c.${col('hospitalId')} as "hospitalId",
      c.severity,
      c.status,
      p.country
    FROM fhir_conditions c
    INNER JOIN fhir_patients p ON c.${col('anonymousPatientId')} = p.${col('anonymousPatientId')}
    ${whereClause}
    ${limit}
  `;
  
  const rows = await all(query, params);
  return rows.map(row => ({
    anonymousPatientId: row.anonymousPatientId,
    upi: row.upi,
    conditionCode: row.conditionCode,
    conditionName: row.conditionName,
    diagnosisDate: row.diagnosisDate || null,
    hospitalId: row.hospitalId,
    severity: row.severity || null,
    status: row.status || null,
    country: row.country
  }));
}

/**
 * Query observations (labs) with filters
 */
export async function queryObservations(filters = {}) {
  const db = getDatabase();
  const dbType = getDatabaseType();
  const all = dbType === 'postgresql' 
    ? async (query, params) => {
        const result = await db.query(query, params);
        return result.rows;
      }
    : promisify(db.all.bind(db));
  
  const conditions = [];
  const params = [];
  let paramIndex = 1;
  const placeholder = dbType === 'postgresql' ? (idx) => `$${idx}` : () => '?';
  const col = (name) => dbType === 'postgresql' ? `"${name}"` : name;
  
  if (filters.country) {
    conditions.push(`p.country = ${placeholder(paramIndex)}`);
    params.push(filters.country);
    paramIndex++;
  }
  
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
  
  if (filters.startDate) {
    conditions.push(`o.${col('effectiveDate')} >= ${placeholder(paramIndex)}`);
    params.push(filters.startDate);
    paramIndex++;
  }
  
  if (filters.endDate) {
    conditions.push(`o.${col('effectiveDate')} <= ${placeholder(paramIndex)}`);
    params.push(filters.endDate);
    paramIndex++;
  }
  
  if (filters.maxValue) {
    conditions.push(`CAST(o.value AS NUMERIC) <= ${placeholder(paramIndex)}`);
    params.push(filters.maxValue);
    paramIndex++;
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = filters.limit ? `LIMIT ${filters.limit}` : '';
  
  const query = `
    SELECT 
      o.${col('anonymousPatientId')} as "anonymousPatientId",
      o.upi,
      o.${col('observationCode')} as "observationCode",
      o.${col('observationName')} as "observationName",
      o.value,
      o.unit,
      o.${col('effectiveDate')} as "effectiveDate",
      o.${col('hospitalId')} as "hospitalId",
      o.${col('referenceRange')} as "referenceRange",
      o.interpretation,
      p.country
    FROM fhir_observations o
    INNER JOIN fhir_patients p ON o.${col('anonymousPatientId')} = p.${col('anonymousPatientId')}
    ${whereClause}
    ${limit}
  `;
  
  const rows = await all(query, params);
  return rows.map(row => ({
    anonymousPatientId: row.anonymousPatientId,
    upi: row.upi,
    observationCode: row.observationCode,
    observationName: row.observationName,
    value: row.value || null,
    unit: row.unit || null,
    effectiveDate: row.effectiveDate,
    hospitalId: row.hospitalId,
    referenceRange: row.referenceRange || null,
    interpretation: row.interpretation || null,
    country: row.country
  }));
}

/**
 * Query encounters with filters (if table exists)
 */
export async function queryEncounters(filters = {}) {
  const db = getDatabase();
  const dbType = getDatabaseType();
  
  // Check if encounters table exists
  try {
    const all = dbType === 'postgresql' 
      ? async (query, params) => {
          const result = await db.query(query, params);
          return result.rows;
        }
      : promisify(db.all.bind(db));
    
    const conditions = [];
    const params = [];
    let paramIndex = 1;
    const placeholder = dbType === 'postgresql' ? (idx) => `$${idx}` : () => '?';
    const col = (name) => dbType === 'postgresql' ? `"${name}"` : name;
    
    if (filters.country) {
      conditions.push(`p.country = ${placeholder(paramIndex)}`);
      params.push(filters.country);
      paramIndex++;
    }
    
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
    
    if (filters.startDate) {
      conditions.push(`e.${col('periodStart')} >= ${placeholder(paramIndex)}`);
      params.push(filters.startDate);
      paramIndex++;
    }
    
    if (filters.endDate) {
      conditions.push(`e.${col('periodEnd')} <= ${placeholder(paramIndex)}`);
      params.push(filters.endDate);
      paramIndex++;
    }
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit ? `LIMIT ${filters.limit}` : '';
    
    const query = `
      SELECT 
        e.${col('anonymousPatientId')} as "anonymousPatientId",
        e.upi,
        e.${col('encounterType')} as "encounterType",
        e.${col('encounterClass')} as "encounterClass",
        e.${col('periodStart')} as "periodStart",
        e.${col('periodEnd')} as "periodEnd",
        e.${col('hospitalId')} as "hospitalId",
        p.country
      FROM fhir_encounters e
      INNER JOIN fhir_patients p ON e.${col('anonymousPatientId')} = p.${col('anonymousPatientId')}
      ${whereClause}
      ${limit}
    `;
    
    const rows = await all(query, params);
    return rows.map(row => ({
      anonymousPatientId: row.anonymousPatientId,
      upi: row.upi,
      encounterType: row.encounterType || null,
      encounterClass: row.encounterClass || null,
      periodStart: row.periodStart || null,
      periodEnd: row.periodEnd || null,
      hospitalId: row.hospitalId,
      country: row.country
    }));
  } catch (error) {
    // Table doesn't exist yet, return empty array
    if (error.message.includes('no such table') || error.message.includes('does not exist')) {
      return [];
    }
    throw error;
  }
}

