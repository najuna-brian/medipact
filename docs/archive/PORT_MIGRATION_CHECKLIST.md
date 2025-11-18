# Port Migration Checklist: 3002 → 8080

## ✅ Code Changes Complete
All code has been updated to use port 8080 by default and dynamic port configuration.

## 🔍 Environment Variables to Check

### Railway (Backend)

**Good News**: Railway automatically sets the `PORT` environment variable, so you typically don't need to do anything!

**However, check if you manually set PORT:**
1. Go to your Railway project dashboard
2. Click **"Variables"** tab
3. Look for `PORT` variable
4. **If it exists and is set to `3002`**:
   - Either **delete it** (let Railway auto-set it)
   - Or **update it to `8080`** (if you want to override)

**Note**: Railway will automatically assign a port, and your backend will use it. The default in code is now 8080, but Railway's assigned port will take precedence.

### Vercel (Frontend)

**Check these environment variables:**

1. Go to your Vercel project dashboard
2. Click **"Settings"** → **"Environment Variables"**
3. Check these variables:

#### `NEXT_PUBLIC_BACKEND_API_URL`
- **Should be**: Your Railway backend URL (e.g., `https://your-backend.up.railway.app`)
- **Should NOT contain**: `localhost:3002` or any port number
- **Action**: If it contains `localhost:3002`, update it to your Railway backend URL

#### `NEXT_PUBLIC_API_URL` (if used)
- Same as above - should point to Railway backend URL, not localhost

#### `NEXT_PUBLIC_BACKEND_PORT` (optional)
- This is a new optional variable for local development
- **Not needed in production** (Vercel doesn't need this)
- Only useful for local development if you want to override the default 8080

### Summary

**Railway:**
- ✅ No action needed (Railway auto-sets PORT)
- ⚠️ Only check if you manually set PORT=3002 (then remove or update to 8080)

**Vercel:**
- ✅ Check `NEXT_PUBLIC_BACKEND_API_URL` - should be Railway URL (no localhost:3002)
- ✅ Check `NEXT_PUBLIC_API_URL` - should be Railway URL (no localhost:3002)
- ✅ No port numbers should be in these URLs (Railway provides HTTPS URLs without ports)

## 🧪 Testing After Migration

1. **Backend**: Check Railway logs - should show "running on port [Railway's port]"
2. **Frontend**: Check browser console - API calls should go to Railway URL
3. **Health Check**: Visit `https://your-backend.up.railway.app/health`

## 📝 Notes

- Railway automatically assigns a port and sets it in the `PORT` environment variable
- Your code now defaults to 8080, but Railway's PORT will override it
- Frontend should always use the full Railway URL, not localhost
- Local development uses port 8080 by default (can override with PORT env var)

