/**
 * Mock Hedera SDK Utilities
 * 
 * Mocks for Hedera SDK components used in testing
 * 
 * Note: These are utility functions. Actual mocks are created
 * in test files using vi.mock() for proper module mocking.
 */

/**
 * Create a mock Hedera Client
 * @param {Function} vi - Vitest vi object for creating mocks
 * @returns {Object} Mock client object
 */
export function createMockClient(vi) {
  return {
    operatorAccountId: {
      toString: () => '0.0.1234567'
    },
    close: vi.fn(),
    setOperator: vi.fn(),
  };
}

/**
 * Create a mock TransactionResponse
 * @param {string} transactionId - Transaction ID string
 * @returns {Object} Mock transaction response
 */
export function createMockTransactionResponse(transactionId = '0.0.1234567@1234567890.123456789') {
  return {
    transactionId: {
      toString: () => transactionId
    },
    getReceipt: vi.fn().mockResolvedValue({
      status: { _code: 22 }, // Status.Success
      topicId: { toString: () => '0.0.1234568' },
      accountId: { toString: () => '0.0.1234569' }
    }),
    getRecord: vi.fn().mockResolvedValue({
      transactionHash: new Uint8Array([1, 2, 3, 4])
    })
  };
}

/**
 * Create a mock TopicCreateTransaction
 * @returns {Object} Mock topic create transaction
 */
export function createMockTopicCreateTransaction() {
  const mockResponse = createMockTransactionResponse();
  
  return {
    setTopicMemo: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue(mockResponse)
  };
}

/**
 * Create a mock TopicMessageSubmitTransaction
 * @returns {Object} Mock topic message submit transaction
 */
export function createMockTopicMessageSubmitTransaction() {
  const mockResponse = createMockTransactionResponse();
  
  return {
    setTopicId: vi.fn().mockReturnThis(),
    setMessage: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue(mockResponse)
  };
}

/**
 * Create a mock ContractExecuteTransaction
 * @returns {Object} Mock contract execute transaction
 */
export function createMockContractExecuteTransaction() {
  const mockResponse = createMockTransactionResponse();
  
  return {
    setContractId: vi.fn().mockReturnThis(),
    setGas: vi.fn().mockReturnThis(),
    setFunction: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue(mockResponse)
  };
}

/**
 * Create a mock TransferTransaction
 * @returns {Object} Mock transfer transaction
 */
export function createMockTransferTransaction() {
  const mockResponse = createMockTransactionResponse();
  
  return {
    addHbarTransfer: vi.fn().mockReturnThis(),
    execute: vi.fn().mockResolvedValue(mockResponse)
  };
}

