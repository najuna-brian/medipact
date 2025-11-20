# Comprehensive CSV Template - All 10 FHIR R4 Domains

This document provides a complete CSV template aligned with all 10 FHIR R4 domains for data upload to MediPact.

## Overview

The CSV template supports all 10 core FHIR R4 data domains:
1. **Patient Identity & Demographics** (Patient, RelatedPerson, Coverage)
2. **Encounters/Visits** (Encounter)
3. **Diagnoses & Clinical Problems** (Condition, AllergyIntolerance)
4. **Laboratory Tests & Measurements** (Observation, DiagnosticReport, Specimen)
5. **Medications & Treatment** (MedicationRequest, MedicationAdministration, MedicationStatement)
6. **Procedures & Interventions** (Procedure)
7. **Medical Imaging** (ImagingStudy)
8. **Vitals & Clinical Measurements** (Observation - Vital Signs)
9. **Social Determinants of Health** (SDOH Observations)
10. **Metadata & Audit** (Provenance, AuditEvent - handled automatically)

---

## CSV Column Reference

### Domain 1: Patient Identity & Demographics

| Column Name | Required | Description | Example | FHIR Resource |
|-------------|----------|-------------|---------|---------------|
| **Patient ID** | ✅ Yes | Unique patient identifier in hospital system | `PAT-001` | Patient.identifier |
| **Patient Name** | ✅ Yes | Full patient name | `John Doe` | Patient.name |
| **Date of Birth** | ✅ Yes* | Date of birth (YYYY-MM-DD) | `1990-05-15` | Patient.birthDate |
| **Age** | ✅ Yes* | Age in years (alternative to DOB) | `34` | Calculated |
| **Gender** | ✅ Yes | Gender (Male/Female/Other/M/F) | `Male` | Patient.gender |
| **Sex** | Optional | Alternative gender field | `M` | Patient.gender |
| **Address** | Optional | Full address | `123 Main St, Kampala` | Patient.address |
| **City** | Optional | City name | `Kampala` | Patient.address.city |
| **Country** | Optional | Country name | `Uganda` | Patient.extension (nationality) |
| **Phone Number** | Optional | Phone number | `0771234567` | Patient.telecom |
| **Email** | Optional | Email address | `john@example.com` | Patient.telecom |
| **Occupation** | Optional | Job title/occupation | `Doctor` | Patient.extension (occupation) |
| **Job** | Optional | Alternative occupation field | `Physician` | Patient.extension (occupation) |
| **Marital Status** | Optional | Marital status | `Married` | Patient.extension (maritalStatus) |
| **Race** | Optional | Race/ethnicity | `African` | Patient.extension |
| **Language** | Optional | Primary language | `English` | Patient.communication |
| **Coverage ID** | Optional | Insurance/coverage ID | `INS-001` | Coverage.identifier |
| **Insurance Type** | Optional | Type of insurance | `Private` | Coverage.type |
| **Coverage Status** | Optional | Coverage status | `active` | Coverage.status |
| **Coverage Start** | Optional | Coverage start date | `2020-01-01` | Coverage.period.start |
| **Coverage End** | Optional | Coverage end date | `2024-12-31` | Coverage.period.end |
| **Payor Name** | Optional | Insurance company name | `ABC Insurance` | Coverage.payor |

*Either Date of Birth OR Age is required

### Domain 2: Encounters/Visits

| Column Name | Required | Description | Example | FHIR Resource |
|-------------|----------|-------------|---------|---------------|
| **Encounter ID** | Optional | Unique encounter identifier | `ENC-001` | Encounter.id |
| **Encounter Date** | Optional | Encounter/visit date | `2024-01-15` | Encounter.period.start |
| **Encounter Type** | Optional | Type of encounter | `consultation` | Encounter.type |
| **Encounter Type Code** | Optional | SNOMED code for encounter type | `390906007` | Encounter.type.coding |
| **Encounter Class** | Optional | Encounter class | `outpatient` | Encounter.class |
| **Encounter Status** | Optional | Encounter status | `finished` | Encounter.status |
| **Admission Date** | Optional | Admission date (for inpatient) | `2024-01-15` | Encounter.period.start |
| **Discharge Date** | Optional | Discharge date | `2024-01-16` | Encounter.period.end |
| **Department** | Optional | Department name | `Cardiology` | Encounter.location |
| **Department Code** | Optional | Department code | `CARD` | Encounter.location |
| **Encounter Reason** | Optional | Reason for encounter | `Chest pain` | Encounter.reasonCode |
| **Encounter Reason Code** | Optional | SNOMED/ICD-10 code for reason | `29857009` | Encounter.reasonCode.coding |

