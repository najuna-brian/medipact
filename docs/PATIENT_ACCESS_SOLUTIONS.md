# Patient Access Solutions - Implementation Guide

This document describes the 4 comprehensive solutions implemented for patient account access, especially for patients created via CSV upload.

## Overview

When hospitals upload patient data via CSV, patients are automatically registered with UPIs (Universal Patient Identifiers) and Hedera accounts. However, patients need a way to:
1. Know their UPI
2. Access their patient portal
3. View their earnings and medical records
4. Confirm payments made to their accounts

## Solution 1: Hospital UPI Export Feature ✅

### Features
- **Patient List Page**: `/hospital/patients`
  - View all patients with their UPIs
  - Search and filter patients
  - See contact information (email/phone)
  - View patient source (registered vs CSV upload)
  - See record counts per patient

- **Export Functionality**:
  - Export patients as CSV (includes UPI, contact info, source)
  - Export patients as JSON
  - Download button for easy sharing

### Usage
1. Navigate to `/hospital/patients`
2. View all patients with their UPIs displayed
3. Use search to find specific patients
4. Click "Export CSV" or "Export JSON" to download patient list
5. Share the exported file with patients or use it for manual distribution

### API Endpoints
- `GET /api/hospital/:hospitalId/patients/export?format=csv` - Export as CSV
- `GET /api/hospital/:hospitalId/patients/export?format=json` - Export as JSON

## Solution 2: Email/SMS Notification Service ✅

### Features
- **Graceful Fallback**: Works without email/SMS services configured
  - When services are not configured, notifications are logged to console
  - Perfect for hackathons and demos
  - No errors or failures - just console output

- **Email Support**:
  - SendGrid (when `EMAIL_SERVICE=sendgrid`)
  - AWS SES (when `EMAIL_SERVICE=ses`)
  - SMTP (when `EMAIL_SERVICE=smtp`)
  - Console fallback (default)

- **SMS Support**:
  - Twilio (when `SMS_SERVICE=twilio`)
  - AWS SNS (when `SMS_SERVICE=aws-sns`)
  - Console fallback (default)

### Configuration
Add to `.env`:
```bash
# Email Service (optional)
EMAIL_SERVICE=sendgrid  # or 'ses', 'smtp'
EMAIL_API_KEY=your_api_key
EMAIL_FROM=noreply@medipact.com

# SMS Service (optional)
SMS_SERVICE=twilio  # or 'aws-sns'
SMS_API_KEY=your_api_key
SMS_FROM=+1234567890

# Patient Portal URL
PATIENT_PORTAL_URL=https://medipact.com/patient/login
```

### Hackathon Mode
When services are not configured:
- Notifications are logged to console with full details
- No errors or failures
- Easy to see what would be sent
- Can manually copy/paste to send to patients

### Notification Content
- Patient UPI
- Link to patient portal
- Instructions on how to login
- Alternative login method (using email/phone)

## Solution 3: Automatic Patient Notification After CSV Upload ✅

### Features
- **Automatic Notifications**: After CSV upload completes, all patients receive notifications
- **Batch Processing**: Notifications sent in batches of 10 to avoid overwhelming the system
- **Error Handling**: Failed notifications don't stop the upload process
- **Configurable**: Can be disabled with `SEND_PATIENT_NOTIFICATIONS=false`

### How It Works
1. CSV is uploaded and processed
2. Patients are registered with UPIs
3. After successful storage, notifications are sent to all patients
4. Results are logged (successful/failed counts)

### Configuration
```bash
# Enable/disable automatic notifications (default: true)
SEND_PATIENT_NOTIFICATIONS=true
```

### Console Output
When notifications are sent, you'll see:
```
9. Sending patient notifications...
   Found 20 unique patients to notify
   ✓ Batch 1: 10 sent, 0 failed
     → UPI-ABC123: email:console_fallback, sms:console_fallback
   ✓ Batch 2: 10 sent, 0 failed
   ✓ Notification process completed
```

## Solution 4: Hospital Patient Management Portal ✅

### Features
- **Patient List Page**: Comprehensive patient management
  - View all patients
  - Search by UPI, Patient ID, email, or phone
  - See contact information
  - View patient source and record counts

- **Individual Patient Actions**:
  - Copy UPI to clipboard
  - Send UPI notification (email/SMS)
  - View patient details

- **Bulk Actions**:
  - Select multiple patients
  - Send bulk notifications
  - Export selected patients

- **Patient Lookup**:
  - Enhanced lookup page at `/hospital/patients/lookup`
  - Find patient UPI by email, phone, or national ID
  - Display UPI with copy button
  - Share UPI with patient

### Navigation
- Added "Patients" link to hospital sidebar
- Accessible from all hospital pages
- Quick access to patient management

## Hackathon Workflow

Since email/SMS services may not be configured during hackathons, here's the recommended workflow:

### Option 1: Manual Distribution (Recommended for Hackathons)
1. After CSV upload, go to `/hospital/patients`
2. Export patient list as CSV
3. Open the CSV file
4. For each patient:
   - Copy their UPI
   - Contact them via phone/email (manually)
   - Share their UPI and portal link

### Option 2: Use Console Output
1. Upload CSV
2. Check console output for notification details
3. Copy UPIs from console
4. Manually send to patients

### Option 3: Use Patient Lookup
1. When patient visits hospital
2. Go to `/hospital/patients/lookup`
3. Enter patient's email or phone
4. Get their UPI
5. Share it with them

### Option 4: Print Patient Access Cards
1. Export patient list
2. Print patient access information
3. Give cards to patients during visits

## API Endpoints Summary

### Patient Management
- `GET /api/hospital/:hospitalId/patients` - List all patients
- `GET /api/hospital/:hospitalId/patients/export?format=csv` - Export CSV
- `GET /api/hospital/:hospitalId/patients/export?format=json` - Export JSON

### Patient Lookup
- `POST /api/hospital/:hospitalId/patients/lookup` - Lookup patient UPI

### Notifications
- `POST /api/hospital/:hospitalId/patients/:upi/notify` - Send notification to one patient
- `POST /api/hospital/:hospitalId/patients/notify-bulk` - Send notifications to multiple patients

## Frontend Pages

- `/hospital/patients` - Patient list and management
- `/hospital/patients/lookup` - Patient lookup
- `/hospital/patients/register` - Register single patient
- `/hospital/patients/bulk` - Bulk patient upload

## Testing

### Test Notification Service (Console Mode)
1. Upload a CSV with patient data
2. Check console for notification output
3. Verify UPIs are logged correctly

### Test Patient Export
1. Go to `/hospital/patients`
2. Click "Export CSV"
3. Verify file contains UPIs and contact info

### Test Patient Lookup
1. Go to `/hospital/patients/lookup`
2. Enter patient email/phone
3. Verify UPI is returned

## Future Enhancements

1. **QR Code Generation**: Generate QR codes with patient UPI for easy access
2. **Patient Access Cards**: Printable cards with UPI and portal link
3. **SMS Gateway Integration**: Full SMS support for production
4. **Email Templates**: Customizable email templates
5. **Notification History**: Track which patients were notified and when
6. **Patient Self-Registration**: Allow patients to register themselves and link to hospital

## Security Notes

- UPIs are sensitive - treat them like passwords
- Only share UPIs through secure channels
- Patients can retrieve their UPI using email/phone on the patient portal
- All lookups are logged to Hedera HCS for audit trail

## Support

For questions or issues:
1. Check console output for notification details
2. Verify email/SMS service configuration
3. Check patient contact information is correct
4. Use patient lookup as fallback method

