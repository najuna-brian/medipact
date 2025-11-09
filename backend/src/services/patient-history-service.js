/**
 * Patient History Service
 * 
 * Aggregates patient medical records from all linked hospitals.
 * Provides complete medical history access for patients.
 */

/**
 * Get complete medical history for a patient
 * 
 * Aggregates records from all hospitals where patient is linked.
 * 
 * @param {string} upi - Unique Patient Identity
 * @param {Function} getLinkages - Function to get hospital linkages (upi) => Promise<Array>
 * @param {Function} getHospitalRecords - Function to get records from hospital (hospitalId, hospitalPatientId) => Promise<Array>
 * @returns {Promise<Object>} Complete medical history
 */
export async function getPatientMedicalHistory(upi, getLinkages, getHospitalRecords) {
  // Get all hospital linkages
  const linkages = await getLinkages(upi);
  
  if (linkages.length === 0) {
    return {
      upi,
      hospitals: [],
      records: [],
      totalRecords: 0,
      dateRange: null
    };
  }
  
  // Aggregate records from all hospitals
  const allRecords = [];
  const hospitalRecords = [];
  
  for (const linkage of linkages) {
    if (linkage.status !== 'active') continue;
    
    try {
      const records = await getHospitalRecords(
        linkage.hospitalId,
        linkage.hospitalPatientId
      );
      
      hospitalRecords.push({
        hospitalId: linkage.hospitalId,
        hospitalName: linkage.hospitalName || linkage.hospitalId,
        hospitalPatientId: linkage.hospitalPatientId,
        records: records,
        recordCount: records.length,
        linkedAt: linkage.linkedAt
      });
      
      allRecords.push(...records);
    } catch (error) {
      console.error(`Error fetching records from hospital ${linkage.hospitalId}:`, error);
      // Continue with other hospitals even if one fails
    }
  }
  
  // Calculate date range
  let dateRange = null;
  if (allRecords.length > 0) {
    const dates = allRecords
      .map(r => r['Test Date'] || r['Date'] || r.date)
      .filter(d => d)
      .map(d => new Date(d))
      .filter(d => !isNaN(d.getTime()));
    
    if (dates.length > 0) {
      dateRange = {
        start: new Date(Math.min(...dates)).toISOString(),
        end: new Date(Math.max(...dates)).toISOString()
      };
    }
  }
  
  return {
    upi,
    hospitals: hospitalRecords,
    records: allRecords,
    totalRecords: allRecords.length,
    hospitalCount: hospitalRecords.length,
    dateRange
  };
}

/**
 * Get medical history from specific hospital
 * 
 * @param {string} upi - Unique Patient Identity
 * @param {string} hospitalId - Hospital ID
 * @param {Function} getLinkage - Function to get linkage (upi, hospitalId) => Promise<Object>
 * @param {Function} getHospitalRecords - Function to get records from hospital
 * @returns {Promise<Object>} Hospital-specific medical history
 */
export async function getHospitalMedicalHistory(
  upi,
  hospitalId,
  getLinkage,
  getHospitalRecords
) {
  const linkage = await getLinkage(upi, hospitalId);
  
  if (!linkage || linkage.status !== 'active') {
    throw new Error(`Patient not linked to hospital ${hospitalId}`);
  }
  
  const records = await getHospitalRecords(
    linkage.hospitalId,
    linkage.hospitalPatientId
  );
  
  return {
    upi,
    hospitalId,
    hospitalName: linkage.hospitalName || hospitalId,
    hospitalPatientId: linkage.hospitalPatientId,
    records,
    recordCount: records.length,
    linkedAt: linkage.linkedAt
  };
}

/**
 * Get summary statistics for patient
 * 
 * @param {string} upi - Unique Patient Identity
 * @param {Function} getHistory - Function to get complete history
 * @param {Function} getPatient - Function to get patient record (optional, for Hedera Account ID)
 * @returns {Promise<Object>} Summary statistics
 */
export async function getPatientSummary(upi, getHistory, getPatient = null) {
  const history = await getHistory(upi);
  
  // Get patient record for Hedera Account ID
  let hederaAccountId = null;
  if (getPatient) {
    try {
      const patient = await getPatient(upi);
      hederaAccountId = patient?.hederaAccountId || null;
    } catch (error) {
      // Ignore errors - account ID may not exist
    }
  }
  
  // Group records by test type
  const testTypes = new Map();
  history.records.forEach(record => {
    const testType = record['Lab Test'] || record['Test Type'] || 'Unknown';
    testTypes.set(testType, (testTypes.get(testType) || 0) + 1);
  });
  
  return {
    upi,
    hederaAccountId,
    totalRecords: history.totalRecords,
    hospitalCount: history.hospitalCount,
    testTypes: Object.fromEntries(testTypes),
    dateRange: history.dateRange,
    hospitals: history.hospitals.map(h => ({
      hospitalId: h.hospitalId,
      hospitalName: h.hospitalName,
      recordCount: h.recordCount
    }))
  };
}

