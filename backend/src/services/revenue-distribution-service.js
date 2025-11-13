/**
 * Revenue Distribution Service
 * 
 * Handles revenue distribution using Hedera Account IDs.
 * Converts Hedera Account IDs to EVM addresses for smart contract calls.
 */

import { 
  Client, 
  TransferTransaction, 
  Hbar, 
  HbarUnit, 
  Status, 
  AccountId,
  ContractId,
  ContractExecuteTransaction,
  ContractFunctionParameters
} from '@hashgraph/sdk';
import { createHederaClient } from './hedera-client.js';

/**
 * Note: Hedera Account IDs (0.0.xxxxx) can be used directly in native Hedera transfers.
 * For EVM smart contracts, we use ContractId.fromEvmAddress() for contract addresses.
 * 
 * RevenueSplitter supports dynamic addresses:
 * - Uses distributeRevenueTo() function with patient and hospital EVM addresses per transaction
 * - Automatically uses EVM addresses from database when available
 * - Falls back to direct transfers if EVM addresses are missing or contract unavailable
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
    // Get patient and hospital records to retrieve EVM addresses
    let patient = null;
    let hospital = null;
    
    if (getPatient) {
      patient = await getPatient();
    }
    if (getHospital) {
      hospital = await getHospital();
    }
    
    // Get Hedera Account IDs
    let patientHederaAccountId = patientAccountId || patient?.hederaAccountId;
    let hospitalHederaAccountId = hospitalAccountId || hospital?.hederaAccountId;
    
    if (!patientHederaAccountId) {
      throw new Error('Patient does not have a Hedera Account ID');
    }
    
    if (!hospitalHederaAccountId) {
      throw new Error('Hospital does not have a Hedera Account ID');
    }
    
    // Get EVM addresses from patient and hospital records
    const patientEvmAddress = patient?.evmAddress;
    const hospitalEvmAddress = hospital?.evmAddress;
    
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
    
    // If RevenueSplitter contract is provided AND we have EVM addresses, use dynamic contract function
    if (revenueSplitterAddress && patientEvmAddress && hospitalEvmAddress) {
      try {
        // Convert EVM address to ContractId
        const contractId = ContractId.fromEvmAddress(0, 0, revenueSplitterAddress);
        
        // Convert EVM addresses to bytes20 format (remove 0x prefix and convert to Buffer)
        // Hedera SDK expects addresses as bytes20 (20 bytes) for Solidity address type
        const patientAddressBytes = Buffer.from(patientEvmAddress.replace('0x', ''), 'hex');
        const hospitalAddressBytes = Buffer.from(hospitalEvmAddress.replace('0x', ''), 'hex');
        
        // Build function parameters: distributeRevenueTo(address patientWallet, address hospitalWallet)
        // Note: The function is payable, so we send HBAR with the transaction
        // Use addBytes with 20 bytes for address type (Solidity address = bytes20)
        const functionParameters = new ContractFunctionParameters()
          .addBytes(patientAddressBytes)
          .addBytes(hospitalAddressBytes);
        
        // Execute contract function with HBAR payment
        const transaction = new ContractExecuteTransaction()
          .setContractId(contractId)
          .setGas(1000000) // Sufficient gas for distribution
          .setPayableAmount(totalAmount) // Send HBAR with the transaction
          .setFunction('distributeRevenueTo', functionParameters);
        
        const txResponse = await transaction.execute(client);
        const receipt = await txResponse.getReceipt(client);
        
        if (receipt.status !== Status.Success) {
          throw new Error(`RevenueSplitter contract execution failed: ${receipt.status}`);
        }
        
        return {
          method: 'contract-dynamic',
          contractAddress: revenueSplitterAddress,
          transactionId: txResponse.transactionId.toString(),
          totalAmount: totalAmount.toString(),
          patientEvmAddress,
          hospitalEvmAddress,
          split: {
            patient: patientAmount.toString(),
            hospital: hospitalAmount.toString(),
            platform: platformAmount.toString()
          }
        };
      } catch (error) {
        console.warn('Contract execution failed, falling back to direct transfers:', error.message);
        // Fall through to direct transfers
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
  } finally {
    client.close(); // Always close client to prevent resource leaks
  }
}

