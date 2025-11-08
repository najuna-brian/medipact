/**
 * API Route Tests: /api/adapter/results
 * 
 * Tests for result retrieval endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/adapter/results/route';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('GET /api/adapter/results', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'medipact-test-'));
    // Create data subdirectory to match expected structure
    await fs.mkdir(path.join(tempDir, 'data'), { recursive: true });
  });

  it('should return anonymized data when output file exists', async () => {
    // Create mock output file in data subdirectory
    const outputFile = path.join(tempDir, 'data', 'anonymized_data.csv');
    const csvContent = [
      'Anonymous PID,Age,Diagnosis,Treatment',
      'anon-P001,35,Hypertension,Medication A',
      'anon-P002,42,Diabetes,Medication B',
    ].join('\n');
    await fs.writeFile(outputFile, csvContent, 'utf-8');

    const originalEnv = process.env.ADAPTER_PATH;
    process.env.ADAPTER_PATH = tempDir;

    try {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.records).toHaveLength(2);
      expect(data.total).toBe(2);
      expect(data.records[0]['Anonymous PID']).toBe('anon-P001');
      expect(data.records[0].Age).toBe('35');
      expect(data.records[1]['Anonymous PID']).toBe('anon-P002');
    } finally {
      if (originalEnv) {
        process.env.ADAPTER_PATH = originalEnv;
      } else {
        delete process.env.ADAPTER_PATH;
      }
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  it('should return 404 when output file does not exist', async () => {
    const originalEnv = process.env.ADAPTER_PATH;
    process.env.ADAPTER_PATH = tempDir;

    try {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('No results found');
    } finally {
      if (originalEnv) {
        process.env.ADAPTER_PATH = originalEnv;
      } else {
        delete process.env.ADAPTER_PATH;
      }
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  it('should handle empty output files', async () => {
    const outputFile = path.join(tempDir, 'data', 'anonymized_data.csv');
    await fs.writeFile(outputFile, 'Anonymous PID,Age,Diagnosis,Treatment\n', 'utf-8');

    const originalEnv = process.env.ADAPTER_PATH;
    process.env.ADAPTER_PATH = tempDir;

    try {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.records).toHaveLength(0);
      expect(data.total).toBe(0);
    } finally {
      if (originalEnv) {
        process.env.ADAPTER_PATH = originalEnv;
      } else {
        delete process.env.ADAPTER_PATH;
      }
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  it('should handle malformed CSV files', async () => {
    const outputFile = path.join(tempDir, 'data', 'anonymized_data.csv');
    await fs.writeFile(outputFile, 'invalid,csv,content\n', 'utf-8');

    const originalEnv = process.env.ADAPTER_PATH;
    process.env.ADAPTER_PATH = tempDir;

    try {
      const response = await GET();
      const data = await response.json();

      // Should still return 200, but with parsed data
      expect(response.status).toBe(200);
      expect(data.records).toBeDefined();
    } finally {
      if (originalEnv) {
        process.env.ADAPTER_PATH = originalEnv;
      } else {
        delete process.env.ADAPTER_PATH;
      }
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  it('should handle file read errors', async () => {
    const originalEnv = process.env.ADAPTER_PATH;
    process.env.ADAPTER_PATH = '/nonexistent/path';

    try {
      const response = await GET();
      const data = await response.json();

      // Route returns 404 when file doesn't exist (not 500)
      expect(response.status).toBe(404);
      expect(data.error).toBe('No results found');
    } finally {
      if (originalEnv) {
        process.env.ADAPTER_PATH = originalEnv;
      } else {
        delete process.env.ADAPTER_PATH;
      }
    }
  });
});

