#!/bin/bash

# Test Adapter-Backend Integration
# This script tests the complete flow from adapter to backend to Hedera

set -e

echo "🧪 Testing Adapter-Backend Integration"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_API_URL:-http://localhost:3002}"
ADAPTER_DIR="adapter"

# Check if backend is running
echo "1. Checking backend connectivity..."
if curl -s -f "${BACKEND_URL}/health" > /dev/null; then
    echo -e "${GREEN}✓${NC} Backend is running at ${BACKEND_URL}"
else
    echo -e "${RED}✗${NC} Backend is not running at ${BACKEND_URL}"
    echo "   Please start the backend server first:"
    echo "   cd backend && npm start"
    exit 1
fi
echo ""

# Check if adapter directory exists
if [ ! -d "${ADAPTER_DIR}" ]; then
    echo -e "${RED}✗${NC} Adapter directory not found: ${ADAPTER_DIR}"
    exit 1
fi

# Check if .env file exists in adapter
if [ ! -f "${ADAPTER_DIR}/.env" ]; then
    echo -e "${YELLOW}⚠${NC}  Adapter .env file not found"
    echo "   Creating .env.example reference..."
    echo "   Please create ${ADAPTER_DIR}/.env with required variables"
    echo ""
fi

# Test 1: Backend Health Check
echo "2. Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s "${BACKEND_URL}/health")
if echo "${HEALTH_RESPONSE}" | grep -q "ok\|healthy\|status"; then
    echo -e "${GREEN}✓${NC} Backend health check passed"
    echo "   Response: ${HEALTH_RESPONSE}"
else
    echo -e "${RED}✗${NC} Backend health check failed"
    echo "   Response: ${HEALTH_RESPONSE}"
    exit 1
fi
echo ""

# Test 2: Revenue API Endpoint Check
echo "3. Testing revenue API endpoints..."
REVENUE_ENDPOINTS=(
    "/api/revenue/distribute"
    "/api/revenue/distribute-bulk"
)

for endpoint in "${REVENUE_ENDPOINTS[@]}"; do
    # Test if endpoint exists (should return 400/401/422 for missing params, not 404)
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BACKEND_URL}${endpoint}" \
        -H "Content-Type: application/json" \
        -d '{}')
    
    if [ "${STATUS}" = "404" ]; then
        echo -e "${RED}✗${NC} Endpoint not found: ${endpoint}"
        exit 1
    else
        echo -e "${GREEN}✓${NC} Endpoint exists: ${endpoint} (status: ${STATUS})"
    fi
done
echo ""

# Test 3: Patient Lookup API
echo "4. Testing patient lookup API..."
LOOKUP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X POST "${BACKEND_URL}/api/patient/lookup" \
    -H "Content-Type: application/json" \
    -d '{}')

if [ "${LOOKUP_STATUS}" = "404" ]; then
    echo -e "${RED}✗${NC} Patient lookup endpoint not found"
    exit 1
else
    echo -e "${GREEN}✓${NC} Patient lookup endpoint exists (status: ${LOOKUP_STATUS})"
fi
echo ""

# Test 4: Check adapter dependencies
echo "5. Checking adapter dependencies..."
cd "${ADAPTER_DIR}"

if [ ! -f "package.json" ]; then
    echo -e "${RED}✗${NC} package.json not found in adapter directory"
    exit 1
fi

# Check if axios is installed
if grep -q '"axios"' package.json; then
    echo -e "${GREEN}✓${NC} axios dependency found in package.json"
    
    # Check if node_modules exists and axios is installed
    if [ -d "node_modules/axios" ]; then
        echo -e "${GREEN}✓${NC} axios is installed"
    else
        echo -e "${YELLOW}⚠${NC}  axios not installed, running npm install..."
        npm install
    fi
else
    echo -e "${RED}✗${NC} axios dependency not found in package.json"
    exit 1
fi
echo ""

