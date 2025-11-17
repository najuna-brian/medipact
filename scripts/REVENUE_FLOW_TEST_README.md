# Revenue Flow Test Guide

This guide explains how to test the complete revenue flow from researcher payment to patient/hospital/platform wallets.

## Overview

The revenue flow test verifies:
1. **USD to HBAR Conversion** - Researcher pays in USD, converted to HBAR
2. **Payment Verification** - HBAR transaction verified on Hedera
3. **Revenue Distribution** - 60% patient, 25% hospital (original collector), 15% platform
4. **Multi-Patient Scenarios** - Payment split equally, then distributed per patient
5. **Multi-Hospital Scenarios** - Each hospital only receives revenue from their own patients
6. **Wallet Balances** - Verify balances before and after distribution

## Test Scripts

### 1. Basic Revenue Flow Test
**File**: `scripts/test-revenue-flow.js`

Tests revenue calculations and scenarios without requiring actual accounts.

**Usage**:
```bash
node scripts/test-revenue-flow.js
```

**What it tests**:
- USD to HBAR conversion
- Revenue split calculations (60/25/15)
- Single patient purchase scenario
- Multiple patients from one hospital
- Multiple patients from multiple hospitals
- Revenue calculation accuracy

### 2. Detailed Revenue Flow Test
**File**: `scripts/test-revenue-flow-detailed.js`

Tests with actual wallet balance verification (requires test accounts).

**Usage**:
```bash
export RESEARCHER_ID=your_researcher_id
export TEST_PATIENT_UPI=patient_upi
export TEST_HOSPITAL_ID=hospital_id
export TEST_PATIENT_UPI_2=patient_upi_2  # Optional
export TEST_HOSPITAL_ID_2=hospital_id_2  # Optional

node scripts/test-revenue-flow-detailed.js
```

**What it tests**:
- Initial wallet balances
- Actual purchase flow
- Balance changes after distribution
- Multi-hospital revenue isolation

## Test Scenarios

### Scenario 1: Single Patient Purchase

**Setup**:
- Researcher pays $100 USD
- Single patient data purchase

**Expected Distribution**:
- Patient: 60 HBAR (60%)
- Hospital: 25 HBAR (25%)
- Platform: 15 HBAR (15%)

**Verification**:
- Patient wallet increases by 60 HBAR
- Hospital wallet increases by 25 HBAR
- Platform wallet increases by 15 HBAR

### Scenario 2: Multiple Patients from One Hospital

**Setup**:
- Researcher pays $1,000 USD
- Dataset with 10 patients from Hospital A

**Expected Distribution**:
- Amount per patient: 100 HBAR
- Per patient split:
  - Patient: 60 HBAR (60%)
  - Hospital A: 25 HBAR (25%)
  - Platform: 15 HBAR (15%)
- Hospital A total: 250 HBAR (10 patients × 25 HBAR)
- All patients total: 600 HBAR (10 patients × 60 HBAR)
- Platform total: 150 HBAR (10 patients × 15 HBAR)

**Verification**:
- Hospital A wallet increases by 250 HBAR
- 10 patient wallets each increase by 60 HBAR
- Platform wallet increases by 150 HBAR

### Scenario 3: Multiple Patients from Multiple Hospitals

**Setup**:
- Researcher pays $2,000 USD
- Dataset with:
  - 15 patients from Hospital A
  - 10 patients from Hospital B
  - 5 patients from Hospital C

**Expected Distribution**:
- Total patients: 30
- Amount per patient: 66.67 HBAR
- Per patient split:
  - Patient: 40 HBAR (60%)
  - Hospital: 16.67 HBAR (25%)
  - Platform: 10 HBAR (15%)

**Hospital Totals**:
- Hospital A: 250 HBAR (15 patients × 16.67 HBAR)
- Hospital B: 166.67 HBAR (10 patients × 16.67 HBAR)
- Hospital C: 83.33 HBAR (5 patients × 16.67 HBAR)

**Verification**:
- Each hospital only receives revenue from their own patients
- Hospital A wallet increases by 250 HBAR
- Hospital B wallet increases by 166.67 HBAR
- Hospital C wallet increases by 83.33 HBAR
- 30 patient wallets each increase by 40 HBAR
- Platform wallet increases by 300 HBAR

## Revenue Distribution Rules

### Key Principles

1. **Equal Split Per Patient**: Total payment is divided equally among all patients in the dataset
2. **60/25/15 Split**: Each patient's share is split 60% patient, 25% hospital, 15% platform
3. **Original Hospital Only**: Each patient's 25% goes to the hospital that originally collected that patient's data
4. **No Cross-Hospital Revenue**: Hospital A never receives revenue from Hospital B's patients

