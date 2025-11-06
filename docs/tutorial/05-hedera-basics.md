# Lesson 5: Hedera Blockchain Basics

## Understanding Hedera Hashgraph

This lesson explains what Hedera is, why it's perfect for MediPact, and how it works.

## What is Hedera?

**Hedera Hashgraph** is a public distributed ledger technology (blockchain) that provides:
- Fast, fair, and secure consensus
- Low transaction costs
- High throughput
- Carbon-negative network

### Key Characteristics

- **Public Network**: Anyone can use it
- **Fast**: 10,000+ transactions per second
- **Low Cost**: Fraction of a cent per transaction
- **Green**: Carbon-negative (more carbon removed than produced)
- **Secure**: Asynchronous Byzantine Fault Tolerant (aBFT)

## Why Hedera for MediPact?

### 1. Speed

**Problem**: Healthcare data needs fast processing

**Hedera Solution**:
- 10,000+ TPS (transactions per second)
- Finality in 3-5 seconds
- No waiting for block confirmations

**For MediPact**:
- Consent proofs recorded instantly
- Data proofs submitted quickly
- Real-time verification

### 2. Low Cost

**Problem**: Healthcare needs affordable transactions

**Hedera Solution**:
- $0.0001 USD per transaction
- No gas price volatility
- Predictable costs

**For MediPact**:
- Affordable for hospitals
- Scalable to millions of records
- No surprise fees

### 3. Green Technology

**Problem**: Environmental concerns with blockchain

**Hedera Solution**:
- Carbon-negative network
- Energy-efficient consensus
- Sustainable operations

**For MediPact**:
- Aligns with healthcare values
- Environmentally responsible
- Future-proof

### 4. Security

**Problem**: Healthcare data needs maximum security

**Hedera Solution**:
- aBFT consensus (mathematically proven)
- No single point of failure
- Distributed network

**For MediPact**:
- Immutable records
- Tamper-proof
- Trustless verification

## Hedera Services

### 1. Hedera Consensus Service (HCS)

**What it is**: Immutable message log (like a bulletin board)

**How it works**:
- Create topics
- Submit messages
- Messages stored permanently
- Anyone can read

**For MediPact**:
- Stores consent proof hashes
- Stores data proof hashes
- Provides audit trail
- Enables verification

**Example**:
```
Topic: 0.0.123456
Messages:
  - Consent Hash 1
  - Consent Hash 2
  - Data Hash 1
  - Data Hash 2
```

### 2. Hedera Token Service (HTS)

**What it is**: Create and manage tokens

**For MediPact**:
- Could create MediPact tokens
- Reward patients
- Incentivize data sharing
- (Not currently used, but possible)

### 3. Hedera Smart Contract Service

**What it is**: Run Solidity smart contracts on EVM

**How it works**:
- Deploy Solidity contracts
- Execute contract functions
- Pay gas fees
- Store state on-chain

**For MediPact**:
- ConsentManager contract
- RevenueSplitter contract
- Automated revenue distribution
- On-chain consent registry

### 4. Hedera File Service (HFS)

**What it is**: Store files on blockchain

**For MediPact**:
- Could store anonymized data
- (Not currently used, hashes are sufficient)

## How Hedera Works

### Consensus Mechanism

**Hashgraph** (not blockchain):
- Uses gossip protocol
- Nodes share information
- Virtual voting
- No mining required

**Benefits**:
- Fast finality
- Low energy use
- Fair ordering
- Secure

### Network Structure

```
┌─────────┐
│  Node 1 │
└────┬────┘
     │
     ├──► Gossip Protocol
     │
┌────▼────┐     ┌─────────┐
│  Node 2 │◄────┤  Node 3 │
└────┬────┘     └─────────┘
     │
     ▼
  Consensus
```

**Nodes**:
- Council members (governance)
- Mirror nodes (data)
- Consensus nodes (validation)

### Transaction Flow

```
1. User creates transaction
   ↓
2. Submit to Hedera network
   ↓
3. Nodes gossip (share information)
   ↓
4. Virtual voting (reach consensus)
   ↓
5. Transaction finalized (3-5 seconds)
   ↓
6. Recorded on ledger (permanent)
```

## Hedera Accounts

### Account Structure

**Account ID**: `0.0.xxxxx`
- Format: Shard.Realm.Account
- Example: `0.0.1234567`
- Public identifier

**Keys**:
- **Public Key**: Can be shared
- **Private Key**: Keep secret!
- **ECDSA**: Elliptic Curve Digital Signature Algorithm

