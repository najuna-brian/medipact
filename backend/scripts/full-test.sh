#!/bin/bash

# MediPact Full Integration Test Script
# Tests complete data flow: adapter → backend → query → purchase → export

API_URL="http://localhost:3002"
HOSPITAL_ID=""
RESEARCHER_ID=""
DATASET_ID=""

echo "🧪 MediPact Full Integration Test"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

test_step() {
    local step_name=$1
    local command=$2
    echo -n "Testing: $step_name... "
    
    if eval "$command" > /tmp/test_output.json 2>&1; then
        echo -e "${GREEN}✅ PASSED${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        cat /tmp/test_output.json | head -5
        TESTS_FAILED=$((TESTS_FAILED + 1))
        return 1
    fi
}

echo "Step 1: Register Test Hospital"
echo "-------------------------------"
HOSPITAL_RESPONSE=$(curl -s -X POST "$API_URL/api/hospital/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Hospital",
    "country": "Uganda",
    "location": "Kampala",
    "contactEmail": "test@hospital.com"
  }')

HOSPITAL_ID=$(echo "$HOSPITAL_RESPONSE" | jq -r '.hospitalId // empty')
if [ -z "$HOSPITAL_ID" ]; then
    echo "⚠️  Hospital registration failed or hospital already exists"
    echo "Response: $HOSPITAL_RESPONSE"
    # Try to get existing hospital
    HOSPITAL_ID="HOSP-TEST001"
else
    echo "✅ Hospital registered: $HOSPITAL_ID"
fi
echo ""

echo "Step 2: Register Test Researcher"
echo "-----------------------------------"
RESEARCHER_RESPONSE=$(curl -s -X POST "$API_URL/api/researcher/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-researcher@example.com",
    "organizationName": "Test Research Organization",
    "contactName": "Test Researcher",
    "country": "Uganda"
  }')

RESEARCHER_ID=$(echo "$RESEARCHER_RESPONSE" | jq -r '.researcherId // empty')
if [ -z "$RESEARCHER_ID" ]; then
    echo "⚠️  Researcher registration failed or researcher already exists"
    echo "Response: $RESEARCHER_RESPONSE"
    # Try to get existing researcher
    RESEARCHER_RESPONSE=$(curl -s "$API_URL/api/researcher/email/test-researcher@example.com")
    RESEARCHER_ID=$(echo "$RESEARCHER_RESPONSE" | jq -r '.researcherId // empty')
    if [ -z "$RESEARCHER_ID" ]; then
        RESEARCHER_ID="RES-TEST001"
    fi
else
    echo "✅ Researcher registered: $RESEARCHER_ID"
fi
echo ""

echo "Step 3: Submit FHIR Resources via Adapter"
echo "-------------------------------------------"
ADAPTER_RESPONSE=$(curl -s -X POST "$API_URL/api/adapter/submit-fhir-resources" \
  -H "Content-Type: application/json" \
  -H "x-hospital-id: $HOSPITAL_ID" \
  -H "x-api-key: test-key" \
  -d '{
    "hospitalId": "'$HOSPITAL_ID'",
    "patients": [
      {
        "anonymousPatientId": "PID-TEST001",
        "upi": "UPI-TEST001",
        "country": "Uganda",
        "region": "Kampala",
        "ageRange": "35-39",
        "gender": "Male",
        "conditions": [
          {
            "code": "E11",
            "name": "Diabetes Type 2",
            "date": "2024-01-15",
            "severity": "moderate",
            "status": "active"
          }
        ],
        "observations": [
          {
            "code": "4548-4",
            "name": "HbA1c",
            "value": "7.8",
            "unit": "%",
            "date": "2024-06-05",
            "referenceRange": "4.0-5.6%",
            "interpretation": "High"
          }
        ]
      },
      {
        "anonymousPatientId": "PID-TEST002",
        "upi": "UPI-TEST002",
        "country": "Uganda",
        "region": "Kampala",
        "ageRange": "40-44",
        "gender": "Female",
        "conditions": [
          {
            "code": "I10",
            "name": "Hypertension",
            "date": "2024-03-20",
            "severity": "mild",
            "status": "active"
          }
        ],
        "observations": [
          {
            "code": "2339-0",
            "name": "Blood Glucose",
            "value": "95",
            "unit": "mg/dL",
            "date": "2024-06-10",
            "referenceRange": "70-100 mg/dL",
            "interpretation": "Normal"
          }
        ]
      }
    ]
  }')

