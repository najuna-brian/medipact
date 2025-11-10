/**
 * Dataset and FHIR Resource Database Model
 * 
 * Defines the data structure for queryable medical datasets and FHIR resources.
 * Designed for flexible querying by country, date, condition, lab results, etc.
 */

/**
 * FHIR Patient Schema (Anonymized)
 * 
 * Stores anonymized patient demographics for querying.
 */
export const FHIRPatientSchema = {
  id: {
    type: 'INTEGER',
    primaryKey: true,
    autoIncrement: true
  },
  anonymousPatientId: {
    type: 'STRING', // PID-001, etc.
    required: true,
    index: true
  },
  upi: {
    type: 'STRING', // Link to patient_identities
    required: true,
    index: true,
    foreignKey: 'patient_identities.upi'
  },
  country: {
    type: 'STRING',
    required: true,
    index: true
  },
  region: {
    type: 'STRING',
    required: false,
    index: true
  },
  ageRange: {
    type: 'STRING', // "35-39"
    required: false,
    index: true
  },
  gender: {
    type: 'STRING', // "Male", "Female", "Other", "Unknown"
    required: false,
    index: true
  },
  hospitalId: {
    type: 'STRING',
    required: true,
    index: true
  },
  createdAt: {
    type: 'TIMESTAMP',
    required: true
  },
  updatedAt: {
    type: 'TIMESTAMP',
    required: true
  }
};

/**
 * FHIR Condition Schema
 * 
 * Stores diagnoses and illnesses (ICD-10 codes).
 */
export const FHIRConditionSchema = {
  id: {
    type: 'INTEGER',
    primaryKey: true,
    autoIncrement: true
  },
  anonymousPatientId: {
    type: 'STRING',
    required: true,
    index: true
  },
  upi: {
    type: 'STRING',
    required: true,
    index: true
  },
  conditionCode: {
    type: 'STRING', // ICD-10 code (e.g., "E11" for Diabetes Type 2)
    required: true,
    index: true
  },
  conditionName: {
    type: 'STRING', // "Diabetes Type 2"
    required: true,
    index: true
  },
  diagnosisDate: {
    type: 'DATE',
    required: false,
    index: true
  },
  hospitalId: {
    type: 'STRING',
    required: true,
    index: true
  },
  severity: {
    type: 'STRING',
    required: false
  },
  status: {
    type: 'STRING', // "active", "resolved", "inactive"
    required: false
  },
  createdAt: {
    type: 'TIMESTAMP',
    required: true
  }
};

/**
 * FHIR Observation Schema
 * 
 * Stores lab results, vitals, and measurements.
 */
export const FHIRObservationSchema = {
  id: {
    type: 'INTEGER',
    primaryKey: true,
    autoIncrement: true
  },
  anonymousPatientId: {
    type: 'STRING',
    required: true,
    index: true
  },
  upi: {
    type: 'STRING',
    required: true,
    index: true
  },
  observationCode: {
    type: 'STRING', // LOINC code (e.g., "4548-4" for HbA1c)
    required: true,
    index: true
  },
  observationName: {
    type: 'STRING', // "HbA1c", "Blood Glucose", "Cholesterol"
    required: true,
    index: true
  },
  value: {
    type: 'STRING', // "7.8"
    required: false
  },
  unit: {
    type: 'STRING', // "%", "mg/dL", "mmol/L"
    required: false
  },
  effectiveDate: {
    type: 'DATE',
    required: true,
    index: true
  },
  hospitalId: {
    type: 'STRING',
    required: true,
    index: true
  },
  referenceRange: {
    type: 'STRING', // "4.0-5.6%"
    required: false
  },
  interpretation: {
    type: 'STRING', // "High", "Normal", "Low"
    required: false
  },
  createdAt: {
    type: 'TIMESTAMP',
    required: true
  }
};

/**
 * Dataset Schema
 * 
 * Stores dataset metadata for the marketplace.
 */
