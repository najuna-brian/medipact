import MermaidDiagram from '@/components/docs/MermaidDiagram';
import CodeBlock from '@/components/docs/CodeBlock';

export default function WalletPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Wallet & Payment System</h1>
        <p className="mt-4 text-lg text-gray-600">
          Seamless payment and withdrawal system with automatic Hedera account management. Users never need to worry about wallets or HBAR complexity.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Overview</h2>
        <p className="mt-4 text-gray-700">
          MediPact's payment system is designed to be <strong>completely user-friendly</strong>. Users (patients and hospitals) receive payments automatically in their Hedera wallets, which are created and managed by the platform. All balances are displayed in USD (with HBAR shown below), and withdrawals can be sent directly to bank accounts or mobile money.
        </p>
        <div className="mt-4 rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6">
          <p className="text-sm text-gray-700">
            <strong>Key Principle:</strong> Users should never need to understand Hedera, wallets, or HBAR. The system handles all blockchain complexity behind the scenes.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Automatic Wallet Creation</h2>
        <p className="mt-4 text-gray-700">
          When a user (patient or hospital) receives their first payment, a Hedera account is automatically created for them. The platform:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
          <li>Generates a secure ECDSA key pair</li>
          <li>Creates an EVM-compatible Hedera account (0.0.xxxxx format)</li>
          <li>Pays for account creation fees</li>
          <li>Stores encrypted private keys securely</li>
          <li>Links the account to the user's profile</li>
        </ul>
        <p className="mt-4 text-gray-700">
          Users can view their Hedera Account ID and EVM Address in their wallet page, but they never need to interact with these directly.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Balance Display</h2>
        <p className="mt-4 text-gray-700">
          All balances are displayed with USD as the primary currency, making it easy for users to understand their earnings:
        </p>
        <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-6">
          <div className="space-y-2">
            <div className="text-3xl font-bold text-gray-900">$125.50</div>
            <div className="text-sm text-gray-600">784.38 HBAR</div>
            <div className="mt-4 text-xs text-gray-500">
              Hedera Account: 0.0.1234567
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          Exchange rates are fetched dynamically from CoinGecko API and cached for 5 minutes to ensure accurate USD conversions.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
        <p className="mt-4 text-gray-700">
          Users can configure their preferred payment method during registration or in settings:
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-[#00A9CE]">Bank Account</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li>• Bank name</li>
              <li>• Account number (encrypted)</li>
              <li>• Direct bank transfer</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="font-semibold text-[#00A9CE]">Mobile Money</h3>
            <ul className="mt-2 space-y-1 text-sm text-gray-600">
              <li>• Provider (MTN, Airtel, Vodafone, Tigo)</li>
              <li>• Phone number (encrypted)</li>
              <li>• Instant mobile money transfer</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm text-gray-700">
            <strong>Security:</strong> All payment account numbers and mobile money numbers are encrypted using AES-256-GCM before storage. They are only decrypted when needed for withdrawal processing.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Withdrawal Process</h2>
        <MermaidDiagram
          chart={`sequenceDiagram
    participant User
    participant Platform
    participant Hedera
    participant PaymentGateway
    
    User->>Platform: Request Withdrawal ($100)
    Platform->>Hedera: Check Balance
    Hedera-->>Platform: Balance: 625 HBAR ($100)
    Platform->>Platform: Convert USD to HBAR
    Platform->>Platform: Create Withdrawal Record
    Platform->>User: Notification: Withdrawal Initiated
    Platform->>PaymentGateway: Transfer to Bank/Mobile Money
    PaymentGateway-->>Platform: Transfer Complete
    Platform->>User: Notification: Withdrawal Completed
    Platform->>Platform: Update User Records`}
        />
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold">Manual Withdrawal</h3>
            <p className="mt-2 text-sm text-gray-600">
              Users can initiate withdrawals at any time from their wallet page. They specify the amount in USD, and the system handles the HBAR conversion automatically.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold">Automatic Withdrawal</h3>
            <p className="mt-2 text-sm text-gray-600">
              Users can enable automatic withdrawals with a threshold (e.g., $10 for patients, $100 for hospitals). When the balance reaches the threshold, a withdrawal is automatically initiated. Users receive a notification when the threshold is reached.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Withdrawal Status & Notifications</h2>
        <p className="mt-4 text-gray-700">
          Users receive notifications at each stage of the withdrawal process:
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
              <span className="text-sm font-semibold">1</span>
            </div>
            <div>
              <h4 className="font-semibold">Pending</h4>
              <p className="mt-1 text-sm text-gray-600">
                Withdrawal request received and queued for processing
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <span className="text-sm font-semibold">2</span>
            </div>
            <div>
              <h4 className="font-semibold">Processing</h4>
              <p className="mt-1 text-sm text-gray-600">
                Funds are being transferred to your bank account or mobile money
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 text-green-600">
              <span className="text-sm font-semibold">3</span>
            </div>
            <div>
              <h4 className="font-semibold">Completed</h4>
              <p className="mt-1 text-sm text-gray-600">
                Funds successfully transferred. Transaction ID provided for reference.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600">
              <span className="text-sm font-semibold">!</span>
            </div>
            <div>
              <h4 className="font-semibold">Failed</h4>
              <p className="mt-1 text-sm text-gray-600">
                Withdrawal could not be processed. Funds remain in wallet. System will automatically retry with exponential backoff.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Error Handling & Retry Logic</h2>
        <p className="mt-4 text-gray-700">
          The system includes comprehensive error handling and automatic retry mechanisms:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
          <li><strong>Exponential Backoff:</strong> Failed withdrawals are retried with increasing delays (5s, 10s, 20s, up to 60s max)</li>
          <li><strong>Maximum Retries:</strong> Up to 3 automatic retries before marking as failed</li>
          <li><strong>Admin Retry:</strong> Admins can manually retry failed withdrawals from the admin dashboard</li>
          <li><strong>Non-Critical Notifications:</strong> Notification failures don't block withdrawals</li>
          <li><strong>Transaction Logging:</strong> All withdrawal attempts are logged for audit purposes</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Revenue Distribution</h2>
        <p className="mt-4 text-gray-700">
          When researchers purchase datasets, revenue is automatically distributed:
        </p>
        <div className="mt-4 rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00A9CE]">60%</div>
              <div className="mt-2 text-sm font-semibold">Patient</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00A9CE]">25%</div>
              <div className="mt-2 text-sm font-semibold">Original Hospital</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#00A9CE]">15%</div>
              <div className="mt-2 text-sm font-semibold">Platform</div>
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          <strong>Important:</strong> The hospital from which the data was originally collected remains the sole beneficiary of that data's revenue, ensuring fair compensation for data collection efforts.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">API Endpoints</h2>
        <div className="mt-4 space-y-4">
          <CodeBlock
            language="bash"
            code={`# Get wallet balance
GET /api/patient/:upi/wallet
GET /api/hospital/:hospitalId/wallet

# Initiate withdrawal
POST /api/patient/:upi/withdraw
POST /api/hospital/:hospitalId/withdraw
Body: { "amountUSD": 100.00 }

# Get withdrawal history
GET /api/patient/:upi/withdrawal-history
GET /api/hospital/:hospitalId/withdrawal-history

# Update payment method
PUT /api/patient/:upi/payment-method
PUT /api/hospital/:hospitalId/payment-method
Body: {
  "paymentMethod": "bank",
  "bankName": "Bank of Uganda",
  "bankAccountNumber": "1234567890",
  "withdrawalThresholdUSD": 10.00,
  "autoWithdrawEnabled": true
}`}
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Admin Features</h2>
        <p className="mt-4 text-gray-700">
          Administrators have access to a comprehensive withdrawal management dashboard:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
          <li>View all withdrawals with filtering by status, user type, date range</li>
          <li>View withdrawal statistics (total, pending, completed, failed amounts)</li>
          <li>Manually complete pending withdrawals after processing payments</li>
          <li>Retry failed withdrawals in bulk</li>
          <li>Trigger monthly automatic withdrawals for all eligible users</li>
          <li>Monitor withdrawal trends and patterns</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Security Features</h2>
        <div className="mt-4 space-y-3">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold">Encryption at Rest</h3>
            <p className="mt-2 text-sm text-gray-600">
              Bank account numbers and mobile money numbers are encrypted using AES-256-GCM before storage. Keys are managed securely and never exposed.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold">Private Key Management</h3>
            <p className="mt-2 text-sm text-gray-600">
              Hedera private keys are encrypted and stored securely. Users never need to manage or see their private keys.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold">Access Control</h3>
            <p className="mt-2 text-sm text-gray-600">
              Users can only access their own wallet information. All API endpoints are protected with authentication middleware.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Future Enhancements</h2>
        <p className="mt-4 text-gray-700">
          Planned improvements to the payment system:
        </p>
        <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
          <li>Integration with payment gateways (Flutterwave, Paystack) for automated bank and mobile money transfers</li>
          <li>Real-time withdrawal status updates via webhooks</li>
          <li>Multi-currency support for international users</li>
          <li>Scheduled withdrawals (e.g., monthly, weekly)</li>
          <li>Withdrawal limits and daily caps for security</li>
          <li>Email and SMS notifications for all withdrawal events</li>
        </ul>
      </section>
    </div>
  );
}

