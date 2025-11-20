# Demo Quick Start - MediPact CSV Adapter

## 🚀 Quick Commands

```bash
# 1. Setup (first time only)
cd backend/adapter
./setup-local-demo.sh

# 2. Run the demo
npm run start:legacy

# 3. View results
cat data/anonymized_data.csv | head -10
```

## 📋 What to Show Judges

### Step 1: Show Raw Data (with PII)
```bash
cat data/raw_data.csv | head -5
```
**Highlight:** Patient names, IDs, phone numbers, emails, addresses

### Step 2: Run Adapter
```bash
npm run start:legacy
```
**Watch for:**
- "Read X records from data/raw_data.csv"
- "Consent proofs: X (one per patient)"
- "Data proofs: X (one per patient)"
- HashScan links (copy these!)

### Step 3: Show Anonymized Data (no PII)
```bash
cat data/anonymized_data.csv | head -5
```
**Highlight:** No names, IDs, phones, emails - only anonymous PIDs and medical data

### Step 4: Verify on Hedera
- Copy HashScan link from terminal
- Open in browser
- Show transaction on Hedera testnet

## ⚠️ Important Notes

- **Use `npm run start:legacy`** (NOT `npm start`)
- `npm start` = API connector (connects to OpenMRS, FHIR servers)
- `npm run start:legacy` = CSV processor (processes CSV files)

## ✅ Pre-Demo Checklist

- [ ] `.env` file has `HOSPITAL_COUNTRY="Uganda"`
- [ ] `.env` file has Hedera credentials (OPERATOR_ID, OPERATOR_KEY)
- [ ] `data/raw_data.csv` exists
- [ ] Test run successful: `npm run start:legacy`
- [ ] HashScan links work

## 📁 Key Files

- `data/raw_data.csv` - Input (with PII)
- `data/anonymized_data.csv` - Output (no PII)
- `.env` - Configuration
- `LOCAL_DEMO_SETUP.md` - Detailed guide

## 🆘 Troubleshooting

**Error: "HOSPITAL_COUNTRY environment variable is required"**
→ Add `HOSPITAL_COUNTRY="Uganda"` to `.env`

**Error: "OPERATOR_ID, OPERATOR_KEY, HEDERA_NETWORK are required"**
→ Add Hedera credentials to `.env`

**Error: "Failed to read CSV file"**
→ Ensure `data/raw_data.csv` exists

