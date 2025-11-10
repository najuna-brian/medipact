'use client';

import { Card, CardContent } from '@/components/ui/card';
import TransactionList from '@/components/TransactionList/TransactionList';
import { useTransactions } from '@/hooks/useHedera';

export default function AdminTransactionsPage() {
  const { data, isLoading } = useTransactions(undefined, true); // Enable polling

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">HCS Transactions</h1>
          <p className="text-muted-foreground">
            View all Hedera Consensus Service transactions
          </p>
        </div>

        {isLoading ? (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">Loading transactions...</p>
            </CardContent>
          </Card>
        ) : data && data.transactions.length > 0 ? (
          <TransactionList transactions={data.transactions as any} />
        ) : (
          <Card>
            <CardContent className="py-8">
              <p className="text-center text-muted-foreground">No transactions found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

