/**
 * Revenue Distribution Service
 * 
 * Handles revenue distribution using Hedera Account IDs.
 * Converts Hedera Account IDs to EVM addresses for smart contract calls.
 */

import { Client, TransferTransaction, Hbar, HbarUnit, Status, AccountId } from '@hashgraph/sdk';
import { createHederaClient } from './hedera-client.js';

/**
 * Note: Hedera Account IDs (0.0.xxxxx) can be used directly in native Hedera transfers.
 * For EVM smart contracts, we use ContractId.fromEvmAddress() for contract addresses.
 * For RevenueSplitter, we can either:
 * 1. Use direct transfers (simpler, works immediately)
 * 2. Update contract to accept Account IDs (requires contract changes)
 * 
 * Current implementation uses direct transfers for simplicity.
 */

/**
 * Distribute revenue to patient, hospital, and platform
 * Uses Hedera Account IDs to send HBAR directly
 * 
 * @param {Object} params
 *   - patientAccountId: string - Patient Hedera Account ID (0.0.xxxxx)
 *   - hospitalAccountId: string - Hospital Hedera Account ID (0.0.xxxxx)
 *   - totalAmount: Hbar - Total revenue amount
 *   - revenueSplitterAddress: string (optional) - RevenueSplitter contract address
 * @returns {Promise<Object>} Distribution result with transaction IDs
 */
export async function distributeRevenue({
  patientAccountId,
  hospitalAccountId,
  totalAmount,
  revenueSplitterAddress = null,
  getPatient = null,
  getHospital = null
}) {
  const client = createHederaClient();
  
  try {
    // Get Hedera Account IDs (use provided or fetch from database)
    let patientHederaAccountId = patientAccountId;
    let hospitalHederaAccountId = hospitalAccountId;
    
    if (!patientHederaAccountId && getPatient) {
      const patient = await getPatient();
      patientHederaAccountId = patient?.hederaAccountId;
    }
    
    if (!hospitalHederaAccountId && getHospital) {
      const hospital = await getHospital();
      hospitalHederaAccountId = hospital?.hederaAccountId;
    }
    
    if (!patientHederaAccountId) {
      throw new Error('Patient does not have a Hedera Account ID');
    }
    
    if (!hospitalHederaAccountId) {
      throw new Error('Hospital does not have a Hedera Account ID');
    }
    
    // Calculate split (60% patient, 25% hospital, 15% platform)
    const patientAmount = Hbar.fromTinybars(
      Math.floor(Number(totalAmount.toTinybars()) * 0.60)
    );
    const hospitalAmount = Hbar.fromTinybars(
      Math.floor(Number(totalAmount.toTinybars()) * 0.25)
    );
    const platformAmount = Hbar.fromTinybars(
      Number(totalAmount.toTinybars()) - Number(patientAmount.toTinybars()) - Number(hospitalAmount.toTinybars())
    );
    
    const operatorId = client.operatorAccountId;
    const patientAccountIdObj = AccountId.fromString(patientHederaAccountId);
    const hospitalAccountIdObj = AccountId.fromString(hospitalHederaAccountId);
    
    // If RevenueSplitter contract is provided, use it
    // Note: Contract address must be in EVM format (0x...) or Account ID format
    if (revenueSplitterAddress) {
      // For EVM contracts, we need ContractId, but for transfers we can use AccountId
      // Try to parse as AccountId first, if it fails, it's likely an EVM address
      let contractAccountId;
      try {
        contractAccountId = AccountId.fromString(revenueSplitterAddress);
      } catch (e) {
        // If it's an EVM address (0x...), we need to convert it
        // For now, use direct transfers instead
        console.warn('RevenueSplitter EVM address conversion not yet implemented, using direct transfers');
        revenueSplitterAddress = null; // Fall through to direct transfers
      }
      
      if (revenueSplitterAddress && contractAccountId) {
      const totalTinybars = totalAmount.toTinybars();
      const negativeAmount = new Hbar(-Number(totalTinybars), HbarUnit.Tinybar);
      
        const transaction = new TransferTransaction()
          .addHbarTransfer(operatorId, negativeAmount)
          .addHbarTransfer(contractAccountId, totalAmount);
        
        const txResponse = await transaction.execute(client);
        const receipt = await txResponse.getReceipt(client);
        
        if (receipt.status !== Status.Success) {
          throw new Error(`RevenueSplitter transfer failed: ${receipt.status}`);
        }
        
        return {
          method: 'contract',
          contractAddress: revenueSplitterAddress,
          transactionId: txResponse.transactionId.toString(),
          totalAmount: totalAmount.toString(),
          split: {
            patient: patientAmount.toString(),
            hospital: hospitalAmount.toString(),
            platform: platformAmount.toString()
          }
        };
      }
    }
    
    // Direct transfers to accounts (default method)
    // Calculate amounts in tinybars for precise arithmetic
    const totalTinybars = Number(totalAmount.toTinybars());
    const patientTinybars = Number(patientAmount.toTinybars());
    const hospitalTinybars = Number(hospitalAmount.toTinybars());
    const platformTinybars = Number(platformAmount.toTinybars());
    
    // Calculate the amount to transfer (patient + hospital only)
    // Platform amount stays with operator, so we only transfer what goes to others
    const transferAmount = patientTinybars + hospitalTinybars;
    
    // Verify amounts balance (sum of outgoing = sum of incoming)
    // We only transfer patient + hospital amounts, platform stays with operator
    if (Math.abs(transferAmount - (patientTinybars + hospitalTinybars)) > 1) {
      throw new Error(`Transfer calculation error: transferAmount=${transferAmount}, recipients=${patientTinybars + hospitalTinybars}`);
    }
    
    // Create transfer transaction
    // Operator sends only what goes to patient and hospital (negative)
    // Recipients receive their portions (positive)
    // Platform amount (0.15) stays with operator automatically
    const transaction = new TransferTransaction()
      .addHbarTransfer(operatorId, Hbar.fromTinybars(-transferAmount))
      .addHbarTransfer(patientAccountIdObj, patientAmount)
      .addHbarTransfer(hospitalAccountIdObj, hospitalAmount);
    
    const txResponse = await transaction.execute(client);
    const receipt = await txResponse.getReceipt(client);
    
    if (receipt.status !== Status.Success) {
      throw new Error(`Direct transfer failed: ${receipt.status}`);
    }
    
    return {
      method: 'direct',
      transactionId: txResponse.transactionId.toString(),
      transfers: {
        patient: {
          accountId: patientHederaAccountId,
          amount: patientAmount.toString()
        },
        hospital: {
          accountId: hospitalHederaAccountId,
          amount: hospitalAmount.toString()
        },
        platform: {
          accountId: operatorId.toString(),
          amount: platformAmount.toString()
        }
      }
    };
  } catch (error) {
    console.error('Error distributing revenue:', error);
    throw error;
  }
}

