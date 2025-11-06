# Lesson 21: Customization Guide

## Adapting MediPact for Your Needs

This lesson explains how to customize MediPact for different use cases, configurations, and requirements.

## Customization Areas

### 1. Revenue Split

### Current Split

**Default**: 60% Patient, 25% Hospital, 15% Platform

**Location**: `contracts/contracts/RevenueSplitter.sol`

### Change Split Percentages

**Edit Contract**:
```solidity
// In RevenueSplitter.sol
uint256 public constant PATIENT_SHARE = 7000;      // 70%
uint256 public constant HOSPITAL_SHARE = 2000;    // 20%
uint256 public constant MEDIPACT_SHARE = 1000;     // 10%
```

**Important**: Must sum to 10000 (100%)

**Redeploy Contract**:
```bash
cd contracts
npm run deploy:testnet
```

**Update Adapter**:
```javascript
// In adapter/src/index.js
const split = calculateRevenueSplit(totalHbar, {
  patient: 70,    // Updated
  hospital: 20,   // Updated
  medipact: 10    // Updated
});
```

### 2. Anonymization Rules

### Current PII Removal

**Removed Fields**:
- Patient Name
- Patient ID
- Address
- Phone Number
- Date of Birth

**Location**: `adapter/src/anonymizer/anonymize.js`

### Add Custom Fields to Remove

**Edit Anonymization**:
```javascript
// In anonymize.js
function anonymizeRecord(record, anonymousPID) {
  const anonymized = { ...record };
  
  // Standard removals
  delete anonymized['Patient Name'];
  delete anonymized['Patient ID'];
  // ... existing removals
  
  // Custom removals
  delete anonymized['Email'];
  delete anonymized['SSN'];
  delete anonymized['Insurance ID'];
  
  // Add anonymous ID
  anonymized['Anonymous PID'] = anonymousPID;
  
  return anonymized;
}
```

### 3. Anonymous ID Format

### Current Format

**Format**: `PID-001`, `PID-002`, etc.

**Location**: `adapter/src/anonymizer/anonymize.js`

### Change Format

**Custom Format**:
```javascript
function generateAnonymousPID(index) {
  // Option 1: UUID-based
  return `ANON-${crypto.randomUUID()}`;
  
  // Option 2: Timestamp-based
  return `PAT-${Date.now()}-${index}`;
  
  // Option 3: Hash-based
  return `HASH-${hashFunction(index)}`;
  
  // Option 4: Custom prefix
  return `HOSPITAL-${String(index + 1).padStart(6, '0')}`;
}
```

### 4. Currency Configuration

### Current Currency

**Base**: USD

**Local**: Configurable (UGX, KES, etc.)

**Location**: `adapter/src/utils/currency.js`

### Add New Currency

**Update Formatting**:
```javascript
function getDefaultDecimals(currency) {
  const zeroDecimalCurrencies = [
    'UGX', 'KES', 'TZS', 'RWF', 
    'JPY', 'KRW', 'VND',
    'YOUR_CURRENCY'  // Add here
  ];
  
  if (zeroDecimalCurrencies.includes(currency)) {
    return 0;
  }
  
  return 2;
}
```

### 5. Input Data Format

### Current Formats

**Supported**: CSV, FHIR Bundle

**Location**: `adapter/src/index.js`

### Add New Format

**Example: JSON Format**:
```javascript
// Add parser
async function parseJSON(filePath) {
  const content = await fs.promises.readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

// Update main function
if (await isFHIRBundle(INPUT_FILE)) {
  // FHIR
} else if (INPUT_FILE.endsWith('.json')) {
  // JSON
  rawRecords = await parseJSON(INPUT_FILE);
} else {
  // CSV
  rawRecords = await parseCSV(INPUT_FILE);
}
```

### 6. Output Format

### Current Outputs

**Formats**: CSV, FHIR Bundle

**Location**: `adapter/src/index.js`

### Add New Output

**Example: JSON Output**:
```javascript
// Add writer
async function writeJSON(records, outputPath) {
  const content = JSON.stringify(records, null, 2);
  await fs.promises.writeFile(outputPath, content, 'utf-8');
}

// Update output
await writeAnonymizedCSV(anonymizedRecords, OUTPUT_FILE);
await writeJSON(anonymizedRecords, OUTPUT_JSON_FILE);
```

### 7. Hashing Algorithm

### Current Algorithm

**Algorithm**: SHA-256

**Location**: `adapter/src/utils/hash.js`

### Change Algorithm

