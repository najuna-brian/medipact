# MediPact End-to-End Testing Guide

## Overview
This guide helps you test the complete data flow from hospital upload to researcher viewing.

## Prerequisites

1. **Backend Server Running on Port 8080**
   ```bash
   cd backend
   npm start
   # Should show: Server running on port 8080
   ```

2. **Frontend Server Running** (optional, for UI testing)
   ```bash
   cd frontend
   npm run dev
   ```

3. **Database Tables Created**
   - Run FHIR migration to create all required tables:
   ```bash
   curl -X POST http://localhost:8080/api/admin/migrate/fhir
   ```

## Test Flow

### Step 1: Verify System Status
Run the automated test script:
```bash
./scripts/test-data-flow.sh
```

This will check:
- Backend connectivity
- Database tables
- Adapter endpoints
- Marketplace endpoints
- Query service

### Step 2: Create Test Hospital Account
```bash
# Register a hospital
curl -X POST http://localhost:8080/api/hospital/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "email": "hospital@test.com",
    "password": "test123",
    "country": "Uganda",
    "location": "Kampala"
  }'
```

Save the `hospitalId` and `apiKey` from the response.

### Step 3: Upload Test CSV
```bash
# Upload a CSV file
curl -X POST http://localhost:8080/api/hospital/upload-csv \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "X-Hospital-ID: YOUR_HOSPITAL_ID" \
  -F "file=@path/to/test-data.csv" \
  -F "hospitalCountry=Uganda" \
  -F "hospitalLocation=Kampala"
```

Expected response:
```json
{
  "recordsProcessed": 10,
  "consentProofs": 5,
  "dataProofs": 10,
  "consentTopicId": "0.0.xxxxx",
  "dataTopicId": "0.0.xxxxx",
  "revenue": { ... }
}
```

### Step 4: Verify Data Storage
```bash
# Check if data was stored (requires admin auth or direct DB access)
# Or check processing history:
curl http://localhost:8080/api/hospital/processing-history \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "X-Hospital-ID: YOUR_HOSPITAL_ID"
```

### Step 5: Create Test Researcher Account
```bash
# Register a researcher
curl -X POST http://localhost:8080/api/researcher/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "researcher@test.com",
    "password": "test123",
    "organizationName": "Test Research Org",
    "researchFocus": "Diabetes"
  }'
```

Save the `researcherId` from the response.

### Step 6: Query Data (Preview)
```bash
# Query data as researcher (preview mode)
curl -X POST http://localhost:8080/api/marketplace/query \
  -H "Content-Type: application/json" \
  -H "X-Researcher-ID: YOUR_RESEARCHER_ID" \
  -d '{
    "country": "Uganda",
    "preview": true
  }'
```

Expected response:
```json
{
  "count": 10,
  "results": null,
  "preview": true,
  "filters": { ... }
}
```

### Step 7: Query Data (Full)
```bash
# Query data as researcher (full mode - requires patient consent)
curl -X POST http://localhost:8080/api/marketplace/query \
  -H "Content-Type: application/json" \
  -H "X-Researcher-ID: YOUR_RESEARCHER_ID" \
  -d '{
    "country": "Uganda",
    "preview": false,
    "limit": 10
  }'
```

## Troubleshooting

### Backend Not Accessible
- Check if backend is running: `ps aux | grep "node.*server.js"`
- Check port: Backend should run on port 8080
- Check logs: Look for errors in backend console

### Adapter Processing Fails
- Check adapter directory exists: `backend/adapter/src/index.js`
- Check environment variables: `OPERATOR_ID`, `OPERATOR_KEY`, `HOSPITAL_COUNTRY`
- Check adapter logs in backend console

### Data Not Stored
- Verify FHIR tables exist: Run migration endpoint
- Check storage API logs for errors
- Verify hospital API key is correct

### Query Returns No Results
- Check if data was actually stored
- Verify patient preferences allow access
- Check query filters are correct
- Ensure researcher is verified (if required)

## Manual Database Checks

### SQLite
```bash
sqlite3 backend/data/medipact.db
.tables
SELECT COUNT(*) FROM fhir_patients;
SELECT COUNT(*) FROM fhir_conditions;
SELECT COUNT(*) FROM fhir_observations;
```

### PostgreSQL
```bash
psql $DATABASE_URL
\dt fhir_*
SELECT COUNT(*) FROM fhir_patients;
SELECT COUNT(*) FROM fhir_conditions;
SELECT COUNT(*) FROM fhir_observations;
```

## Expected Data Flow

1. **Hospital Upload** → CSV file uploaded
2. **Adapter Processing** → CSV converted to FHIR, anonymized
3. **HCS Submission** → Consent and data proofs submitted to Hedera
4. **Database Storage** → FHIR resources stored in database tables
5. **Researcher Query** → Researcher queries data with filters
6. **Consent Validation** → Patient preferences checked
7. **Results Returned** → Anonymized data returned to researcher

## Success Criteria

✅ Hospital can upload CSV
✅ Adapter processes CSV successfully
✅ Data stored in database (check table counts)
✅ HCS proofs submitted (check topic IDs in response)
✅ Researcher can query data (preview mode)
✅ Patient preferences enforced (full query mode)
✅ Results are anonymized (no PII in response)

