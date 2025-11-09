/**
 * Admin Database Operations
 * 
 * CRUD operations for admin accounts.
 */

import { getDatabase } from './database.js';
import crypto from 'crypto';
import { promisify } from 'util';

/**
 * Hash a password using SHA-256
 * Note: In production, use bcrypt or argon2 for better security
 */
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

/**
 * Create a new admin account
 */
export async function createAdmin(username, password, role = 'admin') {
  const db = getDatabase();
  const run = promisify(db.run.bind(db));
  
  const passwordHash = hashPassword(password);
  
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
  const db = getDatabase();
  const get = promisify(db.get.bind(db));
  
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
  const db = getDatabase();
  const get = promisify(db.get.bind(db));
  
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
 * Verify admin password
 */
export async function verifyAdminPassword(username, password) {
  const admin = await getAdminByUsername(username);
  if (!admin) {
    return null;
  }
  
  const passwordHash = hashPassword(password);
  if (admin.passwordHash === passwordHash) {
    // Update last login
    await updateLastLogin(admin.id);
    return {
      id: admin.id,
      username: admin.username,
      role: admin.role
    };
  }
  
  return null;
}

/**
 * Update last login timestamp
 */
async function updateLastLogin(adminId) {
  const db = getDatabase();
  const run = promisify(db.run.bind(db));
  
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

