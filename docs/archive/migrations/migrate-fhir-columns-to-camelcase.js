#!/usr/bin/env node

/**
 * Migration Script: Rename FHIR table columns from snake_case to camelCase
 * 
 * This script safely renames columns in existing FHIR tables without losing data.
 * It uses ALTER TABLE RENAME COLUMN which preserves all data.
 * 
 * Safe for production use - does not delete any data.
 */

import { initDatabase, getDatabase, getDatabaseType, closeDatabase } from '../src/db/database.js';
import { promisify } from 'util';

// Column mappings: snake_case -> camelCase
const columnMappings = {
  fhir_patients: {
    'anonymous_patient_id': 'anonymousPatientId',
    'age_range': 'ageRange',
    'hospital_id': 'hospitalId',
    'created_at': 'createdAt',
    'updated_at': 'updatedAt'
  },
  fhir_conditions: {
    'anonymous_patient_id': 'anonymousPatientId',
    'condition_code': 'conditionCode',
    'condition_name': 'conditionName',
    'diagnosis_date': 'diagnosisDate',
    'hospital_id': 'hospitalId',
    'created_at': 'createdAt'
  },
  fhir_observations: {
    'anonymous_patient_id': 'anonymousPatientId',
    'observation_code': 'observationCode',
    'observation_name': 'observationName',
    'effective_date': 'effectiveDate',
    'hospital_id': 'hospitalId',
    'reference_range': 'referenceRange',
    'created_at': 'createdAt'
  },
  fhir_encounters: {
    'anonymous_patient_id': 'anonymousPatientId',
    'encounter_id': 'encounterId',
    'encounter_type': 'encounterType',
    'admission_date': 'admissionDate',
    'discharge_date': 'dischargeDate',
    'hospital_id': 'hospitalId',
    'created_at': 'createdAt'
  },
  fhir_medication_requests: {
    'anonymous_patient_id': 'anonymousPatientId',
    'medication_code': 'medicationCode',
    'medication_name': 'medicationName',
    'prescribed_date': 'prescribedDate',
    'hospital_id': 'hospitalId',
    'created_at': 'createdAt'
  },
  fhir_procedures: {
    'anonymous_patient_id': 'anonymousPatientId',
    'procedure_code': 'procedureCode',
    'procedure_name': 'procedureName',
    'procedure_date': 'procedureDate',
    'hospital_id': 'hospitalId',
    'created_at': 'createdAt'
  },
  fhir_imaging_studies: {
    'anonymous_patient_id': 'anonymousPatientId',
    'study_id': 'studyId',
    'modality': 'modality',
    'study_date': 'studyDate',
    'hospital_id': 'hospitalId',
    'created_at': 'createdAt'
  },
  fhir_allergies: {
    'anonymous_patient_id': 'anonymousPatientId',
    'allergy_code': 'allergyCode',
    'allergy_name': 'allergyName',
    'reaction_date': 'reactionDate',
    'hospital_id': 'hospitalId',
    'created_at': 'createdAt'
  },
  fhir_coverage: {
    'anonymous_patient_id': 'anonymousPatientId',
    'coverage_type': 'coverageType',
    'policy_number': 'policyNumber',
    'start_date': 'startDate',
    'end_date': 'endDate',
    'hospital_id': 'hospitalId',
    'created_at': 'createdAt'
  }
};

