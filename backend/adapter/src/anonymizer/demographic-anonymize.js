/**
 * Enhanced Demographic Anonymization Module
 * 
 * Handles anonymization with demographic data preservation:
 * - Age Range (REQUIRED): Calculated from Age or Date of Birth
 * - Country (REQUIRED): Extracted from address or uses hospital country
 * - Gender (REQUIRED): Preserved as-is, defaults to "Unknown" if missing
 * - Occupation (OPTIONAL): Generalized to categories or "Unknown"
 * - K-Anonymity: Enforced for privacy protection
 */

/**
 * Calculate age from date of birth
 * @param {string} dob - Date of birth (YYYY-MM-DD or similar format)
 * @returns {number} Age in years
 */
function calculateAgeFromDOB(dob) {
  if (!dob) return null;
  
  try {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  } catch (error) {
    console.warn(`Failed to calculate age from DOB "${dob}":`, error.message);
    return null;
  }
}

/**
 * Convert age to 5-year range
 * @param {number} age - Age in years
 * @returns {string} Age range (e.g., "35-39")
 */
function generalizeAgeToRange(age) {
  if (age < 1) return "<1";
  if (age >= 90) return "90+";
  
  // Round down to nearest 5-year boundary
  const lowerBound = Math.floor(age / 5) * 5;
  const upperBound = lowerBound + 4;
  
  return `${lowerBound}-${upperBound}`;
}

/**
 * Calculate age range from record (REQUIRED - must have Age or DOB)
 * @param {Object} record - Patient record
 * @returns {string} Age range (e.g., "35-39")
 * @throws {Error} If both age and DOB are missing
 */
export function calculateAgeRange(record) {
  let age = null;
  
  // Try to get age directly
  if (record['Age']) {
    age = parseInt(record['Age'], 10);
    if (isNaN(age)) {
      age = null;
    }
  }
  
  // If age missing, try to calculate from DOB
  if (age === null || isNaN(age)) {
    const dob = record['Date of Birth'] || record['DOB'] || record['Birth Date'];
    if (dob) {
      age = calculateAgeFromDOB(dob);
    }
  }
  
  // If still no age, throw error (age is required)
  if (age === null || isNaN(age)) {
    throw new Error('Age is required: record must have either "Age" or "Date of Birth" field');
  }
  
  return generalizeAgeToRange(age);
}

/**
 * Extract country from address string
 * @param {string} address - Address string
 * @returns {string|null} Country name or null
 */
function extractCountryFromString(address) {
  if (!address) return null;
  
  const addressLower = address.toLowerCase();
  
  // Common African countries and their cities
  const countryPatterns = {
    'Uganda': ['kampala', 'entebbe', 'jinja', 'gulu', 'mbale', 'mbarara', 'masaka', 'uganda'],
    'Kenya': ['nairobi', 'mombasa', 'kisumu', 'nakuru', 'kenya'],
    'Tanzania': ['dar es salaam', 'arusha', 'dodoma', 'tanzania'],
    'Rwanda': ['kigali', 'rwanda'],
    'Ghana': ['accra', 'kumasi', 'ghana'],
    'Nigeria': ['lagos', 'abuja', 'kano', 'nigeria'],
    'South Africa': ['johannesburg', 'cape town', 'pretoria', 'south africa'],
    'Ethiopia': ['addis ababa', 'ethiopia'],
    'Zimbabwe': ['harare', 'zimbabwe'],
    'Zambia': ['lusaka', 'zambia']
  };
  
  for (const [country, patterns] of Object.entries(countryPatterns)) {
    for (const pattern of patterns) {
      if (addressLower.includes(pattern)) {
        return country;
      }
    }
  }
  
  return null;
}

/**
 * Extract country from record (REQUIRED - always returns a country)
 * @param {Object} record - Patient record
 * @param {Object} hospitalInfo - Hospital configuration
 * @returns {string} Country name
 */
export function extractCountry(record, hospitalInfo) {
  // Try to extract from address
  const address = record['Address'] || record['City'] || record['Location'];
  if (address) {
    const extractedCountry = extractCountryFromString(address);
    if (extractedCountry) {
      return extractedCountry;
    }
  }
  
  // Use hospital country as fallback (required)
  if (hospitalInfo && hospitalInfo.country) {
    return hospitalInfo.country;
  }
  
  // If hospital country not set, throw error
  throw new Error('Country is required: HOSPITAL_COUNTRY environment variable must be set');
}

/**
 * Normalize gender (REQUIRED - defaults to "Unknown" if missing)
 * @param {string} gender - Gender value
 * @returns {string} Normalized gender (Male/Female/Other/Unknown)
 */
