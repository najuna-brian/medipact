/**
 * Complete FHIR R4 Database Schema
 * 
 * Comprehensive schema supporting ALL FHIR R4 resources as specified in
 * the health informatics standards for medical data marketplaces.
 * 
 * This schema supports:
 * - All 10 core data domains
 * - Standard coding systems (ICD-10, SNOMED CT, LOINC, RxNorm, CPT)
 * - Complete patient demographics
 * - Clinical data warehouse structure
 * - Full audit trails
 */

/**
 * Domain 1: Patient Identity & Demographics
 * FHIR Resources: Patient, RelatedPerson, Coverage
 */
export const PatientSchema = `
-- Enhanced FHIR Patients Table (Domain 1)
CREATE TABLE IF NOT EXISTS fhir_patients (
  id SERIAL PRIMARY KEY,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Demographics (Anonymized)
  country VARCHAR(100) NOT NULL,
  region VARCHAR(255),
  district VARCHAR(255),
  "ageRange" VARCHAR(20), -- "35-39"
  gender VARCHAR(20), -- Male, Female, Other, Unknown
  race VARCHAR(100),
  ethnicity VARCHAR(100),
  "maritalStatus" VARCHAR(50),
  language VARCHAR(50),
  "occupationCategory" VARCHAR(100),
  
  -- Administrative
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_patients_anonymous_id ON fhir_patients("anonymousPatientId");
CREATE INDEX idx_fhir_patients_upi ON fhir_patients(upi);
CREATE INDEX idx_fhir_patients_country ON fhir_patients(country);
CREATE INDEX idx_fhir_patients_region ON fhir_patients(region);
CREATE INDEX idx_fhir_patients_age_range ON fhir_patients("ageRange");
CREATE INDEX idx_fhir_patients_gender ON fhir_patients(gender);
CREATE INDEX idx_fhir_patients_hospital ON fhir_patients("hospitalId");

-- Related Persons (Emergency contacts, guardians)
CREATE TABLE IF NOT EXISTS fhir_related_persons (
  id SERIAL PRIMARY KEY,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  "relationshipCode" TEXT, -- SNOMED: mother, father, guardian, etc.
  "relationshipDisplay" TEXT,
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi)
);

-- Coverage (Insurance/Payer)
CREATE TABLE IF NOT EXISTS fhir_coverage (
  id SERIAL PRIMARY KEY,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  "coverageId" TEXT,
  status TEXT, -- active, cancelled, draft
  "typeCode" TEXT, -- Insurance type code
  "typeDisplay" TEXT,
  "subscriberId" TEXT,
  "beneficiaryId" TEXT,
  "periodStart" DATE,
  "periodEnd" DATE,
  "payorId" TEXT,
  "payorName" TEXT,
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi)
);
`;

/**
 * Domain 2: Encounters / Visits
 * FHIR Resource: Encounter
 */
export const EncounterSchema = `
CREATE TABLE IF NOT EXISTS fhir_encounters (
  id SERIAL PRIMARY KEY,
  "encounterId" TEXT NOT NULL,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Encounter Details
  "encounterClass" TEXT, -- inpatient, outpatient, emergency, virtual, ambulatory
  "encounterTypeCode" TEXT, -- SNOMED: consultation, follow-up, surgery, triage
  "encounterTypeDisplay" TEXT,
  status TEXT, -- planned, arrived, triaged, in-progress, onleave, finished, cancelled
  
  -- Location & Organization
  "facilityId" TEXT,
  "facilityName" TEXT,
  "departmentCode" TEXT,
  "departmentName" TEXT,
  "locationId" TEXT,
  "locationName" TEXT,
  "bedId" TEXT,
  "roomNumber" TEXT,
  
  -- Timing
  "admissionDate" TIMESTAMP,
  "dischargeDate" TIMESTAMP,
  "periodStart" TIMESTAMP,
  "periodEnd" TIMESTAMP,
  
  -- Clinical
  "reasonCode" TEXT, -- ICD-10 or SNOMED
  "reasonDisplay" TEXT,
  "diagnosisCode" TEXT, -- Primary diagnosis
  "diagnosisDisplay" TEXT,
  
  -- Providers
  "attendingPractitionerId" TEXT,
  "attendingPractitionerName" TEXT,
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_encounters_patient ON fhir_encounters("anonymousPatientId");
CREATE INDEX idx_fhir_encounters_upi ON fhir_encounters(upi);
CREATE INDEX idx_fhir_encounters_class ON fhir_encounters("encounterClass");
CREATE INDEX idx_fhir_encounters_type ON fhir_encounters("encounterTypeCode");
CREATE INDEX idx_fhir_encounters_admission ON fhir_encounters("admissionDate");
CREATE INDEX idx_fhir_encounters_discharge ON fhir_encounters("dischargeDate");
CREATE INDEX idx_fhir_encounters_hospital ON fhir_encounters("hospitalId");
`;

