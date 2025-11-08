# Lesson 13: Anonymization Process

## How Privacy is Protected

This lesson explains how MediPact removes personally identifiable information (PII) while preserving medical data for research.

## What is Anonymization?

**Anonymization** is the process of removing or replacing personally identifiable information (PII) so that individuals cannot be identified from the data.

### Goal

- ❌ **Remove**: Information that identifies a person
- ✅ **Preserve**: Medical data needed for research
- ✅ **Maintain**: Data quality and usefulness

## What Gets Removed?

### PII Fields (Personally Identifiable Information)

These fields are **completely removed**:

1. **Patient Name**
   - Example: "John Doe" → ❌ Removed

2. **Patient ID**
   - Example: "ID-12345" → ❌ Removed

3. **Address** (specific location details)
   - Example: "123 Main St Kampala" → ❌ Removed
   - **Note**: Country is preserved (see "What Gets Preserved")

4. **Phone Number**
   - Example: "0771234567" → ❌ Removed

5. **Date of Birth** (exact date)
   - Example: "1990-05-15" → ❌ Removed
   - **Note**: Age Range is preserved (see "What Gets Preserved")

### Why These Are Removed

- **Can identify individuals**: Name + address = identifiable
- **Legal requirement**: HIPAA, GDPR require PII protection
- **Ethical requirement**: Patients have right to privacy
- **Research doesn't need it**: Medical data is sufficient

## What Gets Preserved?

### Medical Data Fields

These fields are **preserved** for research:

1. **Lab Test Name**
   - Example: "Blood Glucose" → ✅ Preserved

2. **Test Date**
   - Example: "2024-01-15" → ✅ Preserved

3. **Test Result**
   - Example: "95" → ✅ Preserved

4. **Unit**
   - Example: "mg/dL" → ✅ Preserved

5. **Reference Range**
   - Example: "70-100" → ✅ Preserved

### Demographic Data Fields (Generalized)

These fields are **preserved in generalized form** for research:

1. **Age Range** (REQUIRED)
   - Example: Age 35 or DOB 1990-01-15 → "35-39" (5-year range)
   - **Note**: Exact age or DOB is removed, only range is kept
   - **Requirement**: Must have either Age or Date of Birth

2. **Country** (REQUIRED)
   - Example: "Kampala, Uganda" → "Uganda" (country only)
   - **Note**: Specific address/city removed, only country preserved
   - **Fallback**: Uses hospital country if patient location missing

3. **Gender** (REQUIRED)
   - Example: "Male", "Female", "Other" → ✅ Preserved as-is
   - **Default**: "Unknown" if missing

4. **Occupation Category** (OPTIONAL)
   - Example: "doctor" → "Healthcare Worker" (generalized category)
   - **Categories**: Healthcare Worker, Education Worker, Government Worker, Business Professional, Agriculture Worker, Technology Worker, Service Worker, Student, Not Employed, Other
   - **Default**: "Unknown" if missing

### Why These Are Preserved

- **Needed for research**: Medical data and demographics are valuable for analysis
- **Generalized**: Age ranges and occupation categories prevent re-identification
- **No PII**: Country-level location and age ranges don't identify individuals
- **K-Anonymity**: System ensures minimum 5 records per demographic combination
- **Useful**: Researchers need demographic context for meaningful analysis

## What Gets Added?

### Anonymous Patient ID

**Original ID**: "ID-12345"  
**Anonymous ID**: "PID-001"

**Format**: `PID-XXX` where XXX is a 3-digit number

**Examples**:
- Patient 1 → PID-001
- Patient 2 → PID-002
- Patient 3 → PID-003

### Why Anonymous IDs?

- **Link records**: Multiple tests for same patient
- **No identification**: Can't trace back to real person
- **Consistent**: Same patient always gets same ID
- **Reversible**: Hospital can map back (if needed, with authorization)

## Anonymization Process

### Step-by-Step

#### Step 1: Read Original Data

```csv
Patient Name,Patient ID,Address,Phone Number,Date of Birth,Lab Test,Test Date,Result,Unit,Reference Range
John Doe,ID-12345,"123 Main St Kampala",0771234567,1990-05-15,Blood Glucose,2024-01-15,95,mg/dL,70-100
```

#### Step 2: Group by Patient

```
Patient: ID-12345 (John Doe)
  ├── Record 1: Blood Glucose, 2024-01-15, 95 mg/dL
  └── Record 2: Cholesterol, 2024-01-20, 180 mg/dL
```

#### Step 3: Assign Anonymous ID

```
Original ID: ID-12345
Anonymous ID: PID-001
```

#### Step 4: Calculate Demographics (Before Removing PII)

```
Age: 35 → Age Range: "35-39" ✅
DOB: "1990-05-15" → Age Range: "35-39" ✅ (if age missing)
Address: "Kampala, Uganda" → Country: "Uganda" ✅
Gender: "Male" → Gender: "Male" ✅
Occupation: "doctor" → Occupation Category: "Healthcare Worker" ✅
```

#### Step 5: Remove PII

