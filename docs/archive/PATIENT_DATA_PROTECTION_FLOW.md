# Patient Data Protection Flow: From Registration to Researcher

This document explains how patient data is protected throughout the entire MediPact system, from the moment a patient registers at a hospital to when anonymized data reaches researchers or buyers.

## 🔒 Complete Protection Flow

### Phase 1: Patient Registration & Consent (Hospital)

**Location**: Hospital System (Off-Chain)

**What Happens**:
1. Patient visits hospital and provides:
   - **PII**: Name, Patient ID, Address, Phone, Date of Birth
   - **Medical Data**: Lab tests, results, units, reference ranges
   - **Demographics**: Age, Gender, Occupation, Location

2. Patient gives **informed consent** for data sharing:
   - Consent form signed
   - Patient understands data will be anonymized
   - Patient agrees to share anonymized data for research

**Privacy Protection at This Stage**:
- ✅ Consent stored securely at hospital (encrypted)
- ✅ Original patient data never leaves hospital in identifiable form
- ✅ Hospital maintains patient mapping (Original ID → Anonymous ID) **off-chain, encrypted**

**What's Stored**:
- Original patient data: **Hospital database (encrypted, off-chain)**
- Consent form: **Hospital records (encrypted, off-chain)**
- Patient mapping: **Hospital memory/encrypted storage (off-chain)**

---

### Phase 2: Data Collection & Initial Processing (Hospital)

**Location**: Hospital System → MediPact Adapter

**What Happens**:
1. Hospital exports EHR data (CSV or FHIR format)
2. Data contains:
   - PII: Patient Name, ID, Address, Phone, DOB
   - Medical: Lab tests, results, dates, units
   - Demographics: Age/DOB, Gender, Occupation, Location

**Privacy Protection at This Stage**:
- ✅ Data transfer is secure (encrypted in transit)
- ✅ Original data remains at hospital
- ✅ Only authorized hospital staff can access original data

**What's Stored**:
- Original data: **Hospital system (encrypted)**
- Exported data: **Temporary file (deleted after processing)**

---

### Phase 3: Double Anonymization Process (MediPact Adapter)

**Location**: MediPact Adapter (Processing Server)

**What Happens**: MediPact applies **two-stage anonymization** for maximum privacy protection.

#### Stage 1: Storage Anonymization

**Purpose**: Optimized for research queries while protecting privacy

#### Step 3.1: Load Hospital Configuration
```javascript
hospitalInfo = {
  country: "Uganda",  // REQUIRED - used as fallback
  location: "Kampala, Uganda"  // Optional
}
```

#### Step 3.2: Demographic Anonymization

**Age Range Calculation (REQUIRED)**:
- Input: Age `35` OR Date of Birth `1990-01-15`
- Process: Calculate age if DOB provided, convert to 5-year range
- Output: `"35-39"` (generalized)
- **Protection**: Exact age/DOB **permanently removed**

**Country Extraction (REQUIRED)**:
- Input: Address `"Kampala, Uganda"` OR missing
- Process: Extract country from address, use hospital country if missing
- Output: `"Uganda"` (country-level only)
- **Protection**: Specific address/city **permanently removed**

**Gender Normalization (REQUIRED)**:
- Input: `"Male"`, `"male"`, `"M"`, or missing
- Process: Normalize to standard format
- Output: `"Male"` or `"Unknown"` (if missing)
- **Protection**: Preserved as-is (not identifying)

**Occupation Generalization (OPTIONAL)**:
- Input: `"doctor"`, `"nurse"`, or missing
- Process: Categorize into general groups
- Output: `"Healthcare Worker"` or `"Unknown"` (if missing)
- **Protection**: Specific occupation **generalized to category**

#### Step 3.3: PII Removal
**Removed PII Fields**:
- ❌ Patient Name
- ❌ Patient ID (original)
- ❌ Address (specific location)
- ❌ Phone Number
- ❌ Date of Birth (exact date)
- ❌ Age (exact age - replaced with range)

