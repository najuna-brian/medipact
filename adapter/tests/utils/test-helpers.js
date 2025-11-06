/**
 * Test Helpers and Utilities
 * 
 * Common utilities for testing MediPact adapter components
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Get path to test fixtures directory
 */
export function getFixturesPath() {
  return path.join(__dirname, '../fixtures');
}

/**
 * Create a temporary CSV file for testing
 * @param {Array<Object>} records - Array of record objects
 * @param {string} filename - Filename for the temp file
 * @returns {string} Path to the temporary file
 */
export function createTempCSV(records, filename = 'test-data.csv') {
  const fixturesDir = getFixturesPath();
  if (!fs.existsSync(fixturesDir)) {
    fs.mkdirSync(fixturesDir, { recursive: true });
  }

  const filePath = path.join(fixturesDir, filename);
  
  if (records.length === 0) {
    throw new Error('Records array cannot be empty');
  }

  // Get headers from first record
  const headers = Object.keys(records[0]);
  const lines = [headers.join(',')];
  
  records.forEach(record => {
    const values = headers.map(header => {
      const value = record[header] || '';
      // Escape commas and quotes in values
      if (value.includes(',') || value.includes('"')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    });
    lines.push(values.join(','));
  });

  fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  return filePath;
}

/**
 * Clean up temporary test files
 * @param {string} filePath - Path to file to delete
 */
export function cleanupTempFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Create sample patient records for testing
 * @returns {Array<Object>} Array of sample patient records
 */
export function createSampleRecords() {
  return [
    {
      'Patient Name': 'John Doe',
      'Patient ID': 'ID-12345',
      'Address': '123 Main St',
      'Phone Number': '+1234567890',
      'Date of Birth': '1990-01-01',
      'Lab Test': 'Blood Glucose',
      'Test Date': '2024-01-15',
      'Result': '95',
      'Unit': 'mg/dL',
      'Reference Range': '70-100'
    },
    {
      'Patient Name': 'John Doe',
      'Patient ID': 'ID-12345',
      'Address': '123 Main St',
      'Phone Number': '+1234567890',
      'Date of Birth': '1990-01-01',
      'Lab Test': 'Cholesterol',
      'Test Date': '2024-01-15',
      'Result': '180',
      'Unit': 'mg/dL',
      'Reference Range': '<200'
    },
    {
      'Patient Name': 'Jane Smith',
      'Patient ID': 'ID-12346',
      'Address': '456 Oak Ave',
      'Phone Number': '+0987654321',
      'Date of Birth': '1985-05-15',
      'Lab Test': 'Blood Glucose',
      'Test Date': '2024-01-16',
      'Result': '105',
      'Unit': 'mg/dL',
      'Reference Range': '70-100'
    }
  ];
}

/**
 * Create sample anonymized records for testing
 * @returns {Array<Object>} Array of anonymized records
 */
export function createSampleAnonymizedRecords() {
  return [
    {
      'Anonymous PID': 'PID-001',
      'Lab Test': 'Blood Glucose',
      'Test Date': '2024-01-15',
      'Result': '95',
      'Unit': 'mg/dL',
      'Reference Range': '70-100'
    },
    {
      'Anonymous PID': 'PID-001',
      'Lab Test': 'Cholesterol',
      'Test Date': '2024-01-15',
      'Result': '180',
      'Unit': 'mg/dL',
      'Reference Range': '<200'
    },
    {
      'Anonymous PID': 'PID-002',
      'Lab Test': 'Blood Glucose',
      'Test Date': '2024-01-16',
      'Result': '105',
      'Unit': 'mg/dL',
      'Reference Range': '70-100'
    }
  ];
}

