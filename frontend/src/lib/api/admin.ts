/**
 * Admin API Client
 * 
 * Type-safe API client for admin endpoints.
 */

import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.NEXT_PUBLIC_BACKEND_PORT || 8080}`;

const adminClient = axios.create({
  baseURL: `${BACKEND_API_URL}/api/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
adminClient.interceptors.request.use(
  (config) => {
    // Use the same key as useAdminSession hook
    const token = sessionStorage.getItem('medipact_admin_token') || localStorage.getItem('medipact_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-admin-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
adminClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      sessionStorage.removeItem('medipact_admin_token');
      sessionStorage.removeItem('medipact_admin_user');
      localStorage.removeItem('medipact_admin_token');
      localStorage.removeItem('medipact_admin_user');
      if (typeof window !== 'undefined') {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Types
export interface AdminHospital {
  hospitalId: string;
  name: string;
  country: string;
  location?: string;
  contactEmail?: string;
  fhirEndpoint?: string;
  registeredAt: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  verificationDocuments?: {
    licenseNumber?: string;
    registrationCertificate?: string;
    additionalDocuments?: any[];
    rejectionReason?: string;
  } | null;
}

export interface AdminHospitalsResponse {
  hospitals: AdminHospital[];
}

export interface AdminHospitalDetail extends AdminHospital {
  fhirEndpoint?: string;
}

export interface AdminResearcher {
  researcherId: string;
  hederaAccountId?: string;
  email: string;
  organizationName: string;
  contactName?: string;
  country?: string;
  registrationNumber?: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  accessLevel: 'basic' | 'verified' | 'anonymous';
  verifiedAt?: string;
  verifiedBy?: string;
  registeredAt: string;
  verificationPrompt?: boolean;
  verificationDocuments?: any | null;
}

export interface AdminResearchersResponse {
  total: number;
  researchers: AdminResearcher[];
}

export interface AdminResearcherDetail extends AdminResearcher {
  verificationDocuments: any | null;
}

// Hospital Management
export async function getAllHospitals(): Promise<AdminHospitalsResponse> {
  const response = await adminClient.get('/hospitals');
  return response.data;
}

export async function getHospitalDetail(hospitalId: string): Promise<AdminHospitalDetail> {
  const response = await adminClient.get(`/hospitals/${hospitalId}`);
  return response.data;
}

export async function verifyHospital(hospitalId: string): Promise<{ success: boolean; hospital: AdminHospital }> {
  const response = await adminClient.post(`/hospitals/${hospitalId}/verify`);
  return response.data;
}

export async function rejectHospital(
  hospitalId: string,
  reason: string
): Promise<{ success: boolean; hospital: AdminHospital }> {
  const response = await adminClient.post(`/hospitals/${hospitalId}/reject`, { reason });
  return response.data;
}

// Researcher Management
export async function getAllResearchers(): Promise<AdminResearchersResponse> {
  const response = await adminClient.get('/researchers');
  return response.data;
}

export async function getResearcherDetail(researcherId: string): Promise<AdminResearcherDetail> {
  const response = await adminClient.get(`/researchers/${researcherId}`);
  return response.data;
}

export async function verifyResearcher(researcherId: string): Promise<{ message: string; researcher: AdminResearcher }> {
  const response = await adminClient.post(`/researchers/${researcherId}/verify`);
  return response.data;
}

export async function rejectResearcher(
  researcherId: string,
  reason: string
): Promise<{ message: string; researcher: AdminResearcher }> {
  const response = await adminClient.post(`/researchers/${researcherId}/reject`, { reason });
  return response.data;
}

// Dashboard Stats
export interface DashboardStats {
  totalRecords: number;
  totalRevenue: {
    balanceHBAR: number;
    balanceUSD: number;
    hederaAccountId: string | null;
  };
  activeUsers: number;
  totalTransactions: number;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const response = await adminClient.get('/dashboard/stats');
  return response.data;
}

// Revenue Distribution Types
export interface RevenueDistribution {
  id: string;
  purchaseId: string;
  patientUPI?: string | null;
  hospitalId?: string | null;
  recipientType: 'patient' | 'hospital' | 'platform';
  recipientAccountId: string;
  recipientEvmAddress?: string | null;
  amountHBAR: number;
  amountTinybars: number;
  transactionId: string;
  distributionMethod: 'direct' | 'contract-dynamic' | 'contract-fixed';
  contractAddress?: string | null;
  status: 'pending' | 'completed' | 'failed';
  errorMessage?: string | null;
  distributedAt: string;
}

export interface RevenueDistributionStats {
  totalDistributions: number;
  totalPurchases: number;
  totalPatients: number;
  totalHospitals: number;
  totalDistributedHBAR: number;
  totalPatientHBAR: number;
  totalHospitalHBAR: number;
  totalPlatformHBAR: number;
  failedDistributions: number;
}

// Revenue Distribution API
const revenueClient = axios.create({
  baseURL: `${BACKEND_API_URL}/api/revenue`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to revenue client
revenueClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('medipact_admin_token') || localStorage.getItem('medipact_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-admin-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function getRevenueDistributions(limit = 100, offset = 0): Promise<{ distributions: RevenueDistribution[]; limit: number; offset: number }> {
  const response = await revenueClient.get('/distributions', { params: { limit, offset } });
  return response.data;
}

export async function getRevenueDistributionsByPurchase(purchaseId: string): Promise<{ purchaseId: string; distributions: RevenueDistribution[] }> {
  const response = await revenueClient.get(`/distributions/purchase/${purchaseId}`);
  return response.data;
}

export async function getRevenueDistributionsByPatient(patientUPI: string, limit = 50): Promise<{ patientUPI: string; distributions: RevenueDistribution[] }> {
  const response = await revenueClient.get(`/distributions/patient/${patientUPI}`, { params: { limit } });
  return response.data;
}

export async function getRevenueDistributionsByHospital(hospitalId: string, limit = 50): Promise<{ hospitalId: string; distributions: RevenueDistribution[] }> {
  const response = await revenueClient.get(`/distributions/hospital/${hospitalId}`, { params: { limit } });
  return response.data;
}

export async function getRevenueDistributionStats(): Promise<RevenueDistributionStats> {
  const response = await revenueClient.get('/distributions/stats');
  return response.data;
}

// Marketplace API for purchase details
const marketplaceClient = axios.create({
  baseURL: `${BACKEND_API_URL}/api/marketplace`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to marketplace client
marketplaceClient.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('medipact_admin_token') || localStorage.getItem('medipact_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers['x-admin-token'] = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function getPurchasePatients(purchaseId: string): Promise<{
  purchaseId: string;
  totalPatients: number;
  totalAmountHBAR: number;
  patients: Array<{
    patientUPI: string;
    hospitalId: string | null;
    amountHBAR: number;
    amountTinybars: number;
    transactionId: string;
    recipientAccountId: string;
    distributedAt: string;
    status: string;
  }>;
}> {
  const response = await marketplaceClient.get(`/purchases/${purchaseId}/patients`);
  return response.data;
}

