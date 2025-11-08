'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePatientSession } from '@/hooks/usePatientSession';
import { Loader2 } from 'lucide-react';

export function PatientProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = usePatientSession();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/patient/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

