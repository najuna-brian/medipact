# Testnet Account Funding Guide

## 🚀 Automatic Funding (NEW!)

**You can now automatically fund accounts without going to the faucet!**

### Enable Auto-Funding

1. **Set Environment Variable**:
   ```bash
   AUTO_FUND_TESTNET_ACCOUNTS=true
   TESTNET_FUNDING_AMOUNT_HBAR=1000
   ```

2. **How It Works**:
   - When a researcher registers, their account is automatically funded
   - No manual faucet visit needed
   - Only works on testnet/previewnet (disabled on mainnet for security)
   - Uses operator account to transfer HBAR

3. **For Production Deployment**:
   - Add to Railway/Vercel environment variables
   - Set `AUTO_FUND_TESTNET_ACCOUNTS=true`
   - Set `TESTNET_FUNDING_AMOUNT_HBAR=1000` (or desired amount)

### Manual Funding via Admin API

You can also manually fund accounts via the admin API:

```bash
# Fund a specific account
curl -X POST https://medipact-production.up.railway.app/api/admin/fund-account \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "0.0.xxxxx",
    "amountHBAR": 1000
  }'

# Check account balance
curl https://medipact-production.up.railway.app/api/admin/account-balance/0.0.xxxxx

# Fund if balance is low
curl -X POST https://medipact-production.up.railway.app/api/admin/fund-if-low \
  -H "Content-Type: application/json" \
  -d '{
    "accountId": "0.0.xxxxx",
    "minBalanceHBAR": 10,
    "fundingAmountHBAR": 1000
  }'
```

---

## How Users Pay for Data

### Payment Flow
1. **Researcher registers** → Hedera account is automatically created
2. **Researcher funds their account** → Transfer HBAR to their Hedera Account ID
3. **Researcher purchases dataset** → Payment is deducted from their account balance
4. **Revenue is distributed** → 60% to patients, 25% to hospitals, 15% to platform

### Where Users Pay From
Users pay from their **Hedera accounts** that are automatically created during registration:
- **Patients**: Hedera account created on registration
- **Hospitals**: Hedera account created on registration  
- **Researchers**: Hedera account created on registration

All accounts are **EVM-compatible** and can receive HBAR directly.

---

## Funding Testnet Accounts

### For Researchers (Testnet)

#### Option 1: Hedera Portal Faucet (Recommended)
1. **Get Account ID**: 
   - Log in to researcher dashboard
   - Go to `/researcher/wallet`
   - Copy the Hedera Account ID (format: `0.0.xxxxx`)

2. **Request Test HBAR**:
   - Click "Get Free Test HBAR from Faucet" button (opens automatically)
   - Or visit: https://portal.hedera.com/faucet
   - Enter your Account ID: `0.0.xxxxx`
   - Click "Request HBAR"
   - You can request up to **10,000 HBAR** per request

3. **Verify Balance**:
   - Refresh wallet page
   - Balance should update within a few seconds
   - Check on HashScan: `https://hashscan.io/testnet/account/0.0.xxxxx`

#### Option 2: HashPack Wallet (Testnet)
1. **Install HashPack**: https://www.hashpack.app/
2. **Create/Import Wallet**: Use testnet network
3. **Get Test HBAR**: Use HashPack's built-in faucet
4. **Transfer to Account**: Send HBAR to researcher's Account ID

#### Option 3: Blade Wallet (Testnet)
1. **Install Blade**: https://blade.hedera.com/
2. **Create/Import Wallet**: Use testnet network
3. **Get Test HBAR**: Use Blade's faucet
4. **Transfer to Account**: Send HBAR to researcher's Account ID

---

## Funding Accounts for Demo/Testing

### Automated Funding Script (Future)
We can create a script that automatically funds test accounts, but for now, manual funding is required.

### Manual Funding Steps

1. **Get All Account IDs**:
   ```bash
   # Query database for researcher accounts
   # Or check admin dashboard
   ```

2. **Fund Each Account**:
   - Use Hedera Portal Faucet
   - Or transfer from a funded testnet account
   - Recommended: 100-1000 HBAR per account for testing

