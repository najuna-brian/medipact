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
  
  // Create dataset record
  const dataset = await createDataset({
    ...datasetData,
    recordCount,
    dateRangeStart,
    dateRangeEnd,
    conditionCodes: conditionCodes ? JSON.stringify(conditionCodes) : null,
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
  
  return {
    ...dataset,
    preview
  };
}

/**
 * Generate dataset export (FHIR Bundle or CSV)
 * 
 * @param {string} datasetId - Dataset ID
 * @param {string} format - Export format ('fhir', 'csv', 'json')
 * @returns {Promise<Object>} Export data
 */
export async function exportDataset(datasetId, format = 'fhir') {
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
  filters.limit = 10000; // Large limit for export
  const patients = await queryFHIRResources(filters);
  
  // Format based on requested format
  if (format === 'fhir') {
    return formatAsFHIRBundle(patients, dataset);
  } else if (format === 'csv') {
    return formatAsCSV(patients, dataset);
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
 * Format data as CSV
 */
function formatAsCSV(patients, dataset) {
  const headers = ['Anonymous Patient ID', 'Country', 'Age Range', 'Gender'];
  const rows = patients.map(p => [
    p.anonymousPatientId,
    p.country,
    p.ageRange || '',
    p.gender || ''
  ]);
  
  const csv = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  return {
    format: 'csv',
    data: csv,
    recordCount: patients.length,
    datasetId: dataset.id
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

