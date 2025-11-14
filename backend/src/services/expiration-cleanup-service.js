/**
 * Expiration Cleanup Service
 * 
 * Background job to clean up expired temporary access requests.
 * Should be run periodically (e.g., every 5 minutes via cron).
 */

import { cleanupExpiredAccess } from './temporary-access-service.js';

/**
 * Run cleanup of expired access requests
 * @returns {Promise<number>} Number of expired requests cleaned up
 */
export async function runExpirationCleanup() {
  try {
    const expiredCount = await cleanupExpiredAccess();
    console.log(`[CLEANUP] Expired ${expiredCount} temporary access requests`);
    return expiredCount;
  } catch (error) {
    console.error('[CLEANUP] Error cleaning up expired access requests:', error);
    throw error;
  }
}

/**
 * Start periodic cleanup job
 * @param {number} intervalMinutes - Cleanup interval in minutes (default: 5)
 */
export function startExpirationCleanupJob(intervalMinutes = 5) {
  // Run immediately
  runExpirationCleanup();
  
  // Then run periodically
  const intervalMs = intervalMinutes * 60 * 1000;
  setInterval(() => {
    runExpirationCleanup();
  }, intervalMs);
  
  console.log(`[CLEANUP] Started expiration cleanup job (interval: ${intervalMinutes} minutes)`);
}

