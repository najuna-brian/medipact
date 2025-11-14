# MediPact Backend Testing Guide

## Quick Test Commands

### 1. Test Health Endpoint
```bash
curl http://localhost:3002/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-XX...",
  "service": "MediPact Backend API"
}
```

### 2. Test Adapter → Backend Data Submission

#### Submit FHIR Resources
```bash
curl -X POST http://localhost:3002/api/adapter/submit-fhir-resources \
  -H "Content-Type: application/json" \
  -H "x-hospital-id: HOSP-ABC123" \
  -H "x-api-key: test-key" \
  -d '{
    "hospitalId": "HOSP-ABC123",
    "patients": [
      {
        "anonymousPatientId": "PID-001",
        "upi": "UPI-TEST001",
        "country": "Uganda",
        "region": "Kampala",
        "ageRange": "35-39",
        "gender": "Male",
        "conditions": [
          {
            "code": "E11",
            "name": "Diabetes Type 2",
            "date": "2024-01-15",
            "severity": "moderate",
            "status": "active"
          }
        ],
        "observations": [
          {
            "code": "4548-4",
            "name": "HbA1c",
            "value": "7.8",
            "unit": "%",
            "date": "2024-06-05",
            "referenceRange": "4.0-5.6%",
            "interpretation": "High"
          }
        ]
      }
    ]
  }'
```

#### Create Dataset from Processed Data
```bash
curl -X POST http://localhost:3002/api/adapter/create-dataset \
  -H "Content-Type: application/json" \
  -H "x-hospital-id: HOSP-ABC123" \
  -H "x-api-key: test-key" \
  -d '{
    "name": "Diabetes Research Dataset",
    "description": "Anonymized diabetes patient data from Uganda hospitals",
    "hospitalId": "HOSP-ABC123",
    "country": "Uganda",
    "price": 50,
    "currency": "HBAR",
    "consentType": "hospital_verified",
    "filters": {
      "country": "Uganda",
      "conditionCode": "E11"
    },
    "hcsTopicId": "0.0.123456",
    "consentTopicId": "0.0.123457",
    "dataTopicId": "0.0.123458"
  }'
```

### 3. Test Query Filtering

#### Get Filter Options
```bash
curl http://localhost:3002/api/marketplace/filter-options
```

#### Execute Query (Preview Mode)
```bash
curl -X POST http://localhost:3002/api/marketplace/query \
  -H "Content-Type: application/json" \
  -H "x-researcher-id: RES-TEST001" \
  -d '{
    "country": "Uganda",
    "startDate": "2020-01-01",
    "endDate": "2024-12-31",
    "conditionCode": "E11",
    "preview": true
  }'
```

#### Execute Full Query
```bash
curl -X POST http://localhost:3002/api/marketplace/query \
  -H "Content-Type: application/json" \
  -H "x-researcher-id: RES-TEST001" \
  -d '{
    "country": "Uganda",
    "conditionCode": "E11",
    "preview": false,
    "limit": 10
  }'
```

### 4. Test Dataset Browsing

#### Browse All Datasets
```bash
curl http://localhost:3002/api/marketplace/datasets
```

#### Browse by Country
```bash
curl "http://localhost:3002/api/marketplace/datasets?country=Uganda"
```

#### Get Dataset Details
```bash
curl "http://localhost:3002/api/marketplace/datasets/DS-ABC123?includePreview=true"
```

### 5. Test Purchase Flow

```bash
curl -X POST http://localhost:3002/api/marketplace/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "researcherId": "RES-TEST001",
    "datasetId": "DS-ABC123",
    "amount": 50,
    "patientUPI": "UPI-TEST001",
    "hospitalId": "HOSP-ABC123"
  }'
```

### 6. Test Export Functionality

```bash
curl -X POST http://localhost:3002/api/marketplace/datasets/DS-ABC123/export \
  -H "Content-Type: application/json" \
  -d '{
    "format": "csv",
    "researcherId": "RES-TEST001"
  }' \
  --output dataset.csv
```

## Test Data Setup

### Prerequisites
1. Backend server running on port 3002
2. Database initialized (SQLite or PostgreSQL)
3. Hospital registered and verified
4. Researcher registered and verified (for purchase tests)

### Sample Test Data

#### Register Hospital (if needed)
```bash
curl -X POST http://localhost:3002/api/hospital/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "country": "Uganda",
    "location": "Kampala",
    "contactEmail": "test@hospital.com"
  }'
```

#### Register Researcher (if needed)
```bash
curl -X POST http://localhost:3002/api/researcher/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "researcher@test.com",
    "organizationName": "Test Research Org",
    "contactName": "Test Researcher",
    "country": "Uganda"
  }'
```

## Expected Results

### Successful Responses
- **Health Check**: Returns `{"status": "healthy", ...}`
- **Submit Resources**: Returns `{"success": true, "results": {...}}`
- **Query**: Returns `{"count": N, "results": [...], ...}`
- **Browse Datasets**: Returns `{"datasets": [...], "count": N}`
- **Purchase**: Returns `{"message": "Purchase successful", ...}`

### Error Responses
- **401**: Missing or invalid authentication
- **404**: Resource not found
- **400**: Invalid request data
- **500**: Server error

## Troubleshooting

### Database Connection Issues
- Check `.env` file has correct database configuration
- Ensure database file exists (SQLite) or connection string is correct (PostgreSQL)
- Check database tables are created (run server once to auto-create)

### HCS Logging Issues
- Check `OPERATOR_ID` and `OPERATOR_KEY` in `.env`
- Verify `HCS_QUERY_AUDIT_TOPIC_ID` and `HCS_DATASET_METADATA_TOPIC_ID` are set (optional)
- HCS logging failures won't break the API - they're logged but don't block operations

### Authentication Issues
- Verify hospital is registered and verified
- Check API keys match
- Ensure researcher is registered

## Integration Testing Flow

1. **Setup**: Register hospital and researcher
2. **Data Submission**: Submit FHIR resources via adapter API
3. **Dataset Creation**: Create dataset from submitted data
4. **Query**: Test query filtering with various filters
5. **Browse**: Browse datasets in catalog
6. **Purchase**: Purchase a dataset
7. **Export**: Export purchased dataset in different formats

## Performance Testing

For large datasets:
- Test with 1000+ records
- Test query performance with multiple filters
- Test export performance for large datasets
- Monitor database query times

