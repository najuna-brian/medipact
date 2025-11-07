/**
 * Hedera Mirror Node Integration
 * 
 * Fetches transaction history and HCS messages from Hedera mirror node
 */

import type { Transaction, HCSMessage } from '@/types/hedera';

const MIRROR_NODE_BASE_URL = {
  testnet: 'https://testnet.mirrornode.hedera.com',
  mainnet: 'https://mainnet-public.mirrornode.hedera.com',
  previewnet: 'https://previewnet.mirrornode.hedera.com',
};

export async function getTransactions(
  network: string = 'testnet',
  limit: number = 50,
  order: 'asc' | 'desc' = 'desc'
): Promise<Transaction[]> {
  try {
    const baseUrl = MIRROR_NODE_BASE_URL[network as keyof typeof MIRROR_NODE_BASE_URL] || MIRROR_NODE_BASE_URL.testnet;
    const response = await fetch(
      `${baseUrl}/api/v1/transactions?limit=${limit}&order=${order}`
    );

    if (!response.ok) {
      throw new Error(`Mirror node API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transform mirror node response to our Transaction format
    return data.transactions?.map((tx: any) => ({
      transactionId: tx.transaction_id,
      type: tx.name?.includes('CONSENSUSSUBMITMESSAGE') ? 'data' : 'consent',
      timestamp: tx.consensus_timestamp,
      hashScanLink: `https://hashscan.io/${network}/transaction/${tx.transaction_id}`,
    })) || [];
  } catch (error) {
    console.error('Error fetching transactions from mirror node:', error);
    return [];
  }
}

export async function getHCSTopicMessages(
  topicId: string,
  network: string = 'testnet',
  limit: number = 50
): Promise<HCSMessage[]> {
  try {
    const baseUrl = MIRROR_NODE_BASE_URL[network as keyof typeof MIRROR_NODE_BASE_URL] || MIRROR_NODE_BASE_URL.testnet;
    const response = await fetch(
      `${baseUrl}/api/v1/topics/${topicId}/messages?limit=${limit}&order=desc`
    );

    if (!response.ok) {
      throw new Error(`Mirror node API error: ${response.statusText}`);
    }

    const data = await response.json();
    
    return data.messages?.map((msg: any) => ({
      consensusTimestamp: msg.consensus_timestamp,
      message: msg.message,
      runningHash: msg.running_hash,
      sequenceNumber: msg.sequence_number,
    })) || [];
  } catch (error) {
    console.error('Error fetching HCS messages from mirror node:', error);
    return [];
  }
}

export async function getTopicInfo(
  topicId: string,
  network: string = 'testnet'
) {
  try {
    const baseUrl = MIRROR_NODE_BASE_URL[network as keyof typeof MIRROR_NODE_BASE_URL] || MIRROR_NODE_BASE_URL.testnet;
    const response = await fetch(`${baseUrl}/api/v1/topics/${topicId}`);

    if (!response.ok) {
      throw new Error(`Mirror node API error: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching topic info from mirror node:', error);
    return null;
  }
}

