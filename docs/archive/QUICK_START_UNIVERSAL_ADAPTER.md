# Quick Start: Universal Adapter

## 🚀 Getting Started with Universal Adapter

The Universal Adapter can now connect to **ANY** healthcare system and extract **ALL** FHIR R4 resources!

## Prerequisites

1. ✅ Backend running (port 3002)
2. ✅ Hospital registered in backend
3. ✅ Hospital API key
4. ✅ Hedera account (for HCS)

## Step 1: Run Database Migration

First, create all the new FHIR tables:

```bash
cd backend
npm run migrate:fhir
# OR
node scripts/migrate-fhir-complete-schema.js
```

This creates tables for:
- All 10 core data domains
- 20+ FHIR resource types
- Complete audit trails

## Step 2: Configure Systems

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
        "enabled": [
          "Patient",
          "Encounter",
          "Observation",
          "Condition",
          "MedicationRequest",
          "Procedure",
          "AllergyIntolerance"
        ]
      }
    },
    {
      "systemId": "openelis-lab",
      "systemType": "openelis",
      "name": "Laboratory System",
      "hospitalId": "HOSP-XXXXXXXX",
      "connection": {
        "baseUrl": "http://localhost:8081/openelis",
        "apiKey": "your-api-key"
      },
      "resources": {
        "enabled": [
          "Patient",
          "Observation",
          "DiagnosticReport",
          "Specimen"
        ]
      }
    },
    {
      "systemId": "medic-cht",
      "systemType": "medic",
      "name": "Community Health Toolkit",
      "hospitalId": "HOSP-XXXXXXXX",
      "connection": {
        "baseUrl": "https://medic.example.com",
        "username": "admin",
        "password": "password"
      },
      "resources": {
        "enabled": [
          "Patient",
          "Encounter",
          "Observation",
          "Condition",
          "MedicationRequest",
          "Immunization"
        ]
      }
    }
  ]
}
```

## Step 3: Configure Environment

Create `adapter/.env`:

```env
# Hedera Configuration
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"

# Hospital Configuration
HOSPITAL_COUNTRY="Uganda"
HOSPITAL_LOCATION="Kampala, Uganda"

# Backend Integration
BACKEND_API_URL="http://localhost:3002"
HOSPITAL_API_KEY="your-hospital-api-key"

# Optional: Smart Contracts
CONSENT_MANAGER_ADDRESS="0x..."
```

## Step 4: Run the Adapter

```bash
cd adapter
npm start
```

The adapter will:
1. ✅ Connect to all configured systems
2. ✅ Extract all enabled resources
3. ✅ Anonymize data (remove PII, preserve demographics)
4. ✅ Store to backend database
5. ✅ Submit proofs to Hedera HCS
6. ✅ Display summary

## What Gets Extracted

### From OpenMRS:
- Patients with demographics
- Encounters (visits)
- Observations (vitals, lab results)
- Conditions (diagnoses)
- Medication requests
- Allergies

### From OpenELIS:
- Patients
- Lab results (Observations)
- Diagnostic reports
- Specimens

### From Medic:
- Patients (community health data)
- Encounters (home visits)
- Observations (form data, vitals)
- Conditions (diagnoses from forms)
- Medications
- Immunizations

### From FHIR Systems:
- **ALL** available resources (Patient, Encounter, Condition, Observation, MedicationRequest, Procedure, ImagingStudy, DiagnosticReport, Specimen, Immunization, CarePlan, etc.)

## Output

The adapter will:
- Extract resources from each system
- Anonymize all PII
- Store in database (all resource types)
- Create consent proofs (one per patient)
- Create data proofs (one per resource)
- Display HashScan links for verification

## Verification

1. **Check Database**: Query `fhir_patients`, `fhir_encounters`, etc.
2. **Check HCS**: Visit HashScan links to see proofs
3. **Check Backend**: Resources should be queryable via `/api/marketplace/query`

## Troubleshooting

### Connection Issues
- Verify system URLs are correct
- Check authentication credentials
- Test connection manually (curl/Postman)

### Missing Resources
- Check system capabilities (FHIR CapabilityStatement)
- Verify resource types are enabled in config
- Check system logs for errors

### Storage Issues
- Verify backend is running
- Check API key is correct
- Verify database migration ran successfully

## Next Steps

1. **Query Data**: Use `/api/marketplace/query` to query extracted data
2. **Create Datasets**: Use `/api/adapter/create-dataset` to create datasets
3. **Researcher Access**: Researchers can now query all resource types

## Support

- See `adapter/UNIVERSAL_ADAPTER_GUIDE.md` for detailed documentation
- Check `IMPLEMENTATION_SUMMARY.md` for architecture overview

