'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2, AlertCircle, Upload, FileText } from 'lucide-react';
import { useSubmitResearcherVerification, useResearcherVerificationStatus } from '@/hooks/useResearcher';

export default function ResearcherVerifyPage() {
  const params = useParams();
  const router = useRouter();
  const researcherId = params.researcherId as string;

  const [formData, setFormData] = useState({
    organizationDocuments: null as File | null,
    researchLicense: null as File | null,
    additionalDocuments: null as File | null,
  });

  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  // const [uploadMethod, setUploadMethod] = useState<'file' | 'url'>('file');
  const [error, setError] = useState<string | null>(null);

  const verificationStatus = useResearcherVerificationStatus(researcherId);
  const submitMutation = useSubmitResearcherVerification();

  // Handle file selection
  const handleFileChange = (field: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }));
    
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFilePreviews(prev => ({ ...prev, [field]: reader.result as string }));
      };
      reader.readAsDataURL(file);
    } else {
      setFilePreviews(prev => {
        const newPreviews = { ...prev };
        delete newPreviews[field];
        return newPreviews;
      });
    }
  };

  // Convert file to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate that at least one document is provided
    if (!formData.organizationDocuments && !formData.researchLicense && !formData.additionalDocuments) {
      setError('Please provide at least one verification document (file upload)');
      return;
    }

    try {
      const documents: any = {};

      if (formData.organizationDocuments) {
        const base64 = await fileToBase64(formData.organizationDocuments);
        documents.organizationDocuments = base64;
      }

      if (formData.researchLicense) {
        const base64 = await fileToBase64(formData.researchLicense);
        documents.researchLicense = base64;
      }

      if (formData.additionalDocuments) {
        const base64 = await fileToBase64(formData.additionalDocuments);
        documents.additionalDocuments = base64;
      }

      await submitMutation.mutateAsync({
        researcherId,
        documents,
      });

      // Refresh verification status
      verificationStatus.refetch();
    } catch (error: any) {
      console.error('Verification submission error:', error);
      setError(error.response?.data?.error || error.message || 'Failed to submit verification documents');
    }
  };

  // Show success message if verified
  if (verificationStatus.data?.verificationStatus === 'verified') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold">Verification Approved!</CardTitle>
            <CardDescription>
              Your researcher account has been verified
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4">
              <p className="text-sm text-green-800">
                You now have full access to all datasets and features. You can browse and purchase anonymized medical data for your research.
              </p>
            </div>
            <Button
              onClick={() => router.push('/researcher/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show pending message
  if (verificationStatus.data?.verificationStatus === 'pending') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-yellow-50 to-amber-100 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <Loader2 className="h-6 w-6 text-yellow-600 animate-spin" />
            </div>
            <CardTitle className="text-2xl font-bold">Verification Pending</CardTitle>
            <CardDescription>
              Your verification documents are under review
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="text-sm text-yellow-800">
                An admin will review your documents shortly. You&apos;ll be notified once your verification is complete.
              </p>
            </div>
            <Button
              onClick={() => router.push('/researcher/dashboard')}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="container mx-auto max-w-4xl py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Researcher Verification</CardTitle>
            <CardDescription>
              Submit verification documents to access full features and better pricing
            </CardDescription>
          </CardHeader>
          <CardContent>
            {verificationStatus.data?.verificationStatus === 'rejected' && (
              <div className="mb-6 rounded-lg bg-red-50 p-4 border border-red-200">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900">Verification Rejected</p>
                    <p className="text-sm text-red-800 mt-1">
                      {verificationStatus.data.verificationMessage || 'Your verification was rejected. Please submit new documents.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {submitMutation.isError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{(submitMutation.error as any)?.response?.data?.error || (submitMutation.error as any)?.message || 'Submission failed'}</span>
                </div>
              )}

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="organizationDocuments" className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Organization Registration Documents *
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Upload your organization&apos;s registration certificate or legal documents
                  </p>
                  <input
                    id="organizationDocuments"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('organizationDocuments', e.target.files?.[0] || null)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    disabled={submitMutation.isPending}
                  />
                  {filePreviews.organizationDocuments && (
                    <p className="text-xs text-green-600">✓ File selected</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="researchLicense" className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Research License / IRB Approval (Optional)
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Upload your research license or IRB approval documents
                  </p>
                  <input
                    id="researchLicense"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('researchLicense', e.target.files?.[0] || null)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    disabled={submitMutation.isPending}
                  />
                  {filePreviews.researchLicense && (
                    <p className="text-xs text-green-600">✓ File selected</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label htmlFor="additionalDocuments" className="text-sm font-medium flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Additional Documents (Optional)
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Any additional verification documents
                  </p>
                  <input
                    id="additionalDocuments"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange('additionalDocuments', e.target.files?.[0] || null)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    disabled={submitMutation.isPending}
                  />
                  {filePreviews.additionalDocuments && (
                    <p className="text-xs text-green-600">✓ File selected</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={
                    submitMutation.isPending || 
                    (!formData.organizationDocuments && !formData.researchLicense && !formData.additionalDocuments)
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/researcher/dashboard')}
                  disabled={submitMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

