# MediPact Adapter - Demo Resources Index

## 🎯 Start Here

**New to the demo?** Start with:
1. **`DEMO_SUMMARY.md`** - Overview of both demo options
2. **`DEMO_QUICK_START.md`** - Quick commands reference

**Setting up for the first time?**
1. **`setup-local-demo.sh`** - Automated setup (run this first)
2. **`verify-demo-ready.sh`** - Verify everything is ready

**Need detailed instructions?**
1. **`LOCAL_DEMO_SETUP.md`** - Complete guide with troubleshooting

---

## 📚 All Demo Resources

### Setup & Verification
| File | Purpose | When to Use |
|------|---------|-------------|
| `setup-local-demo.sh` | Automated setup script | First time setup |
| `verify-demo-ready.sh` | Pre-demo verification | Before any demo |
| `.env` | Configuration file | Edit for your environment |

### Documentation
| File | Purpose | Audience |
|------|---------|----------|
| `DEMO_SUMMARY.md` | Overview of demo options | Everyone |
| `DEMO_QUICK_START.md` | Quick reference card | Judges, quick demos |
| `LOCAL_DEMO_SETUP.md` | Complete setup guide | Judges, detailed setup |
| `LOCAL_DEMO_READY.md` | Setup completion summary | After setup |
| `DEMO_INDEX.md` | This file - navigation | Everyone |

### Data Files
| File | Purpose | Location |
|------|---------|----------|
| `raw_data.csv` | Input data (with PII) | `data/raw_data.csv` |
| `anonymized_data.csv` | Output data (no PII) | `data/anonymized_data.csv` |

### Scripts
| File | Purpose | Command |
|------|---------|---------|
| CSV Processor | Process CSV files | `npm run start:legacy` |
| API Connector | Connect to APIs | `npm start` |

---

## 🚀 Quick Navigation

### I want to...

**...set up the demo for the first time**
→ Run `./setup-local-demo.sh`

**...verify everything is ready**
→ Run `./verify-demo-ready.sh`

**...run a quick demo**
→ See `DEMO_QUICK_START.md`

**...understand the difference between demos**
→ See `DEMO_SUMMARY.md`

**...get detailed setup instructions**
→ See `LOCAL_DEMO_SETUP.md`

**...troubleshoot an issue**
→ See `LOCAL_DEMO_SETUP.md` (Troubleshooting section)

**...see what files were created**
→ See `LOCAL_DEMO_READY.md`

---

## 📋 Demo Workflows

### Local Demo Workflow
```
1. ./setup-local-demo.sh          # Setup
2. ./verify-demo-ready.sh          # Verify
3. cat data/raw_data.csv | head   # Show input
4. npm run start:legacy            # Process
5. cat data/anonymized_data.csv   # Show output
6. Open HashScan link             # Verify
```

### Live Demo Workflow
```
1. Start backend server
2. Start frontend
3. Navigate to /hospital/upload
4. Upload CSV file
5. View results in UI
6. Click HashScan links
```

---

## 🎬 Demo Types

### Type 1: Local Terminal Demo
- **Best for:** Judges, technical demos, testing
- **Setup:** `./setup-local-demo.sh`
- **Run:** `npm run start:legacy`
- **Shows:** Terminal output, file comparison

### Type 2: Live Web Demo
- **Best for:** Product demos, user experience
- **Setup:** Backend + frontend running
- **Run:** Upload via web interface
- **Shows:** Full system, web UI

---

## ✅ Pre-Demo Checklist

Use this before any demo:

- [ ] Run `./verify-demo-ready.sh` (all checks pass)
- [ ] Test run successful (`npm run start:legacy`)
- [ ] HashScan links work (open in browser)
- [ ] Know which demo type you're doing
- [ ] Have backup plan if something fails

---

## 🆘 Need Help?

1. **Setup issues:** See `LOCAL_DEMO_SETUP.md` → Troubleshooting
2. **Command questions:** See `DEMO_QUICK_START.md`
3. **Understanding options:** See `DEMO_SUMMARY.md`
4. **Verification:** Run `./verify-demo-ready.sh`

---

## 📖 Related Documentation

- **Main README:** `README.md` - General adapter documentation
- **Demo Script:** `../docs/archive/DEMO_SCRIPT.md` - Video demo script
- **Backend Docs:** `../../docs/` - Backend documentation

---

**Everything you need for a successful demo is here! 🎉**

