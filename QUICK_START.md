# MediPact Quick Start Guide

Get up and running with MediPact in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Hedera testnet account (get free at https://portal.hedera.com/dashboard)
- Git

## Quick Setup (5 Steps)

### 1. Clone Repository

```bash
git clone git@github.com:najuna-brian/medipact.git
cd medipact
```

### 2. Install Dependencies

```bash
cd adapter
npm install
```

### 3. Configure Environment

Create `.env` file in `adapter/` directory:

```env
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"
```

Get your credentials from: https://portal.hedera.com/dashboard

### 4. Run the Adapter

```bash
npm start
```

### 5. Verify Results

```bash
# Check anonymized output
cat data/anonymized_data.csv

# Validate output
npm run validate

# Visit HashScan links from console output
```

## What Happens

1. **Reads** `data/raw_data.csv` (10 sample records)
2. **Anonymizes** data (removes PII, generates PID-001, PID-002, etc.)
3. **Creates** HCS topics (Consent Proofs, Data Proofs)
4. **Submits** proof hashes to Hedera
5. **Displays** HashScan links (click to verify on-chain)
6. **Shows** payout simulation (USD + optional local currency)

## Verify on HashScan

1. Copy any HashScan link from console output
2. Open in browser
3. Verify transaction status is "SUCCESS"
4. Check topic pages to see messages

## Optional: Local Currency

Add to `.env` to show local currency:

```env
LOCAL_CURRENCY_CODE="UGX"
USD_TO_LOCAL_RATE="3700"
```

## Troubleshooting

**Error**: "OPERATOR_ID, HEDERA_NETWORK, and OPERATOR_KEY are required"
- Solution: Create `.env` file with credentials using standard variable names

**Error**: "Transaction failed"
- Solution: Check account has HBAR balance (get free HBAR from faucet)

**Error**: "Error parsing CSV"
- Solution: Check `raw_data.csv` format is correct

## Next Steps

- Read `adapter/SETUP.md` for detailed setup
- Read `adapter/TESTING.md` for testing guide
- Read `docs/DEMO_SCRIPT.md` for demo video script
- Check `PROJECT_STATUS.md` for current status

## Support

- Issues: GitHub Issues
- Documentation: See `docs/` directory
- Setup Help: See `adapter/SETUP.md`

---

**Ready to demo?** Follow `docs/DEMO_SCRIPT.md` to record your demo video!

