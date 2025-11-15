'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, CheckCircle2, Loader2, AlertCircle, X, Copy, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRegisterHospital } from '@/hooks/usePatientIdentity';
import { useHospitalSession } from '@/hooks/useHospitalSession';
import { HederaAccountId } from '@/components/HederaAccountId/HederaAccountId';

export default function HospitalEnrollmentPage() {
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    location: '',
    fhirEndpoint: '',
    contactEmail: '',
    // Payment method fields (optional)
    paymentMethod: '' as 'bank' | 'mobile_money' | '',
    bankName: '',
    bankAccountNumber: '',
    mobileMoneyProvider: '' as 'mtn' | 'airtel' | 'vodafone' | 'tigo' | '',
    mobileMoneyNumber: '',
    withdrawalThresholdUSD: 100.0,
    autoWithdrawEnabled: true,
  });
  const [showApiKey, setShowApiKey] = useState(false);
  const [registeredHospital, setRegisteredHospital] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const router = useRouter();
  const { login } = useHospitalSession();
  const registerMutation = useRegisterHospital();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      // Convert empty strings to undefined for optional fields
      const registrationData = {
        ...formData,
        paymentMethod: formData.paymentMethod || undefined,
        bankName: formData.bankName || undefined,
        bankAccountNumber: formData.bankAccountNumber || undefined,
        mobileMoneyProvider: formData.mobileMoneyProvider || undefined,
        mobileMoneyNumber: formData.mobileMoneyNumber || undefined,
      };
      const result = await registerMutation.mutateAsync(registrationData);
      setRegisteredHospital(result.hospital);
      setSuccess('Hospital registered successfully!');
      setFormData({
        name: '',
        country: '',
        location: '',
        fhirEndpoint: '',
        contactEmail: '',
        paymentMethod: '',
        bankName: '',
        bankAccountNumber: '',
        mobileMoneyProvider: '',
        mobileMoneyNumber: '',
        withdrawalThresholdUSD: 100.0,
        autoWithdrawEnabled: true,
      });

      // Auto-login after successful registration
      if (result.hospital?.hospitalId && result.hospital?.apiKey) {
        login(result.hospital.hospitalId, result.hospital.apiKey);
        // Small delay to ensure sessionStorage is saved before navigation
        setTimeout(() => {
          // Don't auto-redirect - let user see success message and choose to proceed
        }, 100);
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || 'Failed to register hospital';
      setError(errorMessage);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copied to clipboard!');
    setTimeout(() => setSuccess(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Hospital Enrollment</h1>
          <p className="text-muted-foreground">
            Register your hospital to start managing patient identities and sharing anonymized data
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
              <div className="flex-1">
                <p className="mb-1 font-semibold text-red-800">Registration Failed</p>
                <p className="text-sm text-red-700">{error}</p>
                {error.includes('already registered') && (
                  <div className="mt-3">
                    <Link href="/hospital/login">
                      <Button variant="outline" size="sm" className="bg-white">
                        Go to Login Page
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
              <button onClick={() => setError(null)} className="flex-shrink-0">
                <X className="h-4 w-4 text-red-600" />
              </button>
            </div>
          </div>
        )}

        {success && !registeredHospital && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto">
              <X className="h-4 w-4 text-green-600" />
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Registration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Register Hospital
              </CardTitle>
              <CardDescription>Fill in your hospital information to get started</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium">
                    Hospital Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="City General Hospital"
                    className="w-full rounded-lg border px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="country" className="mb-2 block text-sm font-medium">
                    Country <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="country"
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Uganda"
                    className="w-full rounded-lg border px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="location" className="mb-2 block text-sm font-medium">
                    Location (Optional)
                  </label>
                  <input
                    id="location"
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Kampala, Uganda"
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="fhir-endpoint" className="mb-2 block text-sm font-medium">
                    FHIR API Endpoint (Optional)
                  </label>
                  <input
                    id="fhir-endpoint"
                    type="url"
                    value={formData.fhirEndpoint}
                    onChange={(e) => setFormData({ ...formData, fhirEndpoint: e.target.value })}
                    placeholder="https://fhir.example.com/fhir"
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="mb-2 block text-sm font-medium">
                    Contact Email (Optional)
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="admin@hospital.com"
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </div>

                {/* Payment Method Section */}
                <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <h3 className="mb-4 text-sm font-semibold">Payment Method (Optional)</h3>
                  <p className="mb-4 text-xs text-muted-foreground">
                    Set up how you want to receive revenue payments. You can update this later in
                    settings.
                  </p>

                  <div className="mb-4">
                    <label className="mb-2 block text-sm font-medium">Payment Method</label>
                    <select
                      value={formData.paymentMethod}
                      onChange={(e) =>
                        setFormData({ ...formData, paymentMethod: e.target.value as any })
                      }
                      className="w-full rounded-lg border px-3 py-2"
                    >
                      <option value="">Select payment method (optional)</option>
                      <option value="bank">Bank Account</option>
                      <option value="mobile_money">Mobile Money</option>
                    </select>
                  </div>

                  {formData.paymentMethod === 'bank' && (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">Bank Name</label>
                        <input
                          type="text"
                          value={formData.bankName}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          placeholder="Bank of Uganda"
                          className="w-full rounded-lg border px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Account Number</label>
                        <input
                          type="text"
                          value={formData.bankAccountNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, bankAccountNumber: e.target.value })
                          }
                          placeholder="1234567890"
                          className="w-full rounded-lg border px-3 py-2"
                        />
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod === 'mobile_money' && (
                    <div className="space-y-4">
                      <div>
                        <label className="mb-2 block text-sm font-medium">Provider</label>
                        <select
                          value={formData.mobileMoneyProvider}
                          onChange={(e) =>
                            setFormData({ ...formData, mobileMoneyProvider: e.target.value as any })
                          }
                          className="w-full rounded-lg border px-3 py-2"
                        >
                          <option value="">Select provider</option>
                          <option value="mtn">MTN</option>
                          <option value="airtel">Airtel</option>
                          <option value="vodafone">Vodafone</option>
                          <option value="tigo">Tigo</option>
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-sm font-medium">Phone Number</label>
                        <input
                          type="tel"
                          value={formData.mobileMoneyNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, mobileMoneyNumber: e.target.value })
                          }
                          placeholder="+256 700 123456"
                          className="w-full rounded-lg border px-3 py-2"
                        />
                      </div>
                    </div>
                  )}

                  {formData.paymentMethod && (
                    <div className="mt-4 space-y-2">
                      <div>
                        <label className="mb-2 block text-sm font-medium">
                          Auto-Withdraw Threshold (USD)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          value={formData.withdrawalThresholdUSD}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              withdrawalThresholdUSD: parseFloat(e.target.value) || 100.0,
                            })
                          }
                          className="w-full rounded-lg border px-3 py-2"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Funds will automatically transfer when balance reaches this amount
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="autoWithdraw"
                          checked={formData.autoWithdrawEnabled}
                          onChange={(e) =>
                            setFormData({ ...formData, autoWithdrawEnabled: e.target.checked })
                          }
                          className="h-4 w-4"
                        />
                        <label htmlFor="autoWithdraw" className="text-sm">
                          Enable automatic withdrawals
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    'Register Hospital'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Registration Success / Info */}
          <div className="space-y-6">
            {registeredHospital ? (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle2 className="h-5 w-5" />
                    Registration Successful!
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">Hospital ID</p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded border bg-white px-3 py-2 font-mono text-sm">
                        {registeredHospital.hospitalId}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(registeredHospital.hospitalId)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {registeredHospital.hederaAccountId && (
                    <div>
                      <HederaAccountId accountId={registeredHospital.hederaAccountId} />
                    </div>
                  )}

                  <div>
                    <p className="mb-1 text-sm text-muted-foreground">API Key</p>
                    <p className="mb-2 text-xs text-red-600">
                      ⚠️ Save this API key securely! It will not be shown again.
                    </p>
                    <div className="flex items-center gap-2">
                      <code className="flex-1 rounded border bg-white px-3 py-2 font-mono text-sm">
                        {showApiKey ? registeredHospital.apiKey : '•'.repeat(64)}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(registeredHospital.apiKey)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="mb-2 text-sm font-semibold">Next Steps:</p>
                    <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
                      <li>Save your Hospital ID and API Key securely</li>
                      <li>Complete hospital verification to activate your account</li>
                      <li>Login to access patient registration and management</li>
                    </ul>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm text-muted-foreground">
                        Next, you&apos;ll need to submit verification documents (license number and
                        registration certificate) for admin approval.
                      </p>
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          if (registeredHospital?.hospitalId && registeredHospital?.apiKey) {
                            // Ensure session is saved (should already be done, but double-check)
                            login(registeredHospital.hospitalId, registeredHospital.apiKey);
                            // Small delay to ensure sessionStorage is saved
                            setTimeout(() => {
                              router.push('/hospital/verification');
                            }, 100);
                          } else {
                            router.push('/hospital/verification');
                          }
                        }}
                      >
                        Proceed to Verification
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Enrollment Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold">Patient Identity Management</p>
                      <p className="text-sm text-muted-foreground">
                        Link patients across multiple visits using UPI
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold">Data Sharing</p>
                      <p className="text-sm text-muted-foreground">
                        Share anonymized data for research while protecting patient privacy
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold">Revenue Sharing</p>
                      <p className="text-sm text-muted-foreground">
                        Earn revenue from anonymized data sales (60% patient, 25% hospital, 15%
                        platform)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
