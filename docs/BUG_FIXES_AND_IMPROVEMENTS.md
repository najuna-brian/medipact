# Bug Fixes and Improvements

## Overview

This document tracks critical bug fixes and improvements made to the hospital verification and patient registration system.

## Recent Fixes (Latest Session)

### 1. Field Name Mismatch Bug Fix ✅ FIXED

**Issue**: Hospital verification status was not updating after admin approval.

**Root Cause**: 
- `getVerificationStatus()` and `isHospitalVerified()` were using snake_case field names (`verification_status`, `verified_at`, `verified_by`)
- But `getHospital()` returns camelCase field names (`verificationStatus`, `verifiedAt`, `verifiedBy`) due to SQL aliases
- This caused the status to always return `'pending'` even after approval

**Fix Applied**:
- Updated `getVerificationStatus()` to use camelCase field names
- Updated `isHospitalVerified()` to use camelCase field names
- Simplified code by removing unnecessary snake_case fallback (database always returns camelCase via SQL aliases)

**Files Changed**:
- `backend/src/services/hospital-verification-service.js`

**Impact**: Hospital verification status now correctly updates after admin approval.

---

### 2. API Key Storage Bug ✅ FIXED

**Issue**: Hospitals could not authenticate after registration (401 Unauthorized).

**Root Cause**: 
- API key was not being passed to `createHospital()` during registration
- Database stored `NULL` for `api_key_hash`
- Subsequent authentication attempts failed

**Fix Applied**:
- Modified `hospital-registry-service.js` to include `apiKey` in `hospitalRecord` before calling `hospitalCreate`
- Ensured API key is properly hashed and stored in database

**Files Changed**:
- `backend/src/services/hospital-registry-service.js`
- `backend/src/routes/hospital-api.js`

**Impact**: Hospitals can now authenticate immediately after registration.

---

### 3. Cache Invalidation Improvements ✅ IMPROVED

**Issue**: Hospital dashboard and verification page not updating after admin approval.

**Root Cause**: 
- React Query cache not being properly invalidated
- No automatic polling mechanism
- Event system only worked in same browser tab

**Fix Applied**:
- Enhanced cache invalidation in `useApproveHospital()` and `useRejectHospital()` hooks
- Added `refetchInterval: 5000` to `useVerificationStatus()` hook (polls every 5 seconds)
- Added `refetchOnWindowFocus: true` for automatic refetch on tab focus
- Implemented event system for immediate updates in same tab
- Added polling fallback (every 10 seconds) in dashboard and verification pages

**Files Changed**:
- `frontend/src/hooks/useAdminHospitals.ts`
- `frontend/src/hooks/usePatientIdentity.ts`
- `frontend/src/app/hospital/dashboard/page.tsx`
- `frontend/src/app/hospital/verification/page.tsx`

**Impact**: Status updates automatically within 5-10 seconds after admin approval.

---

### 4. Approval Confirmation Dialog ✅ ADDED

**Enhancement**: Added confirmation dialog for hospital approval to prevent accidental approvals.

**Features**:
- Pre-filled approval message (editable)
- Confirmation required before approval
- Better UX for intentional approvals

**Files Changed**:
- `frontend/src/app/admin/hospitals/page.tsx`

**Impact**: Prevents accidental approvals and allows admin notes.

---

### 5. Frontend Navigation Fixes ✅ FIXED

**Issues**:
- Buttons leading to pages not working (manual navigation worked)
- Patient registration page redirecting to login
- "Complete Verification" button not showing
- Console errors: `ReferenceError: location is not defined`, `Cannot update component while rendering`

**Fixes Applied**:
- Changed `Link` components to `Button` with `onClick` handlers using `router.push()`
- Fixed redirect logic to use `useEffect` with `isLoading` check instead of direct conditional
- Fixed conditional rendering for "Complete Verification" button
- Fixed hooks order violations (moved `useEffect` before conditional returns)

**Files Changed**:
- `frontend/src/app/hospital/dashboard/page.tsx`
- `frontend/src/app/hospital/patients/register/page.tsx`
- `frontend/src/app/hospital/patients/bulk/page.tsx`
- `frontend/src/app/hospital/verification/page.tsx`

**Impact**: All navigation and redirects work correctly.

---

### 6. Document Display Fix ✅ FIXED

**Issue**: Documents not showing in admin "View Documents" modal.

**Root Cause**: 
- Database returns snake_case field names
- Frontend expected camelCase
- JSON parsing issues with malformed data

**Fix Applied**:
- Added handling for both camelCase and snake_case in admin API routes
- Added null/undefined checks in frontend modal
- Improved JSON parsing with error handling

**Files Changed**:
- `backend/src/routes/admin-api.js`
- `frontend/src/app/admin/hospitals/page.tsx`

**Impact**: Documents now display correctly in admin interface.

---

### 7. Large File Upload Support ✅ FIXED

**Issue**: "Request entity too large" error when uploading PDFs (even small ones).

**Root Cause**: 
- Express body parser default limit too small for base64-encoded files

**Fix Applied**:
- Increased `express.json()` and `express.urlencoded()` body size limits to `'50mb'`

**Files Changed**:
- `backend/src/server.js`

**Impact**: Can now upload files up to 50MB (base64-encoded).

---

## Testing Checklist

After these fixes, verify:

- [x] Hospital registration works and API key is stored
- [x] Hospital can authenticate with API key
- [x] Verification documents can be submitted
- [x] Admin can view documents
- [x] Admin approval works with confirmation dialog
- [x] Hospital dashboard updates automatically after approval
- [x] Verification page shows correct status
- [x] Patient registration buttons are enabled after verification
- [x] Patient registration works successfully
- [x] UPI is generated correctly

## Known Issues / Future Improvements

1. **Admin Authentication**: Admin endpoints are not protected (TODO: Add proper admin auth)
2. **Email/SMS Notifications**: UPI retrieval doesn't send emails/SMS yet (TODO: Integrate email/SMS service)
3. **Rate Limiting**: No rate limiting on API endpoints (TODO: Add rate limiting)
4. **Contact Verification**: Email/phone verification not implemented (TODO: Add verification workflow)
5. **JWT Authentication**: Patient JWT authentication not implemented (TODO: Add JWT tokens)

## Related Documentation

- [Admin Hospital Verification](./ADMIN_HOSPITAL_VERIFICATION.md)
- [Hospital Verification & Patient Access Implementation](./IMPLEMENTATION_HOSPITAL_VERIFICATION_AND_PATIENT_ACCESS.md)
- [Frontend Backend Integration](./FRONTEND_BACKEND_INTEGRATION.md)

