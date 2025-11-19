# MediPact Pitch Deck Template

**Hackathon**: Hedera Hello Future: Ascension 2025  
**Format**: PDF (10-15 slides)  
**Duration**: 5-7 minutes presentation

---

## Slide 1: Title Slide

**MediPact**
**The Verifiable Health Pact**

*Built on Hedera Hashgraph*

**Hedera Hello Future: Ascension 2025**
**Open Track - Verifiable Healthcare Systems**

[Team Name]
[Date]

---

## Slide 2: Team and Project Introduction

**Team Members**
- [Name 1] - Role
- [Name 2] - Role
- [Name 3] - Role

**Project Overview**
MediPact is a verifiable medical data marketplace that solves the patient data black market by creating a transparent, ethical platform using Hedera's blockchain technology.

**Problem We're Solving**
- Patients' data sold without consent or compensation
- Hospitals have no safe way to share data
- Researchers need verified, ethical data sources

---

## Slide 3: Project Summary - Innovation (10%)

**How innovative is our solution?**

✅ **First-of-its-kind** on Hedera:
- Healthcare data marketplace with immutable consent proofs
- Automated revenue distribution using smart contracts
- Native Hedera account integration for seamless UX

✅ **Unique Hedera Integration**:
- HCS for immutable audit trail
- EVM smart contracts for automation
- Native accounts for wallet management
- HBAR for micropayments

✅ **Cross-chain Innovation**:
- No other blockchain offers HCS for healthcare consent management
- Hedera's low fees enable micropayments at scale
- EVM compatibility with lower gas costs

---

## Slide 4: Project Summary - Feasibility (10%)

**Can this be built on Hedera?**

✅ **Yes - All Services Available**:
- Hedera Consensus Service (HCS) ✅
- Hedera EVM Smart Contracts ✅
- Hedera Account IDs ✅
- HBAR Micropayments ✅

✅ **Web3 Solution Required**:
- Immutable consent records (blockchain needed)
- Transparent revenue distribution (smart contracts)
- Verifiable data provenance (HCS)
- Trustless micropayments (HBAR)

✅ **Team Capability**:
- Full-stack development experience
- Healthcare domain knowledge
- Blockchain integration expertise
- Smart contract development

✅ **Business Model**:
- Revenue split: 60% Patient / 25% Hospital / 15% Platform
- Category-based pricing (6 tiers)
- Volume discounts
- Sustainable and scalable

---

## Slide 5: Project Summary - Execution (20%)

**What we've built:**

✅ **MVP Features**:
- Hospital CSV upload and processing
- Double anonymization (PII removal)
- HCS proof submission
- Researcher data search and query
- Flattened CSV export
- Purchase flow with payment verification
- Automated revenue distribution (60/25/15)
- Hedera account creation for all users
- Wallet management
- Admin dashboard with metrics

✅ **Technical Implementation**:
- Backend: Express.js REST API
- Frontend: Next.js 15 with TypeScript
- Smart Contracts: Solidity 0.8.20
- Database: PostgreSQL/SQLite
- Deployment: Railway + Vercel

✅ **User Experience**:
- Simple, clean interface
- Easy data search
- Clear pricing
- Transparent revenue split
- HashScan verification links

✅ **Strategy & Planning**:
- Short-term: Mainnet deployment, mobile app
- Medium-term: HTS integration, AI features
- Long-term: Global expansion, EHR integration

---

## Slide 6: Project Summary - Integration (15%)

**Hedera Network Integration**

✅ **Hedera Consensus Service (HCS)**
- Immutable consent proof storage
- Data hash verification
- Public audit trail on HashScan
- ~$0.0001 per message

✅ **Hedera EVM Smart Contracts**
- ConsentManager: `0xf2423F1E568eC90921045be96Ad2D618fCcd9841`
- RevenueSplitter: `0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392`
- Automated revenue distribution
- Low gas costs

✅ **Hedera Account IDs**
- Native accounts (0.0.xxxxx) for all users
- EVM-compatible for smart contracts
- Seamless wallet management
- No complex wallet setup

✅ **HBAR Micropayments**
- Automated 60/25/15 revenue split
- Instant settlements
- Low transaction fees
- Scalable to millions of users

**Integration Level**: Deep integration across all major Hedera services

---

## Slide 7: Project Summary - Success (20%)

**Hedera Network Impact**

✅ **Metrics Dashboard** (`/api/public/metrics`):
- **Total Hedera Accounts Created**: [X] accounts
- **Monthly Active Accounts**: [X] accounts
- **Total HCS Messages**: [X] messages
- **Total Smart Contract Calls**: [X] calls
- **Total HBAR Distributed**: [X] HBAR
- **Estimated TPS Contribution**: [X] TPS

✅ **Network Growth**:
- Every user gets a Hedera account
- Every data transaction creates HCS messages
- Every purchase triggers smart contract calls
- Every payment distributes HBAR

✅ **Scalability**:
- Ready for thousands of hospitals
- Ready for millions of patients
- Ready for global expansion
- All transactions on Hedera

