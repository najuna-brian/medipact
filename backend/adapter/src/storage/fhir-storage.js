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
      const response = await storeResourceType(resourceType, resources, hospitalId, apiKey);
      // Check if storage actually succeeded (response might indicate partial failure)
      if (response && response.success !== false && response.results) {
        const created = response.results.created || 0;
        const errors = response.results.errors || [];
        results.successful += created;
        results.failed += (resources.length - created);
        if (errors.length > 0) {
          results.errors.push({
            resourceType,
            error: `Partial failure: ${created} created, ${errors.length} errors`,
            details: errors,
            count: resources.length
          });
        }
      } else {
        // Storage returned failure
        results.failed += resources.length;
        results.errors.push({
          resourceType,
          error: response?.error || error.message || 'Storage failed',
          response: response,
          count: resources.length
        });
      }
    } catch (error) {
      const errorData = error.response?.data || {};
      const isTableMissing = errorData.error?.includes('does not exist') || 
                            errorData.error?.includes('migration');
      
      console.error(`[Adapter Storage] Error storing ${resourceType}:`, {
        message: error.message,
        response: errorData,
        status: error.response?.status,
        statusText: error.response?.statusText,
        count: resources.length,
        endpoint: getStorageEndpoint(resourceType),
        isTableMissing,
        hint: isTableMissing ? 'Run POST /api/admin/migrate/fhir to create required tables' : undefined
      });
      
      results.failed += resources.length;
      results.errors.push({
        resourceType,
        error: errorData.error || error.message,
        response: errorData,
        count: resources.length,
        isTableMissing,
        hint: isTableMissing ? 'FHIR tables missing - run migration endpoint' : undefined
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
  console.log(`[Adapter Storage] Request details:`, {
    url,
    hospitalId,
    apiKeyPresent: !!apiKey,
    resourceCount: resources.length,
    firstResourceKeys: resources[0] ? Object.keys(resources[0]).slice(0, 5) : []
  });
  
  try {
    const requestStart = Date.now();
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
        timeout: 30000, // 30 second timeout
        validateStatus: (status) => status < 600 // Accept all status codes to handle errors properly
      }
    );

    const requestDuration = Date.now() - requestStart;
    console.log(`[Adapter Storage] Successfully stored ${resourceType} (${requestDuration}ms):`, {
      status: response.status,
      statusText: response.statusText,
      success: response.data?.success,
      created: response.data?.results?.created,
      errors: response.data?.results?.errors?.length || 0,
      message: response.data?.message
    });
    return response.data;
  } catch (error) {
    const errorDetails = {
      url,
      message: error.message,
      code: error.code,
      name: error.name
    };
    
    if (error.response) {
      // Request was made and server responded with error
      errorDetails.status = error.response.status;
      errorDetails.statusText = error.response.statusText;
      errorDetails.data = error.response.data;
      console.error(`[Adapter Storage] Request failed for ${resourceType} (HTTP ${error.response.status}):`, errorDetails);
    } else if (error.request) {
      // Request was made but no response received
      errorDetails.requestMade = true;
      errorDetails.noResponse = true;
      console.error(`[Adapter Storage] Request failed for ${resourceType} (No response):`, errorDetails);
    } else {
      // Error setting up request
      errorDetails.setupError = true;
      console.error(`[Adapter Storage] Request failed for ${resourceType} (Setup error):`, errorDetails);
    }
    
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

