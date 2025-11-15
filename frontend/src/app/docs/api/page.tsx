import CodeBlock from '@/components/docs/CodeBlock';
import MermaidDiagram from '@/components/docs/MermaidDiagram';

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
        <h2 className="text-2xl font-bold text-gray-900">Marketplace Endpoints</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Browse Datasets</h3>
            <CodeBlock
              code={`GET /api/marketplace/datasets
Query Parameters:
  ?country=Uganda
  &hospitalId=HOSP-001
  &limit=50
  &offset=0`}
              language="text"
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Query Datasets</h3>
            <CodeBlock
              code={`POST /api/marketplace/query
Content-Type: application/json

{
  "researcherId": "RES-001",
  "filters": {
    "country": "Uganda",
    "startDate": "2024-01-01",
    "endDate": "2024-12-31",
    "conditionCode": "E11.9",
    "gender": "male",
    "ageRange": "35-50"
  },
  "limit": 100,
  "preview": false
}`}
              language="json"
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Purchase Dataset</h3>
            <p className="mt-2 text-sm text-gray-600">
              Purchase flow with payment verification:
            </p>
            <CodeBlock
              code={`# Step 1: Initiate purchase (without transaction ID)
POST /api/marketplace/purchase
Content-Type: application/json

{
  "researcherId": "RES-001",
  "datasetId": "DS-ABC123",
  "amount": 100.00
}

# Response (202 Accepted):
{
  "paymentRequest": {
    "paymentRequestId": "PAY-123",
    "amountHBAR": 625.0,
    "amountUSD": 100.00,
    "recipientAccountId": "0.0.1234567",
    "memo": "MediPact Dataset Purchase",
    "instructions": "Send HBAR to the recipient account..."
  },
  "message": "Payment required",
  "nextStep": "Send HBAR and provide transaction ID"
}

# Step 2: Complete purchase with transaction ID
POST /api/marketplace/purchase
Content-Type: application/json

{
  "researcherId": "RES-001",
  "datasetId": "DS-ABC123",
  "amount": 100.00,
  "transactionId": "0.0.123@1234567890.123456789"
}

# Response (200 OK):
{
  "message": "Purchase successful",
  "purchaseId": "PURCHASE-123",
  "amountHBAR": 625.0,
  "amountUSD": 100.00,
  "transactionId": "0.0.123@1234567890.123456789",
  "verified": true,
  "revenueDistribution": {...},
  "accessGranted": true,
  "downloadUrl": "/api/marketplace/datasets/DS-ABC123/export"
}`}
              language="json"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Wallet & Payment Endpoints</h2>
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Get Wallet Balance</h3>
            <CodeBlock
              code={`# Patient wallet
GET /api/patient/:upi/wallet

# Hospital wallet
GET /api/hospital/:hospitalId/wallet

# Response:
{
  "balanceHBAR": 784.3750,
  "balanceUSD": 125.50,
  "hederaAccountId": "0.0.1234567",
  "evmAddress": "0x...",
  "paymentMethod": "bank",
  "bankName": "Bank of Uganda",
  "withdrawalThresholdUSD": 10.00,
  "autoWithdrawEnabled": true
}`}
              language="json"
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Initiate Withdrawal</h3>
            <CodeBlock
              code={`# Patient withdrawal
POST /api/patient/:upi/withdraw
Content-Type: application/json

{
  "amountUSD": 100.00
}

# Hospital withdrawal
POST /api/hospital/:hospitalId/withdraw
Content-Type: application/json

{
  "amountUSD": 500.00
}

# Response:
{
  "message": "Withdrawal initiated successfully",
  "withdrawal": {
    "id": 123,
    "amountHBAR": 625.0,
    "amountUSD": 100.00,
    "payment_method": "bank",
    "destination_account": "1234****5678",
    "status": "pending",
    "created_at": "2024-01-15T10:30:00Z"
  }
}`}
              language="json"
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Get Withdrawal History</h3>
            <CodeBlock
              code={`# Patient withdrawal history
GET /api/patient/:upi/withdrawal-history?limit=10&offset=0

# Hospital withdrawal history
GET /api/hospital/:hospitalId/withdrawal-history?limit=10&offset=0`}
              language="text"
            />
          </div>
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Update Payment Method</h3>
            <CodeBlock
              code={`# Patient payment method
PUT /api/patient/:upi/payment-method
Content-Type: application/json

{
  "paymentMethod": "bank",
  "bankName": "Bank of Uganda",
  "bankAccountNumber": "1234567890",
  "withdrawalThresholdUSD": 10.00,
  "autoWithdrawEnabled": true
}

# Hospital payment method
PUT /api/hospital/:hospitalId/payment-method
Content-Type: application/json

{
  "paymentMethod": "mobile_money",
  "mobileMoneyProvider": "MTN",
  "mobileMoneyNumber": "+256123456789",
  "withdrawalThresholdUSD": 100.00,
  "autoWithdrawEnabled": true
}`}
              language="json"
            />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-gray-900">Admin Endpoints</h2>
        <p className="mt-4 text-gray-700">
          Admin endpoints for managing hospital and researcher verifications, viewing documents, and
          system administration.
        </p>

        <div className="mt-6">
          <h3 className="text-xl font-semibold text-gray-900">Verification Workflow</h3>
          <MermaidDiagram
            chart={`sequenceDiagram
    participant H as Hospital/Researcher
    participant A as Admin
    participant S as System
    participant DB as Database
    
    H->>S: Register Account
    S->>DB: Store Registration
    H->>S: Submit Verification Documents<br/>(License, Certificate)
    S->>DB: Store Documents (Pending)
    S->>A: Notification: New Verification Request
    
    A->>S: GET /admin/hospitals
    S->>A: List with Status & Documents
    A->>S: GET /admin/hospitals/:id
    S->>A: Full Details + Documents
    A->>A: Review Documents<br/>(View PDF/URL)
    
    alt Approve
        A->>S: POST /admin/hospitals/:id/verify
        S->>DB: Update Status: Verified
        S->>H: Notification: Approved
        H->>S: Access Granted
    else Reject
        A->>S: POST /admin/hospitals/:id/reject<br/>(with reason)
        S->>DB: Update Status: Rejected
        S->>H: Notification: Rejected + Reason
        H->>S: Can Resubmit Documents
    end
    
    Note over A,DB: All actions logged<br/>for audit trail`}
          />
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Admin Authentication</h3>
            <p className="mt-2 text-sm text-gray-600">
              All admin endpoints require JWT authentication. Include the token in the Authorization
              header for all requests.
            </p>
            <CodeBlock
              code={`POST /api/admin/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin-password"
}

# Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "admin": {
    "id": "admin-001",
    "username": "admin"
  }
}`}
              language="json"
            />
            <p className="mt-2 text-sm text-gray-600">
              Use the token in subsequent requests: <code>Authorization: Bearer {token}</code>
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">List All Hospitals</h3>
            <p className="mt-2 text-sm text-gray-600">
              Retrieve all hospitals with their verification status and document submission status.
              Hospitals are categorized by verification status (pending/verified/rejected) and whether
              they have submitted documents.
            </p>
            <CodeBlock
              code={`GET /api/admin/hospitals
Authorization: Bearer {token}

# Response:
{
  "hospitals": [
    {
      "hospitalId": "HOSP-001",
      "name": "City Hospital",
      "country": "Uganda",
      "location": "Kampala",
      "contactEmail": "admin@cityhospital.com",
      "verificationStatus": "pending",
      "verificationDocuments": {
        "licenseNumber": "HOSP-12345",
        "registrationCertificate": "data:application/pdf;base64,..."
      },
      "registeredAt": "2024-01-15T10:30:00Z",
      "status": "active"
    }
  ]
}`}
              language="json"
            />
            <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="text-sm text-blue-900">
                <strong>Note:</strong> Hospitals without submitted documents will have{' '}
                <code>verificationDocuments: null</code>. Only hospitals with actual document content
                (license number, certificate, etc.) will have the documents object populated.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Get Hospital Details</h3>
            <p className="mt-2 text-sm text-gray-600">
              Retrieve detailed information about a specific hospital, including full verification
              documents. Documents can be base64-encoded PDFs/images (data URLs) or external URLs.
            </p>
            <CodeBlock
              code={`GET /api/admin/hospitals/:hospitalId
Authorization: Bearer {token}

# Response:
{
  "hospitalId": "HOSP-001",
  "name": "City Hospital",
  "country": "Uganda",
  "location": "Kampala",
  "contactEmail": "admin@cityhospital.com",
  "fhirEndpoint": "https://fhir.example.com/fhir",
  "registrationNumber": "HOSP-12345",
  "verificationStatus": "pending",
  "verificationDocuments": {
    "licenseNumber": "HOSP-12345",
    "registrationCertificate": "data:application/pdf;base64,JVBERi0yLjAK..."
  },
  "registeredAt": "2024-01-15T10:30:00Z",
  "status": "active",
  "paymentMethod": "bank",
  "bankName": "Bank of Uganda"
}`}
              language="json"
            />
            <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
              <p className="text-sm text-green-900">
                <strong>Document Formats:</strong> Registration certificates can be:
              </p>
              <ul className="mt-2 list-disc space-y-1 pl-6 text-sm text-green-800">
                <li>
                  <strong>Data URLs:</strong> <code>data:application/pdf;base64,...</code> (base64-encoded PDFs)
                </li>
                <li>
                  <strong>External URLs:</strong> <code>https://example.com/certificate.pdf</code> (publicly
                  accessible links)
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Approve Hospital Verification</h3>
            <p className="mt-2 text-sm text-gray-600">
              Approve a hospital's verification request. The hospital will be notified and gain full
              access to register patients and use all platform features.
            </p>
            <CodeBlock
              code={`POST /api/admin/hospitals/:hospitalId/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Optional approval message for internal notes"
}

# Response:
{
  "success": true,
  "hospital": {
    "hospitalId": "HOSP-001",
    "name": "City Hospital",
    "verificationStatus": "verified",
    "verifiedAt": "2024-01-16T14:30:00Z",
    "verifiedBy": "admin-001"
  }
}`}
              language="json"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Reject Hospital Verification</h3>
            <p className="mt-2 text-sm text-gray-600">
              Reject a hospital's verification request with a reason. The hospital will be notified and
              can resubmit documents after addressing the issues.
            </p>
            <CodeBlock
              code={`POST /api/admin/hospitals/:hospitalId/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Required: Reason for rejection (e.g., 'Invalid license number', 'Certificate expired')"
}

# Response:
{
  "success": true,
  "hospital": {
    "hospitalId": "HOSP-001",
    "name": "City Hospital",
    "verificationStatus": "rejected",
    "verifiedBy": "admin-001"
  }
}`}
              language="json"
            />
            <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
              <p className="text-sm text-yellow-900">
                <strong>Important:</strong> The rejection reason will be visible to the hospital and
                should be clear and constructive to help them address the issues.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">List All Researchers</h3>
            <p className="mt-2 text-sm text-gray-600">
              Retrieve all researchers with their verification status and document submission status.
            </p>
            <CodeBlock
              code={`GET /api/admin/researchers
Authorization: Bearer {token}

# Response:
{
  "researchers": [
    {
      "researcherId": "RES-001",
      "email": "researcher@university.edu",
      "organizationName": "University Research Lab",
      "contactName": "Dr. Jane Smith",
      "country": "Uganda",
      "verificationStatus": "pending",
      "verificationDocuments": {
        "organizationDocuments": "data:application/pdf;base64,..."
      },
      "registeredAt": "2024-01-15T10:30:00Z",
      "accessLevel": "basic"
    }
  ],
  "total": 10
}`}
              language="json"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Get Researcher Details</h3>
            <CodeBlock
              code={`GET /api/admin/researchers/:researcherId
Authorization: Bearer {token}

# Response includes full researcher information and verification documents`}
              language="text"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Approve Researcher Verification</h3>
            <CodeBlock
              code={`POST /api/admin/researchers/:researcherId/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "message": "Optional approval message"
}

# Response:
{
  "message": "Researcher verified successfully",
  "researcher": {
    "researcherId": "RES-001",
    "verificationStatus": "verified",
    "verifiedAt": "2024-01-16T14:30:00Z",
    "verifiedBy": "admin-001"
  }
}`}
              language="json"
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="text-lg font-semibold text-gray-900">Reject Researcher Verification</h3>
            <CodeBlock
              code={`POST /api/admin/researchers/:researcherId/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Required: Reason for rejection"
}

# Response:
{
  "message": "Researcher verification rejected",
  "researcher": {
    "researcherId": "RES-001",
    "verificationStatus": "rejected",
    "verifiedBy": "admin-001"
  }
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


