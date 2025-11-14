# Step-by-Step Integration Guide

Follow these steps in order to complete the backend integration and testing.

---

## STEP 1: Set Up Environment Variables (15 minutes)

### 1.1 Check Existing Environment Files

First, let's see what environment variables you already have:

```bash
# Check adapter environment
cat ../adapter/.env

# Check contracts environment  
cat ../contracts/.env
```

### 1.2 Create Frontend Environment File

Create `.env.local` in the frontend directory:

```bash
cd /home/najuna/medipact-workspace/medipact/frontend
touch .env.local
```

### 1.3 Add Required Variables

Open `.env.local` and add the following content. **Replace the placeholder values with your actual credentials:**

```env
# ============================================
# Hedera Network Configuration
# ============================================
# Get these values from your adapter/.env file
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_ACCOUNT_ID=0.0.xxxxx
NEXT_PUBLIC_HEDERA_PRIVATE_KEY=0x...

# ============================================
# Smart Contract Addresses
# ============================================
# Get these from contract deployment output
# If contracts are not deployed yet, leave empty or comment out
NEXT_PUBLIC_CONSENT_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_REVENUE_SPLITTER_ADDRESS=0x...

# ============================================
# Adapter Configuration
# ============================================
# Path to adapter directory (relative to frontend)
ADAPTER_PATH=../../adapter

# ============================================
# Optional: Local Currency
# ============================================
# Uncomment and set if you want local currency display
# NEXT_PUBLIC_LOCAL_CURRENCY_CODE=UGX
# NEXT_PUBLIC_USD_TO_LOCAL_RATE=3700
```

### 1.4 How to Get Your Values

**For Hedera Credentials:**
1. Open `../adapter/.env`
2. Copy `OPERATOR_ID` → use as `NEXT_PUBLIC_HEDERA_ACCOUNT_ID`
3. Copy `OPERATOR_KEY` → use as `NEXT_PUBLIC_HEDERA_PRIVATE_KEY`
4. Copy `HEDERA_NETWORK` → use as `NEXT_PUBLIC_HEDERA_NETWORK`

**For Contract Addresses:**
1. If contracts are deployed, check `../contracts/.env` or deployment output
2. Look for `CONSENT_MANAGER_ADDRESS` and `REVENUE_SPLITTER_ADDRESS`
3. They should be in EVM format (0x...)

**Example .env.local file:**
```env
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_ACCOUNT_ID=0.0.7156417
NEXT_PUBLIC_HEDERA_PRIVATE_KEY=0x519669071785c63d0938f89eacd4632332ec152eafcecacb984c8a89f72f85c7
ADAPTER_PATH=../../adapter
# NEXT_PUBLIC_CONSENT_MANAGER_ADDRESS=0x1234567890abcdef...
# NEXT_PUBLIC_REVENUE_SPLITTER_ADDRESS=0xabcdef1234567890...
```

### 1.5 Verify Environment File

```bash
# Check that .env.local exists and has content
cat .env.local

# Verify it's in .gitignore (should not be committed)
grep .env.local .gitignore
```

**✅ Checkpoint:** You should see your environment variables in `.env.local`

---

## STEP 2: Verify Adapter Setup (10 minutes)

### 2.1 Check Adapter Directory

```bash
# Verify adapter directory exists
ls -la ../../adapter

# Check adapter has dependencies installed
ls ../../adapter/node_modules 2>/dev/null || echo "Adapter dependencies not installed"
```

### 2.2 Install Adapter Dependencies (if needed)

```bash
cd ../../adapter
npm install
cd ../../frontend
```

### 2.3 Verify Adapter Environment

```bash
# Check adapter has .env file
cat ../../adapter/.env | head -5

# Should see OPERATOR_ID, OPERATOR_KEY, HEDERA_NETWORK
```

### 2.4 Test Adapter Manually (Optional)

```bash
# Test adapter works independently
cd ../../adapter
node src/index.js
# Should process data and create topics
cd ../../frontend
```

**✅ Checkpoint:** Adapter directory exists and has required files

---

## STEP 3: Start Development Server (5 minutes)