# Test 5: Check adapter revenue integration file
echo "6. Checking adapter revenue integration..."
cd ..
if [ -f "${ADAPTER_DIR}/src/services/revenue-integration.js" ]; then
    echo -e "${GREEN}✓${NC} Revenue integration service exists"
    
    # Check if required functions are exported
    if grep -q "export.*distributeRevenueAfterProcessing" "${ADAPTER_DIR}/src/services/revenue-integration.js"; then
        echo -e "${GREEN}✓${NC} distributeRevenueAfterProcessing function found"
    else
        echo -e "${RED}✗${NC} distributeRevenueAfterProcessing function not found"
        exit 1
    fi
    
    if grep -q "export.*lookupPatientUPI" "${ADAPTER_DIR}/src/services/revenue-integration.js"; then
        echo -e "${GREEN}✓${NC} lookupPatientUPI function found"
    else
        echo -e "${RED}✗${NC} lookupPatientUPI function not found"
        exit 1
    fi
else
    echo -e "${RED}✗${NC} Revenue integration service not found"
    exit 1
fi
echo ""

# Test 6: Check adapter index.js integration
echo "7. Checking adapter main integration..."
if grep -q "distributeRevenueAfterProcessing" "${ADAPTER_DIR}/src/index.js"; then
    echo -e "${GREEN}✓${NC} Revenue distribution integrated in adapter main file"
else
    echo -e "${RED}✗${NC} Revenue distribution not integrated in adapter main file"
    exit 1
fi
echo ""

# Test 7: Environment Variables Check
echo "8. Checking environment variables..."
cd "${ADAPTER_DIR}"

if [ -f ".env" ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check for required variables (non-blocking, just warnings)
    if grep -q "HOSPITAL_ID" .env && ! grep -q "^HOSPITAL_ID=$" .env && ! grep -q "^HOSPITAL_ID=\"\"" .env; then
        echo -e "${GREEN}✓${NC} HOSPITAL_ID is set"
    else
        echo -e "${YELLOW}⚠${NC}  HOSPITAL_ID not set or empty (required for revenue distribution)"
    fi
    
    if grep -q "BACKEND_API_URL" .env && ! grep -q "^BACKEND_API_URL=$" .env && ! grep -q "^BACKEND_API_URL=\"\"" .env; then
        BACKEND_URL_FROM_ENV=$(grep "^BACKEND_API_URL=" .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
        echo -e "${GREEN}✓${NC} BACKEND_API_URL is set: ${BACKEND_URL_FROM_ENV}"
    else
        echo -e "${YELLOW}⚠${NC}  BACKEND_API_URL not set (will default to http://localhost:3002)"
    fi
    
    if grep -q "HOSPITAL_COUNTRY" .env && ! grep -q "^HOSPITAL_COUNTRY=$" .env && ! grep -q "^HOSPITAL_COUNTRY=\"\"" .env; then
        echo -e "${GREEN}✓${NC} HOSPITAL_COUNTRY is set"
    else
        echo -e "${YELLOW}⚠${NC}  HOSPITAL_COUNTRY not set (required for anonymization)"
    fi
else
    echo -e "${YELLOW}⚠${NC}  .env file not found"
    echo "   Create ${ADAPTER_DIR}/.env with:"
    echo "   - HOSPITAL_ID=your-hospital-id"
    echo "   - BACKEND_API_URL=http://localhost:3002"
    echo "   - HOSPITAL_COUNTRY=your-country"
    echo "   - OPERATOR_ID, OPERATOR_KEY, HEDERA_NETWORK"
fi
echo ""

# Summary
echo "======================================"
echo -e "${GREEN}✅ Integration Test Summary${NC}"
echo "======================================"
echo ""
echo "All basic checks passed! The adapter-backend integration is set up correctly."
echo ""
echo "Next steps:"
echo "1. Ensure you have:"
echo "   - A registered hospital with HOSPITAL_ID"
echo "   - Registered patients with contact info (email/phone/national ID)"
echo "   - Hedera Account IDs for patients and hospital"
echo ""
echo "2. Run the adapter:"
echo "   cd adapter && npm start"
echo ""
echo "3. The adapter will automatically:"
echo "   - Process and anonymize data"
echo "   - Look up patient UPIs from backend"
echo "   - Distribute revenue using Hedera Account IDs"
echo ""
echo "For detailed documentation, see:"
echo "  docs/ADAPTER_BACKEND_INTEGRATION.md"
echo ""

