# FHIR R4 Domains Implementation Summary

## Overview

The MediPact adapter system has been updated to fully support all **10 core FHIR R4 data domains** for comprehensive medical data processing, storage, and querying.

---

## What Was Implemented

### 1. Comprehensive CSV-to-FHIR Transformer ✅

**File:** `adapter/src/transformers/csv-to-fhir-transformer.js`

A complete transformer that converts CSV records to FHIR R4 Bundle format, supporting all 10 domains:

- **Domain 1: Patient Identity & Demographics**
  - `Patient` resources
  - `Coverage` resources (insurance/payer information)
  - Demographics, contact info, extensions (nationality, occupation, marital status)

- **Domain 2: Encounters/Visits**
  - `Encounter` resources
  - Encounter types, classes, status, periods, locations, reasons

- **Domain 3: Diagnoses & Clinical Problems**
  - `Condition` resources (diagnoses)
  - `AllergyIntolerance` resources
  - ICD-10, SNOMED CT codes, severity, body sites

- **Domain 4: Laboratory Tests & Measurements**
  - `Observation` resources (lab tests)
  - LOINC, SNOMED CT codes, values, units, reference ranges, interpretations

- **Domain 5: Medications & Treatment**
  - `MedicationRequest` resources
  - RxNorm, ATC codes, dosage instructions, status

- **Domain 6: Procedures & Interventions**
  - `Procedure` resources
  - CPT, SNOMED CT, ICD-10-PCS codes, body sites, outcomes

- **Domain 7: Medical Imaging**
  - `ImagingStudy` resources
  - DICOM modalities (CT, MRI, X-ray, Ultrasound, PET), series counts

- **Domain 8: Vitals & Clinical Measurements**
  - `Observation` resources (vital signs category)
  - Blood pressure, heart rate, temperature, respiratory rate, O2 saturation, weight, height, BMI

- **Domain 9: Social Determinants of Health**
  - `Observation` resources (social history category)
  - Housing, food security, transportation, utilities, safety, education, employment, income, insurance, social support

- **Domain 10: Metadata & Audit**
  - `Provenance` and `AuditEvent` resources (handled automatically during processing)

### 2. Updated CSV Adapter ✅

**File:** `adapter/src/index.js`

The CSV adapter now:
- Converts CSV to FHIR Bundle using the comprehensive transformer
- Processes all FHIR resource types through the resource handler
- Stores all resource types to the backend database
- Creates consent and provenance proofs for all resources
- Maintains backward compatibility with legacy CSV format

### 3. Comprehensive CSV Template ✅

**File:** `adapter/FHIR_CSV_TEMPLATE.md`

A complete CSV template document that includes:
- All column names for all 10 FHIR domains
- Field descriptions, examples, and FHIR resource mappings
- Minimal template for quick start
- Complete examples with multiple domains
- Code system references (ICD-10, SNOMED CT, LOINC, RxNorm, CPT)
- Processing flow documentation

### 4. Enhanced Query Service ✅

**File:** `backend/src/services/query-service.js`

The query service now supports:
- **Resource type filtering**: Filter by specific FHIR resource types
- **Medication filters**: `medicationCode`, `medicationName` (Domain 5)
- **Procedure filters**: `procedureCode`, `procedureName` (Domain 6)
- **Encounter filters**: `encounterType`, `encounterClass` (Domain 2)
- All existing filters (country, date, condition, observation, demographics)

### 5. Updated Marketplace API ✅

**File:** `backend/src/routes/marketplace-api.js`

The marketplace API now supports:
- Querying across all FHIR resource types
- Filtering by resource type
- Domain-specific filters (medications, procedures, encounters)
- Updated Swagger documentation for all filter options

### 6. Database Storage ✅

**File:** `backend/src/routes/fhir-storage-api.js`

