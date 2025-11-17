import MermaidDiagram from '@/components/docs/MermaidDiagram';
import Link from 'next/link';

export default function ForHospitalsPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Guide for Hospitals</h1>
        <p className="mt-4 text-lg text-gray-600">
          Learn how to use MediPact to manage patient data, generate revenue, and contribute to medical research while maintaining patient privacy.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">What is MediPact for Hospitals?</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            MediPact enables hospitals to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
            <li><strong>Generate Revenue:</strong> Earn 25% of revenue from data you collect (original collector is sole beneficiary)</li>
            <li><strong>Contribute to Research:</strong> Make anonymized patient data available for medical research</li>
            <li><strong>Maintain Privacy:</strong> Advanced anonymization ensures patient privacy is protected</li>
            <li><strong>Compliance:</strong> Built-in consent management and audit trails for regulatory compliance</li>
            <li><strong>Easy Integration:</strong> Simple CSV upload or API integration with existing EHR systems</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
        <MermaidDiagram
          chart={`flowchart TD
    A[Hospital Registers] --> B[Receive Hospital ID<br/>& API Key]
    B --> C[Upload Patient Data<br/>CSV or API]
    C --> D[Adapter Processes Data<br/>Anonymization]
    D --> E[Data Stored<br/>FHIR Format]
    E --> F[Consent Recorded<br/>on Hedera]
    F --> G[Data Available<br/>in Marketplace]
    G --> H{Researcher<br/>Purchases?}
    H -->|Yes| I[Revenue Distributed]
    I --> J[You Receive 25%<br/>Per Patient]
    J --> K[Withdraw to Bank<br/>or Mobile Money]
    
    style A fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style D fill:#C8E6C9,stroke:#388E3C,stroke-width:2px
    style F fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style J fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style K fill:#BBDEFB,stroke:#1976D2,stroke-width:2px`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Step 1: Register Your Hospital</h3>
            <p className="mt-2 text-gray-700">
              Create your hospital account and complete verification:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-600">
              <li>Provide hospital information and credentials</li>
              <li>Submit verification documents</li>
              <li>Receive Hospital ID and API Key</li>
              <li>Hedera account created automatically</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Step 2: Upload Patient Data</h3>
            <p className="mt-2 text-gray-700">
              Upload patient data via CSV or API:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-600">
              <li><strong>CSV Upload:</strong> Export from EHR system and upload through web interface</li>
              <li><strong>API Integration:</strong> Connect your EHR system directly via REST API</li>
              <li>Data automatically anonymized and processed</li>
              <li>Each patient linked to your hospital permanently</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Step 3: Data Processing</h3>
            <p className="mt-2 text-gray-700">
              The MediPact adapter automatically:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-600">
              <li>Anonymizes patient data (removes PII)</li>
              <li>Converts to FHIR R4 format</li>
              <li>Enforces K-anonymity (minimum 5 records per group)</li>
              <li>Records consent on Hedera blockchain</li>
              <li>Stores data securely in database</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Revenue Model</h2>
        <div className="mt-4 rounded-lg border-2 border-blue-500 bg-blue-50 p-6">
          <h3 className="text-xl font-bold text-blue-900">You Receive 25% of Revenue (Original Collector)</h3>
          <p className="mt-2 text-gray-700">
            <strong>Key Principle:</strong> The hospital that originally collected a patient's data is the sole beneficiary of revenue from that data.
          </p>
          <div className="mt-4 rounded-lg border border-blue-200 bg-white p-4">
            <p className="font-semibold text-gray-900">Example:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li>Researcher pays $1,000 for dataset with 100 patients</li>
              <li>60 patients from your hospital, 40 from another</li>
              <li>Amount per patient: $10</li>
              <li>Your revenue: 60 patients × $10 × 25% = <strong>$150</strong></li>
              <li>Other hospital receives: 40 patients × $10 × 25% = $100</li>
            </ul>
          </div>
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm font-semibold text-gray-900">⚠️ Important:</p>
            <p className="mt-1 text-sm text-gray-700">
              Temporary access to patient data from other hospitals does NOT change revenue distribution. You only receive revenue from data you originally collected.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Data Security & Privacy</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <h3 className="text-lg font-semibold text-green-900">Double Anonymization</h3>
            <p className="mt-2 text-gray-700">
              Patient data goes through two stages of anonymization:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li><strong>Stage 1:</strong> Removes PII (names, addresses, exact DOB)</li>
              <li><strong>Stage 2:</strong> Further generalizes data for blockchain storage</li>
              <li><strong>K-Anonymity:</strong> Ensures at least 5 patients per demographic group</li>
            </ul>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h3 className="text-lg font-semibold text-blue-900">Immutable Consent Records</h3>
            <p className="mt-2 text-gray-700">
              All consent decisions are recorded on Hedera blockchain, providing:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li>Unchangeable audit trail</li>
              <li>Regulatory compliance proof</li>
              <li>Public verification on HashScan</li>
            </ul>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
            <h3 className="text-lg font-semibold text-purple-900">Patient Control</h3>
            <p className="mt-2 text-gray-700">
              Patients maintain full control over their data:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li>Global opt-in/opt-out</li>
              <li>Individual researcher approvals</li>
              <li>Granular data sharing preferences</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Features & Benefits</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-green-900">💰 Generate Revenue</h3>
            <p className="mt-1 text-sm text-gray-700">
              Earn 25% of revenue from data you collect. Revenue distributed automatically via Hedera smart contracts.
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">🔬 Support Research</h3>
            <p className="mt-1 text-sm text-gray-700">
              Contribute to medical research while maintaining patient privacy through advanced anonymization.
            </p>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <h3 className="font-semibold text-purple-900">✅ Compliance Ready</h3>
            <p className="mt-1 text-sm text-gray-700">
              Built-in consent management, audit trails, and immutable records for regulatory compliance.
            </p>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h3 className="font-semibold text-yellow-900">🔗 Easy Integration</h3>
            <p className="mt-1 text-sm text-gray-700">
              Simple CSV upload or REST API integration with existing EHR systems.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Wallet & Withdrawals</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Automatic Revenue Distribution</h3>
          <p className="mt-2 text-gray-700">
            When researchers purchase datasets containing your patients' data:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
            <li>Revenue automatically distributed to your Hedera wallet</li>
            <li>View balances in USD (primary) and HBAR</li>
            <li>Withdraw to bank account or mobile money</li>
            <li>Set automatic withdrawals when balance reaches threshold</li>
            <li>All transactions verifiable on HashScan</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Getting Help</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            Need help? Check out these resources:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
            <li><Link href="/docs/data-flow" className="text-[#00A9CE] hover:underline">Data Flow Guide</Link></li>
            <li><Link href="/docs/revenue-distribution" className="text-[#00A9CE] hover:underline">Revenue Distribution Model</Link></li>
            <li><Link href="/docs/api" className="text-[#00A9CE] hover:underline">API Documentation</Link></li>
            <li><Link href="/contact" className="text-[#00A9CE] hover:underline">Contact Support</Link></li>
          </ul>
        </div>
      </section>
    </div>
  );
}