### Domain 3: Diagnoses & Clinical Problems

| Column Name | Required | Description | Example | FHIR Resource |
|-------------|----------|-------------|---------|---------------|
| **Condition Code ICD10** | Optional | ICD-10 diagnosis code | `E11` | Condition.code (ICD-10) |
| **Condition Code SNOMED** | Optional | SNOMED CT diagnosis code | `73211009` | Condition.code (SNOMED) |
| **Condition Name** | Optional | Diagnosis name | `Diabetes Type 2` | Condition.code.text |
| **Diagnosis Date** | Optional | Date of diagnosis | `2023-06-10` | Condition.onsetDateTime |
| **Onset Date** | Optional | Condition onset date | `2023-01-01` | Condition.onsetDateTime |
| **Abatement Date** | Optional | Condition resolution date | `2024-01-01` | Condition.abatementDateTime |
| **Resolution Date** | Optional | Alternative resolution date | `2024-01-01` | Condition.abatementDateTime |
| **Condition Status** | Optional | Condition status | `active` | Condition.status |
| **Condition Category** | Optional | Category (problem-list-item, encounter-diagnosis) | `encounter-diagnosis` | Condition.category |
| **Severity** | Optional | Condition severity | `moderate` | Condition.severity |
| **Condition Severity** | Optional | Alternative severity field | `severe` | Condition.severity |
| **Body Site** | Optional | Body site of condition | `Left arm` | Condition.bodySite |
| **Body Site Code** | Optional | SNOMED body site code | `368208006` | Condition.bodySite.coding |
| **Allergy Substance** | Optional | Allergen/substance name | `Penicillin` | AllergyIntolerance.code |
| **Allergy Substance Code** | Optional | SNOMED/RxNorm code | `7980` | AllergyIntolerance.code.coding |
| **Allergy Reaction** | Optional | Allergic reaction | `Rash` | AllergyIntolerance.reaction.manifestation |
| **Allergy Category** | Optional | Allergy category | `medication` | AllergyIntolerance.category |
| **Allergy Criticality** | Optional | Allergy criticality | `high` | AllergyIntolerance.criticality |
| **Allergy Onset Date** | Optional | Allergy onset date | `2020-01-01` | AllergyIntolerance.onsetDateTime |

### Domain 4: Laboratory Tests & Measurements

| Column Name | Required | Description | Example | FHIR Resource |
|-------------|----------|-------------|---------|---------------|
| **Lab Test** | Optional | Lab test name (legacy) | `Blood Glucose` | Observation.code.text |
| **Observation Code LOINC** | Optional | LOINC code for test | `4548-4` | Observation.code.coding (LOINC) |
| **Observation Code SNOMED** | Optional | SNOMED code for test | `33747003` | Observation.code.coding (SNOMED) |
| **Observation Name** | Optional | Observation/test name | `HbA1c` | Observation.code.text |
| **Observation Category** | Optional | Category (laboratory, imaging, etc.) | `laboratory` | Observation.category |
| **Test Date** | Optional | Test date (legacy) | `2024-01-15` | Observation.effectiveDateTime |
| **Observation Date** | Optional | Observation date | `2024-01-15` | Observation.effectiveDateTime |
| **Result** | Optional | Test result (legacy) | `95` | Observation.valueQuantity |
| **Observation Value** | Optional | Observation value | `95` | Observation.valueQuantity |
| **Unit** | Optional | Measurement unit (legacy) | `mg/dL` | Observation.valueQuantity.unit |
| **Observation Unit** | Optional | Observation unit | `mg/dL` | Observation.valueQuantity.unit |
| **Reference Range** | Optional | Reference range (legacy) | `70-100` | Observation.referenceRange |
| **Reference Range Low** | Optional | Lower limit of normal | `70` | Observation.referenceRange.low |
| **Reference Range High** | Optional | Upper limit of normal | `100` | Observation.referenceRange.high |
| **Interpretation** | Optional | Result interpretation | `Normal` | Observation.interpretation |
| **Result Interpretation** | Optional | Alternative interpretation field | `High` | Observation.interpretation |

