# Quick Start: Demo Data for MVP Presentation

## 🚀 One-Command Setup

```bash
# 1. Start the backend (in one terminal)
cd backend
npm start

# 2. In another terminal, populate demo data
cd backend
npm run populate-demo
```

That's it! The script will:
- ✅ Create 3 hospitals (verified)
- ✅ Create 2 researchers (verified)  
- ✅ Create 600 patients (200 per hospital)
- ✅ Generate realistic FHIR data
- ✅ Create 3 datasets ready for purchase
- ✅ Save all login credentials to `demo-credentials.json`

## 📋 What You Get

After running the script, check `backend/demo-credentials.json` for:

### Hospital Login
```json
{
  "hospitalId": "HOSP-XXXXX",
  "apiKey": "your-api-key-here"
}
```
**Login at**: `/hospital/login`

### Researcher Login
```json
{
  "researcherId": "RES-XXXXX",
  "email": "researcher1@demo.medipact.com"
}
```
**Login at**: `/researcher/login` (use Researcher ID)

### Patient Access
```json
{
  "upi": "UPI-DEMO000001",
  "email": "patient1-1@demo.medipact.com",
  "phone": "+256700000001"
}
```
**Access at**: `/patient/login` (use UPI, email, or phone)

## 🎯 Demo Flow

1. **As Researcher**: 
   - Login with Researcher ID
   - Browse datasets at `/researcher/catalog`
   - Query data at `/researcher/query`
   - Purchase datasets

2. **As Hospital**:
   - Login with Hospital ID + API Key
   - View dashboard at `/hospital/dashboard`
   - Check revenue at `/hospital/revenue`
   - View processing history

3. **As Patient**:
   - Login with UPI
   - View wallet at `/patient/wallet`
   - Check earnings at `/patient/earnings`
   - View data sharing settings

## ⚙️ Customize Data Amount

```bash
# Small demo (fast, ~150 patients)
PATIENTS_PER_HOSPITAL=50 NUM_HOSPITALS=2 npm run populate-demo

# Medium demo (recommended, ~600 patients)
PATIENTS_PER_HOSPITAL=200 NUM_HOSPITALS=3 npm run populate-demo

# Large demo (comprehensive, ~2500 patients)
PATIENTS_PER_HOSPITAL=500 NUM_HOSPITALS=5 npm run populate-demo
```

## 🌐 For Hosted Environments

```bash
API_URL=https://your-api.com npm run populate-demo
```

## 📝 Files Created

- `backend/demo-credentials.json` - All login credentials
- See `DEMO_DATA_README.md` for full documentation
- See `DEMO_CREDENTIALS_EXAMPLE.md` for credential structure

## ✅ Verification

All users are automatically verified, so you can:
- ✅ Hospitals can upload data immediately
- ✅ Researchers can purchase datasets immediately
- ✅ All data is ready for queries

## 🎬 Ready for Demo!

Your database is now populated with realistic data. Use the credentials from `demo-credentials.json` to login and demonstrate all features!

---

**Need help?** See `DEMO_DATA_README.md` for detailed documentation.

