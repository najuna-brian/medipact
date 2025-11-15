/**
 * OpenMRS to FHIR Transformer
 * 
 * Transforms OpenMRS REST API responses to FHIR R4 format.
 */

/**
 * Transform OpenMRS resource to FHIR
 * @param {string} resourceType - FHIR resource type
 * @param {Object} openmrsData - OpenMRS API response
 * @param {string} baseUrl - OpenMRS base URL
 * @returns {Object} FHIR resource
 */
export function transformOpenMRSToFHIR(resourceType, openmrsData, baseUrl) {
  switch (resourceType) {
    case 'Patient':
      return transformPatient(openmrsData, baseUrl);
    case 'Encounter':
      return transformEncounter(openmrsData, baseUrl);
    case 'Observation':
      return transformObservation(openmrsData, baseUrl);
    case 'Condition':
      return transformCondition(openmrsData, baseUrl);
    case 'MedicationRequest':
      return transformMedicationRequest(openmrsData, baseUrl);
    case 'AllergyIntolerance':
      return transformAllergy(openmrsData, baseUrl);
    default:
      throw new Error(`Unsupported resource type: ${resourceType}`);
  }
}

function transformPatient(openmrsData, baseUrl) {
  const patient = {
    resourceType: 'Patient',
    id: openmrsData.uuid,
    identifier: [
      {
        system: `${baseUrl}/ws/rest/v1/patient`,
        value: openmrsData.uuid
      }
    ]
  };

  // Name
  if (openmrsData.person && openmrsData.person.names && openmrsData.person.names.length > 0) {
    const name = openmrsData.person.names[0];
    patient.name = [{
      use: name.preferred ? 'official' : 'usual',
      family: name.familyName || '',
      given: [name.givenName || ''].filter(Boolean),
      prefix: name.prefix ? [name.prefix] : []
    }];
  }

  // Gender
  if (openmrsData.person && openmrsData.person.gender) {
    patient.gender = openmrsData.person.gender.toLowerCase();
  }

  // Birth Date
  if (openmrsData.person && openmrsData.person.birthdate) {
    patient.birthDate = openmrsData.person.birthdate.split('T')[0];
  }

  // Address
  if (openmrsData.person && openmrsData.person.addresses && openmrsData.person.addresses.length > 0) {
    const addr = openmrsData.person.addresses[0];
    patient.address = [{
      use: addr.preferred ? 'home' : 'temp',
      line: [addr.address1, addr.address2].filter(Boolean),
      city: addr.cityVillage || '',
      state: addr.stateProvince || '',
      postalCode: addr.postalCode || '',
      country: addr.country || ''
    }];
  }

  // Telecom
  patient.telecom = [];
  if (openmrsData.person && openmrsData.person.attributes) {
    openmrsData.person.attributes.forEach(attr => {
      if (attr.attributeType && attr.value) {
        if (attr.attributeType.uuid === '14d4f066-15f5-102d-96e4-000c29c2a5d7') { // Phone
          patient.telecom.push({
            system: 'phone',
            value: attr.value
          });
        } else if (attr.attributeType.uuid === '8d871d18-c2cc-11de-8d13-0010c6dffd0f') { // Email
          patient.telecom.push({
            system: 'email',
            value: attr.value
          });
        }
      }
    });
  }

  return patient;
}

function transformEncounter(openmrsData, baseUrl) {
  const encounter = {
    resourceType: 'Encounter',
    id: openmrsData.uuid,
    status: 'finished',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: openmrsData.encounterType?.name?.toLowerCase() || 'AMB',
      display: openmrsData.encounterType?.name || 'Ambulatory'
    }
  };

  // Subject (Patient)
  if (openmrsData.patient) {
    encounter.subject = {
      reference: `Patient/${openmrsData.patient.uuid}`
    };
  }

  // Period
  if (openmrsData.encounterDatetime) {
    encounter.period = {
      start: openmrsData.encounterDatetime
    };
  }

  // Type
  if (openmrsData.encounterType) {
    encounter.type = [{
      coding: [{
        system: `${baseUrl}/ws/rest/v1/encountertype`,
        code: openmrsData.encounterType.uuid,
        display: openmrsData.encounterType.name
      }]
    }];
  }

  // Location
  if (openmrsData.location) {
    encounter.location = [{
      location: {
        reference: `Location/${openmrsData.location.uuid}`,
        display: openmrsData.location.name
      }
    }];
  }

  // Diagnoses
  if (openmrsData.diagnoses && openmrsData.diagnoses.length > 0) {
    encounter.diagnosis = openmrsData.diagnoses.map(d => ({
      condition: {
        reference: `Condition/${d.uuid}`,
        display: d.display
      },
      rank: d.rank || 1
    }));
  }

  return encounter;
}

