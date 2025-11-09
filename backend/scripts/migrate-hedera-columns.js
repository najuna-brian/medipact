#!/usr/bin/env node

/**
 * Migration Script: Add Hedera Account Columns
 * 
 * Adds hedera_account_id and encrypted_private_key columns to existing tables.
 */

import { initDatabase, getDatabase, closeDatabase } from '../src/db/database.js';
import { promisify } from 'util';

async function migrate() {
  try {
    console.log('🔄 Migrating database to add Hedera account columns...\n');
    
    await initDatabase();
    const db = getDatabase();
    const run = promisify(db.run.bind(db));
    
    // Check if columns exist
    const all = promisify(db.all.bind(db));
    
    // Get table info (handle errors if table doesn't exist)
    let patientColumns = [];
    let hospitalColumns = [];
    
    try {
      patientColumns = await all(`PRAGMA table_info(patient_identities)`);
    } catch (e) {
      console.log('⚠️  patient_identities table does not exist yet');
    }
    
    try {
      hospitalColumns = await all(`PRAGMA table_info(hospitals)`);
    } catch (e) {
      console.log('⚠️  hospitals table does not exist yet');
    }
    
    const patientHasHedera = patientColumns.some(col => col.name === 'hedera_account_id');
    const patientHasKey = patientColumns.some(col => col.name === 'encrypted_private_key');
    const hospitalHasHedera = hospitalColumns.some(col => col.name === 'hedera_account_id');
    const hospitalHasKey = hospitalColumns.some(col => col.name === 'encrypted_private_key');
    
    console.log('Current schema:');
    console.log(`  patient_identities: hedera_account_id=${patientHasHedera}, encrypted_private_key=${patientHasKey}`);
    console.log(`  hospitals: hedera_account_id=${hospitalHasHedera}, encrypted_private_key=${hospitalHasKey}`);
    console.log('');
    
    // Add columns if missing
    if (!patientHasHedera) {
      console.log('Adding hedera_account_id to patient_identities...');
      await run(`ALTER TABLE patient_identities ADD COLUMN hedera_account_id VARCHAR(20) UNIQUE`);
      console.log('✅ Added hedera_account_id to patient_identities');
    } else {
      console.log('✅ patient_identities.hedera_account_id already exists');
    }
    
    if (!patientHasKey) {
      console.log('Adding encrypted_private_key to patient_identities...');
      await run(`ALTER TABLE patient_identities ADD COLUMN encrypted_private_key TEXT`);
      console.log('✅ Added encrypted_private_key to patient_identities');
    } else {
      console.log('✅ patient_identities.encrypted_private_key already exists');
    }
    
    if (!hospitalHasHedera) {
      console.log('Adding hedera_account_id to hospitals...');
      await run(`ALTER TABLE hospitals ADD COLUMN hedera_account_id VARCHAR(20) UNIQUE`);
      console.log('✅ Added hedera_account_id to hospitals');
    } else {
      console.log('✅ hospitals.hedera_account_id already exists');
    }
    
    if (!hospitalHasKey) {
      console.log('Adding encrypted_private_key to hospitals...');
      await run(`ALTER TABLE hospitals ADD COLUMN encrypted_private_key TEXT`);
      console.log('✅ Added encrypted_private_key to hospitals');
    } else {
      console.log('✅ hospitals.encrypted_private_key already exists');
    }
    
    // Create indexes
    console.log('\nCreating indexes...');
    try {
      await run(`CREATE INDEX IF NOT EXISTS idx_patients_hedera_account ON patient_identities(hedera_account_id)`);
      console.log('✅ Created index on patient_identities(hedera_account_id)');
    } catch (e) {
      console.log('✅ Index on patient_identities(hedera_account_id) already exists');
    }
    
    try {
      await run(`CREATE INDEX IF NOT EXISTS idx_hospitals_hedera_account ON hospitals(hedera_account_id)`);
      console.log('✅ Created index on hospitals(hedera_account_id)');
    } catch (e) {
      console.log('✅ Index on hospitals(hedera_account_id) already exists');
    }
    
    console.log('\n✅ Migration complete!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

migrate();

