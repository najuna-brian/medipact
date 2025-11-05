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
│   │   │   └── hash.js
│   │   └── index.js            # Main adapter entry point
│   └── tests/                  # Adapter tests
│
├── contracts/                  # Smart contracts
│   ├── ConsentManager.sol      # Consent management contract
│   ├── RevenueSplitter.sol     # Revenue distribution contract
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
│   └── plan.md                 # Development plan
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
- **`src/anonymizer/anonymize.js`**: Removes PII from medical records
- **`src/hedera/hcs-client.js`**: Handles HCS topic creation and message submission
- **`src/utils/hash.js`**: Cryptographic hash generation utilities
- **`data/`**: Contains sample EHR data (CSV files)

### Contracts (`contracts/`)
Smart contracts for revenue distribution and consent management:
- **`RevenueSplitter.sol`**: Automates 60/25/15 revenue split (Patient/Hospital/MediPact)
- **`ConsentManager.sol`**: Manages patient consent records on-chain

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
[Anonymizer] (adapter/src/anonymizer/anonymize.js)
    ↓
[Hash Generator] (adapter/src/utils/hash.js)
    ↓
[HCS Client] (adapter/src/hedera/hcs-client.js)
    ↓
Hedera Consensus Service (HCS)
    ↓
HashScan Explorer (transaction visible)
```

## Next Steps

1. Set up Node.js project (package.json)
2. Install dependencies (`@hashgraph/sdk`, `hedera-agent-kit`, etc.)
3. Create sample `raw_data.csv` file
4. Implement adapter components (JavaScript)
5. Test HCS integration

