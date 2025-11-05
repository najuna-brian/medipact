# Adapter Setup Guide

## Quick Setup

### 1. Install Dependencies

```bash
cd adapter
npm install
```

### 2. Create `.env` File

Create a `.env` file in the `adapter/` directory with your Hedera testnet credentials:

```env
# Required: Operator account ID (the account that pays for transactions)
OPERATOR_ID="0.0.7156417"

# Required: Operator private key (ECDSA format, HEX encoded)
OPERATOR_KEY="0x519669071785c63d0938f89eacd4632332ec152eafcecacb984c8a89f72f85c7"

# Required: Network to connect to (mainnet, testnet, previewnet, localhost)
HEDERA_NETWORK="testnet"

# Optional: Local Currency Configuration
# Set these to display revenue in local currency (e.g., UGX, KES, TZS)
# LOCAL_CURRENCY_CODE="UGX"
# USD_TO_LOCAL_RATE="3700"
```

**Note**: The `.env` file is gitignored and will not be committed to the repository.

**Currency Configuration:**
- USD is the default and primary currency for all conversions
- Local currency is optional and configurable via environment variables
- Set `LOCAL_CURRENCY_CODE` (ISO 4217 code) and `USD_TO_LOCAL_RATE` to enable local currency display
- Example: For Ugandan Shilling, set `LOCAL_CURRENCY_CODE="UGX"` and `USD_TO_LOCAL_RATE="3700"`

### 3. Test HCS Integration

```bash
npm run test:hcs
```

This will:
- Create a test topic
- Submit a test message
- Display HashScan links

### 4. Run the Adapter

```bash
npm start
```

This will:
- Read `raw_data.csv`
- Anonymize all patient data
- Create HCS topics
- Submit consent and data proofs
- Display HashScan links
- Show payout simulation

### 5. Validate Output (Optional)

After running the adapter, validate the anonymized output:

```bash
npm run validate
```

This checks:
- No PII is present
- Anonymous IDs are correctly formatted
- Medical data is preserved
- Record counts match

## Account Information

See `ACCOUNT_INFO.md` for account details.

---

**Security**: Never commit `.env` files or private keys to git!

