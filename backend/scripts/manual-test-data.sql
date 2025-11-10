-- Manual Test Data for MediPact
-- Run these SQL commands directly on the database to create test data

-- 1. Insert Test Hospital
INSERT OR IGNORE INTO hospitals (
    hospital_id, name, country, location, contact_email, 
    api_key_hash, registered_at, status, verification_status
) VALUES (
    'HOSP-TEST001',
    'Test Hospital',
    'Uganda',
    'Kampala',
    'test@hospital.com',
    'test-hash-key',
    CURRENT_TIMESTAMP,
    'active',
    'verified'
);

-- 2. Insert Test Researcher
INSERT OR IGNORE INTO researchers (
    researcher_id, email, organization_name, contact_name, 
    country, registered_at, status, verification_status
) VALUES (
    'RES-TEST001',
    'test-researcher@example.com',
    'Test Research Organization',
    'Test Researcher',
    'Uganda',
    CURRENT_TIMESTAMP,
    'active',
    'verified'
);

-- 3. Insert Test FHIR Patients
INSERT OR IGNORE INTO fhir_patients (
    anonymous_patient_id, upi, hospital_id, country, region,
    age_range, gender, created_at
) VALUES 
    ('PID-TEST001', 'UPI-TEST001', 'HOSP-TEST001', 'Uganda', 'Kampala', '35-39', 'Male', CURRENT_TIMESTAMP),
    ('PID-TEST002', 'UPI-TEST002', 'HOSP-TEST001', 'Uganda', 'Kampala', '40-44', 'Female', CURRENT_TIMESTAMP),
    ('PID-TEST003', 'UPI-TEST003', 'HOSP-TEST001', 'Uganda', 'Kampala', '30-34', 'Male', CURRENT_TIMESTAMP);

-- 4. Insert Test Conditions
INSERT OR IGNORE INTO fhir_conditions (
    anonymous_patient_id, condition_code, condition_name,
    diagnosis_date, severity, status, created_at
) VALUES 
    ('PID-TEST001', 'E11', 'Diabetes Type 2', '2024-01-15', 'moderate', 'active', CURRENT_TIMESTAMP),
    ('PID-TEST002', 'I10', 'Hypertension', '2024-03-20', 'mild', 'active', CURRENT_TIMESTAMP),
    ('PID-TEST003', 'E11', 'Diabetes Type 2', '2024-02-10', 'severe', 'active', CURRENT_TIMESTAMP);

-- 5. Insert Test Observations
INSERT OR IGNORE INTO fhir_observations (
    anonymous_patient_id, observation_code, observation_name,
    value, unit, effective_date, reference_range, interpretation, created_at
) VALUES 
    ('PID-TEST001', '4548-4', 'HbA1c', '7.8', '%', '2024-06-05', '4.0-5.6%', 'High', CURRENT_TIMESTAMP),
    ('PID-TEST002', '2339-0', 'Blood Glucose', '95', 'mg/dL', '2024-06-10', '70-100 mg/dL', 'Normal', CURRENT_TIMESTAMP),
    ('PID-TEST003', '4548-4', 'HbA1c', '8.2', '%', '2024-05-20', '4.0-5.6%', 'High', CURRENT_TIMESTAMP);

-- 6. Insert Test Dataset
INSERT OR IGNORE INTO datasets (
    id, name, description, hospital_id, country,
    record_count, date_range_start, date_range_end,
    condition_codes, price, currency, format,
    consent_type, status, created_at
) VALUES (
    'DS-TEST001',
    'Test Diabetes Dataset',
    'Test dataset for diabetes research from Uganda',
    'HOSP-TEST001',
    'Uganda',
    3,
    '2024-01-01',
    '2024-12-31',
    '["E11"]',
    25,
    'HBAR',
    'FHIR',
    'hospital_verified',
    'active',
    CURRENT_TIMESTAMP
);

-- Verify data
SELECT 'Hospitals:' as info, COUNT(*) as count FROM hospitals;
SELECT 'Researchers:' as info, COUNT(*) as count FROM researchers;
SELECT 'FHIR Patients:' as info, COUNT(*) as count FROM fhir_patients;
SELECT 'Conditions:' as info, COUNT(*) as count FROM fhir_conditions;
SELECT 'Observations:' as info, COUNT(*) as count FROM fhir_observations;
SELECT 'Datasets:' as info, COUNT(*) as count FROM datasets;

