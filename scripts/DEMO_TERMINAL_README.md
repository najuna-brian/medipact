# Terminal Demo Script

A concise, impressive terminal demo that showcases all 4 Hedera services and the complete MediPact flow.

## Quick Start

1. **Start the backend:**
   ```bash
   cd backend
   npm start
   ```

2. **In another terminal, run the demo:**
   ```bash
   cd scripts
   ./demo-terminal.sh
   ```

3. **Or with custom API URL:**
   ```bash
   API_URL=http://your-api-url:8080 ./demo-terminal.sh
   ```

## What the Demo Shows

1. **Opening** - Problem statement and Hedera services overview
2. **Hedera Accounts** - Hospital registration creates native account (0.0.xxxxx)
3. **HCS** - Data upload → anonymization → HCS topic submission
4. **EVM Smart Contracts** - ConsentManager contract interaction
5. **Researcher Query** - Marketplace query with consent validation
6. **HBAR Payments** - Purchase and automated revenue distribution (60/25/15 split)
7. **Network Impact** - Real metrics from `/api/public/metrics`
8. **Summary** - All 4 Hedera services highlighted

## Demo Duration

Approximately **3-5 minutes** - perfect for hackathon presentations.

## Tips for Best Results

1. **Pre-populate data** (optional):
   ```bash
   cd backend
   npm run populate-demo
   ```

2. **Have HashScan ready** - The demo shows HashScan links you can open

3. **Pause at each section** - The script has built-in delays, but you can pause to explain

4. **Emphasize key points:**
   - "Exclusively on Hedera"
   - "Can't be done on any other blockchain"
   - "All 4 Hedera services"
   - "Production-ready"

## Requirements

- Backend server running on `http://localhost:8080` (or set `API_URL`)
- `curl` installed
- `bash` shell

## Troubleshooting

- **Hospital registration fails**: Make sure backend is running and Hedera credentials are configured
- **Upload fails**: May require adapter service to be running
- **Metrics not showing**: Ensure backend has processed some data and metrics are available

