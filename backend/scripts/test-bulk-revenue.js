#!/usr/bin/env node

/**
 * Test Bulk Revenue Distribution
 * 
 * Tests distributing revenue for multiple sales at once.
 */

import { initDatabase, closeDatabase } from '../src/db/database.js';
import { distributeBulkRevenue } from '../src/services/adapter-integration-service.js';

async function testBulkRevenue() {
  try {
    console.log('🧪 Testing Bulk Revenue Distribution\n');
    console.log('====================================\n');

    await initDatabase();
    console.log('✅ Database connected\n');

    const db = (await import('../src/db/database.js')).getDatabase();
    const { promisify } = await import('util');
    const all = promisify(db.all.bind(db));

    // Get multiple patients and hospitals
    const patients = await all(
      `SELECT upi, hedera_account_id FROM patient_identities WHERE hedera_account_id IS NOT NULL LIMIT 3`
    );

    const hospitals = await all(
      `SELECT hospital_id, hedera_account_id FROM hospitals WHERE hedera_account_id IS NOT NULL LIMIT 2`
    );

    if (patients.length === 0 || hospitals.length === 0) {
      console.error('❌ Need at least 1 patient and 1 hospital with Hedera Account IDs');
      process.exit(1);
    }

    console.log(`📋 Test Data:`);
    console.log(`   Patients: ${patients.length}`);
    console.log(`   Hospitals: ${hospitals.length}\n`);

    // Create test sales
    const sales = [];
    for (let i = 0; i < Math.min(patients.length, hospitals.length); i++) {
      sales.push({
        patientUPI: patients[i].upi,
        hospitalId: hospitals[i].hospital_id,
        amount: 100000000 // 1 HBAR per sale
      });
    }

    console.log(`💰 Bulk Revenue Distribution:`);
    console.log(`   Total Sales: ${sales.length}`);
    console.log(`   Amount per Sale: 1 HBAR`);
    console.log(`   Total Amount: ${sales.length} HBAR\n`);

    console.log('🔄 Executing bulk distribution...\n');

    const results = await distributeBulkRevenue(sales);

    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    console.log('✅ Bulk Distribution Complete!\n');
    console.log(`📊 Results:`);
    console.log(`   Total: ${results.length}`);
    console.log(`   Successful: ${successful}`);
    console.log(`   Failed: ${failed}\n`);

    results.forEach((result, index) => {
      if (result.success) {
        console.log(`   Sale ${index + 1}: ✅ Success`);
        console.log(`      Transaction: ${result.distribution.transactionId}`);
        if (result.distribution.transfers) {
          console.log(`      Patient: ${result.distribution.transfers.patient.amount}`);
          console.log(`      Hospital: ${result.distribution.transfers.hospital.amount}`);
        }
      } else {
        console.log(`   Sale ${index + 1}: ❌ Failed - ${result.error}`);
      }
    });

    console.log('\n✅ Test completed!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

testBulkRevenue();

