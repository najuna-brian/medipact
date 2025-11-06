'use client';

import { ExternalLink } from 'lucide-react';
import { getHashScanLink } from '@/lib/hedera/hashscan';
import type { HederaNetwork } from '@/types/hedera';
import { Button } from '@/components/ui/button';

interface HashScanLinkProps {
  transactionId: string;
  network?: HederaNetwork;
  label?: string;
  variant?: 'link' | 'button';
  className?: string;
}

export default function HashScanLink({
  transactionId,
  network = 'testnet',
  label,
  variant = 'link',
  className,
}: HashScanLinkProps) {
  const url = getHashScanLink(transactionId, network);
  const displayText = label || truncateTransactionId(transactionId);

  if (variant === 'button') {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
        <Button variant="outline" size="sm" className="inline-flex items-center gap-2">
          {displayText}
          <ExternalLink className="h-4 w-4" />
        </Button>
      </a>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-primary hover:underline ${className || ''}`}
    >
      {displayText}
      <ExternalLink className="h-4 w-4" />
    </a>
  );
}

function truncateTransactionId(txId: string): string {
  // Format: 0.0.123456@1234567890.123456789
  const parts = txId.split('@');
  if (parts.length === 2) {
    return `${parts[0]}@${parts[1].slice(0, 10)}...`;
  }
  return txId.length > 20 ? `${txId.slice(0, 20)}...` : txId;
}
