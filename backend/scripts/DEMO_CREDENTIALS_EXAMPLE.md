# Demo Credentials Example

After running `npm run populate-demo`, you'll get a `demo-credentials.json` file. Here's what it looks like:

## Example Structure

```json
{
  "generatedAt": "2024-12-19T10:30:00.000Z",
  "apiUrl": "http://localhost:8080",
  "summary": {
    "hospitals": 3,
    "researchers": 2,
    "patients": 600,
    "datasets": 3,
    "fhirPatientsSubmitted": 600
  },
  "hospitals": [
    {
      "hospitalId": "HOSP-7CF97789B6F5",
      "name": "Kampala General Hospital",
      "country": "Uganda",
      "location": "Kampala, Uganda",
      "email": "hospital1@demo.medipact.com",
      "apiKey": "a1b2c3d4e5f6...",
      "hederaAccountId": "0.0.1234567",
      "loginInfo": {
        "hospitalId": "HOSP-7CF97789B6F5",
        "apiKey": "a1b2c3d4e5f6...",
        "note": "Use Hospital ID and API Key to login"
      }
    }
  ],
  "researchers": [
    {
      "researcherId": "RES-F0290B27E718",
      "email": "researcher1@demo.medipact.com",
      "organizationName": "Global Health Research Institute",
      "contactName": "Dr. Sarah Johnson",
      "country": "Uganda",
      "hederaAccountId": "0.0.2345678",
      "loginInfo": {
        "researcherId": "RES-F0290B27E718",
        "email": "researcher1@demo.medipact.com",
        "note": "Use Researcher ID to login (no password needed for MVP)"
      }
    }
  ],
  "patients": [
    {
      "upi": "UPI-DEMO000001",
      "patientId": "PID-H0-P0001",
      "name": "John Smith",
      "email": "patient1-1@demo.medipact.com",
      "phone": "+256700000001",
      "nationalId": "DEMO01000001",
      "age": 45,
      "ageRange": "45-49",
      "gender": "Male",
      "country": "Uganda",
      "region": "Kampala",
      "hospitalId": "HOSP-7CF97789B6F5",
      "hederaAccountId": "0.0.3456789",
      "loginInfo": {
        "upi": "UPI-DEMO000001",
        "email": "patient1-1@demo.medipact.com",
        "phone": "+256700000001",
        "note": "Use UPI, email, or phone to access patient portal"
      }
    }
  ],
  "datasets": [
    {
      "datasetId": "DS-ABC123DEF456",
      "name": "Diabetes Research Dataset",
      "description": "Comprehensive Uganda healthcare data...",
      "hospitalId": "HOSP-7CF97789B6F5",
      "hospitalName": "Kampala General Hospital",
      "recordCount": 200,
      "price": 24.0,
      "priceUSD": 3.84,
      "country": "Uganda"
    }
  ]
}
```

## Quick Login Guide

### Hospital Login

**Frontend:**
1. Go to `/hospital/login`
2. Enter Hospital ID: `HOSP-7CF97789B6F5`
3. Enter API Key: `a1b2c3d4e5f6...`

**API:**
```bash
curl -H "X-Hospital-ID: HOSP-7CF97789B6F5" \
     -H "X-API-Key: a1b2c3d4e5f6..." \
     http://localhost:8080/api/hospital/HOSP-7CF97789B6F5
```

### Researcher Login

**Frontend:**
1. Go to `/researcher/login`
2. Enter Researcher ID: `RES-F0290B27E718`
3. (No password needed for MVP)

**API:**
```bash
curl -H "X-Researcher-ID: RES-F0290B27E718" \
     http://localhost:8080/api/researcher/RES-F0290B27E718
```

### Patient Access

**Frontend:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-DEMO000001`
   OR Email: `patient1-1@demo.medipact.com`
   OR Phone: `+256700000001`

**API:**
```bash
curl http://localhost:8080/api/patient/UPI-DEMO000001/summary
```

## Sample Users for Demo

### Hospital 1 (Recommended for Demo)
- **Name**: First hospital in the list
- **Has**: Most patients, multiple datasets
- **Use for**: Uploading data, viewing revenue

### Researcher 1 (Recommended for Demo)
- **Name**: First researcher in the list
- **Status**: Verified
- **Use for**: Browsing datasets, making purchases

### Patient Sample
- **UPI**: `UPI-DEMO000001` (first patient)
- **Has**: Medical history, conditions, observations
- **Use for**: Viewing patient portal, checking earnings

## Tips for Demo

1. **Use the first hospital** - It has the most data
2. **Use the first researcher** - Already verified and ready
3. **Use multiple patients** - Show variety in demographics
4. **Check datasets** - All datasets are ready for purchase
5. **Test purchases** - Researchers can purchase datasets
6. **View wallets** - Check patient and hospital balances

---

**Note**: All credentials are saved in `backend/demo-credentials.json` after running the population script.

