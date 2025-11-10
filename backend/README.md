# MediPact Backend API

Backend API for patient identity management and hospital registry. Enables patients to maintain a persistent identity across multiple hospitals and access their complete medical history.

## Features

- **Native Hedera Accounts**: Every patient, hospital, and researcher has a Hedera Account ID (0.0.xxxxx)
- **Unique Patient Identity (UPI)**: Deterministic hash-based patient identifiers
- **Hospital Registry**: Register and manage hospital accounts with Hedera accounts
- **Researcher Registry**: Register and verify researcher accounts
- **Hospital Linkage**: Link hospital-specific patient IDs to UPIs
- **Patient History**: Aggregate medical records from all linked hospitals
- **Cross-Hospital Access**: Patients can access records from all hospitals
- **Marketplace API**: Dataset browsing and purchase endpoints
- **Revenue Distribution**: Automated revenue splitting via Hedera smart contracts
- **Swagger UI**: Interactive API documentation at `/api-docs`
- **Secure Key Management**: Encrypted private key storage for Hedera accounts

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (create `.env` file):
```env
# Hedera Configuration (Required for account creation)
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"

# Encryption Key (Required - generate: openssl rand -hex 32)
ENCRYPTION_KEY="your-32-byte-hex-encryption-key"

# Server Configuration
PORT=3002
NODE_ENV=development

# Database (SQLite for dev, PostgreSQL for prod)
DATABASE_PATH="./data/medipact.db"

# JWT Configuration
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN="24h"
```

Get free Hedera testnet account at: https://portal.hedera.com/dashboard

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### API Documentation
- `GET /api-docs` - Interactive Swagger UI documentation

### Health Check
- `GET /health` - Server health status

### Patient Endpoints
- `POST /api/patient/register` - Register new patient
- `POST /api/patient/lookup` - Lookup patient UPI by contact info
- `POST /api/patient/match` - Match patient to existing UPI
- `GET /api/patient/:upi/history` - Get complete medical history
- `GET /api/patient/:upi/history/:hospitalId` - Get history from specific hospital
- `GET /api/patient/:upi/summary` - Get patient summary statistics
- `GET /api/patient/:upi/hospitals` - List connected hospitals
- `POST /api/patient/:upi/link-hospital` - Link hospital to patient
- `DELETE /api/patient/:upi/link-hospital/:hospitalId` - Remove hospital linkage

### Hospital Endpoints
- `POST /api/hospital/register` - Register new hospital
- `GET /api/hospital/:hospitalId` - Get hospital information
- `PUT /api/hospital/:hospitalId` - Update hospital information
- `POST /api/hospital/:hospitalId/verify` - Submit verification documents
- `GET /api/hospital/:hospitalId/verification-status` - Get verification status
- `POST /api/hospital/:hospitalId/patients` - Register patient at hospital
- `GET /api/hospital/:hospitalId/patients` - List hospital patients

### Researcher Endpoints
- `POST /api/researcher/register` - Register new researcher
- `GET /api/researcher/:researcherId` - Get researcher information
- `GET /api/researcher/email/:email` - Get researcher by email

### Marketplace Endpoints
- `GET /api/marketplace/datasets` - Browse available datasets
- `POST /api/marketplace/purchase` - Purchase dataset
- `GET /api/marketplace/researcher/:researcherId/status` - Get researcher marketplace status

### Revenue Endpoints
- `POST /api/revenue/distribute` - Distribute revenue from sale
- `POST /api/revenue/distribute-bulk` - Distribute revenue for multiple sales

### Admin Endpoints
- `POST /api/admin/auth/login` - Admin login
- `GET /api/admin/hospitals` - List all hospitals with verification status
- `GET /api/admin/hospitals/:hospitalId` - Get detailed hospital information
- `POST /api/admin/hospitals/:hospitalId/verify` - Approve hospital verification
- `POST /api/admin/hospitals/:hospitalId/reject` - Reject hospital verification
- `GET /api/admin/researchers` - List all researchers
- `POST /api/admin/researchers/:researcherId/verify` - Verify researcher
- `POST /api/admin/researchers/:researcherId/reject` - Reject researcher verification

## Usage Examples

### Register a Hospital

```bash
curl -X POST http://localhost:3002/api/hospital/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City General Hospital",
    "country": "Uganda",
    "location": "Kampala, Uganda",
    "fhirEndpoint": "https://fhir.cityhospital.com/fhir"
  }'
```

### Register a Patient

```bash
curl -X POST http://localhost:3002/api/patient/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "dateOfBirth": "1990-01-15",
    "phone": "+1234567890"
  }'
```

### Match Patient to UPI

```bash
curl -X POST http://localhost:3002/api/patient/match \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "dateOfBirth": "1990-01-15",
    "phone": "+1234567890"
  }'
```

### Link Hospital to Patient

```bash
curl -X POST http://localhost:3002/api/patient/UPI-ABC123DEF4567890/link-hospital \
  -H "Content-Type: application/json" \
  -H "X-Hospital-ID: HOSP-001234567890" \
  -H "X-API-Key: hospital-api-key" \
  -d '{
    "hospitalPatientId": "ID-12345",
    "verificationMethod": "patient_consent"
  }'
```

### Get Patient Medical History

```bash
curl http://localhost:3002/api/patient/UPI-ABC123DEF4567890/history \
  -H "Authorization: Bearer patient-token"
```

## Database Setup

### Current: SQLite (Development)

The backend currently uses **SQLite** for development convenience. The database file is automatically created at:
```
backend/data/medipact.db
```

**No setup required** - SQLite is file-based and works out of the box.

### Production: PostgreSQL (Future)

