/**
 * Revenue Integration Service
 * 
 * Integrates adapter with backend revenue distribution API.
 * Distributes revenue using Hedera Account IDs after data processing.
 */

import axios from 'axios';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3002';

/**
 * Distribute revenue for a single patient
 * 
 * @param {string} patientUPI - Patient UPI
 * @param {string} hospitalId - Hospital ID
 * @param {number} amount - Revenue amount in tinybars
 * @returns {Promise<Object>} Distribution result
 */
export async function distributePatientRevenue(patientUPI, hospitalId, amount) {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/api/revenue/distribute`, {
      patientUPI,
      hospitalId,
      totalAmount: amount
    });

    return response.data;
  } catch (error) {
    console.error(`Error distributing revenue for patient ${patientUPI}:`, error.message);
    throw error;
  }
}

/**
 * Distribute revenue for multiple patients (bulk)
 * 
 * @param {Array<Object>} sales - Array of { patientUPI, hospitalId, amount }
 * @returns {Promise<Array>} Bulk distribution results
 */
export async function distributeBulkRevenue(sales) {
  try {
    const response = await axios.post(`${BACKEND_API_URL}/api/revenue/distribute-bulk`, {
      sales
    });

    // The backend returns an array of results
    return response.data.results || response.data;
  } catch (error) {
    console.error('Error distributing bulk revenue:', error.message);
    throw error;
  }
}

/**
 * Get patient UPI from backend using contact information
 * 
 * @param {Object} rawRecord - Raw patient record with PII
 * @param {string} backendApiUrl - Backend API URL
 * @returns {Promise<string|null>} Patient UPI or null if not found
 */
export async function lookupPatientUPI(rawRecord, backendApiUrl) {
  try {
    const contactInfo = {
      email: rawRecord['Email'] || rawRecord['email'] || null,
      phone: rawRecord['Phone Number'] || rawRecord['phone'] || null,
      nationalId: rawRecord['National ID'] || rawRecord['national_id'] || null
    };

    // Try email first
    if (contactInfo.email) {
      const response = await axios.post(`${backendApiUrl}/api/patient/lookup`, {
        email: contactInfo.email
      });
      if (response.data && response.data.upi) {
        return response.data.upi;
      }
    }

    // Try phone
    if (contactInfo.phone) {
      const response = await axios.post(`${backendApiUrl}/api/patient/lookup`, {
        phone: contactInfo.phone
      });
      if (response.data && response.data.upi) {
        return response.data.upi;
      }
    }

    // Try national ID
    if (contactInfo.nationalId) {
      const response = await axios.post(`${backendApiUrl}/api/patient/lookup`, {
        nationalId: contactInfo.nationalId
      });
      if (response.data && response.data.upi) {
        return response.data.upi;
      }
    }

    return null;
  } catch (error) {
    console.warn(`Failed to lookup UPI for patient: ${error.message}`);
    return null;
  }
}

/**
 * Distribute revenue after data processing
 * 
 * Note: This function processes data from a single hospital, so all patients
 * will have the same hospitalId. For dataset purchases with patients from
 * multiple hospitals, use distributeDatasetRevenue() instead.
 * 
 * @param {Object} params
 *   - patientMapping: Map - Original ID -> Anonymous PID
 *   - upiMapping: Map - Original ID -> UPI (optional)
 *   - rawRecords: Array - Raw patient records with PII (for UPI lookup)
 *   - hospitalId: string - Hospital ID (same for all patients in this batch)
 *   - totalRevenue: number - Total revenue in tinybars
 *   - recordsPerPatient: Map - Patient ID -> number of records
 * @returns {Promise<Object>} Distribution results
 */
export async function distributeRevenueAfterProcessing({
  patientMapping,
  upiMapping = null,
  rawRecords = null,
  hospitalId,
  totalRevenue,
  recordsPerPatient = null
}) {
  if (!hospitalId) {
    console.warn('⚠️  Hospital ID not provided. Skipping revenue distribution.');
    return { skipped: true, reason: 'Hospital ID not provided' };
  }

  if (!BACKEND_API_URL || BACKEND_API_URL === 'http://localhost:3002') {
    console.warn('⚠️  Backend API URL not configured. Set BACKEND_API_URL in .env');
    return { skipped: true, reason: 'Backend API URL not configured' };
  }

  try {
    // Calculate revenue per patient
    const totalPatients = patientMapping.size;
    const revenuePerPatient = Math.floor(totalRevenue / totalPatients);
    
    // Prepare sales array
    const sales = [];
    const upiLookupCache = new Map(); // Cache UPI lookups
    
    // Build raw record map for UPI lookup
    const rawRecordMap = new Map();
    if (rawRecords) {
      rawRecords.forEach(record => {
        const patientId = record['Patient ID'] || record['Patient Name'];
        if (!rawRecordMap.has(patientId)) {
          rawRecordMap.set(patientId, record);
        }
      });
    }
    
    for (const [originalPatientId, anonymousPID] of patientMapping) {
      // Try to get UPI
      let patientUPI = null;
      
      // First, check UPI mapping
      if (upiMapping && upiMapping.has(originalPatientId)) {
        patientUPI = upiMapping.get(originalPatientId);
      } else if (upiLookupCache.has(originalPatientId)) {
        // Check cache
        patientUPI = upiLookupCache.get(originalPatientId);
      } else if (rawRecordMap.has(originalPatientId)) {
        // Look up UPI from backend using raw record
        const rawRecord = rawRecordMap.get(originalPatientId);
        patientUPI = await lookupPatientUPI(rawRecord, BACKEND_API_URL);
        if (patientUPI) {
          upiLookupCache.set(originalPatientId, patientUPI);
        }
      }

      if (!patientUPI) {
        console.warn(`⚠️  UPI not available for patient ${originalPatientId}. Skipping revenue distribution.`);
        continue;
      }

      // Calculate amount for this patient
      // If recordsPerPatient is provided, distribute proportionally
      let patientAmount = revenuePerPatient;
      if (recordsPerPatient && recordsPerPatient.has(originalPatientId)) {
        const patientRecords = recordsPerPatient.get(originalPatientId);
        const totalRecords = Array.from(recordsPerPatient.values()).reduce((a, b) => a + b, 0);
        patientAmount = Math.floor((totalRevenue * patientRecords) / totalRecords);
      }

      sales.push({
        patientUPI,
        hospitalId,
        amount: patientAmount
      });
    }

    if (sales.length === 0) {
      console.warn('⚠️  No sales to process. All patients missing UPI.');
      return { skipped: true, reason: 'No patients with UPI available' };
    }

    console.log(`\n💰 Distributing revenue for ${sales.length} patients...`);
    
    // Use bulk distribution for efficiency
    const result = await distributeBulkRevenue(sales);
    
    // Calculate summary
    const successful = result.filter(r => r.success).length;
    const failed = result.filter(r => !r.success).length;
    
    return {
      success: true,
      total: sales.length,
      successful,
      failed,
      results: result
    };
  } catch (error) {
    console.error('Error distributing revenue:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

