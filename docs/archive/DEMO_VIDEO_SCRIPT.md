# MediPact Demo Video Script - Complete Hedera Integration

**Hackathon**: Hedera Hello Future: Ascension 2025  
**Track**: Open Track - Verifiable Healthcare Systems  
**Duration**: 4-5 minutes  
**Format**: Screen recording with frontend, backend/terminal, and narration

---

## 🎯 JUDGING CRITERIA ALIGNMENT

This script is designed to hit every judging criterion:

1. **Innovation (10%)** - Unique use of all 4 Hedera services, can't be done cross-chain
2. **Feasibility (10%)** - Real problem, Web3 solution, complete understanding
3. **Execution (20%)** - Full MVP, working solution, great UX
4. **Integration (15%)** - Deep Hedera integration, all 4 services, creative usage
5. **Success (20%)** - Network impact, accounts created, TPS contribution
6. **Validation (15%)** - Market feedback, real metrics, traction
7. **Pitch (10%)** - Clear problem/solution, exciting opportunity, Hedera representation

---

## 📹 SCRIPT OUTLINE

### Opening Hook (10 seconds)

**Visual**: Split screen - Left: Problem statistic, Right: MediPact logo

**Narration**:
> "Every year, $10 billion worth of patient data is sold on the black market. Patients get nothing. We're changing that with MediPact - the first verifiable healthcare data marketplace built exclusively on Hedera."

**Key Points**:
- Shocking statistic
- Immediate solution introduction
- "Exclusively on Hedera" emphasis

---

### Introduction (20 seconds)

**Visual**: Frontend homepage (`http://localhost:3000`)

**Narration**:
> "Hi, I'm [Name], and this is MediPact - The Verifiable Health Pact. We're solving the patient data black market by creating a transparent, ethical medical data marketplace using all four Hedera services: HCS for immutable proofs, EVM for smart contracts, native Accounts for seamless UX, and HBAR for instant micropayments."

**Actions**:
- Show homepage
- Highlight "Built on Hedera" badge
- Navigate to docs briefly

**Key Points**:
- Personal introduction
- All 4 Hedera services mentioned upfront
- Production-ready emphasis

---

### Problem Statement (30 seconds)

**Visual**: Frontend `/about` page or problem diagram

**Narration**:
> "Today, patients' medical data is sold by brokers without their knowledge or compensation - a $10 billion black market. Hospitals have valuable data but no safe, ethical way to share it. Researchers need verified, ethical data sources but struggle to find them. Patients have no control, hospitals have no revenue, researchers have no access. We're building the bridge."

**Actions**:
- Show problem section on frontend
- Highlight three stakeholders

**Key Points**:
- Quantified problem ($10B)
- Three stakeholders
- Clear pain points

---

### Solution Overview - Why Hedera? (45 seconds)

**Visual**: Frontend `/docs/hedera` page OR architecture diagram

**Narration**:
> "MediPact leverages Hedera's unique capabilities that can't be replicated on any other blockchain. HCS provides immutable message logging - something Ethereum, Solana, or any other chain simply cannot do. We use HCS to store consent proofs and data hashes permanently. Our smart contracts on Hedera EVM automate consent management and revenue distribution. Native Hedera Accounts mean users never manage private keys - seamless UX. And HBAR enables micropayments at scale - just $0.0001 per transaction. This combination is unique to Hedera."

**Actions**:
- Show Hedera integration docs
- Highlight each service
- Show smart contract addresses

**Key Points**:
- "Can't be done elsewhere" - repeat 2-3 times
- All 4 services explained
- Low fees emphasized
- Unique capabilities

---

### Live Demo - Part 1: Hospital Registration & Account Creation (45 seconds)

**Visual**: Frontend + Terminal

**Narration**:
> "Let's start with a hospital registering on MediPact. Watch what happens behind the scenes."

**Actions**:
1. **Frontend**: Navigate to `/hospital/register` or `/hospital/login`
2. **Frontend**: Show hospital registration form
3. **Terminal**: Show backend logs - "Creating Hedera account for hospital..."
4. **Terminal**: Show account creation output:
   ```
   ✅ Hedera account created: 0.0.1234567
   ✅ EVM Address: 0xABC123...
   ✅ Account funded with 100 testnet HBAR
   ```
