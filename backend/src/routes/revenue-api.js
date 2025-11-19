/**
 * Revenue Distribution API Routes
 * 
 * Routes for distributing revenue using Hedera Account IDs.
 */

import express from 'express';
import { distributeRevenueFromSale, distributeBulkRevenue } from '../services/adapter-integration-service.js';
import { 
  getRevenueDistributionsByPurchase,
  getRevenueDistributionsByPatient,
  getRevenueDistributionsByHospital,
  getAllRevenueDistributions,
  getRevenueDistributionStats
} from '../db/revenue-distribution-db.js';
import { Hbar } from '@hashgraph/sdk';

const router = express.Router();

/**
 * @swagger
 * /api/revenue/distribute:
 *   post:
 *     summary: Distribute revenue from a data sale
 *     description: Automatically distribute revenue using Hedera smart contract. Split is 60% Patient, 25% Hospital, 15% Platform.
 *     tags: [Revenue]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientUPI
 *               - hospitalId
 *               - totalAmount
 *             properties:
 *               patientUPI:
 *                 type: string
 *                 example: "UPI-ABC123XYZ"
 *                 description: Patient UPI
 *               hospitalId:
 *                 type: string
 *                 example: "HOSP-001"
 *                 description: Hospital ID
 *               totalAmount:
 *                 type: number
 *                 example: 100000000
 *                 description: Total amount in tinybars (1 HBAR = 100,000,000 tinybars)
 *               revenueSplitterAddress:
 *                 type: string
 *                 example: "0x1234567890abcdef"
 *                 description: Optional - RevenueSplitter smart contract address
 *     responses:
 *       200:
 *         description: Revenue distributed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 distribution:
 *                   $ref: '#/components/schemas/RevenueDistribution'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
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

/**
 * GET /api/revenue/distributions/purchase/:purchaseId
 * Get all revenue distributions for a specific purchase
 */
router.get('/distributions/purchase/:purchaseId', async (req, res) => {
  try {
    const { purchaseId } = req.params;
    const distributions = await getRevenueDistributionsByPurchase(purchaseId);
    res.json({ purchaseId, distributions });
  } catch (error) {
    console.error('Error fetching revenue distributions by purchase:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/revenue/distributions/patient/:patientUPI
 * Get all revenue distributions for a specific patient
 */
router.get('/distributions/patient/:patientUPI', async (req, res) => {
  try {
    const { patientUPI } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const distributions = await getRevenueDistributionsByPatient(patientUPI, limit);
    res.json({ patientUPI, distributions });
  } catch (error) {
    console.error('Error fetching revenue distributions by patient:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/revenue/distributions/hospital/:hospitalId
 * Get all revenue distributions for a specific hospital
 */
router.get('/distributions/hospital/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const distributions = await getRevenueDistributionsByHospital(hospitalId, limit);
    res.json({ hospitalId, distributions });
  } catch (error) {
    console.error('Error fetching revenue distributions by hospital:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/revenue/distributions
 * Get all revenue distributions (admin view)
 */
router.get('/distributions', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;
    const distributions = await getAllRevenueDistributions(limit, offset);
    res.json({ distributions, limit, offset });
  } catch (error) {
    console.error('Error fetching all revenue distributions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/revenue/distributions/stats
 * Get revenue distribution statistics
 */
router.get('/distributions/stats', async (req, res) => {
  try {
    const stats = await getRevenueDistributionStats();
    res.json(stats);
  } catch (error) {
    console.error('Error fetching revenue distribution stats:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

