'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { HospitalSidebar } from '@/components/Sidebar/HospitalSidebar';
import { useHospitalSession } from '@/hooks/useHospitalSession';
import { getHospitalBalance, getHospitalWithdrawals } from '@/lib/api/wallet';
import type { WalletBalance, Withdrawal } from '@/lib/api/wallet';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  `http://localhost:${process.env.NEXT_PUBLIC_BACKEND_PORT || 8080}`;

interface Payout {
  id: string;
  date: Date;
  amount: number;
  currency: string;
  records?: number;
  status: string;
}

export default function HospitalRevenuePage() {
  const { hospitalId } = useHospitalSession();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hospitalId) {
      fetchRevenue();
      fetchPayouts();
    } else {
      setError('Hospital ID not found. Please log in.');
      setLoading(false);
    }
  }, [hospitalId]);

  const fetchRevenue = async () => {
    if (!hospitalId) return;
    try {
      const data = await getHospitalBalance(hospitalId);
      setBalance(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = async () => {
    if (!hospitalId) return;
    try {
      const withdrawals = await getHospitalWithdrawals(hospitalId);
      setPayouts(
        withdrawals.map((w: Withdrawal) => ({
          id: w.id.toString(),
          date: new Date(w.createdAt),
          amount: w.amountHBAR,
          currency: 'HBAR',
          records: 0, // Could be calculated from transaction history
          status: w.status,
        }))
      );
    } catch (err) {
      console.error('Error fetching payouts:', err);
    }
  };

  // Calculate hospital share (25% of total)
  const hospitalHbar = balance?.balanceHBAR || 0;
  const hospitalUsd = balance?.balanceUSD || 0;
  const totalHbar = hospitalHbar * 4; // Total if hospital has 25%
  const totalUsd = hospitalUsd * 4;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HospitalSidebar />
        <div className="ml-0 md:ml-64">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !balance) {
    return (
      <div className="min-h-screen bg-gray-50">
        <HospitalSidebar />
        <div className="ml-0 md:ml-64">
          <div className="container mx-auto px-4 py-8">
            <Card>
              <CardContent className="pt-6">
                <p className="text-red-600">{error || 'No revenue data available'}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HospitalSidebar />
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Revenue Tracking</h1>
            <p className="text-muted-foreground">
              Track your hospital&apos;s revenue from data sharing (25% of total)
            </p>
          </div>

          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{hospitalHbar.toFixed(2)} HBAR</div>
                <p className="text-xs text-muted-foreground">${hospitalUsd.toFixed(2)} USD</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Withdrawn</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{balance.totalWithdrawnUSD.toFixed(2)} USD</div>
                <p className="text-xs text-muted-foreground">All time withdrawals</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{balance.balanceHBAR.toFixed(2)} HBAR</div>
                <p className="text-xs text-muted-foreground">Ready to withdraw</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Payouts</CardTitle>
                <CardDescription>Your withdrawal history</CardDescription>
              </CardHeader>
              <CardContent>
                {payouts.length > 0 ? (
                  <div className="space-y-4">
                    {payouts.map((payout) => (
                      <div
                        key={payout.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div>
                          <p className="font-semibold">
                            {payout.amount.toFixed(2)} {payout.currency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {payout.date.toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={payout.status === 'completed' ? 'success' : 'warning'}>
                          {payout.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No withdrawals yet</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
                <CardDescription>Hospital share (25% of total)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Platform Revenue</span>
                    <span className="font-semibold">{totalHbar.toFixed(2)} HBAR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Hospital Share (25%)</span>
                    <span className="font-semibold">{hospitalHbar.toFixed(2)} HBAR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Current Balance</span>
                    <span className="font-semibold">{balance.balanceHBAR.toFixed(2)} HBAR</span>
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">Your Revenue</span>
                      <span className="text-xl font-bold text-primary">
                        {hospitalHbar.toFixed(2)} HBAR
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

