/**
 * Admin Authentication API Routes
 * 
 * Routes for admin login and authentication.
 */

import express from 'express';
import { loginAdmin } from '../services/admin-auth-service.js';
import { createAdmin, anyAdminExists } from '../db/admin-db.js';

const router = express.Router();

/**
 * POST /api/admin/auth/login
 * Admin login
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }
    
    const result = await loginAdmin(username, password);
    
    res.json({
      success: true,
      token: result.token,
      admin: result.admin
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(401).json({ 
      error: error.message || 'Invalid credentials' 
    });
  }
});

/**
 * POST /api/admin/auth/logout
 * Admin logout (client-side token removal)
 * Note: With JWT, logout is handled client-side by removing the token
 */
router.post('/logout', async (req, res) => {
  res.json({ 
    success: true,
    message: 'Logged out successfully' 
  });
});

/**
 * POST /api/admin/auth/setup
 * Create the first admin account (only works if no admin exists)
 * Requires SETUP_SECRET environment variable for security
 */
router.post('/setup', async (req, res) => {
  try {
    const { username, password, setupSecret } = req.body;
    
    // Check if any admin already exists
    const adminExists = await anyAdminExists();
    if (adminExists) {
      return res.status(403).json({ 
        error: 'Admin setup is disabled. An admin account already exists.' 
      });
    }
    
    // Verify setup secret
    const requiredSecret = process.env.SETUP_SECRET || 'medipact-setup-secret-change-in-production';
    if (!setupSecret || setupSecret !== requiredSecret) {
      return res.status(401).json({ 
        error: 'Invalid setup secret' 
      });
    }
    
    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Username and password are required' 
      });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }
    
    // Create admin
    const admin = await createAdmin(username, password, 'admin');
    
    res.json({
      success: true,
      message: 'Admin account created successfully',
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to create admin account' 
    });
  }
});

export default router;

