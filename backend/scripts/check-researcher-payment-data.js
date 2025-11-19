/**
 * Check if a researcher has all required data for payment processing
 * 
 * Usage: node scripts/check-researcher-payment-data.js <researcherId>
 */

import { initDatabase, getDatabaseType, get } from '../src/db/database.js';
import { decrypt } from '../src/services/encryption-service.js';
import { getResearcher } from '../src/db/researcher-db.js';
import { getAccountBalance } from '../src/services/balance-service.js';

const researcherId = process.argv[2];

async function checkResearcherPaymentData() {
  // Initialize database
  await initDatabase();
  try {
    if (!researcherId) {
      // List all researchers
      const dbType = getDatabaseType();
      const sql = dbType === 'postgresql'
        ? `SELECT researcher_id, email, organization_name, hedera_account_id, 
           encrypted_private_key IS NOT NULL as has_private_key
           FROM researchers 
           WHERE status = 'active'
           ORDER BY registered_at DESC
           LIMIT 20`
        : `SELECT researcher_id, email, organization_name, hedera_account_id,
           CASE WHEN encrypted_private_key IS NOT NULL THEN 1 ELSE 0 END as has_private_key
           FROM researchers 
           WHERE status = 'active'
           ORDER BY registered_at DESC
           LIMIT 20`;
      
      const { all } = await import('../src/db/database.js');
      const researchers = await all(sql);
      
      console.log(`\n📋 Found ${researchers.length} active researchers:\n`);
      researchers.forEach((r, i) => {
        const hasKey = dbType === 'postgresql' ? r.has_private_key : r.has_private_key === 1;
        console.log(`${i + 1}. ${r.researcher_id}`);
        console.log(`   Email: ${r.email}`);
        console.log(`   Organization: ${r.organization_name}`);
        console.log(`   Hedera Account: ${r.hedera_account_id || '❌ MISSING'}`);
        console.log(`   Private Key: ${hasKey ? '✅ PRESENT' : '❌ MISSING'}`);
        console.log('');
      });
      
      console.log('\n💡 To check a specific researcher: node scripts/check-researcher-payment-data.js <researcherId>');
      return;
    }
    
    console.log(`\n🔍 Checking payment data for researcher: ${researcherId}\n`);
    
    // Get full researcher record
    const researcher = await getResearcher(researcherId);
    
    if (!researcher) {
      console.error(`❌ Researcher ${researcherId} not found`);
      process.exit(1);
    }
    
    console.log('📋 Researcher Information:');
    console.log(`   Email: ${researcher.email}`);
    console.log(`   Organization: ${researcher.organizationName}`);
    console.log(`   Status: ${researcher.status}`);
    console.log(`   Verification: ${researcher.verificationStatus}`);
    console.log(`   Registered: ${researcher.registeredAt}`);
    
    // Check database fields directly
    const dbType = getDatabaseType();
    const sql = dbType === 'postgresql'
      ? `SELECT 
          encrypted_private_key as "encryptedPrivateKey", 
          hedera_account_id as "hederaAccountId",
          evm_address as "evmAddress"
        FROM researchers 
        WHERE researcher_id = $1`
      : `SELECT 
          encrypted_private_key as encryptedPrivateKey, 
          hedera_account_id as hederaAccountId,
          evm_address as evmAddress
        FROM researchers 
        WHERE researcher_id = ?`;
    
    const dbData = await get(sql, [researcherId]);
    
    console.log('\n🔐 Payment Processing Data:');
    console.log(`   Hedera Account ID: ${dbData?.hederaAccountId || '❌ MISSING'}`);
    console.log(`   EVM Address: ${dbData?.evmAddress || '❌ MISSING'}`);
    console.log(`   Encrypted Private Key: ${dbData?.encryptedPrivateKey ? '✅ PRESENT' : '❌ MISSING'}`);
    
    if (dbData?.encryptedPrivateKey) {
      try {
        const privateKey = decrypt(dbData.encryptedPrivateKey);
        console.log(`   Private Key Decryption: ✅ SUCCESS (${privateKey.substring(0, 20)}...)`);
      } catch (decryptError) {
        console.log(`   Private Key Decryption: ❌ FAILED - ${decryptError.message}`);
      }
    }
    
    // Check account balance
    if (dbData?.hederaAccountId) {
      try {
        const balance = await getAccountBalance(dbData.hederaAccountId);
        console.log(`   Account Balance: ${balance.balanceHBAR.toFixed(4)} HBAR ($${balance.balanceUSD.toFixed(2)} USD)`);
        
        if (balance.balanceHBAR < 1) {
          console.log(`   ⚠️  WARNING: Low balance! May not be able to make payments.`);
        }
      } catch (balanceError) {
        console.log(`   Account Balance: ❌ FAILED - ${balanceError.message}`);
      }
    }
    
    // Check platform account ID
    const platformAccountId = process.env.PLATFORM_HEDERA_ACCOUNT_ID || process.env.OPERATOR_ID;
    console.log(`\n🏦 Platform Configuration:`);
    console.log(`   Platform Account ID: ${platformAccountId || '❌ MISSING'}`);
    
    // Summary
    console.log('\n📊 Payment Processing Readiness:');
    const hasAccountId = !!dbData?.hederaAccountId;
    const hasPrivateKey = !!dbData?.encryptedPrivateKey;
    const hasPlatformAccount = !!platformAccountId;
    
    let canProcessPayment = hasAccountId && hasPrivateKey && hasPlatformAccount;
    
    if (hasPrivateKey) {
      try {
        decrypt(dbData.encryptedPrivateKey);
      } catch (e) {
        canProcessPayment = false;
        console.log(`   ⚠️  Private key exists but cannot be decrypted`);
      }
    }
    
    if (canProcessPayment) {
      console.log(`   ✅ READY - All required data is present`);
      console.log(`   ✅ Auto-payment should work for this researcher`);
    } else {
      console.log(`   ❌ NOT READY - Missing required data:`);
      if (!hasAccountId) console.log(`      - Hedera Account ID`);
      if (!hasPrivateKey) console.log(`      - Encrypted Private Key`);
      if (!hasPlatformAccount) console.log(`      - Platform Account ID (env var)`);
    }
    
    console.log('\n');
    
  } catch (error) {
    console.error('❌ Error checking researcher payment data:', error);
    process.exit(1);
  }
}

checkResearcherPaymentData();

