/**
 * Medic (Community Health Toolkit) to FHIR Transformer
 * 
 * Transforms Medic/CHT CouchDB documents to FHIR R4 format.
 */

/**
 * Transform Medic resource to FHIR
 * @param {string} resourceType - FHIR resource type
 * @param {Object} medicData - Medic CouchDB document
 * @param {string} baseUrl - Medic base URL
 * @returns {Object} FHIR resource
 */
export function transformMedicToFHIR(resourceType, medicData, baseUrl) {
  switch (resourceType) {
    case 'Patient':
      return transformPatient(medicData, baseUrl);
    case 'Encounter':
      return transformEncounter(medicData, baseUrl);
    case 'Observation':
      return transformObservation(medicData, baseUrl);
    case 'Condition':
      return transformCondition(medicData, baseUrl);
    case 'MedicationRequest':
      return transformMedicationRequest(medicData, baseUrl);
    case 'Immunization':
      return transformImmunization(medicData, baseUrl);
    default:
      throw new Error(`Unsupported resource type: ${resourceType}`);
  }
}

function transformPatient(medicData, baseUrl) {
  const patient = {
    resourceType: 'Patient',
    id: medicData._id,
    identifier: [
      {
        system: `${baseUrl}/api/contacts`,
        value: medicData._id
      }
    ]
  };

  // Name
  if (medicData.name || (medicData.fields && medicData.fields.patient_name)) {
    const name = medicData.name || medicData.fields.patient_name;
    const nameParts = name.split(' ');
    patient.name = [{
      family: nameParts[nameParts.length - 1] || '',
      given: nameParts.slice(0, -1).filter(Boolean)
    }];
  }

  // Gender
  if (medicData.sex || (medicData.fields && medicData.fields.sex)) {
    const gender = (medicData.sex || medicData.fields.sex).toLowerCase();
    patient.gender = gender === 'm' || gender === 'male' ? 'male' : 
                     gender === 'f' || gender === 'female' ? 'female' : 'other';
  }

  // Birth Date
  if (medicData.date_of_birth || (medicData.fields && medicData.fields.date_of_birth)) {
    const dob = medicData.date_of_birth || medicData.fields.date_of_birth;
    patient.birthDate = dob.split('T')[0];
  }

  // Age (if DOB not available)
  if (!patient.birthDate && (medicData.age || (medicData.fields && medicData.fields.age))) {
    const age = medicData.age || medicData.fields.age;
    // Calculate approximate birth date
    const today = new Date();
    const birthYear = today.getFullYear() - parseInt(age);
    patient.birthDate = `${birthYear}-01-01`; // Approximate
  }

  // Address
  if (medicData.fields) {
    const addr = [];
    if (medicData.fields.address) addr.push(medicData.fields.address);
    if (medicData.fields.village) addr.push(medicData.fields.village);
    
    if (addr.length > 0 || medicData.fields.district || medicData.fields.country) {
      patient.address = [{
        line: addr,
        city: medicData.fields.city || medicData.fields.district || '',
        district: medicData.fields.district || '',
        state: medicData.fields.state || '',
        country: medicData.fields.country || ''
      }];
    }
  }

  // Telecom
  patient.telecom = [];
  if (medicData.phone || (medicData.fields && medicData.fields.phone)) {
    patient.telecom.push({
      system: 'phone',
      value: medicData.phone || medicData.fields.phone
    });
  }

  return patient;
}

function transformEncounter(medicData, baseUrl) {
  const encounter = {
    resourceType: 'Encounter',
    id: medicData._id,
    status: 'finished',
    class: {
      system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
      code: 'HH', // Home health
      display: 'Home Health'
    }
  };

  // Subject
  if (medicData.contact || medicData.patient_id) {
    encounter.subject = {
      reference: `Patient/${medicData.contact || medicData.patient_id}`
    };
  }

  // Period
  if (medicData.reported_date) {
    encounter.period = {
      start: new Date(medicData.reported_date).toISOString()
    };
  }

  // Type (from form type)
  if (medicData.form) {
    encounter.type = [{
      coding: [{
        system: `${baseUrl}/api/forms`,
        code: medicData.form,
        display: medicData.form
      }]
    }];
  }

  // Location
  if (medicData.fields && medicData.fields.location) {
    encounter.location = [{
      location: {
        display: medicData.fields.location
      }
    }];
  }

  return encounter;
}

