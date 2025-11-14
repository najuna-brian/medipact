import MermaidDiagram from '@/components/docs/MermaidDiagram';
import CodeBlock from '@/components/docs/CodeBlock';

export default function PricingPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Pricing & Revenue Model</h1>
        <p className="mt-4 text-lg text-gray-600">
          Transparent, category-based pricing designed to be affordable for researchers while ensuring fair compensation for data providers.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Pricing Philosophy</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            MediPact's pricing model is designed to be <strong>40% of market rates</strong>, making research data accessible while ensuring sustainable revenue for patients and hospitals. All prices are displayed in USD for transparency, with automatic HBAR conversion for transactions.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Pricing Categories</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Category</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Price per Record (USD)</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Basic Demographics</td>
                <td className="px-4 py-3 text-sm text-gray-600">$0.032</td>
                <td className="px-4 py-3 text-sm text-gray-600">Age, gender, country, region only</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Condition Data</td>
                <td className="px-4 py-3 text-sm text-gray-600">$0.12</td>
                <td className="px-4 py-3 text-sm text-gray-600">Diagnosis codes, condition names, dates</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Lab Results</td>
                <td className="px-4 py-3 text-sm text-gray-600">$0.24</td>
                <td className="px-4 py-3 text-sm text-gray-600">Observations, lab values, test results</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Combined Dataset</td>
                <td className="px-4 py-3 text-sm text-gray-600">$1.00</td>
                <td className="px-4 py-3 text-sm text-gray-600">Demographics + conditions + observations</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Longitudinal</td>
                <td className="px-4 py-3 text-sm text-gray-600">$2.00</td>
                <td className="px-4 py-3 text-sm text-gray-600">Multi-timepoint data, trends over time</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Sensitive/Rare</td>
                <td className="px-4 py-3 text-sm text-gray-600">$5.00</td>
                <td className="px-4 py-3 text-sm text-gray-600">Rare conditions, sensitive diagnoses, specialized data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Volume Discounts</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            Larger datasets receive automatic volume discounts to encourage bulk purchases and make research more cost-effective.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Record Count</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Discount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-600">1 - 100</td>
                  <td className="px-4 py-3 text-sm text-gray-600">0%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-600">101 - 500</td>
                  <td className="px-4 py-3 text-sm text-gray-600">10%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-600">501 - 1,000</td>
                  <td className="px-4 py-3 text-sm text-gray-600">20%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-600">1,001 - 5,000</td>
                  <td className="px-4 py-3 text-sm text-gray-600">30%</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-600">5,001+</td>
                  <td className="px-4 py-3 text-sm text-gray-600">40%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Revenue Distribution</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">60/25/15 Split</h3>
          <p className="mt-2 text-gray-700">
            Revenue from dataset purchases is automatically distributed using the RevenueSplitter smart contract:
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 text-center">
              <p className="text-3xl font-bold text-green-900">60%</p>
              <p className="mt-1 text-sm font-semibold text-green-800">Patient</p>
              <p className="mt-1 text-xs text-green-700">Direct compensation for data contribution</p>
            </div>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-center">
              <p className="text-3xl font-bold text-blue-900">25%</p>
              <p className="mt-1 text-sm font-semibold text-blue-800">Hospital</p>
              <p className="mt-1 text-xs text-blue-700">Original data collector</p>
            </div>
            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-center">
              <p className="text-3xl font-bold text-purple-900">15%</p>
              <p className="mt-1 text-sm font-semibold text-purple-800">MediPact</p>
              <p className="mt-1 text-xs text-purple-700">Platform operations</p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Fair Revenue Attribution</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Original Hospital is Sole Beneficiary</h3>
          <p className="mt-2 text-gray-700">
            <strong>Key Principle:</strong> The hospital that originally collected the patient's data is the sole beneficiary of revenue from that data.
          </p>
          <div className="mt-4 space-y-3">
            <div className="flex items-start space-x-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <span className="text-blue-600">ℹ️</span>
              <div>
                <h4 className="font-semibold text-gray-900">How It Works</h4>
                <p className="mt-1 text-sm text-gray-700">
                  Each patient record has a permanent <code className="bg-gray-100 px-1 rounded">hospital_id</code> field linking it to the collecting hospital. When data is sold, each patient's 25% share goes to their original hospital.
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
              <span className="text-green-600">✅</span>
              <div>
                <h4 className="font-semibold text-gray-900">Example</h4>
                <p className="mt-1 text-sm text-gray-700">
                  Dataset with 100 patients: 60 from Hospital A, 40 from Hospital B. Payment: 1,000 HBAR. Hospital A receives 60 × 10 HBAR × 25% = 150 HBAR. Hospital B receives 40 × 10 HBAR × 25% = 100 HBAR.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Pricing Calculation</h2>
        <MermaidDiagram
          chart={`flowchart TD
    A[Dataset Created] --> B{Determine Category}
    B --> C[Calculate Base Price<br/>Records × Price per Record]
    C --> D{Check Record Count}
    D -->|1-100| E[0% Discount]
    D -->|101-500| F[10% Discount]
    D -->|501-1,000| G[20% Discount]
    D -->|1,001-5,000| H[30% Discount]
    D -->|5,001+| I[40% Discount]
    E --> J[Apply Discount]
    F --> J
    G --> J
    H --> J
    I --> J
    J --> K[Convert to HBAR<br/>USD ÷ Exchange Rate<br/>(Dynamic from CoinGecko)]
    K --> L[Store: price, priceUSD,<br/>pricePerRecordHBAR,<br/>pricePerRecordUSD]
    
    style A fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style B fill:#FFF9C4,stroke:#F57F17,stroke-width:2px
    style J fill:#C8E6C9,stroke:#388E3C,stroke-width:2px
    style L fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">USD Display & Dynamic Exchange Rates</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            All prices are displayed in USD to users for clarity and transparency. The system automatically converts between USD and HBAR using <strong>real-time exchange rates</strong> from CoinGecko API.
          </p>
          <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="font-semibold text-gray-900">Dynamic Exchange Rate System</h4>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li><strong>Source:</strong> CoinGecko API (hedera-hashgraph price)</li>
              <li><strong>Update Frequency:</strong> Every 5 minutes (cached)</li>
              <li><strong>Fallback Rate:</strong> $0.16 per HBAR (if API unavailable)</li>
              <li><strong>Automatic Updates:</strong> Rates refreshed on server startup and periodically</li>
            </ul>
          </div>
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h4 className="font-semibold text-gray-900">Display Format</h4>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>Total price: <code className="bg-white px-1 rounded">$X.XX</code> (primary display)</li>
              <li>Price in HBAR: <code className="bg-white px-1 rounded">X.XXXX HBAR</code> (shown below USD)</li>
              <li>Price per record: <code className="bg-white px-1 rounded">$X.XXXX per record</code></li>
              <li>Volume discount: <code className="bg-white px-1 rounded">(X% volume discount)</code></li>
              <li>Pricing category: <code className="bg-white px-1 rounded">Category: X</code></li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Academic & Nonprofit Discounts</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            Academic institutions and nonprofit research organizations may be eligible for additional discounts. Contact us for more information about institutional pricing.
          </p>
        </div>
      </section>
    </div>
  );
}