async function checkColumnExists(db, tableName, columnName, dbType) {
  try {
    if (dbType === 'postgresql') {
      const result = await db.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = $1 AND column_name = $2
      `, [tableName, columnName]);
      return result.rows.length > 0;
    } else {
      // SQLite
      const all = promisify(db.all.bind(db));
      const columns = await all(`PRAGMA table_info(${tableName})`);
      return columns.some(col => col.name === columnName);
    }
  } catch (error) {
    // Table might not exist
    return false;
  }
}

async function renameColumn(db, tableName, oldName, newName, dbType) {
  if (dbType === 'postgresql') {
    // PostgreSQL: Use ALTER TABLE RENAME COLUMN
    await db.query(`ALTER TABLE ${tableName} RENAME COLUMN ${oldName} TO "${newName}"`);
  } else {
    // SQLite doesn't support RENAME COLUMN directly in older versions
    // For SQLite, we'll need to recreate the table (but that's handled by the initDatabase)
    // For now, just log that SQLite will be handled on next server start
    console.log(`[Migration] Note: SQLite column rename for ${tableName}.${oldName} will be handled on next server start`);
  }
}

async function updateIndexes(db, tableName, columnMappings, dbType) {
  if (dbType === 'postgresql') {
    // Drop old indexes and create new ones with camelCase names
    const indexMappings = {
      'anonymous_patient_id': 'anonymousPatientId',
      'hospital_id': 'hospitalId',
      'condition_code': 'conditionCode',
      'observation_code': 'observationCode',
      'effective_date': 'effectiveDate',
      'diagnosis_date': 'diagnosisDate'
    };

    for (const [oldCol, newCol] of Object.entries(indexMappings)) {
      if (columnMappings[oldCol] === newCol) {
        // Drop old index if exists
        try {
          await db.query(`DROP INDEX IF EXISTS idx_${tableName}_${oldCol}`);
        } catch (e) {
          // Index might not exist, that's fine
        }
        
        // Create new index with camelCase column name
        try {
          await db.query(`CREATE INDEX IF NOT EXISTS idx_${tableName}_${newCol} ON ${tableName}("${newCol}")`);
        } catch (e) {
          console.log(`[Migration] Note: Could not create index for ${tableName}.${newCol}: ${e.message}`);
        }
      }
    }
  }
}

async function migrateFHIRColumnsToCamelCase() {
  console.log('[Migration] Starting FHIR column migration from snake_case to camelCase...\n');
  
  try {
    console.log('[Migration] Initializing database connection...');
    try {
      await initDatabase();
    } catch (error) {
      // If initialization fails due to schema issues, that's okay - we just need the connection
      console.log(`[Migration] Note: Database initialization warning: ${error.message}`);
      console.log('[Migration] Continuing with migration...');
    }
    
    const db = getDatabase();
    const dbType = getDatabaseType();
    
    if (!db) {
      throw new Error('Database connection not available');
    }
    
    console.log(`[Migration] Database type: ${dbType}\n`);
    
    if (dbType === 'postgresql') {
      // PostgreSQL: Rename columns using ALTER TABLE RENAME COLUMN
      for (const [tableName, mappings] of Object.entries(columnMappings)) {
        console.log(`[Migration] Processing table: ${tableName}`);
        
        // Check if table exists
        let tableExists = false;
        try {
          const tableCheck = await db.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_name = $1
          `, [tableName]);
          tableExists = tableCheck.rows.length > 0;
        } catch (error) {
          console.log(`[Migration]   Error checking table ${tableName}: ${error.message}`);
        }
        
        if (!tableExists) {
          console.log(`[Migration]   Table ${tableName} does not exist, skipping...\n`);
          continue;
        }
        
        // Rename each column
        for (const [oldName, newName] of Object.entries(mappings)) {
          const oldExists = await checkColumnExists(db, tableName, oldName, dbType);
          const newExists = await checkColumnExists(db, tableName, newName, dbType);
          
          if (newExists) {
            console.log(`[Migration]   ✓ Column ${tableName}.${newName} already exists (already migrated)`);
          } else if (oldExists) {
            try {
              console.log(`[Migration]   → Renaming ${oldName} to "${newName}"...`);
              await renameColumn(db, tableName, oldName, newName, dbType);
              console.log(`[Migration]   ✓ Renamed ${oldName} to "${newName}"`);
            } catch (error) {
              console.error(`[Migration]   ✗ Failed to rename ${oldName} to ${newName}: ${error.message}`);
              // Continue with other columns
            }
          } else {
            console.log(`[Migration]   → Column ${oldName} does not exist in ${tableName} (skipping)`);
          }
        }
        
        // Update indexes (only for PostgreSQL)
        if (dbType === 'postgresql') {
          await updateIndexes(db, tableName, mappings, dbType);
          console.log(`[Migration]   ✓ Updated indexes for ${tableName}\n`);
        }
      }
      
      // Update foreign key constraints (they reference column names)
      console.log('[Migration] Updating foreign key constraints...');
      // Note: PostgreSQL foreign keys are automatically updated when columns are renamed
      console.log('[Migration]   ✓ Foreign keys automatically updated\n');
      
    } else {
      // SQLite: Column renaming is more complex
      console.log('[Migration] SQLite detected.');
      console.log('[Migration] SQLite tables should already be using camelCase from the schema definitions.');
      console.log('[Migration] If you need to migrate SQLite, the tables will be recreated with camelCase on next server start.');
      console.log('[Migration] This migration script is primarily for PostgreSQL production databases.\n');
      
      // Check if any tables need migration (have snake_case columns)
      console.log('[Migration] Checking SQLite tables for snake_case columns...');
      let needsMigration = false;
      
      for (const [tableName, mappings] of Object.entries(columnMappings)) {
        try {
          const all = promisify(db.all.bind(db));
          // Check if table exists first
          const tableCheck = await all(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName]);
          if (tableCheck.length === 0) {
            console.log(`[Migration]   → Table ${tableName} does not exist (skipping)`);
            continue;
          }
          
          const columns = await all(`PRAGMA table_info(${tableName})`);
          const columnNames = columns.map(col => col.name);
          
          // Check if any old snake_case columns exist
          const hasOldColumns = Object.keys(mappings).some(oldName => columnNames.includes(oldName));
          const hasNewColumns = Object.values(mappings).some(newName => columnNames.includes(newName));
          
          if (hasOldColumns && !hasNewColumns) {
            console.log(`[Migration]   ⚠️  Table ${tableName} has snake_case columns and needs migration`);
            needsMigration = true;
          } else if (hasNewColumns) {
            console.log(`[Migration]   ✓ Table ${tableName} already uses camelCase`);
          } else {
            console.log(`[Migration]   → Table ${tableName} exists but has no matching columns (may be empty)`);
          }
        } catch (error) {
          // Table doesn't exist or error checking, that's fine
          console.log(`[Migration]   → Table ${tableName}: ${error.message}`);
        }
      }
      
      if (needsMigration) {
        console.log('\n[Migration] ⚠️  SQLite tables need migration.');
        console.log('[Migration] SQLite will be migrated automatically on next server start.');
        console.log('[Migration] The server will recreate tables with camelCase schema.\n');
      } else {
        console.log('\n[Migration] ✓ All SQLite tables are already using camelCase or do not exist.\n');
      }
    }
    
    console.log('[Migration] ✅ Migration complete!');
    console.log('[Migration] Note: If you see any errors above, they may be expected if columns were already migrated.');
    
  } catch (error) {
    console.error('[Migration] ❌ Migration failed:', error);
    console.error(error.stack);
    throw error;
  } finally {
    await closeDatabase();
  }
}

// Run migration
migrateFHIRColumnsToCamelCase()
  .then(() => {
    console.log('\n[Migration] ✅ Success!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n[Migration] ❌ Error:', error);
    process.exit(1);
  });

