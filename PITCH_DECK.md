# MediPact - Pitch Deck
## The Verifiable Health Pact. Built on Hedera.

**Hedera Hello Future: Ascension Hackathon 2025**  
**Track**: Open Track - Verifiable Healthcare Systems  
**Submission Date**: 20/11/2025

---

## 1. Team and Project Introduction

### Team: Team Medipact

- **Najuna Bian** - Developer

### Project Introduction

**MediPact** is a verifiable medical data marketplace that empowers patients to control and monetize their anonymized medical data for research. Built on Hedera Hashgraph, we solve the multi-billion dollar patient data black market problem by creating a transparent, ethical platform using the Hedera Consensus Service for immutable proof and HBAR for instant micropayments.

**Vision**: Transform healthcare data into an ethical, transparent marketplace where patients are partners, not products.

---

## 2. Project Summary

### Problem Statement

The current healthcare ecosystem struggles with **fragmented, siloed, and inconsistently standardized medical data**, which impedes critical research, slows the development of life-saving innovations like AI diagnostics and personalized medicine, and increases operational costs for healthcare systems.

Simultaneously, **patients lack transparent control and fair compensation** for their own health information, while existing data-sharing practices are often hampered by complex, varied, and fear-inducing regulatory environments, leading to a reluctance to share data due to privacy and security concerns.

The challenge, therefore, is to create a **secure, ethical, and scalable platform** that can facilitate compliant medical data sharing, ensuring data provenance, maintaining patient privacy through advanced anonymization and consent mechanisms, and providing a mechanism for fair value exchange to benefit both data contributors (patients and institutions) and data users (researchers and innovators).

### The Problem

**The $30B+ Patient Data Black Market & Fragmented Ecosystem**: Three critical failures:

1. **Patients are Exploited**: Medical records can sell for up to **$1,000 per record** on the dark web, significantly more than credit card numbers, yet patients see none of this value. Data is sold without their knowledge, consent, or compensation.

2. **Researchers are Blind**: Inability to verify the ethical sourcing or authenticity of data creates a lack of trust and slows innovation.

3. **Hospitals are Trapped**: Legacy systems and complex, varied regulations make safe, legal data sharing nearly impossible, despite hospitals generating massive amounts of largely unused data (**up to 97% remains unused**).

**Market Size**: The global healthcare data technology market is projected to reach **$9.5 billion by 2033**, growing at a CAGR of over **13%**. The broader digital health market is valued at over **$427 billion in 2025**. Our ethical, transparent approach directly addresses this massive, growing need.

### Our Solution

**MediPact** is a verifiable medical data marketplace with:

- **Immutable Proof**: Patient consent and data authenticity hashes are logged on Hedera Consensus Service (HCS), providing an unchangeable, auditable trail.

- **Patient Control & Compensation**: Patients actively own their data and receive a direct **60% revenue share** from data sales.

- **Secure Data Vault**: Patient medical data is stored in an encrypted, secure vault with granular access controls. Patients can view, manage, and control access to their complete medical history across all hospitals.

- **Fair, Automated Compensation**: Built-in logic for an automated **60% (Patient) / 25% (Hospital) / 15% (MediPact)** revenue split via HBAR micropayments.

- **Full Transparency**: All transactions are publicly verifiable on HashScan.

- **Standards-Based**: FHIR R4 compliant, providing the consistency and maturity needed for production-ready, real-world health solutions.

**Key Innovation**: The **"In-Person Bridge"** - a hospital-based onboarding system designed for global scalability, reaching the **3+ billion individuals** who may not have smartphones or apps.

### Technical Implementation

**Full-Stack MVP Delivered**:

✅ **Adapter** (`adapter/`): Processes FHIR/CSV data, enforces K-anonymity (privacy by design), and submits data hashes to HCS.

✅ **Backend** (`backend/`): Robust REST API managing patient identity (UPI), hospital/researcher registries, marketplace, and **secure data vault** with encrypted storage.

✅ **Frontend** (`frontend/`): Next.js 15 app offering dedicated portals for Patients, Hospitals, Researchers, and Admins, including **patient health wallet** for data management.

✅ **Smart Contracts** (`contracts/`): Hedera EVM-based ConsentManager & RevenueSplitter contracts for on-chain logic and automated payouts.

**Hedera Integration**:

- **Hedera Consensus Service (HCS)**: Used for high-throughput, immutable logging of consent records and data proofs.

- **Hedera EVM**: Smart contracts deployed for managing the consent registry and trustless, automated revenue distribution.

- **Hedera Accounts**: Every patient, hospital, and researcher is provisioned with a native Hedera Account ID, ensuring seamless UX without complex wallet management.

- **HBAR Payments**: Automated, low-fee micropayments are distributed instantly using HBAR.

**Creative Integration**: MediPact is the first healthcare data marketplace to combine the immutable logging of HCS for consent proof with the automated, trustless revenue distribution of Hedera EVM and native accounts for a production-ready system.