### Domain 5: Medications & Treatment

| Column Name | Required | Description | Example | FHIR Resource |
|-------------|----------|-------------|---------|---------------|
| **Medication Code RxNorm** | Optional | RxNorm medication code | `6809-2058` | MedicationRequest.medicationCodeableConcept |
| **Medication Code ATC** | Optional | ATC medication code | `A10BA02` | MedicationRequest.medicationCodeableConcept |
| **Medication Name** | Optional | Medication name | `Metformin 500mg` | MedicationRequest.medicationCodeableConcept.text |
| **Prescription Date** | Optional | Prescription date | `2024-01-10` | MedicationRequest.authoredOn |
| **Medication Date** | Optional | Alternative medication date | `2024-01-10` | MedicationRequest.authoredOn |
| **Medication Status** | Optional | Medication status | `active` | MedicationRequest.status |
| **Medication Dosage** | Optional | Dosage instructions | `500mg twice daily` | MedicationRequest.dosageInstruction |
| **Dosage** | Optional | Alternative dosage field | `500mg BID` | MedicationRequest.dosageInstruction |

### Domain 6: Procedures & Interventions

| Column Name | Required | Description | Example | FHIR Resource |
|-------------|----------|-------------|---------|---------------|
| **Procedure Code CPT** | Optional | CPT procedure code | `99213` | Procedure.code.coding (CPT) |
| **Procedure Code SNOMED** | Optional | SNOMED procedure code | `387713003` | Procedure.code.coding (SNOMED) |
| **Procedure Code ICD10PCS** | Optional | ICD-10-PCS procedure code | `0DB60ZZ` | Procedure.code.coding (ICD-10-PCS) |
| **Procedure Name** | Optional | Procedure name | `Office Visit` | Procedure.code.text |
| **Procedure Date** | Optional | Procedure date | `2024-01-15` | Procedure.performedDateTime |
| **Procedure Status** | Optional | Procedure status | `completed` | Procedure.status |
| **Procedure Body Site** | Optional | Body site of procedure | `Left knee` | Procedure.bodySite |
| **Procedure Outcome** | Optional | Procedure outcome | `Successful` | Procedure.outcome |

### Domain 7: Medical Imaging

| Column Name | Required | Description | Example | FHIR Resource |
|-------------|----------|-------------|---------|---------------|
| **Imaging Study Type** | Optional | Type of imaging study | `CT Scan` | ImagingStudy.modality |
| **Imaging Modality** | Optional | Imaging modality | `CT` | ImagingStudy.modality |
| **Imaging Date** | Optional | Imaging study date | `2024-01-20` | ImagingStudy.started |
| **Study Date** | Optional | Alternative study date | `2024-01-20` | ImagingStudy.started |
| **Series Count** | Optional | Number of series | `5` | ImagingStudy.numberOfSeries |
| **Image Count** | Optional | Number of images | `120` | ImagingStudy.numberOfSeries |

### Domain 8: Vitals & Clinical Measurements

| Column Name | Required | Description | Example | FHIR Resource |
|-------------|----------|-------------|---------|---------------|
| **Vital Sign Type** | Optional | Type of vital sign | `Blood Pressure` | Observation.code |
| **Vital Sign Value** | Optional | Vital sign value | `120/80` | Observation.valueQuantity |
| **Vital Sign Unit** | Optional | Vital sign unit | `mmHg` | Observation.valueQuantity.unit |
| **Vital Sign Date** | Optional | Vital sign date | `2024-01-15` | Observation.effectiveDateTime |

**Supported Vital Sign Types:**
- `Blood Pressure`, `BP Systolic`, `BP Diastolic`
- `Heart Rate`, `HR`
- `Temperature`, `Temp`
- `Respiratory Rate`, `RR`
- `Oxygen Saturation`, `O2 Sat`, `SpO2`
- `Weight`
- `Height`
- `BMI`

### Domain 9: Social Determinants of Health (SDOH)

| Column Name | Required | Description | Example | FHIR Resource |
|-------------|----------|-------------|---------|---------------|
| **SDOH Category** | Optional | SDOH category | `Housing` | Observation.code |
| **SDOH Value** | Optional | SDOH value/response | `Stable housing` | Observation.valueString |
| **SDOH Date** | Optional | SDOH assessment date | `2024-01-15` | Observation.effectiveDateTime |

