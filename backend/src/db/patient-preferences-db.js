/**
 * Patient Data Preferences Database Operations
 * 
 * CRUD operations for patient data sharing preferences.
 */

import { run, get, all, getDatabaseType } from './database.js';

/**
 * Get or create default preferences for a patient
 */
export async function getOrCreatePatientPreferences(upi) {
  const preferences = await getPatientPreferences(upi);
  
  if (preferences) {
    return preferences;
  }
  
  // Create default preferences
  return await createPatientPreferences(upi, {
    globalSharingEnabled: true,
    allowVerifiedResearchers: true,
    allowUnverifiedResearchers: false,
    allowBulkPurchases: true,
    allowSensitiveDataSharing: false,
    notifyOnDataAccess: true,
    notifyOnNewResearcher: true,
    minimumPricePerRecord: 0.01
  });
}

/**
 * Get patient preferences
 */
export async function getPatientPreferences(upi) {
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    const result = await get(
      `SELECT 
        upi, global_sharing_enabled as "globalSharingEnabled",
        allow_verified_researchers as "allowVerifiedResearchers",
        allow_unverified_researchers as "allowUnverifiedResearchers",
        allow_bulk_purchases as "allowBulkPurchases",
        allow_sensitive_data_sharing as "allowSensitiveDataSharing",
        approved_researcher_ids as "approvedResearcherIds",
        blocked_researcher_ids as "blockedResearcherIds",
        approved_researcher_categories as "approvedResearcherCategories",
        blocked_researcher_categories as "blockedResearcherCategories",
        notify_on_data_access as "notifyOnDataAccess",
        notify_on_new_researcher as "notifyOnNewResearcher",
        minimum_price_per_record as "minimumPricePerRecord",
        created_at as "createdAt",
        updated_at as "updatedAt"
      FROM patient_data_preferences 
      WHERE upi = $1`,
      [upi]
    );
    return result ? parsePreferencesRow(result) : null;
  } else {
    const row = await get(
      `SELECT * FROM patient_data_preferences WHERE upi = ?`,
      [upi]
    );
    return row ? parsePreferencesRow(row) : null;
  }
}

/**
 * Create patient preferences
 */
export async function createPatientPreferences(upi, preferences) {
  const dbType = getDatabaseType();
  const now = new Date().toISOString();
  
  const approvedResearcherIds = preferences.approvedResearcherIds 
    ? JSON.stringify(preferences.approvedResearcherIds) 
    : null;
  const blockedResearcherIds = preferences.blockedResearcherIds 
    ? JSON.stringify(preferences.blockedResearcherIds) 
    : null;
  const approvedCategories = preferences.approvedResearcherCategories 
    ? JSON.stringify(preferences.approvedResearcherCategories) 
    : null;
  const blockedCategories = preferences.blockedResearcherCategories 
    ? JSON.stringify(preferences.blockedResearcherCategories) 
    : null;
  
  if (dbType === 'postgresql') {
    await run(
      `INSERT INTO patient_data_preferences (
        upi, global_sharing_enabled, allow_verified_researchers,
        allow_unverified_researchers, allow_bulk_purchases,
        allow_sensitive_data_sharing, approved_researcher_ids,
        blocked_researcher_ids, approved_researcher_categories,
        blocked_researcher_categories, notify_on_data_access,
        notify_on_new_researcher, minimum_price_per_record,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
      [
        upi,
        preferences.globalSharingEnabled ?? true,
        preferences.allowVerifiedResearchers ?? true,
        preferences.allowUnverifiedResearchers ?? false,
        preferences.allowBulkPurchases ?? true,
        preferences.allowSensitiveDataSharing ?? false,
        approvedResearcherIds,
        blockedResearcherIds,
        approvedCategories,
        blockedCategories,
        preferences.notifyOnDataAccess ?? true,
        preferences.notifyOnNewResearcher ?? true,
        preferences.minimumPricePerRecord ?? 0.01,
        now,
        now
      ]
    );
  } else {
    await run(
      `INSERT INTO patient_data_preferences (
        upi, global_sharing_enabled, allow_verified_researchers,
        allow_unverified_researchers, allow_bulk_purchases,
        allow_sensitive_data_sharing, approved_researcher_ids,
        blocked_researcher_ids, approved_researcher_categories,
        blocked_researcher_categories, notify_on_data_access,
        notify_on_new_researcher, minimum_price_per_record,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        upi,
        preferences.globalSharingEnabled ?? true,
        preferences.allowVerifiedResearchers ?? true,
        preferences.allowUnverifiedResearchers ?? false,
        preferences.allowBulkPurchases ?? true,
        preferences.allowSensitiveDataSharing ?? false,
        approvedResearcherIds,
        blockedResearcherIds,
        approvedCategories,
        blockedCategories,
        preferences.notifyOnDataAccess ?? true,
        preferences.notifyOnNewResearcher ?? true,
        preferences.minimumPricePerRecord ?? 0.01,
        now,
        now
      ]
    );
  }
  
  return await getPatientPreferences(upi);
}

