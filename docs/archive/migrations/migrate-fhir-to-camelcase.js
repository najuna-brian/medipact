/**
 * Migration Script: Convert FHIR tables from snake_case to camelCase
 * 
 * This script:
 * 1. Drops existing FHIR tables (if they exist and are empty)
 * 2. Recreates them with camelCase column names (quoted identifiers)
 * 
 * WARNING: This will DELETE all data in FHIR tables!
 * Only run this if tables are empty or you have a backup.
 */

import { initDatabase, getDatabase, getDatabaseType } from '../src/db/database.js';
import { CompleteFHIRSchema } from '../src/models/fhir-complete-schema.js';
import { promisify } from 'util';

async function migrateFHIRToCamelCase() {
  // Check for --force flag
  const force = process.argv.includes('--force') || process.argv.includes('-f');
  
  // Initialize database first
  console.log('[Migration] Initializing database connection...');
  try {
    await initDatabase();
  } catch (error) {
    // If initialization fails due to constraint errors in non-FHIR tables,
    // that's okay - we just need the connection for FHIR tables
    console.log(`[Migration] Note: Database initialization warning: ${error.message}`);
    console.log('[Migration] Continuing with FHIR migration...');
  }
  
  const db = getDatabase();
  const dbType = getDatabaseType();
  
  if (!db) {
    throw new Error('Database connection not available');
  }
  
  console.log(`[Migration] Starting FHIR schema migration to camelCase (${dbType})...`);
  if (force) {
    console.log('[Migration] ⚠️  FORCE mode enabled - will proceed even if data exists');
  }
  
  if (dbType === 'postgresql') {
    // PostgreSQL: Drop and recreate tables
    const tables = [
      'fhir_patients',
      'fhir_related_persons',
      'fhir_coverage',
      'fhir_encounters',
      'fhir_conditions',
      'fhir_allergies',
      'fhir_observations',
      'fhir_observation_components',
      'fhir_specimens',
      'fhir_diagnostic_reports',
      'fhir_medication_requests',
      'fhir_medication_administrations',
      'fhir_medication_statements',
      'fhir_procedures',
      'fhir_imaging_studies',
      'fhir_vital_signs',
      'fhir_sdoh',
      'fhir_provenance',
      'fhir_audit_events',
      'fhir_immunizations',
      'fhir_care_plans',
      'fhir_care_teams',
      'fhir_devices',
      'fhir_organizations',
      'fhir_practitioners'
    ];
    
    // Check if tables have data
    console.log('[Migration] Checking for existing data...');
    let hasData = false;
    for (const table of tables) {
      try {
        const result = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
        const count = parseInt(result.rows[0]?.count || 0);
        if (count > 0) {
          console.warn(`[Migration] ⚠️  Table ${table} has ${count} rows!`);
          hasData = true;
        }
      } catch (error) {
        // Table doesn't exist, that's fine
        console.log(`[Migration] Table ${table} doesn't exist yet`);
      }
    }
    
    if (hasData && !force) {
      console.error('[Migration] ❌ ERROR: Some tables contain data!');
      console.error('[Migration] This migration will DELETE all FHIR data!');
      console.error('[Migration] Please backup your data or confirm tables are empty.');
      console.error('[Migration] To proceed anyway, run with --force flag: node scripts/migrate-fhir-to-camelcase.js --force');
      process.exit(1);
    }
    
    if (hasData && force) {
      console.warn('[Migration] ⚠️  WARNING: Tables contain data but --force flag is set.');
      console.warn('[Migration] ⚠️  All FHIR data will be DELETED!');
      console.warn('[Migration] ⚠️  Proceeding in 3 seconds... (Ctrl+C to cancel)');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Drop existing tables (in reverse dependency order)
    // Use CASCADE to automatically drop dependent objects
    console.log('[Migration] Dropping existing FHIR tables...');
    const dropOrder = [
      'fhir_observation_components',
      'fhir_audit_events',
      'fhir_provenance',
      'fhir_vital_signs',
      'fhir_sdoh',
      'fhir_imaging_studies',
      'fhir_procedures',
      'fhir_medication_statements',
      'fhir_medication_administrations',
      'fhir_medication_requests',
      'fhir_diagnostic_reports',
      'fhir_specimens',
      'fhir_observations',
      'fhir_allergies',
      'fhir_conditions',
      'fhir_encounters',
      'fhir_coverage',
      'fhir_related_persons',
      'fhir_patients',
      'fhir_immunizations',
      'fhir_care_plans',
      'fhir_care_teams',
      'fhir_devices',
      'fhir_practitioners',
      'fhir_organizations'
    ];
    
    for (const table of dropOrder) {
      try {
        await db.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`[Migration] ✓ Dropped ${table}`);
      } catch (error) {
        // Ignore errors - table might not exist or might have dependencies
        console.log(`[Migration] Note: Could not drop ${table}: ${error.message}`);
      }
    }
    
    // Recreate tables with new schema
    console.log('[Migration] Creating tables with camelCase schema...');
    await db.query(CompleteFHIRSchema);
    console.log('[Migration] ✓ Created all FHIR tables with camelCase columns');
    
  } else {
    // SQLite: Drop and recreate tables
    console.log('[Migration] SQLite migration...');
    
    const run = promisify(db.run.bind(db));
    
    // Check if tables have data
    console.log('[Migration] Checking for existing data...');
    let hasData = false;
    const tables = [
      'fhir_patients', 'fhir_conditions', 'fhir_observations', 'fhir_encounters'
    ];
    
    for (const table of tables) {
      try {
        const all = promisify(db.all.bind(db));
        const rows = await all(`SELECT COUNT(*) as count FROM ${table}`);
        const count = parseInt(rows[0]?.count || 0);
        if (count > 0) {
          console.warn(`[Migration] ⚠️  Table ${table} has ${count} rows!`);
          hasData = true;
        }
      } catch (error) {
        // Table doesn't exist, that's fine
      }
    }
    
    if (hasData && !force) {
      console.error('[Migration] ❌ ERROR: Some tables contain data!');
      console.error('[Migration] This migration will DELETE all FHIR data!');
      console.error('[Migration] Please backup your data or confirm tables are empty.');
      console.error('[Migration] To proceed anyway, run with --force flag: node scripts/migrate-fhir-to-camelcase.js --force');
      process.exit(1);
    }
    
    if (hasData && force) {
      console.warn('[Migration] ⚠️  WARNING: Tables contain data but --force flag is set.');
      console.warn('[Migration] ⚠️  All FHIR data will be DELETED!');
      console.warn('[Migration] ⚠️  Proceeding in 3 seconds... (Ctrl+C to cancel)');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    // Drop existing tables
    console.log('[Migration] Dropping existing FHIR tables...');
    const dropOrder = [
      'fhir_observation_components',
      'fhir_vital_signs',
      'fhir_sdoh',
      'fhir_imaging_studies',
      'fhir_procedures',
      'fhir_medication_statements',
      'fhir_medication_administrations',
      'fhir_medication_requests',
      'fhir_diagnostic_reports',
      'fhir_specimens',
      'fhir_observations',
      'fhir_allergies',
      'fhir_conditions',
      'fhir_encounters',
      'fhir_coverage',
      'fhir_related_persons',
      'fhir_patients',
      'fhir_immunizations',
      'fhir_care_plans',
      'fhir_care_teams',
      'fhir_devices',
      'fhir_practitioners',
      'fhir_organizations'
    ];
    
    for (const table of dropOrder) {
      try {
        await run(`DROP TABLE IF EXISTS ${table}`);
        console.log(`[Migration] ✓ Dropped ${table}`);
      } catch (error) {
        console.log(`[Migration] Table ${table} doesn't exist (skipping)`);
      }
    }
    
    // Recreate tables with new schema
    console.log('[Migration] Creating tables with camelCase schema...');
    // SQLite doesn't support all PostgreSQL features, so we'll use a simplified approach
    // The tables will be created by the server on next start using the new schema
    console.log('[Migration] Note: SQLite tables will be recreated on next server start');
    console.log('[Migration] For now, the schema has been updated in code');
  }
  
  console.log('[Migration] ✅ Migration complete!');
}

// Run migration
migrateFHIRToCamelCase()
  .then(() => {
    console.log('[Migration] Success!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[Migration] Error:', error);
    process.exit(1);
  });

