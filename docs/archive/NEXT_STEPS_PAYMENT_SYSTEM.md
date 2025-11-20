# Next Steps: Payment and Withdrawal System

This document outlines the remaining tasks to complete the payment and withdrawal system implementation.

## Priority 1: Core Functionality

### 1. Payment Gateway Integration
**Status:** Pending  
**Priority:** High  
**Description:** Integrate with payment gateway (Flutterwave, Paystack, or similar) to process actual bank and mobile money transfers.

**Tasks:**
- [ ] Research and select payment gateway provider
- [ ] Create payment gateway service (`backend/src/services/payment-gateway-service.js`)
- [ ] Implement bank transfer function
- [ ] Implement mobile money transfer function
- [ ] Add payment gateway configuration (API keys, webhooks)
- [ ] Update withdrawal service to call payment gateway
- [ ] Handle payment gateway responses and update withdrawal status
- [ ] Add error handling for payment gateway failures

**Files to Create:**
- `backend/src/services/payment-gateway-service.js`
- `backend/src/config/payment-gateway.js`

**Environment Variables:**
```env
PAYMENT_GATEWAY_PROVIDER=flutterwave  # or paystack
PAYMENT_GATEWAY_API_KEY=...
PAYMENT_GATEWAY_SECRET_KEY=...
PAYMENT_GATEWAY_WEBHOOK_SECRET=...
```

### 2. Dynamic HBAR Exchange Rate
**Status:** Pending  
**Priority:** High  
**Description:** Implement dynamic fetching of HBAR to USD exchange rate instead of hardcoded value.

**Tasks:**
- [ ] Research HBAR price API (CoinGecko, CoinMarketCap, etc.)
- [ ] Create exchange rate service (`backend/src/services/exchange-rate-service.js`)
- [ ] Implement rate caching (update every 5-10 minutes)
- [ ] Update `pricing-service.js` to use dynamic rate
- [ ] Add fallback to hardcoded rate if API fails
- [ ] Update balance service to use dynamic rate

**Files to Create:**
- `backend/src/services/exchange-rate-service.js`
- `backend/src/services/rate-cache.js`

**Environment Variables:**
```env
EXCHANGE_RATE_API_URL=https://api.coingecko.com/api/v3/simple/price
EXCHANGE_RATE_UPDATE_INTERVAL_MINUTES=5
EXCHANGE_RATE_FALLBACK=0.16
```

### 3. Researcher Payment Flow
**Status:** Pending  
**Priority:** High  
**Description:** Implement how researchers actually pay for datasets using HBAR.

**Tasks:**
- [ ] Create researcher wallet connection component
- [ ] Implement Hedera wallet integration (HashConnect, Blade Wallet, etc.)
- [ ] Add payment verification in purchase flow
- [ ] Verify HBAR transfer before granting dataset access
- [ ] Handle payment failures and retries
- [ ] Add payment confirmation UI

**Files to Create:**
- `frontend/src/components/wallet/HederaWalletConnect.tsx`
- `frontend/src/hooks/useHederaWallet.ts`
- `backend/src/services/payment-verification-service.js`

**API Endpoints:**
- `POST /api/researcher/payment/verify` - Verify HBAR payment
- `GET /api/researcher/payment/status/:transactionId` - Check payment status

## Priority 2: User Experience

### 4. Payment Method in Registration Forms
**Status:** Pending  
**Priority:** Medium  
**Description:** Add payment method selection to patient and hospital registration forms.

**Tasks:**
- [ ] Update patient registration form (`frontend/src/app/patient/register/page.tsx`)
- [ ] Add payment method selection (bank/mobile money)
- [ ] Add conditional fields based on payment method
- [ ] Add validation for payment method fields
- [ ] Update hospital registration form (`frontend/src/app/hospital/register/page.tsx`)
- [ ] Add same payment method fields
- [ ] Test registration flow with payment methods

**Files to Update:**
- `frontend/src/app/patient/register/page.tsx`
- `frontend/src/app/hospital/register/page.tsx`
- `frontend/src/lib/api/patient-identity.ts`
- `frontend/src/lib/api/hospital-identity.ts`

### 5. Payment Method Settings Page
**Status:** Pending  
**Priority:** Medium  
**Description:** Create a dedicated page for users to update their payment method settings.

**Tasks:**
- [ ] Create patient payment settings page (`frontend/src/app/patient/settings/payment/page.tsx`)
- [ ] Create hospital payment settings page (`frontend/src/app/hospital/settings/payment/page.tsx`)
- [ ] Add form to update payment method
- [ ] Add form to update withdrawal threshold
- [ ] Add toggle for auto-withdraw enabled/disabled
- [ ] Add validation and error handling
- [ ] Add success/error notifications

**Files to Create:**
- `frontend/src/app/patient/settings/payment/page.tsx`
- `frontend/src/app/hospital/settings/payment/page.tsx`