3. **Verify Funding**:
   ```bash
   # Check account balance via API
   curl https://medipact-production.up.railway.app/api/researcher/RES-XXXXX/wallet/balance
   ```

---

## Testnet HBAR Sources

### 1. Hedera Portal Faucet (Primary)
- **URL**: https://portal.hedera.com/faucet
- **Limit**: 10,000 HBAR per request
- **Frequency**: Can request multiple times
- **Network**: Testnet only

### 2. HashPack Wallet Faucet
- **Built-in**: HashPack has a faucet feature
- **Limit**: Varies
- **Network**: Testnet only

### 3. Blade Wallet Faucet
- **Built-in**: Blade has a faucet feature
- **Limit**: Varies
- **Network**: Testnet only

### 4. Transfer from Another Account
- If you have a funded testnet account, you can transfer HBAR
- Use HashPack, Blade, or Hedera SDK
- No limits (except account balance)

---

## Checking Account Balance

### Via Frontend
1. Log in as researcher
2. Navigate to `/researcher/wallet`
3. Balance is displayed automatically

### Via API
```bash
curl https://medipact-production.up.railway.app/api/researcher/RES-XXXXX/wallet/balance
```

### Via HashScan
1. Go to: https://hashscan.io/testnet
2. Search for Account ID: `0.0.xxxxx`
3. View balance and transaction history

---

## Payment Process

### When Researcher Purchases Data

1. **Researcher selects dataset** → Sees price in USD and HBAR
2. **Researcher confirms purchase** → System creates payment request
3. **Researcher sends HBAR** → Transfers HBAR to platform account
4. **Researcher provides transaction ID** → System verifies payment
5. **Payment verified** → Dataset access granted
6. **Revenue distributed** → 60/25/15 split via smart contract

### Payment Verification
- System verifies HBAR transaction on Hedera network
- Transaction must be from researcher's account
- Amount must match purchase price
- Transaction must be confirmed on Hedera

---

## Troubleshooting

### Account Has No Balance
1. **Check Account ID**: Verify the account ID is correct
2. **Request from Faucet**: Use Hedera Portal Faucet
3. **Wait for Confirmation**: HBAR may take a few seconds to appear
4. **Check HashScan**: Verify transaction on HashScan

### Payment Fails
1. **Check Balance**: Ensure account has sufficient HBAR
2. **Check Transaction**: Verify transaction ID is correct
3. **Check Network**: Ensure you're on testnet (not mainnet)
4. **Check Amount**: Ensure payment amount matches purchase price

### Account Not Found
1. **Verify Registration**: Ensure researcher is registered
2. **Check Account Creation**: Account should be created automatically
3. **Contact Support**: If account wasn't created, contact admin

---

## Best Practices for Testing

### For Demo/Testing
1. **Fund Test Accounts**: Give each test researcher 1000+ HBAR
2. **Document Account IDs**: Keep a list of test account IDs
3. **Monitor Balances**: Check balances before demo
4. **Have Backup**: Keep a funded account for emergency funding

### For Production (Mainnet)
1. **Users Fund Themselves**: Users transfer HBAR from their own wallets
2. **No Faucet**: Mainnet has no free HBAR
3. **Real Money**: Mainnet uses real HBAR (has value)
4. **Secure**: Users manage their own private keys

---

## Quick Reference

### Hedera Portal Faucet
- **URL**: https://portal.hedera.com/faucet
- **Limit**: 10,000 HBAR per request
- **Network**: Testnet only

### HashScan (Testnet)
- **URL**: https://hashscan.io/testnet
- **Use**: View accounts, transactions, balances

### Account ID Format
- **Format**: `0.0.xxxxx`
- **Example**: `0.0.7283821`
- **EVM Address**: Also available (format: `0x...`)

---

## Summary

**Users pay from their Hedera accounts** that are automatically created during registration. On testnet, users can get free HBAR from the Hedera Portal Faucet. The payment flow is:

1. Register → Account created
2. Fund account → Get testnet HBAR from faucet
3. Purchase data → HBAR deducted from account
4. Revenue distributed → Via smart contract

**For hackathon demo**: Fund test accounts with 1000+ HBAR each using the Hedera Portal Faucet.

---

**Last Updated**: November 19, 2025

