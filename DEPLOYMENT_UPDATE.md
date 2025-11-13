# Deployment Update Guide

## Changes Summary

This update implements dynamic revenue distribution with per-patient hospital attribution. Key changes:

1. **New RevenueSplitter Contract Function**: `distributeRevenueTo()` for dynamic addresses
2. **Database Schema Updates**: Added `evm_address` columns to `patient_identities`, `hospitals`, and `researchers` tables
3. **Dataset Revenue Distribution**: Equal split among patients, with each patient's hospital getting their share
4. **Smart Contract Addresses**: Updated contract addresses from latest deployment

## Railway (Backend) Environment Variables

### Required Updates

1. **Smart Contract Addresses** (from latest deployment):
   ```env
   CONSENT_MANAGER_ADDRESS="0xf2423F1E568eC90921045be96Ad2D618fCcd9841"
   REVENUE_SPLITTER_ADDRESS="0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392"
   ```

2. **Network Configuration** (ensure testnet):
   ```env
   HEDERA_NETWORK="testnet"
   ```

3. **Operator Credentials** (your testnet account):
   ```env
   OPERATOR_ID="0.0.xxxxx"
   OPERATOR_KEY="0x..."
   ```

### Optional (Backward Compatibility)

These are optional and only used for the old `distributeRevenue()` function:
```env
PATIENT_WALLET="0x..."  # Optional
HOSPITAL_WALLET="0x..."  # Optional
MEDIPACT_WALLET="0x..."  # Required: fixed platform wallet (15% of revenue)
```

### Database Migration

The database will automatically add `evm_address` columns when the backend starts:
- PostgreSQL: Migration runs automatically on startup
- SQLite: Migration runs automatically on startup

**No manual migration needed** - the code handles it automatically.

### Steps to Update Railway

1. **Go to Railway Dashboard** → Your Backend Service
2. **Navigate to Variables Tab**
3. **Update/Create these variables**:
   - `CONSENT_MANAGER_ADDRESS` = `0xf2423F1E568eC90921045be96Ad2D618fCcd9841`
   - `REVENUE_SPLITTER_ADDRESS` = `0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392`
   - `HEDERA_NETWORK` = `testnet` (if not already set)
   - Verify `OPERATOR_ID` and `OPERATOR_KEY` are set correctly

4. **Redeploy** (Railway should auto-deploy on git push, but you can trigger manually):
   - Go to Deployments tab
   - Click "Redeploy" if needed

5. **Check Logs** after deployment:
   - Look for: "Database migration: evm_address columns added successfully"
   - Verify no errors during startup

## Vercel (Frontend) Environment Variables

### Required Updates

1. **Smart Contract Addresses** (if frontend displays them):
   ```env
   NEXT_PUBLIC_CONSENT_MANAGER_ADDRESS="0xf2423F1E568eC90921045be96Ad2D618fCcd9841"
   NEXT_PUBLIC_REVENUE_SPLITTER_ADDRESS="0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392"
   ```

2. **Backend API URL** (if not already set):
   ```env
   NEXT_PUBLIC_API_URL="https://your-railway-backend.railway.app"
   ```

### Steps to Update Vercel

1. **Go to Vercel Dashboard** → Your Frontend Project
2. **Navigate to Settings → Environment Variables**
3. **Update/Create these variables**:
   - `NEXT_PUBLIC_CONSENT_MANAGER_ADDRESS` = `0xf2423F1E568eC90921045be96Ad2D618fCcd9841`
   - `NEXT_PUBLIC_REVENUE_SPLITTER_ADDRESS` = `0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392`
   - Verify `NEXT_PUBLIC_API_URL` points to your Railway backend

4. **Redeploy**:
   - Vercel should auto-deploy on git push
   - Or go to Deployments tab → Click "Redeploy"

## Verification Steps

After deployment, verify everything works:

### 1. Check Backend Health
```bash
curl https://your-railway-backend.railway.app/health
```

### 2. Test Account Creation
- Register a hospital or researcher
- Verify they get a Hedera testnet account ID
- Check that `evm_address` is stored in database

### 3. Test Revenue Distribution
- Create a dataset with patients from multiple hospitals
- Purchase the dataset via marketplace API
- Verify revenue is distributed correctly:
  - Equal split among patients
  - Each patient's hospital gets their 25% share
  - Platform gets 15%

### 4. Check HashScan
- Verify transactions on HashScan testnet:
  - https://hashscan.io/testnet/contract/0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392
  - Look for `distributeRevenueTo` function calls

## Rollback Plan

If something goes wrong:

1. **Railway**: 
   - Go to Deployments tab
   - Find previous working deployment
   - Click "Redeploy" on that version

2. **Vercel**:
   - Go to Deployments tab
   - Find previous working deployment
   - Click "..." → "Promote to Production"

3. **Database**: 
   - The `evm_address` columns are nullable, so old code will still work
   - No data loss if you rollback

## Notes

- All accounts created will be **testnet accounts** (as long as `HEDERA_NETWORK="testnet"`)
- The new `distributeRevenueTo()` function uses dynamic addresses from the database
- Old `distributeRevenue()` function still works for backward compatibility
- Database migrations run automatically - no manual SQL needed

## Support

If you encounter issues:
1. Check Railway logs for backend errors
2. Check Vercel logs for frontend errors
3. Verify all environment variables are set correctly
4. Ensure database connection is working

