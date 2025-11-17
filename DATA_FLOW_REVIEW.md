# MediPact Data Flow Review

## Overview
This document reviews the complete data flow from hospital upload to researcher viewing, including all components and their interactions.

## Data Flow Architecture

### 1. Hospital Upload Phase

#### Frontend (Next.js)
- **Route**: `/api/adapter/process` (Next.js API route)
- **File**: `frontend/src/app/api/adapter/process/route.ts`
- **Process**:
  1. Receives CSV file via FormData
  2. Validates hospital country is provided
  3. Forwards request to backend API

#### Backend (Express.js)
- **Route**: `/api/hospital/upload-csv`
- **File**: `backend/src/routes/hospital-api.js` (lines 373-653)
- **Process**:
  1. Authenticates hospital via API key
  2. Validates CSV file (50MB limit, CSV only)
  3. Saves file to `backend/adapter/data/raw_data.csv`
  4. Prepares environment variables for adapter:
     - `HOSPITAL_COUNTRY` (required)
     - `HOSPITAL_LOCATION` (optional)
     - `HOSPITAL_ID`
     - `HOSPITAL_API_KEY`
     - `BACKEND_API_URL`
     - Hedera credentials (`OPERATOR_ID`, `OPERATOR_KEY`)
  5. Executes adapter script: `node backend/adapter/src/index.js`
  6. Parses adapter output for:
     - Records processed
     - Consent proofs count
     - Data proofs count
     - Topic IDs (consent & data)
  7. Saves processing history to database
  8. Returns results to frontend

### 2. Adapter Processing Phase

#### Adapter Main Script
- **File**: `backend/adapter/src/index.js`
- **Process**:
  1. **Load Configuration**: Reads hospital country/location from env
  2. **Initialize Hedera Client**: Creates HCS client
  3. **Setup HCS Topics**: Creates/initializes consent and data topics
  4. **Read CSV**: Parses `raw_data.csv`
  5. **Convert to FHIR**: Transforms CSV to FHIR R4 Bundle (all 10 domains)
  6. **Anonymize Data**: 
     - Removes PII (names, IDs, addresses, phone)
     - Generalizes demographics (age ranges, country only)
     - Generates anonymous patient IDs
     - Enforces K-anonymity (minimum 5 records per group)
  7. **Process Resources**: 
     - Creates storage-anonymized records (Stage 1)
     - Creates chain-anonymized records (Stage 2)
     - Generates provenance proofs linking both
  8. **Submit to HCS**:
     - Consent proofs (one per unique patient)
     - Data proofs (provenance records with double anonymization)
  9. **Store to Backend**:
     - Calls `storeFHIRResources()` from `adapter/src/storage/fhir-storage.js`
     - Groups resources by type (Patient, Condition, Observation, etc.)
     - Makes HTTP POST requests to `/api/adapter/store-fhir-*` endpoints
     - Stores each resource type in corresponding database table
  10. **Generate Anonymized CSV**: Creates `anonymized_data.csv` for legacy compatibility

#### Storage Service
- **File**: `backend/adapter/src/storage/fhir-storage.js`
- **Process**:
  1. Groups processed resources by resource type
  2. For each type, calls `storeResourceType()`
  3. Makes authenticated POST requests to backend storage endpoints
  4. Handles errors and returns summary (successful/failed counts)

### 3. Backend Storage Phase

#### Storage API
- **File**: `backend/src/routes/fhir-storage-api.js`
- **Endpoints**: 
  - `/api/adapter/store-fhir-patients`
  - `/api/adapter/store-fhir-conditions`
  - `/api/adapter/store-fhir-observations`
  - `/api/adapter/store-fhir-encounters`
  - ... (20+ resource types)
- **Process**:
  1. Authenticates adapter request (hospital ID + API key)
  2. Verifies API key matches hospital's stored hash
  3. Checks if database table exists
  4. Stores resources in corresponding table:
     - PostgreSQL: Uses camelCase column names (quoted)
     - SQLite: Uses camelCase column names (quoted)
  5. Handles conflicts (ON CONFLICT DO NOTHING for patients/encounters)
  6. Returns storage results (created count, errors)

#### Database Tables
- **Schema**: Defined in `backend/src/db/database.js`
- **Tables**:
  - `fhir_patients` - Patient demographics (anonymized)
  - `fhir_conditions` - Medical conditions/diagnoses
  - `fhir_observations` - Lab results, vital signs
  - `fhir_encounters` - Hospital visits
  - `fhir_medication_requests` - Prescribed medications
  - `fhir_procedures` - Medical procedures
  - `fhir_imaging_studies` - Imaging studies
  - `fhir_allergies` - Allergies
  - `fhir_coverage` - Insurance coverage
  - ... (20+ FHIR resource tables)

### 4. Researcher Query Phase

