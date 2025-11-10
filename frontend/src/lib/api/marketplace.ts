/**
 * Marketplace API Client
 * 
 * Functions for interacting with the marketplace API:
 * - Browse datasets
 * - Query FHIR resources
 * - Purchase datasets
 * - Export datasets
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

export interface Dataset {
  id: string;
  name: string;
  description: string;
  hospitalId: string;
  country: string;
  recordCount: number;
  dateRangeStart?: string;
  dateRangeEnd?: string;
  conditionCodes?: string[];
  price: number;
  currency: string;
  format: string;
  consentType: string;
  hcsTopicId?: string;
  consentTopicId?: string;
  dataTopicId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  preview?: any[];
}

export interface QueryFilters {
  country?: string;
  startDate?: string;
  endDate?: string;
  conditionCode?: string;
  conditionName?: string;
  observationCode?: string;
  observationName?: string;
  ageRange?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Unknown';
  hospitalId?: string;
  preview?: boolean;
  limit?: number;
}

export interface QueryResult {
  results: any[] | null;
  count: number;
  filters: QueryFilters;
  preview: boolean;
  hcsMessageId?: string;
  timestamp: string;
}

export interface FilterOptions {
  countries: string[];
  conditions: Array<{ code: string; name: string }>;
  observationTypes: Array<{ code: string; name: string }>;
  genders: string[];
  ageRanges: string[];
}

export interface PurchaseRequest {
  researcherId: string;
  datasetId: string;
  amount: number;
  patientUPI?: string;
  hospitalId?: string;
}

export interface PurchaseResponse {
  message: string;
  purchaseId: string;
  datasetId: string;
  amount: string;
  revenueDistribution: any;
  accessGranted: boolean;
  downloadUrl?: string;
}

/**
 * Browse available datasets
 */
export async function browseDatasets(filters?: { country?: string; hospitalId?: string }): Promise<{ datasets: Dataset[]; count: number }> {
  const queryParams = new URLSearchParams();
  if (filters?.country) queryParams.append('country', filters.country);
  if (filters?.hospitalId) queryParams.append('hospitalId', filters.hospitalId);

  const response = await fetch(`${API_URL}/api/marketplace/datasets?${queryParams.toString()}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch datasets: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Get dataset by ID
 */
export async function getDataset(datasetId: string, includePreview = false): Promise<Dataset> {
  const response = await fetch(
    `${API_URL}/api/marketplace/datasets/${datasetId}?includePreview=${includePreview}`
  );
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Dataset not found');
    }
    throw new Error(`Failed to fetch dataset: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Execute query with filters
 */
export async function executeQuery(
  filters: QueryFilters,
  researcherId: string
): Promise<QueryResult> {
  const response = await fetch(`${API_URL}/api/marketplace/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-researcher-id': researcherId,
    },
    body: JSON.stringify({
      ...filters,
      researcherId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Query failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get available filter options
 */
export async function getFilterOptions(): Promise<FilterOptions> {
  const response = await fetch(`${API_URL}/api/marketplace/filter-options`);
  if (!response.ok) {
    throw new Error(`Failed to fetch filter options: ${response.statusText}`);
  }
  return response.json();
}

/**
 * Purchase dataset
 */
export async function purchaseDataset(request: PurchaseRequest): Promise<PurchaseResponse> {
  const response = await fetch(`${API_URL}/api/marketplace/purchase`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `Purchase failed: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Export dataset
 */
export async function exportDataset(
  datasetId: string,
  format: 'fhir' | 'csv' | 'json',
  researcherId: string
): Promise<Blob | any> {
  const response = await fetch(`${API_URL}/api/marketplace/datasets/${datasetId}/export`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      format,
      researcherId,
    }),
  });

  if (!response.ok) {
    throw new Error(`Export failed: ${response.statusText}`);
  }

  if (format === 'csv') {
    return response.blob();
  } else {
    return response.json();
  }
}

/**
 * Download dataset file
 */
export function downloadDataset(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

