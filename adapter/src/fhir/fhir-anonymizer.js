/**
 * FHIR Anonymizer
 * 
 * Anonymizes FHIR resources by removing PII while preserving
 * medical data and maintaining FHIR structure.
 * 
 * Follows FHIR R4 standard and HIPAA de-identification guidelines.
 */

/**
 * Generate anonymous patient ID
 * @param {number} index - Index of patient
 * @returns {string} Anonymous patient ID (e.g., PID-001)
 */
function generateAnonymousPID(index) {
  return `PID-${String(index + 1).padStart(3, '0')}`;
}

/**
 * Anonymize FHIR Patient resource
 * @param {Object} fhirPatient - FHIR Patient resource
 * @param {string} anonymousPID - Anonymous patient ID to assign
 * @returns {Object} Anonymized FHIR Patient resource
 */
export function anonymizeFHIRPatient(fhirPatient, anonymousPID) {
  // Create a deep copy to avoid mutating original
  const anonymized = JSON.parse(JSON.stringify(fhirPatient));
  
  // Remove PII fields
  delete anonymized.name;
  delete anonymized.address;
  delete anonymized.telecom;
  delete anonymized.birthDate;
  delete anonymized.photo;
  delete anonymized.contact; // Emergency contacts contain PII
  
  // Remove PII from identifiers (keep only anonymous ID)
  anonymized.identifier = [{
    system: 'urn:medipact:anonymous',
    value: anonymousPID
  }];
  
  // Update resource ID to anonymous ID
  anonymized.id = anonymousPID;
  
  return anonymized;
}

/**
 * Anonymize FHIR Observation resource
 * @param {Object} fhirObservation - FHIR Observation resource
 * @param {string} anonymousPID - Anonymous patient ID
 * @returns {Object} Anonymized FHIR Observation resource
 */
export function anonymizeFHIRObservation(fhirObservation, anonymousPID) {
  // Create a deep copy
  const anonymized = JSON.parse(JSON.stringify(fhirObservation));
  
  // Update patient reference to anonymous ID
  if (anonymized.subject) {
    anonymized.subject.reference = `Patient/${anonymousPID}`;
  }
  
  // Remove any PII that might be in extensions or notes
  if (anonymized.note) {
    anonymized.note = anonymized.note.filter(note => {
      // Remove notes that might contain PII
      const text = note.text || '';
      // Keep only clinical notes, remove personal info
      return !text.match(/\b(patient|name|address|phone)\b/i);
    });
  }
  
  return anonymized;
}

/**
 * Anonymize FHIR Bundle
 * @param {Object} bundle - FHIR Bundle
 * @param {Map<string, string>} patientMapping - Map of original ID -> anonymous ID
 * @returns {Object} Anonymized FHIR Bundle
 */
export function anonymizeFHIRBundle(bundle, patientMapping) {
  const anonymized = JSON.parse(JSON.stringify(bundle));
  
  // Anonymize all entries
  if (anonymized.entry) {
    anonymized.entry = anonymized.entry.map(entry => {
      const resource = entry.resource;
      
      if (!resource) return entry;
      
      if (resource.resourceType === 'Patient') {
        const originalId = resource.id || resource.identifier?.[0]?.value;
        const anonymousId = patientMapping.get(originalId);
        if (anonymousId) {
          entry.resource = anonymizeFHIRPatient(resource, anonymousId);
        }
      } else if (resource.resourceType === 'Observation') {
        // Find associated patient
        const patientRef = resource.subject?.reference;
        if (patientRef) {
          const originalPatientId = patientRef.split('/').pop();
          const anonymousId = patientMapping.get(originalPatientId);
          if (anonymousId) {
            entry.resource = anonymizeFHIRObservation(resource, anonymousId);
          }
        }
      }
      // Consent resources are kept as-is (they reference anonymous IDs)
      
      return entry;
    });
  }
  
  return anonymized;
}

/**
 * Anonymize normalized records (from FHIR or CSV) and return both
 * normalized format and FHIR format
 * @param {Array<Object>} records - Normalized records
 * @param {Object} originalBundle - Original FHIR Bundle (if from FHIR)
 * @returns {Object} Anonymized data in both formats
 */
export function anonymizeRecordsWithFHIR(records, originalBundle = null) {
  // Group records by patient
  const patientMap = new Map();
  const patientMapping = new Map(); // Original ID -> Anonymous PID
  
  records.forEach(record => {
    const patientId = record['Patient ID'] || record['Patient Name'];
    if (!patientMap.has(patientId)) {
      patientMap.set(patientId, []);
    }
    patientMap.get(patientId).push(record);
  });
  
  // Anonymize each patient group
  const anonymizedRecords = [];
  let pidIndex = 0;
  
  patientMap.forEach((patientRecords, originalPatientId) => {
    const anonymousPID = generateAnonymousPID(pidIndex);
    patientMapping.set(originalPatientId, anonymousPID);
    
    patientRecords.forEach(record => {
      const anonymized = { ...record };
      
      // Remove PII fields
      delete anonymized['Patient Name'];
      delete anonymized['Patient ID'];
      delete anonymized['Address'];
      delete anonymized['Phone Number'];
      delete anonymized['Date of Birth'];
      
      // Add anonymous patient ID
      anonymized['Anonymous PID'] = anonymousPID;
      
      anonymizedRecords.push(anonymized);
    });
    
    pidIndex++;
  });
  
  // If we have original FHIR Bundle, anonymize it too
  let anonymizedBundle = null;
  if (originalBundle) {
    anonymizedBundle = anonymizeFHIRBundle(originalBundle, patientMapping);
  }
  
  return {
    records: anonymizedRecords,
    patientMapping,
    fhirBundle: anonymizedBundle
  };
}

