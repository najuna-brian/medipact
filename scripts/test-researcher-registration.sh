#!/bin/bash

# Test Researcher Registration Flow
# Tests researcher registration, verification, and status checks

BACKEND_URL="http://localhost:3002"
RESEARCHER_EMAIL="test-researcher@example.com"
ORGANIZATION="Test Research Institute"

echo "🧪 Testing Researcher Registration Flow"
echo "========================================"
echo ""

# Test 1: Register Researcher
echo "📝 Test 1: Register Researcher"
RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/researcher/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$RESEARCHER_EMAIL\",
    \"organizationName\": \"$ORGANIZATION\",
    \"contactName\": \"Dr. Test Researcher\",
    \"country\": \"United States\"
  }")

echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

RESEARCHER_ID=$(echo "$RESPONSE" | jq -r '.researcher.researcherId' 2>/dev/null)
HEDERA_ACCOUNT_ID=$(echo "$RESPONSE" | jq -r '.researcher.hederaAccountId' 2>/dev/null)

if [ -z "$RESEARCHER_ID" ] || [ "$RESEARCHER_ID" = "null" ]; then
  echo "❌ Failed to get researcher ID"
  exit 1
fi

echo "✅ Researcher Registered: $RESEARCHER_ID"
if [ -n "$HEDERA_ACCOUNT_ID" ] && [ "$HEDERA_ACCOUNT_ID" != "null" ]; then
  echo "✅ Hedera Account Created: $HEDERA_ACCOUNT_ID"
fi
echo ""

# Test 2: Get Researcher Status
echo "📊 Test 2: Get Researcher Status"
STATUS_RESPONSE=$(curl -s "$BACKEND_URL/api/researcher/$RESEARCHER_ID/verification-status")
echo "$STATUS_RESPONSE" | jq '.' 2>/dev/null || echo "$STATUS_RESPONSE"
echo ""

VERIFICATION_STATUS=$(echo "$STATUS_RESPONSE" | jq -r '.verificationStatus' 2>/dev/null)
VERIFICATION_PROMPT=$(echo "$STATUS_RESPONSE" | jq -r '.verificationPrompt' 2>/dev/null)

echo "✅ Verification Status: $VERIFICATION_STATUS"
echo "✅ Verification Prompt: $VERIFICATION_PROMPT"
echo ""

# Test 3: Submit Verification Documents
echo "📄 Test 3: Submit Verification Documents"
# Create a dummy base64 document
DUMMY_DOC="data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KPj4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSAxMiBUZgoxMDAgNzAwIFRkCihUZXN0IERvY3VtZW50KSBUagpFVAplbmRzdHJlYW0KZW5kb2JqCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDU4IDAwMDAwIG4gCjAwMDAwMDAxMTUgMDAwMDAgbiAKMDAwMDAwMDE3NCAwMDAwMCBuIAowMDAwMDAwMjQxIDAwMDAwIG4gCnRyYWlsZXIKPDwKL1NpemUgNgovUm9vdCAxIDAgUgo+PgpzdGFydHhyZWYKMzE0CiUlRU9G"

VERIFY_RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/researcher/$RESEARCHER_ID/verify" \
  -H "Content-Type: application/json" \
  -d "{
    \"documents\": {
      \"organizationDocuments\": \"$DUMMY_DOC\",
      \"researchLicense\": \"$DUMMY_DOC\"
    }
  }")

echo "$VERIFY_RESPONSE" | jq '.' 2>/dev/null || echo "$VERIFY_RESPONSE"
echo ""

# Test 4: Check Verification Status Again
echo "🔄 Test 4: Check Verification Status (After Submission)"
sleep 1
STATUS_RESPONSE2=$(curl -s "$BACKEND_URL/api/researcher/$RESEARCHER_ID/verification-status")
VERIFICATION_STATUS2=$(echo "$STATUS_RESPONSE2" | jq -r '.verificationStatus' 2>/dev/null)
echo "✅ Verification Status: $VERIFICATION_STATUS2"
echo ""

# Test 5: Get Researcher by Email
echo "📧 Test 5: Get Researcher by Email"
EMAIL_RESPONSE=$(curl -s "$BACKEND_URL/api/researcher/email/$RESEARCHER_EMAIL")
EMAIL_RESEARCHER_ID=$(echo "$EMAIL_RESPONSE" | jq -r '.researcherId' 2>/dev/null)
echo "✅ Researcher ID from Email: $EMAIL_RESEARCHER_ID"
echo ""

# Summary
echo "========================================"
echo "✅ All Tests Completed!"
echo ""
echo "Researcher ID: $RESEARCHER_ID"
if [ -n "$HEDERA_ACCOUNT_ID" ] && [ "$HEDERA_ACCOUNT_ID" != "null" ]; then
  echo "Hedera Account: $HEDERA_ACCOUNT_ID"
fi
echo "Verification Status: $VERIFICATION_STATUS2"
echo ""
echo "Next Steps:"
echo "  1. Admin should approve researcher at: /api/admin/researchers/$RESEARCHER_ID/verify"
echo "  2. Test revenue distribution with researcher purchases"
echo ""

