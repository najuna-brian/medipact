import MermaidDiagram from '@/components/docs/MermaidDiagram';

export default function CompliancePage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Compliance & Standards</h1>
        <p className="mt-4 text-lg text-gray-600">
          MediPact is designed to comply with international healthcare data protection regulations
          and standards, ensuring patient privacy and data security at every level.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Regulatory Compliance</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-lg border-2 border-blue-500 bg-blue-50 p-6">
            <h3 className="text-lg font-semibold text-blue-900">GDPR Compliance</h3>
            <p className="mt-2 text-sm text-blue-700">
              Full compliance with the General Data Protection Regulation (GDPR) through data
              minimization, purpose limitation, and patient rights enforcement.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-blue-700">
              <li>Right to access</li>
              <li>Right to erasure</li>
              <li>Data portability</li>
              <li>Consent management</li>
            </ul>
          </div>

          <div className="rounded-lg border-2 border-green-500 bg-green-50 p-6">
            <h3 className="text-lg font-semibold text-green-900">HIPAA Alignment</h3>
            <p className="mt-2 text-sm text-green-700">
              Designed with HIPAA principles in mind, including administrative, physical, and
              technical safeguards for protected health information (PHI).
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-green-700">
              <li>Access controls</li>
              <li>Audit trails</li>
              <li>Encryption at rest and in transit</li>
              <li>Business associate agreements</li>
            </ul>
          </div>

          <div className="rounded-lg border-2 border-purple-500 bg-purple-50 p-6">
            <h3 className="text-lg font-semibold text-purple-900">Regional Standards</h3>
            <p className="mt-2 text-sm text-purple-700">
              Adaptable to regional data protection laws including Uganda's Data Protection and
              Privacy Act, Kenya's Data Protection Act, and other African Union frameworks.
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-purple-700">
              <li>Local data sovereignty</li>
              <li>Cross-border data transfer controls</li>
              <li>National ID protection</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Technical Standards</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">FHIR Compliance</h3>
            <p className="mt-2 text-gray-700">
              MediPact uses the Fast Healthcare Interoperability Resources (FHIR) standard for data
              representation, ensuring compatibility with existing healthcare systems and enabling
              seamless data exchange.
            </p>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="font-semibold text-gray-900">FHIR Resources</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                  <li>Patient</li>
                  <li>Observation</li>
                  <li>Condition</li>
                  <li>Medication</li>
                  <li>Procedure</li>
                </ul>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h4 className="font-semibold text-gray-900">Benefits</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                  <li>Interoperability</li>
                  <li>Standardized data format</li>
                  <li>Industry-wide adoption</li>
                  <li>Future-proof architecture</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Cryptographic Standards</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="font-semibold text-gray-900">Encryption</h4>
                <p className="mt-2 text-sm text-gray-700">
                  <strong>AES-256-GCM:</strong> Industry-standard symmetric encryption for data at
                  rest and in transit
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="font-semibold text-gray-900">Hashing</h4>
                <p className="mt-2 text-sm text-gray-700">
                  <strong>SHA-256:</strong> Secure hashing algorithm for data integrity verification
                  and blockchain proofs
                </p>
              </div>
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h4 className="font-semibold text-gray-900">Key Derivation</h4>
                <p className="mt-2 text-sm text-gray-700">
                  <strong>PBKDF2:</strong> Password-based key derivation for secure key generation
                  from user credentials
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Blockchain Standards</h3>
            <p className="mt-2 text-gray-700">
              Built on Hedera Hashgraph, which provides enterprise-grade security and compliance
              features:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-gray-700">
              <li>
                <strong>Hedera Consensus Service (HCS):</strong> Immutable message logging for
                consent and data provenance
              </li>
              <li>
                <strong>Hashgraph Algorithm:</strong> Asynchronous Byzantine Fault Tolerance (aBFT)
                for consensus
              </li>
              <li>
                <strong>Public Auditability:</strong> All transactions verifiable on HashScan
                explorer
              </li>
              <li>
                <strong>Regulatory Compliance:</strong> Hedera's governance model ensures
                regulatory alignment
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Privacy Standards</h2>
        <MermaidDiagram
          chart={`flowchart TD
    A[Patient Data] --> B[Privacy Standards Applied]
    B --> C[K-Anonymity<br/>K=5 Minimum]
    B --> D[Double Anonymization<br/>Storage + Chain]
    B --> E[PII Removal<br/>Complete De-identification]
    B --> F[Consent Management<br/>Opt-in/Opt-out]
    C --> G[Compliant Dataset]
    D --> G
    E --> G
    F --> G
    G --> H[GDPR Compliant]
    G --> I[HIPAA Aligned]
    G --> J[Regional Standards]
    
    style A fill:#FFCDD2,stroke:#D32F2F,stroke-width:2px
    style B fill:#FFF9C4,stroke:#F57F17,stroke-width:2px
    style C fill:#C8E6C9,stroke:#388E3C,stroke-width:2px
    style D fill:#E1BEE7,stroke:#7B1FA2,stroke-width:2px
    style E fill:#BBDEFB,stroke:#1976D2,stroke-width:2px
    style F fill:#FFE0B2,stroke:#F57C00,stroke-width:2px
    style G fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style H fill:#C8E6C9,stroke:#388E3C,stroke-width:2px
    style I fill:#C8E6C9,stroke:#388E3C,stroke-width:2px
    style J fill:#C8E6C9,stroke:#388E3C,stroke-width:2px`}
        />
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <h3 className="text-lg font-semibold text-green-900">K-Anonymity (K=5)</h3>
            <p className="mt-2 text-gray-700">
              Each record in the dataset is indistinguishable from at least 4 other records,
              preventing re-identification attacks. This is a proven privacy model used in
              healthcare research.
            </p>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
            <h3 className="text-lg font-semibold text-purple-900">Differential Privacy</h3>
            <p className="mt-2 text-gray-700">
              Through K-anonymity and demographic grouping, MediPact provides strong privacy
              guarantees that protect against statistical inference attacks.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Data Protection Measures</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Data Minimization</h3>
            <p className="mt-2 text-gray-700">
              Only the minimum necessary data is collected and processed. All PII is removed before
              storage, and demographic data is generalized to prevent re-identification.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Purpose Limitation</h3>
            <p className="mt-2 text-gray-700">
              Data is collected for specific, explicit purposes (medical research) and is not used
              for any other purposes without explicit patient consent.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Storage Limitation</h3>
            <p className="mt-2 text-gray-700">
              Data is retained only for as long as necessary for the stated purpose. Patients can
              request data deletion at any time, and their requests are processed promptly.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Integrity & Confidentiality</h3>
            <p className="mt-2 text-gray-700">
              All data is encrypted using AES-256-GCM, and access is controlled through API keys and
              role-based permissions. Blockchain hashes provide immutable integrity verification.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Patient Rights</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <span className="text-green-600">✅</span>
            <div>
              <h3 className="font-semibold text-gray-900">Right to Access</h3>
              <p className="mt-1 text-sm text-gray-700">
                Patients can view all their data, consent records, and data access history through
                the patient portal.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <span className="text-green-600">✅</span>
            <div>
              <h3 className="font-semibold text-gray-900">Right to Rectification</h3>
              <p className="mt-1 text-sm text-gray-700">
                Patients can request corrections to their data, which are processed through the
                hospital that collected the data.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <span className="text-green-600">✅</span>
            <div>
              <h3 className="font-semibold text-gray-900">Right to Erasure</h3>
              <p className="mt-1 text-sm text-gray-700">
                Patients can request deletion of their data. While blockchain records are immutable,
                all database records and future access are revoked.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <span className="text-green-600">✅</span>
            <div>
              <h3 className="font-semibold text-gray-900">Right to Data Portability</h3>
              <p className="mt-1 text-sm text-gray-700">
                Patients can export their data in standard formats (FHIR JSON) for transfer to other
                systems.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <span className="text-green-600">✅</span>
            <div>
              <h3 className="font-semibold text-gray-900">Right to Object</h3>
              <p className="mt-1 text-sm text-gray-700">
                Patients can opt-out of data sharing at any time, which immediately prevents new
                researcher access to their data.
              </p>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg border border-green-200 bg-green-50 p-4">
            <span className="text-green-600">✅</span>
            <div>
              <h3 className="font-semibold text-gray-900">Consent Withdrawal</h3>
              <p className="mt-1 text-sm text-gray-700">
                Patients can withdraw consent at any time. While past blockchain records remain
                (for audit), all future access is blocked.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Audit & Accountability</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Comprehensive Audit Trail</h3>
          <p className="mt-2 text-gray-700">
            MediPact maintains detailed audit logs for all data access and modifications:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-gray-700">
            <li>
              <strong>Blockchain Records:</strong> All consent decisions and data proofs are
              immutably recorded on Hedera HCS
            </li>
            <li>
              <strong>Access Logs:</strong> Every researcher query and data purchase is logged with
              timestamp, researcher ID, and data accessed
            </li>
            <li>
              <strong>Consent History:</strong> Complete history of patient consent decisions,
              including opt-in, opt-out, and researcher approvals
            </li>
            <li>
              <strong>Data Provenance:</strong> Full chain of custody from hospital upload to
              researcher access, verifiable on blockchain
            </li>
            <li>
              <strong>Revenue Transactions:</strong> All revenue distribution transactions are
              publicly auditable on HashScan
            </li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Security Certifications & Best Practices</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Security Best Practices</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-gray-900">Infrastructure</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                  <li>HTTPS/TLS encryption for all communications</li>
                  <li>Secure database connections</li>
                  <li>Environment variable protection</li>
                  <li>Regular security updates</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Application</h4>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
                  <li>Bcrypt password hashing (12 rounds)</li>
                  <li>API key authentication</li>
                  <li>Rate limiting and DDoS protection</li>
                  <li>Input validation and sanitization</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Compliance Roadmap</h3>
            <p className="mt-2 text-gray-700">
              MediPact is continuously working towards additional certifications and compliance
              standards:
            </p>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-gray-700">
              <li>ISO 27001 (Information Security Management)</li>
              <li>ISO 27701 (Privacy Information Management)</li>
              <li>SOC 2 Type II (Security, Availability, Processing Integrity)</li>
              <li>HITRUST CSF (Healthcare Information Trust Alliance)</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Contact & Reporting</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            For compliance inquiries, data protection requests, or security concerns, please contact
            our team through the{' '}
            <a href="/contact" className="text-primary hover:underline">
              contact page
            </a>
            .
          </p>
          <p className="mt-4 text-gray-700">
            For detailed privacy information, please see our{' '}
            <a href="/docs/privacy" className="text-primary hover:underline">
              Privacy & Security documentation
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}

