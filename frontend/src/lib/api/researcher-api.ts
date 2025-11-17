/**
 * Researcher API Client
 * 
 * Functions for managing researcher API keys and accessing REST API
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface APIKey {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
  status: 'active' | 'revoked';
}

export interface CreateAPIKeyResponse {
  success: boolean;
  message: string;
  apiKey: {
    id: string;
    key: string; // Only shown once on creation
    name: string;
    createdAt: string;
    status: string;
  };
}

export interface APIKeysResponse {
  success: boolean;
  count: number;
  apiKeys: APIKey[];
}

/**
 * Create a new API key for researcher
 */
export async function createAPIKey(
  researcherId: string,
  name: string = 'Default API Key'
): Promise<CreateAPIKeyResponse> {
  const response = await fetch(`${API_URL}/api/researcher/${researcherId}/api-keys`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create API key');
  }

  return response.json();
}

/**
 * Get all API keys for researcher
 */
export async function getAPIKeys(researcherId: string): Promise<APIKeysResponse> {
  const response = await fetch(`${API_URL}/api/researcher/${researcherId}/api-keys`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch API keys');
  }

  return response.json();
}

/**
 * Revoke an API key
 */
export async function revokeAPIKey(researcherId: string, keyId: string): Promise<void> {
  const response = await fetch(
    `${API_URL}/api/researcher/${researcherId}/api-keys/${keyId}`,
    {
      method: 'DELETE',
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to revoke API key');
  }
}

