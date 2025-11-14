/**
 * Pricing Service
 * 
 * Standardized category-based pricing at 40% of market rate.
 * Prices are calculated in HBAR but displayed in USD to users.
 * Uses dynamic exchange rate from exchange-rate-service.
 */

import { getHBARToUSDRate, getCachedHBARToUSDRate } from './exchange-rate-service.js';

/**
 * Get current HBAR to USD rate (async)
 * Falls back to cached rate if API fails
 */
async function getHBARToUSD() {
  try {
    return await getHBARToUSDRate();
  } catch (error) {
    return getCachedHBARToUSDRate();
  }
}

/**
 * Get current HBAR to USD rate (sync, uses cache)
 * Use this for synchronous operations
 */
function getHBARToUSDSync() {
  return getCachedHBARToUSDRate();
}

/**
 * Get USD to HBAR rate (async)
 */
async function getUSDToHBAR() {
  const hbarToUsd = await getHBARToUSD();
  return 1 / hbarToUsd;
}

/**
 * Pricing Categories at 40% of Market Rate
 * Based on comprehensive market research
 */
export const PRICING_CATEGORIES = {
  BASIC_DEMOGRAPHICS: {
    id: 'CAT-BASIC',
    name: 'Basic Demographics',
    basePricePerRecordHBAR: 0.2, // 0.2 HBAR
    basePricePerRecordUSD: 0.032, // ~$0.032
    marketRateUSD: { min: 0.05, max: 0.10 },
    mediPactRateUSD: 0.032, // 40% of $0.075 avg
    discount: '60% off market',
    includesDemographics: true,
    includesConditions: false,
    includesObservations: false
  },
  CONDITIONS: {
    id: 'CAT-CONDITIONS',
    name: 'Condition Data',
    basePricePerRecordHBAR: 0.75, // 0.75 HBAR
    basePricePerRecordUSD: 0.12, // ~$0.12
    marketRateUSD: { min: 0.10, max: 0.50 },
    mediPactRateUSD: 0.12, // 40% of $0.30 avg
    discount: '60% off market',
    includesDemographics: true,
    includesConditions: true,
    includesObservations: false
  },
  OBSERVATIONS: {
    id: 'CAT-OBSERVATIONS',
    name: 'Lab Results',
    basePricePerRecordHBAR: 1.5, // 1.5 HBAR
    basePricePerRecordUSD: 0.24, // ~$0.24
    marketRateUSD: { min: 0.20, max: 1.00 },
    mediPactRateUSD: 0.24, // 40% of $0.60 avg
    discount: '60% off market',
    includesDemographics: true,
    includesConditions: false,
    includesObservations: true
  },
  COMBINED: {
    id: 'CAT-COMBINED',
    name: 'Combined Dataset',
    basePricePerRecordHBAR: 6.25, // 6.25 HBAR
    basePricePerRecordUSD: 1.00, // ~$1.00
    marketRateUSD: { min: 1.00, max: 5.00 },
    mediPactRateUSD: 1.00, // 40% of $2.50 avg
    discount: '60% off market',
    includesDemographics: true,
    includesConditions: true,
    includesObservations: true
  },
  LONGITUDINAL: {
    id: 'CAT-LONGITUDINAL',
    name: 'Longitudinal Data',
    basePricePerRecordHBAR: 12.5, // 12.5 HBAR
    basePricePerRecordUSD: 2.00, // ~$2.00
    marketRateUSD: { min: 2.00, max: 10.00 },
    mediPactRateUSD: 2.00, // 40% of $5.00 avg
    discount: '60% off market',
    includesDemographics: true,
    includesConditions: true,
    includesObservations: true,
    isLongitudinal: true
  },
  SENSITIVE: {
    id: 'CAT-SENSITIVE',
    name: 'Sensitive/Rare Conditions',
    basePricePerRecordHBAR: 31.25, // 31.25 HBAR
    basePricePerRecordUSD: 5.00, // ~$5.00
    marketRateUSD: { min: 5.00, max: 20.00 },
    mediPactRateUSD: 5.00, // 40% of $12.50 avg
    discount: '60% off market',
    includesDemographics: true,
    includesConditions: true,
    includesObservations: true,
    isSensitive: true
  }
};

/**
 * Volume Discount Tiers
 */
export const VOLUME_DISCOUNTS = [
  { min: 1, max: 100, discount: 0, tier: 'Tier 1' },
  { min: 101, max: 1000, discount: 0.10, tier: 'Tier 2' },
  { min: 1001, max: 10000, discount: 0.20, tier: 'Tier 3' },
  { min: 10001, max: 100000, discount: 0.30, tier: 'Tier 4' },
  { min: 100001, max: Infinity, discount: 0.40, tier: 'Tier 5' }
];

/**
 * Determine pricing category for a dataset
 * @param {Object} dataset - Dataset metadata
 * @returns {Object} Pricing category
 */
export function determinePricingCategory(dataset) {
  const hasConditions = dataset.conditionCodes && 
    (Array.isArray(dataset.conditionCodes) ? dataset.conditionCodes.length > 0 : true);
  const hasObservations = dataset.observationTypes && dataset.observationTypes.length > 0;
  const isLongitudinal = dataset.isLongitudinal || false;
  const isSensitive = dataset.containsSensitiveData || false;
  
  // Check for sensitive conditions
  const sensitiveConditions = ['B20', 'F32', 'F33', 'F41', 'F42']; // HIV, Depression, etc.
  let hasSensitive = false;
  
  if (hasConditions && dataset.conditionCodes) {
    const codes = Array.isArray(dataset.conditionCodes) 
      ? dataset.conditionCodes 
      : (typeof dataset.conditionCodes === 'string' ? JSON.parse(dataset.conditionCodes) : []);
    hasSensitive = codes.some(code => sensitiveConditions.includes(code));
  }
  
  if (hasSensitive || isSensitive) {
    return PRICING_CATEGORIES.SENSITIVE;
  }
  
  if (isLongitudinal) {
    return PRICING_CATEGORIES.LONGITUDINAL;
  }
  
  if (hasConditions && hasObservations) {
    return PRICING_CATEGORIES.COMBINED;
  }
  
  if (hasObservations) {
    return PRICING_CATEGORIES.OBSERVATIONS;
  }
  
  if (hasConditions) {
    return PRICING_CATEGORIES.CONDITIONS;
  }
  
  return PRICING_CATEGORIES.BASIC_DEMOGRAPHICS;
}