function transformObservation(medicData, baseUrl) {
  // Extract observations from form fields
  const observations = [];
  
  if (!medicData.fields) {
    return null; // No data to transform
  }

  // Common vital signs and measurements
  const vitalFields = {
    'temperature': '8310-5', // Body temperature
    'heart_rate': '8867-4', // Heart rate
    'blood_pressure_systolic': '8480-6', // Systolic BP
    'blood_pressure_diastolic': '8462-4', // Diastolic BP
    'respiratory_rate': '9279-1', // Respiratory rate
    'oxygen_saturation': '2708-6', // O2 saturation
    'weight': '29463-7', // Body weight
    'height': '8302-2', // Body height
    'bmi': '39156-5' // BMI
  };

  Object.keys(vitalFields).forEach(field => {
    if (medicData.fields[field] !== undefined && medicData.fields[field] !== null) {
      const observation = {
        resourceType: 'Observation',
        id: `${medicData._id}-${field}`,
        status: 'final',
        category: [{
          coding: [{
            system: 'http://terminology.hl7.org/CodeSystem/observation-category',
            code: 'vital-signs',
            display: 'Vital Signs'
          }]
        }],
        code: {
          coding: [{
            system: 'http://loinc.org',
            code: vitalFields[field],
            display: field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          }]
        },
        subject: {
          reference: `Patient/${medicData.contact || medicData.patient_id}`
        },
        effectiveDateTime: medicData.reported_date ? new Date(medicData.reported_date).toISOString() : undefined
      };

      // Value
      const value = medicData.fields[field];
      if (typeof value === 'number') {
        observation.valueQuantity = {
          value: value,
          unit: getUnitForField(field)
        };
      } else {
        observation.valueString = String(value);
      }

      observations.push(observation);
    }
  });

  // Return first observation or create a generic one
  if (observations.length > 0) {
    return observations[0]; // Return first, or could return array
  }

  // Generic observation from form data
  return {
    resourceType: 'Observation',
    id: medicData._id,
    status: 'final',
    code: {
      coding: [{
        system: `${baseUrl}/api/forms`,
        code: medicData.form || 'unknown',
        display: medicData.form || 'Form Data'
      }]
    },
    subject: {
      reference: `Patient/${medicData.contact || medicData.patient_id}`
    },
    effectiveDateTime: medicData.reported_date ? new Date(medicData.reported_date).toISOString() : undefined,
    valueString: JSON.stringify(medicData.fields)
  };
}

function transformCondition(medicData, baseUrl) {
  const condition = {
    resourceType: 'Condition',
    id: medicData._id,
    clinicalStatus: {
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/condition-clinical',
        code: 'active',
        display: 'Active'
      }]
    }
  };

  // Subject
  if (medicData.contact || medicData.patient_id) {
    condition.subject = {
      reference: `Patient/${medicData.contact || medicData.patient_id}`
    };
  }

  // Code (Diagnosis)
  if (medicData.fields && medicData.fields.diagnosis) {
    condition.code = {
      text: medicData.fields.diagnosis
    };
  }

  // Onset
  if (medicData.reported_date) {
    condition.onsetDateTime = new Date(medicData.reported_date).toISOString();
  }

  return condition;
}

function transformMedicationRequest(medicData, baseUrl) {
  const medicationRequest = {
    resourceType: 'MedicationRequest',
    id: medicData._id,
    status: 'active',
    intent: 'order'
  };

  // Subject
  if (medicData.contact || medicData.patient_id) {
    medicationRequest.subject = {
      reference: `Patient/${medicData.contact || medicData.patient_id}`
    };
  }

  // Medication
  if (medicData.fields && medicData.fields.medication) {
    medicationRequest.medicationCodeableConcept = {
      text: medicData.fields.medication
    };
  }

  // Dosage
  if (medicData.fields && (medicData.fields.dosage || medicData.fields.frequency)) {
    medicationRequest.dosageInstruction = [{
      text: `${medicData.fields.dosage || ''} ${medicData.fields.frequency || ''}`.trim()
    }];
  }

  // Authored Date
  if (medicData.reported_date) {
    medicationRequest.authoredOn = new Date(medicData.reported_date).toISOString();
  }

  return medicationRequest;
}

function transformImmunization(medicData, baseUrl) {
  const immunization = {
    resourceType: 'Immunization',
    id: medicData._id,
    status: 'completed',
    vaccineCode: {
      text: medicData.fields?.vaccine || medicData.fields?.vaccination || 'Unknown'
    }
  };

  // Patient
  if (medicData.contact || medicData.patient_id) {
    immunization.patient = {
      reference: `Patient/${medicData.contact || medicData.patient_id}`
    };
  }

  // Occurrence
  if (medicData.reported_date) {
    immunization.occurrenceDateTime = new Date(medicData.reported_date).toISOString();
  }

  return immunization;
}

function getUnitForField(field) {
  const units = {
    'temperature': '°C',
    'heart_rate': '/min',
    'blood_pressure_systolic': 'mmHg',
    'blood_pressure_diastolic': 'mmHg',
    'respiratory_rate': '/min',
    'oxygen_saturation': '%',
    'weight': 'kg',
    'height': 'cm',
    'bmi': 'kg/m²'
  };
  return units[field] || '';
}