/**
 * Domain 3: Diagnoses & Clinical Problems
 * FHIR Resources: Condition, AllergyIntolerance
 */
export const ConditionSchema = `
-- Enhanced Conditions Table
CREATE TABLE IF NOT EXISTS fhir_conditions (
  id SERIAL PRIMARY KEY,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Coding (Multiple coding systems)
  "conditionCodeIcd10" TEXT, -- ICD-10 code (e.g., E11)
  "conditionCodeSnomed" TEXT, -- SNOMED CT code (preferred)
  "conditionName" TEXT NOT NULL,
  
  -- Clinical Details
  "bodySiteCode" TEXT, -- SNOMED body site
  "bodySiteDisplay" TEXT,
  "stageCode" TEXT, -- For cancers
  "stageDisplay" TEXT,
  "severityCode" TEXT,
  "severityDisplay" TEXT,
  
  -- Timing
  "onsetDate" DATE,
  "diagnosisDate" DATE,
  "abatementDate" DATE, -- Resolution date
  
  -- Classification
  "diagnosisRole" TEXT, -- primary, secondary, billing
  "categoryCode" TEXT, -- problem-list-item, encounter-diagnosis
  "categoryDisplay" TEXT,
  status TEXT, -- active, recurrence, relapse, inactive, remission, resolved
  
  -- Context
  "encounterId" TEXT, -- Link to encounter
  "encounterIdRef" INTEGER REFERENCES fhir_encounters(id),
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_conditions_patient ON fhir_conditions("anonymousPatientId");
CREATE INDEX idx_fhir_conditions_upi ON fhir_conditions(upi);
CREATE INDEX IF NOT EXISTS idx_fhir_conditions_code ON fhir_conditions("conditionCodeSnomed");
CREATE INDEX idx_fhir_conditions_name ON fhir_conditions("conditionName");
CREATE INDEX idx_fhir_conditions_diagnosis_date ON fhir_conditions("diagnosisDate");
CREATE INDEX idx_fhir_conditions_status ON fhir_conditions(status);
CREATE INDEX idx_fhir_conditions_hospital ON fhir_conditions("hospitalId");

-- Allergies
CREATE TABLE IF NOT EXISTS fhir_allergies (
  id SERIAL PRIMARY KEY,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Substance
  "substanceCode" TEXT, -- SNOMED or RxNorm
  "substanceDisplay" TEXT,
  
  -- Reaction
  "reactionTypeCode" TEXT, -- SNOMED reaction type
  "reactionTypeDisplay" TEXT,
  "reactionManifestationCode" TEXT,
  "reactionManifestationDisplay" TEXT,
  
  -- Severity & Certainty
  severity TEXT, -- mild, moderate, severe
  certainty TEXT, -- confirmed, suspected, unlikely
  
  -- Timing
  "onsetDate" DATE,
  "lastOccurrenceDate" DATE,
  
  -- Clinical
  criticality TEXT, -- low, high, unable-to-assess
  status TEXT, -- active, inactive, resolved
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_allergies_patient ON fhir_allergies("anonymousPatientId");
CREATE INDEX idx_fhir_allergies_substance ON fhir_allergies("substanceCode");
CREATE INDEX idx_fhir_allergies_severity ON fhir_allergies(severity);
`;

/**
 * Domain 4: Laboratory Tests, Results & Measurements
 * FHIR Resources: Observation, DiagnosticReport, Specimen
 */
