'use client';

import { ExternalLink } from 'lucide-react';
import { getHashScanAccountLink } from '@/lib/hedera/hashscan';
import Link from 'next/link';

interface HederaAccountIdProps {
  accountId: string | null | undefined;
  network?: 'testnet' | 'mainnet' | 'previewnet';
  showLabel?: boolean;
  className?: string;
}

export function HederaAccountId({
  accountId,
  network = 'testnet',
  showLabel = true,
  className = '',
}: HederaAccountIdProps) {
  if (!accountId) {
    return (
      <div className={`text-sm text-muted-foreground ${className}`}>
        {showLabel && 'Hedera Account: '}
        <span className="italic">Not assigned</span>
      </div>
    );
  }

  const hashScanLink = getHashScanAccountLink(accountId, network);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {showLabel && <span className="text-sm text-muted-foreground">Hedera Account:</span>}
      <div className="flex items-center gap-1.5">
        <code className="rounded bg-muted px-2 py-1 text-sm font-mono">{accountId}</code>
        <Link
          href={hashScanLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:text-primary/80 transition-colors"
          title="View on HashScan"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

