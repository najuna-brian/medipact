#!/bin/bash
# Local Demo Setup Script for MediPact Adapter
# This script prepares the adapter for local demo/testing

set -e

echo "=== MediPact Adapter - Local Demo Setup ==="
echo ""

# Check if we're in the adapter directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the backend/adapter directory"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cat > .env << 'ENVEOF'
# Hedera Testnet Credentials
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"

# CSV Adapter Configuration (Required)
HOSPITAL_COUNTRY="Uganda"
HOSPITAL_LOCATION="Kampala"

# Smart Contract Addresses (Optional)
CONSENT_MANAGER_ADDRESS="0xf2423F1E568eC90921045be96Ad2D618fCcd9841"
REVENUE_SPLITTER_ADDRESS="0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392"
ENVEOF
    echo "✓ Created .env file. Please update OPERATOR_ID and OPERATOR_KEY with your Hedera credentials."
    echo ""
fi

# Check if HOSPITAL_COUNTRY is set
if ! grep -q "HOSPITAL_COUNTRY" .env || grep -q 'HOSPITAL_COUNTRY=""' .env; then
    echo "⚠️  HOSPITAL_COUNTRY not set in .env. Adding..."
    if ! grep -q "HOSPITAL_COUNTRY" .env; then
        echo "" >> .env
        echo "# CSV Adapter Configuration (Required)" >> .env
        echo "HOSPITAL_COUNTRY=\"Uganda\"" >> .env
        echo "HOSPITAL_LOCATION=\"Kampala\"" >> .env
    fi
    echo "✓ Added HOSPITAL_COUNTRY to .env"
    echo ""
fi

# Check if raw_data.csv exists
if [ ! -f "data/raw_data.csv" ]; then
    echo "⚠️  raw_data.csv not found in data/ directory"
    echo "   The adapter requires data/raw_data.csv to process"
    echo "   A sample file has been created, but you can replace it with your own CSV"
    echo ""
else
    echo "✓ Found data/raw_data.csv"
    RECORD_COUNT=$(tail -n +2 data/raw_data.csv | wc -l)
    echo "   Records: $RECORD_COUNT"
    echo ""
fi

# Verify required environment variables
echo "Checking environment variables..."
REQUIRED_VARS=("OPERATOR_ID" "OPERATOR_KEY" "HEDERA_NETWORK" "HOSPITAL_COUNTRY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
    if ! grep -q "^${var}=" .env || grep -q "^${var}=\"\"" .env || grep -q "^${var}=\"0.0.xxxxx\"" .env || grep -q "^${var}=\"0x...\"" .env; then
        MISSING_VARS+=("$var")
    fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "⚠️  Missing or placeholder values for: ${MISSING_VARS[*]}"
    echo "   Please update .env file with actual values"
    echo ""
else
    echo "✓ All required environment variables are set"
    echo ""
fi

# Check Node.js version
echo "Checking Node.js version..."
NODE_VERSION=$(node -v 2>/dev/null || echo "not found")
if [ "$NODE_VERSION" = "not found" ]; then
    echo "❌ Node.js not found. Please install Node.js 20+"
    exit 1
else
    echo "✓ Node.js: $NODE_VERSION"
    echo ""
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "⚠️  node_modules not found. Installing dependencies..."
    npm install
    echo "✓ Dependencies installed"
    echo ""
else
    echo "✓ Dependencies installed"
    echo ""
fi

echo "=== Setup Complete ==="
echo ""
echo "Next steps:"
echo "1. Verify .env file has correct Hedera credentials"
echo "2. Ensure data/raw_data.csv contains your data"
echo "3. Run the adapter: npm run start:legacy"
echo ""
echo "For demo:"
echo "  - Show raw_data.csv (with PII)"
echo "  - Run: npm run start:legacy"
echo "  - Show anonymized_data.csv (no PII)"
echo "  - Show HashScan links from terminal output"
echo ""

