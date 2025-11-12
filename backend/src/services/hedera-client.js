/**
 * Hedera Client for Backend
 * 
 * Creates Hedera client using operator credentials from environment.
 * Automatically detects network based on NODE_ENV (production = mainnet, dev = testnet).
 */

import { Client, PrivateKey, AccountId } from '@hashgraph/sdk';
import dotenv from 'dotenv';
import { getHederaNetwork } from '../utils/network-config.js';

dotenv.config();

/**
 * Create Hedera client using operator credentials
 * Automatically detects network based on environment
 * @returns {Client} Configured Hedera client
 */
export function createHederaClient() {
  if (
    process.env.OPERATOR_ID == null ||
    process.env.OPERATOR_KEY == null
  ) {
    throw new Error(
      "Environment variables OPERATOR_ID and OPERATOR_KEY are required."
    );
  }

  const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
  const operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);
  const network = getHederaNetwork(); // Automatic network detection

  const client = Client.forName(network);
  client.setOperator(operatorId, operatorKey);

  return client;
}

