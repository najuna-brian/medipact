/**
 * FHIR Resource Storage
 * 
 * Stores processed FHIR resources to backend database via API.
 */

import axios from 'axios';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3002';

/**
 * Store processed FHIR resources to backend
 * @param {Array<Object>} processedResources - Array of processed resources
 * @param {string} hospitalId - Hospital ID
 * @param {string} apiKey - Hospital API key
 * @returns {Promise<Object>} Storage results
 */
export async function storeFHIRResources(processedResources, hospitalId, apiKey) {
  const results = {
    successful: 0,
    failed: 0,
    errors: []
  };

  // Group resources by type for batch storage
  const resourcesByType = {};
  
  processedResources.forEach(resource => {
    const type = resource.resourceType;
    if (!resourcesByType[type]) {
      resourcesByType[type] = [];
    }
    resourcesByType[type].push(resource.processed);
  });

  // Store each resource type
  for (const [resourceType, resources] of Object.entries(resourcesByType)) {
    try {
      await storeResourceType(resourceType, resources, hospitalId, apiKey);
      results.successful += resources.length;
    } catch (error) {
      console.error(`[Adapter Storage] Error storing ${resourceType}:`, {
        message: error.message,
        response: error.response?.data || error.response?.status || 'No response',
        status: error.response?.status,
        statusText: error.response?.statusText,
        count: resources.length,
        endpoint: getStorageEndpoint(resourceType)
      });
      results.failed += resources.length;
      results.errors.push({
        resourceType,
        error: error.message,
        response: error.response?.data || error.response?.status,
        count: resources.length
      });
    }
  }

  return results;
}

/**
 * Store resources of a specific type
 */
async function storeResourceType(resourceType, resources, hospitalId, apiKey) {
  const endpoint = getStorageEndpoint(resourceType);
  
  if (!endpoint) {
    throw new Error(`No storage endpoint for resource type: ${resourceType}`);
  }

  const url = `${BACKEND_API_URL}${endpoint}`;
  console.log(`[Adapter Storage] Storing ${resourceType}: ${resources.length} resources to ${url}`);
  
  try {
    const response = await axios.post(
      url,
      {
        hospitalId,
        resources
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-Hospital-ID': hospitalId,
          'X-API-Key': apiKey
        },
        timeout: 30000 // 30 second timeout
      }
    );

    console.log(`[Adapter Storage] Successfully stored ${resourceType}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`[Adapter Storage] Request failed for ${resourceType}:`, {
      url,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      code: error.code
    });
    throw error;
  }
}

/**
 * Get storage endpoint for resource type
 */
function getStorageEndpoint(resourceType) {
  const endpoints = {
    'Patient': '/api/adapter/store-fhir-patients',
    'Encounter': '/api/adapter/store-fhir-encounters',
    'Condition': '/api/adapter/store-fhir-conditions',
    'Observation': '/api/adapter/store-fhir-observations',
    'MedicationRequest': '/api/adapter/store-fhir-medication-requests',
    'MedicationAdministration': '/api/adapter/store-fhir-medication-administrations',
    'MedicationStatement': '/api/adapter/store-fhir-medication-statements',
    'Procedure': '/api/adapter/store-fhir-procedures',
    'DiagnosticReport': '/api/adapter/store-fhir-diagnostic-reports',
    'ImagingStudy': '/api/adapter/store-fhir-imaging-studies',
    'Specimen': '/api/adapter/store-fhir-specimens',
    'AllergyIntolerance': '/api/adapter/store-fhir-allergies',
    'Immunization': '/api/adapter/store-fhir-immunizations',
    'CarePlan': '/api/adapter/store-fhir-care-plans',
    'CareTeam': '/api/adapter/store-fhir-care-teams',
    'Device': '/api/adapter/store-fhir-devices',
    'Organization': '/api/adapter/store-fhir-organizations',
    'Practitioner': '/api/adapter/store-fhir-practitioners',
    'Location': '/api/adapter/store-fhir-locations',
    'Coverage': '/api/adapter/store-fhir-coverage',
    'RelatedPerson': '/api/adapter/store-fhir-related-persons',
    'Provenance': '/api/adapter/store-fhir-provenance',
    'AuditEvent': '/api/adapter/store-fhir-audit-events'
  };

  return endpoints[resourceType];
}

/**
 * Store complete patient bundle
 * @param {Object} bundle - FHIR Bundle
 * @param {string} hospitalId - Hospital ID
 * @param {string} apiKey - Hospital API key
 * @returns {Promise<Object>} Storage results
 */
export async function storePatientBundle(bundle, hospitalId, apiKey) {
  if (!bundle.entry || bundle.entry.length === 0) {
    return { successful: 0, failed: 0, errors: [] };
  }

  // Extract all resources from bundle
  const resources = bundle.entry
    .map(entry => entry.resource)
    .filter(Boolean);

  // Process and store
  // Note: This would need the full context with patient mapping
  // For now, return the resources for processing
  return {
    resources,
    count: resources.length
  };
}

