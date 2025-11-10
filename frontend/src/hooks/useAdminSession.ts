/**
 * Admin Session Management Hook
 * 
 * Manages admin authentication state using sessionStorage for security.
 */

import { useState, useEffect } from 'react';

const ADMIN_TOKEN_KEY = 'medipact_admin_token';
const ADMIN_USER_KEY = 'medipact_admin_user';

export interface AdminUser {
  id: number;
  username: string;
  role: string;
}

export function useAdminSession() {
  const [token, setToken] = useState<string | null>(null);
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load token and admin from sessionStorage on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem(ADMIN_TOKEN_KEY);
    const storedAdmin = sessionStorage.getItem(ADMIN_USER_KEY);
    if (storedToken && storedAdmin) {
      setToken(storedToken);
      try {
        setAdmin(JSON.parse(storedAdmin));
      } catch {
        // Invalid JSON, clear storage
        sessionStorage.removeItem(ADMIN_TOKEN_KEY);
        sessionStorage.removeItem(ADMIN_USER_KEY);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, adminUser: AdminUser) => {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, newToken);
    sessionStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser));
    setToken(newToken);
    setAdmin(adminUser);
  };

  const logout = () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    sessionStorage.removeItem(ADMIN_USER_KEY);
    setToken(null);
    setAdmin(null);
  };

  const isAuthenticated = !!(token && admin);

  return {
    token,
    admin,
    login,
    logout,
    isAuthenticated,
    isLoading,
  };
}

