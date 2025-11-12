# MediPact Data Handling System Documentation

## Overview

The MediPact data handling system enables queryable, filterable access to anonymized medical datasets. It supports multi-dimensional filtering, dataset management, purchase flows, and export functionality, all with Hedera HCS audit logging for transparency.

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              MediPact Adapter                           │
│  (Anonymizes data, submits to HCS)                      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ POST /api/adapter/submit-fhir-resources
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Backend API                                 │
│  ┌──────────────────────────────────────────────────┐  │
│  │  FHIR Resource Storage                            │  │
│  │  - fhir_patients                                  │  │
│  │  - fhir_conditions                               │  │
│  │  - fhir_observations                              │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Dataset Management                               │  │
│  │  - datasets                                       │  │
│  │  - query_logs                                     │  │
│  │  - purchases                                      │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Query Engine                                     │  │
│  │  - Multi-dimensional filtering                    │  │
│  │  - Consent validation                             │  │
│  │  - HCS audit logging                              │  │
│  └──────────────────────────────────────────────────┘  │
└──────────────────┬──────────────────────────────────────┘
                   │
                   │ REST API
                   │
┌──────────────────▼──────────────────────────────────────┐
│              Frontend Application                        │
│  - Dataset Catalog                                      │
│  - Query Builder                                        │
│  - Purchase Flow                                        │
│  - Export Functionality                                 │
└─────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Data Collection (Adapter → Backend)

1. **Adapter processes hospital data**
   - Reads CSV or FHIR data
   - Anonymizes PII
   - Generates anonymous patient IDs (PID-001, etc.)

2. **Adapter submits to backend**
   - `POST /api/adapter/submit-fhir-resources`
   - Includes: patients, conditions, observations
   - Authenticated via hospital API key

3. **Backend stores FHIR resources**
   - Stores in `fhir_patients`, `fhir_conditions`, `fhir_observations` tables
   - Links to patient UPI and hospital ID
   - Indexes for fast querying

4. **Dataset creation**
   - `POST /api/adapter/create-dataset`
   - Creates dataset record with metadata
   - Links to HCS topics (consent, data proofs)
   - Logs dataset metadata to HCS

### 2. Data Querying (Researcher → Backend)

1. **Researcher builds query**
   - Filters: country, date range, condition, observation, demographics
   - Preview mode (count only) or full query

2. **Backend executes query**
   - Validates filters
   - Applies consent validation (if enabled)
   - Queries FHIR resources with filters
   - Logs query to HCS for audit trail

3. **Results returned**
   - Preview: count only
   - Full query: actual patient records (anonymized)

### 3. Data Purchase (Researcher → Backend)

1. **Researcher selects dataset**
   - Views dataset details and preview
   - Checks price and metadata

2. **Purchase request**
   - `POST /api/marketplace/purchase`
   - Validates researcher verification
   - Processes payment (HBAR)

3. **Revenue distribution**
   - 60% Patient, 25% Hospital, 15% Platform
   - Automated via Hedera smart contract
   - Transaction recorded on-chain

4. **Access granted**
   - Researcher can download dataset
   - Access logged in database

### 4. Data Export (Researcher → Backend)

1. **Export request**
   - `POST /api/marketplace/datasets/:id/export`
   - Format: FHIR, CSV, or JSON

2. **Data formatting**
   - FHIR: FHIR Bundle format
   - CSV: Tabular format
   - JSON: Structured JSON

3. **Download**
   - File download or JSON response
   - Includes metadata and verification links

## Database Schema

### FHIR Resources

#### `fhir_patients`
- Stores anonymized patient demographics
- Key fields: `anonymous_patient_id`, `upi`, `country`, `age_range`, `gender`
- Indexed for fast filtering

#### `fhir_conditions`
- Stores diagnoses and illnesses
- Key fields: `condition_code` (ICD-10), `condition_name`, `diagnosis_date`
- Links to patient via `anonymous_patient_id`

#### `fhir_observations`
- Stores lab results and measurements
- Key fields: `observation_code` (LOINC), `observation_name`, `value`, `effective_date`
- Links to patient via `anonymous_patient_id`

### Dataset Management

#### `datasets`
- Dataset metadata
- Key fields: `name`, `description`, `record_count`, `price`, `country`, `date_range`
- Links to HCS topics for verification

#### `query_logs`
- Audit trail of all queries
- Stores: `researcher_id`, `query_filters`, `result_count`, `hcs_message_id`
- Links to HCS for immutable audit log

#### `purchases`
- Purchase records
- Stores: `researcher_id`, `dataset_id`, `amount`, `hedera_transaction_id`
- Links to revenue distribution

## Query Filtering

### Supported Filters

