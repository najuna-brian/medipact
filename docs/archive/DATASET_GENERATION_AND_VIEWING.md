# Dataset Generation and Researcher Viewing Guide

## How Researchers See Datasets

### 1. **Browse Available Datasets**
Researchers can view all available datasets through:

**Frontend Interface:**
- **URL:** `/researcher/catalog` (Researcher Catalog Page)
- Shows dataset cards with:
  - Dataset name and description
  - Record count
  - Price (in HBAR and USD)
  - Country
  - Date range
  - Condition codes (if applicable)
  - Status (active/draft/archived)

**API Endpoint:**
```bash
GET /api/marketplace/datasets
GET /api/marketplace/datasets?country=Kenya  # Filter by country
```

**Response includes:**
- List of all active datasets
- Dataset metadata (name, description, pricing, record count)
- Filtering by country or hospital ID

### 2. **View Dataset Details**
Researchers can get detailed information about a specific dataset:

**API Endpoint:**
```bash
GET /api/marketplace/datasets/{datasetId}
GET /api/marketplace/datasets/{datasetId}?includePreview=true  # Include sample data
```

**What researchers see:**
- Full dataset metadata
- Record count
- Pricing information (HBAR and USD)
- Date ranges
- Condition codes
- Optional preview data (limited to 10 records for security)

### 3. **Query Data (Before Purchase)**
Researchers can query available data to see what's available:

**API Endpoint:**
```bash
POST /api/marketplace/query
```

**Query filters:**
- Country
- Date range (startDate, endDate)
- Condition codes
- Observation codes
- Age range, gender
- Hospital ID

**Response:**
- Count of matching records
- Preview data (limited)
- Pricing estimate

### 4. **Purchase Dataset**
After reviewing, researchers can purchase datasets:

**API Endpoint:**
```bash
POST /api/marketplace/purchase
```

**After purchase:**
- Researchers can export the full dataset
- Available formats: FHIR, CSV, JSON
- Revenue is automatically distributed (60% Patient, 25% Hospital, 15% Platform)

---

## How Datasets Are Generated

### **Important: Datasets are NOT automatically generated**

Datasets must be **manually created** by hospitals through the adapter API. Here's the process:

### Step 1: Hospital Submits FHIR Data
Hospitals use the adapter to submit anonymized FHIR patient data:

**API Endpoint:**
```bash
POST /api/adapter/submit-fhir-resources
```

**What gets submitted:**
- FHIR Patient records (demographics)
- FHIR Conditions (diagnoses)
- FHIR Observations (lab results)
- Other FHIR resources (medications, procedures, encounters, etc.)

**Authentication:**
- Requires `X-Hospital-ID` header
- Requires `X-API-Key` header
- Hospital must be verified

### Step 2: Hospital Creates Dataset (Manual Step)
After submitting FHIR data, hospitals **manually create** a dataset:

**API Endpoint:**
```bash
POST /api/adapter/create-dataset
```

**Required fields:**
- `name` - Dataset name
- `description` - Dataset description
- `hospitalId` - Hospital ID
- `country` - Country
- `price` - Initial price estimate (will be recalculated)
- `consentType` - Consent type (e.g., "hospital_verified")
- `filters` - Filters to apply (e.g., `{country: "Kenya"}`)

**What happens when creating a dataset:**

1. **Counts matching records:**
   - Queries `fhir_patients` table based on filters
   - Counts how many patients match the criteria
   - This becomes the `recordCount`

2. **Calculates pricing automatically:**
   - Determines pricing category based on data type:
     - Basic Demographics: $0.032 per record
     - Condition Data: $0.12 per record
     - Lab Results: $0.24 per record
     - Combined Dataset: $1.00 per record
     - Longitudinal Data: $2.00 per record
   - Applies volume discounts for large datasets
   - Converts to HBAR using current exchange rate

3. **Creates dataset record:**
   - Stores in `datasets` table
   - Sets status to 'active'
   - Links to hospital
   - Stores pricing information

4. **Logs to Hedera HCS (optional):**
   - Creates immutable record on Hedera Consensus Service
   - Stores dataset metadata hash

### Step 3: Dataset Appears in Marketplace
Once created, the dataset:
- Appears in `/api/marketplace/datasets` endpoint
- Shows up in researcher catalog
- Can be browsed, queried, and purchased

---

