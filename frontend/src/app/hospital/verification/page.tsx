'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, X, Upload, FileText, Building2, Link as LinkIcon, Key } from 'lucide-react';
import { useHospitalSession } from '@/hooks/useHospitalSession';
import { useSubmitVerificationDocuments, useVerificationStatus } from '@/hooks/usePatientIdentity';
export default function HospitalVerificationPage() {
  const { hospitalId, apiKey, isAuthenticated, isLoading, login } = useHospitalSession();
  const [documents, setDocuments] = useState({
    licenseNumber: '',
    registrationCertificate: '',
    certificateType: 'upload' as 'upload' | 'url',
  });
  const [certificateFile, setCertificateFile] = useState<File | null>(null);
  const [certificateUrl, setCertificateUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [manualCredentials, setManualCredentials] = useState({
    hospitalId: '',
    apiKey: '',
  });
  const [isSubmittingCredentials, setIsSubmittingCredentials] = useState(false);

  const {
    data: verificationStatus,
    isLoading: statusLoading,
    refetch: refetchVerification,
  } = useVerificationStatus(hospitalId, apiKey);
  const submitMutation = useSubmitVerificationDocuments();

  // Auto-fill credentials from session when available
  useEffect(() => {
    if (!isLoading && hospitalId && apiKey) {
      setManualCredentials({
        hospitalId: hospitalId,
        apiKey: apiKey,
      });
    }
  }, [hospitalId, apiKey, isLoading]);

  // Reset submitting flag when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      setIsSubmittingCredentials(false);
    }
  }, [isAuthenticated]);

  // Listen for hospital verification updates from admin
  useEffect(() => {
    const handleVerificationUpdate = () => {
      // Refetch verification status when admin approves/rejects
      if (hospitalId) {
        refetchVerification();
      }
    };

    window.addEventListener('hospital-verified', handleVerificationUpdate);
    // Also poll for updates every 10 seconds (as fallback)
    const pollInterval = setInterval(() => {
      if (hospitalId && apiKey) {
        refetchVerification();
      }
    }, 10000);

    return () => {
      window.removeEventListener('hospital-verified', handleVerificationUpdate);
      clearInterval(pollInterval);
    };
  }, [hospitalId, apiKey, refetchVerification]);

  // Define handler function (not a hook, so can be after hooks)
  const handleCredentialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!manualCredentials.hospitalId || !manualCredentials.apiKey) {
      setError('Please enter both Hospital ID and API Key');
      return;
    }

    // Mark as submitting to hide form immediately
    setIsSubmittingCredentials(true);

    // Save credentials to session - this will trigger a re-render
    // and isAuthenticated will be true on the next render
    login(manualCredentials.hospitalId.trim(), manualCredentials.apiKey.trim());
  };

  // All hooks must be called before any conditional returns
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Show credential confirmation form if not authenticated and not submitting
  if (!isAuthenticated && !isLoading && !isSubmittingCredentials) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Hospital Verification</h1>
            <p className="text-muted-foreground">
              Confirm your credentials to submit verification documents
            </p>
          </div>

          <Card className="mx-auto max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Confirm Hospital Credentials
              </CardTitle>
              <CardDescription>
                Enter the Hospital ID and API Key provided during registration
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  <span className="flex-1 text-red-800">{error}</span>
                  <button onClick={() => setError(null)}>
                    <X className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              )}

              <form onSubmit={handleCredentialSubmit} className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Hospital ID <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualCredentials.hospitalId}
                    onChange={(e) =>
                      setManualCredentials({ ...manualCredentials, hospitalId: e.target.value })
                    }
                    placeholder="HOSP-XXXXXXXX"
                    className="w-full rounded-lg border px-3 py-2 font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium">
                    API Key <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={manualCredentials.apiKey}
                    onChange={(e) =>
                      setManualCredentials({ ...manualCredentials, apiKey: e.target.value })
                    }
                    placeholder="Enter your API key"
                    className="w-full rounded-lg border px-3 py-2 font-mono"
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    These were provided when you registered your hospital
                  </p>
                </div>

                <Button type="submit" className="w-full">
                  Confirm and Continue
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If authenticated, show the verification form
  // (The redundant check was removed - React will handle the re-render after login)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setError('Please upload a PDF, JPG, or PNG file');
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      setCertificateFile(file);
      setError(null);
    }
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:application/pdf;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate credentials are present
    if (!hospitalId || !apiKey) {
      setError('Hospital credentials are missing. Please log in again.');
      console.error('Missing credentials:', { hospitalId: !!hospitalId, apiKey: !!apiKey });
      return;
    }

    setError(null);
    setSuccess(null);

    if (!documents.licenseNumber) {
      setError('License number is required');
      return;
    }

    // Validate that registration certificate is provided (either file or URL)
    if (documents.certificateType === 'upload' && !certificateFile) {
      setError('Please upload a registration certificate file or switch to URL input');
      return;
    }

    if (documents.certificateType === 'url' && (!certificateUrl || certificateUrl.trim() === '')) {
      setError('Please provide a registration certificate URL or switch to file upload');
      return;
    }

    try {
      let registrationCertificate: string | undefined;

      if (documents.certificateType === 'upload' && certificateFile) {
        // Convert file to base64
        registrationCertificate = await convertFileToBase64(certificateFile);
      } else if (documents.certificateType === 'url' && certificateUrl.trim()) {
        registrationCertificate = certificateUrl.trim();
      }

      // Final check - ensure we have a certificate
      if (!registrationCertificate) {
        setError(
          'Registration certificate is required. Please provide either a file upload or a URL link.'
        );
        return;
      }

      console.log('Submitting verification:', {
        hospitalId,
        apiKeyLength: apiKey?.length,
        hasLicense: !!documents.licenseNumber,
        hasCertificate: !!registrationCertificate,
      });

      await submitMutation.mutateAsync({
        hospitalId: hospitalId.trim(),
        apiKey: apiKey.trim(),
        documents: {
          licenseNumber: documents.licenseNumber.trim(),
          registrationCertificate,
        },
      });

      setSuccess('Verification documents submitted successfully! Awaiting admin approval.');
      setDocuments({ licenseNumber: '', registrationCertificate: '', certificateType: 'upload' });
      setCertificateFile(null);
      setCertificateUrl('');

      // Refresh verification status
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.message || 'Failed to submit documents';
      setError(errorMessage);
      console.error('Verification submission error:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return <Badge variant="success">Verified</Badge>;
      case 'rejected':
        return <Badge variant="error">Rejected</Badge>;
      default:
        return <Badge variant="warning">Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Hospital Verification</h1>
          <p className="text-muted-foreground">
            Submit verification documents to activate your hospital account
          </p>
        </div>

        {/* Verification Status */}
        {statusLoading ? (
          <Card className="mb-6">
            <CardContent className="py-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ) : verificationStatus ? (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Verification Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <div className="mt-1 flex items-center gap-2">
                    {getStatusBadge(verificationStatus.verificationStatus)}
                    <span className="text-sm text-muted-foreground">
                      {verificationStatus.hospitalId}
                    </span>
                  </div>
                </div>
              </div>

              {verificationStatus.verificationStatus === 'verified' && (
                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                    <div>
                      <p className="font-semibold text-green-900">Verification Complete</p>
                      <p className="mt-1 text-sm text-green-800">
                        Your hospital has been verified. You can now register patients and use all
                        features.
                      </p>
                      {verificationStatus.verifiedAt && (
                        <p className="mt-2 text-xs text-green-700">
                          Verified on:{' '}
                          {new Date(verificationStatus.verifiedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {verificationStatus.verificationStatus === 'rejected' && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-900">Verification Rejected</p>
                      <p className="mt-1 text-sm text-red-800">
                        Your verification was rejected. Please review and resubmit your documents.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {verificationStatus.verificationStatus === 'pending' && (
                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                    <div>
                      <p className="font-semibold text-yellow-900">Verification Pending</p>
                      <p className="mt-1 text-sm text-yellow-800">
                        Your documents are under review. You&apos;ll be notified once verification is
                        complete.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

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

        {/* Document Submission Form */}
        {(!verificationStatus || verificationStatus.verificationStatus !== 'verified') && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Submit Verification Documents
              </CardTitle>
              <CardDescription>
                Provide your hospital license number and registration certificate
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* License Number */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Hospital License Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={documents.licenseNumber}
                    onChange={(e) => setDocuments({ ...documents, licenseNumber: e.target.value })}
                    placeholder="e.g., HOSP-LIC-2024-00123"
                    className="w-full rounded-lg border px-3 py-2"
                    required
                  />
                </div>

                {/* Registration Certificate */}
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Registration Certificate (Optional)
                  </label>

                  {/* Toggle between upload and URL */}
                  <div className="mb-3 flex gap-2">
                    <Button
                      type="button"
                      variant={documents.certificateType === 'upload' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setDocuments({ ...documents, certificateType: 'upload' });
                        setCertificateUrl('');
                      }}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Upload File
                    </Button>
                    <Button
                      type="button"
                      variant={documents.certificateType === 'url' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => {
                        setDocuments({ ...documents, certificateType: 'url' });
                        setCertificateFile(null);
                      }}
                    >
                      <LinkIcon className="mr-2 h-4 w-4" />
                      Paste URL
                    </Button>
                  </div>

                  {/* File Upload Option */}
                  {documents.certificateType === 'upload' && (
                    <div className="space-y-2">
                      <div className="rounded-lg border-2 border-dashed p-6 text-center">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                          className="hidden"
                          id="certificate-upload"
                        />
                        <label htmlFor="certificate-upload" className="cursor-pointer">
                          <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
                          <p className="mb-1 text-sm text-muted-foreground">
                            Click to upload or drag and drop
                          </p>
                          <p className="text-xs text-muted-foreground">
                            PDF, JPG, or PNG (max 10MB)
                          </p>
                        </label>
                      </div>
                      {certificateFile && (
                        <div className="flex items-center justify-between rounded-lg border bg-gray-50 p-3">
                          <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium">{certificateFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(certificateFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCertificateFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* URL Option */}
                  {documents.certificateType === 'url' && (
                    <input
                      type="url"
                      value={certificateUrl}
                      onChange={(e) => setCertificateUrl(e.target.value)}
                      placeholder="https://example.com/certificate.pdf"
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={
                    submitMutation.isPending ||
                    !documents.licenseNumber ||
                    (documents.certificateType === 'upload' && !certificateFile) ||
                    (documents.certificateType === 'url' && !certificateUrl?.trim())
                  }
                >
                  {submitMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Submit for Verification
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