| Filter | Type | Example | Description |
|--------|------|---------|-------------|
| `country` | string | "Uganda" | Filter by country |
| `startDate` | date | "2020-01-01" | Start of date range |
| `endDate` | date | "2024-12-31" | End of date range |
| `conditionCode` | string | "E11" | ICD-10 condition code |
| `conditionName` | string | "Diabetes" | Condition name (partial match) |
| `observationCode` | string | "4548-4" | LOINC observation code |
| `observationName` | string | "HbA1c" | Observation name (partial match) |
| `ageRange` | string | "35-39" | Age range |
| `gender` | string | "Male" | Gender filter |
| `hospitalId` | string | "HOSP-ABC123" | Specific hospital |

### Query Examples

**Example 1: Diabetes patients in Uganda**
```json
{
  "country": "Uganda",
  "conditionCode": "E11",
  "startDate": "2020-01-01",
  "endDate": "2024-12-31"
}
```

**Example 2: HbA1c lab results**
```json
{
  "observationCode": "4548-4",
  "observationName": "HbA1c",
  "country": "Uganda"
}
```

**Example 3: Demographics filter**
```json
{
  "country": "Uganda",
  "ageRange": "35-39",
  "gender": "Male"
}
```

## API Endpoints

### Adapter Endpoints

- `POST /api/adapter/submit-fhir-resources` - Submit anonymized FHIR resources
- `POST /api/adapter/create-dataset` - Create dataset from processed data

### Marketplace Endpoints

- `GET /api/marketplace/datasets` - Browse datasets
- `GET /api/marketplace/datasets/:id` - Get dataset details
- `POST /api/marketplace/query` - Execute query with filters
- `GET /api/marketplace/filter-options` - Get available filter options
- `POST /api/marketplace/purchase` - Purchase dataset
- `POST /api/marketplace/datasets/:id/export` - Export dataset

See `backend/SWAGGER_SETUP.md` for complete API documentation.

## Hedera Integration

### HCS Audit Logging

All queries and dataset operations are logged to Hedera Consensus Service:

1. **Query Logging**
   - Every query logged to HCS topic
   - Includes: researcher ID, filters, result count, timestamp
   - Immutable audit trail

2. **Dataset Logging**
   - Dataset metadata logged to HCS
   - Includes: dataset ID, country, record count, consent type
   - Links to consent and data proof topics

### HashScan Links

All HCS transactions include HashScan links for verification:
- Query audit logs: `https://hashscan.io/testnet/message/{topicId}@{timestamp}`
- Dataset metadata: Similar format

## Frontend Integration

### React Hooks

```typescript
// Browse datasets
const { data, isLoading } = useDatasets({ country: 'Uganda' });

// Get dataset details
const { data: dataset } = useDataset('DS-ABC123', true); // includePreview

// Execute query
const { data: queryResult } = useQueryData(
  { country: 'Uganda', conditionCode: 'E11' },
  researcherId
);

// Purchase dataset
const purchase = usePurchaseDataset();
purchase.mutate({ researcherId, datasetId, amount: 50 });

// Export dataset
const exportMutation = useExportDataset();
exportMutation.mutate({ datasetId, format: 'csv', researcherId });
```

### Components

- **DatasetCard**: Displays dataset in catalog
- **Dataset Detail Page**: Full dataset view with purchase/export
- **Catalog Page**: Browse and search datasets

## Security & Privacy

### Data Anonymization
- All PII removed before storage
- Anonymous patient IDs (PID-001, etc.)
- Age ranges instead of exact ages
- Country-level location only

### Consent Validation
- **Automatic filtering**: All queries automatically filter out patients without active consent
- **Database-level enforcement**: Consent validation happens at SQL level via `INNER JOIN`
- **Consent lifecycle**: Supports active, revoked, and expired statuses
- **Consent types**: Individual, hospital_verified, and bulk consent types
- **Automatic creation**: Consent records created automatically when data is submitted
- **Expiration handling**: Expired consents automatically excluded from queries
- **Revocation support**: Revoked consents immediately excluded from future queries
- See `CONSENT_VALIDATION_IMPLEMENTATION.md` for complete implementation details

### Access Control
- Hospital authentication required for data submission
- Researcher verification required for purchases
- Purchase records tracked for audit

## Performance Considerations

### Query Optimization
- Indexed columns for fast filtering
- Limit results to prevent large responses
- Preview mode for count-only queries

### Large Datasets
- Pagination support (limit parameter)
- Streaming exports for very large datasets
- Chunked downloads for CSV exports

### Database
- SQLite for development (fast, simple)
- PostgreSQL for production (scalable, concurrent)
- Indexes on all filterable columns

## Future Enhancements

1. **Advanced Filtering**
   - Boolean operators (AND/OR)
   - Range queries for numeric values
   - Full-text search

2. **Analytics Dashboard**
   - Query analytics
   - Dataset popularity metrics
   - Revenue analytics

3. **Real-time Updates**
   - WebSocket support for live data
   - Real-time query results
   - Live dataset updates

4. **Machine Learning Integration**
   - Dataset recommendations
   - Query suggestions
   - Anomaly detection

## Testing

See `backend/TESTING_GUIDE.md` for comprehensive testing instructions.

## Support

- API Documentation: http://localhost:3002/api-docs
- Backend README: `backend/README.md`
- Frontend README: `frontend/README.md`