#### Marketplace API
- **Route**: `/api/marketplace/query`
- **File**: `backend/src/routes/marketplace-api.js` (lines 221-248)
- **Process**:
  1. Validates researcher ID
  2. Checks researcher exists
  3. Calls `executeQuery()` from query service
  4. Returns results (preview or full data)

#### Query Service
- **File**: `backend/src/services/query-service.js`
- **Process**:
  1. Validates and normalizes filters:
     - Country, date range
     - Condition codes/names
     - Observation codes/names
     - Demographics (age, gender)
     - Resource type
     - Medication, procedure, encounter filters
  2. Executes query:
     - **Preview mode**: Only returns count via `countFHIRPatients()`
     - **Full mode**: Returns actual data via `queryFHIRResources()`
  3. Filters by patient preferences:
     - Checks global opt-out
     - Checks researcher approval status
     - Checks blocked researchers
     - Validates consent
  4. Logs query to HCS for audit trail
  5. Stores query log in database
  6. Returns results with metadata

#### Database Query
- **File**: `backend/src/db/fhir-db.js`
- **Process**:
  1. Builds SQL query with filters
  2. Joins tables as needed (patients, conditions, observations)
  3. Applies WHERE clauses for filters
  4. Limits results
  5. Returns anonymized data

### 5. Researcher Purchase Phase

#### Purchase API
- **Route**: `/api/marketplace/purchase`
- **File**: `backend/src/routes/marketplace-api.js` (lines 414-620)
- **Process**:
  1. Validates purchase request
  2. Verifies HBAR payment
  3. Distributes revenue (60% patient, 25% hospital, 15% platform)
  4. Records data access history
  5. Grants researcher access to dataset
  6. Returns purchase confirmation

## Key Components

### Authentication Flow
1. **Hospital Upload**: API key authentication via `authenticateHospital` middleware
2. **Adapter Storage**: Hospital ID + API key verification via `authenticateAdapter` middleware
3. **Researcher Query**: Researcher ID validation

### Data Anonymization
- **Stage 1 (Storage)**: Less aggressive anonymization for database storage
- **Stage 2 (Chain)**: More aggressive anonymization for blockchain proofs
- **K-Anonymity**: Minimum 5 records per demographic group
- **PII Removal**: Names, IDs, addresses, phone numbers removed
- **Demographic Generalization**: Age ranges, country-only location

### Consent Management
- Consent proofs submitted to HCS (one per patient)
- ConsentManager smart contract records consent
- Patient preferences checked during queries
- Global opt-out, researcher approvals, blocked researchers

### Revenue Distribution
- 60% to patients
- 25% to hospital (original collector)
- 15% to platform
- Automated via RevenueSplitter smart contract

## Data Flow Diagram

```
Hospital CSV Upload
    ↓
Frontend API Route (/api/adapter/process)
    ↓
Backend API Route (/api/hospital/upload-csv)
    ↓
Save to adapter/data/raw_data.csv
    ↓
Execute Adapter Script (node adapter/src/index.js)
    ↓
┌─────────────────────────────────────┐
│ Adapter Processing:                 │
│ 1. Read CSV                         │
│ 2. Convert to FHIR Bundle           │
│ 3. Anonymize (Stage 1 & 2)         │
│ 4. Submit to HCS (consent & data)  │
│ 5. Store to Backend                 │
└─────────────────────────────────────┘
    ↓
Backend Storage API (/api/adapter/store-fhir-*)
    ↓
Database Tables (fhir_patients, fhir_conditions, etc.)
    ↓
┌─────────────────────────────────────┐
│ Researcher Access:                  │
│ 1. Query API (/api/marketplace/query)│
│ 2. Query Service (filters + consent)│
│ 3. Database Query (fhir-db.js)      │
│ 4. Return Results                   │
└─────────────────────────────────────┘
```

## Potential Issues & Recommendations

### Issues Found
1. **Adapter Output Parsing**: Relies on regex matching of stdout - fragile
2. **Error Handling**: Some errors might be swallowed in adapter execution
3. **Database Table Existence**: Tables must exist before storage (migration required)
4. **API Key Verification**: Critical for security - properly implemented

### Recommendations
1. **Structured Output**: Adapter should output JSON for easier parsing
2. **Better Error Propagation**: Ensure all errors are properly logged and returned
3. **Migration Check**: Verify FHIR tables exist before processing
4. **Testing**: End-to-end tests for complete flow

## Testing Checklist

- [ ] Hospital can upload CSV file
- [ ] Adapter processes CSV correctly
- [ ] Data is stored in database tables
- [ ] HCS proofs are submitted
- [ ] Researcher can query data (preview)
- [ ] Patient preferences are enforced
- [ ] Researcher can purchase dataset
- [ ] Revenue is distributed correctly

