/**
 * Automatic Withdrawal Job
 * 
 * Background job to process automatic withdrawals for users with balance above threshold.
 * Can be triggered by admin or run on a schedule (e.g., monthly).
 */

import { processAutomaticWithdrawals } from './withdrawal-service.js';

let withdrawalJobInterval = null;

/**
 * Start automatic withdrawal job
 * @param {number} intervalMinutes - Interval in minutes (default: 1440 = daily)
 */
export function startAutomaticWithdrawalJob(intervalMinutes = 1440) {
  if (withdrawalJobInterval) {
    console.log('Automatic withdrawal job already running');
    return;
  }

  console.log(`Starting automatic withdrawal job (runs every ${intervalMinutes} minutes)`);
  
  // Run immediately on start
  runWithdrawalJob();
  
  // Then run on schedule
  withdrawalJobInterval = setInterval(() => {
    runWithdrawalJob();
  }, intervalMinutes * 60 * 1000);
}

/**
 * Stop automatic withdrawal job
 */
export function stopAutomaticWithdrawalJob() {
  if (withdrawalJobInterval) {
    clearInterval(withdrawalJobInterval);
    withdrawalJobInterval = null;
    console.log('Automatic withdrawal job stopped');
  }
}

/**
 * Run withdrawal job once
 */
async function runWithdrawalJob() {
  try {
    console.log('Running automatic withdrawal job...');
    const results = await processAutomaticWithdrawals();
    console.log(`Withdrawal job completed: ${results.processed} processed, ${results.skipped} skipped, ${results.errors.length} errors`);
    
    if (results.errors.length > 0) {
      console.error('Withdrawal job errors:', results.errors);
    }
  } catch (error) {
    console.error('Error running withdrawal job:', error);
  }
}

/**
 * Manually trigger withdrawal job (for admin use)
 */
export async function triggerWithdrawalJob() {
  return await processAutomaticWithdrawals();
}

