import type { HederaNetwork } from '@/types/hedera';

export function getHashScanLink(
  transactionId: string,
  network: HederaNetwork = 'testnet'
): string {
  const baseUrl = process.env.NEXT_PUBLIC_HASHSCAN_BASE_URL || 'https://hashscan.io';
  return `${baseUrl}/${network}/transaction/${transactionId}`;
}

export function getHashScanTopicLink(
  topicId: string,
  network: HederaNetwork = 'testnet'
): string {
  const baseUrl = process.env.NEXT_PUBLIC_HASHSCAN_BASE_URL || 'https://hashscan.io';
  return `${baseUrl}/${network}/topic/${topicId}`;
}

export function getHashScanAccountLink(
  accountId: string,
  network: HederaNetwork = 'testnet'
): string {
  const baseUrl = process.env.NEXT_PUBLIC_HASHSCAN_BASE_URL || 'https://hashscan.io';
  return `${baseUrl}/${network}/account/${accountId}`;
}

export function getHashScanContractLink(
  contractAddress: string,
  network: HederaNetwork = 'testnet'
): string {
  const baseUrl = process.env.NEXT_PUBLIC_HASHSCAN_BASE_URL || 'https://hashscan.io';
  return `${baseUrl}/${network}/contract/${contractAddress}`;
}

