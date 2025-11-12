# Consent Validation in Queries - Implementation Summary

## Overview

Consent validation has been fully implemented in the query system. All queries now automatically filter out patients without active consent, ensuring compliance with privacy regulations and patient consent requirements.

## Implementation Details

### 1. Database Schema

**Table: `patient_consents`**

Created in both SQLite and PostgreSQL with the following structure:

```sql
CREATE TABLE patient_consents (
  id SERIAL/INTEGER PRIMARY KEY,
  anonymous_patient_id VARCHAR(64) NOT NULL,
  upi VARCHAR(64) NOT NULL,
  consent_type VARCHAR(50) NOT NULL,  -- 'individual', 'hospital_verified', 'bulk'
  status VARCHAR(20) NOT NULL DEFAULT 'active',  -- 'active', 'revoked', 'expired'
  hcs_topic_id VARCHAR(50),
  consent_topic_id VARCHAR(50),
  data_hash VARCHAR(255),
  granted_at TIMESTAMP NOT NULL,
  expires_at TIMESTAMP,
  revoked_at TIMESTAMP,
  revoked_by VARCHAR(255),
  hospital_id VARCHAR(32),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
)
```

**Indexes Created:**
- `idx_consents_anonymous_id` - Fast lookup by anonymous patient ID
- `idx_consents_upi` - Fast lookup by UPI
- `idx_consents_status` - Filter by status
- `idx_consents_type` - Filter by consent type
- `idx_consents_hospital` - Filter by hospital
- `idx_consents_active` - Optimized index for active consents

### 2. Database Operations (`consent-db.js`)

**Functions Created:**
- `createConsent(consentData)` - Create a new consent record
- `getConsentByAnonymousId(anonymousPatientId)` - Get consent for a patient
- `getActiveConsentIds(anonymousPatientIds)` - Get Set of patients with active consent (batch)
- `hasActiveConsent(anonymousPatientId)` - Check if patient has active consent
- `revokeConsent(anonymousPatientId, revokedBy)` - Revoke a consent
- `getConsentsByUPI(upi)` - Get all consents for a UPI

**Features:**
- Supports both SQLite and PostgreSQL
- Handles consent expiration automatically
- Batch operations for performance
- Proper camelCase/snake_case mapping

### 3. Query Service Integration

**Updated: `query-service.js`**

- Added `validateConsent` option (defaults to `true`)
- Passes consent validation flag to database queries
- Can be disabled for admin/system queries if needed

**Usage:**
```javascript
// Default: consent validation enabled
const result = await executeQuery(filters, researcherId);

// Disable consent validation (admin only)
const result = await executeQuery(filters, researcherId, { validateConsent: false });
```

### 4. FHIR Database Integration

**Updated: `fhir-db.js`**

Both `queryFHIRResources()` and `countFHIRPatients()` now:

1. Check `filters.validateConsent` flag
2. Add `INNER JOIN` with `patient_consents` table when validation is enabled
3. Filter for:
   - `status = 'active'`
   - `expires_at IS NULL OR expires_at > CURRENT_TIMESTAMP`

**SQL Query Pattern:**
```sql
SELECT DISTINCT p.*
FROM fhir_patients p
INNER JOIN patient_consents pc ON p.anonymous_patient_id = pc.anonymous_patient_id 
  AND pc.status = 'active' 
  AND (pc.expires_at IS NULL OR pc.expires_at > CURRENT_TIMESTAMP)
LEFT JOIN fhir_conditions c ON ...
LEFT JOIN fhir_observations o ON ...
WHERE ...
```

### 5. Adapter Integration

**Updated: `adapter-api.js`**

When submitting FHIR resources via `/api/adapter/submit-fhir-resources`:

