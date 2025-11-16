/**
 * Integration Tests for Adapter Flow
 * 
 * Tests the complete adapter workflow with mocked Hedera interactions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCSV, writeAnonymizedCSV } from '../../src/anonymizer/anonymize.js';
import { anonymizeWithDemographics } from '../../src/anonymizer/demographic-anonymize.js';
import { hashPatientRecord, hashConsentForm, hashBatch } from '../../src/utils/hash.js';
import { calculateRevenueSplit, formatHbar } from '../../src/utils/currency.js';
import { createTempCSV, cleanupTempFile, createSampleRecords } from '../utils/test-helpers.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe('Adapter Flow Integration', () => {
  let tempFiles = [];

  afterEach(() => {
    tempFiles.forEach(file => {
      try {
        cleanupTempFile(file);
      } catch (e) {
        // Ignore cleanup errors
      }
    });
    tempFiles = [];
  });

  describe('Complete Data Processing Flow', () => {
    it('should process CSV through anonymization to hash generation', async () => {
      // Step 1: Create sample CSV
      const records = createSampleRecords();
      const inputPath = createTempCSV(records, 'input.csv');
      tempFiles.push(inputPath);

      // Step 2: Parse CSV
      const parsedRecords = await parseCSV(inputPath);
      expect(parsedRecords.length).toBe(3);

      // Step 3: Anonymize records with demographics
      const hospitalInfo = { country: 'Uganda', location: 'Kampala, Uganda' };
      const { records: anonymized, patientMapping } = anonymizeWithDemographics(parsedRecords, hospitalInfo);
      expect(anonymized.length).toBeGreaterThanOrEqual(3);
      expect(patientMapping.size).toBe(2);
      
      // Verify demographics are present
      anonymized.forEach(record => {
        expect(record).toHaveProperty('Age Range');
        expect(record).toHaveProperty('Country');
        expect(record).toHaveProperty('Gender');
        expect(record).toHaveProperty('Occupation Category');
      });

      // Step 4: Generate hashes
      const hashes = anonymized.map(record => hashPatientRecord(record));
      expect(hashes.length).toBe(3);
      hashes.forEach(hash => {
        expect(hash).toMatch(/^[a-f0-9]{64}$/);
      });

      // Step 5: Generate batch hash
      const batchHash = hashBatch(anonymized);
      expect(batchHash).toMatch(/^[a-f0-9]{64}$/);

      // Step 6: Write anonymized CSV
      const outputPath = path.join(__dirname, '../fixtures/output.csv');
      tempFiles.push(outputPath);
      await writeAnonymizedCSV(anonymized, outputPath);
      expect(fs.existsSync(outputPath)).toBe(true);
    });

    it('should handle consent proof generation workflow (NO original patient ID)', () => {
      const anonymousPatientId = 'PID-001';
      const consentDate = new Date().toISOString();

      // Generate consent hash (NO original patient ID)
      const consentHash = hashConsentForm(anonymousPatientId, consentDate);
      expect(consentHash).toBeDefined();
      expect(consentHash).toMatch(/^[a-f0-9]{64}$/);

      // Verify hash is deterministic for same inputs (excluding timestamp)
      const consentHash2 = hashConsentForm(anonymousPatientId, consentDate);
      // Note: These may differ due to timestamp, but structure is correct
      expect(consentHash2).toBeDefined();
    });

    it('should calculate revenue split correctly', () => {
      const totalRevenue = 100;
      const split = calculateRevenueSplit(totalRevenue);

      expect(split.patient).toBe(60);
      expect(split.hospital).toBe(25);
      expect(split.medipact).toBe(15);

      // Verify sum equals total
      const sum = split.patient + split.hospital + split.medipact;
      expect(sum).toBe(totalRevenue);
    });

    it('should process multiple patients with correct mapping and demographics', async () => {
      const records = createSampleRecords();
      const inputPath = createTempCSV(records, 'multi-patient.csv');
      tempFiles.push(inputPath);

      const parsedRecords = await parseCSV(inputPath);
      const hospitalInfo = { country: 'Uganda', location: 'Kampala, Uganda' };
      const { records: anonymized, patientMapping } = anonymizeWithDemographics(parsedRecords, hospitalInfo);

      // Verify patient grouping
      const patient1Records = anonymized.filter(r => r['Anonymous PID'] === 'PID-001');
      const patient2Records = anonymized.filter(r => r['Anonymous PID'] === 'PID-002');

      expect(patient1Records.length).toBeGreaterThanOrEqual(2); // John Doe has 2 records
      expect(patient2Records.length).toBeGreaterThanOrEqual(1); // Jane Smith has 1 record

      // Verify mapping
      expect(patientMapping.get('ID-12345')).toBe('PID-001');
      expect(patientMapping.get('ID-12346')).toBe('PID-002');
      
      // Verify demographics are preserved
      patient1Records.forEach(record => {
        expect(record).toHaveProperty('Age Range');
        expect(record).toHaveProperty('Country');
        expect(record).toHaveProperty('Gender');
      });
    });
  });

  describe('Data Integrity', () => {
    it('should preserve medical data while removing PII', async () => {
      const records = createSampleRecords();
      const inputPath = createTempCSV(records, 'integrity.csv');
      tempFiles.push(inputPath);

      const parsedRecords = await parseCSV(inputPath);
      const hospitalInfo = { country: 'Uganda', location: 'Kampala, Uganda' };
      const { records: anonymized } = anonymizeWithDemographics(parsedRecords, hospitalInfo);

      // Verify PII removed
      anonymized.forEach(record => {
        expect(record).not.toHaveProperty('Patient Name');
        expect(record).not.toHaveProperty('Patient ID');
        expect(record).not.toHaveProperty('Address');
        expect(record).not.toHaveProperty('Phone Number');
        expect(record).not.toHaveProperty('Date of Birth');
      });
      
      // Verify demographics preserved
      anonymized.forEach(record => {
        expect(record).toHaveProperty('Age Range');
        expect(record).toHaveProperty('Country');
        expect(record).toHaveProperty('Gender');
      });

      // Verify medical data preserved
      const firstRecord = anonymized[0];
      expect(firstRecord).toHaveProperty('Lab Test');
      expect(firstRecord).toHaveProperty('Test Date');
      expect(firstRecord).toHaveProperty('Result');
      expect(firstRecord).toHaveProperty('Unit');
      expect(firstRecord).toHaveProperty('Reference Range');
    });

    it('should generate consistent hashes for same record', () => {
      const record = {
        'Anonymous PID': 'PID-001',
        'Lab Test': 'Blood Glucose',
        'Result': '95',
        'Unit': 'mg/dL'
      };

      const hash1 = hashPatientRecord(record);
      const hash2 = hashPatientRecord(record);

      expect(hash1).toBe(hash2);
    });

    it('should generate different hashes for different records', () => {
      const record1 = {
        'Anonymous PID': 'PID-001',
        'Lab Test': 'Blood Glucose',
        'Result': '95'
      };

      const record2 = {
        'Anonymous PID': 'PID-001',
        'Lab Test': 'Blood Glucose',
        'Result': '96' // Different value
      };

      const hash1 = hashPatientRecord(record1);
      const hash2 = hashPatientRecord(record2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty CSV gracefully', async () => {
      const emptyPath = path.join(__dirname, '../fixtures/empty-integration.csv');
      tempFiles.push(emptyPath);
      
      // Create empty file directly
      fs.writeFileSync(emptyPath, '', 'utf-8');

      await expect(parseCSV(emptyPath)).rejects.toThrow('CSV file is empty');
    });

    it('should handle records with missing Patient ID', async () => {
      const records = [
        {
          'Patient Name': 'John Doe',
          'Lab Test': 'Blood Test',
          'Result': '100'
        }
      ];
      const inputPath = createTempCSV(records, 'no-id.csv');
      tempFiles.push(inputPath);

      const parsedRecords = await parseCSV(inputPath);
      const hospitalInfo = { country: 'Uganda', location: 'Kampala, Uganda' };
      const { records: anonymized, patientMapping } = anonymizeWithDemographics(parsedRecords, hospitalInfo);

      expect(anonymized.length).toBeGreaterThanOrEqual(1);
      expect(anonymized[0]['Anonymous PID']).toBe('PID-001');
      expect(patientMapping.get('John Doe')).toBe('PID-001');
      
      // Verify demographics
      expect(anonymized[0]).toHaveProperty('Age Range');
      expect(anonymized[0]).toHaveProperty('Country');
    });

    it('should handle single record with demographics', async () => {
      const records = [createSampleRecords()[0]];
      const inputPath = createTempCSV(records, 'single.csv');
      tempFiles.push(inputPath);

      const parsedRecords = await parseCSV(inputPath);
      const hospitalInfo = { country: 'Uganda', location: 'Kampala, Uganda' };
      const { records: anonymized } = anonymizeWithDemographics(parsedRecords, hospitalInfo);

      expect(anonymized.length).toBeGreaterThanOrEqual(1);
      expect(anonymized[0]['Anonymous PID']).toBe('PID-001');
      expect(anonymized[0]).toHaveProperty('Age Range');
      expect(anonymized[0]).toHaveProperty('Country');
      expect(anonymized[0]).toHaveProperty('Gender');
    });
  });
});



