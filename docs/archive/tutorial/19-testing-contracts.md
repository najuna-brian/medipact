# Lesson 19: Testing Smart Contracts

## Deploying and Testing Contracts

This lesson guides you through deploying and testing the MediPact smart contracts on Hedera testnet.

## Prerequisites

Before deploying contracts:

- [ ] Node.js installed
- [ ] Contract dependencies installed
- [ ] Hedera testnet account created
- [ ] Account funded with HBAR
- [ ] `.env` file configured in `contracts/` directory

## Step 1: Navigate to Contracts Directory

```bash
# From project root
cd contracts

# Verify you're in the right place
pwd
# Should show: .../medipact/contracts

# List files
ls
# Should see: contracts/, scripts/, test/, package.json
```

✅ **Checkpoint**: In contracts directory

## Step 2: Configure Environment

### Create .env File

```bash
# Copy template if exists, or create new
touch .env

# Edit .env file
code .env
# Or: nano .env
```

### Required Variables

```env
# Hedera Configuration
OPERATOR_KEY_HEX="0x..."           # Private key in hex format
HEDERA_RPC_URL="https://testnet.hashio.io/api"  # RPC endpoint

# Optional: Previewnet
PREVIEWNET_OPERATOR_KEY_HEX="0x..."
HEDERA_PREVIEWNET_RPC_URL="https://previewnet.hashio.io/api"
```

**Note**: `OPERATOR_KEY_HEX` is different from `OPERATOR_KEY`:
- `OPERATOR_KEY`: ECDSA format (for adapter)
- `OPERATOR_KEY_HEX`: Hex format (for contracts)

**How to get hex key**:
- From Hedera Portal: Export private key as hex
- Or convert from ECDSA format

✅ **Checkpoint**: Environment configured

## Step 3: Compile Contracts

### Run Compilation

```bash
npm run compile
```

**What happens**:
- Compiles Solidity files
- Generates artifacts
- Creates ABI files
- Checks for errors

**Expected output**:
```
Compiling 2 files with 0.8.20
Compilation finished successfully
```

### Verify Compilation

```bash
# Check artifacts created
ls artifacts/contracts/

# Should see:
# - ConsentManager.sol/
# - RevenueSplitter.sol/
```

✅ **Checkpoint**: Contracts compiled

## Step 4: Run Tests

### Run Test Suite

```bash
npm test
```

**What happens**:
- Runs all tests
- Tests ConsentManager
- Tests RevenueSplitter
- Checks edge cases

**Expected output**:
```
  ConsentManager
    ✓ Should record consent
    ✓ Should get consent
    ✓ Should revoke consent
    ...

  RevenueSplitter
    ✓ Should receive and distribute
    ✓ Should split correctly
    ...

  24 passing
```

✅ **Checkpoint**: All tests passing

## Step 5: Deploy to Testnet

### Run Deployment

```bash
npm run deploy:testnet
```

**What happens**:
1. Connects to Hedera testnet
2. Deploys ConsentManager
3. Deploys RevenueSplitter
4. Saves deployment info
5. Displays addresses

### Expected Output

```
Deploying contracts to Hedera Testnet...

1. Deploying ConsentManager...
   ✓ ConsentManager deployed: 0x002616C472968dd344a520266f70891e7246dFb9
   ✓ HashScan: https://hashscan.io/testnet/contract/0x002616C472968dd344a520266f70891e7246dFb9

2. Deploying RevenueSplitter...
   ✓ RevenueSplitter deployed: 0x4392Ec1c1827ec9401935685978305B9aCB55881
   ✓ HashScan: https://hashscan.io/testnet/contract/0x4392Ec1c1827ec9401935685978305B9aCB55881

3. Verifying contracts...
   ✓ ConsentManager verified
   ✓ RevenueSplitter verified

4. Revenue Split Configuration:
   ✓ Patient Share: 60%
   ✓ Hospital Share: 25%
   ✓ MediPact Share: 15%

5. Deployment info saved to: deployment-info.json
```

### Deployment Info

**File**: `deployment-info.json`

**Content**:
```json
{
  "network": "testnet",
  "deployer": "0x3d4c1C5EB829a3123FA934d01dA6CE013D384CB7",
  "timestamp": "2024-01-15T10:30:00Z",
  "consentManager": {
    "address": "0x002616C472968dd344a520266f70891e7246dFb9",
    "hashScan": "https://hashscan.io/testnet/contract/0x002616C472968dd344a520266f70891e7246dFb9"
  },
  "revenueSplitter": {
    "address": "0x4392Ec1c1827ec9401935685978305B9aCB55881",
    "hashScan": "https://hashscan.io/testnet/contract/0x4392Ec1c1827ec9401935685978305B9aCB55881",
    "split": {
      "patient": "60%",
      "hospital": "25%",
      "medipact": "15%"
    }
  }
}
```

