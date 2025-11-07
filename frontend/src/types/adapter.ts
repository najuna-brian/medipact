export interface ProcessingStatus {
  status: 'idle' | 'processing' | 'completed' | 'error';
  progress?: number;
  message?: string;
  error?: string;
}

export interface ProcessingResult {
  recordsProcessed: number;
  consentProofs: number;
  dataProofs: number;
  outputFile?: string;
  consentTopicId?: string;
  dataTopicId?: string;
  transactions: TransactionResult[];
  revenue?: RevenueSplit;
}

export interface TransactionResult {
  type: 'consent' | 'data';
  transactionId: string;
  hashScanLink: string;
  timestamp: string;
  patientId?: string;
  anonymousPID?: string;
}

export interface RevenueSplit {
  totalHbar: number;
  totalUsd: number;
  totalLocal?: number;
  patient: {
    hbar: number;
    usd: number;
    local?: number;
    percentage: number;
  };
  hospital: {
    hbar: number;
    usd: number;
    local?: number;
    percentage: number;
  };
  medipact: {
    hbar: number;
    usd: number;
    local?: number;
    percentage: number;
  };
}

export interface AnonymizedRecord {
  'Anonymous PID': string;
  [key: string]: string | number;
}