**Supported SDOH Categories:**
- `Housing`, `Food Security`, `Transportation`
- `Utilities`, `Safety`, `Education`
- `Employment`, `Income`, `Insurance`
- `Social Support`

### Domain 10: Metadata & Audit

**Note:** Provenance and AuditEvent are automatically created during processing. No CSV columns needed.

---

## Complete CSV Template Example

```csv
Patient ID,Patient Name,Date of Birth,Gender,Address,City,Country,Phone Number,Email,Occupation,Encounter ID,Encounter Date,Encounter Type,Encounter Class,Encounter Status,Admission Date,Discharge Date,Department,Condition Code ICD10,Condition Code SNOMED,Condition Name,Diagnosis Date,Condition Status,Severity,Allergy Substance,Allergy Reaction,Observation Code LOINC,Observation Name,Observation Date,Observation Value,Observation Unit,Reference Range Low,Reference Range High,Interpretation,Medication Code RxNorm,Medication Name,Prescription Date,Medication Status,Medication Dosage,Procedure Code CPT,Procedure Name,Procedure Date,Procedure Status,Vital Sign Type,Vital Sign Value,Vital Sign Unit,Vital Sign Date,SDOH Category,SDOH Value,SDOH Date
PAT-001,John Doe,1990-05-15,Male,"123 Main St",Kampala,Uganda,0771234567,john@example.com,Doctor,ENC-001,2024-01-15,consultation,outpatient,finished,,,,E11,73211009,Diabetes Type 2,2023-06-10,active,moderate,Penicillin,Rash,4548-4,HbA1c,2024-01-15,7.2,%,4,6,High,6809-2058,Metformin 500mg,2024-01-10,active,500mg twice daily,99213,Office Visit,2024-01-15,completed,BP Systolic,120,mmHg,2024-01-15,Housing,Stable housing,2024-01-15
PAT-001,John Doe,1990-05-15,Male,"123 Main St",Kampala,Uganda,0771234567,john@example.com,Doctor,ENC-001,2024-01-15,consultation,outpatient,finished,,,,,,,,,,,2339-0,Cholesterol,2024-01-15,180,mg/dL,0,200,Normal,,,,,,,,,BP Diastolic,80,mmHg,2024-01-15,,
PAT-002,Jane Smith,1985-08-22,Female,"456 Oak Ave",Entebbe,Uganda,0772345678,jane@example.com,Teacher,ENC-002,2024-01-20,follow-up,outpatient,finished,,,,I10,38341003,Hypertension,2022-03-15,active,moderate,,,,2339-0,Cholesterol,2024-01-20,220,mg/dL,0,200,High,314076,Atorvastatin 20mg,2024-01-20,active,20mg daily,,,,,BP Systolic,140,mmHg,2024-01-20,,
PAT-002,Jane Smith,1985-08-22,Female,"456 Oak Ave",Entebbe,Uganda,0772345678,jane@example.com,Teacher,ENC-002,2024-01-20,follow-up,outpatient,finished,,,,,,,,,,,718-7,Hemoglobin,2024-01-25,14.5,g/dL,12,16,Normal,,,,,,,,,BP Diastolic,90,mmHg,2024-01-20,,
```

---

## Minimal CSV Template (Quick Start)

For basic testing, you only need these columns:

```csv
Patient ID,Patient Name,Date of Birth,Gender,Lab Test,Test Date,Result,Unit,Reference Range
PAT-001,John Doe,1990-05-15,Male,Blood Glucose,2024-01-15,95,mg/dL,70-100
PAT-002,Jane Smith,1985-08-22,Female,Blood Glucose,2024-01-15,110,mg/dL,70-100
PAT-003,Musa Kato,1992-03-10,Male,Blood Glucose,2024-01-15,88,mg/dL,70-100
```

This minimal template will create:
- **Patient** resources (Domain 1)
- **Observation** resources (Domain 4) for lab tests

---

## Field Mapping Notes

### Multiple Records Per Patient
- Each CSV row can represent a different resource (encounter, condition, observation, medication, etc.)
- The same **Patient ID** links all resources to the same patient
- Multiple rows with the same Patient ID are allowed and will be grouped

### Optional Fields
- Most fields are optional except: **Patient ID**, **Patient Name**, **Date of Birth** (or **Age**), **Gender**
- Empty cells are allowed - the system will skip missing fields

