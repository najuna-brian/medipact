/**
 * FHIR Client
 * 
 * Client for interacting with FHIR APIs (RESTful).
 * 
 * Currently supports reading from FHIR Bundle files.
 * Future: Full FHIR API integration with OAuth authentication.
 * 
 * Follows FHIR R4 RESTful API specification.
 */

/**
 * FHIR Client Class
 * 
 * Supports both file-based (current) and API-based (future) FHIR access.
 */
export class FHIRClient {
  /**
   * Constructor
   * @param {Object} options - Configuration options
   * @param {string} options.baseUrl - FHIR server base URL (for API mode)
   * @param {string} options.authToken - OAuth token (for API mode)
   * @param {string} options.filePath - Path to FHIR Bundle file (for file mode)
   */
  constructor(options = {}) {
    this.baseUrl = options.baseUrl;
    this.authToken = options.authToken;
    this.filePath = options.filePath;
  }
  
  /**
   * Fetch FHIR Bundle from file or API
   * @returns {Promise<Object>} FHIR Bundle
   */
  async fetchBundle() {
    if (this.filePath) {
      // File-based mode (current implementation)
      return await this.fetchBundleFromFile(this.filePath);
    } else if (this.baseUrl) {
      // API-based mode (future implementation)
      return await this.fetchBundleFromAPI();
    } else {
      throw new Error('FHIR client requires either filePath or baseUrl');
    }
  }
  
  /**
   * Fetch FHIR Bundle from file
   * @param {string} filePath - Path to FHIR Bundle JSON file
   * @returns {Promise<Object>} FHIR Bundle
   */
  async fetchBundleFromFile(filePath) {
    const fs = await import('fs');
    const content = await fs.promises.readFile(filePath, 'utf-8');
    const bundle = JSON.parse(content);
    
    if (bundle.resourceType !== 'Bundle') {
      throw new Error('File is not a valid FHIR Bundle');
    }
    
    return bundle;
  }
  
  /**
   * Fetch FHIR Bundle from API (future implementation)
   * @returns {Promise<Object>} FHIR Bundle
   */
  async fetchBundleFromAPI() {
    // TODO: Implement FHIR API calls
    // Example:
    // const response = await fetch(`${this.baseUrl}/Patient?_include=Patient:general-practitioner&_include=Observation:subject`, {
    //   headers: {
    //     'Authorization': `Bearer ${this.authToken}`,
    //     'Accept': 'application/fhir+json'
    //   }
    // });
    // return await response.json();
    
    throw new Error('FHIR API mode not yet implemented. Use filePath for file-based access.');
  }
  
  /**
   * Get Patient resource by ID
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} FHIR Patient resource
   */
  async getPatient(patientId) {
    if (this.baseUrl) {
      // API mode
      const response = await fetch(`${this.baseUrl}/Patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Accept': 'application/fhir+json'
        }
      });
      return await response.json();
    } else {
      throw new Error('getPatient() requires API mode (baseUrl)');
    }
  }
  
  /**
   * Get Observations for a patient
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array<Object>>} Array of FHIR Observation resources
   */
  async getObservations(patientId) {
    if (this.baseUrl) {
      // API mode
      const response = await fetch(`${this.baseUrl}/Observation?patient=${patientId}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Accept': 'application/fhir+json'
        }
      });
      const bundle = await response.json();
      return bundle.entry?.map(e => e.resource) || [];
    } else {
      throw new Error('getObservations() requires API mode (baseUrl)');
    }
  }
  
  /**
   * Get Consents for a patient
   * @param {string} patientId - Patient ID
   * @returns {Promise<Array<Object>>} Array of FHIR Consent resources
   */
  async getConsents(patientId) {
    if (this.baseUrl) {
      // API mode
      const response = await fetch(`${this.baseUrl}/Consent?patient=${patientId}`, {
        headers: {
          'Authorization': `Bearer ${this.authToken}`,
          'Accept': 'application/fhir+json'
        }
      });
      const bundle = await response.json();
      return bundle.entry?.map(e => e.resource) || [];
    } else {
      throw new Error('getConsents() requires API mode (baseUrl)');
    }
  }
}

/**
 * Create FHIR client from file path (convenience function)
 * @param {string} filePath - Path to FHIR Bundle file
 * @returns {FHIRClient} FHIR client instance
 */
export function createFHIRClientFromFile(filePath) {
  return new FHIRClient({ filePath });
}

/**
 * Create FHIR client from API (convenience function)
 * @param {string} baseUrl - FHIR server base URL
 * @param {string} authToken - OAuth token
 * @returns {FHIRClient} FHIR client instance
 */
export function createFHIRClientFromAPI(baseUrl, authToken) {
  return new FHIRClient({ baseUrl, authToken });
}

