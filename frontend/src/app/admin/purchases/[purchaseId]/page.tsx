'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, DollarSign, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { getRevenueDistributionsByPurchase, type RevenueDistribution } from '@/lib/api/admin';
import HashScanLink from '@/components/HashScanLink/HashScanLink';

export default function PurchaseDetailPage() {
  const params = useParams();
  const purchaseId = params.purchaseId as string;
  const [distributions, setDistributions] = useState<RevenueDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (purchaseId) {
      fetchPurchaseDetails();
    }
  }, [purchaseId]);

  const fetchPurchaseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getRevenueDistributionsByPurchase(purchaseId);
      setDistributions(data.distributions);
    } catch (err) {
      console.error('Error fetching purchase details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load purchase details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Group distributions by recipient type
  const patientDistributions = distributions.filter(d => d.recipientType === 'patient');
  const hospitalDistributions = distributions.filter(d => d.recipientType === 'hospital');
  const platformDistributions = distributions.filter(d => d.recipientType === 'platform');

  // Calculate totals
  const totalAmount = distributions.reduce((sum, d) => sum + d.amountHBAR, 0);
  const patientTotal = patientDistributions.reduce((sum, d) => sum + d.amountHBAR, 0);
  const hospitalTotal = hospitalDistributions.reduce((sum, d) => sum + d.amountHBAR, 0);
  const platformTotal = platformDistributions.reduce((sum, d) => sum + d.amountHBAR, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <a
            href="/admin/revenue"
            className="text-sm text-blue-600 hover:underline mb-2 inline-block"
          >
            ← Back to Revenue Tracking
          </a>
          <h1 className="mb-2 text-3xl font-bold">Purchase Details</h1>
          <p className="text-muted-foreground">
            Purchase ID: <span className="font-mono">{purchaseId}</span>
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="py-4">
              <p className="text-sm text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading purchase details...</span>
              </div>
            </CardContent>
          </Card>
        ) : distributions.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">
                No revenue distributions found for this purchase
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Distributed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{totalAmount.toFixed(4)} HBAR</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {distributions.length} distributions
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Patients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{patientDistributions.length}</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {patientTotal.toFixed(4)} HBAR (60%)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Hospitals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{hospitalDistributions.length}</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {hospitalTotal.toFixed(4)} HBAR (25%)
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Platform</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformDistributions.length}</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {platformTotal.toFixed(4)} HBAR (15%)
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Patient Payouts */}
            {patientDistributions.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Patient Payouts ({patientDistributions.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2 text-left text-sm font-medium">Patient UPI</th>
                          <th className="p-2 text-left text-sm font-medium">Hospital</th>
                          <th className="p-2 text-left text-sm font-medium">Amount</th>
                          <th className="p-2 text-left text-sm font-medium">Account</th>
                          <th className="p-2 text-left text-sm font-medium">Status</th>
                          <th className="p-2 text-left text-sm font-medium">Transaction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {patientDistributions.map((dist) => (
                          <tr key={dist.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 text-sm font-mono">{dist.patientUPI}</td>
                            <td className="p-2 text-sm">{dist.hospitalId || 'N/A'}</td>
                            <td className="p-2 text-sm font-medium">
                              {dist.amountHBAR.toFixed(4)} HBAR
                            </td>
                            <td className="p-2 text-sm">
                              <div className="font-mono text-xs">{dist.recipientAccountId}</div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(dist.status)}
                                <span className="text-sm capitalize">{dist.status}</span>
                              </div>
                            </td>
                            <td className="p-2">
                              <HashScanLink
                                transactionId={dist.transactionId}
                                label="View"
                                variant="link"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Hospital Payouts */}
            {hospitalDistributions.length > 0 && (
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Hospital Payouts ({hospitalDistributions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2 text-left text-sm font-medium">Hospital ID</th>
                          <th className="p-2 text-left text-sm font-medium">Amount</th>
                          <th className="p-2 text-left text-sm font-medium">Account</th>
                          <th className="p-2 text-left text-sm font-medium">Status</th>
                          <th className="p-2 text-left text-sm font-medium">Transaction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {hospitalDistributions.map((dist) => (
                          <tr key={dist.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 text-sm">{dist.hospitalId || 'N/A'}</td>
                            <td className="p-2 text-sm font-medium">
                              {dist.amountHBAR.toFixed(4)} HBAR
                            </td>
                            <td className="p-2 text-sm">
                              <div className="font-mono text-xs">{dist.recipientAccountId}</div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(dist.status)}
                                <span className="text-sm capitalize">{dist.status}</span>
                              </div>
                            </td>
                            <td className="p-2">
                              <HashScanLink
                                transactionId={dist.transactionId}
                                label="View"
                                variant="link"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Platform Payouts */}
            {platformDistributions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Platform Payouts ({platformDistributions.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2 text-left text-sm font-medium">Amount</th>
                          <th className="p-2 text-left text-sm font-medium">Account</th>
                          <th className="p-2 text-left text-sm font-medium">Status</th>
                          <th className="p-2 text-left text-sm font-medium">Transaction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {platformDistributions.map((dist) => (
                          <tr key={dist.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 text-sm font-medium">
                              {dist.amountHBAR.toFixed(4)} HBAR
                            </td>
                            <td className="p-2 text-sm">
                              <div className="font-mono text-xs">{dist.recipientAccountId}</div>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(dist.status)}
                                <span className="text-sm capitalize">{dist.status}</span>
                              </div>
                            </td>
                            <td className="p-2">
                              <HashScanLink
                                transactionId={dist.transactionId}
                                label="View"
                                variant="link"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

