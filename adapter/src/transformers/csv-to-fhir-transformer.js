/**
 * Comprehensive CSV to FHIR R4 Transformer
 * 
 * Converts CSV records to FHIR R4 resources supporting all 10 core domains:
 * 1. Patient Identity & Demographics
 * 2. Encounters/Visits
 * 3. Diagnoses & Clinical Problems
 * 4. Laboratory Tests & Measurements
 * 5. Medications & Treatment
 * 6. Procedures & Interventions
 * 7. Medical Imaging
 * 8. Vitals & Clinical Measurements
 * 9. Social Determinants of Health
 * 10. Metadata & Audit
 */

/**
 * Convert CSV records to FHIR Bundle with all resource types
 * @param {Array<Object>} records - CSV records
 * @param {Object} hospitalInfo - Hospital information (country, location, hospitalId)
 * @returns {Object} FHIR Bundle with all resources
 */
export function csvToFHIRBundle(records, hospitalInfo = {}) {
  const bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: new Date().toISOString(),
    entry: []
  };

  // Maps to track resources and avoid duplicates
  const patientMap = new Map();
  const encounterMap = new Map();
  const conditionMap = new Map();
  const observationMap = new Map();
  const medicationRequestMap = new Map();
  const procedureMap = new Map();
  const imagingStudyMap = new Map();
  const allergyMap = new Map();
  const immunizationMap = new Map();
  const coverageMap = new Map();

  records.forEach((record, index) => {
    const patientId = record['Patient ID'] || `patient-${index}`;
    const encounterId = record['Encounter ID'] || `encounter-${patientId}-${record['Encounter Date'] || 'default'}`;

    // ============================================
    // Domain 1: Patient Identity & Demographics
    // ============================================
    if (!patientMap.has(patientId)) {
      const patient = createPatientResource(record, patientId, hospitalInfo);
      patientMap.set(patientId, patient);
    }

    // Coverage (Insurance/Payer) - Domain 1
    if (record['Coverage ID'] || record['Insurance Type']) {
      const coverageId = record['Coverage ID'] || `coverage-${patientId}`;
      if (!coverageMap.has(coverageId)) {
        const coverage = createCoverageResource(record, patientId, coverageId);
        coverageMap.set(coverageId, coverage);
      }
    }

    // ============================================
    // Domain 2: Encounters/Visits
    // ============================================
    if (record['Encounter Date'] || record['Encounter Type']) {
      if (!encounterMap.has(encounterId)) {
        const encounter = createEncounterResource(record, patientId, encounterId);
        encounterMap.set(encounterId, encounter);
      }
    }

    // ============================================
    // Domain 3: Diagnoses & Clinical Problems
    // ============================================
    if (record['Condition Code ICD10'] || record['Condition Code SNOMED'] || record['Condition Name']) {
      const conditionId = `condition-${patientId}-${record['Condition Code ICD10'] || record['Condition Code SNOMED'] || record['Condition Name']}-${record['Diagnosis Date'] || ''}`;
      if (!conditionMap.has(conditionId)) {
        const condition = createConditionResource(record, patientId, encounterId, conditionId);
        conditionMap.set(conditionId, condition);
      }
    }

    // Allergies - Domain 3
    if (record['Allergy Substance'] || record['Allergy Reaction']) {
      const allergyId = `allergy-${patientId}-${record['Allergy Substance'] || 'unknown'}`;
      if (!allergyMap.has(allergyId)) {
        const allergy = createAllergyResource(record, patientId, allergyId);
        allergyMap.set(allergyId, allergy);
      }
    }

    // ============================================
    // Domain 4: Laboratory Tests & Measurements
    // ============================================
    if (record['Observation Code LOINC'] || record['Observation Name'] || record['Lab Test']) {
      const observationId = `obs-${patientId}-${record['Observation Code LOINC'] || record['Observation Name'] || record['Lab Test']}-${record['Observation Date'] || record['Test Date'] || ''}`;
      if (!observationMap.has(observationId)) {
        const observation = createObservationResource(record, patientId, encounterId, observationId);
        observationMap.set(observationId, observation);
      }
    }

    // ============================================
    // Domain 5: Medications & Treatment
    // ============================================
    if (record['Medication Code RxNorm'] || record['Medication Name']) {
      const medicationId = `med-${patientId}-${record['Medication Code RxNorm'] || record['Medication Name']}-${record['Prescription Date'] || ''}`;
      if (!medicationRequestMap.has(medicationId)) {
        const medication = createMedicationRequestResource(record, patientId, encounterId, medicationId);
        medicationRequestMap.set(medicationId, medication);
      }
    }

    // ============================================
    // Domain 6: Procedures & Interventions
    // ============================================
    if (record['Procedure Code CPT'] || record['Procedure Code SNOMED'] || record['Procedure Name']) {
      const procedureId = `proc-${patientId}-${record['Procedure Code CPT'] || record['Procedure Code SNOMED'] || record['Procedure Name']}-${record['Procedure Date'] || ''}`;
      if (!procedureMap.has(procedureId)) {
        const procedure = createProcedureResource(record, patientId, encounterId, procedureId);
        procedureMap.set(procedureId, procedure);
      }
    }

    // ============================================
    // Domain 7: Medical Imaging
    // ============================================
    if (record['Imaging Study Type'] || record['Imaging Modality']) {
      const imagingId = `imaging-${patientId}-${record['Imaging Study Type'] || record['Imaging Modality']}-${record['Imaging Date'] || ''}`;
      if (!imagingStudyMap.has(imagingId)) {
        const imaging = createImagingStudyResource(record, patientId, encounterId, imagingId);
        imagingStudyMap.set(imagingId, imaging);
      }
    }

    // ============================================
    // Domain 8: Vitals & Clinical Measurements
    // ============================================
    if (record['Vital Sign Type'] || record['Vital Sign Value']) {
      const vitalId = `vital-${patientId}-${record['Vital Sign Type'] || 'unknown'}-${record['Vital Sign Date'] || record['Observation Date'] || ''}`;
      if (!observationMap.has(vitalId)) {
        const vital = createVitalSignObservation(record, patientId, encounterId, vitalId);
        observationMap.set(vitalId, vital);
      }
    }

    // ============================================
    // Domain 9: Social Determinants of Health
    // ============================================
    if (record['SDOH Category'] || record['SDOH Value']) {
      const sdohId = `sdoh-${patientId}-${record['SDOH Category'] || 'unknown'}-${record['SDOH Date'] || ''}`;
      if (!observationMap.has(sdohId)) {
        const sdoh = createSDOHObservation(record, patientId, sdohId);
        observationMap.set(sdohId, sdoh);
      }
    }

    // ============================================
    // Domain 10: Metadata & Audit (handled separately)
    // ============================================
    // Provenance and AuditEvent are created during processing, not from CSV
  });

  // Add all resources to bundle
  patientMap.forEach(patient => {
    bundle.entry.push({
      fullUrl: `urn:uuid:${patient.id}`,
      resource: patient
    });
  });

  encounterMap.forEach(encounter => {
    bundle.entry.push({
      fullUrl: `urn:uuid:${encounter.id}`,
      resource: encounter
    });
  });

  conditionMap.forEach(condition => {
    bundle.entry.push({
      fullUrl: `urn:uuid:${condition.id}`,
      resource: condition
    });
  });

  observationMap.forEach(observation => {
    bundle.entry.push({
      fullUrl: `urn:uuid:${observation.id}`,
      resource: observation
    });
  });

  medicationRequestMap.forEach(medication => {
    bundle.entry.push({
      fullUrl: `urn:uuid:${medication.id}`,
      resource: medication
    });
  });

  procedureMap.forEach(procedure => {
    bundle.entry.push({
      fullUrl: `urn:uuid:${procedure.id}`,
      resource: procedure
    });
  });

  imagingStudyMap.forEach(imaging => {
    bundle.entry.push({
      fullUrl: `urn:uuid:${imaging.id}`,
      resource: imaging
    });
  });

  allergyMap.forEach(allergy => {
    bundle.entry.push({
      fullUrl: `urn:uuid:${allergy.id}`,
      resource: allergy
    });
  });

  coverageMap.forEach(coverage => {
    bundle.entry.push({
      fullUrl: `urn:uuid:${coverage.id}`,
      resource: coverage
    });
  });

  return bundle;
}

