#!/bin/bash

echo "=========================================="
echo "MediPact Production Deployment Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Frontend URL
FRONTEND_URL="https://www.medipact.space"

# Backend URL
BACKEND_URL="https://medipact-production.up.railway.app"

echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo ""

# Check Frontend
echo "1. Checking Frontend Deployment..."
if curl -s -o /dev/null -w "%{http_code}" "$FRONTEND_URL" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${RED}✗ Frontend is not accessible${NC}"
fi
echo ""

# Check Backend Health
echo "2. Checking Backend Health Endpoint..."
HEALTH_RESPONSE=$(curl -s "$BACKEND_URL/health" 2>&1)
if echo "$HEALTH_RESPONSE" | grep -q "status\|ok\|healthy"; then
    echo -e "${GREEN}✓ Backend health check passed${NC}"
    echo "Response: $HEALTH_RESPONSE"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    echo "Response: $HEALTH_RESPONSE"
fi
echo ""

# Check Metrics Endpoint
echo "3. Checking Metrics Endpoint..."
METRICS_RESPONSE=$(curl -s "$BACKEND_URL/api/public/metrics" 2>&1)
if echo "$METRICS_RESPONSE" | grep -q "totalHederaAccounts\|success"; then
    echo -e "${GREEN}✓ Metrics endpoint is working${NC}"
    echo "$METRICS_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$METRICS_RESPONSE"
else
    echo -e "${RED}✗ Metrics endpoint failed${NC}"
    echo "Response: $METRICS_RESPONSE"
fi
echo ""

# Check API Docs
echo "4. Checking API Documentation..."
API_DOCS_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api-docs" 2>&1)
if [ "$API_DOCS_RESPONSE" = "200" ]; then
    echo -e "${GREEN}✓ API documentation is accessible${NC}"
else
    echo -e "${YELLOW}⚠ API documentation returned: $API_DOCS_RESPONSE${NC}"
fi
echo ""

# Check Key Endpoints
echo "5. Checking Key API Endpoints..."

# Hospital registration endpoint (should return method not allowed or validation error, not 404)
HOSPITAL_CHECK=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BACKEND_URL/api/hospital/register" 2>&1)
if [ "$HOSPITAL_CHECK" != "404" ]; then
    echo -e "${GREEN}✓ Hospital API endpoint exists${NC}"
else
    echo -e "${RED}✗ Hospital API endpoint not found${NC}"
fi

# Researcher registration endpoint
RESEARCHER_CHECK=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BACKEND_URL/api/researcher/register" 2>&1)
if [ "$RESEARCHER_CHECK" != "404" ]; then
    echo -e "${GREEN}✓ Researcher API endpoint exists${NC}"
else
    echo -e "${RED}✗ Researcher API endpoint not found${NC}"
fi

# Marketplace endpoint
MARKETPLACE_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "$BACKEND_URL/api/marketplace/datasets" 2>&1)
if [ "$MARKETPLACE_CHECK" != "404" ]; then
    echo -e "${GREEN}✓ Marketplace API endpoint exists${NC}"
else
    echo -e "${RED}✗ Marketplace API endpoint not found${NC}"
fi
echo ""

# Check Contract Addresses
echo "6. Verifying Smart Contract Addresses on HashScan..."
CONSENT_MANAGER="0xf2423F1E568eC90921045be96Ad2D618fCcd9841"
REVENUE_SPLITTER="0xCc7DF673dE5d24D295cdd7a503652C18A1aE7392"

CONSENT_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "https://hashscan.io/testnet/contract/$CONSENT_MANAGER" 2>&1)
if [ "$CONSENT_CHECK" = "200" ]; then
    echo -e "${GREEN}✓ ConsentManager contract accessible on HashScan${NC}"
    echo "   https://hashscan.io/testnet/contract/$CONSENT_MANAGER"
else
    echo -e "${YELLOW}⚠ ConsentManager contract check returned: $CONSENT_CHECK${NC}"
fi

REVENUE_CHECK=$(curl -s -o /dev/null -w "%{http_code}" "https://hashscan.io/testnet/contract/$REVENUE_SPLITTER" 2>&1)
if [ "$REVENUE_CHECK" = "200" ]; then
    echo -e "${GREEN}✓ RevenueSplitter contract accessible on HashScan${NC}"
    echo "   https://hashscan.io/testnet/contract/$REVENUE_SPLITTER"
else
    echo -e "${YELLOW}⚠ RevenueSplitter contract check returned: $REVENUE_CHECK${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo "Verification Summary"
echo "=========================================="
echo ""
echo "Frontend: $FRONTEND_URL"
echo "Backend: $BACKEND_URL"
echo "API Docs: $BACKEND_URL/api-docs"
echo "Metrics: $BACKEND_URL/api/public/metrics"
echo ""
echo "Contract Addresses:"
echo "  ConsentManager: $CONSENT_MANAGER"
echo "  RevenueSplitter: $REVENUE_SPLITTER"
echo ""
echo "HashScan Links:"
echo "  ConsentManager: https://hashscan.io/testnet/contract/$CONSENT_MANAGER"
echo "  RevenueSplitter: https://hashscan.io/testnet/contract/$REVENUE_SPLITTER"
echo ""

