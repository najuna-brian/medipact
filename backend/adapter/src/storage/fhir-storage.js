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
      console.error(`Error storing ${resourceType}:`, error.message);
      results.failed += resources.length;
      results.errors.push({
        resourceType,
        error: error.message,
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

  const response = await axios.post(
    `${BACKEND_API_URL}${endpoint}`,
    {
      hospitalId,
      resources
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-Hospital-Id': hospitalId,
        'X-API-Key': apiKey
      }
    }
  );

  return response.data;
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

