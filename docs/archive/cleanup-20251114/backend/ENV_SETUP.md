# Environment Setup Guide

## Create .env File

Since `.env` files are protected, please create it manually:

**Location:** `medipact/backend/.env`

**Content:**
```env
# Hedera Configuration (Testnet)
OPERATOR_ID="0.0.7156417"
OPERATOR_KEY="0x519669071785c63d0938f89eacd4632332ec152eafcecacb984c8a89f72f85c7"
HEDERA_NETWORK="testnet"

# Encryption Key (for encrypting private keys)
# Generated: openssl rand -hex 32
ENCRYPTION_KEY="0ac321771a915c7f832d1fe0dcd6c692864cdb4c13a27951d27411dcbdb9a8ef"

# Server Configuration
PORT=3002
NODE_ENV=development

# Database (SQLite for dev, PostgreSQL for prod)
DATABASE_PATH="./data/medipact.db"

# JWT Configuration
JWT_SECRET="medipact-jwt-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"

# Admin Default Credentials (change in production)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

## Quick Setup Command

Run this in the `backend` directory:

```bash
cat > .env << 'EOF'
# Hedera Configuration (Testnet)
OPERATOR_ID="0.0.7156417"
OPERATOR_KEY="0x519669071785c63d0938f89eacd4632332ec152eafcecacb984c8a89f72f85c7"
HEDERA_NETWORK="testnet"

# Encryption Key (for encrypting private keys)
ENCRYPTION_KEY="0ac321771a915c7f832d1fe0dcd6c692864cdb4c13a27951d27411dcbdb9a8ef"

# Server Configuration
PORT=3002
NODE_ENV=development

# Database (SQLite for dev, PostgreSQL for prod)
DATABASE_PATH="./data/medipact.db"

# JWT Configuration
JWT_SECRET="medipact-jwt-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"

# Admin Default Credentials (change in production)
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
EOF
```

## Verify Setup

After creating the `.env` file:

```bash
cd backend
node scripts/test-hedera-accounts.js
```

This will test:
- ✅ Hedera account creation
- ✅ Encryption/decryption
- ✅ Account ID validation

## Next Steps

1. Create the `.env` file using the content above
2. Run the test script to verify Hedera integration
3. Start the backend server: `npm start`
4. Test registration flows

