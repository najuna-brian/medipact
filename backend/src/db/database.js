/**
 * Database Layer
 * 
 * Supports both SQLite (development) and PostgreSQL (production).
 * 
 * Development: Uses SQLite for local development convenience.
 * Production: Uses PostgreSQL (Supabase) for:
 *    - Better concurrency and scalability
 *    - Built-in encryption (pgcrypto)
 *    - Row-level security (RLS)
 *    - HIPAA compliance features
 *    - Better performance at scale
 * 
 * Auto-detects database type from DATABASE_URL environment variable:
 * - If DATABASE_URL is set → PostgreSQL (production)
 * - If DATABASE_URL is not set → SQLite (development)
 */

import sqlite3 from 'sqlite3';
import pg from 'pg';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database configuration
const DATABASE_URL = process.env.DATABASE_URL;
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/medipact.db');
const USE_POSTGRES = !!DATABASE_URL;

let db = null;
let dbType = null;

/**
 * Initialize database connection
 */
export async function initDatabase() {
  if (USE_POSTGRES) {
    return initPostgreSQL();
  } else {
    return initSQLite();
  }
}

/**
 * Initialize PostgreSQL connection (Supabase)
 */
async function initPostgreSQL() {
  try {
    const client = new pg.Client({
      connectionString: DATABASE_URL,
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });

    await client.connect();
    db = client;
    dbType = 'postgresql';
    
    // Use logger if available, otherwise console
    if (typeof import('../utils/logger.js').then === 'function') {
      const { logInfo } = await import('../utils/logger.js');
      logInfo('Database connected: PostgreSQL');
    } else {
      console.log('📦 Database connected: PostgreSQL');
    }
    
    // Create tables
    await createTables();
    
    return;
  } catch (error) {
    // Use logger if available
    try {
      const { logError } = await import('../utils/logger.js');
      logError('Error connecting to PostgreSQL', error);
    } catch {
      console.error('❌ Error connecting to PostgreSQL:', error);
    }
    throw error;
  }
}

/**
 * Initialize SQLite connection (development)
 */
function initSQLite() {
  return new Promise((resolve, reject) => {
    // Ensure data directory exists
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new sqlite3.Database(DB_PATH, async (err) => {
      if (err) {
        try {
          const { logError } = await import('../utils/logger.js');
          logError('Error opening SQLite database', err);
        } catch {
          console.error('Error opening database:', err);
        }
        reject(err);
      } else {
        dbType = 'sqlite';
        try {
          const { logInfo } = await import('../utils/logger.js');
          logInfo('Database connected: SQLite', { path: DB_PATH });
        } catch {
          console.log(`📦 Database connected: SQLite (${DB_PATH})`);
        }
        createTables().then(resolve).catch(reject);
      }
    });
  });
}

/**
 * Create database tables (works for both SQLite and PostgreSQL)
 */
async function createTables() {
  if (dbType === 'postgresql') {
    await createPostgreSQLTables();
  } else {
    await createSQLiteTables();
  }
  console.log('✅ Database tables created');
}

/**
 * Create PostgreSQL tables
 */
