import MermaidDiagram from '@/components/docs/MermaidDiagram';

export default function RevenueDistributionPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Revenue Distribution Model</h1>
        <p className="mt-4 text-lg text-gray-600">
          Transparent, automated revenue distribution ensuring fair compensation for all participants.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Core Principle</h2>
        <div className="mt-4 rounded-lg border-2 border-[#00A9CE] bg-[#E3F2FD] p-6">
          <p className="text-lg font-semibold text-gray-900">
            <strong>The hospital that originally collected the patient's data is the sole beneficiary of revenue from that data.</strong>
          </p>
          <p className="mt-2 text-gray-700">
            This ensures fair attribution and incentivizes hospitals to collect high-quality data while maintaining patient privacy.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Revenue Split: 60/25/15</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border-2 border-green-500 bg-green-50 p-6 text-center">
            <p className="text-5xl font-bold text-green-900">60%</p>
            <p className="mt-2 text-xl font-semibold text-green-800">Patient</p>
            <p className="mt-2 text-sm text-green-700">
              Direct compensation for data contribution. Patients receive their share automatically in their Hedera wallet.
            </p>
          </div>
          <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-6 text-center">
            <p className="text-5xl font-bold text-blue-900">25%</p>
            <p className="mt-2 text-xl font-semibold text-blue-800">Hospital</p>
            <p className="mt-2 text-sm text-blue-700">
              Original data collector. Only the hospital that collected the data receives revenue from it.
            </p>
          </div>
          <div className="rounded-lg border-2 border-purple-500 bg-purple-50 p-6 text-center">
            <p className="text-5xl font-bold text-purple-900">15%</p>
            <p className="mt-2 text-xl font-semibold text-purple-800">MediPact</p>
            <p className="mt-2 text-sm text-purple-700">
              Platform operations, infrastructure, and continued development.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">How Revenue Distribution Works</h2>
        <MermaidDiagram
          chart={`flowchart TD
    A[Researcher Purchases Dataset<br/>$1,000 USD = 6,250 HBAR] --> B[Payment Split Equally<br/>Among All Patients]
    B --> C{100 Patients in Dataset}
    C --> D[Amount per Patient:<br/>6,250 ÷ 100 = 62.5 HBAR]
    D --> E[For Each Patient:<br/>Split 60/25/15]
    E --> F[Patient: 37.5 HBAR<br/>60%]
    E --> G[Hospital: 15.625 HBAR<br/>25%]
    E --> H[Platform: 9.375 HBAR<br/>15%]
    F --> I[Group by Hospital]
    G --> I
    I --> J{Hospital A: 60 patients<br/>Hospital B: 40 patients}
    J --> K[Hospital A Receives:<br/>60 × 15.625 = 937.5 HBAR]
    J --> L[Hospital B Receives:<br/>40 × 15.625 = 625 HBAR]
    K --> M[RevenueSplitter Contract<br/>Distributes HBAR]
    L --> M
    F --> M
    H --> M
    M --> N[All Transfers Verified<br/>on HashScan]
    
    style A fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style E fill:#FFF9C4,stroke:#F57F17,stroke-width:2px
    style F fill:#C8E6C9,stroke:#388E3C,stroke-width:2px
    style G fill:#BBDEFB,stroke:#1976D2,stroke-width:2px
    style H fill:#E1BEE7,stroke:#7B1FA2,stroke-width:2px
    style M fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style N fill:#FFD700,color:#000,stroke:#FFA500,stroke-width:2px`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Step-by-Step Distribution Process</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Step 1: Equal Split Per Patient</h3>
            <p className="mt-2 text-gray-700">
              When a researcher purchases a dataset, the total payment is divided equally among all patients in that dataset.
            </p>
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-gray-900">Example:</p>
              <p className="mt-1 text-sm text-gray-700">
                Payment: 10,000 HBAR, Dataset: 100 patients → <strong>100 HBAR per patient</strong>
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Step 2: Per-Patient Revenue Split</h3>
            <p className="mt-2 text-gray-700">
              Each patient's share is then split according to the 60/25/15 model:
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-green-200 bg-green-50 p-3">
                <p className="text-sm font-semibold text-green-900">Patient (60%)</p>
                <p className="mt-1 text-xs text-green-700">100 HBAR × 60% = 60 HBAR</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">
                <p className="text-sm font-semibold text-blue-900">Hospital (25%)</p>
                <p className="mt-1 text-xs text-blue-700">100 HBAR × 25% = 25 HBAR</p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
                <p className="text-sm font-semibold text-purple-900">Platform (15%)</p>
                <p className="mt-1 text-xs text-purple-700">100 HBAR × 15% = 15 HBAR</p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Step 3: Hospital Attribution</h3>
            <p className="mt-2 text-gray-700">
              Each patient's 25% share goes to their <strong>original collecting hospital</strong>. The system uses the permanent <code className="bg-gray-100 px-1 rounded">hospital_id</code> field in the database to ensure correct attribution.
            </p>
            <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm font-semibold text-gray-900">Example with Multiple Hospitals:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
                <li>Dataset: 100 patients (60 from Hospital A, 40 from Hospital B)</li>
                <li>Hospital A receives: 60 patients × 25 HBAR = <strong>1,500 HBAR</strong></li>
                <li>Hospital B receives: 40 patients × 25 HBAR = <strong>1,000 HBAR</strong></li>
                <li>Total patients receive: 100 patients × 60 HBAR = <strong>6,000 HBAR</strong></li>
                <li>Platform receives: 100 patients × 15 HBAR = <strong>1,500 HBAR</strong></li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Step 4: Automated Distribution via Smart Contract</h3>
            <p className="mt-2 text-gray-700">
              The RevenueSplitter smart contract on Hedera EVM automatically:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>Calculates the 60/25/15 split for each patient</li>
              <li>Groups patients by their original hospital</li>
              <li>Transfers HBAR directly to Hedera accounts (0.0.xxxxx)</li>
              <li>Records all transactions on-chain for transparency</li>
            </ul>
            <div className="mt-3 rounded-lg border-2 border-[#00A9CE] bg-[#E3F2FD] p-4">
              <p className="text-sm font-semibold text-[#00A9CE]">Benefits:</p>
              <ul className="mt-1 list-disc space-y-1 pl-6 text-sm text-gray-700">
                <li><strong>Trustless:</strong> No manual intervention required</li>
                <li><strong>Transparent:</strong> All transactions verifiable on HashScan</li>
                <li><strong>Instant:</strong> Settlements complete in 3-5 seconds</li>
                <li><strong>Low Cost:</strong> ~$0.0001 per transfer</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Complete Revenue Flow</h2>
        <MermaidDiagram
          chart={`sequenceDiagram
    participant R as Researcher
    participant M as Marketplace
    participant HA as Hedera Accounts
    participant SC as RevenueSplitter<br/>Contract
    participant P as Patients
    participant H as Hospitals
    participant PL as Platform
    
    R->>M: Purchase Dataset<br/>($1,000 USD)
    M->>M: Convert to HBAR<br/>(6,250 HBAR @ $0.16)
    M->>R: Payment Request<br/>(Platform Account ID)
    R->>HA: Send HBAR Payment<br/>(Researcher → Platform)
    R->>M: Provide Transaction ID
    M->>HA: Verify Payment<br/>(Query Receipt)
    HA-->>M: Payment Verified
    
    M->>M: Calculate Distribution<br/>(100 patients = 62.5 HBAR each)
    M->>SC: Trigger Distribution<br/>(Total: 6,250 HBAR)
    
    SC->>SC: For Each Patient:<br/>Split 60/25/15
    SC->>SC: Group by Hospital<br/>(Hospital A: 60, B: 40)
    
    SC->>HA: Transfer to Patients<br/>(100 × 37.5 = 3,750 HBAR)
    HA->>P: 60% per Patient<br/>(37.5 HBAR each)
    
    SC->>HA: Transfer to Hospital A<br/>(60 × 15.625 = 937.5 HBAR)
    HA->>H: 25% for Hospital A<br/>(Original Collector)
    
    SC->>HA: Transfer to Hospital B<br/>(40 × 15.625 = 625 HBAR)
    HA->>H: 25% for Hospital B<br/>(Original Collector)
    
    SC->>HA: Transfer to Platform<br/>(100 × 9.375 = 937.5 HBAR)
    HA->>PL: 15% Platform Share
    
    SC-->>M: Distribution Complete<br/>(All Tx IDs)
    M->>R: Grant Data Access
    
    Note over HA,SC: All Transactions<br/>Verifiable on HashScan`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Fair Attribution Rules</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <h3 className="text-lg font-semibold text-green-900">✅ Permanent Hospital Linkage</h3>
            <p className="mt-2 text-gray-700">
              Each patient record has a permanent <code className="bg-white px-1 rounded">hospital_id</code> field that links it to the hospital that originally collected the data. This field is set when data is first collected and <strong>never changes</strong>.
            </p>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h3 className="text-lg font-semibold text-blue-900">✅ Original Collector is Sole Beneficiary</h3>
            <p className="mt-2 text-gray-700">
              Only the hospital that originally collected a patient's data receives revenue from that data. Even if a patient later visits other hospitals, revenue attribution remains with the original collector.
            </p>
          </div>

          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <h3 className="text-lg font-semibold text-yellow-900">⚠️ Temporary Access Does Not Change Attribution</h3>
            <p className="mt-2 text-gray-700">
              Temporary cross-hospital access (for telemedicine) allows hospitals to view patient data, but does NOT change revenue distribution. If that data is later sold, revenue still goes to the original collecting hospital.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              <strong>Example:</strong> Hospital A requests temporary access to patient data from Hospital B. Hospital A can view the data, but if it's sold, Hospital B (the original collector) receives the revenue.
            </p>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
            <h3 className="text-lg font-semibold text-purple-900">✅ Multi-Hospital Datasets</h3>
            <p className="mt-2 text-gray-700">
              Datasets can contain patients from multiple hospitals. Each hospital receives revenue only for their own patients. The system automatically groups patients by their original hospital and distributes accordingly.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Real-World Example</h2>
        <div className="mt-4 rounded-lg border-2 border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Scenario: Multi-Hospital Dataset Purchase</h3>
          <div className="mt-4 space-y-4">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">Purchase Details:</p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
                <li>Researcher pays: <strong>$2,000 USD</strong></li>
                <li>Exchange rate: <strong>$0.16 per HBAR</strong></li>
                <li>Total payment: <strong>12,500 HBAR</strong></li>
                <li>Dataset contains: <strong>200 patients</strong>
                  <ul className="mt-1 list-disc space-y-1 pl-6">
                    <li>120 patients from Hospital A</li>
                    <li>80 patients from Hospital B</li>
                  </ul>
                </li>
              </ul>
            </div>

            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="font-semibold text-gray-900">Step 1: Equal Split</p>
              <p className="mt-1 text-sm text-gray-700">
                Amount per patient: <strong>12,500 ÷ 200 = 62.5 HBAR</strong>
              </p>
            </div>

            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="font-semibold text-gray-900">Step 2: Per-Patient Split (60/25/15)</p>
              <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p className="font-semibold text-green-900">Patient (60%)</p>
                  <p className="text-gray-700">62.5 × 60% = <strong>37.5 HBAR</strong></p>
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Hospital (25%)</p>
                  <p className="text-gray-700">62.5 × 25% = <strong>15.625 HBAR</strong></p>
                </div>
                <div>
                  <p className="font-semibold text-purple-900">Platform (15%)</p>
                  <p className="text-gray-700">62.5 × 15% = <strong>9.375 HBAR</strong></p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
              <p className="font-semibold text-gray-900">Step 3: Hospital Totals</p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
                <li><strong>Hospital A:</strong> 120 patients × 15.625 HBAR = <strong>1,875 HBAR</strong></li>
                <li><strong>Hospital B:</strong> 80 patients × 15.625 HBAR = <strong>1,250 HBAR</strong></li>
              </ul>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <p className="font-semibold text-gray-900">Step 4: Total Distribution</p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
                <li><strong>All Patients:</strong> 200 × 37.5 HBAR = <strong>7,500 HBAR</strong></li>
                <li><strong>Hospital A:</strong> <strong>1,875 HBAR</strong></li>
                <li><strong>Hospital B:</strong> <strong>1,250 HBAR</strong></li>
                <li><strong>Platform:</strong> 200 × 9.375 HBAR = <strong>1,875 HBAR</strong></li>
                <li><strong>Total:</strong> 7,500 + 1,875 + 1,250 + 1,875 = <strong>12,500 HBAR</strong> ✅</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Verification & Transparency</h2>
        <div className="mt-4 rounded-lg border-2 border-[#00A9CE] bg-[#E3F2FD] p-6">
          <h3 className="text-lg font-semibold text-[#00A9CE]">All Transactions Verifiable on HashScan</h3>
          <p className="mt-2 text-gray-700">
            Every revenue distribution transaction is recorded on Hedera and can be verified on HashScan:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
            <li><strong>Researcher Payment:</strong> Verify payment from researcher account to platform</li>
            <li><strong>Patient Transfers:</strong> View all HBAR transfers to patient accounts</li>
            <li><strong>Hospital Transfers:</strong> Verify hospital revenue distribution</li>
            <li><strong>Platform Share:</strong> Confirm platform revenue</li>
            <li><strong>Smart Contract Calls:</strong> Review RevenueSplitter contract interactions</li>
          </ul>
          <p className="mt-4 text-sm text-gray-600">
            <strong>Transparency:</strong> Anyone can verify the fairness of revenue distribution by checking HashScan transaction records.
          </p>
        </div>
      </section>
    </div>
  );
}

