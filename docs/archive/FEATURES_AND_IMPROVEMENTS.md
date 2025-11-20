# MediPact Features and Improvements

## Overview

This document outlines all the features and improvements implemented in the MediPact platform, including recent enhancements for pricing, patient control, security, encryption, cross-hospital data sharing, and **double anonymization with provenance tracking**.

---

## 🔒 Double Anonymization with Provenance Tracking

### Overview

MediPact implements **two-stage anonymization** with provenance tracking for maximum privacy protection and verifiable data transformation on the Hedera blockchain.

### Features Implemented

1. **Stage 1: Storage Anonymization**
   - Remove PII (name, ID, address, phone, exact DOB)
   - Preserve 5-year age ranges (e.g., "35-39")
   - Preserve exact dates, region/district
   - Optimized for research queries
   - Stored in backend database

2. **Stage 2: Chain Anonymization**
   - Further generalize age ranges (5-year → 10-year)
   - Round dates (exact → month/year)
   - Remove region/district
   - Generalize occupation further
   - Maximum privacy for immutable blockchain storage

3. **Provenance Records**
   - Storage hash (H1) - Stage 1 anonymization
   - Chain hash (H2) - Stage 2 anonymization
   - Provenance proof - Links both hashes together
   - Transformation proof - Chain derived from storage
   - Stored on Hedera HCS for public verification

### Benefits

- ✅ **Double Protection**: Two layers of anonymization
- ✅ **Defense in Depth**: If one layer fails, the other protects
- ✅ **Provenance Tracking**: Verifiable transformation chain on Hedera
- ✅ **Compliance Ready**: Meets strict regulatory requirements (GDPR, HIPAA)
- ✅ **Public Verification**: Anyone can verify on HashScan

### Documentation

- [Double Anonymization Guide](./archive/DOUBLE_ANONYMIZATION.md) - Complete implementation guide
- [Anonymization Tutorial](../archive/tutorial/13-anonymization.md) - Detailed process
- [Data Flow Tutorial](../archive/tutorial/11-data-flow.md) - Complete data journey

---

## 🎯 Phase 1: Pricing System with USD Display

### Features Implemented

1. **Automated Pricing Service**
   - 6 pricing categories based on data type and sensitivity
   - 40% of market rates (affordable for researchers)
   - Volume discounts (0-40% based on record count)
   - Automatic price calculation on dataset creation

2. **Pricing Categories**
   - **Basic Demographics**: $0.032 per record
   - **Condition Data**: $0.12 per record
   - **Lab Results**: $0.24 per record
   - **Combined Dataset**: $1.00 per record
   - **Longitudinal**: $2.00 per record
   - **Sensitive/Rare**: $5.00 per record

3. **USD Display**
   - All prices displayed in USD to users
   - Automatic HBAR to USD conversion (1 HBAR = $0.16)
   - Price per record shown for transparency
   - Volume discount percentage displayed

4. **Database Schema**
   - Added pricing fields: `price_usd`, `price_per_record_hbar`, `price_per_record_usd`
   - Added `pricing_category_id`, `pricing_category`, `volume_discount`
   - Migration script for existing databases

### Files Created/Updated
- `backend/src/services/pricing-service.js` - Pricing calculation logic
- `backend/src/services/dataset-service.js` - Auto-pricing on creation
- `backend/src/db/dataset-db.js` - Pricing fields support
- `frontend/src/lib/utils/pricing.ts` - Pricing utilities
- `frontend/src/app/researcher/dataset/[id]/page.tsx` - USD price display
- `backend/scripts/migrate-pricing-fields.js` - Database migration

---

## 🛡️ Phase 2: Patient Data Sharing Controls

### Features Implemented

1. **Patient-Centric Control**
   - Global opt-in/opt-out for data sharing
   - Control over verified vs unverified researchers
   - Bulk purchase controls
   - Sensitive data sharing controls
   - Minimum price per record setting

2. **Researcher Approval System**
   - Patients can approve/block specific researchers
   - Pending approval requests workflow
   - Researcher-specific conditions/restrictions
   - Approval history tracking

3. **Query Filtering**
   - All queries filtered by patient preferences
   - Respects global opt-out
   - Checks researcher approval status
   - Enforces minimum price requirements

4. **Patient Dashboard**
   - Data sharing preferences tab
   - Pending requests management
   - Approved researchers list
   - Access history with revenue tracking

### Database Schema
- `patient_data_preferences` - Global sharing preferences
- `patient_researcher_approvals` - Per-researcher approvals
- `data_access_history` - Audit trail of data access

### Files Created/Updated
- `backend/src/db/patient-preferences-db.js` - Database operations
- `backend/src/services/patient-preferences-service.js` - Business logic
- `backend/src/services/query-service.js` - Patient preference filtering
- `backend/src/routes/patient-preferences-api.js` - API endpoints
- `frontend/src/app/patient/data-sharing/page.tsx` - Patient dashboard

---

