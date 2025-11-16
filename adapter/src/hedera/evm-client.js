/**
 * Hedera EVM Client
 *
 * Handles smart contract interactions on Hedera EVM:
 * - ConsentManager contract for managing patient consent proofs
 * - RevenueSplitter contract for executing payouts
 *
 * IMPORTANT:
 * - All consent-related functions here are designed to work with ANONYMOUS patient IDs only.
 * - NO PII (name, phone, hospital MRN, etc.) should ever be sent to the contract.
 */

import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractCallQuery,
  TransferTransaction,
  Hbar,
  HbarUnit,
  Status,
  AccountId,
  ContractId
} from '@hashgraph/sdk';

/**
 * Record consent proof on-chain using ConsentManager contract (NO PII - only anonymous ID)
 * @param {Client} client - Hedera client
 * @param {string} consentManagerAddress - Contract address (EVM format: 0x...)
 * @param {string} anonymousPatientId - Anonymous patient ID (e.g., PID-001) - NO original patient ID
 * @param {string} hcsTopicId - HCS topic ID where consent proof is stored
 * @param {string} dataHash - Hash of the anonymized data
 * @returns {Promise<string>} Transaction ID
 */
export async function recordConsentOnChain(
  client,
  consentManagerAddress,
  anonymousPatientId,
  hcsTopicId,
  dataHash
) {
  try {
    // Convert EVM address to ContractId
    // Hedera EVM addresses use shard=0, realm=0 for testnet/mainnet
    const contractId = ContractId.fromEvmAddress(0, 0, consentManagerAddress);

    // Build contract function parameters (NO patientId - only anonymous ID)
    const functionParameters = new ContractFunctionParameters()
      .addString(anonymousPatientId)
      .addString(hcsTopicId)
      .addString(dataHash);

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
 * Check if consent exists and is valid on-chain using ConsentManager contract.
 * This is a READ-ONLY operation (no HBAR spend for state changes).
 *
 * @param {Client} client - Hedera client
 * @param {string} consentManagerAddress - Contract address (EVM format: 0x...)
 * @param {string} anonymousPatientId - Anonymous patient ID (e.g., PID-001)
 * @returns {Promise<boolean>} True if consent exists and is valid, false otherwise
 */
export async function isConsentValidOnChain(
  client,
  consentManagerAddress,
  anonymousPatientId
) {
  try {
    const contractId = ContractId.fromEvmAddress(0, 0, consentManagerAddress);

    const functionParameters = new ContractFunctionParameters().addString(
      anonymousPatientId
    );

    const query = new ContractCallQuery()
      .setContractId(contractId)
      .setGas(100000)
      .setFunction('isConsentValid', functionParameters);

    const response = await query.execute(client);
    return response.getBool(0);
  } catch (error) {
    // If contract reverts with ConsentNotFound or similar, treat as no consent
    console.warn(
      `   ⚠️  On-chain consent check failed for ${anonymousPatientId}: ${error.message}`
    );
    return false;
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

