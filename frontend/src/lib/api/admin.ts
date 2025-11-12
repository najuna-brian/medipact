/**
 * Admin API Client
 * 
 * Type-safe API client for admin endpoints.
 */

import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3002';

const adminClient = axios.create({
  baseURL: `${BACKEND_API_URL}/api/admin`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token
adminClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken') || sessionStorage.getItem('adminToken');
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
      localStorage.removeItem('adminToken');
      sessionStorage.removeItem('adminToken');
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
  verificationStatus: 'pending' | 'verified' | 'rejected';
  accessLevel: 'basic' | 'verified' | 'anonymous';
  verifiedAt?: string;
  verifiedBy?: string;
  registeredAt: string;
  verificationPrompt?: boolean;
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

