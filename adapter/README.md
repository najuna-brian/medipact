# MediPact Adapter

Core engine for processing hospital EHR data, anonymizing it, and submitting proof hashes to Hedera Consensus Service (HCS).

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the adapter directory:
```env
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"
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
1. Read EHR data from `data/raw_data.csv`
2. Anonymize patient information (remove PII, generate anonymous IDs)
3. Generate consent and data proof hashes
4. Create HCS topics (Consent Proofs, Data Proofs)
5. Submit proofs to Hedera HCS
6. Display HashScan links for all transactions
7. Show payout simulation (USD + optional local currency)

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
- Medical data is preserved
- Record counts match

## Scripts

- `npm start` - Run the complete adapter flow
- `npm run test:hcs` - Test HCS integration
- `npm run validate` - Validate anonymized output

## Development

All source code is in `src/`:
- `index.js` - Main entry point (orchestrates entire flow)
- `anonymizer/anonymize.js` - Data anonymization (CSV parsing, PII removal)
- `hedera/hcs-client.js` - HCS integration (topic creation, message submission)
- `utils/hash.js` - Cryptographic hash generation (SHA-256)
- `utils/currency.js` - Currency conversion utilities (USD-based)

## Testing

See `TESTING.md` for comprehensive testing guide and test scenarios.

## Configuration

### Environment Variables

Required:
- `OPERATOR_ID` - Hedera operator account ID (the account that pays for transactions)
- `OPERATOR_KEY` - Operator private key (ECDSA format, HEX encoded)
- `HEDERA_NETWORK` - Network to connect to (mainnet, testnet, previewnet, localhost)

Optional:
- `LOCAL_CURRENCY_CODE` - Local currency code (e.g., "UGX", "KES")
- `USD_TO_LOCAL_RATE` - Exchange rate (local currency per USD)

See `SETUP.md` for detailed setup instructions.


