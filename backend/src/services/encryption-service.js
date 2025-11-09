/**
 * Encryption Service
 * 
 * Encrypts and decrypts sensitive data (Hedera private keys).
 * Uses AES-256-GCM for authenticated encryption.
 */

import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16; // 128 bits
const SALT_LENGTH = 64; // 512 bits
const TAG_LENGTH = 16; // 128 bits
const KEY_LENGTH = 32; // 256 bits
const ITERATIONS = 100000; // PBKDF2 iterations

/**
 * Get encryption key from environment variable
 * In production, use a proper key management service (AWS KMS, HashiCorp Vault, etc.)
 */
function getEncryptionKey() {
  const key = process.env.ENCRYPTION_KEY;
  
  if (!key) {
    // For development: generate a key (NOT for production!)
    console.warn('⚠️  ENCRYPTION_KEY not set. Using development key. NOT SECURE FOR PRODUCTION!');
    return crypto.scryptSync('development-key-change-in-production', 'salt', KEY_LENGTH);
  }
  
  // Use the provided key (should be 32 bytes/256 bits)
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt sensitive data (e.g., Hedera private key)
 * @param {string} plaintext - Data to encrypt
 * @returns {string} Encrypted data (hex string)
 */
export function encrypt(plaintext) {
  if (!plaintext) {
    throw new Error('Cannot encrypt empty data');
  }
  
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const salt = crypto.randomBytes(SALT_LENGTH);
  
  // Derive key from master key and salt
  const derivedKey = crypto.pbkdf2Sync(key, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  
  const cipher = crypto.createCipheriv(ALGORITHM, derivedKey, iv);
  
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const tag = cipher.getAuthTag();
  
  // Combine: salt + iv + tag + encrypted data
  const combined = Buffer.concat([
    salt,
    iv,
    tag,
    Buffer.from(encrypted, 'hex')
  ]);
  
  return combined.toString('hex');
}

/**
 * Decrypt sensitive data
 * @param {string} encryptedHex - Encrypted data (hex string)
 * @returns {string} Decrypted plaintext
 */
export function decrypt(encryptedHex) {
  if (!encryptedHex) {
    throw new Error('Cannot decrypt empty data');
  }
  
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedHex, 'hex');
  
  // Extract components
  const salt = combined.slice(0, SALT_LENGTH);
  const iv = combined.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = combined.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = combined.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  
  // Derive key from master key and salt
  const derivedKey = crypto.pbkdf2Sync(key, salt, ITERATIONS, KEY_LENGTH, 'sha256');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, derivedKey, iv);
  decipher.setAuthTag(tag);
  
  let decrypted = decipher.update(encrypted, null, 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Hash data (one-way, for passwords, etc.)
 * @param {string} data - Data to hash
 * @returns {string} Hashed data (hex string)
 */
export function hash(data) {
  return crypto.createHash('sha256').update(data).digest('hex');
}

