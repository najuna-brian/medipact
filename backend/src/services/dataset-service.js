/**
 * Dataset Service
 * 
 * Business logic for dataset management, creation, and querying.
 */

import { createDataset, getDataset, getAllDatasets, updateDataset } from '../db/dataset-db.js';
import { queryFHIRResources, countFHIRPatients } from '../db/fhir-db.js';
import { logDatasetToHCS } from '../hedera/hcs-client.js';
import crypto from 'crypto';

/**
 * Create dataset from FHIR resources
 * 
 * @param {Object} datasetData - Dataset metadata
 * @param {Object} filters - Filters to apply to create dataset
 * @returns {Promise<Object>} Created dataset
 */
export async function createDatasetFromQuery(datasetData, filters = {}) {
  // Count matching records
  const recordCount = await countFHIRPatients(filters);
  
  // Determine date range from filters or data
  let dateRangeStart = datasetData.dateRangeStart;
  let dateRangeEnd = datasetData.dateRangeEnd;
  
  if (filters.startDate && !dateRangeStart) {
    dateRangeStart = filters.startDate;
  }
  
  if (filters.endDate && !dateRangeEnd) {
    dateRangeEnd = filters.endDate;
  }
  
  // Extract condition codes if filtering by condition
  let conditionCodes = datasetData.conditionCodes;
  if (filters.conditionCode && !conditionCodes) {
    conditionCodes = [filters.conditionCode];
  }
  
  // Simple fixed price: 2 HBAR per patient record (no discounts, no categories)
  const FIXED_PRICE_PER_RECORD_HBAR = 2.0;
  const { hbarToUSD } = await import('./pricing-service.js');
  const hbarToUsdRate = await hbarToUSD(1); // Get current exchange rate
  
  const totalPriceHBAR = FIXED_PRICE_PER_RECORD_HBAR * recordCount;
  const totalPriceUSD = totalPriceHBAR * hbarToUsdRate;
  const pricePerRecordUSD = FIXED_PRICE_PER_RECORD_HBAR * hbarToUsdRate;
  
  // Create dataset record with fixed pricing
  const dataset = await createDataset({
    ...datasetData,
    recordCount,
    dateRangeStart,
    dateRangeEnd,
    conditionCodes: conditionCodes ? JSON.stringify(conditionCodes) : null,
    // Pricing fields (fixed: 2 HBAR per record)
    price: totalPriceHBAR,
    priceUSD: totalPriceUSD,
    pricePerRecordHBAR: FIXED_PRICE_PER_RECORD_HBAR,
    pricePerRecordUSD: pricePerRecordUSD,
    pricingCategoryId: 'CAT-FIXED',
    pricingCategory: 'Fixed Price (2 HBAR per record)',
    volumeDiscount: 0, // No discounts
    status: 'active'
  });
  
  // Log dataset metadata to HCS for immutable record
  try {
    const hcsMessageId = await logDatasetToHCS(dataset);
    if (hcsMessageId) {
      // Update dataset with HCS topic ID if not already set
      if (!dataset.hcsTopicId) {
        await updateDataset(dataset.id, { hcsTopicId: hcsMessageId });
        dataset.hcsTopicId = hcsMessageId;
      }
    }
  } catch (error) {
    console.error('Error logging dataset to HCS:', error);
    // Continue even if HCS logging fails
  }
  
  return dataset;
}

/**
 * Get dataset with preview data
 * 
 * @param {string} datasetId - Dataset ID
 * @param {Object} options - Options (includePreview, previewLimit)
 * @returns {Promise<Object>} Dataset with optional preview
 */
