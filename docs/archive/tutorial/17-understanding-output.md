# Lesson 17: Understanding the Output

## What You See and Why

After running MediPact, you'll see various outputs. This lesson explains what everything means and why it's important.

## Output Overview

When you run `npm start`, you get:

1. **Console Output** - Processing steps and results
2. **Anonymized CSV File** - Clean data without PII
3. **Anonymized FHIR Bundle** - Standards-compliant output (if FHIR input)
4. **HashScan Links** - Blockchain transaction verification

## Console Output Breakdown

### Step 1: Initialization

```
=== MediPact Adapter ===

1. Initializing Hedera client...
   ✓ Client initialized
```

**What it means**:
- Connecting to Hedera network
- Authenticating with your account
- Ready to process transactions

**Why it matters**:
- Ensures connection works
- Verifies credentials
- Confirms network access

### Step 2: HCS Topics

```
2. Setting up HCS topics...
   Topic created: 0.0.123456
   Topic created: 0.0.123457
   ✓ Consent Topic: 0.0.123456
   ✓ Data Topic: 0.0.123457
```

**What it means**:
- Created 2 HCS topics on Hedera
- One for consent proofs
- One for data proofs

**Topic IDs**:
- Format: `0.0.xxxxx` (Hedera topic ID)
- Unique: Each run creates new topics (or reuses existing)
- Permanent: Topics exist forever on blockchain

**Why it matters**:
- Topics store proof hashes
- Immutable record
- Verifiable by anyone

### Step 3: Reading Data

```
3. Reading EHR data...
   📋 Detected CSV format
   ✓ Read 10 records from data/raw_data.csv
```

**What it means**:
- Successfully read input file
- Detected format (CSV or FHIR)
- Parsed all records

**Record count**:
- Total records processed
- May include multiple tests per patient

**Why it matters**:
- Confirms data was read correctly
- Shows how much data processed

### Step 4: Anonymization

```
4. Anonymizing patient data...
   ✓ Anonymized 10 records
   ✓ Mapped 5 unique patients
```

**What it means**:
- Removed PII from all records
- Assigned anonymous IDs
- Created patient mapping

**Numbers**:
- **10 records**: Total anonymized records
- **5 patients**: Unique patients (some have multiple tests)

**Why it matters**:
- Privacy protection confirmed
- Shows anonymization worked
- Indicates data structure

### Step 5: Writing Output

```
5. Writing anonymized data...
   ✓ Anonymized CSV saved
   ✓ Anonymized FHIR Bundle saved
```

**What it means**:
- Created output files
- Data ready for sharing
- Both formats available (if FHIR input)

**Files created**:
- `anonymized_data.csv`
- `anonymized_data.fhir.json` (if FHIR input)

**Why it matters**:
- Output files are ready
- Can be shared with researchers
- Standards-compliant format

### Step 6: Consent Proofs

```
6. Processing consent proofs...
   ✓ Consent proof for ID-12345 (PID-001): https://hashscan.io/testnet/transaction/0.0.123456@1234567890.123456789
   ✓ Consent proof for ID-12346 (PID-002): https://hashscan.io/testnet/transaction/0.0.123456@1234567891.123456789
   ...
```

**What it means**:
- Generated consent hash for each patient
- Submitted to HCS Consent Topic
- Created blockchain transaction

**HashScan Links**:
- Click to verify on blockchain
- Shows transaction details
- Proves consent was recorded

**Why it matters**:
- Immutable consent record
- Legal proof
- Verifiable by anyone

### Step 7: Data Proofs

```
7. Processing data proofs...
   ✓ Data proof for PID-001: https://hashscan.io/testnet/transaction/0.0.123457@1234567892.123456789
   ✓ Data proof for PID-001: https://hashscan.io/testnet/transaction/0.0.123457@1234567893.123456789
   ...
```

**What it means**:
- Generated hash for each anonymized record
- Submitted to HCS Data Topic
- Created blockchain transaction

**Multiple proofs per patient**:
- One proof per test/record
- Same patient can have multiple proofs
- All linked to same anonymous ID

**Why it matters**:
- Proves data authenticity
- Verifies data hasn't changed
- Enables data verification

### Step 8: Summary

```
=== Processing Complete ===

Summary:
  - Records processed: 10
  - Consent proofs: 5
  - Data proofs: 10
  - Output file: data/anonymized_data.csv
```

**What it means**:
- Complete processing summary
- Shows what was accomplished
- Confirms all steps completed

**Numbers explained**:
- **10 records**: All anonymized records
- **5 consent proofs**: One per unique patient
- **10 data proofs**: One per record

**Why it matters**:
- Quick overview of results
- Confirms success
- Shows scale

### Step 9: Topic Links

```
HCS Topics:
  Consent Topic: https://hashscan.io/testnet/topic/0.0.123456
  Data Topic: https://hashscan.io/testnet/topic/0.0.123457
```

