# Testing Hedera Account Integration

## Quick Test Guide

### Prerequisites

1. **Backend .env file** with Hedera credentials:
```env
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"
ENCRYPTION_KEY="your-32-byte-hex-key"  # Generate: openssl rand -hex 32
```

2. **Backend server running**:
```bash
cd backend
npm start
```

3. **Frontend server running**:
```bash
cd frontend
npm run dev
```

## Test 1: Patient Registration

### Via API
```bash
curl -X POST http://localhost:3002/api/patient/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "dateOfBirth": "1990-01-15",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'
```

### Expected Response
```json
{
  "upi": "UPI-23F009F1A1EC32A8",
  "hederaAccountId": "0.0.1234567",
  "message": "Patient registered successfully",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Verify
- ✅ `hederaAccountId` is present
- ✅ Account ID format: `0.0.xxxxx`
- ✅ Account exists on HashScan (testnet)

### Via Frontend
1. Go to `http://localhost:3001/patient/login`
2. Click "Register" tab
3. Fill in patient details
4. Submit registration
5. **Check**: Success message mentions Hedera account
6. **Check**: Dashboard shows Account ID with HashScan link

## Test 2: Hospital Registration

### Via API
```bash
curl -X POST http://localhost:3002/api/hospital/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City General Hospital",
    "country": "Uganda",
    "location": "Kampala, Uganda"
  }'
```

### Expected Response
```json
{
  "message": "Hospital registered successfully",
  "hospital": {
    "hospitalId": "HOSP-34D653A711D8",
    "hederaAccountId": "0.0.2345678",
    "name": "City General Hospital",
    "country": "Uganda",
    "apiKey": "..."
  }
}
```

### Verify
- ✅ `hederaAccountId` is present
- ✅ Account ID format: `0.0.xxxxx`
- ✅ Account exists on HashScan

### Via Frontend
1. Go to `http://localhost:3001/hospital/enrollment`
2. Fill in hospital details
3. Submit registration
4. **Check**: Account ID displayed
5. **Check**: Dashboard shows Account ID with HashScan link

## Test 3: Bulk Patient Registration

### Via API
```bash
curl -X POST http://localhost:3002/api/hospital/HOSP-XXX/patients/bulk \
  -H "Content-Type: application/json" \
  -H "X-Hospital-ID: HOSP-XXX" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "format": "json",
    "data": [
      {
        "name": "Patient 1",
        "dateofbirth": "1990-01-15",
        "email": "patient1@example.com"
      },
      {
        "name": "Patient 2",
        "dateofbirth": "1991-02-20",
        "email": "patient2@example.com"
      }
    ]
  }'
```

### Expected Response
```json
{
  "message": "Bulk registration completed",
  "result": {
    "total": 2,
    "successful": 2,
    "failed": 0,
    "patients": [
      {
        "upi": "UPI-...",
        "hederaAccountId": "0.0.1234567",
        "hospitalPatientId": "PAT-1"
      },
      {
        "upi": "UPI-...",
        "hederaAccountId": "0.0.1234568",
        "hospitalPatientId": "PAT-2"
      }
    ]
  }
}
```

### Verify
- ✅ Each patient has `hederaAccountId`
- ✅ All Account IDs are unique
- ✅ Accounts exist on HashScan

## Test 4: Patient Summary

### Via API
```bash
curl -X GET http://localhost:3002/api/patient/UPI-XXX/summary \
  -H "Authorization: Bearer token"  # Or use UPI in query
```

### Expected Response
```json
{
  "upi": "UPI-23F009F1A1EC32A8",
  "hederaAccountId": "0.0.1234567",
  "totalRecords": 42,
  "hospitalCount": 3,
  "testTypes": { "Blood Test": 20, "X-Ray": 22 }
}
```

### Verify
- ✅ `hederaAccountId` is present
- ✅ Frontend dashboard displays it

## Test 5: Frontend Display

### Patient Dashboard
1. Login as patient
2. Go to `/patient/dashboard`
3. **Check**: Account ID displayed below UPI
4. **Check**: HashScan link is clickable
5. **Check**: Link opens HashScan in new tab

### Hospital Dashboard
1. Login as hospital
2. Go to `/hospital/dashboard`
3. **Check**: Account ID displayed in header
4. **Check**: HashScan link is clickable

### Hospital Enrollment
1. Register a new hospital
2. **Check**: Account ID displayed after registration
3. **Check**: HashScan link works

## Test 6: Database Verification

```bash
# Check patient accounts
sqlite3 backend/data/medipact.db "SELECT upi, hedera_account_id FROM patient_identities WHERE hedera_account_id IS NOT NULL LIMIT 5;"

# Check hospital accounts
sqlite3 backend/data/medipact.db "SELECT hospital_id, hedera_account_id FROM hospitals WHERE hedera_account_id IS NOT NULL LIMIT 5;"

# Verify encryption
sqlite3 backend/data/medipact.db "SELECT upi, encrypted_private_key FROM patient_identities WHERE encrypted_private_key IS NOT NULL LIMIT 1;"
```

### Expected
- ✅ Account IDs stored in database
- ✅ Private keys encrypted (not plaintext)
- ✅ Account IDs are unique

## Test 7: Error Handling

### Test: Hedera Unavailable
1. Set invalid `OPERATOR_ID` in `.env`
2. Try to register a patient
3. **Check**: Registration continues without Account ID
4. **Check**: Error logged but not thrown
5. **Check**: User still gets UPI

### Test: Missing Encryption Key
1. Remove `ENCRYPTION_KEY` from `.env`
2. Try to register
3. **Check**: Warning logged
4. **Check**: Development key used (not for production)

## Automated Test Script

Run the test script:

```bash
cd backend
node scripts/test-hedera-accounts.js
```

This will:
- ✅ Create test patient account
- ✅ Create test hospital account
- ✅ Test encryption/decryption
- ✅ Validate Account ID format
- ✅ Verify all functions work

## Verification Checklist

### Backend ✅
- [x] Patient registration creates Hedera account
- [x] Hospital registration creates Hedera account
- [x] Bulk registration creates accounts
- [x] API responses include `hederaAccountId`
- [x] Database stores Account IDs
- [x] Private keys are encrypted
- [x] Error handling works

### Frontend ✅
- [x] Patient dashboard displays Account ID
- [x] Hospital dashboard displays Account ID
- [x] Hospital enrollment shows Account ID
- [x] HashScan links work
- [x] Component handles missing Account IDs

### Integration ✅
- [x] All services use Account IDs
- [x] TypeScript types updated
- [x] API responses consistent
- [x] Frontend displays correctly

## Troubleshooting

### Account Creation Fails
- **Check**: Hedera credentials in `.env`
- **Check**: Network connectivity
- **Check**: Operator account has HBAR (for mainnet)
- **Solution**: Registration continues without Account ID

### Account ID Not Displayed
- **Check**: Backend returned Account ID in response
- **Check**: Frontend component is imported
- **Check**: TypeScript types match
- **Solution**: Account can be created later

### HashScan Link Not Working
- **Check**: Network is correct (testnet/mainnet)
- **Check**: Account ID format is valid
- **Check**: HashScan URL is correct

