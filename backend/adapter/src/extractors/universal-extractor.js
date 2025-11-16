/**
 * Universal Data Extractor
 * 
 * Extracts data from ANY healthcare system using the connector framework.
 * Supports: FHIR, OpenMRS, OpenELIS, Medic, and any future connectors.
 */

import { getConnector } from '../connectors/connector-factory.js';

/**
 * Universal Extractor Class
 */
export class UniversalExtractor {
  constructor(systemConfig) {
    this.config = systemConfig;
    this.connector = getConnector(systemConfig);
    this.extractedResources = {};
  }

  /**
   * Extract all available resources from the system
   * @param {Object} options - Extraction options
   * @returns {Promise<Object>} Extracted resources organized by type
   */
  async extractAll(options = {}) {
    const {
      resourceTypes = null, // null = all, or array of specific types
      filters = {},
      limit = null
    } = options;

    console.log(`\n🔌 Connecting to ${this.config.systemType} system: ${this.config.name || this.config.systemId}...`);

    // Connect to system
    const connectionResult = await this.connector.connect();
    console.log(`   ✓ Connected: ${JSON.stringify(connectionResult)}`);

    // Get available resources
    const availableResources = await this.connector.getAvailableResources();
    console.log(`   ✓ Available resources: ${availableResources.join(', ')}`);

    // Determine which resources to extract
    const resourcesToExtract = this.getResourcesToExtract(availableResources, resourceTypes);
    console.log(`   📦 Extracting: ${resourcesToExtract.join(', ')}\n`);

    // Extract each resource type
    const allResources = {};

    for (const resourceType of resourcesToExtract) {
      try {
        console.log(`   Extracting ${resourceType}...`);
        
        const startTime = Date.now();
        const resources = await this.connector.fetchResources(resourceType, {
          ...filters,
          limit: limit
        });
        
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        allResources[resourceType] = resources;
        
        console.log(`   ✓ Extracted ${resources.length} ${resourceType} resources (${duration}s)`);
      } catch (error) {
        console.error(`   ✗ Failed to extract ${resourceType}: ${error.message}`);
        allResources[resourceType] = [];
      }
    }

    this.extractedResources = allResources;

    return {
      systemType: this.config.systemType,
      systemId: this.config.systemId,
      extractedAt: new Date().toISOString(),
      resources: allResources,
      summary: this.generateSummary(allResources)
    };
  }

  /**
   * Extract complete patient bundle
   * @param {string} patientId - Patient identifier
   * @returns {Promise<Object>} FHIR Bundle with all patient resources
   */
  async extractPatientBundle(patientId) {
    console.log(`\n📋 Extracting patient bundle for: ${patientId}...`);

    try {
      const bundle = await this.connector.fetchPatientBundle(patientId);
      console.log(`   ✓ Extracted bundle with ${bundle.entry?.length || 0} resources`);
      return bundle;
    } catch (error) {
      console.error(`   ✗ Failed to extract patient bundle: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract all patients and their complete bundles
   * @param {Object} options - Extraction options
   * @returns {Promise<Array>} Array of patient bundles
   */
  async extractAllPatientBundles(options = {}) {
    const { filters = {}, limit = null } = options;

    console.log(`\n👥 Extracting all patient bundles...`);

    // Get all patient IDs
    const patientIds = await this.connector.fetchPatientIds(filters);
    console.log(`   Found ${patientIds.length} patients`);

    if (limit) {
      patientIds.splice(limit);
      console.log(`   Limiting to ${limit} patients`);
    }

    // Extract bundle for each patient
    const bundles = [];
    for (let i = 0; i < patientIds.length; i++) {
      const patientId = patientIds[i];
      try {
        console.log(`   [${i + 1}/${patientIds.length}] Extracting bundle for patient ${patientId}...`);
        const bundle = await this.extractPatientBundle(patientId);
        bundles.push(bundle);
      } catch (error) {
        console.error(`   ✗ Failed for patient ${patientId}: ${error.message}`);
      }
    }

    return bundles;
  }

  /**
   * Determine which resources to extract
   */
  getResourcesToExtract(availableResources, requestedTypes) {
    if (requestedTypes === null || requestedTypes === 'all') {
      // Extract all available resources
      return availableResources;
    }

    if (Array.isArray(requestedTypes)) {
      // Only extract requested resources that are available
      return requestedTypes.filter(r => availableResources.includes(r));
    }

    // Default: extract core resources
    const coreResources = [
      'Patient',
      'Encounter',
      'Condition',
      'Observation',
      'MedicationRequest',
      'Procedure',
      'DiagnosticReport'
    ];

    return coreResources.filter(r => availableResources.includes(r));
  }

  /**
   * Generate summary of extracted resources
   */
  generateSummary(resources) {
    const summary = {
      totalResources: 0,
      byType: {}
    };

    Object.keys(resources).forEach(resourceType => {
      const count = resources[resourceType].length;
      summary.byType[resourceType] = count;
      summary.totalResources += count;
    });

    return summary;
  }

  /**
   * Get extracted resources
   */
  getExtractedResources() {
    return this.extractedResources;
  }

  /**
   * Disconnect from system
   */
  async disconnect() {
    await this.connector.disconnect();
    console.log('   ✓ Disconnected from system');
  }
}

/**
 * Extract from multiple systems
 * @param {Array<Object>} systemConfigs - Array of system configurations
 * @param {Object} options - Extraction options
 * @returns {Promise<Array>} Array of extraction results
 */
export async function extractFromMultipleSystems(systemConfigs, options = {}) {
  const results = [];

  for (const config of systemConfigs) {
    try {
      const extractor = new UniversalExtractor(config);
      const result = await extractor.extractAll(options);
      results.push(result);
      await extractor.disconnect();
    } catch (error) {
      console.error(`Failed to extract from ${config.systemId}: ${error.message}`);
      results.push({
        systemId: config.systemId,
        error: error.message
      });
    }
  }

  return results;
}

