/**
 * Admin Researcher Management Hooks
 * 
 * React Query hooks for admin researcher verification management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllResearchers,
  getResearcherDetail,
  verifyResearcher,
  rejectResearcher,
  type AdminResearchersResponse,
  type AdminResearcherDetail,
} from '@/lib/api/admin';

/**
 * Get all researchers (admin)
 */
export function useAdminResearchers() {
  return useQuery<AdminResearchersResponse>({
    queryKey: ['admin', 'researchers'],
    queryFn: () => getAllResearchers(),
  });
}

/**
 * Get researcher detail (admin)
 */
export function useAdminResearcherDetail(researcherId: string | null) {
  return useQuery<AdminResearcherDetail>({
    queryKey: ['admin', 'researchers', researcherId],
    queryFn: () => getResearcherDetail(researcherId!),
    enabled: !!researcherId,
  });
}

/**
 * Approve researcher verification
 */
export function useApproveResearcher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ researcherId }: { researcherId: string }) =>
      verifyResearcher(researcherId),
    onSuccess: (data, variables) => {
      // Invalidate and refetch researchers list
      queryClient.invalidateQueries({ queryKey: ['admin', 'researchers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'researchers', variables.researcherId] });
      // Invalidate researcher verification status
      queryClient.invalidateQueries({ queryKey: ['researcher', 'verification', variables.researcherId] });
      queryClient.invalidateQueries({ queryKey: ['researcher', variables.researcherId] });
      queryClient.invalidateQueries({ queryKey: ['researcher', 'status', variables.researcherId] });
    },
  });
}

/**
 * Reject researcher verification
 */
export function useRejectResearcher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      researcherId,
      reason,
    }: {
      researcherId: string;
      reason: string;
    }) => rejectResearcher(researcherId, reason),
    onSuccess: (data, variables) => {
      // Invalidate and refetch researchers list
      queryClient.invalidateQueries({ queryKey: ['admin', 'researchers'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'researchers', variables.researcherId] });
      // Invalidate researcher verification status
      queryClient.invalidateQueries({ queryKey: ['researcher', 'verification', variables.researcherId] });
      queryClient.invalidateQueries({ queryKey: ['researcher', variables.researcherId] });
      queryClient.invalidateQueries({ queryKey: ['researcher', 'status', variables.researcherId] });
    },
  });
}

