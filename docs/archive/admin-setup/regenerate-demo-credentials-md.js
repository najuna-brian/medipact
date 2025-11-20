/**
 * Regenerate DEMO_CREDENTIALS.md from demo-credentials.json
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the generateCredentialsMarkdown function from populate-demo-data.js
const populateScriptPath = path.join(__dirname, 'populate-demo-data.js');
const populateScript = await import(`file://${populateScriptPath}`);

// Load credentials
const credentialsPath = path.join(__dirname, '..', 'demo-credentials.json');
const credentials = JSON.parse(await fs.readFile(credentialsPath, 'utf-8'));

// Generate markdown using the same function
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

---

`;
  });

  if (credentials.patients.length > 10) {
    md += `> **Note**: Showing first 10 patients. Total patients: ${credentials.patients.length}  
> See \`backend/demo-credentials.json\` for complete list.

`;
  }

  md += `## 📊 Datasets Available

`;

  if (credentials.datasets && credentials.datasets.length > 0) {
    credentials.datasets.forEach((dataset, index) => {
      md += `### Dataset ${index + 1}: ${dataset.name}

- **Dataset ID**: \`${dataset.datasetId}\`
- **Name**: ${dataset.name}
- **Description**: ${dataset.description || 'Comprehensive healthcare data for research purposes'}
- **Hospital**: ${dataset.hospitalName} (\`${dataset.hospitalId}\`)
- **Country**: ${dataset.country}
- **Record Count**: ~${dataset.recordCount} patients
- **Price**: ${dataset.price} HBAR (~$${dataset.priceUSD?.toFixed(2) || 'N/A'} USD)
- **Status**: ✅ Active and ready for purchase

**How to Purchase:**
1. Login as Researcher
2. Browse to dataset catalog
3. Select this dataset: \`${dataset.datasetId}\`
4. Complete purchase flow

---

`;
    });
  } else {
    md += `> **Note**: No datasets created yet. Run \`npm run populate-demo\` to create datasets.

`;
  }

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

**Generated**: ${credentials.generatedAt}  
**Status**: Ready for MVP Demo ✅
`;

  return md;
}

// Generate and write markdown
const markdownContent = generateCredentialsMarkdown(credentials);
const outputPath = path.join(__dirname, '..', '..', 'DEMO_CREDENTIALS.md');
await fs.writeFile(outputPath, markdownContent, 'utf-8');

console.log('✅ Regenerated DEMO_CREDENTIALS.md');
console.log(`   Location: ${outputPath}`);
console.log(`   Summary: ${credentials.summary.hospitals} hospitals, ${credentials.summary.researchers} researchers, ${credentials.summary.patients} patients, ${credentials.summary.datasets} datasets`);

