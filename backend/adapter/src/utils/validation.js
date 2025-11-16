/**
 * Validation Utilities
 * 
 * Functions to validate anonymized data for:
 * - No PII leakage
 * - Required demographics present
 * - K-anonymity compliance
 * - No original patient IDs
 */

/**
 * Validate that no PII fields are present in records
 * @param {Array} records - Array of anonymized records
 * @throws {Error} If PII is detected
 */
export function validateNoPII(records) {
  const piiFields = [
    'Patient Name', 
    'Patient ID', 
    'Name', 
    'Address', 
    'City',
    'Phone Number', 
    'Date of Birth', 
    'DOB', 
    'Birth Date',
    'Email',
    'Postal Code',
    'Phone',
    'Telephone',
    'Mobile'
  ];
  
  records.forEach((record, index) => {
    piiFields.forEach(field => {
      if (record[field]) {
        throw new Error(`PII detected at record ${index}: Field "${field}" contains value: ${record[field]}`);
      }
    });
  });
}

/**
 * Validate that required demographics are present
 * @param {Array} records - Array of anonymized records
 * @throws {Error} If required demographics are missing
 */
export function validateRequiredDemographics(records) {
  records.forEach((record, index) => {
    if (!record['Age Range']) {
      throw new Error(`Record ${index}: Age Range is required but missing`);
    }
    if (!record['Country']) {
      throw new Error(`Record ${index}: Country is required but missing`);
    }
    if (!record['Gender']) {
      throw new Error(`Record ${index}: Gender is required but missing`);
    }
    // Occupation is optional, can be "Unknown"
  });
}

/**
 * Validate k-anonymity compliance
 * @param {Array} records - Array of anonymized records
 * @param {number} k - Minimum records per group (default: 5)
 * @throws {Error} If k-anonymity is violated
 */
export function validateKAnonymity(records, k = 5) {
  if (records.length < k) {
    console.warn(`Warning: Total records (${records.length}) is less than k (${k}). K-anonymity cannot be fully enforced.`);
    return; // Don't throw error, just warn
  }
  
  // Group by demographics
  const groups = new Map();
  records.forEach(record => {
    // Country, Age Range, and Gender are required (never 'Unknown' for these)
    const key = [
      record['Country'],      // REQUIRED
      record['Age Range'],    // REQUIRED
      record['Gender'],       // REQUIRED
      record['Occupation Category'] || 'Unknown'  // Optional, defaults to Unknown
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
    const violationDetails = violations.map(v => `  - ${v.key}: ${v.count} records`).join('\n');
    throw new Error(
      `K-anonymity violation: ${violations.length} groups have < ${k} records:\n${violationDetails}`
    );
  }
}

/**
 * Validate that no original patient IDs are present
 * @param {Array} records - Array of anonymized records
 * @throws {Error} If original patient IDs are detected
 */
export function validateNoOriginalIDs(records) {
  records.forEach((record, index) => {
    // Check for common original ID patterns
    const idFields = ['Patient ID', 'Original Patient ID', 'Original ID', 'ID'];
    
    idFields.forEach(field => {
      if (record[field] && !record[field].startsWith('PID-')) {
        throw new Error(
          `Record ${index}: Original patient ID detected in field "${field}": ${record[field]}. ` +
          `Only anonymous PIDs (PID-XXX) should be present.`
        );
      }
    });
    
    // Ensure Anonymous PID is present and valid
    if (!record['Anonymous PID']) {
      throw new Error(`Record ${index}: Anonymous PID is missing`);
    }
    
    if (!record['Anonymous PID'].startsWith('PID-')) {
      throw new Error(
        `Record ${index}: Invalid anonymous PID format: ${record['Anonymous PID']}. ` +
        `Expected format: PID-XXX`
      );
    }
  });
}

/**
 * Comprehensive validation of anonymized records
 * @param {Array} records - Array of anonymized records
 * @param {Object} options - Validation options
 *   - checkPII: boolean (default: true)
 *   - checkDemographics: boolean (default: true)
 *   - checkKAnonymity: boolean (default: true)
 *   - k: number (default: 5)
 *   - checkOriginalIDs: boolean (default: true)
 * @throws {Error} If validation fails
 */
export function validateAnonymizedRecords(records, options = {}) {
  const {
    checkPII = true,
    checkDemographics = true,
    checkKAnonymity = true,
    k = 5,
    checkOriginalIDs = true
  } = options;
  
  if (records.length === 0) {
    throw new Error('No records to validate');
  }
  
  if (checkPII) {
    validateNoPII(records);
  }
  
  if (checkDemographics) {
    validateRequiredDemographics(records);
  }
  
  if (checkOriginalIDs) {
    validateNoOriginalIDs(records);
  }
  
  if (checkKAnonymity) {
    validateKAnonymity(records, k);
  }
  
  console.log(`✓ Validation passed: ${records.length} records`);
}

