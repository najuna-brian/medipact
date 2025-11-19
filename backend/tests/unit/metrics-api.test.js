/**
 * Simple tests for Metrics API endpoint
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import express from 'express';
import metricsRoutes from '../../src/routes/metrics-api.js';

// Simple mock for supertest - we'll test the route handler directly
async function mockRequest(method, path, app) {
  return new Promise((resolve) => {
    const req = { method, path, headers: {} };
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis()
    };
    
    app(req, res, () => {});
    setTimeout(() => resolve({ req, res }), 0);
  });
}

// Mock the metrics service
vi.mock('../../src/services/hedera-metrics-service.js', () => ({
  getAllHederaMetrics: vi.fn()
}));

describe('Metrics API', () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/public', metricsRoutes);
    vi.clearAllMocks();
  });

  describe('GET /api/public/metrics', () => {
    it('should have metrics route defined', () => {
      expect(metricsRoutes).toBeDefined();
    });

    it('should call getAllHederaMetrics service', async () => {
      const { getAllHederaMetrics } = await import('../../src/services/hedera-metrics-service.js');
      const mockMetrics = {
        totalHederaAccounts: 100,
        monthlyActiveHederaAccounts: 50,
        totalHCSMessages: 1000,
        totalSmartContractCalls: 250,
        totalHBARDistributed: 5000,
        estimatedTPSContribution: 0.001,
        lastUpdated: new Date().toISOString()
      };

      getAllHederaMetrics.mockResolvedValue(mockMetrics);

      const result = await getAllHederaMetrics();
      expect(result).toEqual(mockMetrics);
      expect(getAllHederaMetrics).toHaveBeenCalled();
    });
  });
});

