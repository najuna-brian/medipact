import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET() {
  try {
    const adapterPath = process.env.ADAPTER_PATH || path.join(process.cwd(), '../adapter');
    const outputFile = path.join(adapterPath, 'data', 'anonymized_data.csv');

    try {
      const content = await fs.readFile(outputFile, 'utf-8');
      const lines = content.split('\n').filter((line) => line.trim());
      const headers = lines[0]?.split(',') || [];
      const records = lines.slice(1).map((line) => {
        const values = line.split(',');
        const record: any = {};
        headers.forEach((header, idx) => {
          record[header.trim()] = values[idx]?.trim() || '';
        });
        return record;
      });

      return NextResponse.json({
        records,
        total: records.length,
      });
    } catch (error) {
      return NextResponse.json(
        { error: 'No results found' },
        { status: 404 }
      );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

