# Admin Hospital Verification Interface

## Overview

The admin hospital verification interface allows platform administrators to review, approve, and reject hospital verification requests. This ensures only legitimate hospitals can register patients and access the platform.

## Features

- **View All Hospitals**: List all registered hospitals with their verification status
- **Statistics Dashboard**: Quick overview of pending/verified/rejected counts
- **Document Review**: View submitted license numbers and registration certificates
- **Approve Hospitals**: One-click approval to verify hospitals
- **Reject Hospitals**: Reject with reason for transparency
- **Real-time Updates**: Status changes reflect immediately across the platform

## Access

Navigate to `/admin/hospitals` in the frontend application.

## Workflow

### 1. Hospital Submits Verification
- Hospital registers and submits verification documents
- Status: `pending`
- Documents stored in database

### 2. Admin Reviews
- Admin navigates to `/admin/hospitals`
- Views pending hospitals in highlighted section
- Clicks "View Documents" to review:
  - License number
  - Registration certificate (PDF/image or URL)

### 3. Admin Decision

#### Approve
- Click "Approve" button
- Hospital status changes to `verified`
- Hospital can now register patients
- Hospital dashboard shows green "Verified" badge

#### Reject
- Click "Reject" button
- Enter rejection reason in dialog
- Hospital status changes to `rejected`
- Hospital can resubmit documents
- Hospital dashboard shows rejection status

## API Endpoints

### List All Hospitals
```
GET /api/admin/hospitals
```

Returns all hospitals with verification status.

### Get Hospital Details
```
GET /api/admin/hospitals/:hospitalId
```

Returns detailed hospital information including verification documents.

### Approve Hospital
```
POST /api/admin/hospitals/:hospitalId/verify
Body: { "adminId": "admin-user-id" }
```

Approves hospital verification.

### Reject Hospital
```
POST /api/admin/hospitals/:hospitalId/reject
Body: { "reason": "Rejection reason", "adminId": "admin-user-id" }
```

Rejects hospital verification with reason.

## Security Considerations

⚠️ **Current Implementation**: Admin endpoints are not protected. In production:

1. **Add Admin Authentication**: Implement proper admin authentication middleware
2. **Role-Based Access**: Only users with admin role can access these endpoints
3. **Audit Logging**: Log all approve/reject actions
4. **Rate Limiting**: Prevent abuse of admin endpoints

## Frontend Components

### Admin Hospitals Page
- **Location**: `frontend/src/app/admin/hospitals/page.tsx`
- **Hooks**: `useAdminHospitals`, `useApproveHospital`, `useRejectHospital`
- **Features**:
  - Statistics cards
  - Pending verifications section
  - All hospitals list
  - Document viewer modal
  - Approve/reject dialogs

### API Client
- **Location**: `frontend/src/lib/api/patient-identity.ts`
- **Functions**: `getAllHospitals`, `approveHospitalVerification`, `rejectHospitalVerification`

### React Hooks
- **Location**: `frontend/src/hooks/useAdminHospitals.ts`
- **Hooks**: `useAdminHospitals`, `useAdminHospitalDetail`, `useApproveHospital`, `useRejectHospital`

## Backend Implementation

### Admin API Routes
- **Location**: `backend/src/routes/admin-api.js`
- **Routes**: All admin endpoints for hospital management

### Hospital Verification Service
- **Location**: `backend/src/services/hospital-verification-service.js`
- **Functions**: `verifyHospital`, `rejectHospitalVerification`

### Database
- **Table**: `hospitals`
- **Fields**: `verification_status`, `verification_documents`, `verified_at`, `verified_by`

## Testing

### Manual Testing
1. Register a hospital
2. Submit verification documents
3. Navigate to `/admin/hospitals`
4. View documents
5. Approve hospital
6. Verify hospital dashboard updates

### API Testing
```bash
# List hospitals
curl http://localhost:3002/api/admin/hospitals

# Approve
curl -X POST http://localhost:3002/api/admin/hospitals/HOSP-XXX/verify \
  -H "Content-Type: application/json" \
  -d '{"adminId":"admin"}'

# Reject
curl -X POST http://localhost:3002/api/admin/hospitals/HOSP-XXX/reject \
  -H "Content-Type: application/json" \
  -d '{"reason":"Invalid license","adminId":"admin"}'
```

## Future Enhancements

1. **Admin Authentication**: Proper admin login and session management
2. **Email Notifications**: Notify hospitals when verified/rejected
3. **Verification History**: Track all verification attempts
4. **Bulk Actions**: Approve/reject multiple hospitals at once
5. **Document Validation**: Automatic validation of submitted documents
6. **Comments/Notes**: Admin notes on verification decisions

