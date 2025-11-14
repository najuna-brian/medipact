# Admin Account Setup Guide

## Problem
Getting 401 Unauthorized when trying to log in to the admin panel.

## Solutions

### Solution 1: Auto-Initialization (Recommended)
The server automatically creates a default admin account on startup if none exists.

**Default credentials:**
- Username: `admin`
- Password: `admin123`

**To use custom credentials, set these environment variables in Railway:**
- `ADMIN_USERNAME` = your desired username
- `ADMIN_PASSWORD` = your secure password

**Steps:**
1. Go to your Railway project dashboard
2. Navigate to your backend service
3. Go to the "Variables" tab
4. Add `ADMIN_USERNAME` and `ADMIN_PASSWORD` (optional)
5. Restart the service
6. Check the logs to see if admin was created
7. Try logging in with the credentials

### Solution 2: Create Admin via SQL (Direct Database Access)
If you have direct access to your Railway PostgreSQL database:

1. Connect to your database (via Railway CLI or dashboard)
2. Run the SQL script:
   ```bash
   # Via Railway CLI
   railway connect
   # Then run the SQL from scripts/create-admin-production.sql
   ```

Or use Railway's database dashboard to run:
```sql
INSERT INTO admins (username, password_hash, role, created_at, status)
VALUES (
  'admin',
  '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9',
  'admin',
  CURRENT_TIMESTAMP,
  'active'
)
ON CONFLICT (username) DO NOTHING;
```

**To create with a different password:**
1. Generate password hash: `echo -n "your-password" | sha256sum`
2. Replace the `password_hash` value in the SQL above

### Solution 3: Create Admin via API (If Setup Endpoint Works)
If the setup endpoint is accessible:

```bash
curl -X POST https://medipact-production.up.railway.app/api/admin/auth/setup \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123",
    "setupSecret": "medipact-setup-secret-change-in-production"
  }'
```

**Note:** Set `SETUP_SECRET` environment variable in Railway for security.

### Solution 4: Local Setup Script (If Database is Accessible)
If you can connect to your production database locally:

```bash
cd backend
DATABASE_URL="your-railway-database-url" node scripts/setup-admin.js admin your-secure-password
```

## Verification

After creating the admin, verify it exists:
```sql
SELECT id, username, role, created_at, status 
FROM admins 
WHERE username = 'admin' AND status = 'active';
```

## Security Notes

1. **Change the default password** after first login
2. **Set a strong `SETUP_SECRET`** if using the API setup endpoint
3. **Use environment variables** for admin credentials in production
4. **Never commit** admin passwords or secrets to version control

## Troubleshooting

**Still getting 401?**
1. Check Railway logs for admin creation messages
2. Verify the admin exists in the database
3. Ensure the admin has `status = 'active'`
4. Check that password hash matches (SHA-256)

**Admin not auto-creating?**
1. Check Railway logs for errors during initialization
2. Verify database connection is working
3. Ensure `admins` table exists
4. Check for any database permission issues

