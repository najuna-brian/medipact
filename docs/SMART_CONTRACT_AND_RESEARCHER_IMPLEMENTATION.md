# Smart Contract Integration & Researcher System Implementation

## Overview

This document describes the implementation of the smart contract integration using Hedera Account IDs and the complete researcher registration and verification system.

## Implementation Date
November 9, 2025

## Features Implemented

### 1. Researcher Registration System

#### Backend
- **Database Schema**: `researchers` table with Hedera Account ID support
- **Registration Service**: Automatic Hedera account creation for each researcher
- **Researcher ID Generation**: Deterministic hash-based IDs (RES-XXXXX)
- **API Endpoints**:
  - `POST /api/researcher/register` - Register new researcher
  - `GET /api/researcher/:researcherId` - Get researcher info
  - `GET /api/researcher/email/:email` - Get researcher by email
  - `GET /api/researcher/:researcherId/verification-status` - Get verification status
  - `POST /api/researcher/:researcherId/verify` - Submit verification documents

#### Frontend
- **Registration Page**: `/researcher/register`
- **Verification Page**: `/researcher/[researcherId]/verify`
- **Dashboard**: Updated with verification prompts
- **API Client**: Complete TypeScript interfaces and functions
- **React Hooks**: `useResearcher.ts` with React Query

### 2. Verification System

#### Always Prompt Unverified Researchers
- **Verification Prompt Component**: Always displayed for unverified researchers
- **Status Checks**: Automatic verification status polling
- **Verification Required**: Data purchases blocked for unverified researchers
- **Admin Approval**: Admin can approve/reject researchers via admin API

#### Admin Management
- **Admin API Endpoints**:
  - `GET /api/admin/researchers` - List all researchers
  - `GET /api/admin/researchers/:researcherId` - Get researcher detail
  - `POST /api/admin/researchers/:researcherId/verify` - Approve verification
  - `POST /api/admin/researchers/:researcherId/reject` - Reject verification

### 3. Revenue Distribution with Hedera Account IDs

#### Service Implementation
- **Revenue Distribution Service**: Uses Hedera Account IDs for direct HBAR transfers
- **Split Calculation**: 60% patient, 25% hospital, 15% platform
- **Direct Transfers**: Native Hedera transfers using Account IDs
- **Contract Support**: Optional RevenueSplitter contract integration

#### API Endpoints
- `POST /api/revenue/distribute` - Distribute revenue for single sale
- `POST /api/revenue/distribute-bulk` - Bulk revenue distribution
- `POST /api/marketplace/purchase` - Purchase dataset (with verification check)

### 4. Data Marketplace

#### Features
- **Dataset Browsing**: `GET /api/marketplace/datasets`
- **Purchase Flow**: Verification required before purchase
- **Revenue Distribution**: Automatic on purchase
- **Status Checks**: Researcher status endpoint with verification prompt

## Database Schema

### Researchers Table
```sql
CREATE TABLE researchers (
  researcher_id VARCHAR(32) PRIMARY KEY,
  hedera_account_id VARCHAR(20) UNIQUE,
  encrypted_private_key TEXT,
  email VARCHAR(255) NOT NULL UNIQUE,
  organization_name VARCHAR(255) NOT NULL,
  contact_name VARCHAR(255),
  country VARCHAR(100),
  verification_status VARCHAR(20) NOT NULL DEFAULT 'pending',
  verification_documents TEXT,
  verified_at TIMESTAMP,
  verified_by VARCHAR(255),
  access_level VARCHAR(20) NOT NULL DEFAULT 'basic',
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  CHECK (status IN ('active', 'suspended', 'deleted')),
  CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  CHECK (access_level IN ('basic', 'verified', 'anonymous'))
);
```

## Security Features

### Verification Requirements
1. **Always Prompt**: Unverified researchers always see verification prompt
2. **Purchase Blocking**: Data purchases require verification
3. **Admin Review**: All verification documents reviewed by admin
4. **Status Tracking**: Real-time verification status updates

### Hedera Account Security
- **Platform-Managed**: Platform creates and manages Hedera accounts
- **Encrypted Keys**: Private keys encrypted with AES-256-GCM
- **Automatic Creation**: Accounts created during registration
- **No User Burden**: Users don't need to manage keys

## Testing

