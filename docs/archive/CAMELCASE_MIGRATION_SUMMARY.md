# FHIR Schema Migration: snake_case → camelCase

## Summary

All FHIR database tables have been converted from `snake_case` column names to `camelCase` with quoted identifiers for PostgreSQL.

## Changes Made

### 1. Schema Definitions (`backend/src/models/fhir-complete-schema.js`)
- ✅ All column names converted to camelCase
- ✅ All column references quoted (e.g., `"anonymousPatientId"`, `"hospitalId"`)
- ✅ All indexes updated to use camelCase
- ✅ All foreign keys updated to use camelCase

### 2. Storage API (`backend/src/routes/fhir-storage-api.js`)
- ✅ Removed `convertToSnakeCase` function
- ✅ Now uses camelCase column names directly with quotes
- ✅ Updated conflict clauses to use camelCase
- ✅ Updated both PostgreSQL and SQLite storage functions

### 3. Database Queries
- ✅ Updated `consent-db.js` - dashboard stats queries
- ✅ Updated `hospital-patients-api.js` - patient listing queries
- ⚠️  **Still need to update**: `fhir-db.js` - query functions (many queries)

## Migration Script

A migration script is available at:
```
backend/scripts/migrate-fhir-to-camelcase.js
```

**WARNING**: This script will DROP all FHIR tables and recreate them. Only run if tables are empty or you have a backup!

To run:
```bash
cd backend
node scripts/migrate-fhir-to-camelcase.js
```

## Remaining Work

### High Priority
1. Update all queries in `backend/src/db/fhir-db.js`:
   - `queryFHIRResources()` - JOIN conditions
   - `countFHIRPatients()` - WHERE clauses
   - `getPatientsWithHospitals()` - SELECT and JOIN clauses
   - All other query functions

2. Update queries in `backend/src/db/database.js`:
   - `createPostgreSQLTables()` - old table creation (can be removed if using schema)
   - `createSQLiteTables()` - old table creation

### Medium Priority
3. Search for other SQL queries that reference FHIR columns:
   ```bash
   grep -r "anonymous_patient_id\|hospital_id\|created_at" backend/src/
   ```

4. Update any frontend code that expects snake_case (if any)

## Column Name Mapping

| Old (snake_case) | New (camelCase) |
|------------------|-----------------|
| `anonymous_patient_id` | `"anonymousPatientId"` |
| `hospital_id` | `"hospitalId"` |
| `created_at` | `"createdAt"` |
| `updated_at` | `"updatedAt"` |
| `age_range` | `"ageRange"` |
| `encounter_id` | `"encounterId"` |
| `condition_code_icd10` | `"conditionCodeIcd10"` |
| `observation_code_loinc` | `"observationCodeLoinc"` |
| ... | ... |

## Testing

After migration:
1. Run the migration script (if tables exist)
2. Test CSV upload
3. Verify dashboard stats display correctly
4. Check that all FHIR resources are stored correctly

## Notes

- PostgreSQL requires quoted identifiers for camelCase: `"columnName"`
- SQLite is case-insensitive for unquoted identifiers, but we quote for consistency
- The `upi` column remains unquoted (lowercase, no underscores)
- Table names remain snake_case (e.g., `fhir_patients`)

