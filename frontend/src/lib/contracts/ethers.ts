import { ethers } from 'ethers';
import { CONSENT_MANAGER_ABI, REVENUE_SPLITTER_ABI } from './abis';
import type { ConsentRecord } from '@/types/contracts';

export function getHederaProvider(network: string = 'testnet') {
  const rpcUrl =
    network === 'testnet'
      ? 'https://testnet.hashio.io/api'
      : network === 'mainnet'
        ? 'https://mainnet.hashio.io/api'
        : 'https://previewnet.hashio.io/api';

  return new ethers.JsonRpcProvider(rpcUrl);
}

export async function getConsentRecord(
  contractAddress: string,
  patientId: string,
  network: string = 'testnet'
): Promise<ConsentRecord | null> {
  try {
    const provider = getHederaProvider(network);
    const contract = new ethers.Contract(contractAddress, CONSENT_MANAGER_ABI, provider);

    const record = await contract.getConsentRecord(patientId);

    if (!record || record.originalPatientId === '') {
      return null;
    }

    return {
      originalPatientId: record.originalPatientId,
      anonymousPatientId: record.anonymousPatientId,
      hcsTopicId: record.hcsTopicId,
      consentHash: record.consentHash,
      isValid: record.isValid,
      timestamp: new Date(Number(record.timestamp) * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Error fetching consent record:', error);
    return null;
  }
}

export async function getConsentByAnonymousId(
  contractAddress: string,
  anonymousId: string,
  network: string = 'testnet'
): Promise<ConsentRecord | null> {
  try {
    const provider = getHederaProvider(network);
    const contract = new ethers.Contract(contractAddress, CONSENT_MANAGER_ABI, provider);

    const record = await contract.getConsentByAnonymousId(anonymousId);

    if (!record || record.originalPatientId === '') {
      return null;
    }

    return {
      originalPatientId: record.originalPatientId,
      anonymousPatientId: record.anonymousPatientId,
      hcsTopicId: record.hcsTopicId,
      consentHash: record.consentHash,
      isValid: record.isValid,
      timestamp: new Date(Number(record.timestamp) * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Error fetching consent by anonymous ID:', error);
    return null;
  }
}

export async function getRevenueSplitterInfo(
  contractAddress: string,
  network: string = 'testnet'
) {
  try {
    const provider = getHederaProvider(network);
    const contract = new ethers.Contract(contractAddress, REVENUE_SPLITTER_ABI as any, provider);

    const [totalDistributed, patientAddress, hospitalAddress, medipactAddress] =
      await Promise.all([
        contract.getTotalDistributed(),
        contract.getPatientAddress(),
        contract.getHospitalAddress(),
        contract.getMedipactAddress(),
      ]);

    return {
      totalDistributed: ethers.formatEther(totalDistributed),
      patientAddress,
      hospitalAddress,
      medipactAddress,
    };
  } catch (error) {
    console.error('Error fetching revenue splitter info:', error);
    return null;
  }
}

