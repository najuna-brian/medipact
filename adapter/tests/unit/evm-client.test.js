/**
 * Unit Tests for EVM Client
 * 
 * Tests for Hedera EVM smart contract interactions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Hbar, HbarUnit } from '@hashgraph/sdk';
import { 
  recordConsentOnChain, 
  executeRealPayout 
} from '../../src/hedera/evm-client.js';

// Mock @hashgraph/sdk
vi.mock('@hashgraph/sdk', async () => {
  const vitestModule = await import('vitest');
  const vi = vitestModule.vi;
  const actual = await vi.importActual('@hashgraph/sdk');
  
  // Define constants inside the factory
  const mockStatus = { _code: 22 }; // Status.Success
  
  // Create mock transaction classes inside the factory
  class MockContractExecuteTransaction {
    constructor() {
      this.setContractId = vi.fn().mockReturnThis();
      this.setGas = vi.fn().mockReturnThis();
      this.setFunction = vi.fn().mockReturnThis();
      this.execute = vi.fn().mockResolvedValue({
        transactionId: { toString: () => '0.0.1234567@1234567890.123456789' },
        getReceipt: vi.fn().mockResolvedValue({
          status: mockStatus
        })
      });
    }
  }

  class MockContractFunctionParameters {
    constructor() {
      this.addString = vi.fn().mockReturnThis();
    }
  }

  class MockTransferTransaction {
    constructor() {
      this.addHbarTransfer = vi.fn().mockReturnThis();
      this.execute = vi.fn().mockResolvedValue({
        transactionId: { toString: () => '0.0.1234567@1234567890.123456789' },
        getReceipt: vi.fn().mockResolvedValue({
          status: mockStatus
        })
      });
    }
  }
  
  return {
    ...actual,
    ContractExecuteTransaction: MockContractExecuteTransaction,
    ContractFunctionParameters: MockContractFunctionParameters,
    TransferTransaction: MockTransferTransaction,
    ContractId: {
      fromEvmAddress: vi.fn().mockReturnValue({
        toString: () => '0.0.1234567'
      })
    },
    Status: {
      Success: mockStatus
    }
  };
});

describe('EVM Client', () => {
  let mockClient;

  beforeEach(() => {
    mockClient = {
      operatorAccountId: {
        toString: () => '0.0.1234567'
      },
      close: vi.fn()
    };
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('recordConsentOnChain', () => {
    it('should record consent on-chain successfully', async () => {
      const { ContractId } = await import('@hashgraph/sdk');
      
      const consentManagerAddress = '0xAB0BA2b7ec5dD4a32E6eA576A58f73F1E782A25F';
      const patientId = 'ID-12345';
      const anonymousPatientId = 'PID-001';
      const hcsTopicId = '0.0.1234568';
      const consentHash = 'abc123def456';

      const txId = await recordConsentOnChain(
        mockClient,
        consentManagerAddress,
        patientId,
        anonymousPatientId,
        hcsTopicId,
        consentHash
      );

      expect(ContractId.fromEvmAddress).toHaveBeenCalledWith(0, 0, consentManagerAddress);
      expect(txId).toBeDefined();
      expect(typeof txId).toBe('string');
    });

    it('should handle different consent parameters', async () => {
      const consentManagerAddress = '0xAB0BA2b7ec5dD4a32E6eA576A58f73F1E782A25F';
      
      const txId1 = await recordConsentOnChain(
        mockClient,
        consentManagerAddress,
        'ID-12345',
        'PID-001',
        '0.0.1234568',
        'hash123'
      );

      const txId2 = await recordConsentOnChain(
        mockClient,
        consentManagerAddress,
        'ID-67890',
        'PID-002',
        '0.0.1234569',
        'hash456'
      );

      expect(txId1).toBeDefined();
      expect(txId2).toBeDefined();
      expect(typeof txId1).toBe('string');
      expect(typeof txId2).toBe('string');
    });

    // Note: Error case testing for contract execution is better suited for integration tests
    // where we can test against actual contract failures
  });

  describe('executeRealPayout', () => {
    it('should execute payout transfer successfully', async () => {
      const revenueSplitterAddress = '0xCD1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9';
      const totalHbarPayout = new Hbar(100);

      const txId = await executeRealPayout(
        mockClient,
        revenueSplitterAddress,
        totalHbarPayout
      );

      expect(txId).toBeDefined();
      expect(typeof txId).toBe('string');
    });

    it('should handle different HBAR amounts', async () => {
      const revenueSplitterAddress = '0xCD1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9';
      
      // Test with 0.5 HBAR
      const smallPayout = new Hbar(0.5);
      const txId1 = await executeRealPayout(mockClient, revenueSplitterAddress, smallPayout);
      
      // Test with 1000 HBAR
      const largePayout = new Hbar(1000);
      const txId2 = await executeRealPayout(mockClient, revenueSplitterAddress, largePayout);

      expect(txId1).toBeDefined();
      expect(txId2).toBeDefined();
      expect(typeof txId1).toBe('string');
      expect(typeof txId2).toBe('string');
    });

    it('should handle zero HBAR amount', async () => {
      const revenueSplitterAddress = '0xCD1E2F3A4B5C6D7E8F9A0B1C2D3E4F5A6B7C8D9';
      const zeroPayout = new Hbar(0);

      const txId = await executeRealPayout(
        mockClient,
        revenueSplitterAddress,
        zeroPayout
      );

      expect(txId).toBeDefined();
      expect(typeof txId).toBe('string');
    });

    // Note: Error case testing for transfers is better suited for integration tests
    // where we can test against actual network failures
  });
});

