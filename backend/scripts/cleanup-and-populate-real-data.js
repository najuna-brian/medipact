/**
 * Cleanup Placeholders and Populate Real Data
 * 
 * 1. Deletes all placeholder datasets (0 records)
 * 2. Populates FHIR data for all hospitals
 * 3. Creates new datasets with real data
 */

import { getDatabase, getDatabaseType, initDatabase } from '../src/db/database.js';
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
}

async function deletePlaceholderDatasets() {
  console.log('🧹 Step 1: Deleting placeholder datasets...\n');
  
  await initDatabase();
  const db = getDatabase();
  const dbType = getDatabaseType();
  const { promisify } = await import('util');

  // Get all datasets with 0 records
  let placeholders;
  if (dbType === 'postgresql') {
    const result = await db.query('SELECT id, name, record_count FROM datasets WHERE record_count = 0');
    placeholders = result.rows;
  } else {
    const all = promisify(db.all.bind(db));
    placeholders = await all('SELECT id, name, record_count FROM datasets WHERE record_count = 0');
  }

  console.log(`  Found ${placeholders.length} placeholder datasets to delete\n`);

  if (placeholders.length === 0) {
    console.log('  ✅ No placeholders to delete\n');
    return;
  }

  let deleted = 0;
  for (const dataset of placeholders) {
    try {
      if (dbType === 'postgresql') {
        await db.query('DELETE FROM datasets WHERE id = $1', [dataset.id]);
      } else {
        const run = promisify(db.run.bind(db));
        await run('DELETE FROM datasets WHERE id = ?', [dataset.id]);
      }
      console.log(`  ✅ Deleted: ${dataset.name} (${dataset.id})`);
      deleted++;
    } catch (error) {
      console.error(`  ❌ Failed to delete ${dataset.id}: ${error.message}`);
    }
  }

  console.log(`\n  ✅ Deleted ${deleted} placeholder datasets\n`);
}

