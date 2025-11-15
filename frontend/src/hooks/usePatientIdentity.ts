/**
 * React Hooks for Patient Identity Management
 * 
 * Custom hooks for interacting with the patient identity backend API.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  registerPatient,
  matchPatient,
  getPatientHospitals,
  getPatientHistory,
  getHospitalHistory,
  getPatientSummary,
  linkHospital,
  removeHospitalLinkage,
  registerHospital,
  getHospital,
  updateHospital,
  checkBackendHealth,
  lookupPatient,
  retrieveUPI,
  submitVerificationDocuments,
  getVerificationStatus,
  getHospitalPatients,
  registerHospitalPatient,
  bulkRegisterPatients,
  type PatientPII,
  type HospitalInfo,
  // type Patient,
  // type Hospital,
  // type HospitalLinkage,
  // type PatientHistory,
  // type PatientSummary,
  type PatientLookupRequest,
  type VerificationDocuments,
  type BulkRegistrationRequest,
} from '@/lib/api/patient-identity';

// Health Check
export function useBackendHealth() {
  return useQuery({
    queryKey: ['backend-health'],
    queryFn: checkBackendHealth,
    refetchInterval: 30000, // Check every 30 seconds
  });
}

// Patient Registration
export function useRegisterPatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (patientPII: PatientPII) => registerPatient(patientPII),
    onSuccess: (data) => {
      // Invalidate patient queries
      queryClient.invalidateQueries({ queryKey: ['patient', data.upi] });
    },
  });
}

// Patient Matching
export function useMatchPatient() {
  return useMutation({
    mutationFn: (patientPII: PatientPII) => matchPatient(patientPII),
  });
}

// Get Patient Hospitals
export function usePatientHospitals(upi: string | null) {
  return useQuery({
    queryKey: ['patient-hospitals', upi],
    queryFn: () => getPatientHospitals(upi!),
    enabled: !!upi,
  });
}

// Get Patient History
export function usePatientHistory(upi: string | null) {
  return useQuery({
    queryKey: ['patient-history', upi],
    queryFn: () => getPatientHistory(upi!),
    enabled: !!upi,
  });
}

// Get Hospital History
export function useHospitalHistory(upi: string | null, hospitalId: string | null) {
  return useQuery({
    queryKey: ['hospital-history', upi, hospitalId],
    queryFn: () => getHospitalHistory(upi!, hospitalId!),
    enabled: !!upi && !!hospitalId,
  });
}

// Get Patient Summary
export function usePatientSummary(upi: string | null) {
  return useQuery({
    queryKey: ['patient-summary', upi],
    queryFn: async () => {
      const summary = await getPatientSummary(upi!);
      // Fetch balance separately and merge
      try {
        const { getPatientBalance } = await import('@/lib/api/wallet');
        const balance = await getPatientBalance(upi!);
        return {
          ...summary,
          balanceUSD: balance.balanceUSD,
          balanceHBAR: balance.balanceHBAR,
          hederaAccountId: balance.hederaAccountId || summary.hederaAccountId
        };
      } catch (error) {
        // If balance fetch fails, return summary without balance
        console.warn('Failed to fetch balance:', error);
        return summary;
      }
    },
    enabled: !!upi,
  });
}

// Link Hospital
export function useLinkHospital() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      upi,
      hospitalId,
      hospitalPatientId,
      apiKey,
      verificationMethod,
    }: {
      upi: string;
      hospitalId: string;
      hospitalPatientId: string;
      apiKey: string;
      verificationMethod?: string;
    }) => linkHospital(upi, hospitalId, hospitalPatientId, apiKey, verificationMethod),
    onSuccess: (data, variables) => {
      // Invalidate patient queries
      queryClient.invalidateQueries({ queryKey: ['patient-hospitals', variables.upi] });
      queryClient.invalidateQueries({ queryKey: ['patient-history', variables.upi] });
      queryClient.invalidateQueries({ queryKey: ['patient-summary', variables.upi] });
      // Also invalidate hospital's patient list so it updates immediately
      queryClient.invalidateQueries({ queryKey: ['hospital', 'patients', variables.hospitalId] });
    },
  });
}

// Remove Hospital Linkage
export function useRemoveHospitalLinkage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ upi, hospitalId }: { upi: string; hospitalId: string }) =>
      removeHospitalLinkage(upi, hospitalId),
    onSuccess: (data, variables) => {
      // Invalidate patient queries
      queryClient.invalidateQueries({ queryKey: ['patient-hospitals', variables.upi] });
      queryClient.invalidateQueries({ queryKey: ['patient-history', variables.upi] });
      queryClient.invalidateQueries({ queryKey: ['patient-summary', variables.upi] });
    },
  });
}

// Hospital Registration
export function useRegisterHospital() {
  return useMutation({
    mutationFn: (hospitalInfo: HospitalInfo) => registerHospital(hospitalInfo),
  });
}

// Get Hospital
export function useHospital(hospitalId: string | null, apiKey: string | null) {
  const hasValidCredentials = !!hospitalId && !!apiKey && hospitalId.trim().length > 0 && apiKey.trim().length > 0;
  
  return useQuery({
    queryKey: ['hospital', hospitalId],
    queryFn: () => {
      if (!hospitalId || !apiKey) {
        throw new Error('Hospital credentials required');
      }
      return getHospital(hospitalId.trim(), apiKey.trim());
    },
    enabled: hasValidCredentials,
    refetchInterval: false, // Don't poll hospital data automatically
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  });
}

// Update Hospital
export function useUpdateHospital() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      hospitalId,
      apiKey,
      updates,
    }: {
      hospitalId: string;
      apiKey: string;
      updates: Partial<HospitalInfo>;
    }) => updateHospital(hospitalId, apiKey, updates),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hospital', variables.hospitalId] });
    },
  });
}

// Patient Lookup
export function useLookupPatient() {
  return useMutation({
    mutationFn: (request: PatientLookupRequest) => lookupPatient(request),
  });
}

// Retrieve UPI
export function useRetrieveUPI() {
  return useMutation({
    mutationFn: ({ email, phone }: { email?: string; phone?: string }) => retrieveUPI(email, phone),
  });
}

// Hospital Verification
export function useSubmitVerificationDocuments() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      hospitalId,
      apiKey,
      documents,
    }: {
      hospitalId: string;
      apiKey: string;
      documents: VerificationDocuments;
    }) => submitVerificationDocuments(hospitalId, apiKey, documents),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hospital-verification', variables.hospitalId] });
      queryClient.invalidateQueries({ queryKey: ['hospital', variables.hospitalId] });
    },
  });
}

export function useVerificationStatus(hospitalId: string | null, apiKey: string | null) {
  const hasValidCredentials = !!hospitalId && !!apiKey && hospitalId.trim().length > 0 && apiKey.trim().length > 0;
  
  return useQuery({
    queryKey: ['hospital-verification', hospitalId],
    queryFn: () => {
      if (!hospitalId || !apiKey) {
        throw new Error('Hospital credentials required');
      }
      return getVerificationStatus(hospitalId.trim(), apiKey.trim());
    },
    enabled: hasValidCredentials,
    refetchInterval: false, // No auto-polling - users can manually refresh
    refetchOnWindowFocus: false, // Don't auto-refetch on window focus
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

// Hospital Patients List
export function useHospitalPatients(hospitalId: string | null, apiKey: string | null) {
  const hasValidCredentials = !!hospitalId && !!apiKey && hospitalId.trim().length > 0 && apiKey.trim().length > 0;
  
  return useQuery({
    queryKey: ['hospital', 'patients', hospitalId],
    queryFn: () => {
      if (!hospitalId || !apiKey) {
        throw new Error('Hospital credentials required');
      }
      return getHospitalPatients(hospitalId.trim(), apiKey.trim());
    },
    enabled: hasValidCredentials,
    refetchInterval: false, // Don't poll patients list automatically
    retry: 2, // Retry failed requests up to 2 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000), // Exponential backoff
  });
}

// Hospital Patient Registration
export function useRegisterHospitalPatient() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      hospitalId,
      apiKey,
      patientData,
    }: {
      hospitalId: string;
      apiKey: string;
      patientData: {
        name: string;
        dateOfBirth: string;
        phone?: string;
        nationalId?: string;
        email?: string;
        hospitalPatientId: string;
      };
    }) => registerHospitalPatient(hospitalId, apiKey, patientData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hospital-patients'] });
      // Invalidate specific hospital's patient list
      queryClient.invalidateQueries({ queryKey: ['hospital', 'patients', variables.hospitalId] });
    },
  });
}

export function useBulkRegisterPatients() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({
      hospitalId,
      apiKey,
      request,
    }: {
      hospitalId: string;
      apiKey: string;
      request: BulkRegistrationRequest;
    }) => bulkRegisterPatients(hospitalId, apiKey, request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['hospital-patients'] });
      // Invalidate specific hospital's patient list
      queryClient.invalidateQueries({ queryKey: ['hospital', 'patients', variables.hospitalId] });
    },
  });
}

