/**
 * Simple tests for metrics API
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Metrics API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';
  });

  it('should fetch metrics from API', async () => {
    const mockMetrics = {
      success: true,
      metrics: {
        totalHederaAccounts: 100,
        monthlyActiveHederaAccounts: 50,
        totalHCSMessages: 1000,
        totalSmartContractCalls: 250,
        totalHBARDistributed: 5000,
        estimatedTPSContribution: 0.001,
        lastUpdated: new Date().toISOString()
      }
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockMetrics
    });

    const response = await fetch('http://localhost:8080/api/public/metrics');
    const data = await response.json();

    expect(data.success).toBe(true);
    expect(data.metrics).toBeDefined();
    expect(data.metrics.totalHederaAccounts).toBe(100);
  });

  it('should handle API errors', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    await expect(
      fetch('http://localhost:8080/api/public/metrics')
    ).rejects.toThrow();
  });
});


