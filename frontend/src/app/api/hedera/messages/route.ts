import { NextRequest, NextResponse } from 'next/server';
import { getHCSTopicMessages } from '@/lib/hedera/mirror-node';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const topicId = searchParams.get('topicId');

    if (!topicId) {
      return NextResponse.json(
        { error: 'Topic ID is required' },
        { status: 400 }
      );
    }

    const network = process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet';
    const limit = parseInt(searchParams.get('limit') || '50');

    const messages = await getHCSTopicMessages(topicId, network, limit);

    return NextResponse.json({
      messages,
      total: messages.length,
      topicId,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

