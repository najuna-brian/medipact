/**
 * Processing History Database Operations
 * 
 * CRUD operations for processing history (CSV uploads).
 */

import { run, get, all } from './database.js';
import { getDatabaseType } from './database.js';

/**
 * Create processing history record
 */
export async function createProcessingHistory(historyData) {
  const {
    hospitalId,
    fileName,
    recordsProcessed = 0,
    consentProofs = 0,
    dataProofs = 0,
    consentTopicId = null,
    dataTopicId = null,
    status = 'completed',
  } = historyData;

  const dbType = getDatabaseType();
  const now = new Date().toISOString();
  const processedAt = status === 'completed' ? now : null;

  if (dbType === 'postgresql') {
    const result = await run(
      `INSERT INTO processing_history (
        hospital_id, file_name, records_processed, consent_proofs, data_proofs,
        consent_topic_id, data_topic_id, status, processed_at, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id`,
      [
        hospitalId,
        fileName,
        recordsProcessed,
        consentProofs,
        dataProofs,
        consentTopicId,
        dataTopicId,
        status,
        processedAt,
        now,
      ]
    );
    return { ...historyData, id: result.rows[0].id, createdAt: now, processedAt };
  } else {
    const result = await run(
      `INSERT INTO processing_history (
        hospital_id, file_name, records_processed, consent_proofs, data_proofs,
        consent_topic_id, data_topic_id, status, processed_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        hospitalId,
        fileName,
        recordsProcessed,
        consentProofs,
        dataProofs,
        consentTopicId,
        dataTopicId,
        status,
        processedAt,
        now,
      ]
    );
    return { ...historyData, id: result.lastID, createdAt: now, processedAt };
  }
}

/**
 * Get processing history for a hospital
 */
export async function getProcessingHistory(hospitalId, limit = 50) {
  const dbType = getDatabaseType();

  if (dbType === 'postgresql') {
    const result = await all(
      `SELECT 
        id,
        hospital_id as "hospitalId",
        file_name as "fileName",
        records_processed as "recordsProcessed",
        consent_proofs as "consentProofs",
        data_proofs as "dataProofs",
        consent_topic_id as "consentTopicId",
        data_topic_id as "dataTopicId",
        status,
        processed_at as "processedAt",
        created_at as "createdAt"
      FROM processing_history
      WHERE hospital_id = $1
      ORDER BY created_at DESC
      LIMIT $2`,
      [hospitalId, limit]
    );
    return result.rows || result;
  } else {
    const rows = await all(
      `SELECT * FROM processing_history
      WHERE hospital_id = ?
      ORDER BY created_at DESC
      LIMIT ?`,
      [hospitalId, limit]
    );
    return rows.map(row => ({
      id: row.id,
      hospitalId: row.hospital_id,
      fileName: row.file_name,
      recordsProcessed: row.records_processed,
      consentProofs: row.consent_proofs,
      dataProofs: row.data_proofs,
      consentTopicId: row.consent_topic_id,
      dataTopicId: row.data_topic_id,
      status: row.status,
      processedAt: row.processed_at,
      createdAt: row.created_at,
    }));
  }
}

/**
 * Get processing history by ID
 */
export async function getProcessingHistoryById(id) {
  const dbType = getDatabaseType();

  if (dbType === 'postgresql') {
    const result = await get(
      `SELECT 
        id,
        hospital_id as "hospitalId",
        file_name as "fileName",
        records_processed as "recordsProcessed",
        consent_proofs as "consentProofs",
        data_proofs as "dataProofs",
        consent_topic_id as "consentTopicId",
        data_topic_id as "dataTopicId",
        status,
        processed_at as "processedAt",
        created_at as "createdAt"
      FROM processing_history
      WHERE id = $1`,
      [id]
    );
    return result;
  } else {
    const row = await get(
      `SELECT * FROM processing_history WHERE id = ?`,
      [id]
    );
    if (!row) return null;
    return {
      id: row.id,
      hospitalId: row.hospital_id,
      fileName: row.file_name,
      recordsProcessed: row.records_processed,
      consentProofs: row.consent_proofs,
      dataProofs: row.data_proofs,
      consentTopicId: row.consent_topic_id,
      dataTopicId: row.data_topic_id,
      status: row.status,
      processedAt: row.processed_at,
      createdAt: row.created_at,
    };
  }
}

/**
 * Update processing history status
 */
export async function updateProcessingHistoryStatus(id, status) {
  const dbType = getDatabaseType();
  const processedAt = status === 'completed' ? new Date().toISOString() : null;

  if (dbType === 'postgresql') {
    await run(
      `UPDATE processing_history 
      SET status = $1, processed_at = $2 
      WHERE id = $3`,
      [status, processedAt, id]
    );
  } else {
    await run(
      `UPDATE processing_history 
      SET status = ?, processed_at = ? 
      WHERE id = ?`,
      [status, processedAt, id]
    );
  }
}


