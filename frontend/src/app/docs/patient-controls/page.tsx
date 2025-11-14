import MermaidDiagram from '@/components/docs/MermaidDiagram';

export default function PatientControlsPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Patient Data Sharing Controls</h1>
        <p className="mt-4 text-lg text-gray-600">
          Complete patient-centric control over data sharing, researcher access, and privacy preferences.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Patient-Centric Model</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            MediPact puts <strong>patients in complete control</strong> of their data sharing. Unlike traditional systems where hospitals or platforms control access, patients decide who can access their data and under what conditions.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Global Sharing Preferences</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Opt-In/Opt-Out</h3>
            <p className="mt-2 text-gray-700">
              Patients can globally enable or disable data sharing for research. When disabled, no researcher can access the patient's data, regardless of other settings.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Granular Controls</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="font-semibold text-gray-900">Verified Researchers</h4>
                <p className="mt-1 text-sm text-gray-700">
                  Control whether verified researchers can access your data automatically or require approval.
                </p>
              </div>
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h4 className="font-semibold text-gray-900">Unverified Researchers</h4>
                <p className="mt-1 text-sm text-gray-700">
                  Control whether unverified researchers can request access to your data.
                </p>
              </div>
              <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
                <h4 className="font-semibold text-gray-900">Bulk Purchases</h4>
                <p className="mt-1 text-sm text-gray-700">
                  Control whether your data can be included in bulk dataset purchases.
                </p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <h4 className="font-semibold text-gray-900">Sensitive Data</h4>
                <p className="mt-1 text-sm text-gray-700">
                  Control sharing of sensitive medical data (rare conditions, mental health, etc.).
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Minimum Price</h3>
            <p className="mt-2 text-gray-700">
              Patients can set a minimum price per record for their data. Researchers must pay at least this amount to access the patient's data.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Researcher Approval System</h2>
        <MermaidDiagram
          chart={`sequenceDiagram
    participant R as Researcher
    participant P as Patient
    participant S as System
    
    R->>S: Request Access to Patient Data
    S->>P: Notification: Pending Request
    P->>P: Review Request Details<br/>(Organization, Purpose, Conditions)
    alt Patient Approves
        P->>S: Approve Request
        S->>R: Access Granted
        R->>S: Query/Purchase Data
        S->>P: Record Access in History
    else Patient Rejects
        P->>S: Reject Request
        S->>R: Access Denied
    else Patient Blocks
        P->>S: Block Researcher
        S->>R: Future Requests Blocked
    end`}
        />
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Pending Requests</h3>
            <p className="mt-2 text-gray-700">
              When a researcher requests access to a patient's data, the patient receives a notification with:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>Researcher organization name and email</li>
              <li>Verification status (verified/unverified)</li>
              <li>Request purpose and conditions</li>
              <li>Date of request</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Approval Actions</h3>
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <h4 className="font-semibold text-gray-900">✅ Approve</h4>
                <p className="mt-1 text-sm text-gray-700">
                  Grant access to the researcher. They can now query and purchase your data.
                </p>
              </div>
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <h4 className="font-semibold text-gray-900">❌ Reject</h4>
                <p className="mt-1 text-sm text-gray-700">
                  Deny this specific request. The researcher can request again in the future.
                </p>
              </div>
              <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
                <h4 className="font-semibold text-gray-900">🚫 Block</h4>
                <p className="mt-1 text-sm text-gray-700">
                  Permanently block this researcher. All future requests are automatically denied.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Approved Researchers</h3>
            <p className="mt-2 text-gray-700">
              Patients can view all approved researchers and revoke access at any time. Revocation takes effect immediately and prevents future access.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Query Filtering</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Automatic Filtering</h3>
          <p className="mt-2 text-gray-700">
            All queries are automatically filtered based on patient preferences:
          </p>
          <MermaidDiagram
            chart={`flowchart TD
    A[Researcher Query] --> B{Patient Global<br/>Opt-Out?}
    B -->|Yes| C[Exclude Patient]
    B -->|No| D{Researcher<br/>Approved?}
    D -->|No| E{Allow Unverified<br/>Requests?}
    E -->|No| C
    E -->|Yes| F[Require Approval]
    D -->|Yes| G{Minimum Price<br/>Met?}
    G -->|No| C
    G -->|Yes| H{Allow Sensitive<br/>Data?}
    H -->|No| I[Exclude Sensitive Fields]
    H -->|Yes| J[Include Patient]
    F --> K[Pending Request]
    I --> J
    
    style C fill:#FFCDD2,stroke:#D32F2F,stroke-width:2px
    style J fill:#C8E6C9,stroke:#388E3C,stroke-width:2px
    style K fill:#FFF9C4,stroke:#F57F17,stroke-width:2px`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Access History</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Complete Audit Trail</h3>
          <p className="mt-2 text-gray-700">
            Patients can view a complete history of who accessed their data, when, and how much revenue was generated:
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Information Tracked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-600">Researcher organization and email</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-600">Date and time of access</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-600">Number of records accessed</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-600">Dataset ID (if purchased)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-600">Revenue amount (patient's 60% share)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Temporary Hospital Access</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Telemedicine Support</h3>
          <p className="mt-2 text-gray-700">
            Hospitals can request temporary access to a patient's data from another hospital for telemedicine purposes. Patients must approve these requests, and access is automatically revoked after the specified duration (15 minutes to 24 hours).
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="font-semibold text-gray-900">Request Process</h4>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
                <li>Hospital requests access with duration</li>
                <li>Patient receives notification</li>
                <li>Patient approves or rejects</li>
                <li>Data re-encrypted for requesting hospital</li>
              </ul>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 className="font-semibold text-gray-900">Automatic Expiration</h4>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
                <li>Access expires after time limit</li>
                <li>Background job cleans up expired access</li>
                <li>Patient can revoke access anytime</li>
                <li>No impact on revenue distribution</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Patient Dashboard</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            The patient dashboard provides a comprehensive interface for managing all data sharing controls:
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="font-semibold text-gray-900">📋 Preferences Tab</h4>
              <p className="mt-1 text-sm text-gray-700">
                Manage global sharing preferences, granular controls, and minimum price settings.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="font-semibold text-gray-900">🔔 Researcher Requests Tab</h4>
              <p className="mt-1 text-sm text-gray-700">
                View and manage pending researcher access requests.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="font-semibold text-gray-900">✅ Approved Tab</h4>
              <p className="mt-1 text-sm text-gray-700">
                View approved researchers and revoke access if needed.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="font-semibold text-gray-900">📊 Access History Tab</h4>
              <p className="mt-1 text-sm text-gray-700">
                View complete audit trail of data access and revenue.
              </p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h4 className="font-semibold text-gray-900">🏥 Hospital Access Tab</h4>
              <p className="mt-1 text-sm text-gray-700">
                Manage temporary hospital access requests for telemedicine.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

