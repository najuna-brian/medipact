# Demo Credentials for MediPact MVP

> **Note**: This file is auto-generated after running `npm run populate-demo`.  
> **Security**: Keep these credentials private. Do not commit real credentials to git.

## 🚀 Quick Start

These credentials were generated on: **2025-11-18T15:04:51.054Z**  
API URL: **http://localhost:8080**

---

## 📊 Summary

- **Hospitals**: 3
- **Researchers**: 2
- **Patients**: 150
- **Datasets**: 1
- **FHIR Records**: 50

---

## 🏥 Hospital Credentials

### Hospital 1: Byumba General Hospital

**Login Information:**
- **Hospital ID**: `HOSP-679F06F58E2E`
- **API Key**: `230c60d30b71e40e9c978e249b6af65d6a8ba86c05f00f69dacd5aae882f3914`
- **Email**: `hospital1-1763478291247@demo.medipact.com`
- **Country**: Rwanda
- **Location**: Byumba, Rwanda

**Hedera Account:**
- **Account ID**: `0.0.7280036`

**How to Login:**
1. Go to `/hospital/login`
2. Enter Hospital ID: `HOSP-679F06F58E2E`
3. Enter API Key: `230c60d30b71e40e9c978e249b6af65d6a8ba86c05f00f69dacd5aae882f3914`

**API Usage:**
```bash
curl -H "X-Hospital-ID: HOSP-679F06F58E2E" \
     -H "X-API-Key: 230c60d30b71e40e9c978e249b6af65d6a8ba86c05f00f69dacd5aae882f3914" \
     http://localhost:8080/api/hospital/HOSP-679F06F58E2E
```

---

### Hospital 2: Kampala Medical Center

**Login Information:**
- **Hospital ID**: `HOSP-D2ED243F02A1`
- **API Key**: `b309a2fdd262290cda93d231c6fc619565879e431505b0897449fc6f3eb02c56`
- **Email**: `hospital2-1763478296617@demo.medipact.com`
- **Country**: Uganda
- **Location**: Kampala, Uganda

**Hedera Account:**
- **Account ID**: `0.0.7280038`

**How to Login:**
1. Go to `/hospital/login`
2. Enter Hospital ID: `HOSP-D2ED243F02A1`
3. Enter API Key: `b309a2fdd262290cda93d231c6fc619565879e431505b0897449fc6f3eb02c56`

**API Usage:**
```bash
curl -H "X-Hospital-ID: HOSP-D2ED243F02A1" \
     -H "X-API-Key: b309a2fdd262290cda93d231c6fc619565879e431505b0897449fc6f3eb02c56" \
     http://localhost:8080/api/hospital/HOSP-D2ED243F02A1
```

---

### Hospital 3: Mbale Regional Hospital

**Login Information:**
- **Hospital ID**: `HOSP-6BE36AD7543D`
- **API Key**: `6dd685f74b528e80e3aa2ed2065d0bb08b8473247fd55f028cc0fd59f51344fa`
- **Email**: `hospital3-1763478301538@demo.medipact.com`
- **Country**: Uganda
- **Location**: Mbale, Uganda

**Hedera Account:**
- **Account ID**: `0.0.7280039`

**How to Login:**
1. Go to `/hospital/login`
2. Enter Hospital ID: `HOSP-6BE36AD7543D`
3. Enter API Key: `6dd685f74b528e80e3aa2ed2065d0bb08b8473247fd55f028cc0fd59f51344fa`

**API Usage:**
```bash
curl -H "X-Hospital-ID: HOSP-6BE36AD7543D" \
     -H "X-API-Key: 6dd685f74b528e80e3aa2ed2065d0bb08b8473247fd55f028cc0fd59f51344fa" \
     http://localhost:8080/api/hospital/HOSP-6BE36AD7543D
```

---

## 🔬 Researcher Credentials

### Researcher 1: Global Health Research Institute

**Login Information:**
- **Researcher ID**: `RES-D4CAECABB332`
- **Email**: `researcher1-1763478308406@demo.medipact.com`
- **Organization**: Global Health Research Institute
- **Contact Name**: Dr. Sarah Johnson
- **Country**: Uganda
- **Status**: ✅ Verified

