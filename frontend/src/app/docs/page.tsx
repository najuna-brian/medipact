import MermaidDiagram from '@/components/docs/MermaidDiagram';
import CodeBlock from '@/components/docs/CodeBlock';

export default function DocsOverviewPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">MediPact Documentation</h1>
        <p className="mt-4 text-lg text-gray-600">
          A comprehensive guide to the MediPact verifiable health data marketplace built on Hedera Hashgraph.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">What is MediPact?</h2>
        <p className="mt-4 text-gray-700">
          <strong>MediPact</strong> is a verifiable medical data marketplace that empowers patients to control and monetize their anonymized medical data for research. Built on Hedera Hashgraph, we solve the multi-billion dollar patient data black market problem by creating a transparent, ethical platform using the Hedera Consensus Service for immutable proof and HBAR for instant micropayments.
        </p>
        <p className="mt-4 text-gray-700">
          The <strong>healthcare ecosystem</strong> holds vast amounts of valuable patient data stored across hospitals and clinics, yet much of it remains <strong>inaccessible</strong> which slows innovation and research. Even when accessed, Patients <strong>lack control (consent) and fair compensation</strong> for their own health information, while data sharing is limited by privacy and regulatory concerns.
        </p>
        <p className="mt-4 text-gray-700">
          <strong>MediPact</strong> addresses this by providing a <strong>secure, ethical, and scalable data marketplace</strong> that enables compliant medical data sharing, ensures patient privacy through anonymization and consent management, and supports fair value exchange between data owners and researchers.
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">FHIR R4 Compliant</td>
                <td className="px-4 py-3 text-sm text-gray-600">Interoperable with global medical record systems</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">K-Anonymity Enforcement</td>
                <td className="px-4 py-3 text-sm text-gray-600">Privacy by design (minimum 5 records per group)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">HCS Immutable Proof Storage</td>
                <td className="px-4 py-3 text-sm text-gray-600">Unchangeable audit trail on Hedera Consensus Service</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Secure Data Vault</td>
                <td className="px-4 py-3 text-sm text-gray-600">Encrypted storage with patient-controlled access</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Automated HBAR Revenue Distribution</td>
                <td className="px-4 py-3 text-sm text-gray-600">60/25/15 split managed by smart contract</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Patient Identity System (UPI)</td>
                <td className="px-4 py-3 text-sm text-gray-600">Cross-hospital identity linking</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Consent Validation</td>
                <td className="px-4 py-3 text-sm text-gray-600">Enforced at the database and smart-contract levels</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Multi-Dimensional Query Engine</td>
                <td className="px-4 py-3 text-sm text-gray-600">Filter by country, date, condition, demographics</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Smart Contract Integration</td>
                <td className="px-4 py-3 text-sm text-gray-600">On-chain consent registry and revenue sharing</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Role-Based Dashboards</td>
                <td className="px-4 py-3 text-sm text-gray-600">Patient, Hospital, Researcher, and Admin portals</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">HashScan Verification</td>
                <td className="px-4 py-3 text-sm text-gray-600">Publicly verifiable transactions on HashScan</td>
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
        <h2 className="text-2xl font-bold text-gray-900">Documentation Sections</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <a
            href="/docs/hedera"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">Hedera Integration</h3>
            <p className="mt-2 text-sm text-gray-600">
              Learn how MediPact leverages HCS, EVM, Accounts, and HBAR for immutable proofs and micropayments.
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
            href="/docs/data-flow"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">Data Flow</h3>
            <p className="mt-2 text-sm text-gray-600">
              Follow the complete data flow from EHR export to marketplace purchase.
            </p>
          </a>
          <a
            href="/docs/privacy"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">Privacy & Security</h3>
            <p className="mt-2 text-sm text-gray-600">
              Explore our privacy guarantees, anonymization techniques, and K-anonymity enforcement.
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
            href="/docs/quick-start"
            className="block rounded-lg border border-gray-200 bg-white p-6 transition-shadow hover:shadow-md"
          >
            <h3 className="text-lg font-semibold text-[#00A9CE]">Quick Start</h3>
            <p className="mt-2 text-sm text-gray-600">
              Get started with MediPact in minutes with our setup guide.
            </p>
          </a>
        </div>
      </section>
    </div>
  );
}


