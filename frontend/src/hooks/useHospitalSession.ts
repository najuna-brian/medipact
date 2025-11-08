/**
 * Hospital Session Management Hook
 * 
 * Manages hospital authentication state using sessionStorage for security.
 */

import { useState, useEffect } from 'react';

const HOSPITAL_ID_KEY = 'medipact_hospital_id';
const HOSPITAL_API_KEY = 'medipact_hospital_api_key';

export function useHospitalSession() {
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load credentials from sessionStorage on mount
  useEffect(() => {
    const storedId = sessionStorage.getItem(HOSPITAL_ID_KEY);
    const storedKey = sessionStorage.getItem(HOSPITAL_API_KEY);
    if (storedId && storedKey) {
      setHospitalId(storedId);
      setApiKey(storedKey);
    }
    setIsLoading(false);
  }, []);

  const login = (id: string, key: string) => {
    sessionStorage.setItem(HOSPITAL_ID_KEY, id);
    sessionStorage.setItem(HOSPITAL_API_KEY, key);
    setHospitalId(id);
    setApiKey(key);
  };

  const logout = () => {
    sessionStorage.removeItem(HOSPITAL_ID_KEY);
    sessionStorage.removeItem(HOSPITAL_API_KEY);
    setHospitalId(null);
    setApiKey(null);
  };

  const isAuthenticated = !!(hospitalId && apiKey);

  return {
    hospitalId,
    apiKey,
    login,
    logout,
    isAuthenticated,
    isLoading,
  };
}

