'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, Database, DollarSign, FileDown, Loader2, Search } from 'lucide-react';
import { useResearcherAnalytics } from '@/hooks/useResearcher';

export default function ResearcherAnalyticsPage() {
  const [researcherId, setResearcherId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem('researcherId');
    setResearcherId(id);
  }, []);

  const { data: analytics, isLoading, error } = useResearcherAnalytics(researcherId);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-red-600">Error loading analytics: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = analytics || {
    datasetsUsed: 0,
    recordsAnalyzed: 0,
    totalSpentHBAR: 0,
    totalSpentUSD: 0,
    downloads: 0,
    totalQueries: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Research Analytics</h1>
          <p className="text-muted-foreground">Track your research data usage and insights</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Datasets Used</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.datasetsUsed}</div>
              <p className="text-xs text-muted-foreground">Purchased datasets</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Records Analyzed</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recordsAnalyzed.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Total records</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalSpentUSD.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">
                {stats.totalSpentHBAR.toFixed(4)} HBAR
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queries Executed</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQueries}</div>
              <p className="text-xs text-muted-foreground">Total queries</p>
            </CardContent>
          </Card>
        </div>

        {stats.datasetsUsed > 0 && (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Cost Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recordsAnalyzed > 0 && (
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <p className="mb-1 font-semibold text-green-900">Cost Per Record</p>
                      <p className="text-2xl font-bold text-green-800">
                        ${(stats.totalSpentUSD / stats.recordsAnalyzed).toFixed(4)}
                      </p>
                      <p className="mt-1 text-xs text-green-700">
                        Average cost per record analyzed
                      </p>
                    </div>
                  )}
                  {stats.datasetsUsed > 0 && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <p className="mb-1 font-semibold text-blue-900">Average Dataset Cost</p>
                      <p className="text-2xl font-bold text-blue-800">
                        ${(stats.totalSpentUSD / stats.datasetsUsed).toFixed(2)}
                      </p>
                      <p className="mt-1 text-xs text-blue-700">Per dataset purchased</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Research Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                    <p className="mb-1 font-semibold text-purple-900">Query Activity</p>
                    <p className="text-sm text-purple-800">{stats.totalQueries} queries executed</p>
                    <p className="mt-1 text-xs text-purple-700">
                      {stats.recordsAnalyzed > 0
                        ? `${Math.round(stats.recordsAnalyzed / stats.totalQueries).toLocaleString()} records per query on average`
                        : 'Start querying to see insights'}
                    </p>
                  </div>
                  <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <p className="mb-1 font-semibold text-amber-900">Download Activity</p>
                    <p className="text-sm text-amber-800">
                      {stats.downloads} dataset{stats.downloads !== 1 ? 's' : ''} downloaded
                    </p>
                    <p className="mt-1 text-xs text-amber-700">
                      Access your purchased datasets anytime
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {stats.datasetsUsed === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Database className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">No analytics data yet</p>
              <p className="mb-4 text-sm text-muted-foreground">
                Start by purchasing datasets and executing queries to see your research analytics
              </p>
              <div className="flex justify-center gap-2">
                <Button onClick={() => (window.location.href = '/researcher/catalog')}>
                  Browse Catalog
                </Button>
                <Button
                  variant="outline"
                  onClick={() => (window.location.href = '/researcher/query')}
                >
                  Execute Query
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
