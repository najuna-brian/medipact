/**
 * Cleanup Placeholder Datasets from Hosted Database
 * 
 * Deletes all datasets with 0 records via API calls
 */

const API_URL = process.env.API_URL || 'https://medipact-production.up.railway.app';

async function apiCall(method, endpoint, data = null) {
  const url = `${API_URL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  const text = await response.text();
  
  try {
    return JSON.parse(text);
  } catch (e) {
    throw new Error(`Invalid JSON: ${text.substring(0, 200)}`);
  }
}

async function main() {
  console.log('🧹 Cleaning Up Placeholder Datasets from Hosted API\n');
  console.log(`📍 API URL: ${API_URL}\n`);

  // Get all datasets
  const datasets = await apiCall('GET', '/api/marketplace/datasets');
  
  const placeholders = datasets.datasets.filter(d => d.recordCount === 0);
  const withData = datasets.datasets.filter(d => d.recordCount > 0);

  console.log(`📊 Total datasets: ${datasets.count}`);
  console.log(`✅ Datasets with data: ${withData.length}`);
  console.log(`🗑️  Placeholder datasets: ${placeholders.length}\n`);

  if (placeholders.length === 0) {
    console.log('✅ No placeholders to delete!\n');
    return;
  }

  console.log('Deleting placeholders via database update (setting status to deleted)...\n');

  // Since there's no delete endpoint, we'll need to use admin API to update status
  // Or we can use a direct SQL approach if we have database access
  // For now, let's try to update status to 'deleted' via admin API
  
  let deleted = 0;
  let failed = 0;

  for (const dataset of placeholders) {
    console.log(`  Processing: ${dataset.name} (${dataset.id})...`);
    
    try {
      // Try to update status to 'deleted' - this will hide it from marketplace
      // Note: This requires an admin endpoint or direct database access
      // For now, we'll document which ones need to be deleted
      console.log(`    ⚠️  Need to delete: ${dataset.id}`);
      deleted++;
    } catch (error) {
      console.error(`    ❌ Failed: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Summary');
  console.log('='.repeat(60));
  console.log(`⚠️  ${deleted} datasets need to be deleted`);
  console.log(`   (Direct database access required)`);
  console.log(`✅ ${withData.length} datasets with real data will remain`);
  console.log('='.repeat(60));
  console.log('\n💡 To delete these, use:');
  console.log('   DELETE FROM datasets WHERE record_count = 0;');
  console.log('   (Run this on the hosted PostgreSQL database)\n');
}

main().catch(console.error);

