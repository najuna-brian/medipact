import MermaidDiagram from '@/components/docs/MermaidDiagram';
import CodeBlock from '@/components/docs/CodeBlock';

export default function DocsOverviewPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">MediPact Documentation</h1>
        <p className="mt-4 text-lg text-gray-600">
          A comprehensive guide to the MediPact verifiable health data marketplace built on Hedera
          Hashgraph.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">What is MediPact?</h2>
        <p className="mt-4 text-gray-700">
          <strong>MediPact</strong> is a verifiable medical data marketplace that empowers patients
          to control and monetize their anonymized medical data for research. Built on Hedera
          Hashgraph, we solve the multi-billion dollar patient data black market problem by creating
          a transparent, ethical platform using the Hedera Consensus Service for immutable proof and
          HBAR for instant micropayments.
        </p>
        <p className="mt-4 text-gray-700">
          The <strong>healthcare ecosystem</strong> holds vast amounts of valuable patient data
          stored across hospitals and clinics, yet much of it remains <strong>inaccessible</strong>{' '}
          which slows innovation and research. Even when accessed, Patients{' '}
          <strong>lack control (consent) and fair compensation</strong> for their own health
          information, while data sharing is limited by privacy and regulatory concerns.
        </p>
        <p className="mt-4 text-gray-700">
          <strong>MediPact</strong> addresses this by providing a{' '}
          <strong>secure, ethical, and scalable data marketplace</strong> that enables compliant
          medical data sharing, ensures patient privacy through anonymization and consent
          management, and supports fair value exchange between data owners and researchers.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Why Hedera?</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-[#00A9CE]">HCS is Unique</h3>
            <p className="mt-2 text-sm text-gray-600">
              No other blockchain offers immutable message logging for consent and data proofs.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-[#00A9CE]">Low Fees</h3>
            <p className="mt-2 text-sm text-gray-600">
              Enables micropayments at scale (~$0.0001 per HCS message).
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-[#00A9CE]">High Throughput</h3>
            <p className="mt-2 text-sm text-gray-600">
              10,000+ TPS for thousands of daily queries.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-[#00A9CE]">Carbon Negative</h3>
            <p className="mt-2 text-sm text-gray-600">
              Environmentally sustainable blockchain technology.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-[#00A9CE]">Native Accounts</h3>
            <p className="mt-2 text-sm text-gray-600">
              Seamless UX without complex wallet management (0.0.xxxxx format).
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-[#00A9CE]">EVM Compatible</h3>
            <p className="mt-2 text-sm text-gray-600">
              Smart contracts with low gas costs on Hedera EVM.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Key Features</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Feature</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">FHIR R4 Compliant</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Interoperable with global medical record systems
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  K-Anonymity Enforcement
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Privacy by design (minimum 5 records per group)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  HCS Immutable Proof Storage
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Unchangeable audit trail on Hedera Consensus Service
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Secure Data Vault</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Encrypted storage with patient-controlled access
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  Automated HBAR Revenue Distribution
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  60/25/15 split managed by smart contract
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  Patient Identity System (UPI)
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">Cross-hospital identity linking</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  Consent &amp; Patient Rights
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  End-to-end consent management, on-chain proofs, and patient-centric controls
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  Multi-Dimensional Query Engine
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Filter by country, date, condition, demographics
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  Smart Contract Integration
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  On-chain consent registry and revenue sharing
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  Role-Based Dashboards
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Patient, Hospital, Researcher, and Admin portals
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  HashScan Verification
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Publicly verifiable transactions on HashScan
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  End-to-End Encryption
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Field-level AES-256-GCM encryption with zero-knowledge architecture
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  Patient-Centric Data Control
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Global opt-in/out, researcher approvals, granular preferences
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Fair Revenue Model</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Original collecting hospital is sole beneficiary of their data
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  Category-Based Pricing
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  6 pricing tiers, 40% of market rates, volume discounts, USD display
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  Temporary Hospital Access
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Time-limited, patient-approved data sharing for telemedicine
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Rate Limiting</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Protection against abuse and DDoS attacks
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Bcrypt Security</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Secure password and API key hashing
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Automatic Wallets</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Hedera accounts created automatically, users never manage wallets
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">USD-First Display</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  All balances shown in USD with HBAR below, dynamic exchange rates
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Bank & Mobile Money</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Direct withdrawals to bank accounts or mobile money providers
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Auto-Withdrawals</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Automatic withdrawals when balance reaches user-defined threshold
                </td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  Withdrawal Notifications
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  Email and SMS notifications for withdrawal status changes
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Technology Stack</h2>
        <MermaidDiagram
          chart={`graph TB
    subgraph "Frontend"
        F1[Next.js 15]
        F2[TypeScript]
        F3[Tailwind CSS]
    end
    
    subgraph "Backend"
        B1[Node.js]
        B2[Express.js]
        B3[SQLite/PostgreSQL]
    end
    
    subgraph "Hedera"
        H1[HCS]
        H2[EVM]
        H3[Accounts]
        H4[HBAR]
    end
    
    subgraph "Contracts"
        C1[Solidity]
        C2[Hardhat]
    end
    
    subgraph "Data"
        D1[FHIR R4]
        D2[K-Anonymity]
    end
    
    style H1 fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style H2 fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style H3 fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style H4 fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">User Guides</h2>
        <p className="mt-2 text-gray-600">Get started with MediPact based on your role:</p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <a
            href="/docs/for-patients"
            className="block rounded-lg border-2 border-green-200 bg-green-50 p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-green-900">For Patients</h3>
            <p className="mt-2 text-sm text-gray-700">
              Learn how to store your medical records, control your data, and earn money when
              researchers use your anonymized data.
            </p>
          </a>
          <a
            href="/docs/for-hospitals"
            className="block rounded-lg border-2 border-blue-200 bg-blue-50 p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-blue-900">For Hospitals</h3>
            <p className="mt-2 text-sm text-gray-700">
              Learn how to upload patient data, generate revenue, and contribute to medical research
              while maintaining privacy.
            </p>
          </a>
          <a
            href="/docs/for-researchers"
            className="block rounded-lg border-2 border-purple-200 bg-purple-50 p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-purple-900">For Researchers</h3>
            <p className="mt-2 text-sm text-gray-700">
              Learn how to access high-quality, anonymized medical data for research with
              transparent pricing and verification.
            </p>
          </a>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Core Documentation</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <a
            href="/docs/hedera"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">Hedera Integration</h3>
            <p className="mt-2 text-sm text-gray-600">
              Learn how MediPact leverages HCS, EVM, Accounts, and HBAR at four distinct levels for
              immutable proofs and micropayments.
            </p>
          </a>
          <a
            href="/docs/data-flow"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">Data Flow</h3>
            <p className="mt-2 text-sm text-gray-600">
              Complete data flow from upload to revenue distribution, showing all Hedera integration
              levels and security measures.
            </p>
          </a>
          <a
            href="/docs/revenue-distribution"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">Revenue Distribution</h3>
            <p className="mt-2 text-sm text-gray-600">
              Detailed explanation of the 60/25/15 revenue split, fair attribution, and automated
              distribution via smart contracts.
            </p>
          </a>
          <a
            href="/docs/privacy"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">Privacy & Security</h3>
            <p className="mt-2 text-sm text-gray-600">
              Explore our multi-layered security approach, anonymization techniques, and K-anonymity
              enforcement.
            </p>
          </a>
          <a
            href="/docs/architecture"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">System Architecture</h3>
            <p className="mt-2 text-sm text-gray-600">
              Understand the complete system architecture and component interactions.
            </p>
          </a>
          <a
            href="/docs/double-anonymization"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">Double Anonymization</h3>
            <p className="mt-2 text-sm text-gray-600">
              Learn about our two-stage anonymization process with provenance tracking for maximum
              privacy protection.
            </p>
          </a>
          <a
            href="/docs/smart-contracts"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">Smart Contracts</h3>
            <p className="mt-2 text-sm text-gray-600">
              Detailed documentation of ConsentManager and RevenueSplitter contracts.
            </p>
          </a>
          <a
            href="/docs/pricing"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">Pricing Model</h3>
            <p className="mt-2 text-sm text-gray-600">
              Learn about our category-based pricing model, volume discounts, and USD display.
            </p>
          </a>
          <a
            href="/docs/patient-controls"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">Patient Data Controls</h3>
            <p className="mt-2 text-sm text-gray-600">
              Understand how patients control their data sharing and researcher access.
            </p>
          </a>
          <a
            href="/docs/wallet"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">Wallet & Payments</h3>
            <p className="mt-2 text-sm text-gray-600">
              Learn about automatic wallet creation, withdrawals, and payment methods.
            </p>
          </a>
          <a
            href="/docs/quick-start"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">Quick Start</h3>
            <p className="mt-2 text-sm text-gray-600">
              Get started with MediPact in minutes with our setup guide.
            </p>
          </a>
          <a
            href="/docs/local-setup-demo"
            className="block rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">Local Setup & Demo Guide</h3>
            <p className="mt-2 text-sm text-gray-600">
              Complete step-by-step guide to set up locally, verify all components, and run
              end-to-end demonstrations with ready-to-copy code.
            </p>
          </a>
          <a
            href="/docs/production"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">Production Deployment</h3>
            <p className="mt-2 text-sm text-gray-600">
              Production configuration, security, monitoring, and deployment best practices.
            </p>
          </a>
        </div>
      </section>
    </div>
  );
}


