# FHIR Integration Guide

## Overview

MediPact now supports **FHIR (Fast Healthcare Interoperability Resources) R4**, the global standard for healthcare data exchange. This enables:

- ✅ **Standards Compliance**: Follows FHIR R4 specification
- ✅ **Real EHR Integration**: Works with actual hospital systems
- ✅ **Future-Proof**: Easy path to full FHIR API integration
- ✅ **Backward Compatible**: Still supports CSV format

## What is FHIR?

FHIR is a modern, web-based standard for exchanging healthcare information. It provides:

- **Standardized Resources**: Patient, Observation, Consent, etc.
- **RESTful APIs**: Familiar to developers
- **Interoperability**: Works across different EHR systems
- **Security**: Built-in authentication and authorization

## Supported Formats

### 1. CSV Format (Legacy)
- Simple, easy to understand
- Good for demos and testing
- File: `data/raw_data.csv`

### 2. FHIR Bundle Format (Current)
- Standards-compliant JSON
- Production-ready structure
- File: `data/raw_data.fhir.json`

### 3. FHIR API (Future)
- Direct connection to EHR systems
- Real-time data sync
- OAuth authentication

## Quick Start

### Option 1: Use Existing FHIR Bundle

```bash
# Set input file to FHIR Bundle
export INPUT_FILE=./data/raw_data.fhir.json

# Run adapter
npm start
```

### Option 2: Convert CSV to FHIR

```bash
# Convert CSV to FHIR Bundle
npm run convert:csv-to-fhir

# This creates: data/raw_data.fhir.json

# Run adapter with FHIR input
export INPUT_FILE=./data/raw_data.fhir.json
npm start
```

### Option 3: Use CSV (Default)

```bash
# Just run (uses CSV by default)
npm start
```

## FHIR Resources Used

### Patient Resource
Stores patient demographics:
- `id`: Patient identifier
- `name`: Patient name (removed during anonymization)
- `identifier`: Patient ID (replaced with anonymous ID)
- `address`: Address (removed during anonymization)
- `telecom`: Phone/email (removed during anonymization)
- `birthDate`: Date of birth (removed during anonymization)

### Observation Resource
Stores lab test results:
- `code`: Test type (LOINC codes)
- `subject`: Reference to Patient
- `effectiveDateTime`: Test date
- `valueQuantity`: Test result and unit
- `referenceRange`: Normal range

### Consent Resource (Future)
Will store consent information:
- `patient`: Reference to Patient
- `status`: Consent status
- `scope`: What data is consented
- `dateTime`: When consent was given

## Anonymization Process

### FHIR Anonymization

1. **Patient Resources**:
   - Removes: `name`, `address`, `telecom`, `birthDate`, `photo`, `contact`
   - Replaces: `identifier` with anonymous ID (PID-001, PID-002, etc.)
   - Updates: `id` to anonymous ID

2. **Observation Resources**:
   - Updates: `subject.reference` to anonymous Patient ID
   - Removes: PII from `note` fields
   - Preserves: All medical data (code, value, date)

3. **Output**:
   - Anonymized CSV: `data/anonymized_data.csv`
   - Anonymized FHIR Bundle: `data/anonymized_data.fhir.json`

## FHIR Module Structure

```
adapter/src/fhir/
├── fhir-parser.js       # Parse FHIR resources
├── fhir-anonymizer.js   # Anonymize FHIR resources
├── fhir-client.js       # FHIR API client (file + API)
└── index.js             # Main exports
```

## Code Examples

### Reading FHIR Bundle

```javascript
import { createFHIRClientFromFile, bundleToRecords } from './fhir/index.js';

// Read FHIR Bundle from file
const client = createFHIRClientFromFile('./data/raw_data.fhir.json');
const bundle = await client.fetchBundle();

// Convert to normalized records
const records = bundleToRecords(bundle);
```

### Anonymizing FHIR Resources

```javascript
import { anonymizeRecordsWithFHIR } from './fhir/index.js';

const result = anonymizeRecordsWithFHIR(records, bundle);

// Result contains:
// - records: Normalized anonymized records
// - patientMapping: Map of original ID -> anonymous ID
// - fhirBundle: Anonymized FHIR Bundle
```

### Future: FHIR API Integration

```javascript
import { createFHIRClientFromAPI } from './fhir/index.js';

// Connect to FHIR server
const client = createFHIRClientFromAPI(
  'https://fhir.example.com/fhir',
  'oauth-token-here'
);

// Fetch patient data
const patient = await client.getPatient('patient-123');
const observations = await client.getObservations('patient-123');
```

## Environment Variables

```env
# Input file (CSV or FHIR Bundle)
INPUT_FILE=./data/raw_data.fhir.json

# FHIR API (future)
FHIR_BASE_URL=https://fhir.example.com/fhir
FHIR_AUTH_TOKEN=your-oauth-token
```

## LOINC Codes

The converter maps common lab tests to LOINC codes:

- **Blood Glucose**: `2339-0`
- **Cholesterol**: `2093-3`
- **Hemoglobin**: `718-7`
- **HbA1c**: `4548-4`

See: [LOINC.org](https://loinc.org) for full list.

## FHIR Standards Compliance

✅ **FHIR R4**: Latest version  
✅ **Resource Structure**: Follows FHIR specification  
✅ **Data Types**: Uses FHIR data types  
✅ **References**: Proper resource references  
✅ **Identifiers**: Standard identifier systems  

## Benefits for Hackathon

1. **Standards Compliance**: Shows understanding of healthcare standards
2. **Production Ready**: Real-world applicable
3. **Interoperability**: Works with actual EHR systems
4. **Technical Depth**: Demonstrates advanced integration
5. **Future Vision**: Clear path to full implementation

## Next Steps

### For Hackathon Demo:
- ✅ Use FHIR Bundle format (already implemented)
- ✅ Show FHIR structure in documentation
- ✅ Mention FHIR API integration in roadmap

### Post-Hackathon:
- [ ] Full FHIR API integration
- [ ] OAuth authentication
- [ ] Real-time data sync
- [ ] FHIR Consent resource support
- [ ] FHIR server deployment

## Resources

- [FHIR Specification](https://www.hl7.org/fhir/)
- [FHIR R4 Documentation](https://www.hl7.org/fhir/R4/)
- [LOINC Codes](https://loinc.org)
- [FHIR RESTful API](https://www.hl7.org/fhir/http.html)

---

**Status**: ✅ FHIR Bundle support implemented  
**Next**: FHIR API integration (post-hackathon)

