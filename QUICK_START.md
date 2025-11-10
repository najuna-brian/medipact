# MediPact Quick Start Guide

Get up and running with MediPact in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Hedera testnet account (get free at https://portal.hedera.com/dashboard)
- Git

## Quick Setup (Full Stack)

### 1. Clone Repository

```bash
git clone git@github.com:najuna-brian/medipact.git
cd medipact
```

### 2. Install Dependencies

```bash
# Install adapter dependencies
cd adapter
npm install

# Install backend dependencies
cd ../backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install contract dependencies (optional, for smart contract deployment)
cd ../contracts
npm install
```

### 3. Configure Environment

#### Adapter Configuration
Create `.env` file in `adapter/` directory:

```env
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"
```

#### Backend Configuration
Create `.env` file in `backend/` directory:

```env
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"
ENCRYPTION_KEY="your-32-byte-hex-key"
PORT=3002
JWT_SECRET="your-jwt-secret"
```

#### Frontend Configuration
Create `.env.local` file in `frontend/` directory:

```env
NEXT_PUBLIC_API_URL="http://localhost:3002"
NEXT_PUBLIC_HEDERA_NETWORK="testnet"
```

Get your credentials from: https://portal.hedera.com/dashboard

### 4. Deploy Smart Contracts (Optional but Recommended)

For full EVM integration with on-chain consent registry and real payouts:

```bash
cd contracts
npm run compile
npm run deploy:testnet
```

After deployment, add the contract addresses to `adapter/.env`:
```env
CONSENT_MANAGER_ADDRESS="0x..."  # From deployment output
REVENUE_SPLITTER_ADDRESS="0x..."  # From deployment output
```

### 5. Start Services

#### Start Backend API
```bash
cd backend
npm start
# Server runs on http://localhost:3002
# API docs at http://localhost:3002/api-docs
```

#### Start Frontend (in new terminal)
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:3000
```

#### Run Adapter (optional, for data processing)
```bash
cd adapter
npm start
```

### 6. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3002
- **API Documentation**: http://localhost:3002/api-docs
- **Health Check**: http://localhost:3002/health

### 7. Verify Results

```bash
# Check anonymized output (if adapter was run)
cat adapter/data/anonymized_data.csv

# Validate adapter output
cd adapter
npm run validate

# Visit HashScan links from console output
```

## What Happens

1. **Reads** `data/raw_data.csv` (10 sample records)
2. **Anonymizes** data (removes PII, generates PID-001, PID-002, etc.)
3. **Creates** HCS topics (Consent Proofs, Data Proofs)
4. **Submits** proof hashes to Hedera HCS
5. **Records consent on-chain** (if ConsentManager address configured)
6. **Displays** HashScan links (click to verify on-chain)
7. **Shows** payout simulation (USD + optional local currency)
8. **Executes real payout** (if RevenueSplitter address configured) - automatically splits 60/25/15

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

**Error**: "Failed to record consent on-chain"
- Solution: Check `CONSENT_MANAGER_ADDRESS` is correct and contract is deployed
- Solution: Ensure account has sufficient HBAR for gas fees

**Error**: "Failed to execute real payout"
- Solution: Check `REVENUE_SPLITTER_ADDRESS` is correct and contract is deployed
- Solution: Ensure account has sufficient HBAR for transfer + gas fees

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