### 6. Withdrawal Notifications
**Status:** Pending  
**Priority:** Medium  
**Description:** Notify users when withdrawals are processed or fail.

**Tasks:**
- [ ] Add email notification service
- [ ] Send notification when withdrawal initiated
- [ ] Send notification when withdrawal completed
- [ ] Send notification when withdrawal failed
- [ ] Add in-app notifications (if notification system exists)
- [ ] Add SMS notifications for mobile money withdrawals (optional)

**Files to Create:**
- `backend/src/services/notification-service.js`
- `backend/src/services/email-service.js`

## Priority 3: Security & Admin

### 7. Encrypt Payment Data
**Status:** Pending  
**Priority:** High  
**Description:** Encrypt sensitive payment information (bank account numbers, mobile money numbers).

**Tasks:**
- [ ] Update `encryption-service.js` to handle payment data
- [ ] Encrypt bank account numbers before storing
- [ ] Encrypt mobile money numbers before storing
- [ ] Decrypt when needed for withdrawals
- [ ] Add encryption key rotation strategy
- [ ] Update database queries to handle encrypted data

**Files to Update:**
- `backend/src/services/encryption-service.js`
- `backend/src/db/patient-db.js`
- `backend/src/db/hospital-db.js`

### 8. Admin Withdrawal Dashboard
**Status:** Pending  
**Priority:** Medium  
**Description:** Create admin UI for managing pending withdrawals.

**Tasks:**
- [ ] Create admin withdrawals page (`frontend/src/app/admin/withdrawals/page.tsx`)
- [ ] Display pending withdrawals table
- [ ] Add filters (status, date range, user type)
- [ ] Add bulk actions (process multiple, mark as completed)
- [ ] Add manual withdrawal trigger button
- [ ] Show withdrawal statistics
- [ ] Add export functionality (CSV/Excel)

**Files to Create:**
- `frontend/src/app/admin/withdrawals/page.tsx`
- `frontend/src/components/admin/WithdrawalTable.tsx`
- `frontend/src/components/admin/WithdrawalStats.tsx`

### 9. Error Handling & Retry Logic
**Status:** Pending  
**Priority:** Medium  
**Description:** Improve error handling and add retry logic for failed withdrawals.

**Tasks:**
- [ ] Add retry mechanism for failed withdrawals
- [ ] Implement exponential backoff
- [ ] Add maximum retry limit
- [ ] Log all withdrawal errors
- [ ] Create error notification system for admins
- [ ] Add manual retry option in admin dashboard

**Files to Update:**
- `backend/src/services/withdrawal-service.js`
- `backend/src/services/automatic-withdrawal-job.js`

## Priority 4: Testing & Documentation

### 10. Integration Tests
**Status:** Pending  
**Priority:** Medium  
**Description:** Write comprehensive tests for wallet and withdrawal flows.

**Tasks:**
- [ ] Test balance querying
- [ ] Test withdrawal initiation
- [ ] Test automatic withdrawal job
- [ ] Test payment method updates
- [ ] Test withdrawal history
- [ ] Test error scenarios
- [ ] Test with mock Hedera accounts
- [ ] Test payment gateway integration (mock)

**Files to Create:**
- `backend/tests/integration/wallet.test.js`
- `backend/tests/integration/withdrawal.test.js`
- `frontend/src/test/wallet.test.ts`

### 11. Update Documentation
**Status:** Pending  
**Priority:** Low  
**Description:** Update frontend documentation to include wallet and payment features.

**Tasks:**
- [ ] Add wallet section to main docs page
- [ ] Create wallet usage guide
- [ ] Document payment method setup
- [ ] Document withdrawal process
- [ ] Add FAQ section
- [ ] Update API documentation

**Files to Update:**
- `frontend/src/app/docs/page.tsx`
- `frontend/src/app/docs/wallet/page.tsx` (create new)

## Implementation Order

1. **Week 1:** Payment Gateway Integration + Dynamic Exchange Rate
2. **Week 2:** Researcher Payment Flow + Payment Method in Registration
3. **Week 3:** Payment Settings Pages + Withdrawal Notifications
4. **Week 4:** Security (Encryption) + Admin Dashboard
5. **Week 5:** Testing + Documentation

## Notes

- All payment gateway integrations should support webhooks for status updates
- Exchange rate should be cached to avoid rate limiting
- Payment data encryption is critical for compliance (PCI-DSS, etc.)
- Admin dashboard should have audit logs for all withdrawal actions
- All user-facing features should have proper loading states and error messages

## Dependencies

- Payment Gateway API credentials
- HBAR Exchange Rate API access
- Hedera Wallet SDK (for researcher payments)
- Email service (SendGrid, AWS SES, etc.)
- Encryption key management system

