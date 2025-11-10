/**
 * Query Log Database Operations
 */

import { getDatabase } from './database.js';
import { promisify } from 'util';

/**
 * Create query log
 */
export async function createQueryLog(logData) {
  const db = getDatabase();
  const dbType = db.constructor.name;
  
  const {
    researcherId,
    queryFilters,
    resultCount,
    datasetId = null,
    hcsMessageId = null
  } = logData;
  
  if (dbType === 'Client') {
    // PostgreSQL
    const result = await db.query(
      `INSERT INTO query_logs (
        researcher_id, query_filters, result_count, dataset_id, hcs_message_id
      ) VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [researcherId, queryFilters, resultCount, datasetId, hcsMessageId]
    );
    return mapQueryLogRow(result.rows[0]);
  } else {
    // SQLite
    const run = promisify(db.run.bind(db));
    await run(
      `INSERT INTO query_logs (
        researcher_id, query_filters, result_count, dataset_id, hcs_message_id
      ) VALUES (?, ?, ?, ?, ?)`,
      [researcherId, queryFilters, resultCount, datasetId, hcsMessageId]
    );
    // Return simplified result
    return {
      researcherId,
      resultCount,
      executedAt: new Date().toISOString()
    };
  }
}

/**
 * Get query logs for researcher
 */
export async function getQueryLogs(researcherId, limit = 50) {
  const db = getDatabase();
  const dbType = db.constructor.name;
  
  if (dbType === 'Client') {
    const result = await db.query(
      'SELECT * FROM query_logs WHERE researcher_id = $1 ORDER BY executed_at DESC LIMIT $2',
      [researcherId, limit]
    );
    return result.rows.map(mapQueryLogRow);
  } else {
    const all = promisify(db.all.bind(db));
    const rows = await all(
      'SELECT * FROM query_logs WHERE researcher_id = ? ORDER BY executed_at DESC LIMIT ?',
      [researcherId, limit]
    );
    return rows.map(mapQueryLogRow);
  }
}

/**
 * Map database row to camelCase object
 */
function mapQueryLogRow(row) {
  if (!row) return null;
  return {
    id: row.id,
    researcherId: row.researcher_id,
    queryFilters: typeof row.query_filters === 'string' 
      ? JSON.parse(row.query_filters) 
      : row.query_filters,
    resultCount: row.result_count,
    datasetId: row.dataset_id,
    hcsMessageId: row.hcs_message_id,
    executedAt: row.executed_at
  };
}

