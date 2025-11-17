'use client';

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Calendar, DollarSign, Loader2, ExternalLink } from 'lucide-react';
import { useResearcherPurchases } from '@/hooks/useResearcher';
import { useExportDataset } from '@/hooks/useDatasets';
import HashScanLink from '@/components/HashScanLink/HashScanLink';
import { downloadDataset } from '@/lib/api/marketplace';

export default function ResearcherPurchasesPage() {
  const [researcherId, setResearcherId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem('researcherId');
    setResearcherId(id);
  }, []);

  const { data, isLoading, error } = useResearcherPurchases(researcherId, 50);
  const exportMutation = useExportDataset();

  const handleExport = async (datasetId: string, format: 'fhir' | 'csv' | 'json') => {
    if (!researcherId) return;

    try {
      const result = await exportMutation.mutateAsync({
        datasetId,
        format,
        researcherId,
      });

      if (format === 'csv' && result instanceof Blob) {
        downloadDataset(result, `dataset-${datasetId}.csv`);
      } else {
        const blob = new Blob([JSON.stringify(result, null, 2)], {
          type: 'application/json',
        });
        downloadDataset(blob, `dataset-${datasetId}.${format === 'fhir' ? 'fhir.json' : 'json'}`);
      }
    } catch (error: any) {
      alert(`Export failed: ${error.message}`);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

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
            <p className="text-red-600">Error loading purchases: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const purchases = data?.purchases || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Purchase History</h1>
          <p className="text-muted-foreground">View and download your purchased datasets</p>
        </div>

        <div className="space-y-4">
          {purchases.map((purchase) => (
            <Card key={purchase.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="mb-2">
                      {purchase.datasetName || `Dataset ${purchase.datasetId}`}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-4">
                      <span className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        {formatDate(purchase.purchasedAt)}
                      </span>
                      <span className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />${purchase.amountUSD.toFixed(2)} USD (
                        {purchase.amount.toFixed(4)} {purchase.currency})
                      </span>
                      {purchase.recordCount && (
                        <span className="text-sm">
                          {purchase.recordCount.toLocaleString()} records
                        </span>
                      )}
                    </CardDescription>
                  </div>
                  <Badge variant={purchase.status === 'completed' ? 'success' : 'warning'}>
                    {purchase.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {purchase.hederaTransactionId && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Transaction:</span>
                      <HashScanLink
                        transactionId={purchase.hederaTransactionId}
                        label="View on HashScan"
                        variant="button"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>Dataset files available</span>
                    </div>
                    {purchase.status === 'completed' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(purchase.datasetId, 'fhir')}
                          disabled={exportMutation.isPending}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          FHIR
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(purchase.datasetId, 'csv')}
                          disabled={exportMutation.isPending}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExport(purchase.datasetId, 'json')}
                          disabled={exportMutation.isPending}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          JSON
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {purchases.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="mb-4 text-muted-foreground">No purchases yet</p>
              <Button onClick={() => (window.location.href = '/researcher/catalog')}>
                Browse Catalog
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
