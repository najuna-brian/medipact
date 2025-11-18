import axios from 'axios';

// API client for Next.js API routes (frontend -> Next.js API -> backend)
// This should always use '/api' to call Next.js API routes, not the backend directly
// The backend URL is used by Next.js API routes to forward requests
const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL;
  
  // If NEXT_PUBLIC_API_URL is set to a full URL (backend), default to '/api'
  // This ensures we always use Next.js API routes, not direct backend calls
  if (envUrl && (envUrl.startsWith('http://') || envUrl.startsWith('https://'))) {
    console.warn(
      'NEXT_PUBLIC_API_URL should be "/api" for Next.js routes, not a backend URL. ' +
      'Use NEXT_PUBLIC_BACKEND_API_URL for the backend URL. Defaulting to "/api".'
    );
    return '/api';
  }
  
  // Use '/api' as default for Next.js API routes
  return envUrl || '/api';
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