**Preserved Data**:
- ✅ Medical data (Lab Test, Result, Unit, Reference Range, Test Date)
- ✅ Demographics (Age Range, Country, Gender, Occupation Category)
- ✅ Anonymous Patient ID (PID-001, PID-002, etc.)

#### Step 3.4: Anonymous ID Generation
```
Original ID: "ID-12345" → Anonymous ID: "PID-001"
```

**Patient Mapping Created** (stored in memory, NOT in output):
```
ID-12345 → PID-001
ID-12346 → PID-002
```

**Privacy Protection**:
- ✅ Mapping stored **only in memory** during processing
- ✅ Mapping **NOT included** in anonymized output
- ✅ Mapping **NOT stored** on blockchain
- ✅ Mapping kept **encrypted at hospital** (off-chain)

#### Step 3.5: Generate Storage Hash

**What Happens**:
```javascript
storageHash = SHA-256(Stage1AnonymizedData)
```

**Storage Hash (H1)**: Cryptographic hash of Stage 1 anonymized data
- Used for backend storage verification
- Links to Stage 2 hash via provenance record

#### Step 3.6: Apply Stage 2 (Chain) Anonymization

**Purpose**: Maximum privacy for immutable blockchain storage

**Additional Generalizations**:
- Age Range: 5-year → 10-year (e.g., "35-39" → "30-39")
- Dates: Exact → Month/Year (e.g., "2024-03-15" → "2024-03")
- Location: Remove region/district (keep only country)
- Occupation: Further generalize (e.g., "Healthcare Worker" → "Healthcare")
- Suppress rare values

**Output After Stage 2**:
```csv
Anonymous PID,Age Range,Country,Gender,Occupation Category,Lab Test,Test Date,Result
PID-001,30-39,Uganda,Male,Healthcare,Blood Glucose,2024-01,95
```

**Privacy Protection**:
- ✅ Extra generalization for immutable blockchain storage
- ✅ Maximum privacy protection
- ✅ Cannot be reversed or deleted

#### Step 3.7: Generate Chain Hash and Provenance Proof

**What Happens**:
```javascript
chainHash = SHA-256(Stage2AnonymizedData)
provenanceProof = SHA-256({
  storageHash,
  chainHash,
  anonymousPatientId,
  resourceType
})
```

**Chain Hash (H2)**: Cryptographic hash of Stage 2 anonymized data
**Provenance Proof**: Links both hashes together

#### Step 3.8: Create Provenance Record

**What Happens**:
```json
{
  "storage": {
    "hash": "abc123...",
    "anonymizationLevel": "storage"
  },
  "chain": {
    "hash": "def456...",
    "anonymizationLevel": "chain",
    "derivedFrom": "abc123..."
  },
  "provenanceProof": "xyz789..."
}
```

**Privacy Protection**:
- ✅ Both hashes prove same source
- ✅ Chain hash derived from storage hash (verifiable)
- ✅ Complete transformation chain on blockchain

#### Step 3.9: K-Anonymity Enforcement

**Process**:
1. Group records by: Country, Age Range, Gender, Occupation Category
2. Check each group has ≥5 records
3. Suppress groups with <5 records (privacy protection)

**Example**:
```
Group: Uganda, 35-39, Male, Healthcare Worker
Records: 8 ✅ (kept - satisfies k=5)

Group: Uganda, 25-29, Female, Technology Worker  
Records: 3 ❌ (suppressed - violates k=5)
```

**Privacy Protection**:
- ✅ Prevents re-identification from rare demographic combinations
- ✅ Ensures each record is indistinguishable from at least 4 others
- ✅ Maintains data utility while protecting privacy