### Test Script
Location: `scripts/test-researcher-registration.sh`

### Test Results
✅ Researcher registration with Hedera Account ID creation
✅ Verification status endpoint
✅ Verification document submission
✅ Researcher lookup by email
✅ Verification prompt system

### Example Test Output
```
Researcher ID: RES-6B1FD4B78B66
Hedera Account: 0.0.7223969
Verification Status: pending
Verification Prompt: true
```

## API Examples

### Register Researcher
```bash
curl -X POST http://localhost:3002/api/researcher/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "researcher@example.com",
    "organizationName": "Research Institute",
    "contactName": "Dr. Smith",
    "country": "United States"
  }'
```

### Submit Verification
```bash
curl -X POST http://localhost:3002/api/researcher/RES-XXX/verify \
  -H "Content-Type: application/json" \
  -d '{
    "documents": {
      "organizationDocuments": "data:application/pdf;base64,...",
      "researchLicense": "data:application/pdf;base64,..."
    }
  }'
```

### Admin Approve Researcher
```bash
curl -X POST http://localhost:3002/api/admin/researchers/RES-XXX/verify \
  -H "Authorization: Bearer {admin_token}"
```

### Distribute Revenue
```bash
curl -X POST http://localhost:3002/api/revenue/distribute \
  -H "Content-Type: application/json" \
  -d '{
    "patientUPI": "UPI-XXX",
    "hospitalId": "HOSP-XXX",
    "totalAmount": 1000000000
  }'
```

## Frontend Integration

### Registration Flow
1. User visits `/researcher/register`
2. Fills registration form
3. Researcher created with Hedera Account ID
4. Redirected to dashboard with verification prompt

### Verification Flow
1. User sees verification prompt on dashboard
2. Clicks "Verify Now" button
3. Submits verification documents
4. Status updates to "pending"
5. Admin reviews and approves/rejects
6. Status updates to "verified" or "rejected"

### Dashboard Features
- **Verification Prompt**: Always shown if not verified
- **Account Information**: Researcher ID, Hedera Account ID, status
- **Status Badge**: Color-coded verification status
- **Quick Actions**: Links to catalog, projects, purchases

## Revenue Distribution Flow

1. **Data Purchase**: Researcher purchases dataset
2. **Verification Check**: System verifies researcher is verified
3. **Account ID Retrieval**: Get patient and hospital Hedera Account IDs
4. **Split Calculation**: Calculate 60/25/15 split
5. **HBAR Transfer**: Direct transfers to Hedera accounts
6. **Transaction Record**: Record transaction ID and distribution details

## Files Created/Modified

### Backend
- `backend/src/db/researcher-db.js` - Researcher database operations
- `backend/src/services/researcher-registry-service.js` - Registration service
- `backend/src/services/revenue-distribution-service.js` - Revenue distribution
- `backend/src/services/adapter-integration-service.js` - Adapter integration
- `backend/src/routes/researcher-api.js` - Researcher API routes
- `backend/src/routes/marketplace-api.js` - Marketplace API routes
- `backend/src/routes/revenue-api.js` - Revenue API routes
- `backend/src/routes/admin-api.js` - Extended with researcher management
- `backend/src/db/database.js` - Added researchers table

### Frontend
- `frontend/src/lib/api/patient-identity.ts` - Added researcher API functions
- `frontend/src/hooks/useResearcher.ts` - React Query hooks
- `frontend/src/components/VerificationPrompt/VerificationPrompt.tsx` - Prompt component
- `frontend/src/app/researcher/register/page.tsx` - Registration page
- `frontend/src/app/researcher/[researcherId]/verify/page.tsx` - Verification page
- `frontend/src/app/researcher/dashboard/page.tsx` - Updated dashboard

## Next Steps

1. ✅ Researcher registration - **Complete**
2. ✅ Verification system - **Complete**
3. ✅ Revenue distribution - **Complete**
4. ⏳ Dataset catalog implementation
5. ⏳ Purchase history tracking
6. ⏳ Revenue distribution testing with real transactions
7. ⏳ Admin interface for researcher management

## Notes

- All researchers get Hedera Account IDs automatically
- Verification is always prompted for unverified researchers
- Revenue distribution uses Hedera Account IDs directly
- Platform manages all Hedera accounts and keys
- Admin approval required for researcher verification