5. **Frontend**: Show hospital dashboard with Hedera Account ID displayed
6. **HashScan**: Quick view of new account on HashScan

**Key Points**:
- **Hedera Accounts** clearly shown
- Automatic account creation
- EVM compatibility
- Seamless UX (no wallet management)

---

### Live Demo - Part 2: Hospital Data Upload (45 seconds)

**Visual**: Frontend hospital portal

**Narration**:
> "Now the hospital uploads patient data. This CSV contains lab results with patient names, IDs, addresses, and phone numbers - everything we need to anonymize."

**Actions**:
1. **Frontend**: Navigate to `/hospital/upload`
2. **Frontend**: Show upload interface
3. **Frontend**: Upload sample CSV file
4. **Frontend**: Show "Processing..." status
5. **Frontend**: Show processing queue

**Key Points**:
- Clean UI
- Real file upload
- Processing status visible

---

### Live Demo - Part 3: Backend Processing & HCS Integration (60 seconds)

**Visual**: Terminal showing adapter processing

**Narration**:
> "Now watch the magic happen. Our adapter processes the data using double anonymization and K-anonymity enforcement. Patient names become anonymous IDs. Addresses are generalized to country level. Then, we submit proof hashes to Hedera Consensus Service - this is the immutable proof that can't be altered."

**Actions**:
1. **Terminal**: Show adapter processing logs:
   ```
   📊 Reading CSV: 100 records
   🔒 Stage 1 Anonymization: Removing PII...
   🔒 Stage 2 Anonymization: Generalizing for blockchain...
   ✅ K-anonymity enforced: Minimum 5 records per group
   📝 Creating FHIR R4 resources...
   ```
2. **Terminal**: Show HCS submission:
   ```
   🌐 Submitting to Hedera Consensus Service...
   📤 Consent Proof Topic: 0.0.7890123
   📤 Data Proof Topic: 0.0.7890124
   ✅ Transaction ID: 0.0.1234567@1234567890.123456789
   🔗 HashScan: https://hashscan.io/testnet/transaction/...
   ```
3. **Terminal**: Show ConsentManager contract call:
   ```
   📝 Recording consent on ConsentManager contract...
   ✅ Contract Address: 0xf2423F1E568eC90921045be96Ad2D618fCcd9841
   ✅ Transaction: 0xABC123...
   ```
4. **HashScan**: Open and show HCS topic with messages
5. **HashScan**: Show ConsentManager contract interaction

**Key Points**:
- **HCS** clearly demonstrated
- **EVM/Smart Contracts** shown
- Double anonymization explained
- K-anonymity mentioned
- HashScan verification shown

---

### Live Demo - Part 4: Dataset Creation & Marketplace (30 seconds)

**Visual**: Frontend marketplace

**Narration**:
> "Once processed, the anonymized data becomes a searchable dataset in our marketplace. Notice the HashScan links embedded - every dataset is verifiable on-chain."

**Actions**:
1. **Frontend**: Navigate to `/marketplace` or `/researcher/catalog`
2. **Frontend**: Show dataset listing
3. **Frontend**: Highlight HashScan links on dataset cards
4. **Frontend**: Show dataset metadata (disease, country, patient count)

**Key Points**:
- Dataset visible in marketplace
- HashScan links prominent
- Searchable interface

---

### Live Demo - Part 5: Researcher Search & Query (45 seconds)

**Visual**: Frontend researcher portal

**Narration**:
> "Now, a researcher wants to find diabetic patients in Uganda. They log in, search by disease and country, and get a preview of the anonymized data."

**Actions**:
1. **Frontend**: Navigate to `/researcher/login`
2. **Frontend**: Login with researcher credentials
3. **Frontend**: Navigate to `/researcher/catalog` or query interface
4. **Frontend**: Enter search criteria:
   - Disease: "Type 2 Diabetes"
   - Country: "Uganda"
   - Number of Patients: 100