**Output After Anonymization**:
```csv
Anonymous PID,Age Range,Country,Gender,Occupation Category,Lab Test,Result,Unit
PID-001,35-39,Uganda,Male,Healthcare Worker,Blood Glucose,95,mg/dL
PID-001,35-39,Uganda,Male,Healthcare Worker,Cholesterol,180,mg/dL
PID-002,40-44,Uganda,Female,Education Worker,Blood Glucose,110,mg/dL
```

**What's Stored**:
- Anonymized data: **Local file (temporary, deleted after upload)**
- Patient mapping: **Hospital memory (encrypted, off-chain, NOT on blockchain)**

---

### Phase 4: Cryptographic Hashing (MediPact Adapter)

**Location**: MediPact Adapter

**What Happens**:

#### Step 4.1: Generate Data Hashes
For each anonymized record:
```javascript
dataHash = SHA-256(anonymizedRecord)
// Example: "a1b2c3d4e5f6..." (64 hex characters)
```

For each patient (batch of records):
```javascript
patientDataHash = SHA-256(all records for patient)
// Example: "f6e5d4c3b2a1..." (64 hex characters)
```

#### Step 4.2: Generate Consent Hash
```javascript
consentHash = SHA-256({
  anonymousPatientId: "PID-001",  // NO original patient ID
  consentDate: "2024-01-15T10:30:00Z",
  consentType: "data_sharing",
  timestamp: "2024-01-15T10:30:00Z"
})
// Example: "1a2b3c4d5e6f..." (64 hex characters)
```

**Privacy Protection**:
- ✅ Only **hashes** (not data) stored on blockchain
- ✅ Hashes are **one-way** (cannot reverse to get data)
- ✅ Hashes provide **immutable proof** without exposing data
- ✅ **NO original patient IDs** in consent hashes

**What's Stored**:
- Hashes: **Ready for blockchain storage**
- Original data: **NOT stored on blockchain**

---

### Phase 5: Hedera Blockchain Storage (Immutable Proof)

**Location**: Hedera Consensus Service (HCS) & Smart Contracts

#### Step 5.1: Store Consent Proofs on HCS

**What Happens**:
```javascript
// Submit consent hash to HCS Topic
submitMessage(client, consentTopicId, consentHash)
```

**What's Stored on HCS**:
- ✅ Consent hash: `"1a2b3c4d5e6f..."` (SHA-256 hash)
- ✅ Consensus timestamp: `1234567890.123456789`
- ✅ Transaction ID: `0.0.1234567@1234567890.123456789`
- ❌ **NO original patient ID**
- ❌ **NO patient data**
- ❌ **NO PII**

**Privacy Protection**:
- ✅ Only cryptographic hashes stored (cannot reveal data)
- ✅ Immutable proof of consent (cannot be altered)
- ✅ Verifiable on HashScan (public verification)
- ✅ **NO PII on blockchain**

#### Step 5.2: Store Data Proofs on HCS

**What Happens**:
```javascript
// Submit data hash to HCS Topic
submitMessage(client, dataTopicId, dataHash)
```

**What's Stored on HCS**:
- ✅ Data hash: `"a1b2c3d4e5f6..."` (SHA-256 hash of anonymized record)
- ✅ Consensus timestamp
- ✅ Transaction ID
- ❌ **NO original patient ID**
- ❌ **NO PII**

**Privacy Protection**:
- ✅ Only hashes stored (data not exposed)
- ✅ Immutable proof of data integrity
- ✅ Verifiable without revealing data
- ✅ Provenance tracking (both hashes linked)
- ✅ Transformation proof (chain derived from storage)

#### Step 5.3: Store Consent Record on Smart Contract

**What Happens**:
```javascript
// Record consent on ConsentManager contract
recordConsentOnChain(
  client,
  consentManagerAddress,
  anonymousPatientId,  // "PID-001" - NO original ID
  hcsTopicId,          // "0.0.123456"
  dataHash             // "a1b2c3d4..."
)
```

