# Demo Video Script - MediPact MVP

**Hackathon**: Hedera Hello Future: Ascension 2025  
**Duration**: 3-5 minutes  
**Format**: Screen recording with narration

---

## Script Outline

### Introduction (30 seconds)

**Visual**: Project repository on GitHub, README visible

**Narration**:
> "Hi, I'm [Name], and this is MediPact - The Verifiable Health Pact, built on Hedera. We're solving the patient data black market by creating a transparent, ethical medical data marketplace using Hedera's Consensus Service for immutable proof and HBAR for instant micropayments."

**Key Points**:
- Problem: Patient data sold without consent
- Solution: Verifiable, ethical marketplace on Hedera
- Focus: In-Person Bridge (MVP for non-digital patients)

---

### Problem Statement (30 seconds)

**Visual**: Show mockup or diagram of current data flow

**Narration**:
> "Today, patients' medical data is sold by brokers without their knowledge or compensation. Hospitals have valuable data but no safe way to share it. Researchers need verified, ethical data sources. We're building the bridge."

**Key Points**:
- Patients exploited
- Hospitals trapped
- Researchers need verified data

---

### Solution Overview (45 seconds)

**Visual**: Architecture diagram or flow chart

**Narration**:
> "MediPact uses Hedera Consensus Service to create immutable proof of consent and data authenticity. When a hospital processes patient data through our adapter, we anonymize it, generate cryptographic hashes, and submit proof to HCS. This creates an unalterable audit trail on Hedera's network. Patients get compensated via HBAR, with a 60/25/15 split going to patients, hospitals, and the platform."

**Key Points**:
- HCS for immutable proof
- Anonymization process
- Revenue sharing model
- Verifiable on-chain

---

### Live Demo - Part 1: Hospital Data Upload (1 minute)

**Visual**: Show hospital login and CSV upload

**Narration**:
> "Let's start with a hospital uploading patient data. Here's a CSV file with lab results containing patient names, IDs, addresses, and phone numbers - everything we need to anonymize. The hospital logs in, uploads the CSV, and our adapter processes it."

**Actions**:
1. Navigate to `/hospital/login`
2. Login with hospital credentials
3. Navigate to `/hospital/upload`
4. Upload sample CSV file
5. Show processing status

**Key Points**:
- Hospital authentication
- CSV upload interface
- Processing status

---

### Live Demo - Part 2: Data Processing & Anonymization (1 minute)

**Visual**: Show adapter processing and HCS submission

**Narration**:
> "The adapter processes the data, removing all personally identifiable information through double anonymization. Patient names become anonymous IDs like PID-001. Addresses are generalized to country level. Ages are grouped into ranges. Then, we submit proof hashes to Hedera Consensus Service, creating an immutable record."

**Actions**:
1. Show adapter processing logs
2. Show anonymized data preview
3. Show HCS message submission
4. Open HashScan link to verify transaction

**Key Points**:
- Double anonymization
- HCS proof submission
- HashScan verification

---

### Live Demo - Part 3: Researcher Data Search (1 minute)

**Visual**: Show researcher query interface

**Narration**:
> "Now, a researcher wants to find diabetic patients in Uganda. They log in, search by disease and country, specify the number of patients they need, and get a preview of the anonymized data in a flattened CSV format - one row per patient with all their medical data."

**Actions**:
1. Navigate to `/researcher/login`
2. Login with researcher credentials
3. Navigate to `/researcher/query`
4. Enter search criteria:
   - Disease: "Type 2 Diabetes"
   - Country: "Uganda"
   - Number of Patients: 100
5. Show query results preview
6. Show flattened CSV preview

**Key Points**:
- Easy search interface
- Disease and country filters
- CSV preview
- Anonymized data display

---

### Live Demo - Part 4: Purchase & Revenue Distribution (1 minute)

**Visual**: Show purchase flow and revenue distribution

**Narration**:
> "The researcher sees the price, makes a payment, and downloads the data. But here's the magic - the revenue is automatically distributed using our RevenueSplitter smart contract. 60% goes to patients, 25% to the hospital, and 15% to the platform. All transactions are verifiable on HashScan."

**Actions**:
1. Click "Purchase" button
2. Show price calculation
3. Enter transaction ID (simulated payment)
4. Show purchase confirmation
5. Show revenue distribution breakdown
6. Open HashScan link to verify smart contract call
7. Show patient wallet balance update

**Key Points**:
- Purchase flow
- Smart contract revenue distribution
- HashScan verification
- Wallet balance updates

---

### Hedera Integration Highlights (30 seconds)

**Visual**: Show metrics dashboard

**Narration**:
> "MediPact is fully integrated with Hedera. We've created hundreds of Hedera accounts, sent thousands of HCS messages, and executed smart contract calls for revenue distribution. All of this is tracked in real-time on our metrics dashboard."

**Actions**:
1. Navigate to `/admin/dashboard`
2. Show Hedera Metrics section:
   - Total Hedera Accounts
   - HCS Messages
   - Smart Contract Calls
   - HBAR Distributed

**Key Points**:
- Multiple Hedera services used
- Real network impact
- Metrics tracking

---

### Conclusion (30 seconds)

**Visual**: Show project summary slide

**Narration**:
> "MediPact demonstrates how Hedera's unique services - HCS, EVM, Accounts, and HBAR - can solve real-world problems in healthcare. We've built a verifiable, ethical data marketplace that empowers patients, enables hospitals, and accelerates research. Thank you for watching!"

**Key Points**:
- Real-world problem solved
- Multiple Hedera services integrated
- Ethical and transparent
- Ready for production

---

## Production Tips

### Before Recording
- [ ] Test all flows end-to-end
- [ ] Prepare demo data
- [ ] Clear browser cache
- [ ] Close unnecessary tabs
- [ ] Test screen recording software
- [ ] Prepare narration script

### During Recording
- [ ] Speak clearly and at moderate pace
- [ ] Pause between sections
- [ ] Highlight key features
- [ ] Show HashScan links
- [ ] Demonstrate real transactions
- [ ] Keep it under 5 minutes

### After Recording
- [ ] Edit for clarity
- [ ] Add captions/subtitles
- [ ] Add background music (optional)
- [ ] Upload to YouTube
- [ ] Embed in pitch deck

---

## Demo Data Preparation

### Hospital Credentials
- Hospital ID: `HOSP-XXXXX`
- API Key: `[from demo-credentials.json]`

### Researcher Credentials
- Researcher ID: `RES-XXXXX`
- Email: `researcher1@demo.medipact.com`

### Sample CSV
- Use `backend/adapter/data/anonymized_data.csv` as example
- Or generate new data with `npm run populate-demo`

---

## HashScan Links to Show

1. **HCS Topic** (Consent Proofs)
   - Example: `https://hashscan.io/testnet/topic/[TOPIC_ID]`

2. **Smart Contract** (RevenueSplitter)
   - `https://hashscan.io/testnet/contract/0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392`

3. **Smart Contract** (ConsentManager)
   - `https://hashscan.io/testnet/contract/0xf2423F1E568eC90921045be96Ad2D618fCcd9841`

4. **Account Example** (Patient Wallet)
   - Example: `https://hashscan.io/testnet/account/[ACCOUNT_ID]`

---

## Key Messages to Emphasize

1. **Hedera Integration**: Multiple services used (HCS, EVM, Accounts, HBAR)
2. **Real-World Problem**: Solving actual healthcare data sharing issues
3. **Ethical Solution**: Patients compensated, consent managed
4. **Verifiable**: All transactions on HashScan
5. **Scalable**: Ready for production deployment

---

**Good luck with your demo! 🚀**

