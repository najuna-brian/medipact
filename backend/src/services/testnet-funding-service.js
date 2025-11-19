/**
 * Testnet Funding Service
 * 
 * Automatically funds Hedera accounts on testnet for demo/testing purposes.
 * Only works on testnet - disabled on mainnet for security.
 */

import { TransferTransaction, Hbar, AccountId } from '@hashgraph/sdk';
import { createHederaClient } from './hedera-client.js';

/**
 * Automatically fund a Hedera account with testnet HBAR
 * Only works on testnet - returns early on mainnet
 * 
 * @param {string} accountId - Hedera account ID to fund (format: "0.0.xxxxx")
 * @param {number} amountHBAR - Amount of HBAR to transfer (default: 1000)
 * @returns {Promise<{success: boolean, transactionId?: string, message: string}>}
 */
export async function autoFundTestnetAccount(accountId, amountHBAR = 1000) {
  // Safety check: Only work on testnet
  const network = process.env.HEDERA_NETWORK || 'testnet';
  if (network !== 'testnet' && network !== 'previewnet') {
    console.log(`⚠️ Auto-funding skipped: Only available on testnet/previewnet (current: ${network})`);
    return {
      success: false,
      message: `Auto-funding only available on testnet/previewnet. Current network: ${network}`
    };
  }

  // Check if auto-funding is enabled
  const autoFundingEnabled = process.env.AUTO_FUND_TESTNET_ACCOUNTS === 'true';
  if (!autoFundingEnabled) {
    console.log('⚠️ Auto-funding disabled (set AUTO_FUND_TESTNET_ACCOUNTS=true to enable)');
    return {
      success: false,
      message: 'Auto-funding is disabled. Set AUTO_FUND_TESTNET_ACCOUNTS=true to enable.'
    };
  }

  // Get funding amount from environment or use default
  const fundingAmount = parseFloat(process.env.TESTNET_FUNDING_AMOUNT_HBAR) || amountHBAR;

  const client = createHederaClient();
  
  try {
    // Get operator account ID
    const operatorId = process.env.OPERATOR_ID;
    if (!operatorId) {
      throw new Error('OPERATOR_ID not set - cannot fund accounts');
    }

    // Parse account IDs
    const recipientAccountId = AccountId.fromString(accountId);
    const senderAccountId = AccountId.fromString(operatorId);

    console.log(`💰 Auto-funding account ${accountId} with ${fundingAmount} HBAR...`);

    // Create transfer transaction
    const transferTransaction = new TransferTransaction()
      .addHbarTransfer(senderAccountId, Hbar.fromTinybars(-fundingAmount * 100_000_000)) // Negative = sending
      .addHbarTransfer(recipientAccountId, Hbar.fromTinybars(fundingAmount * 100_000_000)) // Positive = receiving
      .setTransactionMemo(`Auto-funding testnet account for demo/testing`);

    // Execute transaction
    const txResponse = await transferTransaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    const transactionId = txResponse.transactionId.toString();

    console.log(`✅ Successfully funded account ${accountId} with ${fundingAmount} HBAR`);
    console.log(`   Transaction ID: ${transactionId}`);
    console.log(`   HashScan: https://hashscan.io/${network}/transaction/${transactionId}`);

    return {
      success: true,
      transactionId,
      amountHBAR: fundingAmount,
      message: `Account funded with ${fundingAmount} HBAR`,
      hashScanLink: `https://hashscan.io/${network}/transaction/${transactionId}`
    };
  } catch (error) {
    console.error(`❌ Failed to fund account ${accountId}:`, error.message);
    
    // Don't throw - funding failure shouldn't break account creation
    return {
      success: false,
      message: `Failed to fund account: ${error.message}`,
      error: error.message
    };
  } finally {
    client.close();
  }
}

/**
 * Check if an account has sufficient balance
 * @param {string} accountId - Hedera account ID
 * @param {number} minBalanceHBAR - Minimum balance required (default: 10)
 * @returns {Promise<{hasBalance: boolean, currentBalance: number}>}
 */
export async function checkAccountBalance(accountId, minBalanceHBAR = 10) {
  const client = createHederaClient();
  
  try {
    const accountIdObj = AccountId.fromString(accountId);
    const accountInfo = await client.getAccountInfo(accountIdObj);
    const balanceHBAR = accountInfo.balance.toTinybars().toNumber() / 100_000_000;
    
    return {
      hasBalance: balanceHBAR >= minBalanceHBAR,
      currentBalance: balanceHBAR,
      minRequired: minBalanceHBAR
    };
  } catch (error) {
    console.error(`Error checking account balance for ${accountId}:`, error.message);
    return {
      hasBalance: false,
      currentBalance: 0,
      minRequired: minBalanceHBAR,
      error: error.message
    };
  } finally {
    client.close();
  }
}

/**
 * Fund account if balance is low (for existing accounts)
 * @param {string} accountId - Hedera account ID
 * @param {number} minBalanceHBAR - Minimum balance threshold (default: 10)
 * @param {number} fundingAmountHBAR - Amount to fund if low (default: 1000)
 * @returns {Promise<{funded: boolean, message: string}>}
 */
export async function fundIfLowBalance(accountId, minBalanceHBAR = 10, fundingAmountHBAR = 1000) {
  const balanceCheck = await checkAccountBalance(accountId, minBalanceHBAR);
  
  if (balanceCheck.hasBalance) {
    return {
      funded: false,
      message: `Account has sufficient balance: ${balanceCheck.currentBalance} HBAR`,
      currentBalance: balanceCheck.currentBalance
    };
  }

  console.log(`⚠️ Account ${accountId} has low balance (${balanceCheck.currentBalance} HBAR), funding...`);
  return await autoFundTestnetAccount(accountId, fundingAmountHBAR);
}