async function createPostgreSQLTables() {
  const client = db;

  // Patient Identities Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS patient_identities (
      upi VARCHAR(64) PRIMARY KEY,
      hedera_account_id VARCHAR(20) UNIQUE,
      evm_address VARCHAR(42),
      encrypted_private_key TEXT,
      payment_method VARCHAR(50),
      bank_account_number VARCHAR(255),
      bank_name VARCHAR(255),
      mobile_money_provider VARCHAR(50),
      mobile_money_number VARCHAR(255),
      withdrawal_threshold_usd DECIMAL(10, 2) DEFAULT 10.00,
      auto_withdraw_enabled BOOLEAN DEFAULT true,
      last_withdrawal_at TIMESTAMP,
      total_withdrawn_usd DECIMAL(10, 2) DEFAULT 0.00,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      CHECK (status IN ('active', 'suspended', 'deleted')),
      CHECK (payment_method IN ('bank', 'mobile_money', NULL))
    )
  `);

  // Hospitals Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS hospitals (
      hospital_id VARCHAR(32) PRIMARY KEY,
      hedera_account_id VARCHAR(20) UNIQUE,
      evm_address VARCHAR(42),
      encrypted_private_key TEXT,
      name VARCHAR(255) NOT NULL,
      country VARCHAR(100) NOT NULL,
      location VARCHAR(255),
      fhir_endpoint VARCHAR(512),
      contact_email VARCHAR(255) NOT NULL,
      registration_number VARCHAR(255) NOT NULL,
      api_key_hash VARCHAR(255),
      payment_method VARCHAR(50),
      bank_account_number VARCHAR(255),
      bank_name VARCHAR(255),
      mobile_money_provider VARCHAR(50),
      mobile_money_number VARCHAR(255),
      withdrawal_threshold_usd DECIMAL(10, 2) DEFAULT 100.00,
      auto_withdraw_enabled BOOLEAN DEFAULT true,
      last_withdrawal_at TIMESTAMP,
      total_withdrawn_usd DECIMAL(10, 2) DEFAULT 0.00,
      registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      verification_documents TEXT NOT NULL,
      verified_at TIMESTAMP,
      verified_by VARCHAR(255),
      CHECK (status IN ('active', 'suspended', 'deleted')),
      CHECK (verification_status IN ('pending', 'verified', 'rejected')),
      CHECK (payment_method IN ('bank', 'mobile_money', NULL))
    )
  `);

  // Hospital Linkages Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS hospital_linkages (
      id VARCHAR(255) PRIMARY KEY,
      upi VARCHAR(64) NOT NULL,
      hospital_id VARCHAR(32) NOT NULL,
      hospital_patient_id VARCHAR(128) NOT NULL,
      linked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      verified BOOLEAN NOT NULL DEFAULT false,
      verification_method VARCHAR(50) DEFAULT 'hospital_verification',
      encrypted_pii BYTEA,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      CHECK (status IN ('active', 'disconnected', 'deleted')),
      UNIQUE (upi, hospital_id),
      FOREIGN KEY (upi) REFERENCES patient_identities(upi),
      FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    )
  `);

  // Patient Contacts Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS patient_contacts (
      id VARCHAR(255) PRIMARY KEY,
      upi VARCHAR(64) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      national_id VARCHAR(100),
      verified BOOLEAN NOT NULL DEFAULT false,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (upi) REFERENCES patient_identities(upi) ON DELETE CASCADE
    )
  `);

  // Patient Data Preferences Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS patient_data_preferences (
      upi VARCHAR(64) PRIMARY KEY,
      global_sharing_enabled BOOLEAN NOT NULL DEFAULT true,
      allow_verified_researchers BOOLEAN NOT NULL DEFAULT true,
      allow_unverified_researchers BOOLEAN NOT NULL DEFAULT false,
      allow_bulk_purchases BOOLEAN NOT NULL DEFAULT true,
      allow_sensitive_data_sharing BOOLEAN NOT NULL DEFAULT false,
      approved_researcher_ids TEXT,
      blocked_researcher_ids TEXT,
      approved_researcher_categories TEXT,
      blocked_researcher_categories TEXT,
      notify_on_data_access BOOLEAN NOT NULL DEFAULT true,
      notify_on_new_researcher BOOLEAN NOT NULL DEFAULT true,
      minimum_price_per_record DECIMAL(10, 2) DEFAULT 0.01,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (upi) REFERENCES patient_identities(upi) ON DELETE CASCADE
    )
  `);

  // Patient-Researcher Approvals Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS patient_researcher_approvals (
      id SERIAL PRIMARY KEY,
      upi VARCHAR(64) NOT NULL,
      researcher_id VARCHAR(32) NOT NULL,
      approval_status VARCHAR(20) NOT NULL,
      approved_at TIMESTAMP,
      revoked_at TIMESTAMP,
      conditions TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (approval_status IN ('approved', 'pending', 'rejected', 'revoked')),
      UNIQUE (upi, researcher_id),
      FOREIGN KEY (upi) REFERENCES patient_identities(upi) ON DELETE CASCADE,
      FOREIGN KEY (researcher_id) REFERENCES researchers(researcher_id) ON DELETE CASCADE
    )
  `);

  // Data Access History Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS data_access_history (
      id SERIAL PRIMARY KEY,
      upi VARCHAR(64) NOT NULL,
      researcher_id VARCHAR(32) NOT NULL,
      dataset_id VARCHAR(32),
      record_count INTEGER NOT NULL,
      accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      revenue_amount DECIMAL(18, 8),
      revenue_currency VARCHAR(10) DEFAULT 'HBAR',
      FOREIGN KEY (upi) REFERENCES patient_identities(upi) ON DELETE CASCADE,
      FOREIGN KEY (researcher_id) REFERENCES researchers(researcher_id) ON DELETE CASCADE,
      FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE SET NULL
    )
  `);

  // Temporary Hospital Access Requests Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS temporary_hospital_access (
      id SERIAL PRIMARY KEY,
      upi VARCHAR(64) NOT NULL,
      requesting_hospital_id VARCHAR(32) NOT NULL,
      original_hospital_id VARCHAR(32) NOT NULL,
      access_type VARCHAR(50) NOT NULL DEFAULT 'read',
      duration_minutes INTEGER NOT NULL,
      purpose TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      approved_at TIMESTAMP,
      expires_at TIMESTAMP,
      revoked_at TIMESTAMP,
      patient_notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'revoked', 'active')),
      CHECK (access_type IN ('read', 'read_write', 'telemedicine')),
      FOREIGN KEY (upi) REFERENCES patient_identities(upi) ON DELETE CASCADE,
      FOREIGN KEY (requesting_hospital_id) REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
      FOREIGN KEY (original_hospital_id) REFERENCES hospitals(hospital_id) ON DELETE CASCADE
    )
  `);

  // Withdrawal History Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS withdrawal_history (
      id SERIAL PRIMARY KEY,
      upi VARCHAR(64),
      hospital_id VARCHAR(32),
      user_type VARCHAR(20) NOT NULL,
      amount_hbar DECIMAL(20, 8) NOT NULL,
      amount_usd DECIMAL(10, 2) NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      destination_account VARCHAR(255) NOT NULL,
      transaction_id VARCHAR(100),
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      processed_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
      CHECK (user_type IN ('patient', 'hospital')),
      CHECK (payment_method IN ('bank', 'mobile_money'))
    )
  `);

  // Admins Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS admins (
      id SERIAL PRIMARY KEY,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      CHECK (status IN ('active', 'suspended', 'deleted')),
      CHECK (role IN ('admin', 'super_admin'))
    )
  `);

  // Researchers Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS researchers (
      researcher_id VARCHAR(32) PRIMARY KEY,
      hedera_account_id VARCHAR(20) UNIQUE,
      evm_address VARCHAR(42),
      encrypted_private_key TEXT,
      email VARCHAR(255) NOT NULL UNIQUE,
      organization_name VARCHAR(255) NOT NULL,
      contact_name VARCHAR(255),
      country VARCHAR(100),
      registration_number VARCHAR(255) NOT NULL,
      verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      verification_documents TEXT NOT NULL,
      verified_at TIMESTAMP,
      verified_by VARCHAR(255),
      access_level VARCHAR(20) NOT NULL DEFAULT 'basic',
      registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      CHECK (status IN ('active', 'suspended', 'deleted')),
      CHECK (verification_status IN ('pending', 'verified', 'rejected')),
      CHECK (access_level IN ('basic', 'verified', 'anonymous'))
    )
  `);

  // Create indexes
  await client.query(`CREATE INDEX IF NOT EXISTS idx_linkages_upi ON hospital_linkages(upi)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_linkages_hospital_id ON hospital_linkages(hospital_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_linkages_hospital_patient_id ON hospital_linkages(hospital_patient_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_contacts_upi ON patient_contacts(upi)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_contacts_email ON patient_contacts(email)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_contacts_phone ON patient_contacts(phone)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_contacts_national_id ON patient_contacts(national_id)`);
  // Enforce global uniqueness for email and phone (non-null) to prevent duplicates across patients
  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_email_unique ON patient_contacts(email) WHERE email IS NOT NULL`);
  await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_phone_unique ON patient_contacts(phone) WHERE phone IS NOT NULL`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_preferences_upi ON patient_data_preferences(upi)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_approvals_upi ON patient_researcher_approvals(upi)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_approvals_researcher ON patient_researcher_approvals(researcher_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_approvals_status ON patient_researcher_approvals(approval_status)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_access_history_upi ON data_access_history(upi)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_access_history_researcher ON data_access_history(researcher_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_access_history_date ON data_access_history(accessed_at)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_temp_access_upi ON temporary_hospital_access(upi)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_temp_access_requesting ON temporary_hospital_access(requesting_hospital_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_temp_access_original ON temporary_hospital_access(original_hospital_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_temp_access_status ON temporary_hospital_access(status)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_temp_access_expires ON temporary_hospital_access(expires_at)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_patients_hedera_account ON patient_identities(hedera_account_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_hospitals_hedera_account ON hospitals(hedera_account_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_researchers_email ON researchers(email)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_researchers_hedera_account ON researchers(hedera_account_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_researchers_verification_status ON researchers(verification_status)`);
  
  // Add evm_address columns if they don't exist (for existing databases - PostgreSQL)
  // PostgreSQL doesn't support IF NOT EXISTS with ADD COLUMN, so we check first
  try {
    const checkPatient = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='patient_identities' AND column_name='evm_address'
    `);
    if (checkPatient.rows.length === 0) {
      await client.query(`ALTER TABLE patient_identities ADD COLUMN evm_address VARCHAR(42)`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkHospital = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='hospitals' AND column_name='evm_address'
    `);
    if (checkHospital.rows.length === 0) {
      await client.query(`ALTER TABLE hospitals ADD COLUMN evm_address VARCHAR(42)`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkResearcher = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='researchers' AND column_name='evm_address'
    `);
    if (checkResearcher.rows.length === 0) {
      await client.query(`ALTER TABLE researchers ADD COLUMN evm_address VARCHAR(42)`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }

  // Add registration_number columns if they don't exist (for existing databases)
  try {
    const checkHospitalReg = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='hospitals' AND column_name='registration_number'
    `);
    if (checkHospitalReg.rows.length === 0) {
      await client.query(`ALTER TABLE hospitals ADD COLUMN registration_number VARCHAR(255)`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkResearcherReg = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='researchers' AND column_name='registration_number'
    `);
    if (checkResearcherReg.rows.length === 0) {
      await client.query(`ALTER TABLE researchers ADD COLUMN registration_number VARCHAR(255)`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }

  // Add payment method columns to patient_identities (for migration - PostgreSQL)
  try {
    const checkPatientPayment = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='patient_identities' AND column_name='payment_method'
    `);
    if (checkPatientPayment.rows.length === 0) {
      await client.query(`ALTER TABLE patient_identities ADD COLUMN payment_method VARCHAR(50)`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkPatientBank = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='patient_identities' AND column_name='bank_account_number'
    `);
    if (checkPatientBank.rows.length === 0) {
      await client.query(`ALTER TABLE patient_identities ADD COLUMN bank_account_number VARCHAR(255)`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkPatientBankName = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='patient_identities' AND column_name='bank_name'
    `);
    if (checkPatientBankName.rows.length === 0) {
      await client.query(`ALTER TABLE patient_identities ADD COLUMN bank_name VARCHAR(255)`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkPatientMobile = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='patient_identities' AND column_name='mobile_money_provider'
    `);
    if (checkPatientMobile.rows.length === 0) {
      await client.query(`ALTER TABLE patient_identities ADD COLUMN mobile_money_provider VARCHAR(50)`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkPatientMobileNum = await client.query(`
      SELECT column_name, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name='patient_identities' AND column_name='mobile_money_number'
    `);
    if (checkPatientMobileNum.rows.length === 0) {
      await client.query(`ALTER TABLE patient_identities ADD COLUMN mobile_money_number VARCHAR(255)`);
    } else if (checkPatientMobileNum.rows[0].character_maximum_length < 255) {
      // Resize existing column if it's too small
      await client.query(`ALTER TABLE patient_identities ALTER COLUMN mobile_money_number TYPE VARCHAR(255)`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkPatientThreshold = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='patient_identities' AND column_name='withdrawal_threshold_usd'
    `);
    if (checkPatientThreshold.rows.length === 0) {
      await client.query(`ALTER TABLE patient_identities ADD COLUMN withdrawal_threshold_usd DECIMAL(10, 2) DEFAULT 10.00`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkPatientAuto = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='patient_identities' AND column_name='auto_withdraw_enabled'
    `);
    if (checkPatientAuto.rows.length === 0) {
      await client.query(`ALTER TABLE patient_identities ADD COLUMN auto_withdraw_enabled BOOLEAN DEFAULT true`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkPatientLastWithdraw = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='patient_identities' AND column_name='last_withdrawal_at'
    `);
    if (checkPatientLastWithdraw.rows.length === 0) {
      await client.query(`ALTER TABLE patient_identities ADD COLUMN last_withdrawal_at TIMESTAMP`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkPatientTotal = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='patient_identities' AND column_name='total_withdrawn_usd'
    `);
    if (checkPatientTotal.rows.length === 0) {
      await client.query(`ALTER TABLE patient_identities ADD COLUMN total_withdrawn_usd DECIMAL(10, 2) DEFAULT 0.00`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }

  // Add payment method columns to hospitals (for migration - PostgreSQL)
  try {
    const checkHospitalPayment = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='hospitals' AND column_name='payment_method'
    `);
    if (checkHospitalPayment.rows.length === 0) {
      await client.query(`ALTER TABLE hospitals ADD COLUMN payment_method VARCHAR(50)`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkHospitalBank = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='hospitals' AND column_name='bank_account_number'
    `);
    if (checkHospitalBank.rows.length === 0) {
      await client.query(`ALTER TABLE hospitals ADD COLUMN bank_account_number VARCHAR(255)`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkHospitalBankName = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='hospitals' AND column_name='bank_name'
    `);
    if (checkHospitalBankName.rows.length === 0) {
      await client.query(`ALTER TABLE hospitals ADD COLUMN bank_name VARCHAR(255)`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkHospitalMobile = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='hospitals' AND column_name='mobile_money_provider'
    `);
    if (checkHospitalMobile.rows.length === 0) {
      await client.query(`ALTER TABLE hospitals ADD COLUMN mobile_money_provider VARCHAR(50)`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkHospitalMobileNum = await client.query(`
      SELECT column_name, character_maximum_length
      FROM information_schema.columns 
      WHERE table_name='hospitals' AND column_name='mobile_money_number'
    `);
    if (checkHospitalMobileNum.rows.length === 0) {
      await client.query(`ALTER TABLE hospitals ADD COLUMN mobile_money_number VARCHAR(255)`);
    } else if (checkHospitalMobileNum.rows[0].character_maximum_length < 255) {
      // Resize existing column if it's too small
      await client.query(`ALTER TABLE hospitals ALTER COLUMN mobile_money_number TYPE VARCHAR(255)`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkHospitalThreshold = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='hospitals' AND column_name='withdrawal_threshold_usd'
    `);
    if (checkHospitalThreshold.rows.length === 0) {
      await client.query(`ALTER TABLE hospitals ADD COLUMN withdrawal_threshold_usd DECIMAL(10, 2) DEFAULT 100.00`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkHospitalAuto = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='hospitals' AND column_name='auto_withdraw_enabled'
    `);
    if (checkHospitalAuto.rows.length === 0) {
      await client.query(`ALTER TABLE hospitals ADD COLUMN auto_withdraw_enabled BOOLEAN DEFAULT true`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkHospitalLastWithdraw = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='hospitals' AND column_name='last_withdrawal_at'
    `);
    if (checkHospitalLastWithdraw.rows.length === 0) {
      await client.query(`ALTER TABLE hospitals ADD COLUMN last_withdrawal_at TIMESTAMP`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }
  try {
    const checkHospitalTotal = await client.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name='hospitals' AND column_name='total_withdrawn_usd'
    `);
    if (checkHospitalTotal.rows.length === 0) {
      await client.query(`ALTER TABLE hospitals ADD COLUMN total_withdrawn_usd DECIMAL(10, 2) DEFAULT 0.00`);
    }
  } catch (e) {
    // Column already exists or error, ignore
  }

  // FHIR Patients Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS fhir_patients (
      id SERIAL PRIMARY KEY,
      anonymous_patient_id TEXT NOT NULL,
      upi VARCHAR(64) NOT NULL,
      country VARCHAR(100) NOT NULL,
      region VARCHAR(255),
      age_range VARCHAR(20),
      gender VARCHAR(20),
      hospital_id VARCHAR(32) NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (upi) REFERENCES patient_identities(upi),
      FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    )
  `);

  // FHIR Conditions Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS fhir_conditions (
      id SERIAL PRIMARY KEY,
      anonymous_patient_id TEXT NOT NULL,
      upi VARCHAR(64) NOT NULL,
      condition_code VARCHAR(20) NOT NULL,
      condition_name VARCHAR(255) NOT NULL,
      diagnosis_date DATE,
      hospital_id VARCHAR(32) NOT NULL,
      severity VARCHAR(50),
      status VARCHAR(50),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (upi) REFERENCES patient_identities(upi),
      FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    )
  `);

  // FHIR Observations Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS fhir_observations (
      id SERIAL PRIMARY KEY,
      anonymous_patient_id TEXT NOT NULL,
      upi VARCHAR(64) NOT NULL,
      observation_code VARCHAR(50) NOT NULL,
      observation_name VARCHAR(255) NOT NULL,
      value TEXT,
      unit VARCHAR(50),
      effective_date DATE NOT NULL,
      hospital_id VARCHAR(32) NOT NULL,
      reference_range TEXT,
      interpretation VARCHAR(50),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (upi) REFERENCES patient_identities(upi),
      FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    )
  `);

  // Datasets Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS datasets (
      id VARCHAR(32) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      hospital_id VARCHAR(32) NOT NULL,
      country VARCHAR(100) NOT NULL,
      record_count INTEGER NOT NULL DEFAULT 0,
      date_range_start DATE,
      date_range_end DATE,
      condition_codes TEXT,
      price DECIMAL(18, 8) NOT NULL,
      price_usd DECIMAL(18, 8),
      price_per_record_hbar DECIMAL(18, 8),
      price_per_record_usd DECIMAL(18, 8),
      pricing_category_id VARCHAR(32),
      pricing_category VARCHAR(100),
      volume_discount DECIMAL(5, 2) DEFAULT 0,
      currency VARCHAR(10) NOT NULL DEFAULT 'HBAR',
      format VARCHAR(20) NOT NULL DEFAULT 'FHIR',
      consent_type VARCHAR(50) NOT NULL,
      hcs_topic_id VARCHAR(50),
      consent_topic_id VARCHAR(50),
      data_topic_id VARCHAR(50),
      status VARCHAR(20) NOT NULL DEFAULT 'draft',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (status IN ('draft', 'active', 'archived', 'deleted')),
      FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    )
  `);

  // Query Logs Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS query_logs (
      id SERIAL PRIMARY KEY,
      researcher_id VARCHAR(32) NOT NULL,
      query_filters TEXT NOT NULL,
      result_count INTEGER NOT NULL,
      dataset_id VARCHAR(32),
      hcs_message_id VARCHAR(100),
      executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (researcher_id) REFERENCES researchers(researcher_id),
      FOREIGN KEY (dataset_id) REFERENCES datasets(id)
    )
  `);

  // Patient Consents Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS patient_consents (
      id SERIAL PRIMARY KEY,
      anonymous_patient_id VARCHAR(64) NOT NULL,
      upi VARCHAR(64) NOT NULL,
      consent_type VARCHAR(50) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      hcs_topic_id VARCHAR(50),
      consent_topic_id VARCHAR(50),
      data_hash VARCHAR(255),
      granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP,
      revoked_at TIMESTAMP,
      revoked_by VARCHAR(255),
      hospital_id VARCHAR(32),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (status IN ('active', 'revoked', 'expired')),
      CHECK (consent_type IN ('individual', 'hospital_verified', 'bulk')),
      FOREIGN KEY (upi) REFERENCES patient_identities(upi),
      FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    )
  `);

  // Purchases Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS purchases (
      id VARCHAR(32) PRIMARY KEY,
      researcher_id VARCHAR(32) NOT NULL,
      dataset_id VARCHAR(32) NOT NULL,
      amount DECIMAL(18, 8) NOT NULL,
      currency VARCHAR(10) NOT NULL DEFAULT 'HBAR',
      hedera_transaction_id VARCHAR(100),
      revenue_distribution_hash VARCHAR(255),
      access_type VARCHAR(50) NOT NULL DEFAULT 'download',
      access_expires_at TIMESTAMP,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      purchased_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
      FOREIGN KEY (researcher_id) REFERENCES researchers(researcher_id),
      FOREIGN KEY (dataset_id) REFERENCES datasets(id)
    )
  `);

  // Create indexes for FHIR tables
  await client.query(`CREATE INDEX IF NOT EXISTS idx_fhir_patients_anonymous_id ON fhir_patients(anonymous_patient_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_fhir_patients_upi ON fhir_patients(upi)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_fhir_patients_country ON fhir_patients(country)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_fhir_patients_hospital ON fhir_patients(hospital_id)`);
  
  await client.query(`CREATE INDEX IF NOT EXISTS idx_fhir_conditions_anonymous_id ON fhir_conditions(anonymous_patient_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_fhir_conditions_code ON fhir_conditions(condition_code)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_fhir_conditions_name ON fhir_conditions(condition_name)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_fhir_conditions_date ON fhir_conditions(diagnosis_date)`);
  
  await client.query(`CREATE INDEX IF NOT EXISTS idx_fhir_observations_anonymous_id ON fhir_observations(anonymous_patient_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_fhir_observations_code ON fhir_observations(observation_code)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_fhir_observations_name ON fhir_observations(observation_name)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_fhir_observations_date ON fhir_observations(effective_date)`);
  
  await client.query(`CREATE INDEX IF NOT EXISTS idx_datasets_hospital ON datasets(hospital_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_datasets_country ON datasets(country)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_datasets_status ON datasets(status)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_datasets_date_range ON datasets(date_range_start, date_range_end)`);
  
  await client.query(`CREATE INDEX IF NOT EXISTS idx_query_logs_researcher ON query_logs(researcher_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_query_logs_dataset ON query_logs(dataset_id)`);
  
  await client.query(`CREATE INDEX IF NOT EXISTS idx_purchases_researcher ON purchases(researcher_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_purchases_dataset ON purchases(dataset_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status)`);
  
  await client.query(`CREATE INDEX IF NOT EXISTS idx_consents_anonymous_id ON patient_consents(anonymous_patient_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_consents_upi ON patient_consents(upi)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_consents_status ON patient_consents(status)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_consents_type ON patient_consents(consent_type)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_consents_hospital ON patient_consents(hospital_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_consents_active ON patient_consents(status, expires_at) WHERE status = 'active'`);
}

/**
 * Create SQLite tables (development)
 */
async function createSQLiteTables() {
  const run = promisify(db.run.bind(db));

  // Patient Identities Table
  await run(`
    CREATE TABLE IF NOT EXISTS patient_identities (
      upi VARCHAR(64) PRIMARY KEY,
      hedera_account_id VARCHAR(20) UNIQUE,
      evm_address VARCHAR(42),
      encrypted_private_key TEXT,
      payment_method VARCHAR(50),
      bank_account_number VARCHAR(255),
      bank_name VARCHAR(255),
      mobile_money_provider VARCHAR(50),
      mobile_money_number VARCHAR(255),
      withdrawal_threshold_usd DECIMAL(10, 2) DEFAULT 10.00,
      auto_withdraw_enabled BOOLEAN DEFAULT 1,
      last_withdrawal_at TIMESTAMP,
      total_withdrawn_usd DECIMAL(10, 2) DEFAULT 0.00,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      CHECK (status IN ('active', 'suspended', 'deleted'))
    )
  `);

  // Hospitals Table
  await run(`
    CREATE TABLE IF NOT EXISTS hospitals (
      hospital_id VARCHAR(32) PRIMARY KEY,
      hedera_account_id VARCHAR(20) UNIQUE,
      evm_address VARCHAR(42),
      encrypted_private_key TEXT,
      name VARCHAR(255) NOT NULL,
      country VARCHAR(100) NOT NULL,
      location VARCHAR(255),
      fhir_endpoint VARCHAR(512),
      contact_email VARCHAR(255) NOT NULL,
      registration_number VARCHAR(255) NOT NULL,
      api_key_hash VARCHAR(255),
      payment_method VARCHAR(50),
      bank_account_number VARCHAR(255),
      bank_name VARCHAR(255),
      mobile_money_provider VARCHAR(50),
      mobile_money_number VARCHAR(255),
      withdrawal_threshold_usd DECIMAL(10, 2) DEFAULT 100.00,
      auto_withdraw_enabled BOOLEAN DEFAULT 1,
      last_withdrawal_at TIMESTAMP,
      total_withdrawn_usd DECIMAL(10, 2) DEFAULT 0.00,
      registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      verification_documents TEXT NOT NULL,
      verified_at TIMESTAMP,
      verified_by VARCHAR(255),
      CHECK (status IN ('active', 'suspended', 'deleted')),
      CHECK (verification_status IN ('pending', 'verified', 'rejected'))
    )
  `);

  // Add verification columns if they don't exist (for existing databases)
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN verification_status VARCHAR(20) DEFAULT 'pending'`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN verification_documents TEXT`);
  } catch (e) {
    // Column already exists, ignore
  }
  
  // Add evm_address columns if they don't exist (for existing databases)
  try {
    await run(`ALTER TABLE patient_identities ADD COLUMN evm_address VARCHAR(42)`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN evm_address VARCHAR(42)`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE researchers ADD COLUMN evm_address VARCHAR(42)`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN verified_at TIMESTAMP`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN verified_by VARCHAR(255)`);
  } catch (e) {
    // Column already exists, ignore
  }
  
  // Add registration_number columns if they don't exist (for existing databases)
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN registration_number VARCHAR(255)`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE researchers ADD COLUMN registration_number VARCHAR(255)`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Hospital Linkages Table
  await run(`
    CREATE TABLE IF NOT EXISTS hospital_linkages (
      id TEXT PRIMARY KEY,
      upi VARCHAR(64) NOT NULL,
      hospital_id VARCHAR(32) NOT NULL,
      hospital_patient_id VARCHAR(128) NOT NULL,
      linked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      verified BOOLEAN NOT NULL DEFAULT 0,
      verification_method VARCHAR(50) DEFAULT 'hospital_verification',
      encrypted_pii BLOB,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      CHECK (status IN ('active', 'disconnected', 'deleted')),
      UNIQUE (upi, hospital_id),
      FOREIGN KEY (upi) REFERENCES patient_identities(upi),
      FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    )
  `);

  // Patient Contacts Table
  await run(`
    CREATE TABLE IF NOT EXISTS patient_contacts (
      id TEXT PRIMARY KEY,
      upi VARCHAR(64) NOT NULL,
      email VARCHAR(255),
      phone VARCHAR(50),
      national_id VARCHAR(100),
      verified BOOLEAN NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (upi) REFERENCES patient_identities(upi) ON DELETE CASCADE
    )
  `);

  // Patient Data Preferences Table
  await run(`
    CREATE TABLE IF NOT EXISTS patient_data_preferences (
      upi VARCHAR(64) PRIMARY KEY,
      global_sharing_enabled BOOLEAN NOT NULL DEFAULT 1,
      allow_verified_researchers BOOLEAN NOT NULL DEFAULT 1,
      allow_unverified_researchers BOOLEAN NOT NULL DEFAULT 0,
      allow_bulk_purchases BOOLEAN NOT NULL DEFAULT 1,
      allow_sensitive_data_sharing BOOLEAN NOT NULL DEFAULT 0,
      approved_researcher_ids TEXT,
      blocked_researcher_ids TEXT,
      approved_researcher_categories TEXT,
      blocked_researcher_categories TEXT,
      notify_on_data_access BOOLEAN NOT NULL DEFAULT 1,
      notify_on_new_researcher BOOLEAN NOT NULL DEFAULT 1,
      minimum_price_per_record REAL DEFAULT 0.01,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (upi) REFERENCES patient_identities(upi) ON DELETE CASCADE
    )
  `);

  // Patient-Researcher Approvals Table
  await run(`
    CREATE TABLE IF NOT EXISTS patient_researcher_approvals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      upi VARCHAR(64) NOT NULL,
      researcher_id VARCHAR(32) NOT NULL,
      approval_status VARCHAR(20) NOT NULL,
      approved_at TIMESTAMP,
      revoked_at TIMESTAMP,
      conditions TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (approval_status IN ('approved', 'pending', 'rejected', 'revoked')),
      UNIQUE (upi, researcher_id),
      FOREIGN KEY (upi) REFERENCES patient_identities(upi) ON DELETE CASCADE,
      FOREIGN KEY (researcher_id) REFERENCES researchers(researcher_id) ON DELETE CASCADE
    )
  `);

  // Data Access History Table
  await run(`
    CREATE TABLE IF NOT EXISTS data_access_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      upi VARCHAR(64) NOT NULL,
      researcher_id VARCHAR(32) NOT NULL,
      dataset_id VARCHAR(32),
      record_count INTEGER NOT NULL,
      accessed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      revenue_amount REAL,
      revenue_currency VARCHAR(10) DEFAULT 'HBAR',
      FOREIGN KEY (upi) REFERENCES patient_identities(upi) ON DELETE CASCADE,
      FOREIGN KEY (researcher_id) REFERENCES researchers(researcher_id) ON DELETE CASCADE,
      FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE SET NULL
    )
  `);

  // Temporary Hospital Access Requests Table
  await run(`
    CREATE TABLE IF NOT EXISTS temporary_hospital_access (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      upi VARCHAR(64) NOT NULL,
      requesting_hospital_id VARCHAR(32) NOT NULL,
      original_hospital_id VARCHAR(32) NOT NULL,
      access_type VARCHAR(50) NOT NULL DEFAULT 'read',
      duration_minutes INTEGER NOT NULL,
      purpose TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      approved_at TIMESTAMP,
      expires_at TIMESTAMP,
      revoked_at TIMESTAMP,
      patient_notes TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'revoked', 'active')),
      CHECK (access_type IN ('read', 'read_write', 'telemedicine')),
      FOREIGN KEY (upi) REFERENCES patient_identities(upi) ON DELETE CASCADE,
      FOREIGN KEY (requesting_hospital_id) REFERENCES hospitals(hospital_id) ON DELETE CASCADE,
      FOREIGN KEY (original_hospital_id) REFERENCES hospitals(hospital_id) ON DELETE CASCADE
    )
  `);

  // Withdrawal History Table
  await run(`
    CREATE TABLE IF NOT EXISTS withdrawal_history (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      upi VARCHAR(64),
      hospital_id VARCHAR(32),
      user_type VARCHAR(20) NOT NULL,
      amount_hbar DECIMAL(20, 8) NOT NULL,
      amount_usd DECIMAL(10, 2) NOT NULL,
      payment_method VARCHAR(50) NOT NULL,
      destination_account VARCHAR(255) NOT NULL,
      transaction_id VARCHAR(100),
      status VARCHAR(20) NOT NULL DEFAULT 'pending',
      processed_at TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
      CHECK (user_type IN ('patient', 'hospital')),
      CHECK (payment_method IN ('bank', 'mobile_money'))
    )
  `);

  // Admins Table
  await run(`
    CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'admin',
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_login TIMESTAMP,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      CHECK (status IN ('active', 'suspended', 'deleted')),
      CHECK (role IN ('admin', 'super_admin'))
    )
  `);

  // Researchers Table
  await run(`
    CREATE TABLE IF NOT EXISTS researchers (
      researcher_id VARCHAR(32) PRIMARY KEY,
      hedera_account_id VARCHAR(20) UNIQUE,
      evm_address VARCHAR(42),
      encrypted_private_key TEXT,
      email VARCHAR(255) NOT NULL UNIQUE,
      organization_name VARCHAR(255) NOT NULL,
      contact_name VARCHAR(255),
      country VARCHAR(100),
      registration_number VARCHAR(255) NOT NULL,
      verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      verification_documents TEXT NOT NULL,
      verified_at TIMESTAMP,
      verified_by VARCHAR(255),
      access_level VARCHAR(20) NOT NULL DEFAULT 'basic',
      registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      CHECK (status IN ('active', 'suspended', 'deleted')),
      CHECK (verification_status IN ('pending', 'verified', 'rejected')),
      CHECK (access_level IN ('basic', 'verified', 'anonymous'))
    )
  `);

  // Create indexes
  await run(`CREATE INDEX IF NOT EXISTS idx_linkages_upi ON hospital_linkages(upi)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_linkages_hospital_id ON hospital_linkages(hospital_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_linkages_hospital_patient_id ON hospital_linkages(hospital_patient_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_contacts_upi ON patient_contacts(upi)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_contacts_email ON patient_contacts(email)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_contacts_phone ON patient_contacts(phone)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_contacts_national_id ON patient_contacts(national_id)`);
  // Enforce global uniqueness for email and phone to prevent duplicates across patients
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_email_unique ON patient_contacts(email)`);
  await run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_contacts_phone_unique ON patient_contacts(phone)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_preferences_upi ON patient_data_preferences(upi)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_approvals_upi ON patient_researcher_approvals(upi)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_approvals_researcher ON patient_researcher_approvals(researcher_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_approvals_status ON patient_researcher_approvals(approval_status)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_access_history_upi ON data_access_history(upi)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_access_history_researcher ON data_access_history(researcher_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_access_history_date ON data_access_history(accessed_at)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_temp_access_upi ON temporary_hospital_access(upi)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_temp_access_requesting ON temporary_hospital_access(requesting_hospital_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_temp_access_original ON temporary_hospital_access(original_hospital_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_temp_access_status ON temporary_hospital_access(status)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_temp_access_expires ON temporary_hospital_access(expires_at)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_patients_hedera_account ON patient_identities(hedera_account_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_hospitals_hedera_account ON hospitals(hedera_account_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_researchers_email ON researchers(email)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_researchers_hedera_account ON researchers(hedera_account_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_researchers_verification_status ON researchers(verification_status)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_withdrawal_history_upi ON withdrawal_history(upi)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_withdrawal_history_hospital_id ON withdrawal_history(hospital_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_withdrawal_history_status ON withdrawal_history(status)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_withdrawal_history_created_at ON withdrawal_history(created_at)`);
  
  // Add Hedera account columns to existing tables (for migration)
  try {
    await run(`ALTER TABLE patient_identities ADD COLUMN hedera_account_id VARCHAR(20) UNIQUE`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE patient_identities ADD COLUMN encrypted_private_key TEXT`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN hedera_account_id VARCHAR(20) UNIQUE`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN encrypted_private_key TEXT`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Add Hedera account columns to researchers table (for migration)
  try {
    await run(`ALTER TABLE researchers ADD COLUMN hedera_account_id VARCHAR(20) UNIQUE`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE researchers ADD COLUMN encrypted_private_key TEXT`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Add payment method columns to patient_identities (for migration)
  try {
    await run(`ALTER TABLE patient_identities ADD COLUMN payment_method VARCHAR(50)`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE patient_identities ADD COLUMN bank_account_number VARCHAR(255)`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE patient_identities ADD COLUMN bank_name VARCHAR(255)`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE patient_identities ADD COLUMN mobile_money_provider VARCHAR(50)`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE patient_identities ADD COLUMN mobile_money_number VARCHAR(255)`);
  } catch (e) {
    // Column already exists, try to resize if it's too small
    try {
      await run(`ALTER TABLE patient_identities ALTER COLUMN mobile_money_number VARCHAR(255)`);
    } catch (e2) {
      // SQLite doesn't support ALTER COLUMN, would need to recreate table
      // For now, just ignore - existing data will need manual migration
    }
  }
  try {
    await run(`ALTER TABLE patient_identities ADD COLUMN withdrawal_threshold_usd DECIMAL(10, 2) DEFAULT 10.00`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE patient_identities ADD COLUMN auto_withdraw_enabled BOOLEAN DEFAULT 1`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE patient_identities ADD COLUMN last_withdrawal_at TIMESTAMP`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE patient_identities ADD COLUMN total_withdrawn_usd DECIMAL(10, 2) DEFAULT 0.00`);
  } catch (e) {
    // Column already exists, ignore
  }

  // Add payment method columns to hospitals (for migration)
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN payment_method VARCHAR(50)`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN bank_account_number VARCHAR(255)`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN bank_name VARCHAR(255)`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN mobile_money_provider VARCHAR(50)`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN mobile_money_number VARCHAR(255)`);
  } catch (e) {
    // Column already exists, try to resize if it's too small
    try {
      await run(`ALTER TABLE hospitals ALTER COLUMN mobile_money_number VARCHAR(255)`);
    } catch (e2) {
      // SQLite doesn't support ALTER COLUMN, would need to recreate table
      // For now, just ignore - existing data will need manual migration
    }
  }
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN withdrawal_threshold_usd DECIMAL(10, 2) DEFAULT 100.00`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN auto_withdraw_enabled BOOLEAN DEFAULT 1`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN last_withdrawal_at TIMESTAMP`);
  } catch (e) {
    // Column already exists, ignore
  }
  try {
    await run(`ALTER TABLE hospitals ADD COLUMN total_withdrawn_usd DECIMAL(10, 2) DEFAULT 0.00`);
  } catch (e) {
    // Column already exists, ignore
  }

  // FHIR Patients Table
  await run(`
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
      FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    )
  `);

  // FHIR Conditions Table
  await run(`
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
      FOREIGN KEY (upi) REFERENCES patient_identities(upi),
      FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    )
  `);

  // FHIR Observations Table
  await run(`
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
      FOREIGN KEY (upi) REFERENCES patient_identities(upi),
      FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    )
  `);

  // Datasets Table
  await run(`
    CREATE TABLE IF NOT EXISTS datasets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      hospital_id TEXT NOT NULL,
      country TEXT NOT NULL,
      record_count INTEGER NOT NULL DEFAULT 0,
      date_range_start DATE,
      date_range_end DATE,
      condition_codes TEXT,
      price REAL NOT NULL,
      price_usd REAL,
      price_per_record_hbar REAL,
      price_per_record_usd REAL,
      pricing_category_id TEXT,
      pricing_category TEXT,
      volume_discount REAL DEFAULT 0,
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
      FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    )
  `);

  // Query Logs Table
  await run(`
    CREATE TABLE IF NOT EXISTS query_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      researcher_id TEXT NOT NULL,
      query_filters TEXT NOT NULL,
      result_count INTEGER NOT NULL,
      dataset_id TEXT,
      hcs_message_id TEXT,
      executed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (researcher_id) REFERENCES researchers(researcher_id),
      FOREIGN KEY (dataset_id) REFERENCES datasets(id)
    )
  `);

  // Patient Consents Table
  await run(`
    CREATE TABLE IF NOT EXISTS patient_consents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      anonymous_patient_id TEXT NOT NULL,
      upi TEXT NOT NULL,
      consent_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active',
      hcs_topic_id TEXT,
      consent_topic_id TEXT,
      data_hash TEXT,
      granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      expires_at TIMESTAMP,
      revoked_at TIMESTAMP,
      revoked_by TEXT,
      hospital_id TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (status IN ('active', 'revoked', 'expired')),
      CHECK (consent_type IN ('individual', 'hospital_verified', 'bulk')),
      FOREIGN KEY (upi) REFERENCES patient_identities(upi),
      FOREIGN KEY (hospital_id) REFERENCES hospitals(hospital_id)
    )
  `);

  // Purchases Table
  await run(`
    CREATE TABLE IF NOT EXISTS purchases (
      id TEXT PRIMARY KEY,
      researcher_id TEXT NOT NULL,
      dataset_id TEXT NOT NULL,
      amount REAL NOT NULL,
      currency TEXT NOT NULL DEFAULT 'HBAR',
      hedera_transaction_id TEXT,
      revenue_distribution_hash TEXT,
      access_type TEXT NOT NULL DEFAULT 'download',
      access_expires_at TIMESTAMP,
      status TEXT NOT NULL DEFAULT 'pending',
      purchased_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
      FOREIGN KEY (researcher_id) REFERENCES researchers(researcher_id),
      FOREIGN KEY (dataset_id) REFERENCES datasets(id)
    )
  `);

  // Create indexes for FHIR tables
  await run(`CREATE INDEX IF NOT EXISTS idx_fhir_patients_anonymous_id ON fhir_patients(anonymous_patient_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_fhir_patients_upi ON fhir_patients(upi)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_fhir_patients_country ON fhir_patients(country)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_fhir_patients_hospital ON fhir_patients(hospital_id)`);
  
  await run(`CREATE INDEX IF NOT EXISTS idx_fhir_conditions_anonymous_id ON fhir_conditions(anonymous_patient_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_fhir_conditions_code ON fhir_conditions(condition_code)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_fhir_conditions_name ON fhir_conditions(condition_name)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_fhir_conditions_date ON fhir_conditions(diagnosis_date)`);
  
  await run(`CREATE INDEX IF NOT EXISTS idx_fhir_observations_anonymous_id ON fhir_observations(anonymous_patient_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_fhir_observations_code ON fhir_observations(observation_code)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_fhir_observations_name ON fhir_observations(observation_name)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_fhir_observations_date ON fhir_observations(effective_date)`);
  
  await run(`CREATE INDEX IF NOT EXISTS idx_datasets_hospital ON datasets(hospital_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_datasets_country ON datasets(country)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_datasets_status ON datasets(status)`);
  
  await run(`CREATE INDEX IF NOT EXISTS idx_query_logs_researcher ON query_logs(researcher_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_query_logs_dataset ON query_logs(dataset_id)`);
  
  await run(`CREATE INDEX IF NOT EXISTS idx_purchases_researcher ON purchases(researcher_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_purchases_dataset ON purchases(dataset_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(status)`);
  
  await run(`CREATE INDEX IF NOT EXISTS idx_consents_anonymous_id ON patient_consents(anonymous_patient_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_consents_upi ON patient_consents(upi)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_consents_status ON patient_consents(status)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_consents_type ON patient_consents(consent_type)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_consents_hospital ON patient_consents(hospital_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_consents_active ON patient_consents(status, expires_at) WHERE status = 'active'`);
}

/**
 * Get database instance
 */
export function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

/**
 * Get database type
 */
export function getDatabaseType() {
  return dbType;
}

/**
 * Execute a query (works for both SQLite and PostgreSQL)
 */
export async function query(sql, params = []) {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }

  if (dbType === 'postgresql') {
    const result = await db.query(sql, params);
    return {
      rows: result.rows,
      changes: result.rowCount || 0,
    };
  } else {
    const run = promisify(db.run.bind(db));
    const all = promisify(db.all.bind(db));
    
    // For SELECT queries, use all()
    if (sql.trim().toUpperCase().startsWith('SELECT')) {
      const rows = await all(sql, params);
      return { rows, changes: rows.length };
    } else {
      // For INSERT/UPDATE/DELETE, use run()
      const result = await run(sql, params);
      return {
        rows: [],
        changes: result.changes || 0,
        lastID: result.lastID,
      };
    }
  }
}

/**
 * Convert SQLite-style ? placeholders to PostgreSQL $1, $2, $3 style
 */
function convertPlaceholders(sql) {
  if (dbType === 'postgresql') {
    let paramIndex = 1;
    return sql.replace(/\?/g, () => `$${paramIndex++}`);
  }
  return sql;
}

/**
 * Run a query (INSERT/UPDATE/DELETE) - returns changes count
 */
export async function run(sql, params = []) {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }

  const convertedSql = convertPlaceholders(sql);

  if (dbType === 'postgresql') {
    const result = await db.query(convertedSql, params);
    return {
      changes: result.rowCount || 0,
      lastID: null, // PostgreSQL uses RETURNING clause instead
    };
  } else {
    // SQLite db.run() uses callback pattern - need to wrap it properly
    return new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            changes: this.changes || 0,
            lastID: this.lastID,
          });
        }
      });
    });
  }
}

/**
 * Get a single row (SELECT with LIMIT 1)
 */
export async function get(sql, params = []) {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }

  const convertedSql = convertPlaceholders(sql);

  if (dbType === 'postgresql') {
    const result = await db.query(convertedSql, params);
    return result.rows[0] || null;
  } else {
    const getQuery = promisify(db.get.bind(db));
    return await getQuery(sql, params);
  }
}

/**
 * Get all rows (SELECT)
 */
export async function all(sql, params = []) {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }

  const convertedSql = convertPlaceholders(sql);

  if (dbType === 'postgresql') {
    const result = await db.query(convertedSql, params);
    return result.rows;
  } else {
    const allQuery = promisify(db.all.bind(db));
    return await allQuery(sql, params);
  }
}

/**
 * Close database connection
 */
export async function closeDatabase() {
  if (!db) {
    return;
  }

  if (dbType === 'postgresql') {
    await db.end();
    console.log('📦 Database connection closed');
  } else {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('📦 Database connection closed');
          resolve();
        }
      });
    });
  }
}
