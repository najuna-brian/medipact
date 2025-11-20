'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, ExternalLink, Copy, CheckCircle2, XCircle, Clock } from 'lucide-react';
import {
  getRevenueDistributions,
  getRevenueDistributionStats,
  type RevenueDistribution,
  type RevenueDistributionStats,
} from '@/lib/api/admin';
import HashScanLink from '@/components/HashScanLink/HashScanLink';

export default function AdminRevenuePage() {
  const [distributions, setDistributions] = useState<RevenueDistribution[]>([]);
  const [stats, setStats] = useState<RevenueDistributionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const limit = 50;

  useEffect(() => {
    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [distributionsData, statsData] = await Promise.all([
        getRevenueDistributions(limit, page * limit),
        getRevenueDistributionStats(),
      ]);
      setDistributions(distributionsData.distributions);
      setStats(statsData);
    } catch (err) {
      console.error('Error fetching revenue data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getRecipientTypeColor = (type: string) => {
    switch (type) {
      case 'patient':
        return 'bg-blue-100 text-blue-800';
      case 'hospital':
        return 'bg-green-100 text-green-800';
      case 'platform':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
          <h1 className="mb-2 text-3xl font-bold">Revenue Distribution Tracking</h1>
          <p className="text-muted-foreground">
            Track all revenue payouts to patients, hospitals, and platform
          </p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="py-4">
              <p className="text-sm text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading && !stats ? (
          <Card>
            <CardContent className="py-8">
              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading revenue data...</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Statistics Cards */}
            {stats && (
              <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Distributions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalDistributions.toLocaleString()}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Across {stats.totalPurchases} purchases
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Distributed</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalDistributedHBAR?.toFixed(2) || '0.00'} HBAR
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stats.failedDistributions > 0 && (
                        <span className="text-red-600">{stats.failedDistributions} failed</span>
                      )}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Patient Share</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalPatientHBAR?.toFixed(2) || '0.00'} HBAR
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stats.totalPatients} patients
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Hospital Share</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.totalHospitalHBAR?.toFixed(2) || '0.00'} HBAR
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {stats.totalHospitals} hospitals
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Distribution List */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Payouts</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-muted-foreground">Loading...</span>
                  </div>
                ) : distributions.length === 0 ? (
                  <p className="py-8 text-center text-muted-foreground">
                    No revenue distributions found
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="p-2 text-left text-sm font-medium">Date</th>
                          <th className="p-2 text-left text-sm font-medium">Recipient</th>
                          <th className="p-2 text-left text-sm font-medium">Type</th>
                          <th className="p-2 text-left text-sm font-medium">Amount</th>
                          <th className="p-2 text-left text-sm font-medium">Method</th>
                          <th className="p-2 text-left text-sm font-medium">Status</th>
                          <th className="p-2 text-left text-sm font-medium">Transaction</th>
                        </tr>
                      </thead>
                      <tbody>
                        {distributions.map((dist) => (
                          <tr key={dist.id} className="border-b hover:bg-gray-50">
                            <td className="p-2 text-sm">{formatDate(dist.distributedAt)}</td>
                            <td className="p-2 text-sm">
                              <div>
                                <div className="font-mono text-xs">{dist.recipientAccountId}</div>
                                {dist.patientUPI && (
                                  <div className="text-xs text-muted-foreground">
                                    Patient: {dist.patientUPI}
                                  </div>
                                )}
                                {dist.hospitalId && (
                                  <div className="text-xs text-muted-foreground">
                                    Hospital: {dist.hospitalId}
                                  </div>
                                )}
                                {dist.purchaseId && (
                                  <a
                                    href={`/admin/purchases/${dist.purchaseId}`}
                                    className="text-xs text-blue-600 hover:underline"
                                  >
                                    Purchase: {dist.purchaseId.slice(0, 12)}...
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="p-2">
                              <Badge className={getRecipientTypeColor(dist.recipientType)}>
                                {dist.recipientType}
                              </Badge>
                            </td>
                            <td className="p-2 text-sm font-medium">
                              {dist.amountHBAR.toFixed(4)} HBAR
                            </td>
                            <td className="p-2 text-sm">
                              <Badge variant="info">
                                {dist.distributionMethod === 'direct'
                                  ? 'Direct Transfer'
                                  : dist.distributionMethod === 'contract-dynamic'
                                    ? 'Smart Contract'
                                    : 'Contract Fixed'}
                              </Badge>
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(dist.status)}
                                <span className="text-sm capitalize">{dist.status}</span>
                              </div>
                              {dist.errorMessage && (
                                <div className="mt-1 text-xs text-red-600">{dist.errorMessage}</div>
                              )}
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
                )}

                {/* Pagination */}
                {distributions.length > 0 && (
                  <div className="mt-4 flex items-center justify-between">
                    <button
                      onClick={() => setPage(Math.max(0, page - 1))}
                      disabled={page === 0}
                      className="rounded border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <span className="text-sm text-muted-foreground">Page {page + 1}</span>
                    <button
                      onClick={() => setPage(page + 1)}
                      disabled={distributions.length < limit}
                      className="rounded border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
