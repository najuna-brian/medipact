/**
 * Medic (Community Health Toolkit) Connector
 * 
 * Connects to Medic Mobile/CHT via REST API.
 * Medic is used for community health worker programs and mobile health data collection.
 * API Documentation: https://docs.communityhealthtoolkit.org/apps/guides/development/api/
 */

import { BaseConnector } from './base-connector.js';
import axios from 'axios';
import { transformMedicToFHIR } from '../transformers/medic-transformer.js';

export class MedicConnector extends BaseConnector {
  constructor(config) {
    super(config);
    this.baseUrl = config.connection.baseUrl; // e.g., https://medic.example.com
    this.username = config.connection.username;
    this.password = config.connection.password;
    this.apiKey = config.connection.apiKey;
    this.couchDbUrl = config.connection.couchDbUrl || this.baseUrl;
  }

  async connect() {
    // Medic uses CouchDB with basic auth or API key
    let auth = {};
    
    if (this.apiKey) {
      auth = { headers: { 'Authorization': `Bearer ${this.apiKey}` } };
    } else if (this.username && this.password) {
      auth = {
        auth: {
          username: this.username,
          password: this.password
        }
      };
    }

    try {
      // Test connection with _session endpoint
      const response = await axios.get(
        `${this.baseUrl}/_session`,
        {
          ...auth,
          timeout: 10000
        }
      );

      if (!response.data.userCtx || !response.data.userCtx.name) {
        throw new Error('Medic authentication failed');
      }

      this.connected = true;

      return {
        connected: true,
        authenticated: true,
        user: response.data.userCtx.name,
        roles: response.data.userCtx.roles || []
      };
    } catch (error) {
      // Try alternative endpoint
      try {
        const response = await axios.get(
          `${this.baseUrl}/api/info`,
          { ...auth, timeout: 10000 }
        );
        this.connected = true;
        return { connected: true, system: 'Medic CHT' };
      } catch (e) {
        throw new Error(`Medic connection failed: ${error.message}`);
      }
    }
  }

  async getAvailableResources() {
    // Medic provides patient data, forms, and reports
    return [
      'Patient',
      'Observation', // Form data, vital signs
      'Encounter', // Visits/contacts
      'Condition', // Diagnoses from forms
      'MedicationRequest', // Medications from forms
      'Immunization', // Vaccinations
      'CarePlan', // Care plans
      'QuestionnaireResponse' // Form responses
    ];
  }

  async fetchResources(resourceType, filters = {}) {
    if (resourceType === 'Patient') {
      return await this.fetchMedicPatients(filters);
    } else if (resourceType === 'Observation') {
      return await this.fetchMedicObservations(filters);
    } else if (resourceType === 'Encounter') {
      return await this.fetchMedicEncounters(filters);
    } else if (resourceType === 'Condition') {
      return await this.fetchMedicConditions(filters);
    } else if (resourceType === 'MedicationRequest') {
      return await this.fetchMedicMedications(filters);
    } else if (resourceType === 'Immunization') {
      return await this.fetchMedicImmunizations(filters);
    }

    return [];
  }

  async fetchPatientBundle(patientId) {
    // Fetch patient with all related data
    const [patient, encounters, observations, conditions, medications, immunizations] = await Promise.all([
      this.fetchMedicPatient(patientId),
      this.fetchMedicEncounters({ patient: patientId }),
      this.fetchMedicObservations({ patient: patientId }),
      this.fetchMedicConditions({ patient: patientId }),
      this.fetchMedicMedications({ patient: patientId }),
      this.fetchMedicImmunizations({ patient: patientId })
    ]);

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
    immunizations.forEach(i => bundle.entry.push({ resource: i }));

    return bundle;
  }

  async fetchPatientIds(filters = {}) {
    try {
      // Query CouchDB for patient IDs
      const response = await axios.post(
        `${this.couchDbUrl}/_find`,
        {
          selector: {
            type: 'person',
            ...(filters.startDate && { reported_date: { $gte: new Date(filters.startDate).getTime() } }),
            ...(filters.endDate && { reported_date: { $lte: new Date(filters.endDate).getTime() } })
          },
          fields: ['_id'],
          limit: filters.limit || 1000
        },
        { headers: this.getHeaders() }
      );

      return (response.data.docs || []).map(doc => doc._id);
    } catch (error) {
      console.error('Error fetching Medic patient IDs:', error.message);
      return [];
    }
  }

  // Medic-specific fetch methods
  async fetchMedicPatient(patientId) {
    try {
      const response = await axios.get(
        `${this.couchDbUrl}/${patientId}`,
        { headers: this.getHeaders() }
      );
      return transformMedicToFHIR('Patient', response.data, this.baseUrl);
    } catch (error) {
      console.error(`Error fetching Medic patient ${patientId}:`, error.message);
      return null;
    }
  }

