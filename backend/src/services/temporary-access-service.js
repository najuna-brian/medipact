/**
 * Temporary Access Service
 * 
 * Business logic for temporary cross-hospital data access requests.
 * Supports telemedicine and emergency access scenarios.
 */

import {
  createTemporaryAccessRequest,
  getTemporaryAccessRequest,
  approveTemporaryAccess,
  rejectTemporaryAccess,
  revokeTemporaryAccess,
  hasActiveTemporaryAccess,
  getPendingAccessRequestsForPatient,
  getActiveAccessRequestsForHospital,
  expireOldAccessRequests
} from '../db/temporary-access-db.js';
import { getHospital } from '../db/hospital-db.js';
import { getPatient } from '../db/patient-db.js';
import { submitHCSMessage } from '../hedera/hcs-client.js';

/**
 * Request temporary access to patient data from another hospital
 * @param {Object} requestData - Request details
 * @returns {Promise<Object>} Created request
 */
export async function requestTemporaryAccess(requestData) {
  const {
    upi,
    requestingHospitalId,
    originalHospitalId,
    accessType = 'read',
    durationMinutes,
    purpose
  } = requestData;
  
  // Validate inputs
  if (!upi || !requestingHospitalId || !originalHospitalId || !durationMinutes) {
    throw new Error('Missing required fields: upi, requestingHospitalId, originalHospitalId, durationMinutes');
  }
  
  // Validate duration (max 24 hours for security)
  const maxDurationMinutes = 24 * 60; // 24 hours
  if (durationMinutes > maxDurationMinutes) {
    throw new Error(`Maximum access duration is ${maxDurationMinutes} minutes (24 hours)`);
  }
  
  // Validate minimum duration (at least 15 minutes)
  if (durationMinutes < 15) {
    throw new Error('Minimum access duration is 15 minutes');
  }
  
  // Verify hospitals exist
  const requestingHospital = await getHospital(requestingHospitalId);
  const originalHospital = await getHospital(originalHospitalId);
  
  if (!requestingHospital) {
    throw new Error(`Requesting hospital ${requestingHospitalId} not found`);
  }
  
  if (!originalHospital) {
    throw new Error(`Original hospital ${originalHospitalId} not found`);
  }
  
  // Verify patient exists
  const patient = await getPatient(upi);
  if (!patient) {
    throw new Error(`Patient ${upi} not found`);
  }
  
  // Check if hospitals are the same
  if (requestingHospitalId === originalHospitalId) {
    throw new Error('Requesting hospital and original hospital cannot be the same');
  }
  
  // Create request
  const request = await createTemporaryAccessRequest({
    upi,
    requestingHospitalId,
    originalHospitalId,
    accessType,
    durationMinutes,
    purpose: purpose || `Temporary access for ${accessType === 'telemedicine' ? 'telemedicine consultation' : 'medical care'}`
  });
  
  // Log to HCS for audit trail
  try {
    await submitHCSMessage(
      process.env.HCS_TEMP_ACCESS_TOPIC_ID || process.env.HCS_PATIENT_APPROVAL_TOPIC_ID,
      JSON.stringify({
        type: 'temporary_access_request',
        requestId: request.id,
        upi,
        requestingHospitalId,
        originalHospitalId,
        accessType,
        durationMinutes,
        timestamp: new Date().toISOString()
      })
    );
  } catch (error) {
    console.error('Error logging temporary access request to HCS:', error);
  }
  
  // TODO: Notify patient (email/SMS/push notification)
  
  return request;
}

/**
 * Patient approves temporary access request
 * @param {number} requestId - Request ID
 * @param {string} upi - Patient UPI (for verification)
 * @returns {Promise<Object>} Approved request
 */
export async function approveTemporaryAccessRequest(requestId, upi) {
  const request = await getTemporaryAccessRequest(requestId);
  
  if (!request) {
    throw new Error('Access request not found');
  }
  
  // Verify patient matches
  if (request.upi !== upi) {
    throw new Error('Unauthorized: Request does not belong to this patient');
  }
  
  // Check if already processed
  if (request.status !== 'pending') {
    throw new Error(`Request is already ${request.status}`);
  }
  
  // Approve request
  const approved = await approveTemporaryAccess(requestId);
  
  // Log to HCS
  try {
    await submitHCSMessage(
      process.env.HCS_TEMP_ACCESS_TOPIC_ID || process.env.HCS_PATIENT_APPROVAL_TOPIC_ID,
      JSON.stringify({
        type: 'temporary_access_approved',
        requestId: approved.id,
        upi: approved.upi,
        requestingHospitalId: approved.requestingHospitalId,
        expiresAt: approved.expiresAt,
        timestamp: new Date().toISOString()
      })
    );
  } catch (error) {
    console.error('Error logging approval to HCS:', error);
  }
  
  // TODO: Notify requesting hospital
  
  return approved;
}

