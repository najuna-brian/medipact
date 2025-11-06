# Lesson 11: Data Flow Overview

## How Data Moves Through the System

This lesson explains the complete journey of data from hospital to blockchain to researcher.

## The Complete Journey

```
Hospital EHR → Adapter → Anonymization → Hashing → Blockchain → Verification → Payment
```

## Step-by-Step Data Flow

### Phase 1: Input

```
┌─────────────┐
│   Hospital  │
│   EHR Data  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  CSV or     │
│  FHIR File  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Adapter   │
│   Reads     │
└─────────────┘
```

**What happens**:
1. Hospital provides data (CSV or FHIR)
2. Adapter detects format automatically
3. Reads file from disk
4. Parses into structured format

**Data at this stage**:
- Contains PII (names, IDs, addresses)
- Contains medical data (lab tests, results)
- Structured format (objects/arrays)

### Phase 2: Processing

```
┌─────────────┐
│   Parsed    │
│   Records   │
└──────┬──────┘
       │
       ├──► Group by Patient
       ├──► Assign Anonymous IDs
       │
       ▼
┌─────────────┐
│ Anonymized  │
│   Records   │
└──────┬──────┘
       │
       ├──► Generate Consent Hash
       ├──► Generate Data Hash
       │
       ▼
┌─────────────┐
│   Hashes    │
└─────────────┘
```

**What happens**:
1. Records grouped by patient
2. Anonymous IDs assigned (PID-001, PID-002)
3. PII removed (name, ID, address, phone, DOB)
4. Medical data preserved
5. Hashes generated (SHA-256)

**Data at this stage**:
- No PII (privacy protected)
- Anonymous IDs (PID-001, etc.)
- Medical data intact
- Hashes ready for blockchain

### Phase 3: Blockchain Storage

```
┌─────────────┐
│   Hashes    │
└──────┬──────┘
       │
       ├──► Consent Hashes
       │    └──► HCS Consent Topic
       │
       └──► Data Hashes
            └──► HCS Data Topic
       │
       ▼
┌─────────────┐
│   Hedera    │
│  Blockchain │
└─────────────┘
```

**What happens**:
1. HCS topics created (Consent + Data)
2. Consent hashes submitted to Consent Topic
3. Data hashes submitted to Data Topic
4. Transactions recorded on blockchain
5. HashScan links generated

**Data at this stage**:
- Hashes stored immutably
- Transactions visible on HashScan
- Topics contain all proofs
- Verifiable by anyone

### Phase 4: Smart Contract Integration

```
┌─────────────┐
│   HCS       │
│   Topics    │
└──────┬──────┘
       │
       ├──► Consent Records
       │    └──► ConsentManager Contract
       │
       └──► Revenue Distribution
            └──► RevenueSplitter Contract
       │
       ▼
┌─────────────┐
│  On-Chain   │
│  Registry   │
└─────────────┘
```

**What happens**:
1. Consent recorded in ConsentManager
2. Links to HCS topics stored
3. Revenue sent to RevenueSplitter
4. Automatic 60/25/15 split
5. Payments distributed

**Data at this stage**:
- Consent on-chain registry
- Revenue automatically split
- Payments executed
- All transactions verifiable

### Phase 5: Output

```
┌─────────────┐
│  Anonymized │
│    Data     │
└──────┬──────┘
       │
       ├──► CSV File
       ├──► FHIR Bundle
       └──► HashScan Links
       │
       ▼
┌─────────────┐
│ Researcher  │
│   Receives  │
└─────────────┘
```

**What happens**:
1. Anonymized CSV file created
2. Anonymized FHIR Bundle created (if FHIR input)
3. HashScan links provided
4. Data ready for sharing
5. Researcher can verify authenticity

**Data at this stage**:
- No PII (safe to share)
- Medical data preserved
- Verification hashes included
- Standards-compliant format

## Detailed Flow Diagram

