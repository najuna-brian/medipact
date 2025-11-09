/**
 * Admin Authentication Service
 * 
 * Handles admin login, JWT token generation, and authentication.
 */

import jwt from 'jsonwebtoken';
import { verifyAdminPassword, getAdminById } from '../db/admin-db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'medipact-admin-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * Login admin and generate JWT token
 */
export async function loginAdmin(username, password) {
  const admin = await verifyAdminPassword(username, password);
  
  if (!admin) {
    throw new Error('Invalid username or password');
  }
  
  // Generate JWT token
  const token = jwt.sign(
    {
      id: admin.id,
      username: admin.username,
      role: admin.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  return {
    token,
    admin: {
      id: admin.id,
      username: admin.username,
      role: admin.role
    }
  };
}

/**
 * Verify JWT token and return admin info
 */
export async function verifyAdminToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify admin still exists and is active
    const admin = await getAdminById(decoded.id);
    if (!admin) {
      throw new Error('Admin not found');
    }
    
    return {
      id: admin.id,
      username: admin.username,
      role: admin.role
    };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'TokenExpiredError') {
      throw new Error('Token expired');
    } else {
      throw error;
    }
  }
}

/**
 * Extract token from Authorization header
 */
export function extractTokenFromHeader(authHeader) {
  if (!authHeader) {
    return null;
  }
  
  // Support both "Bearer <token>" and just "<token>"
  const parts = authHeader.split(' ');
  if (parts.length === 2 && parts[0] === 'Bearer') {
    return parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  
  return null;
}

