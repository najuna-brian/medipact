# Demo Video Recording Guide - STEP BY STEP

**Time Required**: 2-3 hours  
**Deadline**: Before submission deadline
**Video Length**: 3-5 minutes (CRITICAL)

---

## 🎯 WHAT YOU NEED TO SHOW (Critical Checklist)

Before you start recording, make sure you can show ALL of these:

- [ ] **Hospital uploads CSV file** (with real patient data visible)
- [ ] **Data gets anonymized** (show before/after if possible)
- [ ] **HCS transaction on HashScan** (REAL transaction, not mockup)
- [ ] **Researcher searches for data** (with filters working)
- [ ] **Purchase flow** (price calculation, payment)
- [ ] **Revenue distribution** (60/25/15 split visible)
- [ ] **Smart contract on HashScan** (RevenueSplitter contract page)
- [ ] **Metrics dashboard** (with REAL numbers, not zeros)

**If you can't show all of these, your video is incomplete!**

---

## STEP 1: Prepare Your Environment (15 minutes)

### 1.1 Start Backend Server

**Open Terminal 1:**
```bash
cd backend
npm start
```

**What you should see:**
```
Server running on port 8080
Database initialized
Hedera client connected
```

**If you see errors:**
- Check Node.js version: `node --version` (should be 18+)
- Check `.env` file exists and has Hedera credentials
- Check port 8080 is not in use

### 1.2 Start Frontend Server

**Open Terminal 2:**
```bash
cd frontend
npm run dev
```

**What you should see:**
```
Ready on http://localhost:3000
```

**Test it works:**
- Open browser: `http://localhost:3000`
- You should see the homepage

### 1.3 Create Demo Data

**In Terminal 1 (backend directory):**
```bash
npm run populate-demo
```

**What this does:**
- Creates 3-5 hospitals with API keys
- Creates 3-5 researchers with accounts
- Creates 100-500 patients with medical data
- Creates datasets ready for purchase

**What you should see:**
```
✅ Created hospitals: 5
✅ Created researchers: 5
✅ Created patients: 500
✅ Created datasets: 10
✅ Demo credentials saved to: backend/demo-credentials.json
```

### 1.4 Get Your Demo Credentials

**In Terminal 1:**
```bash
cat backend/demo-credentials.json
```

**Copy these credentials - you'll need them:**
- Hospital email and password (or API key)
- Researcher email and password
- Admin credentials (if needed)

**Save them in a text file for easy access during recording!**

### 1.5 Verify HashScan Links Work

**Test these links in your browser:**

1. **ConsentManager Contract:**
   - URL: `https://hashscan.io/testnet/contract/0xf2423F1E568eC90921045be96Ad2D618fCcd9841`
   - Should show: Contract details, transactions, code

2. **RevenueSplitter Contract:**
   - URL: `https://hashscan.io/testnet/contract/0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392`
   - Should show: Contract details, transactions, code

**If links don't work:**
- Make sure you're on testnet HashScan (not mainnet)
- Check contract addresses are correct

---

## STEP 2: Setup Screen Recording (10 minutes)

### 2.1 Choose Recording Software

**Option 1: OBS Studio (Recommended - Free)**
- Download: https://obsproject.com
- Setup: Window Capture → Select browser window
- Audio: Add Audio Input Capture (your microphone)

**Option 2: QuickTime (Mac only)**
- File → New Screen Recording
- Click record button
- Select area to record

**Option 3: Windows Game Bar (Windows 10/11)**
- Press `Win + G`
- Click record button
- Select area to record

### 2.2 Test Your Recording

**Before recording the real demo:**
1. Record 30 seconds of yourself talking
2. Play it back
3. Check:
   - [ ] Audio is clear (you can hear yourself)
   - [ ] Video quality is good (1080p minimum)
   - [ ] Screen is visible (not too dark/bright)
   - [ ] No background noise

**If audio is bad:**
- Use a better microphone
- Reduce background noise
- Speak closer to microphone

**If video is bad:**
- Increase recording resolution
- Ensure good lighting
- Close unnecessary windows

---

## STEP 3: Record Your Demo Video (30-45 minutes)

### ⚠️ CRITICAL: Follow This Exact Script

**Total Time: 3-5 minutes (NO LONGER!)**

---

### PART 1: Introduction (30 seconds)

**What to say:**
> "Hi, I'm [Your Name], and this is MediPact - The Verifiable Health Pact, built on Hedera Hashgraph. We're solving the patient data black market by creating a transparent, ethical medical data marketplace using Hedera's Consensus Service for immutable proof and HBAR for instant micropayments."

