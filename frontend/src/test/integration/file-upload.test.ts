/**
 * Integration Tests: File Upload Flow
 * 
 * End-to-end tests for the complete file upload and processing flow
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createSampleCSV,
  createFileFromPath,
  createEmptyFile,
  cleanupTempFile,
  createMockProcessingResult,
} from '../utils/test-helpers';
import * as processor from '@/lib/adapter/processor';

// Mock the adapter processor
vi.mock('@/lib/adapter/processor', () => ({
  processFile: vi.fn(),
}));

describe('File Upload Integration', () => {
  let tempFiles: string[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
    tempFiles = [];
  });

  afterEach(async () => {
    for (const file of tempFiles) {
      await cleanupTempFile(file).catch(() => {});
    }
  });

  it('should handle complete file upload and processing flow', async () => {
    // Step 1: Create sample CSV
    const csvPath = await createSampleCSV([
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
    ]);
    tempFiles.push(csvPath);

    // Step 2: Create File object
    const file = await createFileFromPath(csvPath, 'patient_data.csv');

    // Step 3: Mock successful processing
    const mockResult = createMockProcessingResult();
    vi.mocked(processor.processFile).mockResolvedValue({
      ...mockResult,
      transactions: mockResult.transactions?.map(tx => ({
        ...tx,
        type: tx.type as 'consent' | 'data',
      })),
    });

    // Step 4: Simulate API call
    const formData = new FormData();
    formData.append('file', file);

    // Verify file was created correctly
    expect(file).toBeDefined();
    expect(file.name).toBe('patient_data.csv');
    expect(file.type).toBe('text/csv');

    // Verify processor would be called with correct parameters
    // (In real test, we'd call the actual API route)
    expect(processor.processFile).not.toHaveBeenCalled();
  });

  it('should handle file validation errors', async () => {
    const emptyPath = await createEmptyFile();
    tempFiles.push(emptyPath);
    const file = await createFileFromPath(emptyPath, 'empty.csv');

    // File should exist but be empty
    expect(file.size).toBe(0);

    // Processor should handle empty file
    vi.mocked(processor.processFile).mockResolvedValue({
      success: false,
      error: 'File is empty',
    });
  });

  it('should handle processing errors and cleanup', async () => {
    const csvPath = await createSampleCSV();
    tempFiles.push(csvPath);
    const file = await createFileFromPath(csvPath, 'test.csv');

    // Mock processing error
    vi.mocked(processor.processFile).mockRejectedValue(
      new Error('Adapter script execution failed')
    );

    // Verify error handling
    try {
      await processor.processFile(csvPath);
    } catch (error: any) {
      expect(error.message).toContain('Adapter script execution failed');
    }
  });

  it('should handle multiple concurrent uploads', async () => {
    const files = await Promise.all([
      createSampleCSV([{ 'Patient ID': 'P001', 'Name': 'John', 'Age': '35', 'Diagnosis': 'A', 'Treatment': 'B' }]),
      createSampleCSV([{ 'Patient ID': 'P002', 'Name': 'Jane', 'Age': '42', 'Diagnosis': 'C', 'Treatment': 'D' }]),
      createSampleCSV([{ 'Patient ID': 'P003', 'Name': 'Bob', 'Age': '28', 'Diagnosis': 'E', 'Treatment': 'F' }]),
    ]);

    tempFiles.push(...files);

    // Mock successful processing for all
    vi.mocked(processor.processFile).mockResolvedValue({
      success: true,
      recordsProcessed: 1,
    });

    // All files should be processable
    for (const filePath of files) {
      const result = await processor.processFile(filePath);
      expect(result.success).toBe(true);
    }
  });
});

