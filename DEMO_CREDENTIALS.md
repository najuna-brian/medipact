# Demo Credentials for MediPact MVP

> **Note**: This file is auto-generated after running `npm run populate-demo`.  
> **Security**: Keep these credentials private. Do not commit real credentials to git.

## 🚀 Quick Start

These credentials were generated on: **2025-11-18T19:33:39.198Z**  
API URL: **https://medipact-production.up.railway.app**

---

## 📊 Summary

- **Hospitals**: 3
- **Researchers**: 2
- **Patients**: 600
- **Datasets**: 0
- **FHIR Records**: 200

---

## 🏥 Hospital Credentials

### Hospital 1: Nakuru General Hospital

**Login Information:**
- **Hospital ID**: `HOSP-04D4A41F26C0`
- **API Key**: `02b4466e795e3fbeb641cca4572cd4b2bad854f7f3bf331746cd7203bb91d5d3`
- **Email**: `hospital1-1763494420986@demo.medipact.com`
- **Country**: Kenya
- **Location**: Nakuru, Kenya

**Hedera Account:**
- **Account ID**: `0.0.7281752`

**How to Login:**
1. Go to `/hospital/login`
2. Enter Hospital ID: `HOSP-04D4A41F26C0`
3. Enter API Key: `02b4466e795e3fbeb641cca4572cd4b2bad854f7f3bf331746cd7203bb91d5d3`

**API Usage:**
```bash
curl -H "X-Hospital-ID: HOSP-04D4A41F26C0" \
     -H "X-API-Key: 02b4466e795e3fbeb641cca4572cd4b2bad854f7f3bf331746cd7203bb91d5d3" \
     https://medipact-production.up.railway.app/api/hospital/HOSP-04D4A41F26C0
```

---

### Hospital 2: Gulu Medical Center

**Login Information:**
- **Hospital ID**: `HOSP-D96C0D59820D`
- **API Key**: `bce3f9e889eec8aa762d620af28016301b165806e4ed17dc12c624a31bbd6633`
- **Email**: `hospital2-1763494429165@demo.medipact.com`
- **Country**: Uganda
- **Location**: Gulu, Uganda

**Hedera Account:**
- **Account ID**: `0.0.7281753`

**How to Login:**
1. Go to `/hospital/login`
2. Enter Hospital ID: `HOSP-D96C0D59820D`
3. Enter API Key: `bce3f9e889eec8aa762d620af28016301b165806e4ed17dc12c624a31bbd6633`

**API Usage:**
```bash
curl -H "X-Hospital-ID: HOSP-D96C0D59820D" \
     -H "X-API-Key: bce3f9e889eec8aa762d620af28016301b165806e4ed17dc12c624a31bbd6633" \
     https://medipact-production.up.railway.app/api/hospital/HOSP-D96C0D59820D
```

---

### Hospital 3: Dodoma Regional Hospital

**Login Information:**
- **Hospital ID**: `HOSP-85A7E05896FE`
- **API Key**: `a42fedf1d98925e1b4f1c857d7d2584cec2e46693ee1498eee9e918305874997`
- **Email**: `hospital3-1763494437340@demo.medipact.com`
- **Country**: Tanzania
- **Location**: Dodoma, Tanzania

**Hedera Account:**
- **Account ID**: `0.0.7281754`

**How to Login:**
1. Go to `/hospital/login`
2. Enter Hospital ID: `HOSP-85A7E05896FE`
3. Enter API Key: `a42fedf1d98925e1b4f1c857d7d2584cec2e46693ee1498eee9e918305874997`

**API Usage:**
```bash
curl -H "X-Hospital-ID: HOSP-85A7E05896FE" \
     -H "X-API-Key: a42fedf1d98925e1b4f1c857d7d2584cec2e46693ee1498eee9e918305874997" \
     https://medipact-production.up.railway.app/api/hospital/HOSP-85A7E05896FE
```

---

## 🔬 Researcher Credentials

### Researcher 1: Global Health Research Institute

**Login Information:**
- **Researcher ID**: `RES-77C7C600CAC8`
- **Email**: `researcher1-1763494445408@demo.medipact.com`
- **Organization**: Global Health Research Institute
- **Contact Name**: Dr. Sarah Johnson
- **Country**: Uganda
- **Status**: ✅ Verified

**Hedera Account:**
- **Account ID**: `0.0.7281755`

**How to Login:**
1. Go to `/researcher/login`
2. Enter Researcher ID: `RES-77C7C600CAC8`
3. (No password needed for MVP)

**API Usage:**
```bash
curl -H "X-Researcher-ID: RES-77C7C600CAC8" \
     https://medipact-production.up.railway.app/api/researcher/RES-77C7C600CAC8
```

---

### Researcher 2: Medical Data Analytics Lab

**Login Information:**
- **Researcher ID**: `RES-29091889DF35`
- **Email**: `researcher2-1763494453919@demo.medipact.com`
- **Organization**: Medical Data Analytics Lab
- **Contact Name**: Dr. Michael Chen
- **Country**: Rwanda
- **Status**: ✅ Verified

