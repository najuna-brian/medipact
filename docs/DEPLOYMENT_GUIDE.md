# MediPact Deployment Guide
## Complete Setup: Vercel + Railway + Supabase

This guide will walk you through deploying MediPact to production using:
- **Vercel** for frontend (Next.js)
- **Railway** for backend API (Express.js)
- **Supabase** for database (PostgreSQL with RLS)

---

## 📋 Prerequisites

Before starting, you'll need:
- A GitHub account (for connecting repositories)
- Email addresses for account creation
- Your Hedera testnet credentials (already have these)

**Estimated Time**: 1-2 hours for complete setup

---

## 🗂️ Table of Contents

1. [Step 1: Create Supabase Account & Database](#step-1-supabase)
2. [Step 2: Create Railway Account & Deploy Backend](#step-2-railway)
3. [Step 3: Create Vercel Account & Deploy Frontend](#step-3-vercel)
4. [Step 4: Configure Environment Variables](#step-4-env-vars)
5. [Step 5: Test Your Deployment](#step-5-testing)
6. [Troubleshooting](#troubleshooting)

---

## Step 1: Create Supabase Account & Database {#step-1-supabase}

### 1.1 Sign Up for Supabase

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"** or **"Sign Up"**
3. Sign up with:
   - **GitHub** (recommended - easiest)
   - OR Email
4. Verify your email if needed

### 1.2 Create a New Project

1. Once logged in, click **"New Project"**
2. Fill in the form:
   - **Name**: `medipact` (or any name you prefer)
   - **Database Password**: 
     - Click "Generate a password" or create a strong password
     - **⚠️ SAVE THIS PASSWORD** - you'll need it later!
     - Example: `YourSecurePassword123!@#`
   - **Region**: Choose closest to your users
     - US East, US West, EU West, etc.
   - **Pricing Plan**: Select **"Free"** (perfect for MVP)
3. Click **"Create new project"**
4. Wait 2-3 minutes for project to initialize

### 1.3 Get Your Database Connection String

1. In your Supabase project dashboard, click **"Settings"** (gear icon) in the left sidebar
2. Click **"Database"** in the settings menu
3. Scroll down to **"Connection string"**
4. Under **"Connection pooling"**, select **"Session mode"**
5. Copy the connection string - it looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
6. **Save this connection string** - you'll need it for Railway

### 1.4 Get Your Supabase Project URL and API Key

1. Still in **Settings** → **"API"**
2. Copy these values:
   - **Project URL**: `https://[PROJECT-REF].supabase.co`
   - **anon/public key**: (starts with `eyJ...`)
   - **service_role key**: (starts with `eyJ...`) - **Keep this secret!**

**Save these values** - you'll need them later.

### 1.5 Run Database Migration

The database tables will be created automatically when the backend connects, but you can also run the migration manually:

1. In Supabase dashboard, click **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. The tables will be created automatically when your backend first connects
4. Or you can run the migration script (we'll provide this)

**✅ Step 1 Complete!** You now have:
- Supabase project created
- Database connection string
- Project URL and API keys

---

## Step 2: Create Railway Account & Deploy Backend {#step-2-railway}

### 2.1 Sign Up for Railway

1. Go to [https://railway.app](https://railway.app)
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with **GitHub** (recommended)
4. Authorize Railway to access your GitHub

### 2.2 Create a New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. If your MediPact repo isn't listed:
   - Click **"Configure GitHub App"**
   - Select repositories (or all repos)
   - Click **"Install"**
4. Select your **`medipact`** repository
5. Railway will detect it's a Node.js project

### 2.3 Configure Backend Service

1. Railway will create a service automatically
2. Click on the service to configure it
3. In **"Settings"**:
   - **Root Directory**: Set to `backend` (since your backend is in a subdirectory)
   - **Start Command**: `npm start`
   - **Healthcheck Path**: `/health`

### 2.4 Set Environment Variables

1. In your Railway service, click **"Variables"** tab
2. Click **"New Variable"** and add each of these:

```env
# Hedera Configuration
OPERATOR_ID=0.0.7156417
OPERATOR_KEY=0x519669071785c63d0938f89eacd4632332ec152eafcecacb984c8a89f72f85c7
HEDERA_NETWORK=testnet

# Encryption Key (generate a new one for production!)
ENCRYPTION_KEY=0ac321771a915c7f832d1fe0dcd6c692864cdb4c13a27951d27411dcbdb9a8ef

# Database - Use your Supabase connection string
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Server Configuration
PORT=3002
NODE_ENV=production

# JWT Configuration (generate a strong secret!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Admin Credentials (change these!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password-123

# CORS - Will be set after Vercel deployment
FRONTEND_URL=https://your-app.vercel.app
```

**Important Notes:**
- Replace `[YOUR-PASSWORD]` with your Supabase database password
- Replace `[PROJECT-REF]` with your Supabase project reference
- Generate a new `ENCRYPTION_KEY` for production (see below)
- Generate a strong `JWT_SECRET` for production

### 2.5 Generate Production Secrets

Run these commands locally to generate secure keys:

```bash
# Generate encryption key
openssl rand -hex 32

# Generate JWT secret (use a long random string)
openssl rand -hex 64
```

### 2.6 Deploy Backend

1. Railway will automatically deploy when you push to GitHub
2. Or click **"Deploy"** button to deploy now
3. Wait for deployment to complete (2-3 minutes)
4. Check the **"Logs"** tab for any errors

### 2.7 Get Your Backend URL

1. Once deployed, Railway will assign a URL
2. Click **"Settings"** → **"Generate Domain"**
3. Your backend URL will be: `https://your-backend.up.railway.app`
4. **Save this URL** - you'll need it for Vercel

**✅ Step 2 Complete!** You now have:
- Railway account
- Backend deployed
- Backend URL

---

## Step 3: Create Vercel Account & Deploy Frontend {#step-3-vercel}

### 3.1 Sign Up for Vercel

1. Go to [https://vercel.com](https://vercel.com)
2. Click **"Sign Up"**
3. Sign up with **GitHub** (recommended)
4. Authorize Vercel to access your GitHub

### 3.2 Import Your Project

1. Click **"Add New..."** → **"Project"**
2. Select your **`medipact`** repository
3. Click **"Import"**

### 3.3 Configure Frontend Project

1. **Framework Preset**: Should auto-detect **Next.js** ✅
2. **Root Directory**: Set to `frontend` (since frontend is in a subdirectory)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)
5. **Install Command**: `npm install` (default)

### 3.4 Set Environment Variables

Click **"Environment Variables"** and add:

```env
# Backend API URL (from Railway)
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend.up.railway.app

# Hedera Configuration
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_ACCOUNT_ID=0.0.7156417
NEXT_PUBLIC_HEDERA_PRIVATE_KEY=0x519669071785c63d0938f89eacd4632332ec152eafcecacb984c8a89f72f85c7

# Smart Contract Addresses (if deployed)
NEXT_PUBLIC_CONSENT_MANAGER_ADDRESS=0x...
NEXT_PUBLIC_REVENUE_SPLITTER_ADDRESS=0x...

# Adapter Path (for local processing - optional)
ADAPTER_PATH=../../adapter

# Optional: Local Currency
NEXT_PUBLIC_LOCAL_CURRENCY_CODE=UGX
NEXT_PUBLIC_USD_TO_LOCAL_RATE=3700
```

**Important:**
- Replace `https://your-backend.up.railway.app` with your actual Railway backend URL
- All `NEXT_PUBLIC_*` variables are exposed to the browser (safe for public values)

### 3.5 Deploy Frontend

1. Click **"Deploy"**
2. Wait 2-3 minutes for build and deployment
3. Vercel will give you a URL: `https://your-app.vercel.app`

### 3.6 Update Backend CORS

Now that you have your Vercel URL, update Railway environment variables:

1. Go back to Railway
2. Update `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Railway will automatically redeploy

**✅ Step 3 Complete!** You now have:
- Vercel account
- Frontend deployed
- Frontend URL

---

## Step 4: Configure Environment Variables {#step-4-env-vars}

### 4.1 Final Environment Variable Checklist

**Railway (Backend):**
- ✅ `DATABASE_URL` - Supabase connection string
- ✅ `OPERATOR_ID` - Hedera operator ID
- ✅ `OPERATOR_KEY` - Hedera operator key
- ✅ `HEDERA_NETWORK` - testnet
- ✅ `ENCRYPTION_KEY` - Generated secure key
- ✅ `JWT_SECRET` - Generated secure key
- ✅ `FRONTEND_URL` - Your Vercel URL
- ✅ `ADMIN_USERNAME` - Admin username
- ✅ `ADMIN_PASSWORD` - Secure admin password

**Vercel (Frontend):**
- ✅ `NEXT_PUBLIC_BACKEND_API_URL` - Your Railway backend URL
- ✅ `NEXT_PUBLIC_HEDERA_NETWORK` - testnet
- ✅ `NEXT_PUBLIC_HEDERA_ACCOUNT_ID` - Hedera account ID
- ✅ `NEXT_PUBLIC_HEDERA_PRIVATE_KEY` - Hedera private key

**Supabase:**
- ✅ Connection string saved
- ✅ Project URL saved
- ✅ API keys saved

---

## Step 5: Test Your Deployment {#step-5-testing}

### 5.1 Test Backend Health

```bash
curl https://your-backend.up.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-09T...",
  "service": "MediPact Backend API"
}
```

### 5.2 Test Frontend

1. Visit your Vercel URL: `https://your-app.vercel.app`
2. Check if the homepage loads
3. Try navigating to different pages

### 5.3 Test Database Connection

The backend will automatically create tables on first connection. Check Railway logs to see:
```
📦 Database connected: PostgreSQL
✅ Database tables created
```

### 5.4 Test API Endpoints

```bash
# Test patient registration
curl -X POST https://your-backend.up.railway.app/api/patient/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "dateOfBirth": "1990-01-01",
    "email": "test@example.com",
    "phone": "+1234567890"
  }'
```

---

## Troubleshooting {#troubleshooting}

### Backend Won't Start

**Check Railway Logs:**
1. Go to Railway → Your service → **"Logs"** tab
2. Look for error messages
3. Common issues:
   - Missing environment variables
   - Database connection failed
   - Port already in use

**Fix Database Connection:**
- Verify `DATABASE_URL` is correct
- Check Supabase project is active
- Ensure password is correct

### Frontend Can't Connect to Backend

**Check:**
1. `NEXT_PUBLIC_BACKEND_API_URL` is set correctly
2. Backend is running (check Railway logs)
3. CORS is configured (check `FRONTEND_URL` in Railway)

**Test Connection:**
```bash
curl https://your-backend.up.railway.app/health
```

### Database Tables Not Created

**Solution:**
1. Check Railway logs for database connection errors
2. Verify `DATABASE_URL` is correct
3. Tables are created automatically on first connection
4. You can also run migration manually in Supabase SQL Editor

### Environment Variables Not Working

**For Railway:**
- Variables are case-sensitive
- Redeploy after adding variables
- Check logs for undefined variables

**For Vercel:**
- `NEXT_PUBLIC_*` variables are available in browser
- Regular variables are server-side only
- Redeploy after adding variables

---

## 🎉 Success!

Your MediPact application is now live at:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.up.railway.app`
- **Database**: Supabase (managed)

---

## 📚 Next Steps

1. **Set up custom domains** (optional):
   - Vercel: Add custom domain in project settings
   - Railway: Add custom domain in service settings

2. **Enable monitoring**:
   - Vercel Analytics (built-in)
   - Railway Metrics (built-in)
   - Supabase Dashboard (built-in)

3. **Set up backups**:
   - Supabase: Automatic backups (included)
   - Railway: Configure backup strategy

4. **Security hardening**:
   - Change default admin credentials
   - Rotate JWT secrets regularly
   - Enable 2FA on all accounts

---

## 📞 Need Help?

- **Supabase Docs**: https://supabase.com/docs
- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **MediPact Issues**: Check project GitHub issues

---

**Last Updated**: January 2025

