# Demo Video Script - MediPact MVP

**Hackathon**: Hedera Hello Future: Ascension 2025  
**Duration**: 3-5 minutes  
**Format**: Screen recording with narration

---

## Script Outline

### Introduction (30 seconds)

**Visual**: Project repository on GitHub, README visible

**Narration**:
> "Hi, I'm [Name], and this is MediPact - The Verifiable Health Pact, built on Hedera. We're solving the patient data black market by creating a transparent, ethical medical data marketplace using Hedera's Consensus Service for immutable proof and HBAR for instant micropayments."

**Key Points**:
- Problem: Patient data sold without consent
- Solution: Verifiable, ethical marketplace on Hedera
- Focus: In-Person Bridge (MVP for non-digital patients)

---

### Problem Statement (30 seconds)

**Visual**: Show mockup or diagram of current data flow

**Narration**:
> "Today, patients' medical data is sold by brokers without their knowledge or compensation. Hospitals have valuable data but no safe way to share it. Researchers need verified, ethical data sources. We're building the bridge."

**Key Points**:
- Patients exploited
- Hospitals trapped
- Researchers need verified data

---

### Solution Overview (45 seconds)

**Visual**: Architecture diagram or flow chart

**Narration**:
> "MediPact uses Hedera Consensus Service to create immutable proof of consent and data authenticity. When a hospital processes patient data through our adapter, we anonymize it, generate cryptographic hashes, and submit proof to HCS. This creates an unalterable audit trail on Hedera's network. Patients get compensated via HBAR, with a 60/25/15 split going to patients, hospitals, and the platform."

**Key Points**:
- HCS for immutable proof
- Anonymization process
- Revenue sharing model
- Verifiable on-chain

---

### Live Demo - Part 1: The Data (30 seconds)

**Visual**: Show `raw_data.csv` file

**Narration**:
> "Let's start with sample hospital EHR data. This CSV contains lab results with patient names, IDs, addresses, and phone numbers - everything we need to anonymize."

**Actions**:
1. Open `adapter/data/raw_data.csv` in editor
2. Show patient names, IDs, addresses
3. Highlight PII fields

---

### Live Demo - Part 2: Running the Adapter (60 seconds)

**Visual**: Terminal, running `npm start`

**Narration**:
> "Now we run the MediPact Adapter. Watch as it reads the CSV, anonymizes the data by removing all PII and generating anonymous patient IDs, then submits proof hashes to Hedera Consensus Service."

**Actions**:
1. Open terminal in `adapter/` directory
2. Run `npm start`
3. Let it run through the steps
4. Highlight key outputs:
   - "Anonymized X records"
   - "Mapped Y unique patients"
   - Transaction IDs appearing
   - HashScan links

**Key Moments to Capture**:
- ✓ Anonymization complete
- ✓ Topics created
- ✓ Consent proofs submitted
- ✓ Data proofs submitted
- ✓ HashScan links displayed

---

### Live Demo - Part 3: Verifying Anonymization (30 seconds)

**Visual**: Show `anonymized_data.csv` file

**Narration**:
> "Let's verify the anonymization worked. Notice how all PII is gone - no names, no IDs, no addresses. But the medical data is preserved - lab tests, results, dates. Each patient now has an anonymous ID like PID-001, PID-002."

**Actions**:
1. Open `adapter/data/anonymized_data.csv`
2. Show headers (no PII fields)
3. Show anonymous PIDs
4. Show preserved medical data

---

### Live Demo - Part 4: HashScan Verification (45 seconds)

**Visual**: Open HashScan links in browser

**Narration**:
> "Here's the magic - every consent and data proof is now immutably recorded on Hedera. I'll open one of these HashScan links to show you the transaction on Hedera's testnet. This is permanent, verifiable proof that can't be altered."

**Actions**:
1. Click on a HashScan link from console output
2. Show transaction details on HashScan
3. Show topic page with messages
4. Highlight:
   - Transaction status: SUCCESS
   - Transaction timestamp
   - Message content (hash)

**Key Points**:
- Immutable on Hedera
- Verifiable by anyone
- Permanent record

---

### Live Demo - Part 5: Payout Simulation (30 seconds)

**Visual**: Console output showing payout simulation

**Narration**:
> "Finally, here's the revenue split. For this demo run, we processed 10 records. The revenue is automatically split 60% to patients, 25% to hospitals, and 15% to the platform. In production, this would be handled by our RevenueSplitter smart contract, converting HBAR to local currency for direct patient payouts."

**Actions**:
1. Scroll to payout simulation section
2. Show USD amounts
3. Show local currency (if configured)
4. Highlight per-patient calculation

---

### Technical Highlights (30 seconds)

**Visual**: Show code snippets or architecture

**Narration**:
> "Technically, we're using Hedera Consensus Service for immutable proof, custom Solidity contracts for revenue distribution, and a JavaScript adapter that processes hospital data. The entire system is designed to be auditable, transparent, and ethical."

**Key Points**:
- HCS integration
- Smart contracts
- JavaScript adapter
- Hedera SDK

---

### Future Vision (30 seconds)

**Visual**: Show mockups or diagrams

**Narration**:
> "This MVP demonstrates the In-Person Bridge - our solution for billions of patients without smartphones. Our full vision includes a digital health wallet, passive marketplace, and active studies portal. But for now, we're proving the concept works - verifiable, ethical medical data transactions on Hedera."

**Key Points**:
- MVP: In-Person Bridge
- Future: Digital Patient path
- Scalable solution

---

### Closing (15 seconds)

