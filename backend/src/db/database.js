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
    
    console.log('📦 Database connected: PostgreSQL (Supabase)');
    
    // Create tables
    await createTables();
    
    return;
  } catch (error) {
    console.error('❌ Error connecting to PostgreSQL:', error);
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

    db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
      } else {
        dbType = 'sqlite';
        console.log(`📦 Database connected: SQLite (${DB_PATH})`);
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
      encrypted_private_key TEXT,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      status VARCHAR(20) NOT NULL DEFAULT 'active',
      CHECK (status IN ('active', 'suspended', 'deleted'))
    )
  `);

  // Hospitals Table
  await client.query(`
    CREATE TABLE IF NOT EXISTS hospitals (
      hospital_id VARCHAR(32) PRIMARY KEY,
      hedera_account_id VARCHAR(20) UNIQUE,
      encrypted_private_key TEXT,
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
      encrypted_private_key TEXT,
      email VARCHAR(255) NOT NULL UNIQUE,
      organization_name VARCHAR(255) NOT NULL,
      contact_name VARCHAR(255),
      country VARCHAR(100),
      verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      verification_documents TEXT,
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
  await client.query(`CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_patients_hedera_account ON patient_identities(hedera_account_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_hospitals_hedera_account ON hospitals(hedera_account_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_researchers_email ON researchers(email)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_researchers_hedera_account ON researchers(hedera_account_id)`);
  await client.query(`CREATE INDEX IF NOT EXISTS idx_researchers_verification_status ON researchers(verification_status)`);
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
      encrypted_private_key TEXT,
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
      encrypted_private_key TEXT,
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
      encrypted_private_key TEXT,
      email VARCHAR(255) NOT NULL UNIQUE,
      organization_name VARCHAR(255) NOT NULL,
      contact_name VARCHAR(255),
      country VARCHAR(100),
      verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
      verification_documents TEXT,
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
  await run(`CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_patients_hedera_account ON patient_identities(hedera_account_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_hospitals_hedera_account ON hospitals(hedera_account_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_researchers_email ON researchers(email)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_researchers_hedera_account ON researchers(hedera_account_id)`);
  await run(`CREATE INDEX IF NOT EXISTS idx_researchers_verification_status ON researchers(verification_status)`);
  
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
    const runQuery = promisify(db.run.bind(db));
    const result = await runQuery(sql, params);
    return {
      changes: result.changes || 0,
      lastID: result.lastID,
    };
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
