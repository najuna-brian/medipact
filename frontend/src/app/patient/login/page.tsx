'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, CheckCircle2, Mail, Phone, User, Key, ArrowRight } from 'lucide-react';
import { useRetrieveUPI, useRegisterPatient } from '@/hooks/usePatientIdentity';
import { usePatientSession } from '@/hooks/usePatientSession';

type TabType = 'login' | 'register';

export default function PatientLoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('login');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [foundUPI, setFoundUPI] = useState<string | null>(null);

  // Login form state
  const [loginForm, setLoginForm] = useState({
    upi: '',
    email: '',
    phone: '',
  });

  // Registration form state
  const [registerForm, setRegisterForm] = useState({
    name: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    nationalId: '',
    // Payment method fields (optional)
    paymentMethod: '' as 'bank' | 'mobile_money' | '',
    bankName: '',
    bankAccountNumber: '',
    mobileMoneyProvider: '' as 'mtn' | 'airtel' | 'vodafone' | 'tigo' | '',
    mobileMoneyNumber: '',
    withdrawalThresholdUSD: 10.0,
    autoWithdrawEnabled: true,
  });

  const { login } = usePatientSession();
  const retrieveMutation = useRetrieveUPI();
  const registerMutation = useRegisterPatient();

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
        // Payment method fields
        paymentMethod: registerForm.paymentMethod || undefined,
        bankName: registerForm.bankName || undefined,
        bankAccountNumber: registerForm.bankAccountNumber || undefined,
        mobileMoneyProvider: registerForm.mobileMoneyProvider || undefined,
        mobileMoneyNumber: registerForm.mobileMoneyNumber || undefined,
        withdrawalThresholdUSD: registerForm.withdrawalThresholdUSD,
        autoWithdrawEnabled: registerForm.autoWithdrawEnabled,
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-2xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-4xl font-bold">Patient Portal</h1>
          <p className="text-muted-foreground">Access your medical records and health data</p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2">
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
            <span className="flex-1 text-red-800">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="flex-1 text-green-800">{success}</span>
          </div>
        )}

        {/* Login Tab */}
        {activeTab === 'login' && (
          <Card>
            <CardHeader>
              <CardTitle>Login to Your Account</CardTitle>
              <CardDescription>Enter your UPI to access your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Direct UPI Entry */}
              <form onSubmit={handleUPILogin} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Enter Your UPI</label>
                  <div className="relative">
                    <Key className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      value={loginForm.upi}
                      onChange={(e) => setLoginForm({ ...loginForm, upi: e.target.value })}
                      placeholder="UPI-XXXXXXXX"
                      className="w-full rounded-lg border py-2 pl-10 pr-3 font-mono"
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

                {foundUPI && (
                  <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="mb-2 text-sm font-semibold text-green-900">UPI Found:</p>
                    <p className="mb-4 font-mono text-lg font-bold text-green-800">{foundUPI}</p>
                    <Button
                      onClick={() => {
                        setLoginForm({ ...loginForm, upi: foundUPI });
                        handleUPILogin({ preventDefault: () => {} } as React.FormEvent);
                      }}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      Login with this UPI
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Forgot UPI?</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-center text-sm text-muted-foreground">
                    If you forgot your UPI, we can send it to your email or phone number
                  </p>
                  <div className="space-y-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="email"
                          value={loginForm.email}
                          onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                          placeholder="your.email@example.com"
                          className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm"
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
                      <label className="mb-1 block text-xs font-medium">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type="tel"
                          value={loginForm.phone}
                          onChange={(e) => setLoginForm({ ...loginForm, phone: e.target.value })}
                          placeholder="+256 700 123456"
                          className="w-full rounded-lg border py-2 pl-10 pr-3 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    onClick={handleRetrieveUPI}
                    className="w-full"
                    variant="outline"
                    disabled={retrieveMutation.isPending}
                  >
                    {retrieveMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        Send UPI to my email/phone
                        <Mail className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
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
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, dateOfBirth: e.target.value })
                    }
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
                    onChange={(e) =>
                      setRegisterForm({ ...registerForm, nationalId: e.target.value })
                    }
                    placeholder="ID123456"
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
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
                    <p className="mb-2 text-sm font-semibold text-green-900">Your UPI:</p>
                    <p className="mb-2 font-mono text-lg font-bold text-green-800">{foundUPI}</p>
                    <p className="text-xs text-green-700">
                      Save this UPI securely. You&apos;ll be redirected to your dashboard shortly...
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

