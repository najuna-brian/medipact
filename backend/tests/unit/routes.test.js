/**
 * Simple route tests - verify routes can be imported
 */

import { describe, it, expect } from 'vitest';

describe('Route Imports', () => {
  it('should import metrics-api route', async () => {
    const metrics = await import('../../src/routes/metrics-api.js');
    expect(metrics).toBeDefined();
    expect(metrics.default).toBeDefined();
  });

  it('should import marketplace-api route', async () => {
    const marketplace = await import('../../src/routes/marketplace-api.js');
    expect(marketplace).toBeDefined();
    expect(marketplace.default).toBeDefined();
  });

  it('should import patient-api route', async () => {
    const patient = await import('../../src/routes/patient-api.js');
    expect(patient).toBeDefined();
    expect(patient.default).toBeDefined();
  });

  it('should import hospital-api route', async () => {
    const hospital = await import('../../src/routes/hospital-api.js');
    expect(hospital).toBeDefined();
    expect(hospital.default).toBeDefined();
  });
});