/**
 * Patient rejects temporary access request
 * @param {number} requestId - Request ID
 * @param {string} upi - Patient UPI (for verification)
 * @returns {Promise<Object>} Rejected request
 */
export async function rejectTemporaryAccessRequest(requestId, upi) {
  const request = await getTemporaryAccessRequest(requestId);
  
  if (!request) {
    throw new Error('Access request not found');
  }
  
  // Verify patient matches
  if (request.upi !== upi) {
    throw new Error('Unauthorized: Request does not belong to this patient');
  }
  
  // Check if already processed
  if (request.status !== 'pending') {
    throw new Error(`Request is already ${request.status}`);
  }
  
  // Reject request
  const rejected = await rejectTemporaryAccess(requestId);
  
  // Log to HCS
  try {
    await submitHCSMessage(
      process.env.HCS_TEMP_ACCESS_TOPIC_ID || process.env.HCS_PATIENT_APPROVAL_TOPIC_ID,
      JSON.stringify({
        type: 'temporary_access_rejected',
        requestId: rejected.id,
        upi: rejected.upi,
        requestingHospitalId: rejected.requestingHospitalId,
        timestamp: new Date().toISOString()
      })
    );
  } catch (error) {
    console.error('Error logging rejection to HCS:', error);
  }
  
  // TODO: Notify requesting hospital
  
  return rejected;
}

/**
 * Patient revokes active temporary access
 * @param {number} requestId - Request ID
 * @param {string} upi - Patient UPI (for verification)
 * @returns {Promise<Object>} Revoked request
 */
export async function revokeTemporaryAccessRequest(requestId, upi) {
  const request = await getTemporaryAccessRequest(requestId);
  
  if (!request) {
    throw new Error('Access request not found');
  }
  
  // Verify patient matches
  if (request.upi !== upi) {
    throw new Error('Unauthorized: Request does not belong to this patient');
  }
  
  // Check if can be revoked
  if (!['active', 'approved'].includes(request.status)) {
    throw new Error(`Cannot revoke request with status: ${request.status}`);
  }
  
  // Revoke access
  const revoked = await revokeTemporaryAccess(requestId);
  
  // Log to HCS
  try {
    await submitHCSMessage(
      process.env.HCS_TEMP_ACCESS_TOPIC_ID || process.env.HCS_PATIENT_APPROVAL_TOPIC_ID,
      JSON.stringify({
        type: 'temporary_access_revoked',
        requestId: revoked.id,
        upi: revoked.upi,
        requestingHospitalId: revoked.requestingHospitalId,
        timestamp: new Date().toISOString()
      })
    );
  } catch (error) {
    console.error('Error logging revocation to HCS:', error);
  }
  
  // TODO: Notify requesting hospital
  
  return revoked;
}

/**
 * Check if hospital has active temporary access to patient data
 * @param {string} requestingHospitalId - Hospital requesting access
 * @param {string} upi - Patient UPI
 * @param {string} originalHospitalId - Original hospital (optional)
 * @returns {Promise<boolean>} True if access is active
 */
export async function checkTemporaryAccess(requestingHospitalId, upi, originalHospitalId = null) {
  return await hasActiveTemporaryAccess(requestingHospitalId, upi, originalHospitalId);
}

/**
 * Get time remaining for temporary access
 * @param {Object} request - Access request
 * @returns {number} Minutes remaining (0 if expired)
 */
export function getTimeRemaining(request) {
  if (!request.expiresAt) {
    return null; // No expiration
  }
  
  const expiresAt = new Date(request.expiresAt);
  const now = new Date();
  const diffMs = expiresAt - now;
  
  if (diffMs <= 0) {
    return 0; // Expired
  }
  
  return Math.floor(diffMs / (60 * 1000)); // Convert to minutes
}

/**
 * Format duration for display
 * @param {number} minutes - Duration in minutes
 * @returns {string} Formatted duration
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}`;
}

/**
 * Cleanup expired access requests (should be run periodically)
 */
export async function cleanupExpiredAccess() {
  return await expireOldAccessRequests();
}