### Account Operations

**Create Account**:
- Get Account ID
- Get Private Key
- Fund with HBAR

**Use Account**:
- Sign transactions with private key
- Pay for transactions with HBAR
- Receive HBAR payments

## HBAR (Hedera's Native Token)

### What is HBAR?

**HBAR** is Hedera's native cryptocurrency:
- Used to pay transaction fees
- Used for staking (network security)
- Used for payments

### HBAR Characteristics

- **Supply**: 50 billion HBAR total
- **Decimals**: 8 decimal places (tinybars)
- **Unit**: 1 HBAR = 100,000,000 tinybars
- **Symbol**: ℏ (HBAR)

### Using HBAR

**Transaction Fees**:
- HCS message: ~0.0001 HBAR
- Smart contract call: ~0.001 HBAR
- Account creation: ~1 HBAR

**For MediPact**:
- Very affordable
- Predictable costs
- No gas price volatility

## Networks

### Testnet

**Purpose**: Development and testing

**Characteristics**:
- Free to use
- Free HBAR from faucet
- Same features as mainnet
- Separate from mainnet

**For MediPact**:
- Perfect for development
- Safe to experiment
- No real money at risk

### Mainnet

**Purpose**: Production use

**Characteristics**:
- Real HBAR required
- Real transactions
- Production applications
- Permanent records

**For MediPact**:
- Use after testing
- Real healthcare data
- Production deployment

### Previewnet

**Purpose**: Testing new features

**Characteristics**:
- Latest features
- May have bugs
- For advanced testing
- Separate network

## HashScan Explorer

### What is HashScan?

**HashScan** is the official Hedera blockchain explorer:
- View transactions
- Check account balances
- Explore topics
- Verify smart contracts

### Using HashScan

**Search**:
- Transaction ID
- Account ID
- Topic ID
- Contract address

**View**:
- Transaction details
- Account history
- Topic messages
- Contract state

**For MediPact**:
- Verify transactions
- Check consent proofs
- View data proofs
- Audit trail

## Security Features

### Consensus Security

**aBFT (Asynchronous Byzantine Fault Tolerant)**:
- Mathematically proven security
- Can handle up to 1/3 malicious nodes
- No single point of failure
- Distributed trust

### Transaction Security

**Cryptographic Signatures**:
- ECDSA signatures
- Private key required
- Cannot be forged
- Verifiable

**For MediPact**:
- Immutable records
- Tamper-proof
- Verifiable authenticity

## Key Concepts

### Topics (HCS)

**What**: Immutable message log

**Use**: Store hashes, proofs, messages

**Characteristics**:
- Permanent
- Append-only
- Verifiable
- Public

### Smart Contracts

**What**: Code running on blockchain

**Use**: Automate operations

**Characteristics**:
- Immutable code
- Deterministic execution
- Gas fees
- State storage

### Transactions

**What**: Operations on network

**Types**:
- HCS messages
- Token transfers
- Contract calls
- Account operations

**Characteristics**:
- Signed with private key
- Pay fees with HBAR
- Finalized in seconds
- Permanent record

## Comparison with Other Blockchains

### vs Ethereum

| Feature | Hedera | Ethereum |
|---------|--------|----------|
| **Speed** | 10,000+ TPS | ~15 TPS |
| **Cost** | $0.0001 | Variable (high) |
| **Energy** | Carbon-negative | High energy |
| **Finality** | 3-5 seconds | Minutes |

### vs Bitcoin

| Feature | Hedera | Bitcoin |
|---------|--------|---------|
| **Purpose** | Applications | Currency |
| **Speed** | 10,000+ TPS | ~7 TPS |
| **Cost** | $0.0001 | Variable |
| **Energy** | Carbon-negative | Very high |

## Key Takeaways

- **Hedera**: Fast, green, low-cost blockchain
- **HCS**: Immutable message storage
- **Smart Contracts**: Automated operations
- **HBAR**: Native token for fees
- **Testnet**: Free development environment
- **HashScan**: Blockchain explorer

## Next Steps

Now that you understand Hedera:

- **Next Lesson**: [FHIR Standards Explained](./06-fhir-standards.md) - Healthcare data standards

---

**Hedera Summary:**
- Public distributed ledger
- Fast (10,000+ TPS)
- Low cost ($0.0001 per transaction)
- Green (carbon-negative)
- Secure (aBFT consensus)
- Perfect for MediPact

