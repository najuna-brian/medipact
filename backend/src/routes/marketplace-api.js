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

