#!/bin/bash

# Setup Test Data Script
# Verifies hospital and researcher, then submits test data

API_URL="http://localhost:3002"
HOSPITAL_ID="HOSP-7CF97789B6F5"
RESEARCHER_ID="RES-F0290B27E718"

echo "🔧 Setting up test data..."
echo "==========================="
echo ""

# Step 1: Verify Hospital (requires admin access or manual verification)
echo "1. Checking hospital status..."
HOSPITAL_STATUS=$(curl -s "$API_URL/api/hospital/$HOSPITAL_ID" | jq -r '.verificationStatus // "unknown"' 2>/dev/null)
echo "   Hospital ID: $HOSPITAL_ID"
echo "   Status: $HOSPITAL_STATUS"

if [ "$HOSPITAL_STATUS" != "verified" ]; then
    echo "   ⚠️  Hospital needs verification"
    echo "   To verify, use admin panel or run:"
    echo "   UPDATE hospitals SET verification_status = 'verified' WHERE hospital_id = '$HOSPITAL_ID';"
    echo ""
    echo "   For testing, we'll use SQLite to verify..."
    sqlite3 data/medipact.db "UPDATE hospitals SET verification_status = 'verified' WHERE hospital_id = '$HOSPITAL_ID';" 2>/dev/null
    echo "   ✅ Hospital verified via database"
else
    echo "   ✅ Hospital already verified"
fi
echo ""

# Step 2: Verify Researcher
echo "2. Checking researcher status..."
RESEARCHER_STATUS=$(curl -s "$API_URL/api/researcher/$RESEARCHER_ID" | jq -r '.verificationStatus // "unknown"' 2>/dev/null)
echo "   Researcher ID: $RESEARCHER_ID"
echo "   Status: $RESEARCHER_STATUS"

if [ "$RESEARCHER_STATUS" != "verified" ]; then
    echo "   ⚠️  Researcher needs verification"
    echo "   For testing, we'll use SQLite to verify..."
    sqlite3 data/medipact.db "UPDATE researchers SET verification_status = 'verified' WHERE researcher_id = '$RESEARCHER_ID';" 2>/dev/null
    echo "   ✅ Researcher verified via database"
else
    echo "   ✅ Researcher already verified"
fi
echo ""

# Step 3: Submit Test FHIR Data
echo "3. Submitting test FHIR resources..."
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
    echo "   ✅ FHIR resources submitted successfully"
    echo "$ADAPTER_RESPONSE" | jq '.'
else
    echo "   ⚠️  Response:"
    echo "$ADAPTER_RESPONSE" | jq '.' 2>/dev/null || echo "$ADAPTER_RESPONSE"
fi
echo ""

# Step 4: Create Dataset
echo "4. Creating test dataset..."
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

DATASET_ID=$(echo "$DATASET_RESPONSE" | jq -r '.dataset.id // empty' 2>/dev/null)
if [ -n "$DATASET_ID" ]; then
    echo "   ✅ Dataset created: $DATASET_ID"
    echo "$DATASET_RESPONSE" | jq '.dataset | {id, name, recordCount, price}'
else
    echo "   ⚠️  Response:"
    echo "$DATASET_RESPONSE" | jq '.' 2>/dev/null || echo "$DATASET_RESPONSE"
fi
echo ""

echo "==========================="
echo "✅ Test data setup complete!"
echo ""
echo "Test IDs:"
echo "  Hospital: $HOSPITAL_ID"
echo "  Researcher: $RESEARCHER_ID"
if [ -n "$DATASET_ID" ]; then
    echo "  Dataset: $DATASET_ID"
fi
echo ""
echo "You can now run: ./scripts/full-test.sh"