All storage endpoints exist for all FHIR resource types:
- `Patient`, `Encounter`, `Condition`, `Observation`
- `MedicationRequest`, `MedicationAdministration`, `MedicationStatement`
- `Procedure`, `DiagnosticReport`, `ImagingStudy`, `Specimen`
- `AllergyIntolerance`, `Immunization`, `CarePlan`, `CareTeam`
- `Device`, `Organization`, `Practitioner`, `Location`, `Coverage`
- `Provenance`, `AuditEvent`

---

## How It Works

### CSV Upload Flow

1. **CSV File Upload** → CSV file is read and parsed
2. **FHIR Conversion** → CSV records converted to FHIR Bundle (all 10 domains)
3. **Resource Processing** → Each FHIR resource is:
   - Anonymized (Stage 1: Storage)
   - Linked to anonymous patient ID
   - Prepared for storage
4. **Backend Storage** → All FHIR resources stored in database
5. **Consent Proofs** → Consent proofs created per patient
6. **Chain Anonymization** → Further anonymization (Stage 2: Chain)
7. **Provenance Proofs** → Provenance records created per resource
8. **Output** → Anonymized CSV (legacy) + FHIR resources in database

### Query Flow

1. **Researcher Query** → Researcher submits query with filters
2. **Filter Validation** → Filters validated (country, date, resource type, domain-specific)
3. **Database Query** → Query executed across all FHIR resource types
4. **Consent Validation** → Only resources with active consent included
5. **Patient Preferences** → Results filtered by patient preferences
6. **Results Returned** → Anonymized FHIR resources returned
7. **Audit Logging** → Query logged to HCS for audit trail

---

## CSV Column Mapping

### Domain 1: Patient Identity & Demographics

| CSV Column | FHIR Resource | FHIR Field |
|------------|---------------|------------|
| Patient ID | Patient | identifier |
| Patient Name | Patient | name |
| Date of Birth | Patient | birthDate |
| Gender | Patient | gender |
| Address | Patient | address |
| Phone Number | Patient | telecom |
| Email | Patient | telecom |
| Occupation | Patient | extension (occupation) |
| Country | Patient | extension (nationality) |
| Coverage ID | Coverage | identifier |
| Insurance Type | Coverage | type |

### Domain 2: Encounters

| CSV Column | FHIR Resource | FHIR Field |
|------------|---------------|------------|
| Encounter ID | Encounter | id |
| Encounter Date | Encounter | period.start |
| Encounter Type | Encounter | type |
| Encounter Class | Encounter | class |
| Admission Date | Encounter | period.start |
| Discharge Date | Encounter | period.end |
| Department | Encounter | location |

### Domain 3: Diagnoses

| CSV Column | FHIR Resource | FHIR Field |
|------------|---------------|------------|
| Condition Code ICD10 | Condition | code.coding (ICD-10) |
| Condition Code SNOMED | Condition | code.coding (SNOMED) |
| Condition Name | Condition | code.text |
| Diagnosis Date | Condition | onsetDateTime |
| Severity | Condition | severity |
| Allergy Substance | AllergyIntolerance | code |
| Allergy Reaction | AllergyIntolerance | reaction.manifestation |

### Domain 4: Lab Tests

| CSV Column | FHIR Resource | FHIR Field |
|------------|---------------|------------|
| Observation Code LOINC | Observation | code.coding (LOINC) |
| Observation Name | Observation | code.text |
| Observation Date | Observation | effectiveDateTime |
| Observation Value | Observation | valueQuantity |
| Observation Unit | Observation | valueQuantity.unit |
| Reference Range Low | Observation | referenceRange.low |
| Reference Range High | Observation | referenceRange.high |

### Domain 5: Medications

| CSV Column | FHIR Resource | FHIR Field |
|------------|---------------|------------|
| Medication Code RxNorm | MedicationRequest | medicationCodeableConcept.coding (RxNorm) |
| Medication Name | MedicationRequest | medicationCodeableConcept.text |
| Prescription Date | MedicationRequest | authoredOn |
| Medication Dosage | MedicationRequest | dosageInstruction |

