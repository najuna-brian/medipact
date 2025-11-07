'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Database, Calendar } from 'lucide-react';
import { getHashScanTopicLink } from '@/lib/hedera/hashscan';
import { useHCSTopic } from '@/hooks/useHedera';
import type { HederaNetwork } from '@/types/hedera';
import { formatDate } from '@/lib/utils';
import { DashboardSkeleton } from '@/components/LoadingSkeleton/LoadingSkeleton';

interface TopicViewerProps {
  topicId: string;
  network?: HederaNetwork;
}

export default function TopicViewer({ topicId, network = 'testnet' }: TopicViewerProps) {
  const { data: topic, isLoading, error } = useHCSTopic(topicId);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-red-600">Error loading topic: {error.message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!topic) {
    return (
      <Card>
        <CardContent className="py-8">
          <p className="text-center text-muted-foreground">Topic not found</p>
        </CardContent>
      </Card>
    );
  }

  const hashScanUrl = getHashScanTopicLink(topicId, network);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              HCS Topic
            </CardTitle>
            <CardDescription>Hedera Consensus Service Topic Information</CardDescription>
          </div>
          <Badge variant="info">{topicId}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Topic ID</p>
            <p className="font-mono text-sm">{topic.topicId}</p>
          </div>
          {topic.memo && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Memo</p>
              <p className="text-sm">{topic.memo}</p>
            </div>
          )}
        </div>

        {topic.messageCount !== undefined && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Message Count</p>
            <p className="text-lg font-semibold">{topic.messageCount.toLocaleString()}</p>
          </div>
        )}

        {topic.expirationTime && (
          <div>
            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Expiration Time
            </p>
            <p className="text-sm">{formatDate(topic.expirationTime)}</p>
          </div>
        )}

        {topic.autoRenewAccount && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Auto-Renew Account</p>
            <p className="font-mono text-sm">{topic.autoRenewAccount}</p>
          </div>
        )}

        {topic.autoRenewPeriod && (
          <div>
            <p className="text-sm text-muted-foreground mb-1">Auto-Renew Period</p>
            <p className="text-sm">{topic.autoRenewPeriod} seconds</p>
          </div>
        )}

        <div className="pt-4 border-t">
          <a
            href={hashScanUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-primary hover:underline"
          >
            View on HashScan
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

