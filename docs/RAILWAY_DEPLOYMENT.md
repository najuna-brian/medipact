# Railway Deployment Guide for MediPact Backend

This guide will walk you through deploying the MediPact backend to Railway.

---

## Prerequisites

- GitHub account
- Supabase account and database (see [SUPABASE_SETUP.md](./SUPABASE_SETUP.md))
- Your Supabase database connection string

---

## Step 1: Sign Up for Railway

1. Go to [https://railway.app](https://railway.app)
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with **GitHub** (recommended - easiest)
4. Authorize Railway to access your GitHub account

---

## Step 2: Create New Project

1. Once logged in, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. If your MediPact repository isn't listed:
   - Click **"Configure GitHub App"**
   - Select your repositories (or all repos)
   - Click **"Install"**
4. Select your **`medipact`** repository
5. Railway will automatically detect it's a Node.js project

---

## Step 3: Configure Backend Service

### 3.1 Set Root Directory

1. Click on the service that Railway created
2. Go to **"Settings"** tab
3. Under **"Service Settings"**:
   - **Root Directory**: Set to `backend`
     - This tells Railway where your backend code is
   - **Start Command**: Should be `npm start` (default)
   - **Healthcheck Path**: `/health`

### 3.2 Generate Domain

1. Click **"Settings"** → **"Networking"**
2. Click **"Generate Domain"**
3. Railway will create a URL like: `https://your-backend.up.railway.app`
4. **Save this URL** - you'll need it for Vercel

---

## Step 4: Set Environment Variables

1. In your Railway service, click the **"Variables"** tab
2. Click **"New Variable"** for each variable below

### Required Variables:

```env
# Database (Supabase)
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres

# Hedera Configuration
OPERATOR_ID=0.0.7156417
OPERATOR_KEY=0x519669071785c63d0938f89eacd4632332ec152eafcecacb984c8a89f72f85c7
HEDERA_NETWORK=testnet

# Encryption Key (generate new for production!)
ENCRYPTION_KEY=0ac321771a915c7f832d1fe0dcd6c692864cdb4c13a27951d27411dcbdb9a8ef

# Server Configuration
PORT=3002
NODE_ENV=production

# JWT Configuration (generate new for production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Admin Credentials (change these!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-admin-password-123

# CORS (set after Vercel deployment)
FRONTEND_URL=https://your-app.vercel.app
```

### How to Fill These:

1. **DATABASE_URL**: 
   - Get from Supabase (Settings → Database → Connection string)
   - Replace `[YOUR-PASSWORD]` with your Supabase password
   - Replace `[PROJECT-REF]` with your Supabase project reference

2. **ENCRYPTION_KEY**: 
   - Generate with: `openssl rand -hex 32`
   - Use a NEW key for production (don't use the dev key!)

3. **JWT_SECRET**: 
   - Generate with: `openssl rand -hex 64`
   - Use a NEW secret for production

4. **FRONTEND_URL**: 
   - Set this AFTER deploying to Vercel
   - Will be: `https://your-app.vercel.app`

---

## Step 5: Deploy

1. Railway will automatically deploy when you:
   - Push to GitHub, OR
   - Click **"Deploy"** button
2. Wait 2-3 minutes for deployment
3. Check the **"Logs"** tab to see:
   ```
   📦 Database connected: PostgreSQL (Supabase)
   ✅ Database tables created
   🚀 MediPact Backend Server running on port 3002
   ```

---

## Step 6: Test Deployment

### 6.1 Test Health Endpoint

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

### 6.2 Test API Endpoint

```bash
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

## Step 7: Update CORS After Vercel Deployment

Once you have your Vercel frontend URL:

1. Go back to Railway → Your service → **"Variables"**
2. Update `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Railway will automatically redeploy

---

## Monitoring & Logs

### View Logs

1. Click on your service
2. Click **"Logs"** tab
3. See real-time logs and errors

### View Metrics

1. Click **"Metrics"** tab
2. See CPU, memory, and network usage

---

## Troubleshooting

### Deployment Fails

**Check:**
- Logs tab for error messages
- All environment variables are set
- Root directory is `backend`

**Common Issues:**
- Missing `DATABASE_URL` → Add it
- Wrong root directory → Set to `backend`
- Database connection failed → Check Supabase connection string

### Database Connection Failed

**Check:**
- `DATABASE_URL` is correct
- Password in connection string is correct
- Supabase project is active (not paused)

**Fix:**
- Regenerate connection string in Supabase
- Verify password is correct
- Check Supabase project status

### Port Already in Use

**Fix:**
- Railway automatically sets PORT
- Don't hardcode port in code
- Use `process.env.PORT` (already done)

---

## Custom Domain (Optional)

1. Go to **Settings** → **Networking**
2. Click **"Custom Domain"**
3. Add your domain
4. Follow DNS configuration instructions

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ Yes | Supabase PostgreSQL connection string |
| `OPERATOR_ID` | ✅ Yes | Hedera operator account ID |
| `OPERATOR_KEY` | ✅ Yes | Hedera operator private key |
| `HEDERA_NETWORK` | ✅ Yes | `testnet` or `mainnet` |
| `ENCRYPTION_KEY` | ✅ Yes | 32-byte hex key for encryption |
| `JWT_SECRET` | ✅ Yes | Secret for JWT tokens |
| `PORT` | ❌ No | Auto-set by Railway (default: 3002) |
| `NODE_ENV` | ✅ Yes | `production` |
| `ADMIN_USERNAME` | ✅ Yes | Admin login username |
| `ADMIN_PASSWORD` | ✅ Yes | Admin login password |
| `FRONTEND_URL` | ✅ Yes | Your Vercel frontend URL |

---

## Next Steps

1. ✅ Backend is deployed
2. ⏭️ Deploy frontend to Vercel (see [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md))
3. ⏭️ Update `FRONTEND_URL` in Railway
4. ⏭️ Test end-to-end

---

**Railway Docs**: https://docs.railway.app

