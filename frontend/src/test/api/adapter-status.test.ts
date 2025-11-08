/**
 * API Route Tests: /api/adapter/status
 * 
 * Tests for processing status endpoint
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/adapter/status/route';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('GET /api/adapter/status', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'medipact-test-'));
    // Create data subdirectory to match expected structure
    await fs.mkdir(path.join(tempDir, 'data'), { recursive: true });
  });

  it('should return processing status when output file exists', async () => {
    // Create mock output file in data subdirectory
    const outputFile = path.join(tempDir, 'data', 'anonymized_data.csv');
    await fs.writeFile(outputFile, 'header\nrecord1\nrecord2', 'utf-8');

    const originalEnv = process.env.ADAPTER_PATH;
    process.env.ADAPTER_PATH = tempDir;

    try {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('completed');
    } finally {
      if (originalEnv) {
        process.env.ADAPTER_PATH = originalEnv;
      } else {
        delete process.env.ADAPTER_PATH;
      }
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  it('should return processing status when output file does not exist', async () => {
    // Don't create output file
    const originalEnv = process.env.ADAPTER_PATH;
    process.env.ADAPTER_PATH = tempDir;

    try {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('idle');
    } finally {
      if (originalEnv) {
        process.env.ADAPTER_PATH = originalEnv;
      } else {
        delete process.env.ADAPTER_PATH;
      }
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    }
  });

  it('should handle errors gracefully', async () => {
    // Set invalid path - route handles this gracefully by returning idle status
    const originalEnv = process.env.ADAPTER_PATH;
    process.env.ADAPTER_PATH = '/nonexistent/invalid/path';

    try {
      const response = await GET();
      const data = await response.json();

      // Route handles errors gracefully and returns 200 with idle status
      expect(response.status).toBe(200);
      expect(data.status).toBe('idle');
    } finally {
      if (originalEnv) {
        process.env.ADAPTER_PATH = originalEnv;
      } else {
        delete process.env.ADAPTER_PATH;
      }
    }
  });
});

