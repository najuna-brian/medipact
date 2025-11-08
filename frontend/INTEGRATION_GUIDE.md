# Frontend-Backend Integration Guide

This guide explains how the frontend integrates with the Patient Identity Management backend.

## Overview

The frontend now connects to the Patient Identity Management backend API running on `http://localhost:3002` (configurable via `NEXT_PUBLIC_BACKEND_API_URL`).

## Architecture

### API Client
- **Location**: `src/lib/api/patient-identity.ts`
- **Purpose**: Type-safe API client for all patient identity endpoints
- **Features**:
  - Patient registration and matching
  - Hospital registration
  - Patient-hospital linkage
  - Medical history retrieval
  - Patient summary statistics

### React Hooks
- **Location**: `src/hooks/usePatientIdentity.ts`
- **Purpose**: React Query hooks for data fetching and mutations
- **Features**:
  - Automatic caching and refetching
  - Optimistic updates
  - Error handling
  - Loading states

### Updated Pages

#### Patient Portal
1. **Patient Dashboard** (`/patient/dashboard`)
   - Shows patient summary statistics
   - Displays connected hospitals count
   - Quick actions to other pages

2. **Patient Connect** (`/patient/connect`)
   - Enter/view UPI
   - Link hospitals to patient identity
   - View connected hospitals
   - Remove hospital linkages

3. **Patient Wallet** (`/patient/wallet`)
   - View complete medical history
   - See records from all connected hospitals
   - Patient summary statistics

#### Hospital Portal
1. **Hospital Enrollment** (`/hospital/enrollment`)
   - Register new hospitals
   - Receive Hospital ID and API Key
   - View enrollment benefits

## Usage

### Setting Up

1. **Start the Backend**:
   ```bash
   cd medipact/backend
   npm start
   ```
   Backend runs on `http://localhost:3002`

2. **Configure Frontend**:
   ```bash
   cd medipact/frontend
   cp .env.local.example .env.local
   # Edit .env.local if needed (defaults should work)
   ```

3. **Start Frontend**:
   ```bash
   npm run dev
   ```
   Frontend runs on `http://localhost:3000`

### Using the Patient Portal

1. **Enter UPI**: When you visit patient pages, you'll be prompted to enter your UPI
2. **View Data**: Once UPI is entered, you can view:
   - Connected hospitals
   - Medical history
   - Summary statistics
3. **Link Hospitals**: Use the "Connect Hospitals" page to link new hospitals

### Using the Hospital Portal

1. **Register Hospital**: Visit `/hospital/enrollment` to register
2. **Save Credentials**: Save the Hospital ID and API Key securely
3. **Link Patients**: Use the API to link patients (see backend API docs)

## API Endpoints Used

### Patient Endpoints
- `POST /api/patient/register` - Register new patient
- `POST /api/patient/match` - Match patient to existing UPI
- `GET /api/patient/:upi/hospitals` - Get patient's hospitals
- `GET /api/patient/:upi/history` - Get complete medical history
- `GET /api/patient/:upi/summary` - Get patient summary
- `POST /api/patient/:upi/link-hospital` - Link hospital to patient
- `DELETE /api/patient/:upi/link-hospital/:hospitalId` - Remove hospital linkage

### Hospital Endpoints
- `POST /api/hospital/register` - Register new hospital
- `GET /api/hospital/:hospitalId` - Get hospital info
- `PUT /api/hospital/:hospitalId` - Update hospital info

## Authentication

**Current Implementation**: Simple UPI input (stored in component state)

**Production**: Should implement:
- JWT tokens for patient authentication
- API key management for hospitals
- Session management
- Protected routes

## Error Handling

All API calls include error handling:
- Network errors are caught and displayed
- Validation errors from backend are shown
- Loading states are managed automatically
- Success messages are displayed

## Data Flow

1. **User enters UPI** → Stored in component state (temporary)
2. **Component calls hook** → `usePatientHospitals(upi)`
3. **Hook calls API client** → `getPatientHospitals(upi)`
4. **API client makes request** → `GET /api/patient/:upi/hospitals`
5. **Backend responds** → Returns hospital linkages
6. **React Query caches** → Data is cached and displayed
7. **UI updates** → Component re-renders with data

## Testing

To test the integration:

1. **Start Backend**: Ensure backend is running on port 3002
2. **Register a Hospital**: Use `/hospital/enrollment`
3. **Register a Patient**: Use the backend API directly or create test data
4. **Link Hospital to Patient**: Use the patient connect page
5. **View Data**: Check patient dashboard, wallet, and connect pages

## Troubleshooting

### Backend Not Responding
- Check if backend is running: `curl http://localhost:3002/health`
- Verify `NEXT_PUBLIC_BACKEND_API_URL` in `.env.local`

### CORS Errors
- Backend should have CORS enabled for `http://localhost:3000`
- Check backend `server.js` CORS configuration

### Data Not Loading
- Check browser console for errors
- Verify UPI format (UPI-XXXXXXXX)
- Check backend logs for API errors

## Next Steps

1. **Authentication**: Implement proper JWT-based auth
2. **Session Management**: Use cookies/localStorage for UPI persistence
3. **Error Boundaries**: Add error boundaries for better error handling
4. **Loading States**: Enhance loading indicators
5. **Real-time Updates**: Add WebSocket support for live updates
6. **Offline Support**: Add service worker for offline functionality

