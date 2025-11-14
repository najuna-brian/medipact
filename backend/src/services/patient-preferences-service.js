/**
 * Patient Preferences Service
 * 
 * Business logic for patient data sharing preferences and researcher approvals.
 */

import {
  getOrCreatePatientPreferences,
  getPatientPreferences,
  updatePatientPreferences,
  isResearcherApproved,
  setPatientResearcherApproval,
  getPatientResearcherApproval,
  getPatientAccessHistory,
  recordDataAccess
} from '../db/patient-preferences-db.js';
import { getResearcher } from '../db/researcher-db.js';
import { submitHCSMessage } from '../hedera/hcs-client.js';

/**
 * Check if researcher can access patient data
 * @param {string} upi - Patient UPI
 * @param {string} researcherId - Researcher ID
 * @param {Object} researcherInfo - Researcher information (optional)
 * @param {Object} requestDetails - Request details (recordCount, isSensitive, etc.)
 * @returns {Promise<{allowed: boolean, reason?: string}>}
 */
export async function checkPatientDataAccess(
  upi,
  researcherId,
  researcherInfo = null,
  requestDetails = {}
) {
  // Get or create patient preferences
  const preferences = await getOrCreatePatientPreferences(upi);
  
  // 1. Check global opt-out
  if (!preferences.globalSharingEnabled) {
    return {
      allowed: false,
      reason: 'Patient has opted out of data sharing'
    };
  }
  
  // 2. Check if researcher is explicitly blocked
  if (preferences.blockedResearcherIds && 
      preferences.blockedResearcherIds.includes(researcherId)) {
    return {
      allowed: false,
      reason: 'Researcher is blocked by patient'
    };
  }
  
  // 3. Check if researcher is explicitly approved
  const approval = await getPatientResearcherApproval(upi, researcherId);
  if (approval && approval.approvalStatus === 'approved') {
    return {
      allowed: true,
      reason: 'Researcher approved by patient',
      approval
    };
  }
  
  if (approval && approval.approvalStatus === 'rejected') {
    return {
      allowed: false,
      reason: 'Researcher request rejected by patient'
    };
  }
  
  // 4. Get researcher info if not provided
  if (!researcherInfo) {
    const researcher = await getResearcher(researcherId);
    if (!researcher) {
      return {
        allowed: false,
        reason: 'Researcher not found'
      };
    }
    researcherInfo = {
      isVerified: researcher.verificationStatus === 'verified',
      organizationName: researcher.organizationName
    };
  }
  
  // 5. Check general preferences
  // Unverified researchers
  if (!researcherInfo.isVerified && !preferences.allowUnverifiedResearchers) {
    return {
      allowed: false,
      reason: 'Patient does not allow unverified researchers',
      requiresApproval: true
    };
  }
  
  // Verified researchers
  if (researcherInfo.isVerified && !preferences.allowVerifiedResearchers) {
    return {
      allowed: false,
      reason: 'Patient does not allow verified researchers',
      requiresApproval: true
    };
  }
  
  // Bulk purchases
  const recordCount = requestDetails.recordCount || 0;
  if (recordCount > 1000 && !preferences.allowBulkPurchases) {
    return {
      allowed: false,
      reason: 'Patient does not allow bulk purchases',
      requiresApproval: true
    };
  }
  
  // Sensitive data
  if (requestDetails.isSensitive && !preferences.allowSensitiveDataSharing) {
    return {
      allowed: false,
      reason: 'Patient does not allow sensitive data sharing',
      requiresApproval: true
    };
  }
  
  // 6. Check minimum price
  if (requestDetails.pricePerRecord && 
      requestDetails.pricePerRecord < preferences.minimumPricePerRecord) {
    return {
      allowed: false,
      reason: `Price per record below patient minimum ($${preferences.minimumPricePerRecord})`
    };
  }
  
  // All checks passed
  return {
    allowed: true,
    reason: 'Meets patient preferences'
  };
}

/**
 * Request patient approval for data access
 * @param {string} upi - Patient UPI
 * @param {string} researcherId - Researcher ID
 * @param {Object} requestDetails - Request details
 * @returns {Promise<Object>} Approval request
 */
export async function requestPatientApproval(upi, researcherId, requestDetails = {}) {
  // Check if request already exists
  const existing = await getPatientResearcherApproval(upi, researcherId);
  
  if (existing && existing.approvalStatus === 'pending') {
    return {
      status: 'pending',
      message: 'Approval request already pending',
      approval: existing
    };
  }
  
  // Create pending approval request
  const approval = await setPatientResearcherApproval(
    upi,
    researcherId,
    'pending',
    requestDetails
  );
  
  // Get researcher info for notification
  const researcher = await getResearcher(researcherId);
  
  // Log to HCS
  try {
    await submitHCSMessage(
      process.env.HCS_PATIENT_APPROVAL_TOPIC_ID,
      JSON.stringify({
        type: 'approval_request',
        upi,
        researcherId,
        researcherName: researcher?.organizationName,
        recordCount: requestDetails.recordCount,
        timestamp: new Date().toISOString()
      })
    );
  } catch (error) {
    console.error('Error logging approval request to HCS:', error);
  }
  
  // TODO: Notify patient (email/SMS)
  
  return {
    status: 'pending',
    message: 'Approval request created. Patient will be notified.',
    approval,
    requiresPatientAction: true
  };
}

/**
 * Patient approves researcher
 * @param {string} upi - Patient UPI
 * @param {string} researcherId - Researcher ID
 * @param {Object} conditions - Optional conditions/restrictions
 * @returns {Promise<Object>} Approval record
 */
