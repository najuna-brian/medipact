# MediPact Adapter

Core engine for processing hospital EHR data, anonymizing it, and submitting proof hashes to Hedera Consensus Service (HCS).

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file in the adapter directory:
```env
ACCOUNT_ID="0.0.xxxxx"
PRIVATE_KEY="0x..."
```

Get free testnet account at: https://portal.hedera.com/dashboard

3. Run the adapter:
```bash
npm start
```

## Usage

The adapter will:
1. Read EHR data from `data/raw_data.csv`
2. Anonymize patient information
3. Generate proof hashes
4. Submit to Hedera HCS
5. Display HashScan links

## Development

All source code is in `src/`:
- `index.js` - Main entry point
- `anonymizer/anonymize.js` - Data anonymization
- `hedera/hcs-client.js` - HCS integration
- `utils/hash.js` - Hash generation utilities


