# MediPact - Verifiable Health Data Marketplace

> Built on Hedera | Hackathon 2025

## What It Is

MediPact enables patients to control and monetize anonymized medical data for research. Uses Hedera HCS for immutable consent/data proof and HBAR for automated revenue distribution (60/25/15 split: Patient/Hospital/MediPact).

**Problem**: Patients are exploited by data brokers. Researchers lack trusted data sources. Hospitals have no safe way to share data.

**Solution**: A transparent platform using Hedera Consensus Service for immutable proof and smart contracts for automated revenue distribution.

## Quick Start

### Prerequisites
- Node.js 18+
- Hedera testnet account: https://portal.hedera.com/dashboard

### Setup (5 minutes)

```bash
# 1. Clone & install
git clone git@github.com:najuna-brian/medipact.git && cd medipact
cd adapter && npm install
cd ../backend && npm install  
cd ../frontend && npm install

# 2. Configure environment variables
# Copy env.example to each directory and add your Hedera credentials

# adapter/.env
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"
HOSPITAL_COUNTRY="Uganda"

# backend/.env
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"
ENCRYPTION_KEY="your-32-byte-hex-key"  # Generate: openssl rand -hex 32
PORT=3002
JWT_SECRET="your-jwt-secret"

# frontend/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3002"
NEXT_PUBLIC_HEDERA_NETWORK="testnet"

# 3. Start services
cd backend && npm start      # Port 3002
cd frontend && npm run dev   # Port 3000
cd adapter && npm start      # Process data
```

**Access**: 
- Frontend: http://localhost:3000
- API Docs: http://localhost:3002/api-docs
- Health: http://localhost:3002/health

## Architecture

```
EHR Data → Adapter (Anonymize) → HCS (Proof) → Smart Contracts (Revenue) → Marketplace
```

### Components

- **Adapter** (`adapter/`): Processes FHIR/CSV, anonymizes PII, submits to HCS
- **Backend** (`backend/`): REST API with patient identity (UPI), hospital/researcher registry, marketplace
- **Frontend** (`frontend/`): Next.js 15 app with Patient/Hospital/Researcher/Admin portals
- **Contracts** (`contracts/`): Solidity smart contracts (ConsentManager, RevenueSplitter)

## Project Structure

```
medipact/
├── adapter/          # Data processing & HCS integration
│   ├── src/         # Anonymization, HCS client, utilities
│   └── data/        # Sample EHR data (CSV/FHIR)
├── backend/         # Express.js REST API
│   ├── src/         # Routes, services, database
│   └── data/        # SQLite database (dev)
├── frontend/        # Next.js 15 application
│   └── src/         # App router, components, hooks
└── contracts/       # Solidity smart contracts
    └── contracts/   # ConsentManager.sol, RevenueSplitter.sol
```

## Key Features

- ✅ FHIR R4 compliant data processing
- ✅ K-anonymity enforcement (demographics preserved, PII removed)
- ✅ HCS immutable proof storage (consent & data hashes)
- ✅ Automated HBAR revenue distribution (60/25/15 split)
- ✅ Patient identity system (UPI - Unique Patient Identifier)
- ✅ Consent validation in all queries (database-level)
- ✅ Marketplace with multi-dimensional query engine
- ✅ Smart contract integration (on-chain consent registry)

## Environment Variables

### Adapter (`adapter/.env`)
```env
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"
HOSPITAL_COUNTRY="Uganda"
HOSPITAL_LOCATION="Kampala, Uganda"  # Optional
HOSPITAL_ID="HOSP-XXXXXXXX"          # For revenue distribution
BACKEND_API_URL="http://localhost:3002"
CONSENT_MANAGER_ADDRESS="0x..."      # Optional: from contract deployment
REVENUE_SPLITTER_ADDRESS="0x..."     # Optional: from contract deployment
```

### Backend (`backend/.env`)
```env
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"
ENCRYPTION_KEY="32-byte-hex"  # openssl rand -hex 32
PORT=3002
NODE_ENV=development
DATABASE_PATH="./data/medipact.db"  # SQLite for dev
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="24h"
```

### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:3002"
NEXT_PUBLIC_HEDERA_NETWORK="testnet"
```

## Smart Contracts (Optional)

For full EVM integration with on-chain consent registry and automated payouts:

```bash
cd contracts
npm install
npm run compile
npm run deploy:testnet
# Add contract addresses to adapter/.env
```

## API Documentation

Interactive Swagger UI available at: http://localhost:3002/api-docs

### Key Endpoints

- `GET /health` - Health check
- `POST /api/patient/register` - Register patient
- `POST /api/hospital/register` - Register hospital
- `POST /api/researcher/register` - Register researcher
- `GET /api/marketplace/datasets` - Browse datasets
- `POST /api/marketplace/query` - Query data (with consent validation)
- `POST /api/revenue/distribute` - Distribute revenue

## Tech Stack

- **Blockchain**: Hedera (HCS, HBAR, EVM)
- **Backend**: Node.js, Express, SQLite/PostgreSQL
- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Standards**: FHIR R4
- **Smart Contracts**: Solidity (Hedera EVM)

## Development

```bash
# Run tests
cd contracts && npm test
cd adapter && npm run validate

# Development mode (auto-reload)
cd backend && npm run dev
cd frontend && npm run dev

# Process data with adapter
cd adapter && npm start
```

## Data Flow

1. **Input**: Hospital EHR data (CSV or FHIR R4)
2. **Anonymization**: Remove PII, preserve demographics, generate anonymous IDs
3. **HCS Submission**: Submit consent & data proof hashes to Hedera
4. **On-Chain Registry**: Record consent proofs in ConsentManager contract
5. **HashScan Verification**: View transactions on HashScan explorer
6. **Revenue Distribution**: Automated 60/25/15 split via RevenueSplitter contract
7. **Output**: Anonymized data (CSV/FHIR) ready for marketplace

## Troubleshooting

**"OPERATOR_ID required"**
- Create `.env` file with Hedera credentials from https://portal.hedera.com/dashboard

**"Transaction failed"**
- Ensure account has HBAR balance (testnet faucet available)

**"Port in use"**
- Change `PORT` in `backend/.env` or stop the process using the port

**"Failed to record consent on-chain"**
- Check `CONSENT_MANAGER_ADDRESS` is correct and contract is deployed
- Ensure account has sufficient HBAR for gas fees

**"Failed to execute payout"**
- Check `REVENUE_SPLITTER_ADDRESS` is correct
- Ensure account has sufficient HBAR for transfer + gas fees

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development workflow and guidelines.

## License

[To be determined - Apache 2.0 or MIT]

---

**Hackathon**: Hedera Hello Future: Ascension 2025  
**Track**: Open Track - Verifiable Healthcare Systems