export async function approveResearcher(upi, researcherId, conditions = {}) {
  const approval = await setPatientResearcherApproval(
    upi,
    researcherId,
    'approved',
    conditions
  );
  
  // Add to approved list in preferences
  const preferences = await getOrCreatePatientPreferences(upi);
  const approvedIds = preferences.approvedResearcherIds || [];
  if (!approvedIds.includes(researcherId)) {
    approvedIds.push(researcherId);
    await updatePatientPreferences(upi, {
      approvedResearcherIds: approvedIds
    });
  }
  
  // Log to HCS
  try {
    await submitHCSMessage(
      process.env.HCS_PATIENT_APPROVAL_TOPIC_ID,
      JSON.stringify({
        type: 'approval_granted',
        upi,
        researcherId,
        timestamp: new Date().toISOString()
      })
    );
  } catch (error) {
    console.error('Error logging approval to HCS:', error);
  }
  
  return approval;
}

/**
 * Patient blocks researcher
 * @param {string} upi - Patient UPI
 * @param {string} researcherId - Researcher ID
 * @returns {Promise<Object>} Updated preferences
 */
export async function blockResearcher(upi, researcherId) {
  // Revoke any existing approval
  await setPatientResearcherApproval(upi, researcherId, 'revoked');
  
  // Add to blocked list
  const preferences = await getOrCreatePatientPreferences(upi);
  const blockedIds = preferences.blockedResearcherIds || [];
  if (!blockedIds.includes(researcherId)) {
    blockedIds.push(researcherId);
  }
  
  // Remove from approved list if present
  const approvedIds = preferences.approvedResearcherIds || [];
  const updatedApproved = approvedIds.filter(id => id !== researcherId);
  
  const updated = await updatePatientPreferences(upi, {
    blockedResearcherIds: blockedIds,
    approvedResearcherIds: updatedApproved
  });
  
  // Log to HCS
  try {
    await submitHCSMessage(
      process.env.HCS_PATIENT_APPROVAL_TOPIC_ID,
      JSON.stringify({
        type: 'researcher_blocked',
        upi,
        researcherId,
        timestamp: new Date().toISOString()
      })
    );
  } catch (error) {
    console.error('Error logging block to HCS:', error);
  }
  
  return updated;
}

/**
 * Get pending approval requests for a patient
 * @param {string} upi - Patient UPI
 * @returns {Promise<Array>} Pending requests
 */
export async function getPendingApprovalRequests(upi) {
  const dbType = (await import('../db/database.js')).getDatabaseType();
  const { get, all } = await import('../db/database.js');
  const { getDatabase } = await import('../db/database.js');
  const db = getDatabase();
  
  if (dbType === 'postgresql') {
    const result = await all(
      `SELECT 
        pra.id, pra.upi, pra.researcher_id as "researcherId",
        pra.approval_status as "approvalStatus",
        pra.conditions, pra.created_at as "createdAt",
        r.organization_name as "organizationName",
        r.email as "researcherEmail",
        r.verification_status as "verificationStatus"
      FROM patient_researcher_approvals pra
      JOIN researchers r ON pra.researcher_id = r.researcher_id
      WHERE pra.upi = $1 AND pra.approval_status = 'pending'
      ORDER BY pra.created_at DESC`,
      [upi]
    );
    return result.rows || result;
  } else {
    const { promisify } = await import('util');
    const all = promisify(db.all.bind(db));
    const rows = await all(
      `SELECT 
        pra.*,
        r.organization_name as organization_name,
        r.email as researcher_email,
        r.verification_status as verification_status
      FROM patient_researcher_approvals pra
      JOIN researchers r ON pra.researcher_id = r.researcher_id
      WHERE pra.upi = ? AND pra.approval_status = 'pending'
      ORDER BY pra.created_at DESC`,
      [upi]
    );
    return rows.map(row => ({
      id: row.id,
      upi: row.upi,
      researcherId: row.researcher_id,
      approvalStatus: row.approval_status,
      conditions: row.conditions ? JSON.parse(row.conditions) : null,
      createdAt: row.created_at,
      organizationName: row.organization_name,
      researcherEmail: row.researcher_email,
      verificationStatus: row.verification_status
    }));
  }
}

/**
 * Get approved researchers for a patient
 * @param {string} upi - Patient UPI
 * @returns {Promise<Array>} Approved researchers
 */
export async function getApprovedResearchers(upi) {
  const dbType = (await import('../db/database.js')).getDatabaseType();
  const { all } = await import('../db/database.js');
  const { getDatabase } = await import('../db/database.js');
  const db = getDatabase();
  
  if (dbType === 'postgresql') {
    const result = await all(
      `SELECT 
        pra.id, pra.upi, pra.researcher_id as "researcherId",
        pra.approved_at as "approvedAt",
        pra.conditions,
        r.organization_name as "organizationName",
        r.email as "researcherEmail"
      FROM patient_researcher_approvals pra
      JOIN researchers r ON pra.researcher_id = r.researcher_id
      WHERE pra.upi = $1 AND pra.approval_status = 'approved'
      ORDER BY pra.approved_at DESC`,
      [upi]
    );
    return result.rows || result;
  } else {
    const { promisify } = await import('util');
    const all = promisify(db.all.bind(db));
    const rows = await all(
      `SELECT 
        pra.*,
        r.organization_name as organization_name,
        r.email as researcher_email
      FROM patient_researcher_approvals pra
      JOIN researchers r ON pra.researcher_id = r.researcher_id
      WHERE pra.upi = ? AND pra.approval_status = 'approved'
      ORDER BY pra.approved_at DESC`,
      [upi]
    );
    return rows.map(row => ({
      id: row.id,
      upi: row.upi,
      researcherId: row.researcher_id,
      approvedAt: row.approved_at,
      conditions: row.conditions ? JSON.parse(row.conditions) : null,
      organizationName: row.organization_name,
      researcherEmail: row.researcher_email
    }));
  }
}