**What it means**:
- Links to HCS topic pages
- Shows all messages in topics
- Complete transaction history

**Topic Pages**:
- All consent proofs
- All data proofs
- Transaction timeline
- Message content (hashes)

**Why it matters**:
- See all proofs together
- Verify complete history
- Share with researchers

### Step 10: Payout Simulation

```
=== Payout Simulation ===
Total Revenue: 0.1 HBAR
  Patient Share (60%): 0.06 HBAR
  Hospital Share (25%): 0.025 HBAR
  MediPact Share (15%): 0.015 HBAR

Currency Conversion (Example Rates):
  1 HBAR = $0.05 USD

Revenue in USD:
  Total: $0.005 USD
  Patient Share: $0.003 USD
  Hospital Share: $0.00125 USD
  MediPact Share: $0.00075 USD
  Per Patient: $0.0006 USD
```

**What it means**:
- Calculated revenue split
- Converted to USD
- Shows per-patient amount

**Revenue Split**:
- **60% patients**: Majority to data owners
- **25% hospital**: Fair share for provider
- **15% platform**: Operating costs

**Why it matters**:
- Shows fair compensation
- Transparent revenue distribution
- Demonstrates value

### Step 11: Real Payout (If Configured)

```
=== 7. EXECUTE REAL PAYOUT ===
   ✓ Real payout executed successfully!
   ✓ Transaction ID: 0.0.123458@1234567894.123456789
   ✓ HashScan: https://hashscan.io/testnet/transaction/0.0.123458@1234567894.123456789
   ✓ RevenueSplitter contract will automatically distribute:
     - Patient Share (60%): 0.06 HBAR
     - Hospital Share (25%): 0.025 HBAR
     - MediPact Share (15%): 0.015 HBAR
```

**What it means**:
- HBAR sent to RevenueSplitter contract
- Contract automatically splits revenue
- Payments distributed to wallets

**Why it matters**:
- Real money movement
- Automated distribution
- Transparent payments

## Output Files

### Anonymized CSV

**Location**: `data/anonymized_data.csv`

**Content**:
```csv
Anonymous PID,Lab Test,Test Date,Result,Unit,Reference Range
PID-001,Blood Glucose,2024-01-15,95,mg/dL,70-100
PID-001,Cholesterol,2024-01-20,180,mg/dL,<200
PID-002,Blood Glucose,2024-01-15,110,mg/dL,70-100
```

**What to check**:
- ✅ No PII (names, IDs, addresses)
- ✅ Anonymous IDs present
- ✅ Medical data preserved
- ✅ All records included

### Anonymized FHIR Bundle

**Location**: `data/anonymized_data.fhir.json` (if FHIR input)

**Content**: JSON file with FHIR resources

**What to check**:
- ✅ FHIR structure valid
- ✅ No PII in resources
- ✅ Anonymous IDs used
- ✅ Medical data preserved

## HashScan Verification

### Transaction Page

**URL Format**: `https://hashscan.io/testnet/transaction/{transactionId}`

**What you see**:
- Transaction status (SUCCESS)
- Timestamp
- Topic ID
- Message content (hash)
- Sender account
- Transaction fee

### Topic Page

**URL Format**: `https://hashscan.io/testnet/topic/{topicId}`

**What you see**:
- All messages in topic
- Transaction timeline
- Message content (hashes)
- Message count
- Topic metadata

## Understanding the Numbers

### Record Counts

- **10 records processed**: Total anonymized records
- **5 unique patients**: Different individuals
- **5 consent proofs**: One per patient
- **10 data proofs**: One per record

### Revenue Calculations

**Example**:
- 10 records × 0.01 HBAR = 0.1 HBAR total
- Patient share: 0.1 × 60% = 0.06 HBAR
- Hospital share: 0.1 × 25% = 0.025 HBAR
- Platform share: 0.1 × 15% = 0.015 HBAR
- Per patient: 0.06 ÷ 5 = 0.012 HBAR

## What Success Looks Like

### ✅ Successful Run

- All steps show ✓
- No error messages
- Output files created
- HashScan links work
- Validation passes

### ❌ Common Issues

**Error messages**: Check credentials, network, balance  
**Missing files**: Check file paths, permissions  
**Failed transactions**: Check HBAR balance, network  
**Invalid output**: Check input data format  

## Key Takeaways

- **Console output**: Shows processing steps and results
- **Output files**: Anonymized data ready for sharing
- **HashScan links**: Verify transactions on blockchain
- **Numbers**: Show scale and distribution
- **Success**: All steps complete, files created, links work

## Next Steps

Now that you understand the output:

- **Next Lesson**: [Verifying on HashScan](./18-hashscan-verification.md) - How to verify transactions

---

**Output Summary:**
- Console: Processing steps and results
- Files: Anonymized CSV and FHIR
- Links: HashScan verification
- Numbers: Records, proofs, revenue
- Success: All steps complete

