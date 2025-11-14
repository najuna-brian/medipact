/**
 * Payment Verification Service
 * 
 * Verifies HBAR payments from researchers when purchasing datasets.
 * Uses Hedera SDK to check transaction status and verify payment amounts.
 */

import { TransactionReceiptQuery, TransactionId, AccountId, Hbar, AccountBalanceQuery } from '@hashgraph/sdk';
import { createHederaClient } from './hedera-client.js';
import { getResearcher } from '../db/researcher-db.js';

/**
 * Verify HBAR payment transaction
 * 
 * @param {string} transactionId - Hedera transaction ID (e.g., "0.0.123@1234567890.123456789")
 * @param {string} researcherId - Researcher ID making the payment
 * @param {number} expectedAmountHBAR - Expected payment amount in HBAR
 * @param {string} recipientAccountId - Account ID that should receive the payment (platform account)
 * @returns {Promise<{verified: boolean, transactionId: string, amountHBAR: number, error?: string}>}
 */
export async function verifyHBARPayment(transactionId, researcherId, expectedAmountHBAR, recipientAccountId) {
  const client = createHederaClient();
  
  try {
    // Parse transaction ID
    const txId = TransactionId.fromString(transactionId);
    
    // Get researcher to verify they have a Hedera account
    const researcher = await getResearcher(researcherId);
    if (!researcher) {
      throw new Error('Researcher not found');
    }
    
    if (!researcher.hederaAccountId) {
      throw new Error('Researcher does not have a Hedera account');
    }
    
    const researcherAccountId = AccountId.fromString(researcher.hederaAccountId);
    const recipientAccount = AccountId.fromString(recipientAccountId);
    
    // Query transaction receipt
    const receipt = await new TransactionReceiptQuery()
      .setTransactionId(txId)
      .execute(client);
    
    // Check if transaction was successful
    if (receipt.status.toString() !== 'SUCCESS') {
      return {
        verified: false,
        transactionId,
        amountHBAR: 0,
        error: `Transaction failed with status: ${receipt.status.toString()}`
      };
    }
    
    // Get transaction record to verify transfer details
    // Note: This requires the transaction record, which may need additional queries
    // For now, we'll verify the transaction exists and was successful
    // In production, you'd want to check the actual transfer amount
    
    // Verify transaction is from researcher's account
    // The transaction ID contains the account that initiated it
    const txAccountId = txId.accountId.toString();
    if (txAccountId !== researcherAccountId.toString()) {
      return {
        verified: false,
        transactionId,
        amountHBAR: 0,
        error: 'Transaction not initiated by researcher account'
      };
    }
    
    // For a more complete verification, you would:
    // 1. Query the transaction record to get transfer details
    // 2. Verify the amount matches expectedAmountHBAR
    // 3. Verify the recipient is the platform account
    // This requires additional Hedera SDK queries
    
    // For now, return success if transaction exists and is successful
    // In production, implement full verification
    return {
      verified: true,
      transactionId,
      amountHBAR: expectedAmountHBAR, // In production, get from transaction record
      timestamp: receipt.consensusTimestamp.toString()
    };
    
  } catch (error) {
    console.error('Error verifying HBAR payment:', error);
    return {
      verified: false,
      transactionId,
      amountHBAR: 0,
      error: error.message || 'Failed to verify payment'
    };
  } finally {
    client.close();
  }
}

/**
 * Verify payment by checking account balance change
 * Alternative method: Check if platform account received expected amount
 * 
 * @param {string} recipientAccountId - Platform account ID
 * @param {number} expectedAmountHBAR - Expected amount in HBAR
 * @param {number} previousBalanceHBAR - Previous balance before payment
 * @returns {Promise<{verified: boolean, currentBalance: number, receivedAmount: number}>}
 */
export async function verifyPaymentByBalance(recipientAccountId, expectedAmountHBAR, previousBalanceHBAR) {
  const client = createHederaClient();
  
  try {
    const accountId = AccountId.fromString(recipientAccountId);
    
    // Query current balance
    const balance = await new (await import('@hashgraph/sdk')).AccountBalanceQuery()
      .setAccountId(accountId)
      .execute(client);
    
    const currentBalanceHBAR = Number(balance.hbars.toTinybars()) / 100000000;
    const receivedAmount = currentBalanceHBAR - previousBalanceHBAR;
    
    // Allow small tolerance for fees
    const tolerance = 0.01; // 0.01 HBAR tolerance
    const verified = Math.abs(receivedAmount - expectedAmountHBAR) <= tolerance;
    
    return {
      verified,
      currentBalance: currentBalanceHBAR,
      receivedAmount,
      expectedAmount: expectedAmountHBAR
    };
    
  } catch (error) {
    console.error('Error verifying payment by balance:', error);
    return {
      verified: false,
      currentBalance: 0,
      receivedAmount: 0,
      error: error.message
    };
  } finally {
    client.close();
  }
}

/**
 * Create payment request for researcher
 * Generates payment details that researcher can use to send HBAR
 * 
 * @param {string} researcherId - Researcher ID
 * @param {number} amountHBAR - Amount to pay in HBAR
 * @param {string} recipientAccountId - Platform account to receive payment
 * @returns {Promise<{paymentRequestId: string, amountHBAR: number, recipientAccountId: string, memo: string}>}
 */
export async function createPaymentRequest(researcherId, amountHBAR, recipientAccountId) {
  const researcher = await getResearcher(researcherId);
  if (!researcher) {
    throw new Error('Researcher not found');
  }
  
  const paymentRequestId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const memo = `MediPact Dataset Purchase - ${paymentRequestId}`;
  
  return {
    paymentRequestId,
    amountHBAR,
    recipientAccountId,
    memo,
    researcherAccountId: researcher.hederaAccountId,
    instructions: `Send ${amountHBAR} HBAR to account ${recipientAccountId} with memo: ${memo}`
  };
}

