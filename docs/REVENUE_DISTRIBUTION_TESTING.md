# Revenue Distribution Testing Guide

## Overview

This document describes how to test the revenue distribution system on Hedera testnet. The system distributes revenue from data sales using Hedera Account IDs with a 60/25/15 split (patient/hospital/platform).

## Test Results

### ✅ Successful Test (November 9, 2025)

**Transaction Details:**
- **Transaction ID**: `0.0.7156417@1762677744.423434172`
- **Method**: Direct HBAR transfers
- **Total Amount**: 1 HBAR
- **Network**: Hedera Testnet

**Revenue Split:**
- **Patient (60%)**: 0.6 HBAR → Account `0.0.7222388`
- **Hospital (25%)**: 0.25 HBAR → Account `0.0.7222392`
- **Platform (15%)**: 0.15 HBAR → Operator Account `0.0.7156417`

**HashScan Link:**
https://hashscan.io/testnet/transaction/0.0.7156417@1762677744.423434172

## Prerequisites

1. **Hedera Testnet Credentials** in `backend/.env`:
   ```env
   OPERATOR_ID=0.0.xxxxx
   OPERATOR_KEY=0x...
   HEDERA_NETWORK=testnet
   ```

2. **Test Accounts**:
   - At least one patient with Hedera Account ID
   - At least one hospital with Hedera Account ID

3. **Operator Account Balance**:
   - Must have sufficient HBAR to cover transfers
   - Testnet HBAR can be obtained from https://portal.hedera.com

## Testing Methods

### 1. Direct Script Test

Test revenue distribution using the Node.js script:

```bash
cd backend
node scripts/test-revenue-distribution.js
```

**Expected Output:**
```
✅ Revenue Distribution Successful!
📊 Distribution Result:
   Method: direct
   Transaction ID: 0.0.xxxxx@...
   Transfers:
     Patient (0.0.xxxxx): 0.6 ℏ
     Hospital (0.0.xxxxx): 0.25 ℏ
     Platform (0.0.xxxxx): 0.15 ℏ
```

### 2. API Endpoint Test

Test via the REST API:

```bash
./scripts/test-revenue-api.sh
```

Or manually:

```bash
curl -X POST http://localhost:3002/api/revenue/distribute \
  -H "Content-Type: application/json" \
  -d '{
    "patientUPI": "UPI-XXX",
    "hospitalId": "HOSP-XXX",
    "totalAmount": 100000000
  }'
```

**Response:**
```json
{
  "success": true,
  "patientUPI": "UPI-XXX",
  "hospitalId": "HOSP-XXX",
  "patientAccountId": "0.0.xxxxx",
  "hospitalAccountId": "0.0.xxxxx",
  "distribution": {
    "method": "direct",
    "transactionId": "0.0.xxxxx@...",
    "transfers": {
      "patient": {
        "accountId": "0.0.xxxxx",
        "amount": "0.6 ℏ"
      },
      "hospital": {
        "accountId": "0.0.xxxxx",
        "amount": "0.25 ℏ"
      },
      "platform": {
        "accountId": "0.0.xxxxx",
        "amount": "0.15 ℏ"
      }
    }
  }
}
```

### 3. Bulk Revenue Distribution

Test distributing revenue for multiple sales:

```bash
cd backend
node scripts/test-bulk-revenue.js
```

## Revenue Split Calculation

The system uses a fixed 60/25/15 split:

- **Patient**: 60% of total revenue
- **Hospital**: 25% of total revenue
- **Platform**: 15% of total revenue (stays with operator account)

### Example Calculation

For 1 HBAR (100,000,000 tinybars):
- Patient: 60,000,000 tinybars (0.6 HBAR)
- Hospital: 25,000,000 tinybars (0.25 HBAR)
- Platform: 15,000,000 tinybars (0.15 HBAR)

## How It Works

1. **Account ID Retrieval**: System retrieves Hedera Account IDs from database
2. **Amount Calculation**: Calculates 60/25/15 split in tinybars
3. **Transfer Transaction**: Creates Hedera TransferTransaction
4. **Execution**: Executes transaction on Hedera network
5. **Verification**: Transaction receipt confirms success

## Transaction Flow

```
Operator Account (0.0.xxxxx)
    ↓ -0.85 HBAR (patient + hospital)
    ├─→ Patient Account (0.0.xxxxx) +0.6 HBAR
    └─→ Hospital Account (0.0.xxxxx) +0.25 HBAR
    
Platform Amount (0.15 HBAR) stays with operator
```

## Verification

### Check Transaction on HashScan

1. Copy transaction ID from test output
2. Visit: `https://hashscan.io/testnet/transaction/{transactionId}`
3. Verify:
   - Transaction status: Success
   - Transfers match expected amounts
   - Account balances updated correctly

### Check Account Balances

Use HashScan to verify account balances:
- Patient account: `https://hashscan.io/testnet/account/{patientAccountId}`
- Hospital account: `https://hashscan.io/testnet/account/{hospitalAccountId}`

## Error Handling

### Common Errors

1. **INVALID_ACCOUNT_AMOUNTS**
   - **Cause**: Transfer amounts don't balance
   - **Fix**: Ensure outgoing = incoming amounts

2. **INSUFFICIENT_ACCOUNT_BALANCE**
   - **Cause**: Operator account doesn't have enough HBAR
   - **Fix**: Add HBAR to operator account on testnet

3. **INVALID_ACCOUNT_ID**
   - **Cause**: Account ID doesn't exist
   - **Fix**: Verify accounts exist and have Hedera Account IDs

## Integration with Adapter

The revenue distribution can be called from the adapter after data processing:

```javascript
import { distributeRevenueFromSale } from './services/adapter-integration-service.js';

// After data sale
await distributeRevenueFromSale({
  patientUPI: 'UPI-XXX',
  hospitalId: 'HOSP-XXX',
  totalAmount: 100000000, // in tinybars
  revenueSplitterAddress: process.env.REVENUE_SPLITTER_ADDRESS || null
});
```

## Future Enhancements

1. **RevenueSplitter Contract**: Use smart contract for automatic distribution
2. **Platform Account**: Dedicated platform account instead of operator
3. **Bulk Optimization**: Batch multiple transfers in single transaction
4. **Fee Calculation**: Account for transaction fees in split
5. **Real-time Notifications**: Notify users when revenue is distributed

## Security Considerations

- ✅ All transfers are on-chain and immutable
- ✅ Account IDs are verified before transfer
- ✅ Amounts are calculated precisely to prevent rounding errors
- ✅ Transaction receipts confirm success
- ⚠️ Operator account must be secured (private key encryption)
- ⚠️ Testnet vs Mainnet: Use testnet for testing only

## Test Checklist

- [ ] Operator account has sufficient HBAR
- [ ] Patient has Hedera Account ID
- [ ] Hospital has Hedera Account ID
- [ ] Test with 1 HBAR (small amount)
- [ ] Verify transaction on HashScan
- [ ] Check account balances
- [ ] Test API endpoint
- [ ] Test bulk distribution
- [ ] Verify split accuracy (60/25/15)

