# Supabase Setup Guide for MediPact

This guide will help you set up Supabase for MediPact's database with Row-Level Security (RLS) for HIPAA compliance.

---

## Step 1: Create Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (recommended) or email
4. Verify your email if needed

---

## Step 2: Create New Project

1. Click **"New Project"**
2. Fill in:
   - **Name**: `medipact` (or your preferred name)
   - **Database Password**: 
     - Click "Generate a password" OR create your own
     - **⚠️ SAVE THIS PASSWORD** - you'll need it!
   - **Region**: Choose closest to your users
   - **Pricing Plan**: **Free** (perfect for MVP)
3. Click **"Create new project"**
4. Wait 2-3 minutes for initialization

---

## Step 3: Get Connection Details

### 3.1 Database Connection String

1. In Supabase dashboard, click **"Settings"** (gear icon)
2. Click **"Database"**
3. Scroll to **"Connection string"**
4. Under **"Connection pooling"**, select **"Session mode"**
5. Copy the connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with your actual password
7. **Save this** - you'll use it in Railway

### 3.2 API Keys

1. Still in **Settings** → Click **"API"**
2. Copy these values:
   - **Project URL**: `https://[PROJECT-REF].supabase.co`
   - **anon/public key**: (starts with `eyJ...`)
   - **service_role key**: (starts with `eyJ...`) - **Keep secret!**

---

## Step 4: Database Tables

The tables will be created automatically when your backend first connects to Supabase. The backend will detect `DATABASE_URL` and use PostgreSQL instead of SQLite.

**Tables that will be created:**
- `patient_identities` - Patient records with Hedera accounts
- `hospitals` - Hospital registry with verification
- `hospital_linkages` - Links patients to hospitals
- `patient_contacts` - Patient contact information
- `admins` - Admin users
- `researchers` - Researcher accounts

---

## Step 5: Row-Level Security (RLS) Setup (Optional but Recommended)

RLS provides database-level security for HIPAA compliance. Here's how to set it up:

### 5.1 Enable RLS on Tables

1. In Supabase dashboard, click **"SQL Editor"**
2. Click **"New query"**
3. Paste and run:

```sql
-- Enable RLS on all tables
ALTER TABLE patient_identities ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospitals ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_linkages ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE researchers ENABLE ROW LEVEL SECURITY;
```

### 5.2 Create RLS Policies (Basic Example)

**For Patient Identities:**
```sql
-- Patients can only see their own records
CREATE POLICY "Patients can view own data"
ON patient_identities
FOR SELECT
USING (upi = current_setting('app.current_upi', true));

-- Only backend service can insert/update
CREATE POLICY "Backend can manage patient data"
ON patient_identities
FOR ALL
USING (current_setting('app.service_role', true) = 'true');
```

**For Hospitals:**
```sql
-- Hospitals can view their own records
CREATE POLICY "Hospitals can view own data"
ON hospitals
FOR SELECT
USING (hospital_id = current_setting('app.current_hospital_id', true));

-- Only backend service can manage
CREATE POLICY "Backend can manage hospital data"
ON hospitals
FOR ALL
USING (current_setting('app.service_role', true) = 'true');
```

**Note**: For MVP, you can skip RLS and rely on application-level security. Enable RLS later for production compliance.

---

## Step 6: Storage Setup (For Verification Documents)

### 6.1 Create Storage Bucket

1. In Supabase dashboard, click **"Storage"**
2. Click **"New bucket"**
3. Name: `verification-documents`
4. **Public bucket**: ❌ Unchecked (private)
5. Click **"Create bucket"**

### 6.2 Set Storage Policies

1. Click on the bucket → **"Policies"**
2. Create policy for backend uploads:

```sql
-- Allow authenticated backend to upload
CREATE POLICY "Backend can upload documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'verification-documents' AND
  current_setting('app.service_role', true) = 'true'
);

-- Allow backend to read documents
CREATE POLICY "Backend can read documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'verification-documents' AND
  current_setting('app.service_role', true) = 'true'
);
```

---

## Step 7: Test Connection

Your backend will automatically test the connection when it starts. Check Railway logs to see:

```
📦 Database connected: PostgreSQL (Supabase)
✅ Database tables created
```

---

## Step 8: Backup Configuration

Supabase automatically backs up your database:
- **Free tier**: Daily backups (7-day retention)
- **Pro tier**: Point-in-time recovery

To manually backup:
1. Go to **Settings** → **Database**
2. Click **"Backups"**
3. Download backup if needed

---

## Security Best Practices

1. **Never commit** connection strings or API keys to git
2. **Use environment variables** in Railway
3. **Rotate passwords** regularly
4. **Enable 2FA** on your Supabase account
5. **Monitor access logs** in Supabase dashboard
6. **Use service_role key** only in backend (never in frontend)

---

## Troubleshooting

### Connection Failed

**Check:**
- Password is correct in connection string
- Project is active (not paused)
- Network allows connections

**Fix:**
- Regenerate connection string
- Check Supabase project status
- Verify password

### Tables Not Created

**Check:**
- Backend logs for errors
- Database connection is working
- Backend has proper permissions

**Fix:**
- Check Railway logs
- Verify `DATABASE_URL` is set correctly
- Tables are created automatically on first connection

### RLS Blocking Queries

**If RLS is enabled but blocking queries:**
- Temporarily disable RLS for testing
- Or set proper policies
- Or use service_role connection for backend

---

## Next Steps

1. ✅ Database is set up
2. ✅ Connection string saved
3. ✅ Tables will be created automatically
4. ⏭️ Proceed to Railway deployment

---

**Need Help?**
- Supabase Docs: https://supabase.com/docs
- Supabase Discord: https://discord.supabase.com

