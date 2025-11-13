# MediPact - Verifiable Health Data Marketplace

<div align="center">

[![Hedera](https://img.shields.io/badge/Built%20on-Hedera-00A9CE?style=for-the-badge&logo=hedera)](https://hedera.com)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg?style=for-the-badge&logo=node.js)](https://nodejs.org)

</div>

---

## 🎯 What Medipact is

**MediPact** is a verifiable medical data marketplace that empowers patients to control and monetize their anonymized medical data for research. Built on Hedera Hashgraph, we solve the multi-billion dollar patient data black market problem by creating a transparent, ethical platform using the Hedera Consensus Service for immutable proof and HBAR for instant micropayments.

The **healthcare ecosystem** holds vast amounts of valuable patient data stored across hospitals and clinics, yet much of it remains **inaccessible** which slows innovation and research. Even when accessed, Patients **lack control(consent) and fair compensation** for their own health information, while data sharing is limited by privacy and regulatory concerns.

**MediPact** addresses this by providing a **secure, ethical, and scalable data marketplace** that enables compliant medical data sharing, ensures patient privacy through anonymization and consent management, and supports fair value exchange between data owners and researchers.

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

**Hedera Account Creation**:

**Hospitals & Researchers:** Accounts are created during registration. The platform generates an ECDSA key pair, creates a Hedera account (0.0.xxxxx) with EVM compatibility, and stores the encrypted private key.

**Patients:** Accounts are created lazily on first payment. The platform creates the account only when revenue is distributed, reducing upfront costs.

**Process:** Platform generates keys → creates Hedera account (operator pays ~$0.05) → encrypts private key → stores account ID and EVM address in database. All accounts are EVM-compatible for smart contract interactions.

### Why Hedera?

✅ **HCS is unique** - No other blockchain offers immutable message logging  
✅ **Low fees** - Enables micropayments at scale (~$0.0001 per HCS message)  
✅ **High throughput** - 10,000+ TPS for thousands of daily queries  
✅ **Carbon negative** - Environmentally sustainable  
✅ **Native accounts** - Seamless UX without complex wallet management  
✅ **EVM compatible** - Smart contracts with low gas costs

---

## 🏗️ System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer"
        FE[Next.js 15 Frontend<br/>Patients, Hospitals, Researchers, Admins]
    end
    
    subgraph "Backend Layer"
        API[Express.js REST API<br/>Routes, Services, Database]
    end
    
    subgraph "Processing Layer"
        ADAPTER[Adapter<br/>Anonymization, HCS Client, FHIR]
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
```
```bash
# install backend
cd ../backend && npm install  
```
```bash
# Install frontend
cd ../frontend && npm install
```
```bash
# Install conracts
cd ../contracts && npm install
```
```bash
# 2. Configure .env files (see Environment Variables section)
# 3. Start services
cd backend && npm start      # Port 3002
```
```bash
cd frontend && npm run dev   # Port 3000
```
```bash
cd adapter && npm start      # Process data
```
---

## 🔧 Environment Variables

### Check the environment variables in (`../.env`) of `../backend` `../frontend` `../adapter`

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL="http://localhost:3002"
NEXT_PUBLIC_HEDERA_NETWORK="testnet"
```

---

## 📡 API Documentation

**Interactive Swagger UI**: http://localhost:3002/api-docs

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
## ✨ Key Features

| Feature | Description |
|--------|-------------|
| **FHIR R4 Compliant** | Interoperable with global medical record systems |
| **K-Anonymity Enforcement** | Privacy by design (minimum 5 records per group) |
| **HCS Immutable Proof Storage** | Unchangeable audit trail on Hedera Consensus Service |
| **Secure Data Vault** | Encrypted storage with patient-controlled access |
| **Automated HBAR Revenue Distribution** | 60/25/15 split managed by smart contract |
| **Patient Identity System (UPI)** | Cross-hospital identity linking |
| **Consent Validation** | Enforced at the database and smart-contract levels |
| **Multi-Dimensional Query Engine** | Filter by country, date, condition, demographics |
| **Smart Contract Integration** | On-chain consent registry and revenue sharing |
| **Role-Based Dashboards** | Patient, Hospital, Researcher, and Admin portals |
| **HashScan Verification** | Publicly verifiable transactions on HashScan |

---

## 🧪 Development

```bash
# Run tests
cd contracts && npm test
cd adapter && npm run validate
```
```bash
# Development mode
cd backend && npm run dev
cd frontend && npm run dev
```
```bash
# Deploy contracts
cd contracts && npm run deploy:testnet
```

---

**External Links**:
- [Hedera Portal](https://portal.hedera.com/) - Get testnet account
- [HashScan Explorer](https://hashscan.io/) - View transactions
- [FHIR R4 Specification](https://www.hl7.org/fhir/) - Healthcare data standard
- [A Comprehensive Guide to Healthcare Data Security](https://www.metomic.io/resource-centre/a-comprehensive-guide-to-healthcare-data-security#:~:text=By%20prioritising%20data%20security%2C%20healthcare,availability%20of%20sensitive%20healthcare%20information.) - How to meet the healthcare data security standards
- [Why is Healthcare Data so Valuable?](https://blog.tbconsulting.com/why-healthcare-data-is-so-valuable-on-the-black-market#:~:text=Sensitive%20information%20from%20medical%20data,cybercriminals%20at%20an%20alarming%20rate.) -
- [Establishing a Health Data Marketplace: A Framework for Success](https://www.researchgate.net/publication/376532396_Establishing_a_Health_Data_Marketplace_A_Framework_for_Success#:~:text=Abstract,outcomes%2C%20research%2C%20and%20innovation.)


---

## 🤝 Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development workflow and guidelines.

---

## 📄 License

[To be determined - Apache 2.0 or MIT]

---
<div align="center">
## Hackathon Information

### Hedera Hello Future: Ascension 2025  
### Open Track - Verifiable Healthcare Systems  
### Team Medipact
</div>
---

<div align="center">

[![Hedera](https://img.shields.io/badge/Built%20on-Hedera-00A9CE?style=for-the-badge&logo=hedera)](https://hedera.com)

[GitHub](https://github.com/najuna-brian/medipact) • [Issues](https://github.com/najuna-brian/medipact/issues) 

</div>
