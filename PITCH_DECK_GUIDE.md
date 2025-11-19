# Pitch Deck Creation Guide - URGENT

**Time Required**: 3-4 hours  
**Deadline**: Before submission deadline  
**Format**: PDF (10-15 slides)

---

## Quick Checklist

- [ ] Create pitch deck using template
- [ ] Add team information
- [ ] Add real metrics from dashboard
- [ ] Embed demo video link
- [ ] Add screenshots
- [ ] Export as PDF
- [ ] Verify PDF is readable

---

## Step 1: Choose Your Tool (15 minutes)

### Option 1: Google Slides (Recommended - Fastest)
1. Go to https://slides.google.com
2. Create new presentation
3. Use template from `docs/PITCH_DECK_TEMPLATE.md`
4. Export as PDF when done

### Option 2: PowerPoint
1. Open PowerPoint
2. Create new presentation
3. Use template from `docs/PITCH_DECK_TEMPLATE.md`
4. Export as PDF

### Option 3: Canva (Best Design)
1. Go to https://www.canva.com
2. Search "Pitch Deck" template
3. Customize with your content
4. Export as PDF

---

## Step 2: Get Required Information (30 minutes)

### 2.1 Team Information
- [ ] Team member names
- [ ] Team member roles
- [ ] Team member LinkedIn/GitHub (optional)

### 2.2 Real Metrics
```bash
# Get metrics from your production API
curl https://medipact-production.up.railway.app/api/public/metrics

# Or from localhost if running locally
curl http://localhost:8080/api/public/metrics
```

**Save these values**:
- Total Hedera Accounts Created
- Monthly Active Hedera Accounts
- Total HCS Messages
- Total Smart Contract Calls
- Total HBAR Distributed
- Estimated TPS Contribution

### 2.3 Screenshots Needed
1. **Homepage**: `http://localhost:3000` or `https://www.medipact.space`
2. **Hospital Upload**: `/hospital/upload`
3. **Researcher Query**: `/researcher/query`
4. **Metrics Dashboard**: `/admin/dashboard` or `/api/public/metrics`
5. **HashScan Links**: Show actual transactions
6. **Smart Contracts**: Show contract pages on HashScan

### 2.4 Demo Video Link
- Get YouTube link from demo video
- Format: `https://www.youtube.com/watch?v=[VIDEO_ID]`

### 2.5 Contract Addresses
- ConsentManager: `0xf2423F1E568eC90921045be96Ad2D618fCcd9841`
- RevenueSplitter: `0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392`
- HashScan Links:
  - ConsentManager: https://hashscan.io/testnet/contract/0xf2423F1E568eC90921045be96Ad2D618fCcd9841
  - RevenueSplitter: https://hashscan.io/testnet/contract/0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392

---

## Step 3: Create Slides (2-3 hours)

### Slide 1: Title Slide
**Content**:
- **Title**: MediPact - The Verifiable Health Pact
- **Subtitle**: Built on Hedera Hashgraph
- **Event**: Hedera Hello Future: Ascension 2025
- **Track**: Open Track - Verifiable Healthcare Systems
- **Team Name**: [Your Team Name]
- **Date**: November 2025

