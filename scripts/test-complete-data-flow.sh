#!/bin/bash

# Complete End-to-End Data Flow Test
# Tests: Hospital Upload → Processing → Storage → Researcher Query → CSV/API Export

set -e

echo "=========================================="
echo "MediPact Complete Data Flow Test"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"
FRONTEND_URL="${FRONTEND_URL:-http://localhost:3000}"
TEST_DIR="/tmp/medipact-test-$$"
mkdir -p "$TEST_DIR"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Cleanup function
cleanup() {
    echo ""
    echo "Cleaning up test files..."
    rm -rf "$TEST_DIR"
}
trap cleanup EXIT

# Helper functions
print_test() {
    local test_name=$1
    local status=$2
    if [ "$status" = "PASS" ]; then
        echo -e "${GREEN}✓${NC} $test_name"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗${NC} $test_name"
        ((TESTS_FAILED++))
    fi
}

print_section() {
    echo ""
    echo -e "${BLUE}=== $1 ===${NC}"
    echo ""
}

# Check if backend is running
print_section "1. Checking Backend Status"
if curl -s -f "$BACKEND_URL/api/marketplace/datasets" > /dev/null 2>&1; then
    print_test "Backend is running" "PASS"
else
    print_test "Backend is running" "FAIL"
    echo -e "${RED}Error: Backend is not accessible at $BACKEND_URL${NC}"
    echo "Please start the backend: cd backend && npm start"
    exit 1
fi

# Create test CSV file
print_section "2. Creating Test Data"
TEST_CSV="$TEST_DIR/test_patients.csv"
cat > "$TEST_CSV" << 'EOF'
Patient ID,Patient Name,Age,Gender,Date of Birth,Address,Country,Lab Test,Result,Test Date,Condition,ICD10 Code
PAT-001,John Doe,35,Male,1988-05-15,"123 Main St, Kampala",Uganda,Blood Glucose,95,2024-01-15,Diabetes Type 2,E11
PAT-002,Jane Smith,42,Female,1981-08-22,"456 Oak Ave, Kampala",Uganda,HbA1c,6.2,2024-01-16,Diabetes Type 2,E11
PAT-003,Bob Johnson,28,Male,1995-12-10,"789 Pine Rd, Entebbe",Uganda,Blood Pressure,120/80,2024-01-17,Hypertension,I10
PAT-004,Alice Brown,55,Female,1968-03-25,"321 Elm St, Jinja",Uganda,Cholesterol,220,2024-01-18,Hyperlipidemia,E78
PAT-005,Charlie Wilson,38,Male,1985-07-08,"654 Maple Dr, Kampala",Uganda,Blood Glucose,110,2024-01-19,Diabetes Type 2,E11
EOF

if [ -f "$TEST_CSV" ]; then
    print_test "Test CSV file created" "PASS"
    echo "  File: $TEST_CSV"
    echo "  Records: 5"
else
    print_test "Test CSV file created" "FAIL"
    exit 1
fi

# Create test hospital (if needed)
print_section "3. Setting Up Test Hospital"
HOSPITAL_EMAIL="test-hospital-$(date +%s)@medipact.test"
HOSPITAL_NAME="Test Hospital"
HOSPITAL_COUNTRY="Uganda"

# Try to create hospital via API (if endpoint exists)
HOSPITAL_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/hospital/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$HOSPITAL_EMAIL\",
        \"hospitalName\": \"$HOSPITAL_NAME\",
        \"country\": \"$HOSPITAL_COUNTRY\"
    }" 2>/dev/null || echo '{"error":"endpoint_not_available"}')

if echo "$HOSPITAL_RESPONSE" | grep -q "hospitalId\|apiKey"; then
    HOSPITAL_ID=$(echo "$HOSPITAL_RESPONSE" | grep -o '"hospitalId":"[^"]*"' | cut -d'"' -f4 || echo "")
    HOSPITAL_API_KEY=$(echo "$HOSPITAL_RESPONSE" | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4 || echo "")
    print_test "Test hospital created" "PASS"
    echo "  Hospital ID: $HOSPITAL_ID"
else
    echo -e "${YELLOW}Note: Hospital registration endpoint may require manual setup${NC}"
    echo "  Please create a test hospital manually and set:"
    echo "  export HOSPITAL_ID=your_hospital_id"
    echo "  export HOSPITAL_API_KEY=your_api_key"
    if [ -z "$HOSPITAL_ID" ] || [ -z "$HOSPITAL_API_KEY" ]; then
        print_test "Test hospital credentials available" "FAIL"
        echo -e "${YELLOW}Skipping upload test - set HOSPITAL_ID and HOSPITAL_API_KEY to continue${NC}"
        exit 0
    else
        print_test "Test hospital credentials available" "PASS"
    fi
