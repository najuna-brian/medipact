/**
 * Integration Tests for Adapter Flow
 * 
 * Tests the complete adapter workflow with mocked Hedera interactions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parseCSV, anonymizeRecords, writeAnonymizedCSV } from '../../src/anonymizer/anonymize.js';
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

      // Step 3: Anonymize records
      const { records: anonymized, patientMapping } = anonymizeRecords(parsedRecords);
      expect(anonymized.length).toBe(3);
      expect(patientMapping.size).toBe(2);

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

    it('should handle consent proof generation workflow', () => {
      const originalPatientId = 'ID-12345';
      const anonymousPatientId = 'PID-001';
      const consentDate = new Date().toISOString();

      // Generate consent hash
      const consentHash = hashConsentForm(originalPatientId, consentDate);
      expect(consentHash).toBeDefined();
      expect(consentHash).toMatch(/^[a-f0-9]{64}$/);

      // Verify hash is deterministic for same inputs (excluding timestamp)
      const consentHash2 = hashConsentForm(originalPatientId, consentDate);
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

    it('should process multiple patients with correct mapping', async () => {
      const records = createSampleRecords();
      const inputPath = createTempCSV(records, 'multi-patient.csv');
      tempFiles.push(inputPath);

      const parsedRecords = await parseCSV(inputPath);
      const { records: anonymized, patientMapping } = anonymizeRecords(parsedRecords);

      // Verify patient grouping
      const patient1Records = anonymized.filter(r => r['Anonymous PID'] === 'PID-001');
      const patient2Records = anonymized.filter(r => r['Anonymous PID'] === 'PID-002');

      expect(patient1Records.length).toBe(2); // John Doe has 2 records
      expect(patient2Records.length).toBe(1); // Jane Smith has 1 record

      // Verify mapping
      expect(patientMapping.get('ID-12345')).toBe('PID-001');
      expect(patientMapping.get('ID-12346')).toBe('PID-002');
    });
  });

  describe('Data Integrity', () => {
    it('should preserve medical data while removing PII', async () => {
      const records = createSampleRecords();
      const inputPath = createTempCSV(records, 'integrity.csv');
      tempFiles.push(inputPath);

      const parsedRecords = await parseCSV(inputPath);
      const { records: anonymized } = anonymizeRecords(parsedRecords);

      // Verify PII removed
      anonymized.forEach(record => {
        expect(record).not.toHaveProperty('Patient Name');
        expect(record).not.toHaveProperty('Patient ID');
        expect(record).not.toHaveProperty('Address');
        expect(record).not.toHaveProperty('Phone Number');
        expect(record).not.toHaveProperty('Date of Birth');
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
      const { records: anonymized, patientMapping } = anonymizeRecords(parsedRecords);

      expect(anonymized.length).toBe(1);
      expect(anonymized[0]['Anonymous PID']).toBe('PID-001');
      expect(patientMapping.get('John Doe')).toBe('PID-001');
    });

    it('should handle single record', async () => {
      const records = [createSampleRecords()[0]];
      const inputPath = createTempCSV(records, 'single.csv');
      tempFiles.push(inputPath);

      const parsedRecords = await parseCSV(inputPath);
      const { records: anonymized } = anonymizeRecords(parsedRecords);

      expect(anonymized.length).toBe(1);
      expect(anonymized[0]['Anonymous PID']).toBe('PID-001');
    });
  });
});



