# Lesson 20: FHIR API Integration

## Connecting to Real EHR Systems

This lesson explains how to integrate MediPact with real Electronic Health Record (EHR) systems using FHIR APIs. This is a future enhancement for production deployment.

## Current vs Future

### Current Implementation

**File-Based**:
- Reads FHIR Bundle from file
- Processes locally
- Good for demos and testing

**Limitations**:
- Manual file creation
- Not real-time
- No direct EHR connection

### Future Implementation

**API-Based**:
- Connects to FHIR server
- Real-time data sync
- Direct EHR integration

**Benefits**:
- Automated data flow
- Real-time processing
- Production-ready

## FHIR API Basics

### RESTful API

**FHIR uses REST** (Representational State Transfer):
- Standard HTTP methods
- JSON/XML responses
- Stateless requests
- Resource-based URLs

### Base URL

**Format**: `https://fhir.example.com/fhir`

**Examples**:
- Epic: `https://fhir.epic.com/interconnect-fhir-oauth/api/FHIR/R4`
- Cerner: `https://fhir.cerner.com/r4/{tenant-id}`
- Custom: `https://your-ehr.com/fhir`

### Authentication

**OAuth 2.0**:
- Client credentials flow
- Access tokens
- Token refresh
- Secure access

## FHIR Client Implementation

### Current Client

**File-Based** (already implemented):
```javascript
import { createFHIRClientFromFile } from './fhir/index.js';

const client = createFHIRClientFromFile('./data/raw_data.fhir.json');
const bundle = await client.fetchBundle();
```

### Future API Client

**API-Based** (to be implemented):
```javascript
import { createFHIRClientFromAPI } from './fhir/index.js';

const client = createFHIRClientFromAPI(
  'https://fhir.example.com/fhir',
  'oauth-token-here'
);

const patient = await client.getPatient('patient-123');
const observations = await client.getObservations('patient-123');
```

## API Endpoints

### Patient Endpoint

**Get Patient**:
```
GET /Patient/{id}
```

**Response**:
```json
{
  "resourceType": "Patient",
  "id": "patient-123",
  "name": [{"text": "John Doe"}],
  ...
}
```

### Observation Endpoint

**Get Observations**:
```
GET /Observation?patient={patientId}
```

**Response**:
```json
{
  "resourceType": "Bundle",
  "entry": [
    {
      "resource": {
        "resourceType": "Observation",
        ...
      }
    }
  ]
}
```

### Search Endpoints

**Search Patients**:
```
GET /Patient?name=John
```

**Search Observations**:
```
GET /Observation?code=2339-0&date=ge2024-01-01
```

## OAuth Authentication

### Client Credentials Flow

**Step 1**: Get Access Token
```
POST /oauth/token
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials
&client_id=your-client-id
&client_secret=your-client-secret
```

**Step 2**: Use Token
```
GET /Patient/{id}
Authorization: Bearer {access_token}
```

### Token Management

**Store Token**:
- In memory (session)
- Encrypted file
- Environment variable

**Refresh Token**:
- Before expiration
- Automatic refresh
- Handle errors

## Implementation Steps

### Step 1: Configure FHIR Server

**Environment Variables**:
```env
FHIR_BASE_URL="https://fhir.example.com/fhir"
FHIR_CLIENT_ID="your-client-id"
FHIR_CLIENT_SECRET="your-client-secret"
FHIR_TOKEN_URL="https://fhir.example.com/oauth/token"
```

### Step 2: Implement OAuth

**Get Access Token**:
```javascript
async function getAccessToken() {
  const response = await fetch(FHIR_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.FHIR_CLIENT_ID,
      client_secret: process.env.FHIR_CLIENT_SECRET
    })
  });
  
  const data = await response.json();
  return data.access_token;
}
```

### Step 3: Fetch Resources

**Get Patient**:
```javascript
async function getPatient(patientId, accessToken) {
  const response = await fetch(
    `${FHIR_BASE_URL}/Patient/${patientId}`,
    {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/fhir+json'
      }
    }
  );
  
  return await response.json();
}
```

### Step 4: Process Data

**Fetch and Process**:
```javascript
// Get access token
const token = await getAccessToken();

// Fetch patient
const patient = await getPatient('patient-123', token);

// Fetch observations
const observations = await getObservations('patient-123', token);

// Process with MediPact
const bundle = createBundle([patient, ...observations]);
const records = bundleToRecords(bundle);
const anonymized = anonymizeRecordsWithFHIR(records, bundle);
```

## Error Handling

### Common Errors

**401 Unauthorized**:
- Token expired
- Invalid credentials
- Refresh token

**404 Not Found**:
- Resource doesn't exist
- Wrong ID
- Check URL

**429 Too Many Requests**:
- Rate limiting
- Wait and retry
- Implement backoff

### Retry Logic

```javascript
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response;
      
      if (response.status === 401) {
        // Refresh token and retry
        const newToken = await getAccessToken();
        options.headers.Authorization = `Bearer ${newToken}`;
        continue;
      }
      
      throw new Error(`HTTP ${response.status}`);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * (i + 1)); // Exponential backoff
    }
  }
}
```

## Security Considerations

### Token Storage

**Do**:
- Store in memory (session)
- Encrypt if persisted
- Use environment variables
- Rotate regularly

**Don't**:
- Commit to Git
- Log tokens
- Share publicly
- Store in plain text

### API Security

**HTTPS Only**:
- Always use HTTPS
- Verify certificates
- Check SSL/TLS

**Rate Limiting**:
- Respect limits
- Implement backoff
- Monitor usage

## Testing FHIR API

### Mock Server

**Use HAPI FHIR**:
- Local FHIR server
- Test endpoints
- Mock data
- Development testing

### Test Data

**Create Test Bundle**:
- Sample patients
- Sample observations
- Realistic data
- Various scenarios

## Integration with Adapter

### Update Adapter

**Detect API Mode**:
```javascript
if (process.env.FHIR_BASE_URL) {
  // API mode
  const client = createFHIRClientFromAPI(
    process.env.FHIR_BASE_URL,
    await getAccessToken()
  );
  const bundle = await client.fetchBundle();
} else if (process.env.INPUT_FILE) {
  // File mode
  const client = createFHIRClientFromFile(process.env.INPUT_FILE);
  const bundle = await client.fetchBundle();
}
```

### Scheduled Processing

**Cron Job**:
```javascript
// Run every hour
setInterval(async () => {
  const token = await getAccessToken();
  const patients = await getRecentPatients(token);
  
  for (const patient of patients) {
    const observations = await getObservations(patient.id, token);
    await processWithMediPact(patient, observations);
  }
}, 3600000); // 1 hour
```

## Production Considerations

### Scalability

**Batch Processing**:
- Process in batches
- Queue system
- Parallel processing

**Caching**:
- Cache tokens
- Cache resources
- Reduce API calls

### Monitoring

**Logging**:
- API calls
- Errors
- Performance

**Metrics**:
- Request count
- Error rate
- Response time

## Key Takeaways

- **FHIR API**: RESTful interface to EHR systems
- **OAuth**: Secure authentication
- **Real-Time**: Direct data sync
- **Production**: Ready for real deployment
- **Future**: Planned enhancement

## Next Steps

This is a future enhancement. For now:

- Use file-based FHIR (current)
- Plan API integration (future)
- Test with mock servers
- Prepare for production

---

**FHIR API Summary:**
- RESTful API for EHR integration
- OAuth 2.0 authentication
- Real-time data sync
- Production-ready approach
- Future enhancement for MediPact

