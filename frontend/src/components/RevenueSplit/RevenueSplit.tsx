'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import type { RevenueSplit as RevenueSplitType } from '@/types/adapter';
import { Users, Building2, DollarSign } from 'lucide-react';

interface RevenueSplitProps {
  revenue: RevenueSplitType;
}

export default function RevenueSplit({ revenue }: RevenueSplitProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Revenue Split</CardTitle>
        <CardDescription>
          Automated 60/25/15 revenue distribution
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Total Revenue */}
          <div className="p-4 bg-primary/10 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <h3 className="text-lg font-semibold">Total Revenue</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">HBAR</p>
                <p className="text-xl font-bold">{revenue.totalHbar.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">USD</p>
                <p className="text-xl font-bold">{formatCurrency(revenue.totalUsd)}</p>
              </div>
              {revenue.totalLocal && (
                <div>
                  <p className="text-sm text-muted-foreground">Local</p>
                    <p className="text-xl font-bold">
                      {formatCurrency(revenue.totalLocal, 'UGX', 'en-US')}
                    </p>
                </div>
              )}
            </div>
          </div>

          {/* Split Breakdown */}
          <div className="space-y-4">
            {/* Patient - 60% */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-medical-green" />
                  <h4 className="font-semibold">Patient</h4>
                </div>
                <Badge variant="success">{revenue.patient.percentage}%</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">HBAR</p>
                  <p className="font-semibold">{revenue.patient.hbar.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">USD</p>
                  <p className="font-semibold">{formatCurrency(revenue.patient.usd)}</p>
                </div>
                {revenue.patient.local && (
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-semibold">
                      {formatCurrency(revenue.patient.local, 'UGX', 'en-US')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Hospital - 25% */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-medical-blue" />
                  <h4 className="font-semibold">Hospital</h4>
                </div>
                <Badge variant="info">{revenue.hospital.percentage}%</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">HBAR</p>
                  <p className="font-semibold">{revenue.hospital.hbar.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">USD</p>
                  <p className="font-semibold">{formatCurrency(revenue.hospital.usd)}</p>
                </div>
                {revenue.hospital.local && (
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-semibold">
                      {formatCurrency(revenue.hospital.local, 'UGX', 'en-US')}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* MediPact - 15% */}
            <div className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-medical-purple" />
                  <h4 className="font-semibold">MediPact</h4>
                </div>
                <Badge variant="default">{revenue.medipact.percentage}%</Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">HBAR</p>
                  <p className="font-semibold">{revenue.medipact.hbar.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">USD</p>
                  <p className="font-semibold">{formatCurrency(revenue.medipact.usd)}</p>
                </div>
                {revenue.medipact.local && (
                  <div>
                    <p className="text-sm text-muted-foreground">Local</p>
                    <p className="font-semibold">
                      {formatCurrency(revenue.medipact.local, 'UGX', 'en-US')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

