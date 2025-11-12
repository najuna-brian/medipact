/**
 * Derive Hedera private key from mnemonic
 * Run this OFFLINE for security
 * 
 * Usage: MNEMONIC="your words" node scripts/derive-hedera-key.js
 */

const bip39 = require('bip39');
const edhd = require('ed25519-hd-key');
const nacl = require('tweetnacl');

// Get mnemonic from environment variable for security
const MNEMONIC = process.env.MNEMONIC || "million exit private luggage six suffer more sponsor peasant black rice item endorse stock side shuffle salad series predict wheat damage slide render stick";

// Hedera BIP44 path: m/44'/3030'/0'/0'/0'
const PATH = "m/44'/3030'/0'/0'/0'";

async function main() {
  console.log("=== Deriving Hedera Key from Mnemonic ===\n");
  
  if (!bip39.validateMnemonic(MNEMONIC)) {
    console.error("❌ Invalid mnemonic");
    process.exit(1);
  }

  try {
    // Convert mnemonic to seed
    const seed = await bip39.mnemonicToSeed(MNEMONIC);
    
    // Derive key using Hedera path
    const derived = edhd.derivePath(PATH, seed.toString('hex'));
    const privateKeySeed = derived.key; // 32 bytes seed for ed25519
    
    // Generate keypair from seed
    const keyPair = nacl.sign.keyPair.fromSeed(privateKeySeed);
    
    // Get keys in hex format
    const privateKeyHex = Buffer.from(privateKeySeed).toString('hex');
    const publicKeyHex = Buffer.from(keyPair.publicKey).toString('hex');
    
    console.log("Derivation path:", PATH);
    console.log("\n✅ Derived Keys:");
    console.log("Private Key (hex):", privateKeyHex);
    console.log("Public Key (hex):", publicKeyHex);
    console.log("\n⚠️  For Hardhat/EVM, you may need ECDSA format.");
    console.log("⚠️  This ED25519 key might not work directly with Hardhat.");
    console.log("\n💡 Recommendation: Use the private key you exported from HashPack");
    console.log("   (the one that starts with 0x...) for Hardhat deployment.");
    
  } catch (error) {
    console.error("❌ Error deriving key:", error);
    process.exit(1);
  }
}

main();



