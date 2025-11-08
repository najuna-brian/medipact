/**
 * Patient Identity Database Model
 * 
 * Defines the data structure for patient identities and hospital linkages.
 * This is a reference implementation - adapt to your database system.
 */

/**
 * Patient Identity Schema
 * 
 * Stores unique patient identities (UPI) and basic metadata.
 */
export const PatientIdentitySchema = {
  upi: {
    type: 'STRING',
    primaryKey: true,
    required: true,
    pattern: /^UPI-[A-F0-9]{16}$/
  },
  createdAt: {
    type: 'TIMESTAMP',
    required: true
  },
  lastUpdated: {
    type: 'TIMESTAMP',
    required: true
  },
  status: {
    type: 'ENUM',
    values: ['active', 'suspended', 'deleted'],
    default: 'active'
  }
};

/**
 * Hospital Linkage Schema
 * 
 * Links hospital-specific patient IDs to UPIs.
 */
export const HospitalLinkageSchema = {
  id: {
    type: 'UUID',
    primaryKey: true,
    required: true
  },
  upi: {
    type: 'STRING',
    required: true,
    foreignKey: 'patient_identities.upi',
    index: true
  },
  hospitalId: {
    type: 'STRING',
    required: true,
    pattern: /^HOSP-[A-F0-9]{12}$/,
    index: true
  },
  hospitalPatientId: {
    type: 'STRING',
    required: true,
    index: true
  },
  linkedAt: {
    type: 'TIMESTAMP',
    required: true
  },
  verified: {
    type: 'BOOLEAN',
    default: false
  },
  verificationMethod: {
    type: 'STRING',
    enum: ['patient_consent', 'hospital_verification', 'manual_review'],
    default: 'hospital_verification'
  },
  encryptedPII: {
    type: 'BLOB', // Encrypted PII for this hospital
    required: false
  },
  status: {
    type: 'ENUM',
    values: ['active', 'disconnected', 'deleted'],
    default: 'active'
  },
  // Composite unique constraint: (upi, hospitalId) should be unique
  unique: ['upi', 'hospitalId']
};

/**
 * Hospital Registry Schema
 * 
 * Stores registered hospital information.
 */
export const HospitalSchema = {
  hospitalId: {
    type: 'STRING',
    primaryKey: true,
    required: true,
    pattern: /^HOSP-[A-F0-9]{12}$/
  },
  name: {
    type: 'STRING',
    required: true
  },
  country: {
    type: 'STRING',
    required: true
  },
  location: {
    type: 'STRING',
    required: false
  },
  fhirEndpoint: {
    type: 'STRING',
    required: false,
    pattern: /^https?:\/\/.+/ // URL format
  },
  contactEmail: {
    type: 'STRING',
    required: false,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Email format
  },
  apiKey: {
    type: 'STRING', // Hashed API key
    required: true
  },
  registeredAt: {
    type: 'TIMESTAMP',
    required: true
  },
  status: {
    type: 'ENUM',
    values: ['active', 'suspended', 'deleted'],
    default: 'active'
  }
};

/**
 * Example SQL Schema (for reference)
 */
export const SQLSchema = `
-- Patient Identities Table
CREATE TABLE patient_identities (
  upi VARCHAR(64) PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  CHECK (status IN ('active', 'suspended', 'deleted')),
  CHECK (upi ~ '^UPI-[A-F0-9]{16}$')
);

-- Hospital Linkages Table
CREATE TABLE hospital_linkages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upi VARCHAR(64) NOT NULL REFERENCES patient_identities(upi),
  hospital_id VARCHAR(32) NOT NULL,
  hospital_patient_id VARCHAR(128) NOT NULL,
  linked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified BOOLEAN NOT NULL DEFAULT false,
  verification_method VARCHAR(50) DEFAULT 'hospital_verification',
  encrypted_pii BYTEA,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  CHECK (status IN ('active', 'disconnected', 'deleted')),
  CHECK (hospital_id ~ '^HOSP-[A-F0-9]{12}$'),
  UNIQUE (upi, hospital_id),
  INDEX idx_upi (upi),
  INDEX idx_hospital_id (hospital_id),
  INDEX idx_hospital_patient_id (hospital_patient_id)
);

-- Hospital Registry Table
CREATE TABLE hospitals (
  hospital_id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  fhir_endpoint VARCHAR(512),
  contact_email VARCHAR(255),
  api_key_hash VARCHAR(255) NOT NULL,
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  CHECK (status IN ('active', 'suspended', 'deleted')),
  CHECK (hospital_id ~ '^HOSP-[A-F0-9]{12}$')
);
`;

