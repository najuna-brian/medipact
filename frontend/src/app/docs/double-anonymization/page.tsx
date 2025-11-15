import MermaidDiagram from '@/components/docs/MermaidDiagram';
import CodeBlock from '@/components/docs/CodeBlock';

export default function DoubleAnonymizationPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Double Anonymization</h1>
        <p className="mt-4 text-lg text-gray-600">
          Two-stage anonymization with provenance tracking for maximum privacy protection and verifiable data transformation.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="mt-4 text-gray-700">
          MediPact implements <strong>double anonymization</strong> with provenance tracking to provide maximum privacy protection
          and verifiable data transformation on the Hedera blockchain. This two-stage approach ensures defense in depth while
          maintaining data utility for research.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-gray-900">Stage 1: Storage</h3>
            <p className="mt-2 text-sm text-gray-600">
              Optimized for research queries while protecting privacy. Preserves 5-year age ranges and exact dates.
            </p>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <h3 className="font-semibold text-gray-900">Stage 2: Chain</h3>
            <p className="mt-2 text-sm text-gray-600">
              Maximum privacy for immutable blockchain storage. Further generalizes to 10-year ranges and month/year dates.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Why Double Anonymization?</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Defense in Depth</h3>
            <p className="mt-2 text-gray-700">
              Two layers of protection ensure that if one layer fails, the other still protects patient privacy. Different
              anonymization strategies at each stage provide comprehensive coverage.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Different Purposes</h3>
            <p className="mt-2 text-gray-700">
              Storage anonymization is optimized for research queries (preserves detail), while chain anonymization is
              optimized for privacy on immutable blockchain storage (maximum generalization).
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Provenance Tracking</h3>
            <p className="mt-2 text-gray-700">
              Both hashes stored together on Hedera with a provenance proof allows anyone to verify that the chain hash was
              derived from the storage hash, providing complete audit trail and transformation verification.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Compliance Ready</h3>
            <p className="mt-2 text-gray-700">
              Meets strict regulatory requirements including GDPR and HIPAA. Demonstrates layered privacy protection and
              exceeds Safe Harbor de-identification standards.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Two-Stage Process</h2>
        <MermaidDiagram
          chart={`flowchart TD
    A[Raw EHR Data] --> B[Stage 1: Storage Anonymization]
    B --> C[Remove PII<br/>Name, ID, Address, Phone, DOB]
    C --> D[Preserve Demographics<br/>5-year age ranges<br/>Exact dates<br/>Region/District]
    D --> E[Generate Anonymous IDs<br/>PID-001, PID-002, etc.]
    E --> F[Enforce K-Anonymity<br/>Minimum 5 records per group]
    F --> G[Store in Backend Database]
    G --> H[Stage 2: Chain Anonymization]
    H --> I[Further Generalize<br/>10-year age ranges<br/>Month/year dates<br/>Remove region/district]
    I --> J[Generate Storage Hash H1]
    I --> K[Generate Chain Hash H2]
    J --> L[Create Provenance Record<br/>H1 + H2 + Proof]
    K --> L
    L --> M[Submit to Hedera HCS]
    M --> N[Immutable Blockchain Storage]
    
    style A fill:#FFCDD2,stroke:#D32F2F,stroke-width:2px
    style B fill:#FFF9C4,stroke:#F57F17,stroke-width:2px
    style D fill:#C8E6C9,stroke:#388E3C,stroke-width:2px
    style H fill:#E1BEE7,stroke:#7B1FA2,stroke-width:2px
    style I fill:#E1BEE7,stroke:#7B1FA2,stroke-width:2px
    style M fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style N fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Stage 1: Storage Anonymization</h2>
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="text-lg font-semibold text-gray-900">Purpose: Research-Optimized Privacy</h3>
          <p className="mt-2 text-gray-700">
            Stage 1 anonymization is designed to protect privacy while preserving data utility for research queries.
          </p>
        </div>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">What Gets Removed</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>Patient names</li>
              <li>Patient IDs (original)</li>
              <li>Specific addresses (street, city)</li>
              <li>Phone numbers</li>
              <li>Exact dates of birth</li>
              <li>Exact age (replaced with age range)</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">What Gets Preserved</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>
                <strong>Age Range:</strong> 5-year ranges (e.g., "35-39")
              </li>
              <li>
                <strong>Location:</strong> Country, region, district
              </li>
              <li>
                <strong>Dates:</strong> Exact dates (YYYY-MM-DD)
              </li>
              <li>
                <strong>Gender:</strong> Male, Female, Other, Unknown
              </li>
              <li>
                <strong>Occupation:</strong> Specific categories (e.g., "Healthcare Worker")
              </li>
              <li>
                <strong>Medical Data:</strong> All clinical information intact
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Example</h3>
            <CodeBlock
              code={`{
  "anonymousPatientId": "PID-001",
  "ageRange": "35-39",
  "country": "Uganda",
  "region": "Central",
  "gender": "Male",
  "occupationCategory": "Healthcare Worker",
  "effectiveDate": "2024-03-15",
  "observationCodeLoinc": "4548-4",
  "valueQuantity": "8.1"
}`}
              language="json"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Stage 2: Chain Anonymization</h2>
        <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50 p-6">
          <h3 className="text-lg font-semibold text-gray-900">Purpose: Maximum Blockchain Privacy</h3>
          <p className="mt-2 text-gray-700">
            Stage 2 anonymization applies further generalization specifically for immutable blockchain storage where data
            cannot be deleted or modified.
          </p>
        </div>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Additional Generalizations</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>
                <strong>Age Ranges:</strong> 5-year → 10-year (e.g., "35-39" → "30-39")
              </li>
              <li>
                <strong>Dates:</strong> Exact → Month/Year (e.g., "2024-03-15" → "2024-03")
              </li>
              <li>
                <strong>Location:</strong> Remove region/district (keep only country)
              </li>
              <li>
                <strong>Occupation:</strong> Further generalize (e.g., "Healthcare Worker" → "Healthcare")
              </li>
              <li>
                <strong>Rare Values:</strong> Suppress values that could identify individuals
              </li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Example</h3>
            <CodeBlock
              code={`{
  "anonymousPatientId": "PID-001",
  "ageRange": "30-39",
  "country": "Uganda",
  "gender": "Male",
  "occupationCategory": "Healthcare",
  "effectiveDate": "2024-03",
  "observationCodeLoinc": "4548-4",
  "valueQuantity": "8.1"
}`}
              language="json"
            />
            <p className="mt-4 text-sm text-gray-600">
              <strong>Note:</strong> Region/district removed, age range expanded, date rounded to month, occupation
              generalized.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Provenance Records</h2>
        <div className="mt-4 rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6">
          <h3 className="text-lg font-semibold text-[#00A9CE]">What is a Provenance Record?</h3>
          <p className="mt-2 text-gray-700">
            A provenance record contains both hashes (storage + chain) with a cryptographic proof linking them together,
            stored immutably on Hedera HCS.
          </p>
        </div>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Structure</h3>
          <CodeBlock
            code={`{
  "storage": {
    "hash": "abc123def456...",
    "anonymizationLevel": "storage",
    "timestamp": "2024-03-15T10:30:00Z"
  },
  "chain": {
    "hash": "def456ghi789...",
    "anonymizationLevel": "chain",
    "derivedFrom": "abc123def456...",
    "timestamp": "2024-03-15T10:30:00Z"
  },
  "anonymousPatientId": "PID-001",
  "resourceType": "Patient",
  "hospitalId": "HOSP-XXX",
  "timestamp": "2024-03-15T10:30:00Z",
  "provenanceProof": "xyz789abc123..."
}`}
            language="json"
          />
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-gray-900">Storage Hash (H1)</h3>
            <p className="mt-2 text-sm text-gray-600">
              SHA-256 hash of Stage 1 anonymized data. Used for backend storage verification.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-gray-900">Chain Hash (H2)</h3>
            <p className="mt-2 text-sm text-gray-600">
              SHA-256 hash of Stage 2 anonymized data. Used for immutable blockchain storage.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-gray-900">Provenance Proof</h3>
            <p className="mt-2 text-sm text-gray-600">
              Cryptographic proof linking both hashes together. Proves transformation chain.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Verification Process</h2>
        <p className="mt-4 text-gray-700">
          Anyone can verify the provenance chain on Hedera HashScan:
        </p>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">1. Origin Verification</h3>
            <p className="mt-2 text-gray-700">Verify both hashes exist and match expected values:</p>
            <CodeBlock
              code={`assert(provenanceRecord.storage.hash === expectedStorageHash);
assert(provenanceRecord.chain.hash === expectedChainHash);`}
              language="javascript"
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">2. Transformation Verification</h3>
            <p className="mt-2 text-gray-700">Verify chain hash was derived from storage hash:</p>
            <CodeBlock
              code={`assert(provenanceRecord.chain.derivedFrom === provenanceRecord.storage.hash);`}
              language="javascript"
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">3. Provenance Proof Verification</h3>
            <p className="mt-2 text-gray-700">Verify the provenance proof links both hashes:</p>
            <CodeBlock
              code={`const expectedProof = generateProvenanceProof(
  provenanceRecord.storage.hash,
  provenanceRecord.chain.hash,
  provenanceRecord.anonymousPatientId,
  provenanceRecord.resourceType
);
assert(provenanceRecord.provenanceProof === expectedProof);`}
              language="javascript"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Comparison Table</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Feature</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Stage 1 (Storage)
                </th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                  Stage 2 (Chain)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Age Range</td>
                <td className="px-4 py-3 text-sm text-gray-600">5-year (e.g., "35-39")</td>
                <td className="px-4 py-3 text-sm text-gray-600">10-year (e.g., "30-39")</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Dates</td>
                <td className="px-4 py-3 text-sm text-gray-600">Exact (YYYY-MM-DD)</td>
                <td className="px-4 py-3 text-sm text-gray-600">Month/Year (YYYY-MM)</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Location</td>
                <td className="px-4 py-3 text-sm text-gray-600">Country + Region + District</td>
                <td className="px-4 py-3 text-sm text-gray-600">Country only</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Occupation</td>
                <td className="px-4 py-3 text-sm text-gray-600">Specific category</td>
                <td className="px-4 py-3 text-sm text-gray-600">Broad category</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Purpose</td>
                <td className="px-4 py-3 text-sm text-gray-600">Research queries</td>
                <td className="px-4 py-3 text-sm text-gray-600">Blockchain storage</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Privacy Level</td>
                <td className="px-4 py-3 text-sm text-gray-600">High</td>
                <td className="px-4 py-3 text-sm text-gray-600">Maximum</td>
              </tr>
              <tr>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">Data Utility</td>
                <td className="px-4 py-3 text-sm text-gray-600">High (preserves detail)</td>
                <td className="px-4 py-3 text-sm text-gray-600">Medium (generalized)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Benefits</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-gray-900">Double Protection</h3>
            <p className="mt-2 text-sm text-gray-600">
              Two layers of anonymization ensure maximum privacy protection with defense in depth.
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-gray-900">Provenance Chain</h3>
            <p className="mt-2 text-sm text-gray-600">
              Verifiable transformation chain on Hedera allows anyone to verify origin and transformation.
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-gray-900">Origin Proof</h3>
            <p className="mt-2 text-sm text-gray-600">
              Both hashes prove same source, providing complete audit trail for compliance.
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-gray-900">Transformation Proof</h3>
            <p className="mt-2 text-sm text-gray-600">
              Chain hash derived from storage hash is verifiable, proving the transformation chain.
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-gray-900">Public Verification</h3>
            <p className="mt-2 text-sm text-gray-600">
              Anyone can verify provenance records on HashScan, ensuring transparency and trust.
            </p>
          </div>
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-gray-900">Compliance Ready</h3>
            <p className="mt-2 text-sm text-gray-600">
              Meets strict regulatory requirements including GDPR and HIPAA Safe Harbor standards.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">HashScan Verification</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            Each provenance record is stored on Hedera and can be verified on HashScan:
          </p>
          <ol className="mt-4 list-decimal space-y-2 pl-6 text-gray-700">
            <li>Visit HashScan link from adapter output</li>
            <li>View provenance record JSON</li>
            <li>Verify both hashes (storage + chain)</li>
            <li>Verify <code className="rounded bg-gray-100 px-1 py-0.5">derivedFrom</code> link</li>
            <li>Verify provenance proof</li>
          </ol>
        </div>
      </section>
    </div>
  );
}

