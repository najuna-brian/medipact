/**
 * React Hooks for Dataset Management
 * 
 * Custom hooks for fetching and managing datasets using TanStack Query
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  browseDatasets,
  getDataset,
  executeQuery,
  getFilterOptions,
  purchaseDataset,
  exportDataset,
  type Dataset,
  type QueryFilters,
  type QueryResult,
  type FilterOptions,
  type PurchaseRequest,
} from '@/lib/api/marketplace';

/**
 * Hook to browse datasets
 */
export function useDatasets(filters?: { country?: string; hospitalId?: string }) {
  return useQuery({
    queryKey: ['datasets', filters],
    queryFn: () => browseDatasets(filters),
    staleTime: 30000, // 30 seconds
  });
}

/**
 * Hook to get a single dataset
 */
export function useDataset(datasetId: string | null, includePreview = false) {
  return useQuery({
    queryKey: ['dataset', datasetId, includePreview],
    queryFn: () => {
      if (!datasetId) throw new Error('Dataset ID is required');
      return getDataset(datasetId, includePreview);
    },
    enabled: !!datasetId,
    staleTime: 30000,
  });
}

/**
 * Hook to execute a query
 */
export function useQueryData(filters: QueryFilters, researcherId: string | null, enabled = true) {
  return useQuery({
    queryKey: ['query', filters, researcherId],
    queryFn: () => {
      if (!researcherId) throw new Error('Researcher ID is required');
      return executeQuery(filters, researcherId);
    },
    enabled: enabled && !!researcherId,
    staleTime: 0, // Queries are always fresh
  });
}

/**
 * Hook to get filter options
 */
export function useFilterOptions() {
  return useQuery({
    queryKey: ['filterOptions'],
    queryFn: getFilterOptions,
    staleTime: 3600000, // 1 hour - filter options don't change often
  });
}

/**
 * Hook to purchase a dataset
 */
export function usePurchaseDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PurchaseRequest) => purchaseDataset(request),
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['datasets'] });
      queryClient.invalidateQueries({ queryKey: ['dataset', data.datasetId] });
    },
  });
}

/**
 * Hook to export a dataset
 */
export function useExportDataset() {
  return useMutation({
    mutationFn: ({
      datasetId,
      format,
      researcherId,
    }: {
      datasetId: string;
      format: 'fhir' | 'csv' | 'json';
      researcherId: string;
    }) => exportDataset(datasetId, format, researcherId),
  });
}

