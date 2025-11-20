#!/bin/bash
# Verification script to ensure demo is ready
# Run this before your demo to verify everything is set up correctly

set -e

echo "=== MediPact Demo Readiness Check ==="
echo ""

ERRORS=0
WARNINGS=0

# Check if in correct directory
if [ ! -f "package.json" ]; then
    echo "❌ ERROR: Not in adapter directory. Run from backend/adapter/"
    exit 1
fi

# Check .env file
echo "1. Checking .env file..."
if [ ! -f ".env" ]; then
    echo "   ❌ .env file not found"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✓ .env file exists"
    
    # Check required variables
    if ! grep -q '^HOSPITAL_COUNTRY=' .env || grep -q '^HOSPITAL_COUNTRY=""' .env; then
        echo "   ❌ HOSPITAL_COUNTRY not set in .env"
        ERRORS=$((ERRORS + 1))
    else
        HOSPITAL_COUNTRY=$(grep '^HOSPITAL_COUNTRY=' .env | cut -d'=' -f2 | tr -d '"')
        echo "   ✓ HOSPITAL_COUNTRY: $HOSPITAL_COUNTRY"
    fi
    
    if ! grep -q '^OPERATOR_ID=' .env || grep -q '^OPERATOR_ID="0.0.xxxxx"' .env; then
        echo "   ⚠️  OPERATOR_ID not set or using placeholder"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "   ✓ OPERATOR_ID is set"
    fi
    
    if ! grep -q '^OPERATOR_KEY=' .env || grep -q '^OPERATOR_KEY="0x..."' .env; then
        echo "   ⚠️  OPERATOR_KEY not set or using placeholder"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "   ✓ OPERATOR_KEY is set"
    fi
    
    if ! grep -q '^HEDERA_NETWORK=' .env; then
        echo "   ❌ HEDERA_NETWORK not set in .env"
        ERRORS=$((ERRORS + 1))
    else
        HEDERA_NETWORK=$(grep '^HEDERA_NETWORK=' .env | cut -d'=' -f2 | tr -d '"')
        echo "   ✓ HEDERA_NETWORK: $HEDERA_NETWORK"
    fi
fi
echo ""

# Check CSV file
echo "2. Checking CSV data file..."
if [ ! -f "data/raw_data.csv" ]; then
    echo "   ❌ data/raw_data.csv not found"
    ERRORS=$((ERRORS + 1))
else
    RECORD_COUNT=$(tail -n +2 data/raw_data.csv 2>/dev/null | wc -l)
    if [ "$RECORD_COUNT" -eq 0 ]; then
        echo "   ⚠️  CSV file exists but has no data records"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "   ✓ data/raw_data.csv exists with $RECORD_COUNT records"
    fi
    
    # Check for required columns
    HEADER=$(head -1 data/raw_data.csv)
    if echo "$HEADER" | grep -q "Patient ID" && echo "$HEADER" | grep -q "Patient Name"; then
        echo "   ✓ CSV has required columns (Patient ID, Patient Name)"
    else
        echo "   ⚠️  CSV may be missing required columns"
        WARNINGS=$((WARNINGS + 1))
    fi
fi
echo ""

# Check Node.js
echo "3. Checking Node.js..."
if ! command -v node &> /dev/null; then
    echo "   ❌ Node.js not found"
    ERRORS=$((ERRORS + 1))
else
    NODE_VERSION=$(node -v)
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_MAJOR" -lt 20 ]; then
        echo "   ⚠️  Node.js version $NODE_VERSION (requires 20+)"
        WARNINGS=$((WARNINGS + 1))
    else
        echo "   ✓ Node.js: $NODE_VERSION"
    fi
fi
echo ""

# Check dependencies
echo "4. Checking dependencies..."
if [ ! -d "node_modules" ]; then
    echo "   ❌ node_modules not found. Run: npm install"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✓ Dependencies installed"
fi
echo ""

# Check adapter script
echo "5. Checking adapter script..."
if [ ! -f "src/index.js" ]; then
    echo "   ❌ src/index.js not found"
    ERRORS=$((ERRORS + 1))
else
    echo "   ✓ CSV adapter script exists (src/index.js)"
fi
echo ""

# Summary
echo "=== Summary ==="
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo "✅ All checks passed! Demo is ready."
    echo ""
    echo "To run the demo:"
    echo "  npm run start:legacy"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo "⚠️  $WARNINGS warning(s) found, but demo should work."
    echo ""
    echo "To run the demo:"
    echo "  npm run start:legacy"
    exit 0
else
    echo "❌ $ERRORS error(s) found. Please fix before running demo."
    echo "⚠️  $WARNINGS warning(s) found."
    echo ""
    echo "Run ./setup-local-demo.sh to fix common issues."
    exit 1
fi

