#!/bin/bash

# End-to-End Data Flow Test Script
# Tests the complete flow from hospital upload to researcher viewing

set -e

echo "=========================================="
echo "MediPact Data Flow Test"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BACKEND_URL="${BACKEND_URL:-http://localhost:8080}"
API_URL="${API_URL:-http://localhost:8080}"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
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

# Function to check API endpoint
check_endpoint() {
    local url=$1
    local expected_status=${2:-200}
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url" || echo "000")
    if [ "$response" = "$expected_status" ]; then
        return 0
    else
        return 1
    fi
}

# Function to check JSON response
check_json() {
    local url=$1
    local response=$(curl -s "$url" || echo "{}")
    if echo "$response" | jq empty 2>/dev/null; then
        return 0
    else
        return 1
    fi
}

echo "1. Testing Backend Connectivity"
echo "--------------------------------"
if check_endpoint "$BACKEND_URL/api-docs" 200 2>/dev/null || check_endpoint "$BACKEND_URL/api/marketplace/datasets" 200 2>/dev/null; then
    print_test "Backend is accessible" "PASS"
else
    print_test "Backend is accessible" "FAIL"
    echo -e "${RED}Error: Backend is not running or not accessible at $BACKEND_URL${NC}"
    echo "Please start the backend: cd backend && npm start"
    exit 1
fi

echo ""
echo "2. Testing Database Tables"
echo "--------------------------------"
# Check if we can query FHIR tables (this requires authentication, so we'll check differently)
# For now, we'll check if the migration endpoint exists
if check_endpoint "$BACKEND_URL/api/admin/migrate/fhir" 405 2>/dev/null; then
    # 405 Method Not Allowed means endpoint exists but POST is required
    print_test "FHIR migration endpoint exists" "PASS"
else
    print_test "FHIR migration endpoint exists" "FAIL"
    echo -e "${YELLOW}Warning: FHIR migration endpoint may not be available${NC}"
fi

echo ""
echo "3. Testing Adapter Endpoints"
echo "--------------------------------"
# Check adapter storage endpoints exist (should return 401 without auth, which is expected)
if check_endpoint "$BACKEND_URL/api/adapter/store-fhir-patients" 401 2>/dev/null; then
    print_test "Adapter storage endpoints exist" "PASS"
else
    print_test "Adapter storage endpoints exist" "FAIL"
fi

echo ""
echo "4. Testing Marketplace Endpoints"
echo "--------------------------------"
if check_endpoint "$BACKEND_URL/api/marketplace/datasets" 200 2>/dev/null; then
    print_test "Marketplace datasets endpoint accessible" "PASS"
else
    print_test "Marketplace datasets endpoint accessible" "FAIL"
fi

if check_endpoint "$BACKEND_URL/api/marketplace/filter-options" 200 2>/dev/null; then
    print_test "Marketplace filter options endpoint accessible" "PASS"
else
    print_test "Marketplace filter options endpoint accessible" "FAIL"
fi

echo ""
echo "5. Testing Query Service"
echo "--------------------------------"
# Test query endpoint (should return 400 without proper params, which is expected)
if check_endpoint "$BACKEND_URL/api/marketplace/query" 400 2>/dev/null; then
    print_test "Query endpoint exists" "PASS"
else
    print_test "Query endpoint exists" "FAIL"
fi

echo ""
echo "6. Checking Adapter Directory"
echo "--------------------------------"
if [ -d "backend/adapter" ]; then
    print_test "Adapter directory exists" "PASS"
    if [ -f "backend/adapter/src/index.js" ]; then
        print_test "Adapter main script exists" "PASS"
    else
        print_test "Adapter main script exists" "FAIL"
    fi
    if [ -d "backend/adapter/data" ]; then
        print_test "Adapter data directory exists" "PASS"
    else
        print_test "Adapter data directory exists" "FAIL"
        echo -e "${YELLOW}Creating adapter data directory...${NC}"
        mkdir -p backend/adapter/data
    fi
else
    print_test "Adapter directory exists" "FAIL"
fi

echo ""
echo "7. Checking Database Connection"
echo "--------------------------------"
# Try to check if database file exists (for SQLite) or connection works
if [ -f "backend/data/medipact.db" ]; then
    print_test "SQLite database file exists" "PASS"
elif [ -n "$DATABASE_URL" ] || [ -n "$POSTGRES_URL" ]; then
    print_test "PostgreSQL database configured" "PASS"
else
    print_test "Database file/configuration found" "FAIL"
    echo -e "${YELLOW}Warning: No database file or configuration found${NC}"
fi

echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}All basic tests passed!${NC}"
    echo ""
    echo "Next steps for full end-to-end testing:"
    echo "1. Ensure FHIR tables are created: POST $BACKEND_URL/api/admin/migrate/fhir"
    echo "2. Create a test hospital account"
    echo "3. Upload a test CSV file"
    echo "4. Verify data is stored in database"
    echo "5. Create a test researcher account"
    echo "6. Query the data as researcher"
    exit 0
else
    echo -e "${RED}Some tests failed. Please fix the issues above.${NC}"
    exit 1
fi

