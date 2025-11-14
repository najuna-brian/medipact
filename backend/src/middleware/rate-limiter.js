/**
 * Rate Limiting Middleware
 * 
 * Protects API endpoints from abuse and DDoS attacks.
 */

import rateLimit from 'express-rate-limit';

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Skip rate limiting for health checks
  skip: (req) => req.path === '/health',
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    error: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Skip successful requests (only count failed attempts)
  skipSuccessfulRequests: true,
});

/**
 * API key rate limiter for hospital/researcher endpoints
 * 1000 requests per hour per API key
 */
export const apiKeyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Limit each API key to 1000 requests per hour
  message: {
    error: 'API rate limit exceeded, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use API key as key instead of IP
  keyGenerator: (req) => {
    const hospitalId = req.headers['x-hospital-id'] || req.headers['X-Hospital-ID'];
    const researcherId = req.headers['x-researcher-id'] || req.headers['X-Researcher-ID'];
    const apiKey = req.headers['x-api-key'] || req.headers['X-API-Key'];
    
    if (hospitalId && apiKey) {
      return `hospital:${hospitalId}`;
    }
    if (researcherId) {
      return `researcher:${researcherId}`;
    }
    // Fallback to IP if no API key
    return req.ip || req.connection.remoteAddress;
  },
});

/**
 * Query rate limiter for data queries
 * 50 queries per hour per researcher
 */
export const queryLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 50, // Limit to 50 queries per hour
  message: {
    error: 'Query rate limit exceeded. Please wait before making more queries.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const researcherId = req.headers['x-researcher-id'] || req.headers['X-Researcher-ID'] || req.body?.researcherId || req.query?.researcherId;
    if (researcherId) {
      return `query:${researcherId}`;
    }
    return req.ip || req.connection.remoteAddress;
  },
});

/**
 * Purchase rate limiter
 * 10 purchases per hour per researcher
 */
export const purchaseLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit to 10 purchases per hour
  message: {
    error: 'Purchase rate limit exceeded. Please wait before making more purchases.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    const researcherId = req.body?.researcherId || req.query?.researcherId;
    if (researcherId) {
      return `purchase:${researcherId}`;
    }
    return req.ip || req.connection.remoteAddress;
  },
});

