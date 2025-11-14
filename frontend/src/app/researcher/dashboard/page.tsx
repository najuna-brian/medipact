'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Database, DollarSign, FileDown, TrendingUp, Shield, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { VerificationPrompt } from '@/components/VerificationPrompt/VerificationPrompt';
import { useResearcher, useResearcherStatus } from '@/hooks/useResearcher';
import { HederaAccountId } from '@/components/HederaAccountId/HederaAccountId';
import { ResearcherSidebar } from '@/components/Sidebar/ResearcherSidebar';

export default function ResearcherDashboardPage() {
  const router = useRouter();
  const [researcherId, setResearcherId] = useState<string | null>(null);

  useEffect(() => {
    // Get researcher ID from sessionStorage
    const id = sessionStorage.getItem('researcherId');
    if (id) {
      setResearcherId(id);
    } else {
      // Redirect to registration if no ID
      router.push('/researcher/register');
    }
  }, [router]);

  const researcher = useResearcher(researcherId);
  const researcherStatus = useResearcherStatus(researcherId);

  if (!researcherId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ResearcherSidebar />
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 md:mb-8">
            <h1 className="mb-2 text-2xl font-bold md:text-3xl">
              {researcher.data?.organizationName ? (
                <>
                  {researcher.data.organizationName}
                  <span className="ml-2 text-lg font-normal text-muted-foreground">
                    Dashboard
                  </span>
                </>
              ) : (
                'Researcher Dashboard'
              )}
            </h1>
            <p className="text-sm text-muted-foreground md:text-base">
              {researcher.data?.contactName
                ? `Welcome, ${researcher.data.contactName}. Browse datasets and manage research projects.`
                : 'Browse datasets and manage research projects'}
            </p>
          </div>

          {/* Verification Prompt - Always shown if not verified */}
          {researcherStatus.data && researcherStatus.data.verificationPrompt && (
            <div className="mb-6">
              <VerificationPrompt
                researcherId={researcherId}
                verificationStatus={
                  researcherStatus.data.verificationStatus as 'pending' | 'verified' | 'rejected'
                }
                message={researcherStatus.data.verificationMessage || undefined}
              />
            </div>
          )}

          {/* Researcher Info Card */}
          {researcher.data && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground">Researcher ID</p>
                    <p className="font-mono font-semibold">{researcher.data.researcherId}</p>
                  </div>
                  {researcher.data.hederaAccountId && (
                    <div>
                      <p className="text-sm text-muted-foreground">Hedera Account</p>
                      <HederaAccountId accountId={researcher.data.hederaAccountId} />
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{researcher.data.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Organization</p>
                    <p className="font-medium">{researcher.data.organizationName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verification Status</p>
                    <p className="font-medium">
                      {researcher.data?.verificationStatus ? (
                        <span
                          className={`inline-flex items-center gap-1 rounded px-2 py-1 text-sm ${
                            researcher.data.verificationStatus === 'verified'
                              ? 'bg-green-100 text-green-800'
                              : researcher.data.verificationStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {researcher.data.verificationStatus === 'verified' && (
                            <Shield className="h-3 w-3" />
                          )}
                          {researcher.data.verificationStatus === 'pending' && (
                            <AlertCircle className="h-3 w-3" />
                          )}
                          {researcher.data.verificationStatus.charAt(0).toUpperCase() +
                            researcher.data.verificationStatus.slice(1)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-gray-100 px-2 py-1 text-sm text-gray-800">
                          Loading...
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Datasets Purchased</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Total datasets</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0 HBAR</div>
                <p className="text-xs text-muted-foreground">Research budget</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Research projects</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Downloads</CardTitle>
                <FileDown className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Data downloads</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/researcher/catalog">
                  <Button variant="outline" className="w-full justify-start">
                    <Database className="mr-2 h-4 w-4" />
                    Browse Catalog
                  </Button>
                </Link>
                <Link href="/researcher/projects">
                  <Button variant="outline" className="w-full justify-start">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    My Projects
                  </Button>
                </Link>
                <Link href="/researcher/purchases">
                  <Button variant="outline" className="w-full justify-start">
                    <FileDown className="mr-2 h-4 w-4" />
                    Purchase History
                  </Button>
                </Link>
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
    </div>
  );
}
