'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, Play, Loader2 } from 'lucide-react';
import ProcessingStatus from '@/components/ProcessingStatus/ProcessingStatus';
import TransactionList from '@/components/TransactionList/TransactionList';
import RevenueSplit from '@/components/RevenueSplit/RevenueSplit';
import { useProcessAdapter } from '@/hooks/useAdapter';
import { useToast } from '@/components/Toast/Toast';
import type { ProcessingResult, ProcessingStatus as ProcessingStatusType } from '@/types/adapter';

export default function AdapterDemo() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<ProcessingStatusType>({ status: 'idle' });
  const [result, setResult] = useState<ProcessingResult | null>(null);
  const processMutation = useProcessAdapter();
  const toast = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setStatus({ status: 'processing', progress: 0, message: 'Starting processing...' });
    setResult(null);

    try {
      processMutation.mutate(file, {
        onSuccess: (data) => {
          setResult(data);
          setStatus({ status: 'completed', progress: 100, message: 'Processing completed!' });
          toast.success('File processed successfully!');
        },
        onError: (error: any) => {
          setStatus({
            status: 'error',
            error: error.message || 'Processing failed',
          });
          toast.error(error.message || 'Processing failed');
        },
      });
    } catch (error: any) {
      setStatus({
        status: 'error',
        error: error.message || 'Unknown error',
      });
      toast.error(error.message || 'Unknown error occurred');
    }
  };

  return (
    <div className="container mx-auto space-y-6 px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>MediPact Adapter Demo</CardTitle>
          <CardDescription>
            Upload CSV or FHIR data to process and submit to Hedera HCS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label htmlFor="file-upload" className="mb-2 block text-sm font-medium">
              Upload Data File
            </label>
            <div className="flex items-center gap-4">
              <input
                id="file-upload"
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-lg file:border-0 file:bg-primary file:px-4 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground hover:file:bg-primary/90"
              />
              <Button onClick={handleProcess} disabled={!file || processMutation.isPending}>
                {processMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Process
                  </>
                )}
              </Button>
            </div>
          </div>

          {file && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Upload className="h-4 w-4" />
              <span>{file.name}</span>
              <Badge variant="info">{(file.size / 1024).toFixed(2)} KB</Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {status.status !== 'idle' && <ProcessingStatus status={status} />}

      {result && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Processing Results</CardTitle>
              <CardDescription>Summary of processed data and HCS transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Records Processed</p>
                  <p className="text-2xl font-bold">{result.recordsProcessed}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Consent Proofs</p>
                  <p className="text-2xl font-bold">{result.consentProofs}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Data Proofs</p>
                  <p className="text-2xl font-bold">{result.dataProofs}</p>
                </div>
              </div>

              {result.consentTopicId && (
                <div className="mb-4">
                  <p className="mb-2 text-sm text-muted-foreground">Consent Topic</p>
                  <Badge variant="info">{result.consentTopicId}</Badge>
                </div>
              )}

              {result.dataTopicId && (
                <div className="mb-4">
                  <p className="mb-2 text-sm text-muted-foreground">Data Topic</p>
                  <Badge variant="info">{result.dataTopicId}</Badge>
                </div>
              )}
            </CardContent>
          </Card>

          {result.transactions && result.transactions.length > 0 && (
            <TransactionList transactions={result.transactions} />
          )}

          {result.revenue && <RevenueSplit revenue={result.revenue} />}
        </>
      )}
    </div>
  );
}
