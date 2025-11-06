# Lesson 4: Project Architecture Overview

## System Architecture

This lesson explains how all the components of MediPact work together. Understanding the architecture will help you see how everything connects.

## High-Level Architecture

```
┌─────────────┐
│   Hospital  │
│   EHR Data  │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  MediPact       │
│  Adapter        │
│  (Node.js)      │
└──────┬──────────┘
       │
       ├──► Anonymization
       ├──► Hashing
       │
       ▼
┌─────────────────┐
│  Hedera         │
│  Blockchain     │
│                 │
│  • HCS Topics   │
│  • Smart        │
│    Contracts   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  HashScan       │
│  (Explorer)     │
└─────────────────┘
```

## Component Breakdown

### 1. Data Input Layer

**Purpose**: Receive data from hospitals

**Components**:
- **FHIR API** (future): Direct connection to EHR systems
- **FHIR Bundle** (current): JSON file with FHIR resources
- **CSV File** (legacy): Simple comma-separated values

**Location**: `adapter/data/`

**Files**:
- `raw_data.csv` - Sample CSV data
- `raw_data.fhir.json` - Sample FHIR Bundle

### 2. Adapter Engine

**Purpose**: Process, anonymize, and prepare data

**Location**: `adapter/src/`

**Key Modules**:

#### a) Main Orchestrator (`index.js`)
- Coordinates entire flow
- Detects input format (CSV/FHIR)
- Calls other modules
- Handles errors

#### b) Anonymization (`anonymizer/anonymize.js`)
- Parses CSV files
- Removes PII
- Generates anonymous IDs
- Preserves medical data

#### c) FHIR Module (`fhir/`)
- Parses FHIR resources
- Converts to normalized format
- Anonymizes FHIR resources
- Handles FHIR API (future)

#### d) Hash Generation (`utils/hash.js`)
- SHA-256 hashing
- Consent form hashing
- Data record hashing
- Batch hashing

#### e) Currency Utilities (`utils/currency.js`)
- HBAR formatting
- USD conversion
- Local currency conversion
- Revenue split calculation

### 3. Hedera Integration Layer

**Purpose**: Interact with Hedera blockchain

**Location**: `adapter/src/hedera/`

**Key Modules**:

#### a) HCS Client (`hcs-client.js`)
- Creates HCS topics
- Submits messages
- Generates HashScan links
- Handles transactions

#### b) EVM Client (`evm-client.js`)
- Interacts with smart contracts
- Records consent on-chain
- Executes payouts
- Handles contract calls

### 4. Smart Contracts

**Purpose**: Automate operations on blockchain

**Location**: `contracts/contracts/`

**Contracts**:

#### a) ConsentManager (`ConsentManager.sol`)
- Stores consent records
- Links to HCS topics
- Tracks consent status
- Enables lookups

#### b) RevenueSplitter (`RevenueSplitter.sol`)
- Receives HBAR payments
- Automatically splits revenue
- Distributes to wallets
- Emits events

### 5. Output Layer

**Purpose**: Generate anonymized data

**Files**:
- `anonymized_data.csv` - CSV format output
- `anonymized_data.fhir.json` - FHIR format output

## Data Flow Architecture

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT PHASE                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Hospital EHR → [CSV or FHIR] → Adapter                    │
│                                                             │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 PROCESSING PHASE                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Parse Data (CSV/FHIR)                                  │
│  2. Anonymize (Remove PII)                                 │
│  3. Generate Hashes (Consent + Data)                       │
│  4. Create Patient Mapping (Original → Anonymous)         │
│                                                             │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                BLOCKCHAIN PHASE                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Create HCS Topics (Consent + Data)                      │
│  2. Submit Consent Proof Hashes                            │
│  3. Submit Data Proof Hashes                               │
│  4. Record Consent on ConsentManager Contract              │
│                                                             │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  OUTPUT PHASE                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Write Anonymized CSV                                   │
│  2. Write Anonymized FHIR Bundle (if FHIR input)           │
│  3. Display HashScan Links                                  │
│  4. Calculate Revenue Split                                 │
│  5. Execute Payout (if configured)                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Detailed Component Interactions

### 1. Input Processing

**CSV Path**:
```
raw_data.csv
  → parseCSV()
  → Array of records
  → anonymizeRecords()
  → Anonymized records + mapping
```

**FHIR Path**:
```
raw_data.fhir.json
  → parseFHIRBundle()
  → FHIR Bundle
  → bundleToRecords()
  → Normalized records
  → anonymizeRecordsWithFHIR()
  → Anonymized records + FHIR Bundle + mapping
```

### 2. Anonymization Process

