# Smart Contracts Setup & Deployment Guide

## Quick Start

### 1. Install Dependencies

```bash
cd contracts
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your Hedera testnet credentials:

```env
# Required: Your private key in HEX format
OPERATOR_KEY_HEX="0x519669071785c63d0938f89eacd4632332ec152eafcecacb984c8a89f72f85c7"

# Optional: Custom RPC URL
HEDERA_RPC_URL="https://testnet.hashio.io/api"

# Optional: Recipient addresses (for RevenueSplitter)
PATIENT_WALLET="0x..."
HOSPITAL_WALLET="0x..."
MEDIPACT_WALLET="0x..."
```

**Important**: You need your private key in **HEX format**, not DER format.

To convert from DER to HEX:
- If you have DER format: `302e020100300506032b657004220420...`
- Remove the prefix: Remove `302e020100300506032b657004220420` (34 chars)
- Add `0x` prefix: `0x...`

### 3. Compile Contracts

```bash
npm run compile
```

### 4. Run Tests

```bash
npm test
```

### 5. Deploy to Testnet

```bash
npm run deploy:testnet
```

After deployment, you'll get contract addresses like:
```
ConsentManager: 0.0.1234567
RevenueSplitter: 0.0.1234568
```

The deployment script will also create a `deployment-info.json` file with all the details.

## Contract Addresses

After deployment, update your `.env` file with the contract addresses:

```env
CONSENT_MANAGER_ADDRESS="0.0.1234567"
REVENUE_SPLITTER_ADDRESS="0.0.1234568"
```

## Verifying on HashScan

Visit HashScan to view your deployed contracts:
- ConsentManager: `https://hashscan.io/testnet/contract/{CONSENT_MANAGER_ADDRESS}`
- RevenueSplitter: `https://hashscan.io/testnet/contract/{REVENUE_SPLITTER_ADDRESS}`

## Troubleshooting

### Error: "No Hardhat config file found"
- Make sure you're in the `contracts/` directory
- Verify `hardhat.config.js` exists

### Error: "Invalid private key"
- Ensure your private key is in HEX format (starts with `0x`)
- Convert from DER format if needed

### Error: "Insufficient balance"
- Get free testnet HBAR from: https://portal.hedera.com/dashboard
- Contract deployment costs ~$1-2 USD in testnet HBAR

### Error: "Transaction failed"
- Check your account has enough HBAR for gas fees
- Verify network configuration is correct

## Scripts

- `npm run compile` - Compile contracts
- `npm test` - Run tests
- `npm run deploy:testnet` - Deploy to Hedera Testnet
- `npm run deploy:previewnet` - Deploy to Hedera Previewnet
- `npm run clean` - Clean cache and artifacts

## Next Steps

After deployment:
1. Save contract addresses in `.env`
2. Update adapter code to use contract addresses (if needed)
3. Test contract interactions
4. Document addresses in README

