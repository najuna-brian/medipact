# Local Setup Guide for Demo - MediPact

This guide helps judges and evaluators run the MediPact CSV adapter locally to verify the system works.

## ⚡ Quick Reference (For Judges)

**Just want to see it work? Run these commands:**

```bash
cd backend/adapter
./setup-local-demo.sh          # Setup (first time)
./verify-demo-ready.sh          # Verify
npm run start:legacy            # Run demo
```

**What you'll see:**
- CSV with PII → Anonymized CSV (no PII)
- 10 consent proofs + 10 data proofs on Hedera
- HashScan links for verification
- Smart contract revenue distribution

**Full guide below for detailed instructions.**

---

## 🎯 What You'll See

When you run the demo, you'll see:
- ✅ CSV data being read and processed
- ✅ Patient data anonymized (PII removed)
- ✅ FHIR resources created (medical data structured)
- ✅ Consent proofs submitted to Hedera HCS (10 proofs)
- ✅ Data proofs submitted to Hedera HCS (10 proofs)
- ✅ HashScan links for verification on Hedera testnet
- ✅ Smart contract revenue distribution (RevenueSplitter)

---

## 🚀 Quick Start (5 minutes)

### Step 1: Navigate to Adapter Directory

```bash
cd backend/adapter
```

### Step 2: Run Setup Script

```bash
./setup-local-demo.sh
```

This script will:
- Check if `.env` file exists
- Verify required environment variables
- Check if CSV data file exists
- Verify Node.js and dependencies

### Step 3: Verify Setup

```bash
./verify-demo-ready.sh
```

You should see:
```
✅ All checks passed! Demo is ready.
```

### Step 4: Run the Demo

```bash
npm run start:legacy
```

**Important:** Use `npm run start:legacy` (NOT `npm start`)
- `npm start` = API connector (for OpenMRS, FHIR servers)
- `npm run start:legacy` = CSV processor (for CSV files)

---

## 📋 Prerequisites

### Required
- **Node.js 20+** - Check with: `node -v`
- **npm** - Usually comes with Node.js
- **Hedera Testnet Account** - Get free account at https://portal.hedera.com/dashboard

### Environment Variables

The `.env` file in `backend/adapter/` should have:

```bash
# Required for Hedera
OPERATOR_ID="0.0.7156417"         # Your Hedera account ID
OPERATOR_KEY="0x519669071785c63d0938f89eacd4632332ec152eafcecacb984c8a89f72f85c7"             # Your Hedera private key (ECDSA, HEX)
HEDERA_NETWORK="testnet"         # Network (testnet for demo)

# Required for CSV processing
HOSPITAL_COUNTRY="Uganda"        # Hospital country
HOSPITAL_LOCATION="Kampala"      # Optional: Hospital location

# Optional: Smart contracts
CONSENT_MANAGER_ADDRESS="0xf2423F1E568eC90921045be96Ad2D618fCcd9841"  # Optional: ConsentManager contract
REVENUE_SPLITTER_ADDRESS="0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392" # Optional: RevenueSplitter contract
```

**Note:** If you don't have Hedera credentials, you can still see the setup, but the adapter won't be able to submit to Hedera.

---

## 📁 File Locations

### Input Data
- **Location:** `backend/adapter/data/raw_data.csv`
- **Contains:** Sample patient data with PII (names, IDs, phones, emails)

### Output Data
- **Location:** `backend/adapter/data/anonymized_data.csv`
- **Contains:** Anonymized data (no PII, only anonymous IDs)

### Configuration
- **Location:** `backend/adapter/.env`
- **Contains:** Environment variables (Hedera credentials, hospital info)

---

## 🎬 Running the Demo

### Complete Demo Flow

```bash
# 1. Navigate to adapter directory
cd backend/adapter

# 2. Setup (first time only)
./setup-local-demo.sh

# 3. Verify everything is ready
./verify-demo-ready.sh

# 4. Show raw data (with PII)
cat data/raw_data.csv | head -5

# 5. Run the adapter
npm run start:legacy

# 6. Show anonymized data (no PII)
cat data/anonymized_data.csv | head -5
```

### Expected Output

You should see output like this:

```
=== MediPact Adapter ===

1. Loading hospital configuration...
   ✓ Hospital Country: Uganda
   ✓ Hospital Location: Kampala

2. Initializing Hedera client...
   ✓ Client initialized

3. Setting up HCS topics...
   ✓ Consent Topic: 0.0.XXXXX
   ✓ Data Topic: 0.0.XXXXX

4. Reading EHR data...
   ✓ Read 20 records from data/raw_data.csv

5. Converting CSV to FHIR R4 Bundle...
   ✓ Created FHIR Bundle with 70 resources
     - Patient: 10
     - Encounter: 20
     - Condition: 10
     - Observation: 20
     - MedicationRequest: 10

6. Processing and anonymizing FHIR resources...
   ✓ Processed 70 resources

9. Processing consent proofs...
   ✓ Consent proof for PID-001: https://hashscan.io/testnet/transaction/...
   ✓ Consent proof for PID-002: https://hashscan.io/testnet/transaction/...
   ... (10 total)

10. Applying Stage 2 anonymization...
   ✓ Created 10 provenance proofs (one per patient)

=== Processing Complete ===
Summary:
  - CSV records read: 20
  - FHIR resources created: 70
  - Consent proofs: 10 (one per patient)
  - Data proofs: 10 (one per patient)
```

---

## ✅ What to Verify

### 1. Before/After Comparison

**Before (Raw Data):**
```bash
cat backend/adapter/data/raw_data.csv | head -3
```

You should see:
- Patient names (John Mukasa, Mary Nakato, etc.)
- Patient IDs (PAT-001, PAT-002)
- Phone numbers (+256700123456)
- Email addresses
- Addresses

**After (Anonymized Data):**
```bash
cat backend/adapter/data/anonymized_data.csv | head -3
```

You should see:
- ❌ No Patient Name
- ❌ No Patient ID
- ❌ No Phone Number
- ❌ No Email
- ❌ No Address
- ✅ Anonymous PID (PID-001, PID-002)
- ✅ Medical data preserved (Lab Test, Result, Test Date)

### 2. HashScan Links

Copy any HashScan link from the terminal output and open it in a browser. You should see:
- Transaction on Hedera testnet
- Transaction status: SUCCESS
- Transaction timestamp
- Message content (hash)

Example link format:
```
https://hashscan.io/testnet/transaction/0.0.7156417@1763641523.641404160
```

### 3. HCS Topics

The adapter creates two HCS topics:
- **Consent Topic:** For consent proofs
- **Data Topic:** For data proofs

Topic links are shown at the end:
```
HCS Topics:
  Consent Topic: https://hashscan.io/testnet.topic/0.0.7296298
  Data Topic: https://hashscan.io/testnet.topic/0.0.7296299
```

Click these links to see all messages in the topics.

---

## 🔍 Understanding the Output

### Key Metrics

- **CSV records read:** Number of rows in input CSV
- **FHIR resources created:** Total FHIR resources (Patient, Encounter, Observation, etc.)
- **FHIR resources processed:** Resources successfully processed
- **Unique patients:** Number of unique patients in the data
- **Consent proofs:** Number of consent proofs submitted to HCS (one per patient)
- **Data proofs:** Number of data proofs submitted to HCS (one per patient)

### What Each Step Does

1. **Loading configuration:** Reads hospital info from `.env`
2. **Initializing Hedera client:** Connects to Hedera testnet
3. **Setting up HCS topics:** Creates topics for consent and data proofs
4. **Reading EHR data:** Parses CSV file
5. **Converting to FHIR:** Transforms CSV to FHIR R4 format
6. **Processing resources:** Anonymizes and processes each resource
7. **Consent proofs:** Submits consent hashes to HCS (one per patient)
8. **Data proofs:** Submits data hashes to HCS (one per patient)

---

## ⚠️ Understanding Warnings

### Contract Revert Warnings

You may see warnings like:
```
⚠️  Failed to record consent on-chain: CONTRACT_REVERT_EXECUTED
```