5. **Frontend**: Show query results
6. **Frontend**: Show data preview (anonymized, no PII)
7. **Frontend**: Show price calculation

**Key Points**:
- Easy search interface
- Anonymized data preview
- Price visible

---

### Live Demo - Part 6: Purchase & HBAR Payment (45 seconds)

**Visual**: Frontend + Terminal

**Narration**:
> "The researcher makes a payment using HBAR. Watch the transaction happen in real-time."

**Actions**:
1. **Frontend**: Click "Purchase" button
2. **Frontend**: Show payment interface with HBAR amount
3. **Terminal**: Show backend processing:
   ```
   💰 Payment received: 10,000 HBAR
   ✅ Transaction verified on Hedera
   📝 Transaction ID: 0.0.1234567@1234567890.123456789
   ```
4. **HashScan**: Show payment transaction
5. **Frontend**: Show purchase confirmation

**Key Points**:
- **HBAR** payment shown
- Real transaction
- HashScan verification

---

### Live Demo - Part 7: Smart Contract Revenue Distribution (60 seconds)

**Visual**: Terminal + Frontend + HashScan

**Narration**:
> "Here's where Hedera's smart contracts shine. The RevenueSplitter contract automatically distributes revenue: 60% to patients, 25% to the hospital, 15% to the platform. All in HBAR, all on-chain, all verifiable."

**Actions**:
1. **Terminal**: Show revenue distribution:
   ```
   💰 Triggering RevenueSplitter contract...
   📊 Revenue Split: 60% Patient, 25% Hospital, 15% Platform
   📤 Distributing to 100 patients...
   ✅ Patient 1: 60 HBAR → 0.0.1111111
   ✅ Hospital: 2,500 HBAR → 0.0.1234567
   ✅ Platform: 1,500 HBAR → 0.0.9999999
   ✅ All distributions complete
   ```
2. **HashScan**: Show RevenueSplitter contract:
   - Contract address: `0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392`
   - Show contract interactions
   - Show HBAR transfers
3. **Frontend**: Show patient wallet balance update
4. **Frontend**: Show hospital revenue dashboard
5. **HashScan**: Show individual patient account with HBAR balance

**Key Points**:
- **EVM/Smart Contracts** clearly shown
- **HBAR** transfers visible
- **Hedera Accounts** receiving payments
- Automated distribution
- All verifiable on HashScan

---

### Live Demo - Part 8: Admin Dashboard & Network Impact (45 seconds)

**Visual**: Frontend admin dashboard

**Narration**:
> "MediPact is already making an impact on the Hedera network. Our admin dashboard shows real-time metrics."

**Actions**:
1. **Frontend**: Navigate to `/admin/dashboard`
2. **Frontend**: Show Hedera Metrics section:
   - Total Hedera Accounts Created: [X]
   - HCS Messages Sent: [X]
   - Smart Contract Calls: [X]
   - HBAR Distributed: [X] HBAR
   - Active Patients: [X]
   - Active Hospitals: [X]
   - Active Researchers: [X]
3. **Frontend**: Show network impact:
   - Projected TPS: 0.07 sustained
   - Projected accounts in 6 months: 10,600
4. **Frontend**: Show transaction history with HashScan links

**Key Points**:
- **Success criterion**: Network impact shown
- Real metrics (not placeholders!)
- TPS contribution
- Account creation
- All 4 Hedera services used

---

### Patient Portal & Wallet (30 seconds)

**Visual**: Frontend patient portal

**Narration**:
> "Patients can see their earnings in real-time. Every patient has a Hedera account created automatically, and they can see their HBAR balance and transaction history."

**Actions**:
1. **Frontend**: Navigate to `/patient/wallet` or `/patient/earnings`
2. **Frontend**: Show patient wallet:
   - Hedera Account ID: 0.0.xxxxx
   - HBAR Balance: [X] HBAR
   - Transaction history
   - HashScan links
3. **Frontend**: Show earnings breakdown

