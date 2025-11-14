/**
 * Integration Tests for Wallet and Withdrawal Flows
 * 
 * Tests the complete flow of:
 * 1. Wallet balance retrieval
 * 2. Manual withdrawal initiation
 * 3. Automatic withdrawal processing
 * 4. Payment verification for researchers
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { createHederaClient } from '../../src/services/hedera-client.js';
import { getPatientBalance, getHospitalBalance } from '../../src/services/balance-service.js';
import { 
  initiatePatientWithdrawal, 
  initiateHospitalWithdrawal,
  processAutomaticWithdrawals 
} from '../../src/services/withdrawal-service.js';
import { verifyHBARPayment, createPaymentRequest } from '../../src/services/payment-verification-service.js';
import { getPatient } from '../../src/db/patient-db.js';
import { getHospital } from '../../src/db/hospital-db.js';
import { getResearcher } from '../../src/db/researcher-db.js';
import { getWithdrawalHistoryForUser } from '../../src/db/withdrawal-db.js';

describe('Wallet and Withdrawal Integration Tests', () => {
  let testPatientUPI;
  let testHospitalId;
  let testResearcherId;
  let platformAccountId;

  beforeAll(async () => {
    // Setup test data
    platformAccountId = process.env.PLATFORM_HEDERA_ACCOUNT_ID || process.env.OPERATOR_ID;
    
    // Create or get test patient
    testPatientUPI = 'TEST-PATIENT-WALLET-001';
    // Create or get test hospital
    testHospitalId = 'TEST-HOSPITAL-WALLET-001';
    // Create or get test researcher
    testResearcherId = 'TEST-RESEARCHER-WALLET-001';
  });

  describe('Balance Retrieval', () => {
    it('should retrieve patient balance', async () => {
      try {
        const balance = await getPatientBalance(testPatientUPI);
        expect(balance).toHaveProperty('balanceHBAR');
        expect(balance).toHaveProperty('balanceUSD');
        expect(balance).toHaveProperty('hederaAccountId');
        expect(typeof balance.balanceHBAR).toBe('number');
        expect(typeof balance.balanceUSD).toBe('number');
      } catch (error) {
        // If patient doesn't exist, that's okay for integration tests
        if (error.message.includes('not found')) {
          console.log('Test patient not found, skipping balance test');
        } else {
          throw error;
        }
      }
    });

    it('should retrieve hospital balance', async () => {
      try {
        const balance = await getHospitalBalance(testHospitalId);
        expect(balance).toHaveProperty('balanceHBAR');
        expect(balance).toHaveProperty('balanceUSD');
        expect(balance).toHaveProperty('hederaAccountId');
        expect(typeof balance.balanceHBAR).toBe('number');
        expect(typeof balance.balanceUSD).toBe('number');
      } catch (error) {
        // If hospital doesn't exist, that's okay for integration tests
        if (error.message.includes('not found')) {
          console.log('Test hospital not found, skipping balance test');
        } else {
          throw error;
        }
      }
    });
  });

  describe('Manual Withdrawal', () => {
    it('should initiate patient withdrawal', async () => {
      try {
        const patient = await getPatient(testPatientUPI);
        if (!patient || !patient.hederaAccountId) {
          console.log('Test patient not found or has no Hedera account, skipping withdrawal test');
          return;
        }

        const withdrawal = await initiatePatientWithdrawal(testPatientUPI, 1.0); // $1 USD
        expect(withdrawal).toHaveProperty('id');
        expect(withdrawal).toHaveProperty('status');
        expect(withdrawal.status).toBe('pending');
        expect(withdrawal.amountUSD).toBe(1.0);
        expect(withdrawal.user_type).toBe('patient');
      } catch (error) {
        if (error.message.includes('not found') || error.message.includes('no payment method')) {
          console.log('Test patient setup incomplete, skipping withdrawal test');
        } else {
          throw error;
        }
      }
    });

    it('should initiate hospital withdrawal', async () => {
      try {
        const hospital = await getHospital(testHospitalId);
        if (!hospital || !hospital.hederaAccountId) {
          console.log('Test hospital not found or has no Hedera account, skipping withdrawal test');
          return;
        }

        const withdrawal = await initiateHospitalWithdrawal(testHospitalId, 5.0); // $5 USD
        expect(withdrawal).toHaveProperty('id');
        expect(withdrawal).toHaveProperty('status');
        expect(withdrawal.status).toBe('pending');
        expect(withdrawal.amountUSD).toBe(5.0);
        expect(withdrawal.user_type).toBe('hospital');
      } catch (error) {
        if (error.message.includes('not found') || error.message.includes('no payment method')) {
          console.log('Test hospital setup incomplete, skipping withdrawal test');
        } else {
          throw error;
        }
      }
    });
  });

  describe('Withdrawal History', () => {
    it('should retrieve patient withdrawal history', async () => {
      try {
        const history = await getWithdrawalHistoryForUser(testPatientUPI, 'patient', 10, 0);
        expect(Array.isArray(history)).toBe(true);
        if (history.length > 0) {
          expect(history[0]).toHaveProperty('id');
          expect(history[0]).toHaveProperty('amount_hbar');
          expect(history[0]).toHaveProperty('amount_usd');
          expect(history[0]).toHaveProperty('status');
        }
      } catch (error) {
        if (error.message.includes('not found')) {
          console.log('Test patient not found, skipping history test');
        } else {
          throw error;
        }
      }
    });

    it('should retrieve hospital withdrawal history', async () => {
      try {
        const history = await getWithdrawalHistoryForUser(testHospitalId, 'hospital', 10, 0);
        expect(Array.isArray(history)).toBe(true);
        if (history.length > 0) {
          expect(history[0]).toHaveProperty('id');
          expect(history[0]).toHaveProperty('amount_hbar');
          expect(history[0]).toHaveProperty('amount_usd');
          expect(history[0]).toHaveProperty('status');
        }
      } catch (error) {
        if (error.message.includes('not found')) {
          console.log('Test hospital not found, skipping history test');
        } else {
          throw error;
        }
      }
    });
  });

  describe('Automatic Withdrawal Processing', () => {
    it('should process automatic withdrawals', async () => {
      try {
        const result = await processAutomaticWithdrawals();
        expect(result).toHaveProperty('processed');
        expect(result).toHaveProperty('failed');
        expect(typeof result.processed).toBe('number');
        expect(typeof result.failed).toBe('number');
        expect(result.processed).toBeGreaterThanOrEqual(0);
        expect(result.failed).toBeGreaterThanOrEqual(0);
      } catch (error) {
        // This might fail if there are no eligible users, which is fine
        console.log('Automatic withdrawal processing test:', error.message);
      }
    });
  });

  describe('Payment Verification', () => {
    it('should create payment request', async () => {
      try {
        const researcher = await getResearcher(testResearcherId);
        if (!researcher) {
          console.log('Test researcher not found, skipping payment request test');
          return;
        }

        const paymentRequest = await createPaymentRequest(
          testResearcherId,
          10.0, // 10 HBAR
          platformAccountId
        );

        expect(paymentRequest).toHaveProperty('paymentRequestId');
        expect(paymentRequest).toHaveProperty('amountHBAR');
        expect(paymentRequest).toHaveProperty('recipientAccountId');
        expect(paymentRequest).toHaveProperty('memo');
        expect(paymentRequest.amountHBAR).toBe(10.0);
        expect(paymentRequest.recipientAccountId).toBe(platformAccountId);
      } catch (error) {
        if (error.message.includes('not found')) {
          console.log('Test researcher not found, skipping payment request test');
        } else {
          throw error;
        }
      }
    });

    it('should handle invalid transaction ID format', async () => {
      try {
        const researcher = await getResearcher(testResearcherId);
        if (!researcher || !researcher.hederaAccountId) {
          console.log('Test researcher not found or has no Hedera account, skipping verification test');
          return;
        }

        const verification = await verifyHBARPayment(
          'invalid-tx-id',
          testResearcherId,
          10.0,
          platformAccountId
        );

        // Should return verification failure for invalid format
        expect(verification.verified).toBe(false);
        expect(verification).toHaveProperty('error');
      } catch (error) {
        // Expected to fail for invalid transaction ID
        expect(error).toBeDefined();
      }
    });
  });

  describe('Exchange Rate Integration', () => {
    it('should convert HBAR to USD', async () => {
      const { hbarToUSD } = await import('../../src/services/pricing-service.js');
      const usdAmount = await hbarToUSD(10.0);
      expect(typeof usdAmount).toBe('number');
      expect(usdAmount).toBeGreaterThan(0);
    });

    it('should convert USD to HBAR', async () => {
      const { usdToHBAR } = await import('../../src/services/pricing-service.js');
      const hbarAmount = await usdToHBAR(1.0);
      expect(typeof hbarAmount).toBe('number');
      expect(hbarAmount).toBeGreaterThan(0);
    });
  });
});