### Example Calculation

**Purchase**: $1,000 USD for 100 patients
- Exchange rate: 1 HBAR = $0.16 USD
- Total HBAR: 6,250 HBAR
- Per patient: 62.5 HBAR

**Per Patient Distribution**:
- Patient: 37.5 HBAR (60%)
- Hospital (original collector): 15.625 HBAR (25%)
- Platform: 9.375 HBAR (15%)

**If 60 patients from Hospital A, 40 from Hospital B**:
- Hospital A receives: 60 × 15.625 = 937.5 HBAR
- Hospital B receives: 40 × 15.625 = 625 HBAR
- All patients receive: 100 × 37.5 = 3,750 HBAR
- Platform receives: 100 × 9.375 = 937.5 HBAR

## Testing Wallet Balances

### Before Purchase

Record initial balances:
```bash
curl http://localhost:8080/api/patient/{upi}/wallet/balance
curl http://localhost:8080/api/hospital/{hospitalId}/wallet/balance
```

### After Purchase

Check final balances and verify increases match expected distribution.

### Balance Verification

For each recipient:
1. Get initial balance
2. Execute purchase
3. Wait for distribution (may take a few seconds)
4. Get final balance
5. Verify: `final_balance - initial_balance = expected_amount`

## Exchange Rate

The system uses:
- **Primary**: CoinGecko API (real-time HBAR/USD rate)
- **Fallback**: 0.16 USD per HBAR (if API unavailable)

Current rate is cached for 5 minutes.

## Manual Testing Steps

### 1. Setup Test Accounts

```bash
# Create researcher
curl -X POST http://localhost:8080/api/researcher/register \
  -H "Content-Type: application/json" \
  -d '{"email":"researcher@test.com","organizationName":"Test Org"}'

# Create hospital
curl -X POST http://localhost:8080/api/hospital/register \
  -H "Content-Type: application/json" \
  -d '{"email":"hospital@test.com","hospitalName":"Test Hospital","country":"Uganda"}'

# Create patients (via hospital API)
# ... (use hospital upload or patient registration)
```

### 2. Upload Test Data

Upload CSV with patient data linked to hospital.

### 3. Make Purchase

```bash
# Step 1: Initiate purchase (get payment request)
curl -X POST http://localhost:8080/api/marketplace/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "researcherId": "RES-XXX",
    "datasetId": "DS-XXX",
    "amount": 100
  }'

# Step 2: Send HBAR payment (use Hedera wallet)
# Get transaction ID from payment

# Step 3: Complete purchase with transaction ID
curl -X POST http://localhost:8080/api/marketplace/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "researcherId": "RES-XXX",
    "datasetId": "DS-XXX",
    "amount": 100,
    "transactionId": "0.0.123@1234567890.123456789"
  }'
```

### 4. Verify Balances

```bash
# Check patient balance
curl http://localhost:8080/api/patient/{upi}/wallet/balance

# Check hospital balance
curl http://localhost:8080/api/hospital/{hospitalId}/wallet/balance
```

## Troubleshooting

### Exchange Rate Issues
- Check CoinGecko API availability
- Verify fallback rate is reasonable
- Check rate cache is updating

### Balance Not Updating
- Wait a few seconds for Hedera transaction confirmation
- Verify transaction was successful on HashScan
- Check that accounts have Hedera Account IDs

### Revenue Distribution Fails
- Verify patient has Hedera account
- Verify hospital has Hedera account
- Check RevenueSplitter contract is deployed (if using)
- Verify transaction ID is valid

### Hospital Not Receiving Revenue
- Verify patient's `hospital_id` in database matches expected hospital
- Check that hospital is the original collector (not temporary access)
- Verify revenue distribution service is called correctly

## Expected Test Results

All scenarios should verify:
- ✅ USD correctly converted to HBAR
- ✅ Payment split equally among patients
- ✅ Each patient's share split 60/25/15
- ✅ Each hospital only receives revenue from their own patients
- ✅ Platform receives 15% of total
- ✅ Wallet balances increase by expected amounts
- ✅ Total distribution equals total payment

## Integration with Smart Contracts

If RevenueSplitter contract is deployed:
- Revenue distribution uses smart contract
- Each distribution creates a contract transaction
- Transaction hash stored in database
- Verifiable on HashScan

If contract not available:
- Direct Hedera transfers used
- Three separate transfers (patient, hospital, platform)
- Transaction IDs stored separately

