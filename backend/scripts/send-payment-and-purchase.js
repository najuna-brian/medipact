/**
 * Send Payment and Complete Purchase Script
 * 
 * This script:
 * 1. Gets researcher's encrypted private key from database
 * 2. Decrypts it
 * 3. Sends HBAR payment programmatically
 * 4. Gets transaction ID
 * 5. Completes purchase with transaction ID
 * 
 * Usage:
 *   node scripts/send-payment-and-purchase.js <researcherId> <amountHBAR>
 *   Example: node scripts/send-payment-and-purchase.js RES-77C7C600CAC8 100
 */

import { TransferTransaction, Hbar, Client, AccountId } from '@hashgraph/sdk';
import { decrypt } from '../src/services/encryption-service.js';
import { get } from '../src/db/database.js';
import { createHederaClient } from '../src/services/hedera-client.js';

// Get command line arguments
const researcherId = process.argv[2];
const amountHBAR = parseFloat(process.argv[3]) || 100;

if (!researcherId) {
  console.error('❌ Usage: node scripts/send-payment-and-purchase.js <researcherId> <amountHBAR>');
  console.error('   Example: node scripts/send-payment-and-purchase.js RES-77C7C600CAC8 100');
  process.exit(1);
}

// Get API URL from environment
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';
const baseUrl = API_URL.replace(/\/$/, '');

console.log(`🚀 Sending payment and completing purchase for researcher: ${researcherId}`);
console.log(`💰 Amount: ${amountHBAR} HBAR\n`);

async function getResearcherWithPrivateKey(researcherId) {
  const dbType = process.env.DATABASE_URL ? 'postgresql' : 'sqlite';
  
  const sql = dbType === 'postgresql'
    ? `SELECT 
        researcher_id as "researcherId",
        hedera_account_id as "hederaAccountId",
        encrypted_private_key as "encryptedPrivateKey"
      FROM researchers 
      WHERE researcher_id = $1`
    : `SELECT 
        researcher_id as researcherId,
        hedera_account_id as hederaAccountId,
        encrypted_private_key as encryptedPrivateKey
      FROM researchers 
      WHERE researcher_id = ?`;
  
  return await get(sql, [researcherId]);
}

async function sendHBARPayment(researcherAccountId, privateKey, recipientAccountId, amountHBAR) {
  const client = Client.forTestnet();
  
  try {
    // Set operator (researcher account)
    const accountId = AccountId.fromString(researcherAccountId);
    const privateKeyObj = await import('@hashgraph/sdk').then(m => 
      m.PrivateKey.fromString(privateKey)
    );
    
    client.setOperator(accountId, privateKeyObj);
    
    console.log(`📤 Sending ${amountHBAR} HBAR from ${researcherAccountId} to ${recipientAccountId}...`);
    
    // Create transfer transaction
    const transaction = await new TransferTransaction()
      .addHbarTransfer(AccountId.fromString(recipientAccountId), Hbar.fromTinybars(amountHBAR * 100000000))
      .addHbarTransfer(accountId, Hbar.fromTinybars(-amountHBAR * 100000000))
      .execute(client);
    
    // Get receipt
    const receipt = await transaction.getReceipt(client);
    
    if (receipt.status.toString() !== 'SUCCESS') {
      throw new Error(`Transaction failed with status: ${receipt.status.toString()}`);
    }
    
    // Get transaction ID
    const transactionId = transaction.transactionId.toString();
    
    console.log(`✅ Payment sent successfully!`);
    console.log(`   Transaction ID: ${transactionId}\n`);
    
    return transactionId;
    
  } catch (error) {
    console.error('❌ Error sending payment:', error.message);
    throw error;
  } finally {
    client.close();
  }
}

async function completePurchase(researcherId, amountHBAR, transactionId, queryFilters = null) {
  console.log(`🛒 Completing purchase with transaction ID: ${transactionId}...`);
  
  const purchaseData = {
    researcherId,
    amount: amountHBAR,
    transactionId,
  };
  
  if (queryFilters) {
    purchaseData.queryFilters = queryFilters;
  }
  
  try {
    const response = await fetch(`${baseUrl}/api/marketplace/purchase`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(purchaseData),
    });
    
    const data = await response.json();
    
    if (response.ok && data.success !== false) {
      console.log(`✅ Purchase completed successfully!`);
      console.log(`   Purchase ID: ${data.purchaseId || 'N/A'}`);
      console.log(`   Revenue distributed: ${data.revenueDistribution ? 'Yes' : 'No'}\n`);
      return data;
    } else {
      throw new Error(data.error || data.message || 'Purchase failed');
    }
  } catch (error) {
    console.error('❌ Error completing purchase:', error.message);
    throw error;
  }
}

async function main() {
  try {
    // Step 1: Get researcher with private key
    console.log('🔍 Getting researcher information...');
    const researcher = await getResearcherWithPrivateKey(researcherId);
    
    if (!researcher) {
      throw new Error(`Researcher ${researcherId} not found`);
    }
    
    if (!researcher.hederaAccountId) {
      throw new Error(`Researcher ${researcherId} does not have a Hedera account`);
    }
    
    if (!researcher.encryptedPrivateKey) {
      throw new Error(`Researcher ${researcherId} does not have a stored private key`);
    }
    
    console.log(`✅ Found researcher: ${researcherId}`);
    console.log(`   Hedera Account: ${researcher.hederaAccountId}\n`);
    
    // Step 2: Decrypt private key
    console.log('🔓 Decrypting private key...');
    const privateKey = decrypt(researcher.encryptedPrivateKey);
    console.log(`✅ Private key decrypted\n`);
    
    // Step 3: Get platform account ID
    const platformAccountId = process.env.PLATFORM_HEDERA_ACCOUNT_ID || process.env.OPERATOR_ID;
    if (!platformAccountId) {
      throw new Error('PLATFORM_HEDERA_ACCOUNT_ID or OPERATOR_ID not set in environment');
    }
    
    console.log(`📋 Platform Account: ${platformAccountId}\n`);
    
    // Step 4: Send HBAR payment
    const transactionId = await sendHBARPayment(
      researcher.hederaAccountId,
      privateKey,
      platformAccountId,
      amountHBAR
    );
    
    // Step 5: Complete purchase
    const queryFilters = {
      conditionName: 'Type 2 Diabetes',
      country: 'Uganda',
      limit: 100,
    };
    
    await completePurchase(researcherId, amountHBAR, transactionId, queryFilters);
    
    console.log('✅ All done! Payment sent and purchase completed.\n');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();