**What's Stored on Smart Contract**:
```solidity
struct ConsentRecord {
    string anonymousPatientId;  // "PID-001" - NO original patient ID
    string hcsTopicId;          // "0.0.123456"
    string dataHash;            // "a1b2c3d4..."
    uint256 timestamp;          // Block timestamp
    bool isValid;               // true
}
```

**Privacy Protection**:
- ✅ **NO original patient ID** stored on contract
- ✅ Only anonymous ID (PID-XXX) stored
- ✅ Only hashes stored (not data)
- ✅ Immutable on blockchain
- ✅ **NO PII on blockchain**

**What's NOT Stored on Blockchain**:
- ❌ Original patient ID
- ❌ Patient name
- ❌ Patient address
- ❌ Patient phone
- ❌ Date of birth
- ❌ Exact age
- ❌ Any PII

---

### Phase 6: Data Storage & Access Control

**Location**: MediPact Storage System

**What Happens**:
1. Anonymized data stored in secure database
2. Access control enforced:
   - Only authorized researchers can access
   - Authentication required
   - Audit logs maintained

**What's Stored**:
- ✅ Anonymized records (with demographics)
- ✅ Anonymous PIDs (PID-001, PID-002)
- ✅ Medical data
- ❌ **NO original patient IDs**
- ❌ **NO PII**

**Privacy Protection**:
- ✅ Data encrypted at rest
- ✅ Access control (only authorized users)
- ✅ Audit logging (who accessed what, when)
- ✅ **NO PII in storage**

---

### Phase 7: Researcher/Buyer Access

**Location**: MediPact Platform

**What Happens**:
1. Researcher requests data access via query API
2. System automatically checks:
   - Researcher authentication
   - Access permissions
   - **Consent validation** (database-level filtering - only active consents)
   - Consent validity (via database and smart contract)
3. Query results automatically filtered to only include patients with active consent
4. Researcher receives anonymized data (only from consented patients)

**What Researcher Receives**:
```csv
Anonymous PID,Age Range,Country,Gender,Occupation Category,Lab Test,Result,Unit
PID-001,35-39,Uganda,Male,Healthcare Worker,Blood Glucose,95,mg/dL
PID-002,40-44,Uganda,Female,Education Worker,Blood Glucose,110,mg/dL
```

**What Researcher Does NOT Receive**:
- ❌ Original patient IDs
- ❌ Patient names
- ❌ Patient addresses
- ❌ Phone numbers
- ❌ Exact dates of birth
- ❌ Exact ages
- ❌ Any PII

**Privacy Protection**:
- ✅ Only anonymized data shared
- ✅ Demographics generalized (age ranges, country-level, occupation categories)
- ✅ K-anonymity enforced (minimum 5 records per group)
- ✅ **NO way to identify individuals**
- ✅ **NO way to trace back to original patients**

---

## 🔐 Privacy Protection Layers

### Layer 1: PII Removal
- **Removed**: Name, ID, Address, Phone, DOB, Exact Age
- **Result**: No direct identifiers

### Layer 2: Demographic Generalization
- **Age**: Exact age → 5-year ranges (35 → "35-39")
- **Location**: Specific address → Country only ("Kampala, Uganda" → "Uganda")
- **Occupation**: Specific job → Category ("doctor" → "Healthcare Worker")
- **Result**: No quasi-identifiers that can re-identify

### Layer 3: K-Anonymity
- **Enforcement**: Minimum 5 records per demographic combination
- **Suppression**: Rare combinations removed
- **Result**: Each record indistinguishable from at least 4 others

### Layer 4: Anonymous IDs
- **Format**: PID-001, PID-002, PID-003
- **No Link**: Cannot trace back to original patient ID
- **Result**: No way to identify individuals

### Layer 5: Blockchain Privacy
- **HCS Topics**: Only hashes stored (not data)
- **Smart Contracts**: Only anonymous IDs and hashes (no PII)
- **Result**: NO PII on blockchain