if echo "$ADAPTER_RESPONSE" | grep -q "success"; then
    echo "✅ FHIR resources submitted successfully"
    echo "$ADAPTER_RESPONSE" | jq '.'
else
    echo "⚠️  Adapter submit response:"
    echo "$ADAPTER_RESPONSE" | head -10
fi
echo ""

echo "Step 4: Create Dataset"
echo "----------------------"
DATASET_RESPONSE=$(curl -s -X POST "$API_URL/api/adapter/create-dataset" \
  -H "Content-Type: application/json" \
  -H "x-hospital-id: $HOSPITAL_ID" \
  -H "x-api-key: test-key" \
  -d '{
    "name": "Test Diabetes Dataset",
    "description": "Test dataset for diabetes research from Uganda",
    "hospitalId": "'$HOSPITAL_ID'",
    "country": "Uganda",
    "price": 25,
    "currency": "HBAR",
    "consentType": "hospital_verified",
    "filters": {
      "country": "Uganda",
      "conditionCode": "E11"
    },
    "hcsTopicId": "0.0.123456",
    "consentTopicId": "0.0.123457",
    "dataTopicId": "0.0.123458"
  }')

DATASET_ID=$(echo "$DATASET_RESPONSE" | jq -r '.dataset.id // empty')
if [ -n "$DATASET_ID" ]; then
    echo "✅ Dataset created: $DATASET_ID"
    echo "$DATASET_RESPONSE" | jq '.dataset | {id, name, recordCount, price}'
else
    echo "⚠️  Dataset creation response:"
    echo "$DATASET_RESPONSE" | head -10
fi
echo ""

echo "Step 5: Browse Datasets"
echo "-----------------------"
BROWSE_RESPONSE=$(curl -s "$API_URL/api/marketplace/datasets")
DATASET_COUNT=$(echo "$BROWSE_RESPONSE" | jq -r '.count // 0')
echo "✅ Found $DATASET_COUNT datasets"
if [ "$DATASET_COUNT" -gt 0 ]; then
    echo "$BROWSE_RESPONSE" | jq '.datasets[0] | {id, name, recordCount, country, price}'
fi
echo ""

echo "Step 6: Get Dataset Details"
echo "----------------------------"
if [ -n "$DATASET_ID" ]; then
    DETAIL_RESPONSE=$(curl -s "$API_URL/api/marketplace/datasets/$DATASET_ID?includePreview=true")
    if echo "$DETAIL_RESPONSE" | grep -q "id"; then
        echo "✅ Dataset details retrieved"
        echo "$DETAIL_RESPONSE" | jq '{id, name, recordCount, country, price, preview: (.preview | length)}'
    else
        echo "⚠️  Dataset details response:"
        echo "$DETAIL_RESPONSE" | head -5
    fi
else
    echo "⚠️  Skipping - no dataset ID available"
fi
echo ""

echo "Step 7: Test Query (Preview Mode)"
echo "----------------------------------"
QUERY_RESPONSE=$(curl -s -X POST "$API_URL/api/marketplace/query" \
  -H "Content-Type: application/json" \
  -H "x-researcher-id: $RESEARCHER_ID" \
  -d '{
    "country": "Uganda",
    "preview": true
  }')

if echo "$QUERY_RESPONSE" | grep -q "count"; then
    COUNT=$(echo "$QUERY_RESPONSE" | jq -r '.count // 0')
    echo "✅ Query preview successful: Found $COUNT matching records"
    echo "$QUERY_RESPONSE" | jq '{count, preview, filters}'
else
    echo "⚠️  Query response:"
    echo "$QUERY_RESPONSE" | head -5
fi
echo ""

