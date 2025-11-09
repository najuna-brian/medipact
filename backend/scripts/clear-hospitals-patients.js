/**
 * Clear Hospitals and Patients from Database
 * 
 * ⚠️  WARNING: This script will DELETE ALL hospitals, patients, researchers, and related data!
 * Only admin accounts are preserved.
 * 
 * Use this when you need to start fresh with new features (e.g., Hedera Account IDs).
 * 
 * This is a DESTRUCTIVE operation. Use with caution!
 * 
 * Usage:
 *   node scripts/clear-hospitals-patients.js
 */

import { getDatabase, closeDatabase } from '../src/db/database.js';
import { initDatabase } from '../src/db/database.js';

async function clearHospitalsAndPatients() {
  console.log('🗑️  Clearing Hospitals and Patients from Database...\n');

  try {
    // Initialize database connection
    await initDatabase();
    const db = getDatabase();

    console.log('1. Clearing hospital linkages...');
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM hospital_linkages', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('   ✓ Hospital linkages cleared\n');

    console.log('2. Clearing patient contacts...');
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM patient_contacts', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('   ✓ Patient contacts cleared\n');

    console.log('3. Clearing patient identities...');
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM patient_identities', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('   ✓ Patient identities cleared\n');

    console.log('4. Clearing hospitals...');
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM hospitals', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('   ✓ Hospitals cleared\n');

    console.log('5. Clearing researchers...');
    await new Promise((resolve, reject) => {
      db.run('DELETE FROM researchers', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    console.log('   ✓ Researchers cleared\n');

    // Verify admins are still there
    console.log('6. Verifying admin accounts...');
    const adminCount = await new Promise((resolve, reject) => {
      db.get('SELECT COUNT(*) as count FROM admins', (err, row) => {
        if (err) reject(err);
        else resolve(row.count);
      });
    });
    console.log(`   ✓ Admin accounts preserved: ${adminCount}\n`);

    // Get final counts
    const counts = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          (SELECT COUNT(*) FROM hospitals) as hospitals,
          (SELECT COUNT(*) FROM patient_identities) as patients,
          (SELECT COUNT(*) FROM patient_contacts) as contacts,
          (SELECT COUNT(*) FROM hospital_linkages) as linkages,
          (SELECT COUNT(*) FROM researchers) as researchers,
          (SELECT COUNT(*) FROM admins) as admins
      `, (err, rows) => {
        if (err) reject(err);
        else resolve(rows[0]);
      });
    });

    console.log('✅ Database cleared successfully!\n');
    console.log('Final counts:');
    console.log(`  Hospitals: ${counts.hospitals}`);
    console.log(`  Patients: ${counts.patients}`);
    console.log(`  Patient Contacts: ${counts.contacts}`);
    console.log(`  Hospital Linkages: ${counts.linkages}`);
    console.log(`  Researchers: ${counts.researchers}`);
    console.log(`  Admins: ${counts.admins} (preserved)\n`);

    console.log('You can now create new hospitals and patients with all features enabled.\n');

  } catch (error) {
    console.error('❌ Error clearing database:', error);
    process.exit(1);
  } finally {
    closeDatabase();
  }
}

// Run the script
clearHospitalsAndPatients();

