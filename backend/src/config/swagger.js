/**
 * Swagger/OpenAPI Configuration
 * 
 * API documentation configuration for MediPact Backend
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MediPact API',
      version: '1.0.0',
      description: `
        Enterprise Healthcare Data Platform API
        
        **MediPact** is a verifiable medical data marketplace that empowers patients to control 
        and monetize their anonymized medical data for research. Built on Hedera Hashgraph 
        blockchain for immutable proof and transparency.
        
        ## Key Features
        - Patient identity management with UPI (Universal Patient Identifier)
        - Hospital registration and patient data management
        - Researcher registration and verification
        - Medical data marketplace
        - Automated revenue distribution (60% Patient, 25% Hospital, 15% Platform)
        - FHIR R4 compliant data processing
        - Hedera blockchain integration
        
        ## Authentication
        Different endpoints require different authentication methods:
        - **Patient endpoints**: Use UPI in query params or request body
        - **Hospital endpoints**: Use x-hospital-id and x-api-key headers
        - **Admin endpoints**: Use JWT Bearer token
        - **Researcher endpoints**: Public registration, verification required for purchases
      `,
      contact: {
        name: 'MediPact Support',
        email: 'support@medipact.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3002',
        description: 'Development server',
      },
      {
        url: process.env.API_URL || 'https://medipact.space',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        HospitalAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'x-hospital-id',
          description: 'Hospital ID for authentication',
        },
        HospitalApiKey: {
          type: 'apiKey',
          in: 'header',
          name: 'x-api-key',
          description: 'Hospital API Key for authentication',
        },
        AdminAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Admin JWT token (get from /api/admin/auth/login)',
        },
        PatientUPI: {
          type: 'apiKey',
          in: 'query',
          name: 'upi',
          description: 'Patient UPI (Universal Patient Identifier)',
        },
      },
      schemas: {
        Patient: {
          type: 'object',
          properties: {
            upi: {
              type: 'string',
              example: 'UPI-ABC123XYZ',
              description: 'Universal Patient Identifier',
            },
            hederaAccountId: {
              type: 'string',
              example: '0.0.123456',
              description: 'Hedera Account ID for revenue distribution',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Hospital: {
          type: 'object',
          properties: {
            hospitalId: {
              type: 'string',
              example: 'HOSP-001',
            },
            name: {
              type: 'string',
              example: 'City General Hospital',
            },
            hederaAccountId: {
              type: 'string',
              example: '0.0.123456',
            },
            verificationStatus: {
              type: 'string',
              enum: ['pending', 'verified', 'rejected'],
              example: 'verified',
            },
          },
        },
        Researcher: {
          type: 'object',
          properties: {
            researcherId: {
              type: 'string',
              example: 'RES-ABC123',
            },
            email: {
              type: 'string',
              example: 'researcher@example.com',
            },
            organizationName: {
              type: 'string',
              example: 'Medical Research Institute',
            },
            verificationStatus: {
              type: 'string',
              enum: ['pending', 'verified', 'rejected'],
              example: 'pending',
            },
            hederaAccountId: {
              type: 'string',
              example: '0.0.123456',
            },
          },
        },
        Dataset: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'DS-ABC123' },
            name: { type: 'string', example: 'Diabetes Research Dataset' },
            description: { type: 'string', example: 'Anonymized diabetes patient data' },
            hospitalId: { type: 'string', example: 'HOSP-ABC123' },
            country: { type: 'string', example: 'Uganda' },
            recordCount: { type: 'integer', example: 5000 },
            dateRangeStart: { type: 'string', format: 'date', example: '2020-01-01' },
            dateRangeEnd: { type: 'string', format: 'date', example: '2024-12-31' },
            conditionCodes: { type: 'array', items: { type: 'string' }, example: ['E11'] },
            price: { type: 'number', example: 50 },
            currency: { type: 'string', example: 'HBAR' },
            format: { type: 'string', example: 'FHIR' },
            consentType: { type: 'string', example: 'hospital_verified' },
            hcsTopicId: { type: 'string', nullable: true },
            consentTopicId: { type: 'string', nullable: true },
            dataTopicId: { type: 'string', nullable: true },
            status: { type: 'string', enum: ['draft', 'active', 'archived', 'deleted'] },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        QueryResult: {
          type: 'object',
          properties: {
            results: { type: 'array', items: { type: 'object' }, nullable: true },
            count: { type: 'integer', example: 150 },
            filters: { type: 'object' },
            preview: { type: 'boolean', example: true },
            hcsMessageId: { type: 'string', nullable: true },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        RevenueDistribution: {
          type: 'object',
          properties: {
            patientAmount: {
              type: 'number',
              example: 60,
              description: '60% of total revenue',
            },
            hospitalAmount: {
              type: 'number',
              example: 25,
              description: '25% of total revenue',
            },
            platformAmount: {
              type: 'number',
              example: 15,
              description: '15% of total revenue',
            },
            transactionId: {
              type: 'string',
              example: '0.0.123456@1234567890.123456789',
              description: 'Hedera transaction ID',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Bad Request',
            },
            message: {
              type: 'string',
              example: 'Invalid request parameters',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Patient',
        description: 'Patient identity and medical history management',
      },
      {
        name: 'Hospital',
        description: 'Hospital registration and patient data management',
      },
      {
        name: 'Researcher',
        description: 'Researcher registration and verification',
      },
      {
        name: 'Marketplace',
        description: 'Medical data marketplace endpoints - browse, query, purchase datasets',
      },
      {
        name: 'Adapter',
        description: 'Adapter integration endpoints - submit anonymized FHIR resources',
      },
      {
        name: 'Revenue',
        description: 'Revenue distribution and tracking',
      },
      {
        name: 'Admin',
        description: 'Administrative endpoints',
      },
      {
        name: 'Health',
        description: 'Health check and system status',
      },
    ],
  },
  apis: [
    './src/routes/*.js', // Path to the API files
    './src/server.js',
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

