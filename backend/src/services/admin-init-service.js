/**
 * Admin Initialization Service
 * 
 * Automatically creates default admin account on server startup if it doesn't exist.
 */

import { createAdmin, adminExists, anyAdminExists } from '../db/admin-db.js';

/**
 * Initialize default admin account if it doesn't exist
 */
export async function initializeDefaultAdmin() {
  try {
    // Check if any admin exists first (more efficient)
    const anyExists = await anyAdminExists();
    if (anyExists) {
      console.log(`✅ Admin account(s) already exist`);
      return;
    }
    
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Double-check if this specific admin exists
    const exists = await adminExists(username);
    
    if (exists) {
      console.log(`✅ Admin account "${username}" already exists`);
      return;
    }
    
    // Create default admin account
    const admin = await createAdmin(username, password, 'admin');
    
    console.log(`✅ Default admin account created:`);
    console.log(`   Username: ${admin.username}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   💡 You can now log in with these credentials.`);
    console.log(`   ⚠️  Please change the default password after first login!`);
    
  } catch (error) {
    // Log error but don't fail server startup
    console.error('⚠️  Warning: Could not initialize default admin account:', error.message);
    console.error('   Stack:', error.stack);
    console.error('   You can create an admin account manually using:');
    console.error('   1. node scripts/setup-admin.js (local database)');
    console.error('   2. POST /api/admin/auth/setup (via API with SETUP_SECRET)');
  }
}

