/**
 * Database Migration: Complete FHIR R4 Schema
 * 
 * Creates all tables for complete FHIR R4 resource support.
 * Run this after initial database setup.
 */

import { getDatabase, getDatabaseType } from '../src/db/database.js';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import complete schema
const schemaPath = path.join(__dirname, '../src/models/fhir-complete-schema.js');
const schemaModule = await import(schemaPath);

async function migrate() {
  console.log('=== Migrating Complete FHIR Schema ===\n');

  const db = getDatabase();
  const dbType = getDatabaseType();

  console.log(`Database Type: ${dbType}\n`);

  // Read the complete schema
  const completeSchema = schemaModule.CompleteFHIRSchema;

  if (dbType === 'postgresql') {
    await migratePostgreSQL(db, completeSchema);
  } else {
    await migrateSQLite(db, completeSchema);
  }

  console.log('\n✓ Migration complete!');
}

async function migratePostgreSQL(db, schema) {
  // Split schema into individual CREATE TABLE statements
  const statements = schema.split('CREATE TABLE').filter(s => s.trim());

  for (let i = 0; i < statements.length; i++) {
    const statement = 'CREATE TABLE' + statements[i].trim();
    
    // Extract table name
    const tableMatch = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
    if (!tableMatch) continue;
    
    const tableName = tableMatch[1];

    try {
      console.log(`Creating table: ${tableName}...`);
      await db.query(statement);
      console.log(`  ✓ ${tableName} created`);
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log(`  ⚠️  ${tableName} already exists, skipping`);
      } else {
        console.error(`  ✗ Error creating ${tableName}:`, error.message);
        throw error;
      }
    }
  }

  // Create indexes
  const indexStatements = schema.match(/CREATE INDEX[^;]+;/gi) || [];
  for (const indexStmt of indexStatements) {
    try {
      await db.query(indexStmt);
    } catch (error) {
      if (error.message.includes('already exists')) {
        // Index already exists, skip
      } else {
        console.warn(`  ⚠️  Index creation warning: ${error.message}`);
      }
    }
  }
}

async function migrateSQLite(db, schema) {
  const run = promisify(db.run.bind(db));

  // SQLite doesn't support all PostgreSQL features, so we need to adapt
  const statements = schema.split('CREATE TABLE').filter(s => s.trim());

  for (let i = 0; i < statements.length; i++) {
    let statement = 'CREATE TABLE IF NOT EXISTS' + statements[i].trim();
    
    // Adapt for SQLite
    statement = statement
      .replace(/SERIAL PRIMARY KEY/g, 'INTEGER PRIMARY KEY AUTOINCREMENT')
      .replace(/VARCHAR\((\d+)\)/g, 'TEXT')
      .replace(/TIMESTAMP/g, 'TEXT')
      .replace(/DATE/g, 'TEXT')
      .replace(/DECIMAL\([^)]+\)/g, 'REAL')
      .replace(/JSONB/g, 'TEXT')
      .replace(/FOREIGN KEY \(([^)]+)\) REFERENCES (\w+)\(([^)]+)\)/g, 
        'FOREIGN KEY ($1) REFERENCES $2($3)')
      .replace(/INDEX\s+(\w+)\s+ON\s+(\w+)\(([^)]+)\)/gi, 
        'CREATE INDEX IF NOT EXISTS $1 ON $2($3)');

    // Extract table name
    const tableMatch = statement.match(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?(\w+)/i);
    if (!tableMatch) continue;
    
    const tableName = tableMatch[1];

    try {
      console.log(`Creating table: ${tableName}...`);
      await run(statement);
      console.log(`  ✓ ${tableName} created`);
    } catch (error) {
      console.error(`  ✗ Error creating ${tableName}:`, error.message);
      // Continue with other tables
    }
  }

  // Create indexes separately for SQLite
  const indexStatements = schema.match(/CREATE INDEX[^;]+;/gi) || [];
  for (const indexStmt of indexStatements) {
    try {
      const adapted = indexStmt.replace(/CREATE INDEX/g, 'CREATE INDEX IF NOT EXISTS');
      await run(adapted);
    } catch (error) {
      // Index might already exist, continue
    }
  }
}

// Run migration
migrate().catch(error => {
  console.error('Migration failed:', error);
  process.exit(1);
});

