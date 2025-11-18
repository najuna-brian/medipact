'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Breadcrumbs from '@/components/Breadcrumbs/Breadcrumbs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, User, Mail, ArrowRight } from 'lucide-react';
import { getResearcher, getResearcherByEmail } from '@/lib/api/patient-identity';

export default function ResearcherLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!identifier.trim()) {
      setError('Researcher ID or Email is required');
      setIsLoading(false);
      return;
    }

    try {
      let researcher;
      const trimmedIdentifier = identifier.trim();

      // Check if it looks like an email or researcher ID
      if (trimmedIdentifier.includes('@')) {
        // It's an email
        researcher = await getResearcherByEmail(trimmedIdentifier);
      } else {
        // It's a researcher ID
        researcher = await getResearcher(trimmedIdentifier);
      }

      if (!researcher) {
        setError('Researcher not found. Please check your Researcher ID or Email.');
        setIsLoading(false);
        return;
      }

      // Store researcher ID and email in sessionStorage
      sessionStorage.setItem('researcherId', researcher.researcherId);
      sessionStorage.setItem('researcherEmail', researcher.email);

      // Redirect to dashboard
      router.push('/researcher/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);

      // Better error handling
      let errorMessage = 'Failed to login. Please check your Researcher ID or Email.';

      if (err.response) {
        // API returned an error response
        const status = err.response.status;
        const data = err.response.data;

        if (status === 404) {
          errorMessage =
            'Researcher not found. Please verify your Researcher ID or Email is correct.';
        } else if (status === 500) {
          errorMessage = 'Server error. Please try again later or contact support.';
        } else if (data?.error) {
          errorMessage = data.error;
        } else if (data?.message) {
          errorMessage = data.message;
        }
      } else if (err.request) {
        // Request was made but no response received
        const apiUrl =
          process.env.NEXT_PUBLIC_BACKEND_API_URL ||
          process.env.NEXT_PUBLIC_API_URL ||
          'http://localhost:8080';
        errorMessage = `Unable to connect to server at ${apiUrl}. Please check your internet connection and ensure the backend is running.`;
      } else if (err.message) {
        errorMessage = err.message;
      }

      // Log full error for debugging
      console.error('Full login error:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        config: err.config,
      });

      setError(errorMessage);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="container mx-auto max-w-md">
        <Breadcrumbs
          items={[
            { label: 'Home', href: '/' },
            { label: 'Solutions', href: '/solutions/researchers' },
            { label: 'Researcher Login', href: '/researcher/login' },
          ]}
          className="mb-6"
        />
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">Researcher Portal</h1>
          <p className="text-muted-foreground">Access your researcher dashboard</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Researcher Login
            </CardTitle>
            <CardDescription>
              Enter your Researcher ID or Email to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <span className="flex-1 text-red-800">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Researcher ID or Email</label>
                <div className="relative">
                  {identifier.includes('@') ? (
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  ) : (
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  )}
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="RES-XXXXXXXX or your@email.com"
                    className="w-full rounded-lg border py-2 pl-10 pr-3 font-mono"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter your Researcher ID (e.g., RES-XXXXXXXX) or the email address you used during
                  registration
                </p>
                <p className="mt-2 text-xs text-amber-600">
                  Note: Demo credentials from DEMO_CREDENTIALS.md only work if demo data has been
                  populated on this server.
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  <>
                    Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <a href="/researcher/register" className="text-primary hover:underline">
                  Register as Researcher
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

