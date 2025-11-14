import MermaidDiagram from '@/components/docs/MermaidDiagram';

export default function DatabasePage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Database Schema</h1>
        <p className="mt-4 text-lg text-gray-600">
          Complete database schema and entity relationships for the MediPact platform.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Entity Relationship Diagram</h2>
        <MermaidDiagram
          chart={`erDiagram
    PATIENTS ||--o{ PATIENT_CONTACTS : has
    PATIENTS ||--o{ HOSPITAL_LINKAGES : linked_to
    PATIENTS ||--o{ FHIR_PATIENTS : has
    PATIENTS ||--o{ CONSENTS : has
    HOSPITALS ||--o{ HOSPITAL_LINKAGES : links
    HOSPITALS ||--o{ DATASETS : creates
    RESEARCHERS ||--o{ DATASETS : purchases
    PATIENTS ||--o{ WITHDRAWAL_HISTORY : has
    HOSPITALS ||--o{ WITHDRAWAL_HISTORY : has
    FHIR_PATIENTS ||--o{ FHIR_CONDITIONS : has
    FHIR_PATIENTS ||--o{ FHIR_OBSERVATIONS : has
    
    PATIENTS {
        string upi PK
        string hedera_account_id
        string evm_address
        string payment_method
        string bank_account_number
        string withdrawal_threshold_usd
        boolean auto_withdraw_enabled
    }
    HOSPITALS {
        string hospital_id PK
        string hedera_account_id
        string evm_address
        string payment_method
        string bank_account_number
        string withdrawal_threshold_usd
        boolean auto_withdraw_enabled
        boolean verified
    }
    CONSENTS {
        string consent_id PK
        string upi FK
        string anonymous_patient_id
        string hcs_topic_id
        string data_hash
    }
    DATASETS {
        string dataset_id PK
        string hospital_id FK
        string consent_topic_id
        string data_topic_id
        decimal price
        decimal price_usd
        string pricing_category
    }
    WITHDRAWAL_HISTORY {
        int id PK
        string upi FK
        string hospital_id FK
        string user_type
        decimal amount_hbar
        decimal amount_usd
        string payment_method
        string status
        timestamp created_at
    }`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Core Tables</h2>
        <div className="mt-4 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">PATIENTS</h3>
            <p className="mt-2 text-sm text-gray-600">Stores patient identity and Hedera account information</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Column</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Type</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">upi</td>
                    <td className="px-3 py-2 text-gray-600">STRING (PK)</td>
                    <td className="px-3 py-2 text-gray-600">Universal Patient Identifier</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">hedera_account_id</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">Hedera account (0.0.xxxxx) for revenue</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">evm_address</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">EVM-compatible address (0x...)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">payment_method</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">'bank' or 'mobile_money'</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">bank_account_number</td>
                    <td className="px-3 py-2 text-gray-600">STRING (encrypted)</td>
                    <td className="px-3 py-2 text-gray-600">Encrypted bank account number</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">withdrawal_threshold_usd</td>
                    <td className="px-3 py-2 text-gray-600">DECIMAL</td>
                    <td className="px-3 py-2 text-gray-600">Auto-withdrawal threshold (default: $10.00)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">auto_withdraw_enabled</td>
                    <td className="px-3 py-2 text-gray-600">BOOLEAN</td>
                    <td className="px-3 py-2 text-gray-600">Enable automatic withdrawals</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">HOSPITALS</h3>
            <p className="mt-2 text-sm text-gray-600">Hospital registration and verification</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Column</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Type</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">hospital_id</td>
                    <td className="px-3 py-2 text-gray-600">STRING (PK)</td>
                    <td className="px-3 py-2 text-gray-600">Unique hospital identifier</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">hedera_account_id</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">Hedera account for revenue</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">evm_address</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">EVM-compatible address (0x...)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">payment_method</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">'bank' or 'mobile_money'</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">bank_account_number</td>
                    <td className="px-3 py-2 text-gray-600">STRING (encrypted)</td>
                    <td className="px-3 py-2 text-gray-600">Encrypted bank account number</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">withdrawal_threshold_usd</td>
                    <td className="px-3 py-2 text-gray-600">DECIMAL</td>
                    <td className="px-3 py-2 text-gray-600">Auto-withdrawal threshold (default: $100.00)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">verification_status</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">pending, verified, rejected</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">RESEARCHERS</h3>
            <p className="mt-2 text-sm text-gray-600">Researcher registration and access levels</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Column</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Type</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">researcher_id</td>
                    <td className="px-3 py-2 text-gray-600">STRING (PK)</td>
                    <td className="px-3 py-2 text-gray-600">Unique researcher identifier</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">hedera_account_id</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">Hedera account for payments</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">access_level</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">basic, verified, premium</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">CONSENTS</h3>
            <p className="mt-2 text-sm text-gray-600">Patient consent records linked to HCS and smart contracts</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Column</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Type</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">consent_id</td>
                    <td className="px-3 py-2 text-gray-600">STRING (PK)</td>
                    <td className="px-3 py-2 text-gray-600">Unique consent identifier</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">upi</td>
                    <td className="px-3 py-2 text-gray-600">STRING (FK)</td>
                    <td className="px-3 py-2 text-gray-600">Patient UPI reference</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">anonymous_patient_id</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">Anonymous ID (PID-001)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">hcs_topic_id</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">HCS topic for consent proof</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">data_hash</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">Hash of anonymized dataset</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">DATASETS</h3>
            <p className="mt-2 text-sm text-gray-600">Marketplace datasets with HCS topic references</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Column</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Type</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">dataset_id</td>
                    <td className="px-3 py-2 text-gray-600">STRING (PK)</td>
                    <td className="px-3 py-2 text-gray-600">Unique dataset identifier</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">hospital_id</td>
                    <td className="px-3 py-2 text-gray-600">STRING (FK)</td>
                    <td className="px-3 py-2 text-gray-600">Hospital that created the dataset</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">consent_topic_id</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">HCS topic for consent verification</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">data_topic_id</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">HCS topic for data proof</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">price</td>
                    <td className="px-3 py-2 text-gray-600">DECIMAL(20,8)</td>
                    <td className="px-3 py-2 text-gray-600">Price in HBAR</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">price_usd</td>
                    <td className="px-3 py-2 text-gray-600">DECIMAL(10,2)</td>
                    <td className="px-3 py-2 text-gray-600">Price in USD</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">pricing_category</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">Pricing category (basic, condition, lab, etc.)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">WITHDRAWAL_HISTORY</h3>
            <p className="mt-2 text-sm text-gray-600">Tracks all withdrawal requests and their status</p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Column</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Type</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-900">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">id</td>
                    <td className="px-3 py-2 text-gray-600">INTEGER (PK)</td>
                    <td className="px-3 py-2 text-gray-600">Unique withdrawal ID</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">upi</td>
                    <td className="px-3 py-2 text-gray-600">STRING (FK)</td>
                    <td className="px-3 py-2 text-gray-600">Patient UPI (if patient withdrawal)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">hospital_id</td>
                    <td className="px-3 py-2 text-gray-600">STRING (FK)</td>
                    <td className="px-3 py-2 text-gray-600">Hospital ID (if hospital withdrawal)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">user_type</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">'patient' or 'hospital'</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">amount_hbar</td>
                    <td className="px-3 py-2 text-gray-600">DECIMAL(20,8)</td>
                    <td className="px-3 py-2 text-gray-600">Withdrawal amount in HBAR</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">amount_usd</td>
                    <td className="px-3 py-2 text-gray-600">DECIMAL(10,2)</td>
                    <td className="px-3 py-2 text-gray-600">Withdrawal amount in USD</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">payment_method</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">'bank' or 'mobile_money'</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">destination_account</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">Bank account or mobile money number (masked)</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">status</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">pending, processing, completed, failed</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 font-medium text-gray-900">transaction_id</td>
                    <td className="px-3 py-2 text-gray-600">STRING</td>
                    <td className="px-3 py-2 text-gray-600">Fiat transfer transaction ID (if available)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Key Relationships</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Patient Identity (UPI)</h3>
            <p className="mt-2 text-gray-700">
              The Universal Patient Identifier (UPI) enables cross-hospital patient identity linking. A patient can be registered at multiple hospitals, and all records are linked through the UPI.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Consent Tracking</h3>
            <p className="mt-2 text-gray-700">
              Each consent record links a patient (via UPI) to an anonymous patient ID, HCS topic, and data hash. This enables verification of consent both on-chain (via ConsentManager contract) and off-chain (via database queries).
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Hedera Integration</h3>
            <p className="mt-2 text-gray-700">
              All entities that receive revenue (patients, hospitals) have Hedera account IDs stored in the database. Researchers also have Hedera accounts for making payments. HCS topic IDs are stored for verification purposes.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


