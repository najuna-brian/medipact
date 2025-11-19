# Demo Video Recording Guide - URGENT

**Time Required**: 2-3 hours  
**Deadline**: Before submission deadline

## Quick Checklist

- [ ] Record 3-5 minute demo video
- [ ] Upload to YouTube (unlisted or public)
- [ ] Get YouTube link
- [ ] Add link to pitch deck
- [ ] Add link to HACKATHON_SUBMISSION.md

---

## Step 1: Prepare Demo Environment (15 minutes)

### 1.1 Start Services
```bash
# Terminal 1: Backend
cd backend
npm start
# Should show: Server running on port 8080

# Terminal 2: Frontend  
cd frontend
npm run dev
# Should show: Ready on http://localhost:3000
```

### 1.2 Prepare Demo Data
```bash
cd backend
npm run populate-demo
# This creates hospitals, researchers, patients, and datasets
# Credentials saved to: backend/demo-credentials.json
```

### 1.3 Get Demo Credentials
```bash
cat backend/demo-credentials.json
# Save these for the demo:
# - Hospital credentials
# - Researcher credentials
# - Admin credentials (if needed)
```

### 1.4 Verify Contracts
- ConsentManager: `0xf2423F1E568eC90921045be96Ad2D618fCcd9841`
- RevenueSplitter: `0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392`
- Verify on HashScan: https://hashscan.io/testnet/contract/[ADDRESS]

---

## Step 2: Record Demo Video (30-45 minutes)

### 2.1 Setup Screen Recording
- Use OBS Studio, QuickTime (Mac), or Windows Game Bar
- Record at 1080p minimum
- Test audio levels before recording

### 2.2 Follow This Script (3-5 minutes)

#### Introduction (30 seconds)
> "Hi, I'm [Your Name], and this is MediPact - The Verifiable Health Pact, built on Hedera. We're solving the patient data black market by creating a transparent, ethical medical data marketplace using Hedera's Consensus Service for immutable proof and HBAR for instant micropayments."

**Visual**: Show project homepage or GitHub repo

#### Part 1: Hospital Data Upload (1 minute)
**Actions**:
1. Navigate to `http://localhost:3000/hospital/login`
2. Login with demo hospital credentials
3. Navigate to `/hospital/upload`
4. Upload sample CSV file (use `backend/adapter/data/` or create test CSV)
5. Show processing status

**Narration**:
> "Here's a hospital uploading patient data. The CSV contains patient names, IDs, addresses - everything we need to anonymize. Our adapter processes it, removing all PII through double anonymization."

#### Part 2: Data Processing & HCS Submission (1 minute)
**Actions**:
1. Show adapter processing logs (if visible)
2. Navigate to `/hospital/processing` to show processing history
3. Show HCS transaction IDs
4. Open HashScan link to verify transaction
   - Example: `https://hashscan.io/testnet/topic/[TOPIC_ID]`

**Narration**:
> "The adapter anonymizes the data and submits proof hashes to Hedera Consensus Service, creating an immutable record. You can verify this on HashScan - the transaction is permanent and unalterable."

#### Part 3: Researcher Data Search (1 minute)
**Actions**:
1. Navigate to `http://localhost:3000/researcher/login`
2. Login with demo researcher credentials
3. Navigate to `/researcher/query`
4. Enter search criteria:
   - Disease: "Type 2 Diabetes" (or any condition)
   - Country: "Uganda" (or any country)
   - Number of Patients: 100
5. Show query results preview
6. Show flattened CSV preview

**Narration**:
> "Now a researcher searches for data. They can filter by disease, country, demographics. The results show anonymized data in a flattened CSV format - one row per patient with all medical data, but no PII."

#### Part 4: Purchase & Revenue Distribution (1 minute)
**Actions**:
1. Click "Purchase" button
2. Show price calculation
3. Show payment flow (simulate or use testnet HBAR)
4. Show purchase confirmation
5. Navigate to `/admin/dashboard` or `/api/public/metrics`
6. Show Hedera Metrics:
   - Total Hedera Accounts
   - HCS Messages
   - Smart Contract Calls
   - HBAR Distributed
