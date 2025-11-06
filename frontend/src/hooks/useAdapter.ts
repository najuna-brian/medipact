import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ProcessingResult, ProcessingStatus } from '@/types/adapter';

export function useProcessAdapter() {
  return useMutation({
    mutationFn: async (file: File): Promise<ProcessingResult> => {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post('/adapter/process', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    },
  });
}

export function useAdapterStatus(enablePolling: boolean = false) {
  return useQuery({
    queryKey: ['adapter', 'status'],
    queryFn: async (): Promise<ProcessingStatus> => {
      const response = await apiClient.get('/adapter/status');
      return response.data;
    },
    refetchInterval: enablePolling ? 2000 : false, // Poll every 2 seconds if enabled
  });
}

export function useAdapterResults() {
  return useQuery({
    queryKey: ['adapter', 'results'],
    queryFn: async (): Promise<ProcessingResult> => {
      const response = await apiClient.get('/adapter/results');
      return response.data;
    },
  });
}
