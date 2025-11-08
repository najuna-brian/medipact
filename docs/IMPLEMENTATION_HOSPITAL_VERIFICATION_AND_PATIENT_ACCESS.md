# Hospital Verification & Patient Access Implementation

## Overview

This document describes the implementation of:
1. Hospital verification workflow
2. Patient lookup and authentication
3. Bulk patient registration

## Database Changes

### Hospitals Table
Added verification fields:
- `verification_status`: 'pending' | 'verified' | 'rejected'
- `verification_documents`: JSON string of submitted documents
- `verified_at`: Timestamp of verification
- `verified_by`: Admin ID who verified

### Patient Contacts Table (NEW)
Stores patient contact information for lookup:
- `id`: Primary key
- `upi`: Foreign key to patient_identities
- `email`: Patient email (indexed)
- `phone`: Patient phone (indexed)
- `national_id`: National ID (indexed)
- `verified`: Boolean
- `created_at`, `updated_at`: Timestamps

## Backend Services

### 1. Hospital Verification Service
**File**: `backend/src/services/hospital-verification-service.js`

**Functions**:
- `submitVerificationDocuments()` - Submit documents for verification
- `verifyHospital()` - Admin approve hospital
- `rejectHospitalVerification()` - Admin reject hospital
- `getVerificationStatus()` - Get current verification status
- `isHospitalVerified()` - Check if hospital is verified

### 2. Patient Lookup Service
**File**: `backend/src/services/patient-lookup-service.js`

**Functions**:
- `lookupPatientUPI()` - Find UPI by email/phone/national ID
- `registerPatientWithContact()` - Register patient with contact info

### 3. Bulk Patient Service
**File**: `backend/src/services/bulk-patient-service.js`

**Functions**:
- `processBulkRegistration()` - Process CSV/JSON bulk registration
- `parseCSV()` - Parse CSV data
- `validatePatientRecord()` - Validate patient record
- `normalizePatientRecord()` - Normalize record fields

### 4. Patient Contacts Database
**File**: `backend/src/db/patient-contacts-db.js`

**Functions**:
- `upsertPatientContact()` - Create/update contact
- `getPatientContactByUPI()` - Get contact by UPI
- `findUPIByEmail()` - Find UPI by email
- `findUPIByPhone()` - Find UPI by phone
- `findUPIByNationalId()` - Find UPI by national ID
- `verifyPatientContact()` - Verify contact
- `deletePatientContact()` - Delete contact

## API Endpoints

### Hospital Verification

#### POST /api/hospital/:hospitalId/verify
Submit verification documents.

**Headers**:
- `X-Hospital-ID`: Hospital ID
- `X-API-Key`: Hospital API Key

**Body**:
```json
{
  "documents": {
    "licenseNumber": "LIC-12345",
    "registrationCertificate": "base64_or_url",
    "additionalDocuments": []
  }
}
```

**Response**:
```json
{
  "message": "Verification documents submitted successfully",
  "hospital": { ... }
}
```

#### GET /api/hospital/:hospitalId/verification-status
Get verification status.

**Headers**:
- `X-Hospital-ID`: Hospital ID
- `X-API-Key`: Hospital API Key

**Response**:
```json
{
  "hospitalId": "HOSP-XXX",
  "verificationStatus": "pending",
  "verifiedAt": null,
  "verifiedBy": null,
  "verificationDocuments": { ... }
}
```

### Patient Lookup & Access

#### POST /api/patient/lookup
Lookup patient UPI by email, phone, or national ID.

**Body**:
```json
{
  "email": "patient@example.com",
  "phone": "+256700123456",
  "nationalId": "ID123456"
}
```

**Response**:
```json
{
  "upi": "UPI-XXXXXXXX",
  "found": true
}
```

#### POST /api/patient/retrieve-upi
Retrieve UPI via email/phone (sends UPI to patient).

**Body**:
```json
{
  "email": "patient@example.com"
}
```

**Response**:
```json
{
  "message": "UPI retrieved successfully",
  "upi": "UPI-XXXXXXXX",
  "sentVia": "email"
}
```

#### POST /api/patient/register
Register patient with contact information.

**Body**:
```json
{
  "name": "John Doe",
  "dateOfBirth": "1990-01-01",
  "phone": "+256700123456",
  "nationalId": "ID123456",
  "email": "patient@example.com"
}
```

