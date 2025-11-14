/**
 * Admin Database Operations
 * 
 * CRUD operations for admin accounts.
 */

import { run, get, all } from './database.js';
import bcrypt from 'bcrypt';

const BCRYPT_ROUNDS = 12; // Cost factor for bcrypt (higher = more secure but slower)

/**
 * Hash a password using bcrypt
 */
async function hashPassword(password) {
  return await bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Compare password with hash using bcrypt
 */
async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

/**
 * Create a new admin account
 */
export async function createAdmin(username, password, role = 'admin') {
  const passwordHash = await hashPassword(password);
  
  try {
    await run(`
      INSERT INTO admins (username, password_hash, role, created_at, last_login)
      VALUES (?, ?, ?, CURRENT_TIMESTAMP, NULL)
    `, [username, passwordHash, role]);
    
    const admin = await getAdminByUsername(username);
    return {
      id: admin.id,
      username: admin.username,
      role: admin.role,
      createdAt: admin.createdAt
    };
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE constraint')) {
      throw new Error('Admin username already exists');
    } else {
      throw err;
    }
  }
}

/**
 * Get admin by username
 */
export async function getAdminByUsername(username) {
  try {
    const row = await get(`
      SELECT 
        id,
        username,
        password_hash as passwordHash,
        role,
        created_at as createdAt,
        last_login as lastLogin,
        status
      FROM admins
      WHERE username = ? AND status = 'active'
    `, [username]);
    
    return row || null;
  } catch (err) {
    throw err;
  }
}

/**
 * Get admin by ID
 */
export async function getAdminById(id) {
  try {
    const row = await get(`
      SELECT 
        id,
        username,
        role,
        created_at as createdAt,
        last_login as lastLogin,
        status
      FROM admins
      WHERE id = ? AND status = 'active'
    `, [id]);
    
    return row || null;
  } catch (err) {
    throw err;
  }
}

/**
 * Verify admin password using bcrypt
 * 
 * Note: User mentioned they are handling password bypass intentionally for now,
 * but we're implementing proper bcrypt verification for when they're ready.
 */
export async function verifyAdminPassword(username, password) {
  const admin = await getAdminByUsername(username);
  if (!admin) {
    console.error(`[AUTH] Admin not found: ${username}`);
    return null;
  }
  
  // Check if password hash is bcrypt format (starts with $2a$, $2b$, or $2y$)
  const isBcryptHash = admin.passwordHash && 
    (admin.passwordHash.startsWith('$2a$') || 
     admin.passwordHash.startsWith('$2b$') || 
     admin.passwordHash.startsWith('$2y$'));
  
  if (isBcryptHash) {
    // Use bcrypt comparison
    const isValid = await comparePassword(password, admin.passwordHash);
    if (isValid) {
      await updateLastLogin(admin.id);
      return {
        id: admin.id,
        username: admin.username,
        role: admin.role
      };
    }
    console.error(`[AUTH] Password mismatch for: ${username}`);
    return null;
  } else {
    // Legacy SHA-256 hash - migrate on next password update
    // For now, allow login but log warning
    console.warn(`[AUTH] Legacy password hash detected for: ${username}. Please update password.`);
    
    // TEMPORARY: User mentioned they are handling bypass intentionally
    // This allows legacy hashes to work until migration
    const crypto = await import('crypto');
    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (admin.passwordHash?.trim() === passwordHash.trim()) {
      await updateLastLogin(admin.id);
      return {
        id: admin.id,
        username: admin.username,
        role: admin.role
      };
    }
    
    console.error(`[AUTH] Password mismatch for: ${username}`);
    return null;
  }
}

/**
 * Update last login timestamp
 */
async function updateLastLogin(adminId) {
  try {
    await run(`
      UPDATE admins
      SET last_login = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [adminId]);
  } catch (err) {
    throw err;
  }
}

/**
 * Check if admin exists
 */
export async function adminExists(username) {
  const admin = await getAdminByUsername(username);
  return admin !== null;
}

/**
 * Check if any admin exists in the system
 */
export async function anyAdminExists() {
  try {
    const row = await get(`
      SELECT COUNT(*) as count
      FROM admins
      WHERE status = 'active'
    `);
    return (row?.count || 0) > 0;
  } catch (err) {
    throw err;
  }
}

/**
 * Update admin password (uses bcrypt)
 */
export async function updateAdminPassword(username, newPassword) {
  const passwordHash = await hashPassword(newPassword);
  
  try {
    await run(`
      UPDATE admins
      SET password_hash = ?
      WHERE username = ? AND status = 'active'
    `, [passwordHash, username]);
    
    const admin = await getAdminByUsername(username);
    if (!admin) {
      throw new Error('Admin not found');
    }
    
    return {
      id: admin.id,
      username: admin.username,
      role: admin.role
    };
  } catch (err) {
    throw err;
  }
}

/**
 * Reset admin password (for recovery)
 */
export async function resetAdminPassword(username, newPassword) {
  return updateAdminPassword(username, newPassword);
}

