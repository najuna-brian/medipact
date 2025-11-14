# Swagger UI Integration

## Overview

Swagger UI has been successfully integrated into the MediPact Backend API, providing comprehensive, interactive API documentation.

## Access

- **Development**: http://localhost:3002/api-docs
- **Production**: https://your-domain.com/api-docs

## Features

### 1. Interactive API Documentation
- Browse all endpoints organized by tags
- See request/response schemas
- Test endpoints directly in the browser
- View authentication requirements

### 2. Documented Endpoints

#### Patient API
- `POST /api/patient/register` - Register new patient
- `GET /api/patient/{upi}/history` - Get medical history

#### Hospital API
- `POST /api/hospital/register` - Register new hospital

#### Researcher API
- `POST /api/researcher/register` - Register new researcher

#### Marketplace API
- `GET /api/marketplace/datasets` - Browse datasets
- `POST /api/marketplace/purchase` - Purchase dataset

#### Revenue API
- `POST /api/revenue/distribute` - Distribute revenue

#### Health
- `GET /health` - Health check

### 3. Authentication Methods

Swagger UI supports multiple authentication methods:
- **Hospital Auth**: x-hospital-id and x-api-key headers
- **Admin Auth**: JWT Bearer token
- **Patient UPI**: Query parameter

### 4. Data Models

Predefined schemas for:
- Patient
- Hospital
- Researcher
- Dataset
- RevenueDistribution
- Error

## Benefits for MVP Presentation

1. **Professional Documentation**: Shows enterprise-grade API design
2. **Live Demo Capability**: Test endpoints during presentation
3. **Integration Readiness**: Partners can see how to integrate
4. **Technical Depth**: Demonstrates API-first architecture
5. **Developer Experience**: Shows commitment to developer tools

## Usage

1. Start the backend server: `npm start`
2. Navigate to http://localhost:3002/api-docs
3. Browse endpoints by category
4. Click "Try it out" on any endpoint
5. Fill in parameters and execute
6. View responses and schemas

## Adding More Documentation

To document additional endpoints, add JSDoc comments above route handlers:

```javascript
/**
 * @swagger
 * /api/endpoint:
 *   get:
 *     summary: Endpoint description
 *     tags: [TagName]
 *     responses:
 *       200:
 *         description: Success response
 */
router.get('/endpoint', async (req, res) => {
  // Route implementation
});
```

## Next Steps

- Add documentation for remaining endpoints
- Add example requests/responses
- Document error codes
- Add authentication flow examples

