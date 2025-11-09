/**
 * Admin Hospital Management Hooks
 * 
 * React Query hooks for admin hospital verification management.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllHospitals,
  getAdminHospitalDetail,
  approveHospitalVerification,
  rejectHospitalVerification,
  type AdminHospital,
  type AdminHospitalsResponse,
  type AdminHospitalDetail,
} from '@/lib/api/patient-identity';
import { useAdminSession } from './useAdminSession';

/**
 * Get all hospitals (admin)
 */
export function useAdminHospitals() {
  const { token } = useAdminSession();
  
  return useQuery<AdminHospitalsResponse>({
    queryKey: ['admin', 'hospitals'],
    queryFn: () => getAllHospitals(token!),
    enabled: !!token,
  });
}

/**
 * Get hospital detail (admin)
 */
export function useAdminHospitalDetail(hospitalId: string | null) {
  const { token } = useAdminSession();
  
  return useQuery<AdminHospitalDetail>({
    queryKey: ['admin', 'hospitals', hospitalId],
    queryFn: () => getAdminHospitalDetail(hospitalId!, token!),
    enabled: !!hospitalId && !!token,
  });
}

/**
 * Approve hospital verification
 */
export function useApproveHospital() {
  const queryClient = useQueryClient();
  const { token } = useAdminSession();

  return useMutation({
    mutationFn: ({ hospitalId, adminId }: { hospitalId: string; adminId?: string }) =>
      approveHospitalVerification(hospitalId, token!, adminId),
    onSuccess: (data, variables) => {
      // Invalidate and refetch hospitals list
      queryClient.invalidateQueries({ queryKey: ['admin', 'hospitals'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'hospitals', variables.hospitalId] });
      // Invalidate hospital verification status (used by hospital dashboard and verification page)
      queryClient.invalidateQueries({ queryKey: ['hospital-verification', variables.hospitalId] });
      queryClient.invalidateQueries({ queryKey: ['hospital-verification'] });
      // Also invalidate any hospital queries
      queryClient.invalidateQueries({ queryKey: ['hospital', variables.hospitalId] });
      queryClient.invalidateQueries({ queryKey: ['hospital'] });
    },
  });
}

/**
 * Reject hospital verification
 */
export function useRejectHospital() {
  const queryClient = useQueryClient();
  const { token } = useAdminSession();

  return useMutation({
    mutationFn: ({
      hospitalId,
      reason,
      adminId,
    }: {
      hospitalId: string;
      reason: string;
      adminId?: string;
    }) => rejectHospitalVerification(hospitalId, reason, token!, adminId),
    onSuccess: (data, variables) => {
      // Invalidate and refetch hospitals list
      queryClient.invalidateQueries({ queryKey: ['admin', 'hospitals'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'hospitals', variables.hospitalId] });
      // Invalidate hospital verification status (used by hospital dashboard and verification page)
      queryClient.invalidateQueries({ queryKey: ['hospital-verification', variables.hospitalId] });
      queryClient.invalidateQueries({ queryKey: ['hospital-verification'] });
      // Also invalidate any hospital queries
      queryClient.invalidateQueries({ queryKey: ['hospital', variables.hospitalId] });
      queryClient.invalidateQueries({ queryKey: ['hospital'] });
    },
  });
}

