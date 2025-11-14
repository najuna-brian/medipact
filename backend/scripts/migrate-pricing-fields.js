/**
 * Database Migration: Add Pricing Fields
 * 
 * Adds new pricing-related columns to the datasets table:
 * - price_usd
 * - price_per_record_hbar
 * - price_per_record_usd
 * - pricing_category_id
 * - pricing_category
 * - volume_discount
 * 
 * Also calculates USD prices for existing datasets based on current HBAR price.
 */

import { getDatabase, getDatabaseType } from '../src/db/database.js';
import { hbarToUSD } from '../src/services/pricing-service.js';

const HBAR_TO_USD = 0.16; // Current exchange rate

async function migratePostgreSQL(client) {
  console.log('Migrating PostgreSQL database...');
  
  // Add new columns if they don't exist
  const alterQueries = [
    `ALTER TABLE datasets ADD COLUMN IF NOT EXISTS price_usd DECIMAL(18, 8)`,
    `ALTER TABLE datasets ADD COLUMN IF NOT EXISTS price_per_record_hbar DECIMAL(18, 8)`,
    `ALTER TABLE datasets ADD COLUMN IF NOT EXISTS price_per_record_usd DECIMAL(18, 8)`,
    `ALTER TABLE datasets ADD COLUMN IF NOT EXISTS pricing_category_id VARCHAR(32)`,
    `ALTER TABLE datasets ADD COLUMN IF NOT EXISTS pricing_category VARCHAR(100)`,
    `ALTER TABLE datasets ADD COLUMN IF NOT EXISTS volume_discount DECIMAL(5, 2) DEFAULT 0`
  ];
  
  for (const query of alterQueries) {
    try {
      await client.query(query);
      console.log(`✓ Added column: ${query.match(/ADD COLUMN IF NOT EXISTS (\w+)/)?.[1] || 'column'}`);
    } catch (error) {
      console.error(`Error adding column: ${error.message}`);
    }
  }
  
  // Update existing records with calculated USD prices
  const updateQuery = `
    UPDATE datasets
    SET 
      price_usd = price * $1,
      price_per_record_hbar = CASE 
        WHEN record_count > 0 THEN price / record_count 
        ELSE NULL 
      END,
      price_per_record_usd = CASE 
        WHEN record_count > 0 THEN (price * $1) / record_count 
        ELSE NULL 
      END
    WHERE price_usd IS NULL
  `;
  
  try {
    const result = await client.query(updateQuery, [HBAR_TO_USD]);
    console.log(`✓ Updated ${result.rowCount} existing datasets with USD prices`);
  } catch (error) {
    console.error(`Error updating existing records: ${error.message}`);
  }
}

async function migrateSQLite(db) {
  console.log('Migrating SQLite database...');
  const { promisify } = await import('util');
  const run = promisify(db.run.bind(db));
  
  // SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
  // So we need to check if columns exist first
  const checkColumn = promisify(db.get.bind(db));
  
  const columns = [
    { name: 'price_usd', type: 'REAL' },
    { name: 'price_per_record_hbar', type: 'REAL' },
    { name: 'price_per_record_usd', type: 'REAL' },
    { name: 'pricing_category_id', type: 'TEXT' },
    { name: 'pricing_category', type: 'TEXT' },
    { name: 'volume_discount', type: 'REAL DEFAULT 0' }
  ];
  
  for (const col of columns) {
    try {
      // Check if column exists by trying to select it
      await checkColumn(`SELECT ${col.name} FROM datasets LIMIT 1`);
      console.log(`✓ Column ${col.name} already exists`);
    } catch (error) {
      // Column doesn't exist, add it
      try {
        await run(`ALTER TABLE datasets ADD COLUMN ${col.name} ${col.type}`);
        console.log(`✓ Added column: ${col.name}`);
      } catch (addError) {
        console.error(`Error adding column ${col.name}: ${addError.message}`);
      }
    }
  }
  
  // Update existing records with calculated USD prices
  const updateQuery = `
    UPDATE datasets
    SET 
      price_usd = price * ?,
      price_per_record_hbar = CASE 
        WHEN record_count > 0 THEN price / record_count 
        ELSE NULL 
      END,
      price_per_record_usd = CASE 
        WHEN record_count > 0 THEN (price * ?) / record_count 
        ELSE NULL 
      END
    WHERE price_usd IS NULL
  `;
  
  try {
    const result = await run(updateQuery, [HBAR_TO_USD, HBAR_TO_USD]);
    console.log(`✓ Updated existing datasets with USD prices`);
  } catch (error) {
    console.error(`Error updating existing records: ${error.message}`);
  }
}

async function main() {
  try {
    const db = getDatabase();
    const dbType = getDatabaseType();
    
    console.log(`\n🔄 Starting pricing fields migration for ${dbType}...\n`);
    
    if (dbType === 'postgresql') {
      await migratePostgreSQL(db);
    } else {
      await migrateSQLite(db);
    }
    
    console.log('\n✅ Migration completed successfully!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
main();