```
Before:
  Patient Name: "John Doe" ❌
  Patient ID: "ID-12345" ❌
  Address: "123 Main St" ❌ (specific location removed)
  Phone: "0771234567" ❌
  DOB: "1990-05-15" ❌ (exact date removed)
  Age: "35" ❌ (exact age removed)

After:
  (All removed, but demographics preserved in generalized form)
```

#### Step 6: Add Anonymous ID and Demographics

```
Anonymous PID: "PID-001" ✅
Age Range: "35-39" ✅
Country: "Uganda" ✅
Gender: "Male" ✅
Occupation Category: "Healthcare Worker" ✅
```

#### Step 7: Preserve Medical Data

```
Lab Test: "Blood Glucose" ✅
Test Date: "2024-01-15" ✅
Result: "95" ✅
Unit: "mg/dL" ✅
Reference Range: "70-100" ✅
```

#### Step 8: Enforce K-Anonymity

```
Group records by: Country, Age Range, Gender, Occupation Category
Ensure each group has ≥5 records
Suppress groups with <5 records (privacy protection)
```

#### Step 9: Output Anonymized Record

```csv
Anonymous PID,Age Range,Country,Gender,Occupation Category,Lab Test,Test Date,Result,Unit,Reference Range
PID-001,35-39,Uganda,Male,Healthcare Worker,Blood Glucose,2024-01-15,95,mg/dL,70-100
```

## Example: Complete Transformation

### Before Anonymization

```csv
Patient Name,Patient ID,Address,Phone Number,Date of Birth,Lab Test,Test Date,Result,Unit,Reference Range
John Doe,ID-12345,"123 Main St Kampala",0771234567,1990-05-15,Blood Glucose,2024-01-15,95,mg/dL,70-100
John Doe,ID-12345,"123 Main St Kampala",0771234567,1990-05-15,Cholesterol,2024-01-20,180,mg/dL,<200
Jane Smith,ID-12346,"456 Oak Ave Entebbe",0772345678,1985-08-22,Blood Glucose,2024-01-15,110,mg/dL,70-100
```

### After Anonymization

```csv
Anonymous PID,Age Range,Country,Gender,Occupation Category,Lab Test,Test Date,Result,Unit,Reference Range
PID-001,35-39,Uganda,Male,Healthcare Worker,Blood Glucose,2024-01-15,95,mg/dL,70-100
PID-001,35-39,Uganda,Male,Healthcare Worker,Cholesterol,2024-01-20,180,mg/dL,<200
PID-002,40-44,Uganda,Female,Education Worker,Blood Glucose,2024-01-15,110,mg/dL,70-100
```

### What Changed?

✅ **Preserved**:
- Lab test names
- Test dates
- Results
- Units
- Reference ranges
- Record relationships (same patient = same PID)
- **Demographics (generalized)**:
  - Age Range (5-year ranges, e.g., "35-39")
  - Country (country-level only)
  - Gender (Male/Female/Other/Unknown)
  - Occupation Category (generalized categories)

❌ **Removed**:
- Patient names
- Patient IDs
- Specific addresses (city, street)
- Phone numbers
- Exact dates of birth
- Exact age (replaced with age range)

✅ **Added**:
- Anonymous patient IDs (PID-001, PID-002)
- Age Range (generalized to 5-year ranges)
- Country (extracted from address or hospital fallback)
- Gender (normalized)
- Occupation Category (generalized)

## Patient Mapping

### Why Mapping is Needed

The system maintains a mapping:

```
Original ID → Anonymous ID
ID-12345 → PID-001
ID-12346 → PID-002
ID-12347 → PID-003
```

### Uses of Mapping

1. **Consent Tracking**: Link consent to original patient
2. **Payment Distribution**: Pay the right patient
3. **Audit Trail**: Track data usage
4. **Reversibility**: Map back if needed (with authorization)

### Mapping Storage

- **In memory**: During processing
- **Not in output**: Mapping not included in anonymized data
- **Secure**: Only accessible to authorized systems

## FHIR Anonymization

### Patient Resource

**Before**:
```json
{
  "resourceType": "Patient",
  "id": "ID-12345",
  "name": [{"text": "John Doe"}],
  "identifier": [{"value": "ID-12345"}],
  "address": [{"text": "123 Main St"}],
  "telecom": [{"system": "phone", "value": "0771234567"}],
  "birthDate": "1990-05-15"
}
```

**After**:
```json
{
  "resourceType": "Patient",
  "id": "PID-001",
  "identifier": [{
    "system": "urn:medipact:anonymous",
    "value": "PID-001"
  }]
}
```

### Observation Resource

**Before**:
```json
{
  "resourceType": "Observation",
  "subject": {"reference": "Patient/ID-12345"},
  "code": {"coding": [{"display": "Blood Glucose"}]},
  "valueQuantity": {"value": 95, "unit": "mg/dL"}
}
```

**After**:
```json
{
  "resourceType": "Observation",
  "subject": {"reference": "Patient/PID-001"},
  "code": {"coding": [{"display": "Blood Glucose"}]},
  "valueQuantity": {"value": 95, "unit": "mg/dL"}
}
```

## Demographic Data Handling

### Age Range Calculation

