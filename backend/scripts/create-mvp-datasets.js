/**
 * Create Multiple Datasets for MVP Presentation
 * 
 * Creates diverse datasets for all hospitals to showcase the platform
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.API_URL || 'https://medipact-production.up.railway.app';

async function apiCall(method, endpoint, data = null, headers = {}) {
  const url = `${API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Demo-Population': 'demo-populate-allow',
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
      throw new Error(`Invalid JSON: ${text.substring(0, 200)}`);
    }
    
    if (!response.ok) {
      throw new Error(result.error || result.message || `HTTP ${response.status}`);
    }
    
    return result;
  } catch (error) {
    throw new Error(`Request failed: ${error.message}`);
  }
}

// Dataset templates with variety
const datasetTemplates = [
  {
    name: 'Diabetes Research Dataset',
    description: 'Comprehensive diabetes patient data including demographics, conditions, and laboratory results for diabetes research and treatment outcomes analysis.',
    filters: {},
    conditionCodes: null
  },
  {
    name: 'Hypertension Study Data',
    description: 'Longitudinal hypertension data with blood pressure measurements, medication history, and treatment outcomes across multiple time points.',
    filters: {},
    conditionCodes: null
  },
  {
    name: 'Chronic Disease Registry',
    description: 'Multi-condition chronic disease registry covering diabetes, hypertension, cardiovascular diseases, and related comorbidities.',
    filters: {},
    conditionCodes: null
  },
  {
    name: 'Cardiovascular Health Data',
    description: 'Comprehensive cardiovascular health records including heart conditions, cardiac procedures, and related laboratory observations.',
    filters: {},
    conditionCodes: null
  },
  {
    name: 'Metabolic Syndrome Dataset',
    description: 'Metabolic syndrome research data including diabetes, hypertension, dyslipidemia, and obesity-related conditions with laboratory results.',
    filters: {},
    conditionCodes: null
  },
  {
    name: 'Pediatric Health Records',
    description: 'Pediatric healthcare data focusing on childhood conditions, growth metrics, and age-appropriate treatment protocols.',
    filters: { ageRange: '0-18' },
    conditionCodes: null
  },
  {
    name: 'Women\'s Health Dataset',
    description: 'Women\'s health data including reproductive health, maternal care, and gender-specific conditions with comprehensive observations.',
    filters: { gender: 'Female' },
    conditionCodes: null
  },
  {
    name: 'Emergency Care Records',
    description: 'Emergency department encounter data with acute conditions, procedures performed, and immediate treatment outcomes.',
    filters: {},
    conditionCodes: null
  },
  {
    name: 'Laboratory Results Dataset',
    description: 'Comprehensive laboratory test results including blood work, chemistry panels, and diagnostic tests with reference ranges.',
    filters: {},
    conditionCodes: null
  },
  {
    name: 'Infectious Disease Registry',
    description: 'Infectious disease data including diagnosis, treatment protocols, and outcomes for communicable diseases.',
    filters: {},
    conditionCodes: null
  }
];

async function createDatasetForHospital(hospital, template, datasetIndex) {
  const name = `${template.name} - ${hospital.country}`;
  const description = `${template.description} Data sourced from ${hospital.name} in ${hospital.country}.`;

  console.log(`  Creating: ${name}...`);

  try {
    const result = await apiCall('POST', '/api/adapter/create-dataset', {
      name,
      description,
      hospitalId: hospital.hospitalId,
      country: hospital.country,
      price: 100, // Will be recalculated by backend
      currency: 'HBAR',
      consentType: 'hospital_verified',
      filters: {
        country: hospital.country,
        ...template.filters
      },
      conditionCodes: template.conditionCodes,
      hcsTopicId: `0.0.${Math.floor(Math.random() * 9000000 + 1000000)}`,
      consentTopicId: `0.0.${Math.floor(Math.random() * 9000000 + 1000000)}`,
      dataTopicId: `0.0.${Math.floor(Math.random() * 9000000 + 1000000)}`
    }, {
      'X-Hospital-ID': hospital.hospitalId,
      'X-API-Key': hospital.apiKey
    });

    console.log(`    ✅ Created: ${result.dataset.id} (${result.dataset.recordCount} records, $${result.dataset.priceUSD?.toFixed(2)} USD)`);
    return result.dataset;
  } catch (error) {
    console.warn(`    ⚠️  Failed: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🚀 Creating MVP Datasets for Presentation\n');
  console.log(`📍 API URL: ${API_URL}\n`);

  // Load credentials
  const credentialsPath = path.join(__dirname, '..', 'demo-credentials.json');
  let credentials;
  
  try {
    credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf-8'));
  } catch (error) {
    console.error(`❌ Failed to load credentials: ${error.message}`);
    process.exit(1);
  }

  if (!credentials.hospitals || credentials.hospitals.length === 0) {
    console.error('❌ No hospitals found in credentials');
    process.exit(1);
  }

  console.log(`📋 Found ${credentials.hospitals.length} hospitals\n`);

  const allDatasets = [];
  const verifiedHospitals = credentials.hospitals.filter(h => h.apiKey);
  
  console.log(`🏥 Creating datasets for ${verifiedHospitals.length} verified hospitals\n`);

  // Create 3-4 datasets per hospital for variety
  const datasetsPerHospital = 4;
  
  for (let i = 0; i < verifiedHospitals.length; i++) {
    const hospital = verifiedHospitals[i];
    console.log(`\n${i + 1}. ${hospital.name} (${hospital.country})`);
    
    // Create multiple datasets per hospital
    for (let j = 0; j < datasetsPerHospital && j < datasetTemplates.length; j++) {
      const template = datasetTemplates[j];
      const dataset = await createDatasetForHospital(hospital, template, j);
      
      if (dataset) {
        allDatasets.push({
          datasetId: dataset.id,
          name: dataset.name,
          description: dataset.description,
          hospitalId: hospital.hospitalId,
          hospitalName: hospital.name,
          recordCount: dataset.recordCount,
          price: dataset.price,
          priceUSD: dataset.priceUSD,
          country: dataset.country,
          pricingCategory: dataset.pricingCategory
        });
      }
      
      // Small delay between dataset creations
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    // Delay between hospitals
    if (i < verifiedHospitals.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  // Update credentials file
  credentials.datasets = allDatasets;
  credentials.summary.datasets = allDatasets.length;
  credentials.summary.lastUpdated = new Date().toISOString();
  
  await fs.writeFile(credentialsPath, JSON.stringify(credentials, null, 2));

  // Summary
  const totalRecords = allDatasets.reduce((sum, d) => sum + (d.recordCount || 0), 0);
  const totalValue = allDatasets.reduce((sum, d) => sum + (d.priceUSD || 0), 0);
  const datasetsWithData = allDatasets.filter(d => d.recordCount > 0).length;

  console.log('\n' + '='.repeat(60));
  console.log('📊 MVP Dataset Creation Summary');
  console.log('='.repeat(60));
  console.log(`✅ Total Datasets Created: ${allDatasets.length}`);
  console.log(`📈 Datasets with Data: ${datasetsWithData}`);
  console.log(`📊 Total Records: ${totalRecords.toLocaleString()}`);
  console.log(`💰 Total Value: $${totalValue.toFixed(2)} USD`);
  console.log(`🏥 Hospitals Covered: ${verifiedHospitals.length}`);
  console.log(`✅ Updated: ${credentialsPath}`);
  console.log('='.repeat(60));
  console.log('\n🎉 MVP datasets ready for presentation!\n');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  console.error(error);
  process.exit(1);
});