/**
 * Update patient preferences
 */
export async function updatePatientPreferences(upi, updates) {
  const dbType = getDatabaseType();
  const now = new Date().toISOString();
  
  const fields = [];
  const values = [];
  let paramIndex = 1;
  
  const fieldMap = {
    globalSharingEnabled: 'global_sharing_enabled',
    allowVerifiedResearchers: 'allow_verified_researchers',
    allowUnverifiedResearchers: 'allow_unverified_researchers',
    allowBulkPurchases: 'allow_bulk_purchases',
    allowSensitiveDataSharing: 'allow_sensitive_data_sharing',
    approvedResearcherIds: 'approved_researcher_ids',
    blockedResearcherIds: 'blocked_researcher_ids',
    approvedResearcherCategories: 'approved_researcher_categories',
    blockedResearcherCategories: 'blocked_researcher_categories',
    notifyOnDataAccess: 'notify_on_data_access',
    notifyOnNewResearcher: 'notify_on_new_researcher',
    minimumPricePerRecord: 'minimum_price_per_record'
  };
  
  for (const [key, value] of Object.entries(updates)) {
    const dbKey = fieldMap[key];
    if (dbKey) {
      let processedValue = value;
      
      // Handle JSON fields
      if (key === 'approvedResearcherIds' || key === 'blockedResearcherIds' ||
          key === 'approvedResearcherCategories' || key === 'blockedResearcherCategories') {
        processedValue = value ? JSON.stringify(value) : null;
      }
      
      if (dbType === 'postgresql') {
        fields.push(`${dbKey} = $${paramIndex}`);
      } else {
        fields.push(`${dbKey} = ?`);
      }
      values.push(processedValue);
      paramIndex++;
    }
  }
  
  if (fields.length === 0) {
    return await getPatientPreferences(upi);
  }
  
  // Add updated_at
  if (dbType === 'postgresql') {
    fields.push(`updated_at = $${paramIndex}`);
  } else {
    fields.push(`updated_at = ?`);
  }
  values.push(now);
  paramIndex++;
  
  // Add UPI for WHERE clause
  values.push(upi);
  
  const query = `UPDATE patient_data_preferences SET ${fields.join(', ')} WHERE upi = ${dbType === 'postgresql' ? `$${paramIndex}` : '?'}`;
  
  await run(query, values);
  
  return await getPatientPreferences(upi);
}

/**
 * Parse preferences row from database
 */
function parsePreferencesRow(row) {
  return {
    upi: row.upi,
    globalSharingEnabled: row.globalSharingEnabled ?? row.global_sharing_enabled ?? true,
    allowVerifiedResearchers: row.allowVerifiedResearchers ?? row.allow_verified_researchers ?? true,
    allowUnverifiedResearchers: row.allowUnverifiedResearchers ?? row.allow_unverified_researchers ?? false,
    allowBulkPurchases: row.allowBulkPurchases ?? row.allow_bulk_purchases ?? true,
    allowSensitiveDataSharing: row.allowSensitiveDataSharing ?? row.allow_sensitive_data_sharing ?? false,
    approvedResearcherIds: parseJSONField(row.approvedResearcherIds ?? row.approved_researcher_ids),
    blockedResearcherIds: parseJSONField(row.blockedResearcherIds ?? row.blocked_researcher_ids),
    approvedResearcherCategories: parseJSONField(row.approvedResearcherCategories ?? row.approved_researcher_categories),
    blockedResearcherCategories: parseJSONField(row.blockedResearcherCategories ?? row.blocked_researcher_categories),
    notifyOnDataAccess: row.notifyOnDataAccess ?? row.notify_on_data_access ?? true,
    notifyOnNewResearcher: row.notifyOnNewResearcher ?? row.notify_on_new_researcher ?? true,
    minimumPricePerRecord: parseFloat(row.minimumPricePerRecord ?? row.minimum_price_per_record ?? 0.01),
    createdAt: row.createdAt ?? row.created_at,
    updatedAt: row.updatedAt ?? row.updated_at
  };
}

/**
 * Parse JSON field from database
 */
function parseJSONField(value) {
  if (!value) return [];
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return Array.isArray(value) ? value : [];
}

/**
 * Check if researcher is approved by patient
 */
export async function isResearcherApproved(upi, researcherId) {
  const preferences = await getPatientPreferences(upi);
  
  if (!preferences || !preferences.globalSharingEnabled) {
    return false;
  }
  
  // Check if explicitly blocked
  if (preferences.blockedResearcherIds && preferences.blockedResearcherIds.includes(researcherId)) {
    return false;
  }
  
  // Check if explicitly approved
  if (preferences.approvedResearcherIds && preferences.approvedResearcherIds.includes(researcherId)) {
    return true;
  }
  
  // Return null to indicate general preference check needed
  return null;
}

/**
 * Get patient-researcher approval record
 */
