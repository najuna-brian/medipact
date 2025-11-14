'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Wallet, 
  DollarSign, 
  ArrowDownCircle, 
  Copy, 
  CheckCircle2,
  Loader2,
  AlertCircle,
  Building2,
  Smartphone
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getHospitalBalance, initiateHospitalWithdrawal, getHospitalWithdrawals } from '@/lib/api/wallet';
import type { WalletBalance, Withdrawal } from '@/lib/api/wallet';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

function HospitalWalletContent() {
  const [hospitalId, setHospitalId] = useState<string | null>(null);
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Get hospital ID from localStorage or session
    const storedHospitalId = localStorage.getItem('hospitalId');
    if (storedHospitalId) {
      setHospitalId(storedHospitalId);
      fetchBalance(storedHospitalId);
      fetchWithdrawals(storedHospitalId);
    } else {
      setError('Hospital ID not found. Please log in.');
      setLoading(false);
    }
  }, []);

  const fetchBalance = async (id: string) => {
    try {
      const data = await getHospitalBalance(id);
      setBalance(data);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setError('Failed to load wallet balance');
    } finally {
      setLoading(false);
    }
  };

  const fetchWithdrawals = async (id: string) => {
    try {
      const data = await getHospitalWithdrawals(id);
      setWithdrawals(data);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    }
  };

  const handleWithdraw = async () => {
    if (!hospitalId) return;
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (balance && parseFloat(withdrawAmount) > balance.balanceUSD) {
      setError('Insufficient balance');
      return;
    }

    setWithdrawing(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await initiateHospitalWithdrawal(hospitalId, parseFloat(withdrawAmount));
      setSuccess(result.message || 'Withdrawal initiated successfully');
      setWithdrawAmount('');
      fetchBalance(hospitalId);
      fetchWithdrawals(hospitalId);
    } catch (error: any) {
      setError(error.message || 'Failed to initiate withdrawal');
    } finally {
      setWithdrawing(false);
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatAccountNumber = (account: string) => {
    if (!account) return '';
    if (account.length <= 8) return account;
    return `${account.slice(0, 4)}****${account.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-4 md:py-8">
        <div className="mb-6 md:mb-8">
          <h1 className="mb-2 text-2xl font-bold md:text-3xl">Hospital Wallet</h1>
          <p className="text-sm text-muted-foreground md:text-base">
            View your balance and manage withdrawals
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : balance ? (
          <div className="space-y-6">
            {/* Balance Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5" />
                  Your Wallet Balance
                </CardTitle>
                <CardDescription>
                  Funds are automatically transferred when balance reaches ${balance.withdrawalThresholdUSD}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* USD Balance - Primary Display */}
                <div>
                  <Label className="text-sm text-muted-foreground">Balance (USD)</Label>
                  <div className="text-4xl font-bold text-gray-900">
                    ${balance.balanceUSD.toFixed(2)}
                  </div>
                </div>

                {/* HBAR Balance - Below USD */}
                <div>
                  <Label className="text-sm text-muted-foreground">Balance (HBAR)</Label>
                  <div className="text-2xl font-semibold text-gray-700">
                    {balance.balanceHBAR.toFixed(4)} HBAR
                  </div>
                </div>

                {/* Hedera Account Details */}
                {balance.hederaAccountId && (
                  <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                      Hedera Account Details
                    </Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Account ID:</span>
                        <div className="flex items-center gap-2">
                          <code className="text-sm font-mono">{balance.hederaAccountId}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(balance.hederaAccountId!, 'accountId')}
                            className="h-6 w-6 p-0"
                          >
                            {copied === 'accountId' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                      {balance.evmAddress && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">EVM Address:</span>
                          <div className="flex items-center gap-2">
                            <code className="text-sm font-mono">{balance.evmAddress}</code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(balance.evmAddress!, 'evmAddress')}
                              className="h-6 w-6 p-0"
                            >
                              {copied === 'evmAddress' ? (
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

                {/* Payment Method Info */}
                {balance.paymentMethod && (
                  <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {balance.paymentMethod === 'bank' ? (
                        <Building2 className="h-4 w-4 text-blue-600" />
                      ) : (
                        <Smartphone className="h-4 w-4 text-blue-600" />
                      )}
                      <Label className="text-sm font-semibold text-gray-900">
                        Withdrawal Method: {balance.paymentMethod === 'bank' ? 'Bank Account' : 'Mobile Money'}
                      </Label>
                    </div>
                    <div className="text-sm text-gray-700">
                      {balance.paymentMethod === 'bank' ? (
                        <>
                          <p><strong>Bank:</strong> {balance.bankName || 'N/A'}</p>
                          <p><strong>Account:</strong> {formatAccountNumber(balance.bankAccountNumber || '')}</p>
                        </>
                      ) : (
                        <>
                          <p><strong>Provider:</strong> {balance.mobileMoneyProvider || 'N/A'}</p>
                          <p><strong>Number:</strong> {formatAccountNumber(balance.mobileMoneyNumber || '')}</p>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      {balance.autoWithdrawEnabled 
                        ? `Auto-withdraw enabled (threshold: $${balance.withdrawalThresholdUSD})`
                        : 'Auto-withdraw disabled'}
                    </p>
                  </div>
                )}

                {balance.totalWithdrawnUSD > 0 && (
                  <div className="text-sm text-muted-foreground">
                    Total withdrawn: ${balance.totalWithdrawnUSD.toFixed(2)}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Withdrawal Card */}
            {balance.paymentMethod && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowDownCircle className="h-5 w-5" />
                    Withdraw Funds
                  </CardTitle>
                  <CardDescription>
                    Withdraw to your {balance.paymentMethod === 'bank' ? 'bank account' : 'mobile money'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount (USD)</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={balance.balanceUSD}
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      placeholder={`Max: $${balance.balanceUSD.toFixed(2)}`}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Available: ${balance.balanceUSD.toFixed(2)}
                    </p>
                  </div>
                  <Button
                    onClick={handleWithdraw}
                    disabled={withdrawing || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
                    className="w-full"
                  >
                    {withdrawing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <ArrowDownCircle className="mr-2 h-4 w-4" />
                        Withdraw Now
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Withdrawal History */}
            {withdrawals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Withdrawal History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {withdrawals.map((withdrawal) => (
                      <div
                        key={withdrawal.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 p-3"
                      >
                        <div>
                          <div className="font-semibold">${withdrawal.amountUSD.toFixed(2)}</div>
                          <div className="text-sm text-muted-foreground">
                            {withdrawal.amountHBAR.toFixed(4)} HBAR
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(withdrawal.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <Badge
                          variant={
                            withdrawal.status === 'completed'
                              ? 'success'
                              : withdrawal.status === 'failed'
                              ? 'error'
                              : withdrawal.status === 'processing'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {withdrawal.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No wallet found. Your wallet will be created automatically when you receive your first payment.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function HospitalWalletPage() {
  return <HospitalWalletContent />;
}

