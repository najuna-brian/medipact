# Security Notes for Demo Data

## 🔒 Current Security Status

### ✅ Credentials File is NOT Web-Accessible

The `demo-credentials.json` file is:
- ✅ Stored in `backend/` directory (not in public web directory)
- ✅ NOT served via HTTP/Express static files
- ✅ NOT accessible via any API endpoint
- ✅ Added to `.gitignore` (won't be committed to git)
- ✅ Only accessible via file system on the server

**Conclusion**: The credentials file itself is secure and cannot be accessed via the web.

### ⚠️ However, Anyone CAN Register New Accounts

**Current MVP Configuration:**
- ✅ Anyone can register as a hospital (via `/api/hospital/register`)
- ✅ Anyone can register as a researcher (via `/api/researcher/register`)
- ✅ Anyone can register as a patient (via `/api/patient/register`)
- ⚠️ Admin authentication is bypassed (for MVP)

**This means:**
- ✅ Users can create their own accounts (normal behavior)
- ⚠️ Anyone with demo credentials can use those accounts
- ⚠️ If demo credentials are shared, anyone can use them

## 🛡️ Security Recommendations

### For MVP/Demo

1. **Keep Credentials Private**
   - Don't commit `demo-credentials.json` to git ✅ (already in .gitignore)
   - Don't share credentials publicly
   - Use different credentials for each demo environment

2. **Limit Demo Account Access**
   - Consider adding a simple password/secret to demo accounts
   - Or use environment-specific credentials
   - Rotate credentials between demos

3. **Monitor Usage**
   - Check admin dashboard for unusual activity
   - Monitor API usage logs
   - Set up alerts for suspicious patterns

### For Production

1. **Enable Proper Authentication**
   - Implement JWT authentication for admin
   - Add email verification for researchers
   - Add phone verification for patients

2. **Add Rate Limiting** (already implemented ✅)
   - Registration endpoints are rate-limited
   - API endpoints are rate-limited

3. **Add Verification Requirements**
   - Require email verification before account activation
   - Require document verification for hospitals
   - Require institutional verification for researchers

4. **Secure Credentials Storage**
   - Use environment variables for sensitive data
   - Encrypt API keys in database
   - Use secrets management (AWS Secrets Manager, etc.)

## 📋 Current Access Control

### Public Endpoints (Anyone Can Access)
- `POST /api/hospital/register` - Register hospital
- `POST /api/researcher/register` - Register researcher
- `POST /api/patient/register` - Register patient
- `GET /api/marketplace/datasets` - Browse datasets (public catalog)

### Protected Endpoints (Require Authentication)
- Hospital endpoints: Require `X-Hospital-ID` + `X-API-Key`
- Researcher endpoints: Require `X-Researcher-ID`
- Admin endpoints: Currently bypassed for MVP ⚠️
- Patient endpoints: Require UPI (in URL path)

### Demo Credentials Access
- Demo credentials are stored locally in `backend/demo-credentials.json`
- File is NOT accessible via web
- Only server-side scripts can read it
- Users need the file content to login (must be shared manually)

## 🎯 For Your Demo Presentation

### Safe Approach
1. **Use Demo Credentials Privately**
   - Keep `demo-credentials.json` on your local machine
   - Only share credentials with your demo audience
   - Use different credentials for each demo session

2. **Create Fresh Accounts for Each Demo**
   - Run `npm run populate-demo` before each demo
   - Use new credentials each time
   - Clear old data if needed

3. **Monitor During Demo**
   - Watch for unauthorized access
   - Check admin dashboard for activity
   - Be ready to revoke access if needed

### If Credentials Are Compromised
1. **Immediately Change API Keys**
   - Hospitals can regenerate API keys (if implemented)
   - Or create new demo accounts

2. **Revoke Access**
   - Use admin dashboard to disable accounts
   - Or delete compromised accounts

3. **Generate New Demo Data**
   - Run `npm run populate-demo` again
   - Use new credentials

## ✅ Summary

**Good News:**
- ✅ Credentials file is NOT web-accessible
- ✅ File is in `.gitignore` (won't be committed)
- ✅ Only accessible via file system

**Be Aware:**
- ⚠️ Anyone can register new accounts (normal for MVP)
- ⚠️ If demo credentials are shared, they can be used
- ⚠️ Admin auth is bypassed (MVP only)

**Best Practice:**
- Keep demo credentials private
- Use fresh credentials for each demo
- Monitor for unauthorized access
- Enable proper authentication for production

---

**For Production**: See `docs/MVP_CONFIGURATION.md` for production security requirements.

