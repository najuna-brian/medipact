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

3. **Address**
   - Example: "123 Main St Kampala" → ❌ Removed

4. **Phone Number**
   - Example: "0771234567" → ❌ Removed

5. **Date of Birth**
   - Example: "1990-05-15" → ❌ Removed

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

### Why These Are Preserved

- **Needed for research**: Medical data is the value
- **No PII**: Test results don't identify individuals
- **Aggregated**: Multiple records needed for analysis
- **Useful**: Researchers need this information

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

#### Step 4: Remove PII

```
Before:
  Patient Name: "John Doe" ❌
  Patient ID: "ID-12345" ❌
  Address: "123 Main St" ❌
  Phone: "0771234567" ❌
  DOB: "1990-05-15" ❌

After:
  (All removed)
```

#### Step 5: Add Anonymous ID

```
Anonymous PID: "PID-001" ✅
```

#### Step 6: Preserve Medical Data

```
Lab Test: "Blood Glucose" ✅
Test Date: "2024-01-15" ✅
Result: "95" ✅
Unit: "mg/dL" ✅
Reference Range: "70-100" ✅
```

#### Step 7: Output Anonymized Record

```csv
Anonymous PID,Lab Test,Test Date,Result,Unit,Reference Range
PID-001,Blood Glucose,2024-01-15,95,mg/dL,70-100
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
Anonymous PID,Lab Test,Test Date,Result,Unit,Reference Range
PID-001,Blood Glucose,2024-01-15,95,mg/dL,70-100
PID-001,Cholesterol,2024-01-20,180,mg/dL,<200
PID-002,Blood Glucose,2024-01-15,110,mg/dL,70-100
```

### What Changed?

✅ **Preserved**:
- Lab test names
- Test dates
- Results
- Units
- Reference ranges
- Record relationships (same patient = same PID)

❌ **Removed**:
- Patient names
- Patient IDs
- Addresses
- Phone numbers
- Dates of birth

✅ **Added**:
- Anonymous patient IDs (PID-001, PID-002)

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

## Privacy Guarantees

### What We Guarantee

1. **No PII in Output**: All identifying information removed
2. **Cannot Identify Individuals**: Anonymous IDs can't be traced
3. **Medical Data Preserved**: Research value maintained
4. **Reversible Only with Authorization**: Mapping protected

### What We Don't Guarantee

1. **Perfect Anonymization**: Advanced techniques might re-identify
2. **Future-Proof**: New techniques may emerge
3. **100% Risk-Free**: No system is perfect

### Best Practices

- ✅ Remove all PII
- ✅ Use anonymous IDs
- ✅ Preserve medical data
- ✅ Maintain data quality
- ✅ Follow regulations (HIPAA, GDPR)

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

- **PII removed**: Name, ID, address, phone, DOB
- **Medical data preserved**: Tests, results, dates, units
- **Anonymous IDs added**: PID-001, PID-002, etc.
- **Mapping maintained**: For consent and payments
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