**What this means:**
- The ConsentManager smart contract rejected the transaction
- This is for **optional** on-chain consent records
- **HCS proofs still work perfectly** (that's what matters!)

**Why it happens:**
- Contract might require patient registration first
- Contract validation rules not met
- Contract address might need configuration

**Impact:**
- ✅ **HCS consent proofs work** (primary mechanism)
- ✅ **HashScan links work** (verifiable on Hedera)
- ⚠️ On-chain consent records fail (optional feature)

**For Demo:**
- This is **not critical** - the HCS proofs are what matter
- You can still show HashScan links working
- The contract errors are warnings, not failures

---

## 🆘 Troubleshooting

### Error: "HOSPITAL_COUNTRY environment variable is required"

**Solution:**
```bash
cd backend/adapter
echo 'HOSPITAL_COUNTRY="Uganda"' >> .env
```

### Error: "OPERATOR_ID, OPERATOR_KEY, HEDERA_NETWORK are required"

**Solution:**
Add to `backend/adapter/.env`:
```bash
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"
```

Get free testnet account at: https://portal.hedera.com/dashboard

### Error: "Failed to read CSV file"

**Solution:**
```bash
# Check if file exists
ls -la backend/adapter/data/raw_data.csv

# If missing, a sample file should be created by setup script
```

### Error: "connect ECONNREFUSED" (when using backend storage)

**Solution:**
This is normal if the backend server isn't running. The adapter will skip storage and continue with HCS proofs.

### Node.js Version Issues

**Check version:**
```bash
node -v
```

**Required:** Node.js 20 or higher

**Install/Update:**
- Visit https://nodejs.org/
- Download LTS version (20.x or higher)

---

## 📊 Demo Checklist

Before running the demo:

- [ ] Node.js 20+ installed (`node -v`)
- [ ] Dependencies installed (`npm install` in `backend/adapter/`)
- [ ] `.env` file configured with Hedera credentials
- [ ] `HOSPITAL_COUNTRY` set in `.env`
- [ ] `data/raw_data.csv` exists
- [ ] Run `./verify-demo-ready.sh` - all checks pass

During the demo:

- [ ] Show raw CSV with PII
- [ ] Run adapter (`npm run start:legacy`)
- [ ] Show anonymized CSV (no PII)
- [ ] Show HashScan links
- [ ] Open HashScan link to verify Hedera transaction
- [ ] Show HCS topic pages

---

## 🎯 Key Points to Highlight

### 1. Anonymization Works
- **Before:** Names, IDs, phones, emails visible
- **After:** All PII removed, only anonymous IDs (PID-001, etc.)

### 2. Medical Data Preserved
- Lab tests, results, dates are preserved
- Only PII is removed, not medical information

### 3. Hedera Integration
- All proofs submitted to Hedera Consensus Service
- HashScan links prove transactions on blockchain
- Immutable and verifiable

### 4. Smart Contract Integration
- RevenueSplitter contract automatically distributes revenue
- 60% patient, 25% hospital, 15% platform
- Transaction verifiable on HashScan

---

## 📚 Additional Resources

### Documentation Files

- **`backend/adapter/LOCAL_DEMO_SETUP.md`** - Detailed setup guide
- **`backend/adapter/DEMO_QUICK_START.md`** - Quick reference
- **`backend/adapter/README.md`** - General adapter documentation

### Code Locations

- **Adapter:** `backend/adapter/src/index.js`
- **Smart Contracts:** `contracts/contracts/`
- **Configuration:** `backend/adapter/.env`

---

## 🎬 Demo Script Suggestions

### Quick Demo (2-3 minutes)

1. **Show raw data:**
   ```bash
   cat backend/adapter/data/raw_data.csv | head -5
   ```
   "Here's the input - patient names, IDs, phone numbers, all the PII."

2. **Run adapter:**
   ```bash
   cd backend/adapter && npm run start:legacy
   ```
   "Watch as it processes, anonymizes, and submits to Hedera."

3. **Show anonymized data:**
   ```bash
   cat backend/adapter/data/anonymized_data.csv | head -5
   ```
   "Notice all PII is gone - no names, no IDs, no phones. But medical data is preserved."

4. **Show HashScan link:**
   - Copy a link from terminal output
   - Open in browser
   - "Here's the proof on Hedera - immutable and verifiable."

### Full Demo (5-7 minutes)

Add these steps:
- Show FHIR resource breakdown
- Show HCS topic pages
- Show RevenueSplitter contract execution
- Explain the revenue split (60/25/15)

---

## ✅ Success Criteria

A successful demo run should show:

1. ✅ **CSV processed:** 20 records read
2. ✅ **FHIR created:** 70 resources created
3. ✅ **Anonymization:** No PII in output file
4. ✅ **HCS proofs:** 10 consent + 10 data proofs
5. ✅ **HashScan links:** All links work and show transactions
6. ✅ **Smart contract:** RevenueSplitter executes successfully

---

## 📞 Need Help?

If something doesn't work:

1. **Check setup:**
   ```bash
   cd backend/adapter
   ./verify-demo-ready.sh
   ```

2. **Check logs:**
   - Look for specific error messages
   - Verify environment variables are set
   - Ensure CSV file exists

3. **Common issues:**
   - Missing Hedera credentials → Get testnet account
   - Wrong Node.js version → Update to 20+
   - Missing dependencies → Run `npm install`

---

## 🎉 You're Ready!

Follow this guide to run the MediPact demo locally. The system demonstrates:
- ✅ Privacy-preserving anonymization
- ✅ Hedera Consensus Service integration
- ✅ Smart contract revenue distribution
- ✅ Verifiable blockchain proofs

**Happy demoing!** 🚀

