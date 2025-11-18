# Flattened CSV Export Feature

## Overview

The flattened CSV export feature provides researchers with patient data in a familiar CSV format where **each row represents one complete patient record** with all their data denormalized. This maintains the original CSV structure with anonymized fields, making it easy for researchers to work with the data.

## Key Features

1. **One Row Per Patient**: Each patient is represented as a single row with all their data
2. **Anonymized Fields**: Sensitive data is anonymized while maintaining structure
3. **Count-Based Queries**: Request exact number of patients (e.g., "get me 100 diabetic patients")
4. **Original Structure Support**: Can preserve original CSV column structure if provided
5. **Complete Data**: All conditions, observations, and related data in one row

## Usage

### Export Dataset as Flattened CSV

```bash
POST /api/marketplace/datasets/{datasetId}/export
Content-Type: application/json

{
  "format": "csv-flattened",
  "researcherId": "RES-123",
  "limit": 100  // Optional: get exactly 100 patients
}
```

### Query and Export Flattened CSV

```bash
POST /api/marketplace/query
Content-Type: application/json

{
  "researcherId": "RES-123",
  "conditionCode": "E11",  // Diabetes
  "country": "Kenya",
  "limit": 100,  // Get exactly 100 diabetic patients
  "format": "csv-flattened"  // Request flattened CSV format
}
```

## CSV Structure

### Default Structure

When no original CSV schema is provided, the flattened CSV uses this structure:

```csv
anonymousPatientId,ageRange,gender,country,region,hospitalId,conditions,conditionCodes,diabetesStatus,diabetesCode,hypertensionStatus,hypertensionCode,latestHbA1c,latestHbA1cDate,latestGlucose,latestGlucoseDate,latestCholesterol,latestCholesterolDate,allObservations,observationCount
PAT-001,35-39,Male,Kenya,Nakuru,HOSP-123,Type 2 diabetes mellitus; Essential hypertension,E11; I10,Yes,E11,Yes,I10,7.2,2024-01-15,120,2024-01-15,180,2024-01-15,"[{""name"":""HbA1c"",""code"":""4548-4"",""value"":""7.2"",""unit"":""%"",""date"":""2024-01-15""}]",3
```

### Column Descriptions

- **anonymousPatientId**: Anonymized patient identifier
- **ageRange**: Age range (e.g., "35-39") instead of exact age
- **gender**: Patient gender
- **country**: Country code
- **region**: Region/location (anonymized)
- **hospitalId**: Hospital identifier
- **conditions**: All condition names, semicolon-separated
- **conditionCodes**: All ICD10 codes, semicolon-separated
- **diabetesStatus**: "Yes" or "No"
- **diabetesCode**: "E11" if diabetic, empty otherwise
- **hypertensionStatus**: "Yes" or "No"
- **hypertensionCode**: "I10" if hypertensive, empty otherwise
- **latestHbA1c**: Latest HbA1c test value
- **latestHbA1cDate**: Date of latest HbA1c test
- **latestGlucose**: Latest glucose test value
- **latestGlucoseDate**: Date of latest glucose test
- **latestCholesterol**: Latest cholesterol test value
- **latestCholesterolDate**: Date of latest cholesterol test
- **allObservations**: JSON string with all observations
- **observationCount**: Total number of observations

## Count-Based Queries

### Example: Get 100 Diabetic Patients

```bash
POST /api/marketplace/datasets/{datasetId}/export
{
  "format": "csv-flattened",
  "researcherId": "RES-123",
  "limit": 100
}
```

This will return exactly 100 rows, each representing one diabetic patient with all their data.

### Example: Get 50 Hypertensive Patients from Kenya

```bash
POST /api/marketplace/query
{
  "researcherId": "RES-123",
  "conditionCode": "I10",
  "country": "Kenya",
  "limit": 50,
  "format": "csv-flattened"
}
```

## Original CSV Structure Support

If a dataset was created from an original CSV file, you can preserve the original column structure:

```bash
POST /api/marketplace/datasets/{datasetId}/export
{
  "format": "csv-flattened",
  "researcherId": "RES-123",
  "csvSchema": {
    "columns": [
      "Patient ID",
      "Age",
      "Gender",
      "Country",
      "Diabetes Status",
      "HbA1c Value",
      "Glucose Value"
    ]
  }
}
```

The system will map the data to match the original column names.

## Benefits

1. **Familiar Format**: Researchers work with CSV files they're used to
2. **Easy Analysis**: One row = one patient makes analysis straightforward
3. **Complete Records**: All patient data in one place
4. **Flexible Queries**: Get exact number of patients needed
5. **Maintains Structure**: Original CSV structure can be preserved

## Implementation Details

- Data is denormalized at export time (not stored denormalized)
- Conditions and observations are aggregated per patient
- Latest lab values are automatically extracted
- All data is anonymized before export
- Supports large datasets (up to 100,000 records)

## Use Cases

1. **Research Studies**: "Get me 200 diabetic patients for my study"
2. **Data Analysis**: Export complete patient records for statistical analysis
3. **Machine Learning**: Prepare training datasets with complete patient features
4. **Reporting**: Generate reports with one row per patient
5. **Data Sharing**: Share anonymized datasets in familiar CSV format

## API Response

```json
{
  "format": "csv-flattened",
  "data": "anonymousPatientId,ageRange,gender,...\nPAT-001,35-39,Male,...",
  "recordCount": 100,
  "datasetId": "DS-123",
  "metadata": {
    "exportedAt": "2024-11-18T22:00:00Z",
    "filters": {
      "conditionCode": "E11",
      "limit": 100
    },
    "structure": "one-row-per-patient"
  }
}
```

## Notes

- The `limit` parameter ensures you get exactly the number of records requested
- If fewer records match the filters than requested, all matching records are returned
- All sensitive fields are anonymized (exact dates become ranges, names removed, etc.)
- The CSV is UTF-8 encoded and uses standard CSV escaping for special characters