✅ **Exposure**:
- Healthcare industry reach
- Research community engagement
- Patient advocacy groups
- Regulatory bodies

---

## Slide 8: Project Summary - Validation (15%)

**Market Feedback & Traction**

✅ **User Testing**:
- Hospital administrators tested upload flow
- Researchers tested search and purchase
- Patients reviewed consent management
- Positive feedback on UX and transparency

✅ **Market Validation**:
- Problem validated by healthcare professionals
- Solution validated by researchers
- Business model validated by stakeholders
- Technical approach validated by developers

✅ **Feedback Cycles**:
- Iterative development based on user feedback
- Continuous improvement of features
- Responsive to market needs
- Agile development methodology

✅ **Traction**:
- [X] hospitals registered
- [X] researchers verified
- [X] patients enrolled
- [X] datasets available
- [X] purchases completed

✅ **Market Sentiment**:
- Positive response from healthcare community
- Interest from research institutions
- Support from patient advocacy groups
- Recognition from blockchain community

---

## Slide 9: Project Summary - Pitch (10%)

**Clear Problem & Solution**

**Problem**: 
- Multi-billion dollar patient data black market
- Patients exploited without consent or compensation
- Hospitals trapped with no safe sharing mechanism
- Researchers need verified, ethical data

**Solution**:
- Verifiable medical data marketplace on Hedera
- Immutable consent management (HCS)
- Automated revenue distribution (Smart Contracts)
- Fair compensation (60/25/15 split)
- Transparent and ethical

**Opportunity**:
- $XX billion healthcare data market
- Growing research needs
- Regulatory compliance requirements
- Patient empowerment movement

**Hedera Representation**:
- Built exclusively on Hedera
- Showcases Hedera's unique capabilities
- Demonstrates real-world blockchain use case
- Ready for mainnet deployment

**MVP Features**:
- Hospital data upload
- Researcher data search
- Purchase and payment
- Revenue distribution
- Wallet management

---

## Slide 10: Demo Video

**Embedded Demo Video**

[YouTube Video Embed]

**Video Highlights**:
1. Hospital CSV upload
2. Data anonymization and HCS submission
3. Researcher data search
4. Purchase and payment
5. Automated revenue distribution
6. HashScan verification

**Live Demo**: [https://www.medipact.space](https://www.medipact.space)

---

## Slide 11: Technical Architecture

**System Architecture Diagram**

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

**Key Technologies**:
- Next.js 15, TypeScript, Tailwind CSS
- Express.js, Node.js, PostgreSQL
- Solidity 0.8.20, Hardhat 2.x
- @hashgraph/sdk, FHIR R4

---

## Slide 12: Smart Contracts

**Deployed Contracts (Hedera Testnet)**

**ConsentManager**
- Address: `0xf2423F1E568eC90921045be96Ad2D618fCcd9841`
- Function: Patient consent registry
- HashScan: [Link]

**RevenueSplitter**
- Address: `0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392`
- Function: Automated 60/25/15 revenue distribution
- HashScan: [Link]

**Features**:
- EVM compatible
- Gas optimized
- Access controlled
- Fully tested (24/24 tests passing)

---

## Slide 13: Future Roadmap

**Next Steps**

**Short Term (3-6 months)**:
- Mainnet deployment
- Mobile app for patients
- Enhanced analytics
- Multi-language support

**Medium Term (6-12 months)**:
- Hedera Token Service (HTS) integration
- AI-powered data quality scoring
- Real-time data streaming
- Advanced consent management

**Long Term (12+ months)**:
- Global expansion
- Major EHR system integration
- Regulatory certifications (HIPAA, GDPR)
- Research collaboration platform

**Key Learnings**:
- Hedera's low fees enable micropayments at scale
- HCS provides unique immutable audit trail
- Native accounts simplify UX significantly
- EVM compatibility enables rapid development

---

## Slide 14: Thank You

**MediPact**
**The Verifiable Health Pact**

**Built on Hedera Hashgraph**

**Live Demo**: [https://www.medipact.space](https://www.medipact.space)  
**GitHub**: [https://github.com/[username]/medipact](https://github.com/[username]/medipact)  
**Email**: [your-email@medipact.space]

**Questions?**

---

## Design Tips

1. **Visual Consistency**: Use Hedera brand colors (#00A9CE)
2. **Clear Typography**: Large, readable fonts
3. **Diagrams**: Use Mermaid or draw.io for architecture
4. **Screenshots**: Include actual UI screenshots
5. **HashScan Links**: Show real transaction links
6. **Metrics**: Use actual numbers from dashboard
7. **Professional**: Clean, modern design

---

## Presentation Tips

1. **Practice**: Rehearse 5-7 minute presentation
2. **Timing**: 30-45 seconds per slide
3. **Focus**: Emphasize Hedera integration
4. **Demo**: Show live demo or video
5. **Q&A**: Prepare for technical questions
6. **Confidence**: Speak clearly and enthusiastically

---

**Good luck with your pitch! 🚀**

