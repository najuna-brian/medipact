/**
 * Exchange Rate Service
 * 
 * Fetches and caches HBAR to USD exchange rate.
 * Uses CoinGecko API with fallback to hardcoded rate.
 */

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const FALLBACK_RATE = 0.16; // Fallback if API fails

let cachedRate = {
  rate: FALLBACK_RATE,
  timestamp: 0,
  source: 'fallback'
};

/**
 * Fetch HBAR to USD rate from CoinGecko
 */
async function fetchRateFromAPI() {
  try {
    const response = await fetch(
      `${COINGECKO_API_URL}?ids=hedera-hashgraph&vs_currencies=usd`
    );

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    const rate = data['hedera-hashgraph']?.usd;

    if (!rate || rate <= 0) {
      throw new Error('Invalid rate from CoinGecko');
    }

    return rate;
  } catch (error) {
    console.error('Error fetching exchange rate from CoinGecko:', error.message);
    throw error;
  }
}

/**
 * Get current HBAR to USD exchange rate
 * Uses cached rate if available and fresh, otherwise fetches new rate
 * 
 * @returns {Promise<number>} Exchange rate (1 HBAR = X USD)
 */
export async function getHBARToUSDRate() {
  const now = Date.now();
  const cacheAge = now - cachedRate.timestamp;

  // Return cached rate if still fresh
  if (cacheAge < CACHE_DURATION_MS && cachedRate.rate > 0) {
    return cachedRate.rate;
  }

  // Fetch new rate
  try {
    const rate = await fetchRateFromAPI();
    cachedRate = {
      rate,
      timestamp: now,
      source: 'coingecko'
    };
    console.log(`✅ Updated HBAR/USD rate: ${rate} (source: CoinGecko)`);
    return rate;
  } catch (error) {
    console.warn('⚠️ Using fallback exchange rate due to API error');
    // Use fallback rate but don't update timestamp (so we retry next time)
    if (cachedRate.source === 'fallback') {
      cachedRate.rate = FALLBACK_RATE;
      cachedRate.timestamp = now; // Update timestamp to prevent constant retries
    }
    return cachedRate.rate;
  }
}

/**
 * Get cached rate synchronously (may be stale)
 * Use this when you need a rate immediately and can't wait for async fetch
 * 
 * @returns {number} Cached exchange rate
 */
export function getCachedHBARToUSDRate() {
  return cachedRate.rate;
}

/**
 * Force refresh the exchange rate
 * 
 * @returns {Promise<number>} New exchange rate
 */
export async function refreshExchangeRate() {
  cachedRate.timestamp = 0; // Force refresh
  return await getHBARToUSDRate();
}

/**
 * Initialize exchange rate on startup
 */
export async function initializeExchangeRate() {
  try {
    await getHBARToUSDRate();
    console.log('✅ Exchange rate service initialized');
  } catch (error) {
    console.warn('⚠️ Exchange rate initialization failed, using fallback');
  }
}

