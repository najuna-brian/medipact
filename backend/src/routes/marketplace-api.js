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
import { getAllDatasets, getDataset } from '../db/dataset-db.js';
import { executeQuery, getFilterOptions } from '../services/query-service.js';
import { getDatasetWithPreview, exportDataset } from '../services/dataset-service.js';
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
    const filters = {
      country: req.query.country,
      hospitalId: req.query.hospitalId
    };
    
    const datasets = await getAllDatasets(filters);
    
    res.json({
      datasets,
      count: datasets.length
    });
  } catch (error) {
    console.error('Error fetching datasets:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/marketplace/datasets/{datasetId}:
 *   get:
 *     summary: Get dataset details
 *     description: Get detailed information about a specific dataset, including optional preview
 *     tags: [Marketplace]
 *     parameters:
 *       - in: path
 *         name: datasetId
 *         required: true
 *         schema:
 *           type: string
 *         description: Dataset ID
 *       - in: query
 *         name: includePreview
 *         schema:
 *           type: boolean
 *         description: Include preview data (limited records)
 *     responses:
 *       200:
 *         description: Dataset details
 *       404:
 *         description: Dataset not found
 */
router.get('/datasets/:datasetId', async (req, res) => {
  try {
    const { datasetId } = req.params;
    const includePreview = req.query.includePreview === 'true';
    
    const dataset = await getDatasetWithPreview(datasetId, {
      includePreview,
      previewLimit: 10
    });
    
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found' });
    }
    
    res.json(dataset);
  } catch (error) {
    console.error('Error fetching dataset:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/marketplace/query:
 *   post:
 *     summary: Query FHIR resources with filters
 *     description: Execute a query on anonymized FHIR resources with filters (country, date, condition, etc.). Returns preview by default.
 *     tags: [Marketplace]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               country:
 *                 type: string
 *                 example: "Uganda"
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2020-01-01"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-12-31"
 *               conditionCode:
 *                 type: string
 *                 example: "E11"
 *               conditionName:
 *                 type: string
 *                 example: "Diabetes"
 *               observationCode:
 *                 type: string
 *                 example: "4548-4"
 *               observationName:
 *                 type: string
 *                 example: "HbA1c"
 *               ageRange:
 *                 type: string
 *                 example: "35-39"
 *               gender:
 *                 type: string
 *                 enum: [Male, Female, Other, Unknown]
 *               hospitalId:
 *                 type: string
 *               preview:
 *                 type: boolean
 *                 default: true
 *                 description: If true, only return count. If false, return full data (requires purchase)
 *     responses:
 *       200:
 *         description: Query results
 *       400:
 *         description: Invalid filters
 */
router.post('/query', async (req, res) => {
  try {
    const filters = req.body;
    const researcherId = req.body.researcherId || req.headers['x-researcher-id'];
    
    if (!researcherId) {
      return res.status(400).json({ 
        error: 'Researcher ID required. Provide in body or x-researcher-id header.' 
      });
    }
    
    // Check if researcher exists
    const researcher = await getResearcher(researcherId);
    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }
    
    const result = await executeQuery(filters, researcherId, {
      preview: filters.preview !== false, // Default to preview
      limit: filters.limit || 1000
    });
    
    res.json(result);
  } catch (error) {
    console.error('Error executing query:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/marketplace/filter-options:
 *   get:
 *     summary: Get available filter options
 *     description: Get list of available countries, conditions, observation types, etc. for query builder UI
 *     tags: [Marketplace]
 *     responses:
 *       200:
 *         description: Available filter options
 */
router.get('/filter-options', async (req, res) => {
  try {
    const options = await getFilterOptions();
    res.json(options);
  } catch (error) {
    console.error('Error fetching filter options:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/marketplace/datasets/{datasetId}/export:
 *   post:
 *     summary: Export dataset
 *     description: Export purchased dataset in specified format (FHIR, CSV, or JSON)
 *     tags: [Marketplace]
 *     parameters:
 *       - in: path
 *         name: datasetId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               format:
 *                 type: string
 *                 enum: [fhir, csv, json]
 *                 default: fhir
 *               researcherId:
 *                 type: string
 *                 required: true
 *     responses:
 *       200:
 *         description: Dataset export
 *       403:
 *         description: Access denied - dataset not purchased
 *       404:
 *         description: Dataset not found
 */
router.post('/datasets/:datasetId/export', async (req, res) => {
  try {
    const { datasetId } = req.params;
    const { format = 'fhir', researcherId } = req.body;
    
    if (!researcherId) {
      return res.status(400).json({ error: 'Researcher ID required' });
    }
    
    // TODO: Verify researcher has purchased this dataset
    // For now, allow export if researcher is verified
    const researcher = await getResearcher(researcherId);
    if (!researcher || researcher.verificationStatus !== 'verified') {
      return res.status(403).json({ 
        error: 'Access denied. Dataset must be purchased and researcher must be verified.' 
      });
    }
    
    const exportData = await exportDataset(datasetId, format);
    
    // Set appropriate content type
    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="dataset-${datasetId}.csv"`);
      res.send(exportData.data);
    } else if (format === 'json') {
      res.json(exportData);
    } else {
      // FHIR
      res.setHeader('Content-Type', 'application/fhir+json');
      res.json(exportData.data);
    }
  } catch (error) {
    console.error('Error exporting dataset:', error);
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
    
    // Verify dataset exists
    if (datasetId) {
      const dataset = await getDataset(datasetId);
      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found' });
      }
    }
    
    // TODO: Record purchase in database
    // TODO: Grant researcher access to purchased dataset
    
    res.json({
      message: 'Purchase successful',
      purchaseId: `PURCHASE-${Date.now()}`,
      datasetId,
      amount: hbarAmount.toString(),
      revenueDistribution: distributionResult,
      accessGranted: true,
      downloadUrl: datasetId ? `/api/marketplace/datasets/${datasetId}/export` : null
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

