# Adapter-Backend Integration

This document describes how the MediPact adapter integrates with the backend for revenue distribution using Hedera Account IDs.

## Overview

The adapter processes hospital EHR data, anonymizes it, and submits proof hashes to Hedera Consensus Service (HCS). After processing, it can automatically distribute revenue to patients and hospitals using their Hedera Account IDs.

## Architecture

```
┌─────────────────┐
│  Adapter        │
│  (EHR Processing)│
└────────┬────────┘
         │
         │ 1. Process & Anonymize
         │ 2. Submit to HCS
         │ 3. Calculate Revenue
         │
         ▼
┌─────────────────┐
│  Revenue        │
│  Integration    │
│  Service        │
└────────┬────────┘
         │
         │ 4. Lookup Patient UPI
         │ 5. Call Backend API
         │
         ▼
┌─────────────────┐
│  Backend API    │
│  (Port 3002)    │
└────────┬────────┘
         │
         │ 6. Get Hedera Account IDs
         │ 7. Distribute Revenue
         │
         ▼
┌─────────────────┐
│  Hedera Network │
│  (HBAR Transfers)│
└─────────────────┘
```

## Setup

### 1. Environment Variables

Add these to your `.env` file in the adapter directory:

```env
# Hedera Configuration (Required)
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"

# Hospital Configuration (Required)
HOSPITAL_COUNTRY="Uganda"
HOSPITAL_LOCATION="Kampala, Uganda"  # Optional

# Backend Integration (Required for Revenue Distribution)
HOSPITAL_ID="HOSP-XXXXXXXX"  # Your hospital ID from backend
BACKEND_API_URL="http://localhost:3002"  # Backend API URL

# Smart Contract Addresses (Optional - Legacy)
CONSENT_MANAGER_ADDRESS="0x..."
REVENUE_SPLITTER_ADDRESS="0x..."
```

### 2. Install Dependencies

```bash
cd adapter
npm install
```

This will install `axios` for making HTTP requests to the backend.

## Revenue Distribution Flow

### Step 1: Data Processing

The adapter:
1. Reads raw EHR data from `data/raw_data.csv`
2. Anonymizes patient data (removes PII, preserves demographics)
3. Generates patient mapping (original ID → anonymous PID)
4. Submits proof hashes to Hedera HCS

### Step 2: Revenue Calculation

The adapter calculates revenue based on:
- Number of records processed
- Pricing per record (default: 0.01 HBAR per record)
- Revenue split: 60% patient, 25% hospital, 15% platform

### Step 3: UPI Lookup

For each patient, the adapter:
1. Checks if UPI is already in the mapping (if UPI-based anonymization was used)
2. If not, looks up UPI from backend using patient contact info:
   - Email
   - Phone number
   - National ID

### Step 4: Revenue Distribution

The adapter calls the backend API to distribute revenue:

```javascript
POST /api/revenue/distribute-bulk
{
  "sales": [
    {
      "patientUPI": "UPI-XXXXXXXX",
      "hospitalId": "HOSP-XXXXXXXX",
      "amount": 6000000  // tinybars
    },
    // ... more patients
  ]
}
```

The backend:
1. Retrieves Hedera Account IDs for patient and hospital
2. Calculates revenue split (60/25/15)
3. Executes HBAR transfers
3. Returns transaction IDs and results

## API Endpoints

### Backend Revenue API

#### `POST /api/revenue/distribute`

Distribute revenue for a single patient:

```javascript
{
  "patientUPI": "UPI-XXXXXXXX",
  "hospitalId": "HOSP-XXXXXXXX",
  "totalAmount": 10000000  // tinybars
}
```

Response:
```javascript
{
  "success": true,
  "distribution": {
    "transactionId": "0.0.xxxxx@1234567890.123456789",
    "transfers": {
      "patient": {
        "accountId": "0.0.xxxxx",
        "amount": 6000000
      },
      "hospital": {
        "accountId": "0.0.xxxxx",
        "amount": 2500000
      }
    }
  }
}
```

