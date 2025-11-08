import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import { processFile } from '@/lib/adapter/processor';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Save uploaded file temporarily
    // Resolve adapter path: from frontend/, adapter is at ../adapter (one level up)
    const adapterPath = process.env.ADAPTER_PATH 
      ? path.resolve(process.env.ADAPTER_PATH)
      : path.resolve(path.dirname(process.cwd()), 'adapter');
    const dataDir = path.join(adapterPath, 'data');
    const tempFilePath = path.join(dataDir, 'uploaded_data.csv');

    // Ensure data directory exists
    await fs.mkdir(dataDir, { recursive: true });

    // Write file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await fs.writeFile(tempFilePath, buffer);

    try {
      // Process the file using the adapter
      const result = await processFile(tempFilePath, adapterPath);

      if (!result.success) {
        await fs.unlink(tempFilePath).catch(() => {});
        return NextResponse.json(
          { error: result.error || 'Processing failed' },
          { status: 500 }
        );
      }

      // Calculate revenue split (matching adapter logic)
      const hbarPerRecord = 0.01;
      const totalHbar = (result.recordsProcessed || 0) * hbarPerRecord;
      const hbarToUsdRate = 0.05;
      const totalUsd = totalHbar * hbarToUsdRate;
      
      const revenue = {
        totalHbar,
        totalUsd,
        patient: {
          hbar: totalHbar * 0.6,
          usd: totalUsd * 0.6,
          percentage: 60,
        },
        hospital: {
          hbar: totalHbar * 0.25,
          usd: totalUsd * 0.25,
          percentage: 25,
        },
        medipact: {
          hbar: totalHbar * 0.15,
          usd: totalUsd * 0.15,
          percentage: 15,
        },
      };

      // Clean up temp file
      await fs.unlink(tempFilePath).catch(() => {});

      return NextResponse.json({
        recordsProcessed: result.recordsProcessed || 0,
        consentProofs: result.consentProofs || 0,
        dataProofs: result.dataProofs || 0,
        consentTopicId: result.consentTopicId,
        dataTopicId: result.dataTopicId,
        transactions: result.transactions || [],
        revenue,
      });
    } catch (error: any) {
      // Clean up temp file on error
      await fs.unlink(tempFilePath).catch(() => {});
      
      console.error('Processing error:', error);
      return NextResponse.json(
        {
          error: 'Processing failed',
          details: error.message,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
