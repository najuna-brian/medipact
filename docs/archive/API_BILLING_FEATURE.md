# API Billing Feature - Future Implementation

**Status**: 🚧 Frontend Placeholder (Post-Hackathon Implementation)

---

## Overview

The Pay-Per-Query API feature allows researchers to access anonymized patient data programmatically with automatic billing. This feature is planned for post-hackathon implementation.

---

## How It Works

### 1. **API Request**
- Researcher makes API call with query filters
- System queries matching patient records

### 2. **Automatic Billing**
- **Pricing**: 0.1 HBAR per patient record (minimum 1 HBAR)
- System calculates total charge based on number of records returned
- Payment automatically deducted from researcher's wallet

### 3. **Instant Access**
- If payment succeeds, data is returned immediately
- Revenue automatically distributed (60% Patient, 25% Hospital, 15% Platform)
- All transactions logged on Hedera

---

## Billing Options

### Prepaid Credits
- Load credits upfront (e.g., 100 HBAR = 1,000 patient records)
- No payment delays - instant API access
- Set spending limits and budgets
- Automatic top-up when credits run low
- Volume discounts available

**Example:**
- Load 100 HBAR credits
- Query returns 20 patients = 2 HBAR deducted
- Remaining balance: 98 HBAR

### Postpaid Billing
- Query first, pay later (monthly billing cycle)
- Detailed usage reports and analytics
- Automatic invoice generation
- Credit limits and approval workflows

**Example:**
- Query 500 patients this month = 50 HBAR
- Query 300 patients next month = 30 HBAR
- Monthly invoice: 80 HBAR total

---

## API Endpoints

All endpoints charge **0.1 HBAR per patient record** (minimum 1 HBAR):

- `GET /api/researcher/patients` - Query patient records
- `GET /api/researcher/conditions` - Query medical conditions
- `GET /api/researcher/observations` - Query lab results
- `GET /api/researcher/encounters` - Query healthcare encounters

---

## Pricing

- **Per Record**: 0.1 HBAR (~$0.016 USD)
- **Minimum Charge**: 1 HBAR per request
- **Example**: 20 patient records = 2.0 HBAR (~$0.32 USD)

---

## Key Benefits

✅ Pay only for records you access  
✅ Automatic revenue distribution (60/25/15)  
✅ Real-time usage tracking  
✅ Rate limiting and security  
✅ FHIR R4 compliant responses  

---

## Implementation Status

- ✅ **Frontend UI**: Complete placeholder page at `/researcher/api-access`
- ✅ **API Infrastructure**: Endpoints exist (currently free access)
- ⏳ **Billing Integration**: Planned for post-hackathon
- ⏳ **Prepaid Credits System**: Planned for post-hackathon
- ⏳ **Postpaid Billing System**: Planned for post-hackathon

---

## For Demo Video

**Show this page** to demonstrate:
1. Future API billing capabilities
2. Flexible billing options (prepaid/postpaid)
3. Clear pricing model (0.1 HBAR per record)
4. Professional API access interface

**Key Message**: "We're building a pay-per-query API that allows researchers to access data programmatically with automatic billing. This demonstrates our vision for scalable, flexible data access."

---

**Last Updated**: November 19, 2025



