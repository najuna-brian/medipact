import MermaidDiagram from '@/components/docs/MermaidDiagram';

export default function PrivacyPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Privacy & Security</h1>
        <p className="mt-4 text-lg text-gray-600">
          Comprehensive privacy guarantees and anonymization techniques protecting patient data.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Before vs. After Anonymization</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Before (Raw)</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">After (Anonymized)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="px-4 py-3 text-sm text-gray-600">❌ Name: "John Doe"</td>
                <td className="px-4 py-3 text-sm text-gray-600">✅ Anonymous ID: "PID-001"</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-600">❌ ID: "P-12345"</td>
                <td className="px-4 py-3 text-sm text-gray-600">✅ Removed</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-600">❌ Address: "123 Main St"</td>
                <td className="px-4 py-3 text-sm text-gray-600">✅ Country Only: "Uganda"</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-600">❌ Phone: "+256-123-4567"</td>
                <td className="px-4 py-3 text-sm text-gray-600">✅ Removed</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-600">❌ DOB: "1990-01-15"</td>
                <td className="px-4 py-3 text-sm text-gray-600">✅ Age Range: "35-39"</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-600">✅ Medical Data</td>
                <td className="px-4 py-3 text-sm text-gray-600">✅ Medical Data: Preserved</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm text-gray-600">✅ Demographics</td>
                <td className="px-4 py-3 text-sm text-gray-600">✅ Demographics: Preserved</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">K-Anonymity Protection</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">What is K-Anonymity?</h3>
          <p className="mt-2 text-gray-700">
            K-anonymity is a privacy model that ensures each record in a dataset cannot be distinguished from at least K-1 other records. MediPact enforces K=5, meaning each record must be part of a group with at least 5 records sharing the same demographic characteristics.
          </p>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-gray-900">Minimum 5 Records</h3>
            <p className="mt-2 text-sm text-gray-600">
              Each demographic group must contain at least 5 records to prevent re-identification.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-gray-900">Grouping Criteria</h3>
            <p className="mt-2 text-sm text-gray-600">
              Groups are formed by: Country, Age Range, Gender, Occupation
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-gray-900">Record Suppression</h3>
            <p className="mt-2 text-sm text-gray-600">
              Records with fewer than 5 matches are suppressed from the dataset.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-gray-900">Privacy Guarantee</h3>
            <p className="mt-2 text-sm text-gray-600">
              Even with external knowledge, an attacker cannot identify individuals with confidence.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Privacy Guarantees</h2>
        <div className="mt-4 space-y-4">
          <div className="flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <span className="text-green-600">✅</span>
            <div>
              <h3 className="font-semibold text-gray-900">No PII on Blockchain</h3>
              <p className="mt-1 text-sm text-gray-700">
                Only anonymous IDs and hashes are stored on Hedera. No personally identifiable information is ever written to the blockchain.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <span className="text-green-600">✅</span>
            <div>
              <h3 className="font-semibold text-gray-900">No Original Patient IDs</h3>
              <p className="mt-1 text-sm text-gray-700">
                ConsentManager stores only anonymous IDs. The mapping between original patient IDs and anonymous IDs is stored securely in the backend database, never on-chain.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <span className="text-green-600">✅</span>
            <div>
              <h3 className="font-semibold text-gray-900">Demographics Generalized</h3>
              <p className="mt-1 text-sm text-gray-700">
                Exact dates of birth are converted to age ranges. Specific addresses are removed, keeping only country-level information. This prevents re-identification through demographic matching.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <span className="text-green-600">✅</span>
            <div>
              <h3 className="font-semibold text-gray-900">K-Anonymity Enforced</h3>
              <p className="mt-1 text-sm text-gray-700">
                Privacy protection through demographic grouping ensures each record is indistinguishable from at least 4 others in the same group.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <span className="text-green-600">✅</span>
            <div>
              <h3 className="font-semibold text-gray-900">Consent Validation</h3>
              <p className="mt-1 text-sm text-gray-700">
                Database-level and smart contract-level enforcement ensures only consented data is accessible. Researchers cannot query or purchase data without valid consent records.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Anonymization Process</h2>
        <MermaidDiagram
          chart={`flowchart TD
    A[Raw Patient Data] --> B{Contains PII?}
    B -->|Yes| C[Remove PII]
    B -->|No| D[Keep Medical Data]
    C --> E[Generalize Demographics]
    E --> F[Generate Anonymous ID]
    F --> G[Group by Demographics]
    G --> H{K-Anonymity<br/>Check}
    H -->|Group Size < 5| I[Suppress Record]
    H -->|Group Size >= 5| J[Include in Dataset]
    D --> J
    J --> K[Generate Hash]
    K --> L[Submit to HCS]
    I --> M[Log Suppression]
    
    style A fill:#FFCDD2,stroke:#D32F2F,stroke-width:2px
    style C fill:#FFF9C4,stroke:#F57F17,stroke-width:2px
    style E fill:#C8E6C9,stroke:#388E3C,stroke-width:2px
    style L fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style I fill:#FFE0B2,stroke:#F57C00,stroke-width:2px`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Security Measures</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Encryption</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>All Hedera private keys are encrypted before storage</li>
              <li>Database connections use TLS encryption</li>
              <li>API endpoints require authentication tokens</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Access Control</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>Role-based access control (Patient, Hospital, Researcher, Admin)</li>
              <li>API endpoints protected by role verification</li>
              <li>Consent validation at database and smart contract levels</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Audit Trail</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>All consent records stored immutably on Hedera HCS</li>
              <li>Data proof hashes verifiable on HashScan</li>
              <li>Revenue distribution transactions publicly auditable</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Compliance</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            MediPact's privacy and anonymization techniques are designed to comply with healthcare data protection regulations including GDPR, HIPAA (where applicable), and other regional data protection laws. The K-anonymity model and PII removal ensure that datasets cannot be used to re-identify individuals.
          </p>
        </div>
      </section>
    </div>
  );
}


