'use client';

import { AlertCircle, Shield, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface VerificationPromptProps {
  researcherId: string;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  message?: string;
  className?: string;
}

export function VerificationPrompt({
  researcherId,
  verificationStatus,
  message,
  className = '',
}: VerificationPromptProps) {
  const router = useRouter();

  // Don't show if already verified
  if (verificationStatus === 'verified') {
    return null;
  }

  const defaultMessage = verificationStatus === 'pending'
    ? 'Your verification is pending review. Please verify your account to access full features and better pricing.'
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
        <CardDescription>
          {message || defaultMessage}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm text-yellow-800">
              Verified researchers get:
            </p>
            <ul className="text-sm text-yellow-700 mt-1 space-y-1">
              <li>• Full access to all datasets</li>
              <li>• Better pricing and discounts</li>
              <li>• Priority support</li>
              <li>• Compliance documentation</li>
            </ul>
          </div>
          <Button
            onClick={() => router.push(`/researcher/${researcherId}/verify`)}
            className="bg-yellow-600 hover:bg-yellow-700 text-white"
          >
            Verify Now
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

