/**
 * Admin Authentication API Routes
 * 
 * Routes for admin login and authentication.
 */

import express from 'express';
import { loginAdmin } from '../services/admin-auth-service.js';

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

export default router;

