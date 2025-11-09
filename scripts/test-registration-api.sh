#!/bin/bash

# Test Registration Flows - API Testing
# Tests patient and hospital registration to verify Hedera Account IDs are created and returned

set -e

BASE_URL="${BASE_URL:-http://localhost:3002}"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing Registration Flows${NC}"
echo "================================"
echo ""

# Check if server is running
if ! curl -s "$BASE_URL/health" > /dev/null; then
  echo -e "${RED}❌ Backend server is not running${NC}"
  echo "Please start it with: cd backend && npm start"
  exit 1
fi

echo -e "${GREEN}✅ Backend server is running${NC}"
echo ""

# Test 1: Patient Registration
echo -e "${YELLOW}Test 1: Patient Registration${NC}"
PATIENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/patient/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Patient",
    "dateOfBirth": "1990-01-15",
    "email": "test@example.com",
    "phone": "+1234567890"
  }')

echo "Response: $PATIENT_RESPONSE"
echo ""

if echo "$PATIENT_RESPONSE" | grep -q "hederaAccountId"; then
  PATIENT_UPI=$(echo "$PATIENT_RESPONSE" | grep -o '"upi":"[^"]*"' | cut -d'"' -f4)
  PATIENT_ACCOUNT=$(echo "$PATIENT_RESPONSE" | grep -o '"hederaAccountId":"[^"]*"' | cut -d'"' -f4)
  echo -e "${GREEN}✅ Patient Registration: SUCCESS${NC}"
  echo "   UPI: $PATIENT_UPI"
  echo "   Hedera Account ID: $PATIENT_ACCOUNT"
  echo "   HashScan: https://hashscan.io/testnet/account/$PATIENT_ACCOUNT"
else
  echo -e "${RED}❌ Patient Registration: FAILED (No hederaAccountId in response)${NC}"
  PATIENT_UPI=""
  PATIENT_ACCOUNT=""
fi
echo ""

# Test 2: Hospital Registration
echo -e "${YELLOW}Test 2: Hospital Registration${NC}"
HOSPITAL_RESPONSE=$(curl -s -X POST "$BASE_URL/api/hospital/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "country": "Uganda",
    "location": "Kampala"
  }')

echo "Response: $HOSPITAL_RESPONSE"
echo ""

if echo "$HOSPITAL_RESPONSE" | grep -q "hederaAccountId"; then
  HOSPITAL_ID=$(echo "$HOSPITAL_RESPONSE" | grep -o '"hospitalId":"[^"]*"' | cut -d'"' -f4)
  HOSPITAL_ACCOUNT=$(echo "$HOSPITAL_RESPONSE" | grep -o '"hederaAccountId":"[^"]*"' | cut -d'"' -f4)
  HOSPITAL_API_KEY=$(echo "$HOSPITAL_RESPONSE" | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4)
  echo -e "${GREEN}✅ Hospital Registration: SUCCESS${NC}"
  echo "   Hospital ID: $HOSPITAL_ID"
  echo "   Hedera Account ID: $HOSPITAL_ACCOUNT"
  echo "   HashScan: https://hashscan.io/testnet/account/$HOSPITAL_ACCOUNT"
  echo "   API Key: ${HOSPITAL_API_KEY:0:20}..."
else
  echo -e "${RED}❌ Hospital Registration: FAILED (No hederaAccountId in response)${NC}"
  HOSPITAL_ID=""
  HOSPITAL_ACCOUNT=""
  HOSPITAL_API_KEY=""
fi
echo ""

# Test 3: Patient Summary (if patient was created)
if [ -n "$PATIENT_UPI" ]; then
  echo -e "${YELLOW}Test 3: Patient Summary${NC}"
  SUMMARY_RESPONSE=$(curl -s -X GET "$BASE_URL/api/patient/$PATIENT_UPI/summary")
  
  echo "Response: $SUMMARY_RESPONSE"
  echo ""
  
  if echo "$SUMMARY_RESPONSE" | grep -q "hederaAccountId"; then
    SUMMARY_ACCOUNT=$(echo "$SUMMARY_RESPONSE" | grep -o '"hederaAccountId":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Patient Summary: SUCCESS${NC}"
    echo "   Hedera Account ID: $SUMMARY_ACCOUNT"
  else
    echo -e "${RED}❌ Patient Summary: FAILED (No hederaAccountId in response)${NC}"
  fi
  echo ""
fi

# Test 4: Hospital Patient Registration (if hospital was created)
if [ -n "$HOSPITAL_ID" ] && [ -n "$HOSPITAL_API_KEY" ]; then
  echo -e "${YELLOW}Test 4: Hospital Patient Registration${NC}"
  HOSPITAL_PATIENT_RESPONSE=$(curl -s -X POST "$BASE_URL/api/hospital/$HOSPITAL_ID/patients" \
    -H "Content-Type: application/json" \
    -H "X-Hospital-ID: $HOSPITAL_ID" \
    -H "X-API-Key: $HOSPITAL_API_KEY" \
    -d '{
      "name": "Hospital Patient",
      "dateOfBirth": "1995-05-20",
      "hospitalPatientId": "PAT-001"
    }')
  
  echo "Response: $HOSPITAL_PATIENT_RESPONSE"
  echo ""
  
  if echo "$HOSPITAL_PATIENT_RESPONSE" | grep -q "hederaAccountId"; then
    HOSP_PATIENT_ACCOUNT=$(echo "$HOSPITAL_PATIENT_RESPONSE" | grep -o '"hederaAccountId":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✅ Hospital Patient Registration: SUCCESS${NC}"
    echo "   Hedera Account ID: $HOSP_PATIENT_ACCOUNT"
    echo "   HashScan: https://hashscan.io/testnet/account/$HOSP_PATIENT_ACCOUNT"
  else
    echo -e "${RED}❌ Hospital Patient Registration: FAILED (No hederaAccountId in response)${NC}"
  fi
  echo ""
fi

echo "================================"
echo -e "${GREEN}✅ Testing Complete!${NC}"
echo ""
echo "Summary:"
if [ -n "$PATIENT_ACCOUNT" ]; then
  echo -e "  ${GREEN}✅${NC} Patient Account: $PATIENT_ACCOUNT"
fi
if [ -n "$HOSPITAL_ACCOUNT" ]; then
  echo -e "  ${GREEN}✅${NC} Hospital Account: $HOSPITAL_ACCOUNT"
fi
echo ""
echo "Next Steps:"
echo "  1. Check frontend dashboards for Account ID display"
echo "  2. Verify HashScan links work"
echo "  3. Test bulk registration if needed"