**What to show:**
- [ ] Project homepage: `http://localhost:3000`
- [ ] OR GitHub repository page
- [ ] Speak clearly and confidently

**Visual:** Keep it simple - just the homepage or repo

---

### PART 2: Hospital Data Upload (1 minute - CRITICAL)

**What to do (step by step):**

1. **Navigate to hospital login:**
   - Type in browser: `http://localhost:3000/hospital/login`
   - Press Enter
   - Wait for page to load

2. **Login with demo credentials:**
   - Enter email from `demo-credentials.json`
   - Enter password from `demo-credentials.json`
   - Click "Login" button
   - Wait for dashboard to load

3. **Navigate to upload page:**
   - Click on "Upload" in sidebar OR
   - Type: `http://localhost:3000/hospital/upload`
   - Wait for upload form to appear

4. **Upload CSV file:**
   - Click "Choose File" or "Browse" button
   - Select a CSV file (use `backend/adapter/data/anonymized_data.csv` OR create test CSV)
   - Click "Upload" button
   - Wait for upload to complete

5. **Show processing status:**
   - Look for "Processing..." or "Upload successful" message
   - If there's a processing page, navigate to it
   - Show that data is being processed

**What to say:**
> "Here's a hospital uploading patient data. The CSV contains patient names, IDs, addresses, phone numbers - everything we need to anonymize. Our adapter processes it, removing all PII through double anonymization."

**What to show:**
- [ ] Login page
- [ ] Upload form
- [ ] File selection
- [ ] Processing status

**Visual:** Make sure the upload button and file selection are visible on screen

---

### PART 3: Data Processing & HCS Submission (1 minute - CRITICAL)

**What to do (step by step):**

1. **Show processing history:**
   - Navigate to: `http://localhost:3000/hospital/processing`
   - OR check backend logs in Terminal 1
   - Look for processing status

2. **Find HCS transaction ID:**
   - Look in processing history for "HCS Topic ID" or "Transaction ID"
   - OR check backend database/logs for HCS message ID
   - Copy the transaction ID

3. **Open HashScan to verify:**
   - Open new browser tab
   - Go to: `https://hashscan.io/testnet/topic/[YOUR_TOPIC_ID]`
   - Replace `[YOUR_TOPIC_ID]` with actual topic ID
   - Show the transaction on HashScan

**What to say:**
> "The adapter anonymizes the data and submits proof hashes to Hedera Consensus Service, creating an immutable record. You can verify this on HashScan - the transaction is permanent and unalterable. Here's the actual transaction on HashScan."

**What to show:**
- [ ] Processing page with transaction ID
- [ ] HashScan page showing the transaction
- [ ] Transaction details (timestamp, message, etc.)

**Visual:** Make HashScan page clearly visible - this proves it's real!

---

### PART 4: Researcher Data Search (1 minute - CRITICAL)

**What to do (step by step):**

1. **Navigate to researcher login:**
   - Open new browser tab OR logout from hospital
   - Go to: `http://localhost:3000/researcher/login`
   - Wait for page to load

2. **Login with researcher credentials:**
   - Enter researcher email from `demo-credentials.json`
   - Enter researcher password
   - Click "Login"
   - Wait for dashboard

3. **Navigate to query page:**
   - Click "Query" or "Search" in sidebar
   - OR go to: `http://localhost:3000/researcher/query`
   - Wait for query form to load

4. **Enter search criteria:**
   - Disease: Type "Type 2 Diabetes" (or any condition from your demo data)
   - Country: Select "Uganda" (or any country from your demo data)
   - Number of Patients: Enter "100"
   - Click "Search" or "Query" button
   - Wait for results

5. **Show query results:**
   - Show the results table/list
   - Show number of patients found
   - Show preview of data (anonymized)

6. **Show CSV preview (if available):**
   - Look for "Preview" or "View CSV" button
   - Click it to show flattened CSV format
   - Show a few rows of data

**What to say:**
> "Now a researcher searches for data. They can filter by disease, country, demographics. The results show anonymized data in a flattened CSV format - one row per patient with all their medical data, but no PII like names or addresses."

**What to show:**
- [ ] Query form with filters
- [ ] Search results
- [ ] CSV preview (showing anonymized data)

**Visual:** Make sure the search filters and results are clearly visible

---

### PART 5: Purchase & Revenue Distribution (1 minute - CRITICAL)

**What to do (step by step):**

1. **Click Purchase button:**
   - Find "Purchase" or "Buy Dataset" button on results page
   - Click it
   - Wait for purchase page/modal to load

2. **Show price calculation:**
   - Show the price in USD and/or HBAR
   - Show how price is calculated (if visible)
   - Show dataset details

