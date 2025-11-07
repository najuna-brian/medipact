export type HederaNetwork = 'testnet' | 'mainnet' | 'previewnet';

export interface HCSMessage {
  consensusTimestamp: string;
  message: string;
  runningHash: string;
  sequenceNumber: number;
}

export interface HCSTopic {
  topicId: string;
  memo?: string;
  adminKey?: string;
  submitKey?: string;
  autoRenewAccount?: string;
  autoRenewPeriod?: number;
  expirationTime?: string;
  messageCount?: number;
}

export interface HashScanLink {
  transactionId: string;
  network: HederaNetwork;
  url: string;
}

export interface Transaction {
  transactionId: string;
  type: 'consent' | 'data';
  timestamp: string;
  hashScanLink: string;
  patientId?: string;
  anonymousPID?: string;
  hash?: string;
}

