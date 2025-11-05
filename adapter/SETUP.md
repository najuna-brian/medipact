# Adapter Setup Guide

## Quick Setup

### 1. Install Dependencies

```bash
cd adapter
npm install
```

### 2. Create `.env` File

Create a `.env` file in the `adapter/` directory with your Hedera testnet credentials:

```env
ACCOUNT_ID="0.0.7156417"
PRIVATE_KEY="0x519669071785c63d0938f89eacd4632332ec152eafcecacb984c8a89f72f85c7"
HEDERA_NETWORK="testnet"
```

**Note**: The `.env` file is gitignored and will not be committed to the repository.

### 3. Test HCS Integration

```bash
npm run test:hcs
```

This will:
- Create a test topic
- Submit a test message
- Display HashScan links

### 4. Run the Adapter

```bash
npm start
```

## Account Information

See `ACCOUNT_INFO.md` for account details.

---

**Security**: Never commit `.env` files or private keys to git!

