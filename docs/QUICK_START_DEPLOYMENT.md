# Quick Start: Deploy MediPact in 30 Minutes

This is a condensed guide to get MediPact deployed quickly. For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md).

---

## 🚀 Quick Deployment Steps

### 1. Supabase (5 minutes)

1. Go to [supabase.com](https://supabase.com) → Sign up with GitHub
2. Click **"New Project"**
3. Name: `medipact`, Region: closest to you, Plan: **Free**
4. **Save the database password!**
5. Go to **Settings** → **Database** → Copy connection string
6. Replace `[YOUR-PASSWORD]` with your password
7. **Save connection string** → You'll use it in Railway

**✅ Done!** You have:
- Supabase project
- Database connection string

---

### 2. Railway (10 minutes)

1. Go to [railway.app](https://railway.app) → Sign up with GitHub
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `medipact` repository
4. In service settings:
   - **Root Directory**: `backend`
   - **Start Command**: `npm start`
5. Go to **Variables** tab, add these:

```env
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
OPERATOR_ID=0.0.7156417
OPERATOR_KEY=0x519669071785c63d0938f89eacd4632332ec152eafcecacb984c8a89f72f85c7
HEDERA_NETWORK=testnet
ENCRYPTION_KEY=0ac321771a915c7f832d1fe0dcd6c692864cdb4c13a27951d27411dcbdb9a8ef
JWT_SECRET=your-secret-key-here
PORT=3002
NODE_ENV=production
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-secure-password
FRONTEND_URL=https://your-app.vercel.app
```

6. Click **"Deploy"** → Wait 2-3 minutes
7. Get your backend URL: `https://your-backend.up.railway.app`
8. Test: `curl https://your-backend.up.railway.app/health`

**✅ Done!** You have:
- Backend deployed
- Backend URL

---

### 3. Vercel (10 minutes)

1. Go to [vercel.com](https://vercel.com) → Sign up with GitHub
2. Click **"Add New..."** → **"Project"**
3. Select your `medipact` repository
4. Configure:
   - **Framework**: Next.js (auto-detected)
   - **Root Directory**: `frontend`
5. Add environment variables:

```env
NEXT_PUBLIC_BACKEND_API_URL=https://your-backend.up.railway.app
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXT_PUBLIC_HEDERA_ACCOUNT_ID=0.0.7156417
NEXT_PUBLIC_HEDERA_PRIVATE_KEY=0x519669071785c63d0938f89eacd4632332ec152eafcecacb984c8a89f72f85c7
```

6. Click **"Deploy"** → Wait 2-3 minutes
7. Get your frontend URL: `https://your-app.vercel.app`

**✅ Done!** You have:
- Frontend deployed
- Frontend URL

---

### 4. Final Configuration (5 minutes)

1. Go back to **Railway**
2. Update `FRONTEND_URL` variable with your Vercel URL
3. Railway will auto-redeploy

**✅ Done!** Everything is connected!

---

## 🎉 Your App is Live!

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.up.railway.app`
- **Database**: Supabase (managed)

---

## 🧪 Test It

1. Visit your Vercel URL
2. Try registering a patient
3. Check Railway logs for database connection
4. Check Supabase dashboard to see tables

---

## ⚠️ Important Security Notes

1. **Change default admin password** in Railway
2. **Generate new secrets** for production:
   ```bash
   openssl rand -hex 32  # For ENCRYPTION_KEY
   openssl rand -hex 64  # For JWT_SECRET
   ```
3. **Never commit** `.env` files to git
4. **Enable 2FA** on all accounts

---

## 📚 Need More Details?

See the full [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for:
- Detailed step-by-step instructions
- Troubleshooting guide
- Security best practices
- RLS setup for HIPAA compliance

---

**Estimated Total Time**: 30 minutes

