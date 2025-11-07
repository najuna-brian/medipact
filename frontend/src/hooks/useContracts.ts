import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ConsentRecord, RevenuePayout } from '@/types/contracts';

export function useConsentRecords(patientId?: string, anonymousId?: string) {
  return useQuery({
    queryKey: ['contracts', 'consent', patientId, anonymousId],
    queryFn: async (): Promise<{ consentRecords: ConsentRecord[]; total: number }> => {
      const params = new URLSearchParams();
      if (patientId) params.append('patientId', patientId);
      if (anonymousId) params.append('anonymousId', anonymousId);
      const response = await apiClient.get(`/contracts/consent?${params.toString()}`);
      return response.data;
    },
    enabled: !!patientId || !!anonymousId,
  });
}

export function useRevenuePayouts() {
  return useQuery({
    queryKey: ['contracts', 'revenue', 'payouts'],
    queryFn: async (): Promise<{ payouts: RevenuePayout[]; total: number }> => {
      const response = await apiClient.get('/contracts/revenue');
      return response.data;
    },
  });
}

