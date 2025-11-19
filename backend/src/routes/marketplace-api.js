/**
 * Data Marketplace API Routes
 * 
 * Routes for researchers to browse and purchase anonymized medical data.
 */

import express from 'express';
import { getResearcher, getResearcherByEmail } from '../db/researcher-db.js';
import { distributeRevenue } from '../services/revenue-distribution-service.js';
import { distributeDatasetRevenue } from '../services/adapter-integration-service.js';
import { getPatient } from '../db/patient-db.js';
import { getHospital } from '../db/hospital-db.js';
import { getAllDatasets, getDataset } from '../db/dataset-db.js';
import { executeQuery, getFilterOptions } from '../services/query-service.js';
import { getDatasetWithPreview, exportDataset } from '../services/dataset-service.js';
import { queryLimiter, purchaseLimiter } from '../middleware/rate-limiter.js';
import { Hbar } from '@hashgraph/sdk';
import { verifyHBARPayment, createPaymentRequest } from '../services/payment-verification-service.js';

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
 *               resourceType:
 *                 type: string
 *                 enum: [Patient, Encounter, Condition, Observation, MedicationRequest, Procedure, ImagingStudy, AllergyIntolerance, Coverage]
 *                 description: Filter by specific FHIR resource type (all 10 domains supported)
 *               medicationCode:
 *                 type: string
 *                 example: "6809-2058"
 *                 description: RxNorm or ATC medication code (Domain 5)
 *               medicationName:
 *                 type: string
 *                 example: "Metformin"
 *                 description: Medication name (Domain 5)
 *               procedureCode:
 *                 type: string
 *                 example: "99213"
 *                 description: CPT, SNOMED, or ICD-10-PCS procedure code (Domain 6)
 *               procedureName:
 *                 type: string
 *                 example: "Office Visit"
 *                 description: Procedure name (Domain 6)
 *               encounterType:
 *                 type: string
 *                 example: "consultation"
 *                 description: Encounter type (Domain 2)
 *               encounterClass:
 *                 type: string
 *                 enum: [AMB, IMP, EMER, VR]
 *                 description: Encounter class - AMB (ambulatory), IMP (inpatient), EMER (emergency), VR (virtual) (Domain 2)
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
router.post('/query', queryLimiter, async (req, res) => {
  try {
    const filters = req.body;
    const researcherId = req.body.researcherId || req.headers['x-researcher-id'];
    const format = req.body.format || 'json'; // Default to JSON, support 'csv-flattened'
    
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
    
    // If csv-flattened format is requested, return flattened CSV
    if (format === 'csv-flattened') {
      const { formatAsFlattenedCSV } = await import('../services/dataset-service.js');
      
      // Create a temporary dataset-like object for export
      const tempDataset = {
        id: 'QUERY-TEMP',
        name: 'Query Results',
        country: filters.country || null,
        dateRangeStart: filters.startDate || null,
        dateRangeEnd: filters.endDate || null,
        conditionCodes: filters.conditionCode ? [filters.conditionCode] : null
      };
      
      // For preview, limit to 20 rows; for full export, use requested limit
      const previewLimit = filters.preview !== false ? 20 : (filters.limit || 1000);
      
      const csvData = await formatAsFlattenedCSV(filters, tempDataset, {
        limit: previewLimit,
        csvSchema: filters.csvSchema
      });
      
      // If preview mode, return as JSON with CSV data and metadata
      if (filters.preview !== false) {
        return res.json({
          format: 'csv-flattened',
          csvData: csvData.data,
          recordCount: csvData.recordCount,
          preview: true,
          filters: filters,
          timestamp: new Date().toISOString()
        });
      }
      
      // Full export: return CSV file
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="query-results-${Date.now()}.csv"`);
      return res.send(csvData.data);
    }
    
    // Default: return JSON result
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
    const { format = 'fhir', researcherId, multiFile, zip, limit, csvSchema } = req.body;
    
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
    
    const exportOptions = { 
      multiFile, 
      zip,
      limit, // Support count-based queries (e.g., "get me 100 diabetic patients")
      csvSchema // Support original CSV structure
    };
    const exportData = await exportDataset(datasetId, format, exportOptions);
    
    // Set appropriate content type and headers
    if (format === 'csv-zip' || (format === 'csv' && zip)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename="dataset-${datasetId}.zip"`);
      res.send(exportData.data);
    } else if (format === 'csv-flattened') {
      // Flattened CSV: one row per patient
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="dataset-${datasetId}-flattened.csv"`);
      res.send(exportData.data);
    } else if (format === 'csv' && multiFile) {
      // Multi-file CSV as JSON response
      res.setHeader('Content-Type', 'application/json');
      res.json(exportData);
    } else if (format === 'csv') {
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
router.post('/purchase', purchaseLimiter, async (req, res) => {
  try {
    let { researcherId, datasetId, patientUPI, hospitalId, amount, transactionId, queryFilters } = req.body;
    
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
    
    // Get platform account ID for payment verification
    const platformAccountId = process.env.PLATFORM_HEDERA_ACCOUNT_ID || process.env.OPERATOR_ID;
    if (!platformAccountId) {
      console.warn('⚠️ PLATFORM_HEDERA_ACCOUNT_ID not set, payment verification may fail');
    }
    
    // Convert amount (assuming it's in HBAR, convert to tinybars)
    const amountHBAR = typeof amount === 'string' ? parseFloat(amount) : amount;
    const totalTinybars = Math.floor(amountHBAR * 100000000); // Convert HBAR to tinybars
    
    // Verify payment if transaction ID is provided
    if (transactionId) {
      try {
        const verification = await verifyHBARPayment(
          transactionId,
          researcherId,
          amountHBAR,
          platformAccountId
        );
        
        if (!verification.verified) {
          return res.status(402).json({
            error: 'Payment verification failed',
            message: verification.error || 'Could not verify payment transaction',
            transactionId,
            verification
          });
        }
        
        console.log(`✅ Payment verified: ${transactionId} for ${amountHBAR} HBAR`);
      } catch (verificationError) {
        console.error('Payment verification error:', verificationError);
        return res.status(402).json({
          error: 'Payment verification error',
          message: verificationError.message || 'Failed to verify payment'
        });
      }
    } else {
      // Try to send payment automatically if researcher has stored private key
      let researcherData = null;
      try {
        const { getDatabaseType, get } = await import('../db/database.js');
        const dbType = getDatabaseType();
        
        const sql = dbType === 'postgresql'
          ? `SELECT encrypted_private_key as "encryptedPrivateKey", hedera_account_id as "hederaAccountId"
             FROM researchers WHERE researcher_id = $1`
          : `SELECT encrypted_private_key as encryptedPrivateKey, hedera_account_id as hederaAccountId
             FROM researchers WHERE researcher_id = ?`;
        
        researcherData = await get(sql, [researcherId]);
        
        console.log('Checking auto-payment for researcher:', {
          researcherId,
          hasData: !!researcherData,
          hasPrivateKey: !!researcherData?.encryptedPrivateKey,
          hasAccountId: !!researcherData?.hederaAccountId
        });
        
        if (researcherData?.encryptedPrivateKey && researcherData?.hederaAccountId) {
          // Researcher has stored private key - send payment automatically
          const { decrypt } = await import('../services/encryption-service.js');
          const privateKey = decrypt(researcherData.encryptedPrivateKey);
          
          const { TransferTransaction, Hbar, Client, AccountId, PrivateKey } = await import('@hashgraph/sdk');
          const network = process.env.HEDERA_NETWORK || 'testnet';
          const client = network === 'mainnet' ? Client.forMainnet() : Client.forTestnet();
          
          const accountId = AccountId.fromString(researcherData.hederaAccountId);
          const privateKeyObj = PrivateKey.fromString(privateKey);
          client.setOperator(accountId, privateKeyObj);
          
          const transaction = await new TransferTransaction()
            .addHbarTransfer(AccountId.fromString(platformAccountId), Hbar.fromTinybars(amountHBAR * 100000000))
            .addHbarTransfer(accountId, Hbar.fromTinybars(-amountHBAR * 100000000))
            .execute(client);
          
          const receipt = await transaction.getReceipt(client);
          client.close();
          
          if (receipt.status.toString() !== 'SUCCESS') {
            throw new Error(`Transaction failed with status: ${receipt.status.toString()}`);
          }
          
          // Use the automatically generated transaction ID
          const autoTransactionId = transaction.transactionId.toString();
          
          // Verify the payment we just sent
          const verification = await verifyHBARPayment(
            autoTransactionId,
            researcherId,
            amountHBAR,
            platformAccountId
          );
          
          if (!verification.verified) {
            throw new Error('Auto-payment verification failed: ' + (verification.error || 'Unknown error'));
          }
          
          // Return transaction ID for user confirmation instead of auto-completing
          // User can see the transaction ID, copy it, or confirm to proceed
          return res.status(202).json({
            message: 'Payment sent automatically',
            paymentRequest: {
              recipientAccountId: platformAccountId,
              amountHBAR: amountHBAR,
              autoSent: true
            },
            transactionId: autoTransactionId,
            instructions: 'Payment has been sent automatically. Please review the transaction ID and confirm to complete your purchase.',
            nextStep: 'Confirm purchase with transactionId',
            autoPayment: true
          });
        } else {
          // No stored private key - return payment request
          const paymentRequest = await createPaymentRequest(
            researcherId,
            amountHBAR,
            platformAccountId
          );
          
          return res.status(202).json({
            message: 'Payment required',
            paymentRequest: paymentRequest,
            instructions: 'Please send the HBAR payment and include the transaction ID in your purchase request',
            nextStep: 'Send payment and retry purchase with transactionId'
          });
        }
      } catch (autoPaymentError) {
        console.error('Auto-payment failed, falling back to manual payment:', autoPaymentError);
        console.error('Auto-payment error details:', {
          researcherId,
          hasPrivateKey: !!researcherData?.encryptedPrivateKey,
          hasAccountId: !!researcherData?.hederaAccountId,
          error: autoPaymentError.message,
          stack: autoPaymentError.stack
        });
        // Fall back to manual payment request
        const paymentRequest = await createPaymentRequest(
          researcherId,
          amountHBAR,
          platformAccountId
        );
        
        return res.status(202).json({
          message: 'Payment required',
          paymentRequest: paymentRequest,
          instructions: 'Please send the HBAR payment and include the transaction ID in your purchase request',
          nextStep: 'Send payment and retry purchase with transactionId',
          autoPaymentError: autoPaymentError.message
        });
      }
    }
    
    // If datasetId is provided, use dataset-based distribution
    // This splits payment equally among all patients and uses each patient's specific hospital
    let distributionResult;
    let patientUPIs = []; // Initialize patient UPIs array
    
    if (datasetId) {
      // Dataset purchase: split equally among all patients, each patient's hospital gets their share
      distributionResult = await distributeDatasetRevenue({
        datasetId,
        totalAmount: totalTinybars,
        revenueSplitterAddress: process.env.REVENUE_SPLITTER_ADDRESS || null
      });
    } else if (patientUPI && hospitalId) {
      // Single patient purchase: use specific patient and hospital
      const patient = await getPatient(patientUPI);
      const hospital = await getHospital(hospitalId);
      
      if (!patient || !hospital) {
        return res.status(400).json({ 
          error: 'Patient or hospital not found. Cannot distribute revenue.' 
        });
      }
      
      const hbarAmount = Hbar.fromTinybars(totalTinybars);
      
      // Use single patient distribution
      const { distributeRevenueFromSale } = await import('../services/adapter-integration-service.js');
      const result = await distributeRevenueFromSale({
        patientUPI,
        hospitalId,
        totalAmount: totalTinybars,
        revenueSplitterAddress: process.env.REVENUE_SPLITTER_ADDRESS || null
      });
      
      distributionResult = {
        success: true,
        method: 'single',
        patientUPI,
        hospitalId,
        distribution: result.distribution
      };
    } else if (queryFilters) {
      // Query-based purchase: use query filters to get patients and distribute revenue
      const { queryFHIRResources } = await import('../db/fhir-db.js');
      const filters = { ...queryFilters };
      filters.limit = 10000; // Get all matching patients
      const patients = await queryFHIRResources(filters);
      patientUPIs = [...new Set(patients.map(p => p.upi))];
      
      if (patientUPIs.length === 0) {
        return res.status(400).json({ 
          error: 'No patients found matching query filters. Cannot distribute revenue.' 
        });
      }
      
      // For query-based purchases, distribute revenue equally among all matching patients
      // Each patient's hospital gets their share
      const { distributeBulkRevenue } = await import('../services/adapter-integration-service.js');
      const sales = patientUPIs.map(upi => ({
        patientUPI: upi,
        amount: totalTinybars / patientUPIs.length // Equal split per patient
      }));
      
      const bulkResult = await distributeBulkRevenue(sales, process.env.REVENUE_SPLITTER_ADDRESS || null);
      
      distributionResult = {
        success: true,
        method: 'query-based',
        patientCount: patientUPIs.length,
        distribution: bulkResult
      };
    } else {
      return res.status(400).json({ 
        error: 'Either datasetId, (patientUPI and hospitalId), or queryFilters are required for revenue distribution.' 
      });
    }
    
    // Verify dataset exists and get patient UPIs (if not already done)
    let dataset = null;
    
    if (datasetId) {
      dataset = await getDataset(datasetId);
      if (!dataset) {
        return res.status(404).json({ error: 'Dataset not found' });
      }
      
      // Get all patient UPIs in this dataset (if not already set)
      if (patientUPIs.length === 0) {
        const { queryFHIRResources } = await import('../db/fhir-db.js');
        const filters = {
          country: dataset.country,
          startDate: dataset.dateRangeStart,
          endDate: dataset.dateRangeEnd
        };
        if (dataset.conditionCodes) {
          const codes = typeof dataset.conditionCodes === 'string' 
            ? JSON.parse(dataset.conditionCodes) 
            : dataset.conditionCodes;
          if (codes && codes.length > 0) {
            filters.conditionCode = codes[0];
          }
        }
        filters.limit = 10000; // Get all patients
        const patients = await queryFHIRResources(filters);
        patientUPIs = [...new Set(patients.map(p => p.upi))];
      }
    } else if (patientUPI && !queryFilters) {
      patientUPIs = [patientUPI];
    }
    
    // Record data access history for all patients
    if (patientUPIs.length > 0) {
      const { recordDataAccess } = await import('../db/patient-preferences-db.js');
      const pricePerRecord = dataset 
        ? (dataset.priceUSD / dataset.recordCount) 
        : (amount * 0.16 / 1); // Convert HBAR to USD
      
      for (const upi of patientUPIs) {
        try {
          await recordDataAccess(
            upi,
            researcherId,
            dataset ? dataset.recordCount : 1,
            datasetId,
            pricePerRecord
          );
        } catch (error) {
          console.error(`Error recording access for patient ${upi}:`, error);
          // Continue with other patients
        }
      }
    }
    
    // Record purchase in database
    const { getDatabaseType, run } = await import('../db/database.js');
    const dbType = getDatabaseType();
    const purchaseId = `PUR-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    // Store purchase record (datasetId can be null for query-based purchases)
    const revenueHash = distributionResult?.distribution?.hash || 
                       (distributionResult?.distribution && Array.isArray(distributionResult.distribution) 
                         ? distributionResult.distribution[0]?.hash 
                         : null);
    
    if (dbType === 'postgresql') {
      await run(
        `INSERT INTO purchases (
          id, researcher_id, dataset_id, amount, currency, hedera_transaction_id, 
          revenue_distribution_hash, access_type, status, purchased_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
        ON CONFLICT (id) DO NOTHING`,
        [
          purchaseId,
          researcherId,
          datasetId || null, // Can be null for query-based purchases
          amountHBAR,
          'HBAR',
          transactionId || null,
          revenueHash,
          'download',
          'completed'
        ]
      );
    } else {
      await run(
        `INSERT OR IGNORE INTO purchases (
          id, researcher_id, dataset_id, amount, currency, hedera_transaction_id, 
          revenue_distribution_hash, access_type, status, purchased_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          purchaseId,
          researcherId,
          datasetId || null, // Can be null for query-based purchases
          amountHBAR,
          'HBAR',
          transactionId || null,
          revenueHash,
          'download',
          'completed'
        ]
      );
    }
    
    // Get USD amount using dynamic exchange rate
    const { hbarToUSD } = await import('../services/pricing-service.js');
    const amountUSD = await hbarToUSD(amountHBAR);
    
    res.json({
      success: true,
      message: 'Purchase successful',
      purchaseId,
      datasetId,
      transactionId: transactionId || null,
      amountHBAR: amountHBAR,
      amountUSD: amountUSD,
      revenueDistribution: distributionResult,
      accessGranted: true,
      downloadUrl: datasetId ? `/api/marketplace/datasets/${datasetId}/export` : null,
      verified: true
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

/**
 * GET /api/marketplace/researcher/:researcherId/purchases
 * Get researcher purchase history
 */
router.get('/researcher/:researcherId/purchases', async (req, res) => {
  try {
    const { researcherId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    // Check if researcher exists
    const researcher = await getResearcher(researcherId);
    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }
    
    // Get purchases from database
    const { getDatabaseType, all } = await import('../db/database.js');
    const dbType = getDatabaseType();
    
    let purchases;
    if (dbType === 'postgresql') {
      purchases = await all(
        `SELECT 
          p.id,
          p.researcher_id as "researcherId",
          p.dataset_id as "datasetId",
          p.amount,
          p.currency,
          p.hedera_transaction_id as "hederaTransactionId",
          p.revenue_distribution_hash as "revenueDistributionHash",
          p.access_type as "accessType",
          p.access_expires_at as "accessExpiresAt",
          p.status,
          p.purchased_at as "purchasedAt",
          d.name as "datasetName",
          d.description as "datasetDescription",
          d.record_count as "recordCount"
        FROM purchases p
        LEFT JOIN datasets d ON p.dataset_id = d.id
        WHERE p.researcher_id = $1
        ORDER BY p.purchased_at DESC
        LIMIT $2`,
        [researcherId, limit]
      );
    } else {
      purchases = await all(
        `SELECT 
          p.id,
          p.researcher_id as researcherId,
          p.dataset_id as datasetId,
          p.amount,
          p.currency,
          p.hedera_transaction_id as hederaTransactionId,
          p.revenue_distribution_hash as revenueDistributionHash,
          p.access_type as accessType,
          p.access_expires_at as accessExpiresAt,
          p.status,
          p.purchased_at as purchasedAt,
          d.name as datasetName,
          d.description as datasetDescription,
          d.record_count as recordCount
        FROM purchases p
        LEFT JOIN datasets d ON p.dataset_id = d.id
        WHERE p.researcher_id = ?
        ORDER BY p.purchased_at DESC
        LIMIT ?`,
        [researcherId, limit]
      );
    }
    
    // Convert HBAR to USD for each purchase
    const { hbarToUSD } = await import('../services/pricing-service.js');
    const purchasesWithUSD = await Promise.all(
      purchases.map(async (purchase) => {
        const amountUSD = await hbarToUSD(purchase.amount);
        return {
          ...purchase,
          amountUSD
        };
      })
    );
    
    res.json({
      purchases: purchasesWithUSD,
      count: purchasesWithUSD.length
    });
  } catch (error) {
    console.error('Error fetching purchases:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/marketplace/researcher/:researcherId/analytics
 * Get researcher analytics (datasets used, records analyzed, total spent, etc.)
 */
router.get('/researcher/:researcherId/analytics', async (req, res) => {
  try {
    const { researcherId } = req.params;
    
    // Check if researcher exists
    const researcher = await getResearcher(researcherId);
    if (!researcher) {
      return res.status(404).json({ error: 'Researcher not found' });
    }
    
    const { getDatabaseType, all, get } = await import('../db/database.js');
    const dbType = getDatabaseType();
    
    // Get purchase statistics
    let purchaseStats;
    if (dbType === 'postgresql') {
      purchaseStats = await get(
        `SELECT 
          COUNT(*) as "datasetsUsed",
          SUM(p.amount) as "totalSpentHBAR",
          SUM(d.record_count) as "totalRecords"
        FROM purchases p
        LEFT JOIN datasets d ON p.dataset_id = d.id
        WHERE p.researcher_id = $1 AND p.status = 'completed'`,
        [researcherId]
      );
    } else {
      purchaseStats = await get(
        `SELECT 
          COUNT(*) as datasetsUsed,
          SUM(p.amount) as totalSpentHBAR,
          SUM(d.record_count) as totalRecords
        FROM purchases p
        LEFT JOIN datasets d ON p.dataset_id = d.id
        WHERE p.researcher_id = ? AND p.status = 'completed'`,
        [researcherId]
      );
    }
    
    // Get query statistics
    let queryStats;
    if (dbType === 'postgresql') {
      queryStats = await get(
        `SELECT 
          COUNT(*) as "totalQueries",
          SUM(result_count) as "totalRecordsAnalyzed"
        FROM query_logs
        WHERE researcher_id = $1`,
        [researcherId]
      );
    } else {
      queryStats = await get(
        `SELECT 
          COUNT(*) as totalQueries,
          SUM(result_count) as totalRecordsAnalyzed
        FROM query_logs
        WHERE researcher_id = ?`,
        [researcherId]
      );
    }
    
    // Convert HBAR to USD
    const { hbarToUSD } = await import('../services/pricing-service.js');
    const totalSpentUSD = purchaseStats.totalSpentHBAR 
      ? await hbarToUSD(purchaseStats.totalSpentHBAR)
      : 0;
    
    // Get downloads count (purchases with download access)
    const downloadsCount = purchaseStats.datasetsUsed || 0;
    
    res.json({
      datasetsUsed: parseInt(purchaseStats.datasetsUsed || 0),
      recordsAnalyzed: parseInt(queryStats.totalRecordsAnalyzed || purchaseStats.totalRecords || 0),
      totalSpentHBAR: parseFloat(purchaseStats.totalSpentHBAR || 0),
      totalSpentUSD: totalSpentUSD,
      downloads: downloadsCount,
      totalQueries: parseInt(queryStats.totalQueries || 0)
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

