/**
 * Database Layer
 * 
 * SQLite database implementation for patient identity management.
 * Provides persistence for patient identities, hospitals, and linkages.
 * 
 * ⚠️ DEVELOPMENT ONLY: This uses SQLite for development convenience.
 * 🚀 PRODUCTION: Will migrate to PostgreSQL for:
 *    - Better concurrency and scalability
 *    - Built-in encryption (pgcrypto)
 *    - Row-level security (RLS)
 *    - HIPAA compliance features
 *    - Better performance at scale
 */

import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database file path
const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../data/medipact.db');

let db = null;

/**
 * Initialize database connection
 */
export async function initDatabase() {
  return new Promise((resolve, reject) => {
    // Ensure data directory exists
    const dbDir = path.dirname(DB_PATH);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        console.log(`📦 Database connected: ${DB_PATH}`);
        createTables().then(resolve).catch(reject);
      }
    });
  });
}

/**
 * Create database tables
 */
async function createTables() {
  const run = promisify(db.run.bind(db));

  // Patient Identities Table
  await run(`
    CREATE TABLE IF NOT EXISTS patient_identities (
      upi VARCHAR(64) PRIMARY KEY,
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
      name VARCHAR(255) NOT NULL,
      country VARCHAR(100) NOT NULL,
      location VARCHAR(255),
      fhir_endpoint VARCHAR(512),
      contact_email VARCHAR(255),
      api_key_hash VARCHAR(255),
      registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      verification_documents TEXT,
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

  // Patient Contacts Table (for email/phone/national ID lookup)
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

  // Create indexes
  await run(`CREATE INDEX IF NOT EXISTS idx_linkages_upi ON hospital_linkages(upi)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_linkages_hospital_id ON hospital_linkages(hospital_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_linkages_hospital_patient_id ON hospital_linkages(hospital_patient_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_contacts_upi ON patient_contacts(upi)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_contacts_email ON patient_contacts(email)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_contacts_phone ON patient_contacts(phone)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_contacts_national_id ON patient_contacts(national_id)`);

  console.log('✅ Database tables created');
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
 * Close database connection
 */
export async function closeDatabase() {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          console.log('📦 Database connection closed');
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
}

