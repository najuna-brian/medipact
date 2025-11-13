'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  UserCog,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Loader2,
  AlertCircle,
  FileText,
  ExternalLink,
  Mail,
  Building,
} from 'lucide-react';
import {
  useAdminResearchers,
  useApproveResearcher,
  useRejectResearcher,
  useAdminResearcherDetail,
} from '@/hooks/useAdminResearchers';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute/AdminProtectedRoute';
import { AdminSidebar } from '@/components/Sidebar/AdminSidebar';

function AdminResearchersPageContent() {
  const [selectedResearcherId, setSelectedResearcherId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [researcherToReject, setResearcherToReject] = useState<string | null>(null);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [researcherToApprove, setResearcherToApprove] = useState<string | null>(null);
  const [approvalMessage, setApprovalMessage] = useState(
    'Your researcher verification has been approved. You can now purchase datasets and access the marketplace.'
  );

  const { data, isLoading, error } = useAdminResearchers();
  const { data: researcherDetail } = useAdminResearcherDetail(selectedResearcherId);
  const approveMutation = useApproveResearcher();
  const rejectMutation = useRejectResearcher();

  const researchers = data?.researchers || [];

  // Group researchers by verification status
  const pendingResearchers = researchers.filter(
    (r) => r.verificationStatus === 'pending' && r.verificationDocuments
  );
  const verifiedResearchers = researchers.filter((r) => r.verificationStatus === 'verified');
  const rejectedResearchers = researchers.filter((r) => r.verificationStatus === 'rejected');

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

  const openApproveDialog = (researcherId: string) => {
    setResearcherToApprove(researcherId);
    setApprovalMessage(
      'Your researcher verification has been approved. You can now purchase datasets and access the marketplace.'
    );
    setShowApproveDialog(true);
  };

  const handleApprove = async () => {
    if (!researcherToApprove) return;

    try {
      await approveMutation.mutateAsync({ researcherId: researcherToApprove });
      setShowApproveDialog(false);
      setResearcherToApprove(null);

      setTimeout(() => {
        window.dispatchEvent(new Event('researcher-verified'));
      }, 500);
    } catch (err) {
      console.error('Failed to approve researcher:', err);
    }
  };

  const handleReject = async () => {
    if (!researcherToReject || !rejectReason.trim()) {
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        researcherId: researcherToReject,
        reason: rejectReason.trim(),
      });
      setShowRejectDialog(false);
      setResearcherToReject(null);
      setRejectReason('');
    } catch (err) {
      console.error('Failed to reject researcher:', err);
    }
  };

  const openRejectDialog = (researcherId: string) => {
    setResearcherToReject(researcherId);
    setShowRejectDialog(true);
  };

  const viewDocuments = (researcherId: string) => {
    setSelectedResearcherId(researcherId);
  };

  const isBase64 = (str: string) => {
    try {
      return btoa(atob(str)) === str;
    } catch {
      return false;
    }
  };

  const renderDocument = (document: string | undefined) => {
    if (!document) return null;

    // Check if it's a URL
    if (document.startsWith('http://') || document.startsWith('https://')) {
      return (
        <a
          href={document}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-blue-600 hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          View Document URL
        </a>
      );
    }

    // Check if it's base64
    if (isBase64(document)) {
      const isPDF = document.length > 100;
      const dataUrl = isPDF
        ? `data:application/pdf;base64,${document}`
        : `data:image/png;base64,${document}`;

      return (
        <div className="mt-2">
          <a
            href={dataUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            <FileText className="h-4 w-4" />
            View Document
          </a>
        </div>
      );
    }

    return <p className="text-sm text-muted-foreground">{document}</p>;
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
                  <p className="font-semibold text-red-900">Error Loading Researchers</p>
                  <p className="text-sm text-red-800">
                    {error instanceof Error ? error.message : 'Failed to load researchers'}
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
              Researcher Verification Management
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Review and approve researcher verification requests
            </p>
          </div>

          {/* Statistics */}
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Verification</p>
                    <p className="text-xl font-bold md:text-2xl">{pendingResearchers.length}</p>
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
                    <p className="text-xl font-bold md:text-2xl">{verifiedResearchers.length}</p>
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
                    <p className="text-xl font-bold md:text-2xl">{rejectedResearchers.length}</p>
                  </div>
                  <XCircle className="h-8 w-8 text-red-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pending Verifications */}
          {pendingResearchers.length > 0 && (
            <div className="mb-8">
              <h2 className="mb-4 text-lg font-semibold md:text-xl">Pending Verifications</h2>
              <div className="space-y-4">
                {pendingResearchers.map((researcher) => (
                  <Card key={researcher.researcherId} className="border-yellow-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="mb-2 flex items-center gap-2">
                            <UserCog className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>{researcher.organizationName}</CardTitle>
                            {getStatusBadge(researcher.verificationStatus)}
                          </div>
                          <CardDescription>
                            {researcher.researcherId} • {researcher.email}
                            {researcher.country && ` • ${researcher.country}`}
                          </CardDescription>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewDocuments(researcher.researcherId)}
                            className="text-xs md:text-sm"
                          >
                            <Eye className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                            <span className="hidden sm:inline">View Documents</span>
                            <span className="sm:hidden">View</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openApproveDialog(researcher.researcherId)}
                            disabled={approveMutation.isPending}
                            className="border-green-200 text-xs text-green-700 hover:bg-green-50 md:text-sm"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openRejectDialog(researcher.researcherId)}
                            disabled={rejectMutation.isPending}
                            className="border-red-200 text-xs text-red-700 hover:bg-red-50 md:text-sm"
                          >
                            <XCircle className="mr-1 h-3 w-3 md:mr-2 md:h-4 md:w-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* All Researchers */}
          <div>
            <h2 className="mb-4 text-lg font-semibold md:text-xl">All Researchers</h2>
            <div className="space-y-4">
              {researchers.map((researcher) => (
                <Card
                  key={researcher.researcherId}
                  className={
                    researcher.verificationStatus === 'verified'
                      ? 'border-green-200'
                      : researcher.verificationStatus === 'rejected'
                        ? 'border-red-200'
                        : ''
                  }
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <UserCog className="h-5 w-5 text-muted-foreground" />
                          <CardTitle>{researcher.organizationName}</CardTitle>
                          {getStatusBadge(researcher.verificationStatus)}
                        </div>
                        <CardDescription>
                          {researcher.researcherId} • {researcher.email}
                          {researcher.country && ` • ${researcher.country}`}
                          {researcher.contactName && ` • ${researcher.contactName}`}
                        </CardDescription>
                        {researcher.verifiedAt && (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Verified on: {new Date(researcher.verifiedAt).toLocaleDateString()}
                            {researcher.verifiedBy && ` by ${researcher.verifiedBy}`}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => viewDocuments(researcher.researcherId)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        {researcher.verificationStatus === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openApproveDialog(researcher.researcherId)}
                              disabled={approveMutation.isPending}
                              className="border-green-200 text-green-700 hover:bg-green-50"
                            >
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Approve
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openRejectDialog(researcher.researcherId)}
                              disabled={rejectMutation.isPending}
                              className="border-red-200 text-red-700 hover:bg-red-50"
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>

          {/* Researcher Detail Modal/Dialog */}
          {selectedResearcherId && researcherDetail && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle>{researcherDetail.organizationName}</CardTitle>
                      <CardDescription>{researcherDetail.researcherId}</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setSelectedResearcherId(null)}>
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="mb-2 font-semibold">Researcher Information</h3>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="font-medium">Email:</span> {researcherDetail.email}
                      </p>
                      {researcherDetail.contactName && (
                        <p>
                          <span className="font-medium">Contact Name:</span>{' '}
                          {researcherDetail.contactName}
                        </p>
                      )}
                      {researcherDetail.country && (
                        <p>
                          <span className="font-medium">Country:</span> {researcherDetail.country}
                        </p>
                      )}
                      {researcherDetail.hederaAccountId && (
                        <p>
                          <span className="font-medium">Hedera Account:</span>{' '}
                          {researcherDetail.hederaAccountId}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">Access Level:</span>{' '}
                        {researcherDetail.accessLevel || 'basic'}
                      </p>
                      <p>
                        <span className="font-medium">Registered:</span>{' '}
                        {new Date(researcherDetail.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {researcherDetail.verificationDocuments ? (
                    <div>
                      <h3 className="mb-2 font-semibold">Verification Documents</h3>
                      <div className="space-y-2 text-sm">
                        {typeof researcherDetail.verificationDocuments === 'object' ? (
                          Object.entries(researcherDetail.verificationDocuments).map(
                            ([key, value]) => (
                              <div key={key}>
                                <span className="font-medium">{key}:</span>
                                {renderDocument(String(value))}
                              </div>
                            )
                          )
                        ) : (
                          <div>
                            {renderDocument(String(researcherDetail.verificationDocuments))}
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

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setSelectedResearcherId(null)}>
                      Close
                    </Button>
                    {researcherDetail.verificationStatus === 'pending' && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => openApproveDialog(researcherDetail.researcherId)}
                          disabled={approveMutation.isPending}
                          className="border-green-200 text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => openRejectDialog(researcherDetail.researcherId)}
                          disabled={rejectMutation.isPending}
                          className="border-red-200 text-red-700 hover:bg-red-50"
                        >
                          <XCircle className="mr-2 h-4 w-4" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Approve Dialog */}
          <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Approve Researcher Verification</AlertDialogTitle>
                <AlertDialogDescription>
                  Confirm approval of this researcher&apos;s verification. The researcher will be
                  notified and will be able to purchase datasets and access the marketplace.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">
                    Approval Message (Optional)
                  </label>
                  <textarea
                    value={approvalMessage}
                    onChange={(e) => setApprovalMessage(e.target.value)}
                    placeholder="Optional message to include with approval..."
                    className="w-full rounded-lg border px-3 py-2"
                    rows={3}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    This message can be used for internal notes or notifications.
                  </p>
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel
                  onClick={() =>
                    setApprovalMessage(
                      'Your researcher verification has been approved. You can now purchase datasets and access the marketplace.'
                    )
                  }
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleApprove}
                  disabled={approveMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {approveMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Approving...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm Approval
                    </>
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {/* Reject Dialog */}
          <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Researcher Verification</AlertDialogTitle>
                <AlertDialogDescription>
                  Please provide a reason for rejecting this researcher&apos;s verification request.
                  This reason will be visible to the researcher.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Rejection Reason *</label>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Enter the reason for rejection..."
                    className="w-full rounded-lg border px-3 py-2"
                    rows={4}
                    required
                  />
                </div>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel onClick={() => setRejectReason('')}>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleReject}
                  disabled={!rejectReason.trim() || rejectMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {rejectMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Rejecting...
                    </>
                  ) : (
                    'Reject'
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}

export default function AdminResearchersPage() {
  return (
    <AdminProtectedRoute>
      <AdminResearchersPageContent />
    </AdminProtectedRoute>
  );
}

