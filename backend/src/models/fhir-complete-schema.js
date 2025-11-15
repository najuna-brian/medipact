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
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Demographics (Anonymized)
  country VARCHAR(100) NOT NULL,
  region VARCHAR(255),
  district VARCHAR(255),
  age_range VARCHAR(20), -- "35-39"
  gender VARCHAR(20), -- Male, Female, Other, Unknown
  race VARCHAR(100),
  ethnicity VARCHAR(100),
  marital_status VARCHAR(50),
  language VARCHAR(50),
  occupation_category VARCHAR(100),
  
  -- Administrative
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_patients_anonymous_id ON fhir_patients(anonymous_patient_id);
CREATE INDEX idx_fhir_patients_upi ON fhir_patients(upi);
CREATE INDEX idx_fhir_patients_country ON fhir_patients(country);
CREATE INDEX idx_fhir_patients_region ON fhir_patients(region);
CREATE INDEX idx_fhir_patients_age_range ON fhir_patients(age_range);
CREATE INDEX idx_fhir_patients_gender ON fhir_patients(gender);
CREATE INDEX idx_fhir_patients_hospital ON fhir_patients(hospital_id);

-- Related Persons (Emergency contacts, guardians)
CREATE TABLE IF NOT EXISTS fhir_related_persons (
  id SERIAL PRIMARY KEY,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  relationship_code TEXT, -- SNOMED: mother, father, guardian, etc.
  relationship_display TEXT,
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi)
);

