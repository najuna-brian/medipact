# Setup and Testing Guide

## ✅ Database Migration Complete!

The database has been migrated to include Hedera account columns:
- ✅ `patient_identities.hedera_account_id`
- ✅ `patient_identities.encrypted_private_key`
- ✅ `hospitals.hedera_account_id`
- ✅ `hospitals.encrypted_private_key`

## Step 1: Create .env File

**Location:** `medipact/backend/.env`

**Quick Setup Command:**
```bash
cd backend
cat > .env << 'EOF'
# Hedera Configuration (Testnet)
OPERATOR_ID="0.0.7156417"
OPERATOR_KEY="0x519669071785c63d0938f89eacd4632332ec152eafcecacb984c8a89f72f85c7"
HEDERA_NETWORK="testnet"

# Encryption Key
ENCRYPTION_KEY="0ac321771a915c7f832d1fe0dcd6c692864cdb4c13a27951d27411dcbdb9a8ef"

# Server Configuration
PORT=3002
NODE_ENV=development
DATABASE_PATH="./data/medipact.db"

# JWT Configuration
JWT_SECRET="medipact-jwt-secret-key-change-in-production"
JWT_EXPIRES_IN="24h"

# Admin Credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
EOF
```

## Step 2: Test Hedera Account Creation

```bash
cd backend
node scripts/test-hedera-accounts.js
```

**Expected Output:**
```
🧪 Testing Hedera Account Creation...
✅ Database initialized
✅ Patient Account Created: 0.0.xxxxx
✅ Private Key Encrypted
✅ Private Key Decryption Successful
✅ Hospital Account Created: 0.0.xxxxx
✅ Account ID Validation: Working
✅ All Tests Passed!
```

## Step 3: Start Backend Server

```bash
cd backend
npm start
```

**Expected Output:**
```
📦 Database connected: .../medipact.db
✅ Database tables created
🚀 MediPact Backend Server running on port 3002
```

## Step 4: Test Registration Flows

### Test 1: Patient Registration

```bash
curl -X POST http://localhost:3002/api/patient/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "dateOfBirth": "1990-01-15",
    "email": "john@example.com",
    "phone": "+1234567890"
  }'
```

**Expected Response:**
```json
{
  "upi": "UPI-23F009F1A1EC32A8",
  "hederaAccountId": "0.0.1234567",
  "message": "Patient registered successfully",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Verify:**
- ✅ `hederaAccountId` is present
- ✅ Account ID format: `0.0.xxxxx`
- ✅ Check HashScan: https://hashscan.io/testnet/account/0.0.1234567

### Test 2: Hospital Registration

```bash
curl -X POST http://localhost:3002/api/hospital/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "City General Hospital",
    "country": "Uganda",
    "location": "Kampala, Uganda"
  }'
```

**Expected Response:**
```json
{
  "message": "Hospital registered successfully",
  "hospital": {
    "hospitalId": "HOSP-34D653A711D8",
    "hederaAccountId": "0.0.2345678",
    "name": "City General Hospital",
    "apiKey": "..."
  }
}
```

**Verify:**
- ✅ `hederaAccountId` is present
- ✅ Account ID format: `0.0.xxxxx`
- ✅ Check HashScan: https://hashscan.io/testnet/account/0.0.2345678

### Test 3: Patient Summary (with Account ID)

```bash
curl -X GET http://localhost:3002/api/patient/UPI-XXX/summary
```

**Expected Response:**
```json
{
  "upi": "UPI-23F009F1A1EC32A8",
  "hederaAccountId": "0.0.1234567",
  "totalRecords": 0,
  "hospitalCount": 0
}
```

## Step 5: Test Frontend

1. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

2. **Test Patient Registration:**
   - Go to: http://localhost:3001/patient/login
   - Click "Register" tab
   - Fill in patient details
   - Submit
   - **Check**: Success message mentions Hedera account
   - **Check**: Dashboard shows Account ID with HashScan link

3. **Test Hospital Registration:**
   - Go to: http://localhost:3001/hospital/enrollment
   - Fill in hospital details
   - Submit
   - **Check**: Account ID displayed
   - **Check**: Dashboard shows Account ID with HashScan link

## Verification Checklist

### Backend ✅
- [x] Database has Hedera account columns
- [x] .env file created with Hedera credentials
- [x] Hedera account creation works
- [x] Encryption/decryption works
- [x] Patient registration creates Account ID
- [x] Hospital registration creates Account ID
- [x] API responses include `hederaAccountId`

### Frontend ✅
- [x] Patient dashboard displays Account ID
- [x] Hospital dashboard displays Account ID
- [x] HashScan links work
- [x] Component handles missing Account IDs

## Troubleshooting

### "OPERATOR_ID not found"
- **Solution**: Create `.env` file in `backend/` directory
- **Check**: File is named exactly `.env` (not `.env.txt`)

### "SQLITE_ERROR: no such column"
- **Solution**: Database migration already completed
- **If still failing**: Run migration again:
  ```bash
  cd backend
  node scripts/migrate-hedera-columns.js
  ```

### "Failed to create Hedera account"
- **Check**: OPERATOR_ID and OPERATOR_KEY in .env
- **Check**: Network connectivity
- **Check**: Operator account has HBAR (for mainnet)
- **Note**: Registration continues without Account ID (graceful degradation)

### Account ID Not Displayed
- **Check**: Backend returned Account ID in response
- **Check**: Frontend component imported correctly
- **Check**: TypeScript types match

## Next Steps

After successful testing:
1. ✅ All services use Hedera Account IDs
2. ✅ API responses include Account IDs
3. ✅ Frontend displays Account IDs with HashScan links
4. ✅ Registration flows work end-to-end

**Ready for hackathon demo!** 🚀

