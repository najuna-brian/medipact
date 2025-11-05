# MediPact Development Plan

## Project Overview

**MediPact** - The Verifiable Health Pact. Built on Hedera.

**Hackathon**: Hedera Hello Future: Ascension 2025  
**Track**: Open Track - Verifiable Healthcare Systems  
**Submission Deadline**: November 22, 2025

## Hackathon Strategy: "Pitch the Vision, Build the Core"

### What We PITCH (Pitch Deck & Demo Video)
- Full Vision: Describe the entire unified two-path platform
- Path 1 (Digital Patient): Show mockups of mobile/web app with Health Wallet, Passive Marketplace, and Active Studies features
- Path 2 (In-Person Patient): Describe the thumbprint-and-Mobile-Money flow for non-digital users
- Mockups: Beautiful screenshots showing the complete vision

### What We BUILD (Actual Code - MVP)
- Focus: Build the core engine - Path 2 (In-Person flow) - the MediPact Adapter
- Demo Flow: Simulated EHR → Adapter Script → Anonymization → HCS Proof → HashScan → Payout Simulation
- Data Scope: Lab results ONLY (structured, simple to anonymize and demo fast)

## Development Phases

### Phase 1: Foundation & Setup ✅
**Status**: Complete
- [x] Initialize Git repository
- [x] Set up project structure
- [x] Clone Hedera reference repositories
- [x] Create README and documentation
- [x] Configure development environment

### Phase 2: Hedera Integration Layer ✅
**Status**: Complete
- [x] Set up Hedera testnet connection
- [x] Install and configure `@hashgraph/sdk`
- [x] Create HCS topic for consent proofs
- [x] Create HCS topic for data proofs
- [x] Test topic creation and message submission
- [x] Verify transactions on HashScan
- [x] Generate HashScan links

### Phase 3: Data Anonymization Service ✅
**Status**: Complete
- [x] Create sample EHR data (raw_data.csv)
- [x] Build anonymization service
  - Remove PII (name, ID, address, phone)
  - Generate anonymous patient ID (PID-001, PID-002, etc.)
  - Preserve medical data (lab results, dates, values)
- [x] Create hash function for anonymized data (SHA-256)
- [x] Test anonymization with sample data
- [x] Create output file (anonymized_data.csv)

### Phase 4: MediPact Adapter Core ✅
**Status**: Complete
- [x] Build adapter script (main entry point)
  - Read CSV file
  - Process each patient record
  - Anonymize data
  - Generate consent proof hash
  - Generate data proof hash
- [x] Integrate with HCS
  - Submit consent proof to HCS topic
  - Submit data proof to HCS topic
  - Get transaction IDs
- [x] Generate HashScan links
- [x] Create output file (anonymized_data.csv)
- [x] Add comprehensive logging and error handling

### Phase 5: Smart Contracts ✅
**Status**: Complete
- [x] Design RevenueSplitter contract (60/25/15 split)
- [x] Design ConsentManager contract
- [x] Write Solidity contracts
- [x] Code review against Hedera standards (Grade: A+)
- [x] Contract documentation
- [ ] Test contracts locally (Hardhat) - Optional
- [ ] Deploy to Hedera Testnet (optional for MVP)

### Phase 6: Payout Simulation ✅
**Status**: Complete
- [x] Create currency utilities (USD-based conversion)
- [x] Calculate revenue split (60% patient, 25% hospital, 15% MediPact)
- [x] Simulate HBAR to USD conversion
- [x] Simulate USD to local currency conversion (configurable)
- [x] Display in adapter output (USD + optional local currency)

### Phase 7: Demo UI (Optional - Days 13-14)
**Status**: Pending
- [ ] Create simple React/Next.js demo page
- [ ] Build AdapterDemo component
- [ ] Build ConsentForm component
- [ ] Build HashScanLink component
- [ ] Connect to adapter script via API (if needed)

### Phase 8: Testing & Polish (Days 15-16)
**Status**: In Progress
- [ ] End-to-end testing of adapter flow
- [x] Test HCS integration (basic tests completed)
- [x] Verify HashScan links work
- [x] Documentation updated
- [ ] Fix bugs (if any found during testing)
- [x] Error messages implemented
- [x] Documentation comments added

### Phase 9: Demo Video & Pitch Deck (Days 17-18)
**Status**: Pending
- [ ] Record demo video (screen recording)
  - Show raw_data.csv
  - Run adapter script
  - Show anonymized output
  - Show HashScan transaction
  - Show payout simulation
- [ ] Upload demo video to YouTube
- [ ] Create pitch deck (PDF)
  - Team and project introduction
  - Project summary
  - Future roadmap
  - Demo video link
- [ ] Prepare project description (max 100 words)
- [ ] List tech stack

### Phase 10: Submission Prep (Days 19-20)
**Status**: Pending
- [ ] Final code review
- [ ] Update README with final information
- [ ] Ensure all submission requirements met
- [ ] Test demo link (if applicable)
- [ ] Submit to hackathon platform

## Technical Implementation Details

### Hedera Services Used
1. **Hedera Consensus Service (HCS)**
   - Topic 1: Consent Proofs (stores hash of consent forms)
   - Topic 2: Data Proofs (stores hash of anonymized lab files)
   - Uses `@hashgraph/sdk` TopicCreateTransaction and TopicMessageSubmitTransaction
   - Or use `hedera-agent-kit` coreConsensusPlugin

2. **HBAR (for future payments)**
   - TransferTransaction for revenue distribution
   - Currency conversion simulation

3. **Smart Contracts (optional for MVP)**
   - RevenueSplitter.sol
   - ConsentManager.sol

### Key Files to Create

#### Adapter Script
- `adapter/src/index.js` - Main adapter script
- `adapter/src/anonymizer/anonymize.js` - Anonymization logic
- `adapter/src/hedera/hcs-client.js` - HCS integration
- `adapter/src/utils/hash.js` - Hash generation utilities

#### Data
- `adapter/data/raw_data.csv` - Sample EHR data with PII
- `adapter/data/anonymized_data.csv` - Output file (generated)

#### Configuration
- `.env` - Hedera credentials (ACCOUNT_ID, PRIVATE_KEY)
- `package.json` - Dependencies and scripts

## Dependencies

### Core Dependencies
- `@hashgraph/sdk` - Hedera SDK
- `hedera-agent-kit` - Hedera Agent Kit for HCS operations
- `dotenv` - Environment variables

### Development Dependencies
- Node.js 18+ (for ES modules support)

## Success Criteria

### MVP Must Have
- [x] Working adapter script
- [ ] Reads CSV file
- [ ] Anonymizes data correctly
- [ ] Submits hashes to HCS
- [ ] Shows HashScan link
- [ ] Displays payout simulation

### MVP Nice to Have
- [ ] Basic UI demo
- [ ] Smart contracts deployed
- [ ] Multiple test cases
- [ ] Comprehensive error handling

## Risk Mitigation

1. **HCS Integration Complexity**: Use `hedera-agent-kit` which simplifies HCS operations
2. **Time Constraints**: Focus on core adapter, skip optional features
3. **Testing Issues**: Test early and often, use Hedera Testnet
4. **Demo Video**: Record early version, iterate if needed

## Notes

- Keep it simple: Focus on working demo, not perfect code
- Test frequently: Verify HCS transactions on HashScan after each integration
- Document as you go: Add comments for complex logic
- Follow best practices: Use TypeScript, proper error handling, clean code

---

**Focus**: Build Path 2 (In-Person flow) adapter engine, pitch Path 1 (Digital Patient) vision