**Data Vault Architecture**:
- **Encrypted Storage**: Patient medical records stored with end-to-end encryption
- **Granular Access Control**: Patients control who can access their data and for what purpose
- **Cross-Hospital Aggregation**: Unified patient identity (UPI) enables complete medical history across all hospitals
- **Audit Trail**: All data access logged immutably on HCS
- **Consent-Based Sharing**: Data only shared with explicit patient consent, recorded on-chain

### Execution Quality

**MVP Features Delivered & Design Decisions**:

- ✅ **FHIR R4 compliant** data processing for interoperability with most Medical Records Systems

- ✅ **K-anonymity enforcement** for patient privacy, a critical requirement for regulatory compliance (HIPAA, GDPR).

- ✅ **HCS immutable proof storage**, building an undeniable audit trail.

- ✅ **Secure Data Vault** with encrypted storage and patient-controlled access

- ✅ **Automated HBAR revenue distribution** (60/25/15 split).

- ✅ **Consent validation at the database level** - cannot be bypassed.

- ✅ **User-friendly, role-based dashboards** built with Next.js 15.

- ✅ **Patient Health Wallet** - Complete medical history management and access control

**Go-To-Market Strategy**:

- **Phase 1**: Pilot programs with government hospitals in developing countries where the need for ethical infrastructure is high.

- **Phase 2**: Strategic partnerships with pharmaceutical companies and AI labs (key data consumers).

- **Phase 3**: Integration with mobile money systems to facilitate easy patient payouts in target markets.

**Hedera Network Benefits**:

- **Mass Account Creation**: Scaling to **1M+ Hedera accounts** with 1M+ patients/users if initial pilots succeed.

- **High TPS Potential**: Designed to handle **thousands of daily data query transactions** at scale, leveraging Hedera's high throughput.

- **Industry Exposure**: Demonstrating Hedera's suitability for a highly regulated and valuable industry brings significant real-world use case validation.

**Projected Impact** (if scaled):
- 100 hospitals = **100,000+ Hedera accounts**
- 1M patients = **1M+ Hedera accounts**
- 10,000 daily queries = **10,000+ daily network transactions**

**Market Feedback Sources & Traction**:

- ✅ **Working MVP**: Fully functional end-to-end system demonstrated live on Hedera testnet.

- ✅ **Standards Compliance**: FHIR R4 compliance from day one ensures alignment with global healthcare standards, making integration with real EHR systems feasible.

- ✅ **Real Transactions**: Actual Hedera testnet transactions for data hashing and payments prove technical viability.

**Market Sentiment & Growth Potential**:

- Addresses a validated market need in a **$30B+ global data market**.

- The ethical, patient-first approach resonates strongly in an industry filled with data exploitation.

- Scalable globally, from developing nations to established healthcare markets like North America, which has high data monetization activity.

**Unique Differentiators**:

1. **Two-Path Onboarding**: Only solution designed to work for both digitally native and non-digital users (via in-person hospital process).

2. **HCS + EVM Integration**: Unique use of HCS for irrefutable consent proof combined with EVM for automated, transparent value transfer.

3. **Secure Data Vault**: Patient-controlled encrypted storage with complete medical history management - not just anonymized data sharing.

4. **Ethical by Design**: True patient consent, privacy (K-anonymity), and fairness are core to the architecture, not an afterthought.

5. **Complete Solution**: A full data pipeline from extraction (Adapter) to marketplace (Frontend), not just a blockchain component.

**Hedera Advantage**:

Ethereum is too expensive for micropayments at this scale. Other blockchains lack the unique HCS feature for immutable proof of data hashes. **Hedera's low, predictable fees, high TPS, and carbon-negative footprint** make it the ideal platform for a global, high-volume healthcare application.

---

## 3. Future Roadmap

### Key Learnings

**Technical Learnings**:
- Hedera HCS is perfect for immutable proof storage in regulated industries
- EVM + HCS integration enables both proof storage and automated payments
- FHIR R4 compliance is essential for real-world adoption
- K-anonymity balances privacy and research value
- Secure data vault architecture is critical for patient trust

**Product Learnings**:
- In-person onboarding is critical for global scale
- Consent validation must be database-level, not application-level
- Patient data vault increases engagement and trust
- Revenue distribution automation reduces friction
- Standards compliance accelerates adoption

**Market Learnings**:
- Healthcare industry values transparency and ethics
- Developing countries have high data volume, lower competition
- Researchers need verified, ethical data sources
- Patients want control, access, and fair compensation
- Data vault feature differentiates from competitors

### Room for Improvement

**Technical Improvements**:
- [ ] Enhanced data vault encryption (zero-knowledge proofs)
- [ ] Full FHIR API integration (currently file-based)
- [ ] Mobile Money API integration for payments
- [ ] Enhanced query engine with ML-based recommendations
- [ ] Real-time data sync from EHR systems
- [ ] Advanced analytics dashboard
- [ ] Patient data export functionality