3. **Show payment flow:**
   - If there's a payment form, show it
   - If you need to enter transaction ID, enter a testnet transaction ID
   - OR simulate payment (explain it's simulated)
   - Click "Confirm Purchase" or similar

4. **Show purchase confirmation:**
   - Wait for confirmation message
   - Show "Purchase successful" or similar
   - Show transaction ID if provided

5. **Navigate to metrics dashboard:**
   - Go to: `http://localhost:3000/admin/dashboard`
   - OR go to: `http://localhost:8080/api/public/metrics`
   - Show Hedera Metrics section

6. **Show real metrics:**
   - Point to "Total Hedera Accounts Created" - show the number
   - Point to "Total HCS Messages" - show the number
   - Point to "Total Smart Contract Calls" - show the number
   - Point to "Total HBAR Distributed" - show the number
   - **IMPORTANT: These must be REAL numbers, not zeros!**

7. **Open RevenueSplitter contract on HashScan:**
   - Open new browser tab
   - Go to: `https://hashscan.io/testnet/contract/0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392`
   - Show the contract page
   - Show recent transactions (if any)

**What to say:**
> "The researcher purchases the dataset. Revenue is automatically distributed using our RevenueSplitter smart contract - 60% to patients, 25% to hospitals, 15% to platform. All transactions are verifiable on HashScan. Here's our smart contract, and here are the real metrics showing our Hedera network impact."

**What to show:**
- [ ] Purchase button and price
- [ ] Purchase confirmation
- [ ] Metrics dashboard with REAL numbers
- [ ] RevenueSplitter contract on HashScan

**Visual:** Metrics and HashScan are CRITICAL - judges need to see real numbers!

---

### PART 6: Conclusion (30 seconds)

**What to say:**
> "MediPact demonstrates how Hedera's unique services - HCS, EVM, Accounts, and HBAR - can solve real-world problems in healthcare. We've built a verifiable, ethical data marketplace that empowers patients, enables hospitals, and accelerates research. Thank you!"

**What to show:**
- [ ] Metrics dashboard again (briefly)
- [ ] OR project summary slide
- [ ] OR GitHub repository

**Visual:** End on a strong note - show the impact!

---

## STEP 4: Edit Your Video (30 minutes)

### 4.1 Basic Editing Checklist

**Use any video editor (iMovie, Windows Video Editor, DaVinci Resolve, etc.):**

- [ ] **Trim unnecessary pauses** - Remove long silences
- [ ] **Add title card** - "MediPact Demo" at the beginning (5 seconds)
- [ ] **Add end card** - "Thank you! medipact.space" at the end (5 seconds)
- [ ] **Check audio levels** - Make sure narration is clear
- [ ] **Add captions/subtitles** (OPTIONAL but recommended)
  - Helps judges understand if audio is unclear
  - Shows professionalism

### 4.2 Key Points to Highlight

**While editing, make sure these are CLEAR:**

- [ ] HashScan links are visible and readable
- [ ] Metrics numbers are clearly shown (zoom in if needed)
- [ ] Hedera integration is emphasized
- [ ] Real transactions are shown (not mockups)

### 4.3 Export Settings

**Export your video with these settings:**

- **Resolution:** 1080p (1920x1080) minimum
- **Format:** MP4
- **Frame Rate:** 30fps
- **Audio:** Clear, no background noise
- **Duration:** 3-5 minutes (CRITICAL - no longer!)

**File name:** `MediPact-Demo-Video.mp4`

---

## STEP 5: Upload to YouTube (15 minutes)

### 5.1 Create YouTube Video

1. **Go to YouTube:**
   - Visit: https://www.youtube.com/upload
   - Sign in with your Google account

2. **Select your video file:**
   - Click "Select files" or drag and drop
   - Choose your `MediPact-Demo-Video.mp4` file
   - Wait for upload to complete

3. **Add title:**
   ```
   MediPact - Verifiable Health Data Marketplace on Hedera
   ```

4. **Add description:**
```
MediPact is a verifiable medical data marketplace built on Hedera Hashgraph.

Built for: Hedera Hello Future: Ascension Hackathon 2025
Track: Open Track - Verifiable Healthcare Systems

Features:
- Hedera Consensus Service (HCS) for immutable consent proofs
- Hedera EVM Smart Contracts for automated revenue distribution
- Native Hedera Accounts for seamless wallet management
- HBAR micropayments for instant settlements

Live Demo: https://www.medipact.space
   GitHub: https://github.com/najuna-brian/medipact

#HederaHackathon #HelloFutureAscension #Hedera #Blockchain #Healthcare
```

5. **Set visibility:**
   - Choose **Unlisted** (recommended) - Only people with link can view
   - OR **Public** - Anyone can view
   - **Don't choose Private** - Judges won't be able to see it!

6. **Add thumbnail (optional but recommended):**
   - Click "Custom thumbnail"
   - Upload a screenshot of your app
   - Makes it look more professional

7. **Click "Publish":**
   - Wait for processing to complete
   - Usually takes 5-10 minutes

### 5.2 Get Your Video Link

**After publishing:**

1. **Copy the YouTube URL:**
- Format: `https://www.youtube.com/watch?v=[VIDEO_ID]`
   - OR short link: `https://youtu.be/[VIDEO_ID]`

2. **Test the link:**
   - Open in incognito/private browser window
   - Make sure video plays
   - Make sure it's accessible

3. **Save the link:**
   - Copy to a text file
   - You'll need it for pitch deck and submission

---

## STEP 6: Update Documentation (5 minutes)

### 6.1 Update HACKATHON_SUBMISSION.md

**Open:** `HACKATHON_SUBMISSION.md`

**Find this section:**
```markdown
## Demo Video

**YouTube Link**: [ADD YOUR YOUTUBE LINK HERE - See DEMO_VIDEO_GUIDE.md for instructions]
```

**Replace with:**
```markdown
## Demo Video

**YouTube Link**: https://www.youtube.com/watch?v=[YOUR_VIDEO_ID]
```

### 6.2 Update Pitch Deck

**When creating your pitch deck:**
- Add YouTube link to Slide 10 (Demo Video slide)
- Embed video if possible (Google Slides/PowerPoint support this)
- OR add large clickable link

---

## ⚠️ TROUBLESHOOTING

### Video Quality Issues

**Problem:** Video is blurry or low quality
- **Solution:** Record at higher resolution (1080p minimum)
- **Solution:** Export at higher quality settings

**Problem:** Audio is unclear or has background noise
- **Solution:** Use better microphone
- **Solution:** Record in quiet room
- **Solution:** Edit audio levels in video editor

### Demo Data Issues

**Problem:** `npm run populate-demo` fails
- **Solution:** Check database is initialized
- **Solution:** Check backend is running
- **Solution:** Check `.env` file has correct database settings

**Problem:** Can't login with demo credentials
- **Solution:** Re-run `npm run populate-demo`
- **Solution:** Check `demo-credentials.json` file exists
- **Solution:** Try different credentials from the file

### HashScan Links Not Working

**Problem:** HashScan links show "Not Found"
- **Solution:** Make sure you're on testnet HashScan (not mainnet)
- **Solution:** Check transaction IDs are correct
- **Solution:** Wait a few seconds - transactions take time to appear

**Problem:** Can't find HCS transaction ID
- **Solution:** Check backend logs for transaction IDs
- **Solution:** Check database for stored transaction IDs
- **Solution:** Upload new data to generate new transaction

### Services Not Starting

**Problem:** Backend won't start
- **Solution:** Check Node.js version: `node --version` (should be 18+)
- **Solution:** Check port 8080 is free: `lsof -i :8080` (Mac/Linux)
- **Solution:** Check `.env` file exists and has correct values

**Problem:** Frontend won't start
- **Solution:** Check port 3000 is free
- **Solution:** Check `npm install` completed successfully
- **Solution:** Check `.env.local` file exists

---

## ✅ FINAL CHECKLIST

Before submitting, verify:

- [ ] Video is 3-5 minutes long (not longer!)
- [ ] Video shows hospital upload
- [ ] Video shows HCS transaction on HashScan (REAL, not mockup)
- [ ] Video shows researcher search
- [ ] Video shows purchase flow
- [ ] Video shows metrics dashboard with REAL numbers
- [ ] Video shows smart contract on HashScan
- [ ] Video is uploaded to YouTube
- [ ] YouTube link is accessible (test in incognito)
- [ ] Link is added to HACKATHON_SUBMISSION.md
- [ ] Link is added to pitch deck

---

## 📋 QUICK REFERENCE

### Demo Credentials Location
`backend/demo-credentials.json`

### HashScan Links (Testnet)
- **ConsentManager:** https://hashscan.io/testnet/contract/0xf2423F1E568eC90921045be96Ad2D618fCcd9841
- **RevenueSplitter:** https://hashscan.io/testnet/contract/0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392

### Key URLs
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:8080
- **API Docs:** http://localhost:8080/api-docs
- **Metrics:** http://localhost:8080/api/public/metrics

---

**Time Estimate:** 2-3 hours total  
**Priority:** CRITICAL - Required for submission

**Good luck! 🚀**
