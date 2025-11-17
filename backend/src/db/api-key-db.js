/**
 * API Key Database Operations
 * 
 * Manages API keys for researchers to access REST API endpoints
 */

import { run, get, all } from './database.js';
import crypto from 'crypto';

/**
 * Generate a secure API key
 */
function generateAPIKey() {
  return `mp_${crypto.randomBytes(32).toString('hex')}`;
}

/**
 * Create API key for researcher
 */
export async function createAPIKey(researcherId, name = 'Default API Key') {
  const apiKey = generateAPIKey();
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  const keyId = `KEY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  
  const { getDatabaseType } = await import('./database.js');
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    await run(
      `INSERT INTO researcher_api_keys (
        id, researcher_id, key_hash, name, created_at, last_used_at, status
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, NULL, 'active')`,
      [keyId, researcherId, keyHash, name]
    );
  } else {
    await run(
      `INSERT INTO researcher_api_keys (
        id, researcher_id, key_hash, name, created_at, last_used_at, status
      ) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, NULL, 'active')`,
      [keyId, researcherId, keyHash, name]
    );
  }
  
  // Return the plain API key (only shown once)
  return {
    id: keyId,
    apiKey, // Plain key - only returned on creation
    name,
    createdAt: new Date().toISOString(),
    status: 'active'
  };
}

/**
 * Verify API key and return researcher ID
 */
export async function verifyAPIKey(apiKey) {
  if (!apiKey || !apiKey.startsWith('mp_')) {
    return null;
  }
  
  const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');
  
  const { getDatabaseType } = await import('./database.js');
  const dbType = getDatabaseType();
  
  const sql = dbType === 'postgresql'
    ? `SELECT 
        k.id,
        k.researcher_id as "researcherId",
        k.name,
        k.created_at as "createdAt",
        k.last_used_at as "lastUsedAt",
        k.status,
        r.verification_status as "verificationStatus"
      FROM researcher_api_keys k
      INNER JOIN researchers r ON k.researcher_id = r.researcher_id
      WHERE k.key_hash = $1 AND k.status = 'active' AND r.status = 'active'`
    : `SELECT 
        k.id,
        k.researcher_id as researcherId,
        k.name,
        k.created_at as createdAt,
        k.last_used_at as lastUsedAt,
        k.status,
        r.verification_status as verificationStatus
      FROM researcher_api_keys k
      INNER JOIN researchers r ON k.researcher_id = r.researcher_id
      WHERE k.key_hash = ? AND k.status = 'active' AND r.status = 'active'`;
  
  const keyRecord = await get(sql, [keyHash]);
  
  if (keyRecord) {
    // Update last_used_at
    if (dbType === 'postgresql') {
      await run(
        `UPDATE researcher_api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [keyRecord.id]
      );
    } else {
      await run(
        `UPDATE researcher_api_keys SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [keyRecord.id]
      );
    }
    
    return {
      researcherId: keyRecord.researcherId || keyRecord.researcher_id,
      keyId: keyRecord.id,
      name: keyRecord.name,
      verificationStatus: keyRecord.verificationStatus || keyRecord.verification_status
    };
  }
  
  return null;
}

/**
 * Get all API keys for a researcher
 */
export async function getResearcherAPIKeys(researcherId) {
  const { getDatabaseType } = await import('./database.js');
  const dbType = getDatabaseType();
  
  const sql = dbType === 'postgresql'
    ? `SELECT 
        id,
        name,
        created_at as "createdAt",
        last_used_at as "lastUsedAt",
        status
      FROM researcher_api_keys
      WHERE researcher_id = $1
      ORDER BY created_at DESC`
    : `SELECT 
        id,
        name,
        created_at as createdAt,
        last_used_at as lastUsedAt,
        status
      FROM researcher_api_keys
      WHERE researcher_id = ?
      ORDER BY created_at DESC`;
  
  return await all(sql, [researcherId]);
}

/**
 * Revoke API key
 */
export async function revokeAPIKey(keyId, researcherId) {
  const { getDatabaseType } = await import('./database.js');
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    await run(
      `UPDATE researcher_api_keys 
       SET status = 'revoked' 
       WHERE id = $1 AND researcher_id = $2`,
      [keyId, researcherId]
    );
  } else {
    await run(
      `UPDATE researcher_api_keys 
       SET status = 'revoked' 
       WHERE id = ? AND researcher_id = ?`,
      [keyId, researcherId]
    );
  }
  
  return true;
}