/**
 * Get volume discount tier for record count
 * @param {number} recordCount - Number of records
 * @returns {Object} Discount tier
 */
function getVolumeDiscountTier(recordCount) {
  for (const tier of VOLUME_DISCOUNTS) {
    if (recordCount >= tier.min && (tier.max === Infinity || recordCount <= tier.max)) {
      return tier;
    }
  }
  return VOLUME_DISCOUNTS[0]; // Default: no discount
}

/**
 * Calculate dataset price
 * @param {number} recordCount - Number of records
 * @param {Object} category - Pricing category
 * @returns {Promise<Object>} Pricing details
 */
export async function calculateDatasetPrice(recordCount, category) {
  // Base price in HBAR
  const basePriceHBAR = category.basePricePerRecordHBAR * recordCount;
  
  // Apply volume discount
  const discountTier = getVolumeDiscountTier(recordCount);
  const discountAmountHBAR = basePriceHBAR * discountTier.discount;
  const finalPriceHBAR = basePriceHBAR - discountAmountHBAR;
  
  // Get current exchange rate
  const hbarToUsd = await getHBARToUSD();
  const usdToHbar = 1 / hbarToUsd;
  
  // Convert to USD for display
  const basePriceUSD = basePriceHBAR * hbarToUsd;
  const finalPriceUSD = finalPriceHBAR * hbarToUsd;
  
  return {
    recordCount,
    category: category.name,
    categoryId: category.id,
    pricing: {
      basePricePerRecordHBAR: category.basePricePerRecordHBAR,
      basePricePerRecordUSD: category.basePricePerRecordUSD * (hbarToUsd / 0.16), // Adjust for current rate
      totalBasePriceHBAR: basePriceHBAR,
      totalBasePriceUSD: basePriceUSD,
      volumeDiscount: discountTier.discount,
      discountTier: discountTier.tier,
      discountAmountHBAR,
      discountAmountUSD: discountAmountHBAR * hbarToUsd,
      finalPriceHBAR,
      finalPriceUSD,
      finalPricePerRecordHBAR: finalPriceHBAR / recordCount,
      finalPricePerRecordUSD: finalPriceUSD / recordCount
    },
    marketComparison: {
      marketMinUSD: category.marketRateUSD.min * recordCount,
      marketMaxUSD: category.marketRateUSD.max * recordCount,
      marketAvgUSD: ((category.marketRateUSD.min + category.marketRateUSD.max) / 2) * recordCount,
      mediPactPriceUSD: finalPriceUSD,
      savingsUSD: ((category.marketRateUSD.min + category.marketRateUSD.max) / 2 * recordCount) - finalPriceUSD,
      savingsPercentage: 60 // 60% off market
    },
    exchangeRate: {
      hbarToUsd,
      usdToHbar,
      lastUpdated: new Date().toISOString()
    }
  };
}

/**
 * Get current HBAR exchange rate
 * @returns {Promise<Object>} Exchange rate info
 */
export async function getHBARExchangeRate() {
  const hbarToUsd = await getHBARToUSD();
  const usdToHbar = 1 / hbarToUsd;
  return {
    usdToHbar,
    hbarToUsd,
    lastUpdated: new Date().toISOString()
  };
}

/**
 * Convert HBAR to USD (async)
 * @param {number} hbar - Amount in HBAR
 * @returns {Promise<number>} Amount in USD
 */
export async function hbarToUSD(hbar) {
  const rate = await getHBARToUSD();
  return hbar * rate;
}

/**
 * Convert HBAR to USD (sync, uses cached rate)
 * @param {number} hbar - Amount in HBAR
 * @returns {number} Amount in USD
 */
export function hbarToUSDSync(hbar) {
  const rate = getHBARToUSDSync();
  return hbar * rate;
}

/**
 * Convert USD to HBAR (async)
 * @param {number} usd - Amount in USD
 * @returns {Promise<number>} Amount in HBAR
 */
export async function usdToHBAR(usd) {
  const rate = await getUSDToHBAR();
  return usd * rate;
}

/**
 * Format price for display (USD)
 * @param {number} priceUSD - Price in USD
 * @param {Object} options - Formatting options
 * @returns {string} Formatted price string
 */
export function formatPriceUSD(priceUSD, options = {}) {
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
 * Format price for display (HBAR)
 * @param {number} priceHBAR - Price in HBAR
 * @param {Object} options - Formatting options
 * @returns {string} Formatted price string
 */
export function formatPriceHBAR(priceHBAR, options = {}) {
  const {
    showCurrency = true,
    decimals = 2,
    compact = false
  } = options;
  
  if (compact && priceHBAR >= 1000) {
    const formatted = (priceHBAR / 1000).toFixed(1);
    return showCurrency ? `${formatted}K HBAR` : `${formatted}K`;
  }
  
  const formatted = priceHBAR.toFixed(decimals);
  return showCurrency ? `${formatted} HBAR` : formatted;
}

