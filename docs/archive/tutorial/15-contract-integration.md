# Lesson 15: Smart Contract Integration

## On-Chain Operations

This lesson explains how MediPact integrates with smart contracts to record consent and execute payments on the blockchain.

## Overview

MediPact uses two smart contracts:
1. **ConsentManager**: Records consent on-chain
2. **RevenueSplitter**: Automatically distributes revenue

## ConsentManager Integration

### Purpose

**ConsentManager** stores consent records on-chain:
- Fast lookups
- Links to HCS topics
- Tracks consent status
- Enables verification

### Integration Flow

```
1. Consent hash generated
   ↓
2. Submitted to HCS
   ↓
3. Recorded in ConsentManager
   ↓
4. Linked to HCS topic
   ↓
5. Stored permanently
```

### Code Implementation

**Record Consent**:
```javascript
await recordConsentOnChain(
  client,                    // Hedera client
  consentManagerAddress,    // Contract address
  originalPatientId,         // "ID-12345"
  anonymousPatientId,        // "PID-001"
  hcsTopicId,               // "0.0.123456"
  consentHash               // "a1b2c3d4..."
);
```

### What Happens

1. **Convert Address**: EVM address → ContractId
2. **Build Parameters**: Function parameters
3. **Execute Contract**: Call `recordConsent()`
4. **Wait for Receipt**: Confirm success
5. **Return Transaction ID**: For verification

### Contract Function

**Solidity**:
```solidity
function recordConsent(
    string memory _patientId,
    string memory _anonymousPatientId,
    string memory _hcsTopicId,
    string memory _consentHash
) external {
    // Store consent record
    consents[_patientId] = ConsentRecord({
        patientId: _patientId,
        anonymousPatientId: _anonymousPatientId,
        hcsTopicId: _hcsTopicId,
        consentHash: _consentHash,
        timestamp: block.timestamp,
        isValid: true
    });
    
    emit ConsentRecorded(...);
}
```

## RevenueSplitter Integration

### Purpose

**RevenueSplitter** automatically distributes revenue:
- Receives HBAR payments
- Splits 60/25/15 automatically
- Distributes to wallets
- Emits events

### Integration Flow

```
1. Calculate total revenue
   ↓
2. Transfer HBAR to contract
   ↓
3. Contract receives payment
   ↓
4. Automatically splits
   ↓
5. Distributes to wallets
```

### Code Implementation

**Execute Payout**:
```javascript
const totalHbar = new Hbar(0.1); // 0.1 HBAR

await executeRealPayout(
  client,                  // Hedera client
  revenueSplitterAddress, // Contract address
  totalHbar               // Amount to distribute
);
```

### What Happens

1. **Create Transfer**: TransferTransaction
2. **From Operator**: Your account
3. **To Contract**: RevenueSplitter address
4. **Contract Receives**: Triggers `receive()`
5. **Auto-Distributes**: 60/25/15 split
6. **Returns Transaction ID**: For verification

### Contract Function

**Solidity**:
```solidity
receive() external payable {
    if (msg.value > 0) {
        emit RevenueReceived(msg.sender, msg.value);
        _distributeRevenue(msg.value);
    }
}

function _distributeRevenue(uint256 amount) internal {
    uint256 patientAmount = (amount * 6000) / 10000;  // 60%
    uint256 hospitalAmount = (amount * 2500) / 10000; // 25%
    uint256 medipactAmount = amount - patientAmount - hospitalAmount; // 15%
    
    // Transfer to wallets
    patientWallet.transfer(patientAmount);
    hospitalWallet.transfer(hospitalAmount);
    medipactWallet.transfer(medipactAmount);
    
    emit RevenueDistributed(...);
}
```

## EVM Client

### Purpose

**EVM Client** (`evm-client.js`) handles:
- Contract address conversion
- Function parameter building
- Contract execution
- Transaction handling

### Key Functions

#### recordConsentOnChain()

**Purpose**: Record consent in ConsentManager

**Process**:
1. Convert EVM address to ContractId
2. Build function parameters
3. Execute contract function
4. Wait for receipt
5. Return transaction ID

**Gas Limit**: 500,000 (sufficient for storage)

#### executeRealPayout()

**Purpose**: Send HBAR to RevenueSplitter

