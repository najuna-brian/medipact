import MermaidDiagram from '@/components/docs/MermaidDiagram';
import Link from 'next/link';

export default function ForPatientsPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Guide for Patients</h1>
        <p className="mt-4 text-lg text-gray-600">
          Learn how to use MediPact to store your medical records, control your data, and earn money when researchers use your anonymized data.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">What is MediPact for Patients?</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            MediPact is your <strong>Personal Health Vault</strong> that gives you:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
            <li><strong>Secure Storage:</strong> Store all your medical records in one place, accessible from anywhere</li>
            <li><strong>Complete Control:</strong> You decide who can access your data and for what purpose</li>
            <li><strong>Fair Compensation:</strong> Earn money (60% of revenue) when researchers use your anonymized data</li>
            <li><strong>Privacy Protection:</strong> Your data is anonymized using advanced techniques before being shared</li>
            <li><strong>Cross-Hospital Access:</strong> Connect multiple hospitals to see your complete medical history</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">How It Works</h2>
        <MermaidDiagram
          chart={`flowchart TD
    A[Patient Registers] --> B[Receive Unique Patient ID<br/>UPI]
    B --> C[Hospital Links Your Data]
    C --> D[Data Anonymized<br/>PII Removed]
    D --> E[Stored Securely<br/>FHIR Format]
    E --> F[You Control Access<br/>Consent Management]
    F --> G{Researcher Wants<br/>Your Data?}
    G -->|You Approve| H[Data Shared<br/>Anonymized]
    G -->|You Decline| I[Access Denied]
    H --> J[Researcher Pays]
    J --> K[You Receive 60%<br/>in Hedera Wallet]
    K --> L[Withdraw to Bank<br/>or Mobile Money]
    
    style A fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style D fill:#C8E6C9,stroke:#388E3C,stroke-width:2px
    style F fill:#FFF9C4,stroke:#F57F17,stroke-width:2px
    style K fill:#00A9CE,color:#fff,stroke:#007A99,stroke-width:3px
    style L fill:#BBDEFB,stroke:#1976D2,stroke-width:2px`}
        />
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Getting Started</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Step 1: Register</h3>
            <p className="mt-2 text-gray-700">
              Create your MediPact account by providing basic information. You'll receive a unique Patient ID (UPI) that links all your medical records across hospitals.
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-600">
              <li>Provide your contact information (phone or email)</li>
              <li>Set up payment method (bank account or mobile money)</li>
              <li>Receive your unique Patient ID (UPI)</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Step 2: Connect Hospitals</h3>
            <p className="mt-2 text-gray-700">
              Link your MediPact account to hospitals where you receive care. This allows you to:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-600">
              <li>View your complete medical history from all hospitals</li>
              <li>Share records between hospitals (with your approval)</li>
              <li>Enable hospitals to upload your data to MediPact</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Step 3: Set Data Sharing Preferences</h3>
            <p className="mt-2 text-gray-700">
              Control how your data is shared with researchers:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-600">
              <li><strong>Global Opt-In/Opt-Out:</strong> Enable or disable all data sharing</li>
              <li><strong>Researcher Approvals:</strong> Approve or decline individual researcher requests</li>
              <li><strong>Granular Controls:</strong> Control which types of data can be shared</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Earning Money from Your Data</h2>
        <div className="mt-4 rounded-lg border-2 border-green-500 bg-green-50 p-6">
          <h3 className="text-xl font-bold text-green-900">You Receive 60% of Revenue</h3>
          <p className="mt-2 text-gray-700">
            When a researcher purchases a dataset containing your anonymized data, you automatically receive <strong>60% of your share</strong> of the payment.
          </p>
          <div className="mt-4 rounded-lg border border-green-200 bg-white p-4">
            <p className="font-semibold text-gray-900">Example:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li>Researcher pays $1,000 for a dataset with 100 patients</li>
              <li>Amount per patient: $10</li>
              <li>Your share: $10 × 60% = <strong>$6</strong></li>
              <li>Money appears in your Hedera wallet automatically</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Your Privacy is Protected</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h3 className="text-lg font-semibold text-blue-900">Double Anonymization</h3>
            <p className="mt-2 text-gray-700">
              Your data goes through two stages of anonymization before being shared:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li><strong>Stage 1:</strong> Removes names, addresses, phone numbers, exact dates of birth</li>
              <li><strong>Stage 2:</strong> Further generalizes age ranges and dates</li>
              <li><strong>K-Anonymity:</strong> Ensures at least 5 patients share the same demographic profile</li>
            </ul>
          </div>

          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <h3 className="text-lg font-semibold text-green-900">You Control Access</h3>
            <p className="mt-2 text-gray-700">
              Researchers can only access your data if:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li>You have globally opted in to data sharing</li>
              <li>You have approved the specific researcher (if required)</li>
              <li>Your consent is recorded on Hedera blockchain (immutable proof)</li>
            </ul>
          </div>

          <div className="rounded-lg border border-purple-200 bg-purple-50 p-6">
            <h3 className="text-lg font-semibold text-purple-900">Immutable Consent Records</h3>
            <p className="mt-2 text-gray-700">
              All consent decisions are recorded on Hedera blockchain, creating an unchangeable audit trail. You can verify your consent status at any time.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Wallet & Withdrawals</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Automatic Wallet Creation</h3>
          <p className="mt-2 text-gray-700">
            When you receive your first payment, MediPact automatically creates a Hedera wallet for you. You never need to manage private keys or complex wallet software.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <h4 className="font-semibold text-gray-900">View Your Balance</h4>
              <p className="mt-1 text-sm text-gray-700">
                Check your earnings in USD (primary) and HBAR. All balances update automatically when researchers purchase your data.
              </p>
            </div>
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
              <h4 className="font-semibold text-gray-900">Withdraw Funds</h4>
              <p className="mt-1 text-sm text-gray-700">
                Withdraw to your bank account or mobile money provider (MTN, Airtel, etc.). Set automatic withdrawals when your balance reaches a threshold.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Key Benefits</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <h3 className="font-semibold text-green-900">💰 Earn Money</h3>
            <p className="mt-1 text-sm text-gray-700">
              Get paid 60% of revenue when your anonymized data is used for research that advances medical science.
            </p>
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h3 className="font-semibold text-blue-900">🔒 Privacy Protected</h3>
            <p className="mt-1 text-sm text-gray-700">
              Your data is anonymized using advanced techniques. Researchers never see your identity.
            </p>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
            <h3 className="font-semibold text-purple-900">🎯 Full Control</h3>
            <p className="mt-1 text-sm text-gray-700">
              You decide who can access your data. Approve or decline researcher requests individually.
            </p>
          </div>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <h3 className="font-semibold text-yellow-900">📊 Complete History</h3>
            <p className="mt-1 text-sm text-gray-700">
              View your medical history from all connected hospitals in one place.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Getting Help</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            Need help? Check out these resources:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6 text-gray-700">
            <li><Link href="/docs/wallet" className="text-[#00A9CE] hover:underline">Wallet & Payments Guide</Link></li>
            <li><Link href="/docs/patient-controls" className="text-[#00A9CE] hover:underline">Data Sharing Controls</Link></li>
            <li><Link href="/docs/privacy" className="text-[#00A9CE] hover:underline">Privacy & Security</Link></li>
            <li><Link href="/contact" className="text-[#00A9CE] hover:underline">Contact Support</Link></li>
          </ul>
        </div>
      </section>
    </div>
  );
}