export const ObservationSchema = `
-- Enhanced Observations Table
CREATE TABLE IF NOT EXISTS fhir_observations (
  id SERIAL PRIMARY KEY,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Coding
  "observationCodeLoinc" TEXT NOT NULL, -- LOINC code (e.g., 4548-4)
  "observationName" TEXT NOT NULL,
  "categoryCode" TEXT, -- vital-signs, laboratory, imaging, etc.
  "categoryDisplay" TEXT,
  
  -- Value
  "valueQuantity" TEXT,
  "valueUnit" TEXT,
  "valueString" TEXT,
  "valueCodeableConceptCode" TEXT,
  "valueCodeableConceptDisplay" TEXT,
  
  -- Reference Range
  "referenceRangeLow" TEXT,
  "referenceRangeHigh" TEXT,
  "referenceRangeText" TEXT,
  
  -- Interpretation
  "interpretationCode" TEXT,
  "interpretationDisplay" TEXT, -- High, Normal, Low, Critical
  
  -- Timing
  "effectiveDate" TIMESTAMP NOT NULL,
  "effectivePeriodStart" TIMESTAMP,
  "effectivePeriodEnd" TIMESTAMP,
  
  -- Context
  "encounterId" TEXT,
  "encounterIdRef" INTEGER REFERENCES fhir_encounters(id),
  
  -- Performer
  "performerId" TEXT,
  "performerName" TEXT,
  "performerType" TEXT, -- Practitioner, Organization, Device
  
  -- Method & Device
  "methodCode" TEXT,
  "methodDisplay" TEXT,
  "deviceCode" TEXT,
  "deviceDisplay" TEXT,
  
  -- Specimen
  "specimenId" TEXT,
  "specimenIdRef" INTEGER REFERENCES fhir_specimens(id),
  
  -- Diagnostic Report Link
  "diagnosticReportId" INTEGER REFERENCES fhir_diagnostic_reports(id),
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_observations_patient ON fhir_observations("anonymousPatientId");
CREATE INDEX idx_fhir_observations_upi ON fhir_observations(upi);
CREATE INDEX IF NOT EXISTS idx_fhir_observations_code ON fhir_observations("observationCodeLoinc");
CREATE INDEX idx_fhir_observations_name ON fhir_observations("observationName");
CREATE INDEX idx_fhir_observations_effective_date ON fhir_observations("effectiveDate");
CREATE INDEX idx_fhir_observations_hospital ON fhir_observations("hospitalId");

-- Observation Components (for panels like CBC)
CREATE TABLE IF NOT EXISTS fhir_observation_components (
  id SERIAL PRIMARY KEY,
  "observationId" INTEGER NOT NULL REFERENCES fhir_observations(id),
  "componentCodeLoinc" TEXT,
  "componentName" TEXT,
  "valueQuantity" TEXT,
  "valueUnit" TEXT,
  "referenceRangeLow" TEXT,
  "referenceRangeHigh" TEXT,
  "interpretationCode" TEXT,
  "interpretationDisplay" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Specimens
CREATE TABLE IF NOT EXISTS fhir_specimens (
  id SERIAL PRIMARY KEY,
  "specimenId" TEXT NOT NULL,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Specimen Type
  "typeCode" TEXT, -- SNOMED: blood, serum, urine, sputum, etc.
  "typeDisplay" TEXT,
  
  -- Collection
  "collectionMethodCode" TEXT,
  "collectionMethodDisplay" TEXT,
  "collectionDate" TIMESTAMP,
  "collectorId" TEXT,
  "collectorName" TEXT,
  
  -- Container
  "containerId" TEXT,
  "containerTypeCode" TEXT,
  "containerTypeDisplay" TEXT,
  
  -- Handling
  "receivedDate" TIMESTAMP,
  "processingDate" TIMESTAMP,
  "conditionCode" TEXT, -- satisfactory, unsatisfactory, etc.
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

-- Diagnostic Reports
CREATE TABLE IF NOT EXISTS fhir_diagnostic_reports (
  id SERIAL PRIMARY KEY,
  "reportId" TEXT NOT NULL,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Report Details
  "reportCodeLoinc" TEXT, -- Panel code
  "reportName" TEXT,
  status TEXT, -- registered, partial, preliminary, final, corrected, cancelled
  
  -- Category
  "categoryCode" TEXT,
  "categoryDisplay" TEXT,
  
  -- Timing
  "effectiveDate" TIMESTAMP NOT NULL,
  "issuedDate" TIMESTAMP,
  
  -- Performer
  "performerId" TEXT,
  "performerName" TEXT,
  "performerType" TEXT,
  
  -- Results
  conclusion TEXT, -- Narrative summary
  "conclusionCode" TEXT, -- Coded conclusion
  
  -- Context
  "encounterId" TEXT,
  "encounterIdRef" INTEGER REFERENCES fhir_encounters(id),
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_diagnostic_reports_patient ON fhir_diagnostic_reports("anonymousPatientId");
CREATE INDEX idx_fhir_diagnostic_reports_loinc ON fhir_diagnostic_reports("reportCodeLoinc");
CREATE INDEX idx_fhir_diagnostic_reports_effective_date ON fhir_diagnostic_reports("effectiveDate");
`;