## Dataset Creation Workflow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Hospital Submits FHIR Data                                │
│    POST /api/adapter/submit-fhir-resources                  │
│    → Stores in fhir_patients, fhir_conditions, etc.        │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. Hospital Creates Dataset (MANUAL)                        │
│    POST /api/adapter/create-dataset                         │
│    → Counts matching FHIR patients                          │
│    → Calculates pricing automatically                       │
│    → Creates dataset record                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. Dataset Appears in Marketplace                           │
│    GET /api/marketplace/datasets                            │
│    → Researchers can browse                                  │
│    → Researchers can query                                   │
│    → Researchers can purchase                                │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Points

### ✅ What IS Automatic:
- **Pricing calculation** - Automatically calculated based on record count and category
- **Record counting** - Automatically counts matching FHIR patients
- **Pricing category detection** - Automatically determines category based on data types
- **Volume discounts** - Automatically applied for large datasets
- **Exchange rate conversion** - Automatically converts HBAR to USD

### ❌ What is NOT Automatic:
- **Dataset creation** - Hospitals must manually call `/api/adapter/create-dataset`
- **FHIR data submission** - Hospitals must manually submit data via adapter
- **Dataset updates** - If new FHIR data is added, dataset record count doesn't update automatically

### 🔄 To Update Dataset Record Count:
If a hospital adds more FHIR data after creating a dataset:
1. The dataset's `recordCount` stays the same (it was calculated at creation time)
2. To update it, the hospital would need to:
   - Create a new dataset with the same filters, OR
   - Manually update the dataset record (via admin API)

---

## Example: Creating a Dataset

```bash
# 1. Hospital submits FHIR data first
curl -X POST https://api.medipact.com/api/adapter/submit-fhir-resources \
  -H "X-Hospital-ID: HOSP-123" \
  -H "X-API-Key: hospital-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "hospitalId": "HOSP-123",
    "patients": [
      {
        "anonymousPatientId": "PAT-001",
        "upi": "UPI-001",
        "country": "Kenya",
        "ageRange": "35-39",
        "gender": "Male",
        "conditions": [...],
        "observations": [...]
      }
    ]
  }'

# 2. Hospital creates dataset (MANUAL STEP)
curl -X POST https://api.medipact.com/api/adapter/create-dataset \
  -H "X-Hospital-ID: HOSP-123" \
  -H "X-API-Key: hospital-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Diabetes Research Dataset",
    "description": "Comprehensive Kenya healthcare data for diabetes research",
    "hospitalId": "HOSP-123",
    "country": "Kenya",
    "price": 100,
    "currency": "HBAR",
    "consentType": "hospital_verified",
    "filters": {
      "country": "Kenya"
    }
  }'

# Response:
# {
#   "success": true,
#   "dataset": {
#     "id": "DS-ABC123",
#     "name": "Diabetes Research Dataset",
#     "recordCount": 150,  # Automatically counted
#     "price": 18,          # Automatically calculated (150 * $0.12)
#     "priceUSD": 2.88,     # Automatically converted
#     "pricingCategory": "Condition Data",
#     "status": "active"
#   }
# }
```

---

## Current Status (Updated for MVP)

Based on the hosted environment:
- ✅ **15 datasets exist** across 3 countries (Kenya, Uganda, Tanzania)
- ✅ **4 datasets have data** (1,200 total records from Tanzania)
- ✅ **11 datasets are placeholders** (ready for when FHIR data is submitted)
- ✅ **Dataset creation is working** (tested successfully)
- ✅ **Researchers can browse** all datasets via `/api/marketplace/datasets`
- ✅ **Pricing is automatically calculated** when datasets are created
- ✅ **Multiple dataset types** available (Diabetes, Hypertension, Cardiovascular, Chronic Disease)
- ✅ **Total dataset value: $32.40 USD** (for datasets with data)

### Dataset Breakdown:
- **Tanzania**: 4 datasets with 400 records each (1,600 total records)
- **Kenya**: 6 datasets (ready for data)
- **Uganda**: 5 datasets (ready for data)

---

## Recommendations

1. **For Hospitals:**
   - Submit FHIR data first via `/api/adapter/submit-fhir-resources`
   - Then create datasets via `/api/adapter/create-dataset`
   - Use filters to create specific datasets (e.g., by condition, date range)

2. **For Researchers:**
   - Browse available datasets at `/researcher/catalog`
   - Use query endpoint to explore data before purchasing
   - Preview datasets to see sample data
   - Purchase datasets to get full access

3. **For System Administrators:**
   - Monitor dataset creation
   - Ensure hospitals are submitting FHIR data before creating datasets
   - Consider adding automatic dataset creation triggers (future enhancement)

