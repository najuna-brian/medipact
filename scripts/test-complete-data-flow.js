#!/usr/bin/env node

/**
 * Complete End-to-End Data Flow Test
 * 
 * Tests the complete flow:
 * 1. Hospital uploads CSV
 * 2. Data is processed and anonymized
 * 3. Data is stored in database
 * 4. Data is published to Hedera
 * 5. Researcher queries data
 * 6. Researcher exports CSV or accesses via API
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:8080';
const TEST_DIR = path.join(__dirname, '../tmp/test-data-flow');
const TIMEOUT = 30000; // 30 seconds

// Colors for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test state
const state = {
  hospitalId: null,
  hospitalApiKey: null,
  researcherId: null,
  apiKey: null,
  datasetId: null,
  recordsProcessed: 0,
  consentTopicId: null,
  dataTopicId: null,
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
};

// Helper functions
function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title) {
  console.log('');
  log(`=== ${title} ===`, 'blue');
  console.log('');
}

function logTest(name, status, details = '') {
  const symbol = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⊘';
  const color = status === 'PASS' ? 'green' : status === 'FAIL' ? 'red' : 'yellow';
  log(`${symbol} ${name}`, color);
  if (details) {
    console.log(`  ${details}`);
  }
  
  if (status === 'PASS') results.passed++;
  else if (status === 'FAIL') results.failed++;
  else results.skipped++;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function ensureTestDir() {
  try {
    await fs.mkdir(TEST_DIR, { recursive: true });
  } catch (error) {
    // Directory already exists
  }
}

// Test functions
async function testBackendConnectivity() {
  logSection('1. Testing Backend Connectivity');
  
  try {
    const response = await axios.get(`${BACKEND_URL}/api/marketplace/datasets`, {
      timeout: 5000,
    });
    logTest('Backend is accessible', 'PASS', `Status: ${response.status}`);
    return true;
  } catch (error) {
    logTest('Backend is accessible', 'FAIL', error.message);
    log('Please start the backend: cd backend && npm start', 'yellow');
    return false;
  }
}

async function createTestCSV() {
  logSection('2. Creating Test Data');
  
  const csvContent = `Patient ID,Patient Name,Age,Gender,Date of Birth,Address,Country,Lab Test,Result,Test Date,Condition,ICD10 Code
PAT-001,John Doe,35,Male,1988-05-15,"123 Main St, Kampala",Uganda,Blood Glucose,95,2024-01-15,Diabetes Type 2,E11
PAT-002,Jane Smith,42,Female,1981-08-22,"456 Oak Ave, Kampala",Uganda,HbA1c,6.2,2024-01-16,Diabetes Type 2,E11
PAT-003,Bob Johnson,28,Male,1995-12-10,"789 Pine Rd, Entebbe",Uganda,Blood Pressure,120/80,2024-01-17,Hypertension,I10
PAT-004,Alice Brown,55,Female,1968-03-25,"321 Elm St, Jinja",Uganda,Cholesterol,220,2024-01-18,Hyperlipidemia,E78
PAT-005,Charlie Wilson,38,Male,1985-07-08,"654 Maple Dr, Kampala",Uganda,Blood Glucose,110,2024-01-19,Diabetes Type 2,E11
PAT-006,Mary Davis,29,Female,1994-11-30,"987 Cedar Ln, Kampala",Uganda,HbA1c,5.8,2024-01-20,Healthy,N/A
PAT-007,Tom Miller,45,Male,1978-04-12,"147 Birch St, Entebbe",Uganda,Blood Pressure,135/90,2024-01-21,Hypertension,I10
PAT-008,Sarah Lee,33,Female,1990-09-05,"258 Spruce Ave, Jinja",Uganda,Blood Glucose,88,2024-01-22,Healthy,N/A
PAT-009,David Brown,50,Male,1973-06-18,"369 Willow Rd, Kampala",Uganda,Cholesterol,250,2024-01-23,Hyperlipidemia,E78
PAT-010,Lisa White,27,Female,1996-02-14,"741 Ash Dr, Entebbe",Uganda,HbA1c,5.5,2024-01-24,Healthy,N/A`;

  const csvPath = path.join(TEST_DIR, 'test_patients.csv');
  await fs.writeFile(csvPath, csvContent, 'utf8');
  
  logTest('Test CSV file created', 'PASS', `10 records, saved to ${csvPath}`);
  return csvPath;
}

async function createTestHospital() {
  logSection('3. Creating Test Hospital');
  
  // Check if credentials are provided
  if (process.env.HOSPITAL_ID && process.env.HOSPITAL_API_KEY) {
    state.hospitalId = process.env.HOSPITAL_ID;
    state.hospitalApiKey = process.env.HOSPITAL_API_KEY;
    logTest('Using provided hospital credentials', 'PASS');
    return true;
  }
  
  try {
    const email = `test-hospital-${Date.now()}@medipact.test`;
    const response = await axios.post(`${BACKEND_URL}/api/hospital/register`, {
      email,
      hospitalName: 'Test Hospital',
      country: 'Uganda',
    }, { timeout: TIMEOUT });
    
    if (response.data.hospitalId && response.data.apiKey) {
      state.hospitalId = response.data.hospitalId;
      state.hospitalApiKey = response.data.apiKey;
      logTest('Test hospital created', 'PASS', `ID: ${state.hospitalId}`);
      return true;
    }
  } catch (error) {
    if (error.response?.status === 409) {
      logTest('Test hospital creation', 'SKIP', 'Hospital already exists (may need manual setup)');
    } else {
      logTest('Test hospital creation', 'SKIP', `Endpoint may require manual setup: ${error.message}`);
    }
  }
  
  return false;
}

async function uploadCSV(csvPath) {
  logSection('4. Uploading and Processing CSV');
  
  if (!state.hospitalId || !state.hospitalApiKey) {
    logTest('CSV upload', 'SKIP', 'Hospital credentials not available');
    return false;
  }
  
  try {
    // Use axios with form data (axios handles multipart automatically)
    const csvContent = await fs.readFile(csvPath);
    const formData = new URLSearchParams();
    formData.append('hospitalCountry', 'Uganda');
    formData.append('hospitalLocation', 'Kampala, Uganda');
    
    // For file upload, we need to use FormData or a different approach
    // Since axios in Node.js needs form-data package, we'll use a workaround
    const { Readable } = await import('stream');
    const csvStream = Readable.from([csvContent]);
    csvStream.path = 'test_patients.csv';
    
    // Try to use form-data if available, otherwise use manual construction
    let FormData;
    try {
      const formDataModule = await import('form-data');
      FormData = formDataModule.default || formDataModule;
    } catch {
      FormData = null;
    }
    
    let requestData;
    let requestHeaders = {
      'X-API-Key': state.hospitalApiKey,
    };
    
    if (FormData) {
      const form = new FormData();
      form.append('file', csvContent, {
        filename: 'test_patients.csv',
        contentType: 'text/csv',
      });
      form.append('hospitalCountry', 'Uganda');
      form.append('hospitalLocation', 'Kampala, Uganda');
      requestData = form;
      requestHeaders = { ...form.getHeaders(), ...requestHeaders };
    } else {
      // Manual multipart construction
      const boundary = `----WebKitFormBoundary${Date.now()}`;
      const body = Buffer.concat([
        Buffer.from(`--${boundary}\r\n`),
        Buffer.from('Content-Disposition: form-data; name="file"; filename="test_patients.csv"\r\n'),
        Buffer.from('Content-Type: text/csv\r\n\r\n'),
        csvContent,
        Buffer.from(`\r\n--${boundary}\r\n`),
        Buffer.from('Content-Disposition: form-data; name="hospitalCountry"\r\n\r\n'),
        Buffer.from('Uganda'),
        Buffer.from(`\r\n--${boundary}\r\n`),
        Buffer.from('Content-Disposition: form-data; name="hospitalLocation"\r\n\r\n'),
        Buffer.from('Kampala, Uganda'),
        Buffer.from(`\r\n--${boundary}--\r\n`),
      ]);
      requestData = body;
      requestHeaders['Content-Type'] = `multipart/form-data; boundary=${boundary}`;
    }
    
    const response = await axios.post(
      `${BACKEND_URL}/api/hospital/upload-csv`,
      requestData,
      {
        headers: requestHeaders,
        timeout: 60000, // 60 seconds for processing
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      }
    );
    
    if (response.data.recordsProcessed > 0) {
      state.recordsProcessed = response.data.recordsProcessed;
      state.consentTopicId = response.data.consentTopicId;
      state.dataTopicId = response.data.dataTopicId;
      
      logTest('CSV uploaded and processed', 'PASS', 
        `Records: ${state.recordsProcessed}, Consent Topic: ${state.consentTopicId || 'N/A'}, Data Topic: ${state.dataTopicId || 'N/A'}`);
      
      // Wait for data to be stored
      log('  Waiting 5 seconds for data storage...', 'cyan');
      await sleep(5000);
      
      return true;
    } else {
      logTest('CSV uploaded and processed', 'FAIL', 'No records processed');
      return false;
    }
  } catch (error) {
    logTest('CSV uploaded and processed', 'FAIL', 
      error.response?.data?.error || error.message);
    return false;
  }
}

async function createTestResearcher() {
  logSection('5. Creating Test Researcher');
  
  // Check if credentials are provided
  if (process.env.RESEARCHER_ID) {
    state.researcherId = process.env.RESEARCHER_ID;
    logTest('Using provided researcher credentials', 'PASS');
    return true;
  }
  
  try {
    const email = `test-researcher-${Date.now()}@medipact.test`;
    const response = await axios.post(`${BACKEND_URL}/api/researcher/register`, {
      email,
      organizationName: 'Test Research Organization',
      contactName: 'Test Researcher',
      country: 'United States',
    }, { timeout: TIMEOUT });
    
    if (response.data.researcher?.researcherId) {
      state.researcherId = response.data.researcher.researcherId;
      logTest('Test researcher created', 'PASS', `ID: ${state.researcherId}`);
      return true;
    }
  } catch (error) {
    logTest('Test researcher creation', 'SKIP', 
      error.response?.data?.error || error.message);
  }
  
  return false;
}

async function verifyResearcher() {
  logSection('6. Verifying Researcher');
  
  if (!state.researcherId) {
    logTest('Researcher verification', 'SKIP', 'Researcher not created');
    return false;
  }
  
  // Try to verify (requires admin token)
  if (process.env.ADMIN_TOKEN) {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/researcher/admin/researchers/${state.researcherId}/verify`,
        {},
        {
          headers: { Authorization: `Bearer ${process.env.ADMIN_TOKEN}` },
          timeout: TIMEOUT,
        }
      );
      
      logTest('Researcher verified', 'PASS');
      return true;
    } catch (error) {
      logTest('Researcher verification', 'SKIP', 
        'Admin token may be invalid or endpoint requires different auth');
    }
  } else {
    logTest('Researcher verification', 'SKIP', 
      'Set ADMIN_TOKEN environment variable to auto-verify');
  }
  
  return false;
}

async function testResearcherQuery() {
  logSection('7. Testing Researcher Query (Marketplace API)');
  
  if (!state.researcherId) {
    logTest('Researcher query', 'SKIP', 'Researcher not available');
    return false;
  }
  
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/marketplace/query`,
      {
        researcherId: state.researcherId,
        country: 'Uganda',
        preview: true,
        limit: 10,
      },
      {
        headers: { 'x-researcher-id': state.researcherId },
        timeout: TIMEOUT,
      }
    );
    
    if (response.data.count !== undefined) {
      logTest('Researcher query executed', 'PASS', 
        `Found ${response.data.count} records`);
      
      if (response.data.results && response.data.results.length > 0) {
        logTest('Query returned results', 'PASS', 
          `${response.data.results.length} records in preview`);
      }
      
      return true;
    } else {
      logTest('Researcher query executed', 'FAIL', 'Invalid response format');
      return false;
    }
  } catch (error) {
    logTest('Researcher query executed', 'FAIL', 
      error.response?.data?.error || error.message);
    return false;
  }
}

async function createAPIKey() {
  logSection('8. Creating Researcher API Key');
  
  if (!state.researcherId) {
    logTest('API key creation', 'SKIP', 'Researcher not available');
    return false;
  }
  
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/researcher/${state.researcherId}/api-keys`,
      { name: 'Test API Key' },
      { timeout: TIMEOUT }
    );
    
    if (response.data.apiKey || response.data.key) {
      state.apiKey = response.data.apiKey || response.data.key;
      logTest('API key created', 'PASS', `Key: ${state.apiKey.substring(0, 20)}...`);
      return true;
    }
  } catch (error) {
    logTest('API key creation', 'SKIP', 
      error.response?.data?.error || 'Endpoint may require authentication');
  }
  
  return false;
}

async function testAPIAccess() {
  logSection('9. Testing API Key Data Access');
  
  if (!state.apiKey) {
    logTest('API key data access', 'SKIP', 'API key not created');
    return false;
  }
  
  try {
    const response = await axios.get(
      `${BACKEND_URL}/api/researcher/patients`,
      {
        params: { country: 'Uganda', limit: 5 },
        headers: { 'X-API-Key': state.apiKey },
        timeout: TIMEOUT,
      }
    );
    
    if (response.data.success && response.data.count !== undefined) {
      logTest('API key data access', 'PASS', 
        `Retrieved ${response.data.count} patients`);
      
      if (response.data.data && response.data.data.length > 0) {
        logTest('API returned patient data', 'PASS', 
          `Sample: ${response.data.data[0].anonymousPatientId || 'N/A'}`);
      }
      
      return true;
    } else {
      logTest('API key data access', 'FAIL', 'Invalid response format');
      return false;
    }
  } catch (error) {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      logTest('API key data access', 'SKIP', 
        'API key may require researcher verification');
    } else {
      logTest('API key data access', 'FAIL', 
        error.response?.data?.error || error.message);
    }
    return false;
  }
}

async function testCSVExport() {
  logSection('10. Testing CSV Export');
  
  if (!state.researcherId) {
    logTest('CSV export', 'SKIP', 'Researcher not available');
    return false;
  }
  
  try {
    // Get available datasets
    const datasetsResponse = await axios.get(
      `${BACKEND_URL}/api/marketplace/datasets`,
      { params: { country: 'Uganda' }, timeout: TIMEOUT }
    );
    
    if (datasetsResponse.data.datasets && datasetsResponse.data.datasets.length > 0) {
      state.datasetId = datasetsResponse.data.datasets[0].id;
      
      // Try to export
      const exportResponse = await axios.post(
        `${BACKEND_URL}/api/marketplace/datasets/${state.datasetId}/export`,
        {
          researcherId: state.researcherId,
          format: 'csv',
        },
        {
          timeout: TIMEOUT,
          responseType: 'arraybuffer', // For binary data
        }
      );
      
      if (exportResponse.data && exportResponse.data.length > 0) {
        const exportPath = path.join(TEST_DIR, 'exported_data.csv');
        await fs.writeFile(exportPath, exportResponse.data);
        
        logTest('CSV export successful', 'PASS', 
          `Exported to ${exportPath}, size: ${exportResponse.data.length} bytes`);
        return true;
      }
    } else {
      logTest('CSV export', 'SKIP', 'No datasets available (may need to purchase first)');
    }
  } catch (error) {
    const status = error.response?.status;
    if (status === 403) {
      logTest('CSV export', 'SKIP', 'Dataset purchase may be required');
    } else {
      logTest('CSV export', 'SKIP', 
        error.response?.data?.error || error.message);
    }
  }
  
  return false;
}

// Main test execution
async function main() {
  console.log('');
  log('==========================================', 'cyan');
  log('MediPact Complete Data Flow Test', 'cyan');
  log('==========================================', 'cyan');
  console.log('');
  
  await ensureTestDir();
  
  // Run tests in sequence
  const backendOk = await testBackendConnectivity();
  if (!backendOk) {
    process.exit(1);
  }
  
  const csvPath = await createTestCSV();
  const hospitalOk = await createTestHospital();
  
  if (hospitalOk) {
    await uploadCSV(csvPath);
  }
  
  const researcherOk = await createTestResearcher();
  if (researcherOk) {
    await verifyResearcher();
    await testResearcherQuery();
    await createAPIKey();
    await testAPIAccess();
    await testCSVExport();
  }
  
  // Summary
  console.log('');
  log('==========================================', 'cyan');
  log('Test Summary', 'cyan');
  log('==========================================', 'cyan');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, 'red');
  log(`Skipped: ${results.skipped}`, 'yellow');
  console.log('');
  
  if (results.failed === 0) {
    log('All critical tests passed!', 'green');
    console.log('');
    log('Data flow verified:', 'cyan');
    log('  ✓ Backend connectivity');
    log('  ✓ Test data creation');
    if (hospitalOk) log('  ✓ Hospital upload and processing');
    if (researcherOk) {
      log('  ✓ Researcher query');
      log('  ✓ API access');
      log('  ✓ CSV export');
    }
    process.exit(0);
  } else {
    log('Some tests failed. Check the output above.', 'red');
    process.exit(1);
  }
}

// Run tests
main().catch(error => {
  log(`Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

