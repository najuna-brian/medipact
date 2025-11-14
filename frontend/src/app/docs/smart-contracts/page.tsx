import MermaidDiagram from '@/components/docs/MermaidDiagram';
import CodeBlock from '@/components/docs/CodeBlock';

export default function SmartContractsPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Smart Contracts</h1>
        <p className="mt-4 text-lg text-gray-600">
          Detailed documentation of ConsentManager and RevenueSplitter contracts deployed on Hedera EVM.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">ConsentManager</h2>
        <p className="mt-4 text-gray-700">
          The ConsentManager contract provides an on-chain registry of patient consent records. It stores anonymous patient IDs, HCS topic IDs, data hashes, and timestamps for immutable consent tracking.
        </p>
        <MermaidDiagram
          chart={`graph LR
    A[Adapter] -->|recordConsent| B[ConsentManager]
    B -->|Stores| C[Anonymous ID<br/>HCS Topic ID<br/>Data Hash<br/>Timestamp]
    E[Query] -->|isConsentValid| B
    B -->|Returns| F[Consent Status]
    
    style B fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style C fill:#E3F2FD,stroke:#1976D2,stroke-width:2px`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">ConsentManager Functions</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">recordConsent()</h3>
            <p className="mt-2 text-sm text-gray-600">Records a new consent entry</p>
            <CodeBlock
              code={`function recordConsent(
    string memory anonymousId,
    string memory hcsTopicId,
    bytes32 dataHash
) public`}
              language="solidity"
            />
            <p className="mt-2 text-sm text-gray-700">
              <strong>Parameters:</strong>
            </p>
            <ul className="mt-1 list-disc space-y-1 pl-6 text-sm text-gray-600">
              <li><code>anonymousId</code>: Anonymous patient identifier (e.g., "PID-001")</li>
              <li><code>hcsTopicId</code>: Hedera Consensus Service topic ID</li>
              <li><code>dataHash</code>: Cryptographic hash of the anonymized dataset</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">revokeConsent()</h3>
            <p className="mt-2 text-sm text-gray-600">Revokes a previously recorded consent</p>
            <CodeBlock
              code={`function revokeConsent(
    string memory anonymousId,
    bytes32 dataHash
) public`}
              language="solidity"
            />
            <p className="mt-2 text-sm text-gray-700">
              Marks a consent as revoked, preventing future data access for that record.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">isConsentValid()</h3>
            <p className="mt-2 text-sm text-gray-600">Checks if a consent is valid</p>
            <CodeBlock
              code={`function isConsentValid(
    string memory anonymousId,
    bytes32 dataHash
) public view returns (bool)`}
              language="solidity"
            />
            <p className="mt-2 text-sm text-gray-700">
              Returns <code>true</code> if consent exists and is not revoked, <code>false</code> otherwise.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">getConsentByAnonymousId()</h3>
            <p className="mt-2 text-sm text-gray-600">Retrieves consent information</p>
            <CodeBlock
              code={`function getConsentByAnonymousId(
    string memory anonymousId
) public view returns (Consent memory)`}
              language="solidity"
            />
            <p className="mt-2 text-sm text-gray-700">
              Returns the complete consent record including HCS topic ID, data hash, timestamp, and status.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">RevenueSplitter</h2>
        <p className="mt-4 text-gray-700">
          The RevenueSplitter contract automatically distributes revenue from dataset purchases according to a fixed split: 60% to patients, 25% to hospitals, and 15% to the platform.
        </p>
        <MermaidDiagram
          chart={`graph LR
    A[Payment] -->|HBAR| B[RevenueSplitter]
    B -->|Auto-Split| C[60% Patient]
    B -->|Auto-Split| D[25% Hospital]
    B -->|Auto-Split| E[15% Platform]
    
    style B fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style C fill:#4CAF50,color:#fff,stroke:#2E7D32,stroke-width:2px
    style D fill:#2196F3,color:#fff,stroke:#1565C0,stroke-width:2px
    style E fill:#FF9800,color:#fff,stroke:#E65100,stroke-width:2px`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">RevenueSplitter Functions</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">receive()</h3>
            <p className="mt-2 text-sm text-gray-600">Automatically distributes received HBAR</p>
            <CodeBlock
              code={`receive() external payable {
    // Automatically splits incoming HBAR:
    // 60% to patient accounts
    // 25% to hospital accounts
    // 15% to platform account
}`}
              language="solidity"
            />
            <p className="mt-2 text-sm text-gray-700">
              This function is called automatically when HBAR is sent to the contract. It distributes the payment according to the configured split percentages.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">distributeRevenueTo()</h3>
            <p className="mt-2 text-sm text-gray-600">Manually distribute revenue to specific recipients</p>
            <CodeBlock
              code={`function distributeRevenueTo(
    address patientAccount,
    address hospitalAccount,
    uint256 totalAmount
) public`}
              language="solidity"
            />
            <p className="mt-2 text-sm text-gray-700">
              Allows manual distribution with specific account addresses. Calculates split amounts based on configured percentages.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">getSplitPercentages()</h3>
            <p className="mt-2 text-sm text-gray-600">Returns the current revenue split configuration</p>
            <CodeBlock
              code={`function getSplitPercentages() 
    public 
    view 
    returns (
        uint256 patientPercent,
        uint256 hospitalPercent,
        uint256 platformPercent
    )`}
              language="solidity"
            />
            <p className="mt-2 text-sm text-gray-700">
              Returns the configured percentages: 60% patient, 25% hospital, 15% platform.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Revenue Distribution Flow</h2>
        <div className="mt-4 rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6">
          <h3 className="text-lg font-semibold text-[#00A9CE]">How It Works</h3>
          <ol className="mt-2 list-decimal space-y-2 pl-6 text-gray-700">
            <li>Researcher purchases dataset and sends HBAR to RevenueSplitter contract</li>
            <li>Contract receives payment via <code>receive()</code> function</li>
            <li>Contract calculates split: 60% patient, 25% hospital, 15% platform</li>
            <li>HBAR is transferred to respective Hedera accounts (0.0.xxxxx)</li>
            <li>All transactions are recorded on Hedera and verifiable on HashScan</li>
          </ol>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <div className="rounded bg-white p-3 text-center">
              <div className="text-2xl font-bold text-[#4CAF50]">60%</div>
              <div className="text-sm text-gray-600">Patient</div>
            </div>
            <div className="rounded bg-white p-3 text-center">
              <div className="text-2xl font-bold text-[#2196F3]">25%</div>
              <div className="text-sm text-gray-600">Hospital</div>
            </div>
            <div className="rounded bg-white p-3 text-center">
              <div className="text-2xl font-bold text-[#FF9800]">15%</div>
              <div className="text-sm text-gray-600">Platform</div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Contract Deployment</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Hedera EVM</h3>
          <p className="mt-2 text-gray-700">
            Both contracts are deployed on Hedera EVM, which provides:
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
            <li>Low gas costs compared to Ethereum mainnet</li>
            <li>Fast transaction finality</li>
            <li>EVM compatibility for standard Solidity development</li>
            <li>Integration with Hedera native services (HCS, Accounts, HBAR)</li>
          </ul>
        </div>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Verification</h3>
          <p className="mt-2 text-gray-700">
            Contract addresses and transactions can be verified on HashScan, providing transparency and auditability for all consent records and revenue distributions.
          </p>
        </div>
      </section>
    </div>
  );
}


