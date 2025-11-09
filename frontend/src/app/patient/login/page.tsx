'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, Mail, Phone, User, Key, ArrowRight } from 'lucide-react';
import { useLookupPatient, useRetrieveUPI, useRegisterPatient } from '@/hooks/usePatientIdentity';
import { usePatientSession } from '@/hooks/usePatientSession';

type TabType = 'login' | 'register';

export default function PatientLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [loginMethod, setLoginMethod] = useState<'upi' | 'lookup'>('lookup');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [foundUPI, setFoundUPI] = useState<string | null>(null);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    upi: '',
    email: '',
    phone: '',
    nationalId: '',
  });

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    nationalId: '',
  });

  const { login } = usePatientSession();
  const lookupMutation = useLookupPatient();
  const retrieveMutation = useRetrieveUPI();
  const registerMutation = useRegisterPatient();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setFoundUPI(null);

    if (!loginForm.email && !loginForm.phone && !loginForm.nationalId) {
      setError('Please provide at least one: email, phone, or national ID');
      return;
    }

    try {
      const result = await lookupMutation.mutateAsync({
        email: loginForm.email || undefined,
        phone: loginForm.phone || undefined,
        nationalId: loginForm.nationalId || undefined,
      });

      if (result.found && result.upi) {
        setFoundUPI(result.upi);
        setSuccess('UPI found! Click "Login" to continue.');
      } else {
        setError('Patient not found. Please check your information or register as a new patient.');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to lookup patient');
    }
  };

  const handleRetrieveUPI = async () => {
    setError(null);
    setSuccess(null);

    if (!loginForm.email && !loginForm.phone) {
      setError('Please provide email or phone number');
      return;
    }

    try {
      const result = await retrieveMutation.mutateAsync({
        email: loginForm.email || undefined,
        phone: loginForm.phone || undefined,
      });

      setFoundUPI(result.upi);
      setSuccess(`UPI sent to your ${result.sentVia}. You can also use it to login now.`);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to retrieve UPI');
    }
  };

  const handleUPILogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginForm.upi.trim()) {
      login(loginForm.upi.trim());
      router.push('/patient/dashboard');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!registerForm.name || !registerForm.dateOfBirth) {
      setError('Name and Date of Birth are required');
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        name: registerForm.name,
        dateOfBirth: registerForm.dateOfBirth,
        phone: registerForm.phone || undefined,
        email: registerForm.email || undefined,
        nationalId: registerForm.nationalId || undefined,
      });

      setSuccess(
        `Registration successful! Your UPI has been generated.${
          result.hederaAccountId ? ' A Hedera account has been created for you.' : ''
        }`
      );
      setFoundUPI(result.upi);
      // Auto-login after registration
      setTimeout(() => {
        login(result.upi);
        router.push('/patient/dashboard');
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to register patient');
    }
  };

  const handleLoginWithFoundUPI = () => {
    if (foundUPI) {
      login(foundUPI);
      router.push('/patient/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Patient Portal</h1>
          <p className="text-muted-foreground">Access your medical records and health data</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'login' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => {
              setActiveTab('login');
              setError(null);
              setSuccess(null);
              setFoundUPI(null);
            }}
          >
            Login
          </Button>
          <Button
            variant={activeTab === 'register' ? 'default' : 'outline'}
            className="flex-1"
            onClick={() => {
              setActiveTab('register');
              setError(null);
              setSuccess(null);
              setFoundUPI(null);
            }}
          >
            Register
          </Button>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800 flex-1">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-green-800 flex-1">{success}</span>
          </div>
        )}

        {/* Login Tab */}
        {activeTab === 'login' && (
          <Card>
            <CardHeader>
              <CardTitle>Login to Your Account</CardTitle>
              <CardDescription>Use your UPI or lookup by email/phone/national ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Login Method Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={loginMethod === 'lookup' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setLoginMethod('lookup')}
                >
                  <User className="w-4 h-4 mr-2" />
                  Lookup by Contact
                </Button>
                <Button
                  variant={loginMethod === 'upi' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1"
                  onClick={() => setLoginMethod('upi')}
                >
                  <Key className="w-4 h-4 mr-2" />
                  Enter UPI
                </Button>
              </div>

              {/* Lookup Method */}
              {loginMethod === 'lookup' && (
                <form onSubmit={handleLookup} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="email"
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        placeholder="your.email@example.com"
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
                        value={loginForm.phone}
                        onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
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
                        value={loginForm.nationalId}
                        onChange={(e) => setLoginForm({ ...loginForm, nationalId: e.target.value })}
                        placeholder="ID123456"
                        className="w-full rounded-lg border pl-10 pr-3 py-2"
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={lookupMutation.isPending}
                  >
                    {lookupMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Looking up...
                      </>
                    ) : (
                      <>
                        Lookup UPI
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>

                  {foundUPI && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <p className="text-sm font-semibold text-green-900 mb-2">UPI Found:</p>
                      <p className="font-mono text-lg font-bold text-green-800 mb-4">{foundUPI}</p>
                      <Button
                        onClick={handleLoginWithFoundUPI}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        Login with this UPI
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleRetrieveUPI}
                      className="text-sm text-primary hover:underline"
                      disabled={retrieveMutation.isPending}
                    >
                      {retrieveMutation.isPending ? 'Sending...' : "Forgot UPI? Send it to my email/phone"}
                    </button>
                  </div>
                </form>
              )}

              {/* Direct UPI Entry */}
              {loginMethod === 'upi' && (
                <form onSubmit={handleUPILogin} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium">Enter Your UPI</label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={loginForm.upi}
                        onChange={(e) => setLoginForm({ ...loginForm, upi: e.target.value })}
                        placeholder="UPI-XXXXXXXX"
                        className="w-full rounded-lg border pl-10 pr-3 py-2 font-mono"
                        required
                      />
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Format: UPI- followed by 16 hexadecimal characters
                    </p>
                  </div>

                  <Button type="submit" className="w-full">
                    Login
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('lookup')}
                      className="text-sm text-primary hover:underline"
                    >
                      Don't know your UPI? Lookup by contact info
                    </button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        )}

        {/* Register Tab */}
        {activeTab === 'register' && (
          <Card>
            <CardHeader>
              <CardTitle>Register as New Patient</CardTitle>
              <CardDescription>Create your account to access your medical records</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={registerForm.name}
                    onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
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
                    value={registerForm.dateOfBirth}
                    onChange={(e) => setRegisterForm({ ...registerForm, dateOfBirth: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Phone Number</label>
                  <input
                    type="tel"
                    value={registerForm.phone}
                    onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                    placeholder="+256 700 123456"
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={registerForm.email}
                    onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">National ID</label>
                  <input
                    type="text"
                    value={registerForm.nationalId}
                    onChange={(e) => setRegisterForm({ ...registerForm, nationalId: e.target.value })}
                    placeholder="ID123456"
                    className="w-full rounded-lg border px-3 py-2"
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
                    <>
                      Register
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>

                {foundUPI && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-sm font-semibold text-green-900 mb-2">Your UPI:</p>
                    <p className="font-mono text-lg font-bold text-green-800 mb-2">{foundUPI}</p>
                    <p className="text-xs text-green-700">
                      Save this UPI securely. You'll be redirected to your dashboard shortly...
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

