# MediPact Project Structure

## Directory Overview

```
medipact/
├── adapter/                    # MediPact Adapter (Core Engine)
│   ├── data/                   # Sample EHR data files
│   │   └── .gitkeep
│   ├── scripts/                # Utility scripts
│   ├── src/                    # Source code
│   │   ├── anonymizer/         # Data anonymization logic
│   │   │   └── anonymize.js
│   │   ├── hedera/             # Hedera integration
│   │   │   └── hcs-client.js
│   │   ├── utils/              # Helper functions
│   │   │   ├── hash.js         # Cryptographic hash generation (SHA-256)
│   │   │   └── currency.js     # Currency conversion utilities
│   │   └── index.js            # Main adapter entry point
│   └── tests/                  # Adapter tests
│
├── contracts/                  # Smart contracts (Solidity)
│   ├── ConsentManager.sol      # Consent management contract
│   ├── RevenueSplitter.sol     # Revenue distribution contract (60/25/15)
│   ├── README.md               # Contract documentation and usage
│   ├── REVIEW.md               # Code review vs Hedera standards
│   ├── scripts/                # Deployment scripts
│   └── test/                   # Contract tests
│
├── frontend/                   # Demo UI (optional)
│   ├── public/
│   │   └── mockups/            # Design mockups
│   ├── src/
│   │   ├── app/                # App routing (if using Next.js)
│   │   ├── components/         # React components
│   │   │   ├── AdapterDemo/    # Main demo component
│   │   │   │   └── AdapterDemo.tsx
│   │   │   ├── ConsentForm/    # Consent form component
│   │   │   │   └── ConsentForm.tsx
│   │   │   └── HashScanLink/   # HashScan link component
│   │   │       └── HashScanLink.tsx
│   │   ├── lib/                # Utility libraries
│   │   └── types/              # TypeScript type definitions
│   └── tests/                  # Frontend tests
│
├── backend/                    # API server (if needed)
│   ├── src/
│   │   ├── routes/             # API routes
│   │   ├── services/           # Business logic services
│   │   └── utils/              # Backend utilities
│   └── tests/                  # Backend tests
│
├── docs/                       # Documentation
│   ├── plan.md                 # Development plan
│   ├── MASTER_PLAN.md          # Comprehensive master plan (21-day timeline)
│   └── IMPLEMENTATION_REVIEW.md # Implementation review notes
│
├── scripts/                    # Utility scripts
│   └── .gitkeep
│
├── .gitignore                  # Git ignore rules
├── README.md                   # Project README
├── PROJECT_STRUCTURE.md        # This file
└── env.example                 # Environment variables template
```

## Key Components

### Adapter (`adapter/`)
The core engine that processes hospital EHR data:
- **`src/index.js`**: Main entry point that orchestrates the entire flow
  - Reads CSV, anonymizes data, submits to HCS, displays results
- **`src/anonymizer/anonymize.js`**: Removes PII from medical records
  - Parses CSV, removes PII, generates anonymous patient IDs (PID-001, etc.)
- **`src/hedera/hcs-client.js`**: Handles HCS topic creation and message submission
  - Creates topics, submits messages, generates HashScan links
- **`src/utils/hash.js`**: Cryptographic hash generation utilities
  - SHA-256 hashing for consent forms and anonymized records
- **`src/utils/currency.js`**: Currency conversion utilities
  - USD-based conversion (HBAR → USD → Local Currency)
  - Configurable local currency support
- **`data/raw_data.csv`**: Sample EHR data with PII
- **`data/anonymized_data.csv`**: Generated anonymized output (gitignored)

### Contracts (`contracts/`)
Smart contracts for revenue distribution and consent management:
- **`RevenueSplitter.sol`**: Automates 60/25/15 revenue split (Patient/Hospital/MediPact)
  - Receives HBAR via `receive()`/`fallback()`
  - Automatically distributes to configured wallets
  - Owner-controlled recipient updates
- **`ConsentManager.sol`**: Manages patient consent records on-chain
  - Links original patient IDs to anonymous IDs
  - Stores HCS topic references for verifiable proof
  - Consent validity tracking (valid/revoked)
- **`README.md`**: Contract documentation, deployment instructions, usage examples
- **`REVIEW.md`**: Comprehensive code review against Hedera standards (Grade: A+)

### Frontend (`frontend/`)
Optional demo UI components:
- **`AdapterDemo`**: Shows the adapter workflow
- **`ConsentForm`**: Displays consent information
- **`HashScanLink`**: Links to Hedera transactions on HashScan

### Backend (`backend/`)
API server for future integrations (optional for MVP):
- Routes, services, and utilities for API endpoints

## File Naming Conventions

- **JavaScript files**: `.js` for backend/adapter source code
- **TypeScript files**: `.tsx` for React components (frontend)
- **Solidity files**: `.sol` for smart contracts
- **Data files**: `.csv` for EHR data
- **Configuration**: `.env.example` for environment template

## Development Workflow

1. **Adapter Development**: Work in `adapter/src/`
2. **Contract Development**: Work in `contracts/`
3. **UI Development**: Work in `frontend/src/`
4. **Testing**: Add tests in respective `tests/` directories
5. **Documentation**: Update `docs/` and `README.md`

## Data Flow

```
raw_data.csv (adapter/data/)
    ↓
[Adapter Script] (adapter/src/index.js)
    ↓
[CSV Parser] (adapter/src/anonymizer/anonymize.js)
    ↓
[Anonymizer] (removes PII, generates PID-001, PID-002, etc.)
    ↓
[Hash Generator] (adapter/src/utils/hash.js)
    ├── Consent Proof Hash (SHA-256)
    └── Data Proof Hash (SHA-256)
    ↓
[HCS Client] (adapter/src/hedera/hcs-client.js)
    ├── Create Consent Topic (if needed)
    ├── Create Data Topic (if needed)
    ├── Submit Consent Proof → HCS
    └── Submit Data Proof → HCS
    ↓
Hedera Consensus Service (HCS)
    ↓
HashScan Explorer (all transactions visible)
    ├── Consent Proof Transaction
    └── Data Proof Transaction
    ↓
[Currency Utilities] (adapter/src/utils/currency.js)
    ├── Convert HBAR → USD
    └── Convert USD → Local Currency (optional)
    ↓
Payout Simulation Display (USD + optional local currency)
```

## Next Steps

1. Set up Node.js project (package.json)
2. Install dependencies (`@hashgraph/sdk`, `hedera-agent-kit`, etc.)
3. Create sample `raw_data.csv` file
4. Implement adapter components (JavaScript)
5. Test HCS integration

