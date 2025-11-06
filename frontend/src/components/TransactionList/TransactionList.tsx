'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HashScanLink from '@/components/HashScanLink/HashScanLink';
import { formatDate } from '@/lib/utils';
import type { TransactionResult } from '@/types/adapter';
import { FileText, Shield } from 'lucide-react';

interface TransactionListProps {
  transactions: TransactionResult[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
  const consentTransactions = transactions.filter((t) => t.type === 'consent');
  const dataTransactions = transactions.filter((t) => t.type === 'data');

  return (
    <Card>
      <CardHeader>
        <CardTitle>HCS Transactions</CardTitle>
        <CardDescription>
          All transactions submitted to Hedera Consensus Service
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {consentTransactions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Consent Proofs ({consentTransactions.length})
              </h3>
              <div className="space-y-2">
                {consentTransactions.map((tx, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="info">Consent</Badge>
                        {tx.patientId && (
                          <span className="text-sm text-muted-foreground">
                            Patient: {tx.patientId}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.timestamp)}
                      </p>
                    </div>
                    <HashScanLink transactionId={tx.transactionId} variant="button" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {dataTransactions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Data Proofs ({dataTransactions.length})
              </h3>
              <div className="space-y-2">
                {dataTransactions.map((tx, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="default">Data</Badge>
                        {tx.anonymousPID && (
                          <span className="text-sm text-muted-foreground">
                            PID: {tx.anonymousPID}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(tx.timestamp)}
                      </p>
                    </div>
                    <HashScanLink transactionId={tx.transactionId} variant="button" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {transactions.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No transactions found
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