export async function getPatientResearcherApproval(upi, researcherId) {
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    return await get(
      `SELECT 
        id, upi, researcher_id as "researcherId",
        approval_status as "approvalStatus",
        approved_at as "approvedAt",
        revoked_at as "revokedAt",
        conditions, created_at as "createdAt",
        updated_at as "updatedAt"
      FROM patient_researcher_approvals
      WHERE upi = $1 AND researcher_id = $2`,
      [upi, researcherId]
    );
  } else {
    const row = await get(
      `SELECT * FROM patient_researcher_approvals
      WHERE upi = ? AND researcher_id = ?`,
      [upi, researcherId]
    );
    return row ? {
      id: row.id,
      upi: row.upi,
      researcherId: row.researcher_id,
      approvalStatus: row.approval_status,
      approvedAt: row.approved_at,
      revokedAt: row.revoked_at,
      conditions: row.conditions ? JSON.parse(row.conditions) : null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    } : null;
  }
}

/**
 * Create or update patient-researcher approval
 */
export async function setPatientResearcherApproval(upi, researcherId, status, conditions = null) {
  const dbType = getDatabaseType();
  const now = new Date().toISOString();
  
  const existing = await getPatientResearcherApproval(upi, researcherId);
  
  if (existing) {
    // Update existing
    const conditionsJson = conditions ? JSON.stringify(conditions) : null;
    const approvedAt = status === 'approved' ? now : existing.approvedAt;
    const revokedAt = status === 'revoked' ? now : null;
    
    if (dbType === 'postgresql') {
      await run(
        `UPDATE patient_researcher_approvals
        SET approval_status = $1, approved_at = $2, revoked_at = $3,
            conditions = $4, updated_at = $5
        WHERE upi = $6 AND researcher_id = $7`,
        [status, approvedAt, revokedAt, conditionsJson, now, upi, researcherId]
      );
    } else {
      await run(
        `UPDATE patient_researcher_approvals
        SET approval_status = ?, approved_at = ?, revoked_at = ?,
            conditions = ?, updated_at = ?
        WHERE upi = ? AND researcher_id = ?`,
        [status, approvedAt, revokedAt, conditionsJson, now, upi, researcherId]
      );
    }
  } else {
    // Create new
    const conditionsJson = conditions ? JSON.stringify(conditions) : null;
    const approvedAt = status === 'approved' ? now : null;
    
    if (dbType === 'postgresql') {
      await run(
        `INSERT INTO patient_researcher_approvals (
          upi, researcher_id, approval_status, approved_at, conditions,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [upi, researcherId, status, approvedAt, conditionsJson, now, now]
      );
    } else {
      await run(
        `INSERT INTO patient_researcher_approvals (
          upi, researcher_id, approval_status, approved_at, conditions,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [upi, researcherId, status, approvedAt, conditionsJson, now, now]
      );
    }
  }
  
  return await getPatientResearcherApproval(upi, researcherId);
}

/**
 * Get data access history for a patient
 */
export async function getPatientAccessHistory(upi, limit = 50) {
  const dbType = getDatabaseType();
  
  if (dbType === 'postgresql') {
    const result = await all(
      `SELECT 
        id, upi, researcher_id as "researcherId",
        dataset_id as "datasetId", record_count as "recordCount",
        accessed_at as "accessedAt",
        revenue_amount as "revenueAmount",
        revenue_currency as "revenueCurrency"
      FROM data_access_history
      WHERE upi = $1
      ORDER BY accessed_at DESC
      LIMIT $2`,
      [upi, limit]
    );
    return result.rows || result;
  } else {
    const rows = await all(
      `SELECT * FROM data_access_history
      WHERE upi = ?
      ORDER BY accessed_at DESC
      LIMIT ?`,
      [upi, limit]
    );
    return rows.map(row => ({
      id: row.id,
      upi: row.upi,
      researcherId: row.researcher_id,
      datasetId: row.dataset_id,
      recordCount: row.record_count,
      accessedAt: row.accessed_at,
      revenueAmount: row.revenue_amount,
      revenueCurrency: row.revenue_currency
    }));
  }
}

/**
 * Record data access in history
 */
export async function recordDataAccess(upi, researcherId, recordCount, datasetId = null, revenueAmount = null) {
  const dbType = getDatabaseType();
  const now = new Date().toISOString();
  
  if (dbType === 'postgresql') {
    await run(
      `INSERT INTO data_access_history (
        upi, researcher_id, dataset_id, record_count,
        accessed_at, revenue_amount, revenue_currency
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [upi, researcherId, datasetId, recordCount, now, revenueAmount, 'HBAR']
    );
  } else {
    await run(
      `INSERT INTO data_access_history (
        upi, researcher_id, dataset_id, record_count,
        accessed_at, revenue_amount, revenue_currency
      ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [upi, researcherId, datasetId, recordCount, now, revenueAmount, 'HBAR']
    );
  }
}

