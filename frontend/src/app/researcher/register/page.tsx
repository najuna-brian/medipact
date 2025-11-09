'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useRegisterResearcher } from '@/hooks/useResearcher';
import { HederaAccountId } from '@/components/HederaAccountId/HederaAccountId';

export default function ResearcherRegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    organizationName: '',
    contactName: '',
    country: '',
  });

  const registerMutation = useRegisterResearcher();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.organizationName) {
      return;
    }

    try {
      const result = await registerMutation.mutateAsync(formData);
      
      // Store researcher ID in session/localStorage
      if (result.researcher?.researcherId) {
        sessionStorage.setItem('researcherId', result.researcher.researcherId);
        sessionStorage.setItem('researcherEmail', result.researcher.email);
      }
      
      // Redirect to dashboard after a brief delay
      setTimeout(() => {
        router.push(`/researcher/dashboard`);
      }, 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
    }
  };

  if (registerMutation.isSuccess && registerMutation.data) {
    const researcher = registerMutation.data.researcher;
    
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Registration Successful!</CardTitle>
            <CardDescription>
              Your researcher account has been created
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Researcher ID</p>
                <p className="font-mono text-lg font-semibold">{researcher.researcherId}</p>
              </div>
              
              {researcher.hederaAccountId && (
                <div>
                  <HederaAccountId 
                    accountId={researcher.hederaAccountId}
                    showLabel={true}
                  />
                </div>
              )}
              
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{researcher.email}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Organization</p>
                <p className="font-medium">{researcher.organizationName}</p>
              </div>
            </div>

            {researcher.verificationPrompt && (
              <div className="rounded-lg border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-yellow-900">Verification Required</p>
                    <p className="text-sm text-yellow-800 mt-1">
                      {researcher.verificationMessage || 'Please verify your account to access full features and better pricing.'}
                    </p>
                    <Button
                      onClick={() => router.push(`/researcher/${researcher.researcherId}/verify`)}
                      className="mt-3 bg-yellow-600 hover:bg-yellow-700 text-white"
                      size="sm"
                    >
                      Verify Account
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => router.push('/researcher/dashboard')}
                className="flex-1"
              >
                Go to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Researcher Registration</CardTitle>
          <CardDescription>
            Register to access anonymized medical data for research
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {registerMutation.isError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span>{(registerMutation.error as any)?.response?.data?.error || (registerMutation.error as any)?.message || 'Registration failed'}</span>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="researcher@organization.com"
                disabled={registerMutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="organizationName" className="text-sm font-medium">
                Organization Name *
              </label>
              <input
                id="organizationName"
                type="text"
                value={formData.organizationName}
                onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Research Institute Inc."
                disabled={registerMutation.isPending}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="contactName" className="text-sm font-medium">
                Contact Name (Optional)
              </label>
              <input
                id="contactName"
                type="text"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Dr. Jane Smith"
                disabled={registerMutation.isPending}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="country" className="text-sm font-medium">
                Country (Optional)
              </label>
              <input
                id="country"
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="United States"
                disabled={registerMutation.isPending}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                'Register'
              )}
            </Button>

            <div className="text-center text-sm text-gray-600">
              <p>Already registered? <a href="/researcher/login" className="text-indigo-600 hover:underline">Login</a></p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

