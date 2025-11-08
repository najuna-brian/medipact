/**
 * Integration Tests: Hedera Integration
 * 
 * Tests for Hedera mirror node and smart contract integration
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET as getTransactions } from '@/app/api/hedera/transactions/route';
import { GET as getTopics } from '@/app/api/hedera/topics/route';
import { NextRequest } from 'next/server';
import * as mirrorNode from '@/lib/hedera/mirror-node';

// Mock the mirror node client
vi.mock('@/lib/hedera/mirror-node', () => ({
  getTransactions: vi.fn(),
  getTopicInfo: vi.fn(),
  getHCSTopicMessages: vi.fn(),
}));

describe('Hedera Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Transaction Retrieval', () => {
    it('should fetch transactions from mirror node', async () => {
      const mockTransactions = [
        {
          type: 'consent' as const,
          transactionId: '0.0.123456@1234567890.123456789',
          hashScanLink: 'https://hashscan.io/testnet/transaction/0.0.123456@1234567890.123456789',
          timestamp: new Date().toISOString(),
        },
        {
          type: 'data' as const,
          transactionId: '0.0.123457@1234567891.123456789',
          hashScanLink: 'https://hashscan.io/testnet/transaction/0.0.123457@1234567891.123456789',
          timestamp: new Date().toISOString(),
        },
      ];

      vi.mocked(mirrorNode.getTransactions).mockResolvedValue(mockTransactions);

      const url = new URL('http://localhost:3000/api/hedera/transactions');
      const request = new NextRequest(url);
      const response = await getTransactions(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.transactions).toHaveLength(2);
      expect(data.total).toBe(2);
      expect(mirrorNode.getTransactions).toHaveBeenCalled();
    });

    it('should filter transactions by type', async () => {
      const mockTransactions = [
        {
          type: 'consent' as const,
          transactionId: '0.0.123456@1234567890.123456789',
          hashScanLink: 'https://hashscan.io/testnet/transaction/0.0.123456@1234567890.123456789',
          timestamp: new Date().toISOString(),
        },
        {
          type: 'data' as const,
          transactionId: '0.0.123457@1234567891.123456789',
          hashScanLink: 'https://hashscan.io/testnet/transaction/0.0.123457@1234567891.123456789',
          timestamp: new Date().toISOString(),
        },
      ];

      vi.mocked(mirrorNode.getTransactions).mockResolvedValue(mockTransactions);

      const url = new URL('http://localhost:3000/api/hedera/transactions?type=consent');
      const request = new NextRequest(url);
      const response = await getTransactions(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.transactions).toHaveLength(1);
      expect(data.transactions[0].type).toBe('consent');
    });

    it('should handle mirror node errors', async () => {
      vi.mocked(mirrorNode.getTransactions).mockRejectedValue(
        new Error('Mirror node unavailable')
      );

      const url = new URL('http://localhost:3000/api/hedera/transactions');
      const request = new NextRequest(url);
      const response = await getTransactions(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });

    it('should respect limit parameter', async () => {
      const mockTransactions: Array<{ type: 'consent' | 'data'; transactionId: string; hashScanLink: string; timestamp: string }> = Array.from({ length: 100 }, (_, i) => ({
        type: 'consent' as const,
        transactionId: `0.0.${i}@1234567890.123456789`,
        hashScanLink: `https://hashscan.io/testnet/transaction/0.0.${i}@1234567890.123456789`,
        timestamp: new Date().toISOString(),
      }));

      vi.mocked(mirrorNode.getTransactions).mockResolvedValue(mockTransactions);

      const url = new URL('http://localhost:3000/api/hedera/transactions?limit=10');
      const request = new NextRequest(url);
      const response = await getTransactions(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mirrorNode.getTransactions).toHaveBeenCalledWith('testnet', 10);
    });
  });

  describe('Topic Information', () => {
    it('should fetch topic information', async () => {
      const mockTopic = {
        topic_id: '0.0.123456',
        memo: 'Consent Topic',
        running_hash: 'abc123',
        message_count: 10,
        admin_key: null,
        submit_key: null,
        auto_renew_account: null,
        auto_renew_period: null,
        expiration_timestamp: null,
      };

      vi.mocked(mirrorNode.getTopicInfo).mockResolvedValue(mockTopic);
      vi.mocked(mirrorNode.getHCSTopicMessages).mockResolvedValue([]);

      const url = new URL('http://localhost:3000/api/hedera/topics?topicId=0.0.123456');
      const request = new NextRequest(url);
      const response = await getTopics(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.topicId).toBe('0.0.123456');
      expect(mirrorNode.getTopicInfo).toHaveBeenCalledWith('0.0.123456', 'testnet');
      expect(mirrorNode.getHCSTopicMessages).toHaveBeenCalled();
    });

    it('should handle missing topic ID', async () => {
      const url = new URL('http://localhost:3000/api/hedera/topics');
      const request = new NextRequest(url);
      const response = await getTopics(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Topic ID');
    });

    it('should handle topic not found errors', async () => {
      vi.mocked(mirrorNode.getTopicInfo).mockRejectedValue(
        new Error('Topic not found')
      );

      const url = new URL('http://localhost:3000/api/hedera/topics?topicId=0.0.999999');
      const request = new NextRequest(url);
      const response = await getTopics(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBeDefined();
    });
  });
});

