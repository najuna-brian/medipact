'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Link2, CheckCircle2, Plus, Loader2, AlertCircle, X } from 'lucide-react';
import {
  usePatientHospitals,
  useLinkHospital,
  useRemoveHospitalLinkage,
  useRegisterHospital,
} from '@/hooks/usePatientIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { usePatientSession } from '@/hooks/usePatientSession';
import { PatientProtectedRoute } from '@/components/PatientProtectedRoute/PatientProtectedRoute';

function PatientConnectContent() {
  const { upi } = usePatientSession();
  const [showLinkForm, setShowLinkForm] = useState(false);
  const [linkFormData, setLinkFormData] = useState({
    hospitalId: '',
    hospitalPatientId: '',
    apiKey: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const { data: hospitalsData, isLoading, error: hospitalsError } = usePatientHospitals(upi);
  const linkHospitalMutation = useLinkHospital();
  const removeLinkageMutation = useRemoveHospitalLinkage();
  const registerHospitalMutation = useRegisterHospital();

  const handleLinkHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!upi) {
      setError('Please enter your UPI first');
      return;
    }

    setError(null);
    setSuccess(null);

    try {
      await linkHospitalMutation.mutateAsync({
        upi,
        hospitalId: linkFormData.hospitalId,
        hospitalPatientId: linkFormData.hospitalPatientId,
        apiKey: linkFormData.apiKey,
      });
      setSuccess('Hospital linked successfully!');
      setShowLinkForm(false);
      setLinkFormData({ hospitalId: '', hospitalPatientId: '', apiKey: '' });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to link hospital');
    }
  };

  const handleRemoveLinkage = async (hospitalId: string) => {
    if (!upi) return;
    if (!confirm('Are you sure you want to disconnect this hospital?')) return;

    try {
      await removeLinkageMutation.mutateAsync({ upi, hospitalId });
      setSuccess('Hospital disconnected successfully');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Failed to disconnect hospital');
    }
  };

  const connectedHospitals = hospitalsData?.hospitals || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Connect Hospitals</h1>
          <p className="text-muted-foreground">
            Connect your hospital portals to sync medical records across all hospitals
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <span className="text-red-800">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="h-4 w-4 text-red-600" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <span className="text-green-800">{success}</span>
            <button onClick={() => setSuccess(null)} className="ml-auto">
              <X className="h-4 w-4 text-green-600" />
            </button>
          </div>
        )}

        {upi && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5" />
                    Link New Hospital
                  </CardTitle>
                  <CardDescription>Link a hospital to your patient identity</CardDescription>
                </CardHeader>
                <CardContent>
                  {!showLinkForm ? (
                    <Button
                      className="w-full"
                      onClick={() => setShowLinkForm(true)}
                      disabled={linkHospitalMutation.isPending}
                    >
                      <Link2 className="mr-2 h-4 w-4" />
                      Link Hospital
                    </Button>
                  ) : (
                    <form onSubmit={handleLinkHospital} className="space-y-4">
                      <div>
                        <label htmlFor="hospital-id" className="mb-2 block text-sm font-medium">
                          Hospital ID
                        </label>
                        <input
                          id="hospital-id"
                          type="text"
                          value={linkFormData.hospitalId}
                          onChange={(e) =>
                            setLinkFormData({ ...linkFormData, hospitalId: e.target.value })
                          }
                          placeholder="HOSP-XXXXXXXX"
                          className="w-full rounded-lg border px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="hospital-patient-id"
                          className="mb-2 block text-sm font-medium"
                        >
                          Your Hospital Patient ID
                        </label>
                        <input
                          id="hospital-patient-id"
                          type="text"
                          value={linkFormData.hospitalPatientId}
                          onChange={(e) =>
                            setLinkFormData({ ...linkFormData, hospitalPatientId: e.target.value })
                          }
                          placeholder="ID-12345"
                          className="w-full rounded-lg border px-3 py-2"
                          required
                        />
                      </div>
                      <div>
                        <label htmlFor="api-key" className="mb-2 block text-sm font-medium">
                          Hospital API Key
                        </label>
                        <input
                          id="api-key"
                          type="password"
                          value={linkFormData.apiKey}
                          onChange={(e) =>
                            setLinkFormData({ ...linkFormData, apiKey: e.target.value })
                          }
                          placeholder="Hospital API key"
                          className="w-full rounded-lg border px-3 py-2"
                          required
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={linkHospitalMutation.isPending}
                        >
                          {linkHospitalMutation.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Linking...
                            </>
                          ) : (
                            <>
                              <Link2 className="mr-2 h-4 w-4" />
                              Link Hospital
                            </>
                          )}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setShowLinkForm(false);
                            setLinkFormData({ hospitalId: '', hospitalPatientId: '', apiKey: '' });
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Connection Benefits</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold">Automatic Sync</p>
                      <p className="text-sm text-muted-foreground">
                        Your medical records sync automatically
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold">Complete History</p>
                      <p className="text-sm text-muted-foreground">
                        Access your full medical history in one place
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold">Secure & Private</p>
                      <p className="text-sm text-muted-foreground">
                        All connections use secure FHIR R4 standards
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Connected Hospitals
                </CardTitle>
                <CardDescription>Hospitals with access to your data</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : hospitalsError ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                    <p className="text-red-800">
                      Error loading hospitals: {hospitalsError.message}
                    </p>
                  </div>
                ) : connectedHospitals.length === 0 ? (
                  <div className="py-8 text-center">
                    <p className="mb-4 text-muted-foreground">No hospitals connected yet</p>
                    <p className="text-sm text-muted-foreground">
                      Link a hospital above to start syncing your medical records
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {connectedHospitals.map((hospital) => (
                      <div
                        key={hospital.hospitalId}
                        className="flex items-center justify-between rounded-lg border p-4"
                      >
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="font-semibold">
                              {hospital.hospitalName || hospital.hospitalId}
                            </h3>
                            <Badge
                              variant={hospital.verified ? 'success' : 'warning'}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {hospital.verified ? 'Verified' : 'Pending'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Hospital ID: {hospital.hospitalId}</span>
                            <span>•</span>
                            <span>Your ID: {hospital.hospitalPatientId}</span>
                            <span>•</span>
                            <span>Linked: {new Date(hospital.linkedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveLinkage(hospital.hospitalId)}
                            disabled={removeLinkageMutation.isPending}
                          >
                            {removeLinkageMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              'Disconnect'
                            )}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

export default function PatientConnectPage() {
  return (
    <PatientProtectedRoute>
      <PatientConnectContent />
    </PatientProtectedRoute>
  );
}
