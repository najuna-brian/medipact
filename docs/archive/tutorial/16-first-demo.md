# Lesson 16: Running Your First Demo

## Hands-On Walkthrough

This is the moment you've been waiting for! Let's run MediPact end-to-end and see it in action.

## Prerequisites Check

Before starting, ensure you have:

- [ ] Node.js installed (`node --version`)
- [ ] Project cloned and dependencies installed
- [ ] `.env` file configured with Hedera credentials
- [ ] Testnet account funded with HBAR

If not, complete previous lessons first!

## Step 1: Navigate to Adapter Directory

```bash
# From project root
cd medipact/adapter

# Verify you're in the right place
pwd
# Should show: .../medipact/adapter

# List files
ls
# Should see: package.json, src/, data/, etc.
```

✅ **Checkpoint**: You're in the adapter directory

## Step 2: Verify Environment Setup

```bash
# Check .env file exists
ls -la .env
# Should show: .env file

# Verify it has required variables (don't show values!)
grep -E "OPERATOR_ID|OPERATOR_KEY|HEDERA_NETWORK" .env
# Should show the variable names (values hidden)
```

⚠️ **Warning**: Never share your `.env` file or commit it to Git!

✅ **Checkpoint**: Environment variables are set

## Step 3: Check Input Data

```bash
# Check CSV file exists
ls data/raw_data.csv

# Preview first few lines
head -n 3 data/raw_data.csv
```

**Expected output**:
```
Patient Name,Patient ID,Address,Phone Number,Date of Birth,Lab Test,Test Date,Result,Unit,Reference Range
John Doe,ID-12345,"123 Main St Kampala",0771234567,1990-05-15,Blood Glucose,2024-01-15,95,mg/dL,70-100
Jane Smith,ID-12346,"456 Oak Ave Entebbe",0772345678,1985-08-22,Blood Glucose,2024-01-15,110,mg/dL,70-100
```

✅ **Checkpoint**: Input data file exists

## Step 4: Run the Adapter

```bash
# Run the complete adapter flow
npm start
```

### What Happens

The adapter will:

1. **Initialize Hedera client**
   ```
   1. Initializing Hedera client...
      ✓ Client initialized
   ```

2. **Create HCS topics**
   ```
   2. Setting up HCS topics...
      Topic created: 0.0.xxxxx
      Topic created: 0.0.yyyyy
      ✓ Consent Topic: 0.0.xxxxx
      ✓ Data Topic: 0.0.yyyyy
   ```

3. **Read and parse data**
   ```
   3. Reading EHR data...
      📋 Detected CSV format
      ✓ Read 10 records from data/raw_data.csv
   ```

4. **Anonymize data**
   ```
   4. Anonymizing patient data...
      ✓ Anonymized 10 records
      ✓ Mapped 5 unique patients
   ```

5. **Write anonymized output**
   ```
   5. Writing anonymized data...
      ✓ Anonymized CSV saved
   ```

6. **Process consent proofs**
   ```
   6. Processing consent proofs...
      ✓ Consent proof for ID-12345 (PID-001): https://hashscan.io/testnet/transaction/...
      ✓ Consent proof for ID-12346 (PID-002): https://hashscan.io/testnet/transaction/...
      ...
   ```

7. **Process data proofs**
   ```
   7. Processing data proofs...
      ✓ Data proof for PID-001: https://hashscan.io/testnet/transaction/...
      ✓ Data proof for PID-001: https://hashscan.io/testnet/transaction/...
      ...
   ```

8. **Display summary**
   ```
   === Processing Complete ===
   
   Summary:
     - Records processed: 10
     - Consent proofs: 5
     - Data proofs: 10
     - Output file: data/anonymized_data.csv
   ```

9. **Show topic links**
   ```
   HCS Topics:
     Consent Topic: https://hashscan.io/testnet/topic/0.0.xxxxx
     Data Topic: https://hashscan.io/testnet/topic/0.0.yyyyy
   ```

10. **Calculate payout**
    ```
    === Payout Simulation ===
    Total Revenue: 0.1 HBAR
      Patient Share (60%): 0.06 HBAR
      Hospital Share (25%): 0.025 HBAR
      MediPact Share (15%): 0.015 HBAR
    
    Revenue in USD:
      Total: $0.005 USD
      Patient Share: $0.003 USD
      Per Patient: $0.0006 USD
    ```

11. **Execute real payout** (if configured)
    ```
    === 7. EXECUTE REAL PAYOUT ===
      ✓ Real payout executed successfully!
      ✓ Transaction ID: ...
      ✓ HashScan: https://hashscan.io/testnet/transaction/...
    ```

✅ **Checkpoint**: Adapter ran successfully!

## Step 5: Verify Output Files

```bash
# Check anonymized CSV was created
ls -lh data/anonymized_data.csv

# Preview anonymized data
head -n 5 data/anonymized_data.csv
```

