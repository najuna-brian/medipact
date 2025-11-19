'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  DollarSign,
  Download,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Users,
  Building2,
  Coins,
  Copy,
} from 'lucide-react';
import { purchaseDataset, exportQueryAsFlattenedCSV, downloadDataset } from '@/lib/api/marketplace';
import { QueryFilters } from '@/lib/api/marketplace';
import HashScanLink from '@/components/HashScanLink/HashScanLink';

interface PurchaseFlowProps {
  recordCount: number;
  filters: QueryFilters;
  researcherId: string;
  onPurchaseSuccess?: () => void;
}

export function PurchaseFlow({ recordCount, filters, researcherId, onPurchaseSuccess }: PurchaseFlowProps) {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [purchaseResult, setPurchaseResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  // Calculate price (simple: 0.1 HBAR per patient, minimum 1 HBAR)
  const pricePerRecord = 0.1;
  const totalPrice = Math.max(1, recordCount * pricePerRecord);
  const priceUSD = totalPrice * 0.16; // Approximate USD conversion

  // Revenue distribution
  const patientShare = totalPrice * 0.6;
  const hospitalShare = totalPrice * 0.25;
  const platformShare = totalPrice * 0.15;

  const handlePurchase = async () => {
    if (!researcherId) {
      setError('Researcher ID is required');
      return;
    }

    setIsPurchasing(true);
    setError(null);

    try {
      // For query-based purchases, pass query filters to backend
      // The backend will use query filters to get patients and distribute revenue
      const result = await purchaseDataset({
        researcherId,
        // No datasetId for query-based purchases
        amount: totalPrice,
        transactionId: transactionId || undefined,
        queryFilters: filters, // Pass query filters for revenue distribution
      });

      // Check if payment is required or auto-sent (needs confirmation)
      if ('paymentRequest' in result) {
        setShowPaymentForm(true);
        setPurchaseResult(result);

        // Debug: Log the result to see what we're getting
        console.log('Purchase result:', {
          hasPaymentRequest: 'paymentRequest' in result,
          autoPayment: result.autoPayment,
          transactionId: result.transactionId,
          message: result.message,
        });

        // If auto-payment was sent, pre-fill transaction ID
        if (result.autoPayment === true && result.transactionId) {
          setTransactionId(result.transactionId);
          console.log('✅ Auto-payment sent, transaction ID:', result.transactionId);
        } else {
          console.log(
            '⚠️ Manual payment required - autoPayment:',
            result.autoPayment,
            'transactionId:',
            result.transactionId
          );
        }

        setIsPurchasing(false);
        return;
      }

      // Purchase successful (either auto-payment or manual with transaction ID)
      if ('success' in result && result.success) {
        setPurchaseResult(result);
        setShowPaymentForm(false);
        if (onPurchaseSuccess) onPurchaseSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Purchase failed. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      const blob = await exportQueryAsFlattenedCSV(filters, researcherId, filters.limit);
      const filename = `patient-data-${filters.conditionName || 'query'}-${Date.now()}.csv`;
      downloadDataset(blob, filename);
    } catch (err: any) {
      setError(err.message || 'Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // If purchase is successful, show download button
  if (purchaseResult && 'success' in purchaseResult && purchaseResult.success) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <CheckCircle2 className="h-5 w-5" />
            Purchase Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert className="border-green-200 bg-green-100">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Your payment has been verified and revenue has been distributed. You can now download
              the data.
            </AlertDescription>
          </Alert>

          {purchaseResult.revenueDistribution && (
            <div className="rounded-lg border border-green-200 bg-white p-4">
              <h4 className="mb-3 font-semibold text-green-900">Revenue Distribution</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Patients (60%)
                  </span>
                  <span className="font-semibold">{patientShare.toFixed(4)} HBAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-green-600" />
                    Hospitals (25%)
                  </span>
                  <span className="font-semibold">{hospitalShare.toFixed(4)} HBAR</span>
                </div>
                <div className="flex justify-between">
                  <span className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-purple-600" />
                    Platform (15%)
                  </span>
                  <span className="font-semibold">{platformShare.toFixed(4)} HBAR</span>
                </div>
                <div className="mt-2 flex justify-between border-t pt-2 font-bold">
                  <span>Total</span>
                  <span>{totalPrice.toFixed(4)} HBAR</span>
                </div>
                {purchaseResult.revenueDistribution.patientCount && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Distributed among {purchaseResult.revenueDistribution.patientCount} patients
                  </p>
                )}
              </div>
            </div>
          )}

          {purchaseResult.transactionId && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Transaction:</span>
              <HashScanLink
                transactionId={purchaseResult.transactionId}
                label="View on HashScan"
                variant="link"
              />
            </div>
          )}

          <Button onClick={handleDownload} disabled={isDownloading} className="w-full" size="lg">
            {isDownloading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Downloading...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download CSV ({recordCount} records)
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Purchase & Download Data
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price Display */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Price for {recordCount.toLocaleString()} records
            </span>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{totalPrice.toFixed(4)} HBAR</div>
              <div className="text-sm text-muted-foreground">≈ ${priceUSD.toFixed(2)} USD</div>
            </div>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            {pricePerRecord} HBAR per record (minimum 1 HBAR)
          </div>
        </div>

        {/* Revenue Distribution Preview */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <h4 className="mb-3 text-sm font-semibold">Revenue Distribution (60/25/15)</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Patients
              </span>
              <span className="font-medium">{patientShare.toFixed(4)} HBAR (60%)</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-green-600" />
                Hospitals
              </span>
              <span className="font-medium">{hospitalShare.toFixed(4)} HBAR (25%)</span>
            </div>
            <div className="flex justify-between">
              <span className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-purple-600" />
                Platform
              </span>
              <span className="font-medium">{platformShare.toFixed(4)} HBAR (15%)</span>
            </div>
          </div>
        </div>

        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {showPaymentForm && purchaseResult && 'paymentRequest' in purchaseResult && (
          <div className="space-y-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
            {purchaseResult.autoPayment === true ? (
              <>
                <div>
                  <h4 className="mb-2 font-semibold text-green-900">Payment Sent Automatically</h4>
                  <p className="mb-3 text-sm text-green-800">
                    Your payment of {totalPrice.toFixed(4)} HBAR has been sent automatically to:
                  </p>
                  <div className="rounded bg-white p-3 font-mono text-sm">
                    {purchaseResult.paymentRequest.recipientAccountId}
                  </div>
                  <p className="mt-3 text-xs text-green-700">
                    Please review the transaction ID below and confirm to complete your purchase.
                  </p>
                </div>

                <div>
                  <Label htmlFor="transactionId" className="text-base font-semibold">
                    Transaction ID
                  </Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="transactionId"
                      placeholder="0.0.xxxxx@1234567890.123456789"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="flex-1 font-mono text-sm"
                      readOnly={!!purchaseResult.transactionId}
                    />
                    {purchaseResult.transactionId && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(transactionId);
                          alert('Transaction ID copied to clipboard!');
                        }}
                        className="shrink-0"
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy
                      </Button>
                    )}
                  </div>
                  {purchaseResult.transactionId && (
                    <div className="mt-2 space-y-1">
                      <p className="text-xs text-green-700 font-medium">
                        ✅ Transaction ID auto-filled from your payment
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Review the transaction ID above, then click "Confirm & Complete Purchase" to proceed.
                      </p>
                      {transactionId.includes('@') && (
                        <a
                          href={`https://hashscan.io/testnet/transaction/${transactionId.split('@')[1]}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          View transaction on HashScan <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={isPurchasing || !transactionId}
                  className="w-full"
                  size="lg"
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Confirm & Complete Purchase
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <div>
                  <h4 className="mb-2 font-semibold text-amber-900">Payment Instructions</h4>
                  <p className="mb-3 text-sm text-amber-800">
                    Send {totalPrice.toFixed(4)} HBAR to the platform account:
                  </p>
                  <div className="rounded bg-white p-3 font-mono text-sm">
                    {purchaseResult.paymentRequest.recipientAccountId}
                  </div>
                  <p className="mt-3 text-xs text-amber-700">
                    After sending payment, enter the transaction ID below to complete your purchase.
                  </p>
                </div>

                <div>
                  <Label htmlFor="transactionId">Transaction ID</Label>
                  <Input
                    id="transactionId"
                    placeholder="0.0.xxxxx@1234567890.123456789"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="mt-1"
                  />
                </div>

                <Button
                  onClick={handlePurchase}
                  disabled={isPurchasing || !transactionId}
                  className="w-full"
                  size="lg"
                >
                  {isPurchasing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying Payment...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Verify & Complete Purchase
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}

        {!showPaymentForm && (
          <Button onClick={handlePurchase} disabled={isPurchasing} className="w-full" size="lg">
            {isPurchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <DollarSign className="mr-2 h-4 w-4" />
                Purchase & Download ({totalPrice.toFixed(4)} HBAR)
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

