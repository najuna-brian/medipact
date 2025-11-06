# Lesson 7: Smart Contracts Overview

## How Our Contracts Work

This lesson explains the smart contracts used in MediPact and how they automate operations on the blockchain.

## What are Smart Contracts?

**Smart Contracts** are self-executing programs stored on the blockchain:
- Code that runs automatically
- Cannot be changed once deployed
- Executes when conditions are met
- Transparent and verifiable

### Key Characteristics

- **Immutable**: Code cannot be changed
- **Deterministic**: Same input = same output
- **Transparent**: Code is public
- **Automated**: No manual intervention needed
- **Trustless**: No need to trust intermediaries

## MediPact Smart Contracts

### 1. ConsentManager Contract

**Purpose**: Store consent records on-chain

**What it does**:
- Records patient consent
- Links to HCS topics
- Tracks consent status
- Enables lookups

**Location**: `contracts/contracts/ConsentManager.sol`

### 2. RevenueSplitter Contract

**Purpose**: Automatically distribute revenue

**What it does**:
- Receives HBAR payments
- Automatically splits 60/25/15
- Distributes to wallets
- Emits events

**Location**: `contracts/contracts/RevenueSplitter.sol`

## ConsentManager Contract

### Structure

```solidity
contract ConsentManager {
    struct ConsentRecord {
        string patientId;
        string anonymousPatientId;
        string hcsTopicId;
        string consentHash;
        uint256 timestamp;
        bool isValid;
    }
    
    mapping(string => ConsentRecord) public consents;
}
```

### Key Functions

#### recordConsent()

**Purpose**: Record a new consent

**Parameters**:
- `patientId`: Original patient ID
- `anonymousPatientId`: Anonymous ID (PID-001)
- `hcsTopicId`: HCS topic ID
- `consentHash`: Hash of consent form

**What it does**:
1. Validates input
2. Creates consent record
3. Stores in mapping
4. Emits event

**Example**:
```solidity
recordConsent(
    "ID-12345",        // Original ID
    "PID-001",         // Anonymous ID
    "0.0.123456",      // HCS Topic
    "a1b2c3d4..."      // Consent Hash
);
```

#### getConsent()

**Purpose**: Retrieve consent record

**Parameters**:
- `patientId`: Patient ID to lookup

**Returns**: ConsentRecord

**Example**:
```solidity
ConsentRecord memory consent = getConsent("ID-12345");
// Returns: patientId, anonymousId, topicId, hash, timestamp, isValid
```

#### revokeConsent()

**Purpose**: Mark consent as invalid

**Parameters**:
- `patientId`: Patient ID

**What it does**:
- Sets `isValid = false`
- Emits Revoked event

### Why ConsentManager?

**Benefits**:
- ✅ Fast lookups (on-chain)
- ✅ Immutable records
- ✅ Links to HCS (verification)
- ✅ Tracks status
- ✅ Enables revocation

## RevenueSplitter Contract

### Structure

```solidity
contract RevenueSplitter {
    uint256 public constant PATIENT_SHARE = 6000;      // 60%
    uint256 public constant HOSPITAL_SHARE = 2500;    // 25%
    uint256 public constant MEDIPACT_SHARE = 1500;    // 15%
    
    address payable public patientWallet;
    address payable public hospitalWallet;
    address payable public medipactWallet;
}
```

### Key Functions

#### receive()

**Purpose**: Automatically split revenue when HBAR received

**What it does**:
1. Receives HBAR payment
2. Calculates 60/25/15 split
3. Distributes to wallets
4. Emits event

**Automatic**: Called when HBAR sent to contract

**Example**:
```solidity
// Send 0.1 HBAR to contract
// Automatically:
// - 0.06 HBAR to patient wallet (60%)
// - 0.025 HBAR to hospital wallet (25%)
// - 0.015 HBAR to medipact wallet (15%)
```

#### distributeRevenue()

**Purpose**: Manually trigger distribution

**What it does**:
- Distributes any accumulated balance
- Same 60/25/15 split
- Can be called anytime

### Why RevenueSplitter?

**Benefits**:
- ✅ Automatic distribution
- ✅ No manual intervention
- ✅ Fair split (60/25/15)
- ✅ Transparent
- ✅ Trustless

## How Contracts Work Together

### Complete Flow

```
1. Adapter processes data
   ↓
2. Consent recorded in ConsentManager
   ↓
3. HBAR sent to RevenueSplitter
   ↓
4. RevenueSplitter automatically splits
   ↓
5. Payments distributed
```

