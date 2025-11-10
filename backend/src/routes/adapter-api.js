/**
 * Adapter Integration API Routes
 * 
 * Endpoints for the MediPact adapter to submit anonymized data
 * and create datasets in the backend.
 */

import express from 'express';
import {
  createFHIRPatient,
  createFHIRCondition,
  createFHIRObservation,
} from '../db/fhir-db.js';
import { createConsent } from '../db/consent-db.js';
import { createDatasetFromQuery } from '../services/dataset-service.js';
import { getHospital } from '../db/hospital-db.js';

const router = express.Router();

/**
 * Middleware to authenticate adapter requests
 * Uses hospital API key authentication
 */
async function authenticateAdapter(req, res, next) {
  const hospitalId = req.headers['x-hospital-id'];
  const apiKey = req.headers['x-api-key'];

  if (!hospitalId || !apiKey) {
    return res.status(401).json({ error: 'Missing hospital ID or API key' });
  }

  try {
    const hospital = await getHospital(hospitalId);
    if (!hospital) {
      return res.status(404).json({ error: 'Hospital not found' });
    }

    // TODO: Verify API key matches hospital's API key
    // For now, just check hospital exists and is verified
    if (hospital.verificationStatus !== 'verified') {
      return res.status(403).json({ error: 'Hospital not verified' });
    }

    req.hospital = hospital;
    next();
  } catch (error) {
    console.error('Error authenticating adapter:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * @swagger
 * /api/adapter/submit-fhir-resources:
 *   post:
 *     summary: Submit anonymized FHIR resources from adapter
 *     description: Adapter submits anonymized patient data (patients, conditions, observations) to backend
 *     tags: [Adapter]
 *     security:
 *       - HospitalAuth: []
 *       - HospitalApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patients
 *               - hospitalId
 *             properties:
 *               hospitalId:
 *                 type: string
 *               patients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     anonymousPatientId:
 *                       type: string
 *                     upi:
 *                       type: string
 *                     country:
 *                       type: string
 *                     region:
 *                       type: string
 *                     ageRange:
 *                       type: string
 *                     gender:
 *                       type: string
 *                     conditions:
 *                       type: array
 *                     observations:
 *                       type: array
 *     responses:
 *       200:
 *         description: Resources submitted successfully
 *       401:
 *         description: Authentication failed
 */
router.post('/submit-fhir-resources', authenticateAdapter, async (req, res) => {
  try {
    const { hospitalId, patients } = req.body;

    if (!hospitalId || !patients || !Array.isArray(patients)) {
      return res.status(400).json({
        error: 'hospitalId and patients array are required',
      });
    }

    const results = {
      patientsCreated: 0,
      conditionsCreated: 0,
      observationsCreated: 0,
      consentsCreated: 0,
      errors: [],
    };

    // Get consent type from request or default to hospital_verified
    const consentType = req.body.consentType || 'hospital_verified';

    // Process each patient
    for (const patientData of patients) {
      try {
        // Create FHIR patient record
        await createFHIRPatient({
          anonymousPatientId: patientData.anonymousPatientId,
          upi: patientData.upi,
          country: patientData.country,
          region: patientData.region,
          ageRange: patientData.ageRange,
          gender: patientData.gender,
          hospitalId,
        });
        results.patientsCreated++;

        // Create consent record for this patient
        try {
          await createConsent({
            anonymousPatientId: patientData.anonymousPatientId,
            upi: patientData.upi,
            consentType: patientData.consentType || consentType,
            status: 'active',
            hospitalId,
            hcsTopicId: patientData.hcsTopicId || null,
            consentTopicId: patientData.consentTopicId || null,
            dataHash: patientData.dataHash || null,
            expiresAt: patientData.consentExpiresAt || null,
          });
          results.consentsCreated++;
        } catch (consentError) {
          // Log but don't fail the whole operation
          console.warn(`Failed to create consent for ${patientData.anonymousPatientId}:`, consentError.message);
          results.errors.push({
            type: 'consent',
            patientId: patientData.anonymousPatientId,
            error: consentError.message,
          });
        }

        // Create conditions
        if (patientData.conditions && Array.isArray(patientData.conditions)) {
          for (const condition of patientData.conditions) {
            try {
              await createFHIRCondition({
                anonymousPatientId: patientData.anonymousPatientId,
                upi: patientData.upi,
                conditionCode: condition.code,
                conditionName: condition.name,
                diagnosisDate: condition.date,
                hospitalId,
                severity: condition.severity,
                status: condition.status,
              });
              results.conditionsCreated++;
            } catch (error) {
              results.errors.push({
                type: 'condition',
                patientId: patientData.anonymousPatientId,
                error: error.message,
              });
            }
          }
        }

        // Create observations
        if (patientData.observations && Array.isArray(patientData.observations)) {
          for (const observation of patientData.observations) {
            try {
              await createFHIRObservation({
                anonymousPatientId: patientData.anonymousPatientId,
                upi: patientData.upi,
                observationCode: observation.code,
                observationName: observation.name,
                value: observation.value,
                unit: observation.unit,
                effectiveDate: observation.date,
                hospitalId,
                referenceRange: observation.referenceRange,
                interpretation: observation.interpretation,
              });
              results.observationsCreated++;
            } catch (error) {
              results.errors.push({
                type: 'observation',
                patientId: patientData.anonymousPatientId,
                error: error.message,
              });
            }
          }
        }
      } catch (error) {
        results.errors.push({
          type: 'patient',
          patientId: patientData.anonymousPatientId,
          error: error.message,
        });
      }
    }

    res.json({
      success: true,
      message: 'FHIR resources submitted successfully',
      results,
    });
  } catch (error) {
    console.error('Error submitting FHIR resources:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @swagger
 * /api/adapter/create-dataset:
 *   post:
 *     summary: Create dataset from processed data
 *     description: Adapter creates a dataset record after processing and anonymizing data
 *     tags: [Adapter]
 *     security:
 *       - HospitalAuth: []
 *       - HospitalApiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - hospitalId
 *               - country
 *               - price
 *               - consentType
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               hospitalId:
 *                 type: string
 *               country:
 *                 type: string
 *               price:
 *                 type: number
 *               currency:
 *                 type: string
 *               consentType:
 *                 type: string
 *               filters:
 *                 type: object
 *               hcsTopicId:
 *                 type: string
 *               consentTopicId:
 *                 type: string
 *               dataTopicId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Dataset created successfully
 */
router.post('/create-dataset', authenticateAdapter, async (req, res) => {
  try {
    const {
      name,
      description,
      hospitalId,
      country,
      price,
      currency = 'HBAR',
      consentType,
      filters = {},
      hcsTopicId,
      consentTopicId,
      dataTopicId,
    } = req.body;

    if (!name || !description || !hospitalId || !country || !price || !consentType) {
      return res.status(400).json({
        error: 'Missing required fields: name, description, hospitalId, country, price, consentType',
      });
    }

    const dataset = await createDatasetFromQuery(
      {
        name,
        description,
        hospitalId,
        country,
        price,
        currency,
        consentType,
        hcsTopicId,
        consentTopicId,
        dataTopicId,
      },
      filters
    );

    res.json({
      success: true,
      message: 'Dataset created successfully',
      dataset,
    });
  } catch (error) {
    console.error('Error creating dataset:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

