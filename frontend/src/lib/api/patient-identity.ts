/**
 * Patient Identity API Client
 * 
 * Client for interacting with the MediPact Patient Identity Management Backend API.
 * Base URL: http://localhost:3002 (configurable via NEXT_PUBLIC_BACKEND_API_URL)
 */

import axios from 'axios';

const BACKEND_API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3002';

const patientIdentityClient = axios.create({
  baseURL: `${BACKEND_API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types
export interface PatientPII {
  name: string;
  dateOfBirth: string;
  phone?: string;
  nationalId?: string;
  email?: string;
}

export interface Patient {
  upi: string;
  message?: string;
  createdAt?: string;
}

export interface HospitalInfo {
  name: string;
  country: string;
  location?: string;
  fhirEndpoint?: string;
  contactEmail?: string;
}

export interface Hospital {
  hospitalId: string;
  name: string;
  country: string;
  location?: string;
  fhirEndpoint?: string;
  contactEmail?: string;
  registeredAt: string;
  status: string;
  apiKey?: string; // Only returned on registration
}

export interface HospitalLinkage {
  id?: string;
  upi: string;
  hospitalId: string;
  hospitalPatientId: string;
  linkedAt: string;
  verified: boolean;
  verificationMethod: string;
  status: string;
  hospitalName?: string;
}

export interface PatientHistory {
  upi: string;
  hospitals: Array<{
    hospitalId: string;
    hospitalName: string;
    hospitalPatientId: string;
    records: any[];
    recordCount: number;
    linkedAt: string;
  }>;
  records: any[];
  totalRecords: number;
  hospitalCount: number;
  dateRange: {
    start: string;
    end: string;
  } | null;
}

export interface PatientSummary {
  upi: string;
  totalRecords: number;
  hospitalCount: number;
  testTypes: Record<string, number>;
  dateRange: {
    start: string;
    end: string;
  } | null;
  hospitals: Array<{
    hospitalId: string;
    hospitalName: string;
    recordCount: number;
  }>;
}

// Patient API Functions

/**
 * Register a new patient
 */
export async function registerPatient(patientPII: PatientPII): Promise<Patient> {
  const response = await patientIdentityClient.post('/patient/register', patientPII);
  return response.data;
}

/**
 * Match patient to existing UPI
 */
export async function matchPatient(patientPII: PatientPII): Promise<{ upi?: string; exists: boolean; message?: string }> {
  const response = await patientIdentityClient.post('/patient/match', patientPII);
  return response.data;
}

/**
 * Get patient's linked hospitals
 */
export async function getPatientHospitals(upi: string): Promise<{ upi: string; hospitals: HospitalLinkage[] }> {
  const response = await patientIdentityClient.get(`/patient/${upi}/hospitals`);
  return response.data;
}

/**
 * Get complete patient medical history
 */
export async function getPatientHistory(upi: string): Promise<PatientHistory> {
  const response = await patientIdentityClient.get(`/patient/${upi}/history`);
  return response.data;
}

/**
 * Get patient history from specific hospital
 */
export async function getHospitalHistory(upi: string, hospitalId: string): Promise<PatientHistory> {
  const response = await patientIdentityClient.get(`/patient/${upi}/history/${hospitalId}`);
  return response.data;
}

/**
 * Get patient summary statistics
 */
export async function getPatientSummary(upi: string): Promise<PatientSummary> {
  const response = await patientIdentityClient.get(`/patient/${upi}/summary`);
  return response.data;
}

/**
 * Link hospital to patient
 */
export async function linkHospital(
  upi: string,
  hospitalId: string,
  hospitalPatientId: string,
  apiKey: string,
  verificationMethod: string = 'patient_consent'
): Promise<{ message: string; linkage: HospitalLinkage }> {
  const response = await patientIdentityClient.post(
    `/patient/${upi}/link-hospital`,
    { hospitalPatientId, verificationMethod },
    {
      headers: {
        'X-Hospital-ID': hospitalId,
        'X-API-Key': apiKey,
      },
    }
  );
  return response.data;
}

/**
 * Remove hospital linkage
 */
export async function removeHospitalLinkage(upi: string, hospitalId: string): Promise<{ message: string }> {
  const response = await patientIdentityClient.delete(`/patient/${upi}/link-hospital/${hospitalId}`);
  return response.data;
}

// Hospital API Functions

/**
 * Register a new hospital
 */
export async function registerHospital(hospitalInfo: HospitalInfo): Promise<{ message: string; hospital: Hospital }> {
  const response = await patientIdentityClient.post('/hospital/register', hospitalInfo);
  return response.data;
}

/**
 * Get hospital information
 */
export async function getHospital(hospitalId: string, apiKey: string): Promise<Hospital> {
  const response = await patientIdentityClient.get(`/hospital/${hospitalId}`, {
    headers: {
      'X-Hospital-ID': hospitalId,
      'X-API-Key': apiKey,
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
  updates: Partial<HospitalInfo>
): Promise<{ message: string; hospital: Hospital }> {
  const response = await patientIdentityClient.put(`/hospital/${hospitalId}`, updates, {
    headers: {
      'X-Hospital-ID': hospitalId,
      'X-API-Key': apiKey,
    },
  });
  return response.data;
}

// Patient Lookup
export interface PatientLookupRequest {
  email?: string;
  phone?: string;
  nationalId?: string;
}

export interface PatientLookupResponse {
  upi?: string;
  found: boolean;
  message?: string;
}

/**
 * Lookup patient UPI by email, phone, or national ID
 */
export async function lookupPatient(request: PatientLookupRequest): Promise<PatientLookupResponse> {
  const response = await patientIdentityClient.post('/patient/lookup', request);
  return response.data;
}

/**
 * Retrieve UPI via email/phone
 */
export async function retrieveUPI(email?: string, phone?: string): Promise<{ upi: string; sentVia: string; message: string }> {
  const response = await patientIdentityClient.post('/patient/retrieve-upi', { email, phone });
  return response.data;
}

// Hospital Verification
export interface VerificationDocuments {
  licenseNumber?: string;
  registrationCertificate?: string;
  additionalDocuments?: any[];
}

export interface VerificationStatus {
  hospitalId: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  verifiedAt: string | null;
  verifiedBy: string | null;
  verificationDocuments: VerificationDocuments | null;
}

/**
 * Submit verification documents
 */
export async function submitVerificationDocuments(
  hospitalId: string,
  apiKey: string,
  documents: VerificationDocuments
): Promise<{ message: string; hospital: Hospital }> {
  // Ensure credentials are trimmed and valid
  const trimmedHospitalId = hospitalId?.trim();
  const trimmedApiKey = apiKey?.trim();
  
  if (!trimmedHospitalId || !trimmedApiKey) {
    throw new Error('Hospital ID and API Key are required');
  }

  const response = await patientIdentityClient.post(
    `/hospital/${trimmedHospitalId}/verify`,
    { documents },
    {
      headers: {
        'X-Hospital-ID': trimmedHospitalId,
        'X-API-Key': trimmedApiKey,
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
): Promise<VerificationStatus> {
  const response = await patientIdentityClient.get(`/hospital/${hospitalId}/verification-status`, {
    headers: {
      'X-Hospital-ID': hospitalId,
      'X-API-Key': apiKey,
    },
  });
  return response.data;
}

// ============================================================================
// Admin API Functions
// ============================================================================

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
    rejectionReason?: string;
  } | null;
}

export interface AdminHospitalsResponse {
  hospitals: AdminHospital[];
}

export interface AdminHospitalDetail extends AdminHospital {
  fhirEndpoint?: string;
}

/**
 * Get all hospitals (admin only)
 */
export async function getAllHospitals(): Promise<AdminHospitalsResponse> {
  const response = await patientIdentityClient.get('/admin/hospitals');
  return response.data;
}

/**
 * Get hospital details (admin only)
 */
export async function getAdminHospitalDetail(hospitalId: string): Promise<AdminHospitalDetail> {
  const response = await patientIdentityClient.get(`/admin/hospitals/${hospitalId}`);
  return response.data;
}

/**
 * Approve hospital verification (admin only)
 */
export async function approveHospitalVerification(
  hospitalId: string,
  adminId?: string
): Promise<{ success: boolean; hospital: AdminHospital }> {
  const response = await patientIdentityClient.post(`/admin/hospitals/${hospitalId}/verify`, {
    adminId: adminId || 'admin',
  });
  return response.data;
}

/**
 * Reject hospital verification (admin only)
 */
export async function rejectHospitalVerification(
  hospitalId: string,
  reason: string,
  adminId?: string
): Promise<{ success: boolean; hospital: AdminHospital }> {
  const response = await patientIdentityClient.post(`/admin/hospitals/${hospitalId}/reject`, {
    reason,
    adminId: adminId || 'admin',
  });
  return response.data;
}

// Hospital Patient Management
export interface BulkRegistrationRequest {
  format: 'csv' | 'json';
  data: string | any[];
}

export interface BulkRegistrationResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    errors: string[];
    record: any;
  }>;
  patients: Array<{
    upi: string;
    hospitalPatientId: string;
    name: string;
  }>;
}

/**
 * Register a single patient (hospital)
 */
export async function registerHospitalPatient(
  hospitalId: string,
  apiKey: string,
  patientData: {
    name: string;
    dateOfBirth: string;
    phone?: string;
    nationalId?: string;
    email?: string;
    hospitalPatientId: string;
  }
): Promise<{ message: string; upi: string; hospitalPatientId: string }> {
  const response = await patientIdentityClient.post(
    `/hospital/${hospitalId}/patients`,
    patientData,
    {
      headers: {
        'X-Hospital-ID': hospitalId,
        'X-API-Key': apiKey,
      },
    }
  );
  return response.data;
}

/**
 * Bulk register patients
 */
export async function bulkRegisterPatients(
  hospitalId: string,
  apiKey: string,
  request: BulkRegistrationRequest
): Promise<{ message: string; result: BulkRegistrationResult }> {
  const response = await patientIdentityClient.post(
    `/hospital/${hospitalId}/patients/bulk`,
    request,
    {
      headers: {
        'X-Hospital-ID': hospitalId,
        'X-API-Key': apiKey,
      },
    }
  );
  return response.data;
}

/**
 * Get all patients linked to a hospital
 */
export interface HospitalPatient {
  upi: string;
  hospitalPatientId: string;
  linkedAt: string;
  verified: boolean;
  verificationMethod: string;
}

export interface HospitalPatientsResponse {
  hospitalId: string;
  totalPatients: number;
  patients: HospitalPatient[];
}

export async function getHospitalPatients(
  hospitalId: string,
  apiKey: string
): Promise<HospitalPatientsResponse> {
  const trimmedHospitalId = hospitalId.trim();
  const trimmedApiKey = apiKey.trim();
  
  const response = await patientIdentityClient.get(
    `/hospital/${trimmedHospitalId}/patients`,
    {
      headers: {
        'X-Hospital-ID': trimmedHospitalId,
        'X-API-Key': trimmedApiKey,
      },
    }
  );
  return response.data;
}

// Health Check
export async function checkBackendHealth(): Promise<{ status: string; timestamp: string; service: string }> {
  const response = await axios.get(`${BACKEND_API_URL}/health`);
  return response.data;
}

