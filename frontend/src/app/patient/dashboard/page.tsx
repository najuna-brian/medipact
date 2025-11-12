'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { DollarSign, Activity, FileText, Settings, Building2, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePatientSummary, usePatientHospitals } from '@/hooks/usePatientIdentity';
import { usePatientSession } from '@/hooks/usePatientSession';
import { PatientProtectedRoute } from '@/components/PatientProtectedRoute/PatientProtectedRoute';
import { HederaAccountId } from '@/components/HederaAccountId/HederaAccountId';
import { PatientSidebar } from '@/components/Sidebar/PatientSidebar';

function PatientDashboardContent() {
  const { upi } = usePatientSession();
  const { data: summary, isLoading: summaryLoading } = usePatientSummary(upi);
  const { data: hospitalsData } = usePatientHospitals(upi);

  // Get Hedera Account ID from patient data (if available)
  // Note: This might come from a separate patient info endpoint
  // const hederaAccountId = summary?.hederaAccountId;

  const connectedHospitals = hospitalsData?.hospitals || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <PatientSidebar />
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-4 md:py-8">
          <div className="mb-6 md:mb-8">
            <h1 className="mb-2 text-2xl font-bold md:text-3xl">Patient Dashboard</h1>
            <p className="text-sm text-muted-foreground md:text-base">
              Manage your health data and earnings
            </p>
          </div>

          {/* Current UPI Display */}
          {upi && (
            <Card className="mb-6">
              <CardContent className="space-y-4 pt-6">
                <div>
                  <p className="text-sm text-muted-foreground">Your Patient Identity (UPI)</p>
                  <p className="font-mono font-semibold">{upi}</p>
                </div>
                {summary?.hederaAccountId && (
                  <div>
                    <HederaAccountId accountId={summary.hederaAccountId} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {upi && (
            <>
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0 HBAR</div>
                    <p className="text-xs text-muted-foreground">$0.00 USD</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Records Shared</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    {summaryLoading ? (
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <div className="text-2xl font-bold">{summary?.totalRecords || 0}</div>
                        <p className="text-xs text-muted-foreground">Medical records</p>
                      </>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Connected Hospitals</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{connectedHospitals.length}</div>
                    <p className="text-xs text-muted-foreground">Hospitals linked</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Link href="/patient/wallet">
                      <Button variant="outline" className="w-full justify-start">
                        <FileText className="mr-2 h-4 w-4" />
                        View Health Wallet
                      </Button>
                    </Link>
                    <Link href="/patient/connect">
                      <Button variant="outline" className="w-full justify-start">
                        <Building2 className="mr-2 h-4 w-4" />
                        Connect Hospitals
                      </Button>
                    </Link>
                    <Link href="/patient/earnings">
                      <Button variant="outline" className="w-full justify-start">
                        <DollarSign className="mr-2 h-4 w-4" />
                        View Earnings
                      </Button>
                    </Link>
                    <Link href="/patient/studies">
                      <Button variant="outline" className="w-full justify-start">
                        <Activity className="mr-2 h-4 w-4" />
                        Browse Studies
                      </Button>
                    </Link>
                    <Link href="/patient/marketplace">
                      <Button variant="outline" className="w-full justify-start">
                        <Settings className="mr-2 h-4 w-4" />
                        Marketplace Settings
                      </Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {summaryLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : summary && summary.totalRecords > 0 ? (
                      <div className="space-y-2">
                        <p className="text-sm font-semibold">Medical History Summary</p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p>Total Records: {summary.totalRecords}</p>
                          <p>Hospitals: {summary.hospitalCount}</p>
                          {summary.dateRange && (
                            <p>
                              Date Range: {new Date(summary.dateRange.start).toLocaleDateString()} -{' '}
                              {new Date(summary.dateRange.end).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No recent activity</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PatientDashboardPage() {
  return (
    <PatientProtectedRoute>
      <PatientDashboardContent />
    </PatientProtectedRoute>
  );
}