/**
 * Create Patient resource (Domain 1)
 */
function createPatientResource(record, patientId, hospitalInfo) {
  const patient = {
    resourceType: 'Patient',
    id: patientId,
    identifier: [{
      system: 'urn:hospital:patient-id',
      value: record['Patient ID'] || patientId
    }]
  };

  // Name
  if (record['Patient Name']) {
    patient.name = [{
      text: record['Patient Name']
    }];
  }

  // Contact
  const telecom = [];
  if (record['Phone Number']) {
    telecom.push({
      system: 'phone',
      value: record['Phone Number']
    });
  }
  if (record['Email']) {
    telecom.push({
      system: 'email',
      value: record['Email']
    });
  }
  if (telecom.length > 0) {
    patient.telecom = telecom;
  }

  // Address
  if (record['Address']) {
    patient.address = [{
      text: record['Address']
    }];
  }

  // Demographics
  if (record['Date of Birth']) {
    patient.birthDate = record['Date of Birth'];
  }

  if (record['Gender'] || record['Sex']) {
    const gender = (record['Gender'] || record['Sex']).toLowerCase();
    if (gender === 'm' || gender === 'male') {
      patient.gender = 'male';
    } else if (gender === 'f' || gender === 'female') {
      patient.gender = 'female';
    } else {
      patient.gender = 'other';
    }
  }

  // Extension for additional demographics
  const extensions = [];
  if (record['Country']) {
    extensions.push({
      url: 'http://hl7.org/fhir/StructureDefinition/patient-nationality',
      valueCodeableConcept: {
        coding: [{
          system: 'urn:iso:std:iso:3166',
          code: getCountryCode(record['Country']),
          display: record['Country']
        }]
      }
    });
  }
  if (record['Occupation'] || record['Job']) {
    extensions.push({
      url: 'http://hl7.org/fhir/StructureDefinition/patient-occupation',
      valueString: record['Occupation'] || record['Job']
    });
  }
  if (record['Marital Status']) {
    extensions.push({
      url: 'http://hl7.org/fhir/StructureDefinition/patient-maritalStatus',
      valueCodeableConcept: {
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v3-MaritalStatus',
          code: record['Marital Status'].toLowerCase().replace(' ', '-'),
          display: record['Marital Status']
        }]
      }
    });
  }
  if (extensions.length > 0) {
    patient.extension = extensions;
  }

  return patient;
}

