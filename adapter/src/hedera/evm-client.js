/**
 * Hedera EVM Client
 * 
 * Handles smart contract interactions on Hedera EVM:
 * - ConsentManager contract for recording consent proofs
 * - RevenueSplitter contract for executing payouts
 */

import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  TransferTransaction,
  Hbar,
  HbarUnit,
  Status,
  AccountId,
  ContractId
} from '@hashgraph/sdk';

/**
 * Record consent proof on-chain using ConsentManager contract
 * @param {Client} client - Hedera client
 * @param {string} consentManagerAddress - Contract address (EVM format: 0x...)
 * @param {string} patientId - Original patient ID
 * @param {string} anonymousPatientId - Anonymous patient ID (e.g., PID-001)
 * @param {string} hcsTopicId - HCS topic ID where consent proof is stored
 * @param {string} consentHash - Hash of the consent form
 * @returns {Promise<string>} Transaction ID
 */
export async function recordConsentOnChain(
  client,
  consentManagerAddress,
  patientId,
  anonymousPatientId,
  hcsTopicId,
  consentHash
) {
  try {
    // Convert EVM address to ContractId
    // Hedera EVM addresses use shard=0, realm=0 for testnet/mainnet
    const contractId = ContractId.fromEvmAddress(0, 0, consentManagerAddress);

    // Build contract function parameters
    const functionParameters = new ContractFunctionParameters()
      .addString(patientId)
      .addString(anonymousPatientId)
      .addString(hcsTopicId)
      .addString(consentHash);

    // Execute contract function
    // Gas limit: 500,000 should be sufficient for storing consent records
    const transaction = new ContractExecuteTransaction()
      .setContractId(contractId)
      .setGas(500000)
      .setFunction('recordConsent', functionParameters);

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);

    // Check transaction status
    if (receipt.status !== Status.Success) {
      throw new Error(`Contract execution failed with status: ${receipt.status}`);
    }

    const transactionId = txResponse.transactionId.toString();
    console.log(`Consent recorded on-chain: ${transactionId}`);

    return transactionId;
  } catch (error) {
    console.error('Error recording consent on-chain:', error);
    throw error;
  }
}

/**
 * Execute real payout by transferring HBAR to RevenueSplitter contract
 * The contract's receive() function will automatically split the revenue
 * @param {Client} client - Hedera client
 * @param {string} revenueSplitterAddress - Contract address (EVM format: 0x...)
 * @param {Hbar} totalHbarPayout - Total HBAR amount to transfer
 * @returns {Promise<string>} Transaction ID
 */
export async function executeRealPayout(client, revenueSplitterAddress, totalHbarPayout) {
  try {
    // Convert EVM address to AccountId for TransferTransaction
    // Hedera EVM addresses can be used directly as strings in addHbarTransfer
    const operatorId = client.operatorAccountId;
    
    // Create transfer transaction: send HBAR from operator to contract
    // Negative amount for sender, positive for receiver
    const tinybarAmount = totalHbarPayout.toTinybars();
    const negativeAmount = new Hbar(-Number(tinybarAmount), HbarUnit.Tinybar);
    const transaction = new TransferTransaction()
      .addHbarTransfer(operatorId, negativeAmount) // Negative: sender
      .addHbarTransfer(revenueSplitterAddress, totalHbarPayout); // Positive: receiver

    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);

    // Check transaction status
    if (receipt.status !== Status.Success) {
      throw new Error(`Transfer failed with status: ${receipt.status}`);
    }

    const transactionId = txResponse.transactionId.toString();
    console.log(`Real payout executed: ${transactionId}`);

    return transactionId;
  } catch (error) {
    console.error('Error executing real payout:', error);
    throw error;
  }
}

