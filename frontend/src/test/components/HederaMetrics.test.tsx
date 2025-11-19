/**
 * Simple tests for HederaMetrics component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { HederaMetrics } from '@/components/HederaMetrics/HederaMetrics';

// Mock fetch
global.fetch = vi.fn();

describe('HederaMetrics Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8080';
  });

  it('should render loading state initially', () => {
    (global.fetch as any).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading
    );

    render(<HederaMetrics />);
    expect(screen.getByText(/Loading Hedera metrics/i)).toBeInTheDocument();
  });

  it('should render metrics when data is loaded', async () => {
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
      },
      network: 'testnet'
    };

    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockMetrics
    });

    render(<HederaMetrics />);

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
    });

    expect(screen.getByText(/Hedera Network Impact/i)).toBeInTheDocument();
  });

  it('should render error state when fetch fails', async () => {
    (global.fetch as any).mockRejectedValue(new Error('Network error'));

    render(<HederaMetrics />);

    await waitFor(() => {
      expect(screen.getByText(/Error/i)).toBeInTheDocument();
    });
  });
});


