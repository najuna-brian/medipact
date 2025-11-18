'use client';

import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Upload,
  Users,
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useHospitalSession } from '@/hooks/useHospitalSession';
import {
  useVerificationStatus,
  useHospitalPatients,
  useHospital,
  useHospitalConsentStats,
} from '@/hooks/usePatientIdentity';
import { useRouter } from 'next/navigation';
import { HederaAccountId } from '@/components/HederaAccountId/HederaAccountId';
import { HospitalSidebar } from '@/components/Sidebar/HospitalSidebar';

export default function HospitalDashboardPage() {
  const router = useRouter();
  const { hospitalId, apiKey, isAuthenticated, isLoading } = useHospitalSession();
  const {
    data: verificationStatus,
    isLoading: statusLoading,
    refetch: refetchVerification,
  } = useVerificationStatus(hospitalId, apiKey);
  const { data: patientsData, isLoading: patientsLoading } = useHospitalPatients(
    hospitalId,
    apiKey
  );
  const { data: hospitalData } = useHospital(hospitalId, apiKey);
  const { data: consentStats, isLoading: consentStatsLoading } = useHospitalConsentStats(
    hospitalId,
    apiKey
  );

  // Listen for hospital verification updates from admin
  useEffect(() => {
    const handleVerificationUpdate = () => {
      // Refetch verification status when admin approves/rejects
      if (hospitalId) {
        refetchVerification();
      }
    };

    window.addEventListener('hospital-verified', handleVerificationUpdate);
    // No polling interval - users can manually refresh or rely on event-driven updates

    return () => {
      window.removeEventListener('hospital-verified', handleVerificationUpdate);
    };
  }, [hospitalId, apiKey, refetchVerification]);

  // Show loading state while checking session
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Redirect if not authenticated (only after loading is complete)
  if (!isAuthenticated) {
    router.push('/hospital/login');
    return null;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <HospitalSidebar />
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="mb-2 text-2xl font-bold md:text-3xl">
                  {hospitalData?.name ? (
                    <>
                      {hospitalData.name}
                      <span className="ml-2 text-lg font-normal text-muted-foreground">
                        Dashboard
                      </span>
                    </>
                  ) : (
                    'Hospital Dashboard'
                  )}
                </h1>
                <p className="text-muted-foreground">Manage patient data and revenue</p>
              </div>
              {hospitalId && (
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Hospital ID</p>
                  <p className="font-mono text-xs font-semibold">{hospitalId}</p>
                </div>
              )}
            </div>
            {hospitalData?.hederaAccountId && (
              <div className="mt-4">
                <HederaAccountId accountId={hospitalData.hederaAccountId} />
              </div>
            )}
          </div>

          {/* Verification Status Alert */}
          {!statusLoading &&
            (!verificationStatus || verificationStatus.verificationStatus !== 'verified') && (
              <Card className="mb-6 border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="mt-0.5 h-5 w-5 text-yellow-600" />
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <p className="font-semibold text-yellow-900">Verification Required</p>
                        <Badge variant="warning">
                          {!verificationStatus
                            ? 'Unknown'
                            : verificationStatus.verificationStatus === 'pending'
                              ? 'Pending'
                              : 'Not Verified'}
                        </Badge>
                      </div>
                      <p className="mb-2 text-sm text-yellow-800">
                        {!verificationStatus
                          ? 'Unable to fetch verification status. Please check your credentials or try again later.'
                          : verificationStatus.verificationStatus === 'pending'
                            ? "Your verification documents are under review. Verification typically takes 24-48 hours during business days. You'll receive an email notification when your status changes."
                            : 'Your hospital account needs to be verified before you can register patients. Complete verification to access all features.'}
                      </p>
                      <div className="flex gap-2">
                        {verificationStatus?.verificationStatus === 'pending' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => refetchVerification()}
                              disabled={statusLoading}
                            >
                              {statusLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Checking...
                                </>
                              ) : (
                                'Check Status'
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push('/hospital/verification')}
                            >
                              View Details
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push('/hospital/verification')}
                          >
                            Complete Verification
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

          {verificationStatus && verificationStatus.verificationStatus === 'verified' && (
            <Card className="mb-6 border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <p className="font-semibold text-green-900">Account Verified</p>
                      <Badge variant="success">Verified</Badge>
                    </div>
                    <p className="text-sm text-green-800">
                      Your hospital account is verified. You can now register patients and use all
                      features.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Patients Enrolled</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {patientsLoading ? '...' : patientsData?.totalPatients || 0}
                </div>
                <p className="text-xs text-muted-foreground">Total patients</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Records Processed</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {consentStatsLoading ? '...' : consentStats?.totalRecords || 0}
                </div>
                <p className="text-xs text-muted-foreground">Medical records</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">-</div>
                <p className="text-xs text-muted-foreground">
                  <Link href="/hospital/revenue" className="text-primary hover:underline">
                    View Revenue
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-start"
                  size="lg"
                  onClick={() => router.push('/hospital/upload')}
                >
                  <Upload className="mr-2 h-5 w-5" />
                  Upload Data
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Patients</CardTitle>
              </CardHeader>
              <CardContent>
                {patientsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                  </div>
                ) : patientsData && patientsData.patients.length > 0 ? (
                  <div className="space-y-2">
                    {patientsData.patients.slice(0, 5).map((patient) => {
                      const totalRecords = (patient.encounterCount || 0) + 
                                          (patient.conditionCount || 0) + 
                                          (patient.observationCount || 0);
                      return (
                        <div
                          key={patient.upi}
                          className="flex items-center justify-between rounded-lg border p-2"
                        >
                          <div className="flex-1">
                            <p className="text-sm font-medium">{patient.hospitalPatientId}</p>
                            <p className="font-mono text-xs text-muted-foreground">{patient.upi}</p>
                            {totalRecords > 0 && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {totalRecords} record{totalRecords !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={patient.verified ? 'success' : 'warning'}>
                              {patient.verified ? 'Verified' : 'Pending'}
                            </Badge>
                            {patient.source === 'csv_upload' && (
                              <Badge variant="info" className="text-xs">
                                CSV
                              </Badge>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    {patientsData.patients.length > 5 && (
                      <p className="pt-2 text-center text-xs text-muted-foreground">
                        +{patientsData.patients.length - 5} more patients
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No patients registered yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
