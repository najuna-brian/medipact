# Quick Start: Patient Identity Management

This guide helps you quickly set up and use the Patient Identity Management System.

## Overview

The Patient Identity Management System allows:
- ✅ Patients to maintain the same identity across multiple hospitals
- ✅ Access to complete medical history from all hospitals
- ✅ Prevention of duplicate patient records
- ✅ Easy hospital switching

## Quick Setup

### 1. Backend Setup

```bash
cd medipact/backend
npm install
```

Create `.env`:
```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/medipact
JWT_SECRET=your-secret-key
```

Start server:
```bash
npm start
```

### 2. Register a Hospital

```bash
curl -X POST http://localhost:3000/api/hospital/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City General Hospital",
    "country": "Uganda",
    "location": "Kampala, Uganda"
  }'
```

**Response:**
```json
{
  "hospital": {
    "hospitalId": "HOSP-001234567890",
    "name": "City General Hospital",
    ...
  }
}
```

Save the `hospitalId` for later use.

### 3. Register a Patient

When a patient visits the hospital:

```bash
curl -X POST http://localhost:3000/api/patient/match \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "dateOfBirth": "1990-01-15",
    "phone": "+1234567890"
  }'
```

**If patient exists:**
```json
{
  "upi": "UPI-ABC123DEF4567890",
  "exists": true
}
```

**If new patient:**
```json
{
  "exists": false
}
```

Register new patient:
```bash
curl -X POST http://localhost:3000/api/patient/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "dateOfBirth": "1990-01-15",
    "phone": "+1234567890"
  }'
```

### 4. Link Hospital to Patient

```bash
curl -X POST http://localhost:3000/api/patient/UPI-ABC123DEF4567890/link-hospital \
  -H "Content-Type: application/json" \
  -H "X-Hospital-ID: HOSP-001234567890" \
  -H "X-API-Key: hospital-api-key" \
  -d '{
    "hospitalPatientId": "ID-12345",
    "verificationMethod": "patient_consent"
  }'
```

### 5. Patient Visits Another Hospital

When the same patient visits a different hospital:

1. **Match patient** (same as step 3)
   - System finds existing UPI
   - Returns: `{ "upi": "UPI-ABC123DEF4567890", "exists": true }`

2. **Link new hospital** (same as step 4)
   - Use same UPI
   - Different `hospitalPatientId` and `hospitalId`

### 6. Access Complete Medical History

```bash
curl http://localhost:3000/api/patient/UPI-ABC123DEF4567890/history \
  -H "Authorization: Bearer patient-token"
```

**Response:**
```json
{
  "upi": "UPI-ABC123DEF4567890",
  "hospitals": [
    {
      "hospitalId": "HOSP-001",
      "hospitalName": "City General Hospital",
      "records": [...],
      "recordCount": 125
    },
    {
      "hospitalId": "HOSP-002",
      "hospitalName": "Regional Medical Center",
      "records": [...],
      "recordCount": 89
    }
  ],
  "totalRecords": 214,
  "dateRange": {
    "start": "2023-01-01T00:00:00Z",
    "end": "2024-01-20T14:20:00Z"
  }
}
```

## Integration with Adapter

### Enable UPI in Adapter

1. Set `HOSPITAL_ID` in adapter `.env`:
```env
HOSPITAL_ID=HOSP-001234567890
```

2. Update adapter code to use UPI:

```javascript
import { anonymizeWithDemographics } from './anonymizer/demographic-anonymize.js';
import { getUPIForRecord, generateUPIBasedAnonymousPID } from './services/upi-integration.js';
import { generateUPI } from '../../backend/src/services/patient-identity-service.js';

const hospitalInfo = {
  country: process.env.HOSPITAL_COUNTRY,
  hospitalId: process.env.HOSPITAL_ID
};

const upiOptions = {
  enabled: true,
  getUPI: async (record) => {
    // Generate UPI locally (or call backend API)
    return generateUPI({
      name: record['Patient Name'],
      dateOfBirth: record['Date of Birth'],
      phone: record['Phone Number']
    });
  },
  generateUPIPID: (upi, hospitalId, index) => {
    return generateUPIBasedAnonymousPID(upi, hospitalId, index);
  }
};

const result = await anonymizeWithDemographics(records, hospitalInfo, upiOptions);
// result.upiMapping contains Original ID -> UPI mappings
```

## Key Concepts

### UPI (Unique Patient Identity)

- **Format**: `UPI-XXXXXXXX` (e.g., `UPI-ABC123DEF4567890`)
- **Generated from**: Name + Date of Birth + Phone (hashed)
- **Properties**:
  - Deterministic (same patient = same UPI)
  - Privacy-preserving (hash, not reversible)
  - Persistent (doesn't change)

### Hospital ID

- **Format**: `HOSP-XXXXXXXX` (e.g., `HOSP-001234567890`)
- **Generated from**: Hospital name + Country (hashed)
- **Unique per hospital**

### Anonymous PID with UPI

- **Format**: `{UPI_HASH}-{HOSPITAL_ID}-{SESSION_PID}`
- **Example**: `ABC123DEF456-HOSP001-PID001`
- **Allows**: Cross-hospital linking while maintaining privacy

## Common Workflows

### Workflow 1: New Patient at Hospital A

1. Patient provides PII at Hospital A
2. Hospital calls `/api/patient/match` → Patient not found
3. Hospital calls `/api/patient/register` → Creates UPI
4. Hospital calls `/api/patient/:upi/link-hospital` → Links Hospital A
5. Hospital processes records with UPI-based anonymization

### Workflow 2: Existing Patient at Hospital B

1. Patient provides PII at Hospital B
2. Hospital calls `/api/patient/match` → Patient found (existing UPI)
3. Hospital calls `/api/patient/:upi/link-hospital` → Links Hospital B
4. Patient now has access to records from both hospitals

### Workflow 3: Patient Accesses History

1. Patient authenticates (mobile app or portal)
2. Patient calls `/api/patient/:upi/history`
3. System aggregates records from all linked hospitals
4. Patient sees complete medical history

## Next Steps

1. **Implement Database**: Choose your database (PostgreSQL, MongoDB, etc.) and implement the database layer
2. **Add Authentication**: Implement JWT tokens for patients and API keys for hospitals
3. **Integrate with Hospital Systems**: Connect to FHIR APIs or hospital databases
4. **Build Frontend**: Create patient portal and hospital dashboard
5. **Add Testing**: Write unit and integration tests

## Documentation

- **Full Documentation**: See `PATIENT_IDENTITY_MANAGEMENT.md`
- **API Reference**: See `../backend/README.md`
- **Adapter Integration**: See `../adapter/README.md`

## Support

For questions or issues, refer to the main documentation or create an issue in the repository.