### Layer 6: Access Control
- **Authentication**: Only authorized researchers
- **Audit Logs**: Track all access
- **Encryption**: Data encrypted at rest and in transit
- **Result**: Secure data access

---

## 🔍 Verification & Audit Trail

### What Can Be Verified on Blockchain

**On HashScan (Public)**:
1. **Consent Proofs**: Verify consent was recorded
   - Topic: `https://hashscan.io/testnet/topic/0.0.123456`
   - Message: Consent hash (SHA-256)
   - Timestamp: When consent was recorded

2. **Data Proofs**: Verify data integrity
   - Topic: `https://hashscan.io/testnet/topic/0.0.123457`
   - Message: Data hash (SHA-256)
   - Timestamp: When data was recorded

3. **Smart Contract**: Verify consent record
   - Contract: `https://hashscan.io/testnet/contract/0x...`
   - Record: Anonymous ID, HCS Topic ID, Data Hash
   - **NO original patient ID visible**

**What Cannot Be Verified**:
- ❌ Original patient identity (not on blockchain)
- ❌ Patient data content (only hashes)
- ❌ Patient mapping (off-chain, encrypted)

### Audit Trail

**Hospital Side** (Off-Chain, Encrypted):
- Original patient data
- Patient mapping (Original ID → Anonymous ID)
- Consent forms
- Access logs

**Blockchain Side** (Public, Immutable):
- Consent hashes (verifiable proof)
- Data hashes (verifiable proof)
- Anonymous IDs (PID-XXX)
- Timestamps (when recorded)
- **NO PII**

---

## 🛡️ Privacy Guarantees

### What We Guarantee

1. **NO PII on Blockchain**
   - Only anonymous IDs (PID-XXX)
   - Only cryptographic hashes
   - No original patient IDs
   - No names, addresses, phones, DOBs

2. **NO Re-identification Possible**
   - Demographics generalized (age ranges, country-level, occupation categories)
   - K-anonymity enforced (minimum 5 records per group)
   - Anonymous IDs cannot be traced back

3. **Immutable Proof**
   - Consent proofs on HCS (cannot be altered)
   - Data proofs on HCS (cannot be altered)
   - Smart contract records (immutable)

4. **Secure Storage**
   - Original data: Hospital (encrypted, off-chain)
   - Patient mapping: Hospital (encrypted, off-chain)
   - Anonymized data: MediPact (encrypted, access-controlled)

5. **Controlled Access**
   - Only authorized researchers
   - Audit logs maintained
   - Authentication required

### What We Don't Store on Blockchain

- ❌ Original patient IDs
- ❌ Patient names
- ❌ Patient addresses
- ❌ Phone numbers
- ❌ Dates of birth
- ❌ Exact ages
- ❌ Any PII
- ❌ Patient mapping (Original ID → Anonymous ID)

### What We Store on Blockchain

- ✅ Anonymous patient IDs (PID-001, PID-002, etc.)
- ✅ Cryptographic hashes (SHA-256)
  - Storage hashes (H1) - Stage 1 anonymization
  - Chain hashes (H2) - Stage 2 anonymization
  - Provenance proofs - Links both hashes together
- ✅ HCS topic IDs
- ✅ Timestamps
- ✅ Consent validity status
- ✅ Provenance records (both hashes with transformation proof)

---

## 📊 Data Flow Summary

