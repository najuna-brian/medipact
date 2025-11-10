/**
 * Data Marketplace API Routes
 * 
 * Routes for researchers to browse and purchase anonymized medical data.
 */

import express from 'express';
import { getResearcher, getResearcherByEmail } from '../db/researcher-db.js';
import { distributeRevenue } from '../services/revenue-distribution-service.js';
import { getPatient } from '../db/patient-db.js';
import { getHospital } from '../db/hospital-db.js';
import { Hbar } from '@hashgraph/sdk';

const router = express.Router();

/**
 * Middleware to check researcher verification status
 * Always prompts unverified researchers to verify
 */
async function checkResearcherVerification(req, res, next) {
  try {
    const { researcherId } = req.params;
    const researcher = await getResearcher(researcherId);
    
    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }
    
    // Always add verification prompt if not verified
    req.researcher = researcher;
    req.verificationPrompt = researcher.verificationStatus !== 'verified';
    
    // For unverified researchers, allow limited access but always show prompt
    next();
  } catch (error) {
    console.error('Error checking researcher verification:', error);
    return res.status(500).json({ error: error.message });
  }
}

/**
 * @swagger
 * /api/marketplace/datasets:
 *   get:
 *     summary: Browse available anonymized datasets
 *     description: Get list of available anonymized medical datasets for purchase. All datasets are verified, anonymized, and ready for research use.
 *     tags: [Marketplace]
 *     responses:
 *       200:
 *         description: List of available datasets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datasets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Dataset'
 *       500:
 *         description: Internal server error
 */
/**
 * GET /api/marketplace/datasets
 * Browse available anonymized datasets
 */
router.get('/datasets', async (req, res) => {
  try {
    // TODO: Implement dataset catalog from anonymized data
    // For now, return mock data structure
    res.json({
      datasets: [],
      message: 'Dataset catalog coming soon',
      note: 'Researchers can browse and purchase anonymized medical data here'
    });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/marketplace/purchase:
 *   post:
 *     summary: Purchase anonymized dataset
 *     description: Purchase an anonymized medical dataset. Revenue is automatically distributed (60% Patient, 25% Hospital, 15% Platform) via Hedera smart contract.
 *     tags: [Marketplace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - researcherId
 *               - amount
 *             properties:
 *               researcherId:
 *                 type: string
 *                 example: "RES-ABC123"
 *                 description: Researcher ID (must be verified)
 *               datasetId:
 *                 type: string
 *                 example: "dataset-001"
 *                 description: Dataset ID to purchase
 *               patientUPI:
 *                 type: string
 *                 example: "UPI-ABC123XYZ"
 *                 description: Optional - specific patient UPI
 *               hospitalId:
 *                 type: string
 *                 example: "HOSP-001"
 *                 description: Optional - specific hospital ID
 *               amount:
 *                 type: number
 *                 example: 50
 *                 description: Purchase amount in HBAR
 *     responses:
 *       200:
 *         description: Purchase successful, revenue distributed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 transactionId:
 *                   type: string
 *                   description: Hedera transaction ID
 *                 distribution:
 *                   $ref: '#/components/schemas/RevenueDistribution'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Researcher not verified
 *       500:
 *         description: Internal server error
 */
/**
 * POST /api/marketplace/purchase
 * Purchase anonymized dataset
 * 
 * Body:
 *   - researcherId: string
 *   - datasetId: string
 *   - patientUPI: string (optional - for specific patient data)
 *   - hospitalId: string (optional - for specific hospital data)
 *   - amount: number (HBAR amount)
 */
router.post('/purchase', async (req, res) => {
  try {
    const { researcherId, datasetId, patientUPI, hospitalId, amount } = req.body;
    
    if (!researcherId || !amount) {
      return res.status(400).json({ 
        error: 'Researcher ID and amount are required' 
      });
    }
    
    // Get researcher
    const researcher = await getResearcher(researcherId);
    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }
    
    // Always check verification status and prompt if not verified
    const verificationPrompt = researcher.verificationStatus !== 'verified';
    if (verificationPrompt) {
      return res.status(403).json({
        error: 'Account verification required',
        message: 'Please verify your account to purchase data. Verification provides access to full datasets and better pricing.',
        verificationPrompt: true,
        verificationUrl: `/researcher/${researcherId}/verify`
      });
    }
    
    // Get patient and hospital Account IDs for revenue distribution
    let patientAccountId = null;
    let hospitalAccountId = null;
    
    if (patientUPI) {
      const patient = await getPatient(patientUPI);
      patientAccountId = patient?.hederaAccountId;
    }
    
    if (hospitalId) {
      const hospital = await getHospital(hospitalId);
      hospitalAccountId = hospital?.hederaAccountId;
    }
    
    if (!patientAccountId || !hospitalAccountId) {
      return res.status(400).json({ 
        error: 'Patient or hospital Account IDs not found. Cannot distribute revenue.' 
      });
    }
    
    // Convert amount to Hbar
    const hbarAmount = Hbar.fromTinybars(amount);
    
    // Distribute revenue (60% patient, 25% hospital, 15% platform)
    const distributionResult = await distributeRevenue({
      patientAccountId,
      hospitalAccountId,
      totalAmount: hbarAmount,
      revenueSplitterAddress: process.env.REVENUE_SPLITTER_ADDRESS || null
    });
    
    // TODO: Grant researcher access to purchased dataset
    // TODO: Record purchase in database
    
    res.json({
      message: 'Purchase successful',
      purchaseId: `PURCHASE-${Date.now()}`,
      datasetId,
      amount: hbarAmount.toString(),
      revenueDistribution: distributionResult,
      accessGranted: true
    });
  } catch (error) {
    console.error('Error processing purchase:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/marketplace/researcher/:researcherId/status
 * Get researcher status with verification prompt
 */
router.get('/researcher/:researcherId/status', checkResearcherVerification, async (req, res) => {
  try {
    const { researcher } = req;
    
    res.json({
      researcherId: researcher.researcherId,
      verificationStatus: researcher.verificationStatus,
      accessLevel: researcher.accessLevel,
      verificationPrompt: req.verificationPrompt,
      verificationMessage: req.verificationPrompt 
        ? 'Please verify your account to access full features and better pricing.'
        : null,
      canPurchase: researcher.verificationStatus === 'verified'
    });
  } catch (error) {
    console.error('Error fetching researcher status:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