export async function getDatasetWithPreview(datasetId, options = {}) {
  const {
    includePreview = false,
    previewLimit = 10
  } = options;
  
  const dataset = await getDataset(datasetId);
  
  if (!dataset) {
    return null;
  }
  
  // Build filters from dataset metadata
  const filters = {};
  if (dataset.country) filters.country = dataset.country;
  if (dataset.dateRangeStart) filters.startDate = dataset.dateRangeStart;
  if (dataset.dateRangeEnd) filters.endDate = dataset.dateRangeEnd;
  if (dataset.conditionCodes) {
    const codes = typeof dataset.conditionCodes === 'string' 
      ? JSON.parse(dataset.conditionCodes) 
      : dataset.conditionCodes;
    if (codes && codes.length > 0) {
      filters.conditionCode = codes[0]; // Use first condition for preview
    }
  }
  
  let preview = null;
  if (includePreview) {
    filters.limit = previewLimit;
    const results = await queryFHIRResources(filters);
    preview = results;
  }
  
  // Ensure USD prices are always included for display
  if (!dataset.priceUSD && dataset.price) {
    const { hbarToUSD } = await import('./pricing-service.js');
    dataset.priceUSD = hbarToUSD(dataset.price);
  }
  
  if (!dataset.pricePerRecordUSD && dataset.pricePerRecordHBAR) {
    const { hbarToUSD } = await import('./pricing-service.js');
    dataset.pricePerRecordUSD = hbarToUSD(dataset.pricePerRecordHBAR);
  } else if (!dataset.pricePerRecordUSD && dataset.price && dataset.recordCount > 0) {
    const { hbarToUSD } = await import('./pricing-service.js');
    dataset.pricePerRecordUSD = hbarToUSD(dataset.price / dataset.recordCount);
    dataset.pricePerRecordHBAR = dataset.price / dataset.recordCount;
  }
  
  return {
    ...dataset,
    preview
  };
}

/**
 * Generate dataset export (FHIR Bundle, CSV, or JSON)
 * 
 * @param {string} datasetId - Dataset ID
 * @param {string} format - Export format ('fhir', 'csv', 'csv-zip', 'json')
 * @param {Object} options - Export options (multiFile, zip)
 * @returns {Promise<Object>} Export data
 */
export async function exportDataset(datasetId, format = 'fhir', options = {}) {
  const dataset = await getDataset(datasetId);
  
  if (!dataset) {
    throw new Error('Dataset not found');
  }
  
  // Build filters from dataset
  const filters = {};
  if (dataset.country) filters.country = dataset.country;
  if (dataset.dateRangeStart) filters.startDate = dataset.dateRangeStart;
  if (dataset.dateRangeEnd) filters.endDate = dataset.dateRangeEnd;
  if (dataset.conditionCodes) {
    const codes = typeof dataset.conditionCodes === 'string' 
      ? JSON.parse(dataset.conditionCodes) 
      : dataset.conditionCodes;
    if (codes && codes.length > 0) {
      filters.conditionCode = codes[0];
    }
  }
  
  // Format based on requested format
  if (format === 'csv-flattened') {
    // Flattened CSV: one row per patient with all data denormalized
    // Pass csvSchema from dataset if available
    const csvSchema = dataset.csvSchema || options.csvSchema;
    return await formatAsFlattenedCSV(filters, dataset, { ...options, csvSchema });
  }
  
  // For other formats, query all matching resources
  filters.limit = options.limit || 100000; // Support limit for count-based queries
  const patients = await queryFHIRResources(filters);
  
  if (format === 'fhir') {
    return formatAsFHIRBundle(patients, dataset);
  } else if (format === 'csv' || format === 'csv-zip') {
    const csvOptions = {
      multiFile: format === 'csv-zip' || options.multiFile,
      zip: format === 'csv-zip' || options.zip
    };
    return await formatAsCSV(patients, dataset, csvOptions);
  } else {
    return formatAsJSON(patients, dataset);
  }
}

/**
 * Format data as FHIR Bundle
 */
function formatAsFHIRBundle(patients, dataset) {
  const bundle = {
    resourceType: 'Bundle',
    type: 'collection',
    timestamp: new Date().toISOString(),
    entry: patients.map(patient => ({
      resource: {
        resourceType: 'Patient',
        id: patient.anonymousPatientId,
        meta: {
          profile: ['http://hl7.org/fhir/StructureDefinition/Patient']
        },
        extension: [
          {
            url: 'http://medipact.org/fhir/StructureDefinition/country',
            valueString: patient.country
          }
        ],
        gender: patient.gender?.toLowerCase(),
        birthDate: patient.ageRange // Age range instead of exact DOB
      }
    }))
  };
  
  return {
    format: 'fhir',
    data: bundle,
    recordCount: patients.length,
    datasetId: dataset.id
  };
}

/**
 * Format data as CSV (enhanced multi-file structure)
 */
