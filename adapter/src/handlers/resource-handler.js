/**
 * Universal FHIR Resource Handler
 * 
 * Handles storage, anonymization, and processing of ANY FHIR resource type.
 */

import { anonymizeFHIRResource } from '../fhir/fhir-anonymizer.js';

/**
 * Resource Handler Registry
 * Maps FHIR resource types to their specific handlers
 */
const resourceHandlers = {
  'Patient': handlePatient,
  'Encounter': handleEncounter,
  'Condition': handleCondition,
  'Observation': handleObservation,
  'MedicationRequest': handleMedicationRequest,
  'MedicationAdministration': handleMedicationAdministration,
  'MedicationStatement': handleMedicationStatement,
  'Procedure': handleProcedure,
  'DiagnosticReport': handleDiagnosticReport,
  'ImagingStudy': handleImagingStudy,
  'Specimen': handleSpecimen,
  'AllergyIntolerance': handleAllergyIntolerance,
  'Immunization': handleImmunization,
  'CarePlan': handleCarePlan,
  'CareTeam': handleCareTeam,
  'Device': handleDevice,
  'Organization': handleOrganization,
  'Practitioner': handlePractitioner,
  'Location': handleLocation,
  'Coverage': handleCoverage,
  'RelatedPerson': handleRelatedPerson,
  'Provenance': handleProvenance,
  'AuditEvent': handleAuditEvent
};

/**
 * Process and store a FHIR resource
 * @param {Object} fhirResource - FHIR resource
 * @param {Object} context - Context (hospitalId, hospitalInfo, patientMapping, etc.)
 * @returns {Promise<Object>} Processed resource data ready for storage
 */
export async function processFHIRResource(fhirResource, context) {
  const resourceType = fhirResource.resourceType;
  
  if (!resourceType) {
    throw new Error('Invalid FHIR resource: missing resourceType');
  }

  // Get handler for this resource type
  const handler = resourceHandlers[resourceType] || handleGenericResource;
  
  // Anonymize if needed
  const anonymized = await anonymizeFHIRResource(fhirResource, resourceType, context);
  
  // Process with specific handler
  const processed = await handler(anonymized, context);
  
  return {
    resourceType,
    processed,
    original: fhirResource,
    anonymized
  };
}

/**
 * Process multiple FHIR resources
 * @param {Array<Object>} resources - Array of FHIR resources
 * @param {Object} context - Context
 * @returns {Promise<Array>} Array of processed resources
 */
export async function processFHIRResources(resources, context) {
  const results = [];
  
  for (const resource of resources) {
    try {
      const processed = await processFHIRResource(resource, context);
      results.push(processed);
    } catch (error) {
      console.error(`Error processing ${resource.resourceType} ${resource.id}:`, error.message);
      // Continue with other resources
    }
  }
  
  return results;
}

// ============================================================================
// Resource-Specific Handlers
// ============================================================================

/**
 * Handle Patient resource
 */
async function handlePatient(fhirResource, context) {
  const { hospitalInfo, patientMapping } = context;
  
  // Get anonymous patient ID
  const originalPatientId = fhirResource.id || 
    fhirResource.identifier?.[0]?.value;
  const anonymousPatientId = patientMapping?.get(originalPatientId) || 
    generateAnonymousPID(patientMapping?.size || 0);
  
  // Extract demographics (already anonymized)
  return {
    anonymousPatientId,
    upi: context.upi || null,
    country: extractCountry(fhirResource, hospitalInfo),
    region: fhirResource.address?.[0]?.state || null,
    district: null, // Removed during anonymization
    ageRange: calculateAgeRange(fhirResource),
    gender: normalizeGender(fhirResource.gender),
    race: fhirResource.extension?.find(e => 
      e.url === 'http://hl7.org/fhir/StructureDefinition/us-core-race'
    )?.valueCodeableConcept?.coding?.[0]?.display || null,
    ethnicity: fhirResource.extension?.find(e => 
      e.url === 'http://hl7.org/fhir/StructureDefinition/us-core-ethnicity'
    )?.valueCodeableConcept?.coding?.[0]?.display || null,
    maritalStatus: fhirResource.maritalStatus?.coding?.[0]?.display || null,
    language: fhirResource.communication?.[0]?.language?.coding?.[0]?.code || null,
    occupationCategory: extractOccupation(fhirResource),
    hospitalId: context.hospitalId
  };
}

/**
 * Handle Encounter resource
 */
