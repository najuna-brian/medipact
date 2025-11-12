/**
 * Get Hedera private key from mnemonic using Hedera SDK
 */
const { PrivateKey } = require("@hashgraph/sdk");
const { ethers } = require("ethers");

const mnemonic = "million exit private luggage six suffer more sponsor peasant black rice item endorse stock side shuffle salad series predict wheat damage slide render stick";

async function getHederaKey() {
  try {
    // Try to derive using standard BIP44 path for Hedera
    // Hedera uses m/44'/3030'/0'/0/0
    const wallet = ethers.HDNodeWallet.fromPhrase(mnemonic);
    
    // For Hedera, we need to use the Hedera SDK to create the key
    // But first, let's see what we get from the mnemonic
    console.log("Ethereum-style wallet from mnemonic:");
    console.log("Address:", wallet.address);
    console.log("Private Key:", wallet.privateKey);
    
    // Note: Hedera uses ECDSA keys, and the private key format should work
    // But the account might be different
    console.log("\n⚠️  For Hedera mainnet deployment, you need:");
    console.log("1. The private key you exported from HashPack (starts with 0x...)");
    console.log("2. This should match your account 0.0.10093707");
    console.log("\nThe mnemonic might derive a different account.");
    
  } catch (error) {
    console.error("Error:", error);
  }
}

getHederaKey();
