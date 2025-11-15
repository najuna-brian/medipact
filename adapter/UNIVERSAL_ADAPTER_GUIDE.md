# Universal Adapter Guide

## Overview

The MediPact Universal Adapter can connect to **ANY** healthcare system and extract **ALL** FHIR R4 resources. It supports:

- ✅ **FHIR R4 Native Systems** (Epic, Cerner, HAPI FHIR, etc.)
- ✅ **OpenMRS** (Open Medical Records System)
- ✅ **OpenELIS** (Open Electronic Laboratory Information System)
- ✅ **Medic** (Community Health Toolkit / CHT)
- ✅ **Any Future System** (via connector framework)

## Architecture

```
┌─────────────────────────────────────────┐
│     Universal Extractor Engine          │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
┌───────▼────────┐    ┌─────────▼────────┐
│  Connector     │    │   Transformer   │
│  Framework     │    │   Framework     │
└───────┬────────┘    └─────────┬───────┘
        │                       │
   ┌────┴────┬────────┬─────────┴────┐
   │         │        │              │
┌──▼──┐ ┌───▼───┐ ┌──▼──┐ ┌────────▼──┐
│FHIR │ │OpenMRS│ │Open │ │   Medic   │
│     │ │       │ │ELIS │ │   (CHT)   │
└─────┘ └───────┘ └─────┘ └───────────┘
```

## Supported FHIR Resources

The adapter supports **ALL** FHIR R4 resources across 10 core domains:

### Domain 1: Patient Identity & Demographics
- Patient
- RelatedPerson
- Coverage

### Domain 2: Encounters / Visits
- Encounter

### Domain 3: Diagnoses & Clinical Problems
- Condition
- AllergyIntolerance

### Domain 4: Laboratory Tests & Measurements
- Observation
- DiagnosticReport
- Specimen

### Domain 5: Medications & Treatment
- MedicationRequest
- MedicationAdministration
- MedicationStatement

### Domain 6: Procedures & Interventions
- Procedure

### Domain 7: Medical Imaging
- ImagingStudy
- Media

### Domain 8: Vitals & Clinical Measurements
- Observation (Vital Signs Profile)

### Domain 9: Social Determinants of Health
- Observation (SDOH profiles)
- QuestionnaireResponse

### Domain 10: Metadata & Audit
- Provenance
- AuditEvent

### Additional Resources
- Immunization
- CarePlan
- CareTeam
- Device
- Organization
- Practitioner
- PractitionerRole
- Location
- Consent

## Configuration

### 1. Create System Configuration

Create `adapter/config/systems.json`:

```json
{
  "systems": [
    {
      "systemId": "openmrs-main",
      "systemType": "openmrs",
      "name": "Main Hospital OpenMRS",
      "hospitalId": "HOSP-XXXXXXXX",
      "connection": {
        "baseUrl": "http://localhost:8080/openmrs",
        "username": "admin",
        "password": "Admin123"
      },
      "resources": {
        "enabled": ["Patient", "Encounter", "Observation", "Condition"],
        "syncSchedule": "0 */6 * * *"
      }
    }
  ]
}
```

### 2. System Types

#### FHIR Native
```json
{
  "systemType": "fhir",
  "connection": {
    "baseUrl": "https://fhir.example.com/fhir",
    "authType": "bearer",
    "authToken": "your-token"
  }
}
```

#### OpenMRS
```json
{
  "systemType": "openmrs",
  "connection": {
    "baseUrl": "http://localhost:8080/openmrs",
    "username": "admin",
    "password": "password"
  }
}
```

#### OpenELIS
```json
{
  "systemType": "openelis",
  "connection": {
    "baseUrl": "http://localhost:8081/openelis",
    "apiKey": "your-api-key"
  }
}
```

#### Medic (CHT)
```json
{
  "systemType": "medic",
  "connection": {
    "baseUrl": "https://medic.example.com",
    "username": "admin",
    "password": "password"
  }
}
```

## Usage

### Extract All Resources

```javascript
import { UniversalExtractor } from './src/extractors/universal-extractor.js';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('config/systems.json', 'utf-8'));
const systemConfig = config.systems[0];

const extractor = new UniversalExtractor(systemConfig);

// Extract all resources
const result = await extractor.extractAll({
  resourceTypes: null, // null = all, or ['Patient', 'Observation']
  filters: {
    startDate: '2024-01-01',
    endDate: '2024-12-31'
  },
  limit: 1000
});

console.log('Extracted:', result.summary);
```

### Extract Patient Bundle

```javascript
// Extract complete bundle for a patient
const bundle = await extractor.extractPatientBundle('patient-123');
console.log('Bundle entries:', bundle.entry.length);
```

### Extract from Multiple Systems

```javascript
import { extractFromMultipleSystems } from './src/extractors/universal-extractor.js';

const configs = JSON.parse(fs.readFileSync('config/systems.json', 'utf-8'));

const results = await extractFromMultipleSystems(configs.systems, {
  resourceTypes: ['Patient', 'Observation', 'Condition'],
  filters: {
    startDate: '2024-01-01'
  }
});

results.forEach(result => {
  console.log(`${result.systemId}: ${result.summary.totalResources} resources`);
});
```

## Data Flow

1. **Connect** → Connector authenticates with healthcare system
2. **Discover** → Get list of available resources
3. **Extract** → Fetch resources from system
4. **Transform** → Convert to FHIR R4 format (if needed)
5. **Anonymize** → Remove PII, preserve demographics
6. **Store** → Save to database
7. **Submit** → Send to backend API

## Adding New Connectors

To add support for a new system:

1. Create connector class extending `BaseConnector`:

```javascript
import { BaseConnector } from './base-connector.js';

export class CustomSystemConnector extends BaseConnector {
  async connect() {
    // Implement connection logic
  }

  async fetchResources(resourceType, filters) {
    // Implement resource fetching
  }
  
  // ... implement other required methods
}
```

2. Create transformer (if not FHIR-native):

```javascript
export function transformCustomToFHIR(resourceType, data, baseUrl) {
  // Transform custom format to FHIR
}
```

3. Register in `connector-factory.js`:

```javascript
import { CustomSystemConnector } from './custom-connector.js';

export function getConnector(config) {
  // ...
  case 'custom':
    return new CustomSystemConnector(config);
  // ...
}
```

## Database Schema

All extracted FHIR resources are stored in normalized tables. See:
- `backend/src/models/fhir-complete-schema.js` for complete schema

Key tables:
- `fhir_patients` - Patient demographics
- `fhir_encounters` - Visits/encounters
- `fhir_conditions` - Diagnoses
- `fhir_observations` - Lab results, vitals
- `fhir_medication_requests` - Prescriptions
- `fhir_procedures` - Procedures
- `fhir_imaging_studies` - Imaging
- `fhir_diagnostic_reports` - Lab reports
- `fhir_specimens` - Specimens
- `fhir_allergies` - Allergies
- `fhir_immunizations` - Vaccinations
- `fhir_care_plans` - Care plans
- `fhir_provenance` - Audit trail
- `fhir_audit_events` - Access logs

## Standard Coding Systems

The adapter supports all standard coding systems:

- **ICD-10** - Conditions/diagnoses
- **SNOMED CT** - Conditions, procedures, body sites
- **LOINC** - Lab tests, observations
- **RxNorm** - Medications
- **CPT** - Procedures
- **ATC** - Medication categories
- **CVX** - Vaccines

## Privacy & Compliance

- ✅ K-Anonymity enforcement (minimum 5 records per group)
- ✅ PII removal (name, ID, address, phone, exact DOB)
- ✅ Demographic generalization (age ranges, country-level)
- ✅ Anonymous patient IDs (PID-001, etc.)
- ✅ Complete audit trails (Provenance, AuditEvent)
- ✅ Consent validation

## Examples

See `adapter/config/systems.example.json` for complete configuration examples.

## Support

For issues or questions:
1. Check connector logs
2. Verify system configuration
3. Test connection with `testConnection()` method
4. Review transformer output