async function handleEncounter(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.subject?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for encounter ${fhirResource.id}`);
  }
  
  return {
    encounterId: fhirResource.id,
    anonymousPatientId,
    upi: context.upi || null,
    encounterClass: fhirResource.class?.code || null,
    encounterTypeCode: fhirResource.type?.[0]?.coding?.[0]?.code || null,
    encounterTypeDisplay: fhirResource.type?.[0]?.coding?.[0]?.display || null,
    status: fhirResource.status || null,
    facilityId: fhirResource.serviceProvider?.reference || null,
    facilityName: null, // Anonymized
    departmentCode: fhirResource.serviceType?.coding?.[0]?.code || null,
    departmentName: fhirResource.serviceType?.coding?.[0]?.display || null,
    locationId: fhirResource.location?.[0]?.location?.reference || null,
    locationName: null, // Anonymized
    bedId: null, // Anonymized
    roomNumber: null, // Anonymized
    admissionDate: fhirResource.period?.start ? new Date(fhirResource.period.start) : null,
    dischargeDate: fhirResource.period?.end ? new Date(fhirResource.period.end) : null,
    periodStart: fhirResource.period?.start ? new Date(fhirResource.period.start) : null,
    periodEnd: fhirResource.period?.end ? new Date(fhirResource.period.end) : null,
    reasonCode: fhirResource.reasonCode?.[0]?.coding?.[0]?.code || null,
    reasonDisplay: fhirResource.reasonCode?.[0]?.coding?.[0]?.display || null,
    diagnosisCode: fhirResource.diagnosis?.[0]?.condition?.reference || null,
    diagnosisDisplay: fhirResource.diagnosis?.[0]?.condition?.display || null,
    attendingPractitionerId: fhirResource.participant?.[0]?.individual?.reference || null,
    attendingPractitionerName: null, // Anonymized
    hospitalId: context.hospitalId
  };
}

/**
 * Handle Condition resource
 */
async function handleCondition(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.subject?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for condition ${fhirResource.id}`);
  }
  
  const code = fhirResource.code?.coding?.[0];
  
  return {
    anonymousPatientId,
    upi: context.upi || null,
    conditionCodeIcd10: code?.system?.includes('icd-10') ? code.code : null,
    conditionCodeSnomed: code?.system?.includes('snomed') ? code.code : null,
    conditionName: code?.display || fhirResource.code?.text || null,
    bodySiteCode: fhirResource.bodySite?.[0]?.coding?.[0]?.code || null,
    bodySiteDisplay: fhirResource.bodySite?.[0]?.coding?.[0]?.display || null,
    stageCode: fhirResource.stage?.[0]?.summary?.coding?.[0]?.code || null,
    stageDisplay: fhirResource.stage?.[0]?.summary?.coding?.[0]?.display || null,
    severityCode: fhirResource.severity?.coding?.[0]?.code || null,
    severityDisplay: fhirResource.severity?.coding?.[0]?.display || null,
    onsetDate: fhirResource.onsetDateTime ? new Date(fhirResource.onsetDateTime).toISOString().split('T')[0] : null,
    diagnosisDate: fhirResource.recordedDate ? new Date(fhirResource.recordedDate).toISOString().split('T')[0] : null,
    abatementDate: fhirResource.abatementDateTime ? new Date(fhirResource.abatementDateTime).toISOString().split('T')[0] : null,
    diagnosisRole: fhirResource.category?.[0]?.coding?.[0]?.code || 'primary',
    categoryCode: fhirResource.category?.[0]?.coding?.[0]?.code || null,
    categoryDisplay: fhirResource.category?.[0]?.coding?.[0]?.display || null,
    status: fhirResource.clinicalStatus?.coding?.[0]?.code || 'active',
    encounterId: fhirResource.encounter?.reference?.split('/').pop() || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle Observation resource
 */
async function handleObservation(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.subject?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for observation ${fhirResource.id}`);
  }
  
  const code = fhirResource.code?.coding?.find(c => c.system?.includes('loinc')) || 
               fhirResource.code?.coding?.[0];
  
  return {
    anonymousPatientId,
    upi: context.upi || null,
    observationCodeLoinc: code?.system?.includes('loinc') ? code.code : null,
    observationName: code?.display || fhirResource.code?.text || null,
    categoryCode: fhirResource.category?.[0]?.coding?.[0]?.code || null,
    categoryDisplay: fhirResource.category?.[0]?.coding?.[0]?.display || null,
    valueQuantity: fhirResource.valueQuantity?.value?.toString() || null,
    valueUnit: fhirResource.valueQuantity?.unit || null,
    valueString: fhirResource.valueString || null,
    valueCodeableConceptCode: fhirResource.valueCodeableConcept?.coding?.[0]?.code || null,
    valueCodeableConceptDisplay: fhirResource.valueCodeableConcept?.coding?.[0]?.display || null,
    referenceRangeLow: fhirResource.referenceRange?.[0]?.low?.value?.toString() || null,
    referenceRangeHigh: fhirResource.referenceRange?.[0]?.high?.value?.toString() || null,
    referenceRangeText: fhirResource.referenceRange?.[0]?.text || null,
    interpretationCode: fhirResource.interpretation?.[0]?.coding?.[0]?.code || null,
    interpretationDisplay: fhirResource.interpretation?.[0]?.coding?.[0]?.display || null,
    effectiveDate: fhirResource.effectiveDateTime ? new Date(fhirResource.effectiveDateTime) : null,
    effectivePeriodStart: fhirResource.effectivePeriod?.start ? new Date(fhirResource.effectivePeriod.start) : null,
    effectivePeriodEnd: fhirResource.effectivePeriod?.end ? new Date(fhirResource.effectivePeriod.end) : null,
    encounterId: fhirResource.encounter?.reference?.split('/').pop() || null,
    performerId: fhirResource.performer?.[0]?.reference || null,
    performerName: null, // Anonymized
    performerType: fhirResource.performer?.[0]?.reference?.split('/')[0] || null,
    methodCode: fhirResource.method?.coding?.[0]?.code || null,
    methodDisplay: fhirResource.method?.coding?.[0]?.display || null,
    deviceCode: fhirResource.device?.reference || null,
    deviceDisplay: null, // Anonymized
    specimenId: fhirResource.specimen?.reference?.split('/').pop() || null,
    diagnosticReportId: fhirResource.basedOn?.[0]?.reference?.split('/').pop() || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle MedicationRequest resource
 */
async function handleMedicationRequest(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.subject?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for medication request ${fhirResource.id}`);
  }
  
  const medication = fhirResource.medicationCodeableConcept || fhirResource.medicationReference;
  const medicationCode = medication?.coding?.find(c => c.system?.includes('rxnorm')) || 
                          medication?.coding?.[0];
  
  return {
    medicationRequestId: fhirResource.id,
    anonymousPatientId,
    upi: context.upi || null,
    medicationCodeRxnorm: medicationCode?.system?.includes('rxnorm') ? medicationCode.code : null,
    medicationName: medicationCode?.display || medication?.text || null,
    atcCode: medication?.coding?.find(c => c.system?.includes('atc'))?.code || null,
    atcDisplay: medication?.coding?.find(c => c.system?.includes('atc'))?.display || null,
    dosageQuantity: fhirResource.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.value?.toString() || null,
    dosageUnit: fhirResource.dosageInstruction?.[0]?.doseAndRate?.[0]?.doseQuantity?.unit || null,
    dosageText: fhirResource.dosageInstruction?.[0]?.text || null,
    frequencyCode: fhirResource.dosageInstruction?.[0]?.timing?.code?.coding?.[0]?.code || null,
    frequencyText: fhirResource.dosageInstruction?.[0]?.timing?.code?.text || null,
    routeCode: fhirResource.dosageInstruction?.[0]?.route?.coding?.[0]?.code || null,
    routeDisplay: fhirResource.dosageInstruction?.[0]?.route?.coding?.[0]?.display || null,
    startDate: fhirResource.dosageInstruction?.[0]?.timing?.bounds?.period?.start ? 
               new Date(fhirResource.dosageInstruction[0].timing.bounds.period.start).toISOString().split('T')[0] : null,
    endDate: fhirResource.dosageInstruction?.[0]?.timing?.bounds?.period?.end ? 
             new Date(fhirResource.dosageInstruction[0].timing.bounds.period.end).toISOString().split('T')[0] : null,
    expectedDuration: fhirResource.dosageInstruction?.[0]?.timing?.bounds?.duration?.value?.toString() || null,
    status: fhirResource.status || null,
    intent: fhirResource.intent || null,
    prescriberId: fhirResource.requester?.reference || null,
    prescriberName: null, // Anonymized
    prescriberType: fhirResource.requester?.reference?.split('/')[0] || null,
    dispenserId: fhirResource.dispenseRequest?.performer?.reference || null,
    dispenserName: null, // Anonymized
    dispenseQuantity: fhirResource.dispenseRequest?.quantity?.value?.toString() || null,
    numberOfRepeats: fhirResource.dispenseRequest?.numberOfRepeatsAllowed || null,
    encounterId: fhirResource.encounter?.reference?.split('/').pop() || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle MedicationAdministration resource
 */
async function handleMedicationAdministration(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.subject?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for medication administration ${fhirResource.id}`);
  }
  
  return {
    medicationAdministrationId: fhirResource.id,
    anonymousPatientId,
    upi: context.upi || null,
    medicationRequestId: fhirResource.basedOn?.[0]?.reference?.split('/').pop() || null,
    medicationCodeRxnorm: fhirResource.medicationCodeableConcept?.coding?.find(c => c.system?.includes('rxnorm'))?.code || null,
    medicationName: fhirResource.medicationCodeableConcept?.coding?.[0]?.display || null,
    administeredDate: fhirResource.effectiveDateTime ? new Date(fhirResource.effectiveDateTime) : null,
    dosageQuantity: fhirResource.dosage?.dose?.value?.toString() || null,
    dosageUnit: fhirResource.dosage?.dose?.unit || null,
    routeCode: fhirResource.dosage?.route?.coding?.[0]?.code || null,
    routeDisplay: fhirResource.dosage?.route?.coding?.[0]?.display || null,
    performerId: fhirResource.performer?.[0]?.actor?.reference || null,
    performerName: null, // Anonymized
    performerType: fhirResource.performer?.[0]?.actor?.reference?.split('/')[0] || null,
    status: fhirResource.status || null,
    encounterId: fhirResource.context?.reference?.split('/').pop() || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle MedicationStatement resource
 */
async function handleMedicationStatement(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.subject?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for medication statement ${fhirResource.id}`);
  }
  
  return {
    anonymousPatientId,
    upi: context.upi || null,
    medicationCodeRxnorm: fhirResource.medicationCodeableConcept?.coding?.find(c => c.system?.includes('rxnorm'))?.code || null,
    medicationName: fhirResource.medicationCodeableConcept?.coding?.[0]?.display || null,
    status: fhirResource.status || null,
    effectiveStartDate: fhirResource.effectivePeriod?.start ? new Date(fhirResource.effectivePeriod.start).toISOString().split('T')[0] : null,
    effectiveEndDate: fhirResource.effectivePeriod?.end ? new Date(fhirResource.effectivePeriod.end).toISOString().split('T')[0] : null,
    dosageText: fhirResource.dosage?.[0]?.text || null,
    frequencyText: fhirResource.dosage?.[0]?.timing?.code?.text || null,
    informationSource: fhirResource.informationSource?.coding?.[0]?.code || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle Procedure resource
 */
async function handleProcedure(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.subject?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for procedure ${fhirResource.id}`);
  }
  
  const code = fhirResource.code?.coding?.find(c => c.system?.includes('snomed')) ||
               fhirResource.code?.coding?.find(c => c.system?.includes('cpt')) ||
               fhirResource.code?.coding?.[0];
  
  return {
    procedureId: fhirResource.id,
    anonymousPatientId,
    upi: context.upi || null,
    procedureCodeSnomed: code?.system?.includes('snomed') ? code.code : null,
    procedureCodeCpt: code?.system?.includes('cpt') ? code.code : null,
    procedureCodeIcd10pcs: code?.system?.includes('icd-10-pcs') ? code.code : null,
    procedureName: code?.display || fhirResource.code?.text || null,
    bodySiteCode: fhirResource.bodySite?.[0]?.coding?.[0]?.code || null,
    bodySiteDisplay: fhirResource.bodySite?.[0]?.coding?.[0]?.display || null,
    techniqueCode: fhirResource.technique?.coding?.[0]?.code || null,
    techniqueDisplay: fhirResource.technique?.coding?.[0]?.display || null,
    performedDate: fhirResource.performedDateTime ? new Date(fhirResource.performedDateTime) : null,
    performedPeriodStart: fhirResource.performedPeriod?.start ? new Date(fhirResource.performedPeriod.start) : null,
    performedPeriodEnd: fhirResource.performedPeriod?.end ? new Date(fhirResource.performedPeriod.end) : null,
    status: fhirResource.status || null,
    outcomeCode: fhirResource.outcome?.coding?.[0]?.code || null,
    outcomeDisplay: fhirResource.outcome?.coding?.[0]?.display || null,
    outcomeText: fhirResource.outcome?.text || null,
    performerId: fhirResource.performer?.[0]?.actor?.reference || null,
    performerName: null, // Anonymized
    performerRoleCode: fhirResource.performer?.[0]?.role?.coding?.[0]?.code || null,
    performerRoleDisplay: fhirResource.performer?.[0]?.role?.coding?.[0]?.display || null,
    deviceImplantedCode: fhirResource.focalDevice?.[0]?.action?.coding?.[0]?.code || null,
    deviceImplantedDisplay: fhirResource.focalDevice?.[0]?.action?.coding?.[0]?.display || null,
    encounterId: fhirResource.encounter?.reference?.split('/').pop() || null,
    reasonCode: fhirResource.reasonCode?.[0]?.coding?.[0]?.code || null,
    reasonDisplay: fhirResource.reasonCode?.[0]?.coding?.[0]?.display || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle DiagnosticReport resource
 */
async function handleDiagnosticReport(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.subject?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for diagnostic report ${fhirResource.id}`);
  }
  
  const code = fhirResource.code?.coding?.find(c => c.system?.includes('loinc')) ||
               fhirResource.code?.coding?.[0];
  
  return {
    reportId: fhirResource.id,
    anonymousPatientId,
    upi: context.upi || null,
    reportCodeLoinc: code?.system?.includes('loinc') ? code.code : null,
    reportName: code?.display || fhirResource.code?.text || null,
    status: fhirResource.status || null,
    categoryCode: fhirResource.category?.[0]?.coding?.[0]?.code || null,
    categoryDisplay: fhirResource.category?.[0]?.coding?.[0]?.display || null,
    effectiveDate: fhirResource.effectiveDateTime ? new Date(fhirResource.effectiveDateTime) : null,
    issuedDate: fhirResource.issued ? new Date(fhirResource.issued) : null,
    performerId: fhirResource.performer?.[0]?.reference || null,
    performerName: null, // Anonymized
    performerType: fhirResource.performer?.[0]?.reference?.split('/')[0] || null,
    conclusion: fhirResource.conclusion || null,
    conclusionCode: fhirResource.conclusionCode?.[0]?.coding?.[0]?.code || null,
    encounterId: fhirResource.encounter?.reference?.split('/').pop() || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle ImagingStudy resource
 */
async function handleImagingStudy(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.subject?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for imaging study ${fhirResource.id}`);
  }
  
  return {
    studyId: fhirResource.id,
    anonymousPatientId,
    upi: context.upi || null,
    modalityCode: fhirResource.modality?.[0]?.code || null,
    modalityDisplay: fhirResource.modality?.[0]?.display || null,
    bodySiteCode: fhirResource.bodySite?.coding?.[0]?.code || null,
    bodySiteDisplay: fhirResource.bodySite?.coding?.[0]?.display || null,
    studyDescription: fhirResource.description || null,
    seriesCount: fhirResource.series?.length || 0,
    imageCount: fhirResource.series?.reduce((sum, s) => sum + (s.numberOfInstances || 0), 0) || 0,
    startedDate: fhirResource.started ? new Date(fhirResource.started) : null,
    endedDate: fhirResource.ended ? new Date(fhirResource.ended) : null,
    performerId: fhirResource.endpoint?.[0]?.reference || null,
    performerName: null, // Anonymized
    performerType: 'Device',
    equipmentDeviceId: fhirResource.equipment?.device?.reference || null,
    equipmentDeviceName: null, // Anonymized
    equipmentManufacturer: null, // Anonymized
    equipmentModel: null, // Anonymized
    reportText: fhirResource.note?.[0]?.text || null,
    reportId: fhirResource.imagingStudy?.reference?.split('/').pop() || null,
    encounterId: fhirResource.encounter?.reference?.split('/').pop() || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle Specimen resource
 */
async function handleSpecimen(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.subject?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for specimen ${fhirResource.id}`);
  }
  
  return {
    specimenId: fhirResource.id,
    anonymousPatientId,
    upi: context.upi || null,
    typeCode: fhirResource.type?.coding?.[0]?.code || null,
    typeDisplay: fhirResource.type?.coding?.[0]?.display || null,
    collectionMethodCode: fhirResource.collection?.method?.coding?.[0]?.code || null,
    collectionMethodDisplay: fhirResource.collection?.method?.coding?.[0]?.display || null,
    collectionDate: fhirResource.collection?.collectedDateTime ? new Date(fhirResource.collection.collectedDateTime) : null,
    collectorId: fhirResource.collection?.collector?.reference || null,
    collectorName: null, // Anonymized
    containerId: fhirResource.container?.[0]?.identifier?.[0]?.value || null,
    containerTypeCode: fhirResource.container?.[0]?.type?.coding?.[0]?.code || null,
    containerTypeDisplay: fhirResource.container?.[0]?.type?.coding?.[0]?.display || null,
    receivedDate: fhirResource.receivedTime ? new Date(fhirResource.receivedTime) : null,
    processingDate: fhirResource.processing?.[0]?.time ? new Date(fhirResource.processing[0].time) : null,
    conditionCode: fhirResource.condition?.[0]?.coding?.[0]?.code || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle AllergyIntolerance resource
 */
async function handleAllergyIntolerance(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.patient?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for allergy ${fhirResource.id}`);
  }
  
  return {
    anonymousPatientId,
    upi: context.upi || null,
    substanceCode: fhirResource.code?.coding?.find(c => c.system?.includes('snomed') || c.system?.includes('rxnorm'))?.code || null,
    substanceDisplay: fhirResource.code?.coding?.[0]?.display || null,
    reactionTypeCode: fhirResource.reaction?.[0]?.manifestation?.[0]?.coding?.[0]?.code || null,
    reactionTypeDisplay: fhirResource.reaction?.[0]?.manifestation?.[0]?.coding?.[0]?.display || null,
    reactionManifestationCode: fhirResource.reaction?.[0]?.manifestation?.[0]?.coding?.[0]?.code || null,
    reactionManifestationDisplay: fhirResource.reaction?.[0]?.manifestation?.[0]?.coding?.[0]?.display || null,
    severity: fhirResource.reaction?.[0]?.severity || null,
    certainty: fhirResource.verificationStatus?.coding?.[0]?.code || null,
    onsetDate: fhirResource.onsetDateTime ? new Date(fhirResource.onsetDateTime).toISOString().split('T')[0] : null,
    lastOccurrenceDate: fhirResource.lastOccurrence ? new Date(fhirResource.lastOccurrence).toISOString().split('T')[0] : null,
    criticality: fhirResource.criticality || null,
    status: fhirResource.clinicalStatus?.coding?.[0]?.code || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle Immunization resource
 */
async function handleImmunization(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.patient?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for immunization ${fhirResource.id}`);
  }
  
  return {
    anonymousPatientId,
    upi: context.upi || null,
    vaccineCode: fhirResource.vaccineCode?.coding?.find(c => c.system?.includes('cvx'))?.code || null,
    vaccineDisplay: fhirResource.vaccineCode?.coding?.[0]?.display || null,
    status: fhirResource.status || null,
    occurrenceDate: fhirResource.occurrenceDateTime ? new Date(fhirResource.occurrenceDateTime).toISOString().split('T')[0] : null,
    performerId: fhirResource.performer?.[0]?.actor?.reference || null,
    performerName: null, // Anonymized
    lotNumber: fhirResource.lotNumber || null,
    expirationDate: fhirResource.expirationDate ? new Date(fhirResource.expirationDate).toISOString().split('T')[0] : null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle CarePlan resource
 */
async function handleCarePlan(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.subject?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for care plan ${fhirResource.id}`);
  }
  
  return {
    anonymousPatientId,
    upi: context.upi || null,
    carePlanId: fhirResource.id,
    status: fhirResource.status || null,
    intent: fhirResource.intent || null,
    categoryCode: fhirResource.category?.[0]?.coding?.[0]?.code || null,
    categoryDisplay: fhirResource.category?.[0]?.coding?.[0]?.display || null,
    periodStart: fhirResource.period?.start ? new Date(fhirResource.period.start).toISOString().split('T')[0] : null,
    periodEnd: fhirResource.period?.end ? new Date(fhirResource.period.end).toISOString().split('T')[0] : null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle CareTeam resource
 */
async function handleCareTeam(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.subject?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for care team ${fhirResource.id}`);
  }
  
  return {
    anonymousPatientId,
    upi: context.upi || null,
    careTeamId: fhirResource.id,
    status: fhirResource.status || null,
    categoryCode: fhirResource.category?.[0]?.coding?.[0]?.code || null,
    categoryDisplay: fhirResource.category?.[0]?.coding?.[0]?.display || null,
    periodStart: fhirResource.period?.start ? new Date(fhirResource.period.start).toISOString().split('T')[0] : null,
    periodEnd: fhirResource.period?.end ? new Date(fhirResource.period.end).toISOString().split('T')[0] : null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle Device resource
 */
async function handleDevice(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.patient?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for device ${fhirResource.id}`);
  }
  
  return {
    anonymousPatientId,
    upi: context.upi || null,
    deviceId: fhirResource.id,
    deviceTypeCode: fhirResource.type?.coding?.[0]?.code || null,
    deviceTypeDisplay: fhirResource.type?.coding?.[0]?.display || null,
    manufacturer: null, // Anonymized
    model: null, // Anonymized
    serialNumber: null, // Anonymized
    status: fhirResource.status || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle Organization resource
 */
async function handleOrganization(fhirResource, context) {
  return {
    organizationId: fhirResource.id,
    name: null, // Anonymized - only keep type
    typeCode: fhirResource.type?.[0]?.coding?.[0]?.code || null,
    typeDisplay: fhirResource.type?.[0]?.coding?.[0]?.display || null,
    addressCountry: fhirResource.address?.[0]?.country || null,
    addressRegion: fhirResource.address?.[0]?.state || null,
    addressCity: fhirResource.address?.[0]?.city || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle Practitioner resource
 */
async function handlePractitioner(fhirResource, context) {
  return {
    practitionerId: fhirResource.id,
    name: null, // Anonymized
    qualificationCode: fhirResource.qualification?.[0]?.code?.coding?.[0]?.code || null,
    qualificationDisplay: fhirResource.qualification?.[0]?.code?.coding?.[0]?.display || null,
    organizationId: fhirResource.extension?.find(e => 
      e.url === 'http://hl7.org/fhir/StructureDefinition/practitioner-organization'
    )?.valueReference?.reference?.split('/').pop() || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle Location resource
 */
async function handleLocation(fhirResource, context) {
  return {
    locationId: fhirResource.id,
    name: null, // Anonymized
    typeCode: fhirResource.type?.[0]?.coding?.[0]?.code || null,
    typeDisplay: fhirResource.type?.[0]?.coding?.[0]?.display || null,
    addressCountry: fhirResource.address?.country || null,
    addressRegion: fhirResource.address?.state || null,
    addressCity: fhirResource.address?.city || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle Coverage resource
 */
async function handleCoverage(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.beneficiary?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for coverage ${fhirResource.id}`);
  }
  
  return {
    anonymousPatientId,
    upi: context.upi || null,
    coverageId: fhirResource.id,
    status: fhirResource.status || null,
    typeCode: fhirResource.type?.coding?.[0]?.code || null,
    typeDisplay: fhirResource.type?.coding?.[0]?.display || null,
    subscriberId: null, // Anonymized
    beneficiaryId: null, // Anonymized
    periodStart: fhirResource.period?.start ? new Date(fhirResource.period.start).toISOString().split('T')[0] : null,
    periodEnd: fhirResource.period?.end ? new Date(fhirResource.period.end).toISOString().split('T')[0] : null,
    payorId: fhirResource.payor?.[0]?.reference || null,
    payorName: null, // Anonymized
    hospitalId: context.hospitalId
  };
}

