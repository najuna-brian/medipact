import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import type { RevenueSplit as RevenueSplitType } from '@/types/adapter';

export default function PatientEarningsPage() {
  // Mock data - in production, this would come from API
  const mockEarnings: RevenueSplitType = {
    totalHbar: 60.0,
    totalUsd: 3.0,
    totalLocal: 11100,
    patient: {
      hbar: 60.0,
      usd: 3.0,
      local: 11100,
      percentage: 60,
    },
    hospital: {
      hbar: 0,
      usd: 0,
      local: 0,
      percentage: 0,
    },
    medipact: {
      hbar: 0,
      usd: 0,
      local: 0,
      percentage: 0,
    },
  };

  const recentPayouts = [
    {
      id: '1',
      date: new Date('2024-01-15'),
      amount: 10.5,
      currency: 'HBAR',
      status: 'completed',
    },
    {
      id: '2',
      date: new Date('2024-01-10'),
      amount: 8.2,
      currency: 'HBAR',
      status: 'completed',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Earnings Dashboard</h1>
          <p className="text-muted-foreground">
            Track your earnings from data sharing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockEarnings.totalHbar.toFixed(2)} HBAR</div>
              <p className="text-xs text-muted-foreground">${mockEarnings.totalUsd.toFixed(2)} USD</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12.5 HBAR</div>
              <p className="text-xs text-muted-foreground">+15% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5.2 HBAR</div>
              <p className="text-xs text-muted-foreground">Next payout: Jan 31</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Payouts</CardTitle>
              <CardDescription>Your payment history</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentPayouts.map((payout) => (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-semibold">{payout.amount} {payout.currency}</p>
                      <p className="text-sm text-muted-foreground">
                        {payout.date.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="success">{payout.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Earnings Breakdown</CardTitle>
              <CardDescription>Your share of revenue (60%)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Records Shared</span>
                  <span className="font-semibold">1,250</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average per Record</span>
                  <span className="font-semibold">0.048 HBAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Revenue</span>
                  <span className="font-semibold">100 HBAR</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Your Share (60%)</span>
                    <span className="text-xl font-bold text-primary">
                      {mockEarnings.patient.hbar.toFixed(2)} HBAR
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

