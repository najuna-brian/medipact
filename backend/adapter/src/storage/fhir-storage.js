/**
 * FHIR Resource Storage
 * 
 * Stores processed FHIR resources to backend database via API.
 */

import axios from 'axios';
import http from 'http';
import https from 'https';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:3002';

/**
 * Store processed FHIR resources to backend
 * @param {Array<Object>} processedResources - Array of processed resources
 * @param {string} hospitalId - Hospital ID
 * @param {string} apiKey - Hospital API key
 * @returns {Promise<Object>} Storage results
 */
export async function storeFHIRResources(processedResources, hospitalId, apiKey) {
  // CRITICAL: Log immediately, synchronously, before any async operations
  console.error(`[Adapter Storage] ===== FUNCTION ENTRY =====`);
  console.error(`[Adapter Storage] storeFHIRResources CALLED`);
  console.error(`[Adapter Storage] resources=${processedResources?.length || 'undefined'}, hospitalId=${hospitalId}, apiKeyPresent=${!!apiKey}`);
  process.stderr.write(`[Adapter Storage] FUNCTION ENTRY: storeFHIRResources called\n`);
  process.stderr.write(`[Adapter Storage] Parameters: resources=${processedResources?.length || 0}, hospitalId=${hospitalId}, apiKeyPresent=${!!apiKey}\n`);
  console.log(`[Adapter Storage] FUNCTION ENTRY: storeFHIRResources called`);
  console.log(`[Adapter Storage] Parameters: resources=${processedResources?.length || 'undefined'}, hospitalId=${hospitalId}, apiKeyPresent=${!!apiKey}`);
  process.stdout.write(`[Adapter Storage] storeFHIRResources called: ${processedResources?.length || 0} resources, hospitalId=${hospitalId}, apiKeyPresent=${!!apiKey}\n`);
  
  // Force flush
  process.stderr.write(`[Adapter Storage] About to await first setImmediate\n`);
  await new Promise(resolve => {
    setImmediate(() => {
      process.stderr.write(`[Adapter Storage] After first setImmediate - callback executed\n`);
      process.stdout.write(`[Adapter Storage] After first setImmediate\n`);
      resolve();
    });
  });
  process.stderr.write(`[Adapter Storage] Past first setImmediate\n`);
  
  if (!processedResources || !Array.isArray(processedResources)) {
    process.stderr.write(`[Adapter Storage] ERROR: processedResources is not an array!\n`);
    return { successful: 0, failed: 0, errors: [{ error: 'Invalid processedResources' }] };
  }
  
  const results = {
    successful: 0,
    failed: 0,
    errors: []
  };

  // Group resources by type for batch storage
  const resourcesByType = {};
  
  try {
    processedResources.forEach(resource => {
      if (!resource || !resource.resourceType) {
        process.stderr.write(`[Adapter Storage] WARNING: Invalid resource: ${JSON.stringify(resource).substring(0, 100)}\n`);
        return;
      }
      const type = resource.resourceType;
      if (!resourcesByType[type]) {
        resourcesByType[type] = [];
      }
      if (resource.processed) {
        resourcesByType[type].push(resource.processed);
      } else {
        process.stderr.write(`[Adapter Storage] WARNING: Resource ${type} missing processed field\n`);
      }
    });
  } catch (error) {
    process.stderr.write(`[Adapter Storage] ERROR grouping resources: ${error.message}\n`);
    return { successful: 0, failed: processedResources.length, errors: [{ error: error.message }] };
  }

  const resourceTypeCount = Object.keys(resourcesByType).length;
  const resourceTypes = Object.keys(resourcesByType);
  console.log(`[Adapter Storage] Grouped into ${resourceTypeCount} resource types: ${resourceTypes.join(', ')}`);
  process.stdout.write(`[Adapter Storage] Grouped into ${resourceTypeCount} resource types: ${resourceTypes.join(', ')}\n`);
  
  console.log(`[Adapter Storage] About to await setImmediate after grouping`);
  await new Promise(resolve => {
    setImmediate(() => {
      console.log(`[Adapter Storage] After grouping setImmediate - callback executed`);
      process.stdout.write(`[Adapter Storage] After grouping setImmediate\n`);
      resolve();
    });
  });
  console.log(`[Adapter Storage] Past grouping setImmediate, continuing...`);

  // Store each resource type
  console.log(`[Adapter Storage] Will process ${resourceTypes.length} resource types`);
  process.stdout.write(`[Adapter Storage] Will process ${resourceTypes.length} resource types\n`);
  console.log(`[Adapter Storage] About to await second setImmediate`);
  await new Promise(resolve => {
    setImmediate(() => {
      console.log(`[Adapter Storage] Second setImmediate callback executed`);
      resolve();
    });
  });
  console.log(`[Adapter Storage] Past second setImmediate, starting loop...`);
  
  console.log(`[Adapter Storage] Starting loop, resourceTypes.length=${resourceTypes.length}`);
  for (let i = 0; i < resourceTypes.length; i++) {
    console.log(`[Adapter Storage] Loop iteration ${i+1}/${resourceTypes.length}`);
    const resourceType = resourceTypes[i];
    const resources = resourcesByType[resourceType];
    console.log(`[Adapter Storage] [${i+1}/${resourceTypes.length}] Processing ${resourceType}: ${resources.length} resources`);
    process.stdout.write(`[Adapter Storage] [${i+1}/${resourceTypes.length}] Processing ${resourceType}: ${resources.length} resources\n`);
    console.log(`[Adapter Storage] About to await setImmediate before storeResourceType`);
    await new Promise(resolve => {
      setImmediate(() => {
        console.log(`[Adapter Storage] Before storeResourceType setImmediate callback executed`);
        process.stdout.write(`[Adapter Storage] Before storeResourceType call\n`);
        resolve();
      });
    });
    console.log(`[Adapter Storage] Past setImmediate, about to call storeResourceType for ${resourceType}`);
    
    try {
      const response = await storeResourceType(resourceType, resources, hospitalId, apiKey);
      process.stdout.write(`[Adapter Storage] [${i+1}/${resourceTypes.length}] Got response for ${resourceType}: success=${response?.success}, created=${response?.results?.created || 0}\n`);
      console.log(`[Adapter Storage] Full response for ${resourceType}:`, JSON.stringify(response, null, 2));
      
      // Check if storage actually succeeded (response might indicate partial failure)
      if (response && response.success !== false && response.results) {
        const created = response.results.created || 0;
        const errors = response.results.errors || [];
        results.successful += created;
        results.failed += (resources.length - created);
        process.stdout.write(`[Adapter Storage] ${resourceType} result: ${created} created, ${errors.length} errors\n`);
        if (errors.length > 0) {
          console.error(`[Adapter Storage] Errors for ${resourceType}:`, errors);
          results.errors.push({
            resourceType,
            error: `Partial failure: ${created} created, ${errors.length} errors`,
            details: errors,
            count: resources.length
          });
        }
      } else {
        // Storage returned failure
        console.error(`[Adapter Storage] ${resourceType} returned failure:`, response);
        process.stderr.write(`[Adapter Storage] ${resourceType} returned failure: ${response?.error || 'unknown error'}\n`);
        process.stderr.write(`[Adapter Storage] Full failure response: ${JSON.stringify(response)}\n`);
        results.failed += resources.length;
        results.errors.push({
          resourceType,
          error: response?.error || 'Storage failed',
          response: response,
          count: resources.length
        });
      }
    } catch (error) {
      process.stderr.write(`[Adapter Storage] Exception storing ${resourceType}: ${error.message}\n`);
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
        hint: isTableMissing ? 'Run POST /api/admin/migrate/fhir to create required tables' : undefined,
        fullError: error
      });
      process.stderr.write(`[Adapter Storage] Full error details: ${JSON.stringify({
        message: error.message,
        code: error.code,
        response: errorData,
        status: error.response?.status
      })}\n`);
      
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

  process.stdout.write(`[Adapter Storage] Final results: ${results.successful} successful, ${results.failed} failed, ${results.errors.length} errors\n`);
  return results;
}