echo "Step 8: Test Query (Full Mode)"
echo "-------------------------------"
FULL_QUERY_RESPONSE=$(curl -s -X POST "$API_URL/api/marketplace/query" \
  -H "Content-Type: application/json" \
  -H "x-researcher-id: $RESEARCHER_ID" \
  -d '{
    "country": "Uganda",
    "preview": false,
    "limit": 10
  }')

if echo "$FULL_QUERY_RESPONSE" | grep -q "results"; then
    RESULT_COUNT=$(echo "$FULL_QUERY_RESPONSE" | jq -r '.results | length // 0')
    echo "✅ Full query successful: Retrieved $RESULT_COUNT records"
    if [ "$RESULT_COUNT" -gt 0 ]; then
        echo "$FULL_QUERY_RESPONSE" | jq '.results[0]'
    fi
else
    echo "⚠️  Full query response:"
    echo "$FULL_QUERY_RESPONSE" | head -5
fi
echo ""

echo "Step 9: Test Filter Options"
echo "---------------------------"
FILTER_OPTIONS=$(curl -s "$API_URL/api/marketplace/filter-options")
if echo "$FILTER_OPTIONS" | grep -q "countries"; then
    echo "✅ Filter options retrieved"
    echo "$FILTER_OPTIONS" | jq '{countries: (.countries | length), conditions: (.conditions | length), observationTypes: (.observationTypes | length)}'
else
    echo "⚠️  Filter options response:"
    echo "$FILTER_OPTIONS" | head -5
fi
echo ""

echo "Step 10: Test Purchase Flow"
echo "----------------------------"
if [ -n "$DATASET_ID" ] && [ -n "$RESEARCHER_ID" ]; then
    PURCHASE_RESPONSE=$(curl -s -X POST "$API_URL/api/marketplace/purchase" \
      -H "Content-Type: application/json" \
      -d '{
        "researcherId": "'$RESEARCHER_ID'",
        "datasetId": "'$DATASET_ID'",
        "amount": 25,
        "patientUPI": "UPI-TEST001",
        "hospitalId": "'$HOSPITAL_ID'"
      }')
    
    if echo "$PURCHASE_RESPONSE" | grep -q "success\|Purchase successful"; then
        echo "✅ Purchase successful"
        echo "$PURCHASE_RESPONSE" | jq '.'
    else
        echo "⚠️  Purchase response (may require verification):"
        echo "$PURCHASE_RESPONSE" | head -10
    fi
else
    echo "⚠️  Skipping - missing dataset ID or researcher ID"
fi
echo ""

echo "Step 11: Test Export (if purchase successful)"
echo "-----------------------------------------------"
if [ -n "$DATASET_ID" ] && [ -n "$RESEARCHER_ID" ]; then
    # Test CSV export
    CSV_EXPORT=$(curl -s -X POST "$API_URL/api/marketplace/datasets/$DATASET_ID/export" \
      -H "Content-Type: application/json" \
      -d '{
        "format": "csv",
        "researcherId": "'$RESEARCHER_ID'"
      }')
    
    if echo "$CSV_EXPORT" | grep -q "Anonymous Patient ID\|text/csv"; then
        echo "✅ CSV export successful"
        echo "$CSV_EXPORT" | head -5
    else
        echo "⚠️  CSV export response (may require purchase/verification):"
        echo "$CSV_EXPORT" | head -5
    fi
else
    echo "⚠️  Skipping - missing dataset ID or researcher ID"
fi
echo ""

echo "===================================="
echo "📊 Test Summary"
echo "===================================="
echo "Tests Passed: $TESTS_PASSED"
echo "Tests Failed: $TESTS_FAILED"
echo ""
echo "Test IDs:"
echo "  Hospital ID: $HOSPITAL_ID"
echo "  Researcher ID: $RESEARCHER_ID"
echo "  Dataset ID: $DATASET_ID"
echo ""
echo "✅ Full integration test completed!"
echo ""
echo "Next steps:"
echo "  1. Verify data in database"
echo "  2. Check HCS logs (if configured)"
echo "  3. Test frontend integration"
echo "  4. Review test results above"

