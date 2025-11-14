/**
 * Environment Variable Validation
 * 
 * Validates all required environment variables on startup.
 * Ensures production readiness.
 */

import { logError, logWarn, logInfo } from '../utils/logger.js';

const REQUIRED_ENV_VARS = {
  // Hedera Configuration
  OPERATOR_ID: {
    required: true,
    description: 'Hedera operator account ID',
    validate: (value) => /^0\.0\.\d+$/.test(value)
  },
  OPERATOR_KEY: {
    required: true,
    description: 'Hedera operator private key (ECDSA)',
    validate: (value) => value && value.length > 0
  },
  PLATFORM_HEDERA_ACCOUNT_ID: {
    required: true,
    description: 'Platform Hedera account ID for receiving payments',
    validate: (value) => /^0\.0\.\d+$/.test(value)
  },
  
  // Database Configuration
  DATABASE_URL: {
    required: process.env.USE_POSTGRES === 'true',
    description: 'PostgreSQL connection string (required if USE_POSTGRES=true)',
    validate: (value) => value && value.startsWith('postgresql://')
  },
  
  // Security
  JWT_SECRET: {
    required: process.env.NODE_ENV === 'production',
    description: 'JWT secret for token signing',
    validate: (value) => value && value.length >= 32
  },
  
  // Optional but recommended
  NODE_ENV: {
    required: false,
    description: 'Environment (development, production, test)',
    default: 'development'
  },
  LOG_LEVEL: {
    required: false,
    description: 'Logging level (ERROR, WARN, INFO, DEBUG)',
    default: process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG'
  },
  PORT: {
    required: false,
    description: 'Server port',
    default: '3002',
    validate: (value) => {
      const port = parseInt(value);
      return port > 0 && port < 65536;
    }
  }
};

/**
 * Validate environment variables
 */
export function validateEnvironment() {
  const errors = [];
  const warnings = [];
  
  logInfo('Validating environment variables...');
  
  for (const [key, config] of Object.entries(REQUIRED_ENV_VARS)) {
    const value = process.env[key];
    
    if (config.required && !value) {
      errors.push(`Missing required environment variable: ${key} (${config.description})`);
    } else if (value && config.validate && !config.validate(value)) {
      errors.push(`Invalid value for ${key}: ${config.description}`);
    } else if (!value && config.default) {
      process.env[key] = config.default;
      logInfo(`Using default value for ${key}: ${config.default}`);
    }
  }
  
  // Additional production-specific validations
  if (process.env.NODE_ENV === 'production') {
    // Ensure secure defaults in production
    if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
      errors.push('JWT_SECRET must be at least 32 characters in production');
    }
    
    if (process.env.LOG_LEVEL === 'DEBUG') {
      warnings.push('DEBUG logging is enabled in production - consider using INFO or WARN');
    }
    
    // Warn about testnet in production
    if (process.env.HEDERA_NETWORK === 'testnet') {
      warnings.push('Using Hedera testnet in production - ensure this is intentional');
    }
  }
  
  // Display results
  if (errors.length > 0) {
    logError('Environment validation failed:', null, { errors });
    throw new Error(`Environment validation failed: ${errors.join('; ')}`);
  }
  
  if (warnings.length > 0) {
    warnings.forEach(warning => logWarn(warning));
  }
  
  logInfo('Environment validation passed', {
    nodeEnv: process.env.NODE_ENV,
    logLevel: process.env.LOG_LEVEL,
    hederaNetwork: process.env.HEDERA_NETWORK || 'mainnet'
  });
  
  return true;
}

/**
 * Get validated environment variable
 */
export function getEnv(key, defaultValue = null) {
  const value = process.env[key];
  if (!value && defaultValue === null) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value || defaultValue;
}

/**
 * Check if running in production
 */
export function isProduction() {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if running in development
 */
export function isDevelopment() {
  return process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
}

