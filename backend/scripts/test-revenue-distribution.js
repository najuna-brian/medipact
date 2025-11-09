#!/usr/bin/env node

/**
 * Test Revenue Distribution on Hedera
 * 
 * Tests the revenue distribution service with real Hedera Account IDs.
 * Requires:
 * - Patient with Hedera Account ID
 * - Hospital with Hedera Account ID
 * - Hedera testnet credentials in .env
 */

import { initDatabase, closeDatabase } from '../src/db/database.js';
import { getPatient } from '../src/db/patient-db.js';
import { getHospital } from '../src/db/hospital-db.js';
import { distributeRevenue } from '../src/services/revenue-distribution-service.js';
import { Hbar } from '@hashgraph/sdk';

async function testRevenueDistribution() {
  try {
    console.log('🧪 Testing Revenue Distribution on Hedera\n');
    console.log('==========================================\n');

    // Initialize database
    await initDatabase();
    console.log('✅ Database connected\n');

    // Get test patient and hospital with Hedera Account IDs
    const db = (await import('../src/db/database.js')).getDatabase();
    const { promisify } = await import('util');
    const get = promisify(db.get.bind(db));

    // Get a patient with Hedera Account ID
    const patient = await get(
      `SELECT upi, hedera_account_id FROM patient_identities WHERE hedera_account_id IS NOT NULL LIMIT 1`
    );

    if (!patient) {
      console.error('❌ No patient with Hedera Account ID found.');
      console.log('💡 Please register a patient first to create a Hedera account.\n');
      process.exit(1);
    }

    // Get a hospital with Hedera Account ID
    const hospital = await get(
      `SELECT hospital_id, hedera_account_id FROM hospitals WHERE hedera_account_id IS NOT NULL LIMIT 1`
    );

    if (!hospital) {
      console.error('❌ No hospital with Hedera Account ID found.');
      console.log('💡 Please register a hospital first to create a Hedera account.\n');
      process.exit(1);
    }

    console.log('📋 Test Accounts:');
    console.log(`   Patient UPI: ${patient.upi}`);
    console.log(`   Patient Hedera Account: ${patient.hedera_account_id}`);
    console.log(`   Hospital ID: ${hospital.hospital_id}`);
    console.log(`   Hospital Hedera Account: ${hospital.hedera_account_id}\n`);

    // Test with a small amount (1 HBAR = 100,000,000 tinybars)
    const testAmount = 1; // 1 HBAR
    const totalAmount = Hbar.fromTinybars(testAmount * 100000000);

    console.log('💰 Test Revenue Distribution:');
    console.log(`   Total Amount: ${totalAmount.toString()} HBAR`);
    console.log(`   Expected Split:`);
    console.log(`     - Patient (60%): ${(testAmount * 0.60).toFixed(2)} HBAR`);
    console.log(`     - Hospital (25%): ${(testAmount * 0.25).toFixed(2)} HBAR`);
    console.log(`     - Platform (15%): ${(testAmount * 0.15).toFixed(2)} HBAR\n`);

    console.log('🔄 Executing revenue distribution...\n');

    // Test revenue distribution
    const result = await distributeRevenue({
      patientAccountId: patient.hedera_account_id,
      hospitalAccountId: hospital.hedera_account_id,
      totalAmount: totalAmount,
      revenueSplitterAddress: process.env.REVENUE_SPLITTER_ADDRESS || null
    });

    console.log('✅ Revenue Distribution Successful!\n');
    console.log('📊 Distribution Result:');
    console.log(`   Method: ${result.method}`);
    console.log(`   Transaction ID: ${result.transactionId}`);
    
    if (result.method === 'direct') {
      console.log(`\n   Transfers:`);
      console.log(`     Patient (${result.transfers.patient.accountId}): ${result.transfers.patient.amount}`);
      console.log(`     Hospital (${result.transfers.hospital.accountId}): ${result.transfers.hospital.amount}`);
      console.log(`     Platform (${result.transfers.platform.accountId}): ${result.transfers.platform.amount}`);
    } else if (result.method === 'contract') {
      console.log(`   Contract Address: ${result.contractAddress}`);
      console.log(`   Split:`);
      console.log(`     Patient: ${result.split.patient}`);
      console.log(`     Hospital: ${result.split.hospital}`);
      console.log(`     Platform: ${result.split.platform}`);
    }

    console.log(`\n🔗 View on HashScan:`);
    console.log(`   https://hashscan.io/testnet/transaction/${result.transactionId}\n`);

    // Verify account balances (optional - requires account info query)
    console.log('✅ Test completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Error testing revenue distribution:');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('OPERATOR_ID') || error.message.includes('OPERATOR_KEY')) {
      console.error('💡 Make sure you have Hedera credentials in backend/.env:');
      console.error('   OPERATOR_ID=0.0.xxxxx');
      console.error('   OPERATOR_KEY=0x...');
      console.error('   HEDERA_NETWORK=testnet\n');
    }
    
    if (error.message.includes('does not have a Hedera Account ID')) {
      console.error('💡 Make sure both patient and hospital have Hedera Account IDs.\n');
    }

    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

// Run the test
testRevenueDistribution();

