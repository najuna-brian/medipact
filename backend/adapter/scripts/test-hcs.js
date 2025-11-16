/**
 * Test HCS Integration
 * 
 * This script tests the Hedera Consensus Service integration:
 * 1. Creates a test topic
 * 2. Submits a test message
 * 3. Displays HashScan link
 */

import { createHederaClient, createTopic, submitMessage, getHashScanLink } from '../src/hedera/hcs-client.js';

async function testHCS() {
  console.log('=== Testing HCS Integration ===\n');

  try {
    // Initialize client
    console.log('1. Initializing Hedera client...');
    const client = createHederaClient();
    console.log('   ✓ Client initialized\n');

    // Create topic
    console.log('2. Creating test topic...');
    const topicId = await createTopic(client, 'MediPact Test Topic');
    console.log(`   ✓ Topic created: ${topicId}\n`);

    // Submit test message
    console.log('3. Submitting test message...');
    const testMessage = 'Hello from MediPact! This is a test message.';
    const transactionId = await submitMessage(client, topicId, testMessage);
    console.log(`   ✓ Message submitted\n`);

    // Display HashScan link
    console.log('4. Transaction Details:');
    console.log(`   Transaction ID: ${transactionId}`);
    console.log(`   HashScan Link: ${getHashScanLink(transactionId)}\n`);

    const network = process.env.HEDERA_NETWORK || 'testnet';
    const networkPath = network === 'mainnet' ? '' : `${network}.`;
    console.log('=== Test Complete ===');
    console.log('\nNext steps:');
    console.log('1. Visit the HashScan link above to view the transaction');
    console.log('2. Check the topic messages on HashScan');
    console.log(`   https://hashscan.io/${networkPath}topic/${topicId}`);

    // Close client
    client.close();
  } catch (error) {
    console.error('Error during test:', error);
    process.exit(1);
  }
}

testHCS();


