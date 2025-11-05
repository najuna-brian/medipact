/**
 * Currency Utilities
 * 
 * Handles HBAR formatting and currency conversions
 * 
 * Currency Conversion Flow:
 *   HBAR → USD → Local Currency (configurable)
 * 
 * USD is the standard base currency for all conversions.
 * Local currency is optional and configurable via environment variable.
 * 
 * Note: HBAR has 8 decimal places (1 HBAR = 100,000,000 tinybars)
 * 
 * In production, fetch real-time rates from:
 *   - HBAR/USD: Hedera Network Exchange Rate (system file 0.0.112) or CoinGecko API
 *   - USD/Local: Exchange rate API (e.g., exchangerate-api.com, fixer.io)
 */

/**
 * Format HBAR amount with proper decimal precision
 * @param {number} hbarAmount - Amount in HBAR
 * @param {number} decimals - Number of decimal places (default: 8 for HBAR)
 * @returns {string} Formatted HBAR string
 */
export function formatHbar(hbarAmount, decimals = 8) {
  return hbarAmount.toFixed(decimals).replace(/\.0+$/, '');
}

/**
 * Convert HBAR to tinybars
 * @param {number} hbarAmount - Amount in HBAR
 * @returns {number} Amount in tinybars
 */
export function hbarToTinybars(hbarAmount) {
  return Math.floor(hbarAmount * 100000000);
}

/**
 * Convert tinybars to HBAR
 * @param {number} tinybars - Amount in tinybars
 * @returns {number} Amount in HBAR
 */
export function tinybarsToHbar(tinybars) {
  return tinybars / 100000000;
}

/**
 * Convert HBAR to USD
 * @param {number} hbarAmount - Amount in HBAR
 * @param {number} hbarToUsdRate - Exchange rate (USD per HBAR)
 * @returns {number} Amount in USD
 */
export function hbarToUsd(hbarAmount, hbarToUsdRate) {
  return hbarAmount * hbarToUsdRate;
}

/**
 * Convert USD to local currency
 * @param {number} usdAmount - Amount in USD
 * @param {number} usdToLocalRate - Exchange rate (local currency per USD)
 * @returns {number} Amount in local currency
 */
export function usdToLocal(usdAmount, usdToLocalRate) {
  return usdAmount * usdToLocalRate;
}

/**
 * Convert HBAR to local currency via USD
 * @param {number} hbarAmount - Amount in HBAR
 * @param {number} hbarToUsdRate - Exchange rate (USD per HBAR)
 * @param {number} usdToLocalRate - Exchange rate (local currency per USD)
 * @returns {number} Amount in local currency
 */
export function hbarToLocal(hbarAmount, hbarToUsdRate, usdToLocalRate) {
  const usdAmount = hbarToUsd(hbarAmount, hbarToUsdRate);
  return usdToLocal(usdAmount, usdToLocalRate);
}

/**
 * Get default decimal places for a currency
 * @param {string} currency - Currency code (ISO 4217)
 * @returns {number} Default decimal places
 */
function getDefaultDecimals(currency) {
  // Common currencies with 0 decimals
  const zeroDecimalCurrencies = ['UGX', 'KES', 'TZS', 'RWF', 'JPY', 'KRW', 'VND'];
  
  if (zeroDecimalCurrencies.includes(currency)) {
    return 0;
  }
  
  // USD and most currencies use 2 decimals
  return 2;
}

/**
 * Format currency amount with proper decimal places
 * @param {number} amount - Currency amount
 * @param {string} currency - Currency code (ISO 4217, default: 'USD')
 * @param {number} decimals - Number of decimal places (auto-determined if not provided)
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount, currency = 'USD', decimals = null) {
  // Auto-determine decimals if not provided
  if (decimals === null) {
    decimals = getDefaultDecimals(currency);
  }
  
  // For zero-decimal currencies, round to whole numbers
  if (decimals === 0) {
    return `${Math.round(amount).toLocaleString()} ${currency}`;
  }
  
  // For currencies with decimals, format with specified precision
  return `${amount.toFixed(decimals).toLocaleString()} ${currency}`;
}

/**
 * Calculate revenue split
 * @param {number} totalAmount - Total revenue amount
 * @param {Object} percentages - Split percentages {patient: 60, hospital: 25, medipact: 15}
 * @returns {Object} Split amounts {patient, hospital, medipact}
 */
export function calculateRevenueSplit(totalAmount, percentages = { patient: 60, hospital: 25, medipact: 15 }) {
  const totalPercent = percentages.patient + percentages.hospital + percentages.medipact;
  
  if (Math.abs(totalPercent - 100) > 0.01) {
    throw new Error(`Revenue split percentages must sum to 100%, got ${totalPercent}%`);
  }

  return {
    patient: totalAmount * (percentages.patient / 100),
    hospital: totalAmount * (percentages.hospital / 100),
    medipact: totalAmount * (percentages.medipact / 100)
  };
}

