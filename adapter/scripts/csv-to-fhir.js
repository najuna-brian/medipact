/**
 * CSV to FHIR Bundle Converter
 * 
 * Converts CSV patient data to FHIR R4 Bundle format.
 * This creates a standards-compliant FHIR file for demo purposes.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCSV } from '../src/anonymizer/anonymize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Convert CSV records to FHIR Bundle
 * @param {Array<Object>} records - CSV records
 * @returns {Object} FHIR Bundle
 */
function csvToFHIRBundle(records) {
  const bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: new Date().toISOString(),
    entry: []
  };
  
  // Group records by patient
  const patientMap = new Map();
  const observationMap = new Map();
  
  records.forEach(record => {
    const patientId = record['Patient ID'] || `patient-${record['Patient Name']?.replace(/\s+/g, '-').toLowerCase()}`;
    
    // Create or update patient
    if (!patientMap.has(patientId)) {
      const patient = {
        resourceType: 'Patient',
        id: patientId,
        identifier: [{
          system: 'urn:hospital:patient-id',
          value: record['Patient ID'] || patientId
        }],
        name: [{
          text: record['Patient Name'] || ''
        }],
        telecom: record['Phone Number'] ? [{
          system: 'phone',
          value: record['Phone Number']
        }] : [],
        address: record['Address'] ? [{
          text: record['Address']
        }] : [],
        birthDate: record['Date of Birth'] || undefined
      };
      
      // Remove undefined fields
      Object.keys(patient).forEach(key => {
        if (patient[key] === undefined) delete patient[key];
      });
      
      patientMap.set(patientId, patient);
    }
    
    // Create observation if lab test exists
    if (record['Lab Test']) {
      const observationId = `obs-${patientId}-${record['Lab Test']}-${record['Test Date']}`.replace(/\s+/g, '-');
      
      const observation = {
        resourceType: 'Observation',
        id: observationId,
        status: 'final',
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: getLOINCCode(record['Lab Test']),
            display: record['Lab Test']
          }],
          text: record['Lab Test']
        },
        subject: {
          reference: `Patient/${patientId}`
        },
        effectiveDateTime: record['Test Date'] || undefined,
        valueQuantity: record['Result'] && record['Unit'] ? {
          value: parseFloat(record['Result']) || record['Result'],
          unit: record['Unit'],
          system: 'http://unitsofmeasure.org',
          code: record['Unit']
        } : record['Result'] ? {
          valueString: record['Result']
        } : undefined,
        referenceRange: record['Reference Range'] ? parseReferenceRange(record['Reference Range'], record['Unit']) : undefined
      };
      
      // Remove undefined fields
      Object.keys(observation).forEach(key => {
        if (observation[key] === undefined) delete observation[key];
      });
      if (observation.valueQuantity && !observation.valueQuantity.value) {
        delete observation.valueQuantity;
      }
      
      observationMap.set(observationId, observation);
    }
  });
  
  // Add patients to bundle
  patientMap.forEach(patient => {
    bundle.entry.push({
      fullUrl: `urn:uuid:${patient.id}`,
      resource: patient
    });
  });
  
  // Add observations to bundle
  observationMap.forEach(observation => {
    bundle.entry.push({
      fullUrl: `urn:uuid:${observation.id}`,
      resource: observation
    });
  });
  
  return bundle;
}

/**
 * Get LOINC code for common lab tests
 * @param {string} testName - Lab test name
 * @returns {string} LOINC code
 */
function getLOINCCode(testName) {
  const loincMap = {
    'Blood Glucose': '2339-0',
    'Glucose': '2339-0',
    'Cholesterol': '2093-3',
    'Hemoglobin': '718-7',
    'HbA1c': '4548-4',
    'Complete Blood Count': 'CBC',
    'CBC': '58410-2'
  };
  
  const normalized = testName.toLowerCase();
  for (const [key, code] of Object.entries(loincMap)) {
    if (normalized.includes(key.toLowerCase())) {
      return code;
    }
  }
  
  // Default: return a placeholder
  return '00000-0';
}

/**
 * Parse reference range string
 * @param {string} rangeStr - Reference range (e.g., "70-100" or "<200")
 * @param {string} unit - Unit
 * @returns {Object} FHIR reference range
 */
function parseReferenceRange(rangeStr, unit) {
  const range = [];
  
  if (rangeStr.includes('<')) {
    const max = parseFloat(rangeStr.replace('<', '').trim());
    if (!isNaN(max)) {
      range.push({
        high: {
          value: max,
          unit: unit || '',
          system: 'http://unitsofmeasure.org'
        }
      });
    }
  } else if (rangeStr.includes('-')) {
    const parts = rangeStr.split('-').map(s => s.trim());
    const low = parseFloat(parts[0]);
    const high = parseFloat(parts[1]);
    
    if (!isNaN(low) && !isNaN(high)) {
      range.push({
        low: {
          value: low,
          unit: unit || '',
          system: 'http://unitsofmeasure.org'
        },
        high: {
          value: high,
          unit: unit || '',
          system: 'http://unitsofmeasure.org'
        }
      });
    }
  }
  
  return range.length > 0 ? range : undefined;
}

/**
 * Main function
 */
async function main() {
  const inputFile = path.join(__dirname, '../data/raw_data.csv');
  const outputFile = path.join(__dirname, '../data/raw_data.fhir.json');
  
  console.log('Converting CSV to FHIR Bundle...');
  console.log(`Input: ${inputFile}`);
  
  // Read CSV
  const records = await parseCSV(inputFile);
  console.log(`Read ${records.length} records`);
  
  // Convert to FHIR Bundle
  const bundle = csvToFHIRBundle(records);
  console.log(`Created FHIR Bundle with ${bundle.entry.length} resources`);
  console.log(`  - Patients: ${bundle.entry.filter(e => e.resource.resourceType === 'Patient').length}`);
  console.log(`  - Observations: ${bundle.entry.filter(e => e.resource.resourceType === 'Observation').length}`);
  
  // Write FHIR Bundle
  await fs.promises.writeFile(outputFile, JSON.stringify(bundle, null, 2), 'utf-8');
  console.log(`Output: ${outputFile}`);
  console.log('✓ Conversion complete!');
}

main().catch(console.error);