### Complete End-to-End Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    INPUT PHASE                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Hospital EHR System                                        │
│         │                                                    │
│         ▼                                                    │
│  [CSV File] or [FHIR Bundle]                                │
│         │                                                    │
│         ▼                                                    │
│  Adapter Reads File                                          │
│         │                                                    │
│         ▼                                                    │
│  Parsed Records (with PII)                                  │
│                                                             │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                 PROCESSING PHASE                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Group Records by Patient                               │
│  2. Assign Anonymous IDs (PID-001, PID-002, ...)           │
│  3. Remove PII (name, ID, address, phone, DOB)             │
│  4. Preserve Medical Data (tests, results, dates)          │
│  5. Generate Consent Hashes (one per patient)              │
│  6. Generate Data Hashes (one per record)                  │
│                                                             │
│  Result: Anonymized Records + Hashes                       │
│                                                             │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                BLOCKCHAIN PHASE                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Create HCS Topics (Consent + Data)                     │
│  2. Submit Consent Hashes to Consent Topic                  │
│  3. Submit Data Hashes to Data Topic                        │
│  4. Record Consent in ConsentManager Contract              │
│  5. Generate HashScan Links                                 │
│                                                             │
│  Result: Immutable Proof on Blockchain                     │
│                                                             │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  OUTPUT PHASE                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Write Anonymized CSV File                               │
│  2. Write Anonymized FHIR Bundle (if FHIR input)           │
│  3. Display HashScan Links                                  │
│  4. Calculate Revenue Split                                 │
│  5. Execute Payout (if configured)                         │
│                                                             │
│  Result: Shareable Data + Verification Links              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Data Transformation at Each Stage

### Stage 1: Original Data

```csv
Patient Name,Patient ID,Address,Phone,DOB,Lab Test,Result
John Doe,ID-12345,123 Main St,0771234567,1990-05-15,Blood Glucose,95
```

**Contains**: PII + Medical Data

### Stage 2: After Anonymization

```csv
Anonymous PID,Lab Test,Result
PID-001,Blood Glucose,95
```

**Contains**: Medical Data Only (PII removed)

### Stage 3: After Hashing

```
Consent Hash: a1b2c3d4e5f6...
Data Hash: f6e5d4c3b2a1...
```

**Contains**: Cryptographic fingerprints

### Stage 4: On Blockchain

```
HCS Topic 0.0.xxxxx:
  - Consent Hash: a1b2c3d4e5f6...
  - Data Hash: f6e5d4c3b2a1...
```

**Contains**: Immutable proof hashes

### Stage 5: Final Output

```
Files:
  - anonymized_data.csv (no PII)
  - anonymized_data.fhir.json (no PII)

Links:
  - HashScan transaction links
  - HashScan topic links
```

**Contains**: Shareable data + verification

## Key Data Structures

### Patient Mapping

```
Original ID → Anonymous ID
ID-12345 → PID-001
ID-12346 → PID-002
ID-12347 → PID-003
```

**Purpose**: Link consent and payments to original patients

### Consent Records

```
Patient ID: ID-12345
Anonymous ID: PID-001
Consent Hash: a1b2c3d4...
HCS Topic: 0.0.xxxxx
```

**Purpose**: Track consent for each patient

### Data Records

```
Anonymous ID: PID-001
Data Hash: f6e5d4c3...
HCS Topic: 0.0.yyyyy
```

**Purpose**: Verify data authenticity

## Flow Control Points

### Decision Points

1. **Format Detection**: CSV or FHIR?
2. **Anonymization**: Which PII to remove?
3. **Hashing**: What to hash?
4. **Blockchain**: Which topics to use?
5. **Output**: Which formats to generate?

### Error Handling

At each stage:
- **Validation**: Check data format
- **Error Recovery**: Continue if possible
- **Logging**: Record what happened
- **User Feedback**: Clear error messages

## Performance Considerations

### Processing Time

- **Reading**: < 1 second (small files)
- **Anonymization**: < 1 second
- **Hashing**: < 1 second
- **Blockchain**: 2-5 seconds per transaction
- **Total**: ~30-60 seconds for 10 records

### Scalability

- **Current**: Handles hundreds of records
- **Future**: Can scale to thousands
- **Optimization**: Batch processing, parallel transactions

## Key Takeaways

- **Input**: Hospital data (CSV/FHIR) with PII
- **Processing**: Anonymization + hashing
- **Blockchain**: Immutable proof storage
- **Output**: Shareable data + verification
- **Flow**: Linear, step-by-step process

## Next Steps

Now that you understand data flow:

- **Next Lesson**: [CSV vs FHIR Formats](./12-data-formats.md) - Understanding input formats

---

**Flow Summary:**
- Hospital → Adapter → Anonymization → Hashing → Blockchain → Output
- PII removed, medical data preserved
- Hashes stored immutably
- Data ready for sharing
- All verifiable on blockchain

