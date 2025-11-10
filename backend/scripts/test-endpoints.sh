#!/bin/bash

# MediPact Backend API Test Script
# Tests all data handling endpoints

API_URL="http://localhost:3002"
HOSPITAL_ID="HOSP-TEST001"
RESEARCHER_ID="RES-TEST001"

echo "🧪 Testing MediPact Backend API"
echo "================================"
echo ""

# Test 1: Health Check
echo "1. Testing Health Endpoint..."
HEALTH=$(curl -s "$API_URL/health")
if echo "$HEALTH" | grep -q "healthy"; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
  echo "$HEALTH"
  exit 1
fi
echo ""

# Test 2: Get Filter Options
echo "2. Testing Filter Options..."
FILTER_OPTIONS=$(curl -s "$API_URL/api/marketplace/filter-options")
if echo "$FILTER_OPTIONS" | grep -q "countries"; then
  echo "✅ Filter options retrieved"
else
  echo "❌ Filter options failed"
  echo "$FILTER_OPTIONS"
fi
echo ""

# Test 3: Browse Datasets
echo "3. Testing Dataset Browse..."
DATASETS=$(curl -s "$API_URL/api/marketplace/datasets")
if echo "$DATASETS" | grep -q "datasets"; then
  echo "✅ Dataset browse successful"
  echo "   Response: $(echo $DATASETS | jq -r '.count // 0') datasets found"
else
  echo "❌ Dataset browse failed"
  echo "$DATASETS"
fi
echo ""

# Test 4: Query (Preview Mode)
echo "4. Testing Query (Preview Mode)..."
QUERY_RESULT=$(curl -s -X POST "$API_URL/api/marketplace/query" \
  -H "Content-Type: application/json" \
  -H "x-researcher-id: $RESEARCHER_ID" \
  -d '{
    "country": "Uganda",
    "preview": true
  }')
if echo "$QUERY_RESULT" | grep -q "count"; then
  echo "✅ Query preview successful"
  COUNT=$(echo "$QUERY_RESULT" | jq -r '.count // 0')
  echo "   Found $COUNT matching records"
else
  echo "⚠️  Query preview (may need researcher registration)"
  echo "$QUERY_RESULT" | head -5
fi
echo ""

# Test 5: Adapter Submit (if hospital exists)
echo "5. Testing Adapter Submit..."
ADAPTER_RESULT=$(curl -s -X POST "$API_URL/api/adapter/submit-fhir-resources" \
  -H "Content-Type: application/json" \
  -H "x-hospital-id: $HOSPITAL_ID" \
  -H "x-api-key: test-key" \
  -d '{
    "hospitalId": "'$HOSPITAL_ID'",
    "patients": [{
      "anonymousPatientId": "PID-TEST001",
      "upi": "UPI-TEST001",
      "country": "Uganda",
      "ageRange": "35-39",
      "gender": "Male",
      "conditions": [],
      "observations": []
    }]
  }')
if echo "$ADAPTER_RESULT" | grep -q "success\|error"; then
  if echo "$ADAPTER_RESULT" | grep -q "success"; then
    echo "✅ Adapter submit successful"
  else
    echo "⚠️  Adapter submit (may need hospital registration)"
    echo "$ADAPTER_RESULT" | head -3
  fi
else
  echo "⚠️  Adapter submit response unclear"
  echo "$ADAPTER_RESULT" | head -3
fi
echo ""

echo "================================"
echo "✅ Basic API tests completed!"
echo ""
echo "For detailed testing, see: backend/TESTING_GUIDE.md"
echo "For API documentation, visit: $API_URL/api-docs"

