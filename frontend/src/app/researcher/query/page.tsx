'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, Suspense } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  Search,
  Filter,
  Loader2,
  ExternalLink,
  Shield,
  DollarSign,
  Download,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { QueryBuilder } from '@/components/QueryBuilder/QueryBuilder';
import { useQueryData, usePurchaseDataset } from '@/hooks/useDatasets';
import { QueryFilters } from '@/lib/api/marketplace';
import HashScanLink from '@/components/HashScanLink/HashScanLink';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useRouter, useSearchParams } from 'next/navigation';
import { FlattenedCSVPreview } from '@/components/FlattenedCSVPreview/FlattenedCSVPreview';
import { PurchaseFlow } from '@/components/PurchaseFlow/PurchaseFlow';
import { ResearcherSidebar } from '@/components/Sidebar/ResearcherSidebar';

function ResearcherQueryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [researcherId, setResearcherId] = useState<string | null>(null);
  const [queryFilters, setQueryFilters] = useState<QueryFilters | null>(null);
  const [showFullData, setShowFullData] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    const id = sessionStorage.getItem('researcherId');
    setResearcherId(id);

    // Load filters from URL params if available
    const filters: QueryFilters = {};
    searchParams.forEach((value, key) => {
      if (key !== 'preview') {
        (filters as any)[key] = value;
      }
    });
    if (Object.keys(filters).length > 0) {
      setQueryFilters(filters);
    }
  }, [searchParams]);

  const {
    data: queryResult,
    isLoading,
    error,
    refetch,
  } = useQueryData(queryFilters || {}, researcherId, !!queryFilters && !!researcherId);

  const purchaseMutation = usePurchaseDataset();

  const handleQuery = (filters: QueryFilters) => {
    // Always start with preview mode
    const previewFilters = { ...filters, preview: true };
    setQueryFilters(previewFilters);
    setShowFullData(false);
    setPurchaseSuccess(false);
    // Update URL with filters
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, String(value));
    });
    router.push(`/researcher/query?${params.toString()}`);
  };

  const handlePurchaseAccess = async () => {
    if (!researcherId || !queryFilters) return;

    try {
      // Execute query with preview=false to get full data
      // This requires payment verification
      const result = await purchaseMutation.mutateAsync({
        researcherId,
        datasetId: 'query-access', // Placeholder for query-based purchases
        amount: 10, // Default amount for query access (10 HBAR)
      } as any);

      // If payment request is returned, show payment UI
      if ('paymentRequest' in result) {
        // For now, redirect to dataset purchase flow
        // In a full implementation, we'd show payment UI here
        alert('Please purchase a dataset to access full query results. Redirecting to catalog...');
        router.push('/researcher/catalog');
        return;
      }

      // If purchase successful, refetch with preview=false
      if ('success' in result && result.success) {
        setPurchaseSuccess(true);
        // Refetch query with preview=false
        const fullQuery = { ...queryFilters, preview: false };
        setQueryFilters(fullQuery);
        refetch();
      }
    } catch (error: any) {
      alert(`Purchase failed: ${error.message}`);
    }
  };

  const formatDate = (date?: string) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString();
    } catch {
      return date;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ResearcherSidebar />
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Query Data</h1>
          <p className="text-muted-foreground">
            Search and explore anonymized medical data with advanced filters
          </p>
        </div>

        <div className="mb-6">
          <QueryBuilder
            onQuery={handleQuery}
            onReset={() => {
              setQueryFilters(null);
              router.push('/researcher/query');
            }}
            initialFilters={queryFilters || {}}
          />
        </div>

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              {error instanceof Error ? error.message : 'Failed to execute query'}
            </AlertDescription>
          </Alert>
        )}

        {isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-muted-foreground">Executing query...</p>
            </CardContent>
          </Card>
        )}

        {queryResult && !isLoading && (
          <div className="space-y-6">
            {/* Query Summary */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Query Results
                    </CardTitle>
                    <CardDescription>
                      {queryResult.format === 'csv-flattened' 
                        ? 'Flattened CSV format - One row per patient'
                        : queryResult.preview
                        ? 'Preview mode - Purchase to view full data'
                        : 'Full data access'}
                    </CardDescription>
                  </div>
                  {queryResult.hcsMessageId && (
                    <div className="flex items-center gap-2">
                      <HashScanLink
                        transactionId={queryResult.hcsMessageId}
                        label="View Query on HashScan"
                        variant="button"
                      />
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Records Found</p>
                    <p className="text-3xl font-bold">{(queryResult.recordCount || queryResult.count).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Format</p>
                    <p className="text-lg font-semibold">
                      {queryResult.format === 'csv-flattened' ? 'Flattened CSV' : queryResult.preview ? 'Preview' : 'Full Access'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Timestamp</p>
                    <p className="text-sm font-medium">
                      {queryResult.timestamp ? formatDate(queryResult.timestamp) : 'N/A'}
                    </p>
                  </div>
                </div>


                {purchaseSuccess && (
                  <Alert className="mt-4 border-green-200 bg-green-50">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      Purchase successful! You now have full access to the data.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Data Results - Show Flattened CSV Preview if format is csv-flattened */}
            {queryResult.format === 'csv-flattened' && queryResult.csvData && (
              <>
                <FlattenedCSVPreview
                  csvData={queryResult.csvData}
                  recordCount={queryResult.recordCount || queryResult.count}
                  filters={queryFilters || {}}
                  researcherId={researcherId}
                  onExport={undefined} // Remove export from preview, use purchase flow instead
                />
                {/* Purchase Flow - Show after preview */}
                <PurchaseFlow
                  recordCount={queryResult.recordCount || queryResult.count}
                  filters={queryFilters || {}}
                  researcherId={researcherId || ''}
                  onPurchaseSuccess={() => {
                    // Refetch query to show full data
                    refetch();
                  }}
                />
              </>
            )}

            {/* Purchase Flow for JSON format results */}
            {queryResult.format !== 'csv-flattened' && queryResult.results && queryResult.results.length > 0 && (
              <PurchaseFlow
                recordCount={queryResult.count}
                filters={queryFilters || {}}
                researcherId={researcherId || ''}
                onPurchaseSuccess={() => {
                  refetch();
                }}
              />
            )}

            {queryResult.results && queryResult.results.length === 0 && (
              <Card>
                <CardContent className="py-12 text-center">
                  <Database className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                  <p className="text-muted-foreground">No records found matching your query</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your filters or search criteria
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Verification Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Data Verification
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-muted-foreground">
                  All data in this query is verified on Hedera HashScan. You can verify the
                  authenticity and integrity of the data by clicking the HashScan links.
                </p>
                <div className="rounded-lg border bg-gray-50 p-3">
                  <p className="mb-1 font-medium">How Verification Works:</p>
                  <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                    <li>Each patient record has a cryptographic hash stored on Hedera</li>
                    <li>Click "Verify on HashScan" to view the original data proof</li>
                    <li>Query execution is logged to Hedera Consensus Service (HCS)</li>
                    <li>All data is anonymized and cannot be traced back to individuals</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {!queryFilters && !isLoading && (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">
                Use the query builder above to search for anonymized medical data
              </p>
            </CardContent>
          </Card>
        )}
        </div>
      </div>
    </div>
  );
}

export default function ResearcherQueryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      }
    >
      <ResearcherQueryPageContent />
    </Suspense>
  );
}

