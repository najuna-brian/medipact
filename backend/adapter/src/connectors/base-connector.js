/**
 * Base Connector Interface
 * 
 * All healthcare system connectors must implement this interface.
 * This ensures consistent behavior across different systems (OpenMRS, OpenELIS, Medic, FHIR, etc.)
 */

export class BaseConnector {
  constructor(config) {
    this.config = config;
    this.systemType = config.systemType; // 'fhir', 'openmrs', 'openelis', 'medic'
    this.systemId = config.systemId;
    this.hospitalId = config.hospitalId;
    this.connected = false;
  }

  /**
   * Connect to the healthcare system
   * @returns {Promise<Object>} Connection result with system capabilities
   */
  async connect() {
    throw new Error('connect() must be implemented by connector');
  }

  /**
   * Disconnect from the system
   */
  async disconnect() {
    this.connected = false;
  }

  /**
   * Test connection to the system
   * @returns {Promise<boolean>} True if connection successful
   */
  async testConnection() {
    try {
      const result = await this.connect();
      return result.connected === true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get list of available FHIR resource types this system supports
   * @returns {Promise<Array<string>>} Array of FHIR resource type names
   */
  async getAvailableResources() {
    throw new Error('getAvailableResources() must be implemented by connector');
  }

  /**
   * Fetch resources of a specific type
   * @param {string} resourceType - FHIR resource type (Patient, Observation, etc.)
   * @param {Object} filters - Query filters (date range, patient, etc.)
   * @returns {Promise<Array<Object>>} Array of FHIR resources
   */
  async fetchResources(resourceType, filters = {}) {
    throw new Error('fetchResources() must be implemented by connector');
  }

  /**
   * Fetch complete patient bundle (all resources for a patient)
   * @param {string} patientId - Patient identifier in source system
   * @returns {Promise<Object>} FHIR Bundle containing all patient resources
   */
  async fetchPatientBundle(patientId) {
    throw new Error('fetchPatientBundle() must be implemented by connector');
  }

  /**
   * Fetch all patients (for bulk extraction)
   * @param {Object} filters - Filters (date range, etc.)
   * @returns {Promise<Array<string>>} Array of patient IDs
   */
  async fetchPatientIds(filters = {}) {
    throw new Error('fetchPatientIds() must be implemented by connector');
  }

  /**
   * Get system metadata (version, capabilities, etc.)
   * @returns {Promise<Object>} System metadata
   */
  async getSystemMetadata() {
    return {
      systemType: this.systemType,
      systemId: this.systemId,
      connected: this.connected
    };
  }

  /**
   * Validate configuration
   * @returns {Object} { valid: boolean, errors: Array<string> }
   */
  validateConfig() {
    const errors = [];
    
    if (!this.config.systemType) {
      errors.push('systemType is required');
    }
    
    if (!this.config.systemId) {
      errors.push('systemId is required');
    }
    
    if (!this.config.hospitalId) {
      errors.push('hospitalId is required');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}

