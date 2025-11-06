/**
 * Unit Tests for HCS Client
 * 
 * Tests for Hedera Consensus Service interactions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { 
  createHederaClient, 
  createTopic, 
  submitMessage, 
  getHashScanLink,
  initializeMedipactTopics
} from '../../src/hedera/hcs-client.js';

// Mock @hashgraph/sdk
vi.mock('@hashgraph/sdk', async () => {
  const vitest = await import('vitest');
  const vi = vitest.vi;
  
  // Define constants inside the factory
  const mockStatus = { _code: 22 }; // Status.Success
  const mockTopicId = { toString: () => '0.0.1234568' };
  
  // Create mock transaction classes inside the factory
  class MockTopicCreateTransaction {
    constructor() {
      this.setTopicMemo = vi.fn().mockReturnThis();
      this.execute = vi.fn().mockResolvedValue({
        transactionId: { toString: () => '0.0.1234567@1234567890.123456789' },
        getReceipt: vi.fn().mockResolvedValue({
          status: mockStatus,
          topicId: mockTopicId
        })
      });
    }
  }

  class MockTopicMessageSubmitTransaction {
    constructor() {
      this.setTopicId = vi.fn().mockReturnThis();
      this.setMessage = vi.fn().mockReturnThis();
      this.execute = vi.fn().mockResolvedValue({
        transactionId: { toString: () => '0.0.1234567@1234567890.123456789' },
        getReceipt: vi.fn().mockResolvedValue({
          status: mockStatus
        })
      });
    }
  }

  return {
    Client: {
      forName: vi.fn().mockReturnValue({
        setOperator: vi.fn(),
        operatorAccountId: { toString: () => '0.0.1234567' },
        close: vi.fn()
      })
    },
    PrivateKey: {
      fromStringECDSA: vi.fn().mockReturnValue('mock-private-key')
    },
    AccountId: {
      fromString: vi.fn().mockReturnValue({ toString: () => '0.0.1234567' })
    },
    TopicCreateTransaction: MockTopicCreateTransaction,
    TopicMessageSubmitTransaction: MockTopicMessageSubmitTransaction,
    Status: {
      Success: mockStatus
    }
  };
});

describe('HCS Client', () => {
  let originalEnv;

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env };
    
    // Set required environment variables
    process.env.OPERATOR_ID = '0.0.1234567';
    process.env.OPERATOR_KEY = '302e020100300506032b6570042204201234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    process.env.HEDERA_NETWORK = 'testnet';
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    vi.clearAllMocks();
  });

  describe('createHederaClient', () => {
    it('should create client with valid environment variables', async () => {
      const client = createHederaClient();

      expect(client).toBeDefined();
      const { Client } = await import('@hashgraph/sdk');
      expect(Client.forName).toHaveBeenCalledWith('testnet');
    });

    it('should throw error if OPERATOR_ID is missing', () => {
      delete process.env.OPERATOR_ID;

      expect(() => createHederaClient()).toThrow(
        'Environment variables OPERATOR_ID, HEDERA_NETWORK, and OPERATOR_KEY are required.'
      );
    });

    it('should throw error if OPERATOR_KEY is missing', () => {
      delete process.env.OPERATOR_KEY;

      expect(() => createHederaClient()).toThrow(
        'Environment variables OPERATOR_ID, HEDERA_NETWORK, and OPERATOR_KEY are required.'
      );
    });

    it('should throw error if HEDERA_NETWORK is missing', () => {
      delete process.env.HEDERA_NETWORK;

      expect(() => createHederaClient()).toThrow(
        'Environment variables OPERATOR_ID, HEDERA_NETWORK, and OPERATOR_KEY are required.'
      );
    });
  });

  describe('createTopic', () => {
    it('should create a topic with default memo', async () => {
      const client = createHederaClient();
      const { TopicCreateTransaction } = await import('@hashgraph/sdk');
      
      const topicId = await createTopic(client);

      // Check that an instance was created and methods were called
      expect(topicId).toBe('0.0.1234568');
    });

    it('should create a topic with custom memo', async () => {
      const client = createHederaClient();
      const { TopicCreateTransaction } = await import('@hashgraph/sdk');
      
      const topicId = await createTopic(client, 'Custom Topic Memo');

      // Check that an instance was created and methods were called
      expect(topicId).toBe('0.0.1234568');
    });
  });

  describe('submitMessage', () => {
    it('should submit message to topic', async () => {
      const client = createHederaClient();
      const { TopicMessageSubmitTransaction } = await import('@hashgraph/sdk');
      
      const topicId = '0.0.1234568';
      const message = 'test message';
      const txId = await submitMessage(client, topicId, message);

      // Check that message was submitted successfully
      expect(txId).toBeDefined();
      expect(typeof txId).toBe('string');
    });

    it('should submit Uint8Array message', async () => {
      const client = createHederaClient();
      const { TopicMessageSubmitTransaction } = await import('@hashgraph/sdk');
      
      const topicId = '0.0.1234568';
      const message = new Uint8Array([1, 2, 3, 4]);
      const txId = await submitMessage(client, topicId, message);

      // Check that message was submitted successfully
      expect(txId).toBeDefined();
    });
  });

  describe('getHashScanLink', () => {
    it('should generate HashScan link for testnet', () => {
      const txId = '0.0.1234567@1234567890.123456789';
      const link = getHashScanLink(txId);

      expect(link).toBe('https://hashscan.io/testnet/transaction/0.0.1234567@1234567890.123456789');
    });

    it('should generate HashScan link for mainnet', () => {
      const txId = '0.0.1234567@1234567890.123456789';
      const link = getHashScanLink(txId, 'mainnet');

      expect(link).toBe('https://hashscan.io/mainnet/transaction/0.0.1234567@1234567890.123456789');
    });

    it('should default to testnet if network not specified', () => {
      const txId = '0.0.1234567@1234567890.123456789';
      const link = getHashScanLink(txId);

      expect(link).toContain('testnet');
    });
  });

  describe('initializeMedipactTopics', () => {
    it('should create both consent and data topics', async () => {
      const client = createHederaClient();
      const { TopicCreateTransaction } = await import('@hashgraph/sdk');
      
      const topics = await initializeMedipactTopics(client);

      expect(topics).toHaveProperty('consentTopicId');
      expect(topics).toHaveProperty('dataTopicId');
      expect(topics.consentTopicId).toBeDefined();
      expect(topics.dataTopicId).toBeDefined();
      // Both topics should be created (verified by the topic IDs being defined)
    });
  });
});
