import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { HCSTopic, Transaction } from '@/types/hedera';

export function useHCSTopic(topicId: string | null) {
  return useQuery({
    queryKey: ['hedera', 'topic', topicId],
    queryFn: async (): Promise<HCSTopic> => {
      if (!topicId) throw new Error('Topic ID is required');
      const response = await apiClient.get(`/hedera/topics?topicId=${topicId}`);
      return response.data;
    },
    enabled: !!topicId,
  });
}

export function useTransactions(type?: 'consent' | 'data', enablePolling: boolean = false) {
  return useQuery({
    queryKey: ['hedera', 'transactions', type],
    queryFn: async (): Promise<{ transactions: Transaction[]; total: number }> => {
      const params = type ? `?type=${type}` : '';
      const response = await apiClient.get(`/hedera/transactions${params}`);
      return response.data;
    },
    refetchInterval: enablePolling ? 5000 : false, // Poll every 5 seconds if enabled
  });
}

