/**
 * Dataset Service
 * 
 * Business logic for dataset management, creation, and querying.
 */

import { createDataset, getDataset, getAllDatasets, updateDataset } from '../db/dataset-db.js';
import { queryFHIRResources, countFHIRPatients } from '../db/fhir-db.js';
import { logDatasetToHCS } from '../hedera/hcs-client.js';
import { determinePricingCategory, calculateDatasetPrice } from './pricing-service.js';
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
  
  // Auto-calculate pricing based on category
  const category = determinePricingCategory({
    conditionCodes: conditionCodes,
    observationTypes: datasetData.observationTypes,
    isLongitudinal: datasetData.isLongitudinal,
    containsSensitiveData: datasetData.containsSensitiveData
  });
  
  const pricing = await calculateDatasetPrice(recordCount, category);
  
  // Create dataset record with auto-calculated pricing
  const dataset = await createDataset({
    ...datasetData,
    recordCount,
    dateRangeStart,
    dateRangeEnd,
    conditionCodes: conditionCodes ? JSON.stringify(conditionCodes) : null,
    // Pricing fields
    price: pricing.pricing.finalPriceHBAR, // Store in HBAR for transactions
    priceUSD: pricing.pricing.finalPriceUSD, // Store USD for display
    pricePerRecordHBAR: pricing.pricing.finalPricePerRecordHBAR,
    pricePerRecordUSD: pricing.pricing.finalPricePerRecordUSD,
    pricingCategoryId: pricing.categoryId,
    pricingCategory: pricing.category,
    volumeDiscount: pricing.pricing.volumeDiscount,
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
  
  // Query all matching resources
  filters.limit = 100000; // Large limit for export
  const patients = await queryFHIRResources(filters);
  
  // Format based on requested format
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

