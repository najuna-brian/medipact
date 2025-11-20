import CodeBlock from '@/components/docs/CodeBlock';

export default function LocalSetupDemoPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Local Setup & Demo Guide</h1>
        <p className="mt-4 text-lg text-gray-600">
          Complete guide to set up MediPact locally, verify all components, and run end-to-end demonstrations.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Prerequisites</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Required Software</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li><strong>Node.js 20+</strong> - <a href="https://nodejs.org/" className="text-[#00A9CE] hover:underline">Download</a></li>
              <li><strong>npm</strong> - Comes with Node.js</li>
              <li><strong>Git</strong> - <a href="https://git-scm.com/" className="text-[#00A9CE] hover:underline">Download</a></li>
              <li><strong>Hedera Testnet Account</strong> - <a href="https://portal.hedera.com/dashboard" className="text-[#00A9CE] hover:underline">Get Free Account</a></li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Verify Prerequisites</h3>
            <CodeBlock
              code={`# Check Node.js version (should be 20+)
node -v

# Check npm version
npm -v

# Check Git version
git --version`}
              language="bash"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Step 1: Clone & Install</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">1.1 Clone Repository</h3>
            <CodeBlock
              code={`git clone git@github.com:najuna-brian/medipact.git
cd medipact`}
              language="bash"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">1.2 Install All Dependencies</h3>
            <CodeBlock
              code={`# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Install adapter dependencies
cd ../backend/adapter
npm install

# Install contract dependencies
cd ../../contracts
npm install

# Return to root
cd ..`}
              language="bash"
            />
            <p className="mt-2 text-sm text-gray-600">
              This installs all required packages for backend, frontend, adapter, and smart contracts.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Step 2: Environment Configuration</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">2.1 Backend Environment</h3>
            <p className="mt-2 text-gray-700 mb-4">
              Create <code className="bg-gray-100 px-2 py-1 rounded">backend/.env</code> file:
            </p>
            <CodeBlock
              code={`# Hedera Configuration
OPERATOR_ID="0.0.xxxxx"              # Your Hedera account ID
OPERATOR_KEY="0x..."                  # Your Hedera private key (ECDSA, HEX)
HEDERA_NETWORK="testnet"              # Network: testnet or mainnet

# Server Configuration
PORT=8080
NODE_ENV=development

# Database (SQLite for local dev)
DATABASE_PATH="./data/medipact.db"

# JWT Secret (generate a random string)
JWT_SECRET="your-secret-key-here"

# Admin Configuration
ADMIN_EMAIL="admin@medipact.com"
ADMIN_PASSWORD="your-secure-password"

# Smart Contracts (optional, deploy first)
CONSENT_MANAGER_ADDRESS="0x..."
REVENUE_SPLITTER_ADDRESS="0x..."

# Exchange Rate (auto-updated)
EXCHANGE_RATE_API_KEY=""              # Optional: CoinGecko API key`}
              language="env"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">2.2 Frontend Environment</h3>
            <p className="mt-2 text-gray-700 mb-4">
              Create <code className="bg-gray-100 px-2 py-1 rounded">frontend/.env.local</code> file:
            </p>
            <CodeBlock
              code={`NEXT_PUBLIC_API_URL="http://localhost:8080"
NEXT_PUBLIC_HEDERA_NETWORK="testnet"`}
              language="env"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">2.3 Adapter Environment</h3>
            <p className="mt-2 text-gray-700 mb-4">
              Create <code className="bg-gray-100 px-2 py-1 rounded">backend/adapter/.env</code> file:
            </p>
            <CodeBlock
              code={`# Hedera Configuration
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"

# Hospital Configuration
HOSPITAL_COUNTRY="Uganda"
HOSPITAL_LOCATION="Kampala"

# Optional: Smart Contracts
CONSENT_MANAGER_ADDRESS="0x..."
REVENUE_SPLITTER_ADDRESS="0x..."`}
              language="env"
            />
          </div>

          <div className="rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6">
            <h3 className="text-lg font-semibold text-[#00A9CE]">💡 Getting Hedera Testnet Credentials</h3>
            <ol className="mt-2 list-decimal space-y-2 pl-6 text-gray-700">
              <li>Visit <a href="https://portal.hedera.com/dashboard" className="text-[#00A9CE] hover:underline">Hedera Portal</a></li>
              <li>Create a free testnet account</li>
              <li>Copy your Account ID (format: 0.0.xxxxx)</li>
              <li>Export your private key (ECDSA format, hex string starting with 0x)</li>
              <li>Fund your account with test HBAR from the faucet</li>
            </ol>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Step 3: Deploy Smart Contracts</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">3.1 Deploy to Testnet</h3>
            <CodeBlock
              code={`cd contracts

# Deploy ConsentManager and RevenueSplitter
npm run deploy:testnet`}
              language="bash"
            />
            <p className="mt-4 text-gray-700">
              This will deploy both smart contracts to Hedera testnet. Save the contract addresses and add them to your <code className="bg-gray-100 px-2 py-1 rounded">.env</code> files.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">3.2 Verify Deployment</h3>
            <CodeBlock
              code={`# Run contract tests
npm test

# Check deployment info
cat deployment-info.json`}
              language="bash"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Step 4: Initialize Backend</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">4.1 Start Backend Server</h3>
            <CodeBlock
              code={`cd backend
npm start`}
              language="bash"
            />
            <p className="mt-2 text-sm text-gray-600">
              Backend will start on <code>http://localhost:8080</code>. The server will:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-600">
              <li>Initialize database tables</li>
              <li>Create default admin account</li>
              <li>Start background jobs (cleanup, withdrawals, exchange rates)</li>
              <li>Initialize Hedera client</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">4.2 Verify Backend Health</h3>
            <CodeBlock
              code={`# In a new terminal, test health endpoint
curl http://localhost:8080/health

# Expected response:
# {"status":"healthy","timestamp":"...","service":"MediPact Backend API","database":"connected"}`}
              language="bash"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">4.3 Setup Admin Account</h3>
            <CodeBlock
              code={`# Create admin account (if not auto-created)
cd backend
npm run setup-admin`}
              language="bash"
            />
            <p className="mt-2 text-sm text-gray-600">
              Default admin credentials are created automatically. Check your <code>.env</code> for <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code>.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Step 5: Start Frontend</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">5.1 Start Development Server</h3>
            <CodeBlock
              code={`cd frontend
npm run dev`}
              language="bash"
            />
            <p className="mt-2 text-sm text-gray-600">
              Frontend will start on <code>http://localhost:3000</code>
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">5.2 Access Points</h3>
            <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="rounded border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-900">Frontend Application</p>
                <CodeBlock code="http://localhost:3000" language="text" />
              </div>
              <div className="rounded border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-900">API Documentation</p>
                <CodeBlock code="http://localhost:8080/api-docs" language="text" />
              </div>
              <div className="rounded border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-900">Documentation Site</p>
                <CodeBlock code="http://localhost:3000/docs" language="text" />
              </div>
              <div className="rounded border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm font-semibold text-gray-900">Health Check</p>
                <CodeBlock code="http://localhost:8080/health" language="text" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Step 6: Core Component Verification</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">6.1 Database Verification</h3>
            <CodeBlock
              code={`# Check database file exists
ls -lh backend/data/medipact.db

# Verify tables are created (SQLite)
sqlite3 backend/data/medipact.db ".tables"

# Expected tables:
# patients, hospitals, researchers, datasets, purchases, 
# withdrawal_history, balance_history, etc.`}
              language="bash"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">6.2 Hedera Connection Test</h3>
            <CodeBlock
              code={`# Test Hedera account connection
cd backend
node scripts/test-hedera-accounts.js`}
              language="bash"
            />
            <p className="mt-2 text-sm text-gray-600">
              This verifies your Hedera credentials and account balance.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">6.3 Smart Contract Verification</h3>
            <CodeBlock
              code={`# Run contract tests
cd contracts
npm test

# Verify contracts are deployed
cat deployment-info.json | grep -A 5 "address"`}
              language="bash"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">6.4 Backend Services Test</h3>
            <CodeBlock
              code={`# Run backend unit tests
cd backend
npm test

# Test specific services
npm test -- tests/unit/services.test.js
npm test -- tests/unit/health.test.js`}
              language="bash"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Step 7: End-to-End Testing</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">7.1 Complete Data Flow Test</h3>
            <p className="mt-2 text-gray-700 mb-4">
              This test verifies the complete flow: Hospital Upload → Processing → Storage → Researcher Query → Export
            </p>
            <CodeBlock
              code={`# From project root
./scripts/test-complete-data-flow.sh

# Or using Node.js script
node scripts/test-complete-data-flow.js`}
              language="bash"
            />
            <p className="mt-4 text-gray-700">
              <strong>What this tests:</strong>
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>Hospital registration and authentication</li>
              <li>Patient data upload (FHIR format)</li>
              <li>Data anonymization and storage</li>
              <li>Dataset creation and pricing</li>
              <li>Researcher registration and authentication</li>
              <li>Dataset query and purchase</li>
              <li>Revenue distribution (60/25/15 split)</li>
              <li>Data export (CSV/API)</li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">7.2 Revenue Flow Test</h3>
            <CodeBlock
              code={`# Test revenue distribution
node scripts/test-revenue-flow.js

# Detailed revenue test
node scripts/test-revenue-flow-detailed.js`}
              language="bash"
            />
            <p className="mt-2 text-sm text-gray-600">
              Verifies the 60% patient, 25% hospital, 15% platform revenue split.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">7.3 Payment & Withdrawal Test</h3>
            <CodeBlock
              code={`# Test payment and withdrawal flow
export RESEARCHER_ID="RES-XXX"  # Use actual researcher ID
node scripts/test-payment-payout-flow.js`}
              language="bash"
            />
            <p className="mt-2 text-sm text-gray-600">
              Tests the complete payment flow from purchase to withdrawal.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">7.4 Registration Flows Test</h3>
            <CodeBlock
              code={`# Test all registration endpoints
./scripts/test-registration-flows.sh

# Test hospital registration
./scripts/test-registration-api.sh

# Test researcher registration
./scripts/test-researcher-registration.sh`}
              language="bash"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">7.5 Adapter Integration Test</h3>
            <CodeBlock
              code={`# Test adapter-backend integration
./scripts/test-adapter-backend-integration.sh

# Or test adapter CSV processing
cd backend/adapter
npm run start:legacy`}
              language="bash"
            />
            <p className="mt-2 text-sm text-gray-600">
              Tests CSV to FHIR conversion, anonymization, and HCS submission.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Step 8: Demo Data Setup</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">8.1 Populate Demo Data</h3>
            <CodeBlock
              code={`# Populate demo data (hospitals, patients, datasets)
cd backend
npm run demo:populate

# Create demo datasets
npm run demo:datasets

# Create MVP datasets
npm run demo:mvp`}
              language="bash"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">8.2 Fund Test Accounts</h3>
            <CodeBlock
              code={`# Fund existing Hedera accounts with test HBAR
cd backend
npm run hedera:fund`}
              language="bash"
            />
            <p className="mt-2 text-sm text-gray-600">
              Ensures all test accounts have sufficient HBAR for transactions.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Step 9: Manual Demo Walkthrough</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6">
            <h3 className="text-lg font-semibold text-[#00A9CE]">Demo Flow Overview</h3>
            <p className="mt-2 text-gray-700">
              Follow this sequence to demonstrate all core features:
            </p>
            <ol className="mt-4 list-decimal space-y-3 pl-6 text-gray-700">
              <li><strong>Hospital Registration</strong> - Register a hospital account</li>
              <li><strong>Patient Data Upload</strong> - Upload FHIR-compliant patient data</li>
              <li><strong>Data Processing</strong> - Show anonymization and HCS proofs</li>
              <li><strong>Dataset Creation</strong> - Create queryable datasets</li>
              <li><strong>Researcher Registration</strong> - Register a researcher account</li>
              <li><strong>Dataset Query</strong> - Query available datasets</li>
              <li><strong>Purchase Dataset</strong> - Purchase and download data</li>
              <li><strong>Revenue Distribution</strong> - Show automatic revenue split</li>
              <li><strong>Patient Wallet</strong> - Show patient earnings and withdrawals</li>
              <li><strong>HashScan Verification</strong> - Verify transactions on Hedera</li>
            </ol>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">9.1 Hospital Portal Demo</h3>
            <CodeBlock
              code={`# 1. Register Hospital
POST http://localhost:8080/api/hospital/register
{
  "name": "Demo Hospital",
  "contactEmail": "hospital@demo.com",
  "country": "Uganda",
  "location": "Kampala"
}

# 2. Login and get API key
POST http://localhost:8080/api/hospital/login
{
  "email": "hospital@demo.com",
  "password": "password"
}

# 3. Upload patient data
POST http://localhost:8080/api/hospital/patients/upload
Headers: X-Hospital-ID: HOSP-XXX, X-API-Key: xxx
Body: FHIR Bundle JSON`}
              language="bash"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">9.2 Researcher Portal Demo</h3>
            <CodeBlock
              code={`# 1. Register Researcher
POST http://localhost:8080/api/researcher/register
{
  "name": "Dr. Researcher",
  "email": "researcher@demo.com",
  "organization": "Research Institute",
  "country": "USA"
}

# 2. Login
POST http://localhost:8080/api/researcher/login
{
  "email": "researcher@demo.com",
  "password": "password"
}

# 3. Query datasets
GET http://localhost:8080/api/marketplace/datasets?country=Uganda&condition=Diabetes

# 4. Purchase dataset
POST http://localhost:8080/api/marketplace/purchase
Headers: X-Researcher-ID: RES-XXX, Authorization: Bearer xxx
{
  "datasetId": "DS-XXX",
  "query": {...}
}`}
              language="bash"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">9.3 Patient Portal Demo</h3>
            <CodeBlock
              code={`# 1. Patient login (using UPI from hospital upload)
GET http://localhost:8080/api/patient/login?upi=PID-XXX

# 2. View balance
GET http://localhost:8080/api/wallet/balance?upi=PID-XXX

# 3. View earnings history
GET http://localhost:8080/api/wallet/earnings?upi=PID-XXX

# 4. Configure withdrawal method
POST http://localhost:8080/api/payment-method
{
  "upi": "PID-XXX",
  "paymentMethod": "bank",
  "bankAccountNumber": "1234567890"
}

# 5. Initiate withdrawal
POST http://localhost:8080/api/wallet/withdraw
{
  "upi": "PID-XXX",
  "amountUSD": 10.00
}`}
              language="bash"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Step 10: Verification Checklist</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">System Health Checks</h3>
            <CodeBlock
              code={`# Backend health
curl http://localhost:8080/health

# Frontend accessible
curl http://localhost:3000

# API docs accessible
curl http://localhost:8080/api-docs

# Database connected
sqlite3 backend/data/medipact.db "SELECT COUNT(*) FROM patients;"

# Hedera connection
cd backend && node scripts/test-hedera-accounts.js`}
              language="bash"
            />
          </div>

          <div className="rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6">
            <h3 className="text-lg font-semibold text-[#00A9CE]">✅ Complete Verification Checklist</h3>
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Infrastructure</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>☐ Backend server running (port 8080)</li>
                  <li>☐ Frontend server running (port 3000)</li>
                  <li>☐ Database initialized and connected</li>
                  <li>☐ Hedera testnet connection working</li>
                  <li>☐ Smart contracts deployed</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Core Features</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>☐ Hospital registration works</li>
                  <li>☐ Patient data upload works</li>
                  <li>☐ Data anonymization works</li>
                  <li>☐ HCS proofs submitted</li>
                  <li>☐ Dataset creation works</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Marketplace</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>☐ Researcher registration works</li>
                  <li>☐ Dataset query works</li>
                  <li>☐ Dataset purchase works</li>
                  <li>☐ Data export works (CSV/API)</li>
                  <li>☐ Revenue distribution works</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Wallet & Payments</h4>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>☐ Patient balance visible</li>
                  <li>☐ Earnings history visible</li>
                  <li>☐ Withdrawal configuration works</li>
                  <li>☐ Withdrawal initiation works</li>
                  <li>☐ Exchange rate updates</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Troubleshooting</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Common Issues</h3>
            <div className="mt-4 space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900">Port Already in Use</h4>
                <CodeBlock
                  code={`# Find process using port 8080
lsof -i :8080

# Kill process
kill -9 <PID>

# Or change port in backend/.env
PORT=8081`}
                  language="bash"
                />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Database Locked</h4>
                <CodeBlock
                  code={`# Check if backend is running
ps aux | grep "node.*server.js"

# Stop backend, then restart
# Or delete database and let it recreate
rm backend/data/medipact.db`}
                  language="bash"
                />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Hedera Connection Failed</h4>
                <CodeBlock
                  code={`# Verify credentials in .env
cat backend/.env | grep OPERATOR

# Test connection
cd backend
node scripts/test-hedera-accounts.js

# Check account balance
# Visit https://hashscan.io/testnet and search your account ID`}
                  language="bash"
                />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Module Import Errors</h4>
                <CodeBlock
                  code={`# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check Node.js version (must be 20+)
node -v`}
                  language="bash"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Next Steps</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Explore Documentation</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li><a href="/docs/architecture" className="text-[#00A9CE] hover:underline">System Architecture</a></li>
              <li><a href="/docs/data-flow" className="text-[#00A9CE] hover:underline">Data Flow</a></li>
              <li><a href="/docs/revenue-distribution" className="text-[#00A9CE] hover:underline">Revenue Distribution</a></li>
              <li><a href="/docs/hedera" className="text-[#00A9CE] hover:underline">Hedera Integration</a></li>
              <li><a href="/docs/smart-contracts" className="text-[#00A9CE] hover:underline">Smart Contracts</a></li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">API Documentation</h3>
            <p className="mt-2 text-gray-700">
              Interactive API documentation is available at <a href="http://localhost:8080/api-docs" className="text-[#00A9CE] hover:underline">http://localhost:8080/api-docs</a>
            </p>
            <p className="mt-2 text-sm text-gray-600">
              Use this to explore all available endpoints, test requests, and view response schemas.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

