/**
 * Wallet API Routes
 * 
 * Endpoints for viewing balances and managing withdrawals.
 */

import express from 'express';
import { getPatientBalanceWithDetails, getHospitalBalanceWithDetails, getResearcherBalanceWithDetails } from '../services/balance-service.js';
import { initiatePatientWithdrawal, initiateHospitalWithdrawal } from '../services/withdrawal-service.js';
import { getPatientWithdrawals, getHospitalWithdrawals } from '../db/withdrawal-db.js';

const router = express.Router();

/**
 * GET /api/patient/:upi/wallet/balance
 * Get patient wallet balance
 */
router.get('/patient/:upi/wallet/balance', async (req, res) => {
  try {
    const { upi } = req.params;
    const balance = await getPatientBalanceWithDetails(upi);
    res.json(balance);
  } catch (error) {
    console.error('Error getting patient balance:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/hospital/:hospitalId/wallet/balance
 * Get hospital wallet balance
 */
router.get('/hospital/:hospitalId/wallet/balance', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const balance = await getHospitalBalanceWithDetails(hospitalId);
    res.json(balance);
  } catch (error) {
    console.error('Error getting hospital balance:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/researcher/:researcherId/wallet/balance
 * Get researcher wallet balance
 * Public endpoint - no authentication required
 */
router.get('/researcher/:researcherId/wallet/balance', async (req, res) => {
  try {
    const { researcherId } = req.params;
    console.log(`[WALLET] Fetching balance for researcher: ${researcherId}`);
    
    // Validate researcherId format
    if (!researcherId || !researcherId.startsWith('RES-')) {
      console.error(`[WALLET] Invalid researcher ID format: ${researcherId}`);
      return res.status(400).json({ error: 'Invalid researcher ID format. Must start with RES-' });
    }
    
    const balance = await getResearcherBalanceWithDetails(researcherId);
    console.log(`[WALLET] Balance fetched successfully for ${researcherId}: ${balance.balanceHBAR} HBAR`);
    res.json(balance);
  } catch (error) {
    console.error(`[WALLET] Error getting researcher balance for ${req.params.researcherId}:`, error);
    // Provide more detailed error information
    const errorMessage = error.message || 'Failed to fetch balance';
    const statusCode = error.message?.includes('not found') ? 404 : 500;
    res.status(statusCode).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/patient/:upi/wallet/withdraw
 * Initiate patient withdrawal
 */
router.post('/patient/:upi/wallet/withdraw', async (req, res) => {
  try {
    const { upi } = req.params;
    const { amountUSD } = req.body;
    
    const result = await initiatePatientWithdrawal(upi, amountUSD);
    res.json(result);
  } catch (error) {
    console.error('Error initiating patient withdrawal:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * POST /api/hospital/:hospitalId/wallet/withdraw
 * Initiate hospital withdrawal
 */
router.post('/hospital/:hospitalId/wallet/withdraw', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { amountUSD } = req.body;
    
    const result = await initiateHospitalWithdrawal(hospitalId, amountUSD);
    res.json(result);
  } catch (error) {
    console.error('Error initiating hospital withdrawal:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/patient/:upi/wallet/withdrawals
 * Get patient withdrawal history
 */
router.get('/patient/:upi/wallet/withdrawals', async (req, res) => {
  try {
    const { upi } = req.params;
    const { limit = 50 } = req.query;
    const withdrawals = await getPatientWithdrawals(upi, parseInt(limit));
    res.json(withdrawals);
  } catch (error) {
    console.error('Error getting patient withdrawals:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/hospital/:hospitalId/wallet/withdrawals
 * Get hospital withdrawal history
 */
router.get('/hospital/:hospitalId/wallet/withdrawals', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { limit = 50 } = req.query;
    const withdrawals = await getHospitalWithdrawals(hospitalId, parseInt(limit));
    res.json(withdrawals);
  } catch (error) {
    console.error('Error getting hospital withdrawals:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

