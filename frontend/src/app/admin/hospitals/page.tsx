'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Loader2,
  AlertCircle,
  FileText,
  ExternalLink,
} from 'lucide-react';
import {
  useAdminHospitals,
  useApproveHospital,
  useRejectHospital,
  useAdminHospitalDetail,
} from '@/hooks/useAdminHospitals';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute/AdminProtectedRoute';
import { AdminSidebar } from '@/components/Sidebar/AdminSidebar';

function AdminHospitalsPageContent() {
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [approvalMessage, setApprovalMessage] = useState(
    'Your hospital verification has been approved. You can now register patients and use all features.'
  );

  const { data, isLoading, error } = useAdminHospitals();
  const {
    data: hospitalDetail,
    isLoading: isLoadingDetail,
    error: detailError,
  } = useAdminHospitalDetail(selectedHospitalId);
  const approveMutation = useApproveHospital();
  const rejectMutation = useRejectHospital();

  const hospitals = (data?.hospitals || []).filter(
    (h) => h && h.hospitalId && Object.keys(h).length > 0
  ); // Filter out empty or invalid hospital objects

  // Group hospitals by verification status
  // Only show pending hospitals that have actually submitted documents
  const pendingHospitals = hospitals.filter(
    (h) => h.verificationStatus === 'pending' && h.verificationDocuments
  );
  const verifiedHospitals = hospitals.filter((h) => h.verificationStatus === 'verified');
  const rejectedHospitals = hospitals.filter((h) => h.verificationStatus === 'rejected');

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

  const handleApprove = async () => {
    if (!selectedHospitalId) return;

    try {
      await approveMutation.mutateAsync({ hospitalId: selectedHospitalId });
      setSelectedHospitalId(null);
      setApprovalMessage(
        'Your hospital verification has been approved. You can now register patients and use all features.'
      );

      // Force refetch after a short delay to ensure cache is updated
      setTimeout(() => {
        // The mutation's onSuccess will handle invalidation, but we can also manually refetch
        window.dispatchEvent(new Event('hospital-verified'));
      }, 500);
    } catch (err) {
      console.error('Failed to approve hospital:', err);
    }
  };

  const handleReject = async () => {
    if (!selectedHospitalId || !rejectReason.trim()) {
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        hospitalId: selectedHospitalId,
        reason: rejectReason.trim(),
      });
      setSelectedHospitalId(null);
      setRejectReason('');
    } catch (err) {
      console.error('Failed to reject hospital:', err);
    }
  };

  const viewDocuments = (hospitalId: string) => {
    console.log('viewDocuments called with:', hospitalId);
    if (!hospitalId) {
      console.error('Hospital ID is missing!');
      return;
    }
    console.log('Setting selectedHospitalId to:', hospitalId);
    setSelectedHospitalId(hospitalId);
    console.log('State should be updated now');
  };

  const isBase64 = (str: string) => {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  };

  const renderCertificate = (certificate: string | undefined) => {
    if (!certificate) return null;

    // Check if it's a URL
    if (certificate.startsWith('http://') || certificate.startsWith('https://')) {
      return (
        <a
          href={certificate}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          View Certificate URL
        </a>
      );
    }

    // Check if it's base64
    if (isBase64(certificate)) {
      // Try to determine file type
      const isPDF = certificate.length > 100; // Simple heuristic
      const dataUrl = isPDF
        ? `data:application/pdf;base64,${certificate}`
        : `data:image/png;base64,${certificate}`;

      return (
        <div className="mt-2">
          <a
            href={dataUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            <FileText className="h-4 w-4" />
            View Certificate
          </a>
        </div>
      );
    }

    return <p className="text-sm text-muted-foreground">{certificate}</p>;
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-900">Error Loading Hospitals</p>
                  <p className="text-sm text-red-800">
                    {error instanceof Error ? error.message : 'Failed to load hospitals'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="mb-6 md:mb-8">
            <h1 className="mb-2 text-2xl font-bold md:text-3xl">
              Hospital Verification Management
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Review and approve hospital verification requests
            </p>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Verification</p>
                    <p className="text-xl font-bold md:text-2xl">{pendingHospitals.length}</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Verified</p>
                    <p className="text-xl font-bold md:text-2xl">{verifiedHospitals.length}</p>
                  </div>
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Rejected</p>
                    <p className="text-xl font-bold md:text-2xl">{rejectedHospitals.length}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Verifications */}
          {pendingHospitals.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-semibold md:text-xl">Pending Verifications</h2>
              <div className="space-y-4">
                {pendingHospitals.map((hospital, index) => (
                  <Card
                    key={hospital.hospitalId || `pending-hospital-${index}`}
                    className="border-yellow-200"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>{hospital.name}</CardTitle>
                            {getStatusBadge(hospital.verificationStatus)}
                          </div>
                          <CardDescription>
                            {hospital.hospitalId} • {hospital.country}
                            {hospital.location && ` • ${hospital.location}`}
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Button clicked, hospitalId:', hospital.hospitalId);
                              if (hospital.hospitalId) {
                                viewDocuments(hospital.hospitalId);
                              } else {
                                console.error('Hospital ID is undefined!', hospital);
                              }
                            }}
                            className="text-xs md:text-sm"
                          >
                            <Eye className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">View & Review</span>
                            <span className="sm:hidden">View</span>
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Hospitals */}
          <div>
            <h2 className="mb-4 text-lg font-semibold md:text-xl">All Hospitals</h2>
            <div className="space-y-4">
              {hospitals.map((hospital, index) => {
                // Skip invalid hospital objects
                if (!hospital || !hospital.hospitalId) {
                  console.warn('Skipping invalid hospital object:', hospital);
                  return null;
                }
                
                return (
                  <Card
                    key={hospital.hospitalId || `hospital-${index}`}
                    className={
                      hospital.verificationStatus === 'verified'
                        ? 'border-green-200'
                        : hospital.verificationStatus === 'rejected'
                          ? 'border-red-200'
                          : ''
                    }
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>{hospital.name}</CardTitle>
                            {getStatusBadge(hospital.verificationStatus)}
                          </div>
                          <CardDescription>
                            {hospital.hospitalId} • {hospital.country}
                            {hospital.location && ` • ${hospital.location}`}
                            {hospital.contactEmail && ` • ${hospital.contactEmail}`}
                          </CardDescription>
                          {hospital.verifiedAt && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              Verified on: {new Date(hospital.verifiedAt).toLocaleDateString()}
                              {hospital.verifiedBy && ` by ${hospital.verifiedBy}`}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Button clicked (All Hospitals), hospitalId:', hospital.hospitalId);
                              if (hospital.hospitalId) {
                                viewDocuments(hospital.hospitalId);
                              } else {
                                console.error('Hospital ID is undefined!', hospital);
                              }
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View & Review
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Hospital Detail Modal/Dialog */}
          {selectedHospitalId && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      {isLoadingDetail ? (
                        <>
                          <CardTitle>Loading...</CardTitle>
                          <CardDescription>Fetching hospital details</CardDescription>
                        </>
                      ) : hospitalDetail ? (
                        <>
                          <CardTitle>{hospitalDetail.name}</CardTitle>
                          <CardDescription>{hospitalDetail.hospitalId}</CardDescription>
                        </>
                      ) : (
                        <>
                          <CardTitle>Error</CardTitle>
                          <CardDescription>Failed to load hospital details</CardDescription>
                        </>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedHospitalId(null)}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isLoadingDetail ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : detailError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                        <div>
                          <p className="font-semibold text-red-800">Error Loading Details</p>
                          <p className="text-sm text-red-700">
                            Failed to load hospital details. Please try again.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : hospitalDetail ? (
                    <>
                      <div>
                        <h3 className="mb-2 font-semibold">Hospital Information</h3>
                        <div className="space-y-1 text-sm">
                          <p>
                            <span className="font-medium">Country:</span> {hospitalDetail.country}
                          </p>
                          {hospitalDetail.location && (
                            <p>
                              <span className="font-medium">Location:</span>{' '}
                              {hospitalDetail.location}
                            </p>
                          )}
                          {hospitalDetail.contactEmail && (
                            <p>
                              <span className="font-medium">Email:</span>{' '}
                              {hospitalDetail.contactEmail}
                            </p>
                          )}
                          {hospitalDetail.fhirEndpoint && (
                            <p>
                              <span className="font-medium">FHIR Endpoint:</span>{' '}
                              {hospitalDetail.fhirEndpoint}
                            </p>
                          )}
                          <p>
                            <span className="font-medium">Registered:</span>{' '}
                            {new Date(hospitalDetail.registeredAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {hospitalDetail.verificationDocuments ? (
                        <div>
                          <h3 className="mb-2 font-semibold">Verification Documents</h3>
                          <div className="space-y-2 text-sm">
                            {hospitalDetail.verificationDocuments.licenseNumber ? (
                              <div>
                                <span className="font-medium">License Number:</span>{' '}
                                {hospitalDetail.verificationDocuments.licenseNumber}
                              </div>
                            ) : (
                              <div className="text-muted-foreground">
                                No license number provided
                              </div>
                            )}
                            {hospitalDetail.verificationDocuments.registrationCertificate ? (
                              <div>
                                <span className="font-medium">Registration Certificate:</span>
                                {renderCertificate(
                                  hospitalDetail.verificationDocuments.registrationCertificate
                                )}
                              </div>
                            ) : (
                              <div className="text-muted-foreground">
                                No registration certificate provided
                              </div>
                            )}
                            {hospitalDetail.verificationDocuments.rejectionReason && (
                              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                <span className="font-medium text-red-900">Rejection Reason:</span>
                                <p className="mt-1 text-red-800">
                                  {hospitalDetail.verificationDocuments.rejectionReason}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <h3 className="mb-2 font-semibold">Verification Documents</h3>
                          <div className="text-sm text-muted-foreground">
                            No verification documents submitted yet.
                          </div>
                        </div>
                      )}

                      {/* Approve/Reject Actions - Only show for pending hospitals */}
                      {hospitalDetail.verificationStatus === 'pending' && (
                        <div className="space-y-4 border-t pt-4">
                          {/* Approve Section */}
                          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                            <h3 className="mb-3 font-semibold text-green-900">
                              Approve Verification
                            </h3>
                            <div className="space-y-3">
                              <div>
                                <label className="mb-2 block text-sm font-medium text-green-900">
                                  Approval Message (Optional)
                                </label>
                                <textarea
                                  value={approvalMessage}
                                  onChange={(e) => setApprovalMessage(e.target.value)}
                                  placeholder="Optional message to include with approval..."
                                  className="w-full rounded-lg border border-green-300 bg-white px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200"
                                  rows={3}
                                />
                                <p className="mt-1 text-xs text-green-700">
                                  This message can be used for internal notes or notifications.
                                </p>
                              </div>
                              <Button
                                onClick={handleApprove}
                                disabled={approveMutation.isPending}
                                className="w-full bg-green-600 hover:bg-green-700"
                              >
                                {approveMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Approving...
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Approve Hospital
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {/* Reject Section */}
                          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                            <h3 className="mb-3 font-semibold text-red-900">Reject Verification</h3>
                            <div className="space-y-3">
                              <div>
                                <label className="mb-2 block text-sm font-medium text-red-900">
                                  Rejection Reason <span className="text-red-600">*</span>
                                </label>
                                <textarea
                                  value={rejectReason}
                                  onChange={(e) => setRejectReason(e.target.value)}
                                  placeholder="Enter the reason for rejection..."
                                  className="w-full rounded-lg border border-red-300 bg-white px-3 py-2 text-sm focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-200"
                                  rows={4}
                                  required
                                />
                                <p className="mt-1 text-xs text-red-700">
                                  This reason will be visible to the hospital.
                                </p>
                              </div>
                              <Button
                                onClick={handleReject}
                                disabled={!rejectReason.trim() || rejectMutation.isPending}
                                variant="destructive"
                                className="w-full"
                              >
                                {rejectMutation.isPending ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Rejecting...
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="mr-2 h-4 w-4" />
                                    Reject Hospital
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end gap-2 border-t pt-4">
                        <Button variant="outline" onClick={() => setSelectedHospitalId(null)}>
                          Close
                        </Button>
                      </div>
                    </>
                  ) : null}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminHospitalsPage() {
  return (
    <AdminProtectedRoute>
      <AdminHospitalsPageContent />
    </AdminProtectedRoute>
  );
}