### Domain 6: Procedures

| CSV Column | FHIR Resource | FHIR Field |
|------------|---------------|------------|
| Procedure Code CPT | Procedure | code.coding (CPT) |
| Procedure Code SNOMED | Procedure | code.coding (SNOMED) |
| Procedure Name | Procedure | code.text |
| Procedure Date | Procedure | performedDateTime |

### Domain 7: Imaging

| CSV Column | FHIR Resource | FHIR Field |
|------------|---------------|------------|
| Imaging Modality | ImagingStudy | modality |
| Imaging Date | ImagingStudy | started |
| Series Count | ImagingStudy | numberOfSeries |

### Domain 8: Vitals

| CSV Column | FHIR Resource | FHIR Field |
|------------|---------------|------------|
| Vital Sign Type | Observation | code (vital signs category) |
| Vital Sign Value | Observation | valueQuantity |
| Vital Sign Unit | Observation | valueQuantity.unit |

### Domain 9: SDOH

| CSV Column | FHIR Resource | FHIR Field |
|------------|---------------|------------|
| SDOH Category | Observation | code (social history category) |
| SDOH Value | Observation | valueString |

---

## Testing

### Minimal Test CSV

```csv
Patient ID,Patient Name,Date of Birth,Gender,Lab Test,Test Date,Result,Unit,Reference Range
PAT-001,John Doe,1990-05-15,Male,Blood Glucose,2024-01-15,95,mg/dL,70-100
PAT-002,Jane Smith,1985-08-22,Female,Blood Glucose,2024-01-15,110,mg/dL,70-100
```

This creates:
- 2 `Patient` resources (Domain 1)
- 2 `Observation` resources (Domain 4)

### Complete Test CSV

See `adapter/FHIR_CSV_TEMPLATE.md` for a complete example with all 10 domains.

---

## Database Schema

All FHIR resource types are stored in separate tables:
- `fhir_patients`
- `fhir_encounters`
- `fhir_conditions`
- `fhir_observations`
- `fhir_medication_requests`
- `fhir_procedures`
- `fhir_imaging_studies`
- `fhir_allergies`
- `fhir_coverage`
- ... (and more)

Each table links to `anonymous_patient_id` and `upi` for patient matching.

---

## Query Examples

### Query by Resource Type

```json
{
  "resourceType": "MedicationRequest",
  "country": "Uganda",
  "startDate": "2024-01-01",
  "endDate": "2024-12-31"
}
```

### Query by Medication

```json
{
  "medicationCode": "6809-2058",
  "medicationName": "Metformin",
  "country": "Uganda"
}
```

### Query by Procedure

```json
{
  "procedureCode": "99213",
  "procedureName": "Office Visit",
  "country": "Uganda"
}
```

### Query by Encounter Type

```json
{
  "encounterType": "consultation",
  "encounterClass": "AMB",
  "country": "Uganda"
}
```

---

## Benefits

1. **Comprehensive Data Coverage**: All 10 FHIR domains supported
2. **Standards Compliance**: Full FHIR R4 compliance
3. **Flexible Querying**: Query across any domain or resource type
4. **Backward Compatible**: Legacy CSV format still supported
5. **Extensible**: Easy to add new resource types or fields
6. **Well Documented**: Complete CSV template and examples

---

## Next Steps

1. **Test CSV Upload**: Upload a CSV file with all 10 domains
2. **Verify Storage**: Check that all resource types are stored correctly
3. **Test Queries**: Query by different resource types and domains
4. **Verify HashScan**: Check consent and provenance proofs on HashScan
5. **Dataset Creation**: Create datasets filtering by specific domains

---

## References

- FHIR R4 Specification: https://www.hl7.org/fhir/
- CSV Template: `adapter/FHIR_CSV_TEMPLATE.md`
- Transformer Code: `adapter/src/transformers/csv-to-fhir-transformer.js`
- Adapter Code: `adapter/src/index.js`