**Requirements**:
- Must have either **Age** OR **Date of Birth** (one is required)
- If both missing → Error (age is required)
- Always converted to 5-year ranges

**Examples**:
- Age: 35 → Range: "35-39"
- DOB: 1990-01-15 → Calculate age → Range: "35-39"
- Age: 0 → Range: "<1"
- Age: 90+ → Range: "90+"

### Country Extraction

**Requirements**:
- Country is **always known** (required)
- Extracted from patient address if available
- Uses hospital country as fallback if address missing
- Hospital country must be configured (HOSPITAL_COUNTRY env variable)

**Examples**:
- Address: "Kampala, Uganda" → Country: "Uganda"
- Address: "Unknown" → Country: "Uganda" (hospital fallback)
- Address: Missing → Country: "Uganda" (hospital fallback)

### Gender Normalization

**Requirements**:
- Gender is **always known** (required)
- Preserved as-is: Male, Female, Other
- Defaults to "Unknown" if missing

**Examples**:
- "Male" → "Male"
- "male" → "Male" (normalized)
- "M" → "Male" (normalized)
- Missing → "Unknown"

### Occupation Generalization

**Requirements**:
- Occupation is **optional**
- Generalized to categories if provided
- Defaults to "Unknown" if missing

**Categories**:
- Healthcare Worker (doctor, nurse, medical)
- Education Worker (teacher, professor)
- Government Worker (government, civil service)
- Business Professional (business, entrepreneur)
- Agriculture Worker (farmer, agriculture)
- Technology Worker (tech, engineer, developer)
- Service Worker (service, retail, sales)
- Student (student, pupil)
- Not Employed (unemployed, retired)
- Other (unrecognized occupations)

## K-Anonymity Protection

### What is K-Anonymity?

K-anonymity ensures that each record is indistinguishable from at least **k-1** other records based on demographic attributes.

**In MediPact**:
- **k = 5** (minimum 5 records per demographic group)
- Groups defined by: Country, Age Range, Gender, Occupation Category
- Records in groups with <5 records are suppressed

### Example

```
Group: Uganda, 35-39, Male, Healthcare Worker
Records: 3 records ❌ (violates k-anonymity, k=5)
Action: Suppress these 3 records

Group: Uganda, 35-39, Male, Education Worker
Records: 8 records ✅ (satisfies k-anonymity, k=5)
Action: Keep all 8 records
```

### Why K-Anonymity?

- **Prevents re-identification**: Can't identify individuals from rare combinations
- **Privacy protection**: Ensures sufficient records per demographic group
- **Research value**: Maintains data utility while protecting privacy

## Privacy Guarantees

### What We Guarantee

1. **No PII in Output**: All identifying information removed
2. **Cannot Identify Individuals**: Anonymous IDs can't be traced
3. **Medical Data Preserved**: Research value maintained
4. **Demographics Generalized**: Age ranges, country-level location, occupation categories
5. **K-Anonymity Enforced**: Minimum 5 records per demographic group
6. **No Original IDs on Blockchain**: Only anonymous IDs and hashes stored on Hedera
7. **Reversible Only with Authorization**: Mapping protected

### What We Don't Guarantee

1. **Perfect Anonymization**: Advanced techniques might re-identify
2. **Future-Proof**: New techniques may emerge
3. **100% Risk-Free**: No system is perfect

### Best Practices

- ✅ Remove all PII
- ✅ Use anonymous IDs
- ✅ Preserve medical data
- ✅ Generalize demographics (age ranges, country, occupation categories)
- ✅ Enforce k-anonymity
- ✅ Maintain data quality
- ✅ Follow regulations (HIPAA, GDPR)
- ✅ Store only hashes on blockchain (no PII)

## Validation

### How to Verify Anonymization

```bash
# Run validation script
npm run validate
```

**Checks**:
- ✅ No PII in output
- ✅ Anonymous IDs formatted correctly
- ✅ Medical data preserved
- ✅ Record count matches

### Manual Verification

1. **Check for names**: Search output for common names
2. **Check for IDs**: Look for original patient IDs
3. **Check for addresses**: Look for street addresses
4. **Check for phones**: Look for phone number patterns
5. **Verify medical data**: Ensure test results are present

## Key Takeaways

- **PII removed**: Name, ID, specific address, phone, exact DOB/age
- **Medical data preserved**: Tests, results, dates, units
- **Demographics preserved (generalized)**: Age ranges, country, gender, occupation categories
- **Anonymous IDs added**: PID-001, PID-002, etc.
- **K-Anonymity enforced**: Minimum 5 records per demographic group
- **No PII on blockchain**: Only anonymous IDs and hashes stored on Hedera
- **Mapping maintained**: For consent and payments (off-chain, encrypted)
- **Privacy protected**: Cannot identify individuals

## Next Steps

Now that you understand anonymization:

- **Next Lesson**: [HCS Integration](./14-hcs-integration.md) - How hashes are stored on blockchain

---

**Anonymization Summary:**
- Remove: PII (name, ID, address, phone, DOB)
- Preserve: Medical data (tests, results, dates)
- Add: Anonymous IDs (PID-001, PID-002)
- Result: Privacy-protected, research-ready data

