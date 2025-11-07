'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { ConsentRecord } from '@/types/contracts';
import HashScanLink from '@/components/HashScanLink/HashScanLink';

interface ConsentFormProps {
  consentRecord?: ConsentRecord;
  onSubmit?: (data: { patientId: string; consent: boolean }) => void;
  readOnly?: boolean;
}

export default function ConsentForm({
  consentRecord,
  onSubmit,
  readOnly = false,
}: ConsentFormProps) {
  const [patientId, setPatientId] = useState(consentRecord?.originalPatientId || '');
  const [hasConsented, setHasConsented] = useState(consentRecord?.isValid || false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit({ patientId, consent: hasConsented });
    }
  };

  if (readOnly && consentRecord) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Consent Record</CardTitle>
          <CardDescription>On-chain consent proof stored on Hedera</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Original Patient ID</p>
              <p className="font-mono text-sm">{consentRecord.originalPatientId}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Anonymous Patient ID</p>
              <p className="font-mono text-sm">{consentRecord.anonymousPatientId}</p>
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Status</p>
            <Badge variant={consentRecord.isValid ? 'success' : 'error'}>
              {consentRecord.isValid ? (
                <>
                  <CheckCircle2 className="mr-1 h-3 w-3" />
                  Valid
                </>
              ) : (
                <>
                  <XCircle className="mr-1 h-3 w-3" />
                  Revoked
                </>
              )}
            </Badge>
          </div>
          <div>
            <p className="mb-2 text-sm text-muted-foreground">HCS Topic</p>
            <p className="font-mono text-sm">{consentRecord.hcsTopicId}</p>
          </div>
          {consentRecord.transactionId && (
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Transaction</p>
              <HashScanLink transactionId={consentRecord.transactionId} variant="button" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Patient Consent Form</CardTitle>
        <CardDescription>
          I consent to share my anonymized medical data for research purposes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="patientId" className="mb-2 block text-sm font-medium">
              Patient ID
            </label>
            <input
              id="patientId"
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2"
              disabled={readOnly}
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              id="consent"
              type="checkbox"
              checked={hasConsented}
              onChange={(e) => setHasConsented(e.target.checked)}
              className="h-4 w-4"
              disabled={readOnly}
            />
            <label htmlFor="consent" className="text-sm">
              I consent to share my anonymized medical data for research
            </label>
          </div>
          {!readOnly && (
            <Button type="submit" disabled={!patientId || !hasConsented}>
              Submit Consent
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
