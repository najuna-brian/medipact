# Lesson 12: CSV vs FHIR Formats

## Understanding Data Input Formats

MediPact supports two input formats: CSV (simple) and FHIR (standards-based). This lesson explains both and when to use each.

## CSV Format

### What is CSV?

**CSV** (Comma-Separated Values) is a simple text format where:
- Each line is a record
- Fields are separated by commas
- First line contains headers

### CSV Structure

```csv
Patient Name,Patient ID,Address,Phone Number,Date of Birth,Lab Test,Test Date,Result,Unit,Reference Range
John Doe,ID-12345,"123 Main St Kampala",0771234567,1990-05-15,Blood Glucose,2024-01-15,95,mg/dL,70-100
Jane Smith,ID-12346,"456 Oak Ave Entebbe",0772345678,1985-08-22,Blood Glucose,2024-01-15,110,mg/dL,70-100
```

### CSV Fields

**PII Fields** (removed during anonymization):
- `Patient Name` - Full name
- `Patient ID` - Hospital patient ID
- `Address` - Physical address
- `Phone Number` - Contact number
- `Date of Birth` - Birth date

**Medical Data Fields** (preserved):
- `Lab Test` - Test name (e.g., "Blood Glucose")
- `Test Date` - When test was performed
- `Result` - Test result value
- `Unit` - Measurement unit (e.g., "mg/dL")
- `Reference Range` - Normal range (e.g., "70-100")

### When to Use CSV

✅ **Good for**:
- Quick demos
- Simple testing
- Learning the system
- Small datasets
- Non-standard data

❌ **Not ideal for**:
- Production systems
- Real EHR integration
- Large datasets
- Standards compliance

### CSV Example File

**Location**: `adapter/data/raw_data.csv`

**Content**:
```csv
Patient Name,Patient ID,Address,Phone Number,Date of Birth,Lab Test,Test Date,Result,Unit,Reference Range
John Doe,ID-12345,"123 Main St Kampala",0771234567,1990-05-15,Blood Glucose,2024-01-15,95,mg/dL,70-100
John Doe,ID-12345,"123 Main St Kampala",0771234567,1990-05-15,Cholesterol,2024-01-20,180,mg/dL,<200
```

## FHIR Format

### What is FHIR?

**FHIR** (Fast Healthcare Interoperability Resources) is a global standard for healthcare data exchange. It uses:
- **JSON** format (structured data)
- **Resources** (Patient, Observation, etc.)
- **Bundle** (collection of resources)
- **Standards** (LOINC codes, standardized fields)

### FHIR Bundle Structure

```json
{
  "resourceType": "Bundle",
  "type": "collection",
  "timestamp": "2024-01-15T10:00:00Z",
  "entry": [
    {
      "fullUrl": "urn:uuid:patient-1",
      "resource": {
        "resourceType": "Patient",
        "id": "patient-1",
        "name": [{"text": "John Doe"}],
        "identifier": [{"value": "ID-12345"}],
        "address": [{"text": "123 Main St"}],
        "telecom": [{"system": "phone", "value": "0771234567"}],
        "birthDate": "1990-05-15"
      }
    },
    {
      "fullUrl": "urn:uuid:obs-1",
      "resource": {
        "resourceType": "Observation",
        "id": "obs-1",
        "code": {
          "coding": [{
            "system": "http://loinc.org",
            "code": "2339-0",
            "display": "Blood Glucose"
          }]
        },
        "subject": {"reference": "Patient/patient-1"},
        "effectiveDateTime": "2024-01-15",
        "valueQuantity": {
          "value": 95,
          "unit": "mg/dL"
        },
        "referenceRange": [{
          "low": {"value": 70, "unit": "mg/dL"},
          "high": {"value": 100, "unit": "mg/dL"}
        }]
      }
    }
  ]
}
```

### FHIR Resources

#### Patient Resource

Stores patient demographics:
```json
{
  "resourceType": "Patient",
  "id": "patient-1",
  "identifier": [{
    "system": "urn:hospital:patient-id",
    "value": "ID-12345"
  }],
  "name": [{"text": "John Doe"}],
  "address": [{"text": "123 Main St Kampala"}],
  "telecom": [{"system": "phone", "value": "0771234567"}],
  "birthDate": "1990-05-15"
}
```

#### Observation Resource

Stores lab test results:
```json
{
  "resourceType": "Observation",
  "id": "obs-1",
  "status": "final",
  "code": {
    "coding": [{
      "system": "http://loinc.org",
      "code": "2339-0",
      "display": "Blood Glucose"
    }]
  },
  "subject": {
    "reference": "Patient/patient-1"
  },
  "effectiveDateTime": "2024-01-15",
  "valueQuantity": {
    "value": 95,
    "unit": "mg/dL",
    "system": "http://unitsofmeasure.org"
  },
  "referenceRange": [{
    "low": {"value": 70, "unit": "mg/dL"},
    "high": {"value": 100, "unit": "mg/dL"}
  }]
}
```