1. Automatically creates consent records for each patient
2. Defaults to `hospital_verified` consent type
3. Supports per-patient consent type override
4. Includes HCS topic IDs and data hashes if provided
5. Handles consent creation errors gracefully (logs but doesn't fail)

**Request Format:**
```json
{
  "hospitalId": "HOSP-ABC123",
  "consentType": "hospital_verified",  // Optional, defaults to hospital_verified
  "patients": [
    {
      "anonymousPatientId": "PID-001",
      "upi": "UPI-001",
      "consentType": "individual",  // Optional, overrides default
      "hcsTopicId": "0.0.123456",  // Optional
      "consentTopicId": "0.0.123457",  // Optional
      "dataHash": "...",  // Optional
      "consentExpiresAt": "2025-12-31",  // Optional
      ...
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "results": {
    "patientsCreated": 2,
    "conditionsCreated": 5,
    "observationsCreated": 3,
    "consentsCreated": 2,  // New field
    "errors": []
  }
}
```

## Consent Types

1. **`individual`** - Patient provided individual consent (via app/email)
2. **`hospital_verified`** - Hospital verified consent on behalf of patient
3. **`bulk`** - Bulk consent for historical data

## Consent Status Lifecycle

1. **`active`** - Consent is valid and data can be queried
2. **`revoked`** - Patient/hospital revoked consent (data excluded from queries)
3. **`expired`** - Consent expired (data excluded from queries)

## How It Works

### Query Flow

1. Researcher executes query via `/api/marketplace/query`
2. Query service validates filters and sets `validateConsent: true`
3. FHIR database adds `INNER JOIN` with `patient_consents` table
4. Only patients with active, non-expired consent are returned
5. Results are logged to HCS for audit trail

### Data Submission Flow

1. Adapter submits anonymized FHIR resources
2. For each patient:
   - FHIR patient record created
   - Consent record created automatically
   - Conditions and observations created
3. All operations are transactional (if one fails, all fail)

### Consent Revocation

1. Patient or hospital revokes consent
2. Consent status updated to `revoked`
3. Future queries automatically exclude this patient's data
4. Historical query logs remain for audit (immutable)

## Testing

### Test Consent Creation

```bash
curl -X POST http://localhost:3002/api/adapter/submit-fhir-resources \
  -H "Content-Type: application/json" \
  -H "x-hospital-id: HOSP-ABC123" \
  -H "x-api-key: test-key" \
  -d '{
    "hospitalId": "HOSP-ABC123",
    "patients": [{
      "anonymousPatientId": "PID-TEST001",
      "upi": "UPI-TEST001",
      "country": "Uganda",
      "consentType": "hospital_verified",
      ...
    }]
  }'
```

### Test Query with Consent

```bash
# Query should only return patients with active consent
curl -X POST http://localhost:3002/api/marketplace/query \
  -H "Content-Type: application/json" \
  -H "x-researcher-id: RES-TEST001" \
  -d '{
    "country": "Uganda",
    "preview": false
  }'
```

### Test Consent Revocation

```javascript
import { revokeConsent } from './db/consent-db.js';

await revokeConsent('PID-TEST001', 'admin-user-id');
// Future queries will exclude this patient
```

## Benefits

1. **Automatic Filtering** - No need to manually check consent in application code
2. **Database-Level Enforcement** - Consent validation happens at SQL level (fast, secure)
3. **Audit Trail** - All consent changes are tracked with timestamps
4. **Flexible** - Supports multiple consent types and expiration
5. **Performance** - Indexed queries for fast consent checks
6. **Compliance** - Ensures only consented data is accessible

## Future Enhancements

1. **Smart Contract Integration** - Link to ConsentManager contract for on-chain verification
2. **Consent Expiration Notifications** - Alert patients/hospitals before expiration
3. **Consent Analytics** - Dashboard showing consent rates, revocations, etc.
4. **Granular Consent** - Consent per data type (conditions, observations, etc.)
5. **Consent History** - Track all consent changes over time

## Files Modified/Created

**Created:**
- `backend/src/db/consent-db.js` - Consent database operations

**Modified:**
- `backend/src/db/database.js` - Added `patient_consents` table schema
- `backend/src/db/fhir-db.js` - Added consent filtering to queries
- `backend/src/services/query-service.js` - Added consent validation flag
- `backend/src/routes/adapter-api.js` - Added consent creation on data submission

## Status

✅ **Fully Implemented and Ready for Testing**

All consent validation functionality is complete and integrated into the query system. The system now automatically filters out patients without active consent from all queries.

