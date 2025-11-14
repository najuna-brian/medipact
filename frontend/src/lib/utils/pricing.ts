/**
 * Pricing Utility Functions
 * 
 * Helper functions for formatting and displaying prices in USD
 */

/**
 * Format price in USD
 * @param priceUSD - Price in USD
 * @param options - Formatting options
 * @returns Formatted price string
 */
export function formatPriceUSD(priceUSD: number, options: {
  showCurrency?: boolean;
  decimals?: number;
  compact?: boolean;
} = {}): string {
  const {
    showCurrency = true,
    decimals = 2,
    compact = false
  } = options;
  
  if (compact && priceUSD >= 1000) {
    const formatted = (priceUSD / 1000).toFixed(1);
    return showCurrency ? `$${formatted}K` : `${formatted}K`;
  }
  
  const formatted = priceUSD.toFixed(decimals);
  return showCurrency ? `$${formatted}` : formatted;
}

/**
 * Format price per record
 * @param pricePerRecordUSD - Price per record in USD
 * @returns Formatted price string
 */
export function formatPricePerRecord(pricePerRecordUSD: number): string {
  if (pricePerRecordUSD < 0.01) {
    return `$${pricePerRecordUSD.toFixed(4)} per record`;
  }
  return `$${pricePerRecordUSD.toFixed(2)} per record`;
}

/**
 * Calculate price in USD from HBAR
 * @param priceHBAR - Price in HBAR
 * @param exchangeRate - HBAR to USD exchange rate (default: 0.16)
 * @returns Price in USD
 */
export function hbarToUSD(priceHBAR: number, exchangeRate: number = 0.16): number {
  return priceHBAR * exchangeRate;
}

/**
 * Format volume discount percentage
 * @param discount - Discount as decimal (0.0 to 1.0)
 * @returns Formatted discount string
 */
export function formatVolumeDiscount(discount: number): string {
  return `${Math.round(discount * 100)}%`;
}

