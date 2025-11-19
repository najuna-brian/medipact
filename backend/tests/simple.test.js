/**
 * Simple smoke tests - these should always pass
 * Used to verify the test setup is working
 */

import { describe, it, expect } from 'vitest';

describe('Simple Smoke Tests', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should verify test environment', () => {
    expect(process.env).toBeDefined();
    expect(typeof process.env).toBe('object');
  });

  it('should verify Node.js is available', () => {
    expect(process.version).toBeDefined();
    expect(process.version.startsWith('v')).toBe(true);
  });

  it('should verify imports work', async () => {
    const { initDatabase } = await import('../../src/db/database.js');
    expect(initDatabase).toBeDefined();
    expect(typeof initDatabase).toBe('function');
  });

  it('should verify services can be imported', async () => {
    const metrics = await import('../../src/services/hedera-metrics-service.js');
    expect(metrics).toBeDefined();
    expect(metrics.getAllHederaMetrics).toBeDefined();
  });
});


