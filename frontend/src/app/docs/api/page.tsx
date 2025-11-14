import CodeBlock from '@/components/docs/CodeBlock';

export default function APIPage() {
  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-8">
        <h1 className="text-4xl font-bold text-gray-900">API Reference</h1>
        <p className="mt-4 text-lg text-gray-600">
          Complete REST API documentation for the MediPact backend.
        </p>
      </div>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Base URL</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <CodeBlock code="http://localhost:3002" language="text" />
          <p className="mt-4 text-gray-700">
            All API endpoints are prefixed with the base URL. For production, replace with your production API URL.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Interactive Documentation</h2>
        <div className="mt-4 rounded-lg border border-[#00A9CE] bg-[#E3F2FD] p-6">
          <h3 className="text-lg font-semibold text-[#00A9CE]">Swagger UI</h3>
          <p className="mt-2 text-gray-700">
            For interactive API documentation with request/response examples, visit:
          </p>
          <CodeBlock code="http://localhost:3002/api-docs" language="text" />
          <p className="mt-4 text-sm text-gray-600">
            The Swagger UI provides a complete interface to explore all endpoints, test requests, and view response schemas.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Authentication</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Hospital Authentication</h3>
          <p className="mt-2 text-gray-700">Hospitals authenticate using hospital_id and api_key:</p>
          <CodeBlock
            code={`POST /api/hospital/login
Content-Type: application/json

{
  "hospitalId": "HOSP-001",
  "apiKey": "your-api-key"
}`}
            language="json"
          />
        </div>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <h3 className="text-lg font-semibold text-gray-900">Researcher Authentication</h3>
          <p className="mt-2 text-gray-700">Researchers authenticate using researcher_id:</p>
          <CodeBlock
            code={`POST /api/researcher/login
Content-Type: application/json

{
  "researcherId": "RES-001"
}`}
            language="json"
          />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Patient Endpoints</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Register Patient</h3>
            <CodeBlock
              code={`POST /api/patient/register
Content-Type: application/json

{
  "name": "John Doe",
  "dateOfBirth": "1990-01-15",
  "gender": "male",
  "hospitalId": "HOSP-001"
}`}
              language="json"
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Get Patient by UPI</h3>
            <CodeBlock
              code={`GET /api/patient/:upi`}
              language="text"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Hospital Endpoints</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Register Hospital</h3>
            <CodeBlock
              code={`POST /api/hospital/register
Content-Type: application/json

{
  "name": "City Hospital",
  "email": "admin@cityhospital.com",
  "country": "Uganda"
}`}
              language="json"
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Submit Verification Documents</h3>
            <CodeBlock
              code={`POST /api/hospital/verification
Authorization: Bearer {api_key}
Content-Type: multipart/form-data

{
  "licenseDocument": File,
  "registrationCertificate": File,
  "additionalDocuments": File[]
}`}
              language="json"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Researcher Endpoints</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Register Researcher</h3>
            <CodeBlock
              code={`POST /api/researcher/register
Content-Type: application/json

{
  "email": "researcher@university.edu",
  "organizationName": "University Research Lab",
  "contactName": "Dr. Jane Smith",
  "country": "Uganda"
}`}
              language="json"
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Submit Verification Documents</h3>
            <CodeBlock
              code={`POST /api/researcher/:researcherId/verify
Content-Type: multipart/form-data

{
  "registrationNumber": "REG-12345",
  "organizationDocuments": File,
  "researchLicense": File,
  "additionalDocuments": File[]
}`}
              language="json"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Dataset Endpoints</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Query Datasets</h3>
            <CodeBlock
              code={`POST /api/datasets/query
Content-Type: application/json

{
  "country": "Uganda",
  "dateRange": {
    "start": "2024-01-01",
    "end": "2024-12-31"
  },
  "conditions": ["diabetes", "hypertension"],
  "demographics": {
    "ageRange": "35-50",
    "gender": "male"
  }
}`}
              language="json"
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Purchase Dataset</h3>
            <CodeBlock
              code={`POST /api/datasets/:datasetId/purchase
Authorization: Bearer {researcher_token}
Content-Type: application/json

{
  "paymentAmount": "100.00",
  "hederaAccountId": "0.0.123456"
}`}
              language="json"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Hedera Integration Endpoints</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Get HCS Messages</h3>
            <CodeBlock
              code={`GET /api/hedera/messages?topicId=0.0.123456&limit=100`}
              language="text"
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Get Transaction Details</h3>
            <CodeBlock
              code={`GET /api/hedera/transactions/:transactionId`}
              language="text"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Error Responses</h2>
        <div className="mt-4 rounded-lg border border-gray-200 bg-white p-6">
          <p className="text-gray-700">All error responses follow this format:</p>
          <CodeBlock
            code={`{
  "error": "Error message description",
  "code": "ERROR_CODE"
}`}
            language="json"
          />
          <div className="mt-4">
            <h4 className="font-semibold text-gray-900">Common Status Codes:</h4>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-gray-700">
              <li><code>400</code> - Bad Request</li>
              <li><code>401</code> - Unauthorized</li>
              <li><code>403</code> - Forbidden</li>
              <li><code>404</code> - Not Found</li>
              <li><code>500</code> - Internal Server Error</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}