**Visual**: Project repository, HashScan links

**Narration**:
> "MediPact - The Verifiable Health Pact. Built on Hedera. Thank you!"

**Call to Action**:
- GitHub repository link
- HashScan transaction links
- Contact information (if applicable)

---

## Recording Tips

### Preparation

1. **Test First**: Run the adapter multiple times to ensure smooth execution
2. **Clean Environment**: Close unnecessary apps, clear terminal history
3. **Prepare Script**: Have narration script ready (can be read or memorized)
4. **Test Audio**: Ensure microphone quality is good
5. **Screen Resolution**: Use 1920x1080 or higher for clarity

### Recording Setup

1. **Screen Recording Tool**: 
   - OBS Studio (free, open-source)
   - Loom (browser-based)
   - QuickTime (Mac)
   - Windows Game Bar (Windows)

2. **Audio**: Use good microphone or headset

3. **Browser**: Have HashScan ready in a clean browser window

### During Recording

1. **Pace**: Speak clearly, not too fast
2. **Pauses**: Pause when code is running (don't rush)
3. **Highlights**: Use cursor to highlight important parts
4. **Zoom**: Zoom in on terminal output for readability
5. **Transitions**: Smooth transitions between sections

### Editing Tips

1. **Cut Long Waits**: Edit out long waits for transactions
2. **Add Subtitles**: Consider adding text overlays for key points
3. **Add Music**: Light background music (optional)
4. **Add Titles**: Title cards for each section
5. **Logo**: Add MediPact logo/branding

---

## Key Screenshots to Capture

1. **Raw Data**: `raw_data.csv` showing PII
2. **Anonymized Data**: `anonymized_data.csv` showing no PII
3. **Terminal Output**: Complete adapter run
4. **HashScan Transaction**: One successful transaction
5. **HashScan Topic**: Topic page showing messages
6. **Payout Simulation**: Revenue split display

---

## Demo Checklist

Before recording:
- [ ] Adapter runs successfully without errors
- [ ] HashScan links are valid and accessible
- [ ] Anonymized output is correct
- [ ] All files are in correct locations
- [ ] Terminal is clean and ready
- [ ] Browser has HashScan ready
- [ ] Script is prepared
- [ ] Audio is tested

During recording:
- [ ] Show problem clearly
- [ ] Demonstrate solution step-by-step
- [ ] Verify anonymization works
- [ ] Show HashScan transactions
- [ ] Explain technical implementation
- [ ] Highlight Hedera integration
- [ ] Show payout simulation

After recording:
- [ ] Review video for clarity
- [ ] Edit if needed
- [ ] Upload to YouTube
- [ ] Add to pitch deck
- [ ] Test YouTube link works

---

## Video Specifications

- **Duration**: 3-5 minutes
- **Format**: MP4
- **Resolution**: 1920x1080 (Full HD) or higher
- **Frame Rate**: 30fps minimum
- **Audio**: Clear narration, minimal background noise
- **File Size**: Keep under 500MB for easy upload

---

## Upload and Submission

1. **Upload to YouTube**:
   - Title: "MediPact - The Verifiable Health Pact | Hedera Hackathon 2025"
   - Description: Include problem, solution, tech stack, GitHub link
   - Visibility: Public or Unlisted
   - Thumbnail: Create custom thumbnail with MediPact branding

2. **Add to Pitch Deck**:
   - Insert YouTube link in demo section
   - Ensure link is clickable/embedded

3. **Submit to Hackathon**:
   - Include YouTube link in submission form
   - Verify link works from different devices

---

## Example Narration Script (Full)

```
[0:00-0:30] Introduction
"Hi, I'm [Name], and this is MediPact - The Verifiable Health Pact, built on Hedera. We're solving the patient data black market by creating a transparent, ethical medical data marketplace..."

[0:30-1:00] Problem
"Today, patients' medical data is sold by brokers without their knowledge or compensation..."

[1:00-1:45] Solution
"MediPact uses Hedera Consensus Service to create immutable proof of consent and data authenticity..."

[1:45-2:15] Demo - Data
"Let's start with sample hospital EHR data. This CSV contains lab results with patient names, IDs, addresses..."

[2:15-3:15] Demo - Adapter
"Now we run the MediPact Adapter. Watch as it reads the CSV, anonymizes the data..."

[3:15-3:45] Demo - Verification
"Let's verify the anonymization worked. Notice how all PII is gone..."

[3:45-4:30] Demo - HashScan
"Here's the magic - every consent and data proof is now immutably recorded on Hedera..."

[4:30-5:00] Demo - Payout
"Finally, here's the revenue split. For this demo run, we processed 10 records..."

[5:00-5:30] Technical
"Technically, we're using Hedera Consensus Service for immutable proof..."

[5:30-6:00] Future Vision
"This MVP demonstrates the In-Person Bridge - our solution for billions of patients..."

[6:00-6:15] Closing
"MediPact - The Verifiable Health Pact. Built on Hedera. Thank you!"
```

---

## Backup Plan

If something goes wrong during recording:

1. **Have Screenshots Ready**: Can create slideshow with screenshots
2. **Pre-recorded Sections**: Record key sections separately, edit together
3. **Alternative Demo**: Can show HashScan links without live run

---

## Success Metrics

A successful demo video should:
- ✅ Clearly explain the problem
- ✅ Show working solution
- ✅ Demonstrate Hedera integration
- ✅ Be engaging and professional
- ✅ Fit within time limit
- ✅ Have clear audio and visuals

---

Good luck with your demo video!