/**
 * Create Coverage resource (Domain 1)
 */
function createCoverageResource(record, patientId, coverageId) {
  return {
    resourceType: 'Coverage',
    id: coverageId,
    identifier: record['Coverage ID'] ? [{
      value: record['Coverage ID']
    }] : undefined,
    status: record['Coverage Status'] || 'active',
    type: record['Insurance Type'] ? {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: record['Insurance Type'].toLowerCase().replace(' ', '-'),
        display: record['Insurance Type']
      }]
    } : undefined,
    subscriber: {
      reference: `Patient/${patientId}`
    },
    beneficiary: {
      reference: `Patient/${patientId}`
    },
    period: (record['Coverage Start'] || record['Coverage End']) ? {
      start: record['Coverage Start'] || undefined,
      end: record['Coverage End'] || undefined
    } : undefined,
    payor: record['Payor Name'] ? [{
      display: record['Payor Name']
    }] : undefined
  };
}

/**
 * Create Encounter resource (Domain 2)
 */
function createEncounterResource(record, patientId, encounterId) {
  const encounter = {
    resourceType: 'Encounter',
    id: encounterId,
    status: record['Encounter Status'] || 'finished',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: mapEncounterClass(record['Encounter Class'] || record['Encounter Type']),
      display: record['Encounter Class'] || record['Encounter Type'] || 'outpatient'
    },
    subject: {
      reference: `Patient/${patientId}`
    }
  };

  // Type
  if (record['Encounter Type'] || record['Encounter Type Code']) {
    encounter.type = [{
      coding: [{
        system: record['Encounter Type Code'] ? 'http://snomed.info/sct' : undefined,
        code: record['Encounter Type Code'] || undefined,
        display: record['Encounter Type']
      }]
    }];
  }

  // Period
  if (record['Encounter Date'] || record['Admission Date'] || record['Discharge Date']) {
    encounter.period = {};
    if (record['Admission Date']) {
      encounter.period.start = record['Admission Date'];
    } else if (record['Encounter Date']) {
      encounter.period.start = record['Encounter Date'];
    }
    if (record['Discharge Date']) {
      encounter.period.end = record['Discharge Date'];
    } else if (record['Encounter Date']) {
      encounter.period.end = record['Encounter Date'];
    }
  }

  // Location
  if (record['Department'] || record['Department Code']) {
    encounter.location = [{
      location: {
        display: record['Department']
      }
    }];
  }

  // Reason
  if (record['Encounter Reason'] || record['Encounter Reason Code']) {
    encounter.reasonCode = [{
      coding: [{
        system: record['Encounter Reason Code'] ? 'http://snomed.info/sct' : undefined,
        code: record['Encounter Reason Code'] || undefined,
        display: record['Encounter Reason']
      }]
    }];
  }

  return encounter;
}

