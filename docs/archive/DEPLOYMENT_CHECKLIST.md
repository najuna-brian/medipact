# ✅ MediPact Deployment Checklist

Use this checklist to track your deployment progress.

---

## 📋 Pre-Deployment

- [ ] Code is committed to GitHub
- [ ] All tests pass locally
- [ ] Environment variables documented
- [ ] Secrets generated for production

---

## 🗄️ Step 1: Supabase Setup

- [ ] Created Supabase account
- [ ] Created new project
- [ ] Saved database password securely
- [ ] Got connection string from Settings → Database
- [ ] Replaced `[YOUR-PASSWORD]` in connection string
- [ ] Saved connection string for Railway
- [ ] Got Project URL from Settings → API
- [ ] Got API keys (anon and service_role)
- [ ] Saved API keys securely

**Connection String Format:**
```
postgresql://postgres:YOUR_PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres
```

---

## 🚂 Step 2: Railway Backend Deployment

- [ ] Created Railway account
- [ ] Connected GitHub account
- [ ] Created new project
- [ ] Selected `medipact` repository
- [ ] Set root directory to `backend`
- [ ] Generated domain for backend
- [ ] Saved backend URL
- [ ] Added all environment variables:
  - [ ] `DATABASE_URL` (Supabase connection string)
  - [ ] `OPERATOR_ID`
  - [ ] `OPERATOR_KEY`
  - [ ] `HEDERA_NETWORK`
  - [ ] `ENCRYPTION_KEY` (new for production)
  - [ ] `JWT_SECRET` (new for production)
  - [ ] `PORT=3002`
  - [ ] `NODE_ENV=production`
  - [ ] `ADMIN_USERNAME`
  - [ ] `ADMIN_PASSWORD` (secure password)
  - [ ] `FRONTEND_URL` (will update after Vercel)
- [ ] Deployed backend
- [ ] Checked logs for success
- [ ] Tested health endpoint: `curl https://your-backend.up.railway.app/health`

**Backend URL:** `https://________________.up.railway.app`

---

## ▲ Step 3: Vercel Frontend Deployment

- [ ] Created Vercel account
- [ ] Connected GitHub account
- [ ] Imported `medipact` project
- [ ] Set root directory to `frontend`
- [ ] Verified framework is Next.js
- [ ] Added environment variables:
  - [ ] `NEXT_PUBLIC_BACKEND_API_URL` (Railway backend URL)
  - [ ] `NEXT_PUBLIC_HEDERA_NETWORK`
  - [ ] `NEXT_PUBLIC_HEDERA_ACCOUNT_ID`
  - [ ] `NEXT_PUBLIC_HEDERA_PRIVATE_KEY`
- [ ] Deployed frontend
- [ ] Saved frontend URL
- [ ] Tested frontend loads

**Frontend URL:** `https://________________.vercel.app`

---

## 🔗 Step 4: Connect Everything

- [ ] Updated Railway `FRONTEND_URL` with Vercel URL
- [ ] Railway auto-redeployed
- [ ] Verified CORS is working
- [ ] Tested frontend can call backend API

---

## 🧪 Step 5: Testing

- [ ] Backend health check works
- [ ] Frontend homepage loads
- [ ] Can navigate between pages
- [ ] Test patient registration
- [ ] Test hospital registration
- [ ] Test admin login
- [ ] Check database tables created in Supabase
- [ ] Verify data is being saved

---

## 🔒 Step 6: Security

- [ ] Changed default admin password
- [ ] Generated new encryption key for production
- [ ] Generated new JWT secret for production
- [ ] Enabled 2FA on Supabase account
- [ ] Enabled 2FA on Railway account
- [ ] Enabled 2FA on Vercel account
- [ ] Verified no secrets in git
- [ ] Set up monitoring/alerts

---

## 📊 Step 7: Monitoring

- [ ] Checked Railway logs (no errors)
- [ ] Checked Vercel logs (no errors)
- [ ] Verified database connection in Supabase
- [ ] Set up error tracking (optional)
- [ ] Set up analytics (optional)

---

## ✅ Final Verification

- [ ] All services are running
- [ ] Frontend connects to backend
- [ ] Backend connects to database
- [ ] Can register patients
- [ ] Can register hospitals
- [ ] Admin login works
- [ ] No errors in logs
- [ ] Application is functional

---

## 🎉 Success!

Your MediPact application is now live!

- **Frontend**: https://________________.vercel.app
- **Backend**: https://________________.up.railway.app
- **Database**: Supabase (managed)

---

## 📝 Notes

Write any important notes here:
- Database password: ________________
- Admin password: ________________
- Custom domains: ________________
- Issues encountered: ________________

---

## 🆘 Troubleshooting

If something doesn't work:

1. Check logs in Railway and Vercel
2. Verify all environment variables are set
3. Test backend health endpoint
4. Check database connection in Supabase
5. Review troubleshooting sections in guides

---

**Last Updated**: After deployment

