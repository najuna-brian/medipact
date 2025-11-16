/**
 * OpenMRS Connector
 * 
 * Connects to OpenMRS via REST API and transforms data to FHIR R4 format.
 * OpenMRS REST API: https://rest.openmrs.org/
 */

import { BaseConnector } from './base-connector.js';
import axios from 'axios';
import { transformOpenMRSToFHIR } from '../transformers/openmrs-transformer.js';

export class OpenMRSConnector extends BaseConnector {
  constructor(config) {
    super(config);
    this.baseUrl = config.connection.baseUrl; // e.g., http://localhost:8080/openmrs
    this.username = config.connection.username;
    this.password = config.connection.password;
    this.apiVersion = config.connection.apiVersion || 'v1';
    this.sessionId = null;
  }

  async connect() {
    // OpenMRS uses session-based authentication
    const response = await axios.get(
      `${this.baseUrl}/ws/rest/${this.apiVersion}/session`,
      {
        auth: {
          username: this.username,
          password: this.password
        },
        timeout: 10000
      }
    );

    if (!response.data.authenticated) {
      throw new Error('OpenMRS authentication failed');
    }

    this.sessionId = response.data.sessionId;
    this.connected = true;

    return {
      connected: true,
      authenticated: response.data.authenticated,
      sessionId: this.sessionId,
      user: response.data.user,
      locale: response.data.locale
    };
  }

  async getAvailableResources() {
    // OpenMRS supports these resources (mapped to FHIR)
    return [
      'Patient',
      'Encounter',
      'Observation',
      'Condition',
      'MedicationRequest',
      'Procedure',
      'DiagnosticReport',
      'Immunization',
      'AllergyIntolerance'
    ];
  }

  async fetchResources(resourceType, filters = {}) {
    const endpoint = this.mapResourceToEndpoint(resourceType);
    
    const response = await axios.get(
      `${this.baseUrl}/ws/rest/${this.apiVersion}/${endpoint}`,
      {
        params: this.buildOpenMRSParams(filters),
        headers: this.getHeaders()
      }
    );

    // Transform OpenMRS format to FHIR
    const openmrsData = response.data.results || [];
    return openmrsData.map(item => 
      transformOpenMRSToFHIR(resourceType, item, this.baseUrl)
    );
  }

  async fetchPatientBundle(patientId) {
    // Fetch patient and all related data
    const [patient, encounters, observations, conditions, medications, allergies] = await Promise.all([
      this.fetchOpenMRSPatient(patientId),
      this.fetchOpenMRSEncounters(patientId),
      this.fetchOpenMRSObservations(patientId),
      this.fetchOpenMRSConditions(patientId),
      this.fetchOpenMRSMedications(patientId),
      this.fetchOpenMRSAllergies(patientId)
    ]);

    // Transform to FHIR Bundle
    const bundle = {
      resourceType: 'Bundle',
      type: 'collection',
      entry: []
    };

    if (patient) bundle.entry.push({ resource: patient });
    encounters.forEach(e => bundle.entry.push({ resource: e }));
    observations.forEach(o => bundle.entry.push({ resource: o }));
    conditions.forEach(c => bundle.entry.push({ resource: c }));
    medications.forEach(m => bundle.entry.push({ resource: m }));
    allergies.forEach(a => bundle.entry.push({ resource: a }));

    return bundle;
  }

  async fetchPatientIds(filters = {}) {
    const params = this.buildOpenMRSParams(filters);
    params.v = 'custom:(uuid)'; // Only fetch UUIDs

    const response = await axios.get(
      `${this.baseUrl}/ws/rest/${this.apiVersion}/patient`,
      {
        params,
        headers: this.getHeaders()
      }
    );

    return (response.data.results || []).map(p => p.uuid);
  }

  // OpenMRS-specific fetch methods
  async fetchOpenMRSPatient(patientId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/ws/rest/${this.apiVersion}/patient/${patientId}?v=full`,
        { headers: this.getHeaders() }
      );
      return transformOpenMRSToFHIR('Patient', response.data, this.baseUrl);
    } catch (error) {
      console.error(`Error fetching OpenMRS patient ${patientId}:`, error.message);
      return null;
    }
  }

  async fetchOpenMRSEncounters(patientId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/ws/rest/${this.apiVersion}/encounter`,
        {
          params: { patient: patientId, v: 'full' },
          headers: this.getHeaders()
        }
      );
      return (response.data.results || []).map(e => 
        transformOpenMRSToFHIR('Encounter', e, this.baseUrl)
      );
    } catch (error) {
      console.error(`Error fetching OpenMRS encounters:`, error.message);
      return [];
    }
  }

  async fetchOpenMRSObservations(patientId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/ws/rest/${this.apiVersion}/obs`,
        {
          params: { patient: patientId, v: 'full' },
          headers: this.getHeaders()
        }
      );
      return (response.data.results || []).map(o => 
        transformOpenMRSToFHIR('Observation', o, this.baseUrl)
      );
    } catch (error) {
      console.error(`Error fetching OpenMRS observations:`, error.message);
      return [];
    }
  }

  async fetchOpenMRSConditions(patientId) {
    try {
      // OpenMRS stores diagnoses in encounters
      const encounters = await this.fetchOpenMRSEncounters(patientId);
      const conditions = [];
      
      // Extract diagnoses from encounters
      for (const encounter of encounters) {
        if (encounter.diagnoses) {
          encounter.diagnoses.forEach(diagnosis => {
            conditions.push(transformOpenMRSToFHIR('Condition', {
              ...diagnosis,
              patient: { uuid: patientId },
              encounter: { uuid: encounter.uuid }
            }, this.baseUrl));
          });
        }
      }
      
      return conditions;
    } catch (error) {
      console.error(`Error fetching OpenMRS conditions:`, error.message);
      return [];
    }
  }

  async fetchOpenMRSMedications(patientId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/ws/rest/${this.apiVersion}/drugorder`,
        {
          params: { patient: patientId, v: 'full' },
          headers: this.getHeaders()
        }
      );
      return (response.data.results || []).map(m => 
        transformOpenMRSToFHIR('MedicationRequest', m, this.baseUrl)
      );
    } catch (error) {
      console.error(`Error fetching OpenMRS medications:`, error.message);
      return [];
    }
  }

  async fetchOpenMRSAllergies(patientId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/ws/rest/${this.apiVersion}/allergy`,
        {
          params: { patient: patientId, v: 'full' },
          headers: this.getHeaders()
        }
      );
      return (response.data.results || []).map(a => 
        transformOpenMRSToFHIR('AllergyIntolerance', a, this.baseUrl)
      );
    } catch (error) {
      console.error(`Error fetching OpenMRS allergies:`, error.message);
      return [];
    }
  }

  mapResourceToEndpoint(resourceType) {
    const mapping = {
      'Patient': 'patient',
      'Encounter': 'encounter',
      'Observation': 'obs',
      'Condition': 'diagnosis', // Stored in encounters
      'MedicationRequest': 'drugorder',
      'Procedure': 'procedure',
      'AllergyIntolerance': 'allergy',
      'Immunization': 'immunization'
    };

    return mapping[resourceType] || resourceType.toLowerCase();
  }

  buildOpenMRSParams(filters) {
    const params = {};

    if (filters.patient) params.patient = filters.patient;
    if (filters.startDate) params.fromDate = filters.startDate;
    if (filters.endDate) params.toDate = filters.endDate;
    if (filters.limit) params.limit = filters.limit;
    if (filters.startIndex) params.startIndex = filters.startIndex;

    // Default to full representation
    if (!params.v) params.v = 'full';

    return params;
  }

  getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Cookie': `JSESSIONID=${this.sessionId}`
    };
  }

  validateConfig() {
    const baseValidation = super.validateConfig();
    const errors = [...baseValidation.errors];

    if (!this.baseUrl) {
      errors.push('connection.baseUrl is required for OpenMRS connector');
    }

    if (!this.username) {
      errors.push('connection.username is required for OpenMRS connector');
    }

    if (!this.password) {
      errors.push('connection.password is required for OpenMRS connector');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

