import MermaidDiagram from '@/components/docs/MermaidDiagram';

export default function ArchitecturePage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">System Architecture</h1>
        <p className="mt-4 text-lg text-gray-600">
          Complete overview of MediPact's multi-layer architecture and component interactions.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Architecture Overview</h2>
        <MermaidDiagram
          chart={`graph TB
    subgraph "Frontend Layer"
        FE[Next.js 15 Frontend<br/>Patients, Hospitals, Researchers, Admins]
    end
    
    subgraph "Backend Layer"
        API[Express.js REST API<br/>Routes, Services, Database]
        LOG[Structured Logging<br/>Production Logger]
        VAL[Environment Validation<br/>Config Checker]
    end
    
    subgraph "Processing Layer"
        ADAPTER[Adapter<br/>Anonymization, HCS Client, FHIR]
    end
    
    subgraph "Hedera Network"
        HCS[HCS Topics<br/>Consent & Data Proofs]
        EVM[EVM Contracts<br/>ConsentManager<br/>RevenueSplitter]
        ACCOUNTS[Hedera Accounts<br/>0.0.xxxxx]
        HBAR[HBAR<br/>Micropayments]
    end
    
    FE <-->|REST API| API
    API <-->|Data Processing| ADAPTER
    ADAPTER -->|HCS Messages| HCS
    ADAPTER -->|Contract Calls| EVM
    API -->|Create Accounts| ACCOUNTS
    API -->|Distribute Revenue| HBAR
    API -->|Payment Verification| HBAR
    HBAR -->|Transfer| ACCOUNTS
    API --> LOG
    API --> VAL
    
    style FE fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style API fill:#FFF3E0,stroke:#F57C00,stroke-width:2px
    style ADAPTER fill:#FCE4EC,stroke:#C2185B,stroke-width:2px
    style HCS fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style EVM fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style ACCOUNTS fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style HBAR fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Components</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Component</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Technology</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Purpose</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Frontend</td>
                <td className="px-4 py-3 text-sm text-gray-600">Next.js 15, TypeScript, Tailwind CSS</td>
                <td className="px-4 py-3 text-sm text-gray-600">Patient/Hospital/Researcher/Admin portals</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Backend</td>
                <td className="px-4 py-3 text-sm text-gray-600">Express.js, Node.js, SQLite/PostgreSQL</td>
                <td className="px-4 py-3 text-sm text-gray-600">REST API, patient identity (UPI), marketplace</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Adapter</td>
                <td className="px-4 py-3 text-sm text-gray-600">Node.js, FHIR R4</td>
                <td className="px-4 py-3 text-sm text-gray-600">Processes EHR data, anonymizes PII, submits to HCS</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Smart Contracts</td>
                <td className="px-4 py-3 text-sm text-gray-600">Solidity (Hedera EVM)</td>
                <td className="px-4 py-3 text-sm text-gray-600">ConsentManager & RevenueSplitter</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Frontend Layer</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Next.js 15 Application</h3>
            <p className="mt-2 text-gray-700">
              Built with Next.js 15 App Router, TypeScript, and Tailwind CSS. Provides role-based dashboards for:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li><strong>Patients:</strong> Dashboard, earnings, wallet, consent management</li>
              <li><strong>Hospitals:</strong> Patient registration, data upload, revenue tracking</li>
              <li><strong>Researchers:</strong> Dataset catalog, purchases, analytics</li>
              <li><strong>Admins:</strong> System management, verification, analytics</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Backend Layer</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Express.js REST API</h3>
            <p className="mt-2 text-gray-700">
              RESTful API providing endpoints for:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>User authentication and authorization</li>
              <li>Patient identity management (UPI system)</li>
              <li>Dataset creation and querying</li>
              <li>Revenue distribution</li>
              <li>Hedera account management</li>
              <li>Payment verification</li>
              <li>Wallet balance queries</li>
              <li>Withdrawal processing</li>
              <li>Exchange rate management</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Database</h3>
            <p className="mt-2 text-gray-700">
              SQLite for development, PostgreSQL for production. Stores:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>Patient records with UPI (Universal Patient Identifier)</li>
              <li>Hospital and researcher profiles</li>
              <li>Consent records and verification status</li>
              <li>Dataset metadata and query results</li>
              <li>Hedera account IDs and encrypted keys</li>
              <li>Payment methods and withdrawal settings</li>
              <li>Withdrawal history and transaction logs</li>
              <li>Exchange rate cache</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Processing Layer</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Adapter Service</h3>
          <p className="mt-2 text-gray-700">
            The adapter is responsible for processing raw EHR data:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
            <li><strong>FHIR R4 Parsing:</strong> Validates and parses FHIR-compliant medical records</li>
            <li><strong>PII Anonymization:</strong> Removes personally identifiable information</li>
            <li><strong>Demographic Preservation:</strong> Maintains research-valuable demographics (age range, country, gender)</li>
            <li><strong>K-Anonymity Enforcement:</strong> Ensures minimum 5 records per demographic group</li>
            <li><strong>HCS Submission:</strong> Submits consent and data proof hashes to Hedera Consensus Service</li>
            <li><strong>Smart Contract Integration:</strong> Records consent on ConsentManager contract</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Hedera Network Integration</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6">
            <h3 className="text-lg font-semibold text-[#00A9CE]">HCS Topics</h3>
            <p className="mt-2 text-sm text-gray-700">
              Immutable storage for consent proofs and data hashes. Each message is cryptographically signed and timestamped.
            </p>
          </div>
          <div className="rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6">
            <h3 className="text-lg font-semibold text-[#00A9CE]">EVM Contracts</h3>
            <p className="mt-2 text-sm text-gray-700">
              ConsentManager for consent registry and RevenueSplitter for automated revenue distribution.
            </p>
          </div>
          <div className="rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6">
            <h3 className="text-lg font-semibold text-[#00A9CE]">Hedera Accounts</h3>
            <p className="mt-2 text-sm text-gray-700">
              Native accounts (0.0.xxxxx) for all users, created during registration or on first payment.
            </p>
          </div>
          <div className="rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6">
            <h3 className="text-lg font-semibold text-[#00A9CE]">HBAR</h3>
            <p className="mt-2 text-sm text-gray-700">
              Native cryptocurrency for micropayments and revenue distribution with low transaction fees.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Security Architecture</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Key Security Features</h3>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
            <li><strong>Encrypted Private Keys:</strong> All Hedera private keys are encrypted before storage</li>
            <li><strong>Role-Based Access Control:</strong> API endpoints protected by role-based authentication</li>
            <li><strong>PII Anonymization:</strong> No personally identifiable information stored on-chain</li>
            <li><strong>Consent Validation:</strong> Database and smart contract level enforcement</li>
            <li><strong>Immutable Audit Trail:</strong> All consent and data proofs stored on HCS</li>
            <li><strong>K-Anonymity:</strong> Privacy protection through demographic grouping</li>
            <li><strong>Payment Data Encryption:</strong> Bank accounts and mobile money numbers encrypted at rest</li>
            <li><strong>Production Logging:</strong> Structured JSON logs with security event tracking</li>
            <li><strong>Environment Validation:</strong> Startup validation of required configuration</li>
            <li><strong>Security Headers:</strong> Production security headers (HSTS, XSS protection, etc.)</li>
          </ul>
        </div>
      </section>
    </div>
  );
}


