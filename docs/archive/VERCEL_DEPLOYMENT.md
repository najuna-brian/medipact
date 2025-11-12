# Vercel Deployment Guide for MediPact Frontend

This guide will walk you through deploying the MediPact frontend to Vercel.

---

## Prerequisites

- GitHub account
- Railway backend deployed (see [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md))
- Your Railway backend URL

---

## Step 1: Sign Up for Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with **GitHub** (recommended - easiest)
4. Authorize Vercel to access your GitHub account

---

## Step 2: Import Your Project

1. Once logged in, click **"Add New..."** → **"Project"**
2. You'll see a list of your GitHub repositories
3. Find and select your **`medipact`** repository
4. Click **"Import"**

---

## Step 3: Configure Project Settings

### 3.1 Framework Settings

Vercel should auto-detect Next.js, but verify:

1. **Framework Preset**: Should show **"Next.js"** ✅
2. **Root Directory**: Click **"Edit"** and set to `frontend`
   - This tells Vercel where your frontend code is
3. **Build Command**: `npm run build` (default - keep this)
4. **Output Directory**: `.next` (default - keep this)
5. **Install Command**: `npm install` (default - keep this)

### 3.2 Environment Variables

Click **"Environment Variables"** and add each variable:

```env
# Backend API URL (from Railway)
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend.up.railway.app

# Hedera Configuration
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_ACCOUNT_ID=0.0.7156417
NEXT_PUBLIC_HEDERA_PRIVATE_KEY=0x519669071785c63d0938f89eacd4632332ec152eafcecacb984c8a89f72f85c7

# Smart Contract Addresses (optional - add after deploying contracts)
# NEXT_PUBLIC_CONSENT_MANAGER_ADDRESS=0x...
# NEXT_PUBLIC_REVENUE_SPLITTER_ADDRESS=0x...

# Adapter Path (optional - for local processing)
# ADAPTER_PATH=../../adapter

# Optional: Local Currency
# NEXT_PUBLIC_LOCAL_CURRENCY_CODE=UGX
# NEXT_PUBLIC_USD_TO_LOCAL_RATE=3700
```

**Important Notes:**
- Replace `https://your-backend.up.railway.app` with your actual Railway backend URL
- All `NEXT_PUBLIC_*` variables are exposed to the browser (safe for public values)
- Don't put secrets in `NEXT_PUBLIC_*` variables

---

## Step 4: Deploy

1. Click **"Deploy"** button
2. Wait 2-3 minutes for:
   - Dependencies installation
   - Build process
   - Deployment
3. Vercel will show you a URL: `https://your-app.vercel.app`
4. **Save this URL** - you'll need it to update Railway CORS

---

## Step 5: Update Backend CORS

Now that you have your Vercel URL:

1. Go back to **Railway**
2. Go to your backend service → **"Variables"** tab
3. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
4. Railway will automatically redeploy with new CORS settings

---

## Step 6: Test Your Deployment

### 6.1 Visit Your Site

1. Go to your Vercel URL: `https://your-app.vercel.app`
2. Check if the homepage loads
3. Try navigating to different pages

### 6.2 Test API Connection

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try an action that calls the backend (e.g., register patient)
4. Check if API calls succeed

### 6.3 Check for Errors

1. In Vercel dashboard, go to **"Deployments"**
2. Click on your deployment
3. Check **"Functions"** tab for any errors
4. Check **"Logs"** tab for runtime errors

---

## Step 7: Automatic Deployments

Vercel automatically deploys when you:
- Push to `main` branch → Production deployment
- Push to other branches → Preview deployment
- Open a Pull Request → Preview deployment

### Preview Deployments

- Each PR gets its own URL
- Test changes before merging
- Share with team for review

---

## Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain (e.g., `medipact.com`)
4. Follow DNS configuration instructions
5. Vercel will provide DNS records to add

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_BACKEND_API_URL` | ✅ Yes | Railway backend URL |
| `NEXT_PUBLIC_HEDERA_NETWORK` | ✅ Yes | `testnet` or `mainnet` |
| `NEXT_PUBLIC_HEDERA_ACCOUNT_ID` | ✅ Yes | Hedera account ID |
| `NEXT_PUBLIC_HEDERA_PRIVATE_KEY` | ✅ Yes | Hedera private key |
| `NEXT_PUBLIC_CONSENT_MANAGER_ADDRESS` | ❌ No | Smart contract address |
| `NEXT_PUBLIC_REVENUE_SPLITTER_ADDRESS` | ❌ No | Smart contract address |
| `ADAPTER_PATH` | ❌ No | Path to adapter (optional) |

**Note**: All `NEXT_PUBLIC_*` variables are public (exposed to browser). Never put secrets here!

---

## Troubleshooting

### Build Fails

**Check:**
- Build logs in Vercel dashboard
- All dependencies are in `package.json`
- TypeScript errors (run `npm run type-check` locally)

**Common Issues:**
- Missing dependencies → Add to `package.json`
- TypeScript errors → Fix type errors
- Build timeout → Optimize build (remove unused code)

### Frontend Can't Connect to Backend

**Check:**
- `NEXT_PUBLIC_BACKEND_API_URL` is correct
- Backend is running (check Railway)
- CORS is configured (check `FRONTEND_URL` in Railway)

**Test:**
```bash
curl https://your-backend.up.railway.app/health
```

### Environment Variables Not Working

**Check:**
- Variables are set in Vercel dashboard
- Variables start with `NEXT_PUBLIC_` for browser access
- Redeploy after adding variables

**Fix:**
- Add variables in Vercel dashboard
- Click **"Redeploy"** after adding

---

## Performance Optimization

Vercel automatically optimizes Next.js apps:
- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ Edge caching
- ✅ CDN distribution

### Check Performance

1. Go to **Analytics** tab in Vercel
2. See page load times
3. See API response times
4. Monitor errors

---

## Next Steps

1. ✅ Frontend is deployed
2. ✅ Backend CORS is updated
3. ⏭️ Test your full application
4. ⏭️ Set up custom domain (optional)
5. ⏭️ Enable analytics (optional)

---

**Vercel Docs**: https://vercel.com/docs

