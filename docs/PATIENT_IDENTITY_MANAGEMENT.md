# Patient Identity Management System

## Overview

The Patient Identity Management System enables patients to maintain a single, persistent identity across multiple hospitals. This allows patients to:

- **Switch hospitals** while maintaining the same identity
- **Access complete medical history** from all hospitals
- **Avoid duplicate records** across different hospitals
- **Control their data** and hospital linkages

## Architecture

### Components

1. **Unique Patient Identity (UPI)**
   - Deterministic hash-based identifier
   - Format: `UPI-XXXXXXXX` (e.g., `UPI-ABC123DEF4567890`)
   - Generated from stable patient identifiers (Name + DOB + Phone)

2. **Hospital Registry**
   - Each hospital gets a unique Hospital ID
   - Format: `HOSP-XXXXXXXX` (e.g., `HOSP-001234567890`)
   - Hospitals can register and manage their accounts

3. **Hospital Linkage**
   - Links hospital-specific patient IDs to UPI
   - Enables cross-hospital record aggregation
   - Stored off-chain (encrypted database)

4. **Patient History Service**
   - Aggregates medical records from all linked hospitals
   - Provides complete medical history access
   - Supports filtering by hospital or date range

## UPI Generation

### How UPI Works

UPI is generated deterministically from patient PII:

```javascript
const patientPII = {
  name: "John Doe",
  dateOfBirth: "1990-01-15",
  phone: "+1234567890",
  nationalId: "ID123456" // Optional
};

const upi = generateUPI(patientPII);
// Returns: UPI-ABC123DEF4567890
```

**Key Properties:**
- **Deterministic**: Same patient = same UPI (always)
- **Privacy-preserving**: Hash cannot be reversed to get PII
- **Cross-hospital**: Works across all hospitals
- **Stable**: UPI doesn't change over time

### UPI Generation Process

1. **Normalize identifiers**:
   - Name: lowercase, trim, remove special characters
   - DOB: Convert to YYYY-MM-DD format
   - Phone: Digits only
   - National ID: lowercase, trimmed

2. **Create identity string**:
   ```json
   {
     "name": "john doe",
     "dob": "1990-01-15",
     "phone": "1234567890",
     "nationalId": "id123456"
   }
   ```

3. **Generate SHA-256 hash**:
   - Hash the JSON string
   - Take first 16 characters
   - Format as `UPI-XXXXXXXX`

## Hospital Registration

### Registering a Hospital

```javascript
POST /api/hospital/register
Content-Type: application/json

{
  "name": "City General Hospital",
  "country": "Uganda",
  "location": "Kampala, Uganda",
  "fhirEndpoint": "https://fhir.cityhospital.com/fhir",
  "contactEmail": "admin@cityhospital.com"
}
```

**Response:**
```json
{
  "message": "Hospital registered successfully",
  "hospital": {
    "hospitalId": "HOSP-001234567890",
    "name": "City General Hospital",
    "country": "Uganda",
    "location": "Kampala, Uganda",
    "fhirEndpoint": "https://fhir.cityhospital.com/fhir",
    "contactEmail": "admin@cityhospital.com",
    "registeredAt": "2024-01-15T10:30:00Z",
    "status": "active"
  }
}
```

## Patient Registration & Linking

### Registering a New Patient

When a patient first visits a hospital:

1. **Hospital collects PII**:
   - Name, Date of Birth, Phone, etc.

2. **Generate or match UPI**:
   ```javascript
   POST /api/patient/match
   {
     "name": "John Doe",
     "dateOfBirth": "1990-01-15",
     "phone": "+1234567890"
   }
   ```

3. **If patient exists**:
   - Returns existing UPI
   - Link hospital to existing UPI

4. **If new patient**:
   - Generate new UPI
   - Create patient identity record

5. **Link hospital**:
   ```javascript
   POST /api/patient/:upi/link-hospital
   {
     "hospitalPatientId": "ID-12345",
     "verificationMethod": "patient_consent"
   }
   ```

### Patient Switching Hospitals

When patient visits a different hospital:

1. **Hospital collects PII** (same as registration)

2. **Match to existing UPI**:
   - System generates UPI hash
   - Finds existing UPI in database
   - Returns existing UPI (not new one)

3. **Link new hospital**:
   - Creates new hospital linkage
   - Patient now has access to records from both hospitals

## Anonymization with UPI