**Response**:
```json
{
  "upi": "UPI-XXXXXXXX",
  "message": "Patient registered successfully",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Hospital Patient Management

#### POST /api/hospital/:hospitalId/patients
Register a single patient.

**Headers**:
- `X-Hospital-ID`: Hospital ID
- `X-API-Key`: Hospital API Key

**Body**:
```json
{
  "name": "John Doe",
  "dateOfBirth": "1990-01-01",
  "phone": "+256700123456",
  "nationalId": "ID123456",
  "email": "patient@example.com",
  "hospitalPatientId": "PAT-001"
}
```

**Response**:
```json
{
  "message": "Patient registered successfully",
  "upi": "UPI-XXXXXXXX",
  "hospitalPatientId": "PAT-001"
}
```

#### POST /api/hospital/:hospitalId/patients/bulk
Bulk register patients from CSV/JSON.

**Headers**:
- `X-Hospital-ID`: Hospital ID
- `X-API-Key`: Hospital API Key

**Body**:
```json
{
  "format": "csv",
  "data": "name,dateOfBirth,phone,email\nJohn Doe,1990-01-01,+256700123456,john@example.com\n..."
}
```

Or JSON:
```json
{
  "format": "json",
  "data": [
    {
      "name": "John Doe",
      "dateOfBirth": "1990-01-01",
      "phone": "+256700123456",
      "email": "john@example.com",
      "patientId": "PAT-001"
    }
  ]
}
```

**Response**:
```json
{
  "message": "Bulk registration completed",
  "result": {
    "total": 100,
    "successful": 95,
    "failed": 5,
    "errors": [...],
    "patients": [...]
  }
}
```

## Workflow

### Hospital Verification Flow

1. **Hospital Registration**
   - Hospital registers via `/api/hospital/register`
   - Receives Hospital ID and API Key
   - Status: `verification_status: 'pending'`

2. **Submit Verification Documents**
   - Hospital submits documents via `/api/hospital/:hospitalId/verify`
   - Documents stored in `verification_documents` field
   - Status remains `'pending'`

3. **Admin Verification** ✅ IMPLEMENTED
   - Admin reviews documents via `/admin/hospitals` page
   - Admin approves/rejects via admin API endpoints
   - Status updated to `'verified'` or `'rejected'`
   - Hospital dashboard automatically updates

4. **Access Control**
   - Unverified hospitals cannot register patients
   - Verified hospitals can register patients

### Patient Registration Flow

#### Option 1: Hospital Registers Patient
1. Hospital calls `/api/hospital/:hospitalId/patients`
2. System generates/retrieves UPI
3. Patient contact info stored
4. Hospital linkage created
5. Patient can later lookup UPI via email/phone/national ID

#### Option 2: Patient Self-Registration
1. Patient calls `/api/patient/register` with contact info
2. System generates UPI
3. Patient contact info stored
4. Patient can login using email/phone/national ID

#### Option 3: Bulk Registration
1. Hospital uploads CSV/JSON via `/api/hospital/:hospitalId/patients/bulk`
2. System processes all records
3. Creates UPIs, contacts, and linkages
4. Returns summary with successes and errors

### Patient Access Flow

1. **Patient Forgot UPI**
   - Patient calls `/api/patient/lookup` with email/phone/national ID
   - System returns UPI if found

2. **Patient Retrieves UPI**
   - Patient calls `/api/patient/retrieve-upi` with email/phone
   - System sends UPI via email/SMS (TODO: Implement email/SMS service)
   - Returns UPI in response (for now)

3. **Patient Login** (TODO: Implement JWT authentication)
   - Patient provides email/phone/national ID
   - System looks up UPI
   - System returns JWT token
   - Patient uses token for authenticated requests

## Security Considerations

1. **Hospital Verification**: Only verified hospitals can register patients
2. **API Key Security**: API keys are hashed in database
3. **Contact Verification**: Contact info can be marked as verified
4. **Rate Limiting**: Should be added to prevent abuse (TODO)
5. **Email/SMS Verification**: Should verify email/phone before allowing lookup (TODO)

## Admin API Endpoints

### GET /api/admin/hospitals
List all hospitals with verification status.

**Response**:
```json
{
  "hospitals": [
    {
      "hospitalId": "HOSP-XXX",
      "name": "City General Hospital",
      "country": "Uganda",
      "verificationStatus": "pending",
      "verifiedAt": null,
      "verifiedBy": null,
      "verificationDocuments": { ... }
    }
  ]
}
```

### GET /api/admin/hospitals/:hospitalId
Get detailed hospital information including verification documents.

**Response**:
```json
{
  "hospitalId": "HOSP-XXX",
  "name": "City General Hospital",
  "verificationStatus": "pending",
  "verificationDocuments": {
    "licenseNumber": "LIC-12345",
    "registrationCertificate": "base64_or_url"
  }
}
```

### POST /api/admin/hospitals/:hospitalId/verify
Approve hospital verification.

**Body**:
```json
{
  "adminId": "admin-user-id"
}
```

**Response**:
```json
{
  "success": true,
  "hospital": {
    "hospitalId": "HOSP-XXX",
    "verificationStatus": "verified",
    "verifiedAt": "2024-01-01T00:00:00.000Z",
    "verifiedBy": "admin-user-id"
  }
}
```

### POST /api/admin/hospitals/:hospitalId/reject
Reject hospital verification with reason.

**Body**:
```json
{
  "reason": "Invalid license number",
  "adminId": "admin-user-id"
}
```

**Response**:
```json
{
  "success": true,
  "hospital": {
    "hospitalId": "HOSP-XXX",
    "verificationStatus": "rejected",
    "verifiedBy": "admin-user-id"
  }
}
```

## Frontend Admin Interface

### Admin Hospitals Page (`/admin/hospitals`)

Features:
- **Statistics Dashboard**: Shows counts of pending/verified/rejected hospitals
- **Pending Verifications Section**: Highlights hospitals awaiting review
- **All Hospitals List**: Complete list with status badges
- **View Documents**: Modal to view license number and registration certificate
- **Approve/Reject Actions**: One-click approve or reject with reason dialog
- **Real-time Updates**: Status updates automatically after actions

## Next Steps

1. ✅ **Admin API**: Create admin endpoints for hospital verification - **COMPLETED**
2. **Email/SMS Service**: Integrate email/SMS for UPI retrieval
3. **JWT Authentication**: Implement patient JWT authentication
4. ✅ **Frontend Pages**: Create frontend for verification and patient login - **COMPLETED**
5. **EMR Integration**: Add EMR sync endpoints (OpenMRS, CHT, etc.)
6. **Rate Limiting**: Add rate limiting to prevent abuse
7. **Contact Verification**: Add email/phone verification workflow
8. **Admin Authentication**: Add proper admin authentication middleware

## Testing

### Test Hospital Verification
```bash
# 1. Register hospital
curl -X POST http://localhost:3002/api/hospital/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Hospital","country":"Uganda"}'