⚠️ **For production deployments**, we will migrate to **PostgreSQL** for:
- ✅ Better concurrency and scalability
- ✅ Built-in encryption (pgcrypto extension)
- ✅ Row-level security (RLS) for access control
- ✅ HIPAA compliance features
- ✅ Better performance at scale
- ✅ Advanced query capabilities

#### PostgreSQL Setup (When Ready)

```sql
-- Create database
CREATE DATABASE medipact;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Run schema from src/models/patient-identity-model.js
-- (See SQLSchema export in that file)
```

#### Migration Path

The code is designed to be database-agnostic. To migrate to PostgreSQL:

1. Update `src/db/database.js` to use `pg` (node-postgres) instead of `sqlite3`
2. Update connection string in `.env`: `DATABASE_URL=postgresql://user:pass@localhost/medipact`
3. Run the same schema (with PostgreSQL-specific syntax adjustments)
4. All CRUD operations in `src/db/*.js` will work with minimal changes

See `src/models/patient-identity-model.js` for the schema definition.

## Authentication

### Hospital Authentication
- **Method**: API Key authentication
- **Headers**: `X-Hospital-ID` and `X-API-Key`
- **Implementation**: `authenticateHospital` middleware in `src/routes/hospital-api.js`
- Hospitals receive API key upon registration

### Admin Authentication
- **Method**: JWT token authentication
- **Endpoint**: `POST /api/admin/auth/login`
- **Implementation**: `authenticateAdmin` middleware in `src/routes/admin-api.js`
- Admin accounts created via `npm run setup-admin`

### Patient Authentication
- **Method**: UPI-based (for API access)
- **Future**: JWT tokens or OAuth for web application
- Current implementation uses UPI in URL path for patient endpoints

## Integration with Adapter

The backend integrates with the MediPact adapter for UPI-based anonymization:

```javascript
import { anonymizeWithDemographics } from './anonymizer/demographic-anonymize.js';
import { getUPIForRecord, generateUPIBasedAnonymousPID } from './services/upi-integration.js';

const hospitalInfo = {
  country: "Uganda",
  hospitalId: "HOSP-001234567890"
};

const upiOptions = {
  enabled: true,
  getUPI: async (record) => {
    // Call backend API to get/create UPI
    const response = await fetch('http://localhost:3002/api/patient/match', {
      method: 'POST',
      body: JSON.stringify({
        name: record['Patient Name'],
        dateOfBirth: record['Date of Birth'],
        phone: record['Phone Number']
      })
    });
    const { upi } = await response.json();
    return upi;
  },
  generateUPIPID: (upi, hospitalId, index) => {
    return generateUPIBasedAnonymousPID(upi, hospitalId, index);
  }
};

const result = await anonymizeWithDemographics(records, hospitalInfo, upiOptions);
```

## Database

### Current: SQLite (Development)

The backend uses **SQLite** for development, which requires no setup. The database file is automatically created at `backend/data/medipact.db`.

### Future: PostgreSQL (Production)

For production, we will migrate to **PostgreSQL** for:
- Better concurrency and scalability
- Built-in encryption (pgcrypto)
- Row-level security (RLS)
- HIPAA compliance features

See `docs/DATABASE_MIGRATION.md` for complete migration guide.

## Development

### Project Structure

```
backend/
├── src/
│   ├── services/
│   │   ├── patient-identity-service.js      # UPI generation
│   │   ├── hospital-registry-service.js     # Hospital management
│   │   ├── hospital-linkage-service.js       # Hospital linkage
│   │   ├── patient-history-service.js        # History aggregation
│   │   ├── hospital-verification-service.js  # Hospital verification
│   │   ├── patient-lookup-service.js         # Patient lookup
│   │   └── bulk-patient-service.js          # Bulk registration
│   ├── routes/
│   │   ├── patient-api.js                    # Patient endpoints
│   │   ├── hospital-api.js                   # Hospital endpoints
│   │   ├── hospital-patients-api.js           # Hospital patient management
│   │   └── admin-api.js                      # Admin endpoints
│   ├── db/
│   │   ├── database.js                       # Database initialization
│   │   ├── patient-db.js                     # Patient CRUD
│   │   ├── hospital-db.js                    # Hospital CRUD
│   │   ├── linkage-db.js                     # Linkage CRUD
│   │   └── patient-contacts-db.js            # Contact CRUD
│   ├── models/
│   │   └── patient-identity-model.js          # Database schema
│   └── server.js                             # Express server
├── package.json
└── README.md
```

### Adding Database Implementation

The services use function callbacks for database operations. Implement these functions for your database:

```javascript
// Example: PostgreSQL implementation
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Implement UPI lookup
async function upiLookup(upi) {
  const result = await pool.query(
    'SELECT EXISTS(SELECT 1 FROM patient_identities WHERE upi = $1)',
    [upi]
  );
  return result.rows[0].exists;
}

// Use in service
const upi = await getOrCreateUPI(patientPII, upiLookup, upiCreate);
```

## Testing

```bash
# Run tests (when implemented)
npm test
```

## API Documentation

The backend includes comprehensive Swagger UI documentation:

1. Start the server: `npm start`
2. Navigate to: http://localhost:3002/api-docs
3. Browse all endpoints, test requests, and view schemas

See `SWAGGER_SETUP.md` for details on the Swagger integration.

## Documentation

- **API Documentation**: See `SWAGGER_SETUP.md` for Swagger UI setup
- **Patient Identity**: See `../docs/PATIENT_IDENTITY_MANAGEMENT.md` for complete documentation
- **Database Migration**: See `docs/DATABASE_MIGRATION.md` for PostgreSQL migration guide

## License

MIT