## 🔒 Phase 3: Security Improvements

### Features Implemented

1. **Bcrypt Password Hashing**
   - Replaced SHA-256 with bcrypt for admin passwords
   - Bcrypt rounds: 12 for passwords, 10 for API keys
   - Backward compatible with legacy hashes
   - Automatic migration on password update

2. **API Key Security**
   - Bcrypt hashing for hospital API keys
   - Secure verification with timing attack protection
   - Legacy SHA-256 support during migration

3. **Rate Limiting**
   - General API: 100 requests per 15 minutes per IP
   - Authentication: 5 attempts per 15 minutes per IP
   - API Key: 1000 requests per hour per key
   - Query: 50 queries per hour per researcher
   - Purchase: 10 purchases per hour per researcher

### Files Created/Updated
- `backend/src/db/admin-db.js` - Bcrypt password hashing
- `backend/src/db/hospital-db.js` - Bcrypt API key hashing
- `backend/src/middleware/rate-limiter.js` - Rate limiting middleware
- `backend/src/server.js` - Applied rate limiters
- `backend/src/routes/marketplace-api.js` - Query/purchase limiters

---

## 🔐 Phase 4: End-to-End Encryption

### Features Implemented

1. **Field-Level Encryption**
   - AES-256-GCM encryption for sensitive fields
   - Hospital-specific encryption keys
   - Patient-specific encryption keys
   - Automatic encryption/decryption helpers

2. **Zero-Knowledge Architecture**
   - Platform cannot decrypt patient data
   - Only hospitals can decrypt their own data
   - Only patients can decrypt their own data
   - Encrypted data returned to platform

3. **Encrypted Fields**
   - Patient: UPI, hospitalPatientId, contactEmail, contactPhone, nationalId, address, dateOfBirth
   - Medical: hospitalPatientId, patientName, diagnosisNotes, treatmentNotes

4. **Access Control**
   - Middleware to restrict platform access
   - Hospital authentication required for decryption
   - Patient authentication required for decryption

### Files Created/Updated
- `backend/src/services/field-encryption-service.js` - Encryption logic
- `backend/src/services/encrypted-fhir-service.js` - Encrypted FHIR wrapper
- `backend/src/middleware/access-control.js` - Access control middleware
- `backend/src/services/query-service.js` - Encrypted query support
- `backend/src/routes/patient-api.js` - Access control on routes

---

## 🏥 Phase 5: Cross-Hospital Data Sharing with Temporary Access

### Features Implemented

1. **Temporary Access Requests**
   - Hospitals can request temporary access to patient data
   - Time-limited access (15 minutes to 24 hours)
   - Patient approval required
   - Supports telemedicine use cases

2. **Patient Approval Workflow**
   - Patients receive notification of pending requests
   - Approve/reject/revoke functionality
   - View active access requests
   - Time remaining display

3. **Automatic Expiration**
   - Background cleanup job (runs every 5 minutes)
   - Automatic status update to 'expired'
   - Time remaining calculation
   - Expiration notifications

4. **Re-Encryption Service**
   - Data re-encrypted from original hospital to requesting hospital
   - Only works if temporary access is approved
   - Batch re-encryption for multiple records
   - Platform cannot decrypt (zero-knowledge)

5. **Patient History Integration**
   - Patient history service checks temporary access
   - Includes data from hospitals with temporary access
   - Re-encrypts data for requesting hospital
   - Access type indicator (permanent vs temporary)

### Database Schema
- `temporary_hospital_access` - Temporary access requests
- Status: pending, approved, rejected, expired, revoked, active
- Access types: read, read_write, telemedicine

### Files Created/Updated
- `backend/src/db/temporary-access-db.js` - Database operations
- `backend/src/services/temporary-access-service.js` - Business logic
- `backend/src/services/re-encryption-service.js` - Re-encryption logic
- `backend/src/services/expiration-cleanup-service.js` - Cleanup job
- `backend/src/services/patient-history-service.js` - Temporary access support
- `backend/src/routes/temporary-access-api.js` - API endpoints
- `frontend/src/app/patient/data-sharing/page.tsx` - Hospital access UI

---

## 💰 Revenue Distribution Model

### Key Principle

**The hospital that originally collected the patient's data is the sole beneficiary of revenue from that data.**

### How It Works

1. **Data Collection**
   - Each patient record has a `hospital_id` field
   - This links the patient's data to the collecting hospital
   - Link is permanent and never changes

2. **Revenue Distribution**
   - Total payment split equally among all patients
   - Per patient: 60% patient, 25% hospital, 15% platform
   - Each patient's 25% goes to their original hospital
   - Multiple hospitals in dataset each receive revenue only for their own patients

3. **Example**
   - Dataset: 100 patients (60 from Hospital A, 40 from Hospital B)
   - Payment: 1,000 HBAR
   - Hospital A receives: 60 × 10 HBAR × 25% = 150 HBAR
   - Hospital B receives: 40 × 10 HBAR × 25% = 100 HBAR