**Example: SHA-512**:
```javascript
export function generateHash(data) {
  let dataString;
  
  if (typeof data === 'object') {
    dataString = JSON.stringify(data);
  } else {
    dataString = String(data);
  }

  return crypto.createHash('sha512')  // Changed from sha256
    .update(dataString, 'utf8')
    .digest('hex');
}
```

**Note**: Changing hash algorithm affects verification!

### 8. Processing Frequency

### Current: One-Time

**Runs**: Manually via `npm start`

### Add Scheduling

**Example: Cron Job**:
```javascript
// Install: npm install node-cron
import cron from 'node-cron';

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Running scheduled processing...');
  await main();
});
```

### 9. Notification System

### Add Email Notifications

**Example**:
```javascript
// Install: npm install nodemailer
import nodemailer from 'nodemailer';

async function sendNotification(results) {
  const transporter = nodemailer.createTransport({
    // Email config
  });
  
  await transporter.sendMail({
    to: 'admin@example.com',
    subject: 'MediPact Processing Complete',
    text: `Processed ${results.records} records`
  });
}
```

### 10. Database Integration

### Add Database Storage

**Example: MongoDB**:
```javascript
// Install: npm install mongodb
import { MongoClient } from 'mongodb';

async function storeResults(results) {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  
  const db = client.db('medipact');
  await db.collection('processing').insertOne({
    timestamp: new Date(),
    records: results.records,
    patients: results.patients
  });
  
  await client.close();
}
```

## Configuration Files

### Environment Variables

**Adapter `.env`**:
```env
# Standard
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"

# Custom
CUSTOM_SPLIT_PATIENT=70
CUSTOM_SPLIT_HOSPITAL=20
CUSTOM_SPLIT_MEDIPACT=10
NOTIFICATION_EMAIL="admin@example.com"
```

### Configuration File

**Create `config.json`**:
```json
{
  "revenueSplit": {
    "patient": 70,
    "hospital": 20,
    "medipact": 10
  },
  "anonymization": {
    "removeFields": ["Email", "SSN"],
    "preserveFields": ["Lab Test", "Result"]
  },
  "output": {
    "formats": ["csv", "json", "fhir"],
    "includeHashScanLinks": true
  }
}
```

## Best Practices

### Before Customizing

- ✅ Understand current implementation
- ✅ Test changes thoroughly
- ✅ Document modifications
- ✅ Keep backups

### During Customization

- ✅ Make incremental changes
- ✅ Test after each change
- ✅ Use version control
- ✅ Follow coding standards

### After Customization

- ✅ Test end-to-end
- ✅ Update documentation
- ✅ Verify on testnet
- ✅ Monitor performance

## Testing Customizations

### Unit Tests

**Test Custom Functions**:
```javascript
// In tests/
describe('Custom Anonymization', () => {
  it('should remove custom fields', () => {
    const result = anonymizeRecord(record, 'PID-001');
    expect(result.Email).toBeUndefined();
    expect(result.SSN).toBeUndefined();
  });
});
```

### Integration Tests

**Test Full Flow**:
```javascript
describe('Custom Revenue Split', () => {
  it('should split 70/20/10', async () => {
    const split = calculateRevenueSplit(1.0, {
      patient: 70,
      hospital: 20,
      medipact: 10
    });
    
    expect(split.patient).toBe(0.7);
    expect(split.hospital).toBe(0.2);
    expect(split.medipact).toBe(0.1);
  });
});
```

## Common Customizations

### Hospital-Specific

**Custom Fields**:
- Hospital ID
- Department
- Doctor ID
- Room number

**Custom Processing**:
- Department-based routing
- Doctor notifications
- Custom reports

### Country-Specific

**Local Currency**:
- Add currency codes
- Update exchange rates
- Format for locale

**Regulations**:
- GDPR compliance (EU)
- HIPAA compliance (US)
- Local privacy laws

### Research-Specific

**Data Filtering**:
- Specific conditions
- Age ranges
- Date ranges
- Test types

**Output Format**:
- Research-friendly format
- Statistical packages
- Analysis tools

## Key Takeaways

- **Flexible**: Many areas customizable
- **Modular**: Change one part at a time
- **Tested**: Always test changes
- **Documented**: Keep notes
- **Versioned**: Use Git

## Next Steps

After customizing:

- Test thoroughly
- Update documentation
- Deploy to testnet
- Monitor performance

---

**Customization Summary:**
- Revenue split adjustable
- Anonymization rules customizable
- Multiple output formats
- Configurable processing
- Extensible architecture

