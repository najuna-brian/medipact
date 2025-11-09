/**
 * Admin Authentication API Client
 * 
 * Type-safe API client for admin authentication endpoints.
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3002';

const adminAuthClient = axios.create({
  baseURL: `${API_BASE_URL}/api/admin/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AdminLoginResponse {
  success: boolean;
  token: string;
  admin: {
    id: number;
    username: string;
    role: string;
  };
}

export interface AdminLogoutResponse {
  success: boolean;
  message: string;
}

/**
 * Admin login
 */
export async function adminLogin(
  credentials: AdminLoginRequest
): Promise<AdminLoginResponse> {
  const response = await adminAuthClient.post<AdminLoginResponse>('/login', credentials);
  return response.data;
}

/**
 * Admin logout (client-side token removal)
 */
export async function adminLogout(): Promise<AdminLogoutResponse> {
  const response = await adminAuthClient.post<AdminLogoutResponse>('/logout');
  return response.data;
}

