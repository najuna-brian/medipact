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

/**
 * Get all hospitals (admin)
 */
export function useAdminHospitals() {
  return useQuery<AdminHospitalsResponse>({
    queryKey: ['admin', 'hospitals'],
    queryFn: getAllHospitals,
  });
}

/**
 * Get hospital detail (admin)
 */
export function useAdminHospitalDetail(hospitalId: string | null) {
  return useQuery<AdminHospitalDetail>({
    queryKey: ['admin', 'hospitals', hospitalId],
    queryFn: () => getAdminHospitalDetail(hospitalId!),
    enabled: !!hospitalId,
  });
}

/**
 * Approve hospital verification
 */
export function useApproveHospital() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ hospitalId, adminId }: { hospitalId: string; adminId?: string }) =>
      approveHospitalVerification(hospitalId, adminId),
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

  return useMutation({
    mutationFn: ({
      hospitalId,
      reason,
      adminId,
    }: {
      hospitalId: string;
      reason: string;
      adminId?: string;
    }) => rejectHospitalVerification(hospitalId, reason, adminId),
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

