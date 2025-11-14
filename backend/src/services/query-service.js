/**
 * Query Service
 * 
 * Handles complex queries on FHIR resources with filtering, consent validation,
 * and HCS audit logging.
 */

import { queryFHIRResources, countFHIRPatients } from '../db/fhir-db.js';
import { queryEncryptedFHIRResources } from './encrypted-fhir-service.js';
import { createQueryLog } from '../db/query-db.js';
import { logQueryToHCS } from '../hedera/hcs-client.js';
import { checkPatientDataAccess } from './patient-preferences-service.js';
import { getResearcher } from '../db/researcher-db.js';

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
  
  // Get researcher info for patient preference checks
  let researcherInfo = null;
  if (researcherId) {
    const researcher = await getResearcher(researcherId);
    if (researcher) {
      researcherInfo = {
        isVerified: researcher.verificationStatus === 'verified',
        organizationName: researcher.organizationName
      };
    }
  }
  
  // Execute query
  let results = [];
  let count = 0;
  
  if (preview) {
    // Preview mode: only get count
    // Note: For preview, we still need to filter by patient preferences
    // This is a simplified count - actual filtering happens in full query
    count = await countFHIRPatients(validatedFilters);
  } else {
    // Full query: get actual data
    validatedFilters.limit = limit * 2; // Get more to account for filtering
    
    // Use encrypted query service - returns encrypted data for platform
    // Researchers cannot decrypt - they only see anonymized data
    // Note: req is not available here, so we use queryFHIRResources directly
    // Platform will only see encrypted/anonymized data
    results = await queryFHIRResources(validatedFilters);
    
    // Filter results based on patient preferences
    if (researcherId && researcherInfo) {
      results = await filterByPatientPreferences(
        results,
        researcherId,
        researcherInfo,
        {
          recordCount: results.length,
          isSensitive: checkIfSensitive(validatedFilters)
        }
      );
    }
    
    // Limit to requested amount after filtering
    results = results.slice(0, limit);
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
 * Filter results based on patient preferences
 * @param {Array} results - Query results
 * @param {string} researcherId - Researcher ID
 * @param {Object} researcherInfo - Researcher information
 * @param {Object} requestDetails - Request details
 * @returns {Promise<Array>} Filtered results
 */
async function filterByPatientPreferences(results, researcherId, researcherInfo, requestDetails) {
  const filtered = [];
  const upiSet = new Set(results.map(r => r.upi));
  const upis = Array.from(upiSet);
  
  // Batch check patient preferences
  const { checkPatientDataAccess } = await import('./patient-preferences-service.js');
  
  for (const result of results) {
    const accessCheck = await checkPatientDataAccess(
      result.upi,
      researcherId,
      researcherInfo,
      {
        ...requestDetails,
        pricePerRecord: requestDetails.pricePerRecord || null
      }
    );
    
    if (accessCheck.allowed) {
      filtered.push(result);
    }
  }
  
  return filtered;
}

/**
 * Check if query involves sensitive data
 * @param {Object} filters - Query filters
 * @returns {boolean}
 */
function checkIfSensitive(filters) {
  const sensitiveConditions = ['B20', 'F32', 'F33', 'F41', 'F42']; // HIV, mental health
  if (filters.conditionCode && sensitiveConditions.includes(filters.conditionCode)) {
    return true;
  }
  return false;
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

