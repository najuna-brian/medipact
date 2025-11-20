# MediPact Adapter - Demo Summary

## 🎯 Two Demo Options

### 1. Local Demo (For Judges/Testing)
**Purpose:** Demonstrate CSV processing, anonymization, and Hedera integration locally

**Setup:**
```bash
cd backend/adapter
./setup-local-demo.sh
```

**Run:**
```bash
npm run start:legacy
```

**What it does:**
- Reads `data/raw_data.csv` (with PII)
- Converts to FHIR R4 Bundle
- Anonymizes all PII
- Generates consent and data proofs
- Submits to Hedera HCS
- Creates `data/anonymized_data.csv` (no PII)

**Files:**
- Input: `data/raw_data.csv`
- Output: `data/anonymized_data.csv`
- Config: `.env`

---

### 2. Live Demo (Deployed System)
**Purpose:** Demonstrate full system with web interface

**Setup:**
- Backend server running
- Frontend accessible
- Hospital logged in

**Run:**
- Navigate to `/hospital/upload`
- Upload CSV file through web interface
- View results in UI

**What it does:**
- Same processing as local demo
- Results displayed in web UI
- HashScan links shown automatically
- Processing history saved

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `LOCAL_DEMO_SETUP.md` | Complete guide for local demo setup |
| `DEMO_QUICK_START.md` | Quick reference card |
| `LOCAL_DEMO_READY.md` | Setup completion summary |
| `DEMO_SUMMARY.md` | This file - overview |
| `verify-demo-ready.sh` | Pre-demo verification script |
| `setup-local-demo.sh` | Automated setup script |

---

## ✅ Verification

Before your demo, run:
```bash
cd backend/adapter
./verify-demo-ready.sh
```

This checks:
- ✅ Environment variables configured
- ✅ CSV file exists with data
- ✅ Node.js version correct
- ✅ Dependencies installed
- ✅ Adapter script exists

---

## 🚀 Quick Start Commands

### Local Demo
```bash
# 1. Setup (first time)
cd backend/adapter
./setup-local-demo.sh

# 2. Verify
./verify-demo-ready.sh

# 3. Run
npm run start:legacy

# 4. View results
cat data/anonymized_data.csv | head -10
```

### Live Demo
```bash
# 1. Start backend
cd backend
npm start

# 2. Start frontend (separate terminal)
cd frontend
npm run dev

# 3. Access upload page
# Navigate to http://localhost:3000/hospital/upload
```

---

## ⚠️ Important Notes

### Command Differences

| Command | Purpose |
|---------|---------|
| `npm start` | API connector (connects to OpenMRS, FHIR servers) |
| `npm run start:legacy` | CSV processor (processes CSV files) |

**For CSV demos, always use:** `npm run start:legacy`

### File Locations

- **Local Demo:**
  - Input: `backend/adapter/data/raw_data.csv`
  - Output: `backend/adapter/data/anonymized_data.csv`
  - Config: `backend/adapter/.env`

- **Live Demo:**
  - Input: Uploaded via web interface
  - Output: Displayed in web UI
  - Config: Backend `.env` + frontend config

---

## 📋 Demo Checklist

### Before Local Demo:
- [ ] Run `./setup-local-demo.sh`
- [ ] Run `./verify-demo-ready.sh` (all checks pass)
- [ ] Test run: `npm run start:legacy` completes successfully
- [ ] Verify `data/anonymized_data.csv` created
- [ ] Copy HashScan links from test run

### Before Live Demo:
- [ ] Backend server running
- [ ] Frontend accessible
- [ ] Hospital account created and logged in
- [ ] Test CSV file ready to upload

### During Demo:
- [ ] Show raw data (with PII)
- [ ] Run adapter / upload CSV
- [ ] Show anonymized data (no PII)
- [ ] Open HashScan link to verify Hedera transaction
- [ ] Explain anonymization process
- [ ] Highlight revenue split

---

## 🆘 Troubleshooting

### Local Demo Issues

**Error: "HOSPITAL_COUNTRY environment variable is required"**
```bash
echo 'HOSPITAL_COUNTRY="Uganda"' >> .env
```

**Error: "OPERATOR_ID, OPERATOR_KEY, HEDERA_NETWORK are required"**
```bash
# Add to .env:
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"
```

**Error: "Failed to read CSV file"**
```bash
# Ensure file exists:
ls -la data/raw_data.csv
```

### Live Demo Issues

**Upload fails:**
- Check backend server is running
- Verify hospital is logged in
- Check API key is valid
- Verify CSV format matches expected columns

**Processing fails:**
- Check backend logs
- Verify adapter directory exists
- Check environment variables in backend `.env`

---

## 📖 Additional Resources

- **Main README:** `README.md` - General adapter documentation
- **Demo Script:** `docs/archive/DEMO_SCRIPT.md` - Video demo script
- **Setup Guide:** `LOCAL_DEMO_SETUP.md` - Detailed setup instructions
- **Quick Reference:** `DEMO_QUICK_START.md` - Command cheat sheet

---

## 🎬 Demo Flow

### Local Demo Flow:
1. Show `data/raw_data.csv` (with PII)
2. Run `npm run start:legacy`
3. Show terminal output (processing steps)
4. Show `data/anonymized_data.csv` (no PII)
5. Open HashScan link (verify on Hedera)

### Live Demo Flow:
1. Navigate to upload page
2. Show CSV file selection
3. Upload and process
4. Show processing status
5. Show results with HashScan links
6. Verify on HashScan

---

**Both demos are ready! Choose the one that fits your needs.**

