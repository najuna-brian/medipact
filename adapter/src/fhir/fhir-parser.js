/**
 * FHIR Parser
 * 
 * Parses FHIR resources (Bundle, Patient, Observation) and converts
 * them to a normalized format for processing.
 * 
 * Supports FHIR R4 standard.
 */

/**
 * Parse FHIR Bundle file (JSON)
 * @param {string} filePath - Path to FHIR Bundle JSON file
 * @returns {Promise<Object>} Parsed FHIR Bundle
 */
export async function parseFHIRBundle(filePath) {
  const fs = await import('fs');
  const content = await fs.promises.readFile(filePath, 'utf-8');
  const bundle = JSON.parse(content);
  
  if (bundle.resourceType !== 'Bundle') {
    throw new Error('File is not a valid FHIR Bundle');
  }
  
  return bundle;
}

/**
 * Extract Patient resources from FHIR Bundle
 * @param {Object} bundle - FHIR Bundle
 * @returns {Array<Object>} Array of Patient resources
 */
export function extractPatients(bundle) {
  return bundle.entry
    ?.filter(entry => entry.resource?.resourceType === 'Patient')
    .map(entry => entry.resource) || [];
}

/**
 * Extract Observation resources from FHIR Bundle
 * @param {Object} bundle - FHIR Bundle
 * @returns {Array<Object>} Array of Observation resources
 */
export function extractObservations(bundle) {
  return bundle.entry
    ?.filter(entry => entry.resource?.resourceType === 'Observation')
    .map(entry => entry.resource) || [];
}

/**
 * Extract Consent resources from FHIR Bundle
 * @param {Object} bundle - FHIR Bundle
 * @returns {Array<Object>} Array of Consent resources
 */
export function extractConsents(bundle) {
  return bundle.entry
    ?.filter(entry => entry.resource?.resourceType === 'Consent')
    .map(entry => entry.resource) || [];
}

/**
 * Convert FHIR Patient resource to normalized format
 * @param {Object} fhirPatient - FHIR Patient resource
 * @returns {Object} Normalized patient data
 */
export function normalizePatient(fhirPatient) {
  const patientId = fhirPatient.id || 
    fhirPatient.identifier?.[0]?.value || 
    'unknown';
  
  const name = fhirPatient.name?.[0]?.text || 
    `${fhirPatient.name?.[0]?.given?.join(' ') || ''} ${fhirPatient.name?.[0]?.family || ''}`.trim();
  
  const address = fhirPatient.address?.[0]?.text || 
    fhirPatient.address?.[0]?.line?.join(', ') || '';
  
  const phone = fhirPatient.telecom?.find(t => t.system === 'phone')?.value || '';
  const birthDate = fhirPatient.birthDate || '';
  
  return {
    'Patient ID': patientId,
    'Patient Name': name,
    'Address': address,
    'Phone Number': phone,
    'Date of Birth': birthDate,
    _fhirResource: fhirPatient, // Keep original for FHIR output
    _resourceType: 'Patient'
  };
}

/**
 * Convert FHIR Observation resource to normalized format
 * @param {Object} fhirObservation - FHIR Observation resource
 * @param {string} patientId - Associated patient ID
 * @returns {Object} Normalized observation data
 */
export function normalizeObservation(fhirObservation, patientId) {
  const code = fhirObservation.code?.coding?.[0]?.display || 
    fhirObservation.code?.text || 
    'Unknown Test';
  
  const effectiveDate = fhirObservation.effectiveDateTime || 
    fhirObservation.effectivePeriod?.start || 
    '';
  
  const value = fhirObservation.valueQuantity?.value || 
    fhirObservation.valueString || 
    fhirObservation.valueCodeableConcept?.coding?.[0]?.display || 
    '';
  
  const unit = fhirObservation.valueQuantity?.unit || '';
  
  const referenceRange = fhirObservation.referenceRange?.[0];
  const refRangeText = referenceRange 
    ? `${referenceRange.low?.value || ''}-${referenceRange.high?.value || ''} ${referenceRange.low?.unit || ''}`.trim()
    : '';
  
  return {
    'Patient ID': patientId,
    'Lab Test': code,
    'Test Date': effectiveDate.split('T')[0], // Extract date part
    'Result': String(value),
    'Unit': unit,
    'Reference Range': refRangeText,
    _fhirResource: fhirObservation, // Keep original for FHIR output
    _resourceType: 'Observation'
  };
}

/**
 * Convert FHIR Bundle to normalized records (compatible with CSV format)
 * @param {Object} bundle - FHIR Bundle
 * @returns {Array<Object>} Array of normalized records
 */
export function bundleToRecords(bundle) {
  const patients = extractPatients(bundle);
  const observations = extractObservations(bundle);
  
  // Create patient lookup map
  const patientMap = new Map();
  patients.forEach(patient => {
    const patientId = patient.id || patient.identifier?.[0]?.value;
    if (patientId) {
      patientMap.set(patientId, patient);
    }
  });
  
  // Combine patient and observation data
  const records = [];
  
  observations.forEach(observation => {
    // Extract patient reference from observation
    const patientRef = observation.subject?.reference;
    let patientId = null;
    let patientData = null;
    
    if (patientRef) {
      // Extract ID from reference (format: "Patient/123" or just "123")
      patientId = patientRef.split('/').pop();
      patientData = patientMap.get(patientId);
    }
    
    // If no patient found, try to get from first patient
    if (!patientData && patients.length > 0) {
      patientData = patients[0];
      patientId = patientData.id || patientData.identifier?.[0]?.value;
    }
    
    if (patientData) {
      const normalizedPatient = normalizePatient(patientData);
      const normalizedObservation = normalizeObservation(observation, patientId);
      
      // Combine into single record
      records.push({
        ...normalizedPatient,
        ...normalizedObservation
      });
    }
  });
  
  // If no observations, return just patients
  if (records.length === 0 && patients.length > 0) {
    patients.forEach(patient => {
      records.push(normalizePatient(patient));
    });
  }
  
  return records;
}

/**
 * Check if a file is a FHIR Bundle
 * @param {string} filePath - Path to file
 * @returns {Promise<boolean>} True if file is a FHIR Bundle
 */
export async function isFHIRBundle(filePath) {
  try {
    const fs = await import('fs');
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    return parsed.resourceType === 'Bundle';
  } catch {
    return false;
  }
}