# 2. Submit verification documents
curl -X POST http://localhost:3002/api/hospital/HOSP-XXX/verify \
  -H "X-Hospital-ID: HOSP-XXX" \
  -H "X-API-Key: xxx" \
  -H "Content-Type: application/json" \
  -d '{"documents":{"licenseNumber":"LIC-123"}}'

# 3. Check verification status (hospital)
curl http://localhost:3002/api/hospital/HOSP-XXX/verification-status \
  -H "X-Hospital-ID: HOSP-XXX" \
  -H "X-API-Key: xxx"

# 4. Admin: List all hospitals
curl http://localhost:3002/api/admin/hospitals

# 5. Admin: Approve hospital
curl -X POST http://localhost:3002/api/admin/hospitals/HOSP-XXX/verify \
  -H "Content-Type: application/json" \
  -d '{"adminId":"admin"}'

# 6. Admin: Reject hospital
curl -X POST http://localhost:3002/api/admin/hospitals/HOSP-XXX/reject \
  -H "Content-Type: application/json" \
  -d '{"reason":"Invalid documents","adminId":"admin"}'
```

### Test Patient Lookup
```bash
# 1. Register patient with contact
curl -X POST http://localhost:3002/api/patient/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","dateOfBirth":"1990-01-01","email":"john@example.com"}'

# 2. Lookup by email
curl -X POST http://localhost:3002/api/patient/lookup \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com"}'
```

### Test Bulk Registration
```bash
curl -X POST http://localhost:3002/api/hospital/HOSP-XXX/patients/bulk \
  -H "X-Hospital-ID: HOSP-XXX" \
  -H "X-API-Key: xxx" \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "data": "name,dateOfBirth,email\nJohn Doe,1990-01-01,john@example.com"
  }'
```