  async fetchMedicPatients(filters = {}) {
    try {
      const response = await axios.post(
        `${this.couchDbUrl}/_find`,
        {
          selector: {
            type: 'person',
            ...(filters.startDate && { reported_date: { $gte: new Date(filters.startDate).getTime() } }),
            ...(filters.endDate && { reported_date: { $lte: new Date(filters.endDate).getTime() } })
          },
          limit: filters.limit || 100
        },
        { headers: this.getHeaders() }
      );

      return (response.data.docs || []).map(p => 
        transformMedicToFHIR('Patient', p, this.baseUrl)
      );
    } catch (error) {
      console.error('Error fetching Medic patients:', error.message);
      return [];
    }
  }

  async fetchMedicEncounters(filters = {}) {
    try {
      const response = await axios.post(
        `${this.couchDbUrl}/_find`,
        {
          selector: {
            type: 'data_record',
            contact: filters.patient,
            ...(filters.startDate && { reported_date: { $gte: new Date(filters.startDate).getTime() } }),
            ...(filters.endDate && { reported_date: { $lte: new Date(filters.endDate).getTime() } })
          },
          limit: filters.limit || 100
        },
        { headers: this.getHeaders() }
      );

      return (response.data.docs || []).map(e => 
        transformMedicToFHIR('Encounter', e, this.baseUrl)
      );
    } catch (error) {
      console.error('Error fetching Medic encounters:', error.message);
      return [];
    }
  }

  async fetchMedicObservations(filters = {}) {
    try {
      // Observations come from form data
      const response = await axios.post(
        `${this.couchDbUrl}/_find`,
        {
          selector: {
            type: 'data_record',
            contact: filters.patient,
            form: { $exists: true },
            ...(filters.startDate && { reported_date: { $gte: new Date(filters.startDate).getTime() } }),
            ...(filters.endDate && { reported_date: { $lte: new Date(filters.endDate).getTime() } })
          },
          limit: filters.limit || 100
        },
        { headers: this.getHeaders() }
      );

      // Transform form data to observations
      const observations = [];
      (response.data.docs || []).forEach(doc => {
        const obs = transformMedicToFHIR('Observation', doc, this.baseUrl);
        if (obs) observations.push(obs);
      });

      return observations;
    } catch (error) {
      console.error('Error fetching Medic observations:', error.message);
      return [];
    }
  }

  async fetchMedicConditions(filters = {}) {
    try {
      // Conditions come from form data with diagnosis fields
      const response = await axios.post(
        `${this.couchDbUrl}/_find`,
        {
          selector: {
            type: 'data_record',
            contact: filters.patient,
            'fields.diagnosis': { $exists: true },
            ...(filters.startDate && { reported_date: { $gte: new Date(filters.startDate).getTime() } })
          },
          limit: filters.limit || 100
        },
        { headers: this.getHeaders() }
      );

      return (response.data.docs || []).map(c => 
        transformMedicToFHIR('Condition', c, this.baseUrl)
      );
    } catch (error) {
      console.error('Error fetching Medic conditions:', error.message);
      return [];
    }
  }

  async fetchMedicMedications(filters = {}) {
    try {
      const response = await axios.post(
        `${this.couchDbUrl}/_find`,
        {
          selector: {
            type: 'data_record',
            contact: filters.patient,
            'fields.medication': { $exists: true },
            ...(filters.startDate && { reported_date: { $gte: new Date(filters.startDate).getTime() } })
          },
          limit: filters.limit || 100
        },
        { headers: this.getHeaders() }
      );

      return (response.data.docs || []).map(m => 
        transformMedicToFHIR('MedicationRequest', m, this.baseUrl)
      );
    } catch (error) {
      console.error('Error fetching Medic medications:', error.message);
      return [];
    }
  }

  async fetchMedicImmunizations(filters = {}) {
    try {
      const response = await axios.post(
        `${this.couchDbUrl}/_find`,
        {
          selector: {
            type: 'data_record',
            contact: filters.patient,
            'fields.vaccine': { $exists: true },
            ...(filters.startDate && { reported_date: { $gte: new Date(filters.startDate).getTime() } })
          },
          limit: filters.limit || 100
        },
        { headers: this.getHeaders() }
      );

      return (response.data.docs || []).map(i => 
        transformMedicToFHIR('Immunization', i, this.baseUrl)
      );
    } catch (error) {
      console.error('Error fetching Medic immunizations:', error.message);
      return [];
    }
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    return headers;
  }

  validateConfig() {
    const baseValidation = super.validateConfig();
    const errors = [...baseValidation.errors];

    if (!this.baseUrl) {
      errors.push('connection.baseUrl is required for Medic connector');
    }

    if (!this.apiKey && (!this.username || !this.password)) {
      errors.push('Either connection.apiKey or connection.username/password is required for Medic connector');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

