import MermaidDiagram from '@/components/docs/MermaidDiagram';

export default function DataFlowPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Data Flow</h1>
        <p className="mt-4 text-lg text-gray-600">
          Complete data flow from EHR export to marketplace purchase and revenue distribution.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Complete Data Flow Sequence</h2>
        <MermaidDiagram
          chart={`sequenceDiagram
    participant H as Hospital EHR
    participant A as Adapter
    participant HCS as Hedera HCS
    participant SC as Smart Contracts
    participant B as Backend
    participant M as Marketplace
    participant R as Researcher
    
    H->>A: Export EHR Data
    A->>A: Stage 1: Storage Anonymization<br/>Remove PII, 5-year age ranges
    A->>B: Store Stage 1 Data
    A->>A: Stage 2: Chain Anonymization<br/>10-year ranges, month/year dates
    A->>HCS: Submit Consent Proof
    A->>HCS: Submit Provenance Record<br/>(Storage Hash + Chain Hash)
    A->>SC: Record Consent
    A->>B: Store Anonymized Data
    B->>B: Create Dataset
    
    R->>M: Browse Datasets
    R->>M: Query with Filters
    M->>B: Execute Query<br/>(Consent Validation)
    B->>M: Return Results
    R->>M: Purchase Dataset
    M->>R: Payment Request<br/>(Account, Amount HBAR)
    R->>Hedera: Send HBAR Payment
    R->>M: Provide Transaction ID
    M->>Hedera: Verify Payment
    Hedera-->>M: Payment Verified
    M->>SC: Trigger Revenue Distribution
    SC->>SC: Auto-Split: 60/25/15
    SC->>Patient: Transfer 60% HBAR
    SC->>Hospital: Transfer 25% HBAR
    SC->>Platform: Transfer 15% HBAR
    SC->>R: Grant Access
    R->>M: Download Data
    
    Note over HCS,SC: All transactions<br/>verifiable on HashScan`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Processing Pipeline</h2>
        <MermaidDiagram
          chart={`flowchart LR
    A[Raw EHR Data] --> B[Parse & Validate]
    B --> C[Stage 1: Storage Anonymization]
    C --> D[Remove PII<br/>5-year age ranges<br/>Exact dates]
    D --> E[Generate Anonymous IDs]
    E --> F[Enforce K-Anonymity]
    F --> G[Store in Backend]
    G --> H[Stage 2: Chain Anonymization]
    H --> I[10-year ranges<br/>Month/year dates<br/>Remove region]
    I --> J[Generate Storage Hash H1]
    I --> K[Generate Chain Hash H2]
    J --> L[Create Provenance Record]
    K --> L
    L --> M[Submit to HCS]
    M --> N[Record on Contract]
    N --> O[Marketplace Ready]
    
    style A fill:#FFCDD2,stroke:#D32F2F,stroke-width:2px
    style C fill:#FFF9C4,stroke:#F57F17,stroke-width:2px
    style D fill:#C8E6C9,stroke:#388E3C,stroke-width:2px
    style H fill:#E1BEE7,stroke:#7B1FA2,stroke-width:2px
    style I fill:#E1BEE7,stroke:#7B1FA2,stroke-width:2px
    style M fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style N fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style O fill:#BBDEFB,stroke:#1976D2,stroke-width:2px`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Step-by-Step Process</h2>
        <div className="mt-4 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">1. Data Export</h3>
            <p className="mt-2 text-gray-700">
              Hospitals export EHR data in FHIR R4 format. The data includes patient records,
              conditions, observations, and other medical information.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              For <strong>bulk uploads</strong>, each patient must have a unique phone number or
              email in the system. Phone numbers and emails are never registered twice across
              patients, ensuring a single contact and payout channel per person.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">2. Double Anonymization</h3>
            <p className="mt-2 text-gray-700">
              The adapter service applies <strong>two-stage anonymization</strong> for maximum
              privacy:
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="font-semibold text-gray-900">Stage 1: Storage Anonymization</h4>
                <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
                  <li>Removes PII: names, addresses, phone numbers, exact dates of birth</li>
                  <li>Preserves 5-year age ranges (e.g., "35-39")</li>
                  <li>Preserves exact dates, region/district</li>
                  <li>Generates anonymous patient IDs (PID-001, PID-002, etc.)</li>
                  <li>Stored in backend database for researcher queries</li>
                </ul>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <h4 className="font-semibold text-gray-900">Stage 2: Chain Anonymization</h4>
                <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
                  <li>Further generalizes age ranges (5-year → 10-year)</li>
                  <li>Rounds dates (exact → month/year)</li>
                  <li>Removes region/district (keep only country)</li>
                  <li>Generalizes occupation further</li>
                  <li>Used for immutable blockchain storage</li>
                </ul>
              </div>
              <div className="rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-4">
                <h4 className="font-semibold text-[#00A9CE]">Provenance Records</h4>
                <p className="mt-2 text-sm text-gray-700">
                  Both hashes (Storage H1 + Chain H2) are stored together on Hedera with a
                  provenance proof linking them, allowing anyone to verify the transformation chain.
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              <strong>K-anonymity enforced:</strong> Minimum 5 records per demographic group at both
              stages.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">3. Hedera Integration</h3>
            <p className="mt-2 text-gray-700">Anonymized data is submitted to Hedera:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>
                <strong>HCS Consent Topic:</strong> Consent proof with anonymous ID, topic ID, and
                timestamp
              </li>
              <li>
                <strong>HCS Data Topic:</strong> Provenance records containing:
                <ul className="mt-1 list-disc space-y-1 pl-6">
                  <li>Storage hash (H1) - Stage 1 anonymization</li>
                  <li>Chain hash (H2) - Stage 2 anonymization</li>
                  <li>Provenance proof - Links both hashes together</li>
                  <li>Transformation proof - Chain derived from storage</li>
                </ul>
              </li>
              <li>
                <strong>ConsentManager Contract:</strong> Records consent with anonymous ID and data
                hash
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-600">
              Both hashes are stored together, allowing public verification of origin and
              transformation on HashScan.
            </p>
            <p className="mt-2 text-sm text-gray-600">
              When enabled, the adapter can operate in a <strong>consent-first</strong> mode: it
              checks the ConsentManager contract on Hedera and only processes patients whose consent
              is already valid on-chain, refusing to process records without verifiable consent.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">4. Dataset Creation</h3>
            <p className="mt-2 text-gray-700">The backend creates a dataset entry with:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>Dataset metadata (hospital ID, creation date, demographics)</li>
              <li>HCS topic IDs for verification</li>
              <li>Query filters (country, date range, conditions, demographics)</li>
              <li>Pricing information</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">5. Researcher Query</h3>
            <p className="mt-2 text-gray-700">
              Researchers browse the marketplace and query datasets:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>Filter by country, date range, medical conditions, demographics</li>
              <li>View dataset previews and statistics</li>
              <li>System validates consent for all records in query results</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              6. Purchase & Payment Verification
            </h3>
            <p className="mt-2 text-gray-700">When a researcher purchases a dataset:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-6 text-gray-700">
              <li>
                Researcher initiates purchase and receives payment request (recipient account,
                amount in HBAR)
              </li>
              <li>
                Researcher connects Hedera wallet (HashPack, Blade, etc.) and sends HBAR payment
              </li>
              <li>Researcher provides transaction ID for verification</li>
              <li>System verifies payment on Hedera network using transaction ID</li>
              <li>
                Upon verification, revenue is automatically distributed: 60% Patient, 25% Hospital,
                15% Platform
              </li>
              <li>
                HBAR transferred to Hedera accounts (0.0.xxxxx) - accounts created automatically if
                needed
              </li>
              <li>Researcher gains access to download anonymized data</li>
            </ol>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">
              7. Revenue Distribution & Withdrawal
            </h3>
            <p className="mt-2 text-gray-700">After revenue distribution:</p>
            <ol className="mt-2 list-decimal space-y-1 pl-6 text-gray-700">
              <li>
                Patients and hospitals receive HBAR in their Hedera wallets (automatically created)
              </li>
              <li>Balances displayed in USD (primary) with HBAR below</li>
              <li>Users can withdraw to bank accounts or mobile money</li>
              <li>Automatic withdrawals triggered when balance reaches threshold</li>
              <li>Withdrawal notifications sent via email/SMS</li>
            </ol>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Revenue Distribution Flow</h2>
        <div className="mt-4 rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6">
          <h3 className="text-lg font-semibold text-[#00A9CE]">How It Works</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-6 text-gray-700">
            <li>Researcher purchases dataset (pays in HBAR)</li>
            <li>RevenueSplitter contract receives payment</li>
            <li>
              <strong>Automatically distributes:</strong> 60% Patient, 25% Hospital, 15% Platform
            </li>
            <li>All transactions verifiable on HashScan</li>
          </ol>
          <p className="mt-4 text-sm font-semibold text-gray-700">
            Benefits: Trustless, Transparent, Instant, Low fees
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Verification & Audit</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">HashScan Verification</h3>
          <p className="mt-2 text-gray-700">
            All Hedera transactions are publicly verifiable on HashScan:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
            <li>
              <strong>HCS Messages:</strong> View consent and provenance record submissions
            </li>
            <li>
              <strong>Provenance Records:</strong> Verify both storage and chain hashes, and the
              transformation proof linking them
            </li>
            <li>
              <strong>Smart Contract Calls:</strong> Verify consent records and revenue
              distributions
            </li>
            <li>
              <strong>HBAR Transfers:</strong> Track revenue distribution to patient, hospital, and
              platform accounts
            </li>
            <li>
              <strong>Account History:</strong> View all transactions for any Hedera account
              (0.0.xxxxx)
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}


