/**
 * Derive private key from mnemonic seed phrase
 * This script converts the mnemonic to a private key for Hedera
 */

const { ethers } = require("ethers");

const mnemonic = "million exit private luggage six suffer more sponsor peasant black rice item endorse stock side shuffle salad series predict wheat damage slide render stick";

async function derivePrivateKey() {
  try {
    // Create wallet from mnemonic (using default derivation path)
    const wallet = ethers.Wallet.fromPhrase(mnemonic);
    
    console.log("=== Derived Private Key from Mnemonic ===\n");
    console.log("Private Key:", wallet.privateKey);
    console.log("Address:", wallet.address);
    console.log("\n⚠️  Save this private key securely!");
    console.log("Use it in your .env file as OPERATOR_KEY_HEX");
    
    return wallet.privateKey;
  } catch (error) {
    console.error("Error deriving private key:", error);
    process.exit(1);
  }
}

derivePrivateKey();


