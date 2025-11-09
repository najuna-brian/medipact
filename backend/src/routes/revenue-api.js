/**
 * Revenue Distribution API Routes
 * 
 * Routes for distributing revenue using Hedera Account IDs.
 */

import express from 'express';
import { distributeRevenueFromSale, distributeBulkRevenue } from '../services/adapter-integration-service.js';
import { Hbar } from '@hashgraph/sdk';

const router = express.Router();

/**
 * POST /api/revenue/distribute
 * Distribute revenue from a data sale
 * 
 * Body:
 *   - patientUPI: string
 *   - hospitalId: string
 *   - totalAmount: number (in tinybars)
 *   - revenueSplitterAddress: string (optional)
 */
router.post('/distribute', async (req, res) => {
  try {
    const { patientUPI, hospitalId, totalAmount, revenueSplitterAddress } = req.body;
    
    if (!patientUPI || !hospitalId || !totalAmount) {
      return res.status(400).json({ 
        error: 'Patient UPI, Hospital ID, and total amount are required' 
      });
    }
    
    const result = await distributeRevenueFromSale({
      patientUPI,
      hospitalId,
      totalAmount,
      revenueSplitterAddress: revenueSplitterAddress || process.env.REVENUE_SPLITTER_ADDRESS || null
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error distributing revenue:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/revenue/distribute-bulk
 * Distribute revenue for multiple sales
 * 
 * Body:
 *   - sales: Array<{ patientUPI, hospitalId, amount }>
 *   - revenueSplitterAddress: string (optional)
 */
router.post('/distribute-bulk', async (req, res) => {
  try {
    const { sales, revenueSplitterAddress } = req.body;
    
    if (!sales || !Array.isArray(sales) || sales.length === 0) {
      return res.status(400).json({ 
        error: 'Sales array is required' 
      });
    }
    
    const results = await distributeBulkRevenue(
      sales,
      revenueSplitterAddress || process.env.REVENUE_SPLITTER_ADDRESS || null
    );
    
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    res.json({
      total: sales.length,
      successful,
      failed,
      results
    });
  } catch (error) {
    console.error('Error distributing bulk revenue:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

