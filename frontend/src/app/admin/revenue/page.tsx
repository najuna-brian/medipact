'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import RevenueSplit from '@/components/RevenueSplit/RevenueSplit';
import { useRevenuePayouts } from '@/hooks/useContracts';
import type { RevenueSplit as RevenueSplitType } from '@/types/adapter';

export default function AdminRevenuePage() {
  const { data: payoutsData, isLoading } = useRevenuePayouts();

  // Mock revenue data for demo
  const mockRevenue: RevenueSplitType = {
    totalHbar: 100.0,
    totalUsd: 5.0,
    totalLocal: 18500,
    patient: {
      hbar: 60.0,
      usd: 3.0,
      local: 11100,
      percentage: 60,
    },
    hospital: {
      hbar: 25.0,
      usd: 1.25,
      local: 4625,
      percentage: 25,
    },
    medipact: {
      hbar: 15.0,
      usd: 0.75,
      local: 2775,
      percentage: 15,
    },
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Platform Revenue</h1>
          <p className="text-muted-foreground">
            Revenue analytics and distribution
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Loading revenue data...</p>
            </CardContent>
          </Card>
        ) : (
          <RevenueSplit revenue={mockRevenue} />
        )}

        {payoutsData && payoutsData.payouts.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Payout History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {payoutsData.payouts.length} payouts processed
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

