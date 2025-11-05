# MediPact - Complete Development Plan

**Hackathon**: Hedera Hello Future: Ascension 2025  
**Track**: Open Track - Verifiable Healthcare Systems  
**Submission Deadline**: November 22, 2025  
**Project**: MediPact - The Verifiable Health Pact. Built on Hedera.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Hackathon Strategy](#hackathon-strategy)
3. [Technical Architecture](#technical-architecture)
4. [Development Timeline](#development-timeline)
5. [Phase-by-Phase Breakdown](#phase-by-phase-breakdown)
6. [Deliverables Checklist](#deliverables-checklist)
7. [Risk Management](#risk-management)
8. [Success Metrics](#success-metrics)

---

## Project Overview

### The Problem
- **Patients are Exploited**: Medical data is sold without consent or compensation
- **Researchers are Blind**: No way to verify data authenticity or ethical sourcing
- **Hospitals are Trapped**: No safe, legal way to share data for research

### Our Solution
MediPact is a verifiable medical data marketplace that uses Hedera Consensus Service (HCS) to create immutable proof of consent and data authenticity, enabling ethical, transparent medical data transactions.

### MVP Focus
We're building the **"In-Person Bridge"** (Path 2) - the core adapter engine that:
1. Reads hospital EHR data (CSV)
2. Anonymizes patient information
3. Submits proof hashes to HCS
4. Displays verifiable transactions on HashScan

---

## Hackathon Strategy

### What We PITCH (Pitch Deck & Demo Video)
- **Full Vision**: Describe the entire unified two-path platform
- **Path 1 (Digital Patient)**: Show mockups of mobile/web app with Health Wallet, Passive Marketplace, and Active Studies
- **Path 2 (In-Person Patient)**: Describe the thumbprint-and-Mobile-Money flow
- **Mockups**: Beautiful screenshots showing the complete vision

### What We BUILD (Actual Code - MVP)
- **Core Engine**: Path 2 (In-Person flow) - the MediPact Adapter
- **Demo Flow**: CSV → Anonymize → HCS → HashScan → Payout Simulation
- **Data Scope**: Lab results ONLY (structured, simple to anonymize)

---

## Technical Architecture

### Tech Stack
- **Backend/Adapter**: Node.js / JavaScript
- **Frontend**: React/Next.js / TypeScript (optional for demo)
- **Blockchain**: Hedera Hashgraph
  - Hedera Consensus Service (HCS)
  - HBAR for payments
  - Smart Contracts (Solidity)
- **Dependencies**: 
  - `@hashgraph/sdk` - Hedera SDK
  - `hedera-agent-kit` - HCS tools
  - `dotenv` - Environment variables

### Project Structure
```
medipact/
├── adapter/              # Core engine (JavaScript)
│   ├── data/            # Sample EHR data
│   ├── src/
│   │   ├── index.js     # Main entry point
│   │   ├── anonymizer/  # Data anonymization
│   │   ├── hedera/      # HCS integration
│   │   └── utils/       # Helper functions
│   └── tests/
├── contracts/            # Smart contracts (Solidity)
├── frontend/             # Demo UI (TypeScript/React)
├── backend/              # API server (optional)
└── docs/                 # Documentation
```

---

## Development Timeline

**Total Duration**: ~21 days (Nov 3 - Nov 22, 2025)

### Week 1: Foundation & Core Integration
- **Days 1-2**: Setup & Hedera Integration
- **Days 3-5**: Data Anonymization
- **Days 6-7**: Adapter Core Logic

### Week 2: Features & Polish
- **Days 8-10**: Smart Contracts & Payout Simulation
- **Days 11-14**: Demo UI & Testing
- **Days 15-16**: Integration & Bug Fixes

### Week 3: Submission Prep
- **Days 17-18**: Demo Video & Pitch Deck
- **Days 19-20**: Final Testing & Documentation
- **Day 21**: Submission

---

## Phase-by-Phase Breakdown

### Phase 1: Foundation & Setup ✅
**Status**: Complete  
**Duration**: Days 1-2

**Tasks**:
- [x] Initialize Git repository
- [x] Set up project structure
- [x] Clone Hedera reference repositories (local)
- [x] Create README and documentation
- [x] Configure development environment
- [x] Convert backend to JavaScript

**Deliverables**:
- Complete project structure
- All documentation files
- GitHub repository ready

---

### Phase 2: Hedera Integration Layer
**Status**: In Progress  
**Duration**: Days 3-5  
**Priority**: HIGH

**Tasks**:
- [ ] Set up Node.js project (`package.json`)
- [ ] Install dependencies:
  - `@hashgraph/sdk`
  - `hedera-agent-kit`
  - `dotenv`
- [ ] Create Hedera testnet account (if not exists)
- [ ] Configure `.env` file with credentials
- [ ] Create HCS topic for consent proofs
- [ ] Create HCS topic for data proofs
- [ ] Test topic creation (verify on HashScan)
- [ ] Test message submission
- [ ] Create utility functions for HCS operations

**Key Files**:
- `adapter/src/hedera/hcs-client.js`
- `.env` (local, not committed)

**Acceptance Criteria**:
- Can create HCS topics successfully
- Can submit messages to topics
- Transactions visible on HashScan
- Error handling implemented

---

### Phase 3: Data Anonymization Service
**Status**: Pending  
**Duration**: Days 4-6  
**Priority**: HIGH

**Tasks**:
- [ ] Create sample EHR data (`adapter/data/raw_data.csv`)
  - Include: Name, ID, Address, Phone, Lab Results
  - At least 5-10 sample patients
- [ ] Build anonymization service
  - Remove PII: name, ID, address, phone
  - Generate anonymous patient ID (format: `PID-001`, `PID-002`, etc.)
  - Preserve medical data: lab results, dates, values
- [ ] Create hash function for anonymized data
  - Use SHA-256 or similar
  - Hash the entire anonymized record
- [ ] Test anonymization with sample data
- [ ] Create output file (`anonymized_data.csv`)

**Key Files**:
- `adapter/src/anonymizer/anonymize.js`
- `adapter/src/utils/hash.js`
- `adapter/data/raw_data.csv`
- `adapter/data/anonymized_data.csv` (generated)

**Acceptance Criteria**:
- All PII removed from output
- Anonymous IDs generated correctly
- Medical data preserved
- Hash generation works correctly

---

### Phase 4: MediPact Adapter Core
**Status**: Pending  
**Duration**: Days 7-9  
**Priority**: HIGH

**Tasks**:
- [ ] Build main adapter script (`adapter/src/index.js`)
  - Read CSV file
  - Process each patient record
  - Call anonymization service
  - Generate consent proof hash
  - Generate data proof hash
- [ ] Integrate with HCS
  - Submit consent proof to HCS topic
  - Submit data proof to HCS topic
  - Get transaction IDs
- [ ] Generate HashScan links
  - Format: `https://hashscan.io/testnet/transaction/{transactionId}`
- [ ] Create output file (anonymized_data.csv)
- [ ] Add comprehensive logging
- [ ] Add error handling
- [ ] Create command-line interface

**Key Files**:
- `adapter/src/index.js` (main orchestrator)

**Acceptance Criteria**:
- Script runs end-to-end successfully
- All data processed correctly
- HCS transactions submitted
- HashScan links generated
- Output file created
- Error messages clear

---

### Phase 5: Smart Contracts (Optional)
**Status**: Pending  
**Duration**: Days 10-11  
**Priority**: MEDIUM

**Tasks**:
- [ ] Design RevenueSplitter contract
  - 60% Patient, 25% Hospital, 15% MediPact
  - Function to receive payments
  - Function to distribute funds
- [ ] Design ConsentManager contract
  - Store consent records
  - Link to HCS topic IDs
- [ ] Write Solidity contracts
- [ ] Test contracts locally (Hardhat)
- [ ] Deploy to Hedera Testnet (optional)
- [ ] Document contract addresses

**Key Files**:
- `contracts/RevenueSplitter.sol`
- `contracts/ConsentManager.sol`

**Acceptance Criteria**:
- Contracts compile without errors
- Basic functionality tested
- Deployment successful (if attempted)

---

### Phase 6: Payout Simulation
**Status**: Pending  
**Duration**: Days 12-13  
**Priority**: MEDIUM

**Tasks**:
- [ ] Create payout simulation service
- [ ] Calculate revenue split (60/25/15)
- [ ] Simulate HBAR to local currency conversion
  - Example: 1 HBAR = 1000 UGX (Ugandan Shillings)
- [ ] Generate payout message (Mobile Money format)
- [ ] Display in adapter output
- [ ] Format: "PAYOUT SIMULATED: 2,800 UGX sent to patient 077...XXX"

**Key Files**:
- `adapter/src/utils/payout.js` (new file)

**Acceptance Criteria**:
- Payout calculations correct
- Currency conversion realistic
- Output format clear

---

### Phase 7: Demo UI (Optional)
**Status**: Pending  
**Duration**: Days 14-15  
**Priority**: LOW

**Tasks**:
- [ ] Set up Next.js project (if time permits)
- [ ] Create AdapterDemo component
  - Show CSV input
  - Show anonymized output
  - Show HCS transaction links
- [ ] Create ConsentForm component
  - Display consent information
- [ ] Create HashScanLink component
  - Display links to transactions
- [ ] Connect to adapter script via API (if needed)
- [ ] Basic styling

**Key Files**:
- `frontend/src/components/AdapterDemo/AdapterDemo.tsx`
- `frontend/src/components/ConsentForm/ConsentForm.tsx`
- `frontend/src/components/HashScanLink/HashScanLink.tsx`

**Acceptance Criteria**:
- UI displays adapter flow
- Links to HashScan work
- Basic visual appeal

---

### Phase 8: Testing & Polish
**Status**: Pending  
**Duration**: Days 16-17  
**Priority**: HIGH

**Tasks**:
- [ ] End-to-end testing of adapter flow
- [ ] Test with different CSV formats
- [ ] Test HCS integration thoroughly
- [ ] Verify HashScan links work
- [ ] Test error scenarios
- [ ] Fix bugs
- [ ] Improve error messages
- [ ] Add input validation
- [ ] Code cleanup and comments
- [ ] Performance optimization (if needed)

**Acceptance Criteria**:
- All core features work reliably
- Error handling robust
- Code is clean and documented

---

### Phase 9: Demo Video & Pitch Deck
**Status**: Pending  
**Duration**: Days 18-19  
**Priority**: HIGH

**Tasks**:

**Demo Video**:
- [ ] Record screen demonstration
  - Show `raw_data.csv` file
  - Run adapter script
  - Show anonymized output
  - Show HashScan transaction
  - Show payout simulation
- [ ] Add narration/voiceover
- [ ] Edit video (trim, add captions if needed)
- [ ] Upload to YouTube
- [ ] Get YouTube link

**Pitch Deck**:
- [ ] Create presentation (PDF)
- [ ] Include sections:
  - Team and project introduction
  - Problem statement
  - Solution overview
  - Technical architecture
  - Demo video link (embedded)
  - Future roadmap
- [ ] Design mockups (Path 1 vision)
- [ ] Export to PDF

**Key Files**:
- `docs/pitch-deck.pdf`
- Demo video (YouTube)

**Acceptance Criteria**:
- Video clearly shows MVP working
- Pitch deck professional and complete
- Demo video link embedded in deck

---

### Phase 10: Submission Prep
**Status**: Pending  
**Duration**: Days 20-21  
**Priority**: HIGH

**Tasks**:
- [ ] Final code review
- [ ] Update README with final information
- [ ] Ensure all submission requirements met:
  - [ ] GitHub repo link
  - [ ] Project description (max 100 words)
  - [ ] Tech stack list
  - [ ] Pitch deck (PDF)
  - [ ] Demo video (YouTube link)
  - [ ] Project demo link (if applicable)
- [ ] Test demo link (if applicable)
- [ ] Final commit to GitHub
- [ ] Submit to hackathon platform
- [ ] Verify submission received

**Acceptance Criteria**:
- All submission items complete
- Repository is clean and organized
- Documentation is comprehensive
- Submission successful

---

## Deliverables Checklist

### Code Deliverables
- [x] GitHub repository with code
- [ ] Working adapter script
- [ ] Sample EHR data file
- [ ] Anonymization service
- [ ] HCS integration
- [ ] Smart contracts (optional)
- [ ] Demo UI (optional)

### Documentation Deliverables
- [x] README.md
- [x] PROJECT_STRUCTURE.md
- [x] Development plan
- [ ] Code comments
- [ ] Setup instructions
- [ ] Testing instructions

### Submission Deliverables
- [ ] GitHub repository link
- [ ] Project description (100 words max)
- [ ] Tech stack list
- [ ] Pitch deck (PDF)
- [ ] Demo video (YouTube link)
- [ ] Project demo link (if applicable)

---

## Risk Management

### Identified Risks

1. **HCS Integration Complexity**
   - **Risk**: Difficulty integrating with Hedera
   - **Mitigation**: Use `hedera-agent-kit` which simplifies HCS operations
   - **Fallback**: Use `@hashgraph/sdk` directly with examples from docs

2. **Time Constraints**
   - **Risk**: Not enough time to complete all features
   - **Mitigation**: Focus on core adapter engine first, skip optional features
   - **Priority**: MVP features only (adapter, HCS, anonymization)

3. **Testing Issues**
   - **Risk**: Bugs discovered late
   - **Mitigation**: Test early and often, use Hedera Testnet
   - **Fallback**: Fix critical bugs only, document known issues

4. **Demo Video Issues**
   - **Risk**: Technical difficulties recording
   - **Mitigation**: Record early version, iterate if needed
   - **Fallback**: Simple screen recording with narration

5. **Documentation Gaps**
   - **Risk**: Incomplete documentation
   - **Mitigation**: Document as we go, update README regularly

---

## Success Metrics

### MVP Success Criteria
- [x] Project structure complete
- [ ] Adapter script runs successfully
- [ ] Reads CSV file correctly
- [ ] Anonymizes data correctly
- [ ] Submits hashes to HCS
- [ ] Shows HashScan link
- [ ] Displays payout simulation

### Hackathon Judging Criteria Alignment

**Innovation (10%)**:
- Novel approach to verifiable healthcare
- Unique two-path onboarding strategy
- Uses HCS for immutable proof

**Feasibility (10%)**:
- Uses Hedera network services correctly
- Addresses real-world problem
- Technically achievable

**Execution (20%)**:
- Working MVP with core features
- Clean code structure
- Good user experience

**Integration (15%)**:
- Deep Hedera integration (HCS)
- Proper use of Hedera services
- Creative use of blockchain

**Success (20%)**:
- Creates verifiable transactions
- Enables ethical data marketplace
- Potential for high TPS

**Validation (15%)**:
- Addresses validated market need
- Targets real users
- Clear value proposition

**Pitch (10%)**:
- Clear problem-solution presentation
- Demonstrates technical capability
- Shows market opportunity

---

## Daily Workflow

### Morning (2-3 hours)
- Review previous day's progress
- Plan day's tasks
- Start with highest priority item

### Afternoon (2-3 hours)
- Continue implementation
- Test as you build
- Commit code regularly

### Evening (1-2 hours)
- Review and document
- Update plan if needed
- Prepare for next day

---

## Key Milestones

1. **Milestone 1**: Hedera Integration Working (Day 5)
   - HCS topics created
   - Messages submitted successfully

2. **Milestone 2**: Anonymization Working (Day 6)
   - Data anonymized correctly
   - Hashes generated

3. **Milestone 3**: End-to-End Flow (Day 9)
   - CSV → Anonymize → HCS → HashScan

4. **Milestone 4**: Demo Ready (Day 17)
   - All core features working
   - Ready for video recording

5. **Milestone 5**: Submission Ready (Day 21)
   - All deliverables complete
   - Submitted to platform

---

## Notes & Tips

### Development Tips
- **Keep it simple**: Focus on working demo, not perfect code
- **Test frequently**: Verify HCS transactions on HashScan after each integration
- **Document as you go**: Add comments for complex logic
- **Commit regularly**: Small, frequent commits are better
- **Use Hedera Testnet**: Free, no risk, fast

### Best Practices
- Use ES modules in JavaScript (`import/export`)
- Follow JavaScript best practices
- Keep functions small and focused
- Add error handling everywhere
- Use meaningful variable names
- Comment complex logic

### Resources
- Hedera Documentation: https://docs.hedera.com/
- HashScan Explorer: https://hashscan.io/
- Hedera Portal: https://portal.hedera.com/
- Local Reference: `../hedera-repos/` (for reference only)

---

## Final Checklist Before Submission

- [ ] All code committed to GitHub
- [ ] README is comprehensive
- [ ] Demo video uploaded to YouTube
- [ ] Pitch deck created and exported
- [ ] Project description written (100 words)
- [ ] Tech stack listed
- [ ] All submission requirements met
- [ ] Repository is public
- [ ] Demo link works (if applicable)
- [ ] Final review completed

---

**Good luck with the hackathon! Let's build something amazing! 🚀**

---

*Last Updated: [Current Date]*  
*Project: MediPact - The Verifiable Health Pact. Built on Hedera.*

