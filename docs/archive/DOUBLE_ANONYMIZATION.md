# Double Anonymization with Provenance Tracking

## Overview

MediPact implements **double anonymization** with provenance tracking to provide maximum privacy protection and verifiable data transformation on the Hedera blockchain.

## Why Double Anonymization?

### Defense in Depth
- **Two layers of protection**: If one layer fails, the other protects
- **Different strategies**: Storage optimized for research, chain optimized for privacy
- **Reduced re-identification risk**: Multiple anonymization techniques applied

### Compliance & Regulatory
- **GDPR**: Meets requirements for data minimization
- **HIPAA**: Exceeds Safe Harbor de-identification standards
- **Regulatory**: Demonstrates layered privacy protection

### Chain-Specific Protection
- **Immutable storage**: Blockchain data cannot be deleted
- **Public verification**: Anyone can verify on HashScan
- **Maximum privacy**: Extra generalization before hashing

### Provenance Tracking
- **Origin proof**: Both hashes prove same source
- **Transformation proof**: Chain hash derived from storage hash
- **Verifiable chain**: Complete audit trail on Hedera

## Two-Stage Process

### Stage 1: Storage Anonymization

**Purpose**: Optimized for research queries while protecting privacy

**Anonymization Level**:
- ✅ Remove direct PII (name, ID, address, phone, exact DOB)
- ✅ Replace with anonymous PID (PID-001, PID-002, etc.)
- ✅ Preserve 5-year age ranges (e.g., "35-39")
- ✅ Preserve country, region, district
- ✅ Preserve exact dates (YYYY-MM-DD)
- ✅ Preserve gender, occupation category
- ✅ Preserve all medical data

**Used For**: Backend database storage (for researcher queries)

**Example**:
```json
{
  "anonymousPatientId": "PID-001",
  "ageRange": "35-39",
  "country": "Uganda",
  "region": "Central",
  "gender": "Male",
  "occupationCategory": "Healthcare Worker",
  "effectiveDate": "2024-03-15",
  "observationCodeLoinc": "4548-4",
  "valueQuantity": "8.1"
}
```

### Stage 2: Chain Anonymization

**Purpose**: Maximum privacy for immutable blockchain storage

**Additional Generalizations**:
- ✅ Age ranges: 5-year → 10-year (e.g., "35-39" → "30-39")
- ✅ Dates: Exact → Month/Year (e.g., "2024-03-15" → "2024-03")
- ✅ Location: Remove region/district (keep only country)
- ✅ Occupation: Further generalize (e.g., "Healthcare Worker" → "Healthcare")
- ✅ Suppress rare values that could identify individuals

**Used For**: Hedera HCS (immutable blockchain storage)

**Example**:
```json
{
  "anonymousPatientId": "PID-001",
  "ageRange": "30-39",           // 10-year range (more generalized)
  "country": "Uganda",            // Region/district removed
  "gender": "Male",
  "occupationCategory": "Healthcare",  // More generalized
  "effectiveDate": "2024-03",     // Month only (day removed)
  "observationCodeLoinc": "4548-4",
  "valueQuantity": "8.1"
}
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Healthcare System (Raw Data)                                │
│ - Contains PII (name, ID, address, phone, DOB)             │
│ - Contains medical data                                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage 1: Storage Anonymization                              │
│ - Remove PII                                                │
│ - Preserve 5-year age ranges                               │
│ - Preserve exact dates                                      │
│ - Preserve region/district                                  │
│ - Generate Storage Hash (H1)                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ├──► Backend Database Storage
                     │    (For researcher queries)
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Stage 2: Chain Anonymization                                │
│ - Further generalize age (10-year ranges)                  │
│ - Round dates (month/year)                                  │
│ - Remove region/district                                    │
│ - Generalize occupation further                             │
│ - Generate Chain Hash (H2)                                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Provenance Record Creation                                  │
│ {                                                           │
│   "storage": { "hash": "H1", ... },                         │
│   "chain": { "hash": "H2", "derivedFrom": "H1", ... },     │
│   "provenanceProof": "xyz789..."                            │
│ }                                                           │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Hedera HCS (Immutable Blockchain)                           │
│ - Provenance records stored permanently                     │
│ - Verifiable on HashScan                                    │
│ - Cannot be altered or deleted                              │
└─────────────────────────────────────────────────────────────┘
```

## Provenance Record Structure

Each resource stored on Hedera includes both hashes with a provenance proof:

