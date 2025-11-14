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
  // Validate license number
  if (!documents.licenseNumber || documents.licenseNumber.trim() === '') {
    throw new Error('License number is required');
  }
  
  // Validate that registration certificate is provided (either file or URL)
  const hasCertificateFile = documents.registrationCertificate && 
    documents.registrationCertificate.startsWith('data:');
  
  const hasCertificateUrl = documents.registrationCertificate && 
    (documents.registrationCertificate.startsWith('http://') || 
     documents.registrationCertificate.startsWith('https://'));
  
  if (!hasCertificateFile && !hasCertificateUrl) {
    throw new Error('Registration certificate is required. Please provide either a file upload or a URL link to the certificate.');
  }
  
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
  let hasDocuments = false;
  if (hospital.verificationDocuments) {
    try {
      // Handle both string (JSON) and object formats
      verificationDocuments = typeof hospital.verificationDocuments === 'string' 
        ? JSON.parse(hospital.verificationDocuments) 
        : hospital.verificationDocuments;
      
      hasDocuments = verificationDocuments && 
        Object.keys(verificationDocuments).length > 0 && 
        (verificationDocuments.licenseNumber || 
         verificationDocuments.registrationCertificate || 
         verificationDocuments.additionalDocuments);
    } catch (e) {
      verificationDocuments = { raw: hospital.verificationDocuments };
      hasDocuments = false;
    }
  }
  
  let verificationMessage = null;
  if (hospital.verificationStatus === 'verified') {
    verificationMessage = null;
  } else if (hospital.verificationStatus === 'rejected') {
    verificationMessage = 'Your verification was rejected. Please submit new documents to verify your account.';
  } else if (hasDocuments) {
    verificationMessage = 'Your verification is pending review. Please wait for admin approval.';
  } else {
    verificationMessage = 'Please verify your account to access full features and better pricing.';
  }
  
  return {
    hospitalId: hospital.hospitalId,
    verificationStatus: hospital.verificationStatus || 'pending',
    verifiedAt: hospital.verifiedAt,
    verifiedBy: hospital.verifiedBy,
    verificationDocuments: verificationDocuments,
    verificationPrompt: hospital.verificationStatus !== 'verified',
    verificationMessage: verificationMessage
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
  return hospital?.verificationStatus === 'verified';
}

