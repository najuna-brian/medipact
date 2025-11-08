/**
 * Hospital Verification Service
 * 
 * Manages hospital verification workflow after registration.
 * Hospitals must be verified before they can fully use the system.
 */

/**
 * Submit verification documents
 * @param {string} hospitalId - Hospital ID
 * @param {Object} documents - Verification documents
 *   - licenseNumber: string
 *   - registrationCertificate: string (URL or base64)
 *   - additionalDocuments: array
 * @param {Function} hospitalUpdate - Function to update hospital
 * @returns {Promise<Object>} Updated hospital record
 */
export async function submitVerificationDocuments(hospitalId, documents, hospitalUpdate) {
  const verificationDocuments = JSON.stringify(documents);
  
  const updates = {
    verification_documents: verificationDocuments,
    verification_status: 'pending' // Reset to pending when new documents submitted
  };
  
  return await hospitalUpdate(hospitalId, updates);
}

/**
 * Verify hospital (admin action)
 * @param {string} hospitalId - Hospital ID
 * @param {string} adminId - Admin user ID
 * @param {Function} hospitalUpdate - Function to update hospital
 * @returns {Promise<Object>} Updated hospital record
 */
export async function verifyHospital(hospitalId, adminId, hospitalUpdate) {
  const updates = {
    verification_status: 'verified',
    verified_at: new Date().toISOString(),
    verified_by: adminId
  };
  
  return await hospitalUpdate(hospitalId, updates);
}

/**
 * Reject hospital verification (admin action)
 * @param {string} hospitalId - Hospital ID
 * @param {string} adminId - Admin user ID
 * @param {string} reason - Rejection reason
 * @param {Function} hospitalUpdate - Function to update hospital
 * @returns {Promise<Object>} Updated hospital record
 */
export async function rejectHospitalVerification(hospitalId, adminId, reason, hospitalUpdate) {
  const updates = {
    verification_status: 'rejected',
    verified_by: adminId,
    verification_documents: JSON.stringify({ rejectionReason: reason })
  };
  
  return await hospitalUpdate(hospitalId, updates);
}

/**
 * Get verification status
 * @param {string} hospitalId - Hospital ID
 * @param {Function} hospitalGet - Function to get hospital
 * @returns {Promise<Object>} Hospital verification status
 */
export async function getVerificationStatus(hospitalId, hospitalGet) {
  const hospital = await hospitalGet(hospitalId);
  
  if (!hospital) {
    throw new Error('Hospital not found');
  }
  
  let verificationDocuments = null;
  // Use camelCase field name (getHospital returns camelCase due to SQL aliases)
  const docsField = hospital.verificationDocuments || hospital.verification_documents;
  if (docsField) {
    try {
      // Handle both string (JSON) and object formats
      verificationDocuments = typeof docsField === 'string' 
        ? JSON.parse(docsField) 
        : docsField;
    } catch (e) {
      verificationDocuments = { raw: docsField };
    }
  }
  
  return {
    hospitalId: hospital.hospitalId,
    // Use camelCase field name (getHospital returns camelCase due to SQL aliases)
    verificationStatus: hospital.verificationStatus || hospital.verification_status || 'pending',
    verifiedAt: hospital.verifiedAt || hospital.verified_at,
    verifiedBy: hospital.verifiedBy || hospital.verified_by,
    verificationDocuments: verificationDocuments
  };
}

/**
 * Check if hospital is verified
 * @param {string} hospitalId - Hospital ID
 * @param {Function} hospitalGet - Function to get hospital
 * @returns {Promise<boolean>} True if verified
 */
export async function isHospitalVerified(hospitalId, hospitalGet) {
  const hospital = await hospitalGet(hospitalId);
  // Use camelCase field name (getHospital returns camelCase due to SQL aliases)
  const status = hospital?.verificationStatus || hospital?.verification_status;
  return hospital && status === 'verified';
}