```
Original Record
  ├── Patient Name: "John Doe"        → REMOVED
  ├── Patient ID: "ID-12345"         → REMOVED
  ├── Address: "123 Main St"         → REMOVED
  ├── Phone: "0771234567"            → REMOVED
  ├── DOB: "1990-05-15"              → REMOVED
  ├── Lab Test: "Blood Glucose"     → PRESERVED
  ├── Result: "95"                    → PRESERVED
  └── Anonymous PID: "PID-001"       → ADDED
```

### 3. Hashing Process

**Consent Hash**:
```
Patient ID + Consent Date + Timestamp
  → SHA-256
  → Consent Hash (hex string)
  → Submit to HCS Consent Topic
```

**Data Hash**:
```
Anonymized Record (sorted keys)
  → JSON.stringify()
  → SHA-256
  → Data Hash (hex string)
  → Submit to HCS Data Topic
```

### 4. Blockchain Storage

**HCS Topics**:
```
Consent Topic (0.0.xxxxx)
  ├── Consent Hash 1
  ├── Consent Hash 2
  └── ...

Data Topic (0.0.yyyyy)
  ├── Data Hash 1
  ├── Data Hash 2
  └── ...
```

**Smart Contracts**:
```
ConsentManager (0x...)
  ├── Consent Record 1
  │   ├── Patient ID
  │   ├── Anonymous ID
  │   ├── HCS Topic ID
  │   └── Consent Hash
  └── ...

RevenueSplitter (0x...)
  ├── Receives HBAR
  ├── Splits 60/25/15
  └── Distributes
```

## File Structure

```
medipact/
├── adapter/                    # Core engine
│   ├── data/                  # Input/output data
│   │   ├── raw_data.csv
│   │   ├── raw_data.fhir.json
│   │   ├── anonymized_data.csv
│   │   └── anonymized_data.fhir.json
│   ├── src/                   # Source code
│   │   ├── index.js          # Main orchestrator
│   │   ├── anonymizer/        # Anonymization
│   │   ├── fhir/             # FHIR integration
│   │   ├── hedera/            # Blockchain integration
│   │   └── utils/             # Utilities
│   └── scripts/               # Utility scripts
│
├── contracts/                  # Smart contracts
│   ├── contracts/             # Solidity files
│   ├── scripts/               # Deployment
│   └── test/                  # Tests
│
└── docs/                      # Documentation
    └── tutorial/              # This tutorial
```

## Technology Stack

### Backend
- **Node.js**: Runtime environment
- **JavaScript (ES6+)**: Programming language
- **dotenv**: Environment variables

### Blockchain
- **Hedera Hashgraph**: Blockchain network
- **@hashgraph/sdk**: JavaScript SDK
- **HCS**: Consensus Service for immutable storage
- **EVM**: Smart contract execution

### Data Standards
- **FHIR R4**: Healthcare data standard
- **LOINC**: Lab test codes
- **JSON**: Data format

### Smart Contracts
- **Solidity**: Programming language
- **Hardhat**: Development environment
- **Ethers.js**: Contract interaction

## Security Architecture

### 1. Privacy Protection
- **Anonymization**: PII removed before sharing
- **Cryptographic hashing**: One-way functions
- **No PII on blockchain**: Only hashes stored

### 2. Immutability
- **HCS**: Immutable message log
- **Smart contracts**: Code cannot be changed
- **Blockchain**: Distributed ledger

### 3. Access Control
- **Private keys**: Secure authentication
- **Smart contract permissions**: Owner-only functions
- **Environment variables**: Sensitive data protected

## Scalability Considerations

### Current Design
- **File-based**: Works for demos and small datasets
- **Batch processing**: Processes all records at once
- **Single adapter**: One instance per hospital

### Future Enhancements
- **Streaming**: Process records as they arrive
- **Distributed**: Multiple adapter instances
- **API integration**: Real-time data sync
- **Caching**: Optimize repeated operations

## Error Handling

### Layers of Error Handling

1. **Input Validation**: Check file format, required fields
2. **Processing Errors**: Handle anonymization failures
3. **Blockchain Errors**: Retry transactions, handle network issues
4. **Output Errors**: Validate output files

### Error Recovery

- **Graceful degradation**: Continue even if some steps fail
- **Logging**: Detailed error messages
- **Retry logic**: Automatic retries for network operations
- **User feedback**: Clear error messages

## Key Takeaways

- **Modular design**: Each component has specific purpose
- **Clear separation**: Input, processing, blockchain, output
- **Standards-based**: FHIR, LOINC, blockchain standards
- **Scalable**: Can grow from demo to production
- **Secure**: Privacy and immutability built-in

## Next Steps

Now that you understand the architecture, let's learn about the technologies:

- **Next Lesson**: [Hedera Blockchain Basics](./05-hedera-basics.md) - Understanding Hedera Hashgraph

---

**Architecture Summary:**
- Input → Processing → Blockchain → Output
- Modular components work together
- Standards-based design
- Secure and scalable

