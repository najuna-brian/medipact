/**
 * Researcher Data API Routes
 * 
 * REST API endpoints for researchers to access anonymized data programmatically
 * Requires API key authentication
 */

import express from 'express';
import { verifyAPIKey } from '../db/api-key-db.js';
import { queryPatients, queryConditions, queryObservations, queryEncounters } from '../db/fhir-resource-db.js';
import { getResearcher } from '../db/researcher-db.js';

const router = express.Router();

/**
 * Middleware to authenticate API key
 */
async function authenticateAPIKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.query.api_key;
  
  if (!apiKey) {
    return res.status(401).json({ 
      error: 'API key required. Provide it in X-API-Key header or api_key query parameter.' 
    });
  }
  
  const keyInfo = await verifyAPIKey(apiKey);
  
  if (!keyInfo) {
    return res.status(401).json({ error: 'Invalid or revoked API key.' });
  }
  
  // Check if researcher is verified
  if (keyInfo.verificationStatus !== 'verified') {
    return res.status(403).json({ 
      error: 'Researcher must be verified to access API. Please complete verification first.' 
    });
  }
  
  req.researcherId = keyInfo.researcherId;
  req.keyInfo = keyInfo;
  next();
}

/**
 * GET /api/researcher/patients
 * Query patients with filters
 * 
 * Query params:
 * - country: Filter by country
 * - age_range: Filter by age range
 * - gender: Filter by gender (Male, Female, Other)
 * - date_from: Filter by creation date (YYYY-MM-DD)
 * - date_to: Filter by creation date (YYYY-MM-DD)
 * - limit: Limit results (default: 100, max: 1000)
 */
router.get('/patients', authenticateAPIKey, async (req, res) => {
  try {
    const filters = {};
    
    if (req.query.country) filters.country = req.query.country;
    if (req.query.age_range) filters.ageRange = req.query.age_range;
    if (req.query.gender) filters.gender = req.query.gender;
    if (req.query.date_from) filters.startDate = req.query.date_from;
    if (req.query.date_to) filters.endDate = req.query.date_to;
    
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    filters.limit = limit;
    
    const patients = await queryPatients(filters);
    
    res.json({
      success: true,
      count: patients.length,
      data: patients,
      filters: {
        country: filters.country || null,
        ageRange: filters.ageRange || null,
        gender: filters.gender || null,
        dateFrom: filters.startDate || null,
        dateTo: filters.endDate || null
      }
    });
  } catch (error) {
    console.error('Error querying patients:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/researcher/conditions
 * Query conditions with filters
 * 
 * Query params:
 * - country: Filter by country
 * - icd10: Filter by ICD10 code (conditionCode)
 * - condition_name: Filter by condition name (partial match)
 * - date_from: Filter by diagnosis date (YYYY-MM-DD)
 * - date_to: Filter by diagnosis date (YYYY-MM-DD)
 * - limit: Limit results (default: 100, max: 1000)
 */
router.get('/conditions', authenticateAPIKey, async (req, res) => {
  try {
    const filters = {};
    
    if (req.query.country) filters.country = req.query.country;
    if (req.query.icd10) filters.conditionCode = req.query.icd10;
    if (req.query.condition_name) filters.conditionName = req.query.condition_name;
    if (req.query.date_from) filters.startDate = req.query.date_from;
    if (req.query.date_to) filters.endDate = req.query.date_to;
    
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    filters.limit = limit;
    
    const conditions = await queryConditions(filters);
    
    res.json({
      success: true,
      count: conditions.length,
      data: conditions,
      filters: {
        country: filters.country || null,
        icd10: filters.conditionCode || null,
        conditionName: filters.conditionName || null,
        dateFrom: filters.startDate || null,
        dateTo: filters.endDate || null
      }
    });
  } catch (error) {
    console.error('Error querying conditions:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/researcher/encounters
 * Query encounters with filters
 * 
 * Query params:
 * - country: Filter by country
 * - encounter_type: Filter by encounter type (partial match)
 * - encounter_class: Filter by encounter class
 * - date_from: Filter by period start (YYYY-MM-DD)
 * - date_to: Filter by period end (YYYY-MM-DD)
 * - limit: Limit results (default: 100, max: 1000)
 */
router.get('/encounters', authenticateAPIKey, async (req, res) => {
  try {
    const filters = {};
    
    if (req.query.country) filters.country = req.query.country;
    if (req.query.encounter_type) filters.encounterType = req.query.encounter_type;
    if (req.query.encounter_class) filters.encounterClass = req.query.encounter_class;
    if (req.query.date_from) filters.startDate = req.query.date_from;
    if (req.query.date_to) filters.endDate = req.query.date_to;
    
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    filters.limit = limit;
    
    const encounters = await queryEncounters(filters);
    
    res.json({
      success: true,
      count: encounters.length,
      data: encounters,
      filters: {
        country: filters.country || null,
        encounterType: filters.encounterType || null,
        encounterClass: filters.encounterClass || null,
        dateFrom: filters.startDate || null,
        dateTo: filters.endDate || null
      }
    });
  } catch (error) {
    console.error('Error querying encounters:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/researcher/observations
 * Query observations/labs with filters
 * 
 * Query params:
 * - country: Filter by country
 * - test: Filter by observation name (partial match)
 * - observation_code: Filter by observation code
 * - date_from: Filter by effective date (YYYY-MM-DD)
 * - date_to: Filter by effective date (YYYY-MM-DD)
 * - max_value: Filter by maximum value (numeric)
 * - limit: Limit results (default: 100, max: 1000)
 */
router.get('/observations', authenticateAPIKey, async (req, res) => {
  try {
    const filters = {};
    
    if (req.query.country) filters.country = req.query.country;
    if (req.query.test) filters.observationName = req.query.test;
    if (req.query.observation_code) filters.observationCode = req.query.observation_code;
    if (req.query.date_from) filters.startDate = req.query.date_from;
    if (req.query.date_to) filters.endDate = req.query.date_to;
    if (req.query.max_value) filters.maxValue = parseFloat(req.query.max_value);
    
    const limit = Math.min(parseInt(req.query.limit) || 100, 1000);
    filters.limit = limit;
    
    const observations = await queryObservations(filters);
    
    res.json({
      success: true,
      count: observations.length,
      data: observations,
      filters: {
        country: filters.country || null,
        test: filters.observationName || null,
        observationCode: filters.observationCode || null,
        dateFrom: filters.startDate || null,
        dateTo: filters.endDate || null,
        maxValue: filters.maxValue || null
      }
    });
  } catch (error) {
    console.error('Error querying observations:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

