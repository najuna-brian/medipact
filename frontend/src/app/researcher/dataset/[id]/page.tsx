'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Database,
  DollarSign,
  FileText,
  Calendar,
  Users,
  Shield,
  MapPin,
  Download,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import HashScanLink from '@/components/HashScanLink/HashScanLink';
import { useDataset, usePurchaseDataset, useExportDataset } from '@/hooks/useDatasets';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { downloadDataset } from '@/lib/api/marketplace';
import HederaWalletConnect from '@/components/wallet/HederaWalletConnect';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle2 } from 'lucide-react';

interface DatasetPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function DatasetPage({ params }: DatasetPageProps) {
  const router = useRouter();
  const [datasetId, setDatasetId] = useState<string | null>(null);
  const [researcherId, setResearcherId] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'fhir' | 'csv' | 'json'>('fhir');
  const [showPayment, setShowPayment] = useState(false);
  const [paymentRequest, setPaymentRequest] = useState<any>(null);
  const [purchaseSuccess, setPurchaseSuccess] = useState(false);

  useEffect(() => {
    params.then((p) => setDatasetId(p.id));
    const id = sessionStorage.getItem('researcherId');
    setResearcherId(id);
  }, [params]);

  const { data: dataset, isLoading, error } = useDataset(datasetId, true);
  const purchaseMutation = usePurchaseDataset();
  const exportMutation = useExportDataset();

  const handlePurchase = async () => {
    if (!researcherId || !dataset) return;

    try {
      const result = await purchaseMutation.mutateAsync({
        researcherId,
        datasetId: dataset.id,
        amount: dataset.price,
      });

      // Check if it's a payment request (202 response)
      if ('paymentRequest' in result) {
        setPaymentRequest(result.paymentRequest);
        setShowPayment(true);
      } else {
        // Purchase successful
        setPurchaseSuccess(true);
        setShowPayment(false);
      }
    } catch (error: any) {
      alert(`Purchase failed: ${error.message}`);
    }
  };

  const handlePaymentComplete = async (transactionId: string) => {
    if (!researcherId || !dataset) return;

    try {
      const result = await purchaseMutation.mutateAsync({
        researcherId,
        datasetId: dataset.id,
        amount: dataset.price,
        transactionId,
      });

      setPurchaseSuccess(true);
      setShowPayment(false);
      setPaymentRequest(null);
    } catch (error: any) {
      alert(`Payment verification failed: ${error.message}`);
    }
  };

