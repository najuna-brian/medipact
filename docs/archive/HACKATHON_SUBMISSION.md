# MediPact - Hackathon Submission

**Hackathon**: Hedera Hello Future: Ascension 2025  
**Track**: Open Track - Verifiable Healthcare Systems  
**Submission Deadline**: November 21, 2025, 11:59PM EST  
**Team**: MediPact Team

---

## Project Description (100 words)

MediPact is a verifiable medical data marketplace that solves the patient data black market by creating a transparent, ethical platform using Hedera's Consensus Service for immutable proof and HBAR for instant micropayments. We enable hospitals to securely share anonymized patient data with researchers while ensuring patients receive fair compensation (60% of revenue). Built on Hedera HCS, EVM smart contracts, and native account IDs, MediPact provides an immutable audit trail, automated revenue distribution, and seamless wallet management. Our platform transforms how medical data is shared, ensuring privacy, consent, and fair value exchange for all stakeholders.

---

## Selected Hackathon Track

**Open Track** - Verifiable Healthcare Systems

We chose the Open Track because MediPact addresses a critical real-world problem in healthcare data sharing that doesn't fit neatly into other categories. Our solution demonstrates innovative use of multiple Hedera services (HCS, EVM, Accounts, HBAR) to create a verifiable, ethical healthcare data marketplace.

---

## Tech Stack

### Blockchain & Distributed Ledger
- **Hedera Hashgraph** - Core blockchain infrastructure
- **Hedera Consensus Service (HCS)** - Immutable consent and data proof storage
- **Hedera EVM** - Smart contract execution
- **Hedera Account IDs** - Native account management (0.0.xxxxx format)
- **HBAR** - Native cryptocurrency for micropayments

### Smart Contracts
- **Solidity 0.8.20** - Smart contract language
- **Hardhat 2.x** - Development and deployment framework
- **ConsentManager.sol** - Patient consent registry
- **RevenueSplitter.sol** - Automated 60/25/15 revenue distribution

### Backend
- **Node.js 18+** - Runtime environment
- **Express.js** - REST API framework
- **PostgreSQL / SQLite** - Database (PostgreSQL for production, SQLite for development)
- **@hashgraph/sdk** - Hedera SDK for Node.js
- **FHIR** - Healthcare data standard (HL7 FHIR R4)

### Frontend
- **Next.js 15** - React framework
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **TanStack Query** - Data fetching and caching
- **Zustand** - State management

### Data Processing
- **CSV to FHIR Adapter** - Universal healthcare data adapter
- **Double Anonymization** - Two-stage PII removal
- **K-Anonymity** - Privacy protection through grouping

### Infrastructure & Deployment
- **Railway** - Backend hosting
- **Vercel** - Frontend hosting
- **Docker** - Containerization
- **GitHub** - Version control and repository

### Development Tools
- **Vitest** - Testing framework
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Swagger/OpenAPI** - API documentation

---

## Project Demo Link

