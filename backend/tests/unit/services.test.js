/**
 * Simple service tests - verify services can be imported and have expected functions
 */

import { describe, it, expect } from 'vitest';

describe('Service Imports', () => {
  it('should import hedera-metrics-service', async () => {
    const metrics = await import('../../src/services/hedera-metrics-service.js');
    expect(metrics).toBeDefined();
    expect(metrics.getAllHederaMetrics).toBeDefined();
    expect(typeof metrics.getAllHederaMetrics).toBe('function');
  });

  it('should import hedera-account-service', async () => {
    const account = await import('../../src/services/hedera-account-service.js');
    expect(account).toBeDefined();
    expect(account.createHederaAccount).toBeDefined();
    expect(typeof account.createHederaAccount).toBe('function');
  });

  it('should import revenue-distribution-service', async () => {
    const revenue = await import('../../src/services/revenue-distribution-service.js');
    expect(revenue).toBeDefined();
    expect(revenue.distributeRevenue).toBeDefined();
    expect(typeof revenue.distributeRevenue).toBe('function');
  });
});