/**
 * Store resources of a specific type
 */
async function storeResourceType(resourceType, resources, hospitalId, apiKey) {
  console.log(`[storeResourceType] FUNCTION ENTRY: resourceType=${resourceType}, resources.length=${resources.length}`);
  const endpoint = getStorageEndpoint(resourceType);
  console.log(`[storeResourceType] Got endpoint: ${endpoint}`);
  
  if (!endpoint) {
    console.error(`[storeResourceType] ERROR: No endpoint for ${resourceType}`);
    throw new Error(`No storage endpoint for resource type: ${resourceType}`);
  }

  const url = `${BACKEND_API_URL}${endpoint}`;
  console.log(`[storeResourceType] Full URL: ${url}`);
  console.log(`[storeResourceType] BACKEND_API_URL from env: ${process.env.BACKEND_API_URL || 'NOT SET (using default)'}`);
  // Use process.stdout.write for immediate output (not buffered)
  process.stdout.write(`[Adapter Storage] Storing ${resourceType}: ${resources.length} resources to ${url}\n`);
  process.stdout.write(`[Adapter Storage] Request details: url=${url}, hospitalId=${hospitalId}, apiKeyPresent=${!!apiKey}, resourceCount=${resources.length}\n`);
  
  try {
    const requestStart = Date.now();
    console.log(`[storeResourceType] About to make axios.post request`);
    process.stdout.write(`[Adapter Storage] Making request to ${url}...\n`);
    process.stdout.write(`[Adapter Storage] Request config: hasApiKey=${!!apiKey}, apiKeyLength=${apiKey?.length || 0}, hospitalId=${hospitalId}, timeout=10000\n`);
    
    // Make the request with timeout
    console.log(`[storeResourceType] Calling axios.post with payload size: ${JSON.stringify({ hospitalId, resources: resources.length }).length} bytes`);
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
        timeout: 10000, // 10 second timeout
        validateStatus: (status) => status < 600, // Accept all status codes
        // Add connection timeout
        httpAgent: new http.Agent({ 
          timeout: 10000,
          keepAlive: false // Disable keep-alive to avoid connection issues
        }),
        httpsAgent: new https.Agent({ 
          timeout: 10000,
          keepAlive: false
        })
      }
    );
    
    console.log(`[storeResourceType] axios.post completed, status=${response.status}`);
    process.stdout.write(`[Adapter Storage] Request completed, processing response...\n`);

    const requestDuration = Date.now() - requestStart;
    const created = response.data?.results?.created || 0;
    const errors = response.data?.results?.errors?.length || 0;
    process.stdout.write(`[Adapter Storage] ✓ Successfully stored ${resourceType} (${requestDuration}ms): status=${response.status}, created=${created}, errors=${errors}\n`);
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
      process.stderr.write(`[Adapter Storage] ✗ Request failed for ${resourceType} (HTTP ${error.response.status}): ${error.message}\n`);
      process.stderr.write(`[Adapter Storage] Error details: ${JSON.stringify(errorDetails)}\n`);
    } else if (error.request) {
      // Request was made but no response received
      errorDetails.requestMade = true;
      errorDetails.noResponse = true;
      process.stderr.write(`[Adapter Storage] ✗ Request failed for ${resourceType} (No response): ${error.message}\n`);
      process.stderr.write(`[Adapter Storage] Error details: ${JSON.stringify(errorDetails)}\n`);
    } else {
      // Error setting up request
      errorDetails.setupError = true;
      process.stderr.write(`[Adapter Storage] ✗ Request failed for ${resourceType} (Setup error): ${error.message}\n`);
      process.stderr.write(`[Adapter Storage] Error details: ${JSON.stringify(errorDetails)}\n`);
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