-- Coverage (Insurance/Payer)
CREATE TABLE IF NOT EXISTS fhir_coverage (
  id SERIAL PRIMARY KEY,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  coverage_id TEXT,
  status TEXT, -- active, cancelled, draft
  type_code TEXT, -- Insurance type code
  type_display TEXT,
  subscriber_id TEXT,
  beneficiary_id TEXT,
  period_start DATE,
  period_end DATE,
  payor_id TEXT,
  payor_name TEXT,
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
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
  encounter_id TEXT NOT NULL,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Encounter Details
  encounter_class TEXT, -- inpatient, outpatient, emergency, virtual, ambulatory
  encounter_type_code TEXT, -- SNOMED: consultation, follow-up, surgery, triage
  encounter_type_display TEXT,
  status TEXT, -- planned, arrived, triaged, in-progress, onleave, finished, cancelled
  
  -- Location & Organization
  facility_id TEXT,
  facility_name TEXT,
  department_code TEXT,
  department_name TEXT,
  location_id TEXT,
  location_name TEXT,
  bed_id TEXT,
  room_number TEXT,
  
  -- Timing
  admission_date TIMESTAMP,
  discharge_date TIMESTAMP,
  period_start TIMESTAMP,
  period_end TIMESTAMP,
  
  -- Clinical
  reason_code TEXT, -- ICD-10 or SNOMED
  reason_display TEXT,
  diagnosis_code TEXT, -- Primary diagnosis
  diagnosis_display TEXT,
  
  -- Providers
  attending_practitioner_id TEXT,
  attending_practitioner_name TEXT,
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_encounters_patient ON fhir_encounters(anonymous_patient_id);
CREATE INDEX idx_fhir_encounters_upi ON fhir_encounters(upi);
CREATE INDEX idx_fhir_encounters_class ON fhir_encounters(encounter_class);
CREATE INDEX idx_fhir_encounters_type ON fhir_encounters(encounter_type_code);
CREATE INDEX idx_fhir_encounters_admission ON fhir_encounters(admission_date);
CREATE INDEX idx_fhir_encounters_discharge ON fhir_encounters(discharge_date);
CREATE INDEX idx_fhir_encounters_hospital ON fhir_encounters(hospital_id);
`;

/**
 * Domain 3: Diagnoses & Clinical Problems
 * FHIR Resources: Condition, AllergyIntolerance
 */
export const ConditionSchema = `
-- Enhanced Conditions Table
CREATE TABLE IF NOT EXISTS fhir_conditions (
  id SERIAL PRIMARY KEY,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Coding (Multiple coding systems)
  condition_code_icd10 TEXT, -- ICD-10 code (e.g., E11)
  condition_code_snomed TEXT, -- SNOMED CT code (preferred)
  condition_name TEXT NOT NULL,
  
  -- Clinical Details
  body_site_code TEXT, -- SNOMED body site
  body_site_display TEXT,
  stage_code TEXT, -- For cancers
  stage_display TEXT,
  severity_code TEXT,
  severity_display TEXT,
  
  -- Timing
  onset_date DATE,
  diagnosis_date DATE,
  abatement_date DATE, -- Resolution date
  
  -- Classification
  diagnosis_role TEXT, -- primary, secondary, billing
  category_code TEXT, -- problem-list-item, encounter-diagnosis
  category_display TEXT,
  status TEXT, -- active, recurrence, relapse, inactive, remission, resolved
  
  -- Context
  encounter_id TEXT, -- Link to encounter
  encounter_id_ref INTEGER REFERENCES fhir_encounters(id),
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_conditions_patient ON fhir_conditions(anonymous_patient_id);
CREATE INDEX idx_fhir_conditions_upi ON fhir_conditions(upi);
CREATE INDEX idx_fhir_conditions_icd10 ON fhir_conditions(condition_code_icd10);
CREATE INDEX idx_fhir_conditions_snomed ON fhir_conditions(condition_code_snomed);
CREATE INDEX idx_fhir_conditions_name ON fhir_conditions(condition_name);
CREATE INDEX idx_fhir_conditions_diagnosis_date ON fhir_conditions(diagnosis_date);
CREATE INDEX idx_fhir_conditions_status ON fhir_conditions(status);
CREATE INDEX idx_fhir_conditions_hospital ON fhir_conditions(hospital_id);

-- Allergies
CREATE TABLE IF NOT EXISTS fhir_allergies (
  id SERIAL PRIMARY KEY,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Substance
  substance_code TEXT, -- SNOMED or RxNorm
  substance_display TEXT,
  
  -- Reaction
  reaction_type_code TEXT, -- SNOMED reaction type
  reaction_type_display TEXT,
  reaction_manifestation_code TEXT,
  reaction_manifestation_display TEXT,
  
  -- Severity & Certainty
  severity TEXT, -- mild, moderate, severe
  certainty TEXT, -- confirmed, suspected, unlikely
  
  -- Timing
  onset_date DATE,
  last_occurrence_date DATE,
  
  -- Clinical
  criticality TEXT, -- low, high, unable-to-assess
  status TEXT, -- active, inactive, resolved
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_allergies_patient ON fhir_allergies(anonymous_patient_id);
CREATE INDEX idx_fhir_allergies_substance ON fhir_allergies(substance_code);
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
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Coding
  observation_code_loinc TEXT NOT NULL, -- LOINC code (e.g., 4548-4)
  observation_name TEXT NOT NULL,
  category_code TEXT, -- vital-signs, laboratory, imaging, etc.
  category_display TEXT,
  
  -- Value
  value_quantity TEXT,
  value_unit TEXT,
  value_string TEXT,
  value_codeable_concept_code TEXT,
  value_codeable_concept_display TEXT,
  
  -- Reference Range
  reference_range_low TEXT,
  reference_range_high TEXT,
  reference_range_text TEXT,
  
  -- Interpretation
  interpretation_code TEXT,
  interpretation_display TEXT, -- High, Normal, Low, Critical
  
  -- Timing
  effective_date TIMESTAMP NOT NULL,
  effective_period_start TIMESTAMP,
  effective_period_end TIMESTAMP,
  
  -- Context
  encounter_id TEXT,
  encounter_id_ref INTEGER REFERENCES fhir_encounters(id),
  
  -- Performer
  performer_id TEXT,
  performer_name TEXT,
  performer_type TEXT, -- Practitioner, Organization, Device
  
  -- Method & Device
  method_code TEXT,
  method_display TEXT,
  device_code TEXT,
  device_display TEXT,
  
  -- Specimen
  specimen_id TEXT,
  specimen_id_ref INTEGER REFERENCES fhir_specimens(id),
  
  -- Diagnostic Report Link
  diagnostic_report_id INTEGER REFERENCES fhir_diagnostic_reports(id),
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_observations_patient ON fhir_observations(anonymous_patient_id);
CREATE INDEX idx_fhir_observations_upi ON fhir_observations(upi);
CREATE INDEX idx_fhir_observations_loinc ON fhir_observations(observation_code_loinc);
CREATE INDEX idx_fhir_observations_name ON fhir_observations(observation_name);
CREATE INDEX idx_fhir_observations_category ON fhir_observations(category_code);
CREATE INDEX idx_fhir_observations_effective_date ON fhir_observations(effective_date);
CREATE INDEX idx_fhir_observations_encounter ON fhir_observations(encounter_id_ref);
CREATE INDEX idx_fhir_observations_hospital ON fhir_observations(hospital_id);

-- Observation Components (for panels like CBC)
CREATE TABLE IF NOT EXISTS fhir_observation_components (
  id SERIAL PRIMARY KEY,
  observation_id INTEGER NOT NULL REFERENCES fhir_observations(id),
  component_code_loinc TEXT,
  component_name TEXT,
  value_quantity TEXT,
  value_unit TEXT,
  reference_range_low TEXT,
  reference_range_high TEXT,
  interpretation_code TEXT,
  interpretation_display TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Specimens
CREATE TABLE IF NOT EXISTS fhir_specimens (
  id SERIAL PRIMARY KEY,
  specimen_id TEXT NOT NULL,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Specimen Type
  type_code TEXT, -- SNOMED: blood, serum, urine, sputum, etc.
  type_display TEXT,
  
  -- Collection
  collection_method_code TEXT,
  collection_method_display TEXT,
  collection_date TIMESTAMP,
  collector_id TEXT,
  collector_name TEXT,
  
  -- Container
  container_id TEXT,
  container_type_code TEXT,
  container_type_display TEXT,
  
  -- Handling
  received_date TIMESTAMP,
  processing_date TIMESTAMP,
  condition_code TEXT, -- satisfactory, unsatisfactory, etc.
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

-- Diagnostic Reports
CREATE TABLE IF NOT EXISTS fhir_diagnostic_reports (
  id SERIAL PRIMARY KEY,
  report_id TEXT NOT NULL,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Report Details
  report_code_loinc TEXT, -- Panel code
  report_name TEXT,
  status TEXT, -- registered, partial, preliminary, final, corrected, cancelled
  
  -- Category
  category_code TEXT,
  category_display TEXT,
  
  -- Timing
  effective_date TIMESTAMP NOT NULL,
  issued_date TIMESTAMP,
  
  -- Performer
  performer_id TEXT,
  performer_name TEXT,
  performer_type TEXT,
  
  -- Results
  conclusion TEXT, -- Narrative summary
  conclusion_code TEXT, -- Coded conclusion
  
  -- Context
  encounter_id TEXT,
  encounter_id_ref INTEGER REFERENCES fhir_encounters(id),
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_diagnostic_reports_patient ON fhir_diagnostic_reports(anonymous_patient_id);
CREATE INDEX idx_fhir_diagnostic_reports_loinc ON fhir_diagnostic_reports(report_code_loinc);
CREATE INDEX idx_fhir_diagnostic_reports_effective_date ON fhir_diagnostic_reports(effective_date);
`;

/**
 * Domain 5: Medications & Treatment Data
 * FHIR Resources: MedicationRequest, MedicationAdministration, MedicationStatement
 */
export const MedicationSchema = `
-- Medication Requests (Prescriptions)
CREATE TABLE IF NOT EXISTS fhir_medication_requests (
  id SERIAL PRIMARY KEY,
  medication_request_id TEXT NOT NULL,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Medication
  medication_code_rxnorm TEXT, -- RxNorm code
  medication_name TEXT NOT NULL,
  atc_code TEXT, -- ATC therapeutic category
  atc_display TEXT,
  
  -- Dosage
  dosage_quantity TEXT,
  dosage_unit TEXT,
  dosage_text TEXT, -- "10 mg"
  frequency_code TEXT, -- q8h, once daily, etc.
  frequency_text TEXT,
  route_code TEXT, -- SNOMED: oral, IV, IM, topical
  route_display TEXT,
  
  -- Timing
  start_date DATE,
  end_date DATE,
  expected_duration TEXT,
  
  -- Status
  status TEXT, -- active, completed, stopped, cancelled, entered-in-error
  intent TEXT, -- proposal, plan, order, original-order, reflex-order
  
  -- Prescriber
  prescriber_id TEXT,
  prescriber_name TEXT,
  prescriber_type TEXT,
  
  -- Dispensing
  dispenser_id TEXT,
  dispenser_name TEXT,
  dispense_quantity TEXT,
  number_of_repeats INTEGER,
  
  -- Context
  encounter_id TEXT,
  encounter_id_ref INTEGER REFERENCES fhir_encounters(id),
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_medication_requests_patient ON fhir_medication_requests(anonymous_patient_id);
CREATE INDEX idx_fhir_medication_requests_rxnorm ON fhir_medication_requests(medication_code_rxnorm);
CREATE INDEX idx_fhir_medication_requests_atc ON fhir_medication_requests(atc_code);
CREATE INDEX idx_fhir_medication_requests_status ON fhir_medication_requests(status);
CREATE INDEX idx_fhir_medication_requests_start_date ON fhir_medication_requests(start_date);

-- Medication Administrations (Given by nurse)
CREATE TABLE IF NOT EXISTS fhir_medication_administrations (
  id SERIAL PRIMARY KEY,
  medication_administration_id TEXT NOT NULL,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Link to Request
  medication_request_id INTEGER REFERENCES fhir_medication_requests(id),
  
  -- Medication
  medication_code_rxnorm TEXT,
  medication_name TEXT,
  
  -- Administration
  administered_date TIMESTAMP NOT NULL,
  dosage_quantity TEXT,
  dosage_unit TEXT,
  route_code TEXT,
  route_display TEXT,
  
  -- Performer
  performer_id TEXT,
  performer_name TEXT,
  performer_type TEXT,
  
  -- Status
  status TEXT, -- in-progress, not-done, on-hold, completed, entered-in-error, stopped
  
  -- Context
  encounter_id TEXT,
  encounter_id_ref INTEGER REFERENCES fhir_encounters(id),
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

-- Medication Statements (Patient self-reported)
CREATE TABLE IF NOT EXISTS fhir_medication_statements (
  id SERIAL PRIMARY KEY,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Medication
  medication_code_rxnorm TEXT,
  medication_name TEXT,
  
  -- Status
  status TEXT, -- active, completed, entered-in-error, intended, stopped, on-hold
  
  -- Timing
  effective_start_date DATE,
  effective_end_date DATE,
  
  -- Dosage
  dosage_text TEXT,
  frequency_text TEXT,
  
  -- Source
  information_source TEXT, -- patient, practitioner, etc.
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);
`;

/**
 * Domain 6: Procedures & Interventions
 * FHIR Resource: Procedure
 */
export const ProcedureSchema = `
CREATE TABLE IF NOT EXISTS fhir_procedures (
  id SERIAL PRIMARY KEY,
  procedure_id TEXT NOT NULL,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Procedure Coding
  procedure_code_snomed TEXT, -- SNOMED CT (preferred)
  procedure_code_cpt TEXT, -- CPT code
  procedure_code_icd10pcs TEXT, -- ICD-10-PCS
  procedure_name TEXT NOT NULL,
  
  -- Body Site
  body_site_code TEXT, -- SNOMED body site
  body_site_display TEXT,
  
  -- Technique
  technique_code TEXT,
  technique_display TEXT,
  
  -- Timing
  performed_date TIMESTAMP NOT NULL,
  performed_period_start TIMESTAMP,
  performed_period_end TIMESTAMP,
  
  -- Status
  status TEXT, -- preparation, in-progress, not-done, on-hold, stopped, completed, entered-in-error, unknown
  
  -- Outcome
  outcome_code TEXT,
  outcome_display TEXT,
  outcome_text TEXT,
  
  -- Performer
  performer_id TEXT,
  performer_name TEXT,
  performer_role_code TEXT, -- surgeon, assistant, etc.
  performer_role_display TEXT,
  
  -- Device
  device_implanted_code TEXT,
  device_implanted_display TEXT,
  
  -- Context
  encounter_id TEXT,
  encounter_id_ref INTEGER REFERENCES fhir_encounters(id),
  reason_code TEXT,
  reason_display TEXT,
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_procedures_patient ON fhir_procedures(anonymous_patient_id);
CREATE INDEX idx_fhir_procedures_snomed ON fhir_procedures(procedure_code_snomed);
CREATE INDEX idx_fhir_procedures_cpt ON fhir_procedures(procedure_code_cpt);
CREATE INDEX idx_fhir_procedures_performed_date ON fhir_procedures(performed_date);
CREATE INDEX idx_fhir_procedures_status ON fhir_procedures(status);
`;

/**
 * Domain 7: Medical Imaging
 * FHIR Resources: ImagingStudy, Media
 */
export const ImagingSchema = `
CREATE TABLE IF NOT EXISTS fhir_imaging_studies (
  id SERIAL PRIMARY KEY,
  study_id TEXT NOT NULL,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Modality
  modality_code TEXT, -- CT, MRI, XRAY, PET, US, etc.
  modality_display TEXT,
  
  -- Body Site
  body_site_code TEXT,
  body_site_display TEXT,
  
  -- Study Details
  study_description TEXT,
  series_count INTEGER,
  image_count INTEGER,
  
  -- Timing
  started_date TIMESTAMP NOT NULL,
  ended_date TIMESTAMP,
  
  -- Performer
  performer_id TEXT,
  performer_name TEXT,
  performer_type TEXT,
  
  -- Equipment
  equipment_device_id TEXT,
  equipment_device_name TEXT,
  equipment_manufacturer TEXT,
  equipment_model TEXT,
  
  -- Report
  report_text TEXT, -- Radiologist report
  report_id TEXT,
  
  -- Context
  encounter_id TEXT,
  encounter_id_ref INTEGER REFERENCES fhir_encounters(id),
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_imaging_studies_patient ON fhir_imaging_studies(anonymous_patient_id);
CREATE INDEX idx_fhir_imaging_studies_modality ON fhir_imaging_studies(modality_code);
CREATE INDEX idx_fhir_imaging_studies_started_date ON fhir_imaging_studies(started_date);
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
  observation_id INTEGER NOT NULL REFERENCES fhir_observations(id),
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Vital Type
  vital_type_code TEXT, -- heart-rate, blood-pressure, temperature, etc.
  vital_type_display TEXT,
  
  -- Value
  value_quantity TEXT,
  value_unit TEXT,
  
  -- For Blood Pressure (has components)
  systolic_value TEXT,
  diastolic_value TEXT,
  
  -- Timing
  effective_date TIMESTAMP NOT NULL,
  
  -- Context
  encounter_id TEXT,
  encounter_id_ref INTEGER REFERENCES fhir_encounters(id),
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_vital_signs_patient ON fhir_vital_signs(anonymous_patient_id);
CREATE INDEX idx_fhir_vital_signs_type ON fhir_vital_signs(vital_type_code);
CREATE INDEX idx_fhir_vital_signs_effective_date ON fhir_vital_signs(effective_date);
`;

/**
 * Domain 9: Social Determinants of Health (SDOH)
 * FHIR Resources: Observation (SDOH profiles), Condition, QuestionnaireResponse
 */
export const SDOHSchema = `
CREATE TABLE IF NOT EXISTS fhir_sdoh (
  id SERIAL PRIMARY KEY,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  -- Category
  category_code TEXT, -- housing, income, education, employment, lifestyle
  category_display TEXT,
  
  -- Specific SDOH
  sdoh_code TEXT, -- LOINC or SNOMED
  sdoh_display TEXT,
  
  -- Value
  value_code TEXT,
  value_display TEXT,
  value_text TEXT,
  
  -- Timing
  effective_date DATE,
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_sdoh_patient ON fhir_sdoh(anonymous_patient_id);
CREATE INDEX idx_fhir_sdoh_category ON fhir_sdoh(category_code);
CREATE INDEX idx_fhir_sdoh_code ON fhir_sdoh(sdoh_code);
`;

/**
 * Domain 10: Metadata, Audit Logs, Access Trails
 * FHIR Resources: Provenance, AuditEvent
 */
export const MetadataSchema = `
-- Provenance (Who created/modified resources)
CREATE TABLE IF NOT EXISTS fhir_provenance (
  id SERIAL PRIMARY KEY,
  target_resource_type TEXT NOT NULL, -- Patient, Condition, Observation, etc.
  target_resource_id INTEGER NOT NULL,
  target_resource_fhir_id TEXT,
  
  -- Activity
  activity_code TEXT, -- create, update, delete, read
  activity_display TEXT,
  
  -- Agent (Who did it)
  agent_id TEXT,
  agent_name TEXT,
  agent_type TEXT, -- Practitioner, Organization, Device, Patient
  agent_role_code TEXT,
  agent_role_display TEXT,
  
  -- When
  occurred_at TIMESTAMP NOT NULL,
  
  -- Why
  reason_code TEXT,
  reason_display TEXT,
  
  -- Signature
  signature_type TEXT,
  signature_data TEXT, -- Cryptographic signature
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_provenance_target ON fhir_provenance(target_resource_type, target_resource_id);
CREATE INDEX idx_fhir_provenance_agent ON fhir_provenance(agent_id);
CREATE INDEX idx_fhir_provenance_occurred ON fhir_provenance(occurred_at);

-- Audit Events (Access logs)
CREATE TABLE IF NOT EXISTS fhir_audit_events (
  id SERIAL PRIMARY KEY,
  event_type TEXT NOT NULL, -- read, write, delete, export, access
  event_subtype TEXT,
  
  -- Agent (Who)
  agent_id TEXT,
  agent_name TEXT,
  agent_type TEXT,
  agent_ip_address TEXT,
  agent_user_agent TEXT,
  
  -- Resource (What)
  resource_type TEXT,
  resource_id INTEGER,
  resource_fhir_id TEXT,
  
  -- Outcome
  outcome_code TEXT, -- success, failure, partial
  outcome_display TEXT,
  outcome_description TEXT,
  
  -- When
  occurred_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  -- Purpose
  purpose_of_use_code TEXT,
  purpose_of_use_display TEXT,
  
  hospital_id VARCHAR(32) NOT NULL,
  
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

CREATE INDEX idx_fhir_audit_events_type ON fhir_audit_events(event_type);
CREATE INDEX idx_fhir_audit_events_agent ON fhir_audit_events(agent_id);
CREATE INDEX idx_fhir_audit_events_resource ON fhir_audit_events(resource_type, resource_id);
CREATE INDEX idx_fhir_audit_events_occurred ON fhir_audit_events(occurred_at);
`;

/**
 * Additional FHIR Resources
 */
export const AdditionalResourcesSchema = `
-- Immunizations
CREATE TABLE IF NOT EXISTS fhir_immunizations (
  id SERIAL PRIMARY KEY,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  vaccine_code TEXT, -- CVX or SNOMED
  vaccine_display TEXT,
  
  status TEXT, -- completed, entered-in-error, not-done
  occurrence_date DATE NOT NULL,
  
  performer_id TEXT,
  performer_name TEXT,
  
  lot_number TEXT,
  expiration_date DATE,
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

-- Care Plans
CREATE TABLE IF NOT EXISTS fhir_care_plans (
  id SERIAL PRIMARY KEY,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  care_plan_id TEXT,
  status TEXT, -- draft, active, on-hold, revoked, completed, entered-in-error
  intent TEXT, -- proposal, plan, order, option
  
  category_code TEXT,
  category_display TEXT,
  
  period_start DATE,
  period_end DATE,
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

-- Care Teams
CREATE TABLE IF NOT EXISTS fhir_care_teams (
  id SERIAL PRIMARY KEY,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  care_team_id TEXT,
  status TEXT, -- proposed, active, suspended, inactive, entered-in-error
  
  category_code TEXT,
  category_display TEXT,
  
  period_start DATE,
  period_end DATE,
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

-- Devices
CREATE TABLE IF NOT EXISTS fhir_devices (
  id SERIAL PRIMARY KEY,
  anonymous_patient_id TEXT NOT NULL,
  upi VARCHAR(64) NOT NULL,
  
  device_id TEXT,
  device_type_code TEXT,
  device_type_display TEXT,
  
  manufacturer TEXT,
  model TEXT,
  serial_number TEXT,
  
  status TEXT, -- active, inactive, entered-in-error, unknown
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (anonymous_patient_id) REFERENCES fhir_patients(anonymous_patient_id),
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

-- Organizations
CREATE TABLE IF NOT EXISTS fhir_organizations (
  id SERIAL PRIMARY KEY,
  organization_id TEXT NOT NULL,
  name TEXT NOT NULL,
  
  type_code TEXT,
  type_display TEXT,
  
  address_country TEXT,
  address_region TEXT,
  address_city TEXT,
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
);

-- Practitioners
CREATE TABLE IF NOT EXISTS fhir_practitioners (
  id SERIAL PRIMARY KEY,
  practitioner_id TEXT NOT NULL,
  name TEXT,
  
  qualification_code TEXT,
  qualification_display TEXT,
  
  organization_id TEXT,
  organization_id_ref INTEGER REFERENCES fhir_organizations(id),
  
  hospital_id VARCHAR(32) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
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