async function formatAsCSV(patients, dataset, options = {}) {
  const { multiFile = false, zip = false } = options;
  
  // Import resource query functions
  const { queryPatients, queryConditions, queryObservations, queryEncounters } = await import('../db/fhir-resource-db.js');
  
  // Build filters from dataset
  const filters = {};
  if (dataset.country) filters.country = dataset.country;
  if (dataset.dateRangeStart) filters.startDate = dataset.dateRangeStart;
  if (dataset.dateRangeEnd) filters.endDate = dataset.dateRangeEnd;
  if (dataset.conditionCodes) {
    const codes = typeof dataset.conditionCodes === 'string' 
      ? JSON.parse(dataset.conditionCodes) 
      : dataset.conditionCodes;
    if (codes && codes.length > 0) {
      filters.conditionCode = codes[0];
    }
  }
  filters.limit = 100000; // Large limit for export
  
  if (multiFile || zip) {
    // Multi-file CSV structure
    const csvFiles = {};
    
    // 1. Patients CSV
    const patientData = await queryPatients(filters);
    csvFiles.patients = generateCSV(
      ['patient_id', 'age_range', 'gender', 'country', 'region', 'hospital_id'],
      patientData.map(p => [
        p.anonymousPatientId,
        p.ageRange || '',
        p.gender || '',
        p.country,
        p.region || '',
        p.hospitalId
      ])
    );
    
    // 2. Conditions CSV
    const conditionData = await queryConditions(filters);
    csvFiles.conditions = generateCSV(
      ['condition_id', 'patient_id', 'icd10', 'snomed', 'condition_name', 'diagnosed_date', 'severity', 'status', 'country'],
      conditionData.map(c => [
        c.conditionCode, // Using conditionCode as ID
        c.anonymousPatientId,
        c.conditionCode, // ICD10 code
        c.conditionCode, // SNOMED (same for now)
        c.conditionName,
        c.diagnosisDate || '',
        c.severity || '',
        c.status || '',
        c.country
      ])
    );
    
    // 3. Observations/Labs CSV
    const observationData = await queryObservations(filters);
    csvFiles.observations = generateCSV(
      ['lab_id', 'patient_id', 'test_name', 'result', 'value', 'date', 'unit', 'reference_range', 'interpretation', 'country'],
      observationData.map(o => [
        o.observationCode, // Using observationCode as ID
        o.anonymousPatientId,
        o.observationName,
        o.value || '', // Result
        o.value || '', // Value (same as result)
        o.effectiveDate,
        o.unit || '',
        o.referenceRange || '',
        o.interpretation || '',
        o.country
      ])
    );
    
    // 4. Encounters CSV (if table exists)
    try {
      const encounterData = await queryEncounters(filters);
      if (encounterData.length > 0) {
        csvFiles.encounters = generateCSV(
          ['encounter_id', 'patient_id', 'date', 'encounter_type', 'encounter_class', 'reason', 'department', 'country'],
          encounterData.map(e => [
            `${e.anonymousPatientId}-${e.periodStart || ''}`, // Generate encounter ID
            e.anonymousPatientId,
            e.periodStart || '',
            e.encounterType || '',
            e.encounterClass || '',
            '', // Reason (not in current schema)
            '', // Department (not in current schema)
            e.country
          ])
        );
      }
    } catch (error) {
      // Encounters table doesn't exist, skip
    }
    
    if (zip) {
      // Return ZIP file
      const archiver = (await import('archiver')).default;
      const { Readable } = await import('stream');
      
      return new Promise((resolve, reject) => {
        const archive = archiver('zip', { zlib: { level: 9 } });
        const chunks = [];
        
        archive.on('data', (chunk) => chunks.push(chunk));
        archive.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve({
            format: 'csv-zip',
            data: buffer,
            recordCount: {
              patients: patientData.length,
              conditions: conditionData.length,
              observations: observationData.length,
              encounters: csvFiles.encounters ? encounterData.length : 0
            },
            datasetId: dataset.id,
            files: Object.keys(csvFiles)
          });
        });
        archive.on('error', reject);
        
        // Add each CSV file to the ZIP
        Object.entries(csvFiles).forEach(([filename, csvContent]) => {
          archive.append(csvContent, { name: `${filename}.csv` });
        });
        
        archive.finalize();
      });
    } else {
      // Return object with multiple CSV files
      return {
        format: 'csv-multi',
        data: csvFiles,
        recordCount: {
          patients: patientData.length,
          conditions: conditionData.length,
          observations: observationData.length
        },
        datasetId: dataset.id
      };
    }
  } else {
    // Single combined CSV (backward compatible)
    const headers = ['Anonymous Patient ID', 'Country', 'Age Range', 'Gender'];
    const rows = patients.map(p => [
      p.anonymousPatientId,
      p.country,
      p.ageRange || '',
      p.gender || ''
    ]);
    
    const csv = generateCSV(headers, rows);
    
    return {
      format: 'csv',
      data: csv,
      recordCount: patients.length,
      datasetId: dataset.id
    };
  }
}

