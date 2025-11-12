/**
 * Hedera Account Service
 * 
 * Creates and manages Hedera accounts for users (patients/hospitals).
 * Platform pays for account creation and manages encrypted private keys.
 * Uses EVM-compatible account creation for smart contract interactions.
 */

import { AccountCreateTransaction, Hbar, Status, PrivateKey } from '@hashgraph/sdk';
import { createHederaClient } from './hedera-client.js';

/**
 * Create a new Hedera account for a user
 * Platform pays for account creation (operator account)
 * Uses EVM-compatible account creation for smart contract interactions
 * 
 * @param {number} initialBalance - Initial HBAR balance (default: 0)
 * @returns {Promise<{accountId: string, privateKey: string, publicKey: string, evmAddress: string}>}
 */
export async function createHederaAccount(initialBalance = 0) {
  const client = createHederaClient();
  
  try {
    // Generate new key pair for the user
    const newPrivateKey = PrivateKey.generateECDSA();
    const newPublicKey = newPrivateKey.publicKey;
    
    // Create account transaction with EVM compatibility
    // Using setECDSAKeyWithAlias ensures EVM address is available
    // Platform (operator) pays for account creation
    const transaction = new AccountCreateTransaction()
      .setECDSAKeyWithAlias(newPrivateKey)  // EVM compatible - uses private key
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
    
    // Get EVM address for compatibility with smart contracts
    const evmAddress = newPublicKey.toEvmAddress();
    
    console.log(`✅ Hedera account created: ${accountIdString}`);
    console.log(`   EVM Address: 0x${evmAddress}`);
    
    return {
      accountId: accountIdString, // e.g., "0.0.1234567"
      privateKey: privateKeyString, // Must be encrypted before storing!
      publicKey: publicKeyString,
      evmAddress: `0x${evmAddress}` // EVM address for smart contract interactions
    };
  } catch (error) {
    console.error('Error creating Hedera account:', error);
    throw new Error(`Failed to create Hedera account: ${error.message}`);
  } finally {
    client.close(); // Always close client to prevent resource leaks
  }
}

/**
 * Create Hedera account with retry logic
 * Handles transient failures with exponential backoff
 * 
 * @param {number} initialBalance - Initial HBAR balance (default: 0)
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @param {number} initialDelayMs - Initial delay between retries in ms (default: 1000)
 * @returns {Promise<{accountId: string, privateKey: string, publicKey: string, evmAddress: string}>}
 */
export async function createHederaAccountWithRetry(initialBalance = 0, maxRetries = 3, initialDelayMs = 1000) {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await createHederaAccount(initialBalance);
    } catch (error) {
      lastError = error;
      console.warn(`Account creation attempt ${attempt}/${maxRetries} failed:`, error.message);
      
      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        const delay = initialDelayMs * Math.pow(2, attempt - 1);
        console.log(`Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw new Error(`Failed to create Hedera account after ${maxRetries} attempts: ${lastError.message}`);
}

/**
 * Bulk create Hedera accounts (for scalability)
 * Adds delays to avoid rate limiting
 * 
 * @param {number} count - Number of accounts to create
 * @param {number} delayMs - Delay between creations (default: 100ms)
 * @returns {Promise<Array<{accountId: string, privateKey: string, publicKey: string, evmAddress: string}>>}
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

