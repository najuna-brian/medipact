# Payment and Withdrawal System

## Overview

MediPact provides a seamless payment and withdrawal system where users never need to worry about Hedera accounts or wallets. The platform automatically creates and manages Hedera accounts, displays balances in USD (with HBAR shown below), and handles automatic withdrawals to bank accounts or mobile money.

## Key Features

### For Users (Patients & Hospitals)

1. **Automatic Wallet Creation**
   - Hedera accounts created automatically during registration (hospitals) or on first payment (patients)
   - Users never see or manage Hedera accounts directly
   - All wallet details stored securely by the platform

2. **Balance Display**
   - **Primary Display**: USD balance (e.g., $125.50)
   - **Secondary Display**: HBAR balance below USD (e.g., 784.3750 HBAR)
   - **Hedera Details**: Shown for users who want to use their wallet directly
     - Hedera Account ID (0.0.xxxxx)
     - EVM Address (0x...)

3. **Payment Method Selection**
   - Users choose payment method during registration:
     - **Bank Account**: Bank name + account number
     - **Mobile Money**: Provider (MTN, Airtel, etc.) + phone number
   - Can be updated later via API

4. **Automatic Withdrawals**
   - Funds automatically transferred when balance reaches threshold:
     - **Patients**: Default $10.00 (configurable)
     - **Hospitals**: Default $100.00 (configurable)
   - Users can enable/disable auto-withdraw
   - Admin can trigger monthly withdrawals for all users

5. **Manual Withdrawals**
   - Users can withdraw any amount at any time
   - Withdrawal goes to their configured payment method
   - Transaction history tracked

### For Researchers

1. **Payment Process**
   - Researchers purchase datasets using HBAR
   - Payment is verified before granting access
   - Revenue automatically distributed (60% patient, 25% hospital, 15% platform)

## Database Schema

### Payment Method Fields

**patient_identities & hospitals tables:**
- `payment_method`: 'bank' | 'mobile_money' | NULL
- `bank_account_number`: VARCHAR(255)
- `bank_name`: VARCHAR(255)
- `mobile_money_provider`: VARCHAR(50)
- `mobile_money_number`: VARCHAR(50)
- `withdrawal_threshold_usd`: DECIMAL(10, 2) DEFAULT 10.00 (patients) / 100.00 (hospitals)
- `auto_withdraw_enabled`: BOOLEAN DEFAULT true
- `last_withdrawal_at`: TIMESTAMP
- `total_withdrawn_usd`: DECIMAL(10, 2) DEFAULT 0.00

**withdrawal_history table:**
- `id`: SERIAL PRIMARY KEY
- `upi`: VARCHAR(64) (for patients)
- `hospital_id`: VARCHAR(32) (for hospitals)
- `user_type`: 'patient' | 'hospital'
- `amount_hbar`: DECIMAL(20, 8)
- `amount_usd`: DECIMAL(10, 2)
- `payment_method`: 'bank' | 'mobile_money'
- `destination_account`: VARCHAR(255)
- `transaction_id`: VARCHAR(100)
- `status`: 'pending' | 'processing' | 'completed' | 'failed'
- `processed_at`: TIMESTAMP
- `created_at`: TIMESTAMP

## API Endpoints

### Wallet Endpoints

#### Get Balance
- `GET /api/patient/:upi/wallet/balance` - Get patient wallet balance
- `GET /api/hospital/:hospitalId/wallet/balance` - Get hospital wallet balance

**Response:**
```json
{
  "balanceHBAR": 784.3750,
  "balanceUSD": 125.50,
  "hederaAccountId": "0.0.1234567",
  "evmAddress": "0x...",
  "paymentMethod": "bank",
  "bankName": "Bank of Uganda",
  "bankAccountNumber": "1234****5678",
  "withdrawalThresholdUSD": 10.00,
  "autoWithdrawEnabled": true,
  "lastWithdrawalAt": "2024-01-15T10:30:00Z",
  "totalWithdrawnUSD": 250.00
}
```

#### Initiate Withdrawal
- `POST /api/patient/:upi/wallet/withdraw` - Withdraw patient funds
- `POST /api/hospital/:hospitalId/wallet/withdraw` - Withdraw hospital funds

**Request:**
```json
{
  "amountUSD": 50.00  // Optional: if not provided, withdraws all
}
```

**Response:**
```json
{
  "withdrawalId": 123,
  "amountUSD": 50.00,
  "amountHBAR": 312.5,
  "paymentMethod": "bank",
  "destinationAccount": "1234****5678",
  "status": "processing",
  "message": "Withdrawal initiated. It will be processed shortly."
}
```

#### Withdrawal History
- `GET /api/patient/:upi/wallet/withdrawals` - Get patient withdrawal history
- `GET /api/hospital/:hospitalId/wallet/withdrawals` - Get hospital withdrawal history

### Payment Method Endpoints

#### Update Payment Method
- `PUT /api/patient/:upi/payment-method` - Update patient payment method
- `PUT /api/hospital/:hospitalId/payment-method` - Update hospital payment method

**Request (Bank):**
```json
{
  "paymentMethod": "bank",
  "bankAccountNumber": "1234567890",
  "bankName": "Bank of Uganda",
  "withdrawalThresholdUSD": 10.00,
  "autoWithdrawEnabled": true
}
```

**Request (Mobile Money):**
```json
{
  "paymentMethod": "mobile_money",
  "mobileMoneyProvider": "mtn",
  "mobileMoneyNumber": "+256701234567",
  "withdrawalThresholdUSD": 10.00,
  "autoWithdrawEnabled": true
}
```

### Admin Endpoints

