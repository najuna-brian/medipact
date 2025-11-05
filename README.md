# MediPact - The Verifiable Health Pact. Built on Hedera.

> **Hedera Hello Future: Ascension Hackathon 2025**  
> **Theme**: Open Track - Verifiable Healthcare Systems  
> **Tagline**: "The Verifiable Health Pact. Built on Hedera."

## Project Description

MediPact is a verifiable medical data marketplace that empowers patients to control and monetize their anonymized medical data for research. We solve the patient data black market by creating a transparent, ethical platform using Hedera's Consensus Service for immutable proof and HBAR for instant micropayments.

**Problem**: Patients are exploited by data brokers who sell their medical data without consent or compensation. Researchers lack trusted, verifiable data sources. Hospitals have no safe way to share data for research.

**Solution**: A unified platform with two patient onboarding paths—digital and in-person—that uses HCS to create immutable proof of consent and data authenticity, ensuring ethical, verifiable medical data transactions.

## The Problem We Solve

### Patients are Exploited
Medical data is a multi-billion dollar asset. Data brokers buy and sell patient information without knowledge, consent, or compensation. Patients are the product, not the partner.

### Researchers are Blind
Pharmaceutical companies and AI labs need high-quality, diverse data to cure diseases. They're forced to buy from untrusted brokers with no way to verify if data is real, ethically sourced, or unaltered.

### Hospitals are Trapped
Hospitals (especially government hospitals in developing countries) sit on valuable data but have no safe, legal, or easy way to share it for research.

## Our Solution: A Unified, Two-Path Platform

### Path 1: The "Digital Patient" (Future Vision)
For tech-savvy users in urban areas and developed countries:

- **Health Wallet**: Secure place to connect hospital portals, upload lab results, view complete medical history
- **Passive Marketplace**: Simple on/off toggle to sell anonymized data, earn passive income with earnings dashboard
- **Active Studies Portal**: High-value portal where pharma companies post specific studies; patients browse and apply

### Path 2: The "In-Person Bridge" (MVP Focus - Our Secret Weapon)
For billions of patients without smartphones or high digital literacy:

- **Consent**: Hospital clerk explains program, patient signs paper form or uses thumbprint
- **Onboarding**: Clerk scans QR code, links anonymous ID to Mobile Money number
- **Result**: Patient enrolled in Passive Marketplace without ever needing a phone or app

## Technical Architecture

### The MediPact Adapter (Core Engine)
- **Installation**: Small, secure software installed on hospital servers
- **Connection**: Connects to existing EHR via FHIR API (simulated with CSV for MVP)
- **Anonymization**: Automatically strips PII (name, ID, address), replaces with anonymous PID
- **Logging**: Prepares clean, anonymous files for marketplace

### Hedera Integration

**Hedera Consensus Service (HCS)**: Immutable "bulletin board" storing:
- **Consent Proof**: Hash of signed/thumbprint consent form (legal audit trail)
- **Data Proof**: Hash of anonymous lab file (verifies data authenticity)

**HBAR Payments**: Global 60/25/15 revenue split (Patient/Hospital/MediPact)
- Instant micropayments via smart contracts
- USD-based currency conversion (HBAR → USD → Local Currency)
- Configurable local currency support (UGX, KES, TZS, etc.)
- Mobile Money integration with SMS notifications (future)

## MVP Demo Flow

Our hackathon MVP demonstrates the core "In-Person Bridge" flow:

1. **Simulated Hospital EHR**: CSV file (`raw_data.csv`) with fake lab results containing patient names and IDs
2. **MediPact Adapter Script**: Reads CSV, anonymizes data (removes PII), generates hashes
3. **HCS Submission**: Posts consent proof hash and data proof hash to Hedera Consensus Service
4. **HCS Proof on HashScan**: Shows transaction on Hedera Testnet explorer (HashScan) - verifiable proof
5. **Payout Simulation**: Displays revenue split in USD (and optional local currency) with "PAYOUT SIMULATED: $X.XX USD per patient"

## Tech Stack

- **Blockchain**: Hedera Hashgraph
  - Hedera Consensus Service (HCS) via `@hashgraph/sdk`
  - Hedera Agent Kit JS for HCS topic management and message submission
  - HBAR for micropayments
  - Smart Contracts (Solidity) for revenue distribution
- **Backend/Adapter**: Node.js / JavaScript
- **Frontend**: (Optional for demo) React/Next.js
- **Integration**: FHIR API (simulated), Mobile Money APIs (simulated)

## Repository Structure

```
medipact/
├── adapter/                    # MediPact Adapter (Core Engine)
│   ├── data/                   # Sample EHR data (CSV files)
│   ├── scripts/                # Adapter utility scripts
│   ├── src/                    # Source code (JavaScript)
│   │   ├── anonymizer/         # Data anonymization logic
│   │   │   └── anonymize.js
│   │   ├── hedera/             # HCS integration
│   │   │   └── hcs-client.js
│   │   ├── utils/              # Helper functions
│   │   │   ├── hash.js         # Cryptographic hash generation
│   │   │   └── currency.js     # Currency conversion utilities (USD-based)
│   │   └── index.js            # Main adapter entry point
│   └── tests/                  # Adapter tests
│
├── contracts/                  # Smart contracts
│   ├── ConsentManager.sol      # Consent management contract
│   ├── RevenueSplitter.sol     # Revenue distribution contract (60/25/15 split)
│   ├── README.md               # Contract documentation
│   ├── REVIEW.md               # Code review against Hedera standards
│   ├── scripts/                # Deployment scripts
│   └── test/                   # Contract tests
│
├── frontend/                   # Demo UI (optional)
│   ├── public/
│   │   └── mockups/            # Design mockups
│   ├── src/
│   │   ├── app/                # App routing (if using Next.js)
│   │   ├── components/        # React components
│   │   │   ├── AdapterDemo/   # Main demo component
│   │   │   ├── ConsentForm/   # Consent form component
│   │   │   └── HashScanLink/  # HashScan link component
│   │   ├── lib/               # Utility libraries
│   │   └── types/             # TypeScript type definitions
│   └── tests/                 # Frontend tests
│
├── backend/                    # API server (if needed)
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic services
│   │   └── utils/             # Backend utilities
│   └── tests/                 # Backend tests
│
├── docs/                       # Documentation
│   ├── plan.md                # Development plan
│   └── MASTER_PLAN.md         # Comprehensive master plan
│
├── scripts/                    # Utility scripts
│
├── .gitignore                  # Git ignore rules
├── README.md                   # Project README
├── PROJECT_STRUCTURE.md        # Detailed project structure
└── env.example                 # Environment variables template
```

