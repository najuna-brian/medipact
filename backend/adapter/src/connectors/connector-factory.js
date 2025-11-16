/**
 * Connector Factory
 * 
 * Creates the appropriate connector based on system type.
 */

import { FHIRConnector } from './fhir-connector.js';
import { OpenMRSConnector } from './openmrs-connector.js';
import { OpenELISConnector } from './openelis-connector.js';
import { MedicConnector } from './medic-connector.js';

/**
 * Get connector instance based on system configuration
 * @param {Object} config - System configuration
 * @returns {BaseConnector} Connector instance
 */
export function getConnector(config) {
  const systemType = config.systemType?.toLowerCase();

  switch (systemType) {
    case 'fhir':
      return new FHIRConnector(config);
    
    case 'openmrs':
      return new OpenMRSConnector(config);
    
    case 'openelis':
      return new OpenELISConnector(config);
    
    case 'medic':
    case 'cht':
    case 'community-health-toolkit':
      return new MedicConnector(config);
    
    default:
      throw new Error(`Unsupported system type: ${systemType}. Supported types: fhir, openmrs, openelis, medic`);
  }
}

/**
 * Validate connector configuration
 * @param {Object} config - System configuration
 * @returns {Object} { valid: boolean, errors: Array<string> }
 */
export function validateConnectorConfig(config) {
  if (!config.systemType) {
    return { valid: false, errors: ['systemType is required'] };
  }

  const connector = getConnector(config);
  return connector.validateConfig();
}