### When to Use FHIR

✅ **Good for**:
- Production systems
- Real EHR integration
- Standards compliance
- Large datasets
- Future-proofing

❌ **More complex**:
- Requires understanding FHIR structure
- More verbose than CSV
- Needs conversion tools

### FHIR Example File

**Location**: `adapter/data/raw_data.fhir.json`

**How to create**:
```bash
npm run convert:csv-to-fhir
```

## Format Comparison

| Feature | CSV | FHIR |
|---------|-----|------|
| **Complexity** | Simple | Complex |
| **Standards** | None | FHIR R4 |
| **EHR Integration** | No | Yes |
| **Structure** | Flat | Hierarchical |
| **Codes** | None | LOINC |
| **Production Ready** | No | Yes |
| **File Size** | Small | Larger |
| **Learning Curve** | Easy | Moderate |

## How MediPact Handles Both

### Automatic Detection

The adapter automatically detects format:

```javascript
// In adapter/src/index.js
if (await isFHIRBundle(INPUT_FILE)) {
  // Use FHIR parser
  const bundle = await fhirClient.fetchBundle();
  const records = bundleToRecords(bundle);
} else {
  // Use CSV parser
  const records = await parseCSV(INPUT_FILE);
}
```

### Processing Flow

**CSV Path**:
```
CSV File
  → parseCSV()
  → Array of records
  → anonymizeRecords()
  → Anonymized CSV output
```

**FHIR Path**:
```
FHIR Bundle
  → parseFHIRBundle()
  → FHIR resources
  → bundleToRecords()
  → Normalized records
  → anonymizeRecordsWithFHIR()
  → Anonymized CSV + FHIR Bundle output
```

## Converting Between Formats

### CSV to FHIR

```bash
# Convert CSV to FHIR Bundle
npm run convert:csv-to-fhir

# Output: data/raw_data.fhir.json
```

**What it does**:
- Reads CSV file
- Creates Patient resources
- Creates Observation resources
- Bundles into FHIR Bundle
- Writes JSON file

### FHIR to CSV (Future)

Currently, FHIR is converted to normalized format internally. Future enhancement could export to CSV.

## Choosing the Right Format

### Use CSV If:
- Learning the system
- Quick demos
- Simple testing
- Non-standard data
- Small datasets

### Use FHIR If:
- Production deployment
- Real EHR integration
- Standards compliance needed
- Large datasets
- Future-proofing

## Field Mapping

### CSV → FHIR Mapping

| CSV Field | FHIR Resource | FHIR Field |
|-----------|---------------|------------|
| Patient Name | Patient | name[0].text |
| Patient ID | Patient | identifier[0].value |
| Address | Patient | address[0].text |
| Phone Number | Patient | telecom[0].value |
| Date of Birth | Patient | birthDate |
| Lab Test | Observation | code.coding[0].display |
| Test Date | Observation | effectiveDateTime |
| Result | Observation | valueQuantity.value |
| Unit | Observation | valueQuantity.unit |
| Reference Range | Observation | referenceRange |

## LOINC Codes

FHIR uses **LOINC** (Logical Observation Identifiers Names and Codes) for lab tests:

| Test Name | LOINC Code |
|-----------|------------|
| Blood Glucose | 2339-0 |
| Cholesterol | 2093-3 |
| Hemoglobin | 718-7 |
| HbA1c | 4548-4 |

**Why LOINC?**
- Standardized codes
- Global recognition
- Interoperability
- Machine-readable

## Output Formats

### CSV Input → CSV Output

```
raw_data.csv → anonymized_data.csv
```

### FHIR Input → CSV + FHIR Output

```
raw_data.fhir.json → anonymized_data.csv + anonymized_data.fhir.json
```

**Why both?**
- CSV: Easy to read and share
- FHIR: Standards-compliant for systems

## Best Practices

### For Development
- Start with CSV (simpler)
- Learn the system
- Convert to FHIR when ready

### For Production
- Use FHIR from the start
- Ensure standards compliance
- Plan for EHR integration

### For Demos
- Show both formats
- Explain the difference
- Highlight FHIR compliance

## Key Takeaways

- **CSV**: Simple, good for learning and demos
- **FHIR**: Standards-based, production-ready
- **Auto-detection**: Adapter handles both automatically
- **Conversion**: Easy to convert CSV to FHIR
- **Output**: FHIR input produces both CSV and FHIR output

## Next Steps

Now that you understand data formats:

- **Next Lesson**: [Anonymization Process](./13-anonymization.md) - How PII is removed

---

**Format Summary:**
- CSV: Simple, flat structure
- FHIR: Standards-based, hierarchical
- Both supported automatically
- Choose based on use case

