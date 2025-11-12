/**
 * Derive ECDSA private key from mnemonic using Hedera SDK
 * This is the correct method for Hardhat/EVM deployment
 * 
 * Based on hiero-sdk-js examples
 */

const { Mnemonic } = require("@hashgraph/sdk");

const MNEMONIC_WORDS = "million exit private luggage six suffer more sponsor peasant black rice item endorse stock side shuffle salad series predict wheat damage slide render stick";

async function deriveECDSAKey() {
  try {
    console.log("=== Deriving ECDSA Private Key from Mnemonic ===\n");
    console.log("Using Hedera SDK's toStandardECDSAsecp256k1PrivateKey()\n");

    // Create mnemonic from words
    const mnemonic = await Mnemonic.fromString(MNEMONIC_WORDS);
    
    // Derive ECDSA key using standard Hedera path (m/44'/3030'/0'/0/0)
    // This is what HashPack uses for ECDSA keys
    const privateKey = await mnemonic.toStandardECDSAsecp256k1PrivateKey("", 0);
    
    // Get the key in hex format (for Hardhat)
    const privateKeyHex = privateKey.toString();
    const publicKey = privateKey.publicKey;
    const publicKeyHex = publicKey.toString();
    
    console.log("✅ Successfully derived ECDSA key!\n");
    console.log("Private Key (hex):", privateKeyHex);
    console.log("Public Key (hex):", publicKeyHex);
    console.log("\n📝 Use this private key in your .env file:");
    console.log(`OPERATOR_KEY_HEX="${privateKeyHex}"`);
    console.log("\n⚠️  Keep this private key secure!");
    console.log("⚠️  Never commit it to Git!");
    
    return privateKeyHex;
  } catch (error) {
    console.error("❌ Error deriving key:", error);
    console.error("\n💡 Make sure @hashgraph/sdk is installed:");
    console.error("   npm install @hashgraph/sdk");
    process.exit(1);
  }
}

deriveECDSAKey()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });



