# MediPact Adapter

Core engine for processing hospital EHR data, anonymizing it, and submitting proof hashes to Hedera Consensus Service (HCS).

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the adapter directory:
```env
# Hedera Configuration (Required)
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"

# Hospital Configuration (Required for anonymization)
HOSPITAL_COUNTRY="Uganda"  # REQUIRED: Used as fallback when patient location missing
HOSPITAL_LOCATION="Kampala, Uganda"  # Optional: Used for country inference if needed

# Smart Contract Addresses (Optional)
CONSENT_MANAGER_ADDRESS="0x..."
REVENUE_SPLITTER_ADDRESS="0x..."
```

Get free testnet account at: https://portal.hedera.com/dashboard

3. Run the adapter:
```bash
npm start
```

## Usage

### Run the Adapter

```bash
npm start
```

The adapter will:
1. Load hospital configuration (country, location, hospitalId)
2. Read EHR data from `data/raw_data.csv`
3. **Anonymize patient information with demographics**:
   - Remove PII (name, ID, address, phone, exact DOB/age)
   - Preserve demographics (age range, country, gender, occupation category)
   - Generate anonymous IDs (PID-001, PID-002, etc. or UPI-based if enabled)
   - Enforce k-anonymity (minimum 5 records per demographic group)
4. **Optional: UPI Integration** (if enabled):
   - Generate or match Unique Patient Identity (UPI) for each patient
   - Create UPI-based anonymous IDs for cross-hospital linking
   - Link hospital patient IDs to UPIs
5. Generate consent and data proof hashes
6. Create HCS topics (Consent Proofs, Data Proofs)
7. Submit proofs to Hedera HCS
8. **Record consent proofs on-chain** using ConsentManager smart contract (NO original patient IDs stored)
9. Display HashScan links for all transactions
10. Show payout simulation (USD + optional local currency)
11. **Execute real payouts** via RevenueSplitter smart contract (if configured)

### UPI Integration (Optional)

To enable UPI-based anonymization for cross-hospital patient identity:

1. Set `HOSPITAL_ID` in `.env`:
```env
HOSPITAL_ID=HOSP-001234567890
```

2. Configure UPI options in the adapter:
```javascript
import { anonymizeWithDemographics } from './anonymizer/demographic-anonymize.js';
import { getUPIForRecord, generateUPIBasedAnonymousPID } from './services/upi-integration.js';

const upiOptions = {
  enabled: true,
  getUPI: async (record) => {
    // Call backend API or local UPI service
    return await getUPIForRecord(record, { /* options */ });
  },
  generateUPIPID: (upi, hospitalId, index) => {
    return generateUPIBasedAnonymousPID(upi, hospitalId, index);
  }
};

const result = await anonymizeWithDemographics(records, hospitalInfo, upiOptions);
```

See `../docs/PATIENT_IDENTITY_MANAGEMENT.md` for complete UPI documentation.

### Test HCS Integration

```bash
npm run test:hcs
```

This creates a test topic and submits a test message to verify HCS connectivity.

### Validate Output

After running the adapter, validate the anonymized output:

```bash
npm run validate
```

This checks:
- No PII is present in output
- Anonymous IDs are correctly formatted (PID-001, PID-002, etc.)
- Required demographics are present (Age Range, Country, Gender)
- Medical data is preserved
- K-anonymity compliance (minimum 5 records per demographic group)
- Record counts match

## Scripts

- `npm start` - Run the complete adapter flow
- `npm run test:hcs` - Test HCS integration
- `npm run validate` - Validate anonymized output

## Development

All source code is in `src/`:
- `index.js` - Main entry point (orchestrates entire flow)
- `anonymizer/anonymize.js` - Basic data anonymization (CSV parsing, PII removal)
- `anonymizer/demographic-anonymize.js` - Enhanced anonymization with demographics (age ranges, country, gender, occupation)
- `fhir/fhir-anonymizer.js` - FHIR resource anonymization with demographics
- `hedera/hcs-client.js` - HCS integration (topic creation, message submission)
- `hedera/evm-client.js` - EVM smart contract integration (ConsentManager, RevenueSplitter)
- `utils/hash.js` - Cryptographic hash generation (SHA-256)
- `utils/validation.js` - Validation utilities (PII checks, demographic validation, k-anonymity)
- `utils/currency.js` - Currency conversion utilities (USD-based)

## Testing

See `TESTING.md` for comprehensive testing guide and test scenarios.

## Configuration

### Environment Variables

**Required:**
- `OPERATOR_ID` - Hedera operator account ID (the account that pays for transactions)
- `OPERATOR_KEY` - Operator private key (ECDSA format, HEX encoded)
- `HEDERA_NETWORK` - Network to connect to (mainnet, testnet, previewnet, localhost)
- `HOSPITAL_COUNTRY` - Hospital country (e.g., "Uganda") - **REQUIRED** for anonymization fallback

**Optional:**
- `HOSPITAL_LOCATION` - Hospital location (e.g., "Kampala, Uganda") - Used for country inference if needed
- `LOCAL_CURRENCY_CODE` - Local currency code (e.g., "UGX", "KES")
- `USD_TO_LOCAL_RATE` - Exchange rate (local currency per USD)
- `CONSENT_MANAGER_ADDRESS` - Deployed ConsentManager contract address (EVM format: 0x...)
- `REVENUE_SPLITTER_ADDRESS` - Deployed RevenueSplitter contract address (EVM format: 0x...)

**Hospital Configuration:**
- `HOSPITAL_COUNTRY` is **required** and used as a fallback when patient location data is missing
- The system ensures country is always known (extracted from patient address or uses hospital country)
- This guarantees demographic data completeness for research purposes

**Smart Contract Integration:**
- If `CONSENT_MANAGER_ADDRESS` is set, consent proofs are recorded on-chain (NO original patient IDs stored)
- If `REVENUE_SPLITTER_ADDRESS` is set, real HBAR payouts are executed (automatically splits 60/25/15)
- Contracts can be deployed using `contracts/scripts/deploy.js`
- See `SETUP.md` for detailed setup instructions including contract deployment

## Enhanced Anonymization Features

### Demographic Data Preservation

The adapter now preserves research-valuable demographic data in generalized form:

- **Age Range** (REQUIRED): 5-year ranges (e.g., "35-39")
  - Calculated from Age or Date of Birth
  - Error if both missing (age is required)
  
- **Country** (REQUIRED): Country-level location only
  - Extracted from patient address
  - Uses hospital country as fallback (always known)
  
- **Gender** (REQUIRED): Preserved as-is (Male/Female/Other/Unknown)
  - Normalized and defaults to "Unknown" if missing
  
- **Occupation Category** (OPTIONAL): Generalized categories
  - Healthcare Worker, Education Worker, Government Worker, etc.
  - Defaults to "Unknown" if missing

### K-Anonymity Protection

- Enforces minimum 5 records per demographic combination
- Groups defined by: Country, Age Range, Gender, Occupation Category
- Records in groups with <5 records are suppressed for privacy protection

### Privacy Guarantees

- **No PII on Blockchain**: Only anonymous IDs (PID-XXX) and hashes stored on Hedera
- **No Original Patient IDs**: ConsentManager contract stores only anonymous IDs
- **Demographics Generalized**: Age ranges and occupation categories prevent re-identification
- **K-Anonymity Enforced**: Ensures privacy protection through demographic grouping


