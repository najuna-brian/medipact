/**
 * FHIR Module - Main Export
 * 
 * Provides unified interface for FHIR operations:
 * - Parsing FHIR resources
 * - Anonymizing FHIR resources
 * - FHIR API client (file-based and API-based)
 */

export {
  // Parser
  parseFHIRBundle,
  extractPatients,
  extractObservations,
  extractConsents,
  normalizePatient,
  normalizeObservation,
  bundleToRecords,
  isFHIRBundle
} from './fhir-parser.js';

export {
  // Anonymizer
  anonymizeFHIRPatient,
  anonymizeFHIRObservation,
  anonymizeFHIRBundle,
  anonymizeRecordsWithFHIR
} from './fhir-anonymizer.js';

export {
  // Client
  FHIRClient,
  createFHIRClientFromFile,
  createFHIRClientFromAPI
} from './fhir-client.js';