export function normalizeGender(gender) {
  if (!gender) return 'Unknown';
  
  const genderLower = gender.toLowerCase().trim();
  
  if (genderLower === 'male' || genderLower === 'm') {
    return 'Male';
  }
  if (genderLower === 'female' || genderLower === 'f') {
    return 'Female';
  }
  if (genderLower === 'other' || genderLower === 'o') {
    return 'Other';
  }
  
  // If unrecognized, return as-is or default to Unknown
  return gender || 'Unknown';
}

/**
 * Generalize occupation to category (OPTIONAL - returns "Unknown" if missing)
 * @param {string} occupation - Occupation value
 * @returns {string} Occupation category
 */
export function generalizeOccupation(occupation) {
  if (!occupation) return 'Unknown';
  
  const occupationLower = occupation.toLowerCase();
  
  // Healthcare
  if (occupationLower.includes('doctor') || occupationLower.includes('nurse') || 
      occupationLower.includes('medical') || occupationLower.includes('healthcare') ||
      occupationLower.includes('physician') || occupationLower.includes('surgeon')) {
    return 'Healthcare Worker';
  }
  
  // Education
  if (occupationLower.includes('teacher') || occupationLower.includes('professor') ||
      occupationLower.includes('educator') || occupationLower.includes('lecturer')) {
    return 'Education Worker';
  }
  
  // Government
  if (occupationLower.includes('government') || occupationLower.includes('civil service') ||
      occupationLower.includes('public servant')) {
    return 'Government Worker';
  }
  
  // Business
  if (occupationLower.includes('business') || occupationLower.includes('entrepreneur') ||
      occupationLower.includes('merchant') || occupationLower.includes('trader')) {
    return 'Business Professional';
  }
  
  // Agriculture
  if (occupationLower.includes('farmer') || occupationLower.includes('agriculture') ||
      occupationLower.includes('farming')) {
    return 'Agriculture Worker';
  }
  
  // Technology
  if (occupationLower.includes('tech') || occupationLower.includes('software') ||
      occupationLower.includes('engineer') || occupationLower.includes('developer') ||
      occupationLower.includes('programmer')) {
    return 'Technology Worker';
  }
  
  // Service
  if (occupationLower.includes('service') || occupationLower.includes('retail') ||
      occupationLower.includes('sales')) {
    return 'Service Worker';
  }
  
  // Student
  if (occupationLower.includes('student') || occupationLower.includes('pupil')) {
    return 'Student';
  }
  
  // Not Employed
  if (occupationLower.includes('unemployed') || occupationLower.includes('retired')) {
    return 'Not Employed';
  }
  
  // Other/Unknown
  return 'Other';
}

/**
 * Further generalize records to meet k-anonymity requirements
 * @param {Array} records - Records to generalize
 * @param {number} k - Minimum records per group (default: 5)
 * @returns {Array} Further generalized records
 */
function furtherGeneralize(records, k = 5) {
  // Group by demographics
  const groups = new Map();
  records.forEach((record, index) => {
    const key = [
      record['Country'],
      record['Age Range'],
      record['Gender'],
      record['Occupation Category']
    ].join('|');
    
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(index);
  });
  
  // Find groups with < k records
  const smallGroups = [];
  groups.forEach((indices, key) => {
    if (indices.length < k) {
      smallGroups.push({ key, indices, count: indices.length });
    }
  });
  
  // For now, we'll suppress small groups (remove them)
  // In a more sophisticated implementation, we could widen age ranges or generalize occupations
  const suppressedIndices = new Set();
  smallGroups.forEach(({ indices }) => {
    indices.forEach(idx => suppressedIndices.add(idx));
  });
  
  return records.filter((_, index) => !suppressedIndices.has(index));
}

/**
 * Enforce k-anonymity on records
 * @param {Array} records - Records to check
 * @param {number} k - Minimum records per group (default: 5)
 * @returns {Array} Records that meet k-anonymity requirements
 */
export function enforceKAnonymity(records, k = 5) {
  if (records.length < k) {
    console.warn(`Warning: Total records (${records.length}) is less than k (${k}). K-anonymity cannot be fully enforced.`);
    return records;
  }
  
  // Group by demographics
  const groups = new Map();
  records.forEach(record => {
    const key = [
      record['Country'],
      record['Age Range'],
      record['Gender'],
      record['Occupation Category'] || 'Unknown'
    ].join('|');
    
    groups.set(key, (groups.get(key) || 0) + 1);
  });
  
  // Check for violations
  const violations = [];
  groups.forEach((count, key) => {
    if (count < k) {
      violations.push({ key, count });
    }
  });
  
  if (violations.length > 0) {
    console.warn(`K-anonymity violations detected: ${violations.length} groups have < ${k} records`);
    console.warn('Suppressing records from small groups...');
    return furtherGeneralize(records, k);
  }
  
  return records;
}

/**
 * Generate anonymous patient ID
 * @param {number} index - Index of patient
 * @returns {string} Anonymous patient ID (e.g., PID-001)
 */