**Hedera Account:**
- **Account ID**: `0.0.7281756`

**How to Login:**
1. Go to `/researcher/login`
2. Enter Researcher ID: `RES-29091889DF35`
3. (No password needed for MVP)

**API Usage:**
```bash
curl -H "X-Researcher-ID: RES-29091889DF35" \
     https://medipact-production.up.railway.app/api/researcher/RES-29091889DF35
```

---

## 👤 Patient Credentials (Sample - First 10)

### Patient 1: Emily Garcia

**Access Information:**
- **UPI**: `UPI-AE5D5A9B46F5F73C`
- **Email**: `patient1-1-1763494460047@demo.medipact.com`
- **Phone**: `+256776351007`
- **National ID**: `DEMO01000001-1763494460047`
- **Age**: 33 (Range: 30-34)
- **Gender**: Male
- **Country**: Kenya
- **Region**: Nairobi
- **Hospital**: HOSP-04D4A41F26C0

**Hedera Account:**
- **Account ID**: `0.0.7281758`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-AE5D5A9B46F5F73C`
   OR Email: `patient1-1-1763494460047@demo.medipact.com`
   OR Phone: `+256776351007`

**API Usage:**
```bash
curl https://medipact-production.up.railway.app/api/patient/UPI-AE5D5A9B46F5F73C/summary
```

---

### Patient 2: Sarah Brown

**Access Information:**
- **UPI**: `UPI-695C16C73404FF31`
- **Email**: `patient1-2-1763494465832@demo.medipact.com`
- **Phone**: `+256765218170`
- **National ID**: `DEMO01000002-1763494465832`
- **Age**: 47 (Range: 45-49)
- **Gender**: Other
- **Country**: Kenya
- **Region**: Nairobi
- **Hospital**: HOSP-04D4A41F26C0

**Hedera Account:**
- **Account ID**: `0.0.7281761`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-695C16C73404FF31`
   OR Email: `patient1-2-1763494465832@demo.medipact.com`
   OR Phone: `+256765218170`

**API Usage:**
```bash
curl https://medipact-production.up.railway.app/api/patient/UPI-695C16C73404FF31/summary
```

---

### Patient 3: Jane Williams

**Access Information:**
- **UPI**: `UPI-604E010052995CEE`
- **Email**: `patient1-3-1763494470748@demo.medipact.com`
- **Phone**: `+256732574358`
- **National ID**: `DEMO01000003-1763494470748`
- **Age**: 22 (Range: 20-24)
- **Gender**: Male
- **Country**: Kenya
- **Region**: Kisumu
- **Hospital**: HOSP-04D4A41F26C0

**Hedera Account:**
- **Account ID**: `0.0.7281763`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-604E010052995CEE`
   OR Email: `patient1-3-1763494470748@demo.medipact.com`
   OR Phone: `+256732574358`

**API Usage:**
```bash
curl https://medipact-production.up.railway.app/api/patient/UPI-604E010052995CEE/summary
```

---

### Patient 4: James Brown

**Access Information:**
- **UPI**: `UPI-159B5E450C80F051`
- **Email**: `patient1-4-1763494475355@demo.medipact.com`
- **Phone**: `+256745511219`
- **National ID**: `DEMO01000004-1763494475355`
- **Age**: 22 (Range: 20-24)
- **Gender**: Other
- **Country**: Kenya
- **Region**: Nairobi
- **Hospital**: HOSP-04D4A41F26C0

**Hedera Account:**
- **Account ID**: `0.0.7281764`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-159B5E450C80F051`
   OR Email: `patient1-4-1763494475355@demo.medipact.com`
   OR Phone: `+256745511219`

**API Usage:**
```bash
curl https://medipact-production.up.railway.app/api/patient/UPI-159B5E450C80F051/summary
```

---

### Patient 5: Maria Jones

**Access Information:**
- **UPI**: `UPI-5ACEE5C6221A16E5`
- **Email**: `patient1-5-1763494480178@demo.medipact.com`
- **Phone**: `+256703821902`
- **National ID**: `DEMO01000005-1763494480178`
- **Age**: 57 (Range: 55-59)
- **Gender**: Female
- **Country**: Kenya
- **Region**: Kisumu
- **Hospital**: HOSP-04D4A41F26C0

**Hedera Account:**
- **Account ID**: `0.0.7281765`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-5ACEE5C6221A16E5`
   OR Email: `patient1-5-1763494480178@demo.medipact.com`
   OR Phone: `+256703821902`

**API Usage:**
```bash
curl https://medipact-production.up.railway.app/api/patient/UPI-5ACEE5C6221A16E5/summary
```

---

### Patient 6: James Jones

**Access Information:**
- **UPI**: `UPI-CBAB0CE3FAABA682`
- **Email**: `patient1-6-1763494484779@demo.medipact.com`
- **Phone**: `+256721460467`
- **National ID**: `DEMO01000006-1763494484779`
- **Age**: 69 (Range: 65-69)
- **Gender**: Other
- **Country**: Kenya
- **Region**: Eldoret
- **Hospital**: HOSP-04D4A41F26C0

**Hedera Account:**
- **Account ID**: `0.0.7281766`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-CBAB0CE3FAABA682`
   OR Email: `patient1-6-1763494484779@demo.medipact.com`
   OR Phone: `+256721460467`

