# Revenue Distribution Model

## Core Principle

**The hospital that originally collected the patient's data is the sole beneficiary of revenue from that data.**

## How It Works

### Data Collection
- When a hospital collects patient data, it is stored with a `hospital_id` field in the `fhir_patients` table
- This `hospital_id` permanently links the patient's data to the collecting hospital
- Even if a patient later visits other hospitals, the original hospital remains linked to the data they collected

### Revenue Distribution

When data is sold (dataset purchase):

1. **Total payment is split equally among all patients** in the dataset
   - Example: 1000 HBAR payment, 100 patients = 10 HBAR per patient

2. **For each patient, revenue is split:**
   - 60% → Patient
   - 25% → **Original Hospital** (the one that collected this patient's data)
   - 15% → Platform (MediPact)

3. **Each patient's 25% goes to their specific original hospital**
   - Patient from Hospital A → Hospital A receives 25%
   - Patient from Hospital B → Hospital B receives 25%
   - Multiple hospitals in a dataset each receive revenue only for their own patients

### Example Scenario

**Dataset Purchase:**
- Total payment: 10,000 HBAR
- Dataset contains: 100 patients
  - 60 patients from Hospital A
  - 40 patients from Hospital B

**Calculation:**
- Amount per patient: 10,000 ÷ 100 = 100 HBAR per patient
- Per patient split:
  - Patient: 100 × 60% = 60 HBAR
  - Hospital: 100 × 25% = 25 HBAR
  - Platform: 100 × 15% = 15 HBAR

**Total Distribution:**
- Hospital A receives: 60 patients × 25 HBAR = **1,500 HBAR**
- Hospital B receives: 40 patients × 25 HBAR = **1,000 HBAR**
- Patients receive: 100 patients × 60 HBAR = **6,000 HBAR**
- Platform receives: 100 patients × 15 HBAR = **1,500 HBAR**

## Key Points

✅ **Original hospital is the sole beneficiary** - Only the hospital that collected the data receives revenue from it

✅ **Multiple hospitals can be in one dataset** - Each hospital receives revenue only for their own patients

✅ **Patient data is permanently linked** - The `hospital_id` in `fhir_patients` table ensures correct attribution

✅ **Fair distribution** - Each hospital is compensated for the data they collected, not data from other hospitals

## Implementation Details

### Database Schema
- `fhir_patients.hospital_id` - Links patient data to original collecting hospital
- This field is set when data is first collected and never changes

### Revenue Distribution Code
- `getPatientsWithHospitals()` - Returns each patient with their original `hospital_id`
- `distributeDatasetRevenue()` - Splits payment equally, then distributes per patient to their original hospital
- Each patient's 25% share goes to `patient.hospitalId` (the original collector)

## Cross-Hospital Access

**Important:** Temporary cross-hospital access (for telemedicine) does NOT change revenue distribution:
- Hospital A can request temporary access to patient data from Hospital B
- This allows Hospital A to view the data for a limited time
- However, if that data is later sold, revenue still goes to Hospital B (the original collector)
- Temporary access is for viewing only, not for revenue sharing

## Summary

**Yes, the hospital from which the data was collected remains the only beneficiary of that given data collected.**

This is enforced by:
1. Permanent `hospital_id` linkage in the database
2. Revenue distribution logic that uses each patient's original `hospital_id`
3. No mechanism to transfer revenue rights to other hospitals

