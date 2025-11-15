/**
 * React Query hooks for researcher APIs
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  registerResearcher,
  getResearcher,
  getResearcherByEmail,
  submitResearcherVerification,
  getResearcherVerificationStatus,
  getResearcherStatus,
  browseDatasets,
  purchaseDataset,
  type ResearcherInfo,
  type PurchaseRequest
} from '@/lib/api/patient-identity';

/**
 * Register a new researcher
 */
export function useRegisterResearcher() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (researcherInfo: ResearcherInfo) => registerResearcher(researcherInfo),
    onSuccess: (data) => {
      // Invalidate researcher queries
      queryClient.invalidateQueries({ queryKey: ['researcher', data.researcher.researcherId] });
    },
  });
}

/**
 * Get researcher by ID
 */
export function useResearcher(researcherId: string | null) {
  return useQuery({
    queryKey: ['researcher', researcherId],
    queryFn: () => getResearcher(researcherId!),
    enabled: !!researcherId,
  });
}

/**
 * Get researcher by email
 */
export function useResearcherByEmail(email: string | null) {
  return useQuery({
    queryKey: ['researcher', 'email', email],
    queryFn: () => getResearcherByEmail(email!),
    enabled: !!email,
  });
}

/**
 * Submit verification documents
 */
export function useSubmitResearcherVerification() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ researcherId, documents }: { researcherId: string; documents: any }) =>
      submitResearcherVerification(researcherId, documents),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['researcher', variables.researcherId] });
      queryClient.invalidateQueries({ queryKey: ['researcher', 'verification', variables.researcherId] });
    },
  });
}

/**
 * Get verification status
 */
export function useResearcherVerificationStatus(researcherId: string | null) {
  return useQuery({
    queryKey: ['researcher', 'verification', researcherId],
    queryFn: () => getResearcherVerificationStatus(researcherId!),
    enabled: !!researcherId,
    refetchInterval: false, // No auto-polling - users can manually refresh
    refetchOnWindowFocus: false, // Don't auto-refetch on window focus
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

/**
 * Get researcher status (with verification prompt)
 */
export function useResearcherStatus(researcherId: string | null) {
  return useQuery({
    queryKey: ['researcher', 'status', researcherId],
    queryFn: () => getResearcherStatus(researcherId!),
    enabled: !!researcherId,
    refetchInterval: false, // No auto-polling - users can manually refresh
    refetchOnWindowFocus: false, // Don't auto-refetch on window focus
    retry: 3, // Retry failed requests up to 3 times
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}

/**
 * Browse datasets
 */
export function useBrowseDatasets() {
  return useQuery({
    queryKey: ['marketplace', 'datasets'],
    queryFn: () => browseDatasets(),
  });
}

/**
 * Purchase dataset
 */
export function usePurchaseDataset() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (purchaseRequest: PurchaseRequest) => purchaseDataset(purchaseRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace', 'datasets'] });
      queryClient.invalidateQueries({ queryKey: ['researcher', 'purchases'] });
    },
  });
}

