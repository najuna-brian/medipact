/**
 * Hedera Consensus Service (HCS) Client
 * 
 * Wrapper for HCS operations - query logging, dataset metadata, audit trails.
 * Uses Hedera SDK for HCS topic creation and message submission.
 */

import {
  Client,
  TopicCreateTransaction,
  TopicMessageSubmitTransaction,
  TopicMessageQuery,
  Hbar,
  AccountId,
  PrivateKey
} from '@hashgraph/sdk';
import { getHederaNetwork } from '../utils/network-config.js';

let hcsClient = null;
let queryAuditTopicId = null;
let datasetMetadataTopicId = null;

/**
 * Initialize HCS client
 * Automatically detects network based on NODE_ENV (production = mainnet, dev = testnet)
 */
export function initHCSClient() {
  const operatorId = process.env.OPERATOR_ID;
  const operatorKey = process.env.OPERATOR_KEY;
  
  if (!operatorId || !operatorKey) {
    console.warn('⚠️  HCS client not initialized: Missing OPERATOR_ID or OPERATOR_KEY');
    return null;
  }
  
  try {
    const network = getHederaNetwork(); // Automatic network detection
    const operatorIdObj = AccountId.fromString(operatorId);
    const operatorKeyObj = PrivateKey.fromStringECDSA(operatorKey);
    
    hcsClient = Client.forName(network);
    hcsClient.setOperator(operatorIdObj, operatorKeyObj);
    
    // Get topic IDs from environment or create them
    queryAuditTopicId = process.env.HCS_QUERY_AUDIT_TOPIC_ID;
    datasetMetadataTopicId = process.env.HCS_DATASET_METADATA_TOPIC_ID;
    
    console.log(`✅ HCS client initialized for ${network}`);
    return hcsClient;
  } catch (error) {
    console.error('❌ Error initializing HCS client:', error);
    return null;
  }
}

/**
 * Submit message to HCS topic
 * 
 * @param {string} topicId - HCS topic ID
 * @param {Object|string} message - Message to submit (will be JSON stringified if object)
 * @returns {Promise<string>} Transaction ID
 */
export async function submitHCSMessage(topicId, message) {
  if (!hcsClient) {
    initHCSClient();
  }
  
  if (!hcsClient) {
    console.warn('⚠️  HCS client not available, skipping HCS logging');
    return null;
  }
  
  try {
    const messageString = typeof message === 'string' ? message : JSON.stringify(message);
    
    const transaction = await new TopicMessageSubmitTransaction()
      .setTopicId(topicId)
      .setMessage(messageString)
      .execute(hcsClient);
    
    const receipt = await transaction.getReceipt(hcsClient);
    const transactionId = receipt.status.toString();
    
    return `${topicId}@${transaction.seconds.toString()}.${transaction.nanos.toString()}`;
  } catch (error) {
    console.error('Error submitting HCS message:', error);
    throw error;
  }
}

/**
 * Log query to HCS for audit trail
 * 
 * @param {Object} queryData - Query metadata
 * @returns {Promise<string|null>} HCS message ID or null
 */
export async function logQueryToHCS(queryData) {
  if (!queryAuditTopicId) {
    console.warn('⚠️  Query audit topic not configured, skipping HCS logging');
    return null;
  }
  
  try {
    const auditMessage = {
      type: 'query_audit',
      researcherId: queryData.researcherId,
      filters: queryData.filters,
      resultCount: queryData.resultCount,
      timestamp: new Date().toISOString(),
      preview: queryData.preview || false
    };
    
    return await submitHCSMessage(queryAuditTopicId, auditMessage);
  } catch (error) {
    console.error('Error logging query to HCS:', error);
    return null;
  }
}

/**
 * Log dataset metadata to HCS
 * 
 * @param {Object} datasetData - Dataset metadata
 * @returns {Promise<string|null>} HCS message ID or null
 */
export async function logDatasetToHCS(datasetData) {
  if (!datasetMetadataTopicId) {
    console.warn('⚠️  Dataset metadata topic not configured, skipping HCS logging');
    return null;
  }
  
  try {
    const metadata = {
      type: 'dataset_metadata',
      datasetId: datasetData.id,
      name: datasetData.name,
      country: datasetData.country,
      recordCount: datasetData.recordCount,
      dateRange: {
        start: datasetData.dateRangeStart,
        end: datasetData.dateRangeEnd
      },
      consentType: datasetData.consentType,
      timestamp: new Date().toISOString()
    };
    
    return await submitHCSMessage(datasetMetadataTopicId, metadata);
  } catch (error) {
    console.error('Error logging dataset to HCS:', error);
    return null;
  }
}

/**
 * Get HashScan link for transaction
 * 
 * @param {string} transactionId - Transaction ID (format: topicId@seconds.nanos)
 * @returns {string} HashScan URL
 */
export function getHashScanLink(transactionId) {
  const network = getHederaNetwork(); // Automatic network detection
  const networkPath = network === 'mainnet' ? '' : `${network}.`;
  return `https://hashscan.io/${networkPath}message/${transactionId}`;
}

// Initialize on import if credentials are available
if (process.env.OPERATOR_ID && process.env.OPERATOR_KEY) {
  initHCSClient();
}

