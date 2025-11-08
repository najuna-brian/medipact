import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// Simple status check - in production, this would check a job queue or database
export async function GET() {
  try {
    // Resolve adapter path: from frontend/, adapter is at ../adapter (one level up)
    const adapterPath = process.env.ADAPTER_PATH 
      ? path.resolve(process.env.ADAPTER_PATH)
      : path.resolve(path.dirname(process.cwd()), 'adapter');
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
