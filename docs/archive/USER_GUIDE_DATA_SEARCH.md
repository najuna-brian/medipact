# User Guide: Searching and Accessing Patient Data

## Overview

This guide explains how to search for and access anonymized patient data using the Medipact platform. The platform uses a **flattened CSV format** where each row represents one complete patient record with all their data.

## Getting Started

### Step 1: Access the Query Page

1. Log in to your researcher account
2. Navigate to the **"Query Data"** page
3. You'll see the search interface with primary search criteria

### Step 2: Search for Data

The search interface has three primary fields (all optional):

#### 1. **Disease / Condition** (Optional)
- Type or search for a disease name (e.g., "Diabetes", "Hypertension")
- Or click one of the quick-select buttons:
  - Type 2 Diabetes Mellitus
  - Essential Hypertension
  - Disorders of Lipoprotein Metabolism
  - Gastro-esophageal Reflux Disease
  - Chronic Obstructive Pulmonary Disease

#### 2. **Country** (Optional)
- Select a country from the dropdown
- Leave empty to search all countries

#### 3. **Number of Patients** (Optional)
- Enter the exact number of patients you want (e.g., 100)
- Leave empty to get all matching patients

### Step 3: Optional Filters

You can also add:
- **Date Range**: Filter by start and end dates
- **Additional Filters**: Click "Show Additional Filters" for:
  - Age Range
  - Gender
  - Lab Test Codes
  - Hospital ID
  - And more...

### Step 4: Preview Your Data

1. Click **"Preview Data"** button
2. You'll see:
   - **Count**: How many patient records match your search
   - **Preview Table**: First 20 rows of data in flattened CSV format
   - Each row shows one complete patient record

### Step 5: Export Your Data

1. Review the preview to ensure it matches your needs
2. Click **"Export CSV"** button
3. The CSV file will download with all matching patient records

## Understanding the Data Format

### Flattened CSV Structure

Each row in the CSV represents **one complete patient record** with:

- **Patient Information**:
  - `anonymousPatientId`: Anonymized patient identifier
  - `ageRange`: Age range (e.g., "35-39")
  - `gender`: Patient gender
  - `country`: Country code
  - `region`: Region/location (anonymized)

- **Medical Conditions**:
  - `conditions`: All condition names, semicolon-separated
  - `conditionCodes`: All ICD10 codes, semicolon-separated
  - `diabetesStatus`: "Yes" or "No"
  - `hypertensionStatus`: "Yes" or "No"

- **Lab Results**:
  - `latestHbA1c`: Latest HbA1c test value
  - `latestHbA1cDate`: Date of latest HbA1c test
  - `latestGlucose`: Latest glucose test value
  - `latestGlucoseDate`: Date of latest glucose test
  - `latestCholesterol`: Latest cholesterol test value
  - `latestCholesterolDate`: Date of latest cholesterol test

- **All Observations**:
  - `allObservations`: JSON string with all observations
  - `observationCount`: Total number of observations

### Example Row

```csv
anonymousPatientId,ageRange,gender,country,conditions,diabetesStatus,latestHbA1c,latestHbA1cDate
PAT-001,35-39,Male,Kenya,"Type 2 diabetes mellitus; Essential hypertension",Yes,7.2,2024-01-15
```

## Common Use Cases

### Use Case 1: Get 100 Diabetic Patients

1. **Disease**: Type "Diabetes" or click "Type 2 Diabetes Mellitus"
2. **Number of Patients**: Enter "100"
3. Click **"Preview Data"**
4. Review the preview
5. Click **"Export CSV"**

Result: CSV file with exactly 100 rows, each representing one diabetic patient.

### Use Case 2: Get All Hypertensive Patients from Kenya

1. **Disease**: Click "Essential Hypertension"
2. **Country**: Select "Kenya"
3. **Number of Patients**: Leave empty (gets all matching)
4. Click **"Preview Data"**
5. Review and export

### Use Case 3: Get Patients with Specific Lab Test

1. Click **"Show Additional Filters"**
2. **Lab Test Code**: Enter "4548-4" (HbA1c)
3. Or **Lab Test Name**: Enter "HbA1c"
4. Add other filters as needed
5. Preview and export

### Use Case 4: Get Patients in Date Range

1. **Date Range**: 
   - Start Date: Select start date
   - End Date: Select end date
2. Add other filters as needed
3. Preview and export

## Tips for Effective Searching

1. **Start Broad, Then Narrow**: 
   - First search without filters to see what's available
   - Then add filters to narrow down

2. **Use Number of Patients**:
   - Specify exact number when you need a specific sample size
   - Leave empty to get all matching records

3. **Combine Filters**:
   - Combine disease + country + date range for precise results
   - All filters are optional - use only what you need

4. **Preview First**:
   - Always preview before exporting
   - Check the data structure matches your needs
   - Verify the count is what you expected

5. **Export Format**:
   - Data is always in flattened CSV format
   - One row = one complete patient record
   - Easy to import into Excel, R, Python, etc.

## Data Privacy and Security

- **All data is anonymized**: No personal identifiers
- **Verified on Hedera**: All queries are logged on Hedera HashScan
- **Patient consent**: Only data with proper consent is accessible
- **Secure access**: Only verified researchers can access data

## Troubleshooting

### No Results Found

- Try removing some filters
- Check if the disease name is spelled correctly
- Try searching without date range
- Check if you're searching in the right country

### Preview Shows Fewer Rows Than Expected

- Preview shows first 20 rows
- Export will include all matching records
- Check the count to see total available records

### Export Fails

- Make sure you're logged in
- Check your researcher account is verified
- Try again - sometimes network issues occur

## Need Help?

- Check the [Flattened CSV Export Documentation](./FLATTENED_CSV_EXPORT.md) for technical details
- Contact support if you encounter issues
- Review the [Dataset Generation Guide](./DATASET_GENERATION_AND_VIEWING.md) for more information

## Quick Reference

| Action | Steps |
|--------|-------|
| Search by disease | Enter disease name or click quick-select button |
| Filter by country | Select country from dropdown |
| Get specific number | Enter number in "Number of Patients" field |
| Add date range | Select start and end dates |
| Preview data | Click "Preview Data" button |
| Export CSV | Click "Export CSV" button |
| Clear filters | Click "Clear All" button |

---

**Remember**: All fields are optional. You can search with just a disease name, or combine multiple filters for precise results. The preview always shows you what you'll get before exporting.

