/**
 * Admin Initialization Service
 * 
 * Automatically creates default admin account on server startup if it doesn't exist.
 */

import { createAdmin, adminExists } from '../db/admin-db.js';

/**
 * Initialize default admin account if it doesn't exist
 */
export async function initializeDefaultAdmin() {
  try {
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || 'admin123';
    
    // Check if admin already exists
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
    
  } catch (error) {
    // Log error but don't fail server startup
    console.error('⚠️  Warning: Could not initialize default admin account:', error.message);
    console.error('   You can create an admin account manually using: node scripts/setup-admin.js');
  }
}

