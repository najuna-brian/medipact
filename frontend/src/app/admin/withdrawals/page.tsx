'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  Loader2,
  AlertCircle,
  TrendingUp,
  Users
} from 'lucide-react';
import { AdminProtectedRoute } from '@/components/AdminProtectedRoute/AdminProtectedRoute';
import { AdminSidebar } from '@/components/Sidebar/AdminSidebar';

const API_URL = process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:3002';

function WithdrawalsContent() {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    loadWithdrawals();
    loadStats();
  }, [filter]);

  const loadWithdrawals = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      params.append('limit', '50');

      const response = await fetch(`${API_URL}/api/admin/withdrawals?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load withdrawals');
      const data = await response.json();
      setWithdrawals(data.withdrawals || []);
    } catch (error) {
      console.error('Error loading withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/withdrawals/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to load stats');
      const data = await response.json();
      setStats(data.summary || {});
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleComplete = async (withdrawalId: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/withdrawals/${withdrawalId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ transactionId: `TXN-${Date.now()}` })
      });

      if (!response.ok) throw new Error('Failed to complete withdrawal');
      await loadWithdrawals();
      await loadStats();
    } catch (error) {
      console.error('Error completing withdrawal:', error);
      alert('Failed to complete withdrawal');
    }
  };

  const handleRetryFailed = async () => {
    setRetrying(true);
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admin/withdrawals/retry-failed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ limit: 10 })
      });

      if (!response.ok) throw new Error('Failed to retry withdrawals');
      const data = await response.json();
      alert(`Retry completed: ${data.results.succeeded} succeeded, ${data.results.failed} failed`);
      await loadWithdrawals();
      await loadStats();
    } catch (error) {
      console.error('Error retrying withdrawals:', error);
      alert('Failed to retry withdrawals');
    } finally {
      setRetrying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      pending: { variant: 'secondary' as const, icon: Clock },
      processing: { variant: 'default' as const, icon: Loader2 },
      completed: { variant: 'default' as const, icon: CheckCircle2, className: 'bg-green-500' },
      failed: { variant: 'destructive' as const, icon: XCircle }
    };
    const config = variants[status] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className={config.className}>
        <Icon className="mr-1 h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <AdminSidebar />
        <div className="ml-0 md:ml-64">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="mb-2 text-3xl font-bold">Withdrawal Management</h1>
            <p className="text-muted-foreground">
              Manage and monitor user withdrawal requests
            </p>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Withdrawals</p>
                      <p className="text-2xl font-bold">{stats.total || 0}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{stats.pending || 0}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                      <p className="text-2xl font-bold text-green-600">{stats.completed || 0}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Completed</p>
                      <p className="text-2xl font-bold">${(stats.total_completed_usd || 0).toFixed(2)}</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Filters and Actions */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-2">
              {(['all', 'pending', 'processing', 'completed', 'failed'] as const).map((f) => (
                <Button
                  key={f}
                  variant={filter === f ? 'default' : 'outline'}
                  onClick={() => setFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={handleRetryFailed}
              disabled={retrying}
            >
              {retrying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry Failed
                </>
              )}
            </Button>
          </div>

          {/* Withdrawals Table */}
          <Card>
            <CardHeader>
              <CardTitle>Withdrawals</CardTitle>
              <CardDescription>
                {withdrawals.length} withdrawal{withdrawals.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {withdrawals.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  No withdrawals found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-2 text-left">ID</th>
                        <th className="px-4 py-2 text-left">User</th>
                        <th className="px-4 py-2 text-left">Amount</th>
                        <th className="px-4 py-2 text-left">Payment Method</th>
                        <th className="px-4 py-2 text-left">Status</th>
                        <th className="px-4 py-2 text-left">Created</th>
                        <th className="px-4 py-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((w: any) => (
                        <tr key={w.id} className="border-b">
                          <td className="px-4 py-2 font-mono text-sm">#{w.id}</td>
                          <td className="px-4 py-2">
                            {w.user_type === 'patient' ? (
                              <span className="font-mono text-sm">{w.upi || 'N/A'}</span>
                            ) : (
                              <span className="font-mono text-sm">{w.hospital_id || 'N/A'}</span>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <div>
                              <div className="font-semibold">${w.amount_usd?.toFixed(2) || '0.00'}</div>
                              <div className="text-xs text-muted-foreground">
                                {w.amount_hbar?.toFixed(4) || '0.0000'} HBAR
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="text-sm">
                              {w.payment_method === 'bank' ? 'Bank Account' : 'Mobile Money'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {w.destination_account?.replace(/(.{4})(.*)(.{4})/, '$1****$3') || 'N/A'}
                            </div>
                          </td>
                          <td className="px-4 py-2">{getStatusBadge(w.status)}</td>
                          <td className="px-4 py-2 text-sm text-muted-foreground">
                            {new Date(w.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-2">
                            {w.status === 'pending' || w.status === 'processing' ? (
                              <Button
                                size="sm"
                                onClick={() => handleComplete(w.id)}
                              >
                                Complete
                              </Button>
                            ) : (
                              <span className="text-sm text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function WithdrawalsPage() {
  return (
    <AdminProtectedRoute>
      <WithdrawalsContent />
    </AdminProtectedRoute>
  );
}

