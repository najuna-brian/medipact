# Complete Data Flow Test

This test verifies the complete end-to-end data flow from hospital upload to researcher access.

## Test Flow

1. **Backend Connectivity** - Verifies backend is running
2. **Test Data Creation** - Creates a test CSV file with 10 patient records
3. **Hospital Setup** - Creates or uses existing hospital account
4. **CSV Upload** - Uploads CSV file and processes it through the adapter
5. **Researcher Setup** - Creates or uses existing researcher account
6. **Researcher Verification** - Verifies researcher (if admin token provided)
7. **Researcher Query** - Tests marketplace query API
8. **API Key Creation** - Creates API key for programmatic access
9. **API Access** - Tests REST API data access
10. **CSV Export** - Tests dataset export functionality

## Prerequisites

1. Backend server must be running:
   ```bash
   cd backend
   npm start
   ```

2. Database must be initialized with FHIR tables:
   ```bash
   # Run migration if needed
   curl -X POST http://localhost:8080/api/admin/migrate/fhir
   ```

3. (Optional) Environment variables for existing accounts:
   ```bash
   export HOSPITAL_ID=your_hospital_id
   export HOSPITAL_API_KEY=your_api_key
   export RESEARCHER_ID=your_researcher_id
   export ADMIN_TOKEN=your_admin_token  # For auto-verification
   ```

## Running the Test

### Option 1: Node.js Script (Recommended)

```bash
# Install dependencies if needed
cd backend
npm install form-data axios

# Run the test
cd ../scripts
node test-complete-data-flow.js
```

### Option 2: Bash Script

```bash
cd scripts
./test-complete-data-flow.sh
```

## Expected Output

The test will:
- ✓ Create test data (10 patient records)
- ✓ Upload and process CSV through adapter
- ✓ Store data in database
- ✓ Publish to Hedera (consent and data topics)
- ✓ Allow researcher to query data
- ✓ Enable API access via API key
- ✓ Export data as CSV

## Troubleshooting

### Backend Not Running
```
Error: Backend is not accessible
```
**Solution**: Start the backend server: `cd backend && npm start`

### Hospital/Researcher Creation Fails
```
Note: Endpoint may require manual setup
```
**Solution**: Create accounts manually via frontend or API, then set environment variables

### No Data in Query Results
```
Found 0 records
```
**Solution**: 
- Ensure CSV upload was successful
- Check that data was stored in database
- Verify FHIR tables exist and have data
- Wait a few seconds after upload for processing

### API Key Access Denied
```
Status: 401 or 403
```
**Solution**: 
- Ensure researcher is verified
- Check API key is valid
- Verify researcher has access permissions

### CSV Export Requires Purchase
```
Dataset purchase may be required
```
**Solution**: 
- Purchase dataset first via marketplace
- Or test with a dataset that's already purchased

## Test Data

The test creates a CSV file with 10 patient records including:
- Patient demographics (age, gender, DOB, address)
- Lab tests (Blood Glucose, HbA1c, Cholesterol, etc.)
- Medical conditions (Diabetes, Hypertension, etc.)
- Test dates and results

All data is anonymized during processing.

## Verification Points

After successful test, verify:

1. **Database**: Check that records are in `fhir_patients`, `fhir_conditions`, `fhir_observations` tables
2. **Hedera**: Verify consent and data topics were created (check topic IDs in output)
3. **API**: Test API endpoints return data
4. **Export**: Verify CSV export contains anonymized data

## Manual Testing Steps

If automated test fails, you can test manually:

1. **Upload CSV**:
   ```bash
   curl -X POST http://localhost:8080/api/hospital/upload-csv \
     -H "X-API-Key: YOUR_API_KEY" \
     -F "file=@test_patients.csv" \
     -F "hospitalCountry=Uganda"
   ```

2. **Query Data**:
   ```bash
   curl -X POST http://localhost:8080/api/marketplace/query \
     -H "Content-Type: application/json" \
     -H "x-researcher-id: YOUR_RESEARCHER_ID" \
     -d '{"researcherId":"YOUR_RESEARCHER_ID","country":"Uganda","preview":true}'
   ```

3. **Access via API**:
   ```bash
   curl http://localhost:8080/api/researcher/patients?country=Uganda \
     -H "X-API-Key: YOUR_API_KEY"
   ```

4. **Export CSV**:
   ```bash
   curl -X POST http://localhost:8080/api/marketplace/datasets/DATASET_ID/export \
     -H "Content-Type: application/json" \
     -d '{"researcherId":"YOUR_RESEARCHER_ID","format":"csv"}' \
     -o exported_data.csv
   ```