/**
 * Generate CSV string from headers and rows
 */
function generateCSV(headers, rows) {
  const escapeCSV = (value) => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  
  return [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSV).join(','))
  ].join('\n');
}

/**
 * Format data as flattened CSV (one row per patient with all data denormalized)
 * This maintains the original CSV structure with anonymized fields
 * 
 * @param {Object} filters - Query filters
 * @param {Object} dataset - Dataset metadata
 * @param {Object} options - Export options (limit, csvSchema)
 * @returns {Promise<Object>} Flattened CSV export
 */
export async function formatAsFlattenedCSV(filters, dataset, options = {}) {
  const { limit, csvSchema } = options;
  
  // Import resource query functions
  const { queryPatients, queryConditions, queryObservations } = await import('../db/fhir-resource-db.js');
  
  // Apply limit if specified (e.g., "get me 100 diabetic patients")
  const queryFilters = { ...filters };
  if (limit) {
    queryFilters.limit = limit;
  } else {
    queryFilters.limit = 100000; // Large limit for export
  }
  
  // Get all patients matching filters
  const patientData = await queryPatients(queryFilters);
  
  // Get all conditions for these patients
  const conditionData = await queryConditions(queryFilters);
  
  // Get all observations for these patients
  const observationData = await queryObservations(queryFilters);
  
  // Group conditions and observations by patient
  const conditionsByPatient = new Map();
  const observationsByPatient = new Map();
  
  conditionData.forEach(condition => {
    if (!conditionsByPatient.has(condition.anonymousPatientId)) {
      conditionsByPatient.set(condition.anonymousPatientId, []);
    }
    conditionsByPatient.get(condition.anonymousPatientId).push(condition);
  });
  
  observationData.forEach(observation => {
    if (!observationsByPatient.has(observation.anonymousPatientId)) {
      observationsByPatient.set(observation.anonymousPatientId, []);
    }
    observationsByPatient.get(observation.anonymousPatientId).push(observation);
  });
  
  // Build CSV headers - use csvSchema if provided, otherwise use default structure
  let headers;
  if (csvSchema && csvSchema.columns && Array.isArray(csvSchema.columns)) {
    // Use original CSV schema
    headers = csvSchema.columns;
  } else {
    // Default flattened structure
    headers = [
      'anonymousPatientId',
      'ageRange',
      'gender',
      'country',
      'region',
      'hospitalId',
      'conditions', // Comma-separated condition names
      'conditionCodes', // Comma-separated ICD10 codes
      'diabetesStatus', // Yes/No
      'diabetesCode', // E11 if diabetic
      'hypertensionStatus', // Yes/No
      'hypertensionCode', // I10 if hypertensive
      'latestHbA1c', // Latest HbA1c value
      'latestHbA1cDate', // Date of latest HbA1c
      'latestGlucose', // Latest glucose value
      'latestGlucoseDate', // Date of latest glucose
      'latestCholesterol', // Latest cholesterol value
      'latestCholesterolDate', // Date of latest cholesterol
      'allObservations', // All observations as JSON string
      'observationCount' // Number of observations
    ];
  }
  
  // Build rows - one per patient
  const rows = patientData.map(patient => {
    const patientConditions = conditionsByPatient.get(patient.anonymousPatientId) || [];
    const patientObservations = observationsByPatient.get(patient.anonymousPatientId) || [];
    
    // Extract condition information
    const conditionNames = patientConditions.map(c => c.conditionName).filter(Boolean);
    const conditionCodes = patientConditions.map(c => c.conditionCode).filter(Boolean);
    const hasDiabetes = conditionCodes.some(code => code === 'E11' || code.startsWith('E11'));
    const hasHypertension = conditionCodes.some(code => code === 'I10' || code.startsWith('I10'));
    
    // Find latest lab values
    const hbA1cObs = patientObservations.filter(o => 
      o.observationCode === '4548-4' || 
      o.observationName?.toLowerCase().includes('hba1c') ||
      o.observationName?.toLowerCase().includes('hemoglobin a1c')
    ).sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
    
    const glucoseObs = patientObservations.filter(o => 
      o.observationCode === '2339-0' || 
      o.observationName?.toLowerCase().includes('glucose')
    ).sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
    
    const cholesterolObs = patientObservations.filter(o => 
      o.observationCode === '2093-3' || 
      o.observationName?.toLowerCase().includes('cholesterol')
    ).sort((a, b) => new Date(b.effectiveDate) - new Date(a.effectiveDate));
    
    const latestHbA1c = hbA1cObs.length > 0 ? hbA1cObs[0] : null;
    const latestGlucose = glucoseObs.length > 0 ? glucoseObs[0] : null;
    const latestCholesterol = cholesterolObs.length > 0 ? cholesterolObs[0] : null;
    
    // Build row data
    if (csvSchema && csvSchema.columns) {
      // Map to original CSV structure
      const row = {};
      csvSchema.columns.forEach(col => {
        // Map common fields
        if (col.toLowerCase().includes('patient') && col.toLowerCase().includes('id')) {
          row[col] = patient.anonymousPatientId;
        } else if (col.toLowerCase().includes('age')) {
          row[col] = patient.ageRange || '';
        } else if (col.toLowerCase().includes('gender') || col.toLowerCase().includes('sex')) {
          row[col] = patient.gender || '';
        } else if (col.toLowerCase().includes('country')) {
          row[col] = patient.country || '';
        } else if (col.toLowerCase().includes('region') || col.toLowerCase().includes('location')) {
          row[col] = patient.region || '';
        } else if (col.toLowerCase().includes('condition') && col.toLowerCase().includes('name')) {
          row[col] = conditionNames.join('; ') || '';
        } else if (col.toLowerCase().includes('condition') && col.toLowerCase().includes('code')) {
          row[col] = conditionCodes.join('; ') || '';
        } else if (col.toLowerCase().includes('diabetes')) {
          row[col] = hasDiabetes ? 'Yes' : 'No';
        } else if (col.toLowerCase().includes('hypertension')) {
          row[col] = hasHypertension ? 'Yes' : 'No';
        } else {
          row[col] = ''; // Empty for unmapped fields
        }
      });
      return csvSchema.columns.map(col => row[col] || '');
    } else {
      // Default flattened structure
      return [
        patient.anonymousPatientId,
        patient.ageRange || '',
        patient.gender || '',
        patient.country || '',
        patient.region || '',
        patient.hospitalId || '',
        conditionNames.join('; ') || '',
        conditionCodes.join('; ') || '',
        hasDiabetes ? 'Yes' : 'No',
        hasDiabetes ? 'E11' : '',
        hasHypertension ? 'Yes' : 'No',
        hasHypertension ? 'I10' : '',
        latestHbA1c?.value || '',
        latestHbA1c?.effectiveDate || '',
        latestGlucose?.value || '',
        latestGlucose?.effectiveDate || '',
        latestCholesterol?.value || '',
        latestCholesterol?.effectiveDate || '',
        JSON.stringify(patientObservations.map(o => ({
          name: o.observationName,
          code: o.observationCode,
          value: o.value,
          unit: o.unit,
          date: o.effectiveDate
        }))),
        patientObservations.length
      ];
    }
  });
  
  // Generate CSV
  const csv = generateCSV(headers, rows);
  
  return {
    format: 'csv-flattened',
    data: csv,
    recordCount: rows.length,
    datasetId: dataset.id,
    metadata: {
      exportedAt: new Date().toISOString(),
      filters: queryFilters,
      structure: 'one-row-per-patient'
    }
  };
}

/**
 * Format data as JSON
 */
function formatAsJSON(patients, dataset) {
  return {
    format: 'json',
    data: patients,
    recordCount: patients.length,
    datasetId: dataset.id,
    metadata: {
      dataset: {
        id: dataset.id,
        name: dataset.name,
        country: dataset.country
      },
      exportedAt: new Date().toISOString()
    }
  };
}

