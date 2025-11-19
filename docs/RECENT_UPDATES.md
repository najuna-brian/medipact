# Recent Updates - November 2025

## 🚀 Latest Features & Fixes

### Testnet Account Funding System

**Date**: November 19, 2025

#### Automatic Funding
- New researcher accounts can be automatically funded on registration
- Configurable via environment variables:
  - `AUTO_FUND_TESTNET_ACCOUNTS=true` - Enable auto-funding
  - `TESTNET_FUNDING_AMOUNT_HBAR=100` - Amount to fund (default: 100 HBAR)
- Only works on testnet/previewnet (disabled on mainnet for security)
- Uses operator account to transfer HBAR

#### Manual Funding Script
- **Script**: `backend/scripts/fund-existing-accounts.js`
- **Command**: `npm run fund-accounts`
- **Features**:
  - Fund all researcher accounts at once
  - Fund specific researcher by ID
  - Customizable funding amount and minimum balance threshold
  - Automatically skips accounts with sufficient balance
  - Shows transaction IDs and HashScan links for verification

**Usage Examples**:
```bash
# Fund all accounts with low balance
npm run fund-accounts

# Fund specific researcher
npm run fund-accounts -- --researcher-id=RES-XXXXX

# Custom amount
npm run fund-accounts -- --amount=200 --min-balance=50
```

#### Admin API Endpoints
- `POST /api/admin/fund-account` - Manually fund a specific account
- `GET /api/admin/account-balance/:accountId` - Check account balance
- `POST /api/admin/fund-if-low` - Fund account if balance is below threshold

**Example**:
```bash
curl -X POST https://your-api.com/api/admin/fund-account \
  -H "Content-Type: application/json" \
  -d '{"accountId": "0.0.xxxxx", "amountHBAR": 100}'
```

### Bug Fixes

#### Wallet Balance 401 Error (Fixed)
- **Issue**: Researcher wallet balance endpoint returned 401 Unauthorized
- **Cause**: Duplicate route in `researcher-api.js` conflicting with `wallet-api.js`
- **Fix**: Removed duplicate route from `researcher-api.js`
- **Result**: Wallet balance endpoint now accessible without authentication

#### SQL Error in Metrics Service (Fixed)
- **Issue**: `getMonthlyActiveHederaAccounts` query failed with "column pt.researcher_id does not exist"
- **Cause**: Incorrect table joins in PostgreSQL query
- **Fix**: Corrected query to properly join `purchases`, `researchers`, `datasets`, `fhir_patients`, `patient_identities`, and `hospitals` tables
- **Result**: Metrics now accurately track monthly active Hedera accounts

#### Account Balance Query (Fixed)
- **Issue**: `client.getAccountInfo is not a function` error
- **Cause**: Using deprecated/non-existent method
- **Fix**: Changed to use `AccountBalanceQuery` from Hedera SDK
- **Result**: Balance checking works correctly for all account types

### Documentation Updates

- **TESTNET_FUNDING_GUIDE.md**: Complete guide for automatic and manual funding
- **IMPLEMENTATION_SUMMARY.md**: Updated with new features and fixes
- **README.md**: Added testnet funding section and updated feature list

### Testing Results

**Funding Script Test** (November 19, 2025):
- ✅ Successfully funded 8 out of 9 researcher accounts
- ✅ Each account received 100 HBAR
- ✅ Transaction IDs and HashScan links generated correctly
- ⚠️ 1 account failed due to operator account insufficient balance (expected)
- ✅ Script correctly skips accounts with sufficient balance

### Next Steps

1. **Fund Operator Account**: Add more HBAR to operator account to fund remaining accounts
2. **Enable Auto-Funding**: Set `AUTO_FUND_TESTNET_ACCOUNTS=true` in production for new accounts
3. **Monitor Usage**: Track funding usage and adjust amounts as needed

---

## 📝 Technical Details

### Files Modified
- `backend/src/services/testnet-funding-service.js` - New funding service
- `backend/src/routes/admin-api.js` - Added funding endpoints
- `backend/src/routes/researcher-api.js` - Removed duplicate wallet route
- `backend/src/routes/wallet-api.js` - Wallet balance endpoint
- `backend/src/services/hedera-metrics-service.js` - Fixed SQL query
- `backend/scripts/fund-existing-accounts.js` - New funding script
- `env.example` - Added funding environment variables

### Dependencies
- `@hashgraph/sdk` - Hedera SDK for account operations
- Uses `AccountBalanceQuery` for balance checking
- Uses `TransferTransaction` for HBAR transfers

### Security Notes
- Auto-funding only works on testnet/previewnet
- Mainnet funding is disabled for security
- Manual funding requires admin authentication
- All transactions are logged with transaction IDs

---

**Last Updated**: November 19, 2025

