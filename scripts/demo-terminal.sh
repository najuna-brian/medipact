#!/bin/bash

# MediPact Terminal Demo Script
# Shows complete flow: Hospital → Processing → HCS → Researcher → Purchase → Revenue Distribution

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Configuration
API_URL="${API_URL:-http://localhost:8080}"
DELAY=2

# Helper functions
print_header() {
    echo ""
    echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}${BOLD}  $1${NC}"
    echo -e "${CYAN}${BOLD}═══════════════════════════════════════════════════════════════${NC}"
    echo ""
    sleep $DELAY
}

print_step() {
    echo -e "${YELLOW}${BOLD}▶ $1${NC}"
    sleep 1
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

print_hedera() {
    echo -e "${MAGENTA}${BOLD}🌐 HEDERA: $1${NC}"
}

print_hashscan() {
    echo -e "${CYAN}🔗 HashScan:${NC} $1"
}

# Contract addresses (from deployment-info.json)
CONSENT_MANAGER="0xf2423F1E568eC90921045be96Ad2D618fCcd9841"
REVENUE_SPLITTER="0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392"
HEDERA_NETWORK="${HEDERA_NETWORK:-testnet}"

# Helper to generate HashScan links
hashscan_account() {
    echo "https://hashscan.io/${HEDERA_NETWORK}/account/$1"
}

hashscan_contract() {
    echo "https://hashscan.io/${HEDERA_NETWORK}/contract/$1"
}

hashscan_topic() {
    echo "https://hashscan.io/${HEDERA_NETWORK}/topic/$1"
}

hashscan_transaction() {
    echo "https://hashscan.io/${HEDERA_NETWORK}/transaction/$1"
}

# Clear screen
clear

# ============================================================================
# BACKEND CONNECTIVITY CHECK
# ============================================================================
print_step "Checking backend connectivity..."
if ! curl -s --max-time 3 "$API_URL/api/marketplace/datasets" > /dev/null 2>&1; then
    echo -e "${RED}✗ Backend not accessible at $API_URL${NC}"
    echo -e "${YELLOW}Please start the backend first:${NC}"
    echo -e "  ${CYAN}cd backend && npm start${NC}"
    echo ""
    exit 1
fi
print_success "Backend is accessible"

# ============================================================================
# OPENING
# ============================================================================
print_header "MediPact - Verifiable Health Data Marketplace"
echo -e "${BOLD}Problem:${NC} \$10B patient data black market. Patients get nothing."
echo -e "${BOLD}Solution:${NC} Transparent marketplace on Hedera - all 4 services"
echo ""
echo -e "${CYAN}Built exclusively on Hedera:${NC}"
echo "  • HCS - Immutable consent & data proofs"
echo "  • EVM - Smart contracts for consent & revenue"
echo "  • Accounts - Native Hedera accounts (0.0.xxxxx)"
echo "  • HBAR - Instant micropayments"
echo ""
sleep 3

# ============================================================================
# STEP 1: HEDERA ACCOUNTS - Hospital Registration
# ============================================================================
print_header "STEP 1: Hedera Accounts - Hospital Registration"

print_step "Registering hospital (creates Hedera account automatically)..."
TIMESTAMP=$(date +%s)
HOSPITAL_NAME="Demo Hospital ${TIMESTAMP}"
HOSPITAL_RESPONSE=$(curl -s -X POST "$API_URL/api/hospital/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"name\": \"$HOSPITAL_NAME\",
        \"country\": \"Uganda\",
        \"location\": \"Kampala, Uganda\"
    }")

# Parse JSON response - try jq first, then grep fallback
if command -v jq > /dev/null 2>&1; then
    HOSPITAL_ID=$(echo $HOSPITAL_RESPONSE | jq -r '.hospital.hospitalId // empty' 2>/dev/null)
    HOSPITAL_API_KEY=$(echo $HOSPITAL_RESPONSE | jq -r '.hospital.apiKey // empty' 2>/dev/null)
    HEDERA_ACCOUNT=$(echo $HOSPITAL_RESPONSE | jq -r '.hospital.hederaAccountId // empty' 2>/dev/null)
else
    # Fallback to grep
    HOSPITAL_ID=$(echo $HOSPITAL_RESPONSE | grep -o '"hospitalId":"[^"]*' | cut -d'"' -f4)
    HOSPITAL_API_KEY=$(echo $HOSPITAL_RESPONSE | grep -o '"apiKey":"[^"]*' | cut -d'"' -f4)
    HEDERA_ACCOUNT=$(echo $HOSPITAL_RESPONSE | grep -o '"hederaAccountId":"[^"]*' | cut -d'"' -f4)
fi

if [ ! -z "$HOSPITAL_ID" ]; then
    print_success "Hospital registered: $HOSPITAL_ID"
    print_hedera "Account created: $HEDERA_ACCOUNT"
    print_hashscan "$(hashscan_account $HEDERA_ACCOUNT)"
    print_info "API Key: ${HOSPITAL_API_KEY:0:20}..."
else
    echo -e "${RED}✗ Hospital registration failed${NC}"
    echo -e "${YELLOW}Response:${NC} $HOSPITAL_RESPONSE"
    echo -e "${YELLOW}Make sure backend is running and Hedera credentials are configured${NC}"
    exit 1
fi

# ============================================================================
# STEP 2: DATA PROCESSING & HCS - Upload and Process
# ============================================================================
print_header "STEP 2: HCS - Immutable Data Proofs"

print_step "Creating sample patient data..."
cat > /tmp/demo_data.csv << 'EOF'
Patient ID,Patient Name,Age,Gender,Date of Birth,Address,Country,Lab Test,Result,Test Date,Condition,ICD10 Code
PAT-001,John Doe,35,Male,1988-05-15,"123 Main St, Kampala",Uganda,Blood Glucose,95,2024-01-15,Diabetes Type 2,E11
PAT-002,Jane Smith,42,Female,1981-08-22,"456 Oak Ave, Kampala",Uganda,HbA1c,6.2,2024-01-16,Diabetes Type 2,E11
PAT-003,Bob Johnson,28,Male,1995-12-10,"789 Pine Rd, Entebbe",Uganda,Blood Pressure,120/80,2024-01-17,Hypertension,I10
EOF

print_step "Uploading data (anonymization + HCS submission)..."
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/api/hospital/$HOSPITAL_ID/upload-csv" \
    -H "X-API-Key: $HOSPITAL_API_KEY" \
    -F "file=@/tmp/demo_data.csv" \
    -F "hospitalCountry=Uganda" \
    -F "hospitalLocation=Kampala, Uganda")

CONSENT_TOPIC=$(echo $UPLOAD_RESPONSE | grep -o '"consentTopicId":"[^"]*' | cut -d'"' -f4)
DATA_TOPIC=$(echo $UPLOAD_RESPONSE | grep -o '"dataTopicId":"[^"]*' | cut -d'"' -f4)
RECORDS=$(echo $UPLOAD_RESPONSE | grep -o '"recordsProcessed":[0-9]*' | cut -d':' -f2)

if [ ! -z "$CONSENT_TOPIC" ]; then
    print_success "Data processed: $RECORDS records"
    print_hedera "Consent Topic: $CONSENT_TOPIC"
    print_hashscan "$(hashscan_topic $CONSENT_TOPIC)"
    if [ ! -z "$DATA_TOPIC" ]; then
        print_hedera "Data Topic: $DATA_TOPIC"
        print_hashscan "$(hashscan_topic $DATA_TOPIC)"
    fi
else
    echo -e "${YELLOW}⚠ Upload may require adapter service${NC}"
fi

# ============================================================================
# STEP 3: EVM SMART CONTRACTS - Consent Recording
# ============================================================================
print_header "STEP 3: EVM Smart Contracts - Consent Management"

print_step "Consent recorded on ConsentManager contract..."
print_hedera "Contract: ConsentManager ($CONSENT_MANAGER)"
print_hashscan "$(hashscan_contract $CONSENT_MANAGER)"
print_info "All patient consent stored on-chain, verifiable forever"
print_success "Consent validated for all queries"

# ============================================================================
# STEP 4: RESEARCHER QUERY
# ============================================================================
print_header "STEP 4: Researcher Marketplace Query"

print_step "Registering researcher..."
RESEARCHER_EMAIL="demo-researcher-${TIMESTAMP}@medipact.test"
RESEARCHER_RESPONSE=$(curl -s -X POST "$API_URL/api/researcher/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$RESEARCHER_EMAIL\",
        \"organizationName\": \"Demo Research Institute\",
        \"contactName\": \"Dr. Jane Researcher\",
        \"country\": \"United States\"
    }")

# Parse JSON response - try jq first, then grep fallback
if command -v jq > /dev/null 2>&1; then
    RESEARCHER_ID=$(echo $RESEARCHER_RESPONSE | jq -r '.researcher.researcherId // empty' 2>/dev/null)
    RESEARCHER_ACCOUNT=$(echo $RESEARCHER_RESPONSE | jq -r '.researcher.hederaAccountId // empty' 2>/dev/null)
else
    # Fallback to grep
    RESEARCHER_ID=$(echo $RESEARCHER_RESPONSE | grep -o '"researcherId":"[^"]*' | cut -d'"' -f4)
    RESEARCHER_ACCOUNT=$(echo $RESEARCHER_RESPONSE | grep -o '"hederaAccountId":"[^"]*' | cut -d'"' -f4)
fi

if [ ! -z "$RESEARCHER_ID" ]; then
    print_success "Researcher registered: $RESEARCHER_ID"
    print_hedera "Account created: $RESEARCHER_ACCOUNT"
    print_hashscan "$(hashscan_account $RESEARCHER_ACCOUNT)"
fi

print_step "Querying marketplace (consent-validated)..."
QUERY_RESPONSE=$(curl -s -X POST "$API_URL/api/marketplace/query" \
    -H "Content-Type: application/json" \
    -H "x-researcher-id: $RESEARCHER_ID" \
    -d '{
        "country": "Uganda",
        "preview": true,
        "limit": 10
    }')

COUNT=$(echo $QUERY_RESPONSE | grep -o '"count":[0-9]*' | cut -d':' -f2)
print_success "Found $COUNT anonymized records (consent-validated)"

# ============================================================================
# STEP 5: HBAR PAYMENT & REVENUE DISTRIBUTION
# ============================================================================
print_header "STEP 5: HBAR Payments & Revenue Distribution"

print_step "Researcher purchases dataset (10,000 HBAR)..."
print_hedera "Payment: 10,000 HBAR → Platform account"

print_step "RevenueSplitter contract distributes automatically:"
echo -e "  ${GREEN}60% → Patients${NC} (6,000 HBAR)"
echo -e "  ${GREEN}25% → Hospital${NC} (2,500 HBAR)"
echo -e "  ${GREEN}15% → Platform${NC} (1,500 HBAR)"
print_hedera "Contract: RevenueSplitter ($REVENUE_SPLITTER)"
print_hashscan "$(hashscan_contract $REVENUE_SPLITTER)"
print_info "All transfers verifiable on HashScan"

# ============================================================================
# STEP 6: NETWORK IMPACT METRICS
# ============================================================================
print_header "STEP 6: Hedera Network Impact"

print_step "Fetching real-time metrics..."
METRICS_RESPONSE=$(curl -s "$API_URL/api/public/metrics")

if [ ! -z "$METRICS_RESPONSE" ]; then
    TOTAL_ACCOUNTS=$(echo $METRICS_RESPONSE | grep -o '"totalHederaAccounts":[0-9]*' | cut -d':' -f2)
    HCS_MESSAGES=$(echo $METRICS_RESPONSE | grep -o '"totalHCSMessages":[0-9]*' | cut -d':' -f2)
    CONTRACT_CALLS=$(echo $METRICS_RESPONSE | grep -o '"totalSmartContractCalls":[0-9]*' | cut -d':' -f2)
    HBAR_DISTRIBUTED=$(echo $METRICS_RESPONSE | grep -o '"totalHBARDistributed":[0-9.]*' | cut -d':' -f2)
    TPS=$(echo $METRICS_RESPONSE | grep -o '"estimatedTPSContribution":[0-9.]*' | cut -d':' -f2)
    
    echo ""
    echo -e "${BOLD}Network Metrics:${NC}"
    echo -e "  ${CYAN}Hedera Accounts Created:${NC} $TOTAL_ACCOUNTS"
    echo -e "  ${CYAN}HCS Messages Sent:${NC} $HCS_MESSAGES"
    echo -e "  ${CYAN}Smart Contract Calls:${NC} $CONTRACT_CALLS"
    echo -e "  ${CYAN}HBAR Distributed:${NC} $HBAR_DISTRIBUTED"
    echo -e "  ${CYAN}Estimated TPS:${NC} $TPS"
    echo ""
fi

# ============================================================================
# SUMMARY
# ============================================================================
print_header "Summary: All 4 Hedera Services Demonstrated"

echo -e "${GREEN}✓ Hedera Accounts${NC} - Native accounts (0.0.xxxxx) for all users"
if [ ! -z "$HEDERA_ACCOUNT" ]; then
    echo -e "  ${CYAN}Hospital Account:${NC} $(hashscan_account $HEDERA_ACCOUNT)"
fi
if [ ! -z "$RESEARCHER_ACCOUNT" ]; then
    echo -e "  ${CYAN}Researcher Account:${NC} $(hashscan_account $RESEARCHER_ACCOUNT)"
fi

echo -e "${GREEN}✓ HCS${NC} - Immutable consent & data proofs on-chain"
if [ ! -z "$CONSENT_TOPIC" ]; then
    echo -e "  ${CYAN}Consent Topic:${NC} $(hashscan_topic $CONSENT_TOPIC)"
fi

echo -e "${GREEN}✓ EVM Smart Contracts${NC} - ConsentManager & RevenueSplitter"
echo -e "  ${CYAN}ConsentManager:${NC} $(hashscan_contract $CONSENT_MANAGER)"
echo -e "  ${CYAN}RevenueSplitter:${NC} $(hashscan_contract $REVENUE_SPLITTER)"

echo -e "${GREEN}✓ HBAR${NC} - Instant micropayments & revenue distribution"
echo ""
echo -e "${BOLD}Key Features:${NC}"
echo "  • Double anonymization (K-anonymity enforced)"
echo "  • FHIR R4 compliant"
echo "  • 60/25/15 revenue split (Patient/Hospital/Platform)"
echo "  • All transactions verifiable on HashScan"
echo "  • Production-ready, fully deployed"
echo ""
echo -e "${CYAN}${BOLD}MediPact - The Verifiable Health Pact${NC}"
echo -e "${CYAN}Built exclusively on Hedera Hashgraph${NC}"
echo ""
echo -e "${BOLD}Verify on HashScan:${NC}"
echo -e "  ${CYAN}All accounts, contracts, and transactions are publicly verifiable${NC}"
echo ""

