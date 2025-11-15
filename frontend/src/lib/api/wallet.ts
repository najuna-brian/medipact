/**
 * Wallet API Client
 * 
 * Functions for wallet balance and withdrawal operations.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface WalletBalance {
  balanceHBAR: number;
  balanceUSD: number;
  hederaAccountId: string | null;
  evmAddress: string | null;
  paymentMethod: string | null;
  bankAccountNumber: string | null;
  bankName: string | null;
  mobileMoneyProvider: string | null;
  mobileMoneyNumber: string | null;
  withdrawalThresholdUSD: number;
  autoWithdrawEnabled: boolean;
  lastWithdrawalAt: string | null;
  totalWithdrawnUSD: number;
}

export interface Withdrawal {
  id: number;
  upi?: string;
  hospitalId?: string;
  userType: 'patient' | 'hospital';
  amountHBAR: number;
  amountUSD: number;
  paymentMethod: string;
  destinationAccount: string;
  transactionId: string | null;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processedAt: string | null;
  createdAt: string;
}

/**
 * Get patient wallet balance
 */
export async function getPatientBalance(upi: string): Promise<WalletBalance> {
  const response = await fetch(`${API_URL}/api/patient/${upi}/wallet/balance`);
  if (!response.ok) {
    throw new Error('Failed to fetch balance');
  }
  return response.json();
}

/**
 * Get hospital wallet balance
 */
export async function getHospitalBalance(hospitalId: string): Promise<WalletBalance> {
  const response = await fetch(`${API_URL}/api/hospital/${hospitalId}/wallet/balance`);
  if (!response.ok) {
    throw new Error('Failed to fetch balance');
  }
  return response.json();
}

/**
 * Initiate patient withdrawal
 */
export async function initiatePatientWithdrawal(upi: string, amountUSD?: number): Promise<{ withdrawalId: number; message: string }> {
  const response = await fetch(`${API_URL}/api/patient/${upi}/wallet/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountUSD })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Withdrawal failed');
  }
  return response.json();
}

/**
 * Initiate hospital withdrawal
 */
export async function initiateHospitalWithdrawal(hospitalId: string, amountUSD?: number): Promise<{ withdrawalId: number; message: string }> {
  const response = await fetch(`${API_URL}/api/hospital/${hospitalId}/wallet/withdraw`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amountUSD })
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Withdrawal failed');
  }
  return response.json();
}

/**
 * Get patient withdrawal history
 */
export async function getPatientWithdrawals(upi: string, limit: number = 50): Promise<Withdrawal[]> {
  const response = await fetch(`${API_URL}/api/patient/${upi}/wallet/withdrawals?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch withdrawals');
  }
  return response.json();
}

/**
 * Get hospital withdrawal history
 */
export async function getHospitalWithdrawals(hospitalId: string, limit: number = 50): Promise<Withdrawal[]> {
  const response = await fetch(`${API_URL}/api/hospital/${hospitalId}/wallet/withdrawals?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch withdrawals');
  }
  return response.json();
}

