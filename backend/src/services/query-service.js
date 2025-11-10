/**
 * Query Service
 * 
 * Handles complex queries on FHIR resources with filtering, consent validation,
 * and HCS audit logging.
 */

import { queryFHIRResources, countFHIRPatients } from '../db/fhir-db.js';
import { createQueryLog } from '../db/query-db.js';
import { logQueryToHCS } from '../hedera/hcs-client.js';

/**
 * Execute query with filters and consent validation
 * 
 * @param {Object} filters - Query filters (country, date, condition, etc.)
 * @param {string} researcherId - Researcher ID executing the query
 * @param {Object} options - Additional options (preview, limit, etc.)
 * @returns {Promise<Object>} Query results with metadata
 */
export async function executeQuery(filters, researcherId, options = {}) {
  const {
    preview = false, // If true, only return counts, not full data
    limit = 1000,
    validateConsent = true
  } = options;

  // Validate filters
  const validatedFilters = validateFilters(filters);
  
  // Add consent validation flag to filters
  validatedFilters.validateConsent = validateConsent;
  
  // Execute query
  let results = [];
  let count = 0;
  
  if (preview) {
    // Preview mode: only get count
    count = await countFHIRPatients(validatedFilters);
  } else {
    // Full query: get actual data
    validatedFilters.limit = limit;
    results = await queryFHIRResources(validatedFilters);
    count = results.length;
  }
  
  // Log query on HCS for audit trail
  let hcsMessageId = null;
  try {
    hcsMessageId = await logQueryToHCS({
      researcherId,
      filters: validatedFilters,
      resultCount: count,
      preview
    });
  } catch (error) {
    console.error('Error logging query to HCS:', error);
    // Continue even if HCS logging fails
  }
  
  // Store query log in database
  try {
    await createQueryLog({
      researcherId,
      queryFilters: JSON.stringify(validatedFilters),
      resultCount: count,
      hcsMessageId
    });
  } catch (error) {
    console.error('Error storing query log:', error);
  }
  
  return {
    results: preview ? null : results,
    count,
    filters: validatedFilters,
    preview,
    hcsMessageId,
    timestamp: new Date().toISOString()
  };
}

/**
 * Validate and normalize query filters
 */
function validateFilters(filters) {
  const validated = {};
  
  // Country filter
  if (filters.country) {
    validated.country = String(filters.country).trim();
  }
  
  // Date range filters
  if (filters.startDate) {
    validated.startDate = new Date(filters.startDate).toISOString().split('T')[0];
  }
  
  if (filters.endDate) {
    validated.endDate = new Date(filters.endDate).toISOString().split('T')[0];
  }
  
  // Condition filters
  if (filters.conditionCode) {
    validated.conditionCode = String(filters.conditionCode).trim().toUpperCase();
  }
  
  if (filters.conditionName) {
    validated.conditionName = String(filters.conditionName).trim();
  }
  
  // Observation filters
  if (filters.observationCode) {
    validated.observationCode = String(filters.observationCode).trim();
  }
  
  if (filters.observationName) {
    validated.observationName = String(filters.observationName).trim();
  }
  
  // Demographics filters
  if (filters.ageRange) {
    validated.ageRange = String(filters.ageRange).trim();
  }
  
  if (filters.gender) {
    const gender = String(filters.gender).trim();
    if (['Male', 'Female', 'Other', 'Unknown'].includes(gender)) {
      validated.gender = gender;
    }
  }
  
  // Hospital filter
  if (filters.hospitalId) {
    validated.hospitalId = String(filters.hospitalId).trim();
  }
  
  return validated;
}

/**
 * Get available filter options (for UI)
 */
export async function getFilterOptions() {
  // This would query the database for distinct values
  // For now, return static options
  return {
    countries: [
      'Uganda', 'Kenya', 'Tanzania', 'Rwanda', 'Ghana', 'Nigeria', 'South Africa'
    ],
    conditions: [
      { code: 'E11', name: 'Diabetes Type 2' },
      { code: 'I10', name: 'Hypertension' },
      { code: 'B20', name: 'HIV' },
      { code: 'J44', name: 'COPD' },
      { code: 'I50', name: 'Heart Failure' }
    ],
    observationTypes: [
      { code: '4548-4', name: 'HbA1c' },
      { code: '2339-0', name: 'Blood Glucose' },
      { code: '2093-3', name: 'Cholesterol' },
      { code: '718-7', name: 'Hemoglobin' },
      { code: '777-3', name: 'Platelet Count' }
    ],
    genders: ['Male', 'Female', 'Other', 'Unknown'],
    ageRanges: [
      '0-4', '5-9', '10-14', '15-19', '20-24', '25-29', '30-34',
      '35-39', '40-44', '45-49', '50-54', '55-59', '60-64', '65+'
    ]
  };
}