```
┌─────────────────────────────────────────────────────────────┐
│ PHASE 1: Hospital Registration                             │
│ - Patient provides PII + Medical Data                       │
│ - Patient gives consent                                     │
│ - Data stored: Hospital (encrypted, off-chain)             │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 2: Data Export                                        │
│ - Hospital exports EHR data                                │
│ - Secure transfer (encrypted in transit)                    │
│ - Original data remains at hospital                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 3: Double Anonymization                               │
│                                                             │
│ Stage 1: Storage Anonymization                              │
│ - Remove PII (Name, ID, Address, Phone, DOB)               │
│ - Generalize demographics (5-year Age Range, Country,        │
│   Gender, Occupation Category)                               │
│ - Preserve exact dates, region/district                     │
│ - Generate Anonymous IDs (PID-001, PID-002)                │
│ - Generate Storage Hash (H1)                                │
│ - Store in Backend Database                                 │
│                                                             │
│ Stage 2: Chain Anonymization                                │
│ - Further generalize (10-year Age Range)                     │
│ - Round dates (month/year)                                  │
│ - Remove region/district                                    │
│ - Generalize occupation further                             │
│ - Generate Chain Hash (H2)                                  │
│ - Create Provenance Record (H1 + H2 + Proof)                │
│                                                             │
│ - Enforce K-Anonymity (minimum 5 records per group)         │
│ - Patient mapping: Hospital memory (encrypted, off-chain)   │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 4: Provenance Record Creation                         │
│ - Storage Hash (H1)                                         │
│ - Chain Hash (H2)                                           │
│ - Provenance Proof (links H1 → H2)                         │
│ - NO original patient IDs in hashes                        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 5: Blockchain Storage                                 │
│ - Consent hashes → HCS Topic                                │
│ - Provenance records → HCS Topic (H1 + H2 + Proof)         │
│ - Consent records → Smart Contract (anonymous IDs only)    │
│ - NO PII stored on blockchain                               │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 6: Secure Storage                                     │
│ - Anonymized data stored (encrypted)                        │
│ - Access control enforced                                   │
│ - Audit logs maintained                                     │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ PHASE 7: Researcher Access                                  │
│ - Researcher authenticates                                  │
│ - System checks consent (via smart contract)                │
│ - Researcher receives anonymized data                       │
│ - NO PII shared                                             │
│ - NO way to identify individuals                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔑 Key Privacy Features

### 1. Zero PII on Blockchain
- Only anonymous IDs and hashes stored
- No original patient IDs
- No names, addresses, phones, DOBs
- Immutable proof without exposing data

### 2. Demographic Generalization
- Age: Exact → 5-year ranges
- Location: Specific → Country only
- Occupation: Specific → Category
- Prevents re-identification

### 3. K-Anonymity Protection
- Minimum 5 records per demographic group
- Rare combinations suppressed
- Each record indistinguishable from others

### 4. Anonymous IDs
- Format: PID-001, PID-002, PID-003
- No link to original patient ID
- Mapping stored off-chain (encrypted at hospital)

### 5. Cryptographic Proofs
- SHA-256 hashes for data integrity
- Immutable on Hedera HCS
- Verifiable without exposing data

### 6. Access Control
- Authentication required
- Audit logs maintained
- Only authorized researchers

---

## ✅ Privacy Compliance

### HIPAA Compliance
- ✅ PII removed (de-identification)
- ✅ Demographics generalized
- ✅ Access controls
- ✅ Audit trails
- ✅ Encryption

### GDPR Compliance
- ✅ Data minimization (only necessary data)
- ✅ Pseudonymization (anonymous IDs)
- ✅ Consent management (on blockchain)
- ✅ Right to erasure (consent revocation)
- ✅ Data protection by design

---

## 🎯 Summary

**Patient data is protected through**:

1. **PII Removal**: All identifying information removed
2. **Demographic Generalization**: Age ranges, country-level, occupation categories
3. **K-Anonymity**: Minimum 5 records per group
4. **Anonymous IDs**: Cannot trace back to original patients
5. **Blockchain Privacy**: Only hashes and anonymous IDs (NO PII)
6. **Access Control**: Only authorized researchers
7. **Encryption**: Data encrypted at rest and in transit
8. **Audit Trails**: All access logged

**Result**: Researchers receive valuable anonymized data for research while patient privacy is fully protected. **NO PII** is ever stored on the blockchain, and there is **NO way** to identify individuals from the anonymized data.