/**
 * Create Condition resource (Domain 3)
 */
function createConditionResource(record, patientId, encounterId, conditionId) {
  const condition = {
    resourceType: 'Condition',
    id: conditionId,
    subject: {
      reference: `Patient/${patientId}`
    },
    status: mapConditionStatus(record['Condition Status'] || 'active')
  };

  // Coding
  const codings = [];
  if (record['Condition Code ICD10']) {
    codings.push({
      system: 'http://hl7.org/fhir/sid/icd-10',
      code: record['Condition Code ICD10'],
      display: record['Condition Name']
    });
  }
  if (record['Condition Code SNOMED']) {
    codings.push({
      system: 'http://snomed.info/sct',
      code: record['Condition Code SNOMED'],
      display: record['Condition Name']
    });
  }
  if (codings.length > 0) {
    condition.code = {
      coding: codings,
      text: record['Condition Name']
    };
  } else if (record['Condition Name']) {
    condition.code = {
      text: record['Condition Name']
    };
  }

  // Onset
  if (record['Diagnosis Date'] || record['Onset Date']) {
    condition.onsetDateTime = record['Diagnosis Date'] || record['Onset Date'];
  }

  // Abatement
  if (record['Abatement Date'] || record['Resolution Date']) {
    condition.abatementDateTime = record['Abatement Date'] || record['Resolution Date'];
  }

  // Severity
  if (record['Severity'] || record['Condition Severity']) {
    condition.severity = {
      coding: [{
        system: 'http://snomed.info/sct',
        code: mapSeverityCode(record['Severity'] || record['Condition Severity']),
        display: record['Severity'] || record['Condition Severity']
      }]
    };
  }

  // Body site
  if (record['Body Site'] || record['Body Site Code']) {
    condition.bodySite = [{
      coding: [{
        system: record['Body Site Code'] ? 'http://snomed.info/sct' : undefined,
        code: record['Body Site Code'] || undefined,
        display: record['Body Site']
      }]
    }];
  }

  // Context (Encounter)
  if (encounterId) {
    condition.context = {
      reference: `Encounter/${encounterId}`
    };
  }

  // Category
  condition.category = [{
    coding: [{
      system: 'http://terminology.hl7.org/CodeSystem/condition-category',
      code: record['Condition Category'] || 'encounter-diagnosis',
      display: record['Condition Category'] || 'Encounter Diagnosis'
    }]
  }];

  return condition;
}

/**
 * Create AllergyIntolerance resource (Domain 3)
 */
