# Lesson 14: HCS Integration

## Immutable Proof Storage

This lesson explains how MediPact uses Hedera Consensus Service (HCS) to store proof hashes immutably on the blockchain.

## What is HCS?

**HCS** (Hedera Consensus Service) is an immutable message log:
- Like a bulletin board
- Messages stored permanently
- Cannot be altered or deleted
- Verifiable by anyone

### Key Characteristics

- **Immutable**: Once written, cannot change
- **Append-Only**: Can only add, not modify
- **Fast**: Finality in 3-5 seconds
- **Low Cost**: ~$0.0001 per message
- **Public**: Anyone can read

## Why HCS for MediPact?

### Problem: Need Immutable Proof

**Challenge**: Prove consent and data authenticity

**HCS Solution**:
- Store proof hashes permanently
- Cannot be altered
- Verifiable by anyone
- Legal audit trail

### Benefits

- ✅ **Immutable**: Proofs cannot be changed
- ✅ **Verifiable**: Anyone can check
- ✅ **Fast**: Quick confirmation
- ✅ **Affordable**: Low cost per message
- ✅ **Transparent**: Public record

## HCS Topics

### What are Topics?

**Topics** are message containers:
- Each topic has unique ID
- Messages appended to topic
- Can have multiple topics
- Organized by purpose

### Topic Structure

```
Topic ID: 0.0.123456
Messages:
  - Message 1 (hash)
  - Message 2 (hash)
  - Message 3 (hash)
  ...
```

### MediPact Topics

**Consent Topic**:
- Stores consent proof hashes
- One hash per patient
- Links to consent forms

**Data Topic**:
- Stores data proof hashes
- One hash per record
- Links to anonymized data

## Creating Topics

### Process

```javascript
// Create consent topic
const consentTopic = await createTopic(client, 'MediPact Consent Proofs');

// Create data topic
const dataTopic = await createTopic(client, 'MediPact Data Proofs');
```

### What Happens

1. **Transaction Created**: TopicCreateTransaction
2. **Submitted to Network**: Sent to Hedera
3. **Consensus Reached**: Network agrees
4. **Topic Created**: Unique ID assigned
5. **HashScan Link**: Generated for verification

### Topic ID Format

**Format**: `0.0.xxxxx`

**Example**: `0.0.123456`

**Characteristics**:
- Unique identifier
- Permanent
- Verifiable on HashScan

## Submitting Messages

### Process

```javascript
// Submit consent hash
const txId = await submitMessage(
  client,
  consentTopicId,
  consentHash
);

// Submit data hash
const txId = await submitMessage(
  client,
  dataTopicId,
  dataHash
);
```

### What Happens

1. **Message Created**: TopicMessageSubmitTransaction
2. **Message Content**: Hash (hex string)
3. **Submitted to Network**: Sent to Hedera
4. **Consensus Reached**: Network agrees
5. **Message Stored**: Added to topic
6. **Transaction ID**: Returned for verification

### Message Content

**Consent Hash**:
```
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

**Data Hash**:
```
f6e5d4c3b2a1098765432109876543210987654321fedcba0987654321fedcba
```

## HashScan Verification

### Viewing Topics

**Topic Page**:
```
https://hashscan.io/testnet/topic/0.0.123456
```

**Shows**:
- All messages in topic
- Message timeline
- Transaction IDs
- Message content (hashes)

### Viewing Transactions

**Transaction Page**:
```
https://hashscan.io/testnet/transaction/0.0.123456@1234567890.123456789
```

**Shows**:
- Transaction status
- Timestamp
- Message content
- Topic ID
- Sender account

## Integration in MediPact

### Step-by-Step Process

```
1. Create Topics
   ↓
2. Generate Hashes
   ↓
3. Submit to HCS
   ↓
4. Get Transaction IDs
   ↓
5. Generate HashScan Links
   ↓
6. Display to User
```

### Code Flow

**Initialize Topics**:
```javascript
const { consentTopicId, dataTopicId } = 
  await initializeMedipactTopics(client);