### Date Formats
- All dates should be in `YYYY-MM-DD` format
- Examples: `2024-01-15`, `1990-05-15`

### Code Systems
- **ICD-10**: Use standard ICD-10 codes (e.g., `E11`, `I10`)
- **SNOMED CT**: Use SNOMED CT codes (e.g., `73211009`, `38341003`)
- **LOINC**: Use LOINC codes for lab tests (e.g., `4548-4`, `2339-0`)
- **RxNorm**: Use RxNorm codes for medications (e.g., `6809-2058`)
- **CPT**: Use CPT codes for procedures (e.g., `99213`)

### Legacy Field Support
- The system supports both new FHIR-aligned fields and legacy fields:
  - `Lab Test` → `Observation Name`
  - `Test Date` → `Observation Date`
  - `Result` → `Observation Value`
  - `Unit` → `Observation Unit`
  - `Reference Range` → `Reference Range Low` + `Reference Range High`

---

## Processing Flow

1. **CSV Upload** → CSV file is read and parsed
2. **FHIR Conversion** → CSV records converted to FHIR Bundle (all 10 domains)
3. **Anonymization** → FHIR resources anonymized (Stage 1: Storage)
4. **Storage** → Anonymized FHIR resources stored in database
5. **Consent Proofs** → Consent proofs created and submitted to Hedera HCS
6. **Chain Anonymization** → Further anonymization (Stage 2: Chain)
7. **Provenance Proofs** → Provenance records created and submitted to Hedera HCS
8. **Output** → Anonymized CSV (legacy) + FHIR resources in database

---

## Example: Complete Patient Record

Here's an example of a complete patient record across multiple CSV rows:

```csv
Patient ID,Patient Name,Date of Birth,Gender,Address,Country,Phone Number,Occupation,Encounter ID,Encounter Date,Encounter Type,Encounter Class,Condition Code ICD10,Condition Name,Diagnosis Date,Condition Status,Observation Code LOINC,Observation Name,Observation Date,Observation Value,Observation Unit,Reference Range Low,Reference Range High,Medication Code RxNorm,Medication Name,Prescription Date,Medication Status,Procedure Code CPT,Procedure Name,Procedure Date,Vital Sign Type,Vital Sign Value,Vital Sign Unit
PAT-001,John Doe,1990-05-15,Male,"123 Main St, Kampala",Uganda,0771234567,Doctor,ENC-001,2024-01-15,consultation,outpatient,E11,Diabetes Type 2,2023-06-10,active,4548-4,HbA1c,2024-01-15,7.2,%,4,6,6809-2058,Metformin 500mg,2024-01-10,active,99213,Office Visit,2024-01-15,BP Systolic,120,mmHg
PAT-001,John Doe,1990-05-15,Male,"123 Main St, Kampala",Uganda,0771234567,Doctor,ENC-001,2024-01-15,consultation,outpatient,,,,,2339-0,Cholesterol,2024-01-15,180,mg/dL,0,200,,,,,,,BP Diastolic,80,mmHg
PAT-001,John Doe,1990-05-15,Male,"123 Main St, Kampala",Uganda,0771234567,Doctor,ENC-001,2024-01-15,consultation,outpatient,,,,,718-7,Hemoglobin,2024-01-25,14.5,g/dL,12,16,,,,,,,,
```

This creates:
- 1 **Patient** resource
- 1 **Encounter** resource
- 1 **Condition** resource (Diabetes)
- 3 **Observation** resources (HbA1c, Cholesterol, Hemoglobin)
- 1 **MedicationRequest** resource (Metformin)
- 1 **Procedure** resource (Office Visit)
- 2 **Observation** resources (Vital Signs: BP)

---

## Testing Recommendations

1. **Start Simple**: Use minimal template with just Patient + Lab Test
2. **Add Domains Gradually**: Add one domain at a time (Encounters, Conditions, Medications, etc.)
3. **Test Multiple Patients**: Include at least 5-10 patients for k-anonymity
4. **Verify Output**: Check that all FHIR resources are created and stored correctly
5. **Check HashScan**: Verify consent and provenance proofs on HashScan

---

## Support

For questions or issues with CSV formatting, refer to:
- FHIR R4 Specification: https://www.hl7.org/fhir/
- LOINC Codes: https://loinc.org/
- SNOMED CT: https://www.snomed.org/
- ICD-10: https://www.who.int/classifications/icd/en/

