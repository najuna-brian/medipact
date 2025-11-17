'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2, Search, Mail, Phone, User } from 'lucide-react';
import { useHospitalSession } from '@/hooks/useHospitalSession';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function HospitalPatientLookupPage() {
  const router = useRouter();
  const { hospitalId, apiKey, isAuthenticated, isLoading } = useHospitalSession();
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    nationalId: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [foundUPI, setFoundUPI] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/hospital/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalId || !apiKey) return;

    setError(null);
    setSuccess(null);
    setFoundUPI(null);

    if (!formData.email && !formData.phone && !formData.nationalId) {
      setError('Please provide at least one: email, phone, or national ID');
      return;
    }

    setIsSearching(true);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/hospital/${hospitalId}/patients/lookup`,
        {
          email: formData.email || undefined,
          phone: formData.phone || undefined,
          nationalId: formData.nationalId || undefined,
        },
        {
          headers: {
            'X-Hospital-ID': hospitalId,
            'X-API-Key': apiKey,
          },
        }
      );

      if (response.data.found && response.data.upi) {
        setFoundUPI(response.data.upi);
        setSuccess(response.data.message || 'Patient UPI found successfully!');
      } else {
        setError('Patient not found. Please verify the contact information.');
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to lookup patient';
      setError(errorMessage);
      setFoundUPI(null);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setFormData({ email: '', phone: '', nationalId: '' });
    setError(null);
    setSuccess(null);
    setFoundUPI(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Patient Lookup</h1>
          <p className="text-muted-foreground">
            Find a patient's UPI using their contact information. Only patients linked to your hospital can be found.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Lookup Patient UPI
            </CardTitle>
            <CardDescription>
              Enter at least one of the following: email, phone number, or national ID
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="patient@example.com"
                    className="w-full rounded-lg border pl-10 pr-3 py-2"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+256 700 123456"
                    className="w-full rounded-lg border pl-10 pr-3 py-2"
                  />
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">National ID</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    placeholder="ID123456"
                    className="w-full rounded-lg border pl-10 pr-3 py-2"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Lookup Patient
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSearching}
                >
                  Reset
                </Button>
              </div>
            </form>

            {error && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-900">Error</p>
                    <p className="text-sm text-red-700 mt-1">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {success && foundUPI && (
              <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-900 mb-2">{success}</p>
                    <div className="bg-white rounded-lg p-3 border border-green-200">
                      <p className="text-xs text-muted-foreground mb-1">Patient UPI:</p>
                      <p className="font-mono text-lg font-bold text-green-800">{foundUPI}</p>
                    </div>
                    <p className="text-xs text-green-700 mt-2">
                      Share this UPI with the patient so they can access their account.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Access Control</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                • Only patients linked to your hospital can be found through this lookup.
              </p>
              <p>
                • All lookups are logged to Hedera Consensus Service (HCS) for audit trail.
              </p>
              <p>
                • Patients can also retrieve their UPI through the patient portal using their contact information.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