#### Trigger Monthly Withdrawals
- `POST /api/admin/withdrawals/trigger-monthly` - Manually trigger withdrawals for all users

**Response:**
```json
{
  "message": "Monthly withdrawals initiated",
  "results": {
    "processed": 25,
    "skipped": 150,
    "errors": []
  }
}
```

#### Get Pending Withdrawals
- `GET /api/admin/withdrawals/pending` - Get all pending withdrawals

#### Complete Withdrawal
- `POST /api/admin/withdrawals/:withdrawalId/complete` - Mark withdrawal as completed (after processing payment)

**Request:**
```json
{
  "transactionId": "TXN-123456"  // Optional: external transaction ID
}
```

## Registration Flow

### Patient Registration

```json
POST /api/patient/register
{
  "name": "John Doe",
  "dateOfBirth": "1990-01-15",
  "phone": "+256701234567",
  "email": "john@example.com",
  "nationalId": "ID123456",
  // Optional payment method fields:
  "paymentMethod": "mobile_money",
  "mobileMoneyProvider": "mtn",
  "mobileMoneyNumber": "+256701234567",
  "withdrawalThresholdUSD": 10.00,
  "autoWithdrawEnabled": true
}
```

### Hospital Registration

```json
POST /api/hospital/register
{
  "name": "Kampala General Hospital",
  "country": "Uganda",
  "location": "Kampala",
  "contactEmail": "admin@hospital.com",
  // Optional payment method fields:
  "paymentMethod": "bank",
  "bankAccountNumber": "1234567890",
  "bankName": "Bank of Uganda",
  "withdrawalThresholdUSD": 100.00,
  "autoWithdrawEnabled": true
}
```

## Automatic Withdrawal Process

1. **Background Job**
   - Runs daily (configurable via `AUTOMATIC_WITHDRAWAL_INTERVAL_MINUTES`)
   - Checks all users with `auto_withdraw_enabled = true`
   - Compares balance to `withdrawal_threshold_usd`

2. **Withdrawal Initiation**
   - If balance >= threshold:
     - Creates withdrawal record (status: 'pending')
     - Updates status to 'processing'
     - Queues for payment gateway processing

3. **Payment Processing**
   - Admin processes withdrawals via payment gateway
   - Updates withdrawal status to 'completed' or 'failed'
   - Updates user's `last_withdrawal_at` and `total_withdrawn_usd`

4. **Manual Trigger**
   - Admin can trigger withdrawals manually via API
   - Useful for monthly bulk processing

## Frontend Implementation

### Wallet Display

**Patient Wallet Page** (`/patient/wallet`):
- Shows USD balance prominently
- Shows HBAR balance below USD
- Displays Hedera account details (for users who want to use wallet)
- Shows payment method configuration
- Withdrawal form (if payment method configured)
- Withdrawal history

**Hospital Wallet Page** (`/hospital/wallet`):
- Same as patient wallet, but for hospitals

### Dashboard Integration

**Patient Dashboard**:
- Total Earnings card shows USD (primary) and HBAR (secondary)
- Links to full wallet page

## Payment Gateway Integration

The withdrawal service creates withdrawal records with status 'processing'. In production, you would:

1. **Integrate Payment Gateway** (e.g., Flutterwave, Paystack):
   - Convert HBAR to fiat currency
   - Send to bank account or mobile money
   - Get transaction ID

2. **Update Withdrawal Status**:
   - Call `POST /api/admin/withdrawals/:withdrawalId/complete`
   - Include transaction ID from payment gateway

3. **Error Handling**:
   - If payment fails, update status to 'failed'
   - User can retry withdrawal

## Configuration

### Environment Variables

```env
# Automatic withdrawal job
AUTOMATIC_WITHDRAWAL_ENABLED=true  # Set to 'false' to disable
AUTOMATIC_WITHDRAWAL_INTERVAL_MINUTES=1440  # Default: daily (1440 minutes)

# HBAR to USD conversion rate
HBAR_TO_USD_RATE=0.16  # Current rate (update as needed)
```

## Security Considerations

1. **Account Management**
   - Platform manages all Hedera accounts
   - Private keys encrypted with AES-256-GCM
   - Users never see private keys

2. **Payment Method Storage**
   - Bank account numbers and mobile money numbers stored in database
   - Should be encrypted in production
   - Displayed masked in UI (e.g., "1234****5678")

3. **Withdrawal Verification**
   - Admin must verify and complete withdrawals
   - Transaction IDs tracked for audit
   - Failed withdrawals can be retried

## Testing

### Test Balance Query
```bash
curl http://localhost:3002/api/patient/UPI-ABC123/wallet/balance
```

### Test Withdrawal
```bash
curl -X POST http://localhost:3002/api/patient/UPI-ABC123/wallet/withdraw \
  -H "Content-Type: application/json" \
  -d '{"amountUSD": 10.00}'
```

### Test Admin Trigger
```bash
curl -X POST http://localhost:3002/api/admin/withdrawals/trigger-monthly \
  -H "Authorization: Bearer <admin-token>"
```

## Summary

✅ **Automatic wallet creation** - Users never worry about Hedera accounts  
✅ **USD primary display** - All balances shown in USD  
✅ **HBAR secondary display** - HBAR shown below USD  
✅ **Hedera details available** - For users who want to use their wallet  
✅ **Payment method selection** - During registration or later  
✅ **Automatic withdrawals** - When threshold reached  
✅ **Manual withdrawals** - Anytime via UI or API  
✅ **Admin triggers** - Monthly bulk processing  
✅ **Transaction history** - Complete audit trail  

The system is designed to be user-friendly while maintaining full transparency and control.

