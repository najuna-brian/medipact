/**
 * Demo Data Population Script
 * 
 * Populates the MediPact database with comprehensive demo data for MVP presentation.
 * Works via API calls, so it works both locally and on hosted environments.
 * 
 * Usage:
 *   node scripts/populate-demo-data.js
 * 
 * Environment Variables:
 *   API_URL - Backend API URL (default: http://localhost:8080)
 *   PATIENTS_PER_HOSPITAL - Number of patients per hospital (default: 200)
 *   NUM_HOSPITALS - Number of hospitals to create (default: 3)
 *   NUM_RESEARCHERS - Number of researchers to create (default: 2)
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:8080';
const PATIENTS_PER_HOSPITAL = parseInt(process.env.PATIENTS_PER_HOSPITAL || '200');
const NUM_HOSPITALS = parseInt(process.env.NUM_HOSPITALS || '3');
const NUM_RESEARCHERS = parseInt(process.env.NUM_RESEARCHERS || '2');

// Storage for credentials
const credentials = {
  hospitals: [],
  researchers: [],
  patients: [],
  datasets: [],
  generatedAt: new Date().toISOString(),
  apiUrl: API_URL,
  summary: {}
};

// Medical conditions for realistic data
const CONDITIONS = [
  { code: 'E11', name: 'Type 2 Diabetes', severity: ['mild', 'moderate', 'severe'] },
  { code: 'I10', name: 'Essential Hypertension', severity: ['mild', 'moderate'] },
  { code: 'J44', name: 'Chronic Obstructive Pulmonary Disease', severity: ['mild', 'moderate', 'severe'] },
  { code: 'E78', name: 'Disorders of Lipoprotein Metabolism', severity: ['mild', 'moderate'] },
  { code: 'M79', name: 'Other Soft Tissue Disorders', severity: ['mild', 'moderate'] },
  { code: 'K21', name: 'Gastroesophageal Reflux Disease', severity: ['mild', 'moderate'] },
  { code: 'F32', name: 'Major Depressive Disorder', severity: ['mild', 'moderate', 'severe'] },
  { code: 'G93', name: 'Other Disorders of Brain', severity: ['mild', 'moderate'] },
];

// Observation types
const OBSERVATIONS = [
  { code: '4548-4', name: 'HbA1c', unit: '%', normalRange: '4.0-5.6%', generateValue: () => (4.5 + Math.random() * 4).toFixed(1) },
  { code: '2339-0', name: 'Blood Glucose', unit: 'mg/dL', normalRange: '70-100 mg/dL', generateValue: () => Math.round(70 + Math.random() * 100) },
  { code: '2093-3', name: 'Total Cholesterol', unit: 'mg/dL', normalRange: '<200 mg/dL', generateValue: () => Math.round(150 + Math.random() * 100) },
  { code: '2085-9', name: 'HDL Cholesterol', unit: 'mg/dL', normalRange: '>40 mg/dL', generateValue: () => Math.round(30 + Math.random() * 50) },
  { code: '2571-8', name: 'Triglycerides', unit: 'mg/dL', normalRange: '<150 mg/dL', generateValue: () => Math.round(80 + Math.random() * 200) },
  { code: '718-7', name: 'Hemoglobin', unit: 'g/dL', normalRange: '12-16 g/dL', generateValue: () => (10 + Math.random() * 6).toFixed(1) },
  { code: '777-3', name: 'Platelet Count', unit: '/μL', normalRange: '150,000-450,000 /μL', generateValue: () => Math.round(150000 + Math.random() * 300000) },
];

// Countries and regions
const COUNTRIES = ['Uganda', 'Kenya', 'Tanzania', 'Rwanda'];
const REGIONS = {
  'Uganda': ['Kampala', 'Entebbe', 'Jinja', 'Mbale', 'Gulu'],
  'Kenya': ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
  'Tanzania': ['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Zanzibar'],
  'Rwanda': ['Kigali', 'Butare', 'Gisenyi', 'Ruhengeri', 'Byumba']
};

// Helper functions
function randomChoice(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

function generateAgeRange(age) {
  const rangeStart = Math.floor(age / 5) * 5;
  return `${rangeStart}-${rangeStart + 4}`;
}

function generateUPI(index) {
  return `UPI-DEMO${String(index).padStart(6, '0')}`;
}

function generatePatientId(hospitalIndex, patientIndex) {
  return `PID-H${hospitalIndex}-P${String(patientIndex).padStart(4, '0')}`;
}

// API call helper with retry logic for rate limiting
async function apiCall(method, endpoint, data = null, headers = {}, retries = 3) {
  const url = `${API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Demo-Population': 'demo-populate-allow', // Bypass rate limiting for demo population
      ...headers
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, options);
      const result = await response.json();
      
      if (!response.ok) {
        // Check if it's a rate limit error
        if (response.status === 429 || (result.error && result.error.includes('Too many requests'))) {
          if (attempt < retries) {
            const waitTime = Math.min(1000 * Math.pow(2, attempt), 30000); // Exponential backoff, max 30s
            console.warn(`  Rate limited, waiting ${waitTime/1000}s before retry ${attempt + 1}/${retries}...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
        }
        throw new Error(result.error || `HTTP ${response.status}: ${response.statusText}`);
      }
      
      return result;
    } catch (error) {
      if (attempt === retries) {
        console.error(`API Error (${method} ${endpoint}):`, error.message);
        throw error;
      }
      // Wait before retry
      const waitTime = 1000 * attempt;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Create hospital
async function createHospital(index) {
  const country = randomChoice(COUNTRIES);
  const location = randomChoice(REGIONS[country]);
  const hospitalNames = [
    `${location} General Hospital`,
    `${location} Medical Center`,
    `${location} Regional Hospital`,
    `St. ${location} Hospital`,
    `${location} Community Health Center`
  ];
  
  const name = hospitalNames[index % hospitalNames.length] || `${location} Hospital ${index + 1}`;
  // Use timestamp to ensure unique emails
  const timestamp = Date.now();
  const email = `hospital${index + 1}-${timestamp}@demo.medipact.com`;

  console.log(`  Creating hospital ${index + 1}/${NUM_HOSPITALS}: ${name}...`);

  const result = await apiCall('POST', '/api/hospital/register', {
    name,
    country,
    location: `${location}, ${country}`,
    contactEmail: email,
    paymentMethod: 'bank',
    bankName: 'Demo Bank',
    bankAccountNumber: `DEMO${String(index + 1).padStart(6, '0')}`,
    withdrawalThresholdUSD: 100.00,
    autoWithdrawEnabled: true
  });

  const hospital = result.hospital;
  
  // Verify hospital via admin API
  console.log(`  Verifying hospital ${hospital.hospitalId}...`);
  try {
    await apiCall('POST', `/api/admin/hospitals/${hospital.hospitalId}/verify`, {
      notes: 'Auto-verified for demo data'
    });
  } catch (error) {
    console.warn(`  Warning: Could not verify hospital (may need manual verification): ${error.message}`);
  }

  credentials.hospitals.push({
    hospitalId: hospital.hospitalId,
    name: hospital.name,
    country: hospital.country,
    location: hospital.location,
    email: email,
    apiKey: hospital.apiKey,
    hederaAccountId: hospital.hederaAccountId,
    loginInfo: {
      hospitalId: hospital.hospitalId,
      apiKey: hospital.apiKey,
      note: 'Use Hospital ID and API Key to login'
    }
  });

  return hospital;
}

// Create researcher
async function createResearcher(index) {
  const organizations = [
    'Global Health Research Institute',
    'Medical Data Analytics Lab',
    'Public Health Research Center',
    'Clinical Trials Network',
    'Epidemiology Research Group'
  ];
  
  const names = [
    'Dr. Sarah Johnson',
    'Dr. Michael Chen',
    'Dr. Emily Rodriguez',
    'Dr. David Kim',
    'Dr. Lisa Anderson'
  ];

  const organizationName = organizations[index % organizations.length] || `Research Org ${index + 1}`;
  const contactName = names[index % names.length] || `Researcher ${index + 1}`;
  // Use timestamp to ensure unique emails
  const timestamp = Date.now();
  const email = `researcher${index + 1}-${timestamp}@demo.medipact.com`;
  const country = randomChoice(COUNTRIES);

  console.log(`  Creating researcher ${index + 1}/${NUM_RESEARCHERS}: ${contactName}...`);

  let result;
  try {
    result = await apiCall('POST', '/api/researcher/register', {
      email,
      organizationName,
      contactName,
      country
    });
  } catch (error) {
    // If researcher already exists, try to get existing one
    if (error.message && error.message.includes('already registered')) {
      console.log(`    Researcher already exists, skipping...`);
      // Try to get by email (this might not work, so we'll continue with new email)
      return null; // Skip this researcher
    }
    throw error;
  }

  const researcher = result.researcher;

  // Verify researcher via admin API
  console.log(`  Verifying researcher ${researcher.researcherId}...`);
  try {
    await apiCall('POST', `/api/admin/researchers/${researcher.researcherId}/verify`, {
      notes: 'Auto-verified for demo data'
    });
  } catch (error) {
    console.warn(`  Warning: Could not verify researcher (may need manual verification): ${error.message}`);
  }

  credentials.researchers.push({
    researcherId: researcher.researcherId,
    email: researcher.email,
    organizationName: researcher.organizationName,
    contactName: researcher.contactName,
    country: researcher.country,
    hederaAccountId: researcher.hederaAccountId,
    loginInfo: {
      researcherId: researcher.researcherId,
      email: researcher.email,
      note: 'Use Researcher ID to login (no password needed for MVP)'
    }
  });

  return researcher;
}

// Create patient
async function createPatient(hospitalId, hospitalIndex, patientIndex) {
  const age = randomInt(18, 80);
  const gender = randomChoice(['Male', 'Female', 'Other']);
  const country = credentials.hospitals[hospitalIndex].country;
  const region = randomChoice(REGIONS[country] || ['Unknown']);
  const ageRange = generateAgeRange(age);
  
  const firstName = randomChoice(['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Maria']);
  const lastName = randomChoice(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis']);
  const name = `${firstName} ${lastName}`;
  const dateOfBirth = new Date(new Date().setFullYear(new Date().getFullYear() - age));
  const phone = `+256${randomInt(700000000, 799999999)}`;
  // Use timestamp to ensure unique emails
  const timestamp = Date.now();
  const email = `patient${hospitalIndex + 1}-${patientIndex + 1}-${timestamp}@demo.medipact.com`;
  const nationalId = `DEMO${String(hospitalIndex + 1).padStart(2, '0')}${String(patientIndex + 1).padStart(6, '0')}-${timestamp}`;

  try {
    const result = await apiCall('POST', '/api/patient/register', {
      name,
      dateOfBirth: formatDate(dateOfBirth),
      gender: gender.toLowerCase(),
      phone,
      email,
      nationalId,
      paymentMethod: 'mobile_money',
      mobileMoneyProvider: 'mtn',
      mobileMoneyNumber: phone,
      withdrawalThresholdUSD: 10.00,
      autoWithdrawEnabled: true
    });

    const upi = result.upi;
    const patientId = generatePatientId(hospitalIndex, patientIndex);

    credentials.patients.push({
      upi: upi,
      patientId: patientId,
      name: name,
      email: email,
      phone: phone,
      nationalId: nationalId,
      age: age,
      ageRange: ageRange,
      gender: gender,
      country: country,
      region: region,
      hospitalId: hospitalId,
      hederaAccountId: result.hederaAccountId,
      loginInfo: {
        upi: upi,
        email: email,
        phone: phone,
        note: 'Use UPI, email, or phone to access patient portal'
      }
    });

    return { upi, patientId, age, ageRange, gender, country, region };
  } catch (error) {
    console.warn(`  Warning: Failed to create patient ${patientIndex + 1}: ${error.message}`);
    // Return a fallback patient object
    const upi = generateUPI(hospitalIndex * PATIENTS_PER_HOSPITAL + patientIndex);
    const patientId = generatePatientId(hospitalIndex, patientIndex);
    return { upi, patientId, age, ageRange, gender, country, region };
  }
}

// Generate FHIR data for a patient
function generatePatientFHIRData(patient, hospitalId, hospitalIndex, patientIndex) {
  const patientId = generatePatientId(hospitalIndex, patientIndex);
  
  // Generate 1-3 conditions per patient
  const numConditions = randomInt(1, 3);
  const conditions = [];
  for (let i = 0; i < numConditions; i++) {
    const condition = randomChoice(CONDITIONS);
    const diagnosisDate = randomDate(new Date(2023, 0, 1), new Date());
    conditions.push({
      code: condition.code,
      name: condition.name,
      date: formatDate(diagnosisDate),
      severity: randomChoice(condition.severity),
      status: randomChoice(['active', 'resolved', 'remission'])
    });
  }

  // Generate 2-5 observations per patient
  const numObservations = randomInt(2, 5);
  const observations = [];
  for (let i = 0; i < numObservations; i++) {
    const obs = randomChoice(OBSERVATIONS);
    const obsDate = randomDate(new Date(2023, 0, 1), new Date());
    const value = obs.generateValue();
    const interpretation = parseFloat(value) > parseFloat(obs.normalRange.split('-')[0]) ? 'High' : 
                          parseFloat(value) < parseFloat(obs.normalRange.split('-')[1]) ? 'Low' : 'Normal';
    
    observations.push({
      code: obs.code,
      name: obs.name,
      value: value,
      unit: obs.unit,
      date: formatDate(obsDate),
      referenceRange: obs.normalRange,
      interpretation: interpretation
    });
  }

  return {
    anonymousPatientId: patientId,
    upi: patient.upi,
    country: patient.country,
    region: patient.region,
    ageRange: patient.ageRange,
    gender: patient.gender,
    conditions: conditions,
    observations: observations,
    consentType: 'hospital_verified'
  };
}

// Submit FHIR data for a hospital
async function submitFHIRData(hospital, hospitalIndex, patients) {
  console.log(`  Submitting FHIR data for ${patients.length} patients...`);

  const fhirPatients = patients.map(patient => 
    generatePatientFHIRData(patient, hospital.hospitalId, hospitalIndex, patients.indexOf(patient))
  );

  // Submit in smaller batches to avoid rate limiting (100 requests per 15 min = ~9 sec per request)
  const batchSize = 10; // Smaller batches to stay under rate limit
  let totalSubmitted = 0;

  for (let i = 0; i < fhirPatients.length; i += batchSize) {
    const batch = fhirPatients.slice(i, i + batchSize);
    
    try {
      const result = await apiCall('POST', '/api/adapter/submit-fhir-resources', {
        hospitalId: hospital.hospitalId,
        patients: batch,
        consentType: 'hospital_verified'
      }, {
        'X-Hospital-ID': hospital.hospitalId,
        'X-API-Key': hospital.apiKey
      });

      totalSubmitted += result.results.patientsCreated;
      console.log(`    Submitted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(fhirPatients.length / batchSize)}: ${result.results.patientsCreated} patients, ${result.results.conditionsCreated} conditions, ${result.results.observationsCreated} observations`);
      
      // Delay between batches to avoid rate limiting (wait 10 seconds between batches)
      if (i + batchSize < fhirPatients.length) {
        await new Promise(resolve => setTimeout(resolve, 10000));
      }
    } catch (error) {
      console.warn(`    Warning: Failed to submit batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
      // Wait before trying next batch
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  return totalSubmitted;
}

// Create dataset
async function createDataset(hospital, hospitalIndex) {
  const datasetNames = [
    'Diabetes Research Dataset',
    'Hypertension Study Data',
    'Chronic Disease Registry',
    'Cardiovascular Health Data',
    'Metabolic Syndrome Dataset'
  ];

  const name = datasetNames[hospitalIndex % datasetNames.length] || `Dataset ${hospitalIndex + 1}`;
  const description = `Comprehensive ${hospital.country} healthcare data for research purposes. Includes patient demographics, conditions, and laboratory observations.`;
  
  // Estimate record count (will be updated by backend)
  const estimatedRecords = PATIENTS_PER_HOSPITAL;

  console.log(`  Creating dataset: ${name}...`);

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
      hcsTopicId: `0.0.${randomInt(1000000, 9999999)}`,
      consentTopicId: `0.0.${randomInt(1000000, 9999999)}`,
      dataTopicId: `0.0.${randomInt(1000000, 9999999)}`
    }, {
      'X-Hospital-ID': hospital.hospitalId,
      'X-API-Key': hospital.apiKey
    });

    const dataset = result.dataset;
    credentials.datasets.push({
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

    return dataset;
  } catch (error) {
    console.warn(`  Warning: Failed to create dataset: ${error.message}`);
    return null;
  }
}

// Generate markdown content for credentials
function generateCredentialsMarkdown(credentials) {
  let md = `# Demo Credentials for MediPact MVP

> **Note**: This file is auto-generated after running \`npm run populate-demo\`.  
> **Security**: Keep these credentials private. Do not commit real credentials to git.

## 🚀 Quick Start

These credentials were generated on: **${credentials.generatedAt}**  
API URL: **${credentials.apiUrl}**

---

## 📊 Summary

- **Hospitals**: ${credentials.summary.hospitals}
- **Researchers**: ${credentials.summary.researchers}
- **Patients**: ${credentials.summary.patients}
- **Datasets**: ${credentials.summary.datasets}
- **FHIR Records**: ${credentials.summary.fhirPatientsSubmitted}

---

## 🏥 Hospital Credentials

`;

  // Add hospitals
  credentials.hospitals.forEach((hospital, index) => {
    md += `### Hospital ${index + 1}: ${hospital.name}

**Login Information:**
- **Hospital ID**: \`${hospital.hospitalId}\`
- **API Key**: \`${hospital.apiKey}\`
- **Email**: \`${hospital.email}\`
- **Country**: ${hospital.country}
- **Location**: ${hospital.location}

**Hedera Account:**
- **Account ID**: \`${hospital.hederaAccountId || 'N/A'}\`

**How to Login:**
1. Go to \`/hospital/login\`
2. Enter Hospital ID: \`${hospital.hospitalId}\`
3. Enter API Key: \`${hospital.apiKey}\`

**API Usage:**
\`\`\`bash
curl -H "X-Hospital-ID: ${hospital.hospitalId}" \\
     -H "X-API-Key: ${hospital.apiKey}" \\
     ${credentials.apiUrl}/api/hospital/${hospital.hospitalId}
\`\`\`

---

`;
  });

  md += `## 🔬 Researcher Credentials

`;

  // Add researchers
  credentials.researchers.forEach((researcher, index) => {
    md += `### Researcher ${index + 1}: ${researcher.organizationName}

**Login Information:**
- **Researcher ID**: \`${researcher.researcherId}\`
- **Email**: \`${researcher.email}\`
- **Organization**: ${researcher.organizationName}
- **Contact Name**: ${researcher.contactName}
- **Country**: ${researcher.country}
- **Status**: ✅ Verified

**Hedera Account:**
- **Account ID**: \`${researcher.hederaAccountId || 'N/A'}\`

**How to Login:**
1. Go to \`/researcher/login\`
2. Enter Researcher ID: \`${researcher.researcherId}\`
3. (No password needed for MVP)

**API Usage:**
\`\`\`bash
curl -H "X-Researcher-ID: ${researcher.researcherId}" \\
     ${credentials.apiUrl}/api/researcher/${researcher.researcherId}
\`\`\`

---

`;
  });

  md += `## 👤 Patient Credentials (Sample - First 10)

`;

  // Add first 10 patients as samples
  credentials.patients.slice(0, 10).forEach((patient, index) => {
    md += `### Patient ${index + 1}: ${patient.name}

**Access Information:**
- **UPI**: \`${patient.upi}\`
- **Email**: \`${patient.email}\`
- **Phone**: \`${patient.phone}\`
- **National ID**: \`${patient.nationalId}\`
- **Age**: ${patient.age} (Range: ${patient.ageRange})
- **Gender**: ${patient.gender}
- **Country**: ${patient.country}
- **Region**: ${patient.region}
- **Hospital**: ${patient.hospitalId}

**Hedera Account:**
- **Account ID**: \`${patient.hederaAccountId || 'N/A'}\`

**How to Access:**
1. Go to \`/patient/login\`
2. Enter UPI: \`${patient.upi}\`
   OR Email: \`${patient.email}\`
   OR Phone: \`${patient.phone}\`

**API Usage:**
\`\`\`bash
curl ${credentials.apiUrl}/api/patient/${patient.upi}/summary
\`\`\`

---

`;
  });

  if (credentials.patients.length > 10) {
    md += `\n> **Note**: Showing first 10 patients. Total patients: ${credentials.patients.length}\n`;
    md += `> See \`backend/demo-credentials.json\` for complete list.\n\n`;
  }

  md += `## 📊 Datasets Available

`;

  // Add datasets
  credentials.datasets.forEach((dataset, index) => {
    md += `### Dataset ${index + 1}: ${dataset.name}

- **Dataset ID**: \`${dataset.datasetId}\`
- **Name**: ${dataset.name}
- **Hospital**: ${dataset.hospitalName} (\`${dataset.hospitalId}\`)
- **Country**: ${dataset.country}
- **Record Count**: ~${dataset.recordCount} patients
- **Price**: ${dataset.price} HBAR (~$${dataset.priceUSD?.toFixed(2) || 'N/A'} USD)
- **Status**: ✅ Active and ready for purchase

---

`;
  });

  md += `## 🎯 Recommended Demo Flow

### 1. As Researcher (Recommended Starting Point)

**Login:**
- Use Researcher 1: \`${credentials.researchers[0]?.researcherId || 'RES-DEMO001'}\`
- Email: \`${credentials.researchers[0]?.email || 'researcher1@demo.medipact.com'}\`

**Demo Steps:**
1. Browse datasets at \`/researcher/catalog\`
2. View dataset details
3. Query data at \`/researcher/query\`
4. Purchase a dataset
5. View purchase history

---

### 2. As Hospital

**Login:**
- Use Hospital 1: \`${credentials.hospitals[0]?.hospitalId || 'HOSP-DEMO001'}\`
- API Key: \`${credentials.hospitals[0]?.apiKey || 'see-demo-credentials.json'}\`

**Demo Steps:**
1. View dashboard at \`/hospital/dashboard\`
2. Check revenue at \`/hospital/revenue\`
3. View processing history
4. Check wallet balance

---

### 3. As Patient

**Access:**
- Use Patient 1: \`${credentials.patients[0]?.upi || 'UPI-DEMO000001'}\`
- Email: \`${credentials.patients[0]?.email || 'patient1-1@demo.medipact.com'}\`

**Demo Steps:**
1. View wallet at \`/patient/wallet\`
2. Check earnings at \`/patient/earnings\`
3. View data sharing settings
4. See connected hospitals

---

## 📝 Notes

### Security Reminders

- ⚠️ These are demo credentials for MVP presentation only
- ⚠️ Do not use in production
- ⚠️ Keep credentials private
- ⚠️ Rotate credentials between demos
- ⚠️ Monitor for unauthorized access

### Complete Credentials

For the complete list of all patients and detailed information, see:
- \`backend/demo-credentials.json\` (JSON format)

---

## 🔄 Regenerating Credentials

To generate fresh credentials:

\`\`\`bash
cd backend
npm run populate-demo
\`\`\`

This will update both:
- \`backend/demo-credentials.json\` (JSON format)
- \`DEMO_CREDENTIALS.md\` (This file)

---

**Generated**: ${credentials.generatedAt}  
**Status**: Ready for MVP Demo ✅
`;

  return md;
}

// Check backend connectivity
async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_URL}/health`);
    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }
    const data = await response.json();
    console.log('✅ Backend is running and healthy');
    return true;
  } catch (error) {
    console.error('❌ Backend is not accessible!');
    console.error(`   URL: ${API_URL}`);
    console.error(`   Error: ${error.message}`);
    console.error('');
    console.error('Please make sure the backend server is running:');
    console.error('   cd backend && npm start');
    throw new Error('Backend not accessible');
  }
}

// Main execution
async function main() {
  console.log('🚀 Starting Demo Data Population');
  console.log('================================');
  console.log(`API URL: ${API_URL}`);
  console.log(`Hospitals: ${NUM_HOSPITALS}`);
  console.log(`Researchers: ${NUM_RESEARCHERS}`);
  console.log(`Patients per hospital: ${PATIENTS_PER_HOSPITAL}`);
  console.log('');

  // Check backend health
  await checkBackendHealth();
  console.log('');

  const startTime = Date.now();

  try {
    // Step 1: Create hospitals
    console.log('📋 Step 1: Creating hospitals...');
    const hospitals = [];
    for (let i = 0; i < NUM_HOSPITALS; i++) {
      const hospital = await createHospital(i);
      hospitals.push(hospital);
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log(`✅ Created ${hospitals.length} hospitals\n`);

    // Step 2: Create researchers
    console.log('📋 Step 2: Creating researchers...');
    const researchers = [];
    for (let i = 0; i < NUM_RESEARCHERS; i++) {
      const researcher = await createResearcher(i);
      if (researcher) {
        researchers.push(researcher);
      }
      // Delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log(`✅ Created ${researchers.length} researchers\n`);

    // Step 3: Create patients and submit FHIR data
    console.log('📋 Step 3: Creating patients and FHIR data...');
    let totalPatients = 0;
    let totalFHIRSubmitted = 0;

    for (let h = 0; h < hospitals.length; h++) {
      const hospital = hospitals[h];
      console.log(`\n  Hospital ${h + 1}/${hospitals.length}: ${hospital.name}`);
      
      // Create patients
      const patients = [];
      for (let p = 0; p < PATIENTS_PER_HOSPITAL; p++) {
        const patient = await createPatient(hospital.hospitalId, h, p);
        patients.push(patient);
        totalPatients++;
        
        if ((p + 1) % 50 === 0) {
          console.log(`    Created ${p + 1}/${PATIENTS_PER_HOSPITAL} patients...`);
        }
        
        // Delay to avoid rate limiting (100 requests per 15 minutes = ~9 seconds per request)
        // Add longer delay every 10 patients to stay under limit
        if ((p + 1) % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay between patients
        }
      }
      console.log(`    ✅ Created ${patients.length} patients`);

      // Submit FHIR data
      const submitted = await submitFHIRData(hospital, h, patients);
      totalFHIRSubmitted += submitted;
      await new Promise(resolve => setTimeout(resolve, 5000)); // Longer delay after FHIR submission

      // Create dataset
      await createDataset(hospital, h);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n✅ Created ${totalPatients} patients`);
    console.log(`✅ Submitted FHIR data for ${totalFHIRSubmitted} patients\n`);

    // Step 4: Save credentials
    console.log('📋 Step 4: Saving credentials...');
    credentials.summary = {
      hospitals: hospitals.length,
      researchers: researchers.length,
      patients: totalPatients,
      datasets: credentials.datasets.length,
      fhirPatientsSubmitted: totalFHIRSubmitted
    };

    // Save credentials to JSON file
    const credentialsPath = path.join(__dirname, '..', 'demo-credentials.json');
    await fs.writeFile(credentialsPath, JSON.stringify(credentials, null, 2));
    console.log(`✅ Credentials saved to: ${credentialsPath}\n`);

    // Also update the DEMO_CREDENTIALS.md file in root
    try {
      const rootCredentialsPath = path.join(__dirname, '..', '..', 'DEMO_CREDENTIALS.md');
      const markdownContent = generateCredentialsMarkdown(credentials);
      await fs.writeFile(rootCredentialsPath, markdownContent);
      console.log(`✅ Demo credentials markdown updated: ${rootCredentialsPath}\n`);
    } catch (error) {
      console.warn(`  Warning: Could not update DEMO_CREDENTIALS.md: ${error.message}`);
    }

    // Step 5: Print summary
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('🎉 Demo Data Population Complete!');
    console.log('================================');
    console.log(`Duration: ${duration}s`);
    console.log(`Hospitals: ${hospitals.length}`);
    console.log(`Researchers: ${researchers.length}`);
    console.log(`Patients: ${totalPatients}`);
    console.log(`Datasets: ${credentials.datasets.length}`);
    console.log(`FHIR Records Submitted: ${totalFHIRSubmitted}`);
    console.log('');
    console.log('📝 Login Credentials saved to:');
    console.log('   - backend/demo-credentials.json (JSON format)');
    console.log('   - DEMO_CREDENTIALS.md (Markdown format in root)');
    console.log('');
    console.log('Quick Access:');
    console.log('=============');
    
    if (credentials.hospitals.length > 0) {
      const h = credentials.hospitals[0];
      console.log(`Hospital: ${h.name}`);
      console.log(`  ID: ${h.hospitalId}`);
      console.log(`  API Key: ${h.apiKey}`);
    }
    
    if (credentials.researchers.length > 0) {
      const r = credentials.researchers[0];
      console.log(`Researcher: ${r.contactName}`);
      console.log(`  ID: ${r.researcherId}`);
      console.log(`  Email: ${r.email}`);
    }
    
    if (credentials.patients.length > 0) {
      const p = credentials.patients[0];
      console.log(`Patient: ${p.name}`);
      console.log(`  UPI: ${p.upi}`);
      console.log(`  Email: ${p.email}`);
    }

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the script
main().catch(console.error);

