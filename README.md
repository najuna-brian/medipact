# MediPact - The Verifiable Health Pact. Built on Hedera.

## Project Overview

MediPact is a global, verifiable medical data marketplace that empowers patients to control and monetize their anonymized medical data for research purposes. We solve the patient data "black market" problem by creating a transparent, ethical platform that benefits patients, hospitals, and researchers.

**Tagline**: *"The Verifiable Health Pact. Built on Hedera."*

## 🔥 The Problem We Solve

- **Patients are Exploited**: Medical data is a multi-billion dollar asset. Data brokers buy and sell it without patient knowledge, consent, or compensation.
- **Researchers are Blind**: Pharmaceutical companies need high-quality, diverse data but must buy from untrusted brokers with no verification.
- **Hospitals are Trapped**: Hospitals (especially government hospitals) have no safe, legal way to share data for research.

## ✨ Our Solution: A Unified, Two-Path Platform

### Path 1: The "Digital Patient" (The App)
For tech-savvy users in urban areas and developed countries:

- **Health Wallet** (Patientory-like): Secure place to connect hospital portals, upload lab results, view complete medical history
- **Passive Marketplace** (DataLake-like): Simple on/off toggle to sell anonymized data, earn passive income with earnings dashboard
- **Active Studies** (Embleema-like): High-value portal where pharma companies post specific studies; patients browse and apply

### Path 2: The "In-Person Bridge" (Our Secret Weapon) 🚀
For billions of patients without smartphones or high digital literacy:

- **Consent**: Hospital clerk explains program, patient signs paper form or uses thumbprint
- **Onboarding**: Clerk scans QR code, links anonymous ID to Mobile Money number
- **Result**: Patient enrolled in Passive Marketplace without ever needing a phone or app

## 🏗️ Technical Architecture

### The Medipact Adapter
- **Installation**: Small, secure software installed on hospital servers
- **Connection**: Connects to existing EHR via FHIR API
- **Anonymization**: Automatically strips PII, replaces with anonymous PID
- **Logging**: Prepares clean, anonymous files for marketplace

### Hedera Integration
- **Hedera Consensus Service (HCS)**: Immutable "bulletin board" storing:
  - **Consent Proof**: Hash of signed/thumbprint consent form (legal audit trail)
  - **Data Proof**: Hash of anonymous lab file (verifies data authenticity)
- **HBAR Payments**: Global 60/25/15 revenue split (Patient/Hospital/Medipact)
  - Instant micropayments
  - Auto-convert to local currency (UGX, etc.)
  - Mobile Money integration with SMS notifications

## 🎯 Hackathon MVP (What We're Building)

**Focus**: Demo the "In-Person Bridge" (Path 2) - the hardest and most unique part.

**Demo Flow**:
1. **Fake EHR**: `raw_data.csv` with patient names
2. **Adapter Script**: Reads and processes the file
3. **Anonymizer**: Outputs cleaned file (names/IDs removed)
4. **HCS Proof**: Shows transaction on HashScan (Hedera Testnet explorer)
5. **Payout Simulation**: "PAYOUT SIMULATED: 2,800 UGX sent to patient 077...XXX"

## 📁 Repository Structure

```
medipact/
├── adapter/          # Medipact Adapter (Core Engine - Path 2)
│   ├── data/         # Sample EHR data (CSV files)
│   ├── scripts/      # Adapter scripts
│   └── src/          # Source code
├── contracts/        # Smart contracts (RevenueSplitter, ConsentManager)
├── frontend/         # Demo UI (optional)
│   └── components/   # AdapterDemo, ConsentForm, HashScanLink
├── backend/          # API server (if needed)
├── docs/             # Documentation
└── scripts/          # Utility scripts
```

## 🚀 Development Phases

1. ✅ Foundation & Setup
2. 🔄 Core Smart Contracts (RevenueSplitter, ConsentManager)
3. 🔄 Hedera Integration Layer (HCS service, Topic management)
4. 🔄 Medipact Adapter Core (Anonymization, HCS hash submission)
5. 🔄 Consent & Payout Services
6. 🔄 Demo UI & Mockups
7. 🔄 Integration & Polish
8. 🔄 Submission Prep

## 🛠️ Tech Stack

- **Blockchain**: Hedera Hashgraph
  - Hedera Consensus Service (HCS)
  - HBAR for payments
  - Smart Contracts (Solidity)
- **Backend**: TBD
- **Frontend**: TBD
- **Integration**: FHIR API, Mobile Money APIs

## 📝 License

[To be determined]

## 🤝 Contributing

This is a hackathon project. Contributions and feedback welcome!

---

**Theme**: Verifiable Healthcare Systems (Hedera Hackathon - Open Track)

