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
import { useVerificationStatus } from '@/hooks/usePatientIdentity';
import { useRouter } from 'next/navigation';

export default function HospitalDashboardPage() {
  const router = useRouter();
  const { hospitalId, apiKey, isAuthenticated, isLoading } = useHospitalSession();
  const {
    data: verificationStatus,
    isLoading: statusLoading,
    refetch: refetchVerification,
  } = useVerificationStatus(hospitalId, apiKey);

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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Hospital Dashboard</h1>
          <p className="text-muted-foreground">Manage patient data and revenue</p>
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
                        {!verificationStatus || verificationStatus.verificationStatus === 'pending'
                          ? 'Pending'
                          : 'Not Verified'}
                      </Badge>
                    </div>
                    <p className="mb-3 text-sm text-yellow-800">
                      Your hospital account needs to be verified before you can register patients.
                      Complete verification to access all features.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push('/hospital/verification')}
                    >
                      Complete Verification
                    </Button>
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

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patients Enrolled</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Total patients</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Records Processed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Medical records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hospital Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 HBAR</div>
              <p className="text-xs text-muted-foreground">25% of total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Uploads</CardTitle>
              <Upload className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Files to process</p>
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
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/hospital/upload')}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Data
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/hospital/consent')}
              >
                <Users className="mr-2 h-4 w-4" />
                Manage Consent
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={
                  !verificationStatus || verificationStatus.verificationStatus !== 'verified'
                }
                onClick={() => router.push('/hospital/patients/register')}
              >
                <Users className="mr-2 h-4 w-4" />
                Register Patient
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                disabled={
                  !verificationStatus || verificationStatus.verificationStatus !== 'verified'
                }
                onClick={() => router.push('/hospital/patients/bulk')}
              >
                <Upload className="mr-2 h-4 w-4" />
                Bulk Upload
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => router.push('/hospital/revenue')}
              >
                <DollarSign className="mr-2 h-4 w-4" />
                View Revenue
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">No recent activity</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
