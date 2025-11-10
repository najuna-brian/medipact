/**
 * Dataset Database Operations
 * 
 * CRUD operations for datasets, FHIR resources, and related data.
 */

import { getDatabase } from './database.js';
import { promisify } from 'util';
import crypto from 'crypto';

/**
 * Generate dataset ID
 */
function generateDatasetId() {
  const randomBytes = crypto.randomBytes(6);
  return `DS-${randomBytes.toString('hex').toUpperCase()}`;
}

/**
 * Create a new dataset
 */
export async function createDataset(datasetData) {
  const db = getDatabase();
  const dbType = db.constructor.name;
  
  const datasetId = datasetData.id || generateDatasetId();
  const {
    name,
    description,
    hospitalId,
    country,
    recordCount = 0,
    dateRangeStart,
    dateRangeEnd,
    conditionCodes,
    price,
    currency = 'HBAR',
    format = 'FHIR',
    consentType,
    hcsTopicId,
    consentTopicId,
    dataTopicId,
    status = 'draft'
  } = datasetData;

  if (dbType === 'Client') {
    // PostgreSQL
    const conditionCodesJson = conditionCodes ? JSON.stringify(conditionCodes) : null;
    
    const result = await db.query(
      `INSERT INTO datasets (
        id, name, description, hospital_id, country, record_count,
        date_range_start, date_range_end, condition_codes, price, currency,
        format, consent_type, hcs_topic_id, consent_topic_id, data_topic_id, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
      RETURNING *`,
      [
        datasetId, name, description, hospitalId, country, recordCount,
        dateRangeStart, dateRangeEnd, conditionCodesJson, price, currency,
        format, consentType, hcsTopicId, consentTopicId, dataTopicId, status
      ]
    );
    
    return mapDatasetRow(result.rows[0]);
  } else {
    // SQLite
    const run = promisify(db.run.bind(db));
    const conditionCodesJson = conditionCodes ? JSON.stringify(conditionCodes) : null;
    
    await run(
      `INSERT INTO datasets (
        id, name, description, hospital_id, country, record_count,
        date_range_start, date_range_end, condition_codes, price, currency,
        format, consent_type, hcs_topic_id, consent_topic_id, data_topic_id, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        datasetId, name, description, hospitalId, country, recordCount,
        dateRangeStart, dateRangeEnd, conditionCodesJson, price, currency,
        format, consentType, hcsTopicId, consentTopicId, dataTopicId, status
      ]
    );
    
    return getDataset(datasetId);
  }
}

/**
 * Get dataset by ID
 */
export async function getDataset(datasetId) {
  const db = getDatabase();
  const dbType = db.constructor.name;
  
  if (dbType === 'Client') {
    // PostgreSQL
    const result = await db.query('SELECT * FROM datasets WHERE id = $1', [datasetId]);
    if (result.rows.length === 0) return null;
    return mapDatasetRow(result.rows[0]);
  } else {
    // SQLite
    const get = promisify(db.get.bind(db));
    const row = await get('SELECT * FROM datasets WHERE id = ?', [datasetId]);
    if (!row) return null;
    return mapDatasetRow(row);
  }
}

/**
 * Get all active datasets
 */
export async function getAllDatasets(filters = {}) {
  const db = getDatabase();
  const dbType = db.constructor.name;
  
  // Build query with proper parameter placeholders for both SQLite and PostgreSQL
  const conditions = ['status = ?'];
  const params = ['active'];
  
  if (filters.country) {
    conditions.push('country = ?');
    params.push(filters.country);
  }
  
  if (filters.hospitalId) {
    conditions.push('hospital_id = ?');
    params.push(filters.hospitalId);
  }
  
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  let query = `SELECT * FROM datasets ${whereClause} ORDER BY created_at DESC`;
  
  // Convert to PostgreSQL parameter format if needed
  if (dbType === 'Client') {
    let paramIndex = 1;
    query = query.replace(/\?/g, () => `$${paramIndex++}`);
  }
  
  if (dbType === 'Client') {
    // PostgreSQL
    const result = await db.query(query, params);
    return result.rows.map(mapDatasetRow);
  } else {
    // SQLite
    const all = promisify(db.all.bind(db));
    const rows = await all(query, params);
    return rows.map(mapDatasetRow);
  }
}

/**
 * Update dataset
 */
export async function updateDataset(datasetId, updates) {
  const db = getDatabase();
  const dbType = db.constructor.name;
  
  const allowedFields = [
    'name', 'description', 'record_count', 'date_range_start', 'date_range_end',
    'condition_codes', 'price', 'currency', 'format', 'status', 'hcs_topic_id',
    'consent_topic_id', 'data_topic_id'
  ];
  
  const updateFields = [];
  const values = [];
  let paramIndex = 1;
  
  for (const [key, value] of Object.entries(updates)) {
    const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    if (allowedFields.includes(dbKey)) {
      if (key === 'conditionCodes') {
        updateFields.push(`condition_codes = $${paramIndex}`);
        values.push(JSON.stringify(value));
      } else {
        updateFields.push(`${dbKey} = $${paramIndex}`);
        values.push(value);
      }
      paramIndex++;
    }
  }
  
  if (updateFields.length === 0) {
    return getDataset(datasetId);
  }
  
  updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
  values.push(datasetId);
  
  const query = `UPDATE datasets SET ${updateFields.join(', ')} WHERE id = $${paramIndex}`;
  
  if (dbType === 'Client') {
    // PostgreSQL
    await db.query(query, values);
  } else {
    // SQLite
    const run = promisify(db.run.bind(db));
    await run(query, values);
  }
  
  return getDataset(datasetId);
}

/**
 * Map database row to camelCase object
 */
function mapDatasetRow(row) {
  if (!row) return null;
  
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    hospitalId: row.hospital_id,
    country: row.country,
    recordCount: row.record_count,
    dateRangeStart: row.date_range_start,
    dateRangeEnd: row.date_range_end,
    conditionCodes: row.condition_codes ? JSON.parse(row.condition_codes) : null,
    price: parseFloat(row.price),
    currency: row.currency,
    format: row.format,
    consentType: row.consent_type,
    hcsTopicId: row.hcs_topic_id,
    consentTopicId: row.consent_topic_id,
    dataTopicId: row.data_topic_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