**Hedera Account:**
- **Account ID**: `0.0.7280041`

**How to Login:**
1. Go to `/researcher/login`
2. Enter Researcher ID: `RES-D4CAECABB332`
3. (No password needed for MVP)

**API Usage:**
```bash
curl -H "X-Researcher-ID: RES-D4CAECABB332" \
     http://localhost:8080/api/researcher/RES-D4CAECABB332
```

---

### Researcher 2: Medical Data Analytics Lab

**Login Information:**
- **Researcher ID**: `RES-A98972195A23`
- **Email**: `researcher2-1763478313025@demo.medipact.com`
- **Organization**: Medical Data Analytics Lab
- **Contact Name**: Dr. Michael Chen
- **Country**: Uganda
- **Status**: ✅ Verified

**Hedera Account:**
- **Account ID**: `0.0.7280042`

**How to Login:**
1. Go to `/researcher/login`
2. Enter Researcher ID: `RES-A98972195A23`
3. (No password needed for MVP)

**API Usage:**
```bash
curl -H "X-Researcher-ID: RES-A98972195A23" \
     http://localhost:8080/api/researcher/RES-A98972195A23
```

---

## 👤 Patient Credentials (Sample - First 10)

### Patient 1: James Brown

**Access Information:**
- **UPI**: `UPI-DCB57CCBFBA21A07`
- **Email**: `patient1-1-1763478318167@demo.medipact.com`
- **Phone**: `+256730975043`
- **National ID**: `DEMO01000001-1763478318167`
- **Age**: 46 (Range: 45-49)
- **Gender**: Female
- **Country**: Rwanda
- **Region**: Gisenyi
- **Hospital**: HOSP-679F06F58E2E

**Hedera Account:**
- **Account ID**: `0.0.7280043`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-DCB57CCBFBA21A07`
   OR Email: `patient1-1-1763478318167@demo.medipact.com`
   OR Phone: `+256730975043`

**API Usage:**
```bash
curl http://localhost:8080/api/patient/UPI-DCB57CCBFBA21A07/summary
```

---

### Patient 2: James Smith

**Access Information:**
- **UPI**: `UPI-732AB4DA27EB3690`
- **Email**: `patient1-2-1763478321902@demo.medipact.com`
- **Phone**: `+256746251090`
- **National ID**: `DEMO01000002-1763478321902`
- **Age**: 30 (Range: 30-34)
- **Gender**: Other
- **Country**: Rwanda
- **Region**: Gisenyi
- **Hospital**: HOSP-679F06F58E2E

**Hedera Account:**
- **Account ID**: `0.0.7280044`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-732AB4DA27EB3690`
   OR Email: `patient1-2-1763478321902@demo.medipact.com`
   OR Phone: `+256746251090`

**API Usage:**
```bash
curl http://localhost:8080/api/patient/UPI-732AB4DA27EB3690/summary
```

---

### Patient 3: Michael Davis

**Access Information:**
- **UPI**: `UPI-7A20F81586E35D58`
- **Email**: `patient1-3-1763478326047@demo.medipact.com`
- **Phone**: `+256720330829`
- **National ID**: `DEMO01000003-1763478326047`
- **Age**: 18 (Range: 15-19)
- **Gender**: Female
- **Country**: Rwanda
- **Region**: Butare
- **Hospital**: HOSP-679F06F58E2E

**Hedera Account:**
- **Account ID**: `0.0.7280045`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-7A20F81586E35D58`
   OR Email: `patient1-3-1763478326047@demo.medipact.com`
   OR Phone: `+256720330829`

**API Usage:**
```bash
curl http://localhost:8080/api/patient/UPI-7A20F81586E35D58/summary
```

---

### Patient 4: Maria Smith

**Access Information:**
- **UPI**: `UPI-523198F2FE03E9C8`
- **Email**: `patient1-4-1763478329981@demo.medipact.com`
- **Phone**: `+256720868109`
- **National ID**: `DEMO01000004-1763478329981`
- **Age**: 34 (Range: 30-34)
- **Gender**: Other
- **Country**: Rwanda
- **Region**: Butare
- **Hospital**: HOSP-679F06F58E2E

**Hedera Account:**
- **Account ID**: `0.0.7280046`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-523198F2FE03E9C8`
   OR Email: `patient1-4-1763478329981@demo.medipact.com`
   OR Phone: `+256720868109`

