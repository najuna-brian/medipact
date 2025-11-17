import MermaidDiagram from '@/components/docs/MermaidDiagram';
import Link from 'next/link';

export default function ForResearchersPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Guide for Researchers</h1>
        <p className="mt-4 text-lg text-gray-600">
          Learn how to access high-quality, anonymized medical data for research while ensuring patient privacy and regulatory compliance.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">What is MediPact for Researchers?</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            MediPact provides researchers with:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
            <li><strong>High-Quality Data:</strong> FHIR R4 compliant, anonymized medical data</li>
            <li><strong>Affordable Pricing:</strong> 40% of market rates with volume discounts</li>
            <li><strong>Transparent Verification:</strong> All data verified on Hedera blockchain</li>
            <li><strong>Easy Access:</strong> Browse, query, and purchase datasets through web interface or API</li>
            <li><strong>Compliance Ready:</strong> Built-in consent management and audit trails</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
        <MermaidDiagram
          chart={`flowchart TD
    A[Researcher Registers] --> B[Complete Verification]
    B --> C[Browse Datasets<br/>or Query Data]
    C --> D[Preview Results<br/>Count & Statistics]
    D --> E{Want to Purchase?}
    E -->|Yes| F[Pay in HBAR<br/>via Hedera]
    E -->|No| G[Continue Browsing]
    F --> H[Payment Verified<br/>on Hedera]
    H --> I[Revenue Distributed<br/>60/25/15]
    I --> J[Access Granted]
    J --> K[Download Data<br/>CSV or FHIR]
    
    style A fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style F fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style H fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style I fill:#C8E6C9,stroke:#388E3C,stroke-width:2px
    style K fill:#BBDEFB,stroke:#1976D2,stroke-width:2px`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Step 1: Register & Verify</h3>
            <p className="mt-2 text-gray-700">
              Create your researcher account:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-600">
              <li>Provide organization information</li>
              <li>Submit verification documents</li>
              <li>Complete verification process</li>
              <li>Hedera account created automatically</li>
            </ul>
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-gray-700">
                <strong>Note:</strong> Verification is required to purchase datasets. Unverified researchers can browse and query but cannot purchase.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Step 2: Browse or Query Data</h3>
            <p className="mt-2 text-gray-700">
              Access data through two methods:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-600">
              <li><strong>Browse Datasets:</strong> View pre-created datasets with metadata</li>
              <li><strong>Query Interface:</strong> Filter by country, date, condition, demographics, etc.</li>
              <li>Preview results (count and statistics) before purchasing</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Step 3: Purchase & Access</h3>
            <p className="mt-2 text-gray-700">
              When ready to purchase:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-600">
              <li>Receive payment request (platform account, amount in HBAR)</li>
              <li>Send HBAR payment from your Hedera wallet</li>
              <li>Provide transaction ID for verification</li>
              <li>System verifies payment and grants access</li>
              <li>Download data in CSV or FHIR format</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Pricing & Affordability</h2>
        <div className="mt-4 rounded-lg border-2 border-green-500 bg-green-50 p-6">
          <h3 className="text-xl font-bold text-green-900">40% of Market Rates</h3>
          <p className="mt-2 text-gray-700">
            MediPact offers transparent, category-based pricing at 40% of market rates:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price per Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">Basic Demographics</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">$0.032</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">Condition Data</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">$0.12</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">Lab Results</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">$0.24</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">Combined Dataset</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">$1.00</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-700">Longitudinal</td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">$2.00</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-4 rounded-lg border border-green-200 bg-white p-4">
            <p className="font-semibold text-gray-900">Volume Discounts:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li>101-500 records: 10% discount</li>
              <li>501-1,000 records: 20% discount</li>
              <li>1,001-5,000 records: 30% discount</li>
              <li>5,001+ records: 40% discount</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Data Quality & Verification</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h3 className="text-lg font-semibold text-blue-900">FHIR R4 Compliant</h3>
            <p className="mt-2 text-gray-700">
              All data is stored in FHIR R4 format, ensuring interoperability with global medical record systems and research tools.
            </p>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <h3 className="text-lg font-semibold text-green-900">Verifiable on Hedera</h3>
            <p className="mt-2 text-gray-700">
              All datasets are verified on Hedera blockchain:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li>Consent records stored on HCS (immutable)</li>
              <li>Data provenance hashes verifiable on HashScan</li>
              <li>Smart contract consent validation</li>
              <li>Complete audit trail</li>
            </ul>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
            <h3 className="text-lg font-semibold text-purple-900">Privacy Protected</h3>
            <p className="mt-2 text-gray-700">
              Data is anonymized using advanced techniques:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li>Double anonymization (two-stage process)</li>
              <li>K-anonymity enforcement (minimum 5 records per group)</li>
              <li>PII completely removed</li>
              <li>Patient consent verified before access</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Payment Process</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Paying with HBAR</h3>
          <p className="mt-2 text-gray-700">
            All payments are made in HBAR (Hedera's native cryptocurrency):
          </p>
          <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-gray-700">
            <li>Prices displayed in USD for clarity</li>
            <li>System converts to HBAR using real-time exchange rates</li>
            <li>You receive payment request with platform account ID</li>
            <li>Send HBAR from your Hedera wallet (HashPack, Blade, etc.)</li>
            <li>Provide transaction ID for verification</li>
            <li>System verifies payment and grants access</li>
          </ol>
          <div className="mt-4 rounded-lg border-2 border-[#00A9CE] bg-[#E3F2FD] p-4">
            <p className="text-sm font-semibold text-[#00A9CE]">Benefits:</p>
            <ul className="mt-1 list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li><strong>Low Fees:</strong> ~$0.0001 per transaction</li>
              <li><strong>Fast:</strong> 3-5 second settlement</li>
              <li><strong>Transparent:</strong> All transactions verifiable on HashScan</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">API Access</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">REST API for Programmatic Access</h3>
          <p className="mt-2 text-gray-700">
            Access data programmatically using our REST API:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
            <li>Create API keys in your researcher dashboard</li>
            <li>Query datasets and filter data via API</li>
            <li>Purchase datasets programmatically</li>
            <li>Download data in CSV or FHIR format</li>
          </ul>
          <div className="mt-4">
            <Link href="/docs/api" className="text-[#00A9CE] hover:underline font-semibold">
              View API Documentation →
            </Link>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Key Benefits</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-green-900">💰 Affordable</h3>
            <p className="mt-1 text-sm text-gray-700">
              40% of market rates with volume discounts. All prices transparent and displayed in USD.
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">🔍 Verifiable</h3>
            <p className="mt-1 text-sm text-gray-700">
              All data verified on Hedera blockchain. Consent records and provenance hashes publicly verifiable.
            </p>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <h3 className="font-semibold text-purple-900">📊 High Quality</h3>
            <p className="mt-1 text-sm text-gray-700">
              FHIR R4 compliant data with proper anonymization. K-anonymity enforced for privacy protection.
            </p>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h3 className="font-semibold text-yellow-900">⚡ Fast Access</h3>
            <p className="mt-1 text-sm text-gray-700">
              Instant payment verification and data access. Download in CSV or FHIR format immediately.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Getting Help</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            Need help? Check out these resources:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
            <li><Link href="/docs/api" className="text-[#00A9CE] hover:underline">API Documentation</Link></li>
            <li><Link href="/docs/pricing" className="text-[#00A9CE] hover:underline">Pricing Guide</Link></li>
            <li><Link href="/docs/data-flow" className="text-[#00A9CE] hover:underline">Data Flow & Verification</Link></li>
            <li><Link href="/contact" className="text-[#00A9CE] hover:underline">Contact Support</Link></li>
          </ul>
        </div>
      </section>
    </div>
  );
}