**Key Points**:
- Patient control shown
- Hedera Account visible
- HBAR balance displayed
- Transparent earnings

---

### HashScan Deep Dive (30 seconds)

**Visual**: HashScan browser tabs

**Narration**:
> "Everything is verifiable on HashScan. Let me show you the actual transactions."

**Actions**:
1. **HashScan**: Show HCS Topic page with messages
2. **HashScan**: Show ConsentManager contract
3. **HashScan**: Show RevenueSplitter contract
4. **HashScan**: Show patient account with HBAR balance
5. **HashScan**: Show hospital account
6. **HashScan**: Show platform account

**Key Points**:
- Public verification
- Immutability demonstrated
- All transactions visible
- Transparency

---

### Technical Highlights (30 seconds)

**Visual**: Frontend docs or code snippets

**Narration**:
> "Technically, we're using FHIR R4 compliance for interoperability, double anonymization with K-anonymity for privacy, and all four Hedera services for verifiability. This is production-ready, fully deployed, and ready to scale."

**Actions**:
- Show technical docs
- Highlight key features
- Show architecture

**Key Points**:
- Standards compliance
- Privacy protection
- Production-ready

---

### Impact & Validation (30 seconds)

**Visual**: Frontend metrics + real numbers

**Narration**:
> "MediPact is already making an impact. We've created [X] Hedera accounts, sent [X] HCS messages, executed [X] smart contract calls, and distributed [X] HBAR. At scale, we project 10,600 new Hedera accounts in 6 months and 0.07 TPS sustained. This is real network growth, real transactions, and real value for Hedera."

**Actions**:
- Show metrics dashboard
- Highlight real numbers
- Show projections

**Key Points**:
- **Success criterion**: Network impact
- **Validation criterion**: Real metrics
- TPS contribution
- Account creation
- Real value

---

### Conclusion (30 seconds)

**Visual**: Frontend homepage or summary slide

**Narration**:
> "MediPact demonstrates how Hedera's unique services can solve real-world problems in healthcare. We've built a verifiable, ethical data marketplace that empowers patients, enables hospitals, and accelerates research. This is production-ready, fully deployed at medipact.space, and ready to scale. Thank you for watching!"

**Actions**:
- Show live site URL
- Show GitHub link
- Show key metrics summary

**Key Points**:
- Real-world problem solved
- All 4 Hedera services integrated
- Production-ready
- Call to action
- Professional closing

---

## 🎬 PRODUCTION SETUP

### Screen Layout

**Option 1: Split Screen**
- Left 60%: Frontend browser
- Right 40%: Terminal

**Option 2: Full Screen Switching**
- Switch between frontend and terminal as needed
- Use smooth transitions

### Pre-Recording Checklist

**Frontend Preparation**:
- [ ] All services running (frontend, backend, adapter)
- [ ] Test data populated
- [ ] All user accounts ready (hospital, researcher, admin, patient)
- [ ] HashScan links bookmarked
- [ ] Browser cache cleared
- [ ] All demo URLs ready

**Terminal Preparation**:
- [ ] Backend logs visible
- [ ] Adapter ready to process
- [ ] Terminal font size increased for readability
- [ ] Terminal history cleared

**Data Preparation**:
- [ ] Sample CSV file ready
- [ ] Real metrics from `/api/public/metrics`
- [ ] HashScan links for all transactions
- [ ] Demo credentials ready

### Recording Tips

1. **Show, Don't Tell**: Actually click HashScan links, show real transactions
2. **Pause for Impact**: After key statements, pause 1-2 seconds
3. **Highlight Numbers**: Use cursor to point at important metrics
4. **Smooth Transitions**: Use fade transitions between frontend/terminal
5. **Real Data**: Use actual metrics, not placeholders
6. **Emphasize Hedera**: Say "Hedera" and "can't be done elsewhere" multiple times

---

## 📊 JUDGING CRITERIA CHECKLIST

### Innovation (10%)
- [x] Aligns to Open Track (Verifiable Healthcare Systems)
- [x] Unique use of all 4 Hedera services
- [x] Doesn't exist cross-chain (HCS is unique)
- [x] New capabilities for Hedera ecosystem

