# MediPact Quick Reference Guide

## Quick Commands

### Setup
```bash
# Clone repository
git clone git@github.com:najuna-brian/medipact.git
cd medipact

# Install dependencies
cd adapter && npm install
cd ../contracts && npm install
```

### Running
```bash
# Run adapter (CSV input)
cd adapter
npm start

# Run adapter (FHIR input)
export INPUT_FILE=./data/raw_data.fhir.json
npm start

# Convert CSV to FHIR
npm run convert:csv-to-fhir
```

### Testing
```bash
# Validate output
npm run validate

# Test HCS connection
npm run test:hcs

# Run unit tests
npm test
```

## Environment Variables

### Required
```env
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"
```

### Optional
```env
INPUT_FILE="./data/raw_data.csv"
CONSENT_MANAGER_ADDRESS="0x..."
REVENUE_SPLITTER_ADDRESS="0x..."
LOCAL_CURRENCY_CODE="UGX"
USD_TO_LOCAL_RATE="3700"
```

## File Locations

### Input Data
- `adapter/data/raw_data.csv` - CSV format
- `adapter/data/raw_data.fhir.json` - FHIR format

### Output Data
- `adapter/data/anonymized_data.csv` - Anonymized CSV
- `adapter/data/anonymized_data.fhir.json` - Anonymized FHIR

### Configuration
- `adapter/.env` - Environment variables
- `contracts/.env` - Contract deployment config

## Key Concepts

### Anonymization
- **Removes**: Name, ID, Address, Phone, DOB
- **Preserves**: Lab tests, Results, Dates, Units
- **Adds**: Anonymous IDs (PID-001, PID-002)

### HCS Topics
- **Consent Topic**: Stores consent proof hashes
- **Data Topic**: Stores data proof hashes
- **Format**: `0.0.xxxxx`

### Smart Contracts
- **ConsentManager**: Records consent on-chain
- **RevenueSplitter**: Auto-splits revenue 60/25/15

### Revenue Split
- **60%**: Patients
- **25%**: Hospital
- **15%**: Platform

## HashScan Links

### Transaction
```
https://hashscan.io/testnet/transaction/{transactionId}
```

### Topic
```
https://hashscan.io/testnet/topic/{topicId}
```

## Troubleshooting

### Common Errors

**"OPERATOR_ID required"**
- Check `.env` file exists
- Verify all required variables set

**"Transaction failed"**
- Check HBAR balance
- Verify network (testnet)
- Check account credentials

**"File not found"**
- Check file path
- Verify file exists
- Check current directory

## Project Structure

```
medipact/
├── adapter/          # Core engine
│   ├── data/        # Input/output
│   ├── src/         # Source code
│   └── scripts/     # Utilities
├── contracts/        # Smart contracts
│   ├── contracts/   # Solidity files
│   └── scripts/     # Deployment
└── docs/            # Documentation
    └── tutorial/    # Tutorials
```

## Useful Links

- **Hedera Portal**: https://portal.hedera.com/
- **HashScan**: https://hashscan.io/
- **FHIR Spec**: https://www.hl7.org/fhir/
- **LOINC Codes**: https://loinc.org/

## Next Steps

- Read full tutorial: [README.md](./README.md)
- Start with: [Introduction](./01-introduction.md)
- Run demo: [First Demo](./16-first-demo.md)