export const DatasetSchema = {
  id: {
    type: 'STRING',
    primaryKey: true,
    pattern: /^DS-[A-F0-9]{12}$/
  },
  name: {
    type: 'STRING',
    required: true
  },
  description: {
    type: 'TEXT',
    required: true
  },
  hospitalId: {
    type: 'STRING',
    required: true,
    index: true
  },
  country: {
    type: 'STRING',
    required: true,
    index: true
  },
  recordCount: {
    type: 'INTEGER',
    required: true,
    default: 0
  },
  dateRangeStart: {
    type: 'DATE',
    required: false,
    index: true
  },
  dateRangeEnd: {
    type: 'DATE',
    required: false,
    index: true
  },
  conditionCodes: {
    type: 'TEXT', // JSON array of condition codes
    required: false
  },
  price: {
    type: 'DECIMAL',
    required: true
  },
  currency: {
    type: 'STRING',
    required: true,
    default: 'HBAR'
  },
  format: {
    type: 'STRING', // "FHIR", "CSV", "JSON"
    required: true,
    default: 'FHIR'
  },
  consentType: {
    type: 'STRING', // "individual", "hospital_verified", "bulk"
    required: true
  },
  hcsTopicId: {
    type: 'STRING', // Link to HCS topic for dataset metadata
    required: false
  },
  consentTopicId: {
    type: 'STRING', // Link to consent proof HCS topic
    required: false
  },
  dataTopicId: {
    type: 'STRING', // Link to data proof HCS topic
    required: false
  },
  status: {
    type: 'ENUM',
    values: ['draft', 'active', 'archived', 'deleted'],
    default: 'draft',
    index: true
  },
  createdAt: {
    type: 'TIMESTAMP',
    required: true
  },
  updatedAt: {
    type: 'TIMESTAMP',
    required: true
  }
};

/**
 * Query Log Schema
 * 
 * Stores query logs for audit trail (also logged on HCS).
 */
export const QueryLogSchema = {
  id: {
    type: 'INTEGER',
    primaryKey: true,
    autoIncrement: true
  },
  researcherId: {
    type: 'STRING',
    required: true,
    index: true
  },
  queryFilters: {
    type: 'TEXT', // JSON object with filters
    required: true
  },
  resultCount: {
    type: 'INTEGER',
    required: true
  },
  datasetId: {
    type: 'STRING',
    required: false,
    index: true
  },
  hcsMessageId: {
    type: 'STRING', // Link to HCS audit log
    required: false
  },
  executedAt: {
    type: 'TIMESTAMP',
    required: true,
    index: true
  }
};

/**
 * Purchase Schema
 * 
 * Stores dataset purchases and access records.
 */
