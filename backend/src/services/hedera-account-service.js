/**
 * Hedera Account Service
 * 
 * Creates and manages Hedera accounts for users (patients/hospitals).
 * Platform pays for account creation and manages encrypted private keys.
 */

import { Client, PrivateKey, AccountCreateTransaction, Hbar, AccountId, Status } from '@hashgraph/sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create Hedera client using operator credentials
 * Reuses the same pattern as adapter
 */
function createHederaClient() {
  if (
    process.env.OPERATOR_ID == null ||
    process.env.OPERATOR_KEY == null ||
    process.env.HEDERA_NETWORK == null
  ) {
    throw new Error(
      "Environment variables OPERATOR_ID, HEDERA_NETWORK, and OPERATOR_KEY are required for Hedera account creation."
    );
  }

  const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
  const operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);

  const client = Client.forName(process.env.HEDERA_NETWORK);
  client.setOperator(operatorId, operatorKey);

  return client;
}

/**
 * Create a new Hedera account for a user
 * Platform pays for account creation (operator account)
 * 
 * @param {number} initialBalance - Initial HBAR balance (default: 0)
 * @returns {Promise<{accountId: string, privateKey: string, publicKey: string}>}
 */
export async function createHederaAccount(initialBalance = 0) {
  const client = createHederaClient();
  
  try {
    // Generate new key pair for the user
    const newPrivateKey = PrivateKey.generateECDSA();
    const newPublicKey = newPrivateKey.publicKey;
    
    // Create account transaction
    // Platform (operator) pays for account creation
    const transaction = new AccountCreateTransaction()
      .setKey(newPublicKey)
      .setInitialBalance(Hbar.fromTinybars(initialBalance));
    
    // Execute transaction
    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    
    // Check transaction status
    if (receipt.status !== Status.Success) {
      throw new Error(`Account creation failed with status: ${receipt.status}`);
    }
    
    const accountId = receipt.accountId;
    
    if (!accountId) {
      throw new Error('Account creation failed - no account ID returned');
    }
    
    const accountIdString = accountId.toString();
    const privateKeyString = newPrivateKey.toString();
    const publicKeyString = newPublicKey.toString();
    
    console.log(`✅ Hedera account created: ${accountIdString}`);
    
    return {
      accountId: accountIdString, // e.g., "0.0.1234567"
      privateKey: privateKeyString, // Must be encrypted before storing!
      publicKey: publicKeyString
    };
  } catch (error) {
    console.error('Error creating Hedera account:', error);
    throw new Error(`Failed to create Hedera account: ${error.message}`);
  }
}

/**
 * Bulk create Hedera accounts (for scalability)
 * Adds delays to avoid rate limiting
 * 
 * @param {number} count - Number of accounts to create
 * @param {number} delayMs - Delay between creations (default: 100ms)
 * @returns {Promise<Array<{accountId: string, privateKey: string, publicKey: string}>>}
 */
export async function bulkCreateHederaAccounts(count, delayMs = 100) {
  const accounts = [];
  
  for (let i = 0; i < count; i++) {
    try {
      const account = await createHederaAccount(0);
      accounts.push(account);
      
      // Add delay to avoid rate limiting (except for last account)
      if (i < count - 1) {
        await new Promise(resolve => setTimeout(resolve, delayMs));
      }
    } catch (error) {
      console.error(`Error creating account ${i + 1}/${count}:`, error);
      // Continue with next account even if one fails
    }
  }
  
  return accounts;
}

/**
 * Validate Hedera Account ID format
 * @param {string} accountId - Account ID to validate
 * @returns {boolean}
 */
export function isValidHederaAccountId(accountId) {
  if (!accountId || typeof accountId !== 'string') {
    return false;
  }
  
  // Hedera Account ID format: 0.0.xxxxx (shard.realm.account)
  const accountIdRegex = /^0\.0\.\d+$/;
  return accountIdRegex.test(accountId);
}

/**
 * Parse Hedera Account ID
 * @param {string} accountIdString - Account ID string
 * @returns {AccountId|null}
 */
export function parseAccountId(accountIdString) {
  try {
    if (!isValidHederaAccountId(accountIdString)) {
      return null;
    }
    return AccountId.fromString(accountIdString);
  } catch (error) {
    return null;
  }
}

