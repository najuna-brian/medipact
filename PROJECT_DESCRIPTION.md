# MediPact - Project Description

## For Hackathon Submission (100 words max)

**MediPact** is a verifiable medical data marketplace built on Hedera Hashgraph that solves the patient data black market problem. Using Hedera Consensus Service (HCS), we create immutable proof of consent and data authenticity, enabling ethical, transparent medical data transactions.

Our MVP demonstrates the "In-Person Bridge" - a hospital adapter that anonymizes patient data, submits cryptographic proof hashes to HCS, and enables verifiable data sharing. Patients receive 60% of revenue via HBAR micropayments, hospitals get 25%, and the platform takes 15%.

**Key Features:**
- **Native Hedera Integration**: Every patient and hospital has a Hedera Account ID (0.0.xxxxx)
- FHIR R4 compliant data processing
- Automatic PII removal with anonymous ID generation
- Immutable consent and data proofs on Hedera HCS
- Automated revenue distribution via smart contracts
- Full audit trail on HashScan
- Platform-managed Hedera accounts for seamless UX

**Tech Stack:** Hedera HCS, Hedera EVM, Hedera Account IDs, Solidity, Node.js, FHIR R4

---

## Extended Description (for README/pitch deck)

MediPact - The Verifiable Health Pact. Built on Hedera.

### The Problem

Today, patients' medical data is sold by brokers without their knowledge or compensation. Hospitals have valuable data but no safe, legal way to share it for research. Researchers need verified, ethical data sources but can't trust current data brokers.

### Our Solution

MediPact uses Hedera Consensus Service (HCS) to create immutable proof of consent and data authenticity. When hospitals process patient data through our adapter, we:

1. **Anonymize** - Remove all PII (names, IDs, addresses) while preserving medical data
2. **Prove** - Generate cryptographic hashes and submit to HCS for immutable verification
3. **Compensate** - Automatically distribute revenue via HBAR: 60% to patients, 25% to hospitals, 15% to platform
4. **Verify** - All transactions visible on HashScan for complete transparency

### Technical Architecture

- **Hedera Consensus Service (HCS)**: Immutable proof storage for consent and data hashes
- **Hedera EVM**: Smart contracts for consent registry and automated revenue distribution
- **FHIR R4**: Standards-compliant healthcare data processing
- **Node.js Adapter**: Core engine for data processing and Hedera integration

### MVP Demo Flow

1. Hospital EHR data (CSV or FHIR Bundle) → 
2. MediPact Adapter (anonymizes, generates hashes) → 
3. Hedera HCS (submits proof hashes) → 
4. HashScan (verifiable transactions) → 
5. Smart Contracts (automated revenue distribution)

### Future Vision

**Path 1 (Digital Patient)**: Mobile/web app with Health Wallet, passive marketplace, and active studies portal.

**Path 2 (In-Person Patient)**: Thumbprint-and-Mobile-Money flow for non-digital users at hospitals.

### Why Hedera?

- **Fast**: 10,000+ TPS for real-time processing
- **Low Cost**: Fraction of a cent per transaction
- **Green**: Carbon-negative network
- **Secure**: Asynchronous Byzantine Fault Tolerant (aBFT) consensus

### Impact

- **Patients**: Control and monetize their own data
- **Hospitals**: Safe, legal data sharing with patient consent
- **Researchers**: Verified, ethical data sources
- **Healthcare**: Transparent, trustless data marketplace

---

## Tech Stack (Detailed)

### Blockchain & Consensus
- **Hedera Hashgraph**: Public distributed ledger
- **Hedera Consensus Service (HCS)**: Immutable message log
- **Hedera EVM**: Smart contract execution
- **HBAR**: Native cryptocurrency for payments

### Smart Contracts
- **Solidity 0.8.20**: Contract language
- **Hardhat**: Development environment
- **ConsentManager**: On-chain consent registry
- **RevenueSplitter**: Automated 60/25/15 revenue distribution

### Backend
- **Node.js**: Runtime environment
- **@hashgraph/sdk**: Hedera JavaScript SDK
- **FHIR R4**: Healthcare data standard
- **SHA-256**: Cryptographic hashing

### Data Formats
- **CSV**: Legacy hospital data format
- **FHIR Bundle**: Modern healthcare standard (JSON)
- **JSON**: Configuration and output

### Development Tools
- **Git**: Version control
- **npm**: Package management
- **Vitest**: Testing framework
- **dotenv**: Environment configuration

### Documentation
- **Markdown**: Documentation format
- **GitHub**: Repository hosting
- **HashScan**: Blockchain explorer

---

## Key Differentiators

1. **Standards-Compliant**: Full FHIR R4 support for production-ready integration
2. **Dual Input Support**: Works with both CSV (legacy) and FHIR (modern) formats
3. **Complete Audit Trail**: Every transaction verifiable on HashScan
4. **Automated Revenue**: Smart contracts ensure fair, transparent distribution
5. **Privacy-First**: PII never leaves hospital, only anonymized hashes on-chain