/**
 * Domain 5: Medications & Treatment Data
 * FHIR Resources: MedicationRequest, MedicationAdministration, MedicationStatement
 */
export const MedicationSchema = `
-- Medication Requests (Prescriptions)
CREATE TABLE IF NOT EXISTS fhir_medication_requests (
  id SERIAL PRIMARY KEY,
  "medicationRequestId" TEXT NOT NULL,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Medication
  "medicationCodeRxnorm" TEXT, -- RxNorm code
  "medicationName" TEXT NOT NULL,
  "atcCode" TEXT, -- ATC therapeutic category
  "atcDisplay" TEXT,
  
  -- Dosage
  "dosageQuantity" TEXT,
  "dosageUnit" TEXT,
  "dosageText" TEXT, -- "10 mg"
  "frequencyCode" TEXT, -- q8h, once daily, etc.
  "frequencyText" TEXT,
  "routeCode" TEXT, -- SNOMED: oral, IV, IM, topical
  "routeDisplay" TEXT,
  
  -- Timing
  "startDate" DATE,
  "endDate" DATE,
  "expectedDuration" TEXT,
  
  -- Status
  status TEXT, -- active, completed, stopped, cancelled, entered-in-error
  intent TEXT, -- proposal, plan, order, original-order, reflex-order
  
  -- Prescriber
  "prescriberId" TEXT,
  "prescriberName" TEXT,
  "prescriberType" TEXT,
  
  -- Dispensing
  "dispenserId" TEXT,
  "dispenserName" TEXT,
  "dispenseQuantity" TEXT,
  "numberOfRepeats" INTEGER,
  
  -- Context
  "encounterId" TEXT,
  "encounterIdRef" INTEGER REFERENCES fhir_encounters(id),
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_medication_requests_patient ON fhir_medication_requests("anonymousPatientId");
CREATE INDEX idx_fhir_medication_requests_rxnorm ON fhir_medication_requests("medicationCodeRxnorm");
CREATE INDEX idx_fhir_medication_requests_atc ON fhir_medication_requests("atcCode");
CREATE INDEX idx_fhir_medication_requests_status ON fhir_medication_requests(status);
CREATE INDEX idx_fhir_medication_requests_start_date ON fhir_medication_requests("startDate");

-- Medication Administrations (Given by nurse)
CREATE TABLE IF NOT EXISTS fhir_medication_administrations (
  id SERIAL PRIMARY KEY,
  "medicationAdministrationId" TEXT NOT NULL,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Link to Request
  "medicationRequestId" INTEGER REFERENCES fhir_medication_requests(id),
  
  -- Medication
  "medicationCodeRxnorm" TEXT,
  "medicationName" TEXT,
  
  -- Administration
  "administeredDate" TIMESTAMP NOT NULL,
  "dosageQuantity" TEXT,
  "dosageUnit" TEXT,
  "routeCode" TEXT,
  "routeDisplay" TEXT,
  
  -- Performer
  "performerId" TEXT,
  "performerName" TEXT,
  "performerType" TEXT,
  
  -- Status
  status TEXT, -- in-progress, not-done, on-hold, completed, entered-in-error, stopped
  
  -- Context
  "encounterId" TEXT,
  "encounterIdRef" INTEGER REFERENCES fhir_encounters(id),
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

-- Medication Statements (Patient self-reported)
CREATE TABLE IF NOT EXISTS fhir_medication_statements (
  id SERIAL PRIMARY KEY,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Medication
  "medicationCodeRxnorm" TEXT,
  "medicationName" TEXT,
  
  -- Status
  status TEXT, -- active, completed, entered-in-error, intended, stopped, on-hold
  
  -- Timing
  "effectiveStartDate" DATE,
  "effectiveEndDate" DATE,
  
  -- Dosage
  "dosageText" TEXT,
  "frequencyText" TEXT,
  
  -- Source
  "informationSource" TEXT, -- patient, practitioner, etc.
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);
`;

