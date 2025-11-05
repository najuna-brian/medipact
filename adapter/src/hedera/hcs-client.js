/**
 * Hedera Consensus Service (HCS) Client
 * 
 * Handles HCS topic creation and message submission for:
 * - Consent proofs
 * - Data proofs
 */

import { Client, PrivateKey, TopicCreateTransaction, TopicMessageSubmitTransaction, Status } from '@hashgraph/sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initialize Hedera client for testnet
 * @returns {Client} Configured Hedera client
 */
export function createHederaClient() {
  const accountId = process.env.ACCOUNT_ID;
  const privateKey = process.env.PRIVATE_KEY;

  if (!accountId || !privateKey) {
    throw new Error('ACCOUNT_ID and PRIVATE_KEY must be set in .env file');
  }

  const client = Client.forTestnet();
  client.setOperator(accountId, PrivateKey.fromStringECDSA(privateKey));

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
export function getHashScanLink(transactionId, network = 'testnet') {
  // Extract transaction ID format: 0.0.123@1234567890.123456789
  // HashScan format: https://hashscan.io/testnet/transaction/{transactionId}
  return `https://hashscan.io/${network}/transaction/${transactionId}`;
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
