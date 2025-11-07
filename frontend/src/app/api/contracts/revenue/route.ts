import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const contractAddress = process.env.NEXT_PUBLIC_REVENUE_SPLITTER_ADDRESS;

    if (!contractAddress) {
      return NextResponse.json(
        { error: 'RevenueSplitter contract address not configured' },
        { status: 500 }
      );
    }

    // In production, this would query the contract for payout history
    return NextResponse.json({
      payouts: [],
      total: 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