/**
 * Domain 6: Procedures & Interventions
 * FHIR Resource: Procedure
 */
export const ProcedureSchema = `
CREATE TABLE IF NOT EXISTS fhir_procedures (
  id SERIAL PRIMARY KEY,
  "procedureId" TEXT NOT NULL,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Procedure Coding
  "procedureCodeSnomed" TEXT, -- SNOMED CT (preferred)
  "procedureCodeCpt" TEXT, -- CPT code
  "procedureCodeIcd10pcs" TEXT, -- ICD-10-PCS
  "procedureName" TEXT NOT NULL,
  
  -- Body Site
  "bodySiteCode" TEXT, -- SNOMED body site
  "bodySiteDisplay" TEXT,
  
  -- Technique
  "techniqueCode" TEXT,
  "techniqueDisplay" TEXT,
  
  -- Timing
  "performedDate" TIMESTAMP NOT NULL,
  "performedPeriodStart" TIMESTAMP,
  "performedPeriodEnd" TIMESTAMP,
  
  -- Status
  status TEXT, -- preparation, in-progress, not-done, on-hold, stopped, completed, entered-in-error, unknown
  
  -- Outcome
  "outcomeCode" TEXT,
  "outcomeDisplay" TEXT,
  "outcomeText" TEXT,
  
  -- Performer
  "performerId" TEXT,
  "performerName" TEXT,
  "performerRoleCode" TEXT, -- surgeon, assistant, etc.
  "performerRoleDisplay" TEXT,
  
  -- Device
  "deviceImplantedCode" TEXT,
  "deviceImplantedDisplay" TEXT,
  
  -- Context
  "encounterId" TEXT,
  "encounterIdRef" INTEGER REFERENCES fhir_encounters(id),
  "reasonCode" TEXT,
  "reasonDisplay" TEXT,
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_procedures_patient ON fhir_procedures("anonymousPatientId");
CREATE INDEX idx_fhir_procedures_snomed ON fhir_procedures("procedureCodeSnomed");
CREATE INDEX idx_fhir_procedures_cpt ON fhir_procedures("procedureCodeCpt");
CREATE INDEX idx_fhir_procedures_performed_date ON fhir_procedures("performedDate");
CREATE INDEX idx_fhir_procedures_status ON fhir_procedures(status);
`;

/**
 * Domain 7: Medical Imaging
 * FHIR Resources: ImagingStudy, Media
 */
export const ImagingSchema = `
CREATE TABLE IF NOT EXISTS fhir_imaging_studies (
  id SERIAL PRIMARY KEY,
  "studyId" TEXT NOT NULL,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Modality
  "modalityCode" TEXT, -- CT, MRI, XRAY, PET, US, etc.
  "modalityDisplay" TEXT,
  
  -- Body Site
  "bodySiteCode" TEXT,
  "bodySiteDisplay" TEXT,
  
  -- Study Details
  "studyDescription" TEXT,
  "seriesCount" INTEGER,
  "imageCount" INTEGER,
  
  -- Timing
  "startedDate" TIMESTAMP NOT NULL,
  "endedDate" TIMESTAMP,
  
  -- Performer
  "performerId" TEXT,
  "performerName" TEXT,
  "performerType" TEXT,
  
  -- Equipment
  "equipmentDeviceId" TEXT,
  "equipmentDeviceName" TEXT,
  "equipmentManufacturer" TEXT,
  "equipmentModel" TEXT,
  
  -- Report
  "reportText" TEXT, -- Radiologist report
  "reportId" TEXT,
  
  -- Context
  "encounterId" TEXT,
  "encounterIdRef" INTEGER REFERENCES fhir_encounters(id),
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_imaging_studies_patient ON fhir_imaging_studies("anonymousPatientId");
CREATE INDEX idx_fhir_imaging_studies_modality ON fhir_imaging_studies("modalityCode");
CREATE INDEX idx_fhir_imaging_studies_started_date ON fhir_imaging_studies("startedDate");
`;

