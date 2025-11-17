/**
 * React Hooks for Researcher Management
 * 
 * Custom hooks for fetching researcher data and analytics
 */

import { useQuery } from '@tanstack/react-query';
import {
  getResearcherPurchases,
  getResearcherAnalytics,
} from '@/lib/api/marketplace';

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
