# Smart Contract Testing & Deployment Guide

**What "Test and deploy smart contracts to Hedera testnet" means**

---

## Overview

This step involves taking your Solidity smart contracts (`RevenueSplitter.sol` and `ConsentManager.sol`) and:
1. **Testing** them to ensure they work correctly
2. **Deploying** them to Hedera Testnet so they're live on the blockchain
3. **Verifying** the deployment was successful

---

## What Deployment Means

### Current State
- ✅ Contracts are **written** (`.sol` files exist)
- ✅ Contracts are **reviewed** for security and best practices
- ❌ Contracts are **NOT yet on the blockchain**

### After Deployment
- ✅ Contracts are **compiled** to bytecode
- ✅ Contracts are **deployed** to Hedera Testnet
- ✅ Contracts have **on-chain addresses** (e.g., `0.0.1234567`)
- ✅ Contracts can be **interacted with** via transactions
- ✅ Contracts are **visible** on HashScan explorer

---

## Step-by-Step Process

### 1. **Setup Development Environment**

Install tools needed for contract deployment:

```bash
# Install Hardhat (most common tool for Hedera)
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Or use Foundry (alternative)
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. **Configure Hardhat for Hedera**

Create `hardhat.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    hederaTestnet: {
      url: "https://testnet.hashio.io/api", // Hedera Testnet JSON-RPC
      chainId: 296,
      accounts: [process.env.OPERATOR_KEY_HEX] // Your private key in HEX format
    }
  }
};
```

### 3. **Compile Contracts**

Convert Solidity code to bytecode:

```bash
npx hardhat compile
```

This creates:
- **ABI files** (Application Binary Interface) - describes contract functions
- **Bytecode** - the actual contract code that runs on-chain

### 4. **Write Tests**

Create test files to verify contracts work correctly:

```javascript
// test/RevenueSplitter.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("RevenueSplitter", function () {
  it("Should split revenue correctly", async function () {
    const RevenueSplitter = await ethers.getContractFactory("RevenueSplitter");
    const splitter = await RevenueSplitter.deploy(
      patientWallet,
      hospitalWallet,
      medipactWallet
    );
    
    // Test that 60/25/15 split works
    // Test that HBAR transfers work
    // Test that events are emitted
  });
});
```

Run tests:
```bash
npx hardhat test
```

### 5. **Create Deployment Script**

Create `scripts/deploy.js`:

```javascript
const hre = require("hardhat");

