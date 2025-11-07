import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Simple status check - in production, this would check a job queue or database
export async function GET() {
  try {
    const adapterPath = process.env.ADAPTER_PATH || path.join(process.cwd(), '../../adapter');
    const outputFile = path.join(adapterPath, 'data', 'anonymized_data.csv');

    try {
      await fs.access(outputFile);
      return NextResponse.json({
        status: 'completed',
        message: 'Last processing completed successfully',
      });
    } catch {
      return NextResponse.json({
        status: 'idle',
        message: 'No active processing',
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
