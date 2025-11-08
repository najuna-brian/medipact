/**
 * Hospital Linkage Service
 * 
 * Manages linking hospital-specific patient IDs to Unique Patient Identities (UPI).
 * Enables patients to access their complete medical history across all hospitals.
 */

/**
 * Link hospital patient ID to UPI
 * 
 * Creates a linkage between a hospital's internal patient ID and the patient's UPI.
 * This allows the same patient to be identified across multiple hospitals.
 * 
 * @param {string} upi - Unique Patient Identity
 * @param {string} hospitalId - Hospital ID (HOSP-XXX)
 * @param {string} hospitalPatientId - Hospital's internal patient ID
 * @param {Object} options - Linkage options
 *   - verified: boolean (default: false)
 *   - verificationMethod: string (e.g., "patient_consent", "hospital_verification")
 *   - encryptedPII: Buffer (optional, encrypted PII for this hospital)
 * @param {Function} linkageCreate - Function to create linkage
 * @returns {Promise<Object>} Linkage record
 */
export async function linkHospitalToUPI(
  upi,
  hospitalId,
  hospitalPatientId,
  options = {},
  linkageCreate
) {
  if (!upi || !hospitalId || !hospitalPatientId) {
    throw new Error('UPI, hospitalId, and hospitalPatientId are required');
  }

  const linkage = {
    upi,
    hospitalId,
    hospitalPatientId,
    linkedAt: new Date().toISOString(),
    verified: options.verified || false,
    verificationMethod: options.verificationMethod || 'hospital_verification',
    encryptedPII: options.encryptedPII || null,
    status: 'active'
  };

  await linkageCreate(linkage);
  
  return linkage;
}

/**
 * Get all hospital linkages for a patient
 * 
 * Returns all hospitals where this patient has records.
 * 
 * @param {string} upi - Unique Patient Identity
 * @param {Function} linkageGetAll - Function to get all linkages (upi) => Promise<Array>
 * @returns {Promise<Array>} Array of hospital linkage records
 */
export async function getPatientHospitalLinkages(upi, linkageGetAll) {
  return await linkageGetAll(upi);
}

/**
 * Get hospital linkage for specific hospital
 * 
 * @param {string} upi - Unique Patient Identity
 * @param {string} hospitalId - Hospital ID
 * @param {Function} linkageGet - Function to get linkage (upi, hospitalId) => Promise<Object>
 * @returns {Promise<Object|null>} Linkage record or null
 */
export async function getHospitalLinkage(upi, hospitalId, linkageGet) {
  return await linkageGet(upi, hospitalId);
}

/**
 * Verify hospital linkage
 * 
 * Marks a linkage as verified (e.g., after patient consent).
 * 
 * @param {string} upi - Unique Patient Identity
 * @param {string} hospitalId - Hospital ID
 * @param {string} verificationMethod - Method of verification
 * @param {Function} linkageVerify - Function to verify linkage
 * @returns {Promise<Object>} Updated linkage record
 */
export async function verifyHospitalLinkage(
  upi,
  hospitalId,
  verificationMethod,
  linkageVerify
) {
  return await linkageVerify(upi, hospitalId, verificationMethod);
}

/**
 * Remove hospital linkage
 * 
 * Removes linkage when patient disconnects from hospital.
 * 
 * @param {string} upi - Unique Patient Identity
 * @param {string} hospitalId - Hospital ID
 * @param {Function} linkageRemove - Function to remove linkage
 * @returns {Promise<void>}
 */
export async function removeHospitalLinkage(upi, hospitalId, linkageRemove) {
  return await linkageRemove(upi, hospitalId);
}

/**
 * Check if patient is linked to hospital
 * 
 * @param {string} upi - Unique Patient Identity
 * @param {string} hospitalId - Hospital ID
 * @param {Function} linkageExists - Function to check existence
 * @returns {Promise<boolean>} True if linked
 */
export async function isPatientLinkedToHospital(upi, hospitalId, linkageExists) {
  return await linkageExists(upi, hospitalId);
}

/**
 * Get patient's hospital patient ID for a specific hospital
 * 
 * @param {string} upi - Unique Patient Identity
 * @param {string} hospitalId - Hospital ID
 * @param {Function} linkageGet - Function to get linkage
 * @returns {Promise<string|null>} Hospital patient ID or null
 */
export async function getHospitalPatientID(upi, hospitalId, linkageGet) {
  const linkage = await getHospitalLinkage(upi, hospitalId, linkageGet);
  return linkage ? linkage.hospitalPatientId : null;
}