#### `POST /api/revenue/distribute-bulk`

Distribute revenue for multiple patients:

```javascript
{
  "sales": [
    {
      "patientUPI": "UPI-XXXXXXXX",
      "hospitalId": "HOSP-XXXXXXXX",
      "amount": 6000000
    }
  ]
}
```

Response:
```javascript
{
  "success": true,
  "total": 1,
  "successful": 1,
  "failed": 0,
  "results": [
    {
      "success": true,
      "patientUPI": "UPI-XXXXXXXX",
      "hospitalId": "HOSP-XXXXXXXX",
      "distribution": { /* ... */ }
    }
  ]
}
```

## Usage

### Running the Adapter

```bash
cd adapter
npm start
```

The adapter will:
1. Process and anonymize data
2. Submit to Hedera HCS
3. Calculate revenue
4. **Automatically distribute revenue** (if `HOSPITAL_ID` and `BACKEND_API_URL` are set)

### Output

When revenue distribution is successful, you'll see:

```
=== 7. EXECUTE REVENUE DISTRIBUTION ===
   ✓ Revenue distribution successful!
   ✓ Total patients: 5
   ✓ Successful: 5
   ✓ Failed: 0

   Transaction Details:
     Patient 1: 0.0.xxxxx@1234567890.123456789
       Patient: 6000000
       Hospital: 2500000
```

## Troubleshooting

### Revenue Distribution Skipped

**Issue**: "Revenue distribution skipped: Hospital ID not provided"

**Solution**: Set `HOSPITAL_ID` in `.env` file.

---

**Issue**: "Revenue distribution skipped: Backend API URL not configured"

**Solution**: Set `BACKEND_API_URL` in `.env` file. Default is `http://localhost:3002`.

---

**Issue**: "UPI not available for patient X. Skipping revenue distribution."

**Solution**: 
- Ensure patients are registered in the backend with contact info (email, phone, or national ID)
- The adapter will try to look up UPI using contact info from raw records
- If UPI lookup fails, revenue distribution for that patient is skipped

### Backend Connection Errors

**Issue**: "Error distributing bulk revenue: connect ECONNREFUSED"

**Solution**: 
- Ensure the backend server is running on port 3002
- Check that `BACKEND_API_URL` is correct
- Verify network connectivity

### Patient Not Found

**Issue**: "Patient with UPI UPI-XXXXXXXX not found"

**Solution**: 
- Ensure the patient is registered in the backend
- Verify the UPI is correct
- Check that the patient has a Hedera Account ID

## Revenue Split Details

The revenue is split as follows:

- **Patient Share**: 60% of total revenue
- **Hospital Share**: 25% of total revenue
- **Platform Share**: 15% of total revenue (retained by operator)

Example:
- Total Revenue: 10,000,000 tinybars (0.1 HBAR)
- Patient: 6,000,000 tinybars (0.06 HBAR)
- Hospital: 2,500,000 tinybars (0.025 HBAR)
- Platform: 1,500,000 tinybars (0.015 HBAR)

## Security Considerations

1. **UPI Lookup**: The adapter uses patient contact info to look up UPI. This requires the backend to have patients registered with contact information.

2. **API Authentication**: Currently, the revenue distribution API does not require authentication. In production, you should add API key authentication.

3. **Private Keys**: Hedera private keys are encrypted and stored in the backend database. The adapter never handles private keys directly.

4. **Network**: Ensure the backend API is only accessible from trusted networks in production.

## Future Enhancements

1. **Batch Processing**: Process large batches of patients more efficiently
2. **Retry Logic**: Automatic retry for failed distributions
3. **Webhook Notifications**: Notify patients and hospitals when revenue is distributed
4. **Analytics**: Track revenue distribution metrics
5. **Multi-Currency Support**: Support for other currencies alongside HBAR