### Feasibility (10%)
- [x] Can be done with Hedera services
- [x] Needs Web3 (verifiability, immutability)
- [x] Clear understanding of healthcare domain
- [x] Complete solution demonstrated

### Execution (20%)
- [x] Full MVP demonstrated
- [x] Fully functioning solution
- [x] Great UX (frontend shown)
- [x] Production-ready
- [x] Clear design decisions shown

### Integration (15%)
- [x] Deep Hedera integration shown
- [x] All 4 services used (HCS, EVM, Accounts, HBAR)
- [x] Creative integration (double anonymization + HCS)
- [x] HashScan verification shown

### Success (20%)
- [x] Network impact shown (accounts, TPS)
- [x] Real metrics displayed
- [x] Account creation demonstrated
- [x] TPS contribution mentioned
- [x] Exposure to healthcare market

### Validation (15%)
- [x] Real metrics shown
- [x] Production deployment (medipact.space)
- [x] Working solution demonstrated
- [x] Market need clearly explained

### Pitch (10%)
- [x] Clear problem and solution
- [x] Big enough problem ($10B market)
- [x] Well thought out narrative
- [x] Exciting opportunity
- [x] Metrics make sense
- [x] Hedera well represented
- [x] MVP features clearly stated

---

## ⏱️ TIMING BREAKDOWN

- Opening Hook: 10s
- Introduction: 20s
- Problem Statement: 30s
- Solution Overview: 45s
- Demo Part 1 (Hospital Registration): 45s
- Demo Part 2 (Data Upload): 45s
- Demo Part 3 (Processing & HCS): 60s
- Demo Part 4 (Dataset Creation): 30s
- Demo Part 5 (Researcher Search): 45s
- Demo Part 6 (Purchase & HBAR): 45s
- Demo Part 7 (Revenue Distribution): 60s
- Demo Part 8 (Admin Dashboard): 45s
- Patient Portal: 30s
- HashScan Deep Dive: 30s
- Technical Highlights: 30s
- Impact & Validation: 30s
- Conclusion: 30s

**Total: ~7.5 minutes** (Edit to 4.5-5 minutes in post-production)

---

## 🎯 KEY MESSAGES TO REPEAT

1. **"Exclusively on Hedera"** - Say this 3-4 times
2. **"Can't be done on any other blockchain"** - Say this 2-3 times
3. **"All 4 Hedera services"** - Mention repeatedly
4. **"Production-ready"** - Emphasize this
5. **"Real network impact"** - Show actual numbers
6. **"Verifiable on HashScan"** - Show actual links

---

## 📋 DEMO DATA PREPARATION

### Hospital Credentials
- Hospital ID: `HOSP-XXXXX`
- API Key: `[from demo-credentials.json]`
- Login URL: `/hospital/login`

### Researcher Credentials
- Researcher ID: `RES-XXXXX`
- Email: `researcher1@demo.medipact.com`
- Login URL: `/researcher/login`

### Admin Credentials
- Admin access: `/admin/dashboard`
- Metrics endpoint: `/api/public/metrics`

### Sample CSV
- Use `backend/adapter/data/raw_data.csv` for upload
- Or generate new data with `npm run populate-demo`

---

## 🔗 HASHSCAN LINKS TO SHOW

1. **HCS Topic** (Consent Proofs)
   - Example: `https://hashscan.io/testnet/topic/[TOPIC_ID]`
   - Show messages in topic

2. **HCS Topic** (Data Proofs)
   - Example: `https://hashscan.io/testnet/topic/[TOPIC_ID]`
   - Show provenance records

3. **Smart Contract** (RevenueSplitter)
   - `https://hashscan.io/testnet/contract/0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392`
   - Show contract interactions and HBAR transfers

4. **Smart Contract** (ConsentManager)
   - `https://hashscan.io/testnet/contract/0xf2423F1E568eC90921045be96Ad2D618fCcd9841`
   - Show consent records

