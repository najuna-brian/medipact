'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import HashScanLink from '@/components/HashScanLink/HashScanLink';
import { Label } from '@/components/ui/label';
import {
  Wallet,
  DollarSign,
  Copy,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Coins,
} from 'lucide-react';
import { HederaAccountId } from '@/components/HederaAccountId/HederaAccountId';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getResearcherBalance } from '@/lib/api/wallet';
import type { WalletBalance } from '@/lib/api/wallet';
import { getResearcherPurchases } from '@/lib/api/marketplace';
import { ResearcherSidebar } from '@/components/Sidebar/ResearcherSidebar';

const API_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  `http://localhost:${process.env.NEXT_PUBLIC_BACKEND_PORT || 8080}`;

export default function ResearcherWalletPage() {
  const [researcherId, setResearcherId] = useState<string | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get researcher ID from sessionStorage
    const id = sessionStorage.getItem('researcherId');
    if (id) {
      setResearcherId(id);
      fetchBalance(id);
    } else {
      setError('Researcher ID not found. Please log in.');
      setLoading(false);
    }
  }, []);

  const fetchBalance = async (id: string) => {
    try {
      setRefreshing(true);
      const [balanceData, purchasesData] = await Promise.all([
        getResearcherBalance(id),
        getResearcherPurchases(id, 10).catch(() => ({ purchases: [], count: 0 }))
      ]);
      setBalance(balanceData);
      setPurchases(purchasesData.purchases || []);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching balance:', error);
      setError('Failed to load wallet balance');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const getHashScanLink = (accountId: string) => {
    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
    const networkPath = network === 'mainnet' ? '' : `${network}.`;
    return `https://hashscan.io/${networkPath}account/${accountId}`;
  };

  const openFaucet = () => {
    if (balance?.hederaAccountId) {
      // Open Hedera faucet in new tab with account ID pre-filled
      const faucetUrl = `https://portal.hedera.com/faucet?account=${balance.hederaAccountId}`;
      window.open(faucetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error && !balance) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ResearcherSidebar />
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Wallet</h1>
            <p className="text-muted-foreground">
              View your Hedera wallet balance and account details
            </p>
          </div>

          {error && (
            <Alert className="mb-6 border-red-200 bg-red-50">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Low Balance Warning */}
          {balance &&
            balance.balanceHBAR < 10 &&
            (process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet') === 'testnet' &&
            balance?.hederaAccountId && (
              <Alert className="mb-6 border-yellow-200 bg-yellow-50">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <div className="flex items-center justify-between">
                    <span>
                      Low balance detected. Get free testnet HBAR from the faucet to continue
                      testing.
                    </span>
                    <Button size="sm" onClick={openFaucet} className="ml-4">
                      <Coins className="mr-2 h-4 w-4" />
                      Get Test HBAR
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Balance Card */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Wallet Balance
                      </CardTitle>
                      <CardDescription>Your Hedera account balance</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => researcherId && fetchBalance(researcherId)}
                      disabled={refreshing}
                    >
                      <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* USD Balance (Primary) */}
                  <div>
                    <Label className="text-sm text-muted-foreground">Balance (USD)</Label>
                    <div className="text-4xl font-bold text-gray-900">
                      ${balance?.balanceUSD.toFixed(2) || '0.00'}
                    </div>
                  </div>

                  {/* HBAR Balance (Secondary) */}
                  <div>
                    <Label className="text-sm text-muted-foreground">Balance (HBAR)</Label>
                    <div className="text-2xl font-semibold text-gray-700">
                      {balance?.balanceHBAR.toFixed(4) || '0.0000'} HBAR
                    </div>
                  </div>

                  {/* Get Test HBAR Button (Testnet only) */}
                  {(process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet') === 'testnet' &&
                    balance?.hederaAccountId && (
                      <div className="mt-4">
                        <Button onClick={openFaucet} variant="outline" className="w-full">
                          <Coins className="mr-2 h-4 w-4" />
                          Get Free Test HBAR from Faucet
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                        <p className="mt-2 text-center text-xs text-muted-foreground">
                          Opens Hedera Portal Faucet. Request up to 10,000 HBAR per request.
                        </p>
                      </div>
                    )}

                  {/* Hedera Account Details */}
                  {balance?.hederaAccountId && (
                    <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <Label className="mb-2 block text-sm font-semibold text-gray-900">
                        Hedera Account Details
                      </Label>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Account ID:</span>
                          <div className="flex items-center gap-2">
                            <HederaAccountId accountId={balance.hederaAccountId} />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleCopy(balance.hederaAccountId!, 'account')}
                              className="h-6 w-6 p-0"
                            >
                              {copied === 'account' ? (
                                <CheckCircle2 className="h-4 w-4 text-green-600" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <a
                              href={getHashScanLink(balance.hederaAccountId)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </div>
                        </div>
                        {balance.evmAddress && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">EVM Address:</span>
                            <div className="flex items-center gap-2">
                              <code className="font-mono text-sm">{balance.evmAddress}</code>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCopy(balance.evmAddress!, 'evm')}
                                className="h-6 w-6 p-0"
                              >
                                {copied === 'evm' ? (
                                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {!balance?.hederaAccountId && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No Hedera account found. Your account will be created automatically when you
                        make your first purchase.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Info Card */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>About Your Wallet</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <p className="mb-1 font-medium">How It Works</p>
                    <p className="text-muted-foreground">
                      Your wallet is automatically created when you register. You can fund it to
                      purchase datasets.
                    </p>
                  </div>
                  {(process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet') === 'testnet' && (
                    <div>
                      <p className="mb-1 font-medium">Testnet Funding</p>
                      <p className="text-muted-foreground">
                        On testnet, you can get free HBAR from the Hedera faucet. Click the "Get
                        Free Test HBAR" button above to open the faucet.
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="mb-1 font-medium">Funding Your Wallet</p>
                    <p className="text-muted-foreground">
                      Transfer HBAR to your Hedera Account ID to fund your wallet. You can use
                      HashPack, Blade, or any Hedera-compatible wallet.
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 font-medium">Making Purchases</p>
                    <p className="text-muted-foreground">
                      When you purchase a dataset, the payment is automatically deducted from your
                      wallet balance.
                    </p>
                  </div>
                  <div>
                    <p className="mb-1 font-medium">View on HashScan</p>
                    <p className="text-muted-foreground">
                      Click the external link icon to view your account on HashScan, the Hedera
                      network explorer.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Transactions */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your recent purchases and payments</CardDescription>
            </CardHeader>
            <CardContent>
              {purchases.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No transactions yet. Purchase data to see transactions here.
                </p>
              ) : (
                <div className="space-y-3">
                  {purchases.map((purchase) => (
                    <div
                      key={purchase.id}
                      className="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4"
                    >
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {purchase.datasetName || 'Data Purchase'}
                          </span>
                          <Badge
                            variant={
                              purchase.status === 'completed'
                                ? 'success'
                                : purchase.status === 'pending'
                                  ? 'warning'
                                  : 'error'
                            }
                            className="text-xs"
                          >
                            {purchase.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(purchase.purchasedAt).toLocaleDateString()} •{' '}
                          {purchase.amount.toFixed(4)} HBAR ($
                          {purchase.amountUSD?.toFixed(2) || '0.00'})
                        </p>
                      </div>
                      {purchase.hederaTransactionId && (
                        <HashScanLink
                          transactionId={purchase.hederaTransactionId}
                          label="View"
                          variant="link"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

