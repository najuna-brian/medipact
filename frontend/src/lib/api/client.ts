import axios from 'axios';

// API client for Next.js API routes (frontend -> Next.js API -> backend)
// This ALWAYS uses '/api' to call Next.js API routes, never the backend directly
// The backend URL (NEXT_PUBLIC_BACKEND_API_URL) is used by Next.js API routes to forward requests
// 
// IMPORTANT: This client should NEVER use NEXT_PUBLIC_API_URL if it's set to a backend URL.
// NEXT_PUBLIC_API_URL should be '/api' or unset. Use NEXT_PUBLIC_BACKEND_API_URL for backend URLs.
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // If NEXT_PUBLIC_API_URL is set to a full URL (backend), it's misconfigured
  // Always use '/api' for Next.js API routes regardless of env var
  if (envUrl && (envUrl.startsWith('http://') || envUrl.startsWith('https://'))) {
    if (typeof window !== 'undefined') {
      console.warn(
        '[apiClient] NEXT_PUBLIC_API_URL is misconfigured (set to backend URL). ' +
        'It should be "/api" for Next.js routes. ' +
        'Use NEXT_PUBLIC_BACKEND_API_URL for the backend URL. ' +
        'Using "/api" instead.'
      );
    }
    return '/api';
  }
  
  // If explicitly set to a relative path starting with '/', use it (e.g., '/api')
  // Otherwise default to '/api'
  return (envUrl && envUrl.startsWith('/')) ? envUrl : '/api';
};

const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token if available
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    return Promise.reject(error);
  }
);

