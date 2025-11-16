/**
 * Adapter Processor Service
 * 
 * This service wraps the adapter functionality to be used by the Next.js API routes
 * Note: The adapter uses ES modules, so we execute it as a separate process
 */

import path from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ProcessingResult {
  success: boolean;
  recordsProcessed?: number;
  consentProofs?: number;
  dataProofs?: number;
  consentTopicId?: string;
  dataTopicId?: string;
  transactions?: Array<{
    type: 'consent' | 'data';
    transactionId: string;
    hashScanLink: string;
    timestamp: string;
    patientId?: string;
    anonymousPID?: string;
  }>;
  error?: string;
  details?: string;
}

export interface ProcessingOptions {
  hospitalId?: string | null;
  hospitalCountry?: string | null;
  hospitalLocation?: string | null;
  apiKey?: string | null;
}

/**
 * Get the adapter directory path
 * In Next.js, process.cwd() returns the project root (frontend/)
 * So we need to go up one level to get to medipact/, then into adapter/
 */
function getAdapterDir(): string {
  // Try environment variable first
  if (process.env.ADAPTER_PATH) {
    return path.resolve(process.env.ADAPTER_PATH);
  }
  
  // Get the project root (where package.json is - frontend/)
  const projectRoot = process.cwd();
  
  // Go up one level to medipact/, then into adapter/
  const parentDir = path.dirname(projectRoot);
  const adapterDir = path.join(parentDir, 'adapter');
  
  return path.resolve(adapterDir);
}