async function main() {
  // Deploy RevenueSplitter
  const RevenueSplitter = await hre.ethers.getContractFactory("RevenueSplitter");
  const revenueSplitter = await RevenueSplitter.deploy(
    patientWalletAddress,
    hospitalWalletAddress,
    medipactWalletAddress
  );
  
  await revenueSplitter.deployed();
  console.log("RevenueSplitter deployed to:", revenueSplitter.address);

  // Deploy ConsentManager
  const ConsentManager = await hre.ethers.getContractFactory("ConsentManager");
  const consentManager = await ConsentManager.deploy();
  
  await consentManager.deployed();
  console.log("ConsentManager deployed to:", consentManager.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

### 6. **Deploy to Testnet**

Deploy contracts to Hedera Testnet:

```bash
npx hardhat run scripts/deploy.js --network hederaTestnet
```

**Output:**
```
RevenueSplitter deployed to: 0.0.1234567
ConsentManager deployed to: 0.0.1234568
```

### 7. **Verify on HashScan**

Visit HashScan to see your deployed contracts:
- https://hashscan.io/testnet/contract/0.0.1234567
- View contract code, transactions, and state

---

## What You Need

### Environment Variables
```env
# Your Hedera testnet account
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY_HEX="0x..." # Private key in HEX format (for Hardhat)
HEDERA_NETWORK="testnet"
```

### Prerequisites
- ✅ Hedera testnet account with HBAR (for gas fees)
- ✅ Private key in HEX format (not DER format)
- ✅ Hardhat or Foundry installed
- ✅ Node.js environment set up

---

## Why This Matters for Hackathon

### For MVP/Demo
- **Optional**: You can demonstrate contracts work without deploying
- **Can show**: Contract code, architecture, and review documents

### For Full Submission
- **Recommended**: Deployed contracts show real integration
- **Shows**: You can actually deploy and interact with contracts
- **Demonstrates**: End-to-end Hedera integration

### For Judging
- **Integration Points**: Shows you use Hedera Smart Contract Service
- **Real Transaction**: Contract addresses are verifiable on-chain
- **Complete Solution**: Demonstrates full Web3 capabilities

---

## Alternative: Manual Deployment (Hedera SDK)

You can also deploy using the Hedera JavaScript SDK:

```javascript
import { Client, PrivateKey, AccountId, ContractCreateTransaction } from '@hashgraph/sdk';

const contractBytecode = "0x608060405234801561001057600080fd5b50..."; // Compiled bytecode

const tx = await new ContractCreateTransaction()
  .setBytecode(contractBytecode)
  .setGas(100000)
  .execute(client);

const receipt = await tx.getReceipt(client);
const contractId = receipt.contractId;

console.log("Contract deployed:", contractId.toString());
```

---

## Estimated Costs

### Testnet Deployment (Free)
- Contract creation: ~$1-2 USD in HBAR (testnet HBAR is free from faucet)
- Each contract: Separate deployment cost
- **Total**: ~$2-4 USD in testnet HBAR (free from faucet)

### Mainnet Deployment (Real Money)
- Contract creation: ~$1-2 USD in HBAR
- **Only deploy to testnet for hackathon!**

---

## Current Status

### ✅ What's Done
- Contracts written and reviewed
- Contracts follow Hedera best practices
- Code quality is excellent (Grade A+)

### ⏳ What's Needed (Optional for MVP)
- [ ] Hardhat/Foundry setup
- [ ] Compilation scripts
- [ ] Test suite
- [ ] Deployment scripts
- [ ] Environment configuration
- [ ] Actual deployment to testnet

---

## Recommendation

### For Hackathon MVP:
**You can skip deployment** and:
- ✅ Show contract code in your pitch deck
- ✅ Reference the code review document (shows quality)
- ✅ Explain the architecture
- ✅ Demonstrate HCS integration (which is already working)

### For Full Points:
**Deploy contracts** to:
- ✅ Show real on-chain integration
- ✅ Provide contract addresses in documentation
- ✅ Demonstrate contract interactions
- ✅ Show complete Web3 solution

---

## Quick Start (If You Want to Deploy)

1. **Install Hardhat**:
   ```bash
   cd contracts
   npm init -y
   npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
   npx hardhat init
   ```

2. **Move contracts** to `contracts/` folder

3. **Configure** `hardhat.config.js` for Hedera testnet

4. **Compile**: `npx hardhat compile`

5. **Deploy**: `npx hardhat run scripts/deploy.js --network hederaTestnet`

6. **Document addresses** in your README

---

## Summary

**"Test and deploy smart contracts to Hedera testnet"** means:
1. Writing tests to verify contracts work
2. Compiling Solidity to bytecode
3. Deploying bytecode to Hedera Testnet
4. Getting on-chain contract addresses
5. Verifying deployment on HashScan

**For your hackathon**: This is **optional** but **recommended** for full integration points. Your HCS integration is already complete and working, which is the core of your MVP!

---

## References

- **Hedera Smart Contract Docs**: https://docs.hedera.com/smart-contracts/
- **Hardhat Hedera Guide**: https://docs.hedera.com/smart-contracts/develop-smart-contracts/set-up-your-environment/hardhat
- **JSON-RPC Relay**: https://github.com/hiero-ledger/hiero-json-rpc-relay
- **HashScan**: https://hashscan.io/testnet

