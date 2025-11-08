/**
 * Test Utilities and Helpers
 * 
 * Common utilities for testing API routes, components, and integrations
 */

import { NextRequest } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Create a mock NextRequest with FormData
 */
export function createMockRequest(file: File | null = null): NextRequest {
  const formData = new FormData();
  if (file) {
    formData.append('file', file);
  }

  const url = 'http://localhost:3000/api/adapter/process';
  const request = new NextRequest(url, {
    method: 'POST',
    body: formData,
  });

  return request;
}

/**
 * Create a sample CSV file for testing
 */
export async function createSampleCSV(
  records: Array<Record<string, string>> = []
): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'medipact-test-'));
  const filePath = path.join(tempDir, 'test_data.csv');

  // Default sample data if none provided
  const defaultRecords = [
    {
      'Patient ID': 'P001',
      'Name': 'John Doe',
      'Age': '35',
      'Diagnosis': 'Hypertension',
      'Treatment': 'Medication A',
    },
    {
      'Patient ID': 'P002',
      'Name': 'Jane Smith',
      'Age': '42',
      'Diagnosis': 'Diabetes',
      'Treatment': 'Medication B',
    },
  ];

  const data = records.length > 0 ? records : defaultRecords;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map((record) => headers.map((h) => (record as Record<string, string>)[h] || '').join(',')),
  ].join('\n');

  await fs.writeFile(filePath, csvContent, 'utf-8');
  return filePath;
}

/**
 * Create a File object from a file path
 */
export async function createFileFromPath(
  filePath: string,
  fileName: string = 'test.csv',
  mimeType: string = 'text/csv'
): Promise<File> {
  const content = await fs.readFile(filePath);
  const blob = new Blob([content], { type: mimeType });
  return new File([blob], fileName, { type: mimeType });
}

/**
 * Create an empty file
 */
export async function createEmptyFile(): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'medipact-test-'));
  const filePath = path.join(tempDir, 'empty.csv');
  await fs.writeFile(filePath, '', 'utf-8');
  return filePath;
}

/**
 * Create a large file for testing
 */
export async function createLargeFile(sizeInMB: number = 5): Promise<string> {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'medipact-test-'));
  const filePath = path.join(tempDir, 'large.csv');
  
  const header = 'Patient ID,Name,Age,Diagnosis,Treatment\n';
  const record = 'P001,John Doe,35,Hypertension,Medication A\n';
  const recordSize = Buffer.byteLength(record, 'utf-8');
  const targetSize = sizeInMB * 1024 * 1024;
  const numRecords = Math.floor((targetSize - Buffer.byteLength(header, 'utf-8')) / recordSize);

  const content = header + record.repeat(numRecords);
  await fs.writeFile(filePath, content, 'utf-8');
  return filePath;
}

/**
 * Clean up temporary files
 */
export async function cleanupTempFile(filePath: string): Promise<void> {
  try {
    await fs.unlink(filePath);
    const dir = path.dirname(filePath);
    await fs.rmdir(dir).catch(() => {
      // Directory might not be empty, ignore
    });
  } catch (error) {
    // File might not exist, ignore
  }
}

/**
 * Mock Hedera transaction response
 */
export function createMockTransactionResponse() {
  return {
    transactions: [
      {
        type: 'consent' as const,
        transactionId: '0.0.123456@1234567890.123456789',
        hashScanLink: 'https://hashscan.io/testnet/transaction/0.0.123456@1234567890.123456789',
        timestamp: new Date().toISOString(),
        patientId: 'P001',
      },
      {
        type: 'data' as const,
        transactionId: '0.0.123457@1234567891.123456789',
        hashScanLink: 'https://hashscan.io/testnet/transaction/0.0.123457@1234567891.123456789',
        timestamp: new Date().toISOString(),
        anonymousPID: 'anon-P001',
      },
    ],
    total: 2,
  };
}

/**
 * Mock processing result
 */
export function createMockProcessingResult() {
  return {
    success: true,
    recordsProcessed: 2,
    consentProofs: 2,
    dataProofs: 2,
    consentTopicId: '0.0.123456',
    dataTopicId: '0.0.123457',
    transactions: createMockTransactionResponse().transactions,
  };
}

/**
 * Wait for a specified amount of time
 */
export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Mock adapter output file
 */
export async function createMockAdapterOutput(
  outputDir: string,
  records: number = 2
): Promise<void> {
  await fs.mkdir(outputDir, { recursive: true });
  const outputFile = path.join(outputDir, 'anonymized_data.csv');
  
  const header = 'Anonymous PID,Age,Diagnosis,Treatment\n';
  const content = header + 
    Array.from({ length: records }, (_, i) => 
      `anon-P00${i + 1},35,Hypertension,Medication A`
    ).join('\n');
  
  await fs.writeFile(outputFile, content, 'utf-8');
}

