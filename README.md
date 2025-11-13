# MediPact - Verifiable Health Data Marketplace

> **Built on Hedera | Hackathon 2025**  
> **Track**: Open Track - Verifiable Healthcare Systems

<div align="center">

**Transform healthcare data into an ethical, transparent marketplace where patients are partners, not products.**

[![Hedera](https://img.shields.io/badge/Built%20on-Hedera-00A9CE?style=for-the-badge&logo=hedera)](https://hedera.com)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org)

</div>

---

## 🎯 What It Is

**MediPact** is a verifiable medical data marketplace that empowers patients to control and monetize their anonymized medical data for research. Built on Hedera Hashgraph, we solve the multi-billion dollar patient data black market problem.

### The Problem: $30B+ Patient Data Black Market

1. **💔 Patients are Exploited**: Medical records sell for **$1,000/record** on dark web, yet patients see **$0 compensation**
2. **🔍 Researchers are Blind**: Cannot verify ethical sourcing or data authenticity
3. **🏥 Hospitals are Trapped**: 97% of data remains unused due to regulatory barriers

**Market**: $9.5B healthcare data tech market by 2033 (13% CAGR)

### Our Solution

- ✅ **Immutable Proof**: Consent & data hashes on Hedera Consensus Service (HCS)
- ✅ **Patient Control**: 60% revenue share from data sales
- ✅ **Secure Data Vault**: Encrypted storage with patient-controlled access
- ✅ **Automated Compensation**: 60/25/15 split via HBAR micropayments
- ✅ **Full Transparency**: All transactions verifiable on HashScan
- ✅ **Standards-Based**: FHIR R4 compliant

**Key Innovation**: **"In-Person Bridge"** - hospital-based onboarding for 3+ billion non-digital users

---

## 🌐 Hedera Integration

<div align="center">

### **Built on Four Pillars of Hedera**

[![HCS](https://img.shields.io/badge/HCS-Immutable%20Proofs-00A9CE?style=flat-square)](https://hedera.com/consensus-service)
[![EVM](https://img.shields.io/badge/EVM-Smart%20Contracts-00A9CE?style=flat-square)](https://hedera.com/smart-contracts)
[![Accounts](https://img.shields.io/badge/Accounts-Native%20IDs-00A9CE?style=flat-square)](https://hedera.com)
[![HBAR](https://img.shields.io/badge/HBAR-Micropayments-00A9CE?style=flat-square)](https://hedera.com)

</div>

### Core Hedera Services

| Service | Usage | Impact |
|---------|-------|--------|
| **HCS** | Immutable storage of consent & data proof hashes | Unchangeable audit trail, ~$0.0001/message |
| **Hedera EVM** | ConsentManager & RevenueSplitter smart contracts | Automated consent registry & revenue distribution |
| **Hedera Account IDs** | Native accounts (0.0.xxxxx) for all users | Seamless UX, direct HBAR transfers |
| **HBAR** | Micropayments for 60/25/15 revenue split | Low-cost, instant settlements |

### Integration Flow

```mermaid
graph LR
    A[Adapter] -->|Submit Proofs| B[HCS Topics]
    A -->|Record Consent| C[ConsentManager]
    D[Backend] -->|Create Accounts| E[Hedera Accounts]
    D -->|Distribute Revenue| F[RevenueSplitter]
    F -->|HBAR Transfer| E
    B -->|HashScan| G[Public Verification]
    C -->|HashScan| G
    
    style B fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style C fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style E fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style F fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style G fill:#FFD700,color:#000,stroke:#FFA500,stroke-width:2px
```

**Key Files**:
- `adapter/src/hedera/hcs-client.js` - HCS topic creation & message submission
- `adapter/src/hedera/evm-client.js` - Smart contract interactions
- `backend/src/services/hedera-account-service.js` - Account creation
- `backend/src/services/revenue-distribution-service.js` - HBAR distribution
- `contracts/contracts/ConsentManager.sol` - On-chain consent registry
- `contracts/contracts/RevenueSplitter.sol` - Automated revenue split

### Why Hedera?

✅ **HCS is unique** - No other blockchain offers immutable message logging  
✅ **Low fees** - Enables micropayments at scale (~$0.0001 per HCS message)  
✅ **High throughput** - 10,000+ TPS for thousands of daily queries  
✅ **Carbon negative** - Environmentally sustainable  
✅ **Native accounts** - Seamless UX without complex wallet management  
✅ **EVM compatible** - Smart contracts with low gas costs

### Network Impact (Projected)

- **100 hospitals** = 100,000+ Hedera accounts
- **1M patients** = 1M+ Hedera accounts  
- **10,000 daily queries** = 10,000+ daily HCS transactions
- **Revenue distributions** = Thousands of HBAR transfers daily

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[Next.js 15 Frontend<br/>Patient | Hospital | Researcher | Admin]
    end
    
    subgraph "Backend Layer"
        API[Express.js REST API<br/>Routes | Services | Database]
    end
    
    subgraph "Processing Layer"
        ADAPTER[Adapter<br/>Anonymization | HCS Client | FHIR]
    end
    
    subgraph "Hedera Network"
        HCS[HCS Topics<br/>Consent & Data Proofs]
        EVM[EVM Contracts<br/>ConsentManager<br/>RevenueSplitter]
        ACCOUNTS[Hedera Accounts<br/>0.0.xxxxx]
        HBAR[HBAR<br/>Micropayments]
    end
    
    FE <-->|REST API| API
    API <-->|Data Processing| ADAPTER
    ADAPTER -->|HCS Messages| HCS
    ADAPTER -->|Contract Calls| EVM
    API -->|Create Accounts| ACCOUNTS
    API -->|Distribute Revenue| HBAR
    HBAR -->|Transfer| ACCOUNTS
    
    style FE fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style API fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
    style ADAPTER fill:#FCE4EC,stroke:#C2185B,stroke-width:2px
    style HCS fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style EVM fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style ACCOUNTS fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style HBAR fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
```

### Components

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS | Patient/Hospital/Researcher/Admin portals |
| **Backend** | Express.js, Node.js, SQLite/PostgreSQL | REST API, patient identity (UPI), marketplace |
| **Adapter** | Node.js, FHIR R4 | Processes EHR data, anonymizes PII, submits to HCS |
| **Smart Contracts** | Solidity (Hedera EVM) | ConsentManager & RevenueSplitter |

---

## 🔄 Data Flow

```mermaid
sequenceDiagram
    participant H as Hospital EHR
    participant A as Adapter
    participant HCS as Hedera HCS
    participant SC as Smart Contracts
    participant B as Backend
    participant M as Marketplace
    participant R as Researcher
    
    H->>A: Export EHR Data
    A->>A: Anonymize PII<br/>Generate Anonymous IDs
    A->>HCS: Submit Consent Proof
    A->>HCS: Submit Data Proof
    A->>SC: Record Consent
    A->>B: Store Anonymized Data
    B->>B: Create Dataset
    
    R->>M: Browse Datasets
    R->>M: Query with Filters
    M->>B: Execute Query<br/>(Consent Validation)
    B->>M: Return Results
    R->>M: Purchase Dataset
    M->>SC: Trigger Revenue Distribution
    SC->>SC: Auto-Split: 60/25/15
    SC->>R: Grant Access
    R->>M: Download Data
    
    Note over HCS,SC: All transactions<br/>verifiable on HashScan
```

### Processing Pipeline

```mermaid
flowchart LR
    A[Raw EHR Data] --> B[Parse & Validate]
    B --> C[Anonymize PII]
    C --> D[Preserve Demographics]
    D --> E[Generate Anonymous IDs]
    E --> F[Enforce K-Anonymity]
    F --> G[Generate Hashes]
    G --> H[Submit to HCS]
    H --> I[Record on Contract]
    I --> J[Store in Backend]
    J --> K[Marketplace Ready]
    
    style A fill:#FFCDD2,stroke:#D32F2F,stroke-width:2px
    style C fill:#FFF9C4,stroke:#F57F17,stroke-width:2px
    style D fill:#C8E6C9,stroke:#388E3C,stroke-width:2px
    style H fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style I fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style K fill:#BBDEFB,stroke:#1976D2,stroke-width:2px
```

---

## 💰 Revenue Model

```mermaid
pie title Revenue Split (Automated via Smart Contract)
    "Patient (60%)" : 60
    "Hospital (25%)" : 25
    "Platform (15%)" : 15
```

**How It Works**:
1. Researcher purchases dataset (pays in HBAR)
2. RevenueSplitter contract receives payment
3. **Automatically distributes**: 60% Patient, 25% Hospital, 15% Platform
4. All transactions verifiable on HashScan

**Benefits**: Trustless, Transparent, Instant, Low fees

---

## 🔐 Privacy & Anonymization

### Before vs. After

| Before (Raw) | After (Anonymized) |
|--------------|-------------------|
| ❌ Name: "John Doe" | ✅ Anonymous ID: "PID-001" |
| ❌ ID: "P-12345" | ✅ Removed |
| ❌ Address: "123 Main St" | ✅ Country Only: "Uganda" |
| ❌ Phone: "+256-123-4567" | ✅ Removed |
| ❌ DOB: "1990-01-15" | ✅ Age Range: "35-39" |
| ✅ Medical Data | ✅ Medical Data: Preserved |
| ✅ Demographics | ✅ Demographics: Preserved |

### K-Anonymity Protection

- **Minimum 5 records** per demographic group
- Groups: Country, Age Range, Gender, Occupation
- Records with <5 are **suppressed**

### Privacy Guarantees

- ✅ **No PII on Blockchain**: Only anonymous IDs and hashes
- ✅ **No Original Patient IDs**: ConsentManager stores only anonymous IDs
- ✅ **Demographics Generalized**: Prevents re-identification
- ✅ **K-Anonymity Enforced**: Privacy protection through grouping
- ✅ **Consent Validation**: Database-level enforcement

---

## ⚙️ Smart Contracts

### ConsentManager

```mermaid
graph LR
    A[Adapter] -->|recordConsent| B[ConsentManager]
    B -->|Stores| C[Anonymous ID<br/>HCS Topic ID<br/>Data Hash<br/>Timestamp]
    E[Query] -->|isConsentValid| B
    B -->|Returns| F[Consent Status]
    
    style B fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style C fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
```

**Functions**: `recordConsent()`, `revokeConsent()`, `isConsentValid()`, `getConsentByAnonymousId()`

### RevenueSplitter

```mermaid
graph LR
    A[Payment] -->|HBAR| B[RevenueSplitter]
    B -->|Auto-Split| C[60% Patient]
    B -->|Auto-Split| D[25% Hospital]
    B -->|Auto-Split| E[15% Platform]
    
    style B fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style C fill:#4CAF50,color:#fff,stroke:#2E7D32,stroke-width:2px
    style D fill:#2196F3,color:#fff,stroke:#1565C0,stroke-width:2px
    style E fill:#FF9800,color:#fff,stroke:#E65100,stroke-width:2px
```

**Functions**: `receive()` (auto-distribute), `distributeRevenueTo()`, `getSplitPercentages()`

---

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** - [Download](https://nodejs.org/)
- **Hedera Testnet Account** - [Get Free Account](https://portal.hedera.com/dashboard)
- **Git**

### Setup

```bash
# 1. Clone & install
git clone git@github.com:najuna-brian/medipact.git && cd medipact
cd adapter && npm install
cd ../backend && npm install  
cd ../frontend && npm install
cd ../contracts && npm install

# 2. Configure .env files (see Environment Variables section)

# 3. Start services
cd backend && npm start      # Port 3002
cd frontend && npm run dev   # Port 3000
cd adapter && npm start      # Process data
```

**Access**:
- 🌐 Frontend: http://localhost:3000
- 📚 API Docs: http://localhost:3002/api-docs
- ❤️ Health: http://localhost:3002/health

---

## 🔧 Environment Variables

### Adapter (`adapter/.env`)

```env
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"
HOSPITAL_COUNTRY="Uganda"
HOSPITAL_ID="HOSP-XXXXXXXX"
BACKEND_API_URL="http://localhost:3002"
CONSENT_MANAGER_ADDRESS="0x..."      # Optional
REVENUE_SPLITTER_ADDRESS="0x..."     # Optional
```

### Backend (`backend/.env`)

```env
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"
ENCRYPTION_KEY="your-32-byte-hex-key"  # openssl rand -hex 32
PORT=3002
DATABASE_PATH="./data/medipact.db"
JWT_SECRET="your-jwt-secret"
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:3002"
NEXT_PUBLIC_HEDERA_NETWORK="testnet"
```

---

## 📡 API Documentation

**Interactive Swagger UI**: http://localhost:3002/api-docs

### Key Endpoints

| Category | Endpoints |
|----------|-----------|
| **Patient** | `POST /api/patient/register`, `GET /api/patient/:upi/history` |
| **Hospital** | `POST /api/hospital/register`, `GET /api/hospital/:hospitalId` |
| **Researcher** | `POST /api/researcher/register`, `GET /api/researcher/:researcherId` |
| **Marketplace** | `GET /api/marketplace/datasets`, `POST /api/marketplace/query`, `POST /api/marketplace/purchase` |
| **Revenue** | `POST /api/revenue/distribute` |
| **Adapter** | `POST /api/adapter/submit-fhir-resources`, `POST /api/adapter/create-dataset` |

---

## 🗄️ Database Schema

```mermaid
erDiagram
    PATIENTS ||--o{ PATIENT_CONTACTS : has
    PATIENTS ||--o{ HOSPITAL_LINKAGES : linked_to
    PATIENTS ||--o{ FHIR_PATIENTS : has
    PATIENTS ||--o{ CONSENTS : has
    HOSPITALS ||--o{ HOSPITAL_LINKAGES : links
    HOSPITALS ||--o{ DATASETS : creates
    RESEARCHERS ||--o{ DATASETS : purchases
    FHIR_PATIENTS ||--o{ FHIR_CONDITIONS : has
    FHIR_PATIENTS ||--o{ FHIR_OBSERVATIONS : has
    
    PATIENTS {
        string upi PK
        string hedera_account_id
        string name
    }
    HOSPITALS {
        string hospital_id PK
        string hedera_account_id
        string name
        boolean verified
    }
    CONSENTS {
        string consent_id PK
        string upi FK
        string anonymous_patient_id
        string hcs_topic_id
        string data_hash
    }
    DATASETS {
        string dataset_id PK
        string hospital_id FK
        string consent_topic_id
        string data_topic_id
    }
```

---

## 🛠️ Technology Stack

```mermaid
graph TB
    subgraph "Frontend"
        F1[Next.js 15]
        F2[TypeScript]
        F3[Tailwind CSS]
    end
    
    subgraph "Backend"
        B1[Node.js]
        B2[Express.js]
        B3[SQLite/PostgreSQL]
    end
    
    subgraph "Hedera"
        H1[HCS]
        H2[EVM]
        H3[Accounts]
        H4[HBAR]
    end
    
    subgraph "Contracts"
        C1[Solidity]
        C2[Hardhat]
    end
    
    subgraph "Data"
        D1[FHIR R4]
        D2[K-Anonymity]
    end
    
    style H1 fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style H2 fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style H3 fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style H4 fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
```

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS |
| **Backend** | Node.js, Express.js, SQLite/PostgreSQL |
| **Hedera** | HCS, EVM, Accounts, HBAR |
| **Smart Contracts** | Solidity, Hardhat |
| **Data Standards** | FHIR R4, K-Anonymity |

---

## ✨ Key Features

- ✅ **FHIR R4 Compliant** - Interoperable with Medical Records Systems
- ✅ **K-Anonymity Enforcement** - Privacy by design (min 5 records per group)
- ✅ **HCS Immutable Proof Storage** - Unchangeable audit trail
- ✅ **Secure Data Vault** - Encrypted storage with patient-controlled access
- ✅ **Automated HBAR Revenue Distribution** - 60/25/15 split via smart contract
- ✅ **Patient Identity System (UPI)** - Cross-hospital linking
- ✅ **Consent Validation** - Database-level enforcement
- ✅ **Multi-Dimensional Query Engine** - Filter by country, date, condition, demographics
- ✅ **Smart Contract Integration** - On-chain consent registry and revenue distribution
- ✅ **Role-Based Dashboards** - Patient, Hospital, Researcher, Admin portals
- ✅ **HashScan Verification** - All transactions publicly verifiable

### Unique Differentiators

1. **Two-Path Onboarding**: Digital + in-person hospital process
2. **HCS + EVM Integration**: First healthcare marketplace combining immutable proof with automated payments
3. **Secure Data Vault**: Patient-controlled encrypted storage
4. **Ethical by Design**: True patient consent, privacy, and fairness
5. **Complete Solution**: Full data pipeline from extraction to marketplace

---

## 🧪 Development

```bash
# Run tests
cd contracts && npm test
cd adapter && npm run validate

# Development mode
cd backend && npm run dev
cd frontend && npm run dev

# Deploy contracts
cd contracts && npm run deploy:testnet
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **"OPERATOR_ID required"** | Create `.env` with Hedera credentials from [portal.hedera.com](https://portal.hedera.com/dashboard) |
| **"Transaction failed"** | Ensure account has HBAR balance (testnet faucet available) |
| **"Port in use"** | Change `PORT` in `backend/.env` |
| **"Failed to record consent on-chain"** | Check `CONSENT_MANAGER_ADDRESS` and ensure sufficient HBAR for gas |
| **"Failed to execute payout"** | Check `REVENUE_SPLITTER_ADDRESS` and HBAR balance |
| **"Database connection error"** | Ensure `data/` directory exists (SQLite) or check `DATABASE_URL` (PostgreSQL) |

---

## 📚 Resources

- [Adapter README](./adapter/README.md) - Data processing details
- [Backend README](./backend/README.md) - API documentation
- [Frontend README](./frontend/README.md) - Frontend architecture
- [Contracts README](./contracts/README.md) - Smart contract details
- [Pitch Deck](./PITCH_DECK.md) - Complete project overview

**External Links**:
- [Hedera Portal](https://portal.hedera.com/) - Get testnet account
- [HashScan Explorer](https://hashscan.io/) - View transactions
- [FHIR R4 Specification](https://www.hl7.org/fhir/) - Healthcare data standard

---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development workflow and guidelines.

---

## 📄 License

[To be determined - Apache 2.0 or MIT]

---

## 🏆 Hackathon Information

**Hackathon**: Hedera Hello Future: Ascension 2025  
**Track**: Open Track - Verifiable Healthcare Systems  
**Team**: Team Medipact

---

<div align="center">

**Built on Hedera. Built for the Future.**

[GitHub](https://github.com/najuna-brian/medipact) • [Documentation](./docs) • [Issues](https://github.com/najuna-brian/medipact/issues)

</div>
