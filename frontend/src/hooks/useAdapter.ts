import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api/client';
import type { ProcessingResult, ProcessingStatus } from '@/types/adapter';

export function useProcessAdapter() {
  return useMutation({
    mutationFn: async (options: {
      file: File;
      hospitalId: string;
      hospitalCountry: string;
      hospitalLocation?: string;
      apiKey: string;
    }): Promise<ProcessingResult> => {
      const formData = new FormData();
      formData.append('file', options.file);
      formData.append('hospitalId', options.hospitalId);
      formData.append('hospitalCountry', options.hospitalCountry);
      if (options.hospitalLocation) {
        formData.append('hospitalLocation', options.hospitalLocation);
      }
      formData.append('apiKey', options.apiKey);

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
