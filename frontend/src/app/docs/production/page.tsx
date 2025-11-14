import MermaidDiagram from '@/components/docs/MermaidDiagram';
import CodeBlock from '@/components/docs/CodeBlock';

export default function ProductionPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">Production Deployment</h1>
        <p className="mt-4 text-lg text-gray-600">
          Production-ready configuration, security, monitoring, and deployment best practices for MediPact.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Production Configuration</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            MediPact is configured for production deployment with proper environment validation, structured logging, security headers, and error handling. The system supports both Hedera testnet (for development) and mainnet (for production).
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Environment Variables</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Required Variables</h3>
            <CodeBlock
              code={`# Hedera Configuration
OPERATOR_ID="0.0.xxxxx"                    # Hedera operator account
OPERATOR_KEY="0x..."                       # ECDSA private key (HEX)
PLATFORM_HEDERA_ACCOUNT_ID="0.0.xxxxx"    # Platform account for payments

# Production Settings
NODE_ENV="production"
LOG_LEVEL="INFO"                           # ERROR, WARN, INFO, DEBUG
PORT=3002

# Security
JWT_SECRET="your-secret-min-32-chars"      # At least 32 characters

# Database (PostgreSQL for production)
DATABASE_URL="postgresql://user:pass@host:port/db"

# Frontend URL (for CORS)
FRONTEND_URL="https://www.medipact.space"`}
              language="env"
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Optional Configuration</h3>
            <CodeBlock
              code={`# Hedera Network (defaults based on NODE_ENV)
HEDERA_NETWORK="testnet"                   # or "mainnet"

# Automatic Withdrawals
AUTOMATIC_WITHDRAWAL_ENABLED="true"
AUTOMATIC_WITHDRAWAL_INTERVAL_MINUTES=1440  # Daily

# Exchange Rate
EXCHANGE_RATE_UPDATE_INTERVAL_MINUTES=5
EXCHANGE_RATE_FALLBACK=0.16

# Smart Contracts
REVENUE_SPLITTER_ADDRESS="0x..."
CONSENT_MANAGER_ADDRESS="0x..."`}
              language="env"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Environment Validation</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            On server startup, the system validates all required environment variables and ensures proper configuration:
          </p>
          <MermaidDiagram
            chart={`flowchart TD
    A[Server Start] --> B[Validate Environment]
    B --> C{All Required<br/>Variables Set?}
    C -->|No| D[Log Errors]
    D --> E[Exit with Error]
    C -->|Yes| F{Valid Formats?}
    F -->|No| D
    F -->|Yes| G{Production<br/>Checks?}
    G -->|Yes| H{JWT_SECRET<br/>>= 32 chars?}
    H -->|No| D
    H -->|Yes| I[Initialize Database]
    G -->|No| I
    I --> J[Start Server]
    
    style A fill:#E3F2FD,stroke:#1976D2,stroke-width:2px
    style B fill:#FFF9C4,stroke:#F57F17,stroke-width:2px
    style D fill:#FFCDD2,stroke:#D32F2F,stroke-width:2px
    style J fill:#C8E6C9,stroke:#388E3C,stroke-width:2px`}
          />
          <ul className="mt-4 list-disc space-y-2 pl-6 text-gray-700">
            <li><strong>Required Variables:</strong> Validates presence of OPERATOR_ID, OPERATOR_KEY, PLATFORM_HEDERA_ACCOUNT_ID</li>
            <li><strong>Format Validation:</strong> Checks Hedera account ID format (0.0.xxxxx), JWT secret length</li>
            <li><strong>Production Warnings:</strong> Warns about DEBUG logging, testnet usage in production</li>
            <li><strong>Default Values:</strong> Sets sensible defaults for optional variables</li>
          </ul>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Structured Logging</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Production Logging</h3>
            <p className="mt-2 text-gray-700">
              In production, logs are structured as JSON for easy parsing by log aggregation tools (Datadog, CloudWatch, etc.):
            </p>
            <CodeBlock
              code={`{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "INFO",
  "message": "MediPact Backend Server started",
  "port": 3002,
  "nodeEnv": "production",
  "hederaNetwork": "testnet"
}`}
              language="json"
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Log Levels</h3>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Level</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Usage</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Production</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">ERROR</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Critical errors, exceptions</td>
                    <td className="px-4 py-3 text-sm text-gray-600">✅ Always logged</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">WARN</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Warnings, deprecated usage</td>
                    <td className="px-4 py-3 text-sm text-gray-600">✅ Always logged</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">INFO</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Business events, startup info</td>
                    <td className="px-4 py-3 text-sm text-gray-600">✅ Default for production</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">DEBUG</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Detailed debugging information</td>
                    <td className="px-4 py-3 text-sm text-gray-600">❌ Disabled in production</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Specialized Logging</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li><strong>Security Events:</strong> Authentication failures, access violations, suspicious activity</li>
              <li><strong>Business Events:</strong> Dataset purchases, revenue distributions, withdrawals</li>
              <li><strong>Performance:</strong> Slow operations (&gt;1s) logged with duration and context</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Security Features</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Security Headers</h3>
            <p className="mt-2 text-gray-700">
              Production mode automatically enables security headers:
            </p>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Header</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Value</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Purpose</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">X-Content-Type-Options</td>
                    <td className="px-4 py-3 text-sm text-gray-600">nosniff</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Prevents MIME type sniffing</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">X-Frame-Options</td>
                    <td className="px-4 py-3 text-sm text-gray-600">DENY</td>
                    <td className="px-4 py-3 text-sm text-gray-600">Prevents clickjacking</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">X-XSS-Protection</td>
                    <td className="px-4 py-3 text-sm text-gray-600">1; mode=block</td>
                    <td className="px-4 py-3 text-sm text-gray-600">XSS protection</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Strict-Transport-Security</td>
                    <td className="px-4 py-3 text-sm text-gray-600">max-age=31536000</td>
                    <td className="px-4 py-3 text-gray-600">Forces HTTPS</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">Referrer-Policy</td>
                    <td className="px-4 py-3 text-sm text-gray-600">strict-origin-when-cross-origin</td>
                    <td className="px-4 py-3 text-gray-600">Controls referrer information</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Error Handling</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li><strong>Structured Error Logging:</strong> All errors logged with context (path, method, IP, status code)</li>
              <li><strong>No Stack Traces:</strong> Stack traces only shown in development mode</li>
              <li><strong>Graceful Shutdown:</strong> Handles SIGINT and SIGTERM for clean shutdowns</li>
              <li><strong>Uncaught Exceptions:</strong> Logged and trigger graceful shutdown</li>
              <li><strong>Unhandled Rejections:</strong> Logged with promise context</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">CORS Configuration</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">
            In production, CORS is restricted to specific frontend URLs for security:
          </p>
          <CodeBlock
            code={`# Production CORS (restricted)
Allowed Origins:
  - https://www.medipact.space
  - https://medipact.space
  - ${process.env.FRONTEND_URL} (if set)

# Development CORS (permissive)
Allowed Origins: * (all origins)`}
            language="text"
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Database Configuration</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">PostgreSQL (Production)</h3>
            <p className="mt-2 text-gray-700">
              Production deployments should use PostgreSQL for:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>Better concurrency and scalability</li>
              <li>Built-in encryption (pgcrypto)</li>
              <li>Row-level security (RLS)</li>
              <li>HIPAA compliance features</li>
              <li>Better performance at scale</li>
            </ul>
            <CodeBlock
              code={`# PostgreSQL Connection
DATABASE_URL="postgresql://user:password@host:port/database"

# SSL Configuration (production)
SSL: { rejectUnauthorized: false }`}
              language="env"
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">SQLite (Development)</h3>
            <p className="mt-2 text-gray-700">
              SQLite is used for local development. The system automatically detects the database type from the DATABASE_URL environment variable.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Background Jobs</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Automatic Withdrawal Job</h3>
            <p className="mt-2 text-gray-700">
              Runs periodically to process automatic withdrawals for users who have reached their threshold:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li><strong>Default Interval:</strong> 1440 minutes (24 hours / daily)</li>
              <li><strong>Configurable:</strong> Set via AUTOMATIC_WITHDRAWAL_INTERVAL_MINUTES</li>
              <li><strong>Disable:</strong> Set AUTOMATIC_WITHDRAWAL_ENABLED=false</li>
              <li><strong>Manual Trigger:</strong> Admin can trigger via API endpoint</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Expiration Cleanup Job</h3>
            <p className="mt-2 text-gray-700">
              Runs every 5 minutes to clean up expired temporary access records and consent records.
            </p>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Exchange Rate Update</h3>
            <p className="mt-2 text-gray-700">
              Exchange rates are cached and updated every 5 minutes from CoinGecko API. Initialized on server startup.
            </p>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Health Check Endpoint</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <CodeBlock
            code={`GET /health

Response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "service": "MediPact Backend API"
}`}
            language="json"
          />
          <p className="mt-4 text-gray-700">
            Use this endpoint for monitoring and load balancer health checks. Returns 200 OK when the server is running.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Production Checklist</h2>
        <div className="mt-4 rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6">
          <p className="text-sm text-gray-700">
            See <code className="bg-white px-1 rounded">backend/PRODUCTION_CHECKLIST.md</code> for a complete deployment checklist covering environment variables, security, monitoring, testing, and compliance.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Monitoring & Observability</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Log Aggregation</h3>
            <p className="mt-2 text-gray-700">
              Structured JSON logs can be easily integrated with:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>Datadog</li>
              <li>AWS CloudWatch</li>
              <li>Google Cloud Logging</li>
              <li>Elasticsearch / ELK Stack</li>
              <li>Any log aggregation service</li>
            </ul>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Metrics to Monitor</h3>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>API response times</li>
              <li>Error rates by endpoint</li>
              <li>Database connection pool usage</li>
              <li>Hedera transaction success rates</li>
              <li>Withdrawal processing times</li>
              <li>Exchange rate update frequency</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}

