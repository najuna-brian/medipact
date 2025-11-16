'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, CheckCircle2, Clock, ExternalLink, Loader2 } from 'lucide-react';
import { useProcessingHistory } from '@/hooks/usePatientIdentity';
import { useHospitalSession } from '@/hooks/useHospitalSession';
import { HospitalSidebar } from '@/components/Sidebar/HospitalSidebar';

export default function HospitalProcessingPage() {
  const { hospitalId, apiKey } = useHospitalSession();
  const { data: processingHistory, isLoading, error } = useProcessingHistory(hospitalId, apiKey);

  const getHashScanLink = (topicId: string | null, network: string = 'testnet') => {
    if (!topicId) return null;
    const networkPath = network === 'mainnet' ? '' : `${network}/`;
    return `https://hashscan.io/${networkPath}topic/${topicId}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <HospitalSidebar />
      <div className="ml-0 md:ml-64">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Processing History</h1>
            <p className="text-muted-foreground">
              View processing logs and anonymized data results
            </p>
          </div>

          {isLoading && (
            <Card>
              <CardContent className="py-12 text-center">
                <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Loading processing history...</p>
              </CardContent>
            </Card>
          )}

          {error && (
            <Card className="border-red-200">
              <CardContent className="py-8 text-center">
                <p className="text-red-600">Error loading processing history: {error.message}</p>
              </CardContent>
            </Card>
          )}

          {!isLoading && !error && processingHistory && processingHistory.length > 0 && (
            <div className="space-y-6">
              {processingHistory.map((item) => {
                const processedDate = item.processedAt ? new Date(item.processedAt) : (item.createdAt ? new Date(item.createdAt) : null);
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2 mb-2">
                      <FileText className="w-5 h-5" />
                      {item.fileName}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4">
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {processedDate ? processedDate.toLocaleDateString() : 'N/A'}
                      </span>
                      <span>{item.recordsProcessed} records</span>
                    </CardDescription>
                  </div>
                  <Badge
                    variant={item.status === 'completed' ? 'success' : 'warning'}
                    className="flex items-center gap-1"
                  >
                    {item.status === 'completed' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        Processing
                      </>
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Records Processed</p>
                    <p className="text-xl font-bold">{item.recordsProcessed}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Consent Proofs</p>
                    <p className="text-xl font-bold">{item.consentProofs}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data Proofs</p>
                    <p className="text-xl font-bold">{item.dataProofs}</p>
                  </div>
                </div>
                {item.status === 'completed' && (
                  <div className="pt-4 border-t flex gap-2 flex-wrap">
                    {item.consentTopicId && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(getHashScanLink(item.consentTopicId), '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Consent Proofs
                      </Button>
                    )}
                    {item.dataTopicId && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => window.open(getHashScanLink(item.dataTopicId), '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        View Data Proofs
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
              );
            })}
            </div>
          )}

          {!isLoading && !error && (!processingHistory || processingHistory.length === 0) && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No processing history yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload CSV files to see processing history here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

