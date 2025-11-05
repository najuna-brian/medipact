# MediPact - Hedera Web3 Medical Data Marketplace

## Project Overview

MediPact is a unified, two-path medical data marketplace that enables patients to control and monetize their anonymized medical data for research purposes. The platform uses Hedera Consensus Service (HCS) for immutable data proof, HBAR for instant micropayments, and smart contracts for automated revenue distribution.

**Project Name**: MediPact (Medi = Medical/Health, Pact = Agreement/Consent between patient, hospital, and researcher)

## Hackathon Strategy: "Pitch the Vision, Build the Core"

### What We PITCH (Pitch Deck & Demo Video)

- **Full Vision**: Describe the ENTIRE unified two-path platform
- **Path 1 (Digital Patient)**: Show mockups of mobile/web app with:
  - **Patientory feature** (Health Wallet): Upload lab results, connect hospital portals, view complete medical history in one secure place
  - **DataLake feature** (Open Marketplace): Simple toggle switch for "Sell my fully anonymized data on the open market" with earnings dashboard
  - **Embleema feature** (Clinical Studies Portal): High-value, one-time payouts for specific research studies
- **Path 2 (In-Person Patient)**: Describe the thumbprint-and-Mobile-Money flow for non-digital users
- **Mockups**: Beautiful fake screenshots showing the complete vision

### What We BUILD (Actual Code - MVP)

- **Focus**: Build the core engine - **Path 2 (In-Person flow)** - the Medipact Adapter
- **Demo Flow** (3-Step Process):
  1. **Simulated Hospital EHR**: Show CSV file with fake lab results
  2. **Medipact Adapter Script**: Run script that anonymizes, hashes, and posts to HCS
  3. **HCS Proof on HashScan**: Show transaction on Hedera Testnet explorer

**Data Scope**: **Lab results ONLY** (structured, simple to anonymize and demo fast)

## Repository Structure

```
medipact/
├── adapter/          # Medipact Adapter (Core Engine - Path 2)
├── contracts/        # Smart contracts
├── frontend/         # Demo UI (optional)
├── backend/          # API server (if needed)
├── docs/             # Documentation (including this plan.md)
└── scripts/          # Utility scripts
```

## Development Phases

### Phase 1: Foundation & Setup (Days 1-2)
- Initialize Git repository
- Set up project structure
- Configure development environment
- Create simulated EHR data

### Phase 2: Core Smart Contracts (Days 3-5)
- RevenueSplitter contract
- ConsentManager contract

### Phase 3: Hedera Integration Layer (Days 6-8)
- HCS service setup
- Topic management

### Phase 4: Medipact Adapter Core (Days 9-12)
- Anonymization service
- HCS hash submission
- Main adapter script

### Phase 5: Consent & Payout Services (Days 13-15)
- Consent logging
- Payout simulation

### Phase 6: Demo UI & Mockups (Days 16-17)
- Create mockups for pitch deck
- Build demo visualization

### Phase 7: Integration & Polish (Days 18-19)
- End-to-end testing
- Bug fixes
- Documentation

### Phase 8: Submission Prep (Days 20-21)
- Record demo video
- Finalize pitch deck
- Prepare submission

---
**Focus**: Build Path 2 (In-Person flow) adapter engine, pitch Path 1 (Digital Patient) vision