/**
 * Handle RelatedPerson resource
 */
async function handleRelatedPerson(fhirResource, context) {
  const { patientMapping } = context;
  
  const patientRef = fhirResource.patient?.reference;
  const originalPatientId = patientRef?.split('/').pop();
  const anonymousPatientId = patientMapping?.get(originalPatientId);
  
  if (!anonymousPatientId) {
    throw new Error(`Patient mapping not found for related person ${fhirResource.id}`);
  }
  
  return {
    anonymousPatientId,
    upi: context.upi || null,
    relationshipCode: fhirResource.relationship?.[0]?.coding?.[0]?.code || null,
    relationshipDisplay: fhirResource.relationship?.[0]?.coding?.[0]?.display || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle Provenance resource
 */
async function handleProvenance(fhirResource, context) {
  return {
    targetResourceType: fhirResource.target?.[0]?.reference?.split('/')[0] || null,
    targetResourceId: fhirResource.target?.[0]?.reference?.split('/').pop() || null,
    targetResourceFhirId: fhirResource.target?.[0]?.reference || null,
    activityCode: fhirResource.activity?.coding?.[0]?.code || null,
    activityDisplay: fhirResource.activity?.coding?.[0]?.display || null,
    agentId: fhirResource.agent?.[0]?.who?.reference || null,
    agentName: null, // Anonymized
    agentType: fhirResource.agent?.[0]?.who?.reference?.split('/')[0] || null,
    agentRoleCode: fhirResource.agent?.[0]?.role?.[0]?.coding?.[0]?.code || null,
    agentRoleDisplay: fhirResource.agent?.[0]?.role?.[0]?.coding?.[0]?.display || null,
    occurredAt: fhirResource.occurredDateTime ? new Date(fhirResource.occurredDateTime) : null,
    reasonCode: fhirResource.reason?.[0]?.coding?.[0]?.code || null,
    reasonDisplay: fhirResource.reason?.[0]?.coding?.[0]?.display || null,
    signatureType: fhirResource.signature?.[0]?.type?.[0]?.code || null,
    signatureData: fhirResource.signature?.[0]?.data || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle AuditEvent resource
 */
async function handleAuditEvent(fhirResource, context) {
  return {
    eventType: fhirResource.type?.code || null,
    eventSubtype: fhirResource.subtype?.[0]?.code || null,
    agentId: fhirResource.agent?.[0]?.who?.reference || null,
    agentName: null, // Anonymized
    agentType: fhirResource.agent?.[0]?.who?.reference?.split('/')[0] || null,
    agentIpAddress: fhirResource.agent?.[0]?.network?.address || null,
    agentUserAgent: fhirResource.agent?.[0]?.network?.type || null,
    resourceType: fhirResource.entity?.[0]?.type?.code || null,
    resourceId: fhirResource.entity?.[0]?.reference?.split('/').pop() || null,
    resourceFhirId: fhirResource.entity?.[0]?.reference || null,
    outcomeCode: fhirResource.outcome || null,
    outcomeDisplay: fhirResource.outcomeDesc || null,
    outcomeDescription: fhirResource.outcomeDesc || null,
    occurredAt: fhirResource.recorded ? new Date(fhirResource.recorded) : null,
    purposeOfUseCode: fhirResource.purposeOfEvent?.[0]?.coding?.[0]?.code || null,
    purposeOfUseDisplay: fhirResource.purposeOfEvent?.[0]?.coding?.[0]?.display || null,
    hospitalId: context.hospitalId
  };
}

/**
 * Handle generic/unknown resource type
 */
async function handleGenericResource(fhirResource, context) {
  // Store as JSON in generic table
  return {
    resourceType: fhirResource.resourceType,
    resourceId: fhirResource.id,
    fhirData: JSON.stringify(fhirResource),
    hospitalId: context.hospitalId
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateAnonymousPID(index) {
  return `PID-${String(index + 1).padStart(3, '0')}`;
}

function extractCountry(fhirResource, hospitalInfo) {
  if (fhirResource.address?.[0]?.country) {
    return fhirResource.address[0].country;
  }
  return hospitalInfo?.country || 'Unknown';
}

function calculateAgeRange(fhirResource) {
  if (fhirResource.birthDate) {
    const birthDate = new Date(fhirResource.birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    // Convert to 5-year range
    const rangeStart = Math.floor(age / 5) * 5;
    return `${rangeStart}-${rangeStart + 4}`;
  }
  return null;
}

function normalizeGender(gender) {
  if (!gender) return 'Unknown';
  const g = gender.toLowerCase();
  if (g === 'm' || g === 'male') return 'Male';
  if (g === 'f' || g === 'female') return 'Female';
  if (g === 'other') return 'Other';
  return 'Unknown';
}

function extractOccupation(fhirResource) {
  const occupation = fhirResource.extension?.find(e => 
    e.url === 'http://hl7.org/fhir/StructureDefinition/patient-occupation'
  )?.valueCodeableConcept?.coding?.[0]?.display;
  
  if (!occupation) return 'Unknown';
  
  // Generalize to categories
  const lower = occupation.toLowerCase();
  if (lower.includes('doctor') || lower.includes('nurse') || lower.includes('health')) {
    return 'Healthcare Worker';
  }
  if (lower.includes('teacher') || lower.includes('education')) {
    return 'Education Worker';
  }
  if (lower.includes('farmer') || lower.includes('agriculture')) {
    return 'Agriculture Worker';
  }
  if (lower.includes('engineer') || lower.includes('tech')) {
    return 'Technology Worker';
  }
  return 'Other';
}

