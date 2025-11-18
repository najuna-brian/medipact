'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Database,
  DollarSign,
  FileDown,
  TrendingUp,
  Shield,
  AlertCircle,
  Wallet,
  Coins,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { VerificationPrompt } from '@/components/VerificationPrompt/VerificationPrompt';
import { useResearcher, useResearcherStatus } from '@/hooks/useResearcher';
import { HederaAccountId } from '@/components/HederaAccountId/HederaAccountId';
import { ResearcherSidebar } from '@/components/Sidebar/ResearcherSidebar';
import { getResearcherBalance } from '@/lib/api/wallet';
import type { WalletBalance } from '@/lib/api/wallet';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ResearcherDashboardPage() {
  const router = useRouter();
  const [researcherId, setResearcherId] = useState<string | null>(null);
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [walletLoading, setWalletLoading] = useState(false);

  useEffect(() => {
    // Get researcher ID from sessionStorage
    const id = sessionStorage.getItem('researcherId');
    if (id) {
      setResearcherId(id);
      fetchWalletBalance(id);
    } else {
      // Redirect to registration if no ID
      router.push('/researcher/register');
    }
  }, [router]);

  const fetchWalletBalance = async (id: string) => {
    try {
      setWalletLoading(true);
      const balance = await getResearcherBalance(id);
      setWalletBalance(balance);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      // Don't show error, just leave balance as null
    } finally {
      setWalletLoading(false);
    }
  };

  const openFaucet = () => {
    if (walletBalance?.hederaAccountId) {
      const faucetUrl = `https://portal.hedera.com/faucet?account=${walletBalance.hederaAccountId}`;
      window.open(faucetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const researcher = useResearcher(researcherId);
  const researcherStatus = useResearcherStatus(researcherId);

  // Listen for researcher verification updates from admin (event-driven, instant updates)
  useEffect(() => {
    const handleVerificationUpdate = () => {
      // Refetch verification status when admin approves/rejects (instant update)
      if (researcherId) {
        researcherStatus.refetch();
      }
    };

    window.addEventListener('researcher-verified', handleVerificationUpdate);

    return () => {
      window.removeEventListener('researcher-verified', handleVerificationUpdate);
      // No polling interval - users can manually refresh or rely on event-driven updates
    };
  }, [researcherId, researcherStatus]);

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
                  <span className="ml-2 text-lg font-normal text-muted-foreground">Dashboard</span>
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
                message={
                  researcherStatus.data.verificationStatus === 'pending'
                    ? "Your verification documents are under review. Verification typically takes 24-48 hours during business days. You'll receive an email notification when your status changes."
                    : researcherStatus.data.verificationMessage || undefined
                }
                onRefresh={() => researcherStatus.refetch()}
                isLoading={researcherStatus.isLoading}
              />
            </div>
          )}

          {/* Wallet Balance Card - Prominent Display */}
          {walletBalance && (
            <Card className="mb-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5 text-blue-600" />
                    Wallet Balance
                  </CardTitle>
                  <Link href="/researcher/wallet">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Balance (USD)</p>
                    <p className="text-3xl font-bold text-gray-900">
                      ${walletBalance.balanceUSD.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Balance (HBAR)</p>
                    <p className="text-2xl font-semibold text-gray-700">
                      {walletBalance.balanceHBAR.toFixed(4)} HBAR
                    </p>
                  </div>
                  {(process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet') === 'testnet' &&
                    walletBalance.hederaAccountId && (
                      <div className="flex items-end">
                        <Button onClick={openFaucet} variant="outline" className="w-full">
                          <Coins className="mr-2 h-4 w-4" />
                          Get Test HBAR
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                </div>
                {walletBalance.balanceHBAR < 10 &&
                  (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet') === 'testnet' && (
                    <Alert className="mt-4 border-yellow-200 bg-yellow-50">
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      <AlertDescription className="text-yellow-800">
                        Low balance. Get free testnet HBAR to continue testing purchases.
                      </AlertDescription>
                    </Alert>
                  )}
              </CardContent>
            </Card>
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
