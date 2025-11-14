# End-to-End Flow Test

This test suite validates the complete flow from patient data entry to money withdrawal.

## Test Flow

1. **Patient Registration** - Creates patient with payment preferences
2. **Hospital Registration** - Creates hospital with payment preferences  
3. **Patient-Hospital Linkage** - Links patient to hospital
4. **Data Upload** - Creates FHIR resources for patient data
5. **Dataset Creation** - Creates dataset from patient data with pricing
6. **Researcher Registration** - Creates verified researcher account
7. **Researcher Purchase** - Simulates purchase with payment verification
8. **Revenue Distribution** - Distributes revenue (60% patient, 25% hospital, 15% platform)
9. **Balance Verification** - Verifies balances after revenue distribution
10. **Withdrawal Process** - Tests withdrawal initiation and history
11. **Data Verification** - Confirms researcher receives anonymized data only

## Running the Test

```bash
cd backend
npm test -- tests/integration/end-to-end-flow.test.js
```

## Prerequisites

- Database must be initialized
- Hedera testnet credentials (optional, for full Hedera account creation)
- Environment variables:
  - `OPERATOR_ID` - Hedera operator account ID
  - `OPERATOR_KEY` - Hedera operator private key
  - `PLATFORM_HEDERA_ACCOUNT_ID` - Platform account for receiving payments

## What Gets Tested

### Data Privacy
- ✅ PII (name, phone, email, address) is removed from researcher data
- ✅ Demographic data (country, gender, age range) is preserved but generalized
- ✅ UPI is present for data linkage but anonymized

### Revenue Flow
- ✅ Patient receives 60% of revenue
- ✅ Hospital receives 25% of revenue  
- ✅ Platform receives 15% of revenue
- ✅ Balances are updated correctly
- ✅ Withdrawals can be initiated

### Payment Verification
- ✅ Payment requests are created correctly
- ✅ Transaction verification flow works
- ✅ Purchase completes after verification

## Expected Output

The test will output detailed logs for each step:
- ✅ Success indicators for each step
- ⚠️ Warnings for optional steps (Hedera account creation)
- 📊 Complete flow summary at the end

## Notes

- Some steps may be skipped if Hedera credentials are not available
- The test creates real database records (use test database)
- Hedera account creation requires testnet/mainnet credentials
- Revenue distribution requires Hedera network access

