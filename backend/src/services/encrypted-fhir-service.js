/**
 * Encrypted FHIR Service
 * 
 * Wrapper around FHIR database operations that automatically:
 * - Encrypts sensitive fields before storing
 * - Decrypts fields only for authorized hospitals/patients
 * - Returns encrypted data to platform (zero-knowledge)
 */

import {
  createFHIRPatient,
  createFHIRCondition,
  createFHIRObservation,
  queryFHIRResources,
  getFHIRPatientByAnonymousId
} from '../db/fhir-db.js';
import {
  encryptObjectFields,
  decryptObjectFields,
  encryptObjectFieldsWithPatientKey,
  decryptObjectFieldsWithPatientKey,
  PATIENT_ENCRYPTED_FIELDS,
  MEDICAL_ENCRYPTED_FIELDS
} from './field-encryption-service.js';
import { hasDecryptionPrivileges, getAuthorizedEntity } from '../middleware/access-control.js';

/**
 * Create encrypted FHIR patient record
 * Automatically encrypts sensitive fields with hospital key
 */
export async function createEncryptedFHIRPatient(patientData, hospitalId) {
  // Encrypt sensitive fields before storing
  const encryptedData = await encryptObjectFields(
    patientData,
    PATIENT_ENCRYPTED_FIELDS.filter(f => patientData[f] !== undefined),
    hospitalId
  );
  
  // Store encrypted data
  return await createFHIRPatient(encryptedData);
}

/**
 * Get FHIR patient with automatic decryption for authorized entities
 */
export async function getEncryptedFHIRPatient(anonymousPatientId, req = null) {
  const patient = await getFHIRPatientByAnonymousId(anonymousPatientId);
  
  if (!patient) {
    return null;
  }
  
  // Check if request has decryption privileges
  if (req && hasDecryptionPrivileges(req)) {
    const entity = getAuthorizedEntity(req);
    
    if (entity.type === 'hospital') {
      // Decrypt with hospital key
      return await decryptObjectFields(
        patient,
        PATIENT_ENCRYPTED_FIELDS,
        entity.id
      );
    } else if (entity.type === 'patient') {
      // Decrypt with patient key
      return await decryptObjectFieldsWithPatientKey(
        patient,
        PATIENT_ENCRYPTED_FIELDS,
        entity.id
      );
    }
  }
  
  // Platform access - return encrypted data (zero-knowledge)
  return patient;
}

/**
 * Create encrypted FHIR condition
 */
export async function createEncryptedFHIRCondition(conditionData, hospitalId) {
  // Encrypt sensitive fields
  const encryptedData = await encryptObjectFields(
    conditionData,
    MEDICAL_ENCRYPTED_FIELDS.filter(f => conditionData[f] !== undefined),
    hospitalId
  );
  
  return await createFHIRCondition(encryptedData);
}

/**
 * Create encrypted FHIR observation
 */
export async function createEncryptedFIRObservation(observationData, hospitalId) {
  // Encrypt sensitive fields
  const encryptedData = await encryptObjectFields(
    observationData,
    MEDICAL_ENCRYPTED_FIELDS.filter(f => observationData[f] !== undefined),
    hospitalId
  );
  
  return await createFIRObservation(encryptedData);
}

/**
 * Query FHIR resources with automatic decryption for authorized entities
 */
export async function queryEncryptedFHIRResources(filters, req = null) {
  // Execute query (returns encrypted data)
  const results = await queryFHIRResources(filters);
  
  // Check if request has decryption privileges
  if (req && hasDecryptionPrivileges(req)) {
    const entity = getAuthorizedEntity(req);
    
    if (entity.type === 'hospital') {
      // Decrypt all results with hospital key
      const decryptedResults = [];
      for (const result of results) {
        const decrypted = await decryptObjectFields(
          result,
          [...PATIENT_ENCRYPTED_FIELDS, ...MEDICAL_ENCRYPTED_FIELDS],
          entity.id
        );
        decryptedResults.push(decrypted);
      }
      return decryptedResults;
    } else if (entity.type === 'patient') {
      // Decrypt all results with patient key
      const decryptedResults = [];
      for (const result of results) {
        const decrypted = await decryptObjectFieldsWithPatientKey(
          result,
          [...PATIENT_ENCRYPTED_FIELDS, ...MEDICAL_ENCRYPTED_FIELDS],
          entity.id
        );
        decryptedResults.push(decrypted);
      }
      return decryptedResults;
    }
  }
  
  // Platform access - return encrypted data (zero-knowledge)
  return results;
}

/**
 * Batch decrypt results for authorized entity
 */
export async function decryptFHIRResults(results, entityType, entityId) {
  const fieldsToDecrypt = [...PATIENT_ENCRYPTED_FIELDS, ...MEDICAL_ENCRYPTED_FIELDS];
  const decryptedResults = [];
  
  for (const result of results) {
    let decrypted;
    if (entityType === 'hospital') {
      decrypted = await decryptObjectFields(result, fieldsToDecrypt, entityId);
    } else if (entityType === 'patient') {
      decrypted = await decryptObjectFieldsWithPatientKey(result, fieldsToDecrypt, entityId);
    } else {
      // Unknown entity type - return encrypted
      decrypted = result;
    }
    decryptedResults.push(decrypted);
  }
  
  return decryptedResults;
}

