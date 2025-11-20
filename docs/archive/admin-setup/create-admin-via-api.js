#!/usr/bin/env node

/**
 * Create Admin Account via API
 * 
 * Creates the first admin account by calling the setup endpoint.
 * Usage: node scripts/create-admin-via-api.js [username] [password] [setupSecret]
 */

const API_URL = process.env.API_URL || 'https://medipact-production.up.railway.app';
const SETUP_SECRET = process.env.SETUP_SECRET || 'medipact-setup-secret-change-in-production';

async function createAdmin() {
  const username = process.argv[2] || 'admin';
  const password = process.argv[3] || 'admin123';
  const setupSecret = process.argv[4] || SETUP_SECRET;
  
  console.log('🔧 Creating admin account via API...\n');
  console.log(`   API URL: ${API_URL}`);
  console.log(`   Username: ${username}\n`);
  
  try {
    const response = await fetch(`${API_URL}/api/admin/auth/setup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        setupSecret
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Admin account created successfully!');
      console.log(`   Username: ${data.admin.username}`);
      console.log(`   Role: ${data.admin.role}`);
      console.log(`   ID: ${data.admin.id}`);
      console.log('\n💡 You can now use these credentials to log in to the admin panel.');
    } else {
      console.error('❌ Failed to create admin account:');
      console.error(`   Error: ${data.error}`);
      if (data.error.includes('setup secret')) {
        console.error('\n💡 Set SETUP_SECRET environment variable or pass it as the 4th argument.');
      }
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('\n💡 Make sure the backend server is running and accessible.');
    process.exit(1);
  }
}

createAdmin();