```json
{
  "storage": {
    "hash": "abc123def456...",
    "anonymizationLevel": "storage",
    "timestamp": "2024-03-15T10:30:00Z"
  },
  "chain": {
    "hash": "def456ghi789...",
    "anonymizationLevel": "chain",
    "derivedFrom": "abc123def456...",
    "timestamp": "2024-03-15T10:30:00Z"
  },
  "anonymousPatientId": "PID-001",
  "resourceType": "Patient",
  "hospitalId": "HOSP-XXX",
  "timestamp": "2024-03-15T10:30:00Z",
  "provenanceProof": "xyz789abc123..."
}
```

### Key Fields

- **storage.hash**: Hash of Stage 1 anonymized data
- **chain.hash**: Hash of Stage 2 anonymized data
- **chain.derivedFrom**: Proves chain hash came from storage hash
- **provenanceProof**: Cryptographic proof linking both hashes

## Verification Process

Anyone can verify the provenance chain on Hedera:

### 1. Origin Verification
```javascript
// Verify both hashes exist
assert(provenanceRecord.storage.hash === expectedStorageHash);
assert(provenanceRecord.chain.hash === expectedChainHash);
```

### 2. Transformation Verification
```javascript
// Verify chain was derived from storage
assert(provenanceRecord.chain.derivedFrom === provenanceRecord.storage.hash);
```

### 3. Provenance Proof Verification
```javascript
// Verify provenance proof
const expectedProof = generateProvenanceProof(
  provenanceRecord.storage.hash,
  provenanceRecord.chain.hash,
  provenanceRecord.anonymousPatientId,
  provenanceRecord.resourceType
);
assert(provenanceRecord.provenanceProof === expectedProof);
```

## Comparison Table

| Feature | Stage 1 (Storage) | Stage 2 (Chain) |
|---------|------------------|-----------------|
| **Age Range** | 5-year (e.g., "35-39") | 10-year (e.g., "30-39") |
| **Dates** | Exact (YYYY-MM-DD) | Month/Year (YYYY-MM) |
| **Location** | Country + Region + District | Country only |
| **Occupation** | Specific category | Broad category |
| **Purpose** | Research queries | Blockchain storage |
| **Privacy Level** | High | Maximum |
| **Data Utility** | High (preserves detail) | Medium (generalized) |

## Benefits

### Privacy Protection
- ✅ **Double Protection**: Two layers of anonymization
- ✅ **Defense in Depth**: If one fails, the other protects
- ✅ **Maximum Privacy**: Chain data has extra generalization
- ✅ **K-Anonymity**: Enforced at both stages

### Compliance
- ✅ **GDPR Compliant**: Data minimization principles
- ✅ **HIPAA Compliant**: Exceeds Safe Harbor standards
- ✅ **Regulatory Ready**: Meets strict requirements

### Provenance & Audit
- ✅ **Origin Proof**: Both hashes prove same source
- ✅ **Transformation Proof**: Chain hash derived from storage hash
- ✅ **Immutable Audit Trail**: On Hedera, cannot be altered
- ✅ **Public Verification**: Anyone can verify on HashScan

### Research Value
- ✅ **Storage Data**: Optimized for research queries
- ✅ **Medical Data Preserved**: All clinical information intact
- ✅ **Demographics Available**: For cohort building
- ✅ **Chain Data**: Additional privacy layer for blockchain

## Implementation

### Universal Adapter (FHIR)
- Applies both anonymization stages automatically
- Creates provenance records
- Submits to Hedera HCS

### Legacy CSV Adapter
- Applies both anonymization stages automatically
- Creates provenance records
- Submits to Hedera HCS

### Hash Generation
- Storage Hash (H1): SHA-256 of Stage 1 anonymized data
- Chain Hash (H2): SHA-256 of Stage 2 anonymized data
- Provenance Proof: SHA-256 linking both hashes

## HashScan Verification

Each provenance record is stored on Hedera and can be verified on HashScan:

1. Visit HashScan link from adapter output
2. View provenance record JSON
3. Verify:
   - Both hashes (storage + chain)
   - `derivedFrom` link
   - Provenance proof

## Key Takeaways

- **Two Stages**: Storage (research-optimized) + Chain (privacy-optimized)
- **Provenance Tracking**: Both hashes linked together on Hedera
- **Verifiable**: Anyone can verify origin and transformation
- **Compliant**: Meets strict regulatory requirements
- **Maximum Privacy**: Extra generalization for immutable blockchain storage

## Related Documentation

- [Anonymization Tutorial](../archive/tutorial/13-anonymization.md) - Detailed anonymization process
- [Data Flow Tutorial](../archive/tutorial/11-data-flow.md) - Complete data journey
- [Patient Data Protection Flow](../archive/PATIENT_DATA_PROTECTION_FLOW.md) - Privacy protection details

