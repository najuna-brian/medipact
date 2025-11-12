# 🚀 MediPact Deployment - Quick Start

Welcome! This guide will help you deploy MediPact to production in about 30 minutes.

## 📋 What You'll Deploy

- **Frontend**: Next.js app on Vercel
- **Backend**: Express.js API on Railway  
- **Database**: PostgreSQL on Supabase

## 🎯 Quick Start (30 minutes)

### Step 1: Supabase Setup (5 min)
👉 See [docs/SUPABASE_SETUP.md](./docs/SUPABASE_SETUP.md)

1. Sign up at [supabase.com](https://supabase.com)
2. Create project → Save database password
3. Get connection string from Settings → Database

### Step 2: Railway Setup (10 min)
👉 See [docs/RAILWAY_DEPLOYMENT.md](./docs/RAILWAY_DEPLOYMENT.md)

1. Sign up at [railway.app](https://railway.app)
2. Deploy from GitHub → Select `medipact` repo
3. Set root directory to `backend`
4. Add environment variables (see guide)
5. Deploy → Get backend URL

### Step 3: Vercel Setup (10 min)
👉 See [docs/VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md)

1. Sign up at [vercel.com](https://vercel.com)
2. Import project from GitHub
3. Set root directory to `frontend`
4. Add environment variables
5. Deploy → Get frontend URL

### Step 4: Connect Everything (5 min)

1. Update Railway `FRONTEND_URL` with your Vercel URL
2. Test your deployment
3. 🎉 Done!

## 📚 Detailed Guides

- **[Complete Deployment Guide](./docs/DEPLOYMENT_GUIDE.md)** - Full step-by-step instructions
- **[Quick Start Guide](./docs/QUICK_START_DEPLOYMENT.md)** - Condensed 30-minute guide
- **[Supabase Setup](./docs/SUPABASE_SETUP.md)** - Database setup with RLS
- **[Railway Deployment](./docs/RAILWAY_DEPLOYMENT.md)** - Backend deployment
- **[Vercel Deployment](./docs/VERCEL_DEPLOYMENT.md)** - Frontend deployment

## 🔑 Environment Variables Checklist

### Railway (Backend)
- ✅ `DATABASE_URL` - Supabase connection string
- ✅ `OPERATOR_ID` - Hedera operator ID
- ✅ `OPERATOR_KEY` - Hedera operator key
- ✅ `ENCRYPTION_KEY` - Generated secure key
- ✅ `JWT_SECRET` - Generated secure key
- ✅ `FRONTEND_URL` - Your Vercel URL

### Vercel (Frontend)
- ✅ `NEXT_PUBLIC_BACKEND_API_URL` - Your Railway URL
- ✅ `NEXT_PUBLIC_HEDERA_NETWORK` - testnet
- ✅ `NEXT_PUBLIC_HEDERA_ACCOUNT_ID` - Hedera account ID
- ✅ `NEXT_PUBLIC_HEDERA_PRIVATE_KEY` - Hedera private key

## 🧪 Testing

After deployment, test:

```bash
# Test backend
curl https://your-backend.up.railway.app/health

# Test frontend
# Visit https://your-app.vercel.app
```

## 🆘 Need Help?

- Check [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md) troubleshooting section
- Verify all environment variables are set
- Check logs in Railway and Vercel dashboards

## ✅ Success Checklist

- [ ] Supabase project created
- [ ] Database connection string saved
- [ ] Railway backend deployed
- [ ] Backend health check passes
- [ ] Vercel frontend deployed
- [ ] Frontend loads correctly
- [ ] CORS configured
- [ ] Environment variables set
- [ ] Test registration works

---

**Ready to deploy?** Start with [QUICK_START_DEPLOYMENT.md](./docs/QUICK_START_DEPLOYMENT.md)!

