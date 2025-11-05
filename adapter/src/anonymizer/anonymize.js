/**
 * Data Anonymization Service
 * 
 * Removes PII (Personally Identifiable Information) from medical records
 * and replaces with anonymous patient IDs.
 */

import fs from 'fs';
import path from 'path';

/**
 * Parse a single CSV line, handling quoted values
 * @param {string} line - CSV line
 * @returns {Array<string>} Array of values
 */
function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      values.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add the last value
  values.push(current.trim());
  
  return values;
}

/**
 * Parse CSV file into array of objects
 * @param {string} filePath - Path to CSV file
 * @returns {Promise<Array>} Array of objects with CSV data
 */
export async function parseCSV(filePath) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const lines = content.split('\n').filter(line => line.trim() !== '');
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty');
    }

    // Parse header
    const headers = lines[0].split(',').map(h => h.trim());
    
    // Parse data rows (handle quoted values)
    const records = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      const record = {};
      headers.forEach((header, index) => {
        record[header] = values[index] || '';
      });
      records.push(record);
    }

    return records;
  } catch (error) {
    console.error('Error parsing CSV:', error);
    throw error;
  }
}

/**
 * Generate anonymous patient ID
 * @param {number} index - Index of patient (for unique ID generation)
 * @returns {string} Anonymous patient ID (e.g., PID-001)
 */
function generateAnonymousPID(index) {
  return `PID-${String(index + 1).padStart(3, '0')}`;
}

/**
 * Anonymize a single patient record
 * @param {Object} record - Patient record with PII
 * @param {string} anonymousPID - Anonymous patient ID to use
 * @returns {Object} Anonymized record
 */
function anonymizeRecord(record, anonymousPID) {
  const anonymized = { ...record };
  
  // Remove PII fields
  delete anonymized['Patient Name'];
  delete anonymized['Patient ID'];
  delete anonymized['Address'];
  delete anonymized['Phone Number'];
  delete anonymized['Date of Birth'];
  
  // Add anonymous patient ID
  anonymized['Anonymous PID'] = anonymousPID;
  
  return anonymized;
}

/**
 * Anonymize all patient records
 * @param {Array} records - Array of patient records
 * @returns {Object} Object with anonymized records and patient mapping
 *   - records: Array of anonymized records
 *   - patientMapping: Map of original Patient ID -> Anonymous PID
 */
export function anonymizeRecords(records) {
  // Group records by patient (using Patient ID before anonymization)
  const patientMap = new Map();
  const patientMapping = new Map(); // Original ID -> Anonymous PID
  
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
  
  patientMap.forEach((patientRecords, originalPatientId) => {
    const anonymousPID = generateAnonymousPID(pidIndex);
    patientMapping.set(originalPatientId, anonymousPID);
    
    patientRecords.forEach(record => {
      const anonymized = anonymizeRecord(record, anonymousPID);
      anonymizedRecords.push(anonymized);
    });
    
    pidIndex++;
  });

  return {
    records: anonymizedRecords,
    patientMapping
  };
}

/**
 * Write anonymized records to CSV file
 * @param {Array} records - Array of anonymized records
 * @param {string} outputPath - Path to output CSV file
 */
export async function writeAnonymizedCSV(records, outputPath) {
  if (records.length === 0) {
    throw new Error('No records to write');
  }

  // Get all unique headers from all records
  const headers = new Set();
  records.forEach(record => {
    Object.keys(record).forEach(key => headers.add(key));
  });

  const headerArray = Array.from(headers);
  
  // Create CSV content
  const lines = [headerArray.join(',')];
  
  records.forEach(record => {
    const values = headerArray.map(header => record[header] || '');
    lines.push(values.join(','));
  });

  const content = lines.join('\n');
  
  // Ensure output directory exists
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    await fs.promises.mkdir(outputDir, { recursive: true });
  }

  await fs.promises.writeFile(outputPath, content, 'utf-8');
  console.log(`Anonymized data written to: ${outputPath}`);
}