✅ **Checkpoint**: Contracts deployed

## Step 6: Verify on HashScan

### Check ConsentManager

1. Copy ConsentManager address from output
2. Go to HashScan: https://hashscan.io/testnet
3. Search for contract address
4. View contract details

**What to verify**:
- Contract exists
- Deployer is your account
- Transaction succeeded
- Contract code visible

### Check RevenueSplitter

1. Copy RevenueSplitter address from output
2. Search on HashScan
3. View contract details

**What to verify**:
- Contract exists
- Split percentages correct (60/25/15)
- Recipient addresses set
- Contract code visible

## Step 7: Configure Adapter

### Update Adapter .env

```bash
# Navigate to adapter
cd ../adapter

# Edit .env file
code .env
```

### Add Contract Addresses

```env
# Add to existing .env file
CONSENT_MANAGER_ADDRESS="0x002616C472968dd344a520266f70891e7246dFb9"
REVENUE_SPLITTER_ADDRESS="0x4392Ec1c1827ec9401935685978305B9aCB55881"
```

**Use addresses from deployment output**

✅ **Checkpoint**: Adapter configured

## Step 8: Test Integration

### Run Adapter

```bash
# From adapter directory
npm start
```

### What to Look For

**Consent Recording**:
```
✓ Successfully recorded consent proof on-chain in ConsentManager contract: https://hashscan.io/...
```

**Payout Execution**:
```
✓ Real payout executed successfully!
✓ RevenueSplitter contract will automatically distribute:
  - Patient Share (60%): 0.06 HBAR
  - Hospital Share (25%): 0.025 HBAR
  - MediPact Share (15%): 0.015 HBAR
```

### Verify on HashScan

1. Check ConsentManager contract
2. View recent transactions
3. Verify consent records
4. Check RevenueSplitter
5. Verify payout distribution

## Testing Contract Functions

### Test ConsentManager

**Record Consent** (via adapter):
- Run adapter with ConsentManager address
- Check consent is recorded
- Verify on HashScan

**Get Consent** (manual test):
```javascript
// In Hardhat console or test
const consent = await consentManager.getConsent("ID-12345");
console.log(consent);
```

### Test RevenueSplitter

**Send HBAR** (via adapter):
- Run adapter with RevenueSplitter address
- Check payout is executed
- Verify distribution

**Check Balance**:
```javascript
// In Hardhat console
const balance = await revenueSplitter.getBalance();
console.log(balance);
```

## Troubleshooting

### Deployment Fails

**Problem**: "Insufficient balance" or "Transaction failed"

**Solutions**:
- Check account has HBAR (10+ HBAR recommended)
- Verify private key is correct
- Check network is testnet
- Verify RPC URL is correct

### Contract Not Found

**Problem**: Can't find contract on HashScan

**Solutions**:
- Wait a few seconds (indexing delay)
- Verify address is correct
- Check network (testnet vs mainnet)
- Verify deployment succeeded

### Integration Fails

**Problem**: Adapter can't call contracts

**Solutions**:
- Verify addresses in .env are correct
- Check addresses are EVM format (0x...)
- Verify contracts are deployed
- Check account has HBAR for gas

## Best Practices

### Before Deployment

- ✅ Run all tests
- ✅ Verify compilation
- ✅ Check environment variables
- ✅ Ensure account has HBAR

### After Deployment

- ✅ Save deployment info
- ✅ Verify on HashScan
- ✅ Update adapter .env
- ✅ Test integration

### Security

- ✅ Never share private keys
- ✅ Don't commit .env files
- ✅ Use testnet for development
- ✅ Verify contract addresses

## Key Takeaways

- **Compile**: Check for errors
- **Test**: Verify functionality
- **Deploy**: To testnet
- **Verify**: On HashScan
- **Configure**: Update adapter
- **Test**: Integration

## Next Steps

Now that contracts are deployed:

- **Next Lesson**: [FHIR API Integration](./20-fhir-api.md) - Connecting to real EHR systems (future)

---

**Contract Testing Summary:**
- Compile contracts
- Run tests
- Deploy to testnet
- Verify on HashScan
- Configure adapter
- Test integration