7. Open HashScan link to verify smart contract call:
   - RevenueSplitter: `https://hashscan.io/testnet/contract/0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392`

**Narration**:
> "The researcher purchases the dataset. Revenue is automatically distributed using our RevenueSplitter smart contract - 60% to patients, 25% to hospitals, 15% to platform. All transactions are verifiable on HashScan."

#### Conclusion (30 seconds)
**Visual**: Show metrics dashboard or project summary

**Narration**:
> "MediPact demonstrates how Hedera's unique services - HCS, EVM, Accounts, and HBAR - can solve real-world problems in healthcare. We've built a verifiable, ethical data marketplace that empowers patients, enables hospitals, and accelerates research. Thank you!"

---

## Step 3: Edit Video (30 minutes)

### 3.1 Basic Editing
- Trim unnecessary pauses
- Add captions/subtitles (optional but recommended)
- Add title card at beginning
- Add end card with links

### 3.2 Key Points to Highlight
- Show HashScan links clearly
- Highlight Hedera integration
- Show real transactions
- Demonstrate anonymization

### 3.3 Export Settings
- Resolution: 1080p minimum
- Format: MP4
- Audio: Clear narration
- Duration: 3-5 minutes

---

## Step 4: Upload to YouTube (15 minutes)

### 4.1 Create YouTube Video
1. Go to https://www.youtube.com/upload
2. Select your video file
3. Add title: "MediPact - Verifiable Health Data Marketplace on Hedera"
4. Add description:
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
GitHub: https://github.com/[your-username]/medipact

#HederaHackathon #HelloFutureAscension #Hedera #Blockchain #Healthcare
```

5. Set visibility: **Unlisted** (recommended) or **Public**
6. Add thumbnail (optional but recommended)
7. Click "Publish"

### 4.2 Get Video Link
- Copy the YouTube URL
- Format: `https://www.youtube.com/watch?v=[VIDEO_ID]`
- Or use short link: `https://youtu.be/[VIDEO_ID]`

---

## Step 5: Update Documentation (5 minutes)

### 5.1 Update HACKATHON_SUBMISSION.md
```markdown
## Demo Video

**YouTube Link**: [YOUR_YOUTUBE_LINK_HERE]
```

### 5.2 Update Pitch Deck
- Add YouTube link to Slide 10 (Demo Video slide)
- Embed video or add link

---

## Troubleshooting

### Video Quality Issues
- Record at higher resolution
- Use better microphone
- Reduce background noise

### Demo Data Issues
- Re-run `npm run populate-demo`
- Check database is initialized
- Verify backend is running

### HashScan Links Not Working
- Verify you're on testnet HashScan
- Check transaction IDs are correct
- Wait a few seconds for transaction to appear

### Services Not Starting
- Check Node.js version (18+)
- Check ports 3000 and 8080 are free
- Check environment variables are set

---

## Quick Reference

### Demo Credentials Location
`backend/demo-credentials.json`

### HashScan Links
- ConsentManager: https://hashscan.io/testnet/contract/0xf2423F1E568eC90921045be96Ad2D618fCcd9841
- RevenueSplitter: https://hashscan.io/testnet/contract/0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392

### Key URLs
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- API Docs: http://localhost:8080/api-docs
- Metrics: http://localhost:8080/api/public/metrics

---

## Final Checklist

- [ ] Video recorded (3-5 minutes)
- [ ] Video edited and polished
- [ ] Video uploaded to YouTube
- [ ] YouTube link obtained
- [ ] Link added to HACKATHON_SUBMISSION.md
- [ ] Link added to pitch deck
- [ ] Video is accessible (test the link)

---

**Time Estimate**: 2-3 hours total
**Priority**: CRITICAL - Required for submission

Good luck! 🚀

