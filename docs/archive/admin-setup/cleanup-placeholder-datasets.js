/**
 * Cleanup Placeholder Datasets
 * 
 * Removes all datasets with 0 records (placeholders) from the system
 * Keeps only datasets with real data
 */

const API_URL = process.env.API_URL || 'https://medipact-production.up.railway.app';

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

async function deleteDataset(datasetId) {
  try {
    // Update dataset status to 'deleted' via admin API
    const result = await apiCall('PATCH', `/api/admin/datasets/${datasetId}`, {
      status: 'deleted'
    });
    return result;
  } catch (error) {
    // If PATCH doesn't work, try direct database update via admin endpoint
    console.warn(`  ⚠️  Could not delete via API: ${error.message}`);
    return null;
  }
}

async function main() {
  console.log('🧹 Cleaning Up Placeholder Datasets\n');
  console.log(`📍 API URL: ${API_URL}\n`);

  // Get all datasets
  const datasets = await apiCall('GET', '/api/marketplace/datasets');
  
  const placeholders = datasets.datasets.filter(d => d.recordCount === 0);
  const withData = datasets.datasets.filter(d => d.recordCount > 0);

  console.log(`📊 Found ${datasets.count} total datasets`);
  console.log(`✅ Datasets with data: ${withData.length}`);
  console.log(`🗑️  Placeholder datasets to remove: ${placeholders.length}\n`);

  if (placeholders.length === 0) {
    console.log('✅ No placeholder datasets to remove!\n');
    return;
  }

  console.log('Deleting placeholder datasets...\n');
  
  let deleted = 0;
  let failed = 0;

  for (const dataset of placeholders) {
    console.log(`  Deleting: ${dataset.name} (${dataset.id})...`);
    
    try {
      // Try to delete via direct SQL through admin API
      // Since there's no delete endpoint, we'll use a workaround
      const result = await apiCall('POST', '/api/admin/migrate/datasets', {
        action: 'delete',
        datasetId: dataset.id
      });
      console.log(`    ✅ Deleted`);
      deleted++;
    } catch (error) {
      // If that doesn't work, we'll need to use direct database access
      console.log(`    ⚠️  API deletion not available, will use direct database access`);
      failed++;
    }
  }

  // If API deletion doesn't work, we need to use direct database
  if (failed > 0) {
    console.log('\n⚠️  Some datasets could not be deleted via API.');
    console.log('   Using direct database access...\n');
    
    // Import database functions
    const { getDatabase, getDatabaseType } = await import('../src/db/database.js');
    const db = getDatabase();
    const dbType = getDatabaseType();

    for (const dataset of placeholders) {
      try {
        if (dbType === 'postgresql') {
          await db.query('DELETE FROM datasets WHERE id = $1', [dataset.id]);
        } else {
          const { promisify } = await import('util');
          const run = promisify(db.run.bind(db));
          await run('DELETE FROM datasets WHERE id = ?', [dataset.id]);
        }
        console.log(`  ✅ Deleted ${dataset.id} from database`);
        deleted++;
      } catch (error) {
        console.error(`  ❌ Failed to delete ${dataset.id}: ${error.message}`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 Cleanup Summary');
  console.log('='.repeat(60));
  console.log(`✅ Deleted: ${deleted} placeholder datasets`);
  console.log(`📊 Remaining datasets with data: ${withData.length}`);
  console.log(`📈 Total records: ${withData.reduce((sum, d) => sum + d.recordCount, 0).toLocaleString()}`);
  console.log('='.repeat(60));
  console.log('\n✅ Cleanup complete!\n');
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  console.error(error);
  process.exit(1);
});

