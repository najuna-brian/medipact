'use client';

import { AlertCircle, Shield, ArrowRight, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface VerificationPromptProps {
  researcherId: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  message?: string;
  className?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function VerificationPrompt({
  researcherId,
  verificationStatus,
  message,
  className = '',
  onRefresh,
  isLoading = false,
}: VerificationPromptProps) {
  const router = useRouter();

  // Don't show if already verified
  if (verificationStatus === 'verified') {
    return null;
  }

  const defaultMessage =
    verificationStatus === 'pending'
      ? "Your verification documents are under review. Verification typically takes 24-48 hours during business days. You'll receive an email notification when your status changes."
      : verificationStatus === 'rejected'
        ? 'Your verification was rejected. Please submit new documents to verify your account.'
        : 'Please verify your account to access full features and better pricing.';

  return (
    <Card className={`border-yellow-200 bg-yellow-50 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-yellow-600" />
          <CardTitle className="text-lg">Account Verification Required</CardTitle>
        </div>
        <CardDescription>{message || defaultMessage}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-yellow-600" />
          <div className="flex-1">
            {verificationStatus === 'pending' ? (
              <>
                <p className="mb-2 text-sm text-yellow-800">{message || defaultMessage}</p>
                {onRefresh && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="mt-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Check Status
                      </>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <>
                <p className="text-sm text-yellow-800">Verified researchers get:</p>
                <ul className="mt-1 space-y-1 text-sm text-yellow-700">
                  <li>• Full access to all datasets</li>
                  <li>• Better pricing and discounts</li>
                  <li>• Priority support</li>
                  <li>• Compliance documentation</li>
                </ul>
              </>
            )}
          </div>
          {verificationStatus !== 'pending' && (
            <Button
              onClick={() => router.push(`/researcher/${researcherId}/verify`)}
              className="bg-yellow-600 text-white hover:bg-yellow-700"
            >
              Verify Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

