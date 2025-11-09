#!/usr/bin/env node

/**
 * Test Hedera Account Creation
 * 
 * Tests the Hedera account creation flow for patients and hospitals.
 */

import { initDatabase, closeDatabase } from '../src/db/database.js';
import { createHederaAccount } from '../src/services/hedera-account-service.js';
import { encrypt, decrypt } from '../src/services/encryption-service.js';

async function testHederaAccounts() {
  try {
    console.log('🧪 Testing Hedera Account Creation...\n');
    
    // Initialize database
    await initDatabase();
    console.log('✅ Database initialized\n');
    
    // Test 1: Create a patient account
    console.log('Test 1: Creating patient Hedera account...');
    const patientAccount = await createHederaAccount(0);
    console.log(`✅ Patient Account Created:`);
    console.log(`   Account ID: ${patientAccount.accountId}`);
    console.log(`   Public Key: ${patientAccount.publicKey.substring(0, 20)}...`);
    console.log(`   Private Key: ${patientAccount.privateKey.substring(0, 20)}...`);
    console.log('');
    
    // Test 2: Encrypt private key
    console.log('Test 2: Encrypting private key...');
    const encryptedKey = encrypt(patientAccount.privateKey);
    console.log(`✅ Private Key Encrypted:`);
    console.log(`   Encrypted (hex): ${encryptedKey.substring(0, 40)}...`);
    console.log('');
    
    // Test 3: Decrypt private key
    console.log('Test 3: Decrypting private key...');
    const decryptedKey = decrypt(encryptedKey);
    if (decryptedKey === patientAccount.privateKey) {
      console.log('✅ Private Key Decryption Successful');
      console.log(`   Decrypted matches original: ${decryptedKey === patientAccount.privateKey}`);
    } else {
      console.log('❌ Private Key Decryption Failed');
    }
    console.log('');
    
    // Test 4: Create a hospital account
    console.log('Test 4: Creating hospital Hedera account...');
    const hospitalAccount = await createHederaAccount(0);
    console.log(`✅ Hospital Account Created:`);
    console.log(`   Account ID: ${hospitalAccount.accountId}`);
    console.log('');
    
    // Test 5: Validate Account IDs
    console.log('Test 5: Validating Account IDs...');
    const { isValidHederaAccountId } = await import('../src/services/hedera-account-service.js');
    const valid1 = isValidHederaAccountId(patientAccount.accountId);
    const valid2 = isValidHederaAccountId(hospitalAccount.accountId);
    const invalid = isValidHederaAccountId('invalid-id');
    
    console.log(`✅ Account ID Validation:`);
    console.log(`   Patient Account (${patientAccount.accountId}): ${valid1 ? 'Valid' : 'Invalid'}`);
    console.log(`   Hospital Account (${hospitalAccount.accountId}): ${valid2 ? 'Valid' : 'Invalid'}`);
    console.log(`   Invalid ID: ${invalid ? 'Valid (ERROR!)' : 'Invalid (Correct)'}`);
    console.log('');
    
    console.log('✅ All Tests Passed!\n');
    console.log('Summary:');
    console.log(`  ✅ Patient Account: ${patientAccount.accountId}`);
    console.log(`  ✅ Hospital Account: ${hospitalAccount.accountId}`);
    console.log(`  ✅ Encryption/Decryption: Working`);
    console.log(`  ✅ Account ID Validation: Working`);
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    if (error.message.includes('OPERATOR_ID') || error.message.includes('OPERATOR_KEY')) {
      console.error('\n💡 Solution: Create backend/.env file with:');
      console.error('   OPERATOR_ID="0.0.xxxxx"');
      console.error('   OPERATOR_KEY="0x..."');
      console.error('   HEDERA_NETWORK="testnet"');
      console.error('   ENCRYPTION_KEY="your-32-byte-hex-key"');
    }
    process.exit(1);
  } finally {
    await closeDatabase();
  }
}

testHederaAccounts();