**API Usage:**
```bash
curl http://localhost:8080/api/patient/UPI-523198F2FE03E9C8/summary
```

---

### Patient 5: James Williams

**Access Information:**
- **UPI**: `UPI-9DCB8BBA73F70F36`
- **Email**: `patient1-5-1763478336240@demo.medipact.com`
- **Phone**: `+256740919016`
- **National ID**: `DEMO01000005-1763478336240`
- **Age**: 65 (Range: 65-69)
- **Gender**: Other
- **Country**: Rwanda
- **Region**: Gisenyi
- **Hospital**: HOSP-679F06F58E2E

**Hedera Account:**
- **Account ID**: `0.0.7280047`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-9DCB8BBA73F70F36`
   OR Email: `patient1-5-1763478336240@demo.medipact.com`
   OR Phone: `+256740919016`

**API Usage:**
```bash
curl http://localhost:8080/api/patient/UPI-9DCB8BBA73F70F36/summary
```

---

### Patient 6: Maria Smith

**Access Information:**
- **UPI**: `UPI-15F55B92C5C8372E`
- **Email**: `patient1-6-1763478341329@demo.medipact.com`
- **Phone**: `+256718055066`
- **National ID**: `DEMO01000006-1763478341329`
- **Age**: 76 (Range: 75-79)
- **Gender**: Male
- **Country**: Rwanda
- **Region**: Byumba
- **Hospital**: HOSP-679F06F58E2E

**Hedera Account:**
- **Account ID**: `0.0.7280048`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-15F55B92C5C8372E`
   OR Email: `patient1-6-1763478341329@demo.medipact.com`
   OR Phone: `+256718055066`

**API Usage:**
```bash
curl http://localhost:8080/api/patient/UPI-15F55B92C5C8372E/summary
```

---

### Patient 7: John Miller

**Access Information:**
- **UPI**: `UPI-B9474B0C4A13ED22`
- **Email**: `patient1-7-1763478345016@demo.medipact.com`
- **Phone**: `+256728150982`
- **National ID**: `DEMO01000007-1763478345016`
- **Age**: 40 (Range: 40-44)
- **Gender**: Other
- **Country**: Rwanda
- **Region**: Ruhengeri
- **Hospital**: HOSP-679F06F58E2E

**Hedera Account:**
- **Account ID**: `0.0.7280049`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-B9474B0C4A13ED22`
   OR Email: `patient1-7-1763478345016@demo.medipact.com`
   OR Phone: `+256728150982`

**API Usage:**
```bash
curl http://localhost:8080/api/patient/UPI-B9474B0C4A13ED22/summary
```

---

### Patient 8: Maria Davis

**Access Information:**
- **UPI**: `UPI-0AE1D9EFA0FB76E7`
- **Email**: `patient1-8-1763478348510@demo.medipact.com`
- **Phone**: `+256768755073`
- **National ID**: `DEMO01000008-1763478348510`
- **Age**: 79 (Range: 75-79)
- **Gender**: Other
- **Country**: Rwanda
- **Region**: Byumba
- **Hospital**: HOSP-679F06F58E2E

**Hedera Account:**
- **Account ID**: `0.0.7280050`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-0AE1D9EFA0FB76E7`
   OR Email: `patient1-8-1763478348510@demo.medipact.com`
   OR Phone: `+256768755073`

**API Usage:**
```bash
curl http://localhost:8080/api/patient/UPI-0AE1D9EFA0FB76E7/summary
```

---

### Patient 9: Jane Brown