export const PurchaseSchema = {
  id: {
    type: 'STRING',
    primaryKey: true,
    pattern: /^PUR-[A-F0-9]{12}$/
  },
  researcherId: {
    type: 'STRING',
    required: true,
    index: true
  },
  datasetId: {
    type: 'STRING',
    required: true,
    index: true
  },
  amount: {
    type: 'DECIMAL',
    required: true
  },
  currency: {
    type: 'STRING',
    required: true,
    default: 'HBAR'
  },
  hederaTransactionId: {
    type: 'STRING', // HBAR transaction ID
    required: false
  },
  revenueDistributionHash: {
    type: 'STRING', // Hash of revenue distribution
    required: false
  },
  accessType: {
    type: 'STRING', // "download", "api", "time_limited"
    required: true,
    default: 'download'
  },
  accessExpiresAt: {
    type: 'TIMESTAMP',
    required: false
  },
  status: {
    type: 'ENUM',
    values: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  purchasedAt: {
    type: 'TIMESTAMP',
    required: true,
    index: true
  }
};

/**
 * SQL Schema for all tables
 */
export const SQLSchema = `
-- FHIR Patients Table (Anonymized)
CREATE TABLE IF NOT EXISTS fhir_patients (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  anonymous_patient_id TEXT NOT NULL,
  upi TEXT NOT NULL,
  country TEXT NOT NULL,
  region TEXT,
  age_range TEXT,
  gender TEXT,
  hospital_id TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (upi) REFERENCES patient_identities(upi),
  INDEX idx_anonymous_patient_id (anonymous_patient_id),
  INDEX idx_upi (upi),
  INDEX idx_country (country),
  INDEX idx_hospital_id (hospital_id)
);

-- FHIR Conditions Table
CREATE TABLE IF NOT EXISTS fhir_conditions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  anonymous_patient_id TEXT NOT NULL,
  upi TEXT NOT NULL,
  condition_code TEXT NOT NULL,
  condition_name TEXT NOT NULL,
  diagnosis_date DATE,
  hospital_id TEXT NOT NULL,
  severity TEXT,
  status TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_anonymous_patient_id (anonymous_patient_id),
  INDEX idx_upi (upi),
  INDEX idx_condition_code (condition_code),
  INDEX idx_condition_name (condition_name),
  INDEX idx_diagnosis_date (diagnosis_date),
  INDEX idx_hospital_id (hospital_id)
);

-- FHIR Observations Table
CREATE TABLE IF NOT EXISTS fhir_observations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  anonymous_patient_id TEXT NOT NULL,
  upi TEXT NOT NULL,
  observation_code TEXT NOT NULL,
  observation_name TEXT NOT NULL,
  value TEXT,
  unit TEXT,
  effective_date DATE NOT NULL,
  hospital_id TEXT NOT NULL,
  reference_range TEXT,
  interpretation TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_anonymous_patient_id (anonymous_patient_id),
  INDEX idx_upi (upi),
  INDEX idx_observation_code (observation_code),
  INDEX idx_observation_name (observation_name),
  INDEX idx_effective_date (effective_date),
  INDEX idx_hospital_id (hospital_id)
);

-- Datasets Table
CREATE TABLE IF NOT EXISTS datasets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  hospital_id TEXT NOT NULL,
  country TEXT NOT NULL,
  record_count INTEGER NOT NULL DEFAULT 0,
  date_range_start DATE,
  date_range_end DATE,
  condition_codes TEXT, -- JSON array
  price DECIMAL(18, 8) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'HBAR',
  format TEXT NOT NULL DEFAULT 'FHIR',
  consent_type TEXT NOT NULL,
  hcs_topic_id TEXT,
  consent_topic_id TEXT,
  data_topic_id TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('draft', 'active', 'archived', 'deleted')),
  INDEX idx_hospital_id (hospital_id),
  INDEX idx_country (country),
  INDEX idx_status (status),
  INDEX idx_date_range (date_range_start, date_range_end)
);

-- Query Logs Table
CREATE TABLE IF NOT EXISTS query_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  researcher_id TEXT NOT NULL,
  query_filters TEXT NOT NULL, -- JSON
  result_count INTEGER NOT NULL,
  dataset_id TEXT,
  hcs_message_id TEXT,
  executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_researcher_id (researcher_id),
  INDEX idx_dataset_id (dataset_id),
  INDEX idx_executed_at (executed_at)
);

-- Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY,
  researcher_id TEXT NOT NULL,
  dataset_id TEXT NOT NULL,
  amount DECIMAL(18, 8) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'HBAR',
  hedera_transaction_id TEXT,
  revenue_distribution_hash TEXT,
  access_type TEXT NOT NULL DEFAULT 'download',
  access_expires_at TIMESTAMP,
  status TEXT NOT NULL DEFAULT 'pending',
  purchased_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  INDEX idx_researcher_id (researcher_id),
  INDEX idx_dataset_id (dataset_id),
  INDEX idx_status (status),
  INDEX idx_purchased_at (purchased_at)
);
`;