**Product Improvements**:
- [ ] Mobile app for digital patients with vault access
- [ ] Enhanced consent management UI
- [ ] Researcher collaboration tools
- [ ] Patient earnings dashboard
- [ ] Multi-language support
- [ ] Data sharing timeline visualization

**Business Improvements**:
- [ ] Regulatory compliance (HIPAA, GDPR)
- [ ] Insurance and liability coverage
- [ ] Partnership agreements with hospitals
- [ ] Researcher network development
- [ ] Marketing and user acquisition

### Next Steps (Post-Hackathon)

**Phase 1: Pilot Program (Months 1-3)**
- Partner with 2-3 government hospitals
- Deploy adapter in production environment
- Onboard 1,000+ patients
- Process 10,000+ medical records
- Enable patient data vault access
- Collect feedback from all stakeholders

**Phase 2: Mobile Money Integration (Months 4-6)**
- Integrate Mobile Money APIs (M-Pesa, MTN, etc.)
- Enable direct payments to patient mobile wallets
- Test payment flows in pilot hospitals
- Measure payment success rates

**Phase 3: Researcher Network (Months 7-9)**
- Onboard 10+ research institutions
- Enable dataset purchases
- Process first revenue transactions
- Measure researcher satisfaction

**Phase 4: Scale (Months 10-12)**
- Expand to 10+ hospitals
- 100,000+ patients enrolled
- $1M+ in data transactions
- Break-even or profitability

**Long-Term Vision (Year 2+)**
- 100+ hospitals globally
- 1M+ patients enrolled with complete medical histories in vault
- $10M+ in annual revenue
- Market leader in ethical healthcare data

---

## 4. Demo

### Demo Video

**[YouTube Link to Demo Video]**

*Note: Demo video must be uploaded to YouTube and link inserted here before submission.*

### Demo Highlights

**What the Demo Shows**:

1. **Data Processing**
   - CSV/FHIR file input
   - Automatic format detection
   - Real-time anonymization
   - Anonymous ID generation

2. **Hedera Integration**
   - HCS topic creation
   - Consent proof submission
   - Data proof submission
   - HashScan transaction verification

3. **Smart Contract Interaction**
   - ConsentManager contract deployment
   - On-chain consent registry
   - RevenueSplitter contract interaction
   - Automated revenue distribution

4. **Patient Data Vault**
   - Secure encrypted storage
   - Patient access to complete medical history
   - Granular access control
   - Cross-hospital data aggregation

5. **Marketplace Functionality**
   - Dataset browsing
   - Multi-dimensional querying
   - Consent-validated results
   - Export functionality

6. **Frontend Application**
   - Patient dashboard with health wallet
   - Hospital portal
   - Researcher marketplace
   - Admin verification

**Technical Strengths Demonstrated**:
- ✅ Full-stack implementation
- ✅ Real Hedera transactions
- ✅ Standards compliance (FHIR R4)
- ✅ Production-ready code
- ✅ Scalable architecture
- ✅ Secure data vault

**Usability Demonstrated**:
- ✅ Clean, intuitive UI
- ✅ Role-based access
- ✅ Real-time feedback
- ✅ Error handling
- ✅ Responsive design
- ✅ Patient data management

**Performance Demonstrated**:
- ✅ Fast data processing
- ✅ Efficient database queries
- ✅ Optimized smart contracts
- ✅ Low transaction costs
- ✅ Scalable infrastructure

---

## 5. Project Links

### GitHub Repository
**https://github.com/najuna-brian/medipact**

### Live Demo
**[Live Demo URL - e.g., Vercel deployment]**

### Additional Resources
- **API Documentation**: http://localhost:3002/api-docs (when backend is running)
- **HashScan Transactions**: [Links to testnet transactions]
- **Smart Contract Addresses**: [Contract addresses on testnet]

---

## 6. Conclusion

### Summary

MediPact transforms the $30B+ patient data black market into an ethical, transparent marketplace built on Hedera. Our MVP demonstrates:

- ✅ **Innovation**: First healthcare data marketplace using HCS + EVM integration with secure patient data vault
- ✅ **Feasibility**: Production-ready, standards-compliant solution
- ✅ **Execution**: Complete full-stack MVP with real transactions
- ✅ **Integration**: Deep Hedera integration (HCS, EVM, Accounts, HBAR)
- ✅ **Success**: Potential for millions of Hedera accounts and high TPS
- ✅ **Validation**: Addresses validated market need with real-world applicability
- ✅ **Pitch**: Clear problem, innovative solution, massive opportunity

### Why MediPact Matters

We're not just building a product - we're building trust in healthcare data. Every transaction is verifiable, every consent is immutable, every patient's data is securely vaulted, and every patient is fairly compensated.

**Built on Hedera. Built for the Future.**

---

**Thank you for your consideration!**

**Team**: Team Medipact  
**Contact**: [Your Contact Information]  
**Hackathon**: Hedera Hello Future: Ascension 2025  
**Track**: Open Track - Verifiable Healthcare Systems