/**
 * Domain 8: Vitals, Clinical Measurements & Monitoring
 * FHIR Resource: Observation (Vital Signs Profile)
 */
export const VitalsSchema = `
-- Vitals are stored in fhir_observations with category='vital-signs'
-- This table provides optimized access for common vitals
CREATE TABLE IF NOT EXISTS fhir_vital_signs (
  id SERIAL PRIMARY KEY,
  "observationId" INTEGER NOT NULL REFERENCES fhir_observations(id),
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Vital Type
  "vitalTypeCode" TEXT, -- heart-rate, blood-pressure, temperature, etc.
  "vitalTypeDisplay" TEXT,
  
  -- Value
  "valueQuantity" TEXT,
  "valueUnit" TEXT,
  
  -- For Blood Pressure (has components)
  "systolicValue" TEXT,
  "diastolicValue" TEXT,
  
  -- Timing
  "effectiveDate" TIMESTAMP NOT NULL,
  
  -- Context
  "encounterId" TEXT,
  "encounterIdRef" INTEGER REFERENCES fhir_encounters(id),
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_vital_signs_patient ON fhir_vital_signs("anonymousPatientId");
CREATE INDEX idx_fhir_vital_signs_type ON fhir_vital_signs("vitalTypeCode");
CREATE INDEX idx_fhir_vital_signs_effective_date ON fhir_vital_signs("effectiveDate");
`;

/**
 * Domain 9: Social Determinants of Health (SDOH)
 * FHIR Resources: Observation (SDOH profiles), Condition, QuestionnaireResponse
 */
export const SDOHSchema = `
CREATE TABLE IF NOT EXISTS fhir_sdoh (
  id SERIAL PRIMARY KEY,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Category
  "categoryCode" TEXT, -- housing, income, education, employment, lifestyle
  "categoryDisplay" TEXT,
  
  -- Specific SDOH
  "sdohCode" TEXT, -- LOINC or SNOMED
  "sdohDisplay" TEXT,
  
  -- Value
  "valueCode" TEXT,
  "valueDisplay" TEXT,
  "valueText" TEXT,
  
  -- Timing
  "effectiveDate" DATE,
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_sdoh_patient ON fhir_sdoh("anonymousPatientId");
CREATE INDEX idx_fhir_sdoh_category ON fhir_sdoh("categoryCode");
CREATE INDEX idx_fhir_sdoh_code ON fhir_sdoh("sdohCode");
`;

/**
 * Domain 10: Metadata, Audit Logs, Access Trails
 * FHIR Resources: Provenance, AuditEvent
 */
export const MetadataSchema = `
-- Provenance (Who created/modified resources)
CREATE TABLE IF NOT EXISTS fhir_provenance (
  id SERIAL PRIMARY KEY,
  "targetResourceType" TEXT NOT NULL, -- Patient, Condition, Observation, etc.
  "targetResourceId" INTEGER NOT NULL,
  "targetResourceFhirId" TEXT,
  
  -- Activity
  "activityCode" TEXT, -- create, update, delete, read
  "activityDisplay" TEXT,
  
  -- Agent (Who did it)
  "agentId" TEXT,
  "agentName" TEXT,
  "agentType" TEXT, -- Practitioner, Organization, Device, Patient
  "agentRoleCode" TEXT,
  "agentRoleDisplay" TEXT,
  
  -- When
  "occurredAt" TIMESTAMP NOT NULL,
  
  -- Why
  "reasonCode" TEXT,
  "reasonDisplay" TEXT,
  
  -- Signature
  "signatureType" TEXT,
  "signatureData" TEXT, -- Cryptographic signature
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_provenance_target ON fhir_provenance("targetResourceType", "targetResourceId");
CREATE INDEX idx_fhir_provenance_agent ON fhir_provenance("agentId");
CREATE INDEX idx_fhir_provenance_occurred ON fhir_provenance("occurredAt");

-- Audit Events (Access logs)
CREATE TABLE IF NOT EXISTS fhir_audit_events (
  id SERIAL PRIMARY KEY,
  "eventType" TEXT NOT NULL, -- read, write, delete, export, access
  "eventSubtype" TEXT,
  
  -- Agent (Who)
  "agentId" TEXT,
  "agentName" TEXT,
  "agentType" TEXT,
  "agentIpAddress" TEXT,
  "agentUserAgent" TEXT,
  
  -- Resource (What)
  "resourceType" TEXT,
  "resourceId" INTEGER,
  "resourceFhirId" TEXT,
  
  -- Outcome
  "outcomeCode" TEXT, -- success, failure, partial
  "outcomeDisplay" TEXT,
  "outcomeDescription" TEXT,
  
  -- When
  "occurredAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Purpose
  "purposeOfUseCode" TEXT,
  "purposeOfUseDisplay" TEXT,
  
  "hospitalId" VARCHAR(32) NOT NULL,
  
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_audit_events_type ON fhir_audit_events("eventType");
CREATE INDEX idx_fhir_audit_events_agent ON fhir_audit_events("agentId");
CREATE INDEX idx_fhir_audit_events_resource ON fhir_audit_events("resourceType", "resourceId");
CREATE INDEX idx_fhir_audit_events_occurred ON fhir_audit_events("occurredAt");
`;