### Documentation
- `docs/REVENUE_DISTRIBUTION_MODEL.md` - Detailed explanation

---

## 📊 System Architecture

### Data Flow

```
Hospital → Adapter → Anonymization → HCS → Backend → Marketplace
                                                      ↓
                                              Patient Preferences
                                                      ↓
                                              Query Filtering
                                                      ↓
                                              Researcher Purchase
                                                      ↓
                                              Revenue Distribution
                                                      ↓
                                         60% Patient | 25% Hospital | 15% Platform
```

### Security Layers

1. **Authentication**: Bcrypt passwords, API key verification
2. **Authorization**: Role-based access control, patient preferences
3. **Encryption**: Field-level E2E encryption, zero-knowledge architecture
4. **Rate Limiting**: Protection against abuse and DDoS
5. **Audit Trail**: HCS logging, access history tracking

---

## 🧪 Testing Checklist

### Backend Tests
- [x] Pricing service calculates correctly
- [x] Patient preferences database operations
- [x] Temporary access request workflow
- [x] Re-encryption service
- [x] Rate limiting middleware
- [x] Bcrypt password hashing
- [x] Field encryption/decryption

### Frontend Tests
- [x] USD price display
- [x] Patient data sharing dashboard
- [x] Hospital access requests UI
- [x] TypeScript type checking
- [x] Component imports

### Integration Tests
- [x] Database schema migrations
- [x] API endpoint routing
- [x] Service dependencies
- [x] Error handling

---

## 📝 API Endpoints Summary

### Patient Preferences
- `GET /api/patient/:upi/preferences` - Get preferences
- `PUT /api/patient/:upi/preferences` - Update preferences
- `GET /api/patient/:upi/approvals/pending` - Pending requests
- `GET /api/patient/:upi/approvals/approved` - Approved researchers
- `POST /api/patient/:upi/approvals/:researcherId/approve` - Approve researcher
- `POST /api/patient/:upi/approvals/:researcherId/block` - Block researcher
- `GET /api/patient/:upi/access-history` - Access history

### Temporary Hospital Access
- `POST /api/hospital/temporary-access/request` - Request access
- `GET /api/hospital/temporary-access/active` - Active requests
- `GET /api/hospital/temporary-access/check` - Check access
- `GET /api/patient/:upi/temporary-access/pending` - Pending requests
- `POST /api/patient/:upi/temporary-access/:requestId/approve` - Approve
- `POST /api/patient/:upi/temporary-access/:requestId/reject` - Reject
- `POST /api/patient/:upi/temporary-access/:requestId/revoke` - Revoke

### Marketplace
- `GET /api/marketplace/datasets` - Browse datasets (with USD prices)
- `GET /api/marketplace/datasets/:datasetId` - Dataset details (with USD prices)
- `POST /api/marketplace/query` - Query data (filtered by patient preferences)
- `POST /api/marketplace/purchase` - Purchase dataset (records access history)

---

## 🔄 Migration Guide

### Database Migrations

1. **Pricing Fields Migration**
   ```bash
   cd backend
   node scripts/migrate-pricing-fields.js
   ```

2. **New Tables** (auto-created on startup)
   - `patient_data_preferences`
   - `patient_researcher_approvals`
   - `data_access_history`
   - `temporary_hospital_access`

### Environment Variables

Add to `.env`:
```env
# Pricing
HBAR_TO_USD_RATE=0.16

# HCS Topics (optional)
HCS_PATIENT_APPROVAL_TOPIC_ID=0.0.xxxxx
HCS_TEMP_ACCESS_TOPIC_ID=0.0.xxxxx

# Encryption
MASTER_ENCRYPTION_KEY=your-master-key-here
ENCRYPTION_KEY=your-encryption-key-here
```

---

## 📚 Documentation Files

- `docs/REVENUE_DISTRIBUTION_MODEL.md` - Revenue distribution details
- `docs/FEATURES_AND_IMPROVEMENTS.md` - This file
- `README.md` - Main project documentation

---

## ✅ Verification Checklist

- [x] All dependencies installed
- [x] Backend syntax checks pass
- [x] Frontend TypeScript checks pass
- [x] Database schemas created
- [x] API endpoints registered
- [x] Frontend components created
- [x] Documentation updated

---

## 🚀 Next Steps

1. **Run Database Migrations**
   ```bash
   cd backend
   node scripts/migrate-pricing-fields.js
   ```

2. **Start Services**
   ```bash
   # Backend
   cd backend && npm start
   
   # Frontend
   cd frontend && npm run dev
   ```

3. **Test Features**
   - Create a dataset (verify auto-pricing)
   - Test patient preferences
   - Request temporary hospital access
   - Verify revenue distribution

---

## 📞 Support

For issues or questions, please refer to:
- API Documentation: http://localhost:3002/api-docs
- Main README: `README.md`
- Revenue Model: `docs/REVENUE_DISTRIBUTION_MODEL.md`