### UPI-Based Anonymous IDs

When UPI is enabled, anonymous IDs include UPI:

**Format**: `{UPI_HASH}-{HOSPITAL_ID}-{SESSION_PID}`

**Example**: `ABC123DEF456-HOSP001-PID001`

This allows:
- **Cross-hospital linking** (same UPI = same patient)
- **Privacy protection** (UPI is a hash, not PII)
- **Session tracking** (different sessions can have different PIDs)

### Integration with Adapter

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
    return await getUPIForRecord(record, {
      upiService: generateUPI,
      upiLookup: checkUPIExists,
      upiCreate: createUPI
    });
  },
  generateUPIPID: (upi, hospitalId, index) => {
    return generateUPIBasedAnonymousPID(upi, hospitalId, index);
  }
};

const result = await anonymizeWithDemographics(records, hospitalInfo, upiOptions);
// result.records: Anonymized records with UPI-based anonymous IDs
// result.patientMapping: Original ID -> Anonymous PID
// result.upiMapping: Original ID -> UPI
```

## Patient Access

### Get Complete Medical History

```javascript
GET /api/patient/:upi/history
Authorization: Bearer {patient_token}
```

**Response:**
```json
{
  "upi": "UPI-ABC123DEF4567890",
  "hospitals": [
    {
      "hospitalId": "HOSP-001",
      "hospitalName": "City General Hospital",
      "hospitalPatientId": "ID-12345",
      "records": [...],
      "recordCount": 125,
      "linkedAt": "2024-01-15T10:30:00Z"
    },
    {
      "hospitalId": "HOSP-002",
      "hospitalName": "Regional Medical Center",
      "hospitalPatientId": "ID-67890",
      "records": [...],
      "recordCount": 89,
      "linkedAt": "2024-01-20T14:20:00Z"
    }
  ],
  "records": [...], // All records aggregated
  "totalRecords": 214,
  "hospitalCount": 2,
  "dateRange": {
    "start": "2023-01-01T00:00:00Z",
    "end": "2024-01-20T14:20:00Z"
  }
}
```

### Get History from Specific Hospital

```javascript
GET /api/patient/:upi/history/:hospitalId
```

### Get Patient Summary

```javascript
GET /api/patient/:upi/summary
```

**Response:**
```json
{
  "upi": "UPI-ABC123DEF4567890",
  "totalRecords": 214,
  "hospitalCount": 2,
  "testTypes": {
    "Blood Test": 150,
    "X-Ray": 45,
    "MRI": 19
  },
  "dateRange": {
    "start": "2023-01-01T00:00:00Z",
    "end": "2024-01-20T14:20:00Z"
  },
  "hospitals": [
    {
      "hospitalId": "HOSP-001",
      "hospitalName": "City General Hospital",
      "recordCount": 125
    },
    {
      "hospitalId": "HOSP-002",
      "hospitalName": "Regional Medical Center",
      "recordCount": 89
    }
  ]
}
```

### List Connected Hospitals

```javascript
GET /api/patient/:upi/hospitals
```

## Privacy & Security

### Privacy Protection

1. **UPI is a hash**:
   - Cannot be reversed to get PII
   - Deterministic but not reversible

2. **Hospital linkages stored off-chain**:
   - Encrypted database (not on blockchain)
   - Only accessible to patient and authorized hospitals

3. **No PII on blockchain**:
   - Only anonymous IDs and hashes
   - Original patient IDs never stored on-chain

### Security Measures

1. **Authentication**:
   - Patients: Token-based authentication
   - Hospitals: API key authentication

2. **Authorization**:
   - Patients can only access their own data
   - Hospitals can only access their own patient records

3. **Encryption**:
   - Hospital linkages encrypted at rest
   - PII encrypted in database
   - API communication over HTTPS

## Database

### Current: SQLite (Development)

The system currently uses **SQLite** for development convenience. The database is file-based and requires no server setup.

⚠️ **Note**: For production, we will migrate to **PostgreSQL** for better scalability, built-in encryption, row-level security, and HIPAA compliance features.

See `backend/docs/DATABASE_MIGRATION.md` for migration details.

### Database Schema

#### SQLite (Current Development)

The following schema is used in SQLite:

### Patient Identities Table

```sql
CREATE TABLE patient_identities (
  upi VARCHAR(64) PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
);
```

### Hospital Linkages Table

```sql
CREATE TABLE hospital_linkages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upi VARCHAR(64) NOT NULL REFERENCES patient_identities(upi),
  hospital_id VARCHAR(32) NOT NULL,
  hospital_patient_id VARCHAR(128) NOT NULL,
  linked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified BOOLEAN NOT NULL DEFAULT false,
  verification_method VARCHAR(50) DEFAULT 'hospital_verification',
  encrypted_pii BYTEA,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  UNIQUE (upi, hospital_id)
);
```

### Hospitals Table

```sql
CREATE TABLE hospitals (
  hospital_id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  fhir_endpoint VARCHAR(512),
  contact_email VARCHAR(255),
  api_key_hash VARCHAR(255) NOT NULL,
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
);
```

#### PostgreSQL (Future Production)

The PostgreSQL schema will be similar but with additional features:
- UUID support via `uuid-ossp` extension
- Encryption via `pgcrypto` extension
- Row-level security (RLS) policies
- Better indexing and query optimization

See `backend/docs/DATABASE_MIGRATION.md` for complete PostgreSQL setup.

## API Reference

### Patient Endpoints

- `POST /api/patient/register` - Register new patient
- `POST /api/patient/match` - Match patient to existing UPI
- `GET /api/patient/:upi/history` - Get complete medical history
- `GET /api/patient/:upi/history/:hospitalId` - Get history from specific hospital
- `GET /api/patient/:upi/summary` - Get patient summary
- `GET /api/patient/:upi/hospitals` - List connected hospitals
- `POST /api/patient/:upi/link-hospital` - Link hospital to patient
- `DELETE /api/patient/:upi/link-hospital/:hospitalId` - Remove hospital linkage

### Hospital Endpoints

- `POST /api/hospital/register` - Register new hospital
- `GET /api/hospital/:hospitalId` - Get hospital information
- `PUT /api/hospital/:hospitalId` - Update hospital information

## Implementation Status

✅ **Completed:**
- UPI generation service
- Hospital registry service
- Hospital linkage service
- Patient history service
- API routes (patient and hospital)
- Database models/schema
- UPI integration with anonymization

🔄 **In Progress:**
- Database implementation (adapt to your database system)
- Authentication system (JWT tokens, API keys)
- Hospital record fetching (FHIR API integration)

📋 **Future Enhancements:**
- Patient mobile app integration
- Hospital portal integration
- Duplicate detection and merging
- Patient consent management
- Audit logging

## Usage Examples

### Example 1: Patient Registration at Hospital A

```javascript
// 1. Hospital collects patient PII
const patientPII = {
  name: "John Doe",
  dateOfBirth: "1990-01-15",
  phone: "+1234567890"
};