function generateAnonymousPID(index) {
  return `PID-${String(index + 1).padStart(3, '0')}`;
}

/**
 * Anonymize a single record with demographics
 * @param {Object} record - Patient record
 * @param {string} anonymousPID - Anonymous patient ID
 * @param {Object} hospitalInfo - Hospital configuration
 * @returns {Object} Anonymized record with demographics
 */
function anonymizeRecordWithDemographics(record, anonymousPID, hospitalInfo) {
  const anonymized = { ...record };
  
  // Remove PII fields
  delete anonymized['Patient Name'];
  delete anonymized['Patient ID'];
  delete anonymized['Address'];
  delete anonymized['City'];
  delete anonymized['Phone Number'];
  delete anonymized['Date of Birth'];
  delete anonymized['DOB'];
  delete anonymized['Birth Date'];
  delete anonymized['Postal Code'];
  delete anonymized['Email'];
  
  // Calculate and add demographics (REQUIRED fields)
  try {
    anonymized['Age Range'] = calculateAgeRange(record);
  } catch (error) {
    throw new Error(`Failed to calculate age range: ${error.message}`);
  }
  
  try {
    anonymized['Country'] = extractCountry(record, hospitalInfo);
  } catch (error) {
    throw new Error(`Failed to extract country: ${error.message}`);
  }
  
  anonymized['Gender'] = normalizeGender(record['Gender'] || record['Sex']);
  
  // Add optional demographics
  anonymized['Occupation Category'] = generalizeOccupation(record['Occupation'] || record['Job']);
  
  // Add anonymous patient ID
  anonymized['Anonymous PID'] = anonymousPID;
  
  // Remove original Age field (we have Age Range now)
  delete anonymized['Age'];
  
  return anonymized;
}

/**
 * Main anonymization function with demographics
 * @param {Array} records - Array of patient records
 * @param {Object} hospitalInfo - Hospital configuration
 *   - country: string (REQUIRED) - Hospital country
 *   - location: string (optional) - Hospital location
 *   - hospitalId: string (optional) - Hospital ID for UPI-based anonymization
 * @param {Object} upiOptions - UPI integration options (optional)
 *   - enabled: boolean - Enable UPI-based anonymization
 *   - getUPI: Function - (record) => Promise<string> - Get UPI for record
 *   - generateUPIPID: Function - (upi, hospitalId, index) => string - Generate UPI-based PID
 * @returns {Object} Object with anonymized records and patient mapping
 */
export function anonymizeWithDemographics(records, hospitalInfo, upiOptions = null) {
  // Validate hospital info
  if (!hospitalInfo || !hospitalInfo.country) {
    throw new Error('HOSPITAL_COUNTRY is required in hospitalInfo');
  }
  
  // Check if UPI is enabled
  const useUPI = upiOptions && upiOptions.enabled && hospitalInfo.hospitalId;
  
  // Group records by patient (using Patient ID before anonymization)
  const patientMap = new Map();
  const patientMapping = new Map(); // Original ID -> Anonymous PID
  const upiMapping = new Map(); // Original ID -> UPI (if UPI enabled)
  
  records.forEach(record => {
    const patientId = record['Patient ID'] || record['Patient Name'];
    if (!patientMap.has(patientId)) {
      patientMap.set(patientId, []);
    }
    patientMap.get(patientId).push(record);
  });
  
  // Anonymize each patient group
  const anonymizedRecords = [];
  let pidIndex = 0;
  
  for (const [originalPatientId, patientRecords] of patientMap) {
    let anonymousPID;
    let upi = null;
    
    if (useUPI && upiOptions.getUPI) {
      // Use UPI-based anonymization (async)
      // Note: This requires the caller to handle async properly
      // For now, we'll use a synchronous approach and let the caller handle UPI
      try {
        // If getUPI is async, we need to handle it differently
        // For now, assume UPI is provided in the record or calculated synchronously
        if (typeof upiOptions.getUPI === 'function') {
          // Try synchronous call first
          try {
            upi = upiOptions.getUPI(patientRecords[0]);
          } catch (e) {
            // If it's async, we'll need to handle it in the caller
            console.warn(`UPI lookup is async, skipping for now. Use async version if needed.`);
          }
        }
        
        if (upi) {
          anonymousPID = upiOptions.generateUPIPID 
            ? upiOptions.generateUPIPID(upi, hospitalInfo.hospitalId, pidIndex)
            : `${upi}-${hospitalInfo.hospitalId}-PID${String(pidIndex).padStart(3, '0')}`;
          upiMapping.set(originalPatientId, upi);
        } else {
          anonymousPID = generateAnonymousPID(pidIndex);
        }
      } catch (error) {
        console.warn(`Failed to get UPI for patient ${originalPatientId}, falling back to standard anonymization:`, error.message);
        anonymousPID = generateAnonymousPID(pidIndex);
      }
    } else {
      // Standard anonymization (no UPI)
      anonymousPID = generateAnonymousPID(pidIndex);
    }
    
    patientMapping.set(originalPatientId, anonymousPID);
    
    patientRecords.forEach(record => {
      try {
        const anonymized = anonymizeRecordWithDemographics(record, anonymousPID, hospitalInfo);
        anonymizedRecords.push(anonymized);
      } catch (error) {
        console.error(`Error anonymizing record for patient ${originalPatientId}:`, error.message);
        throw error;
      }
    });
    
    pidIndex++;
  }
  
  // Enforce k-anonymity
  const kAnonymizedRecords = enforceKAnonymity(anonymizedRecords, 5);
  
  return {
    records: kAnonymizedRecords,
    patientMapping,
    upiMapping: useUPI ? upiMapping : null
  };
}