### 3.1 Install Frontend Dependencies (if needed)

```bash
cd /home/najuna/medipact-workspace/medipact/frontend
npm install
```

### 3.2 Start the Server

```bash
npm run dev
```

**Expected Output:**
```
▲ Next.js 15.5.6
- Local:        http://localhost:3000
- Network:      http://192.168.x.x:3000
✓ Ready in X.Xs
```

### 3.3 Open Browser

Open: http://localhost:3000 (or the port shown)

**✅ Checkpoint:** Frontend loads in browser without errors

---

## STEP 4: Test Adapter Integration (30 minutes)

### 4.1 Navigate to Processing Page

1. Open browser: http://localhost:3000
2. Click "Admin" in navigation
3. Click "Processing" or go to: http://localhost:3000/admin/processing

### 4.2 Prepare Test CSV File

Create a test CSV file with sample data:

**Create `test-data.csv` in your Downloads or Desktop:**

```csv
Patient ID,Name,Age,Gender,Diagnosis,Date
P001,John Doe,45,M,Diabetes,2024-01-15
P002,Jane Smith,32,F,Hypertension,2024-01-16
P003,Bob Johnson,28,M,Asthma,2024-01-17
```

**Or use existing data:**
- Check if `../../adapter/data/raw_data.csv` exists
- You can use that file for testing

### 4.3 Upload and Process File

1. Click "Select Files" or drag CSV file
2. Click "Process" button
3. **Watch for:**
   - Loading spinner appears
   - Status updates in real-time
   - Results appear after processing

### 4.4 Verify Results

**Expected Results:**
- ✅ Records Processed: (number of rows)
- ✅ Consent Proofs: (number of unique patients)
- ✅ Data Proofs: (number of records)
- ✅ Consent Topic ID: 0.0.xxxxx
- ✅ Data Topic ID: 0.0.xxxxx
- ✅ Transaction list with HashScan links
- ✅ Revenue split display

### 4.5 Check Console for Errors

Open browser DevTools (F12):
- Console tab: Should have no red errors
- Network tab: Check API calls succeed (status 200)

**✅ Checkpoint:** File uploads, processes, and displays results

---

## STEP 5: Test Hedera Integration (20 minutes)

### 5.1 Navigate to Transactions Page

1. Go to: http://localhost:3000/admin/transactions
2. **Expected:** List of transactions from Hedera mirror node

### 5.2 Verify Transaction Display

**Check for:**
- ✅ Transaction IDs displayed
- ✅ HashScan links work (click to verify)
- ✅ Transaction types (consent/data)
- ✅ Timestamps
- ✅ Real-time updates (should refresh every 5 seconds)

### 5.3 Test HashScan Links

1. Click any HashScan link
2. Should open HashScan.io in new tab
3. Should show transaction details

### 5.4 Test Topic Viewer

1. If you see a topic ID in results, click it
2. Or go to: http://localhost:3000/admin/processing
3. After processing, topic IDs should be clickable

**✅ Checkpoint:** Transactions load and display correctly

---

## STEP 6: Test Smart Contract Integration (20 minutes)

### 6.1 Check Contract Addresses

```bash
# Verify contract addresses in .env.local
cat .env.local | grep CONSENT_MANAGER_ADDRESS
cat .env.local | grep REVENUE_SPLITTER_ADDRESS
```

**If addresses are empty:**
- Contracts may not be deployed yet
- This is OK for testing adapter and Hedera features
- Skip contract testing for now

### 6.2 Test Consent Reading (if contracts deployed)

1. Navigate to: http://localhost:3000/patient/dashboard
2. Or go to: http://localhost:3000/hospital/consent
3. Enter a patient ID that has consent recorded
4. **Expected:** Consent record displays with:
   - Patient ID
   - Anonymous ID
   - HCS Topic ID
   - Valid/Invalid status

### 6.3 Test Revenue Contract (if deployed)

1. Navigate to: http://localhost:3000/admin/revenue
2. **Expected:** Revenue data from contract
3. Check balance and payout history

**✅ Checkpoint:** Contract reading works (if contracts deployed)