function createAllergyResource(record, patientId, allergyId) {
  return {
    resourceType: 'AllergyIntolerance',
    id: allergyId,
    patient: {
      reference: `Patient/${patientId}`
    },
    type: 'allergy',
    category: ['medication', 'food', 'environment', 'biologic'].filter(cat => 
      record['Allergy Category']?.toLowerCase().includes(cat)
    ),
    criticality: mapAllergyCriticality(record['Allergy Criticality'] || 'low'),
    code: {
      coding: [{
        system: record['Allergy Substance Code'] ? 'http://snomed.info/sct' : 'http://www.nlm.nih.gov/research/umls/rxnorm',
        code: record['Allergy Substance Code'] || undefined,
        display: record['Allergy Substance']
      }]
    },
    reaction: record['Allergy Reaction'] ? [{
      manifestation: [{
        coding: [{
          system: 'http://snomed.info/sct',
          display: record['Allergy Reaction']
        }]
      }]
    }] : undefined,
    onsetDateTime: record['Allergy Onset Date'] || undefined
  };
}

/**
 * Create Observation resource (Domain 4: Lab Tests, Domain 8: Vitals)
 */
function createObservationResource(record, patientId, encounterId, observationId) {
  const observation = {
    resourceType: 'Observation',
    id: observationId,
    status: 'final',
    subject: {
      reference: `Patient/${patientId}`
    }
  };

  // Code
  const codings = [];
  if (record['Observation Code LOINC']) {
    codings.push({
      system: 'http://loinc.org',
      code: record['Observation Code LOINC'],
      display: record['Observation Name'] || record['Lab Test']
    });
  }
  if (record['Observation Code SNOMED']) {
    codings.push({
      system: 'http://snomed.info/sct',
      code: record['Observation Code SNOMED'],
      display: record['Observation Name'] || record['Lab Test']
    });
  }
  if (codings.length > 0) {
    observation.code = {
      coding: codings,
      text: record['Observation Name'] || record['Lab Test']
    };
  } else if (record['Observation Name'] || record['Lab Test']) {
    observation.code = {
      text: record['Observation Name'] || record['Lab Test']
    };
  }

  // Category
  observation.category = [{
    coding: [{
      system: 'http://terminology.hl7.org/CodeSystem/observation-category',
      code: record['Observation Category'] || 'laboratory',
      display: record['Observation Category'] || 'Laboratory'
    }]
  }];

  // Effective date
  if (record['Observation Date'] || record['Test Date']) {
    observation.effectiveDateTime = record['Observation Date'] || record['Test Date'];
  }

  // Value
  if (record['Observation Value'] || record['Result']) {
    const value = record['Observation Value'] || record['Result'];
    const unit = record['Observation Unit'] || record['Unit'];
    
    if (!isNaN(parseFloat(value))) {
      observation.valueQuantity = {
        value: parseFloat(value),
        unit: unit || '',
        system: 'http://unitsofmeasure.org',
        code: unit || ''
      };
    } else {
      observation.valueString = value;
    }
  }

  // Reference range
  if (record['Reference Range Low'] || record['Reference Range High'] || record['Reference Range']) {
    observation.referenceRange = [{
      low: record['Reference Range Low'] ? {
        value: parseFloat(record['Reference Range Low']),
        unit: record['Observation Unit'] || record['Unit'] || ''
      } : undefined,
      high: record['Reference Range High'] ? {
        value: parseFloat(record['Reference Range High']),
        unit: record['Observation Unit'] || record['Unit'] || ''
      } : parseReferenceRange(record['Reference Range'], record['Observation Unit'] || record['Unit']),
      text: record['Reference Range']
    }];
  }

  // Interpretation
  if (record['Interpretation'] || record['Result Interpretation']) {
    observation.interpretation = [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
        code: mapInterpretationCode(record['Interpretation'] || record['Result Interpretation']),
        display: record['Interpretation'] || record['Result Interpretation']
      }]
    }];
  }

  // Context (Encounter)
  if (encounterId) {
    observation.context = {
      reference: `Encounter/${encounterId}`
    };
  }

  return observation;
}

/**
 * Create Vital Sign Observation (Domain 8)
 */
