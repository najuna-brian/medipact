#!/usr/bin/env node

/**
 * Setup Default Admin Account
 * 
 * Creates a default admin account for initial setup.
 * Usage: node scripts/setup-admin.js [username] [password]
 */

import { initDatabase, closeDatabase } from '../src/db/database.js';
import { createAdmin, adminExists } from '../src/db/admin-db.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setupAdmin() {
  try {
    console.log('🔧 Setting up default admin account...\n');
    
    // Initialize database
    await initDatabase();
    
    // Get username and password from command line args or prompt
    let username = process.argv[2];
    let password = process.argv[3];
    
    if (!username) {
      username = await question('Enter admin username (default: admin): ');
      username = username.trim() || 'admin';
    }
    
    if (!password) {
      password = await question('Enter admin password: ');
      if (!password.trim()) {
        console.error('❌ Password cannot be empty');
        process.exit(1);
      }
    }
    
    // Check if admin already exists
    const exists = await adminExists(username);
    if (exists) {
      console.error(`❌ Admin "${username}" already exists`);
      process.exit(1);
    }
    
    // Create admin
    const admin = await createAdmin(username, password, 'admin');
    
    console.log('\n✅ Admin account created successfully!');
    console.log(`   Username: ${admin.username}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
    console.log('\n💡 You can now use these credentials to log in to the admin panel.');
    
  } catch (error) {
    console.error('❌ Error setting up admin:', error.message);
    process.exit(1);
  } finally {
    await closeDatabase();
    rl.close();
  }
}

setupAdmin();

