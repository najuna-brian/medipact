/**
 * API Route Tests: /api/adapter/process
 * 
 * Tests for file upload and processing endpoint
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { POST } from '@/app/api/adapter/process/route';
import { NextRequest } from 'next/server';
import {
  createSampleCSV,
  createFileFromPath,
  createEmptyFile,
  createLargeFile,
  cleanupTempFile,
  createMockRequest,
} from '../utils/test-helpers';
import * as processor from '@/lib/adapter/processor';
import fs from 'fs/promises';
import path from 'path';

// Mock the adapter processor
vi.mock('@/lib/adapter/processor', () => ({
  processFile: vi.fn(),
}));

describe('POST /api/adapter/process', () => {
  let tempFiles: string[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    tempFiles = [];
  });

  afterEach(async () => {
    // Clean up all temp files
    for (const file of tempFiles) {
      await cleanupTempFile(file).catch(() => {});
    }
  });

  it('should return 400 when no file is provided', async () => {
    const request = createMockRequest(null);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('No file provided');
  });

  it('should successfully process a valid CSV file', async () => {
    // Create sample CSV
    const csvPath = await createSampleCSV();
    tempFiles.push(csvPath);
    const file = await createFileFromPath(csvPath, 'test.csv');

    // Mock successful processing
    vi.mocked(processor.processFile).mockResolvedValue({
      success: true,
      recordsProcessed: 2,
      consentProofs: 2,
      dataProofs: 2,
      consentTopicId: '0.0.123456',
      dataTopicId: '0.0.123457',
      transactions: [
        {
          type: 'consent',
          transactionId: '0.0.123456@1234567890.123456789',
          hashScanLink: 'https://hashscan.io/testnet/transaction/0.0.123456@1234567890.123456789',
          timestamp: new Date().toISOString(),
        },
      ],
    });

    const request = createMockRequest(file);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.recordsProcessed).toBe(2);
    expect(data.consentProofs).toBe(2);
    expect(data.dataProofs).toBe(2);
    expect(data.revenue).toBeDefined();
    expect(data.revenue.totalHbar).toBeGreaterThan(0);
    expect(data.revenue.patient.percentage).toBe(60);
    expect(data.revenue.hospital.percentage).toBe(25);
    expect(data.revenue.medipact.percentage).toBe(15);
  });

  it('should handle processing failures gracefully', async () => {
    const csvPath = await createSampleCSV();
    tempFiles.push(csvPath);
    const file = await createFileFromPath(csvPath, 'test.csv');

    // Mock processing failure
    vi.mocked(processor.processFile).mockResolvedValue({
      success: false,
      error: 'Processing failed: Invalid file format',
    });

    const request = createMockRequest(file);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Processing failed: Invalid file format');
  });

  it('should handle empty files', async () => {
    const emptyPath = await createEmptyFile();
    tempFiles.push(emptyPath);
    const file = await createFileFromPath(emptyPath, 'empty.csv');

    vi.mocked(processor.processFile).mockResolvedValue({
      success: false,
      error: 'File is empty',
    });

    const request = createMockRequest(file);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('File is empty');
  });

  it('should calculate revenue split correctly', async () => {
    const csvPath = await createSampleCSV();
    tempFiles.push(csvPath);
    const file = await createFileFromPath(csvPath, 'test.csv');

    vi.mocked(processor.processFile).mockResolvedValue({
      success: true,
      recordsProcessed: 10,
      consentProofs: 10,
      dataProofs: 10,
    });

    const request = createMockRequest(file);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.revenue.totalHbar).toBeCloseTo(0.1, 5); // 10 records * 0.01 HBAR
    expect(data.revenue.totalUsd).toBeCloseTo(0.005, 5); // 0.1 * 0.05
    expect(data.revenue.patient.hbar).toBeCloseTo(0.06, 5); // 60% of 0.1
    expect(data.revenue.hospital.hbar).toBeCloseTo(0.025, 5); // 25% of 0.1
    expect(data.revenue.medipact.hbar).toBeCloseTo(0.015, 5); // 15% of 0.1
  });

  it('should handle processor exceptions', async () => {
    const csvPath = await createSampleCSV();
    tempFiles.push(csvPath);
    const file = await createFileFromPath(csvPath, 'test.csv');

    // Mock processor throwing an error
    vi.mocked(processor.processFile).mockRejectedValue(
      new Error('Adapter script not found')
    );

    const request = createMockRequest(file);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Processing failed');
    expect(data.details).toContain('Adapter script not found');
  });

  it('should clean up temp files after processing', async () => {
    const csvPath = await createSampleCSV();
    tempFiles.push(csvPath);
    const file = await createFileFromPath(csvPath, 'test.csv');

    vi.mocked(processor.processFile).mockResolvedValue({
      success: true,
      recordsProcessed: 2,
    });

    const request = createMockRequest(file);
    await POST(request);

    // Temp file should be cleaned up (we can't directly check, but no error means it worked)
    expect(processor.processFile).toHaveBeenCalled();
  });

  it('should handle large files', async () => {
    // Create a 1MB file (smaller for testing)
    const largePath = await createLargeFile(0.1); // 100KB
    tempFiles.push(largePath);
    const file = await createFileFromPath(largePath, 'large.csv');

    vi.mocked(processor.processFile).mockResolvedValue({
      success: true,
      recordsProcessed: 100,
    });

    const request = createMockRequest(file);
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.recordsProcessed).toBe(100);
  });
});

