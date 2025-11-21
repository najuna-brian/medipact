#!/usr/bin/env node

/**
 * Migration Script: Add query_filters Column to Purchases Table
 * 
 * Adds query_filters column to purchases table to support query-based purchase verification.
 * This allows researchers to download CSV data after payment without needing to re-enter transaction ID.
 */

import { initDatabase, getDatabase, getDatabaseType, closeDatabase } from '../src/db/database.js';
import { promisify } from 'util';

async function migrate() {
  try {
    console.log('🔄 Migrating database to add query_filters column to purchases table...\n');
    
    await initDatabase();
    const db = getDatabase();
    const dbType = getDatabaseType();
    
    console.log(`Database type: ${dbType}\n`);
    
    if (dbType === 'postgresql') {
      // PostgreSQL migration
      const client = db;
      
      try {
        // Check if column exists
        const result = await client.query(`
          SELECT column_name 
          FROM information_schema.columns 
          WHERE table_name = 'purchases' 
            AND column_name = 'query_filters'
        `);
        
        if (result.rows.length > 0) {
          console.log('✅ query_filters column already exists in purchases table');
        } else {
          console.log('Adding query_filters column to purchases table...');
          await client.query(`
            ALTER TABLE purchases ADD COLUMN query_filters TEXT
          `);
          console.log('✅ Added query_filters column to purchases table');
        }
      } catch (error) {
        if (error.message.includes('does not exist')) {
          console.log('⚠️  purchases table does not exist yet. It will be created with query_filters column on next startup.');
        } else {
          throw error;
        }
      }
    } else {
      // SQLite migration
      const run = promisify(db.run.bind(db));
      const all = promisify(db.all.bind(db));
      
      try {
        // Check if column exists
        const columns = await all(`PRAGMA table_info(purchases)`);
        const hasQueryFilters = columns.some(col => col.name === 'query_filters');
        
        if (hasQueryFilters) {
          console.log('✅ query_filters column already exists in purchases table');
        } else {
          console.log('Adding query_filters column to purchases table...');
          await run(`ALTER TABLE purchases ADD COLUMN query_filters TEXT`);
          console.log('✅ Added query_filters column to purchases table');
        }
      } catch (error) {
        if (error.message.includes('no such table')) {
          console.log('⚠️  purchases table does not exist yet. It will be created with query_filters column on next startup.');
        } else {
          throw error;
        }
      }
    }
    
    console.log('\n✅ Migration complete!');
    console.log('\nThe query_filters column has been added to the purchases table.');
    console.log('Researchers can now download CSV data after payment without re-entering transaction ID.');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

migrate();

