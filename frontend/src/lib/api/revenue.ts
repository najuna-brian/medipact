/**
 * Revenue API Client
 * 
 * Type-safe API client for revenue distribution endpoints.
 */

import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3002';

const revenueClient = axios.create({
  baseURL: `${BACKEND_API_URL}/api/revenue`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface RevenueDistributionRequest {
  patientUPI: string;
  hospitalId: string;
  totalAmount: number; // in tinybars
  revenueSplitterAddress?: string;
}

export interface RevenueDistribution {
  method: 'direct' | 'contract';
  transactionId: string;
  transfers?: {
    patient: {
      accountId: string;
      amount: string;
    };
    hospital: {
      accountId: string;
      amount: string;
    };
    platform: {
      accountId: string;
      amount: string;
    };
  };
  split?: {
    patient: string;
    hospital: string;
    platform: string;
  };
  contractAddress?: string;
  totalAmount?: string;
}

export interface RevenueDistributionResponse {
  success: boolean;
  patientUPI: string;
  hospitalId: string;
  patientAccountId: string;
  hospitalAccountId: string;
  distribution: RevenueDistribution;
}

/**
 * Distribute revenue from a data sale
 */
export async function distributeRevenue(
  request: RevenueDistributionRequest
): Promise<RevenueDistributionResponse> {
  const response = await revenueClient.post<RevenueDistributionResponse>('/distribute', request);
  return response.data;
}

/**
 * Distribute revenue for multiple sales (bulk)
 */
export async function distributeBulkRevenue(
  sales: RevenueDistributionRequest[]
): Promise<RevenueDistributionResponse[]> {
  const response = await revenueClient.post<RevenueDistributionResponse[]>('/distribute/bulk', {
    sales,
  });
  return response.data;
}
