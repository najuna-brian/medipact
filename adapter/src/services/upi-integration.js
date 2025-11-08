/**
 * UPI Integration Service
 * 
 * Integrates UPI (Unique Patient Identity) system with the anonymization adapter.
 * This allows the adapter to generate/retrieve UPIs and link hospital patient IDs.
 */

/**
 * Generate or retrieve UPI for a patient record
 * 
 * @param {Object} record - Patient record with PII
 * @param {Object} options - Options
 *   - upiService: Function to generate UPI (patientPII) => string
 *   - upiLookup: Function to check if UPI exists (upi) => Promise<boolean>
 *   - upiCreate: Function to create UPI (upi, patientPII) => Promise<void>
 * @returns {Promise<string>} UPI
 */
export async function getUPIForRecord(record, options = {}) {
  const { upiService, upiLookup, upiCreate } = options;
  
  if (!upiService) {
    // Fallback: Use local UPI generation if service not provided
    const { generateUPI } = await import('../../../backend/src/services/patient-identity-service.js');
    return generateUPI({
      name: record['Patient Name'],
      dateOfBirth: record['Date of Birth'],
      phone: record['Phone Number'],
      nationalId: record['National ID'] || null
    });
  }
  
  // Extract PII from record
  const patientPII = {
    name: record['Patient Name'],
    dateOfBirth: record['Date of Birth'],
    phone: record['Phone Number'],
    nationalId: record['National ID'] || null
  };
  
  // Generate UPI
  const upi = upiService(patientPII);
  
  // Check if exists, create if new
  if (upiLookup && upiCreate) {
    const exists = await upiLookup(upi);
    if (!exists) {
      await upiCreate(upi, patientPII);
    }
  }
  
  return upi;
}

/**
 * Generate anonymous PID that includes UPI
 * 
 * Format: {UPI}-{HOSPITAL_ID}-{SESSION_PID}
 * Example: UPI-ABC123DEF456-HOSP001-PID001
 * 
 * @param {string} upi - Unique Patient Identity
 * @param {string} hospitalId - Hospital ID
 * @param {number} sessionIndex - Session-specific index
 * @returns {string} Anonymous PID
 */
export function generateUPIBasedAnonymousPID(upi, hospitalId, sessionIndex) {
  // Remove "UPI-" prefix from UPI for shorter format
  const upiHash = upi.substring(4); // Remove "UPI-" prefix
  
  // Generate session PID (3-digit zero-padded)
  const sessionPID = `PID${String(sessionIndex).padStart(3, '0')}`;
  
  // Format: UPIHASH-HOSPID-SESSIONPID
  return `${upiHash}-${hospitalId}-${sessionPID}`;
}

/**
 * Parse UPI-based anonymous PID
 * 
 * @param {string} anonymousPID - Anonymous PID
 * @returns {Object} Parsed components { upi, hospitalId, sessionPID }
 */
export function parseUPIBasedAnonymousPID(anonymousPID) {
  const parts = anonymousPID.split('-');
  
  if (parts.length < 3) {
    throw new Error(`Invalid UPI-based anonymous PID format: ${anonymousPID}`);
  }
  
  const upiHash = parts[0];
  const hospitalId = parts[1];
  const sessionPID = parts.slice(2).join('-'); // In case sessionPID contains dashes
  
  return {
    upi: `UPI-${upiHash}`,
    hospitalId,
    sessionPID
  };
}

/**
 * Link hospital patient ID to UPI
 * 
 * @param {string} upi - Unique Patient Identity
 * @param {string} hospitalId - Hospital ID
 * @param {string} hospitalPatientId - Hospital's internal patient ID
 * @param {Function} linkageService - Function to create linkage
 * @returns {Promise<Object>} Linkage record
 */
export async function linkHospitalPatientToUPI(
  upi,
  hospitalId,
  hospitalPatientId,
  linkageService
) {
  if (!linkageService) {
    // No linkage service available, skip
    return null;
  }
  
  return await linkageService(
    upi,
    hospitalId,
    hospitalPatientId,
    {
      verified: true,
      verificationMethod: 'hospital_verification'
    }
  );
}