fi

# Upload CSV file
print_section "4. Uploading CSV File"
if [ -n "$HOSPITAL_ID" ] && [ -n "$HOSPITAL_API_KEY" ]; then
    UPLOAD_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/hospital/upload-csv" \
        -H "X-API-Key: $HOSPITAL_API_KEY" \
        -F "file=@$TEST_CSV" \
        -F "hospitalCountry=$HOSPITAL_COUNTRY" \
        -F "hospitalLocation=Kampala, Uganda" 2>/dev/null || echo '{"error":"upload_failed"}')
    
    if echo "$UPLOAD_RESPONSE" | grep -q "recordsProcessed\|consentTopicId"; then
        RECORDS_PROCESSED=$(echo "$UPLOAD_RESPONSE" | grep -o '"recordsProcessed":[0-9]*' | cut -d':' -f2 || echo "0")
        CONSENT_TOPIC=$(echo "$UPLOAD_RESPONSE" | grep -o '"consentTopicId":"[^"]*"' | cut -d'"' -f4 || echo "")
        DATA_TOPIC=$(echo "$UPLOAD_RESPONSE" | grep -o '"dataTopicId":"[^"]*"' | cut -d'"' -f4 || echo "")
        
        if [ "$RECORDS_PROCESSED" -gt 0 ]; then
            print_test "CSV file uploaded and processed" "PASS"
            echo "  Records processed: $RECORDS_PROCESSED"
            echo "  Consent Topic: $CONSENT_TOPIC"
            echo "  Data Topic: $DATA_TOPIC"
            
            # Wait a bit for processing to complete
            echo "  Waiting 3 seconds for data to be stored..."
            sleep 3
        else
            print_test "CSV file uploaded and processed" "FAIL"
            echo "  Response: $UPLOAD_RESPONSE"
        fi
    else
        print_test "CSV file uploaded and processed" "FAIL"
        echo "  Response: $UPLOAD_RESPONSE"
        echo -e "${YELLOW}Note: This may require manual upload via frontend${NC}"
    fi
else
    print_test "CSV file uploaded and processed" "SKIP"
    echo -e "${YELLOW}Skipped - hospital credentials not available${NC}"
fi

# Create test researcher
print_section "5. Setting Up Test Researcher"
RESEARCHER_EMAIL="test-researcher-$(date +%s)@medipact.test"
RESEARCHER_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/researcher/register" \
    -H "Content-Type: application/json" \
    -d "{
        \"email\": \"$RESEARCHER_EMAIL\",
        \"organizationName\": \"Test Research Org\",
        \"contactName\": \"Test Researcher\",
        \"country\": \"United States\"
    }" 2>/dev/null || echo '{"error":"endpoint_not_available"}')

if echo "$RESEARCHER_RESPONSE" | grep -q "researcherId"; then
    RESEARCHER_ID=$(echo "$RESEARCHER_RESPONSE" | grep -o '"researcherId":"[^"]*"' | cut -d'"' -f4 || echo "")
    print_test "Test researcher created" "PASS"
    echo "  Researcher ID: $RESEARCHER_ID"
else
    echo -e "${YELLOW}Note: Researcher registration may require manual setup${NC}"
    if [ -z "$RESEARCHER_ID" ]; then
        echo "  Please create a test researcher and set:"
        echo "  export RESEARCHER_ID=your_researcher_id"
        print_test "Test researcher credentials available" "FAIL"
        exit 0
    else
        print_test "Test researcher credentials available" "PASS"
    fi
fi

# Verify researcher (if admin endpoint available)
print_section "6. Verifying Researcher"
if [ -n "$RESEARCHER_ID" ]; then
    # Try to verify researcher (requires admin token)
    VERIFY_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/researcher/admin/researchers/$RESEARCHER_ID/verify" \
        -H "Authorization: Bearer $ADMIN_TOKEN" 2>/dev/null || echo '{"error":"verification_failed"}')
    
    if echo "$VERIFY_RESPONSE" | grep -q "verified\|message"; then
        print_test "Researcher verified" "PASS"
    else
        print_test "Researcher verified" "SKIP"
        echo -e "${YELLOW}Note: Manual verification may be required${NC}"
    fi
fi

