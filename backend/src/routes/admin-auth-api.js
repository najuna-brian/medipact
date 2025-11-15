/**
 * Admin Authentication API Routes
 * 
 * Routes for admin login and authentication.
 */

import express from 'express';
import jwt from 'jsonwebtoken';
import { loginAdmin } from '../services/admin-auth-service.js';
import { createAdmin, anyAdminExists, resetAdminPassword, adminExists } from '../db/admin-db.js';

const router = express.Router();

/**
 * POST /api/admin/auth/login
 * Admin login
 * TEMPORARILY BYPASSED - Authentication will be implemented later
 * TODO: Restore proper authentication when ready
 */
router.post('/login', async (req, res) => {
  try {
    // TODO: Implement proper authentication later
    // For now, always bypass authentication for testing
    const mockAdmin = {
      id: 1,
      username: 'admin',
      role: 'admin'
    };

    // Generate a valid JWT token for the frontend
    const JWT_SECRET = process.env.JWT_SECRET || 'medipact-admin-secret-key-change-in-production';
    const token = jwt.sign(
      {
        id: mockAdmin.id,
        username: mockAdmin.username,
        role: mockAdmin.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      token: token,
      admin: mockAdmin
    });
    return;

    // Original authentication code (commented out for now)
    /*
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
    */
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

/**
 * POST /api/admin/auth/reset-password
 * Reset admin password (for recovery)
 * Requires SETUP_SECRET environment variable for security
 */
router.post('/reset-password', async (req, res) => {
  try {
    const { username, newPassword, setupSecret } = req.body;
    
    // Verify setup secret
    const requiredSecret = process.env.SETUP_SECRET || 'medipact-setup-secret-change-in-production';
    if (!setupSecret || setupSecret !== requiredSecret) {
      return res.status(401).json({ 
        error: 'Invalid setup secret' 
      });
    }
    
    if (!username || !newPassword) {
      return res.status(400).json({ 
        error: 'Username and new password are required' 
      });
    }
    
    if (newPassword.length < 8) {
      return res.status(400).json({ 
        error: 'Password must be at least 8 characters long' 
      });
    }
    
    // Check if admin exists
    const exists = await adminExists(username);
    if (!exists) {
      return res.status(404).json({ 
        error: 'Admin account not found' 
      });
    }
    
    // Reset password
    const admin = await resetAdminPassword(username, newPassword);
    
    res.json({
      success: true,
      message: 'Admin password reset successfully',
      admin: {
        id: admin.id,
        username: admin.username,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin password reset error:', error);
    res.status(400).json({ 
      error: error.message || 'Failed to reset admin password' 
    });
  }
});

export default router;