  const handleExport = async (format: 'fhir' | 'csv' | 'json') => {
    if (!researcherId || !dataset) return;

    try {
      const result = await exportMutation.mutateAsync({
        datasetId: dataset.id,
        format,
        researcherId,
      });

      if (format === 'csv' && result instanceof Blob) {
        downloadDataset(result, `dataset-${dataset.id}.csv`);
      } else {
        // For JSON/FHIR, create a download link
        const blob = new Blob([JSON.stringify(result, null, 2)], {
          type: 'application/json',
        });
        downloadDataset(blob, `dataset-${dataset.id}.${format === 'fhir' ? 'fhir.json' : 'json'}`);
      }
    } catch (error: any) {
      alert(`Export failed: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">
              Error loading dataset: {error?.message || 'Dataset not found'}
            </p>
            <Button onClick={() => router.push('/researcher/catalog')} className="mt-4">
              Back to Catalog
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">{dataset.name}</h1>
              <div className="flex items-center gap-2">
                <Badge variant={dataset.status === 'active' ? 'default' : 'default'}>
                  {dataset.status}
                </Badge>
                <Badge variant="info" className="flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  {dataset.consentType}
                </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold">
                $
                {dataset.priceUSD ? dataset.priceUSD.toFixed(2) : (dataset.price * 0.16).toFixed(2)}
              </p>
              <p className="text-sm text-muted-foreground">
                {dataset.pricePerRecordUSD
                  ? `$${dataset.pricePerRecordUSD.toFixed(4)} per record`
                  : `One-time purchase`}
                {dataset.volumeDiscount && dataset.volumeDiscount > 0 && (
                  <span className="ml-2 text-green-600">
                    ({Math.round(dataset.volumeDiscount * 100)}% volume discount)
                  </span>
                )}
              </p>
              {dataset.pricingCategory && (
                <p className="text-xs text-muted-foreground">Category: {dataset.pricingCategory}</p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{dataset.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dataset Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Records</p>
                      <p className="font-semibold">{dataset.recordCount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Country</p>
                      <p className="font-semibold">{dataset.country}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Date Range</p>
                      <p className="text-xs font-semibold">
                        {formatDate(dataset.dateRangeStart)} - {formatDate(dataset.dateRangeEnd)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Format</p>
                      <p className="font-semibold">{dataset.format}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {dataset.conditionCodes && dataset.conditionCodes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Conditions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {dataset.conditionCodes.map((code, idx) => (
                      <Badge key={idx} variant="info">
                        {code}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {dataset.preview && dataset.preview.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Preview (Sample Data)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {dataset.preview.slice(0, 5).map((patient: any, idx: number) => (
                      <div key={idx} className="rounded-lg border p-3">
                        <p className="text-sm font-medium">Patient: {patient.anonymousPatientId}</p>
                        <p className="text-xs text-muted-foreground">
                          Country: {patient.country} | Age: {patient.ageRange || 'N/A'} | Gender:{' '}
                          {patient.gender || 'N/A'}
                        </p>
                      </div>
                    ))}
                    <p className="mt-2 text-xs text-muted-foreground">
                      Showing {Math.min(5, dataset.preview.length)} of {dataset.recordCount} records
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {dataset.hcsTopicId && (
              <Card>
                <CardHeader>
                  <CardTitle>Hedera Verification</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {dataset.consentTopicId && (
                    <div>
                      <p className="mb-1 text-sm text-muted-foreground">Consent Proof</p>
                      <HashScanLink
                        transactionId={dataset.consentTopicId}
                        label="View on HashScan"
                      />
                    </div>
                  )}
                  {dataset.dataTopicId && (
                    <div>
                      <p className="mb-1 text-sm text-muted-foreground">Data Proof</p>
                      <HashScanLink transactionId={dataset.dataTopicId} label="View on HashScan" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Purchase & Download</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {purchaseSuccess ? (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertDescription>
                      Purchase successful! You can now download the dataset.
                    </AlertDescription>
                  </Alert>
                ) : showPayment && paymentRequest ? (
                  <HederaWalletConnect
                    amountHBAR={paymentRequest.amountHBAR}
                    amountUSD={dataset.priceUSD || dataset.price * 0.16}
                    recipientAccountId={paymentRequest.recipientAccountId}
                    memo={paymentRequest.memo}
                    researcherAccountId={paymentRequest.researcherAccountId}
                    onPaymentComplete={handlePaymentComplete}
                  />
                ) : (
                  <Button
                    className="w-full"
                    onClick={handlePurchase}
                    disabled={purchaseMutation.isPending || !researcherId}
                  >
                    {purchaseMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign className="mr-2 h-4 w-4" />
                        Purchase Dataset
                      </>
                    )}
                  </Button>
                )}

                <div className="space-y-2 border-t pt-4">
                  <p className="mb-2 text-sm font-medium">Export Format</p>
                  <div className="space-y-2">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleExport('fhir')}
                      disabled={exportMutation.isPending}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export as FHIR
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleExport('csv')}
                      disabled={exportMutation.isPending}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export as CSV
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleExport('json')}
                      disabled={exportMutation.isPending}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Export as JSON
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Dataset Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p className="font-medium">{formatDate(dataset.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p className="font-medium">{formatDate(dataset.updatedAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Hospital ID</p>
                  <p className="font-mono text-xs font-medium">{dataset.hospitalId}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