function createVitalSignObservation(record, patientId, encounterId, vitalId) {
  const vital = createObservationResource(record, patientId, encounterId, vitalId);
  vital.id = vitalId;
  vital.category = [{
    coding: [{
      system: 'http://terminology.hl7.org/CodeSystem/observation-category',
      code: 'vital-signs',
      display: 'Vital Signs'
    }]
  }];

  // Map vital sign type to LOINC code
  if (record['Vital Sign Type']) {
    const loincCode = getVitalSignLOINC(record['Vital Sign Type']);
    if (loincCode) {
      vital.code = {
        coding: [{
          system: 'http://loinc.org',
          code: loincCode,
          display: record['Vital Sign Type']
        }],
        text: record['Vital Sign Type']
      };
    }
  }

  // Use vital sign specific fields
  if (record['Vital Sign Value']) {
    const value = record['Vital Sign Value'];
    const unit = record['Vital Sign Unit'];
    
    if (!isNaN(parseFloat(value))) {
      vital.valueQuantity = {
        value: parseFloat(value),
        unit: unit || '',
        system: 'http://unitsofmeasure.org',
        code: unit || ''
      };
    } else {
      vital.valueString = value;
    }
  }

  if (record['Vital Sign Date']) {
    vital.effectiveDateTime = record['Vital Sign Date'];
  }

  return vital;
}

/**
 * Create SDOH Observation (Domain 9)
 */
function createSDOHObservation(record, patientId, sdohId) {
  const sdoh = {
    resourceType: 'Observation',
    id: sdohId,
    status: 'final',
    category: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/observation-category',
        code: 'social-history',
        display: 'Social History'
      }]
    }],
    code: {
      coding: [{
        system: 'http://loinc.org',
        code: getSDOHLOINC(record['SDOH Category']),
        display: record['SDOH Category']
      }],
      text: record['SDOH Category']
    },
    subject: {
      reference: `Patient/${patientId}`
    },
    valueString: record['SDOH Value'] || undefined,
    effectiveDateTime: record['SDOH Date'] || undefined
  };

  return sdoh;
}

/**
 * Create MedicationRequest resource (Domain 5)
 */
function createMedicationRequestResource(record, patientId, encounterId, medicationId) {
  const medication = {
    resourceType: 'MedicationRequest',
    id: medicationId,
    status: mapMedicationStatus(record['Medication Status'] || 'active'),
    intent: 'order',
    subject: {
      reference: `Patient/${patientId}`
    }
  };

  // Medication
  const codings = [];
  if (record['Medication Code RxNorm']) {
    codings.push({
      system: 'http://www.nlm.nih.gov/research/umls/rxnorm',
      code: record['Medication Code RxNorm'],
      display: record['Medication Name']
    });
  }
  if (record['Medication Code ATC']) {
    codings.push({
      system: 'http://www.whocc.no/atc',
      code: record['Medication Code ATC'],
      display: record['Medication Name']
    });
  }
  if (codings.length > 0) {
    medication.medicationCodeableConcept = {
      coding: codings,
      text: record['Medication Name']
    };
  } else if (record['Medication Name']) {
    medication.medicationCodeableConcept = {
      text: record['Medication Name']
    };
  }

  // Dosage
  if (record['Medication Dosage'] || record['Dosage']) {
    medication.dosageInstruction = [{
      text: record['Medication Dosage'] || record['Dosage']
    }];
  }

  // Authored on
  if (record['Prescription Date'] || record['Medication Date']) {
    medication.authoredOn = record['Prescription Date'] || record['Medication Date'];
  }

  // Context (Encounter)
  if (encounterId) {
    medication.context = {
      reference: `Encounter/${encounterId}`
    };
  }

  return medication;
}

/**
 * Create Procedure resource (Domain 6)
 */