/**
 * Stage 2: Chain Anonymization for CSV Records
 * Further anonymizes already-anonymized CSV records for immutable chain storage
 * 
 * @param {Array<Object>} storageAnonymizedRecords - Already anonymized records (from Stage 1)
 * @returns {Array<Object>} Further anonymized records for chain storage
 */
export function anonymizeCSVRecordsForChain(storageAnonymizedRecords) {
  return storageAnonymizedRecords.map(record => {
    const chainAnonymized = { ...record };
    
    // Further generalize age ranges (5-year → 10-year)
    if (chainAnonymized['Age Range']) {
      chainAnonymized['Age Range'] = generalizeAgeRangeTo10YearCSV(chainAnonymized['Age Range']);
    }
    
    // Round dates to month/year (remove exact dates)
    if (chainAnonymized['Test Date']) {
      chainAnonymized['Test Date'] = roundDateToMonthCSV(chainAnonymized['Test Date']);
    }
    if (chainAnonymized['Diagnosis Date']) {
      chainAnonymized['Diagnosis Date'] = roundDateToMonthCSV(chainAnonymized['Diagnosis Date']);
    }
    if (chainAnonymized['Encounter Date']) {
      chainAnonymized['Encounter Date'] = roundDateToMonthCSV(chainAnonymized['Encounter Date']);
    }
    
    // Remove region/district (keep only country)
    delete chainAnonymized['Region'];
    delete chainAnonymized['District'];
    delete chainAnonymized['City'];
    
    // Further generalize occupation
    if (chainAnonymized['Occupation Category']) {
      chainAnonymized['Occupation Category'] = generalizeOccupationFurtherCSV(
        chainAnonymized['Occupation Category']
      );
    }
    
    // Round very specific numeric values
    if (chainAnonymized['Result']) {
      const value = parseFloat(chainAnonymized['Result']);
      if (!isNaN(value) && value > 0) {
        if (value < 1) {
          chainAnonymized['Result'] = value.toFixed(2);
        } else if (value < 10) {
          chainAnonymized['Result'] = value.toFixed(1);
        } else {
          chainAnonymized['Result'] = Math.round(value).toString();
        }
      }
    }
    
    return chainAnonymized;
  });
}

/**
 * Generalize 5-year age range to 10-year range (CSV format)
 */
function generalizeAgeRangeTo10YearCSV(ageRange) {
  if (!ageRange || typeof ageRange !== 'string') return ageRange;
  
  if (ageRange === '<1') return '<10';
  if (ageRange === '90+') return '90+';
  
  const match = ageRange.match(/(\d+)-(\d+)/);
  if (!match) return ageRange;
  
  const lower = parseInt(match[1], 10);
  const upper = parseInt(match[2], 10);
  
  const lowerBound = Math.floor(lower / 10) * 10;
  const upperBound = lowerBound + 9;
  
  return `${lowerBound}-${upperBound}`;
}

/**
 * Round date to month/year (CSV format)
 */
function roundDateToMonthCSV(dateString) {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    return `${year}-${month}`;
  } catch (error) {
    return dateString;
  }
}

/**
 * Further generalize occupation to broader categories (CSV format)
 */
function generalizeOccupationFurtherCSV(occupationCategory) {
  if (!occupationCategory) return 'Unknown';
  
  const lower = occupationCategory.toLowerCase();
  
  if (lower.includes('health') || lower.includes('medical') || lower.includes('doctor') || lower.includes('nurse')) {
    return 'Healthcare';
  }
  if (lower.includes('education') || lower.includes('teacher')) {
    return 'Education';
  }
  if (lower.includes('agriculture') || lower.includes('farmer')) {
    return 'Agriculture';
  }
  if (lower.includes('technology') || lower.includes('engineer') || lower.includes('tech')) {
    return 'Technology';
  }
  if (lower.includes('business') || lower.includes('commerce') || lower.includes('trade')) {
    return 'Business';
  }
  
  return 'Other';
}

