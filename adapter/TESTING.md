# Adapter Testing Guide

## Testing Overview

This guide covers testing the MediPact Adapter end-to-end flow.

## Prerequisites

1. Node.js 18+ installed
2. Hedera testnet account with HBAR balance
3. `.env` file configured with credentials
4. Dependencies installed (`npm install`)

## Test Scenarios

### 1. Basic HCS Integration Test

**Purpose**: Verify Hedera HCS connection and basic functionality

```bash
npm run test:hcs
```

**Expected Output**:
- ✓ Client initialized
- ✓ Topic created with ID
- ✓ Message submitted
- ✓ Transaction ID displayed
- ✓ HashScan link provided

**Verification Steps**:
1. Check HashScan link to verify transaction
2. Verify topic was created on testnet
3. Verify message appears in topic

---

### 2. End-to-End Adapter Test

**Purpose**: Test complete flow from CSV to HCS to payout simulation

```bash
npm start
```

**Expected Flow**:
1. ✅ Initialize Hedera client
2. ✅ Set up HCS topics (Consent Proofs, Data Proofs)
3. ✅ Read EHR data from `raw_data.csv`
4. ✅ Anonymize data (remove PII, generate anonymous IDs)
5. ✅ Write anonymized data to `anonymized_data.csv`
6. ✅ Process consent proofs (one per unique patient)
7. ✅ Process data proofs (one per record)
8. ✅ Display summary and HashScan links
9. ✅ Show payout simulation (USD + optional local currency)

**Verification Checklist**:
- [ ] All records processed correctly
- [ ] PII removed from anonymized output
- [ ] Anonymous IDs generated (PID-001, PID-002, etc.)
- [ ] Consent proofs submitted to HCS
- [ ] Data proofs submitted to HCS
- [ ] All HashScan links are valid
- [ ] Payout calculations are correct
- [ ] No errors in console output

---

### 3. Data Verification Tests

#### 3.1 Verify Anonymization

**Test**: Check that anonymized data has no PII

```bash
# After running adapter, check output file
cat data/anonymized_data.csv
```

**Expected**:
- ❌ No "Patient Name" column
- ❌ No "Patient ID" column
- ❌ No "Address" column
- ❌ No "Phone Number" column
- ❌ No "Date of Birth" column
- ✅ "Anonymous PID" column present
- ✅ Medical data preserved (Lab Test, Result, etc.)

#### 3.2 Verify Patient Mapping

**Test**: Verify each unique patient gets one anonymous ID

**Expected**:
- Each unique patient ID maps to one anonymous PID
- Multiple records for same patient share same anonymous PID

---

### 4. HCS Transaction Verification

#### 4.1 Verify Transaction Success

**Check**: All transactions have status `SUCCESS`

**Method**: 
1. Visit HashScan links from adapter output
2. Verify transaction status is "SUCCESS"
3. Verify transaction details match expected values

#### 4.2 Verify Topic Messages

**Check**: Messages appear in HCS topics

**Method**:
1. Visit topic links from adapter output:
   - `https://hashscan.io/testnet/topic/{consentTopicId}`
   - `https://hashscan.io/testnet/topic/{dataTopicId}`
2. Verify messages are present
3. Verify message content matches expected hashes

---

### 5. Currency Conversion Tests

#### 5.1 Default (USD Only)

**Test**: Run without local currency configuration

**Expected**:
- Revenue displayed in USD only
- No local currency section

#### 5.2 With Local Currency

**Test**: Configure local currency in `.env`

```env
LOCAL_CURRENCY_CODE="UGX"
USD_TO_LOCAL_RATE="3700"
```

**Expected**:
- Revenue displayed in USD
- Additional section showing local currency
- Conversion rates displayed
- Proper formatting (UGX with no decimals)

---

## Error Scenarios

### Test 1: Missing Credentials

**Scenario**: Run adapter without `.env` file

**Expected**: Clear error message about missing credentials

### Test 2: Invalid CSV File

**Scenario**: Use corrupted or invalid CSV

**Expected**: Clear error message about CSV parsing

### Test 3: Network Issues

**Scenario**: Run with network disconnected (simulated)

**Expected**: Clear error message about network/Hedera connection

---

## Performance Checks

### Response Times

- Topic creation: < 5 seconds
- Message submission: < 3 seconds per message
- Total runtime: < 30 seconds for 10 records

### Resource Usage

- Memory: Should remain reasonable (< 100MB)
- Network: Minimal (only HCS transactions)

---

## Test Data

### Sample Input (`raw_data.csv`)

- 10 records
- 5 unique patients
- Multiple lab tests per patient

### Expected Output

- 10 anonymized records
- 5 consent proofs
- 10 data proofs
- 1 output CSV file

---

## Troubleshooting

### Issue: "OPERATOR_ID, HEDERA_NETWORK, and OPERATOR_KEY are required"

**Solution**: Ensure `.env` file exists in `adapter/` directory with correct credentials

### Issue: "Transaction failed with status"

**Solution**: 
- Check account has sufficient HBAR balance
- Verify network connectivity
- Check account ID and private key are correct

### Issue: "Error parsing CSV"

**Solution**: 
- Verify CSV file format is correct
- Check for special characters in data
- Ensure proper comma separation

### Issue: "No funds to distribute"

**Solution**: This is expected if running payout simulation (no actual transfers)

---

## Manual Verification Steps

1. **Check Anonymized Output**:
   ```bash
   cat adapter/data/anonymized_data.csv
   ```
   Verify no PII present

2. **Verify HashScan Links**:
   - Open each HashScan link from console output
   - Verify transaction status is SUCCESS
   - Check transaction details match expected

3. **Check Topic Messages**:
   - Visit topic pages on HashScan
   - Verify messages are present
   - Verify message content (hashes)

4. **Verify Calculations**:
   - Check revenue split percentages (60/25/15)
   - Verify currency conversions are correct
   - Confirm per-patient calculations

---

## Continuous Testing

For development, consider:

1. **Unit Tests**: Test individual functions (anonymization, hashing, etc.)
2. **Integration Tests**: Test HCS integration with mock responses
3. **E2E Tests**: Test complete flow (requires testnet account)

---

## Next Steps After Testing

Once testing is complete:

1. Fix any bugs found
2. Improve error messages if needed
3. Optimize performance if required
4. Prepare for demo video recording
5. Create pitch deck

---

## Test Results Template

```
Test Date: [DATE]
Tester: [NAME]
Environment: [testnet/mainnet]

✅ Basic HCS Integration: PASS/FAIL
✅ End-to-End Flow: PASS/FAIL
✅ Data Anonymization: PASS/FAIL
✅ HCS Transactions: PASS/FAIL
✅ Currency Conversion: PASS/FAIL
✅ Error Handling: PASS/FAIL

Issues Found:
- [List any issues]

Notes:
- [Any additional observations]
```