function createProcedureResource(record, patientId, encounterId, procedureId) {
  const procedure = {
    resourceType: 'Procedure',
    id: procedureId,
    status: mapProcedureStatus(record['Procedure Status'] || 'completed'),
    subject: {
      reference: `Patient/${patientId}`
    }
  };

  // Code
  const codings = [];
  if (record['Procedure Code CPT']) {
    codings.push({
      system: 'http://www.ama-assn.org/go/cpt',
      code: record['Procedure Code CPT'],
      display: record['Procedure Name']
    });
  }
  if (record['Procedure Code SNOMED']) {
    codings.push({
      system: 'http://snomed.info/sct',
      code: record['Procedure Code SNOMED'],
      display: record['Procedure Name']
    });
  }
  if (record['Procedure Code ICD10PCS']) {
    codings.push({
      system: 'http://www.cms.gov/Medicare/Coding/ICD10',
      code: record['Procedure Code ICD10PCS'],
      display: record['Procedure Name']
    });
  }
  if (codings.length > 0) {
    procedure.code = {
      coding: codings,
      text: record['Procedure Name']
    };
  } else if (record['Procedure Name']) {
    procedure.code = {
      text: record['Procedure Name']
    };
  }

  // Performed date
  if (record['Procedure Date']) {
    procedure.performedDateTime = record['Procedure Date'];
  }

  // Body site
  if (record['Procedure Body Site'] || record['Body Site']) {
    procedure.bodySite = [{
      coding: [{
        system: 'http://snomed.info/sct',
        display: record['Procedure Body Site'] || record['Body Site']
      }]
    }];
  }

  // Outcome
  if (record['Procedure Outcome']) {
    procedure.outcome = {
      coding: [{
        system: 'http://snomed.info/sct',
        display: record['Procedure Outcome']
      }]
    };
  }

  // Context (Encounter)
  if (encounterId) {
    procedure.context = {
      reference: `Encounter/${encounterId}`
    };
  }

  return procedure;
}

/**
 * Create ImagingStudy resource (Domain 7)
 */
function createImagingStudyResource(record, patientId, encounterId, imagingId) {
  const imaging = {
    resourceType: 'ImagingStudy',
    id: imagingId,
    status: 'available',
    subject: {
      reference: `Patient/${patientId}`
    }
  };

  // Modality
  if (record['Imaging Modality'] || record['Imaging Study Type']) {
    imaging.modality = [{
      system: 'http://dicom.nema.org/resources/ontology/DCM',
      code: mapImagingModality(record['Imaging Modality'] || record['Imaging Study Type']),
      display: record['Imaging Modality'] || record['Imaging Study Type']
    }];
  }

  // Started
  if (record['Imaging Date'] || record['Study Date']) {
    imaging.started = record['Imaging Date'] || record['Study Date'];
  }

  // Series
  if (record['Series Count'] || record['Image Count']) {
    imaging.numberOfSeries = parseInt(record['Series Count'] || record['Image Count'] || '1');
  }

  // Context (Encounter)
  if (encounterId) {
    imaging.encounter = {
      reference: `Encounter/${encounterId}`
    };
  }

  return imaging;
}

// ============================================
// Helper Functions
// ============================================

function mapEncounterClass(encounterType) {
  const type = (encounterType || '').toLowerCase();
  if (type.includes('inpatient') || type.includes('admission')) return 'IMP';
  if (type.includes('emergency') || type.includes('er')) return 'EMER';
  if (type.includes('outpatient') || type.includes('clinic')) return 'AMB';
  if (type.includes('virtual') || type.includes('tele')) return 'VR';
  return 'AMB'; // Default to ambulatory
}

function mapConditionStatus(status) {
  const s = (status || 'active').toLowerCase();
  if (s.includes('resolved') || s.includes('remission')) return 'resolved';
  if (s.includes('inactive')) return 'inactive';
  if (s.includes('recurrence') || s.includes('relapse')) return 'recurrence';
  return 'active';
}

function mapSeverityCode(severity) {
  const s = (severity || '').toLowerCase();
  if (s.includes('mild')) return '255604002';
  if (s.includes('moderate')) return '6736007';
  if (s.includes('severe')) return '24484000';
  return '255604002'; // Default to mild
}

