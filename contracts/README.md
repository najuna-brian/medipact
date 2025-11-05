# MediPact Smart Contracts

Smart contracts for the MediPact platform, deployed on Hedera EVM.

## Contracts

- **RevenueSplitter.sol** - Automated revenue distribution (60% Patient, 25% Hospital, 15% MediPact)
- **ConsentManager.sol** - Patient consent record management with HCS topic linking

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Compile Contracts

```bash
npm run compile
```

✅ **No .env file needed for compilation!**

### 3. Run Tests

```bash
npm test
```

✅ **No .env file needed for tests!** (Uses Hardhat's built-in local network)

### 4. Deploy to Testnet (Optional)

**Only when you're ready to deploy**, create a `.env` file:

```bash
cp .env.example .env
# Edit .env with your OPERATOR_KEY_HEX
```

Then deploy:

```bash
npm run deploy:testnet
```

## When Do You Need `.env`?

### ✅ NOT Needed For:
- **Compiling contracts** - Already works without it
- **Running tests** - Uses Hardhat's local network
- **Development** - Everything works locally

### ⚠️ Required For:
- **Deploying to Hedera Testnet** - Needs `OPERATOR_KEY_HEX`
- **Deploying to Previewnet** - Needs `PREVIEWNET_OPERATOR_KEY_HEX`

## Current Status

✅ **Contracts compiled successfully**  
✅ **Ready for testing**  
⏳ **Deployment** - Optional, create `.env` when ready

## Environment Variables

When you're ready to deploy, create `.env` with:

```env
# Required for testnet deployment
OPERATOR_KEY_HEX="0x..." # Your private key in HEX format

# Optional
HEDERA_RPC_URL="https://testnet.hashio.io/api"
PATIENT_WALLET="0x..."
HOSPITAL_WALLET="0x..."
MEDIPACT_WALLET="0x..."
```

## Scripts

- `npm run compile` - Compile contracts (no .env needed)
- `npm test` - Run tests (no .env needed)
- `npm run deploy:testnet` - Deploy to testnet (requires .env)
- `npm run deploy:previewnet` - Deploy to previewnet (requires .env)
- `npm run clean` - Clean cache and artifacts

## Documentation

- [SETUP.md](./SETUP.md) - Detailed setup instructions
- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Complete deployment guide
- [README.md](./README.md) - Contract documentation
- [REVIEW.md](./REVIEW.md) - Code review and best practices

## Summary

**You don't need a `.env` file right now!** 

- ✅ Compilation works
- ✅ Tests can run
- ✅ Development is ready

Create `.env` only when you're ready to deploy to testnet.