**Process**:
1. Create TransferTransaction
2. From operator account
3. To contract address
4. Execute transfer
5. Contract auto-distributes

## Address Conversion

### EVM Address Format

**Format**: `0x` followed by 40 hex characters

**Example**: `0x002616C472968dd344a520266f70891e7246dFb9`

### Hedera ContractId Format

**Format**: Shard.Realm.Contract

**Example**: `0.0.1234567`

### Conversion

```javascript
// EVM address to ContractId
const contractId = ContractId.fromEvmAddress(
  0,  // Shard (0 for testnet/mainnet)
  0,  // Realm (0 for testnet/mainnet)
  evmAddress  // "0x..."
);
```

## Gas Management

### Gas Limits

**ConsentManager**:
- `recordConsent()`: 500,000 gas
- Sufficient for string storage
- Covers all operations

**RevenueSplitter**:
- `receive()`: Automatic (no limit needed)
- Transfer operations included
- Gas paid by sender

### Gas Price

**Hedera EVM**:
- Minimum: 500 Gwei
- Set in Hardhat config
- Applied automatically

## Error Handling

### Common Errors

**Contract Not Found**:
- Check address is correct
- Verify contract is deployed
- Check network (testnet/mainnet)

**Insufficient Gas**:
- Increase gas limit
- Check contract complexity
- Verify function parameters

**Transaction Failed**:
- Check account has HBAR
- Verify contract state
- Review error message

### Error Recovery

```javascript
try {
  await recordConsentOnChain(...);
  console.log('✓ Consent recorded');
} catch (error) {
  console.error('⚠️ Failed:', error.message);
  // Continue execution
  // Don't block entire process
}
```

## Configuration

### Environment Variables

```env
# Contract addresses (EVM format)
CONSENT_MANAGER_ADDRESS="0x002616C472968dd344a520266f70891e7246dFb9"
REVENUE_SPLITTER_ADDRESS="0x4392Ec1c1827ec9401935685978305B9aCB55881"
```

### Optional Integration

**If addresses not set**:
- Consent recording skipped
- Payout execution skipped
- Adapter continues with HCS only
- No errors thrown

**If addresses set**:
- Consent recorded on-chain
- Payout executed automatically
- Full integration active

## Verification

### On HashScan

**Contract Page**:
```
https://hashscan.io/testnet/contract/0x002616C472968dd344a520266f70891e7246dFb9
```

**Shows**:
- Contract details
- Transaction history
- Function calls
- Events emitted

### Transaction Verification

**Consent Recording**:
- Check `ConsentRecorded` event
- Verify parameters
- Confirm timestamp

**Payout Execution**:
- Check `RevenueDistributed` event
- Verify amounts (60/25/15)
- Confirm recipients

## Benefits of On-Chain Integration

### ConsentManager Benefits

- ✅ **Fast Lookups**: On-chain queries
- ✅ **Immutable**: Cannot be changed
- ✅ **Linked**: References HCS topics
- ✅ **Verifiable**: Public record
- ✅ **Status Tracking**: Valid/invalid

### RevenueSplitter Benefits

- ✅ **Automatic**: No manual intervention
- ✅ **Fair**: Enforced by code
- ✅ **Transparent**: All visible
- ✅ **Trustless**: No intermediaries
- ✅ **Instant**: Immediate distribution

## Integration Flow

### Complete Process

```
1. Process data
   ↓
2. Generate hashes
   ↓
3. Submit to HCS
   ↓
4. Record consent in ConsentManager (optional)
   ↓
5. Calculate revenue
   ↓
6. Execute payout via RevenueSplitter (optional)
   ↓
7. Verify on HashScan
```

## Key Takeaways

- **ConsentManager**: On-chain consent registry
- **RevenueSplitter**: Automated revenue distribution
- **EVM Client**: Handles contract interactions
- **Address Conversion**: EVM ↔ Hedera format
- **Gas Management**: Limits and prices
- **Optional**: Works with or without contracts

## Next Steps

Now that you understand contract integration:

- **Next Lesson**: [Running Your First Demo](./16-first-demo.md) - Step-by-step walkthrough

---

**Contract Integration Summary:**
- ConsentManager: Records consent on-chain
- RevenueSplitter: Auto-splits revenue
- EVM client handles interactions
- Optional but recommended
- Transparent and verifiable
- Automated operations

