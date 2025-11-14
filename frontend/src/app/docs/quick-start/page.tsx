import CodeBlock from '@/components/docs/CodeBlock';

export default function QuickStartPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Quick Start Guide</h1>
        <p className="mt-4 text-lg text-gray-600">
          Get started with MediPact in minutes. Follow these steps to set up and run the platform.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Prerequisites</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Required Software</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li><strong>Node.js 18+</strong> - <a href="https://nodejs.org/" className="text-[#00A9CE] hover:underline">Download</a></li>
              <li><strong>Git</strong> - <a href="https://git-scm.com/" className="text-[#00A9CE] hover:underline">Download</a></li>
              <li><strong>Hedera Testnet Account</strong> - <a href="https://portal.hedera.com/dashboard" className="text-[#00A9CE] hover:underline">Get Free Account</a></li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Installation</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">1. Clone Repository</h3>
            <CodeBlock
              code={`git clone git@github.com:najuna-brian/medipact.git
cd medipact`}
              language="bash"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">2. Install Dependencies</h3>
            <CodeBlock
              code={`# Install adapter dependencies
cd adapter && npm install

# Install backend dependencies
cd ../backend && npm install

# Install frontend dependencies
cd ../frontend && npm install

# Install contract dependencies
cd ../contracts && npm install`}
              language="bash"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Configuration</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Environment Variables</h3>
            <p className="mt-2 text-gray-700">
              Create <code>.env</code> files in each component directory. Check the environment variables in:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li><code>backend/.env</code></li>
              <li><code>frontend/.env.local</code></li>
              <li><code>adapter/.env</code></li>
              <li><code>contracts/.env</code></li>
            </ul>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Frontend Configuration</h3>
            <CodeBlock
              code={`# frontend/.env.local
NEXT_PUBLIC_API_URL="http://localhost:3002"
NEXT_PUBLIC_HEDERA_NETWORK="testnet"`}
              language="env"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Hedera Configuration</h3>
            <p className="mt-2 text-gray-700">
              You'll need your Hedera testnet account credentials:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>Operator ID (0.0.xxxxx)</li>
              <li>Operator Private Key</li>
              <li>Network (testnet or mainnet)</li>
            </ul>
            <p className="mt-4 text-sm text-gray-600">
              Get a free testnet account at <a href="https://portal.hedera.com/dashboard" className="text-[#00A9CE] hover:underline">Hedera Portal</a>
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Running the Application</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">1. Start Backend</h3>
            <CodeBlock
              code={`cd backend
npm start`}
              language="bash"
            />
            <p className="mt-2 text-sm text-gray-600">
              Backend runs on <code>http://localhost:3002</code>
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">2. Start Frontend</h3>
            <CodeBlock
              code={`cd frontend
npm run dev`}
              language="bash"
            />
            <p className="mt-2 text-sm text-gray-600">
              Frontend runs on <code>http://localhost:3000</code>
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">3. Start Adapter (Optional)</h3>
            <CodeBlock
              code={`cd adapter
npm start`}
              language="bash"
            />
            <p className="mt-2 text-sm text-gray-600">
              Adapter processes EHR data and submits to Hedera
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Deploy Smart Contracts</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <CodeBlock
            code={`cd contracts
npm run deploy:testnet`}
            language="bash"
          />
          <p className="mt-4 text-gray-700">
            This deploys the ConsentManager and RevenueSplitter contracts to Hedera testnet. Save the contract addresses for configuration.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Testing</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Run Tests</h3>
            <CodeBlock
              code={`# Test contracts
cd contracts && npm test

# Validate adapter
cd adapter && npm run validate`}
              language="bash"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Access Points</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-gray-900">Frontend</h3>
            <CodeBlock code="http://localhost:3000" language="text" />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-gray-900">API Documentation</h3>
            <CodeBlock code="http://localhost:3002/api-docs" language="text" />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-gray-900">Documentation Site</h3>
            <CodeBlock code="http://localhost:3000/docs" language="text" />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <h3 className="font-semibold text-gray-900">HashScan Explorer</h3>
            <CodeBlock code="https://hashscan.io/testnet" language="text" />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Next Steps</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6">
            <h3 className="text-lg font-semibold text-[#00A9CE]">Getting Started Checklist</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>✅ Install all dependencies</li>
              <li>✅ Configure environment variables</li>
              <li>✅ Deploy smart contracts to testnet</li>
              <li>✅ Start backend and frontend services</li>
              <li>✅ Register a test hospital account</li>
              <li>✅ Register a test researcher account</li>
              <li>✅ Upload sample patient data</li>
              <li>✅ Query and purchase a dataset</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Troubleshooting</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Common Issues</h3>
            <div className="mt-4 space-y-3">
              <div>
                <h4 className="font-semibold text-gray-900">Port Already in Use</h4>
                <p className="mt-1 text-sm text-gray-600">
                  If port 3000 or 3002 is already in use, change the port in your configuration or stop the conflicting service.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Hedera Connection Issues</h4>
                <p className="mt-1 text-sm text-gray-600">
                  Ensure your Hedera testnet credentials are correct and you have sufficient HBAR in your account for transactions.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Database Errors</h4>
                <p className="mt-1 text-sm text-gray-600">
                  Make sure the database file exists and has proper permissions. For PostgreSQL, ensure the database is created and accessible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


