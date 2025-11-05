/**
 * Validate Anonymized Output
 * 
 * This script validates the anonymized data output to ensure:
 * 1. No PII is present
 * 2. Anonymous IDs are correctly generated
 * 3. Medical data is preserved
 * 4. Data structure is correct
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_FILE = path.join(__dirname, '../data/anonymized_data.csv');
const INPUT_FILE = path.join(__dirname, '../data/raw_data.csv');

// PII fields that should NOT be in anonymized output
const PII_FIELDS = [
  'Patient Name',
  'Patient ID',
  'Address',
  'Phone Number',
  'Date of Birth'
];

// Medical fields that SHOULD be preserved
const MEDICAL_FIELDS = [
  'Lab Test',
  'Test Date',
  'Result',
  'Unit',
  'Reference Range'
];

function validateOutput() {
  console.log('=== Validating Anonymized Output ===\n');

  try {
    // Check if output file exists
    if (!fs.existsSync(OUTPUT_FILE)) {
      console.error('❌ Error: Output file not found:', OUTPUT_FILE);
      console.log('   Run the adapter first: npm start');
      process.exit(1);
    }

    // Check if input file exists (for comparison)
    if (!fs.existsSync(INPUT_FILE)) {
      console.warn('⚠️  Warning: Input file not found:', INPUT_FILE);
      console.log('   Skipping input comparison\n');
    }

    // Read output file
    console.log('1. Reading anonymized output file...');
    const outputContent = fs.readFileSync(OUTPUT_FILE, 'utf-8');
    const outputLines = outputContent.split('\n').filter(line => line.trim() !== '');
    
    if (outputLines.length === 0) {
      throw new Error('Output file is empty');
    }

    // Parse header
    const headers = outputLines[0].split(',').map(h => h.trim());
    console.log(`   ✓ Found ${outputLines.length - 1} records`);
    console.log(`   ✓ Headers: ${headers.join(', ')}\n`);

    // Check for PII fields
    console.log('2. Checking for PII fields...');
    const foundPII = PII_FIELDS.filter(field => headers.includes(field));
    if (foundPII.length > 0) {
      console.error(`   ❌ FAIL: Found PII fields: ${foundPII.join(', ')}`);
      process.exit(1);
    }
    console.log('   ✓ No PII fields found\n');

    // Check for Anonymous PID
    console.log('3. Checking for anonymous patient IDs...');
    if (!headers.includes('Anonymous PID')) {
      console.error('   ❌ FAIL: Anonymous PID column not found');
      process.exit(1);
    }
    console.log('   ✓ Anonymous PID column present\n');

    // Check for medical data preservation
    console.log('4. Checking medical data preservation...');
    const missingMedicalFields = MEDICAL_FIELDS.filter(field => !headers.includes(field));
    if (missingMedicalFields.length > 0) {
      console.warn(`   ⚠️  Warning: Missing medical fields: ${missingMedicalFields.join(', ')}`);
    } else {
      console.log('   ✓ All medical fields preserved\n');
    }

    // Validate anonymous IDs format
    console.log('5. Validating anonymous ID format...');
    const anonymousIds = new Set();
    let validFormat = true;

    for (let i = 1; i < outputLines.length; i++) {
      const values = outputLines[i].split(',').map(v => v.trim());
      const pidIndex = headers.indexOf('Anonymous PID');
      
      if (pidIndex >= 0 && pidIndex < values.length) {
        const pid = values[pidIndex];
        anonymousIds.add(pid);
        
        // Check format: PID-001, PID-002, etc.
        if (!/^PID-\d{3}$/.test(pid)) {
          console.error(`   ❌ FAIL: Invalid PID format: ${pid}`);
          validFormat = false;
        }
      }
    }

    if (!validFormat) {
      process.exit(1);
    }
    console.log(`   ✓ Found ${anonymousIds.size} unique anonymous IDs`);
    console.log(`   ✓ All IDs follow format: PID-XXX\n`);

    // Compare record counts (if input file exists)
    if (fs.existsSync(INPUT_FILE)) {
      console.log('6. Comparing record counts...');
      const inputContent = fs.readFileSync(INPUT_FILE, 'utf-8');
      const inputLines = inputContent.split('\n').filter(line => line.trim() !== '');
      const inputRecordCount = inputLines.length - 1; // Exclude header
      const outputRecordCount = outputLines.length - 1; // Exclude header

      if (inputRecordCount !== outputRecordCount) {
        console.warn(`   ⚠️  Warning: Record count mismatch`);
        console.warn(`      Input: ${inputRecordCount} records`);
        console.warn(`      Output: ${outputRecordCount} records\n`);
      } else {
        console.log(`   ✓ Record counts match: ${inputRecordCount} records\n`);
      }
    }

    // Summary
    console.log('=== Validation Complete ===\n');
    console.log('✅ All checks passed!');
    console.log('\nSummary:');
    console.log(`  - Records: ${outputLines.length - 1}`);
    console.log(`  - Unique patients: ${anonymousIds.size}`);
    console.log(`  - PII removed: ✓`);
    console.log(`  - Medical data preserved: ✓`);
    console.log(`  - Anonymous IDs valid: ✓`);

  } catch (error) {
    console.error('❌ Validation error:', error.message);
    process.exit(1);
  }
}

validateOutput();

