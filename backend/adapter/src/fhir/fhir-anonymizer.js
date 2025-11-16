/**
 * FHIR Anonymizer
 * 
 * Anonymizes FHIR resources by removing PII while preserving
 * medical data and maintaining FHIR structure.
 * 
 * Follows FHIR R4 standard and HIPAA de-identification guidelines.
 * 
 * Includes demographic data preservation (Age Range, Country, Gender, Occupation).
 */

import { 
  calculateAgeRange, 
  extractCountry, 
  normalizeGender, 
  generalizeOccupation 
} from '../anonymizer/demographic-anonymize.js';

/**
 * Generate anonymous patient ID
 * @param {number} index - Index of patient
 * @returns {string} Anonymous patient ID (e.g., PID-001)
 */
function generateAnonymousPID(index) {
  return `PID-${String(index + 1).padStart(3, '0')}`;
}

/**
 * Anonymize FHIR Patient resource with demographics
 * @param {Object} fhirPatient - FHIR Patient resource
 * @param {string} anonymousPID - Anonymous patient ID to assign
 * @param {Object} hospitalInfo - Hospital configuration (REQUIRED for country)
 * @returns {Object} Anonymized FHIR Patient resource with demographics
 */
export function anonymizeFHIRPatient(fhirPatient, anonymousPID, hospitalInfo) {
  // Create a deep copy to avoid mutating original
  const anonymized = JSON.parse(JSON.stringify(fhirPatient));
  
  // Calculate age range (REQUIRED - must have birthDate or age)
  try {
    const recordForAge = {
      'Date of Birth': fhirPatient.birthDate,
      'Age': fhirPatient.age || (fhirPatient.birthDate ? null : null)
    };
    anonymized.ageRange = calculateAgeRange(recordForAge);
  } catch (error) {
    throw new Error(`Failed to calculate age range for FHIR patient: ${error.message}`);
  }
  
  // Extract country (REQUIRED - always known via hospital fallback)
  try {
    const recordForCountry = {
      Address: fhirPatient.address?.[0]?.text || 
               (fhirPatient.address?.[0]?.city ? `${fhirPatient.address[0].city}, ${fhirPatient.address[0].country}` : null)
    };
    anonymized.country = extractCountry(recordForCountry, hospitalInfo);
  } catch (error) {
    throw new Error(`Failed to extract country for FHIR patient: ${error.message}`);
  }
  
  // Preserve gender (REQUIRED - defaults to "Unknown" if missing)
  anonymized.gender = normalizeGender(fhirPatient.gender || 'Unknown');
  
  // Generalize occupation (OPTIONAL - defaults to "Unknown" if missing)
  const occupation = fhirPatient.extension?.find(ext => 
    ext.url === 'http://hl7.org/fhir/StructureDefinition/patient-occupation'
  )?.valueString;
  anonymized.occupationCategory = generalizeOccupation(occupation);
  
  // Remove PII fields
  delete anonymized.name;
  delete anonymized.address;
  delete anonymized.telecom;
  delete anonymized.birthDate;
  delete anonymized.photo;
  delete anonymized.contact; // Emergency contacts contain PII
  delete anonymized.age; // Remove age (we have ageRange)
  
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
 * Anonymize ANY FHIR resource
 * @param {Object} fhirResource - FHIR resource
 * @param {string} resourceType - Resource type
 * @param {Object} context - Context with patientMapping, hospitalInfo, etc.
 * @returns {Object} Anonymized FHIR resource
 */
export async function anonymizeFHIRResource(fhirResource, resourceType, context) {
  const { patientMapping, hospitalInfo } = context;
  
  // Create deep copy
  const anonymized = JSON.parse(JSON.stringify(fhirResource));
  
  // Handle Patient resources
  if (resourceType === 'Patient') {
    const originalId = anonymized.id || anonymized.identifier?.[0]?.value;
    const anonymousId = patientMapping?.get(originalId) || generateAnonymousPID(patientMapping?.size || 0);
    return anonymizeFHIRPatient(anonymized, anonymousId, hospitalInfo);
  }
  
  // For all other resources, update patient references and remove PII
  const patientRef = getPatientReference(anonymized);
  if (patientRef) {
    const originalPatientId = patientRef.split('/').pop();
    const anonymousId = patientMapping?.get(originalPatientId);
    if (anonymousId) {
      updatePatientReference(anonymized, anonymousId);
    }
  }
  
  // Remove PII from all resources
  removePIIFromResource(anonymized, resourceType);
  
  return anonymized;
}

/**
 * Get patient reference from resource
 */
function getPatientReference(resource) {
  return resource.subject?.reference || 
         resource.patient?.reference || 
         resource.beneficiary?.reference ||
         null;
}

/**
 * Update patient reference to anonymous ID
 */
function updatePatientReference(resource, anonymousId) {
  if (resource.subject) {
    resource.subject.reference = `Patient/${anonymousId}`;
  }
  if (resource.patient) {
    resource.patient.reference = `Patient/${anonymousId}`;
  }
  if (resource.beneficiary) {
    resource.beneficiary.reference = `Patient/${anonymousId}`;
  }
}

/**
 * Remove PII from any resource
 */
function removePIIFromResource(resource, resourceType) {
  // Remove names
  if (resource.name) {
    if (Array.isArray(resource.name)) {
      resource.name = resource.name.map(n => ({
        text: '[REDACTED]'
      }));
    } else {
      resource.name = { text: '[REDACTED]' };
    }
  }
  
  // Remove addresses (keep only country)
  if (resource.address) {
    if (Array.isArray(resource.address)) {
      resource.address = resource.address.map(addr => ({
        country: addr.country || null
      }));
    } else {
      resource.address = {
        country: resource.address.country || null
      };
    }
  }
  
  // Remove telecom
  delete resource.telecom;
  
  // Remove identifiers (except for anonymous ones)
  if (resource.identifier) {
    resource.identifier = resource.identifier.filter(id => 
      id.system?.includes('anonymous') || id.system?.includes('medipact')
    );
  }
  
  // Remove practitioner names
  if (resource.performer) {
    resource.performer = resource.performer.map(p => ({
      ...p,
      display: p.display ? '[REDACTED]' : undefined
    }));
  }
  
  if (resource.requester) {
    resource.requester.display = '[REDACTED]';
  }
  
  if (resource.prescriber) {
    resource.prescriber.display = '[REDACTED]';
  }
  
  // Remove organization names (keep type only)
  if (resource.organization) {
    resource.organization.display = '[REDACTED]';
  }
  
  // Remove location details
  if (resource.location) {
    if (Array.isArray(resource.location)) {
      resource.location = resource.location.map(loc => ({
        ...loc,
        location: {
          ...loc.location,
          display: '[REDACTED]'
        }
      }));
    }
  }
  
  // Remove notes that might contain PII
  if (resource.note) {
    resource.note = resource.note.filter(note => {
      const text = note.text || '';
      return !text.match(/\b(name|address|phone|email|ssn|id number)\b/i);
    });
  }
  
  // Remove extensions that might contain PII
  if (resource.extension) {
    resource.extension = resource.extension.filter(ext => {
      const url = ext.url || '';
      return !url.includes('name') && 
             !url.includes('address') && 
             !url.includes('contact');
    });
  }
}

/**
 * Anonymize FHIR Bundle
 * @param {Object} bundle - FHIR Bundle
 * @param {Map<string, string>} patientMapping - Map of original ID -> anonymous ID
 * @param {Object} hospitalInfo - Hospital configuration
 * @returns {Object} Anonymized FHIR Bundle
 */
export function anonymizeFHIRBundle(bundle, patientMapping, hospitalInfo = {}) {
  const anonymized = JSON.parse(JSON.stringify(bundle));
  
  // Anonymize all entries
  if (anonymized.entry) {
    anonymized.entry = anonymized.entry.map(entry => {
      const resource = entry.resource;
      
      if (!resource) return entry;
      
      const resourceType = resource.resourceType;
      
      if (resourceType === 'Patient') {
        const originalId = resource.id || resource.identifier?.[0]?.value;
        const anonymousId = patientMapping.get(originalId);
        if (anonymousId) {
          entry.resource = anonymizeFHIRPatient(resource, anonymousId, hospitalInfo);
        }
      } else {
        // Anonymize other resources
        const patientRef = getPatientReference(resource);
        if (patientRef) {
          const originalPatientId = patientRef.split('/').pop();
          const anonymousId = patientMapping.get(originalPatientId);
          if (anonymousId) {
            updatePatientReference(resource, anonymousId);
            removePIIFromResource(resource, resourceType);
          }
        } else {
          // Resources without patient reference still need PII removal
          removePIIFromResource(resource, resourceType);
        }
      }
      
      return entry;
    });
  }
  
  return anonymized;
}

/**
 * Stage 2: Chain Anonymization
 * Further anonymizes already-anonymized data for immutable chain storage
 * Applies more aggressive generalization than storage anonymization
 * 
 * @param {Object} storageAnonymizedResource - Already anonymized resource (from Stage 1)
 * @param {string} resourceType - Resource type
 * @param {Object} context - Context with patientMapping, hospitalInfo, etc.
 * @returns {Object} Further anonymized resource for chain storage
 */
export async function anonymizeForChain(storageAnonymizedResource, resourceType, context) {
  // Create deep copy
  const chainAnonymized = JSON.parse(JSON.stringify(storageAnonymizedResource));
  
  // Further generalize age ranges (5-year → 10-year)
  if (chainAnonymized.ageRange) {
    chainAnonymized.ageRange = generalizeAgeRangeTo10Year(chainAnonymized.ageRange);
  }
  
  // Round dates to month/year (remove exact dates)
  chainAnonymized.effectiveDate = roundDateToMonth(chainAnonymized.effectiveDate);
  chainAnonymized.onsetDate = roundDateToMonth(chainAnonymized.onsetDate);
  chainAnonymized.diagnosisDate = roundDateToMonth(chainAnonymized.diagnosisDate);
  chainAnonymized.abatementDate = roundDateToMonth(chainAnonymized.abatementDate);
  chainAnonymized.admissionDate = roundDateToMonth(chainAnonymized.admissionDate);
  chainAnonymized.dischargeDate = roundDateToMonth(chainAnonymized.dischargeDate);
  chainAnonymized.performedDate = roundDateToMonth(chainAnonymized.performedDate);
  chainAnonymized.collectionDate = roundDateToMonth(chainAnonymized.collectionDate);
  
  // Remove region/district (keep only country)
  if (chainAnonymized.region) {
    delete chainAnonymized.region;
  }
  if (chainAnonymized.district) {
    delete chainAnonymized.district;
  }
  
  // Further generalize occupation
  if (chainAnonymized.occupationCategory) {
    chainAnonymized.occupationCategory = generalizeOccupationFurther(chainAnonymized.occupationCategory);
  }
  
  // Suppress rare values that could identify individuals
  suppressRareValues(chainAnonymized, resourceType);
  
  return chainAnonymized;
}

/**
 * Generalize 5-year age range to 10-year range
 * @param {string} ageRange - 5-year range (e.g., "35-39")
 * @returns {string} 10-year range (e.g., "30-39")
 */
function generalizeAgeRangeTo10Year(ageRange) {
  if (!ageRange || typeof ageRange !== 'string') return ageRange;
  
  // Handle special cases
  if (ageRange === '<1') return '<10';
  if (ageRange === '90+') return '90+';
  
  // Extract numbers
  const match = ageRange.match(/(\d+)-(\d+)/);
  if (!match) return ageRange;
  
  const lower = parseInt(match[1], 10);
  const upper = parseInt(match[2], 10);
  
  // Round down to nearest 10-year boundary
  const lowerBound = Math.floor(lower / 10) * 10;
  const upperBound = lowerBound + 9;
  
  return `${lowerBound}-${upperBound}`;
}

/**
 * Round date to month/year (remove exact day)
 * @param {string|Date} date - Date string or Date object
 * @returns {string|null} Date in YYYY-MM format or null
 */
function roundDateToMonth(date) {
  if (!date) return null;
  
  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    if (isNaN(dateObj.getTime())) return null;
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    
    return `${year}-${month}`;
  } catch (error) {
    return null;
  }
}

