# Local Demo Setup Guide - MediPact Adapter

This guide helps you set up and run the MediPact CSV adapter for local demonstrations.

## Quick Start

1. **Run the setup script:**
   ```bash
   cd backend/adapter
   ./setup-local-demo.sh
   ```

2. **Verify your .env file has:**
   - `HOSPITAL_COUNTRY="Uganda"` (or your country)
   - `OPERATOR_ID="0.0.xxxxx"` (your Hedera account)
   - `OPERATOR_KEY="0x..."` (your Hedera private key)
   - `HEDERA_NETWORK="testnet"`

3. **Ensure CSV file exists:**
   ```bash
   ls -la data/raw_data.csv
   ```

4. **Run the adapter:**
   ```bash
   npm run start:legacy
   ```

## What You'll See

The adapter will:
1. ✅ Load hospital configuration
2. ✅ Initialize Hedera client
3. ✅ Create HCS topics (Consent and Data)
4. ✅ Read CSV file from `data/raw_data.csv`
5. ✅ Convert to FHIR R4 Bundle
6. ✅ Anonymize all PII
7. ✅ Generate consent proofs (one per patient)
8. ✅ Generate data proofs (one per patient)
9. ✅ Submit to Hedera HCS
10. ✅ Create anonymized CSV output

## Demo Flow

### Step 1: Show Raw Data
```bash
# Open raw_data.csv to show PII
cat data/raw_data.csv | head -5
```

**What to highlight:**
- Patient names (John Mukasa, Mary Nakato, etc.)
- Patient IDs (PAT-001, PAT-002)
- Phone numbers (+256700123456)
- Email addresses
- Addresses
- **Note:** Medical data (Lab Test, Result) will be preserved

### Step 2: Run the Adapter
```bash
cd backend/adapter
npm run start:legacy
```

**What to highlight in output:**
- "Read X records from data/raw_data.csv"
- "Created FHIR Bundle with Y resources"
- "Processed Z resources"
- "Consent proofs: X (one per patient)"
- "Data proofs: X (one per patient)"
- HashScan links (copy these!)

### Step 3: Show Anonymized Data
```bash
# Open anonymized_data.csv to show no PII
cat data/anonymized_data.csv | head -5
```

**What to highlight:**
- ❌ No Patient Name
- ❌ No Patient ID
- ❌ No Phone Number
- ❌ No Email
- ❌ No Address
- ✅ Anonymous PID (PID-001, PID-002)
- ✅ Medical data preserved (Lab Test, Result, Test Date)
- ✅ Generalized demographics (Age Range, Country)

### Step 4: Verify on Hedera
1. Copy a HashScan link from terminal output
2. Open in browser
3. Show transaction details on Hedera testnet
4. Verify timestamp and message hash

## Environment Variables

### Required
- `HOSPITAL_COUNTRY` - Hospital country (e.g., "Uganda")
- `OPERATOR_ID` - Hedera operator account ID
- `OPERATOR_KEY` - Hedera operator private key (ECDSA, HEX)
- `HEDERA_NETWORK` - Network ("testnet" for demo)

### Optional (for full functionality)
- `HOSPITAL_LOCATION` - Hospital location (e.g., "Kampala")
- `HOSPITAL_ID` - Hospital ID from backend registration
- `HOSPITAL_API_KEY` - Hospital API key
- `BACKEND_API_URL` - Backend API URL (e.g., "http://localhost:8080")
- `CONSENT_MANAGER_ADDRESS` - Smart contract address
- `REVENUE_SPLITTER_ADDRESS` - Smart contract address

## CSV File Format

The CSV file should have these columns (at minimum):
- `Patient ID` - Unique patient identifier
- `Patient Name` - Patient full name
- `Date of Birth` - Date of birth (YYYY-MM-DD)
- `Gender` - Male/Female
- `Phone Number` - Phone number
- `Email` - Email address
- `Address` - Patient address
- `Lab Test` - Laboratory test name
- `Test Date` - Test date (YYYY-MM-DD)
- `Result` - Test result value
- `Unit` - Result unit
- `Reference Range` - Normal range

See `data/raw_data.csv` for a complete example.

## Troubleshooting

### Error: "HOSPITAL_COUNTRY environment variable is required"
**Solution:** Add `HOSPITAL_COUNTRY="Uganda"` to `.env` file

### Error: "OPERATOR_ID, OPERATOR_KEY, HEDERA_NETWORK are required"
**Solution:** Add Hedera credentials to `.env` file. Get free testnet account at https://portal.hedera.com/dashboard

### Error: "Failed to read CSV file"
**Solution:** Ensure `data/raw_data.csv` exists and is readable

### Error: "connect ECONNREFUSED" (when using backend storage)
**Solution:** Start the backend server first, or remove `BACKEND_API_URL` from `.env` to skip storage

## Files Created

After running the adapter:
- `data/anonymized_data.csv` - Anonymized output (no PII)
- Terminal output with HashScan links

## Demo Checklist

Before demo:
- [ ] `.env` file configured with Hedera credentials
- [ ] `HOSPITAL_COUNTRY` set in `.env`
- [ ] `data/raw_data.csv` exists with sample data
- [ ] Dependencies installed (`npm install`)
- [ ] Test run successful (`npm run start:legacy`)

During demo:
- [ ] Show raw_data.csv with PII
- [ ] Run adapter (`npm run start:legacy`)
- [ ] Show anonymized_data.csv (no PII)
- [ ] Open HashScan link to verify Hedera transaction
- [ ] Explain anonymization process
- [ ] Highlight revenue split calculation

## Key Commands

```bash
# Setup
cd backend/adapter
./setup-local-demo.sh

# Run adapter
npm run start:legacy

# View raw data
cat data/raw_data.csv | head -10

# View anonymized data
cat data/anonymized_data.csv | head -10

# Check environment
cat .env | grep HOSPITAL_COUNTRY
```

## Notes for Judges

- The adapter processes CSV files locally (no API connections needed)
- All PII is removed during anonymization
- Medical data is preserved for research
- Each patient gets an anonymous ID (PID-001, PID-002, etc.)
- Proofs are submitted to Hedera Consensus Service (testnet)
- HashScan links provide verifiable proof on blockchain
- Revenue split is calculated (60% patient, 25% hospital, 15% platform)

## Support

For issues or questions:
1. Check `.env` file configuration
2. Verify CSV file format matches expected columns
3. Ensure Hedera credentials are valid
4. Check terminal output for specific error messages

