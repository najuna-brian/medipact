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
├── frontend/                   # Next.js 15 Frontend Application
│   ├── src/
│   │   ├── app/                # Next.js App Router pages
│   │   │   ├── patient/        # Patient portal
│   │   │   │   ├── dashboard/  # Patient dashboard
│   │   │   │   ├── wallet/     # Health wallet
│   │   │   │   ├── earnings/   # Earnings dashboard
│   │   │   │   └── studies/    # Active studies
│   │   │   ├── hospital/        # Hospital portal
│   │   │   │   ├── dashboard/  # Hospital dashboard
│   │   │   │   ├── upload/     # Data upload
│   │   │   │   ├── consent/    # Consent management
│   │   │   │   ├── enrollment/ # Patient enrollment
│   │   │   │   ├── revenue/    # Revenue tracking
│   │   │   │   └── processing/ # Processing history
│   │   │   ├── researcher/      # Researcher portal
│   │   │   │   ├── dashboard/  # Researcher dashboard
│   │   │   │   ├── catalog/    # Data catalog
│   │   │   │   ├── dataset/    # Dataset details
│   │   │   │   ├── projects/   # Research projects
│   │   │   │   └── purchases/  # Purchase history
│   │   │   ├── admin/          # Admin portal
│   │   │   │   └── dashboard/  # Admin dashboard
│   │   │   ├── marketplace/    # Public marketplace
│   │   │   ├── for-patients/   # Public patient info
│   │   │   ├── for-hospitals/  # Public hospital info
│   │   │   ├── for-researchers/# Public researcher info
│   │   │   ├── privacy/        # Privacy page
│   │   │   ├── revenue/         # Revenue info page
│   │   │   └── api/            # API routes
│   │   ├── components/         # React components
│   │   │   ├── ui/             # Reusable UI components
│   │   │   ├── Sidebar/        # Role-based sidebars
│   │   │   │   ├── PatientSidebar.tsx
│   │   │   │   ├── HospitalSidebar.tsx
│   │   │   │   └── ResearcherSidebar.tsx
│   │   │   ├── Navigation/     # Main navigation
│   │   │   │   └── Navigation.tsx
│   │   │   ├── DataViewer/     # Data display
│   │   │   │   └── DataViewer.tsx
│   │   │   └── ...             # Other components
│   │   ├── hooks/              # Custom React hooks
│   │   │   ├── usePatientSession.ts
│   │   │   ├── useHospitalSession.ts
│   │   │   ├── useAdminSession.ts
│   │   │   └── useResearcher.ts
│   │   ├── lib/                # Utilities and API clients
│   │   │   ├── api/            # API client functions
│   │   │   └── utils.ts        # Utility functions
│   │   └── types/              # TypeScript definitions
│   └── tests/                  # Frontend tests
│
├── backend/                    # Express.js Backend API
│   ├── src/
│   │   ├── routes/             # API route handlers
│   │   │   ├── patient-api.js  # Patient endpoints
│   │   │   ├── hospital-api.js # Hospital endpoints
│   │   │   ├── researcher-api.js # Researcher endpoints
│   │   │   ├── marketplace-api.js # Marketplace endpoints
│   │   │   ├── revenue-api.js  # Revenue endpoints
│   │   │   └── admin-api.js   # Admin endpoints
│   │   ├── services/           # Business logic services
│   │   │   ├── patient-identity-service.js
│   │   │   ├── hospital-registry-service.js
│   │   │   ├── researcher-registry-service.js
│   │   │   └── revenue-distribution-service.js
│   │   ├── db/                 # Database operations
│   │   │   ├── database.js     # DB initialization
│   │   │   ├── patient-db.js   # Patient CRUD
│   │   │   ├── hospital-db.js  # Hospital CRUD
│   │   │   └── researcher-db.js # Researcher CRUD
│   │   ├── models/             # Data models
│   │   │   └── patient-identity-model.js
│   │   ├── config/             # Configuration
│   │   │   └── swagger.js     # Swagger/OpenAPI config
│   │   └── server.js           # Express server setup
│   ├── data/                   # SQLite database (dev)
│   │   └── medipact.db
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
Next.js 15 application with TypeScript:
- **App Router**: Next.js 15 App Router architecture
- **Patient Portal**: Dashboard, health wallet, earnings, studies
- **Hospital Portal**: Dashboard, data upload, consent management, revenue tracking
- **Researcher Portal**: Dashboard, data catalog, projects, purchases
- **Admin Portal**: Dashboard, verification, analytics
- **Public Pages**: Marketplace, info pages for each role
- **Role-Based Navigation**: Conditional rendering based on authentication
- **Sidebar Navigation**: Dedicated sidebars for each role
- **Data Components**: DataViewer, dataset cards, purchase modals
- **API Integration**: TanStack Query hooks for data fetching
- **Styling**: Tailwind CSS with shadcn/ui components

### Backend (`backend/`)
Express.js RESTful API server:
- **Patient API**: UPI generation, medical history, hospital linkage
- **Hospital API**: Registration, verification, patient management
- **Researcher API**: Registration, verification, marketplace access
- **Marketplace API**: Dataset browsing, purchase flow
- **Revenue API**: Revenue distribution via Hedera smart contracts
- **Admin API**: Hospital verification, platform management
- **Swagger UI**: Interactive API documentation at `/api-docs`
- **Database**: SQLite (dev) / PostgreSQL (prod)
- **Authentication**: Role-based auth (JWT, API keys, UPI)

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

