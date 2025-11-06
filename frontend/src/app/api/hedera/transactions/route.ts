import { NextRequest, NextResponse } from 'next/server';
import { getTransactions } from '@/lib/hedera/mirror-node';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // 'consent' | 'data'
    const limit = parseInt(searchParams.get('limit') || '50');
    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';

    // Fetch transactions from Hedera mirror node
    const allTransactions = await getTransactions(network, limit);

    // Filter by type if specified
    const transactions = type
      ? allTransactions.filter((tx) => tx.type === type)
      : allTransactions;

    return NextResponse.json({
      transactions,
      total: transactions.length,
      limit,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