See [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) for detailed documentation.

## Getting Started

**🚀 Quick Start**: See [QUICK_START.md](./QUICK_START.md) for a 5-minute setup guide!

### Prerequisites

- Node.js 18+ and npm
- Hedera Testnet account (get free account at https://portal.hedera.com/dashboard)
- Git

### Installation

```bash
# Clone the repository
git clone git@github.com:najuna-brian/medipact.git
cd medipact

# Navigate to adapter directory
cd adapter

# Install dependencies
npm install

# Set up environment variables
cp ../env.example .env
# Edit .env with your Hedera testnet credentials
```

### Running the MVP Demo

```bash
# Navigate to adapter directory
cd adapter

# Install dependencies
npm install

# Set up environment variables
cp ../env.example .env
# Edit .env with your Hedera testnet credentials

# Run the adapter script
npm start

# This will:
# 1. Read raw_data.csv
# 2. Anonymize the data (remove PII, generate anonymous IDs)
# 3. Create HCS topics (Consent Proofs, Data Proofs)
# 4. Submit consent proof hashes to HCS
# 5. Submit data proof hashes to HCS
# 6. Display HashScan links for all transactions
# 7. Show payout simulation (USD + optional local currency)
```

### Optional: Local Currency Configuration

To display revenue in local currency (e.g., UGX), add to your `.env` file:

```env
LOCAL_CURRENCY_CODE="UGX"
USD_TO_LOCAL_RATE="3700"
```

See `adapter/SETUP.md` for detailed setup instructions.

## Development Status

- [x] Project setup and repository structure
- [x] README and documentation
- [x] Hedera HCS integration (topic creation, message submission)
- [x] Data anonymization service
- [x] Adapter script (CSV → anonymize → HCS → HashScan)
- [x] Currency utilities (USD-based with configurable local currency)
- [x] Smart contracts (RevenueSplitter, ConsentManager)
- [x] Contract documentation and code review
- [x] Contract testing (24/24 tests passing)
- [x] Hardhat deployment environment setup
- [ ] Smart contract deployment to testnet (ready, requires .env)
- [ ] End-to-end testing
- [ ] Demo UI (optional)
- [ ] Demo video and pitch deck

## Hackathon Submission Requirements

This project is being developed for the **Hedera Hello Future: Ascension Hackathon 2025**.

### Submission Checklist

- [x] GitHub repository with code
- [x] README file
- [ ] Project description (max 100 words)
- [ ] Tech stack list
- [ ] Pitch deck (PDF)
- [ ] Demo video (YouTube link)
- [ ] Project demo link (live working environment)

## Judging Criteria Alignment

**Innovation (10%)**: Novel approach to verifiable healthcare using HCS for immutable consent and data proof. Unique two-path onboarding strategy.

**Feasibility (10%)**: Uses Hedera network services (HCS, HBAR). Addresses real-world problem in healthcare data marketplace.

**Execution (20%)**: MVP focuses on core adapter engine with working HCS integration, anonymization, and proof generation.

**Integration (15%)**: Deep Hedera integration using HCS for consent and data proof, HBAR for payments, smart contracts for revenue distribution.

**Success (20%)**: Creates verifiable medical data transactions, enables ethical data marketplace, potential for high TPS as marketplace scales.

**Validation (15%)**: Addresses validated market need (healthcare data marketplace). Targets real users (hospitals, patients, researchers).

**Pitch (10%)**: Clear problem-solution presentation. Demonstrates technical capability and market opportunity.

## Future Roadmap

### Phase 1: Post-Hackathon MVP Enhancement
- Full smart contract deployment for revenue splitting
- Mobile Money API integration
- Basic frontend dashboard

### Phase 2: Path 1 (Digital Patient) Development
- Mobile/web app for Health Wallet
- Passive marketplace toggle
- Active studies portal

### Phase 3: Production Readiness
- FHIR API integration
- Hospital onboarding system
- Compliance and security audits
- Pilot program with government hospitals

## Resources & References

- [Hedera Documentation](https://docs.hedera.com/)
- [Hedera Consensus Service](https://docs.hedera.com/hedera/core-concepts/consensus-service)
- [Hedera Agent Kit JS](https://github.com/hashgraph/hedera-agent-kit-js)
- [Hedera Smart Contracts](https://github.com/hashgraph/hedera-smart-contracts)
- [HashScan Explorer](https://hashscan.io/)

## License

[To be determined - Apache 2.0 or MIT]

## Team

Developed for Hedera Hello Future: Ascension Hackathon 2025

---

**Hackathon**: Hedera Hello Future: Ascension 2025  
**Track**: Open Track - Verifiable Healthcare Systems  
**Submission Deadline**: November 22, 2025
