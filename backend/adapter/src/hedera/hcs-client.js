/**
 * Hedera Consensus Service (HCS) Client
 * 
 * Handles HCS topic creation and message submission for:
 * - Consent proofs
 * - Data proofs
 */

import { Client, PrivateKey, AccountId, TopicCreateTransaction, TopicMessageSubmitTransaction, Status } from '@hashgraph/sdk';
import dotenv from 'dotenv';
import { getHederaNetwork } from '../utils/network-config.js';

dotenv.config();

/**
 * Initialize Hedera client based on environment configuration
 * Follows official Hiero SDK patterns for client initialization
 * Automatically detects network based on NODE_ENV (production = mainnet, dev = testnet)
 * @returns {Client} Configured Hedera client
 */
export function createHederaClient() {
  if (
    process.env.OPERATOR_ID == null ||
    process.env.OPERATOR_KEY == null
  ) {
    throw new Error(
      "Environment variables OPERATOR_ID and OPERATOR_KEY are required.",
    );
  }

  const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
  const operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);
  const network = getHederaNetwork(); // Automatic network detection

  const client = Client.forName(network);
  client.setOperator(operatorId, operatorKey);

  return client;
}

/**
 * Create a new HCS topic
 * @param {Client} client - Hedera client
 * @param {string} memo - Topic memo/description
 * @returns {Promise<string>} Topic ID
 */
export async function createTopic(client, memo = 'MediPact Topic') {
  try {
    const txResponse = await new TopicCreateTransaction()
      .setTopicMemo(memo)
      .execute(client);

    const receipt = await txResponse.getReceipt(client);
    
    // Check transaction status
    if (receipt.status !== Status.Success) {
      throw new Error(`Transaction failed with status: ${receipt.status}`);
    }
    
    const topicId = receipt.topicId;

    if (!topicId) {
      throw new Error('Failed to create topic - no topic ID returned');
    }

    console.log(`Topic created: ${topicId.toString()}`);
    return topicId.toString();
  } catch (error) {
    console.error('Error creating topic:', error);
    throw error;
  }
}

/**
 * Submit a message to an HCS topic
 * @param {Client} client - Hedera client
 * @param {string} topicId - Topic ID
 * @param {string|Uint8Array} message - Message to submit
 * @returns {Promise<string>} Transaction ID
 */
export async function submitMessage(client, topicId, message) {
  try {
    const txResponse = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(message)
      .execute(client);

    const receipt = await txResponse.getReceipt(client);
    
    // Check transaction status
    if (receipt.status !== Status.Success) {
      throw new Error(`Message submission failed with status: ${receipt.status}`);
    }
    
    const transactionId = txResponse.transactionId.toString();

    console.log(`Message submitted to topic ${topicId}`);
    console.log(`Transaction ID: ${transactionId}`);
    
    return transactionId;
  } catch (error) {
    console.error('Error submitting message:', error);
    throw error;
  }
}

/**
 * Generate HashScan link for a transaction
 * @param {string} transactionId - Transaction ID
 * @param {string} network - Network (testnet or mainnet)
 * @returns {string} HashScan URL
 */
export function getHashScanLink(transactionId, network = null) {
  // If network not provided, detect from environment
  if (!network) {
    network = getHederaNetwork();
  }
  
  // Extract transaction ID format: 0.0.123@1234567890.123456789
  // HashScan format: https://hashscan.io/{network}/transaction/{transactionId}
  // Mainnet URLs don't have "mainnet" in the path
  const networkPath = network === 'mainnet' ? '' : `${network}.`;
  return `https://hashscan.io/${networkPath}transaction/${transactionId}`;
}

/**
 * Initialize HCS topics for MediPact
 * Creates two topics: one for consent proofs, one for data proofs
 * @param {Client} client - Hedera client
 * @returns {Promise<{consentTopicId: string, dataTopicId: string}>}
 */
export async function initializeMedipactTopics(client) {
  console.log('Initializing MediPact HCS topics...');
  
  const consentTopicId = await createTopic(client, 'MediPact Consent Proofs');
  const dataTopicId = await createTopic(client, 'MediPact Data Proofs');

  return {
    consentTopicId,
    dataTopicId
  };
}
