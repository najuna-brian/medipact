# Hedera Account ID Integration

## Overview

MediPact now integrates **native Hedera Account IDs** alongside existing identifiers. Every patient and hospital automatically receives a Hedera account (0.0.xxxxx) when they register, making the platform fully native to the Hedera ecosystem. 

**Important**: Hedera Account IDs complement (not replace) existing identifiers:
- **Hospitals**: Still use Hospital ID + API Key for authentication
- **Patients**: Still use UPI for medical record access
- **Hedera Account IDs**: Used for blockchain operations, smart contracts, and future transactions

## Architecture

### Hybrid Approach

- **Hedera Account IDs**: Native Hedera identifier (0.0.xxxxx) for blockchain operations
- **Hospital ID + API Key**: Primary authentication for web application (unchanged)
- **UPI**: Primary patient identifier for medical records (unchanged)
- **Platform-Managed Keys**: Encrypted private keys stored securely
- **Dual Identity System**: 
  - Web app uses Hospital ID/UPI for authentication
  - Blockchain uses Hedera Account IDs for transactions

### Account Creation Flow

```
User Registration:
1. User fills registration form
2. Backend creates primary identifier (Hospital ID or UPI)
3. Backend creates Hedera Account → Gets Account ID (0.0.1234567)
4. Backend encrypts private key → Stores in database
5. Backend stores Account ID with user record
6. User receives both identifiers in response:
   - Primary ID (Hospital ID/UPI) for authentication
   - Hedera Account ID for blockchain operations
7. Authentication continues using primary ID
8. Blockchain operations use Hedera Account ID
```

## Implementation Details

### Backend Services

#### 1. Hedera Account Service (`backend/src/services/hedera-account-service.js`)
- Creates Hedera accounts using operator credentials
- Platform pays for account creation
- Returns Account ID and private key (must be encrypted before storage)
- Supports bulk account creation

#### 2. Encryption Service (`backend/src/services/encryption-service.js`)
- AES-256-GCM encryption for private keys
- Secure key derivation using PBKDF2
- Encrypts/decrypts sensitive data

#### 3. Database Schema
- `patient_identities`: Added `hedera_account_id` and `encrypted_private_key`
- `hospitals`: Added `hedera_account_id` and `encrypted_private_key`
- Indexes for fast lookups by Account ID

### Registration Flows

#### Patient Registration
- **Single Registration**: Creates Hedera account automatically
- **Bulk Registration**: Creates account for each new patient
- **Account ID**: Returned in registration response

#### Hospital Registration
- Creates Hedera account during registration
- Account ID displayed with Hospital ID and API Key
- Used for all hospital operations

### API Responses

All registration and lookup endpoints now include `hederaAccountId`:

```json
{
  "upi": "UPI-23F009F1A1EC32A8",
  "hederaAccountId": "0.0.1234567",
  "message": "Patient registered successfully"
}
```

```json
{
  "hospitalId": "HOSP-34D653A711D8",
  "hederaAccountId": "0.0.2345678",
  "apiKey": "..."
}
```

## Frontend Integration

### Components

#### HederaAccountId Component
- Displays Account ID with HashScan link
- Clickable to view on HashScan
- Shows "Not assigned" if Account ID missing

### Pages Updated

1. **Patient Dashboard**: Shows Account ID below UPI
2. **Hospital Dashboard**: Shows Account ID in header
3. **Hospital Enrollment**: Shows Account ID after registration
4. **Patient Registration**: Success message mentions Account creation

## Security

### Private Key Management

- **Encryption**: AES-256-GCM with PBKDF2 key derivation
- **Storage**: Encrypted keys stored in database
- **Access**: Only backend can decrypt (for transaction signing)
- **Production**: Should use key management service (AWS KMS, HashiCorp Vault)

### Environment Variables

```env
# Hedera Configuration (Required)
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"

# Encryption Key (Required)
# Generate: openssl rand -hex 32
ENCRYPTION_KEY="your-32-byte-hex-key"
```

## Cost Analysis

### Testnet
- **Account Creation**: Free
- **HBAR**: Free from faucet
- **No Cost**: Unlimited accounts

### Mainnet
- **Account Creation**: ~$0.001 USD per account
- **10,000 users**: ~$10 USD
- **100,000 users**: ~$100 USD
- **Platform pays**: All account creation costs

## Benefits

### For Hackathon

1. **Native Hedera Integration**: Every user has a real Hedera account
2. **Impressive Demo**: Show Account IDs with HashScan links
3. **Future-Ready**: Ready for user-signed transactions
4. **Scalable**: Bulk account creation support

### For Production

1. **Native Ecosystem**: Fully integrated with Hedera
2. **Transaction Ready**: Accounts can receive/send HBAR
3. **Smart Contract Ready**: Account IDs used in contracts
4. **Audit Trail**: All accounts visible on HashScan

## Usage Examples

### Patient Registration Response

```json
{
  "upi": "UPI-23F009F1A1EC32A8",
  "hederaAccountId": "0.0.1234567",
  "message": "Patient registered successfully",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Hospital Registration Response

```json
{
  "hospitalId": "HOSP-34D653A711D8",
  "hederaAccountId": "0.0.2345678",
  "name": "City General Hospital",
  "apiKey": "...",
  "message": "Hospital registered successfully"
}
```

### Patient Summary Response

```json
{
  "upi": "UPI-23F009F1A1EC32A8",
  "hederaAccountId": "0.0.1234567",
  "totalRecords": 42,
  "hospitalCount": 3,
  "testTypes": { "Blood Test": 20, "X-Ray": 22 }
}
```

## HashScan Integration

All Account IDs are linked to HashScan for verification:

- **Testnet**: `https://hashscan.io/testnet/account/0.0.1234567`
- **Mainnet**: `https://hashscan.io/mainnet/account/0.0.1234567`

Users can click the link to view their account on HashScan.

## Error Handling

- **Account Creation Fails**: Registration continues without Account ID
- **Account can be created later**: Retry mechanism available
- **Graceful Degradation**: System works even if Hedera is unavailable

## Future Enhancements

1. **Wallet Integration**: Users can connect their own wallets
2. **User-Signed Transactions**: Patients sign their own consent
3. **Direct HBAR Payments**: Patients receive payments directly
4. **Account Recovery**: Key recovery mechanisms

## Testing

### Test Registration

1. Register a patient → Check for `hederaAccountId` in response
2. Register a hospital → Check for `hederaAccountId` in response
3. View dashboards → Verify Account IDs display with HashScan links
4. Click HashScan link → Verify account exists on HashScan

### Verify Account Creation

```bash
# Check database
sqlite3 backend/data/medipact.db "SELECT upi, hedera_account_id FROM patient_identities LIMIT 5;"
sqlite3 backend/data/medipact.db "SELECT hospital_id, hedera_account_id FROM hospitals LIMIT 5;"
```

## Related Files

- `backend/src/services/hedera-account-service.js` - Account creation
- `backend/src/services/encryption-service.js` - Key encryption
- `backend/src/db/database.js` - Schema updates
- `frontend/src/components/HederaAccountId/HederaAccountId.tsx` - Display component
- `frontend/src/lib/hedera/hashscan.ts` - HashScan link generation

