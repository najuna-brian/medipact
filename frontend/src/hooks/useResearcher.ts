/**
 * React Hooks for Researcher Management
 * 
 * Custom hooks for fetching researcher data and analytics
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getResearcherPurchases,
  getResearcherAnalytics,
} from '@/lib/api/marketplace';
import {
  registerResearcher,
  getResearcher,
  getResearcherStatus,
  getResearcherVerificationStatus,
  submitResearcherVerification,
  type ResearcherInfo,
  type Researcher,
} from '@/lib/api/patient-identity';

/**
 * Hook to get researcher purchases
 */
export function useResearcherPurchases(researcherId: string | null, limit: number = 50) {
  return useQuery({
    queryKey: ['researcher-purchases', researcherId, limit],
    queryFn: () => {
      if (!researcherId) throw new Error('Researcher ID is required');
      return getResearcherPurchases(researcherId, limit);
    },
    enabled: !!researcherId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to get researcher analytics
 */
export function useResearcherAnalytics(researcherId: string | null) {
  return useQuery({
    queryKey: ['researcher-analytics', researcherId],
    queryFn: () => {
      if (!researcherId) throw new Error('Researcher ID is required');
      return getResearcherAnalytics(researcherId);
    },
    enabled: !!researcherId,
    staleTime: 60000, // 1 minute
  });
}

/**
 * Hook to register a new researcher
 */
export function useRegisterResearcher() {
  return useMutation({
    mutationFn: (researcherInfo: ResearcherInfo) => registerResearcher(researcherInfo),
  });
}

/**
 * Hook to get researcher by ID
 */
export function useResearcher(researcherId: string | null) {
  return useQuery({
    queryKey: ['researcher', researcherId],
    queryFn: () => {
      if (!researcherId) throw new Error('Researcher ID is required');
      return getResearcher(researcherId);
    },
    enabled: !!researcherId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to get researcher status
 */
export function useResearcherStatus(researcherId: string | null) {
  return useQuery({
    queryKey: ['researcher-status', researcherId],
    queryFn: () => {
      if (!researcherId) throw new Error('Researcher ID is required');
      return getResearcherStatus(researcherId);
    },
    enabled: !!researcherId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to get researcher verification status
 */
export function useResearcherVerificationStatus(researcherId: string | null) {
  return useQuery({
    queryKey: ['researcher-verification-status', researcherId],
    queryFn: () => {
      if (!researcherId) throw new Error('Researcher ID is required');
      return getResearcherVerificationStatus(researcherId);
    },
    enabled: !!researcherId,
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to submit researcher verification documents
 */
export function useSubmitResearcherVerification() {
  return useMutation({
    mutationFn: ({ researcherId, documents }: { researcherId: string; documents: any }) =>
      submitResearcherVerification(researcherId, documents),
  });
}