/**
 * Further generalize occupation to broader categories
 * @param {string} occupationCategory - Current occupation category
 * @returns {string} More generalized category
 */
function generalizeOccupationFurther(occupationCategory) {
  if (!occupationCategory) return 'Unknown';
  
  const lower = occupationCategory.toLowerCase();
  
  // Map to very broad categories
  if (lower.includes('health') || lower.includes('medical') || lower.includes('doctor') || lower.includes('nurse')) {
    return 'Healthcare';
  }
  if (lower.includes('education') || lower.includes('teacher')) {
    return 'Education';
  }
  if (lower.includes('agriculture') || lower.includes('farmer')) {
    return 'Agriculture';
  }
  if (lower.includes('technology') || lower.includes('engineer') || lower.includes('tech')) {
    return 'Technology';
  }
  if (lower.includes('business') || lower.includes('commerce') || lower.includes('trade')) {
    return 'Business';
  }
  
  return 'Other';
}

/**
 * Suppress rare values that could identify individuals
 * @param {Object} resource - Resource to suppress rare values in
 * @param {string} resourceType - Resource type
 */
function suppressRareValues(resource, resourceType) {
  // Suppress very specific codes that might be rare
  // This is a simplified version - in production, you'd check frequency
  
  // Suppress rare condition codes (keep only common ones)
  if (resourceType === 'Condition' && resource.conditionCodeSnomed) {
    // In production, check if code appears < 10 times, then suppress
    // For now, we keep all codes but could add suppression logic
  }
  
  // Suppress rare observation values
  if (resourceType === 'Observation' && resource.valueQuantity) {
    // Round very specific values
    const value = parseFloat(resource.valueQuantity);
    if (!isNaN(value) && value > 0) {
      // Round to 2 significant figures for very specific values
      if (value < 1) {
        resource.valueQuantity = value.toFixed(2);
      } else if (value < 10) {
        resource.valueQuantity = value.toFixed(1);
      } else {
        resource.valueQuantity = Math.round(value).toString();
      }
    }
  }
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