# Test query endpoint
print_section "7. Testing Researcher Query (API)"
if [ -n "$RESEARCHER_ID" ]; then
    QUERY_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/marketplace/query" \
        -H "Content-Type: application/json" \
        -H "x-researcher-id: $RESEARCHER_ID" \
        -d "{
            \"researcherId\": \"$RESEARCHER_ID\",
            \"country\": \"Uganda\",
            \"preview\": true,
            \"limit\": 10
        }" 2>/dev/null || echo '{"error":"query_failed"}')
    
    if echo "$QUERY_RESPONSE" | grep -q "count\|results"; then
        QUERY_COUNT=$(echo "$QUERY_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2 || echo "0")
        print_test "Researcher query executed" "PASS"
        echo "  Records found: $QUERY_COUNT"
    else
        print_test "Researcher query executed" "FAIL"
        echo "  Response: $QUERY_RESPONSE"
    fi
else
    print_test "Researcher query executed" "SKIP"
fi

# Test API key creation and data access
print_section "8. Testing Researcher API Key Access"
if [ -n "$RESEARCHER_ID" ]; then
    # Create API key (if endpoint exists)
    API_KEY_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/researcher/$RESEARCHER_ID/api-keys" \
        -H "Content-Type: application/json" \
        -d "{\"name\": \"Test API Key\"}" 2>/dev/null || echo '{"error":"api_key_creation_failed"}')
    
    if echo "$API_KEY_RESPONSE" | grep -q "apiKey\|key"; then
        API_KEY=$(echo "$API_KEY_RESPONSE" | grep -o '"apiKey":"[^"]*"' | cut -d'"' -f4 || \
                 echo "$API_KEY_RESPONSE" | grep -o '"key":"[^"]*"' | cut -d'"' -f4 || echo "")
        
        if [ -n "$API_KEY" ]; then
            print_test "API key created" "PASS"
            echo "  API Key: ${API_KEY:0:20}..."
            
            # Test API access
            API_QUERY_RESPONSE=$(curl -s -X GET "$BACKEND_URL/api/researcher/patients?country=Uganda&limit=5" \
                -H "X-API-Key: $API_KEY" 2>/dev/null || echo '{"error":"api_access_failed"}')
            
            if echo "$API_QUERY_RESPONSE" | grep -q "success\|data\|count"; then
                API_COUNT=$(echo "$API_QUERY_RESPONSE" | grep -o '"count":[0-9]*' | cut -d':' -f2 || echo "0")
                print_test "API key data access" "PASS"
                echo "  Records retrieved via API: $API_COUNT"
            else
                print_test "API key data access" "FAIL"
                echo "  Response: $API_QUERY_RESPONSE"
            fi
        else
            print_test "API key created" "SKIP"
        fi
    else
        print_test "API key created" "SKIP"
        echo -e "${YELLOW}Note: API key endpoint may require authentication${NC}"
    fi
else
    print_test "API key created" "SKIP"
fi

# Test CSV export
print_section "9. Testing CSV Export"
if [ -n "$RESEARCHER_ID" ]; then
    # First, get available datasets
    DATASETS_RESPONSE=$(curl -s "$BACKEND_URL/api/marketplace/datasets?country=Uganda" 2>/dev/null || echo '{"datasets":[]}')
    DATASET_ID=$(echo "$DATASETS_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4 || echo "")
    
    if [ -n "$DATASET_ID" ]; then
        # Try to export dataset
        EXPORT_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/marketplace/datasets/$DATASET_ID/export" \
            -H "Content-Type: application/json" \
            -d "{
                \"researcherId\": \"$RESEARCHER_ID\",
                \"format\": \"csv\"
            }" 2>/dev/null || echo '{"error":"export_failed"}')
        
        if echo "$EXPORT_RESPONSE" | grep -q "csv\|data\|attachment"; then
            print_test "CSV export successful" "PASS"
            echo "  Dataset ID: $DATASET_ID"
        else
            print_test "CSV export successful" "SKIP"
            echo -e "${YELLOW}Note: Export may require dataset purchase${NC}"
        fi
    else
        print_test "CSV export successful" "SKIP"
        echo -e "${YELLOW}Note: No datasets available for export${NC}"
    fi
else
    print_test "CSV export successful" "SKIP"
fi

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    echo ""
    echo "Data flow verified:"
    echo "  ✓ Backend connectivity"
    echo "  ✓ Test data creation"
    echo "  ✓ Hospital upload"
    echo "  ✓ Data processing"
    echo "  ✓ Researcher query"
    echo "  ✓ API access"
    echo "  ✓ CSV export"
    exit 0
else
    echo -e "${YELLOW}Some tests were skipped or failed${NC}"
    echo "This may be due to:"
    echo "  - Missing authentication credentials"
    echo "  - Endpoints requiring manual setup"
    echo "  - Data not yet processed"
    echo ""
    echo "To run a complete test:"
    echo "  1. Ensure backend is running: cd backend && npm start"
    echo "  2. Create hospital and researcher accounts"
    echo "  3. Set environment variables:"
    echo "     export HOSPITAL_ID=..."
    echo "     export HOSPITAL_API_KEY=..."
    echo "     export RESEARCHER_ID=..."
    echo "  4. Run this script again"
    exit 1
fi

