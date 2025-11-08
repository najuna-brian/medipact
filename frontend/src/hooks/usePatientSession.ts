/**
 * Patient Session Management Hook
 * 
 * Manages patient authentication state using localStorage for persistence.
 */

import { useState, useEffect } from 'react';

const UPI_STORAGE_KEY = 'medipact_patient_upi';

export function usePatientSession() {
  const [upi, setUPI] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load UPI from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(UPI_STORAGE_KEY);
    if (stored) {
      setUPI(stored);
    }
    setIsLoading(false);
  }, []);

  const login = (newUPI: string) => {
    localStorage.setItem(UPI_STORAGE_KEY, newUPI);
    setUPI(newUPI);
  };

  const logout = () => {
    localStorage.removeItem(UPI_STORAGE_KEY);
    setUPI(null);
  };

  const isAuthenticated = !!upi;

  return {
    upi,
    login,
    logout,
    isAuthenticated,
    isLoading,
  };
}