```

**Submit Consent Proof**:
```javascript
const consentHash = hashConsentForm(patientId, date);
const txId = await submitMessage(client, consentTopicId, consentHash);
```

**Submit Data Proof**:
```javascript
const dataHash = hashPatientRecord(record);
const txId = await submitMessage(client, dataTopicId, dataHash);
```

## Why Hashes?

### What are Hashes?

**Hash**: Cryptographic fingerprint

**Characteristics**:
- Unique for each input
- Fixed size (256 bits for SHA-256)
- One-way function (cannot reverse)
- Deterministic (same input = same hash)

### Why Use Hashes?

**Privacy**:
- Hash doesn't reveal original data
- Can verify without seeing data
- Protects sensitive information

**Verification**:
- Compare hash to verify data
- Proves data hasn't changed
- Enables authenticity checks

**Efficiency**:
- Small size (64 hex characters)
- Fast to compute
- Low storage cost

## Hash Generation

### Consent Hash

```javascript
const consentHash = hashConsentForm(
  patientId,        // "ID-12345"
  consentDate,     // "2024-01-15"
  consentType      // "data_sharing"
);
```

**Input**:
- Patient ID
- Consent date
- Consent type
- Timestamp

**Output**: SHA-256 hash (hex string)

### Data Hash

```javascript
const dataHash = hashPatientRecord(anonymizedRecord);
```

**Input**:
- Anonymized record (JSON)
- Sorted keys (for consistency)

**Output**: SHA-256 hash (hex string)

## Verification Process

### How to Verify

**Step 1**: Get hash from HashScan
```
From transaction: a1b2c3d4e5f6...
```

**Step 2**: Compute hash from data
```javascript
const computedHash = hashConsentForm(patientId, date);
// Result: a1b2c3d4e5f6...
```

**Step 3**: Compare
```
HashScan hash: a1b2c3d4e5f6...
Computed hash: a1b2c3d4e5f6...
Match: ✅ Data is authentic
```

### What Verification Proves

- ✅ **Authenticity**: Data is original
- ✅ **Integrity**: Data hasn't changed
- ✅ **Consent**: Consent was given
- ✅ **Timestamp**: When it happened

## Topic Management

### Reusing Topics

**Option 1**: Create new topics each run
- Fresh start
- Separate proofs
- More topics

**Option 2**: Reuse existing topics
- Accumulate messages
- Single topic per type
- Fewer topics

**MediPact**: Creates new topics each run (for demo)

### Topic Lifecycle

```
1. Create Topic
   ↓
2. Submit Messages
   ↓
3. Topic Exists Forever
   ↓
4. Messages Accumulate
   ↓
5. Verifiable Anytime
```

## Cost Considerations

### Transaction Costs

**Topic Creation**:
- ~$0.01 USD (one-time)
- Creates permanent topic

**Message Submission**:
- ~$0.0001 USD per message
- Very affordable
- Scales well

**For 10 Records**:
- 2 topics: $0.02
- 15 messages: $0.0015
- Total: ~$0.02 USD

## Best Practices

### Hash Generation

- ✅ Use consistent format
- ✅ Sort keys before hashing
- ✅ Include all relevant data
- ✅ Use standard algorithm (SHA-256)

### Topic Management

- ✅ Use descriptive topic memos
- ✅ Organize by purpose
- ✅ Document topic IDs
- ✅ Keep track of topics

### Verification

- ✅ Store HashScan links
- ✅ Document verification process
- ✅ Enable easy checking
- ✅ Provide to researchers

## Key Takeaways

- **HCS**: Immutable message log
- **Topics**: Message containers
- **Messages**: Proof hashes
- **Hashes**: Cryptographic fingerprints
- **Verification**: Compare hashes
- **Immutable**: Cannot be changed

## Next Steps

Now that you understand HCS integration:

- **Next Lesson**: [Smart Contract Integration](./15-contract-integration.md) - On-chain operations

---

**HCS Summary:**
- Immutable message storage
- Topics for organization
- Hashes for verification
- Fast and affordable
- Public and verifiable
- Perfect for proof storage

