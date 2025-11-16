/**
 * Network Configuration Utility for Adapter
 * 
 * Automatically determines Hedera network based on environment:
 * - Production (NODE_ENV=production): mainnet
 * - Development: testnet
 * 
 * Can be overridden with HEDERA_NETWORK environment variable
 */

/**
 * Get Hedera network name
 * @returns {string} Network name: 'mainnet', 'testnet', or 'previewnet'
 */
export function getHederaNetwork() {
  const envNetwork = process.env.HEDERA_NETWORK;
  
  // If explicitly set, validate and use it
  if (envNetwork) {
    const validNetworks = ['mainnet', 'testnet', 'previewnet'];
    const normalized = envNetwork.toLowerCase();
    
    if (validNetworks.includes(normalized)) {
      return normalized;
    }
    
    throw new Error(
      `Invalid HEDERA_NETWORK: ${envNetwork}. ` +
      `Must be one of: ${validNetworks.join(', ')}`
    );
  }
  
  // Default based on NODE_ENV
  if (process.env.NODE_ENV === 'production') {
    return 'mainnet';
  }
  
  return 'testnet';
}

/**
 * Check if running in production
 * @returns {boolean}
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 * @returns {boolean}
 */
export function isDevelopment() {
  return process.env.NODE_ENV !== 'production';
}

