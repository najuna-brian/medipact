import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingUp, Calendar } from 'lucide-react';
import type { RevenueSplit as RevenueSplitType } from '@/types/adapter';

export default function HospitalRevenuePage() {
  // Mock data - hospital gets 25% of revenue
  const mockRevenue: RevenueSplitType = {
    totalHbar: 100.0,
    totalUsd: 5.0,
    totalLocal: 18500,
    patient: {
      hbar: 0,
      usd: 0,
      local: 0,
      percentage: 0,
    },
    hospital: {
      hbar: 25.0,
      usd: 1.25,
      local: 4625,
      percentage: 25,
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
      amount: 6.25,
      currency: 'HBAR',
      records: 250,
      status: 'completed',
    },
    {
      id: '2',
      date: new Date('2024-01-10'),
      amount: 5.1,
      currency: 'HBAR',
      records: 204,
      status: 'completed',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Revenue Tracking</h1>
          <p className="text-muted-foreground">
            Track your hospital&apos;s revenue from data sharing (25% of total)
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockRevenue.hospital.hbar.toFixed(2)} HBAR</div>
              <p className="text-xs text-muted-foreground">
                ${mockRevenue.hospital.usd.toFixed(2)} USD
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8.5 HBAR</div>
              <p className="text-xs text-muted-foreground">+20% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Records Processed</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,250</div>
              <p className="text-xs text-muted-foreground">Total records shared</p>
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
                      <p className="font-semibold">
                        {payout.amount} {payout.currency}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {payout.records} records • {payout.date.toLocaleDateString()}
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
              <CardTitle>Revenue Breakdown</CardTitle>
              <CardDescription>Hospital share (25% of total)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Platform Revenue</span>
                  <span className="font-semibold">{mockRevenue.totalHbar.toFixed(2)} HBAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Hospital Share (25%)</span>
                  <span className="font-semibold">{mockRevenue.hospital.hbar.toFixed(2)} HBAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Average per Record</span>
                  <span className="font-semibold">0.02 HBAR</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Your Revenue</span>
                    <span className="text-xl font-bold text-primary">
                      {mockRevenue.hospital.hbar.toFixed(2)} HBAR
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

