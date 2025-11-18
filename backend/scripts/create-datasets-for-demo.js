/**
 * Create Datasets for Demo Hospitals
 * 
 * Creates datasets for hospitals that already have FHIR data
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = process.env.API_URL || 'http://localhost:8080';

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

  const response = await fetch(url, options);
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(result.error || `HTTP ${response.status}`);
  }
  
  return result;
}

async function createDatasetForHospital(hospital, index) {
  const datasetNames = [
    'Diabetes Research Dataset',
    'Hypertension Study Data',
    'Chronic Disease Registry',
    'Cardiovascular Health Data',
    'Metabolic Syndrome Dataset'
  ];

  const name = datasetNames[index % datasetNames.length] || `Dataset ${index + 1}`;
  const description = `Comprehensive ${hospital.country} healthcare data for research purposes. Includes patient demographics, conditions, and laboratory observations.`;
  
  // Estimate record count (50 patients per hospital from last run)
  const estimatedRecords = 50;

  console.log(`  Creating dataset for ${hospital.name}: ${name}...`);

  try {
    const result = await apiCall('POST', '/api/adapter/create-dataset', {
      name,
      description,
      hospitalId: hospital.hospitalId,
      country: hospital.country,
      price: estimatedRecords * 0.12, // $0.12 per record (Condition Data category)
      currency: 'HBAR',
      consentType: 'hospital_verified',
      filters: {
        country: hospital.country
      },
      hcsTopicId: `0.0.${Math.floor(Math.random() * 9000000 + 1000000)}`,
      consentTopicId: `0.0.${Math.floor(Math.random() * 9000000 + 1000000)}`,
      dataTopicId: `0.0.${Math.floor(Math.random() * 9000000 + 1000000)}`
    }, {
      'X-Hospital-ID': hospital.hospitalId,
      'X-API-Key': hospital.apiKey
    });

    console.log(`    ✅ Created dataset: ${result.dataset.id}`);
    return result.dataset;
  } catch (error) {
    console.warn(`    ⚠️  Failed: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('📊 Creating Datasets for Demo Hospitals\n');

  // Load credentials
  const credentialsPath = path.join(__dirname, '..', 'demo-credentials.json');
  const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf-8'));

  const datasets = [];
  
  for (let i = 0; i < credentials.hospitals.length; i++) {
    const hospital = credentials.hospitals[i];
    const dataset = await createDatasetForHospital(hospital, i);
    if (dataset) {
      datasets.push({
        datasetId: dataset.id,
        name: dataset.name,
        description: dataset.description,
        hospitalId: hospital.hospitalId,
        hospitalName: hospital.name,
        recordCount: dataset.recordCount,
        price: dataset.price,
        priceUSD: dataset.priceUSD,
        country: dataset.country
      });
    }
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Update credentials file
  credentials.datasets = datasets;
  credentials.summary.datasets = datasets.length;
  await fs.writeFile(credentialsPath, JSON.stringify(credentials, null, 2));
  
  console.log(`\n✅ Created ${datasets.length} datasets`);
  console.log(`✅ Updated ${credentialsPath}\n`);
}

main().catch(console.error);

