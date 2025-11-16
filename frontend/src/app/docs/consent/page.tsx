export default function ConsentOverviewPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Consent & Patient Rights</h1>
        <p className="mt-4 text-lg text-gray-600">
          How MediPact collects, verifies, and proves patient consent for ethical, compliant data
          sharing on Hedera.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Consent as a First-Class Primitive</h2>
        <p className="mt-4 text-gray-700">
          Consent is at the core of MediPact. Every patient whose data is contributed to the
          marketplace must have provided valid consent, and that consent must be verifiable on
          Hedera and linked to their anonymous patient ID (PID).
        </p>
        <p className="mt-2 text-gray-700">
          The system is designed so that hospitals can collect consent once (e.g., during patient
          registration or via SMS), and the MediPact adapter will automatically enforce consent
          checks during data collection and querying &mdash; without adding manual burden to
          hospital staff.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Identity, Contact & Payment</h2>
        <p className="mt-4 text-gray-700">
          To ensure that consent and revenue share are correctly linked to each person, MediPact
          uses a combination of identifiers and contact channels:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
          <li>
            <strong>Unique Patient Identifier (UPI):</strong> Deterministic ID derived from
            name + date of birth and optional phone/email. The same person gets the same UPI across
            hospitals, enabling cross-facility linkage without sharing raw PII.
          </li>
          <li>
            <strong>Anonymous Patient ID (PID):</strong> A random identifier (e.g., PID-001, PID-002)
            generated during Stage 1 anonymization. This is the only identifier used on-chain and in
            research datasets &mdash; no original PII is ever stored on Hedera.
          </li>
          <li>
            <strong>Unique Contact Channels:</strong> Patient phone numbers and emails are enforced
            as unique in the identity database. The same phone/email cannot be registered for two
            different patients. This guarantees a single contact (and payout) channel per person.
          </li>
          <li>
            <strong>Default Payment Method:</strong> For bulk hospital uploads, the patient&apos;s
            phone number (if present) is used as the default payment destination via mobile money.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Consent Types</h2>
        <p className="mt-4 text-gray-700">
          The system supports multiple consent types to reflect real-world clinical workflows:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
          <li>
            <strong>Individual:</strong> The patient explicitly consents (e.g., via the patient
            portal, SMS link, or in-person digital form). This is the primary consent method.
          </li>
          <li>
            <strong>Hospital Verified:</strong> The hospital confirms that it has collected valid
            consent from the patient (e.g., on paper or via existing processes). Used especially in
            early integrations and bulk onboarding.
          </li>
          <li>
            <strong>Bulk:</strong> For historical data where hospitals have broad consent that
            covers a cohort of patients, and they attest to that via the backend API.
          </li>
        </ul>
        <p className="mt-2 text-sm text-gray-600">
          All consent records are stored without PII, using the anonymous patient ID (PID) and
          cryptographic hashes. The original consent artifacts (e.g., signed forms) remain in the
          hospital&apos;s secure systems and are never uploaded to the marketplace.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Where Consent is Stored</h2>
        <p className="mt-4 text-gray-700">
          Consent is stored in two places to provide both operational flexibility and public
          verifiability:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
          <li>
            <strong>Off-chain (Database):</strong> The backend stores consent records in the{' '}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
              patient_consents
            </code>{' '}
            table, including:
            <ul className="mt-1 list-disc space-y-1 pl-6">
              <li><code>anonymous_patient_id</code> (PID-xxx)</li>
              <li><code>upi</code> (patient identity link)</li>
              <li><code>consent_type</code> (individual / hospital_verified / bulk)</li>
              <li><code>status</code> (active / revoked / expired)</li>
              <li>Optional: <code>hcs_topic_id</code>, <code>consent_topic_id</code>,{' '}
                <code>data_hash</code>, <code>expires_at</code>, <code>hospital_id</code>
              </li>
            </ul>
          </li>
          <li>
            <strong>On-chain (Hedera):</strong>
            <ul className="mt-1 list-disc space-y-1 pl-6">
              <li>
                <strong>HCS Consent Topic:</strong> Stores a SHA-256 consent hash with timestamp and
                metadata. Publicly verifiable on{' '}
                <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
                  https://hashscan.io
                </code>
                .
              </li>
              <li>
                <strong>ConsentManager Contract:</strong> Stores a{' '}
                <code className="font-mono text-xs">
                  ConsentRecord(anonymousPatientId, hcsTopicId, dataHash, timestamp, isValid)
                </code>{' '}
                keyed by the anonymous patient ID. This provides an immutable, on-chain registry of
                which PIDs have active consent.
              </li>
            </ul>
          </li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Primary Consent Flow (Today)</h2>
        <p className="mt-4 text-gray-700">
          Today, the primary consent flow is designed around hospitals collecting consent and using
          the CSV adapter for bulk data uploads:
        </p>
        <ol className="mt-2 list-decimal space-y-2 pl-6 text-gray-700">
          <li>
            <strong>Patient Registration:</strong> Hospital registers the patient with name, date of
            birth, and a unique phone number or email. A UPI and anonymous patient ID (PID) are
            generated.
          </li>
          <li>
            <strong>Consent Collection at Hospital:</strong> Patient signs a consent form (paper or
            digital) authorizing the use of their anonymized data for research. The hospital stores
            this consent record securely.
          </li>
          <li>
            <strong>CSV Data Export:</strong> Hospital exports EHR data (including PII,
            demographics, and clinical data) as a CSV file and uploads it via the MediPact
            &ldquo;Upload Data&rdquo; page.
          </li>
          <li>
            <strong>Adapter Processing:</strong>
            <ul className="mt-1 list-disc space-y-1 pl-6">
              <li>Applies Stage 1 (storage) anonymization to remove PII and generate PIDs.</li>
              <li>Aggregates per-patient records and computes a storage hash (H1) per PID.</li>
              <li>
                Generates a <strong>consent hash</strong> per PID using only:
                <code className="ml-1 rounded bg-gray-100 px-1 py-0.5 text-xs">
                  &#123; anonymousPatientId, consentDate, consentType, timestamp &#125;
                </code>
                &mdash; no raw PII.
              </li>
              <li>
                Submits the consent hash to the configured Hedera HCS consent topic, and optionally
                records a consent entry on the <code className="font-mono text-xs">ConsentManager</code>{' '}
                contract.
              </li>
            </ul>
          </li>
          <li>
            <strong>Stage 2 Anonymization &amp; Provenance:</strong>
            <ul className="mt-1 list-disc space-y-1 pl-6">
              <li>Applies Stage 2 (chain) anonymization for maximum privacy.</li>
              <li>Computes a chain hash (H2) per anonymized record.</li>
              <li>
                Creates a <strong>provenance record</strong> per record with:
                <code className="ml-1 rounded bg-gray-100 px-1 py-0.5 text-xs">
                  &#123; storage: &#123; hash: H1, anonymizationLevel: &apos;storage&apos; &#125;,
                  chain: &#123; hash: H2, anonymizationLevel: &apos;chain&apos;, derivedFrom: H1 &#125;,
                  anonymousPatientId, hospitalId, provenanceProof
                &#125;
                </code>
              </li>
              <li>Submits the provenance record to the Hedera HCS data topic.</li>
            </ul>
          </li>
        </ol>
        <p className="mt-2 text-sm text-gray-600">
          This flow ensures that for every patient included in a bulk upload, there is:
          <strong> (a)</strong> a consent record in the backend,
          <strong> (b)</strong> a matching consent proof on Hedera (by PID), and
          <strong> (c)</strong> a cryptographically linked storage &amp; chain hash pair for each
          anonymized record.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Consent-First Mode (EMR Integrations)</h2>
        <p className="mt-4 text-gray-700">
          For hospitals with direct EMR integrations, MediPact offers an optional{' '}
          <strong>consent-first mode</strong> in the <code className="font-mono text-xs">index-universal.js</code>{' '}
          adapter:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
          <li>
            Enable by setting{' '}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">
              REQUIRE_ONCHAIN_CONSENT=true
            </code>{' '}
            and configuring <code className="font-mono text-xs">CONSENT_MANAGER_ADDRESS</code> in{' '}
            <code className="font-mono text-xs">adapter/.env</code>.
          </li>
          <li>
            Before storing any data or writing HCS proofs, the adapter calls the{' '}
            <code className="font-mono text-xs">isConsentValid</code> view function on the{' '}
            <code className="font-mono text-xs">ConsentManager</code> contract for each{' '}
            <code className="font-mono text-xs">anonymousPatientId</code>.
          </li>
          <li>
            If consent is <strong>not</strong> active on-chain for a patient, the adapter{' '}
            <strong>skips</strong> that patient&apos;s data (no storage, no HCS messages).
          </li>
        </ul>
        <p className="mt-2 text-sm text-gray-600">
          This ensures that when using direct EMR connectors, no patient data is ever processed or
          uploaded unless there is a valid, verifiable consent on-chain for that patient&apos;s
          anonymous ID.
        </p>
        <p className="mt-2 text-sm text-gray-600">
          For CSV-based bulk uploads, the adapter currently acts as the <strong>consent
          creator</strong> by generating and recording consent proofs for each patient. The
          consent-first pre-check is not yet enabled on the CSV path, but the code is structured so
          it can be added later in a similar way to the EMR adapter.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Verification on HashScan</h2>
        <p className="mt-4 text-gray-700">
          All consent and data proofs are written to Hedera Consensus Service (HCS) and can be
          independently verified on{' '}
          <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">https://hashscan.io</code>.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
          <li>
            <strong>Consent Proofs:</strong> Stored on a dedicated HCS topic (configured via{' '}
            <code className="font-mono text-xs">HCS_PATIENT_APPROVAL_TOPIC_ID</code>). Each message
            contains a consent hash and timestamp, keyed by anonymous patient ID.
          </li>
          <li>
            <strong>Provenance Records:</strong> Stored on a separate HCS data topic (configured via{' '}
            <code className="font-mono text-xs">HCS_DATA_TOPIC_ID</code>) with both Storage (H1) and
            Chain (H2) hashes and a <code className="font-mono text-xs">provenanceProof</code> that
            links them.
          </li>
          <li>
            <strong>On-Chain Consent Registry:</strong> The{' '}
            <code className="font-mono text-xs">ConsentManager</code> contract stores a per-patient
            <code className="font-mono text-xs">ConsentRecord</code> with the PID, consent HCS
            topic, data hash, and validity flag. This can be queried via the{' '}
            <code className="font-mono text-xs">isConsentValid</code> view function or inspected
            directly on-chain.
          </li>
        </ul>
        <p className="mt-2 text-sm text-gray-600">
          This triad (backend consent table, HCS consent proofs, and on-chain consent registry)
          provides a robust, auditable trail for regulators, researchers, and patients.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Configuration & Environment</h2>
        <p className="mt-4 text-gray-700">
          The consent and proof flows are controlled via environment variables in{' '}
          <code className="font-mono text-xs">adapter/.env</code>:
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
          <li>
            <strong>HEDERA_NETWORK</strong> &mdash; Hedera network to use
            (<code>testnet</code>, <code>previewnet</code>, <code>mainnet</code>).
          </li>
          <li>
            <strong>HCS_PATIENT_APPROVAL_TOPIC_ID</strong> &mdash; HCS topic for consent proofs.
          </li>
          <li>
            <strong>HCS_DATA_TOPIC_ID</strong> &mdash; HCS topic for data &amp; provenance proofs.
          </li>
          <li>
            <strong>CONSENT_MANAGER_ADDRESS</strong> &mdash; Hedera EVM address of the{' '}
            <code className="font-mono text-xs">ConsentManager</code> contract. When set, the
            adapter will record on-chain consent records.
          </li>
          <li>
            <strong>REQUIRE_ONCHAIN_CONSENT</strong> (optional) &mdash; When set to{' '}
            <code>true</code>, the universal EMR adapter will operate in strict consent-first mode
            and only process PIDs that already have valid consent on-chain.
          </li>
        </ul>
      </section>
    </div>
  );
}