**Access Information:**
- **UPI**: `UPI-A7A27BEEF8F42DC6`
- **Email**: `patient1-9-1763478353894@demo.medipact.com`
- **Phone**: `+256785507244`
- **National ID**: `DEMO01000009-1763478353894`
- **Age**: 75 (Range: 75-79)
- **Gender**: Other
- **Country**: Rwanda
- **Region**: Byumba
- **Hospital**: HOSP-679F06F58E2E

**Hedera Account:**
- **Account ID**: `0.0.7280051`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-A7A27BEEF8F42DC6`
   OR Email: `patient1-9-1763478353894@demo.medipact.com`
   OR Phone: `+256785507244`

**API Usage:**
```bash
curl http://localhost:8080/api/patient/UPI-A7A27BEEF8F42DC6/summary
```

---

### Patient 10: Emily Jones

**Access Information:**
- **UPI**: `UPI-7B278BA752043E21`
- **Email**: `patient1-10-1763478357731@demo.medipact.com`
- **Phone**: `+256757135364`
- **National ID**: `DEMO01000010-1763478357731`
- **Age**: 35 (Range: 35-39)
- **Gender**: Female
- **Country**: Rwanda
- **Region**: Byumba
- **Hospital**: HOSP-679F06F58E2E

**Hedera Account:**
- **Account ID**: `0.0.7280053`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-7B278BA752043E21`
   OR Email: `patient1-10-1763478357731@demo.medipact.com`
   OR Phone: `+256757135364`

**API Usage:**
```bash
curl http://localhost:8080/api/patient/UPI-7B278BA752043E21/summary
```

---


> **Note**: Showing first 10 patients. Total patients: 81
> See `backend/demo-credentials.json` for complete list.

## 📊 Datasets Available

### Dataset 1: Chronic Disease Registry

- **Dataset ID**: `DS-AACCABD50C31`
- **Name**: Chronic Disease Registry
- **Hospital**: Mbale Regional Hospital (`HOSP-6BE36AD7543D`)
- **Country**: Uganda
- **Record Count**: ~50 patients
- **Price**: 10 HBAR (~$1.48 USD)
- **Status**: ✅ Active and ready for purchase

---

## 🎯 Recommended Demo Flow

### 1. As Researcher (Recommended Starting Point)

**Login:**
- Use Researcher 1: `RES-D4CAECABB332`
- Email: `researcher1-1763478308406@demo.medipact.com`

**Demo Steps:**
1. Browse datasets at `/researcher/catalog`
2. View dataset details
3. Query data at `/researcher/query`
4. Purchase a dataset
5. View purchase history

---

### 2. As Hospital

**Login:**
- Use Hospital 1: `HOSP-679F06F58E2E`
- API Key: `230c60d30b71e40e9c978e249b6af65d6a8ba86c05f00f69dacd5aae882f3914`

**Demo Steps:**
1. View dashboard at `/hospital/dashboard`
2. Check revenue at `/hospital/revenue`
3. View processing history
4. Check wallet balance

---

### 3. As Patient

**Access:**
- Use Patient 1: `UPI-DCB57CCBFBA21A07`
- Email: `patient1-1-1763478318167@demo.medipact.com`

**Demo Steps:**
1. View wallet at `/patient/wallet`
2. Check earnings at `/patient/earnings`
3. View data sharing settings
4. See connected hospitals

---

## 📝 Notes

### Security Reminders

- ⚠️ These are demo credentials for MVP presentation only
- ⚠️ Do not use in production
- ⚠️ Keep credentials private
- ⚠️ Rotate credentials between demos
- ⚠️ Monitor for unauthorized access

### Complete Credentials

For the complete list of all patients and detailed information, see:
- `backend/demo-credentials.json` (JSON format)

---

## 🔄 Regenerating Credentials

To generate fresh credentials:

```bash
cd backend
npm run populate-demo
```

This will update both:
- `backend/demo-credentials.json` (JSON format)
- `DEMO_CREDENTIALS.md` (This file)

---

**Generated**: 2025-11-18T15:04:51.054Z  
**Status**: Ready for MVP Demo ✅
