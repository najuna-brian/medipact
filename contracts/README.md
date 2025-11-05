# MediPact Smart Contracts

Smart contracts for the MediPact platform, deployed on Hedera EVM.

## Contracts

### RevenueSplitter.sol

Automated revenue distribution contract that splits incoming HBAR payments according to the MediPact revenue model:

- **60%** → Patient Wallet
- **25%** → Hospital Wallet  
- **15%** → MediPact Wallet

#### Features

- Automatic distribution on receipt of HBAR
- Manual distribution trigger via `distributeRevenue()`
- Owner-controlled recipient address updates
- Ownership transfer capability
- Comprehensive events for tracking

#### Functions

**Public/External:**
- `receive()` - Receives HBAR and auto-distributes
- `distributeRevenue()` - Manually trigger distribution
- `updateRecipients()` - Update wallet addresses (owner only)
- `transferOwnership()` - Transfer contract ownership (owner only)
- `getBalance()` - Get contract HBAR balance
- `getSplitPercentages()` - Get split percentages

**State Variables:**
- `patientWallet` - Address receiving 60%
- `hospitalWallet` - Address receiving 25%
- `medipactWallet` - Address receiving 15%
- `owner` - Contract owner

#### Usage Example

```solidity
// Deploy contract
RevenueSplitter splitter = new RevenueSplitter(
    patientWallet,
    hospitalWallet,
    medipactWallet
);

// Send HBAR to contract (auto-distributes)
payable(address(splitter)).transfer(1 ether);

// Or manually trigger distribution
splitter.distributeRevenue();
```

---

### ConsentManager.sol

Consent management contract that stores patient consent records linked to HCS topics for verifiable proof.

#### Features

- Store consent records with HCS topic references
- Link original patient IDs to anonymous patient IDs
- Consent validity tracking (valid/revoked)
- Lookup by patient ID or anonymous ID
- Enumeration support for all consents

#### Functions

**Public/External:**
- `recordConsent()` - Record a new consent (owner only)
- `revokeConsent()` - Revoke a consent (owner only)
- `reinstateConsent()` - Reinstate a revoked consent (owner only)
- `getConsent()` - Get consent by patient ID
- `getConsentByAnonymousId()` - Get consent by anonymous ID
- `isConsentValid()` - Check if consent is valid
- `getConsentCount()` - Get total number of consents
- `getPatientIdAtIndex()` - Get patient ID at index
- `transferOwnership()` - Transfer ownership (owner only)

#### ConsentRecord Structure

```solidity
struct ConsentRecord {
    string patientId;           // Original patient ID
    string anonymousPatientId;  // Anonymous ID (PID-001)
    string hcsTopicId;          // HCS topic ID
    string consentHash;         // Hash of consent form
    uint256 timestamp;          // Record timestamp
    bool isValid;              // Validity status
}
```

#### Usage Example

```solidity
// Deploy contract
ConsentManager manager = new ConsentManager();

// Record a consent
manager.recordConsent(
    "ID-12345",
    "PID-001",
    "0.0.123456",
    "0xabc123..."
);

// Check if consent is valid
bool isValid = manager.isConsentValid("ID-12345");

// Get consent record
ConsentRecord memory consent = manager.getConsent("ID-12345");
```

---

## Deployment

### Prerequisites

1. Hedera Testnet account with HBAR
2. Hardhat or Remix IDE
3. Contract deployment tools

### Deployment Steps

1. **Set up Hardhat** (if using):

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

2. **Configure Hedera Network** in `hardhat.config.js`:

```javascript
module.exports = {
  networks: {
    hederaTestnet: {
      url: "https://testnet.hashio.io/api",
      accounts: [process.env.PRIVATE_KEY],
      chainId: 296
    }
  }
};
```

3. **Deploy Contracts**:

```bash
npx hardhat run scripts/deploy.js --network hederaTestnet
```

### Deployment Script Example

```javascript
const hre = require("hardhat");

async function main() {
  // Get signers
  const [deployer] = await hre.ethers.getSigners();

  // Deploy RevenueSplitter
  const RevenueSplitter = await hre.ethers.getContractFactory("RevenueSplitter");
  const splitter = await RevenueSplitter.deploy(
    "0x...", // patientWallet
    "0x...", // hospitalWallet
    "0x..."  // medipactWallet
  );
  await splitter.deployed();
  console.log("RevenueSplitter deployed to:", splitter.address);

  // Deploy ConsentManager
  const ConsentManager = await hre.ethers.getContractFactory("ConsentManager");
  const manager = await ConsentManager.deploy();
  await manager.deployed();
  console.log("ConsentManager deployed to:", manager.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

---

## Security Considerations

1. **Access Control**: Both contracts use owner-only functions for sensitive operations
2. **Input Validation**: All addresses and data are validated before storage
3. **Reentrancy**: RevenueSplitter uses `call()` instead of `transfer()` for better gas efficiency
4. **Rounding**: RevenueSplitter handles rounding in the final distribution
5. **Ownership**: Contracts support ownership transfer for future upgrades

---

## Events

Both contracts emit comprehensive events for off-chain tracking:

- `RevenueReceived` - When HBAR is received
- `RevenueDistributed` - When revenue is split
- `ConsentRecorded` - When consent is recorded
- `ConsentRevoked` - When consent is revoked
- `OwnershipTransferred` - When ownership changes

---

## Integration with Adapter

The contracts can be integrated with the MediPact Adapter:

1. **RevenueSplitter**: Adapter can send HBAR to contract after data sale
2. **ConsentManager**: Adapter can record consents when processing patient data

---

## License

Apache-2.0

