# Demo Data Population Script

This script populates the MediPact database with comprehensive demo data for MVP presentations and testing.

## Features

- ✅ Creates multiple hospitals (verified)
- ✅ Creates multiple researchers (verified)
- ✅ Creates hundreds/thousands of patients
- ✅ Generates realistic FHIR data (conditions, observations)
- ✅ Creates datasets ready for purchase
- ✅ Saves all login credentials to `demo-credentials.json`
- ✅ Works via API calls (works locally and on hosted environments)

## Quick Start

### Basic Usage

```bash
# Make sure backend is running first
cd backend
npm start  # In another terminal

# Then run the script
npm run populate-demo
```

### Custom Configuration

```bash
# Set custom API URL (for hosted environments)
API_URL=https://your-api.com npm run populate-demo

# Create more patients per hospital
PATIENTS_PER_HOSPITAL=500 npm run populate-demo

# Create more hospitals
NUM_HOSPITALS=5 npm run populate-demo

# Create more researchers
NUM_RESEARCHERS=3 npm run populate-demo

# Combine options
API_URL=http://localhost:8080 PATIENTS_PER_HOSPITAL=300 NUM_HOSPITALS=4 npm run populate-demo
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `API_URL` | `http://localhost:8080` | Backend API URL |
| `PATIENTS_PER_HOSPITAL` | `200` | Number of patients per hospital |
| `NUM_HOSPITALS` | `3` | Number of hospitals to create |
| `NUM_RESEARCHERS` | `2` | Number of researchers to create |

## Output

The script creates a `demo-credentials.json` file in the `backend/` directory with:

- **Hospitals**: Hospital ID, API Key, Hedera Account ID
- **Researchers**: Researcher ID, Email, Hedera Account ID
- **Patients**: UPI, Email, Phone, Contact Info
- **Datasets**: Dataset IDs, Names, Prices
- **Summary**: Total counts of created entities

## Login Credentials

### Hospitals

Use the Hospital ID and API Key from `demo-credentials.json`:

```json
{
  "hospitalId": "HOSP-XXXXX",
  "apiKey": "your-api-key-here"
}
```

Login via:
- Frontend: `/hospital/login`
- API: Use headers `X-Hospital-ID` and `X-API-Key`

### Researchers

Use the Researcher ID from `demo-credentials.json`:

```json
{
  "researcherId": "RES-XXXXX",
  "email": "researcher1@demo.medipact.com"
}
```

Login via:
- Frontend: `/researcher/login` (use Researcher ID)
- API: Use header `X-Researcher-ID`

### Patients

Use the UPI, Email, or Phone from `demo-credentials.json`:

```json
{
  "upi": "UPI-DEMO000001",
  "email": "patient1-1@demo.medipact.com",
  "phone": "+256700000001"
}
```

Access via:
- Frontend: `/patient/login` (enter UPI)
- API: Use UPI in URL path `/api/patient/:upi/...`

## Generated Data

### Medical Conditions

The script generates realistic medical conditions including:
- Type 2 Diabetes (E11)
- Essential Hypertension (I10)
- Chronic Obstructive Pulmonary Disease (J44)
- Disorders of Lipoprotein Metabolism (E78)
- And more...

### Observations

The script generates laboratory observations including:
- HbA1c
- Blood Glucose
- Total Cholesterol
- HDL Cholesterol
- Triglycerides
- Hemoglobin
- Platelet Count

### Demographics

- **Countries**: Uganda, Kenya, Tanzania, Rwanda
- **Age Ranges**: 18-80 years (grouped into 5-year ranges)
- **Genders**: Male, Female, Other
- **Regions**: Multiple regions per country

## Example Usage for Demo

### Small Demo (Fast)
```bash
PATIENTS_PER_HOSPITAL=50 NUM_HOSPITALS=2 NUM_RESEARCHERS=1 npm run populate-demo
```

### Medium Demo (Recommended)
```bash
PATIENTS_PER_HOSPITAL=200 NUM_HOSPITALS=3 NUM_RESEARCHERS=2 npm run populate-demo
```

### Large Demo (Comprehensive)
```bash
PATIENTS_PER_HOSPITAL=500 NUM_HOSPITALS=5 NUM_RESEARCHERS=3 npm run populate-demo
```

## Troubleshooting

### Backend Not Running

Make sure the backend server is running:
```bash
cd backend
npm start
```

### API Connection Errors

Check that `API_URL` is correct:
```bash
# Test connection
curl http://localhost:8080/health
```

### Rate Limiting

If you encounter rate limiting, the script includes delays between requests. For very large datasets, you may need to increase delays in the script.

### Verification Errors

If hospital/researcher verification fails, you can manually verify them via:
- Admin dashboard: `/admin/hospitals` and `/admin/researchers`
- Or via API: `POST /api/admin/hospitals/:id/verify`

## Files Created

- `backend/demo-credentials.json` - All login credentials and summary

## Notes

- The script uses API calls, so it works on both local and hosted environments
- All users are automatically verified for demo purposes
- Patients are created with realistic demographics and medical data
- Datasets are automatically created and ready for purchase
- The script includes progress tracking and error handling

## Next Steps

After running the script:

1. **Check credentials**: Open `backend/demo-credentials.json`
2. **Test login**: Use credentials to login to frontend
3. **Browse data**: As a researcher, browse and query datasets
4. **Purchase data**: Test the purchase flow
5. **View wallets**: Check patient and hospital wallets

---

**For questions or issues**, check the main README or open an issue on GitHub.

