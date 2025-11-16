/**
 * OpenELIS Connector
 * 
 * Connects to OpenELIS (Open Electronic Laboratory Information System) via REST API.
 * OpenELIS primarily provides laboratory test results and specimen information.
 */

import { BaseConnector } from './base-connector.js';
import axios from 'axios';
import { transformOpenELISToFHIR } from '../transformers/openelis-transformer.js';

export class OpenELISConnector extends BaseConnector {
  constructor(config) {
    super(config);
    this.baseUrl = config.connection.baseUrl; // e.g., http://localhost:8080/openelis
    this.apiKey = config.connection.apiKey;
    this.username = config.connection.username;
    this.password = config.connection.password;
    this.apiVersion = config.connection.apiVersion || 'v1';
  }

  async connect() {
    // Test connection - OpenELIS may use API key or basic auth
    let headers = {};
    
    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    } else if (this.username && this.password) {
      headers['Authorization'] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;
    }

    try {
      const response = await axios.get(
        `${this.baseUrl}/api/${this.apiVersion}/health`,
        {
          headers,
          timeout: 10000
        }
      );

      this.connected = true;

      return {
        connected: true,
        system: 'OpenELIS',
        version: response.data.version || 'Unknown'
      };
    } catch (error) {
      // Try alternative endpoint
      try {
        const response = await axios.get(
          `${this.baseUrl}/rest/health`,
          { headers, timeout: 10000 }
        );
        this.connected = true;
        return { connected: true, system: 'OpenELIS' };
      } catch (e) {
        throw new Error(`OpenELIS connection failed: ${error.message}`);
      }
    }
  }

  async getAvailableResources() {
    // OpenELIS primarily provides lab-related resources
    return [
      'Patient',
      'Observation', // Lab results
      'DiagnosticReport',
      'Specimen',
      'Organization' // Lab organization
    ];
  }

  async fetchResources(resourceType, filters = {}) {
    if (resourceType === 'Observation') {
      return await this.fetchLabResults(filters);
    } else if (resourceType === 'DiagnosticReport') {
      return await this.fetchDiagnosticReports(filters);
    } else if (resourceType === 'Specimen') {
      return await this.fetchSpecimens(filters);
    } else if (resourceType === 'Patient') {
      return await this.fetchPatients(filters);
    }

    // For other resource types, return empty array
    return [];
  }

  async fetchPatientBundle(patientId) {
    // Fetch patient with all lab results
    const [patient, observations, diagnosticReports, specimens] = await Promise.all([
      this.fetchPatient(patientId),
      this.fetchLabResults({ patient: patientId }),
      this.fetchDiagnosticReports({ patient: patientId }),
      this.fetchSpecimens({ patient: patientId })
    ]);

    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: []
    };

    if (patient) bundle.entry.push({ resource: patient });
    observations.forEach(o => bundle.entry.push({ resource: o }));
    diagnosticReports.forEach(d => bundle.entry.push({ resource: d }));
    specimens.forEach(s => bundle.entry.push({ resource: s }));

    return bundle;
  }

  async fetchPatientIds(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/${this.apiVersion}/patients`,
        {
          params: this.buildOpenELISParams(filters),
          headers: this.getHeaders()
        }
      );

      return (response.data || []).map(p => p.id || p.patientId);
    } catch (error) {
      console.error('Error fetching OpenELIS patient IDs:', error.message);
      return [];
    }
  }

  // OpenELIS-specific fetch methods
  async fetchPatient(patientId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/${this.apiVersion}/patients/${patientId}`,
        { headers: this.getHeaders() }
      );
      return transformOpenELISToFHIR('Patient', response.data, this.baseUrl);
    } catch (error) {
      console.error(`Error fetching OpenELIS patient ${patientId}:`, error.message);
      return null;
    }
  }

  async fetchPatients(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/${this.apiVersion}/patients`,
        {
          params: this.buildOpenELISParams(filters),
          headers: this.getHeaders()
        }
      );
      return (response.data || []).map(p => 
        transformOpenELISToFHIR('Patient', p, this.baseUrl)
      );
    } catch (error) {
      console.error('Error fetching OpenELIS patients:', error.message);
      return [];
    }
  }

  async fetchLabResults(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/${this.apiVersion}/results`,
        {
          params: {
            patientId: filters.patient,
            startDate: filters.startDate,
            endDate: filters.endDate,
            testId: filters.testId
          },
          headers: this.getHeaders()
        }
      );

      // Transform OpenELIS lab results to FHIR Observations
      return (response.data || []).map(result => 
        transformOpenELISToFHIR('Observation', result, this.baseUrl)
      );
    } catch (error) {
      console.error('Error fetching OpenELIS lab results:', error.message);
      return [];
    }
  }

  async fetchDiagnosticReports(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/${this.apiVersion}/reports`,
        {
          params: {
            patientId: filters.patient,
            startDate: filters.startDate,
            endDate: filters.endDate
          },
          headers: this.getHeaders()
        }
      );

      return (response.data || []).map(report => 
        transformOpenELISToFHIR('DiagnosticReport', report, this.baseUrl)
      );
    } catch (error) {
      console.error('Error fetching OpenELIS diagnostic reports:', error.message);
      return [];
    }
  }

  async fetchSpecimens(filters = {}) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/api/${this.apiVersion}/specimens`,
        {
          params: {
            patientId: filters.patient,
            startDate: filters.startDate,
            endDate: filters.endDate
          },
          headers: this.getHeaders()
        }
      );

      return (response.data || []).map(specimen => 
        transformOpenELISToFHIR('Specimen', specimen, this.baseUrl)
      );
    } catch (error) {
      console.error('Error fetching OpenELIS specimens:', error.message);
      return [];
    }
  }

  buildOpenELISParams(filters) {
    const params = {};

    if (filters.patient) params.patientId = filters.patient;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    if (filters.limit) params.limit = filters.limit;
    if (filters.offset) params.offset = filters.offset;

    return params;
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.apiKey) {
      headers['X-API-Key'] = this.apiKey;
    } else if (this.username && this.password) {
      headers['Authorization'] = `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}`;
    }

    return headers;
  }

  validateConfig() {
    const baseValidation = super.validateConfig();
    const errors = [...baseValidation.errors];

    if (!this.baseUrl) {
      errors.push('connection.baseUrl is required for OpenELIS connector');
    }

    if (!this.apiKey && (!this.username || !this.password)) {
      errors.push('Either connection.apiKey or connection.username/password is required for OpenELIS connector');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