**Live Demo**: [https://www.medipact.space](https://www.medipact.space)

**Backend API**: [https://medipact-production.up.railway.app](https://medipact-production.up.railway.app)

**API Documentation**: [https://medipact-production.up.railway.app/api-docs](https://medipact-production.up.railway.app/api-docs)

---

## Demo Video

**YouTube Link**: [ADD YOUR YOUTUBE LINK HERE - See DEMO_VIDEO_GUIDE.md for instructions]

**Video Description**: 
A 3-5 minute walkthrough demonstrating:
1. Hospital CSV upload and data processing
2. Anonymization and HCS proof submission
3. Researcher data search and query
4. Dataset purchase and payment
5. Automated revenue distribution (60/25/15 split)
6. HashScan verification of transactions

**Recording Guide**: See `DEMO_VIDEO_GUIDE.md` for step-by-step instructions.

---

## GitHub Repository

**Repository**: [https://github.com/najuna-brian/medipact](https://github.com/najuna-brian/medipact)

**Note**: Update this with your actual GitHub repository URL before submission.

**Key Files**:
- `README.md` - Complete project documentation
- `contracts/` - Smart contracts (ConsentManager, RevenueSplitter)
- `backend/` - Express.js API server
- `frontend/` - Next.js frontend application
- `backend/adapter/` - Universal CSV to FHIR adapter

---

## Hedera Network Integration

### Services Used

1. **Hedera Consensus Service (HCS)**
   - Immutable storage of consent proofs
   - Data hash verification
   - Public audit trail on HashScan

2. **Hedera EVM Smart Contracts**
   - ConsentManager: Patient consent registry
   - RevenueSplitter: Automated revenue distribution
   - Contract Addresses (Testnet):
     - ConsentManager: `0xf2423F1E568eC90921045be96Ad2D618fCcd9841`
     - RevenueSplitter: `0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392`

3. **Hedera Account IDs**
   - Native account creation for all users (patients, hospitals, researchers)
   - EVM-compatible accounts for smart contract interactions
   - Format: `0.0.xxxxx`

4. **HBAR Micropayments**
   - Automated revenue distribution
   - 60% Patient / 25% Hospital / 15% Platform split
   - Low-cost transactions (~$0.0001 per transfer)

### Network Impact Metrics

Access real-time metrics at: `/api/public/metrics`

- **Total Hedera Accounts Created**: Tracked automatically
- **Monthly Active Hedera Accounts**: Last 30 days activity
- **Total HCS Messages**: Consent and data proof submissions
- **Total Smart Contract Calls**: Revenue distribution transactions
- **Total HBAR Distributed**: Cumulative payments
- **Estimated TPS Contribution**: Network throughput contribution

---

## Key Features

### For Patients
- ✅ Control over data sharing (opt-in/opt-out)
- ✅ Fair compensation (60% of revenue)
- ✅ Transparent consent management
- ✅ Hedera wallet integration

### For Hospitals
- ✅ Secure data sharing
- ✅ Revenue from data (25% of revenue)
- ✅ Compliance with privacy regulations
- ✅ Automated processing

### For Researchers
- ✅ Easy data search and query
- ✅ Flattened CSV export format
- ✅ Verified, ethical data sources
- ✅ Transparent pricing

### For Platform
- ✅ Immutable audit trail (HCS)
- ✅ Automated revenue distribution (Smart Contracts)
- ✅ Privacy protection (Double Anonymization)
- ✅ Scalable architecture

---

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- PostgreSQL (for production) or SQLite (for development)
- Hedera Testnet account (free from [portal.hedera.com](https://portal.hedera.com))

### Quick Start

1. **Clone Repository**
   ```bash
   git clone https://github.com/[your-username]/medipact.git
   cd medipact
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   cp ../env.example .env
   # Edit .env with your Hedera credentials
   npm start
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp ../env.example .env.local
   # Edit .env.local with API URL
   npm run dev
   ```

4. **Populate Demo Data**
   ```bash
   cd backend
   npm run populate-demo
   ```

See `README.md` for complete setup instructions.

---

## Testing Instructions

### Automated Tests
```bash
# Backend unit tests (12/12 passing)
cd backend && npm test

# Backend end-to-end tests (14/23 passing - core flow verified)
cd backend && npm run test:e2e

# Contract tests
cd contracts && npm test
```

**Test Results**: See `TEST_DOCUMENTATION.md` for complete test results and documentation.

### Manual Testing
1. Register a hospital at `/hospital/register`
2. Upload CSV data at `/hospital/upload`
3. Register a researcher at `/researcher/register`
4. Search for data at `/researcher/query`
5. Purchase dataset and verify revenue distribution

See `TESTING_GUIDE.md` and `TEST_DOCUMENTATION.md` for detailed testing instructions.

---

## Future Roadmap

### Short Term (3-6 months)
- [ ] Mainnet deployment
- [ ] Mobile app for patients
- [ ] Enhanced analytics dashboard
- [ ] Multi-language support

### Medium Term (6-12 months)
- [ ] Hedera Token Service (HTS) integration for patient rewards
- [ ] AI-powered data quality scoring
- [ ] Real-time data streaming
- [ ] Advanced consent management

### Long Term (12+ months)
- [ ] Global expansion
- [ ] Integration with major EHR systems
- [ ] Regulatory compliance certifications (HIPAA, GDPR)
- [ ] Research collaboration platform

---

## Team

[Add team member information here]

---

## Acknowledgments

- Hedera Hashgraph for the powerful blockchain infrastructure
- Hedera Developer Community for support and resources
- Healthcare data standards (HL7 FHIR) for interoperability

---

## License

Apache 2.0 - See [LICENSE.md](LICENSE.md) for details

---

## Contact

- **Website**: [https://www.medipact.space](https://www.medipact.space)
- **Email**: [your-email@medipact.space]
- **GitHub**: [https://github.com/[your-username]/medipact](https://github.com/[your-username]/medipact)

---

**Built with ❤️ on Hedera Hashgraph**

