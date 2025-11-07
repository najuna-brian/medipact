'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import type { ProcessingStatus as ProcessingStatusType } from '@/types/adapter';

interface ProcessingStatusProps {
  status: ProcessingStatusType;
}

export default function ProcessingStatus({ status }: ProcessingStatusProps) {
  const getStatusIcon = () => {
    switch (status.status) {
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (status.status) {
      case 'processing':
        return <Badge variant="info">Processing</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'error':
        return <Badge variant="error">Error</Badge>;
      default:
        return <Badge>Idle</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {getStatusIcon()}
            Processing Status
          </CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {status.status === 'processing' && status.progress !== undefined && (
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Progress</span>
              <span>{status.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          </div>
        )}

        {status.message && (
          <p className="text-sm text-muted-foreground">{status.message}</p>
        )}

        {status.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{status.error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

