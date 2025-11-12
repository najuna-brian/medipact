# Production Setup Guide

## Admin Account Setup

### Automatic Setup (Recommended)

The backend now **automatically creates** a default admin account on server startup if it doesn't exist.

**Default Credentials:**
- **Username**: `admin`
- **Password**: `admin123`

**Environment Variables** (optional - to customize):
```env
ADMIN_USERNAME=admin        # Default: admin
ADMIN_PASSWORD=admin123     # Default: admin123
```

**How It Works:**
1. When the backend server starts, it initializes the database
2. After database initialization, it checks if an admin account exists
3. If no admin exists, it automatically creates one with the default credentials
4. If admin already exists, it skips creation

**This means**: After deploying to Railway, the admin account will be created automatically on the first server start! ✅

### Manual Setup (Backup Option)

If automatic setup doesn't work, you can manually create the admin account:

#### Option 1: Using Railway CLI
```bash
railway run node backend/scripts/setup-admin.js admin admin123
```

#### Option 2: Using SQL Script
Run `backend/scripts/create-admin.sql` in your Supabase SQL Editor.

## Railway Environment Variables

Make sure these are set in your Railway backend service:

### Required Variables
```env
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres

# Hedera
OPERATOR_ID=0.0.xxxxx
OPERATOR_KEY=0x...
HEDERA_NETWORK=testnet

# Security
ENCRYPTION_KEY=[32-byte-hex-key]  # Generate: openssl rand -hex 32
JWT_SECRET=[strong-secret]        # Generate: openssl rand -hex 64

# Server
PORT=3002
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app

# Admin (Optional - defaults to admin/admin123)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## Vercel Environment Variables

Make sure these are set in your Vercel frontend project:

```env
# Backend API
NEXT_PUBLIC_API_URL=https://your-backend.up.railway.app

# Hedera
NEXT_PUBLIC_HEDERA_NETWORK=testnet
```

## Verification Steps

### 1. Check Backend Health
```bash
curl https://your-backend.up.railway.app/health
```

### 2. Check Admin Account Creation
After the backend starts, check Railway logs. You should see:
```
✅ Default admin account created:
   Username: admin
   Role: admin
   ID: 1
   💡 You can now log in with these credentials.
```

OR if admin already exists:
```
✅ Admin account "admin" already exists
```

### 3. Test Admin Login
```bash
curl -X POST https://your-backend.up.railway.app/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Expected response:
```json
{
  "success": true,
  "token": "eyJhbGc...",
  "admin": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### 4. Test Frontend Login
1. Go to: `https://your-app.vercel.app/admin/login`
2. Enter:
   - Username: `admin`
   - Password: `admin123`
3. Should successfully log in

## Troubleshooting

### Admin Login Still Not Working?

1. **Check Railway Logs**: Look for admin initialization messages
2. **Check Database**: Verify admin account exists in Supabase
3. **Manual Creation**: Use the SQL script as backup
4. **Environment Variables**: Ensure `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set correctly (or use defaults)

### Database Connection Issues?

1. Verify `DATABASE_URL` is correct in Railway
2. Check Supabase connection settings
3. Ensure database tables are created (check logs for "Database tables created")

### CORS Issues?

1. Ensure `FRONTEND_URL` is set in Railway
2. Verify it matches your Vercel URL exactly
3. Check Railway logs for CORS errors

---

**After deployment, the admin account should work automatically!** 🎉

