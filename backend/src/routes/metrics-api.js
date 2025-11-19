/**
 * Public Metrics API
 * 
 * Provides Hedera network impact metrics for hackathon submission
 */

import express from 'express';
import { getAllHederaMetrics } from '../services/hedera-metrics-service.js';

const router = express.Router();

/**
 * GET /api/public/metrics
 * Get public Hedera network metrics
 */
router.get('/metrics', async (req, res) => {
  try {
    const metrics = await getAllHederaMetrics();
    res.json({
      success: true,
      metrics,
      network: process.env.HEDERA_NETWORK || 'testnet',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch metrics',
      message: error.message
    });
  }
});

export default router;

