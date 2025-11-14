import MermaidDiagram from '@/components/docs/MermaidDiagram';

export default function HederaIntegrationPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Hedera Integration</h1>
        <p className="mt-4 text-lg text-gray-600">
          MediPact is built on four core pillars of Hedera: HCS, EVM, Accounts, and HBAR.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Core Hedera Services</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Service</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Usage</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Impact</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-[#00A9CE]">HCS</td>
                <td className="px-4 py-3 text-sm text-gray-600">Immutable storage of consent & data proof hashes</td>
                <td className="px-4 py-3 text-sm text-gray-600">Unchangeable audit trail, ~$0.0001/message</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-[#00A9CE]">Hedera EVM</td>
                <td className="px-4 py-3 text-sm text-gray-600">ConsentManager & RevenueSplitter smart contracts</td>
                <td className="px-4 py-3 text-sm text-gray-600">Automated consent registry & revenue distribution</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-[#00A9CE]">Hedera Account IDs</td>
                <td className="px-4 py-3 text-sm text-gray-600">Native accounts (0.0.xxxxx) for all users</td>
                <td className="px-4 py-3 text-sm text-gray-600">Seamless UX, direct HBAR transfers</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-[#00A9CE]">HBAR</td>
                <td className="px-4 py-3 text-sm text-gray-600">Micropayments for 60/25/15 revenue split</td>
                <td className="px-4 py-3 text-sm text-gray-600">Low-cost, instant settlements</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Integration Flow</h2>
        <MermaidDiagram
          chart={`graph LR
    A[Adapter] -->|Submit Proofs| B[HCS Topics]
    A -->|Record Consent| C[ConsentManager]
    D[Backend] -->|Create Accounts| E[Hedera Accounts]
    D -->|Distribute Revenue| F[RevenueSplitter]
    F -->|HBAR Transfer| E
    B -->|HashScan| G[Public Verification]
    C -->|HashScan| G
    
    style B fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style C fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style E fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style F fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style G fill:#FFD700,color:#000,stroke:#FFA500,stroke-width:2px`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Hedera Account Creation</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Hospitals & Researchers</h3>
            <p className="mt-2 text-gray-700">
              Accounts are created during registration. The platform generates an ECDSA key pair, creates a Hedera account (0.0.xxxxx) with EVM compatibility, and stores the encrypted private key.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Patients</h3>
            <p className="mt-2 text-gray-700">
              Accounts are created lazily on first payment. The platform creates the account only when revenue is distributed, reducing upfront costs.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Process</h3>
            <p className="mt-2 text-gray-700">
              Platform generates keys → creates Hedera account (operator pays ~$0.05) → encrypts private key → stores account ID and EVM address in database. All accounts are EVM-compatible for smart contract interactions.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Why Hedera?</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-4">
            <h3 className="font-semibold text-[#00A9CE]">✅ HCS is unique</h3>
            <p className="mt-2 text-sm text-gray-700">
              No other blockchain offers immutable message logging
            </p>
          </div>
          <div className="rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-4">
            <h3 className="font-semibold text-[#00A9CE]">✅ Low fees</h3>
            <p className="mt-2 text-sm text-gray-700">
              Enables micropayments at scale (~$0.0001 per HCS message)
            </p>
          </div>
          <div className="rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-4">
            <h3 className="font-semibold text-[#00A9CE]">✅ High throughput</h3>
            <p className="mt-2 text-sm text-gray-700">
              10,000+ TPS for thousands of daily queries
            </p>
          </div>
          <div className="rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-4">
            <h3 className="font-semibold text-[#00A9CE]">✅ Carbon negative</h3>
            <p className="mt-2 text-sm text-gray-700">
              Environmentally sustainable
            </p>
          </div>
          <div className="rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-4">
            <h3 className="font-semibold text-[#00A9CE]">✅ Native accounts</h3>
            <p className="mt-2 text-sm text-gray-700">
              Seamless UX without complex wallet management
            </p>
          </div>
          <div className="rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-4">
            <h3 className="font-semibold text-[#00A9CE]">✅ EVM compatible</h3>
            <p className="mt-2 text-sm text-gray-700">
              Smart contracts with low gas costs
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">HCS Topics</h2>
        <p className="mt-4 text-gray-700">
          MediPact uses Hedera Consensus Service (HCS) topics to store immutable proofs of consent and data hashes. Each message submitted to HCS is cryptographically signed and timestamped, creating an unchangeable audit trail that can be verified on HashScan.
        </p>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Consent Topic</h3>
          <p className="mt-2 text-gray-700">
            Stores consent records with anonymous patient IDs, HCS topic IDs, data hashes, and timestamps. Each consent submission creates a new message on the HCS topic.
          </p>
        </div>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Data Proof Topic</h3>
          <p className="mt-2 text-gray-700">
            Stores cryptographic hashes of anonymized datasets. Researchers can verify data integrity by comparing dataset hashes with HCS messages.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">HBAR Micropayments</h2>
        <p className="mt-4 text-gray-700">
          Revenue distribution is handled automatically by the RevenueSplitter smart contract. When a researcher purchases a dataset:
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-6 text-gray-700">
          <li>Payment is received in HBAR by the RevenueSplitter contract</li>
          <li>Contract automatically splits: 60% Patient, 25% Hospital, 15% Platform</li>
          <li>HBAR is transferred directly to Hedera accounts (0.0.xxxxx)</li>
          <li>All transactions are verifiable on HashScan</li>
        </ol>
        <div className="mt-4 rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6">
          <p className="text-sm text-gray-700">
            <strong>Benefits:</strong> Trustless, Transparent, Instant, Low fees (~$0.0001 per transaction)
          </p>
        </div>
      </section>
    </div>
  );
}


