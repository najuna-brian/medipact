/**
 * FHIR R4 Native Connector
 * 
 * Connects to any FHIR-compliant system (Epic, Cerner, HAPI FHIR, etc.)
 * Uses standard FHIR R4 RESTful API.
 */

import { BaseConnector } from './base-connector.js';
import axios from 'axios';

export class FHIRConnector extends BaseConnector {
  constructor(config) {
    super(config);
    this.baseUrl = config.connection.baseUrl;
    this.authType = config.connection.authType || 'bearer'; // bearer, basic, oauth2
    this.authToken = config.connection.authToken || config.connection.apiKey;
    this.clientId = config.connection.clientId;
    this.clientSecret = config.connection.clientSecret;
    this.tokenUrl = config.connection.tokenUrl;
    this.accessToken = null;
  }

  async connect() {
    // Authenticate if OAuth2
    if (this.authType === 'oauth2' && this.clientId && this.clientSecret) {
      await this.authenticateOAuth2();
    }

    // Test connection with CapabilityStatement
    const response = await axios.get(`${this.baseUrl}/metadata`, {
      headers: this.getHeaders(),
      timeout: 10000
    });

    if (response.data.resourceType !== 'CapabilityStatement') {
      throw new Error('Invalid FHIR server response');
    }

    this.connected = true;

    return {
      connected: true,
      fhirVersion: response.data.fhirVersion,
      supportedResources: this.extractSupportedResources(response.data),
      system: response.data.software?.name || 'Unknown',
      version: response.data.software?.version || 'Unknown'
    };
  }

  async authenticateOAuth2() {
    if (!this.tokenUrl) {
      throw new Error('OAuth2 tokenUrl is required');
    }

    const response = await axios.post(
      this.tokenUrl,
      new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        scope: 'system/*.read'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    this.accessToken = response.data.access_token;
    return this.accessToken;
  }

  async getAvailableResources() {
    const response = await axios.get(`${this.baseUrl}/metadata`, {
      headers: this.getHeaders()
    });

    return this.extractSupportedResources(response.data);
  }

  async fetchResources(resourceType, filters = {}) {
    const params = this.buildSearchParams(filters);
    
    const response = await axios.get(
      `${this.baseUrl}/${resourceType}`,
      {
        params,
        headers: this.getHeaders(),
        timeout: 30000
      }
    );

    // Handle pagination
    return await this.handlePagination(response.data, resourceType);
  }

  async fetchPatientBundle(patientId) {
    // Fetch patient with all related resources using _include
    const includes = [
      'Patient:organization',
      'Encounter:patient',
      'Condition:patient',
      'Observation:subject',
      'MedicationRequest:patient',
      'MedicationAdministration:patient',
      'MedicationStatement:subject',
      'Procedure:subject',
      'DiagnosticReport:subject',
      'ImagingStudy:patient',
      'Immunization:patient',
      'AllergyIntolerance:patient',
      'CarePlan:subject',
      'CareTeam:subject',
      'DeviceUseStatement:subject',
      'Specimen:subject'
    ];

    const response = await axios.get(
      `${this.baseUrl}/Patient/${patientId}`,
      {
        params: {
          _include: includes.join(','),
          _revinclude: includes.join(',')
        },
        headers: this.getHeaders()
      }
    );

    return response.data;
  }

  async fetchPatientIds(filters = {}) {
    const params = this.buildSearchParams(filters);
    params._elements = 'id'; // Only fetch IDs for performance

    const response = await axios.get(
      `${this.baseUrl}/Patient`,
      {
        params,
        headers: this.getHeaders()
      }
    );

    const allPatients = await this.handlePagination(response.data, 'Patient');
    return allPatients.map(p => p.id || p.identifier?.[0]?.value);
  }

  getHeaders() {
    const headers = {
      'Accept': 'application/fhir+json',
      'Content-Type': 'application/fhir+json'
    };

    if (this.authType === 'bearer') {
      const token = this.accessToken || this.authToken;
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } else if (this.authType === 'basic') {
      if (this.authToken) {
        headers['Authorization'] = `Basic ${this.authToken}`;
      }
    }

    return headers;
  }

  extractSupportedResources(capabilityStatement) {
    const resources = [];
    
    if (capabilityStatement.rest && capabilityStatement.rest[0]) {
      const rest = capabilityStatement.rest[0];
      if (rest.resource) {
        rest.resource.forEach(resource => {
          // Check if resource supports read/search
          if (resource.interaction) {
            const hasRead = resource.interaction.some(i => 
              i.code === 'read' || i.code === 'search-type'
            );
            if (hasRead) {
              resources.push(resource.type);
            }
          } else {
            // If no interaction specified, assume supported
            resources.push(resource.type);
          }
        });
      }
    }

    return resources;
  }

  buildSearchParams(filters) {
    const params = {};

    // Standard FHIR search parameters
    if (filters.date) params._lastUpdated = filters.date;
    if (filters.startDate) params._lastUpdated = `ge${filters.startDate}`;
    if (filters.endDate) {
      if (params._lastUpdated) {
        params._lastUpdated += `&_lastUpdated=le${filters.endDate}`;
      } else {
        params._lastUpdated = `le${filters.endDate}`;
      }
    }
    if (filters.status) params.status = filters.status;
    if (filters.code) params.code = filters.code;
    if (filters.patient) params.patient = filters.patient;
    if (filters.encounter) params.encounter = filters.encounter;
    if (filters.category) params.category = filters.category;

    // Pagination
    if (filters._count) params._count = filters._count;
    if (filters._offset) params._offset = filters._offset;

    return params;
  }

  async handlePagination(bundle, resourceType) {
    const allResources = bundle.entry?.map(e => e.resource).filter(Boolean) || [];

    // Follow next links for pagination
    let nextLink = bundle.link?.find(l => l.relation === 'next')?.url;

    while (nextLink) {
      try {
        const response = await axios.get(nextLink, {
          headers: this.getHeaders()
        });

        const nextBundle = response.data;
        allResources.push(...(nextBundle.entry?.map(e => e.resource).filter(Boolean) || []));

        nextLink = nextBundle.link?.find(l => l.relation === 'next')?.url;
      } catch (error) {
        console.error(`Error fetching next page: ${error.message}`);
        break;
      }
    }

    return allResources;
  }

  validateConfig() {
    const baseValidation = super.validateConfig();
    const errors = [...baseValidation.errors];

    if (!this.baseUrl) {
      errors.push('connection.baseUrl is required for FHIR connector');
    }

    if (this.authType === 'oauth2') {
      if (!this.clientId) errors.push('connection.clientId is required for OAuth2');
      if (!this.clientSecret) errors.push('connection.clientSecret is required for OAuth2');
      if (!this.tokenUrl) errors.push('connection.tokenUrl is required for OAuth2');
    } else if (this.authType === 'bearer' && !this.authToken) {
      errors.push('connection.authToken is required for bearer authentication');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