### Integration

**ConsentManager**:
- Records consent on-chain
- Links to HCS topics
- Enables verification

**RevenueSplitter**:
- Handles payments
- Automates distribution
- Ensures fairness

## Contract Deployment

### Deployment Process

1. **Compile Contract**
   ```bash
   cd contracts
   npm run compile
   ```

2. **Deploy to Testnet**
   ```bash
   npm run deploy:testnet
   ```

3. **Save Addresses**
   - Contract addresses saved to `deployment-info.json`
   - Add to `.env` file

### Deployment Information

**After deployment, you get**:
- Contract address (0x...)
- Deployer address
- Transaction ID
- HashScan link

**Example**:
```json
{
  "network": "testnet",
  "consentManager": "0x002616C472968dd344a520266f70891e7246dFb9",
  "revenueSplitter": "0x4392Ec1c1827ec9401935685978305B9aCB55881"
}
```

## Contract Interaction

### From Adapter

**Record Consent**:
```javascript
await recordConsentOnChain(
  client,
  consentManagerAddress,
  patientId,
  anonymousId,
  hcsTopicId,
  consentHash
);
```

**Execute Payout**:
```javascript
await executeRealPayout(
  client,
  revenueSplitterAddress,
  totalHbarAmount
);
```

### From HashScan

**View Contract**:
1. Search contract address
2. View contract details
3. See transaction history
4. Check function calls

## Security Features

### Access Control

**Owner-Only Functions**:
- Only contract owner can call
- Prevents unauthorized access
- Protects sensitive operations

**Example**:
```solidity
function updateRecipients(...) external {
    require(msg.sender == owner, "Unauthorized");
    // Update wallets
}
```

### Input Validation

**Checks**:
- Addresses not zero
- Percentages sum to 100
- Required fields present
- Valid data types

**Example**:
```solidity
if (_patientWallet == address(0)) {
    revert InvalidAddress();
}
```

### Error Handling

**Custom Errors**:
- Clear error messages
- Gas-efficient
- Easy to debug

**Example**:
```solidity
error Unauthorized();
error InvalidAddress();
error NoFundsToDistribute();
```

## Gas Optimization

### Why It Matters

**Gas**: Cost to execute contract function

**Optimization**:
- Use events instead of storage
- Pack structs efficiently
- Minimize storage writes
- Use custom errors

### Gas Costs

**Typical Costs**:
- Record consent: ~50,000 gas
- Distribute revenue: ~100,000 gas
- Read operations: Free (view functions)

## Events

### What are Events?

**Events**: Logs emitted by contracts

**Purpose**:
- Track contract activity
- Enable off-chain monitoring
- Provide transparency
- Index for queries

### ConsentManager Events

```solidity
event ConsentRecorded(
    string indexed patientId,
    string indexed anonymousPatientId,
    string hcsTopicId,
    string consentHash
);

event ConsentRevoked(string indexed patientId);
```

### RevenueSplitter Events

```solidity
event RevenueDistributed(
    address indexed patientWallet,
    uint256 patientAmount,
    address indexed hospitalWallet,
    uint256 hospitalAmount,
    address indexed medipactWallet,
    uint256 medipactAmount
);
```

## Testing Contracts

### Test Suite

**Location**: `contracts/test/`

**Tests**:
- Functionality tests
- Edge cases
- Error handling
- Gas optimization

**Run Tests**:
```bash
cd contracts
npm test
```

### Test Coverage

**ConsentManager**:
- Record consent
- Get consent
- Revoke consent
- Error cases

**RevenueSplitter**:
- Automatic distribution
- Manual distribution
- Update recipients
- Error cases

## Key Takeaways

- **Smart Contracts**: Self-executing code on blockchain
- **ConsentManager**: Stores consent records
- **RevenueSplitter**: Auto-splits revenue 60/25/15
- **Immutable**: Code cannot be changed
- **Automated**: No manual intervention
- **Transparent**: All operations visible

## Next Steps

Now that you understand smart contracts:

- **Next Lesson**: [Environment Setup](./08-environment-setup.md) - Installing prerequisites

---

**Smart Contracts Summary:**
- Self-executing programs on blockchain
- ConsentManager: Consent registry
- RevenueSplitter: Automated payments
- Immutable and transparent
- Automated operations
- Trustless execution