// 2. Check if patient exists
const matchResponse = await fetch('/api/patient/match', {
  method: 'POST',
  body: JSON.stringify(patientPII)
});

const { upi, exists } = await matchResponse.json();

// 3. If new patient, register
if (!exists) {
  await fetch('/api/patient/register', {
    method: 'POST',
    body: JSON.stringify(patientPII)
  });
}

// 4. Link hospital
await fetch(`/api/patient/${upi}/link-hospital`, {
  method: 'POST',
  headers: {
    'X-Hospital-ID': 'HOSP-001',
    'X-API-Key': 'hospital-api-key'
  },
  body: JSON.stringify({
    hospitalPatientId: 'ID-12345',
    verificationMethod: 'patient_consent'
  })
});
```

### Example 2: Patient Visits Hospital B

```javascript
// Same process, but system matches to existing UPI
// Patient now has access to records from both hospitals
```

### Example 3: Patient Accesses Medical History

```javascript
// Patient authenticates and requests history
const history = await fetch(`/api/patient/${upi}/history`, {
  headers: {
    'Authorization': `Bearer ${patientToken}`
  }
});

const data = await history.json();
// Returns complete medical history from all hospitals
```

## Benefits

1. **Persistent Identity**: Same patient = same UPI across all hospitals
2. **Complete History**: Access all medical records in one place
3. **No Duplicates**: UPI matching prevents duplicate patient records
4. **Privacy Protected**: UPI is a hash, linkages stored off-chain
5. **Patient Control**: Patients can view and manage their hospital linkages
6. **Easy Hospital Switching**: Simple process to add new hospitals
7. **Data Continuity**: Medical history preserved across hospital changes