export async function processFile(
  filePath: string,
  adapterPath?: string,
  options?: ProcessingOptions
): Promise<ProcessingResult> {
  // Use provided path or calculate from project root
  const adapterDir = adapterPath ? path.resolve(adapterPath) : getAdapterDir();
  const adapterScript = path.join(adapterDir, 'src', 'index.js');
  
  // Verify the script exists before proceeding
  try {
    await fs.access(adapterScript);
  } catch {
    console.error(`Adapter script not found at: ${adapterScript}`);
    console.error(`Resolved adapter directory: ${adapterDir}`);
    console.error(`Project root (process.cwd()): ${process.cwd()}`);
    throw new Error(`Adapter script not found at ${adapterScript}. Please check ADAPTER_PATH environment variable.`);
  }

  try {
    // Copy the uploaded file to adapter's data directory
    const adapterDataDir = path.join(adapterDir, 'data');
    await fs.mkdir(adapterDataDir, { recursive: true });
    
    const targetFile = path.join(adapterDataDir, 'raw_data.csv');
    await fs.copyFile(filePath, targetFile);

    // Prepare environment variables for adapter
    const env = {
      ...process.env,
      // Map frontend env vars to adapter expected vars
      OPERATOR_ID: process.env.NEXT_PUBLIC_HEDERA_ACCOUNT_ID || process.env.OPERATOR_ID,
      OPERATOR_KEY: process.env.NEXT_PUBLIC_HEDERA_PRIVATE_KEY || process.env.OPERATOR_KEY,
      HEDERA_NETWORK: process.env.NEXT_PUBLIC_HEDERA_NETWORK || process.env.HEDERA_NETWORK || 'testnet',
      CONSENT_MANAGER_ADDRESS: process.env.NEXT_PUBLIC_CONSENT_MANAGER_ADDRESS || process.env.CONSENT_MANAGER_ADDRESS,
      REVENUE_SPLITTER_ADDRESS: process.env.NEXT_PUBLIC_REVENUE_SPLITTER_ADDRESS || process.env.REVENUE_SPLITTER_ADDRESS,
      LOCAL_CURRENCY_CODE: process.env.NEXT_PUBLIC_LOCAL_CURRENCY_CODE || process.env.LOCAL_CURRENCY_CODE,
      USD_TO_LOCAL_RATE: process.env.NEXT_PUBLIC_USD_TO_LOCAL_RATE || process.env.USD_TO_LOCAL_RATE,
      // Add hospital info (REQUIRED)
      HOSPITAL_COUNTRY: options?.hospitalCountry || process.env.HOSPITAL_COUNTRY || 'Uganda',
      HOSPITAL_LOCATION: options?.hospitalLocation || process.env.HOSPITAL_LOCATION,
      HOSPITAL_ID: options?.hospitalId || process.env.HOSPITAL_ID,
      HOSPITAL_API_KEY: options?.apiKey || process.env.HOSPITAL_API_KEY,
      BACKEND_API_URL: process.env.NEXT_PUBLIC_BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_API_URL || 'http://localhost:3002',
    };

    // Validate required environment variables
    if (!env.OPERATOR_ID || !env.OPERATOR_KEY) {
      console.error('Missing required Hedera credentials:');
      console.error('OPERATOR_ID:', env.OPERATOR_ID ? `${String(env.OPERATOR_ID).substring(0, 10)}...` : 'MISSING');
      console.error('OPERATOR_KEY:', env.OPERATOR_KEY ? 'SET' : 'MISSING');
      return {
        success: false,
        error: 'Missing Hedera credentials. OPERATOR_ID and OPERATOR_KEY are required.',
        details: 'Please configure NEXT_PUBLIC_HEDERA_ACCOUNT_ID and NEXT_PUBLIC_HEDERA_PRIVATE_KEY environment variables.',
      };
    }

    console.log('Adapter environment variables:');
    console.log('- OPERATOR_ID:', env.OPERATOR_ID ? `${String(env.OPERATOR_ID).substring(0, 10)}...` : 'MISSING');
    console.log('- OPERATOR_KEY:', env.OPERATOR_KEY ? 'SET' : 'MISSING');
    console.log('- HOSPITAL_COUNTRY:', env.HOSPITAL_COUNTRY);
    console.log('- HOSPITAL_ID:', env.HOSPITAL_ID || 'NOT SET');
    console.log('- BACKEND_API_URL:', env.BACKEND_API_URL);

    // Run the adapter script
    let stdout = '';
    let stderr = '';
    try {
      const result = await execAsync(
        `cd "${adapterDir}" && node "${adapterScript}"`,
        {
          maxBuffer: 10 * 1024 * 1024, // 10MB buffer
          env,
        }
      );
      stdout = result.stdout || '';
      stderr = result.stderr || '';
    } catch (error: any) {
      // Capture both stdout and stderr from the error
      stdout = error.stdout || '';
      stderr = error.stderr || '';
      console.error('Adapter execution error:', error.message);
      console.error('Adapter stdout:', stdout);
      console.error('Adapter stderr:', stderr);
      
      // If the adapter failed, return error with details
      return {
        success: false,
        error: error.message || 'Adapter execution failed',
        details: stderr || stdout || 'No additional error details available',
      };
    }

    // Parse the output to extract results
    const outputFile = path.join(adapterDataDir, 'anonymized_data.csv');
    let recordsProcessed = 0;
    
    try {
      const outputContent = await fs.readFile(outputFile, 'utf-8');
      const lines = outputContent.split('\n').filter((line) => line.trim());
      recordsProcessed = Math.max(0, lines.length - 1); // Subtract header
    } catch {
      // Output file might not exist yet
    }

    // Extract information from stdout
    const consentTopicMatch = stdout.match(/Consent Topic: (0\.0\.\d+)/);
    const dataTopicMatch = stdout.match(/Data Topic: (0\.0\.\d+)/);
    const recordsMatch = stdout.match(/Records processed: (\d+)/);
    const consentProofsMatch = stdout.match(/Consent proofs: (\d+)/);
    const dataProofsMatch = stdout.match(/Data proofs: (\d+)/);

    // Extract transaction IDs from stdout (look for HashScan links)
    const hashScanLinks = stdout.match(/https:\/\/hashscan\.io\/[^\/]+\/transaction\/([^\s]+)/g) || [];
    const transactions: ProcessingResult['transactions'] = [];

    // Try to parse transaction information
    // This is a simplified approach - in production, adapter should output structured JSON
    hashScanLinks.forEach((link, idx) => {
      const txIdMatch = link.match(/transaction\/([^\s]+)/);
      if (txIdMatch) {
        transactions.push({
          type: idx < (consentProofsMatch ? parseInt(consentProofsMatch[1]) : 0) ? 'consent' : 'data',
          transactionId: txIdMatch[1],
          hashScanLink: link.trim(),
          timestamp: new Date().toISOString(),
        });
      }
    });

    return {
      success: true,
      recordsProcessed: recordsMatch ? parseInt(recordsMatch[1]) : recordsProcessed,
      consentProofs: consentProofsMatch ? parseInt(consentProofsMatch[1]) : 0,
      dataProofs: dataProofsMatch ? parseInt(dataProofsMatch[1]) : 0,
      consentTopicId: consentTopicMatch ? consentTopicMatch[1] : undefined,
      dataTopicId: dataTopicMatch ? dataTopicMatch[1] : undefined,
      transactions: transactions.length > 0 ? transactions : undefined,
    };
  } catch (error: any) {
    console.error('Adapter processing error:', error);
    return {
      success: false,
      error: error.message || 'Processing failed',
    };
  }
}