**Expected output**:
```
Anonymous PID,Lab Test,Test Date,Result,Unit,Reference Range
PID-001,Blood Glucose,2024-01-15,95,mg/dL,70-100
PID-001,Cholesterol,2024-01-20,180,mg/dL,<200
PID-002,Blood Glucose,2024-01-15,110,mg/dL,70-100
PID-002,Cholesterol,2024-01-20,220,mg/dL,<200
```

**Notice**:
- ✅ No PII (no names, IDs, addresses)
- ✅ Anonymous IDs (PID-001, PID-002, etc.)
- ✅ Medical data preserved (lab tests, results)

✅ **Checkpoint**: Anonymized data looks correct

## Step 6: Validate Output

```bash
# Run validation script
npm run validate
```

**Expected output**:
```
Validating anonymized output...
✓ File exists: data/anonymized_data.csv
✓ No PII detected in output
✓ Anonymous IDs are correctly formatted
✓ Medical data is preserved
✓ Record count matches (10 records)
✅ Validation passed!
```

✅ **Checkpoint**: Output validation passed

## Step 7: Check HashScan Links

### Copy a HashScan Link

From the adapter output, copy one of the HashScan links:
```
https://hashscan.io/testnet/transaction/0.0.123456@1234567890.123456789
```

### Open in Browser

1. Paste the link in your browser
2. You should see:
   - Transaction details
   - Status: SUCCESS
   - Timestamp
   - Topic ID
   - Message content (hash)

### Check Topic Page

1. Copy the topic link from output:
   ```
   https://hashscan.io/testnet/topic/0.0.xxxxx
   ```
2. Open in browser
3. You should see:
   - All messages in the topic
   - Consent proof hashes
   - Transaction history

✅ **Checkpoint**: HashScan links work and show transactions

## Step 8: Compare Input vs Output

### Original Data (PII Present)

```bash
# View original data
cat data/raw_data.csv | head -n 3
```

**Shows**:
- Patient names
- Patient IDs
- Addresses
- Phone numbers
- Dates of birth

### Anonymized Data (PII Removed)

```bash
# View anonymized data
cat data/anonymized_data.csv | head -n 3
```

**Shows**:
- Anonymous IDs only
- Medical data preserved
- No personal information

**Comparison**:
- ✅ PII removed
- ✅ Medical data preserved
- ✅ Anonymous IDs assigned

## Step 9: Run with FHIR Input (Optional)

If you want to try FHIR format:

```bash
# Convert CSV to FHIR (if not already done)
npm run convert:csv-to-fhir

# Run with FHIR input
export INPUT_FILE=./data/raw_data.fhir.json
npm start
```

**Notice**:
- Detects FHIR format automatically
- Processes FHIR Bundle
- Outputs both CSV and FHIR formats

## Understanding What Happened

### Data Flow

```
CSV File (10 records, 5 patients)
  ↓
Anonymization (PII removed, anonymous IDs added)
  ↓
Hashing (consent + data hashes generated)
  ↓
HCS Submission (hashes stored on blockchain)
  ↓
Smart Contracts (consent recorded, payout executed)
  ↓
Output Files (anonymized CSV + FHIR)
```

### What Was Created

1. **HCS Topics**: 2 topics (Consent + Data)
2. **Transactions**: 15 transactions (5 consent + 10 data)
3. **Output Files**: 1 CSV file (anonymized)
4. **HashScan Links**: 15+ links for verification

### What Was Stored on Blockchain

- **Consent proof hashes**: 5 hashes (one per patient)
- **Data proof hashes**: 10 hashes (one per record)
- **Consent records**: On ConsentManager contract (if configured)
- **Payout transactions**: On RevenueSplitter contract (if configured)

## Troubleshooting

### Error: "OPERATOR_ID, HEDERA_NETWORK, and OPERATOR_KEY are required"

**Solution**: Check your `.env` file has all required variables

### Error: "Transaction failed"

**Solution**: 
- Check account has HBAR balance
- Verify network is correct (testnet)
- Check account ID and key are correct

### Error: "Failed to create topic"

**Solution**:
- Ensure account has enough HBAR
- Check network connectivity
- Verify credentials

### Error: "File not found"

**Solution**:
- Check you're in the adapter directory
- Verify `data/raw_data.csv` exists
- Check file path is correct

## Success Criteria

You've successfully completed the demo if:

- [ ] Adapter ran without errors
- [ ] Anonymized CSV file was created
- [ ] HashScan links are accessible
- [ ] Transactions show SUCCESS status
- [ ] Output validation passed
- [ ] No PII in output file

## Next Steps

Now that you've run the demo:

- **Next Lesson**: [Understanding the Output](./17-understanding-output.md) - What everything means

---

**Key Takeaways:**
- Adapter processes data end-to-end
- Creates HCS topics and submits hashes
- Generates anonymized output
- All transactions verifiable on HashScan
- Smart contracts handle payouts automatically

**What You Learned:**
- How to run the complete adapter
- How to verify transactions
- How to check anonymized output
- How to validate results

