/**
 * Test Dataset Creation on Hosted Environment
 * 
 * This script tests if dataset creation is working properly on the hosted API.
 * It verifies:
 * - Authentication
 * - Database schema (pricing columns)
 * - Pricing calculation
 * - Dataset creation flow
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.API_URL || process.env.HOSTED_API_URL || 'http://localhost:8080';

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function apiCall(method, endpoint, data = null, headers = {}) {
  const url = `${API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, options);
    const text = await response.text();
    let result;
    
    try {
      result = JSON.parse(text);
    } catch (e) {
      throw new Error(`Invalid JSON response: ${text.substring(0, 200)}`);
    }
    
    if (!response.ok) {
      throw new Error(result.error || result.message || `HTTP ${response.status}: ${text.substring(0, 200)}`);
    }
    
    return { status: response.status, data: result };
  } catch (error) {
    if (error.message.includes('Invalid JSON')) {
      throw error;
    }
    throw new Error(`Request failed: ${error.message}`);
  }
}

async function checkHealth() {
  log('\n🔍 Checking API health...', 'cyan');
  try {
    const result = await apiCall('GET', '/health');
    log('✅ API is healthy', 'green');
    return true;
  } catch (error) {
    log(`❌ API health check failed: ${error.message}`, 'red');
    log('   (This is okay - health endpoint may not be available)', 'yellow');
    // Don't fail if health check fails, just warn
    return true;
  }
}

async function loadCredentials() {
  log('\n📋 Loading credentials...', 'cyan');
  try {
    const credentialsPath = path.join(__dirname, '..', 'demo-credentials.json');
    const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf-8'));
    
    if (!credentials.hospitals || credentials.hospitals.length === 0) {
      throw new Error('No hospitals found in credentials');
    }
    
    log(`✅ Loaded ${credentials.hospitals.length} hospital(s)`, 'green');
    return credentials;
  } catch (error) {
    log(`❌ Failed to load credentials: ${error.message}`, 'red');
    throw error;
  }
}

async function testDatasetCreation(hospital) {
  log(`\n🧪 Testing dataset creation for ${hospital.name} (${hospital.hospitalId})...`, 'cyan');
  
  const testDataset = {
    name: `Test Dataset - ${new Date().toISOString()}`,
    description: 'Test dataset to verify creation functionality on hosted environment',
    hospitalId: hospital.hospitalId,
    country: hospital.country || 'US',
    price: 10, // Will be recalculated by backend
    currency: 'HBAR',
    consentType: 'hospital_verified',
    filters: {
      country: hospital.country || 'US'
    }
  };

  try {
    log('  Sending create-dataset request...', 'blue');
    const result = await apiCall('POST', '/api/adapter/create-dataset', testDataset, {
      'X-Hospital-ID': hospital.hospitalId,
      'X-API-Key': hospital.apiKey
    });

    const dataset = result.data.dataset;
    
    // Verify response structure
    log('  ✅ Dataset created successfully!', 'green');
    log(`     Dataset ID: ${dataset.id}`, 'blue');
    log(`     Name: ${dataset.name}`, 'blue');
    log(`     Record Count: ${dataset.recordCount}`, 'blue');
    log(`     Status: ${dataset.status}`, 'blue');
    
    // Check pricing fields
    const pricingChecks = {
      'price': dataset.price,
      'priceUSD': dataset.priceUSD,
      'pricePerRecordHBAR': dataset.pricePerRecordHBAR,
      'pricePerRecordUSD': dataset.pricePerRecordUSD,
      'pricingCategoryId': dataset.pricingCategoryId,
      'pricingCategory': dataset.pricingCategory,
      'volumeDiscount': dataset.volumeDiscount
    };
    
    log('\n  📊 Checking pricing fields...', 'cyan');
    let allPricingFieldsPresent = true;
    for (const [field, value] of Object.entries(pricingChecks)) {
      if (value === undefined || value === null) {
        log(`     ⚠️  Missing: ${field}`, 'yellow');
        allPricingFieldsPresent = false;
      } else {
        log(`     ✅ ${field}: ${value}`, 'green');
      }
    }
    
    if (!allPricingFieldsPresent) {
      log('\n  ⚠️  Warning: Some pricing fields are missing. Database migration may be needed.', 'yellow');
      log('     Run: POST /api/admin/migrate/pricing-fields', 'yellow');
    } else {
      log('\n  ✅ All pricing fields are present!', 'green');
    }
    
    // Verify dataset can be retrieved
    log('\n  🔍 Verifying dataset retrieval...', 'cyan');
    try {
      const getResult = await apiCall('GET', `/api/marketplace/datasets/${dataset.id}`);
      log('  ✅ Dataset can be retrieved successfully', 'green');
    } catch (error) {
      log(`  ⚠️  Warning: Could not retrieve dataset: ${error.message}`, 'yellow');
    }
    
    return {
      success: true,
      dataset,
      pricingFieldsComplete: allPricingFieldsPresent
    };
  } catch (error) {
    log(`  ❌ Dataset creation failed: ${error.message}`, 'red');
    
    // Provide helpful error messages
    if (error.message.includes('401') || error.message.includes('Missing hospital')) {
      log('     💡 Check: Hospital ID and API key are correct', 'yellow');
    } else if (error.message.includes('404') || error.message.includes('not found')) {
      log('     💡 Check: Hospital exists and is verified', 'yellow');
    } else if (error.message.includes('column') || error.message.includes('does not exist')) {
      log('     💡 Check: Database migration needed - missing columns', 'yellow');
      log('     Run: POST /api/admin/migrate/pricing-fields', 'yellow');
    } else if (error.message.includes('price') || error.message.includes('pricing')) {
      log('     💡 Check: Pricing service or exchange rate service may be down', 'yellow');
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}

async function main() {
  log('🚀 Dataset Creation Test for Hosted Environment', 'cyan');
  log(`📍 API URL: ${API_URL}\n`, 'blue');
  
  // Check API health
  const isHealthy = await checkHealth();
  if (!isHealthy) {
    log('\n❌ API is not accessible. Please check:', 'red');
    log('   - API_URL environment variable is set correctly', 'yellow');
    log('   - API server is running', 'yellow');
    log('   - Network connectivity', 'yellow');
    process.exit(1);
  }
  
  // Load credentials
  let credentials;
  try {
    credentials = await loadCredentials();
  } catch (error) {
    log('\n❌ Cannot proceed without credentials', 'red');
    process.exit(1);
  }
  
  // Test dataset creation for first hospital
  const hospital = credentials.hospitals[0];
  const result = await testDatasetCreation(hospital);
  
  // Summary
  log('\n' + '='.repeat(60), 'cyan');
  log('📊 Test Summary', 'cyan');
  log('='.repeat(60), 'cyan');
  
  if (result.success) {
    log('✅ Dataset creation: WORKING', 'green');
    if (result.pricingFieldsComplete) {
      log('✅ Pricing fields: COMPLETE', 'green');
    } else {
      log('⚠️  Pricing fields: INCOMPLETE (migration needed)', 'yellow');
    }
    log(`✅ Dataset ID: ${result.dataset.id}`, 'green');
    log(`✅ Record Count: ${result.dataset.recordCount}`, 'green');
  } else {
    log('❌ Dataset creation: FAILED', 'red');
    log(`❌ Error: ${result.error}`, 'red');
    process.exit(1);
  }
  
  log('\n');
}

main().catch(error => {
  log(`\n❌ Fatal error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});

