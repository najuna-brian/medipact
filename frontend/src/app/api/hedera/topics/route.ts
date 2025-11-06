import { NextRequest, NextResponse } from 'next/server';
import { getTopicInfo, getHCSTopicMessages } from '@/lib/hedera/mirror-node';

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

    // Fetch topic info from mirror node
    const topicInfo = await getTopicInfo(topicId, network);

    if (!topicInfo) {
      return NextResponse.json(
        { error: 'Topic not found' },
        { status: 404 }
      );
    }

    // Get message count from messages endpoint
    const messages = await getHCSTopicMessages(topicId, network, 1);

    return NextResponse.json({
      topicId: topicInfo.topic_id,
      memo: topicInfo.memo || '',
      messageCount: topicInfo.message_count || messages.length,
      adminKey: topicInfo.admin_key,
      submitKey: topicInfo.submit_key,
      autoRenewAccount: topicInfo.auto_renew_account,
      autoRenewPeriod: topicInfo.auto_renew_period,
      expirationTime: topicInfo.expiration_timestamp,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

