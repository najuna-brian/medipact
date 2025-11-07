import { NextRequest, NextResponse } from 'next/server';
import {
  getConsentRecord,
  getConsentByAnonymousId,
} from '@/lib/contracts/ethers';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const patientId = searchParams.get('patientId');
    const anonymousId = searchParams.get('anonymousId');

    const contractAddress = process.env.NEXT_PUBLIC_CONSENT_MANAGER_ADDRESS;
    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';

    if (!contractAddress) {
      return NextResponse.json(
        { error: 'ConsentManager contract address not configured' },
        { status: 500 }
      );
    }

    let record = null;

    if (patientId) {
      record = await getConsentRecord(contractAddress, patientId, network);
    } else if (anonymousId) {
      record = await getConsentByAnonymousId(contractAddress, anonymousId, network);
    }

    if (!record) {
      return NextResponse.json({
        consentRecords: [],
        total: 0,
      });
    }

    return NextResponse.json({
      consentRecords: [record],
      total: 1,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

