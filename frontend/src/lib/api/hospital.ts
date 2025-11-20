/**
 * Hospital API Client
 * 
 * Type-safe API client for hospital endpoints.
 */

import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || `http://localhost:${process.env.NEXT_PUBLIC_BACKEND_PORT || 8080}`;

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

export interface HospitalPatient {
  upi: string;
  hospitalPatientId: string;
  linkedAt: string;
  verified: boolean;
  verificationMethod?: string | null;
  source: 'registered' | 'csv_upload';
  encounterCount?: number;
  conditionCount?: number;
  observationCount?: number;
  hasCSVRecords?: boolean;
  email?: string;
  phone?: string;
  nationalId?: string;
}

export interface HospitalPatientsResponse {
  hospitalId: string;
  totalPatients: number;
  registeredPatients: number;
  csvUploadPatients: number;
  totalRecords: number;
  patients: HospitalPatient[];
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

export interface HospitalPatient {
  upi: string;
  hospitalPatientId: string;
  linkedAt: string;
  verified: boolean;
  verificationMethod?: string | null;
  source: 'registered' | 'csv_upload';
  encounterCount?: number;
  conditionCount?: number;
  observationCount?: number;
  hasCSVRecords?: boolean;
  email?: string;
  phone?: string;
  nationalId?: string;
}

export interface HospitalPatientsResponse {
  hospitalId: string;
  totalPatients: number;
  registeredPatients: number;
  csvUploadPatients: number;
  totalRecords: number;
  patients: HospitalPatient[];
}

/**
 * Get all patients for a hospital
 */
export async function getHospitalPatients(
  hospitalId: string,
  apiKey: string
): Promise<HospitalPatientsResponse> {
  const response = await hospitalClient.get<HospitalPatientsResponse>(
    `/${hospitalId}/patients`,
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
 * Export patients (CSV or JSON)
 */
export async function exportHospitalPatients(
  hospitalId: string,
  apiKey: string,
  format: 'csv' | 'json' = 'json'
): Promise<Blob | HospitalPatientsResponse> {
  const response = await hospitalClient.get(
    `/${hospitalId}/patients/export?format=${format}`,
    {
      headers: {
        'x-hospital-id': hospitalId,
        'x-api-key': apiKey,
      },
      responseType: format === 'csv' ? 'blob' : 'json',
    }
  );
  return response.data;
}

/**
 * Send UPI notification to a patient
 */
export async function notifyPatient(
  hospitalId: string,
  apiKey: string,
  upi: string
): Promise<{
  success: boolean;
  upi: string;
  notifications: {
    email?: { success: boolean; method: string; message?: string };
    sms?: { success: boolean; method: string; message?: string };
  };
  message: string;
}> {
  const response = await hospitalClient.post(
    `/${hospitalId}/patients/${upi}/notify`,
    {},
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
 * Send UPI notifications to multiple patients
 */
export async function notifyPatientsBulk(
  hospitalId: string,
  apiKey: string,
  upis: string[]
): Promise<{
  success: boolean;
  total: number;
  successful: number;
  failed: number;
  results: Array<{
    upi: string;
    success: boolean;
    notifications?: any;
    error?: string;
  }>;
}> {
  const response = await hospitalClient.post(
    `/${hospitalId}/patients/notify-bulk`,
    { upis },
    {
      headers: {
        'x-hospital-id': hospitalId,
        'x-api-key': apiKey,
      },
    }
  );
  return response.data;
}
