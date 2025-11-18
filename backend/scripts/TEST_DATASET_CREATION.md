# Test Dataset Creation on Hosted Environment

This guide explains how to test if dataset creation is working properly on the hosted API.

## Quick Test

Run the test script against your hosted API:

```bash
cd backend/scripts
API_URL=https://your-hosted-api-url.com node test-dataset-creation.js
```

Or set the environment variable:

```bash
export HOSTED_API_URL=https://your-hosted-api-url.com
cd backend/scripts
node test-dataset-creation.js
```

## What the Test Checks

1. **API Health** - Verifies the API is accessible
2. **Authentication** - Tests hospital authentication with API key
3. **Dataset Creation** - Creates a test dataset via `/api/adapter/create-dataset`
4. **Pricing Fields** - Verifies all pricing columns are present:
   - `priceUSD`
   - `pricePerRecordHBAR`
   - `pricePerRecordUSD`
   - `pricingCategoryId`
   - `pricingCategory`
   - `volumeDiscount`
5. **Dataset Retrieval** - Verifies the created dataset can be retrieved

## Common Issues and Solutions

### Missing Pricing Fields

If the test shows missing pricing fields, run the migration:

```bash
curl -X POST https://your-hosted-api-url.com/api/admin/migrate/pricing-fields \
  -H "Content-Type: application/json"
```

### Authentication Errors

- Verify `demo-credentials.json` has valid hospital credentials
- Check that hospitals are verified (`verificationStatus: 'verified'`)
- Ensure API keys are correct

### Database Schema Issues

If you see column errors, the database may need migration. Check:
- PostgreSQL tables have all required columns
- Column names match (camelCase vs snake_case)
- Pricing columns exist

## Manual Testing

You can also test manually using curl:

```bash
# Create a dataset
curl -X POST https://your-hosted-api-url.com/api/adapter/create-dataset \
  -H "Content-Type: application/json" \
  -H "X-Hospital-ID: YOUR_HOSPITAL_ID" \
  -H "X-API-Key: YOUR_API_KEY" \
  -d '{
    "name": "Test Dataset",
    "description": "Test dataset",
    "hospitalId": "YOUR_HOSPITAL_ID",
    "country": "US",
    "price": 10,
    "currency": "HBAR",
    "consentType": "hospital_verified",
    "filters": {
      "country": "US"
    }
  }'
```

## Expected Response

A successful dataset creation should return:

```json
{
  "success": true,
  "message": "Dataset created successfully",
  "dataset": {
    "id": "DS-...",
    "name": "...",
    "recordCount": 0,
    "price": 10,
    "priceUSD": 1.6,
    "pricePerRecordHBAR": 0.75,
    "pricePerRecordUSD": 0.12,
    "pricingCategoryId": "CAT-CONDITIONS",
    "pricingCategory": "Condition Data",
    "volumeDiscount": 0,
    "status": "active"
  }
}
```

## Notes

- The test creates a temporary dataset that can be cleaned up later
- Pricing is auto-calculated based on record count and category
- HCS logging failures are non-fatal (dataset creation continues)
- Exchange rate service must be working for USD prices

