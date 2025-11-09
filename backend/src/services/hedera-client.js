/**
 * Hedera Client for Backend
 * 
 * Creates Hedera client using operator credentials from environment.
 */

import { Client, PrivateKey, AccountId } from '@hashgraph/sdk';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create Hedera client using operator credentials
 * @returns {Client} Configured Hedera client
 */
export function createHederaClient() {
  if (
    process.env.OPERATOR_ID == null ||
    process.env.OPERATOR_KEY == null ||
    process.env.HEDERA_NETWORK == null
  ) {
    throw new Error(
      "Environment variables OPERATOR_ID, OPERATOR_KEY, and HEDERA_NETWORK are required."
    );
  }

  const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
  const operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);

  const client = Client.forName(process.env.HEDERA_NETWORK);
  client.setOperator(operatorId, operatorKey);

  return client;
}

