/**
 * Unit Tests for Currency Utilities
 * 
 * Tests for HBAR formatting and currency conversion functions
 */

import { describe, it, expect } from 'vitest';
import {
  formatHbar,
  hbarToTinybars,
  tinybarsToHbar,
  hbarToUsd,
  usdToLocal,
  hbarToLocal,
  formatCurrency,
  calculateRevenueSplit
} from '../../src/utils/currency.js';

describe('Currency Utilities', () => {
  describe('formatHbar', () => {
    it('should format HBAR with 8 decimal places by default', () => {
      const formatted = formatHbar(1.5);
      expect(formatted).toBe('1.50000000');
    });

    it('should remove trailing zeros', () => {
      const formatted = formatHbar(1.0);
      expect(formatted).toBe('1');
    });

    it('should handle zero', () => {
      const formatted = formatHbar(0);
      expect(formatted).toBe('0');
    });

    it('should handle custom decimal places', () => {
      const formatted = formatHbar(1.5, 2);
      expect(formatted).toBe('1.50');
    });

    it('should handle very small amounts', () => {
      const formatted = formatHbar(0.00000001);
      expect(formatted).toBe('0.00000001');
    });

    it('should handle large amounts', () => {
      const formatted = formatHbar(1000000.5);
      expect(formatted).toBe('1000000.50000000');
    });
  });

  describe('hbarToTinybars', () => {
    it('should convert 1 HBAR to 100000000 tinybars', () => {
      const tinybars = hbarToTinybars(1);
      expect(tinybars).toBe(100000000);
    });

    it('should convert 0.5 HBAR to 50000000 tinybars', () => {
      const tinybars = hbarToTinybars(0.5);
      expect(tinybars).toBe(50000000);
    });

    it('should handle zero', () => {
      const tinybars = hbarToTinybars(0);
      expect(tinybars).toBe(0);
    });

    it('should handle fractional HBAR', () => {
      const tinybars = hbarToTinybars(0.01);
      expect(tinybars).toBe(1000000);
    });

    it('should floor fractional parts', () => {
      const tinybars = hbarToTinybars(1.99999999);
      expect(tinybars).toBe(199999999);
    });
  });

  describe('tinybarsToHbar', () => {
    it('should convert 100000000 tinybars to 1 HBAR', () => {
      const hbar = tinybarsToHbar(100000000);
      expect(hbar).toBe(1);
    });

    it('should convert 50000000 tinybars to 0.5 HBAR', () => {
      const hbar = tinybarsToHbar(50000000);
      expect(hbar).toBe(0.5);
    });

    it('should handle zero', () => {
      const hbar = tinybarsToHbar(0);
      expect(hbar).toBe(0);
    });

    it('should handle fractional tinybars', () => {
      const hbar = tinybarsToHbar(50000000);
      expect(hbar).toBe(0.5);
    });
  });

  describe('hbarToUsd', () => {
    it('should convert HBAR to USD correctly', () => {
      const usd = hbarToUsd(10, 0.05);
      expect(usd).toBe(0.5);
    });

    it('should handle zero HBAR', () => {
      const usd = hbarToUsd(0, 0.05);
      expect(usd).toBe(0);
    });

    it('should handle different exchange rates', () => {
      const usd1 = hbarToUsd(10, 0.05);
      const usd2 = hbarToUsd(10, 0.10);
      
      expect(usd1).toBe(0.5);
      expect(usd2).toBe(1.0);
    });

    it('should handle fractional HBAR', () => {
      const usd = hbarToUsd(0.5, 0.05);
      expect(usd).toBe(0.025);
    });
  });

  describe('usdToLocal', () => {
    it('should convert USD to local currency', () => {
      const local = usdToLocal(1, 3700);
      expect(local).toBe(3700);
    });

    it('should handle zero USD', () => {
      const local = usdToLocal(0, 3700);
      expect(local).toBe(0);
    });

    it('should handle different exchange rates', () => {
      const local1 = usdToLocal(1, 3700); // UGX
      const local2 = usdToLocal(1, 150);  // KES
      
      expect(local1).toBe(3700);
      expect(local2).toBe(150);
    });

    it('should handle fractional USD', () => {
      const local = usdToLocal(0.5, 3700);
      expect(local).toBe(1850);
    });
  });

  describe('hbarToLocal', () => {
    it('should convert HBAR to local currency via USD', () => {
      const local = hbarToLocal(10, 0.05, 3700);
      // 10 HBAR * 0.05 USD/HBAR = 0.5 USD
      // 0.5 USD * 3700 UGX/USD = 1850 UGX
      expect(local).toBe(1850);
    });

    it('should handle zero HBAR', () => {
      const local = hbarToLocal(0, 0.05, 3700);
      expect(local).toBe(0);
    });

    it('should handle different currencies', () => {
      const ugx = hbarToLocal(10, 0.05, 3700);
      const kes = hbarToLocal(10, 0.05, 150);
      
      expect(ugx).toBe(1850);
      expect(kes).toBe(75);
    });
  });

  describe('formatCurrency', () => {
    it('should format USD with 2 decimals', () => {
      const formatted = formatCurrency(123.456, 'USD');
      expect(formatted).toBe('123.46 USD');
    });

    it('should format zero-decimal currencies (UGX)', () => {
      const formatted = formatCurrency(1234.56, 'UGX');
      expect(formatted).toBe('1,235 UGX'); // Rounded
    });

    it('should format zero-decimal currencies (KES)', () => {
      const formatted = formatCurrency(1234.56, 'KES');
      expect(formatted).toBe('1,235 KES');
    });

    it('should handle custom decimal places', () => {
      const formatted = formatCurrency(123.456, 'USD', 4);
      expect(formatted).toBe('123.4560 USD');
    });

    it('should format large numbers with commas', () => {
      const formatted = formatCurrency(1234567.89, 'USD');
      expect(formatted).toBe('1,234,567.89 USD');
    });

    it('should handle zero amount', () => {
      const formatted = formatCurrency(0, 'USD');
      expect(formatted).toBe('0.00 USD');
    });

    it('should use default USD if currency not specified', () => {
      const formatted = formatCurrency(123.45);
      expect(formatted).toBe('123.45 USD');
    });
  });

  describe('calculateRevenueSplit', () => {
    it('should calculate 60/25/15 split correctly', () => {
      const total = 100;
      const split = calculateRevenueSplit(total);

      expect(split.patient).toBe(60);
      expect(split.hospital).toBe(25);
      expect(split.medipact).toBe(15);
    });

    it('should handle fractional amounts', () => {
      const total = 0.1;
      const split = calculateRevenueSplit(total);

      expect(split.patient).toBeCloseTo(0.06, 10);
      expect(split.hospital).toBeCloseTo(0.025, 10);
      expect(split.medipact).toBeCloseTo(0.015, 10);
    });

    it('should allow custom split percentages', () => {
      const total = 100;
      const split = calculateRevenueSplit(total, {
        patient: 50,
        hospital: 30,
        medipact: 20
      });

      expect(split.patient).toBe(50);
      expect(split.hospital).toBe(30);
      expect(split.medipact).toBe(20);
    });

    it('should throw error if percentages do not sum to 100', () => {
      expect(() => {
        calculateRevenueSplit(100, {
          patient: 50,
          hospital: 30,
          medipact: 10 // Only 90%
        });
      }).toThrow('Revenue split percentages must sum to 100%');
    });

    it('should handle zero total', () => {
      const split = calculateRevenueSplit(0);
      expect(split.patient).toBe(0);
      expect(split.hospital).toBe(0);
      expect(split.medipact).toBe(0);
    });

    it('should handle very small amounts', () => {
      const total = 0.01;
      const split = calculateRevenueSplit(total);

      expect(split.patient).toBeCloseTo(0.006, 10);
      expect(split.hospital).toBeCloseTo(0.0025, 10);
      expect(split.medipact).toBeCloseTo(0.0015, 10);
    });

    it('should allow small rounding differences', () => {
      // Should not throw for 99.99% or 100.01% due to floating point
      const split1 = calculateRevenueSplit(100, {
        patient: 33.33,
        hospital: 33.33,
        medipact: 33.34
      });
      expect(split1).toBeDefined();
    });
  });
});

