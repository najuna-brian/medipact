/**
 * Payment Method API Routes
 * 
 * Endpoints for updating payment method settings.
 */

import express from 'express';
import { updatePatient } from '../db/patient-db.js';
import { updateHospital } from '../db/hospital-db.js';

const router = express.Router();

/**
 * PUT /api/patient/:upi/payment-method
 * Update patient payment method
 */
router.put('/patient/:upi/payment-method', async (req, res) => {
  try {
    const { upi } = req.params;
    const {
      paymentMethod,
      bankAccountNumber,
      bankName,
      mobileMoneyProvider,
      mobileMoneyNumber,
      withdrawalThresholdUSD,
      autoWithdrawEnabled
    } = req.body;

    if (paymentMethod && paymentMethod !== 'bank' && paymentMethod !== 'mobile_money') {
      return res.status(400).json({ error: 'Invalid payment method. Must be "bank" or "mobile_money"' });
    }

    if (paymentMethod === 'bank' && (!bankAccountNumber || !bankName)) {
      return res.status(400).json({ error: 'Bank account number and bank name are required for bank payments' });
    }

    if (paymentMethod === 'mobile_money' && (!mobileMoneyProvider || !mobileMoneyNumber)) {
      return res.status(400).json({ error: 'Mobile money provider and number are required for mobile money payments' });
    }

    await updatePatient(upi, {
      paymentMethod: paymentMethod || null,
      bankAccountNumber: bankAccountNumber || null,
      bankName: bankName || null,
      mobileMoneyProvider: mobileMoneyProvider || null,
      mobileMoneyNumber: mobileMoneyNumber || null,
      withdrawalThresholdUSD: withdrawalThresholdUSD,
      autoWithdrawEnabled: autoWithdrawEnabled
    });

    res.json({
      message: 'Payment method updated successfully',
      upi
    });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * PUT /api/hospital/:hospitalId/payment-method
 * Update hospital payment method
 */
router.put('/hospital/:hospitalId/payment-method', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const {
      paymentMethod,
      bankAccountNumber,
      bankName,
      mobileMoneyProvider,
      mobileMoneyNumber,
      withdrawalThresholdUSD,
      autoWithdrawEnabled
    } = req.body;

    if (paymentMethod && paymentMethod !== 'bank' && paymentMethod !== 'mobile_money') {
      return res.status(400).json({ error: 'Invalid payment method. Must be "bank" or "mobile_money"' });
    }

    if (paymentMethod === 'bank' && (!bankAccountNumber || !bankName)) {
      return res.status(400).json({ error: 'Bank account number and bank name are required for bank payments' });
    }

    if (paymentMethod === 'mobile_money' && (!mobileMoneyProvider || !mobileMoneyNumber)) {
      return res.status(400).json({ error: 'Mobile money provider and number are required for mobile money payments' });
    }

    await updateHospital(hospitalId, {
      paymentMethod: paymentMethod || null,
      bankAccountNumber: bankAccountNumber || null,
      bankName: bankName || null,
      mobileMoneyProvider: mobileMoneyProvider || null,
      mobileMoneyNumber: mobileMoneyNumber || null,
      withdrawalThresholdUSD: withdrawalThresholdUSD,
      autoWithdrawEnabled: autoWithdrawEnabled
    });

    res.json({
      message: 'Payment method updated successfully',
      hospitalId
    });
  } catch (error) {
    console.error('Error updating payment method:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

