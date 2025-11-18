# MediPact MVP Configuration Guide

This document outlines the MVP (Minimum Viable Product) configuration for MediPact, focusing on manual processes and testnet deployment suitable for demos and limited beta testing.

## Overview

The MVP configuration uses:
- ✅ **Manual withdrawal processing** - Admin completes withdrawals manually
- ✅ **Testnet Hedera accounts** - Safe for testing, no real money
- ✅ **In-app notifications** - Console logging instead of email/SMS
- ✅ **Basic authentication** - Functional but not production-hardened

## Configuration

### 1. Hedera Network (Testnet)

**Environment Variables:**
```env
HEDERA_NETWORK=testnet
NODE_ENV=development  # or production (but with testnet)
```

**Why Testnet:**
- Free to use (no real HBAR costs)
- Safe for testing and demos
- All transactions are public and verifiable
- Can switch to mainnet later without code changes

**Setup:**
1. Get free testnet account at: https://portal.hedera.com/dashboard
2. Set `OPERATOR_ID` and `OPERATOR_KEY` in `.env`
3. Ensure `HEDERA_NETWORK=testnet` is set

### 2. Manual Withdrawal Processing

**How It Works:**
1. Users request withdrawals via API/UI
2. Withdrawals are created with status `'processing'`
3. Admin views pending withdrawals in admin dashboard
4. Admin processes payment manually (via payment gateway or bank transfer)
5. Admin marks withdrawal as `'completed'` via API

**Configuration:**
```env
# Optional: Disable automatic withdrawal job (recommended for MVP)
AUTOMATIC_WITHDRAWAL_ENABLED=false

# Or keep it enabled but withdrawals still require manual completion
AUTOMATIC_WITHDRAWAL_ENABLED=true
AUTOMATIC_WITHDRAWAL_INTERVAL_MINUTES=1440  # Daily check
```

**Admin Workflow:**
1. Navigate to `/admin/withdrawals`
2. View pending withdrawals
3. Process payment externally (bank transfer, mobile money, etc.)
4. Click "Complete Withdrawal" and enter transaction ID
5. System updates withdrawal status and user balance

**API Endpoints:**
- `GET /api/admin/withdrawals/pending` - List pending withdrawals
- `POST /api/admin/withdrawals/:id/complete` - Mark withdrawal as completed

### 3. In-App Notifications (No Email/SMS)

**Current Behavior:**
- All notifications are logged to console
- Notifications can be displayed in user/admin dashboards
- Email/SMS services are stubbed out (not called)

**What's Logged:**
- Withdrawal status changes (pending, processing, completed, failed)
- Balance threshold reached notifications
- Temporary access requests
- Patient preference changes

**Future Enhancement:**
- Store notifications in database
- Display in user notification center
- Add email/SMS integration for production

**Configuration:**
No configuration needed - this is the default MVP behavior.

### 4. Basic Authentication

**Current Setup:**
- **Admin Auth**: Temporarily bypassed (always authenticated)
- **Hospital Auth**: API key authentication (working)
- **Researcher Auth**: API key authentication (working)
- **Patient Auth**: UPI-based (working)

**Admin Authentication:**
```javascript
// Currently bypassed for MVP
// File: backend/src/routes/admin-api.js
async function authenticateAdmin(req, res, next) {
  // MVP: Always authenticated
  req.admin = { id: 1, username: 'admin', role: 'admin' };
  return next();
}
```

**For Production:**
- Implement proper JWT authentication
- Add password hashing (bcrypt already in place)
- Add session management
- Add role-based access control

**Configuration:**
No special configuration needed for MVP - admin endpoints are accessible.

## Environment Variables Summary

### Required for MVP

```env
# Hedera Configuration
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"

# Server
PORT=8080
NODE_ENV="development"

# Database
DATABASE_PATH="./data/medipact.db"  # SQLite for MVP

# Security
JWT_SECRET="your-secret-key-minimum-32-characters"
ENCRYPTION_KEY="your-32-byte-hex-encryption-key"
```

### Optional for MVP