5. **Account Examples**
   - Patient Wallet: `https://hashscan.io/testnet/account/[ACCOUNT_ID]`
   - Hospital Account: `https://hashscan.io/testnet/account/[ACCOUNT_ID]`
   - Platform Account: `https://hashscan.io/testnet/account/[ACCOUNT_ID]`

---

## 🎥 PRODUCTION TIPS

### Before Recording
- [ ] Test all flows end-to-end (3x minimum)
- [ ] Prepare demo data (have backup data ready)
- [ ] Clear browser cache and cookies
- [ ] Close unnecessary tabs and applications
- [ ] Test screen recording software (OBS)
- [ ] Prepare narration script (practice 2-3 times)
- [ ] Test microphone quality
- [ ] Prepare HashScan links (have them ready to paste)
- [ ] Get real metrics from `/api/public/metrics`
- [ ] Have backup plan if something fails
- [ ] Set up split screen layout (frontend + terminal)

### During Recording
- [ ] **Opening Hook:** Start with compelling statistic (10 seconds)
- [ ] Speak clearly and at moderate pace (not too fast!)
- [ ] Pause between sections (2-3 second pauses)
- [ ] Highlight key features with cursor or annotations
- [ ] Show HashScan links (actually click them!)
- [ ] Demonstrate real transactions (not just UI)
- [ ] Show actual numbers (not placeholders)
- [ ] Emphasize Hedera integration throughout
- [ ] Switch smoothly between frontend and terminal
- [ ] Show terminal output clearly (zoom if needed)
- [ ] Keep it under 5 minutes (aim for 4.5 minutes)
- [ ] Smile and show enthusiasm!
- [ ] If you make a mistake, pause and restart that section

### After Recording
- [ ] Edit for clarity (remove long pauses, mistakes)
- [ ] Add captions/subtitles (YouTube auto-generates, but review them)
- [ ] Add background music (optional, keep it subtle)
- [ ] Add transitions between sections
- [ ] Add text overlays for key points (HCS, EVM, Accounts, HBAR)
- [ ] Add arrows/annotations to highlight important features
- [ ] Add labels for frontend vs terminal sections
- [ ] Upload to YouTube (unlisted or public)
- [ ] Add description with links
- [ ] Embed in pitch deck
- [ ] Test video playback in pitch deck

### Professional Quality Checklist
- [ ] Clear audio (no background noise)
- [ ] Good video quality (1080p minimum)
- [ ] Smooth transitions
- [ ] Professional editing
- [ ] Engaging narration
- [ ] Clear visuals (frontend and terminal readable)
- [ ] Working links shown
- [ ] Real data demonstrated
- [ ] All 4 Hedera services clearly shown
- [ ] HashScan verification demonstrated

---

## 🚀 QUICK REFERENCE: HEDERA SERVICES DEMONSTRATION

### HCS (Hedera Consensus Service)
- **When**: Part 3 (Backend Processing)
- **Show**: Terminal logs showing HCS submission
- **Verify**: HashScan topic page with messages
- **Emphasize**: "Immutable proof that can't be altered"

### EVM (Smart Contracts)
- **When**: Part 3 (ConsentManager) + Part 7 (RevenueSplitter)
- **Show**: Terminal logs showing contract calls
- **Verify**: HashScan contract pages
- **Emphasize**: "Automated consent and revenue distribution"

### Hedera Accounts
- **When**: Part 1 (Registration) + Part 7 (Revenue Distribution) + Part 8 (Patient Portal)
- **Show**: Account IDs in frontend, terminal logs, HashScan
- **Verify**: HashScan account pages with HBAR balances
- **Emphasize**: "Seamless UX, no wallet management"

### HBAR (Micropayments)
- **When**: Part 6 (Purchase) + Part 7 (Revenue Distribution)
- **Show**: Payment interface, terminal logs, HashScan transactions
- **Verify**: HashScan showing HBAR transfers
- **Emphasize**: "Low-cost micropayments at scale"

---

This script ensures you hit every judging criterion while clearly demonstrating all Hedera features and your complete frontend/backend system!

**Good luck with your demo! 🚀**
