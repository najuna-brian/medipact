# Storage Issue Diagnosis & Fix

## Problem Identified

The CSV upload was failing silently because:
1. **Missing FHIR Tables**: Only 3 basic FHIR tables exist (`fhir_patients`, `fhir_conditions`, `fhir_observations`) from initial database setup
2. **Silent Failures**: Storage API was catching errors but returning `success: true` even when `created: 0`
3. **No Table Existence Check**: Storage API attempted INSERTs into non-existent tables, causing PostgreSQL errors that were logged but not properly surfaced

## Root Cause

The complete FHIR schema migration (`POST /api/admin/migrate/fhir`) creates 25+ FHIR tables, but this migration hasn't been run on Railway's PostgreSQL database. The adapter tries to store to tables like:
- `fhir_encounters`
- `fhir_medication_requests`
- `fhir_procedures`
- `fhir_imaging_studies`
- `fhir_allergies`
- `fhir_coverage`
- etc.

These tables don't exist, causing all storage attempts to fail.

## Solution Implemented

### 1. Table Existence Check
- Added `tableExists()` function to check if a table exists before attempting to store
- Returns clear error message if table is missing, with instructions to run migration

### 2. Better Error Handling
- Storage API now returns `success: false` when tables are missing
- Errors include helpful hints: "Run POST /api/admin/migrate/fhir"
- Adapter now detects table-missing errors and logs them clearly

### 3. Improved Logging
- Storage API logs table existence checks
- Adapter logs table-missing errors with migration hints
- All errors now include full context (table name, error type, etc.)

## Next Steps

1. **Run FHIR Migration on Railway**:
   ```bash
   curl -X POST https://medipact-production.up.railway.app/api/admin/migrate/fhir \
     -H "Content-Type: application/json"
   ```
   Or use the admin panel if available.

2. **Verify Tables Created**:
   - Check Railway logs for migration success
   - Should see: `tablesCreated: 25+`, `errors: 0`

3. **Retry CSV Upload**:
   - After migration, CSV uploads should succeed
   - Storage API will now properly store to all FHIR tables

## Files Changed

- `backend/src/routes/fhir-storage-api.js`: Added table existence check and better error handling
- `backend/adapter/src/storage/fhir-storage.js`: Improved error detection and logging for table-missing errors

## Database Status

**Current State**: Only basic FHIR tables exist (3 tables)
**Required State**: Complete FHIR schema (25+ tables) via migration

**Action Required**: Run `POST /api/admin/migrate/fhir` on Railway to create all FHIR tables.