```env
# Withdrawal Configuration
AUTOMATIC_WITHDRAWAL_ENABLED="false"  # Disable for full manual control
AUTOMATIC_WITHDRAWAL_INTERVAL_MINUTES=1440

# Exchange Rate
EXCHANGE_RATE_UPDATE_INTERVAL_MINUTES=5
EXCHANGE_RATE_FALLBACK=0.16  # HBAR to USD

# Frontend
FRONTEND_URL="http://localhost:3000"
```

## Testing the MVP Configuration

### 1. Test Withdrawal Flow

```bash
# 1. User requests withdrawal
curl -X POST http://localhost:8080/api/patient/UPI-XXX/wallet/withdraw \
  -H "Content-Type: application/json" \
  -d '{"amountUSD": 10.00}'

# 2. Admin views pending withdrawals
curl http://localhost:8080/api/admin/withdrawals/pending

# 3. Admin completes withdrawal (after processing payment)
curl -X POST http://localhost:8080/api/admin/withdrawals/123/complete \
  -H "Content-Type: application/json" \
  -d '{"transactionId": "TXN-123456"}'
```

### 2. Test Notifications

Notifications are logged to console. Check server logs for:
```
[NOTIFICATION] PATIENT UPI-XXX: Withdrawal Request Received
[NOTIFICATION] Message: Your withdrawal request of $10.00...
```

### 3. Test Testnet Integration

```bash
# Check Hedera network in server logs
# Should see: "Hedera network: testnet"
```

## Limitations & Future Enhancements

### Current Limitations (MVP)

1. **No Email/SMS**: Notifications are logged only
2. **Manual Withdrawals**: Admin must process each withdrawal
3. **Basic Auth**: Admin authentication is bypassed
4. **Testnet Only**: Using testnet (not mainnet)

### Production Enhancements Needed

1. **Payment Gateway Integration**
   - Integrate with Flutterwave, Paystack, etc.
   - Automatic bank/mobile money transfers
   - Webhook support for status updates

2. **Email/SMS Services**
   - SendGrid, AWS SES for email
   - Twilio, AWS SNS for SMS
   - Notification preferences per user

3. **Authentication Hardening**
   - Proper JWT authentication
   - Session management
   - Password reset flows
   - Two-factor authentication

4. **Mainnet Migration**
   - Switch `HEDERA_NETWORK=mainnet`
   - Update operator account
   - Redeploy smart contracts
   - Update frontend configuration

## Admin Dashboard Features

### Withdrawal Management

**Location**: `/admin/withdrawals`

**Features:**
- View all pending withdrawals
- Filter by user type (patient/hospital)
- Filter by status
- Complete withdrawals manually
- View withdrawal history
- Export withdrawal reports

**Workflow:**
1. View pending withdrawals
2. Process payment externally
3. Mark as completed with transaction ID
4. System updates user balance automatically

## Troubleshooting

### Withdrawals Not Processing

**Issue**: Withdrawals stuck in 'processing' status

**Solution**: 
- Check admin dashboard for pending withdrawals
- Complete manually via API or UI
- Verify payment was actually processed

### Notifications Not Appearing

**Issue**: Users not receiving notifications

**Solution**:
- Check server console logs
- Notifications are logged, not sent via email/SMS in MVP
- Display notifications in-app via notification center (future)

### Authentication Issues

**Issue**: Cannot access admin endpoints

**Solution**:
- Admin auth is bypassed in MVP - should always work
- Check if middleware is properly applied
- Verify route registration

## Migration to Production

When ready to move to production:

1. **Enable Email/SMS**
   - Update `notification-service.js`
   - Add service credentials to `.env`
   - Test notification delivery

2. **Integrate Payment Gateway**
   - Update `withdrawal-service.js`
   - Add payment gateway credentials
   - Test withdrawal flow end-to-end

3. **Enable Proper Authentication**
   - Update `admin-api.js` authentication
   - Add JWT token generation
   - Test all protected endpoints

4. **Switch to Mainnet**
   - Update `HEDERA_NETWORK=mainnet`
   - Fund operator account with real HBAR
   - Redeploy smart contracts
   - Update frontend configuration

## Support

For issues or questions:
- Check server logs for detailed error messages
- Review API documentation at `/api-docs`
- See main README.md for general setup

---

**Last Updated**: 2024-12-19
**Status**: MVP Ready ✅