/**
 * Additional FHIR Resources
 */
export const AdditionalResourcesSchema = `
-- Immunizations
CREATE TABLE IF NOT EXISTS fhir_immunizations (
  id SERIAL PRIMARY KEY,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  "vaccineCode" TEXT, -- CVX or SNOMED
  "vaccineDisplay" TEXT,
  
  status TEXT, -- completed, entered-in-error, not-done
  "occurrenceDate" DATE NOT NULL,
  
  "performerId" TEXT,
  "performerName" TEXT,
  
  "lotNumber" TEXT,
  "expirationDate" DATE,
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

-- Care Plans
CREATE TABLE IF NOT EXISTS fhir_care_plans (
  id SERIAL PRIMARY KEY,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  "carePlanId" TEXT,
  status TEXT, -- draft, active, on-hold, revoked, completed, entered-in-error
  intent TEXT, -- proposal, plan, order, option
  
  "categoryCode" TEXT,
  "categoryDisplay" TEXT,
  
  "periodStart" DATE,
  "periodEnd" DATE,
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

-- Care Teams
CREATE TABLE IF NOT EXISTS fhir_care_teams (
  id SERIAL PRIMARY KEY,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  "careTeamId" TEXT,
  status TEXT, -- proposed, active, suspended, inactive, entered-in-error
  
  "categoryCode" TEXT,
  "categoryDisplay" TEXT,
  
  "periodStart" DATE,
  "periodEnd" DATE,
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

-- Devices
CREATE TABLE IF NOT EXISTS fhir_devices (
  id SERIAL PRIMARY KEY,
  "anonymousPatientId" TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  "deviceId" TEXT,
  "deviceTypeCode" TEXT,
  "deviceTypeDisplay" TEXT,
  
  manufacturer TEXT,
  model TEXT,
  "serialNumber" TEXT,
  
  status TEXT, -- active, inactive, entered-in-error, unknown
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("anonymousPatientId") REFERENCES fhir_patients("anonymousPatientId"),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

-- Organizations
CREATE TABLE IF NOT EXISTS fhir_organizations (
  id SERIAL PRIMARY KEY,
  "organizationId" TEXT NOT NULL,
  name TEXT NOT NULL,
  
  "typeCode" TEXT,
  "typeDisplay" TEXT,
  
  "addressCountry" TEXT,
  "addressRegion" TEXT,
  "addressCity" TEXT,
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);

-- Practitioners
CREATE TABLE IF NOT EXISTS fhir_practitioners (
  id SERIAL PRIMARY KEY,
  "practitionerId" TEXT NOT NULL,
  name TEXT,
  
  "qualificationCode" TEXT,
  "qualificationDisplay" TEXT,
  
  "organizationId" TEXT,
  "organizationIdRef" INTEGER REFERENCES fhir_organizations(id),
  
  "hospitalId" VARCHAR(32) NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY ("hospitalId") REFERENCES hospitals(hospital_id)
);
`;

/**
 * Complete Schema Export
 */
export const CompleteFHIRSchema = `
${PatientSchema}

${EncounterSchema}

${ConditionSchema}

${ObservationSchema}

${MedicationSchema}

${ProcedureSchema}

${ImagingSchema}

${VitalsSchema}

${SDOHSchema}

${MetadataSchema}

${AdditionalResourcesSchema}
`;