async function populateFHIRDataForHospitals() {
  console.log('📊 Step 2: Populating FHIR data for hospitals...\n');

  // Load credentials
  const credentialsPath = path.join(__dirname, '..', 'demo-credentials.json');
  const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf-8'));

  const hospitals = credentials.hospitals.filter(h => h.apiKey);
  console.log(`  Found ${hospitals.length} hospitals with API keys\n`);

  // Import populate function from populate-demo-data.js
  const populateScriptPath = path.join(__dirname, 'populate-demo-data.js');
  
  // For now, we'll use the populate-demo-data script approach
  // But we'll create a simpler version that just submits FHIR data
  
  const PATIENTS_PER_HOSPITAL = 50;
  
  for (let i = 0; i < hospitals.length; i++) {
    const hospital = hospitals[i];
    
    // Skip Tanzania - it already has data
    if (hospital.country === 'Tanzania') {
      console.log(`  ⏭️  Skipping ${hospital.name} (already has data)`);
      continue;
    }

    console.log(`  📋 Populating data for ${hospital.name} (${hospital.country})...`);

    // Generate FHIR patient data
    const patients = [];
    for (let j = 0; j < PATIENTS_PER_HOSPITAL; j++) {
      const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55-64', '65+'];
      const genders = ['Male', 'Female', 'Other'];
      const conditions = [
        { code: 'E11', name: 'Type 2 diabetes mellitus' },
        { code: 'I10', name: 'Essential hypertension' },
        { code: 'E78', name: 'Disorders of lipoprotein metabolism' },
        { code: 'K21', name: 'Gastro-esophageal reflux disease' }
      ];
      const observations = [
        { code: '4548-4', name: 'HbA1c', unit: '%' },
        { code: '2339-0', name: 'Glucose', unit: 'mg/dL' },
        { code: '2093-3', name: 'Cholesterol', unit: 'mg/dL' }
      ];

      const patientId = `PAT-${hospital.hospitalId.substring(5)}-${String(j + 1).padStart(3, '0')}`;
      const upi = `UPI-${hospital.hospitalId.substring(5)}-${String(j + 1).padStart(3, '0')}`;
      
      const condition = conditions[j % conditions.length];
      const observation = observations[j % observations.length];
      
      const patient = {
        anonymousPatientId: patientId,
        upi: upi,
        country: hospital.country,
        region: hospital.location || `${hospital.country} Region`,
        ageRange: ageRanges[j % ageRanges.length],
        gender: genders[j % genders.length],
        conditions: [{
          conditionCode: condition.code,
          conditionName: condition.name,
          diagnosisDate: new Date(2020 + (j % 4), j % 12, (j % 28) + 1).toISOString().split('T')[0],
          severity: j % 2 === 0 ? 'moderate' : 'mild',
          status: 'active'
        }],
        observations: [{
          observationCode: observation.code,
          observationName: observation.name,
          value: String(70 + (j % 30)),
          unit: observation.unit,
          effectiveDate: new Date(2023 + (j % 2), j % 12, (j % 28) + 1).toISOString().split('T')[0],
          referenceRange: 'Normal',
          interpretation: j % 3 === 0 ? 'High' : j % 3 === 1 ? 'Normal' : 'Low'
        }]
      };
      
      patients.push(patient);
    }

    // Submit FHIR data
    try {
      const batchSize = 10;
      let submitted = 0;
      
      for (let k = 0; k < patients.length; k += batchSize) {
        const batch = patients.slice(k, k + batchSize);
        
        await apiCall('POST', '/api/adapter/submit-fhir-resources', {
          hospitalId: hospital.hospitalId,
          patients: batch,
          consentType: 'hospital_verified'
        }, {
          'X-Hospital-ID': hospital.hospitalId,
          'X-API-Key': hospital.apiKey
        });
        
        submitted += batch.length;
        console.log(`    ✅ Submitted ${submitted}/${patients.length} patients`);
        
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      console.log(`  ✅ Completed: ${hospital.name} (${submitted} patients)\n`);
    } catch (error) {
      console.error(`  ❌ Failed: ${hospital.name} - ${error.message}\n`);
    }
    
    // Delay between hospitals
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}

async function createRealDatasets() {
  console.log('📦 Step 3: Creating datasets with real data...\n');

  const credentialsPath = path.join(__dirname, '..', 'demo-credentials.json');
  const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf-8'));

  const hospitals = credentials.hospitals.filter(h => h.apiKey);
  const datasetTemplates = [
    { name: 'Diabetes Research Dataset', filters: {} },
    { name: 'Hypertension Study Data', filters: {} },
    { name: 'Chronic Disease Registry', filters: {} },
    { name: 'Cardiovascular Health Data', filters: {} }
  ];

  const allDatasets = [];

  for (let i = 0; i < hospitals.length; i++) {
    const hospital = hospitals[i];
    console.log(`  Creating datasets for ${hospital.name}...`);

    for (let j = 0; j < datasetTemplates.length; j++) {
      const template = datasetTemplates[j];
      const name = `${template.name} - ${hospital.country}`;
      
      try {
        const result = await apiCall('POST', '/api/adapter/create-dataset', {
          name,
          description: `Comprehensive ${hospital.country} healthcare data for research. Data from ${hospital.name}.`,
          hospitalId: hospital.hospitalId,
          country: hospital.country,
          price: 100,
          currency: 'HBAR',
          consentType: 'hospital_verified',
          filters: {
            country: hospital.country,
            ...template.filters
          }
        }, {
          'X-Hospital-ID': hospital.hospitalId,
          'X-API-Key': hospital.apiKey
        });

        console.log(`    ✅ ${name}: ${result.dataset.recordCount} records, $${result.dataset.priceUSD?.toFixed(2)} USD`);
        
        allDatasets.push({
          datasetId: result.dataset.id,
          name: result.dataset.name,
          recordCount: result.dataset.recordCount,
          price: result.dataset.price,
          priceUSD: result.dataset.priceUSD,
          country: result.dataset.country,
          hospitalId: hospital.hospitalId
        });
      } catch (error) {
        console.warn(`    ⚠️  Failed: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
    }
    
    console.log('');
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  // Update credentials
  credentials.datasets = allDatasets;
  credentials.summary.datasets = allDatasets.length;
  credentials.summary.lastUpdated = new Date().toISOString();
  await fs.writeFile(credentialsPath, JSON.stringify(credentials, null, 2));

  const totalRecords = allDatasets.reduce((sum, d) => sum + (d.recordCount || 0), 0);
  const datasetsWithData = allDatasets.filter(d => d.recordCount > 0).length;

  console.log('='.repeat(60));
  console.log('📊 Final Summary');
  console.log('='.repeat(60));
  console.log(`✅ Total Datasets: ${allDatasets.length}`);
  console.log(`📈 Datasets with Data: ${datasetsWithData}`);
  console.log(`📊 Total Records: ${totalRecords.toLocaleString()}`);
  console.log('='.repeat(60));
}

async function main() {
  console.log('🚀 Cleanup and Populate Real Data\n');
  console.log(`📍 API URL: ${API_URL}\n`);

  try {
    await deletePlaceholderDatasets();
    await populateFHIRDataForHospitals();
    await createRealDatasets();
    
    console.log('\n✅ All done! System now has only real data.\n');
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();

