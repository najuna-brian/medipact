/**
 * Fund Existing Accounts Script
 * 
 * Funds all existing researcher accounts that don't have sufficient balance.
 * Useful for accounts created before auto-funding was enabled.
 * 
 * Usage:
 *   node scripts/fund-existing-accounts.js
 *   node scripts/fund-existing-accounts.js --researcher-id RES-XXXXX
 *   node scripts/fund-existing-accounts.js --min-balance 10 --amount 1000
 */

import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { autoFundTestnetAccount, checkAccountBalance, fundIfLowBalance } from '../src/services/testnet-funding-service.js';
import { getAllResearchers } from '../src/db/researcher-db.js';
import { initDatabase } from '../src/db/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Parse command line arguments
const args = process.argv.slice(2);
const researcherIdArg = args.find(arg => arg.startsWith('--researcher-id='))?.split('=')[1];
const minBalanceArg = args.find(arg => arg.startsWith('--min-balance='))?.split('=')[1];
const amountArg = args.find(arg => arg.startsWith('--amount='))?.split('=')[1];

const targetResearcherId = researcherIdArg;
const minBalanceHBAR = minBalanceArg ? parseFloat(minBalanceArg) : 10;
const fundingAmountHBAR = amountArg ? parseFloat(amountArg) : (parseFloat(process.env.TESTNET_FUNDING_AMOUNT_HBAR) || 1000);

async function fundExistingAccounts() {
  try {
    console.log('🔧 Initializing database...');
    await initDatabase();
    console.log('✅ Database initialized\n');

    // Check if auto-funding is enabled
    const autoFundingEnabled = process.env.AUTO_FUND_TESTNET_ACCOUNTS === 'true';
    if (!autoFundingEnabled) {
      console.log('⚠️  Auto-funding is disabled in environment variables.');
      console.log('   This script will still work, but you may want to enable AUTO_FUND_TESTNET_ACCOUNTS=true for future accounts.\n');
    }

    // Check network
    const network = process.env.HEDERA_NETWORK || 'testnet';
    if (network !== 'testnet' && network !== 'previewnet') {
      console.log(`⚠️  Warning: Network is ${network}. Auto-funding only works on testnet/previewnet.\n`);
    }

    console.log('📊 Configuration:');
    console.log(`   Network: ${network}`);
    console.log(`   Min Balance Threshold: ${minBalanceHBAR} HBAR`);
    console.log(`   Funding Amount: ${fundingAmountHBAR} HBAR`);
    console.log(`   Target Researcher: ${targetResearcherId || 'ALL'}\n`);

    // Get researchers
    let researchers;
    if (targetResearcherId) {
      const { getResearcher } = await import('../src/db/researcher-db.js');
      const researcher = await getResearcher(targetResearcherId);
      researchers = researcher ? [researcher] : [];
      if (researchers.length === 0) {
        console.log(`❌ Researcher ${targetResearcherId} not found.`);
        process.exit(1);
      }
    } else {
      researchers = await getAllResearchers();
    }

    console.log(`📋 Found ${researchers.length} researcher(s) to check\n`);

    let fundedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const researcher of researchers) {
      if (!researcher.hederaAccountId) {
        console.log(`⏭️  Skipping ${researcher.researcherId}: No Hedera account`);
        skippedCount++;
        continue;
      }

      console.log(`\n🔍 Checking ${researcher.researcherId} (${researcher.email})...`);
      console.log(`   Account ID: ${researcher.hederaAccountId}`);

      try {
        // Check current balance
        const balanceCheck = await checkAccountBalance(researcher.hederaAccountId, minBalanceHBAR);
        console.log(`   Current Balance: ${balanceCheck.currentBalance} HBAR`);

        if (balanceCheck.hasBalance) {
          console.log(`   ✅ Sufficient balance (${balanceCheck.currentBalance} >= ${minBalanceHBAR} HBAR)`);
          skippedCount++;
          continue;
        }

        // Fund the account
        console.log(`   💰 Funding account with ${fundingAmountHBAR} HBAR...`);
        const fundingResult = await autoFundTestnetAccount(researcher.hederaAccountId, fundingAmountHBAR);

        if (fundingResult.success) {
          console.log(`   ✅ Successfully funded!`);
          console.log(`   Transaction ID: ${fundingResult.transactionId}`);
          console.log(`   HashScan: ${fundingResult.hashScanLink}`);
          fundedCount++;
        } else {
          console.log(`   ❌ Funding failed: ${fundingResult.message}`);
          errorCount++;
        }
      } catch (error) {
        console.error(`   ❌ Error processing ${researcher.researcherId}:`, error.message);
        errorCount++;
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`   ✅ Funded: ${fundedCount}`);
    console.log(`   ⏭️  Skipped: ${skippedCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    console.log('='.repeat(50));

    if (errorCount > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Run the script
fundExistingAccounts();