function transformObservation(openmrsData, baseUrl) {
  const observation = {
    resourceType: 'Observation',
    id: openmrsData.uuid,
    status: 'final'
  };

  // Subject
  if (openmrsData.person) {
    observation.subject = {
      reference: `Patient/${openmrsData.person.uuid}`
    };
  }

  // Code (Concept)
  if (openmrsData.concept) {
    observation.code = {
      coding: [{
        system: `${baseUrl}/ws/rest/v1/concept`,
        code: openmrsData.concept.uuid,
        display: openmrsData.concept.display || openmrsData.concept.name?.name
      }]
    };
  }

  // Effective Date
  if (openmrsData.obsDatetime) {
    observation.effectiveDateTime = openmrsData.obsDatetime;
  }

  // Value
  if (openmrsData.value !== null && openmrsData.value !== undefined) {
    if (typeof openmrsData.value === 'number') {
      observation.valueQuantity = {
        value: openmrsData.value,
        unit: openmrsData.concept?.units || ''
      };
    } else if (typeof openmrsData.value === 'string') {
      observation.valueString = openmrsData.value;
    } else if (openmrsData.value.uuid) {
      // Concept answer
      observation.valueCodeableConcept = {
        coding: [{
          system: `${baseUrl}/ws/rest/v1/concept`,
          code: openmrsData.value.uuid,
          display: openmrsData.value.display || openmrsData.value.name?.name
        }]
      };
    }
  }

  // Encounter
  if (openmrsData.encounter) {
    observation.encounter = {
      reference: `Encounter/${openmrsData.encounter.uuid}`
    };
  }

  return observation;
}

function transformCondition(openmrsData, baseUrl) {
  const condition = {
    resourceType: 'Condition',
    id: openmrsData.uuid || openmrsData.diagnosis?.uuid,
    clinicalStatus: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
        code: 'active',
        display: 'Active'
      }]
    }
  };

  // Subject
  if (openmrsData.patient) {
    condition.subject = {
      reference: `Patient/${openmrsData.patient.uuid}`
    };
  }

  // Code
  if (openmrsData.diagnosis || openmrsData.codedDiagnosis) {
    const diagnosis = openmrsData.diagnosis || openmrsData.codedDiagnosis;
    condition.code = {
      coding: [{
        system: `${baseUrl}/ws/rest/v1/concept`,
        code: diagnosis.uuid,
        display: diagnosis.display || diagnosis.name?.name
      }]
    };
  }

  // Onset
  if (openmrsData.onsetDate) {
    condition.onsetDateTime = openmrsData.onsetDate;
  }

  // Encounter
  if (openmrsData.encounter) {
    condition.encounter = {
      reference: `Encounter/${openmrsData.encounter.uuid}`
    };
  }

  return condition;
}

function transformMedicationRequest(openmrsData, baseUrl) {
  const medicationRequest = {
    resourceType: 'MedicationRequest',
    id: openmrsData.uuid,
    status: mapMedicationStatus(openmrsData.voided),
    intent: 'order'
  };

  // Subject
  if (openmrsData.patient) {
    medicationRequest.subject = {
      reference: `Patient/${openmrsData.patient.uuid}`
    };
  }

  // Medication
  if (openmrsData.drug) {
    medicationRequest.medicationCodeableConcept = {
      coding: [{
        system: `${baseUrl}/ws/rest/v1/drug`,
        code: openmrsData.drug.uuid,
        display: openmrsData.drug.name
      }]
    };
  }

  // Dosage
  if (openmrsData.dose || openmrsData.frequency) {
    medicationRequest.dosageInstruction = [{
      text: `${openmrsData.dose || ''} ${openmrsData.doseUnits || ''} ${openmrsData.frequency || ''}`.trim(),
      timing: {
        repeat: {
          frequency: 1,
          period: 1,
          periodUnit: 'd'
        }
      },
      route: openmrsData.route ? {
        coding: [{
          system: `${baseUrl}/ws/rest/v1/concept`,
          code: openmrsData.route.uuid,
          display: openmrsData.route.display
        }]
      } : undefined
    }];
  }

  // Dates
  if (openmrsData.startDate) {
    medicationRequest.authoredOn = openmrsData.startDate;
  }

  if (openmrsData.startDate && openmrsData.duration) {
    const endDate = new Date(openmrsData.startDate);
    endDate.setDate(endDate.getDate() + openmrsData.duration);
    medicationRequest.dosageInstruction[0].timing.bounds = {
      period: {
        start: openmrsData.startDate,
        end: endDate.toISOString()
      }
    };
  }

  return medicationRequest;
}

function transformAllergy(openmrsData, baseUrl) {
  const allergy = {
    resourceType: 'AllergyIntolerance',
    id: openmrsData.uuid,
    clinicalStatus: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical',
        code: 'active',
        display: 'Active'
      }]
    },
    verificationStatus: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/allergyintolerance-verification',
        code: 'confirmed',
        display: 'Confirmed'
      }]
    }
  };

  // Patient
  if (openmrsData.patient) {
    allergy.patient = {
      reference: `Patient/${openmrsData.patient.uuid}`
    };
  }

  // Substance
  if (openmrsData.allergen) {
    allergy.code = {
      coding: [{
        system: `${baseUrl}/ws/rest/v1/concept`,
        code: openmrsData.allergen.codedAllergen?.uuid,
        display: openmrsData.allergen.codedAllergen?.display
      }]
    };
  }

  // Reaction
  if (openmrsData.reactions && openmrsData.reactions.length > 0) {
    allergy.reaction = openmrsData.reactions.map(r => ({
      manifestation: [{
        coding: [{
          system: `${baseUrl}/ws/rest/v1/concept`,
          code: r.reaction?.uuid,
          display: r.reaction?.display
        }]
      }],
      severity: mapSeverity(r.severity)
    }));
  }

  return allergy;
}

function mapMedicationStatus(voided) {
  return voided ? 'cancelled' : 'active';
}

function mapSeverity(severity) {
  const mapping = {
    'MILD': 'mild',
    'MODERATE': 'moderate',
    'SEVERE': 'severe'
  };
  return mapping[severity?.toUpperCase()] || 'unknown';
}