---

## STEP 7: Troubleshooting Common Issues (As Needed)

### Issue 1: "Adapter not found" or "Cannot find module"

**Solution:**
```bash
# Verify adapter path
cd /home/najuna/medipact-workspace/medipact/frontend
ls -la ../../adapter/src/index.js

# Check ADAPTER_PATH in .env.local
cat .env.local | grep ADAPTER_PATH

# Should be: ADAPTER_PATH=../../adapter
```

### Issue 2: "Hedera credentials not configured"

**Solution:**
```bash
# Check .env.local has all required variables
cat .env.local

# Verify format:
# NEXT_PUBLIC_HEDERA_ACCOUNT_ID=0.0.xxxxx (no quotes)
# NEXT_PUBLIC_HEDERA_PRIVATE_KEY=0x... (no quotes)
```

### Issue 3: "Transactions not loading"

**Solution:**
1. Check network connectivity
2. Verify Hedera network is correct (testnet/mainnet)
3. Check browser console for API errors
4. Try accessing mirror node directly:
   ```bash
   curl https://testnet.mirrornode.hedera.com/api/v1/transactions?limit=5
   ```

### Issue 4: "File processing fails"

**Solution:**
```bash
# Check adapter has .env file
cat ../../adapter/.env

# Check adapter dependencies
cd ../../adapter
npm list @hashgraph/sdk

# Test adapter manually
node src/index.js
```

### Issue 5: "Contract reading fails"

**Solution:**
1. Verify contract addresses are correct (EVM format: 0x...)
2. Check contracts are deployed on correct network
3. Verify RPC endpoint is accessible:
   ```bash
   curl https://testnet.hashio.io/api
   ```

---

## STEP 8: Verify Complete Integration (15 minutes)

### 8.1 End-to-End Test Flow

**Complete this flow:**

1. **Upload File:**
   - Go to `/admin/processing`
   - Upload CSV file
   - Click "Process"
   - ✅ Processing completes

2. **View Results:**
   - ✅ Results display
   - ✅ Topic IDs shown
   - ✅ Transaction list populated

3. **View Transactions:**
   - Go to `/admin/transactions`
   - ✅ Transactions appear
   - ✅ HashScan links work

4. **View Revenue:**
   - Go to `/admin/revenue`
   - ✅ Revenue split displays
   - ✅ Calculations correct (60/25/15)

### 8.2 Final Checklist

- [ ] Environment variables configured
- [ ] Adapter processes files successfully
- [ ] Transactions load from mirror node
- [ ] HashScan links work
- [ ] Real-time updates work
- [ ] No console errors
- [ ] All pages load correctly

---

## STEP 9: Next Actions

### If Everything Works:

1. **Document your setup:**
   - Note your environment configuration
   - Document any custom settings

2. **Test with real data:**
   - Use actual hospital data (anonymized)
   - Test with larger files

3. **Prepare for deployment:**
   - Set up production environment variables
   - Configure production adapter path
   - Set up monitoring

### If Issues Found:

1. **Check error messages:**
   - Browser console
   - Server logs
   - Network tab

2. **Verify configuration:**
   - Environment variables
   - File paths
   - Network connectivity

3. **Test components individually:**
   - Adapter: Test standalone
   - Hedera: Test mirror node access
   - Contracts: Test RPC connection

---

## Quick Reference Commands

```bash
# Start development server
cd /home/najuna/medipact-workspace/medipact/frontend
npm run dev

# Check environment variables
cat .env.local

# Test adapter manually
cd ../../adapter && node src/index.js

# Check adapter environment
cat ../../adapter/.env

# View logs
# In browser: F12 → Console tab
# In terminal: Check npm run dev output
```

---

## Success Criteria

You've successfully completed integration when:

✅ Files upload and process without errors
✅ Results display with correct counts
✅ Transactions appear in real-time
✅ HashScan links open correctly
✅ All pages load without errors
✅ No red errors in browser console

---

**Estimated Total Time: 2-3 hours**

**Need Help?** Check the troubleshooting section or review error messages in browser console.

