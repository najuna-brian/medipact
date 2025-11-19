/**
 * Automated Metrics Generation Script
 * 
 * This script automatically generates metrics by:
 * 1. Making queries (generates HCS messages)
 * 2. Sending HBAR payments programmatically (using stored private keys)
 * 3. Completing purchases (generates contract calls & HBAR distribution)
 * 
 * Usage:
 *   node scripts/generate-metrics-automated.js                    # Local
 *   API_URL=https://your-api.com node scripts/generate-metrics-automated.js  # Production
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
// No longer need Hedera SDK imports - using API endpoint instead

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get API URL from environment or default to localhost
const API_URL = process.env.API_URL || process.env.NEXT_PUBLIC_BACKEND_API_URL || 'http://localhost:8080';
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

// Get first researcher
let researcher = credentials.researchers?.[0];
if (!researcher) {
  console.error('❌ No researchers found in demo credentials');
  process.exit(1);
}

const researcherId = researcher.researcherId;
console.log(`📋 Using researcher: ${researcherId}\n`);

// No longer need database access - using API endpoint instead

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

// Step 1: Verify researcher
async function verifyResearcher() {
  console.log('🔍 Checking researcher verification status...');
  
  const result = await apiRequest(`/api/researcher/${researcherId}/status`);
  
  if (result.ok && result.data.verificationStatus === 'verified') {
    console.log('✅ Researcher is already verified\n');
    return true;
  }
  
  console.log('⚠️  Researcher not verified. Attempting to verify...');
  
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

// Step 1.5: Fund researcher account
async function fundResearcherAccount() {
  console.log('💰 Checking and funding researcher account...');
  
  // Get researcher info to get account ID - use full endpoint, not status
  const researcherResult = await apiRequest(`/api/researcher/${researcherId}`);
  
  if (!researcherResult.ok || !researcherResult.data.hederaAccountId) {
    console.log('⚠️  Could not get researcher account ID\n');
    return false;
  }
  
  const accountId = researcherResult.data.hederaAccountId;
  console.log(`   Account ID: ${accountId}`);
  
  // Check balance
  const balanceResult = await apiRequest(`/api/admin/account-balance/${accountId}`);
  
  if (balanceResult.ok) {
    const balance = balanceResult.data.balanceHBAR || 0;
    console.log(`   Current balance: ${balance} HBAR`);
    
    // If balance is less than 1000 HBAR, fund it
    if (balance < 1000) {
      console.log(`   Balance is low. Funding account with 1000 HBAR...`);
      
      const fundResult = await apiRequest('/api/admin/fund-account', 'POST', {
        accountId,
        amountHBAR: 1000
      });
      
      if (fundResult.ok && fundResult.data.success) {
        console.log(`✅ Account funded successfully!`);
        console.log(`   Transaction: ${fundResult.data.transactionId || 'N/A'}\n`);
        return true;
      } else {
        console.log(`⚠️  Funding failed: ${fundResult.data?.error || 'Unknown error'}\n`);
        return false;
      }
    } else {
      console.log(`✅ Account has sufficient balance\n`);
      return true;
    }
  } else {
    console.log(`⚠️  Could not check balance: ${balanceResult.error || 'Unknown error'}\n`);
    return false;
  }
}

// Step 2: Make queries (generates HCS messages)
async function makeQueries(count = 15) {
  console.log(`📊 Making ${count} queries to generate HCS messages...\n`);
  
  const queryFilters = [
    { conditionName: 'Type 2 Diabetes', country: 'Uganda', limit: 10 },
    { conditionName: 'Hypertension', country: 'Kenya', limit: 10 },
    { conditionName: 'Malaria', country: 'Tanzania', limit: 10 },
    { conditionName: 'Pneumonia', country: 'Uganda', limit: 10 },
    { conditionName: 'Tuberculosis', country: 'Rwanda', limit: 10 },
    { conditionName: 'HIV', country: 'Kenya', limit: 10 },
    { conditionName: 'Asthma', country: 'Uganda', limit: 10 },
    { conditionName: 'Anemia', country: 'Tanzania', limit: 10 },
    { conditionName: 'Diabetes', country: 'Kenya', limit: 10 },
    { conditionName: 'Heart Disease', country: 'Uganda', limit: 10 },
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
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log(`\n\n✅ Completed ${successCount} queries, ${errorCount} errors\n`);
  return successCount;
}

// Step 3: Make purchases with programmatic payments (via API)
async function makePurchases(count = 5) {
  console.log(`💰 Making ${count} purchases with programmatic payments...\n`);
  
  const purchaseAmounts = [50, 100, 150, 200, 250];
  
  let successCount = 0;
  let errorCount = 0;
  let totalHBAR = 0;
  
  for (let i = 0; i < count; i++) {
    const amount = purchaseAmounts[i % purchaseAmounts.length];
    
    try {
      // Use admin API endpoint to send payment and complete purchase
      process.stdout.write(`🛒 Processing purchase ${i + 1}/${count} (${amount} HBAR)...\r`);
      
      const purchaseData = {
        researcherId,
        amountHBAR: amount,
        queryFilters: {
          conditionName: 'Type 2 Diabetes',
          country: 'Uganda',
          limit: 100,
        },
      };
      
      const result = await apiRequest('/api/admin/send-payment-and-purchase', 'POST', purchaseData);
      
      if (result.ok && result.data.success) {
        successCount++;
        totalHBAR += amount;
        const txId = result.data.transactionId || 'N/A';
        console.log(`✅ Purchase ${i + 1}/${count} - ${amount} HBAR (Tx: ${txId.substring(0, 20)}...)`);
      } else {
        errorCount++;
        const errorMsg = result.data?.error || result.error || 'Unknown error';
        console.log(`\n❌ Purchase ${i + 1} failed: ${errorMsg}`);
      }
      
    } catch (error) {
      errorCount++;
      console.log(`\n❌ Purchase ${i + 1} failed: ${error.message}`);
    }
    
    // Delay between purchases
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  
  console.log(`\n\n✅ Completed ${successCount} purchases, ${errorCount} errors`);
  console.log(`💰 Total HBAR distributed: ${totalHBAR} HBAR\n`);
  
  return { successCount, totalHBAR };
}

// Step 5: Check final metrics
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
    
    // Step 1.5: Fund researcher account
    await fundResearcherAccount();
    
    // Step 2: Make queries
    const queryCount = await makeQueries(15);
    
    // Step 3: Make purchases with programmatic payments
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