**API Usage:**
```bash
curl https://medipact-production.up.railway.app/api/patient/UPI-CBAB0CE3FAABA682/summary
```

---

### Patient 7: James Williams

**Access Information:**
- **UPI**: `UPI-C83167164757F22F`
- **Email**: `patient1-7-1763494489442@demo.medipact.com`
- **Phone**: `+256718803652`
- **National ID**: `DEMO01000007-1763494489442`
- **Age**: 42 (Range: 40-44)
- **Gender**: Other
- **Country**: Kenya
- **Region**: Nairobi
- **Hospital**: HOSP-04D4A41F26C0

**Hedera Account:**
- **Account ID**: `0.0.7281767`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-C83167164757F22F`
   OR Email: `patient1-7-1763494489442@demo.medipact.com`
   OR Phone: `+256718803652`

**API Usage:**
```bash
curl https://medipact-production.up.railway.app/api/patient/UPI-C83167164757F22F/summary
```

---

### Patient 8: John Williams

**Access Information:**
- **UPI**: `UPI-14F7A0CCFE3B3756`
- **Email**: `patient1-8-1763494494199@demo.medipact.com`
- **Phone**: `+256787193829`
- **National ID**: `DEMO01000008-1763494494199`
- **Age**: 59 (Range: 55-59)
- **Gender**: Female
- **Country**: Kenya
- **Region**: Nairobi
- **Hospital**: HOSP-04D4A41F26C0

**Hedera Account:**
- **Account ID**: `0.0.7281771`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-14F7A0CCFE3B3756`
   OR Email: `patient1-8-1763494494199@demo.medipact.com`
   OR Phone: `+256787193829`

**API Usage:**
```bash
curl https://medipact-production.up.railway.app/api/patient/UPI-14F7A0CCFE3B3756/summary
```

---

### Patient 9: David Miller

**Access Information:**
- **UPI**: `UPI-C1B14B9F062B2057`
- **Email**: `patient1-9-1763494498705@demo.medipact.com`
- **Phone**: `+256758510098`
- **National ID**: `DEMO01000009-1763494498705`
- **Age**: 69 (Range: 65-69)
- **Gender**: Male
- **Country**: Kenya
- **Region**: Nakuru
- **Hospital**: HOSP-04D4A41F26C0

**Hedera Account:**
- **Account ID**: `0.0.7281774`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-C1B14B9F062B2057`
   OR Email: `patient1-9-1763494498705@demo.medipact.com`
   OR Phone: `+256758510098`

**API Usage:**
```bash
curl https://medipact-production.up.railway.app/api/patient/UPI-C1B14B9F062B2057/summary
```

---

### Patient 10: David Williams

**Access Information:**
- **UPI**: `UPI-2B462D61C7A3329E`
- **Email**: `patient1-10-1763494504426@demo.medipact.com`
- **Phone**: `+256777446771`
- **National ID**: `DEMO01000010-1763494504426`
- **Age**: 44 (Range: 40-44)
- **Gender**: Female
- **Country**: Kenya
- **Region**: Nairobi
- **Hospital**: HOSP-04D4A41F26C0

**Hedera Account:**
- **Account ID**: `0.0.7281775`

**How to Access:**
1. Go to `/patient/login`
2. Enter UPI: `UPI-2B462D61C7A3329E`
   OR Email: `patient1-10-1763494504426@demo.medipact.com`
   OR Phone: `+256777446771`

**API Usage:**
```bash
curl https://medipact-production.up.railway.app/api/patient/UPI-2B462D61C7A3329E/summary
```

---


> **Note**: Showing first 10 patients. Total patients: 600
> See `backend/demo-credentials.json` for complete list.

## 📊 Datasets Available

## 🎯 Recommended Demo Flow

### 1. As Researcher (Recommended Starting Point)

**Login:**
- Use Researcher 1: `RES-77C7C600CAC8`
- Email: `researcher1-1763494445408@demo.medipact.com`

**Demo Steps:**
1. Browse datasets at `/researcher/catalog`
2. View dataset details
3. Query data at `/researcher/query`
4. Purchase a dataset
5. View purchase history

---

### 2. As Hospital

**Login:**
- Use Hospital 1: `HOSP-04D4A41F26C0`
- API Key: `02b4466e795e3fbeb641cca4572cd4b2bad854f7f3bf331746cd7203bb91d5d3`

**Demo Steps:**
1. View dashboard at `/hospital/dashboard`
2. Check revenue at `/hospital/revenue`
3. View processing history
4. Check wallet balance

---

### 3. As Patient

**Access:**
- Use Patient 1: `UPI-AE5D5A9B46F5F73C`
- Email: `patient1-1-1763494460047@demo.medipact.com`

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

**Generated**: 2025-11-18T19:33:39.198Z  
**Status**: Ready for MVP Demo ✅
