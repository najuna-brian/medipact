# Quick Start Guide - Next Steps

## ✅ STEP 1: Environment Setup (DONE)

Your `.env.local` file has been created with:
- ✅ Hedera network: testnet
- ✅ Account ID: 0.0.7156417
- ✅ Private key: configured
- ✅ Adapter path: ../../adapter

**Note:** Contract addresses are commented out (contracts not deployed yet). This is OK - you can test adapter and Hedera features without contracts.

---

## 🚀 STEP 2: Start the Development Server

Run this command:

```bash
cd /home/najuna/medipact-workspace/medipact/frontend
npm run dev
```

**Expected output:**
```
▲ Next.js 15.5.6
- Local:        http://localhost:3000
✓ Ready in X.Xs
```

**Then open:** http://localhost:3000

---

## 📋 STEP 3: Test Adapter Integration

### 3.1 Navigate to Processing Page

1. Open browser: http://localhost:3000
2. Click "Admin" in navigation
3. Click "Processing" or go directly to: http://localhost:3000/admin/processing

### 3.2 Prepare Test CSV File

**Option A: Use existing test data**
```bash
# Check if adapter has test data
ls ../../adapter/data/raw_data.csv
```

**Option B: Create simple test file**

Create a file called `test-data.csv` with this content:

```csv
Patient ID,Name,Age,Gender,Diagnosis,Date
P001,John Doe,45,M,Diabetes,2024-01-15
P002,Jane Smith,32,F,Hypertension,2024-01-16
P003,Bob Johnson,28,M,Asthma,2024-01-17
```

### 3.3 Upload and Process

1. On the processing page, click "Select Files"
2. Choose your CSV file
3. Click "Process" button
4. **Wait for processing** (may take 30-60 seconds)

### 3.4 What to Expect

**During Processing:**
- Loading spinner appears
- Status updates show progress
- "Processing..." message

**After Processing:**
- ✅ Records Processed: 3 (or number of rows)
- ✅ Consent Proofs: 3 (one per unique patient)
- ✅ Data Proofs: 3 (one per record)
- ✅ Consent Topic ID: 0.0.xxxxx
- ✅ Data Topic ID: 0.0.xxxxx
- ✅ Transaction list with HashScan links
- ✅ Revenue split display (60% patient, 25% hospital, 15% MediPact)

### 3.5 Verify Results

**Check these:**
- [ ] File uploaded successfully
- [ ] Processing completed without errors
- [ ] Results display correctly
- [ ] Topic IDs are shown
- [ ] HashScan links are present
- [ ] Revenue split is calculated

**If errors occur:**
- Open browser DevTools (F12)
- Check Console tab for error messages
- Check Network tab for failed API calls

---

## 🔍 STEP 4: Test Hedera Integration

### 4.1 View Transactions

1. Navigate to: http://localhost:3000/admin/transactions
2. **Expected:** List of transactions from Hedera mirror node

**What you should see:**
- Transaction IDs
- Transaction types (consent/data)
- Timestamps
- HashScan links

### 4.2 Test HashScan Links

1. Click any HashScan link
2. Should open HashScan.io in new tab
3. Should show transaction details on Hedera testnet

### 4.3 Verify Real-Time Updates

- Transactions should auto-refresh every 5 seconds
- New transactions appear automatically
- No page refresh needed

---

## ✅ STEP 5: Verify Everything Works

### Complete Checklist

- [ ] Development server starts without errors
- [ ] Homepage loads correctly
- [ ] Navigation works
- [ ] File upload works
- [ ] Processing completes successfully
- [ ] Results display correctly
- [ ] Transactions page loads
- [ ] HashScan links work
- [ ] No console errors (F12 → Console)

---

## 🐛 Common Issues & Solutions

### Issue: "Cannot find module" or "Adapter not found"

**Solution:**
```bash
# Verify adapter path
cd /home/najuna/medipact-workspace/medipact/frontend
ls -la ../../adapter/src/index.js

# Should exist. If not, check ADAPTER_PATH in .env.local
```

### Issue: "Hedera credentials not configured"

**Solution:**
```bash
# Check .env.local exists and has values
cat .env.local

# Restart dev server after changing .env.local
# Stop server (Ctrl+C) and run: npm run dev
```

### Issue: Processing fails or times out

**Solution:**
1. Check adapter has .env file: `cat ../../adapter/.env`
2. Verify adapter dependencies: `cd ../../adapter && npm list`
3. Test adapter manually: `cd ../../adapter && node src/index.js`

### Issue: Transactions not loading

**Solution:**
1. Check network connectivity
2. Verify Hedera network in .env.local is "testnet"
3. Check browser console for API errors
4. Try accessing mirror node: https://testnet.mirrornode.hedera.com/api/v1/transactions?limit=5

---

## 📝 Next Actions After Testing

### If Everything Works:

1. ✅ **Integration Complete!**
2. Test with larger files
3. Test with real hospital data (anonymized)
4. Deploy contracts if needed
5. Set up production environment

### If Issues Found:

1. Check error messages in browser console
2. Review server logs
3. Verify environment variables
4. Test components individually
5. Refer to STEP_BY_STEP_GUIDE.md for detailed troubleshooting

---

## 🎯 Success Indicators

You've successfully completed integration when:

✅ Files upload and process without errors  
✅ Results display with correct counts  
✅ Transactions appear in real-time  
✅ HashScan links open correctly  
✅ All pages load without errors  
✅ No red errors in browser console  

---

## 📚 Additional Resources

- **Detailed Guide:** See `STEP_BY_STEP_GUIDE.md` for comprehensive instructions
- **Troubleshooting:** See `NEXT_STEPS_COMPLETE.md` for detailed troubleshooting
- **API Documentation:** Check `README.md` for API endpoints

---

**Ready to start? Run: `npm run dev` and open http://localhost:3000**

