#!/bin/bash

# Test Revenue Distribution via API
# Tests the revenue distribution API endpoint

BACKEND_URL="http://localhost:3002"

echo "🧪 Testing Revenue Distribution API"
echo "===================================="
echo ""

# Get test patient and hospital from database
PATIENT_UPI=$(sqlite3 backend/data/medipact.db "SELECT upi FROM patient_identities WHERE hedera_account_id IS NOT NULL LIMIT 1" 2>/dev/null)
HOSPITAL_ID=$(sqlite3 backend/data/medipact.db "SELECT hospital_id FROM hospitals WHERE hedera_account_id IS NOT NULL LIMIT 1" 2>/dev/null)

if [ -z "$PATIENT_UPI" ] || [ -z "$HOSPITAL_ID" ]; then
  echo "❌ No patient or hospital with Hedera Account ID found"
  echo "💡 Please register a patient and hospital first"
  exit 1
fi

echo "📋 Test Accounts:"
echo "   Patient UPI: $PATIENT_UPI"
echo "   Hospital ID: $HOSPITAL_ID"
echo ""

# Test with 1 HBAR (100,000,000 tinybars)
TOTAL_AMOUNT=100000000

echo "💰 Test Revenue Distribution:"
echo "   Total Amount: $TOTAL_AMOUNT tinybars (1 HBAR)"
echo "   Expected Split:"
echo "     - Patient (60%): 60,000,000 tinybars (0.6 HBAR)"
echo "     - Hospital (25%): 25,000,000 tinybars (0.25 HBAR)"
echo "     - Platform (15%): 15,000,000 tinybars (0.15 HBAR)"
echo ""

echo "🔄 Calling API endpoint..."
echo ""

RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/revenue/distribute" \
  -H "Content-Type: application/json" \
  -d "{
    \"patientUPI\": \"$PATIENT_UPI\",
    \"hospitalId\": \"$HOSPITAL_ID\",
    \"totalAmount\": $TOTAL_AMOUNT
  }")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

SUCCESS=$(echo "$RESPONSE" | jq -r '.success' 2>/dev/null)
TRANSACTION_ID=$(echo "$RESPONSE" | jq -r '.distribution.transactionId' 2>/dev/null)

if [ "$SUCCESS" = "true" ] && [ -n "$TRANSACTION_ID" ] && [ "$TRANSACTION_ID" != "null" ]; then
  echo "✅ Revenue Distribution Successful!"
  echo ""
  echo "📊 Distribution Result:"
  echo "$RESPONSE" | jq '.distribution' 2>/dev/null
  echo ""
  echo "🔗 View on HashScan:"
  echo "   https://hashscan.io/testnet/transaction/$TRANSACTION_ID"
  echo ""
else
  echo "❌ Revenue distribution failed"
  echo "$RESPONSE" | jq '.error' 2>/dev/null || echo "$RESPONSE"
  exit 1
fi

