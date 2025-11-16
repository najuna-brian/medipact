/**
 * OpenELIS to FHIR Transformer
 * 
 * Transforms OpenELIS REST API responses to FHIR R4 format.
 */

/**
 * Transform OpenELIS resource to FHIR
 * @param {string} resourceType - FHIR resource type
 * @param {Object} openelisData - OpenELIS API response
 * @param {string} baseUrl - OpenELIS base URL
 * @returns {Object} FHIR resource
 */
export function transformOpenELISToFHIR(resourceType, openelisData, baseUrl) {
  switch (resourceType) {
    case 'Patient':
      return transformPatient(openelisData, baseUrl);
    case 'Observation':
      return transformObservation(openelisData, baseUrl);
    case 'DiagnosticReport':
      return transformDiagnosticReport(openelisData, baseUrl);
    case 'Specimen':
      return transformSpecimen(openelisData, baseUrl);
    default:
      throw new Error(`Unsupported resource type: ${resourceType}`);
  }
}

function transformPatient(openelisData, baseUrl) {
  const patient = {
    resourceType: 'Patient',
    id: openelisData.id || openelisData.patientId,
    identifier: [
      {
        system: `${baseUrl}/api/patients`,
        value: openelisData.id || openelisData.patientId
      }
    ]
  };

  // Name
  if (openelisData.firstName || openelisData.lastName) {
    patient.name = [{
      family: openelisData.lastName || '',
      given: [openelisData.firstName || ''].filter(Boolean)
    }];
  }

  // Gender
  if (openelisData.gender) {
    patient.gender = openelisData.gender.toLowerCase();
  }

  // Birth Date
  if (openelisData.dateOfBirth) {
    patient.birthDate = openelisData.dateOfBirth.split('T')[0];
  }

  // Address
  if (openelisData.address) {
    patient.address = [{
      line: [openelisData.address.street || openelisData.address].filter(Boolean),
      city: openelisData.address.city || '',
      state: openelisData.address.state || '',
      postalCode: openelisData.address.postalCode || '',
      country: openelisData.address.country || ''
    }];
  }

  // Telecom
  patient.telecom = [];
  if (openelisData.phone) {
    patient.telecom.push({
      system: 'phone',
      value: openelisData.phone
    });
  }
  if (openelisData.email) {
    patient.telecom.push({
      system: 'email',
      value: openelisData.email
    });
  }

  return patient;
}

function transformObservation(openelisData, baseUrl) {
  const observation = {
    resourceType: 'Observation',
    id: openelisData.id || openelisData.resultId,
    status: 'final',
    category: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/observation-category',
        code: 'laboratory',
        display: 'Laboratory'
      }]
    }]
  };

  // Subject
  if (openelisData.patientId) {
    observation.subject = {
      reference: `Patient/${openelisData.patientId}`
    };
  }

  // Code (Test)
  if (openelisData.testCode || openelisData.testName) {
    observation.code = {
      coding: [{
        system: 'http://loinc.org',
        code: openelisData.testCode || openelisData.loincCode || '',
        display: openelisData.testName || openelisData.test?.name
      }]
    };
  }

  // Value
  if (openelisData.resultValue !== null && openelisData.resultValue !== undefined) {
    if (typeof openelisData.resultValue === 'number') {
      observation.valueQuantity = {
        value: openelisData.resultValue,
        unit: openelisData.unit || ''
      };
    } else {
      observation.valueString = String(openelisData.resultValue);
    }
  }

  // Reference Range
  if (openelisData.normalRange || (openelisData.normalLow && openelisData.normalHigh)) {
    observation.referenceRange = [{
      low: openelisData.normalLow ? {
        value: openelisData.normalLow,
        unit: openelisData.unit || ''
      } : undefined,
      high: openelisData.normalHigh ? {
        value: openelisData.normalHigh,
        unit: openelisData.unit || ''
      } : undefined,
      text: openelisData.normalRange
    }];
  }

  // Interpretation
  if (openelisData.interpretation || openelisData.abnormal) {
    observation.interpretation = [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/v3-ObservationInterpretation',
        code: mapInterpretation(openelisData.interpretation, openelisData.abnormal),
        display: openelisData.interpretation || (openelisData.abnormal ? 'Abnormal' : 'Normal')
      }]
    }];
  }

  // Effective Date
  if (openelisData.resultDate || openelisData.testDate) {
    observation.effectiveDateTime = openelisData.resultDate || openelisData.testDate;
  }

  // Performer
  if (openelisData.technician || openelisData.performer) {
    observation.performer = [{
      display: openelisData.technician || openelisData.performer
    }];
  }

  // Specimen
  if (openelisData.specimenId) {
    observation.specimen = {
      reference: `Specimen/${openelisData.specimenId}`
    };
  }

  // Diagnostic Report
  if (openelisData.reportId) {
    observation.basedOn = [{
      reference: `DiagnosticReport/${openelisData.reportId}`
    }];
  }

  return observation;
}

