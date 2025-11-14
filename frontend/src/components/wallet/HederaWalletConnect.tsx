'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  Copy,
  ExternalLink
} from 'lucide-react';

interface HederaWalletConnectProps {
  amountHBAR: number;
  amountUSD: number;
  recipientAccountId: string;
  memo: string;
  onPaymentComplete: (transactionId: string) => void;
  researcherAccountId?: string;
}

/**
 * Hedera Wallet Connect Component
 * 
 * Provides instructions and interface for researchers to connect their wallet
 * and send HBAR payments. Supports multiple wallet options.
 */
export default function HederaWalletConnect({
  amountHBAR,
  amountUSD,
  recipientAccountId,
  memo,
  onPaymentComplete,
  researcherAccountId
}: HederaWalletConnectProps) {
  const [transactionId, setTransactionId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVerifyPayment = async () => {
    if (!transactionId.trim()) {
      setError('Please enter a transaction ID');
      return;
    }

    setVerifying(true);
    setError(null);

    try {
      // Transaction ID format: 0.0.123@1234567890.123456789
      const txIdPattern = /^0\.0\.\d+@\d+\.\d+$/;
      if (!txIdPattern.test(transactionId.trim())) {
        throw new Error('Invalid transaction ID format. Expected: 0.0.123@1234567890.123456789');
      }

      onPaymentComplete(transactionId.trim());
    } catch (err: any) {
      setError(err.message || 'Failed to verify payment');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Payment Instructions
        </CardTitle>
        <CardDescription>
          Send {amountHBAR.toFixed(4)} HBAR (${amountUSD.toFixed(2)} USD) to complete your purchase
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Payment Details */}
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">Recipient Account</Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(recipientAccountId)}
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 h-3 w-3" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="font-mono text-sm">{recipientAccountId}</div>
          </div>

          <div className="mt-3 space-y-2">
            <Label className="text-sm font-semibold">Amount</Label>
            <div className="font-semibold">
              {amountHBAR.toFixed(4)} HBAR (${amountUSD.toFixed(2)} USD)
            </div>
          </div>

          {memo && (
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">Memo (Optional)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(memo)}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="mr-1 h-3 w-3" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 h-3 w-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">{memo}</div>
            </div>
          )}
        </div>

        {/* Wallet Options */}
        <div className="space-y-3">
          <Label>Connect Your Wallet</Label>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://www.hashpack.app/', '_blank')}
            >
              <Wallet className="mr-2 h-4 w-4" />
              HashPack Wallet
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open('https://www.bladelabs.io/', '_blank')}
            >
              <Wallet className="mr-2 h-4 w-4" />
              Blade Wallet
              <ExternalLink className="ml-2 h-3 w-3" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            After connecting your wallet, send the payment using your wallet's transfer function.
          </p>
        </div>

        {/* Manual Transaction Entry */}
        <div className="space-y-3 border-t pt-4">
          <Label htmlFor="transactionId">Transaction ID</Label>
          <p className="text-xs text-muted-foreground">
            After sending the payment, enter the transaction ID from your wallet
          </p>
          <div className="flex gap-2">
            <Input
              id="transactionId"
              type="text"
              placeholder="0.0.123@1234567890.123456789"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className="font-mono"
            />
            <Button
              onClick={handleVerifyPayment}
              disabled={verifying || !transactionId.trim()}
            >
              {verifying ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Verify
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Instructions */}
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
          <p className="text-xs font-semibold mb-2">Payment Steps:</p>
          <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Connect your Hedera wallet (HashPack, Blade, etc.)</li>
            <li>Send {amountHBAR.toFixed(4)} HBAR to account {recipientAccountId}</li>
            <li>Copy the transaction ID from your wallet</li>
            <li>Paste it above and click "Verify"</li>
          </ol>
        </div>

        {researcherAccountId && (
          <div className="text-xs text-muted-foreground">
            Your account: <span className="font-mono">{researcherAccountId}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

