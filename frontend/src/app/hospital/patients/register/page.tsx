'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2, X, UserPlus } from 'lucide-react';
import { useHospitalSession } from '@/hooks/useHospitalSession';
import { useRegisterHospitalPatient } from '@/hooks/usePatientIdentity';
import { useRouter } from 'next/navigation';

export default function HospitalPatientRegisterPage() {
  const router = useRouter();
  const { hospitalId, apiKey, isAuthenticated, isLoading } = useHospitalSession();
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    nationalId: '',
    hospitalPatientId: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [registeredUPI, setRegisteredUPI] = useState<string | null>(null);

  const registerMutation = useRegisterHospitalPatient();

  // Redirect if not authenticated (use useEffect to avoid render-time navigation)
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

  // Don't render if not authenticated (redirect will happen)
  if (!isAuthenticated) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospitalId || !apiKey) return;

    setError(null);
    setSuccess(null);
    setRegisteredUPI(null);

    if (!formData.name || !formData.dateOfBirth || !formData.hospitalPatientId) {
      setError('Name, Date of Birth, and Hospital Patient ID are required');
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        hospitalId,
        apiKey,
        patientData: {
          name: formData.name,
          dateOfBirth: formData.dateOfBirth,
          phone: formData.phone || undefined,
          email: formData.email || undefined,
          nationalId: formData.nationalId || undefined,
          hospitalPatientId: formData.hospitalPatientId,
        },
      });

      setRegisteredUPI(result.upi);
      setSuccess('Patient registered successfully!');
      setFormData({
        name: '',
        dateOfBirth: '',
        phone: '',
        email: '',
        nationalId: '',
        hospitalPatientId: '',
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to register patient');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Register Patient</h1>
          <p className="text-muted-foreground">
            Register a new patient and link them to your hospital
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="flex-1 text-red-800">{error}</span>
            <button onClick={() => setError(null)}>
              <X className="h-4 w-4 text-red-600" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="flex-1 text-green-800">{success}</span>
            <button onClick={() => setSuccess(null)}>
              <X className="h-4 w-4 text-green-600" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5" />
                Patient Information
              </CardTitle>
              <CardDescription>Enter patient details to register</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="John Doe"
                    className="w-full rounded-lg border px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Date of Birth <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+256 700 123456"
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="patient@example.com"
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">National ID</label>
                  <input
                    type="text"
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    placeholder="ID123456"
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Hospital Patient ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.hospitalPatientId}
                    onChange={(e) =>
                      setFormData({ ...formData, hospitalPatientId: e.target.value })
                    }
                    placeholder="PAT-001"
                    className="w-full rounded-lg border px-3 py-2"
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Your hospital&apos;s internal patient identifier
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Register Patient
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-6">
            {registeredUPI && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle2 className="h-5 w-5" />
                    Registration Successful!
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Patient UPI:</p>
                    <p className="font-mono text-lg font-semibold">{registeredUPI}</p>
                    <p className="mt-4 text-xs text-muted-foreground">
                      The patient can now use this UPI to access their medical records. Share this
                      UPI securely with the patient.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Registration Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold">Unique Patient Identity</p>
                    <p className="text-sm text-muted-foreground">
                      Each patient gets a unique UPI that persists across hospitals
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold">Cross-Hospital Access</p>
                    <p className="text-sm text-muted-foreground">
                      Patients can access their complete medical history from all hospitals
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-semibold">Automatic Linking</p>
                    <p className="text-sm text-muted-foreground">
                      Patient is automatically linked to your hospital
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