function transformDiagnosticReport(openelisData, baseUrl) {
  const report = {
    resourceType: 'DiagnosticReport',
    id: openelisData.id || openelisData.reportId,
    status: mapReportStatus(openelisData.status),
    category: [{
      coding: [{
        system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
        code: 'LAB',
        display: 'Laboratory'
      }]
    }]
  };

  // Subject
  if (openelisData.patientId) {
    report.subject = {
      reference: `Patient/${openelisData.patientId}`
    };
  }

  // Code (Panel/Test Group)
  if (openelisData.panelCode || openelisData.panelName) {
    report.code = {
      coding: [{
        system: 'http://loinc.org',
        code: openelisData.panelCode || '',
        display: openelisData.panelName || openelisData.panel?.name
      }]
    };
  }

  // Effective Date
  if (openelisData.reportDate || openelisData.issuedDate) {
    report.effectiveDateTime = openelisData.reportDate || openelisData.issuedDate;
    report.issued = openelisData.issuedDate || openelisData.reportDate;
  }

  // Performer
  if (openelisData.labName || openelisData.performer) {
    report.performer = [{
      display: openelisData.labName || openelisData.performer
    }];
  }

  // Results (Observations)
  if (openelisData.results && Array.isArray(openelisData.results)) {
    report.result = openelisData.results.map(r => ({
      reference: `Observation/${r.id || r.resultId}`
    }));
  }

  // Conclusion
  if (openelisData.conclusion || openelisData.summary) {
    report.conclusion = openelisData.conclusion || openelisData.summary;
  }

  return report;
}

function transformSpecimen(openelisData, baseUrl) {
  const specimen = {
    resourceType: 'Specimen',
    id: openelisData.id || openelisData.specimenId,
    status: mapSpecimenStatus(openelisData.status)
  };

  // Subject
  if (openelisData.patientId) {
    specimen.subject = {
      reference: `Patient/${openelisData.patientId}`
    };
  }

  // Type
  if (openelisData.specimenType || openelisData.type) {
    specimen.type = {
      coding: [{
        system: 'http://snomed.info/sct',
        code: openelisData.specimenTypeCode || '',
        display: openelisData.specimenType || openelisData.type
      }]
    };
  }

  // Collection
  if (openelisData.collectionDate) {
    specimen.collection = {
      collectedDateTime: openelisData.collectionDate,
      collector: openelisData.collector ? {
        display: openelisData.collector
      } : undefined
    };
  }

  // Container
  if (openelisData.containerType || openelisData.containerId) {
    specimen.container = [{
      type: openelisData.containerType ? {
        coding: [{
          display: openelisData.containerType
        }]
      } : undefined,
      identifier: openelisData.containerId ? [{
        value: openelisData.containerId
      }] : undefined
    }];
  }

  // Received Date
  if (openelisData.receivedDate) {
    specimen.receivedTime = openelisData.receivedDate;
  }

  // Condition
  if (openelisData.condition) {
    specimen.condition = [{
      coding: [{
        display: openelisData.condition
      }]
    }];
  }

  return specimen;
}

function mapInterpretation(interpretation, abnormal) {
  if (interpretation) {
    const upper = interpretation.toUpperCase();
    if (upper.includes('HIGH') || upper.includes('ELEVATED')) return 'H';
    if (upper.includes('LOW') || upper.includes('DECREASED')) return 'L';
    if (upper.includes('NORMAL')) return 'N';
    if (upper.includes('CRITICAL')) return 'LL';
  }
  
  if (abnormal === true || abnormal === 'true') return 'A';
  return 'N';
}

function mapReportStatus(status) {
  const statusMap = {
    'FINAL': 'final',
    'PRELIMINARY': 'preliminary',
    'CORRECTED': 'corrected',
    'CANCELLED': 'cancelled',
    'REGISTERED': 'registered',
    'PARTIAL': 'partial'
  };
  
  return statusMap[status?.toUpperCase()] || 'registered';
}

function mapSpecimenStatus(status) {
  const statusMap = {
    'AVAILABLE': 'available',
    'UNAVAILABLE': 'unavailable',
    'UNSATISFACTORY': 'unsatisfactory',
    'ENTERED_IN_ERROR': 'entered-in-error'
  };
  
  return statusMap[status?.toUpperCase()] || 'available';
}

