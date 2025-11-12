/**
 * Hospital API Client
 * 
 * Type-safe API client for hospital endpoints.
 */

import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3002';

const hospitalClient = axios.create({
  baseURL: `${BACKEND_API_URL}/api/hospital`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface HospitalRegistrationRequest {
  name: string;
  country: string;
  location?: string;
  fhirEndpoint?: string;
  contactEmail?: string;
}

export interface Hospital {
  hospitalId: string;
  hederaAccountId?: string;
  name: string;
  country: string;
  location?: string;
  fhirEndpoint?: string;
  contactEmail?: string;
  registeredAt: string;
  status: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  apiKey?: string; // Only returned on registration
}

export interface HospitalRegistrationResponse {
  message: string;
  hospital: Hospital;
}

export interface VerificationDocuments {
  license?: string;
  accreditation?: string;
  other?: any;
}

/**
 * Register a new hospital
 */
export async function registerHospital(
  data: HospitalRegistrationRequest
): Promise<HospitalRegistrationResponse> {
  const response = await hospitalClient.post<HospitalRegistrationResponse>('/register', data);
  return response.data;
}

/**
 * Get hospital by ID
 */
export async function getHospital(hospitalId: string, apiKey: string): Promise<Hospital> {
  const response = await hospitalClient.get<Hospital>(`/${hospitalId}`, {
    headers: {
      'x-hospital-id': hospitalId,
      'x-api-key': apiKey,
    },
  });
  return response.data;
}

/**
 * Update hospital information
 */
export async function updateHospital(
  hospitalId: string,
  apiKey: string,
  data: Partial<HospitalRegistrationRequest>
): Promise<Hospital> {
  const response = await hospitalClient.put<Hospital>(`/${hospitalId}`, data, {
    headers: {
      'x-hospital-id': hospitalId,
      'x-api-key': apiKey,
    },
  });
  return response.data;
}

/**
 * Submit verification documents
 */
export async function submitVerificationDocuments(
  hospitalId: string,
  apiKey: string,
  documents: VerificationDocuments
): Promise<{ message: string; verificationStatus: string }> {
  const response = await hospitalClient.post(
    `/${hospitalId}/verify`,
    { documents },
    {
      headers: {
        'x-hospital-id': hospitalId,
        'x-api-key': apiKey,
      },
    }
  );
  return response.data;
}

/**
 * Get verification status
 */
export async function getVerificationStatus(
  hospitalId: string,
  apiKey: string
): Promise<{ verificationStatus: string; verifiedAt?: string; verifiedBy?: string }> {
  const response = await hospitalClient.get(`/${hospitalId}/verification-status`, {
    headers: {
      'x-hospital-id': hospitalId,
      'x-api-key': apiKey,
    },
  });
  return response.data;
}
