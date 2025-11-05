# Hedera Testnet Account Information

**⚠️ IMPORTANT**: This file contains account information. The actual `.env` file with credentials is gitignored.

## Testnet Account Details

### ECDSA Account (Primary)
- **Account ID**: `0.0.7156417`
- **EVM Address**: `0x3d4c1c5eb829a3123fa934d01da6ce013d384cb7`
- **Private Key**: Stored in `adapter/.env` (gitignored)
- **Balance**: ~989.71 ℏ (as of setup)
- **Account Type**: ECDSA

### ED25519 Account (Alternative)
- **Account ID**: `0.0.7180344`
- **Balance**: ~999.43 ℏ
- **Account Type**: ED25519

## Usage

Credentials are stored in `adapter/.env` (gitignored).

The adapter uses the ECDSA account (`0.0.7156417`) for HCS operations.

## Account Management

- **Dashboard**: https://portal.hedera.com/dashboard
- **Faucet**: Available on dashboard for testnet refills
- **Network**: Testnet

## Security Notes

- ✅ `.env` file is gitignored
- ✅ Never commit private keys to git
- ✅ This file is informational only (no actual keys here)
- ✅ Use testnet account only for development