function mapAllergyCriticality(criticality) {
  const c = (criticality || 'low').toLowerCase();
  if (c.includes('high') || c.includes('severe')) return 'high';
  if (c.includes('unable')) return 'unable-to-assess';
  return 'low';
}

function mapInterpretationCode(interpretation) {
  const i = (interpretation || '').toLowerCase();
  if (i.includes('high') || i.includes('elevated')) return 'H';
  if (i.includes('low') || i.includes('decreased')) return 'L';
  if (i.includes('normal')) return 'N';
  if (i.includes('critical')) return 'LL';
  return 'N';
}

function mapMedicationStatus(status) {
  const s = (status || 'active').toLowerCase();
  if (s.includes('completed') || s.includes('finished')) return 'completed';
  if (s.includes('stopped') || s.includes('cancelled')) return 'stopped';
  if (s.includes('draft')) return 'draft';
  return 'active';
}

function mapProcedureStatus(status) {
  const s = (status || 'completed').toLowerCase();
  if (s.includes('completed') || s.includes('finished')) return 'completed';
  if (s.includes('in-progress') || s.includes('ongoing')) return 'in-progress';
  if (s.includes('cancelled')) return 'cancelled';
  return 'completed';
}

function mapImagingModality(modality) {
  const m = (modality || '').toLowerCase();
  if (m.includes('ct') || m.includes('computed tomography')) return 'CT';
  if (m.includes('mri') || m.includes('magnetic resonance')) return 'MR';
  if (m.includes('x-ray') || m.includes('xray') || m.includes('radiograph')) return 'DX';
  if (m.includes('ultrasound') || m.includes('us')) return 'US';
  if (m.includes('pet')) return 'PT';
  return 'DX'; // Default to X-ray
}

function getCountryCode(country) {
  const countryMap = {
    'uganda': 'UG',
    'kenya': 'KE',
    'tanzania': 'TZ',
    'rwanda': 'RW',
    'ghana': 'GH',
    'nigeria': 'NG',
    'south africa': 'ZA',
    'ethiopia': 'ET',
    'zimbabwe': 'ZW',
    'zambia': 'ZM'
  };
  return countryMap[country.toLowerCase()] || 'UG';
}

function getVitalSignLOINC(vitalType) {
  const vitalMap = {
    'blood pressure': '85354-9',
    'bp systolic': '8480-6',
    'bp diastolic': '8462-4',
    'heart rate': '8867-4',
    'temperature': '8310-5',
    'respiratory rate': '9279-1',
    'oxygen saturation': '2708-6',
    'weight': '29463-7',
    'height': '8302-2',
    'bmi': '39156-5'
  };
  const normalized = vitalType.toLowerCase();
  for (const [key, code] of Object.entries(vitalMap)) {
    if (normalized.includes(key)) {
      return code;
    }
  }
  return '8716-3'; // Default vital sign
}

function getSDOHLOINC(category) {
  const sdohMap = {
    'housing': '71802-3',
    'food security': '88124-3',
    'transportation': '76513-1',
    'utilities': '76514-9',
    'safety': '76515-6',
    'education': '82589-3',
    'employment': '76516-4',
    'income': '76517-2',
    'insurance': '82810-3',
    'social support': '76518-0'
  };
  const normalized = (category || '').toLowerCase();
  for (const [key, code] of Object.entries(sdohMap)) {
    if (normalized.includes(key)) {
      return code;
    }
  }
  return '76519-8'; // Default SDOH
}

function parseReferenceRange(rangeStr, unit) {
  if (!rangeStr) return undefined;
  
  if (rangeStr.includes('<')) {
    const max = parseFloat(rangeStr.replace('<', '').trim());
    if (!isNaN(max)) {
      return {
        value: max,
        unit: unit || '',
        system: 'http://unitsofmeasure.org'
      };
    }
  } else if (rangeStr.includes('-')) {
    const parts = rangeStr.split('-').map(s => s.trim());
    const high = parseFloat(parts[1] || parts[0]);
    if (!isNaN(high)) {
      return {
        value: high,
        unit: unit || '',
        system: 'http://unitsofmeasure.org'
      };
    }
  }
  
  return undefined;
}

