/**
 * Generate Real Metrics Script
 * 
 * This script generates real metrics by:
 * 1. Making queries (generates HCS messages)
 * 2. Making purchases (generates contract calls & HBAR distribution)
 * 
 * Usage:
 *   node scripts/generate-metrics.js                    # Local
 *   API_URL=https://your-api.com node scripts/generate-metrics.js  # Production
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get API URL from environment or default to localhost
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';

// Remove trailing slash
const baseUrl = API_URL.replace(/\/$/, '');

console.log(`🚀 Generating metrics for: ${baseUrl}\n`);

// Load demo credentials
const credentialsPath = path.join(__dirname, '../demo-credentials.json');
let credentials;
try {
  const credentialsData = fs.readFileSync(credentialsPath, 'utf8');
  credentials = JSON.parse(credentialsData);
} catch (error) {
  console.error('❌ Error loading demo credentials:', error.message);
  console.error('   Make sure to run: npm run populate-demo');
  process.exit(1);
}

// Get first verified researcher (or first researcher if none verified)
let researcher = credentials.researchers?.[0];
if (!researcher) {
  console.error('❌ No researchers found in demo credentials');
  process.exit(1);
}

const researcherId = researcher.researcherId;
console.log(`📋 Using researcher: ${researcherId}\n`);

// Helper function to make API request
async function apiRequest(endpoint, method = 'GET', body = null) {
  const url = `${baseUrl}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (error) {
    return { ok: false, error: error.message };
  }
}

// Step 1: Verify researcher (if not already verified)
async function verifyResearcher() {
  console.log('🔍 Checking researcher verification status...');
  
  const result = await apiRequest(`/api/researcher/${researcherId}/status`);
  
  if (result.ok && result.data.verificationStatus === 'verified') {
    console.log('✅ Researcher is already verified\n');
    return true;
  }
  
  console.log('⚠️  Researcher not verified. Attempting to verify...');
  
  // Try to verify via admin API (if available)
  const verifyResult = await apiRequest(
    `/api/admin/researchers/${researcherId}/verify`,
    'POST',
    { status: 'verified' }
  );
  
  if (verifyResult.ok) {
    console.log('✅ Researcher verified\n');
    return true;
  }
  
  console.log('⚠️  Could not auto-verify. Please verify manually in admin panel.\n');
  return false;
}

// Step 2: Make queries (generates HCS messages)
async function makeQueries(count = 15) {
  console.log(`📊 Making ${count} queries to generate HCS messages...\n`);
  
  const queryFilters = [
    { conditionName: 'Type 2 Diabetes', country: 'Uganda', limit: 100 },
    { conditionName: 'Hypertension', country: 'Kenya', limit: 150 },
    { conditionName: 'Malaria', country: 'Tanzania', limit: 200 },
    { conditionName: 'Pneumonia', country: 'Uganda', limit: 100 },
    { conditionName: 'Tuberculosis', country: 'Rwanda', limit: 150 },
    { conditionName: 'HIV', country: 'Kenya', limit: 100 },
    { conditionName: 'Asthma', country: 'Uganda', limit: 120 },
    { conditionName: 'Anemia', country: 'Tanzania', limit: 180 },
    { conditionName: 'Diabetes', country: 'Kenya', limit: 200 },
    { conditionName: 'Heart Disease', country: 'Uganda', limit: 100 },
  ];
  
  let successCount = 0;
  let errorCount = 0;
  
  for (let i = 0; i < count; i++) {
    const filter = queryFilters[i % queryFilters.length];
    
    const result = await apiRequest('/api/marketplace/query', 'POST', {
      researcherId,
      ...filter,
      preview: true,
    });
    
    if (result.ok) {
      successCount++;
      process.stdout.write(`✅ Query ${i + 1}/${count} - Found ${result.data.recordCount || 0} records\r`);
    } else {
      errorCount++;
      console.log(`\n❌ Query ${i + 1} failed: ${result.error || result.data?.error || 'Unknown error'}`);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n\n✅ Completed ${successCount} queries, ${errorCount} errors\n`);
  return successCount;
}

// Step 3: Make purchases (generates contract calls & HBAR)
async function makePurchases(count = 5) {
  console.log(`💰 Making ${count} purchases to generate contract calls & HBAR distribution...\n`);
  
  // First, get available datasets or make a query to purchase
  const datasetsResult = await apiRequest('/api/marketplace/datasets');
  const datasets = datasetsResult.ok ? datasetsResult.data?.datasets || [] : [];
  
  const purchaseAmounts = [50, 100, 150, 200, 250]; // HBAR amounts
  
  let successCount = 0;
  let errorCount = 0;
  let totalHBAR = 0;
  
  for (let i = 0; i < count; i++) {
    const amount = purchaseAmounts[i % purchaseAmounts.length];
    
    // Use a test transaction ID for testnet
    const transactionId = `0.0.${Math.floor(Math.random() * 1000000)}@${Date.now()}.${Math.floor(Math.random() * 1000000)}`;
    
    const purchaseData = {
      researcherId,
      amount,
      transactionId,
      queryFilters: {
        conditionName: 'Type 2 Diabetes',
        country: 'Uganda',
        limit: 100,
      },
    };
    
    // If we have a dataset, use it
    if (datasets.length > 0 && i < datasets.length) {
      purchaseData.datasetId = datasets[i].id;
      delete purchaseData.queryFilters;
    }
    
    const result = await apiRequest('/api/marketplace/purchase', 'POST', purchaseData);
    
    if (result.ok && result.data.success !== false) {
      successCount++;
      totalHBAR += amount;
      process.stdout.write(`✅ Purchase ${i + 1}/${count} - ${amount} HBAR distributed\r`);
    } else {
      errorCount++;
      const errorMsg = result.data?.error || result.error || 'Unknown error';
      console.log(`\n❌ Purchase ${i + 1} failed: ${errorMsg}`);
      
      // If verification required, try to verify first
      if (errorMsg.includes('verification') || errorMsg.includes('verified')) {
        console.log('   ⚠️  Researcher needs to be verified. Run verify step first.');
      }
    }
    
    // Delay between purchases
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log(`\n\n✅ Completed ${successCount} purchases, ${errorCount} errors`);
  console.log(`💰 Total HBAR distributed: ${totalHBAR} HBAR\n`);
  
  return { successCount, totalHBAR };
}

// Step 4: Check final metrics
async function checkMetrics() {
  console.log('📈 Checking final metrics...\n');
  
  const result = await apiRequest('/api/public/metrics');
  
  if (result.ok && result.data.metrics) {
    const m = result.data.metrics;
    console.log('📊 Current Metrics:');
    console.log(`   Hedera Accounts: ${m.totalHederaAccounts}`);
    console.log(`   Active Accounts: ${m.monthlyActiveHederaAccounts}`);
    console.log(`   HCS Messages: ${m.totalHCSMessages}`);
    console.log(`   Contract Calls: ${m.totalSmartContractCalls}`);
    console.log(`   HBAR Distributed: ${m.totalHBARDistributed.toFixed(2)}`);
    console.log(`   TPS Contribution: ${m.estimatedTPSContribution.toFixed(6)}\n`);
    
    return m;
  } else {
    console.error('❌ Failed to fetch metrics:', result.error || result.data?.error);
    return null;
  }
}

// Main execution
async function main() {
  try {
    // Step 1: Verify researcher
    await verifyResearcher();
    
    // Step 2: Make queries
    const queryCount = await makeQueries(15);
    
    // Step 3: Make purchases
    const purchaseResult = await makePurchases(5);
    
    // Step 4: Check metrics
    await checkMetrics();
    
    console.log('✅ Metrics generation complete!');
    console.log(`\n📝 Summary:`);
    console.log(`   - Queries made: ${queryCount}`);
    console.log(`   - Purchases made: ${purchaseResult.successCount}`);
    console.log(`   - HBAR distributed: ${purchaseResult.totalHBAR} HBAR`);
    console.log(`\n🌐 View metrics at: ${baseUrl}/api/public/metrics`);
    console.log(`📊 Dashboard: ${baseUrl.replace(':8080', ':3000')}/admin/dashboard\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run the script
main();