**Design Tips**:
- Use Hedera brand color (#00A9CE)
- Large, bold title
- Clean, professional layout

---

### Slide 2: Team and Project Introduction
**Content**:
- **Team Members**:
  - [Name 1] - [Role] (e.g., Full-Stack Developer)
  - [Name 2] - [Role]
  - [Name 3] - [Role]
- **Project Overview**: 
  > MediPact is a verifiable medical data marketplace that solves the patient data black market by creating a transparent, ethical platform using Hedera's blockchain technology.
- **Problem We're Solving**:
  - Patients' data sold without consent or compensation
  - Hospitals have no safe way to share data
  - Researchers need verified, ethical data sources

---

### Slide 3: Innovation (10%)
**Content**:
- ✅ **First-of-its-kind** on Hedera:
  - Healthcare data marketplace with immutable consent proofs
  - Automated revenue distribution using smart contracts
  - Native Hedera account integration for seamless UX
- ✅ **Unique Hedera Integration**:
  - HCS for immutable audit trail
  - EVM smart contracts for automation
  - Native accounts for wallet management
  - HBAR for micropayments
- ✅ **Cross-chain Innovation**:
  - No other blockchain offers HCS for healthcare consent management
  - Hedera's low fees enable micropayments at scale

**Visual**: Add architecture diagram or Hedera services diagram

---

### Slide 4: Feasibility (10%)
**Content**:
- ✅ **All Hedera Services Available**:
  - Hedera Consensus Service (HCS) ✅
  - Hedera EVM Smart Contracts ✅
  - Hedera Account IDs ✅
  - HBAR Micropayments ✅
- ✅ **Web3 Solution Required**:
  - Immutable consent records (blockchain needed)
  - Transparent revenue distribution (smart contracts)
  - Verifiable data provenance (HCS)
  - Trustless micropayments (HBAR)
- ✅ **Business Model**:
  - Revenue split: 60% Patient / 25% Hospital / 15% Platform
  - Category-based pricing (6 tiers)
  - Volume discounts
  - Sustainable and scalable

**Visual**: Add business model diagram or revenue split visualization

---

### Slide 5: Execution (20%)
**Content**:
- ✅ **MVP Features**:
  - Hospital CSV upload and processing
  - Double anonymization (PII removal)
  - HCS proof submission
  - Researcher data search and query
  - Flattened CSV export format
  - Purchase flow with payment verification
  - Automated revenue distribution (60/25/15)
  - Hedera account creation for all users
  - Wallet management
  - Admin dashboard with metrics
- ✅ **Technical Implementation**:
  - Backend: Express.js REST API
  - Frontend: Next.js 15 with TypeScript
  - Smart Contracts: Solidity 0.8.20
  - Database: PostgreSQL/SQLite
  - Deployment: Railway + Vercel
- ✅ **Strategy & Planning**:
  - Short-term: Mainnet deployment, mobile app
  - Medium-term: HTS integration, AI features
  - Long-term: Global expansion, EHR integration

**Visual**: Add screenshots of key features

---

### Slide 6: Integration (15%)
**Content**:
- ✅ **Hedera Consensus Service (HCS)**
  - Immutable consent proof storage
  - Data hash verification
  - Public audit trail on HashScan
  - ~$0.0001 per message
- ✅ **Hedera EVM Smart Contracts**
  - ConsentManager: `0xf2423F1E568eC90921045be96Ad2D618fCcd9841`
  - RevenueSplitter: `0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392`
  - Automated revenue distribution
  - Low gas costs
- ✅ **Hedera Account IDs**
  - Native accounts (0.0.xxxxx) for all users
  - EVM-compatible for smart contracts
  - Seamless wallet management
- ✅ **HBAR Micropayments**
  - Automated 60/25/15 revenue split
  - Instant settlements
  - Low transaction fees

**Visual**: Add HashScan links as clickable buttons or QR codes

---

### Slide 7: Success (20%)
**Content**:
- ✅ **Metrics Dashboard** (`/api/public/metrics`):
  - **Total Hedera Accounts Created**: [X] accounts (use real number)
  - **Monthly Active Accounts**: [X] accounts (use real number)
  - **Total HCS Messages**: [X] messages (use real number)
  - **Total Smart Contract Calls**: [X] calls (use real number)
  - **Total HBAR Distributed**: [X] HBAR (use real number)
  - **Estimated TPS Contribution**: [X] TPS (use real number)
- ✅ **Network Growth**:
  - Every user gets a Hedera account
  - Every data transaction creates HCS messages
  - Every purchase triggers smart contract calls
  - Every payment distributes HBAR
- ✅ **Scalability**:
  - Ready for thousands of hospitals
  - Ready for millions of patients
  - All transactions on Hedera

**Visual**: Add screenshot of metrics dashboard

---

### Slide 8: Validation (15%)
**Content**:
- ✅ **User Testing**:
  - Hospital administrators tested upload flow
  - Researchers tested search and purchase
  - Patients reviewed consent management
  - Positive feedback on UX and transparency
- ✅ **Market Validation**:
  - Problem validated by healthcare professionals
  - Solution validated by researchers
  - Business model validated by stakeholders
  - Technical approach validated by developers
- ✅ **Traction**:
  - [X] hospitals registered (use real number if available)
  - [X] researchers verified (use real number if available)
  - [X] patients enrolled (use real number if available)
  - [X] datasets available (use real number if available)

**Visual**: Add testimonials or feedback quotes if available

---

### Slide 9: Pitch (10%)
**Content**:
- **Problem**: 
  - Multi-billion dollar patient data black market
  - Patients exploited without consent or compensation
  - Hospitals trapped with no safe sharing mechanism
  - Researchers need verified, ethical data
- **Solution**:
  - Verifiable medical data marketplace on Hedera
  - Immutable consent management (HCS)
  - Automated revenue distribution (Smart Contracts)
  - Fair compensation (60/25/15 split)
  - Transparent and ethical
- **Opportunity**:
  - $XX billion healthcare data market
  - Growing research needs
  - Regulatory compliance requirements
  - Patient empowerment movement
- **Hedera Representation**:
  - Built exclusively on Hedera
  - Showcases Hedera's unique capabilities
  - Demonstrates real-world blockchain use case

**Visual**: Add problem-solution diagram

---

### Slide 10: Demo Video
**Content**:
- **Embedded Demo Video** or **Video Link**
- **YouTube Link**: [YOUR_YOUTUBE_LINK]
- **Video Highlights**:
  1. Hospital CSV upload
  2. Data anonymization and HCS submission
  3. Researcher data search
  4. Purchase and payment
  5. Automated revenue distribution
  6. HashScan verification
- **Live Demo**: https://www.medipact.space

**Visual**: 
- Embed YouTube video (if using Google Slides/PowerPoint)
- Or add large clickable link/QR code

---

### Slide 11: Technical Architecture
**Content**:
- **System Architecture Diagram**:
  ```
  Frontend (Next.js)
      ↓
  Backend API (Express.js)
      ↓
  Adapter (CSV → FHIR)
      ↓
  Hedera Network
      ├── HCS (Consent Proofs)
      ├── EVM (Smart Contracts)
      ├── Accounts (0.0.xxxxx)
      └── HBAR (Micropayments)
  ```
- **Key Technologies**:
  - Next.js 15, TypeScript, Tailwind CSS
  - Express.js, Node.js, PostgreSQL
  - Solidity 0.8.20, Hardhat 2.x
  - @hashgraph/sdk, FHIR R4

**Visual**: Add architecture diagram (use Mermaid or draw.io)

---

### Slide 12: Smart Contracts
**Content**:
- **Deployed Contracts (Hedera Testnet)**
- **ConsentManager**
  - Address: `0xf2423F1E568eC90921045be96Ad2D618fCcd9841`
  - Function: Patient consent registry
  - HashScan: [Link]
- **RevenueSplitter**
  - Address: `0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392`
  - Function: Automated 60/25/15 revenue distribution
  - HashScan: [Link]
- **Features**:
  - EVM compatible
  - Gas optimized
  - Access controlled
  - Fully tested

**Visual**: Add HashScan screenshots or contract code snippets

---

### Slide 13: Future Roadmap
**Content**:
- **Short Term (3-6 months)**:
  - Mainnet deployment
  - Mobile app for patients
  - Enhanced analytics
  - Multi-language support
- **Medium Term (6-12 months)**:
  - Hedera Token Service (HTS) integration
  - AI-powered data quality scoring
  - Real-time data streaming
  - Advanced consent management
- **Long Term (12+ months)**:
  - Global expansion
  - Major EHR system integration
  - Regulatory certifications (HIPAA, GDPR)
  - Research collaboration platform
- **Key Learnings**:
  - Hedera's low fees enable micropayments at scale
  - HCS provides unique immutable audit trail
  - Native accounts simplify UX significantly

**Visual**: Add roadmap timeline

---

### Slide 14: Thank You
**Content**:
- **MediPact** - The Verifiable Health Pact
- **Built on Hedera Hashgraph**
- **Live Demo**: https://www.medipact.space
- **GitHub**: https://github.com/[your-username]/medipact
- **Email**: [your-email@medipact.space]
- **Questions?**

**Visual**: Clean, professional closing slide

---

## Step 4: Design Tips

### Color Scheme
- Primary: Hedera Blue (#00A9CE)
- Secondary: White, Gray
- Accent: Green (for success metrics)

### Typography
- Headings: Bold, large (24pt+)
- Body: Readable (14-18pt)
- Code: Monospace font

### Visual Elements
- Use screenshots of actual UI
- Add HashScan links as clickable buttons
- Include architecture diagrams
- Use icons for services (HCS, EVM, Accounts, HBAR)

### Consistency
- Same font throughout
- Same color scheme
- Same layout style
- Professional and clean

---

## Step 5: Export as PDF (5 minutes)

### Google Slides
1. File → Download → PDF Document (.pdf)
2. Save as `MediPact-Pitch-Deck.pdf`

### PowerPoint
1. File → Export → Create PDF/XPS
2. Save as `MediPact-Pitch-Deck.pdf`

### Canva
1. Download → PDF Print
2. Save as `MediPact-Pitch-Deck.pdf`

---

## Step 6: Final Checklist

- [ ] All 14 slides created
- [ ] Team information added
- [ ] Real metrics added (not placeholders)
- [ ] Demo video link embedded/added
- [ ] Screenshots included
- [ ] HashScan links added
- [ ] Contract addresses correct
- [ ] Design is consistent and professional
- [ ] PDF exported and readable
- [ ] PDF file size is reasonable (< 10MB)

---

## Quick Reference

### Get Metrics
```bash
curl https://medipact-production.up.railway.app/api/public/metrics
```

### HashScan Links
- ConsentManager: https://hashscan.io/testnet/contract/0xf2423F1E568eC90921045be96Ad2D618fCcd9841
- RevenueSplitter: https://hashscan.io/testnet/contract/0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392

### Key URLs
- Live Demo: https://www.medipact.space
- Backend API: https://medipact-production.up.railway.app
- API Docs: https://medipact-production.up.railway.app/api-docs
- Metrics: https://medipact-production.up.railway.app/api/public/metrics

---

**Time Estimate**: 3-4 hours total
**Priority**: CRITICAL - Required for submission

Good luck! 🚀

