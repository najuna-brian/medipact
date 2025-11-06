/**
 * End-to-End Testing Script
 * 
 * Tests the complete MediPact adapter flow:
 * 1. CSV input processing
 * 2. FHIR input processing
 * 3. Anonymization validation
 * 4. Output verification
 * 5. HashScan link validation (if credentials available)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');
const CSV_INPUT = path.join(DATA_DIR, 'raw_data.csv');
const FHIR_INPUT = path.join(DATA_DIR, 'raw_data.fhir.json');
const CSV_OUTPUT = path.join(DATA_DIR, 'anonymized_data.csv');
const FHIR_OUTPUT = path.join(DATA_DIR, 'anonymized_data.fhir.json');

// PII fields that should NOT be in anonymized output
const PII_FIELDS = [
  'Patient Name',
  'Patient ID',
  'Address',
  'Phone Number',
  'Date of Birth'
];

// Medical fields that SHOULD be preserved
const MEDICAL_FIELDS = [
  'Lab Test',
  'Test Date',
  'Result',
  'Unit',
  'Reference Range',
  'Anonymous PID'
];

let testResults = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  const status = passed ? '✅' : '❌';
  const statusText = passed ? 'PASS' : 'FAIL';
  console.log(`${status} [${statusText}] ${name}${message ? ': ' + message : ''}`);
  
  testResults.tests.push({ name, passed, message });
  if (passed) {
    testResults.passed++;
  } else {
    testResults.failed++;
  }
}

function logWarning(message) {
  console.log(`⚠️  WARNING: ${message}`);
  testResults.warnings++;
}

async function testFileExists(filePath, description) {
  try {
    await fs.access(filePath);
    logTest(`${description} exists`, true);
    return true;
  } catch (error) {
    logTest(`${description} exists`, false, `File not found: ${filePath}`);
    return false;
  }
}

async function testCSVOutput() {
  console.log('\n=== Testing CSV Output ===');
  
  const exists = await testFileExists(CSV_OUTPUT, 'Anonymized CSV output');
  if (!exists) return;

  try {
    const content = await fs.readFile(CSV_OUTPUT, 'utf-8');
    const lines = content.trim().split('\n');
    
    if (lines.length < 2) {
      logTest('CSV has data rows', false, 'File appears empty or has only header');
      return;
    }

    logTest('CSV has data rows', true, `${lines.length - 1} records found`);

    // Parse header
    const header = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    
    // Check for PII fields
    const hasPII = PII_FIELDS.some(field => header.includes(field));
    logTest('No PII fields in header', !hasPII, hasPII ? `Found: ${PII_FIELDS.filter(f => header.includes(f)).join(', ')}` : '');

    // Check for medical fields
    const hasMedicalFields = MEDICAL_FIELDS.some(field => header.includes(field));
    logTest('Medical fields preserved', hasMedicalFields, hasMedicalFields ? `Found: ${MEDICAL_FIELDS.filter(f => header.includes(f)).join(', ')}` : 'Missing medical fields');

    // Check for Anonymous PID
    const hasAnonymousPID = header.includes('Anonymous PID');
    logTest('Anonymous PID present', hasAnonymousPID);

    // Check sample data rows
    if (lines.length > 1) {
      const sampleRow = lines[1].split(',').map(v => v.trim().replace(/"/g, ''));
      const hasData = sampleRow.some(cell => cell && cell.length > 0);
      logTest('Sample row has data', hasData);
    }

  } catch (error) {
    logTest('CSV output parsing', false, error.message);
  }
}

async function testFHIROutput() {
  console.log('\n=== Testing FHIR Output ===');
  
  const exists = await testFileExists(FHIR_OUTPUT, 'Anonymized FHIR Bundle');
  if (!exists) {
    logWarning('FHIR output not found - this is OK if CSV input was used');
    return;
  }

  try {
    const content = await fs.readFile(FHIR_OUTPUT, 'utf-8');
    const bundle = JSON.parse(content);

    logTest('FHIR Bundle is valid JSON', true);

    if (bundle.resourceType !== 'Bundle') {
      logTest('FHIR Bundle type', false, `Expected Bundle, got ${bundle.resourceType}`);
      return;
    }

    logTest('FHIR Bundle type', true, 'Bundle');

    if (!bundle.entry || !Array.isArray(bundle.entry)) {
      logTest('FHIR Bundle has entries', false, 'No entries array found');
      return;
    }

    logTest('FHIR Bundle has entries', true, `${bundle.entry.length} resources`);

    // Check for Patient resources
    const patients = bundle.entry.filter(e => e.resource?.resourceType === 'Patient');
    logTest('FHIR has Patient resources', patients.length > 0, `${patients.length} patients`);

    // Check anonymization in Patient resources
    if (patients.length > 0) {
      const patient = patients[0].resource;
      const hasPII = patient.name || patient.telecom || patient.address || patient.birthDate;
      logTest('Patient resources anonymized', !hasPII, hasPII ? 'PII still present' : 'PII removed');
      
      const hasAnonymousID = patient.identifier?.some(id => id.system?.includes('anonymous'));
      logTest('Patient has anonymous ID', hasAnonymousID);
    }

    // Check for Observation resources
    const observations = bundle.entry.filter(e => e.resource?.resourceType === 'Observation');
    logTest('FHIR has Observation resources', observations.length > 0, `${observations.length} observations`);

  } catch (error) {
    logTest('FHIR output parsing', false, error.message);
  }
}

async function testInputFiles() {
  console.log('\n=== Testing Input Files ===');
  
  await testFileExists(CSV_INPUT, 'CSV input file');
  await testFileExists(FHIR_INPUT, 'FHIR input file');
}

async function testEnvironment() {
  console.log('\n=== Testing Environment ===');
  
  // Check if .env exists
  const envPath = path.join(__dirname, '../.env');
  const envExists = await testFileExists(envPath, '.env file');
  
  if (envExists) {
    // Try to read and check for required variables (without exposing values)
    try {
      const envContent = await fs.readFile(envPath, 'utf-8');
      const hasOperatorId = envContent.includes('OPERATOR_ID=') && !envContent.includes('OPERATOR_ID=""');
      const hasOperatorKey = envContent.includes('OPERATOR_KEY=') && !envContent.includes('OPERATOR_KEY=""');
      const hasNetwork = envContent.includes('HEDERA_NETWORK=');
      
      logTest('OPERATOR_ID configured', hasOperatorId);
      logTest('OPERATOR_KEY configured', hasOperatorKey);
      logTest('HEDERA_NETWORK configured', hasNetwork);
      
      if (!hasOperatorId || !hasOperatorKey || !hasNetwork) {
        logWarning('Some environment variables missing - adapter may not connect to Hedera');
      }
    } catch (error) {
      logWarning(`Could not read .env file: ${error.message}`);
    }
  } else {
    logWarning('No .env file found - adapter will not connect to Hedera testnet');
  }
}

async function testHashScanLinks() {
  console.log('\n=== Testing HashScan Links ===');
  
  // Check if there's a log file or output that might contain HashScan links
  // This is a basic check - actual link validation would require network access
  logWarning('HashScan link validation requires running the adapter with Hedera credentials');
  logWarning('To fully test: Run "npm start" and verify links in output');
}

function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`⚠️  Warnings: ${testResults.warnings}`);
  console.log(`📊 Total Tests: ${testResults.tests.length}`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed!');
  } else {
    console.log('\n⚠️  Some tests failed. Review output above.');
  }
  
  console.log('\nNext Steps:');
  console.log('1. If environment is configured, run: npm start');
  console.log('2. Verify HashScan links in adapter output');
  console.log('3. Check anonymized output files');
  console.log('='.repeat(60));
}

async function runTests() {
  console.log('🧪 MediPact End-to-End Testing');
  console.log('='.repeat(60));
  
  await testInputFiles();
  await testEnvironment();
  await testCSVOutput();
  await testFHIROutput();
  await testHashScanLinks();
  
  printSummary();
  
  // Exit with appropriate code
  process.exit(testResults.failed > 0 ? 1 : 0);
}

runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

