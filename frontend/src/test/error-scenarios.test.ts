/**
 * Error Scenario Tests
 * 
 * Tests for various error conditions and edge cases
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/adapter/process/route';
import { GET as getTransactions } from '@/app/api/hedera/transactions/route';
import { GET as getStatus } from '@/app/api/adapter/status/route';
import { NextRequest } from 'next/server';
import * as processor from '@/lib/adapter/processor';
import * as mirrorNode from '@/lib/hedera/mirror-node';
import fs from 'fs/promises';

// Mock dependencies
vi.mock('@/lib/adapter/processor', () => ({
  processFile: vi.fn(),
}));

vi.mock('@/lib/hedera/mirror-node', () => ({
  getTransactions: vi.fn(),
  getTopicInfo: vi.fn(),
  getHCSTopicMessages: vi.fn(),
}));

describe('Error Scenarios', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Network Failures', () => {
    it('should handle network timeout errors', async () => {
      vi.mocked(mirrorNode.getTransactions).mockRejectedValue(
        new Error('Network timeout')
      );

      const url = new URL('http://localhost:3000/api/hedera/transactions');
      const request = new NextRequest(url);
      const response = await getTransactions(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should handle connection refused errors', async () => {
      vi.mocked(mirrorNode.getTransactions).mockRejectedValue(
        new Error('ECONNREFUSED')
      );

      const url = new URL('http://localhost:3000/api/hedera/transactions');
      const request = new NextRequest(url);
      const response = await getTransactions(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('Invalid API Responses', () => {
    it('should handle malformed JSON responses', async () => {
      vi.mocked(mirrorNode.getTransactions).mockRejectedValue(
        new Error('Unexpected token < in JSON at position 0')
      );

      const url = new URL('http://localhost:3000/api/hedera/transactions');
      const request = new NextRequest(url);
      const response = await getTransactions(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should handle empty responses', async () => {
      vi.mocked(mirrorNode.getTransactions).mockResolvedValue([]);

      const url = new URL('http://localhost:3000/api/hedera/transactions');
      const request = new NextRequest(url);
      const response = await getTransactions(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.transactions).toEqual([]);
      expect(data.total).toBe(0);
    });
  });

  describe('Missing Data', () => {
    it('should handle missing file uploads', async () => {
      const formData = new FormData();
      const request = new NextRequest('http://localhost:3000/api/adapter/process', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('No file provided');
    });

    it('should handle missing environment variables gracefully', async () => {
      const originalEnv = process.env.NEXT_PUBLIC_HEDERA_NETWORK;
      delete process.env.NEXT_PUBLIC_HEDERA_NETWORK;

      try {
        const url = new URL('http://localhost:3000/api/hedera/transactions');
        const request = new NextRequest(url);
        
        // Should default to 'testnet'
        vi.mocked(mirrorNode.getTransactions).mockResolvedValue([]);
        const response = await getTransactions(request);
        
        expect(response.status).toBe(200);
        expect(mirrorNode.getTransactions).toHaveBeenCalledWith('testnet', 50);
      } finally {
        if (originalEnv) {
          process.env.NEXT_PUBLIC_HEDERA_NETWORK = originalEnv;
        }
      }
    });
  });

  describe('Timeout Scenarios', () => {
    it('should handle processing timeouts', async () => {
      vi.mocked(processor.processFile).mockImplementation(
        () => new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 100);
        })
      );

      const formData = new FormData();
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/adapter/process', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });

  describe('Invalid User Inputs', () => {
    it('should handle invalid file types', async () => {
      const formData = new FormData();
      const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/adapter/process', {
        method: 'POST',
        body: formData,
      });

      // The API should accept the file, but processing might fail
      vi.mocked(processor.processFile).mockResolvedValue({
        success: false,
        error: 'Invalid file format',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Invalid file format');
    });

    it('should handle invalid topic IDs', async () => {
      const url = new URL('http://localhost:3000/api/hedera/topics?topicId=invalid');
      const request = new NextRequest(url);

      vi.mocked(mirrorNode.getTopicInfo).mockRejectedValue(
        new Error('Invalid topic ID format')
      );

      // Import the route handler
      const { GET } = await import('@/app/api/hedera/topics/route');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should handle negative limits', async () => {
      const url = new URL('http://localhost:3000/api/hedera/transactions?limit=-10');
      const request = new NextRequest(url);

      vi.mocked(mirrorNode.getTransactions).mockResolvedValue([]);
      const response = await getTransactions(request);
      const data = await response.json();

      // Should default to 50 or handle gracefully
      expect(response.status).toBe(200);
    });
  });

  describe('File System Errors', () => {
    it('should handle file permission errors', async () => {
      vi.spyOn(fs, 'writeFile').mockRejectedValue(
        new Error('EACCES: permission denied')
      );

      const formData = new FormData();
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/adapter/process', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should handle disk full errors', async () => {
      vi.spyOn(fs, 'writeFile').mockRejectedValue(
        new Error('ENOSPC: no space left on device')
      );

      const formData = new FormData();
      const file = new File(['test'], 'test.csv', { type: 'text/csv' });
      formData.append('file', file);

      const request = new NextRequest('http://localhost:3000/api/adapter/process', {
        method: 'POST',
        body: formData,
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});

