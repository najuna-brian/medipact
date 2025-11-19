/**
 * Simple smoke tests for frontend
 */

import { describe, it, expect } from 'vitest';

describe('Simple Frontend Tests', () => {
  it('should pass basic assertion', () => {
    expect(1 + 1).toBe(2);
  });

  it('should verify test environment', () => {
    expect(typeof window).toBe('object');
  });

  it('should verify React is available', async () => {
    const React = await import('react');
    expect(React).toBeDefined();
  });

  it('should verify Next.js is available', async () => {
    const Next = await import('next');
    expect(Next).toBeDefined();
  });
});

