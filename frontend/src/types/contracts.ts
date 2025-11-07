export interface ConsentRecord {
  originalPatientId: string;
  anonymousPatientId: string;
  hcsTopicId: string;
  consentHash: string;
  isValid: boolean;
  timestamp: string;
  transactionId?: string;
}

export interface RevenuePayout {
  totalAmount: string; // HBAR in tinybars
  patientAmount: string;
  hospitalAmount: string;
  medipactAmount: string;
  timestamp: string;
  transactionId: string;
  hashScanLink: string;
}

export interface ContractState {
  address: string;
  network: string;
  deployedAt?: string;
}

