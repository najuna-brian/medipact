/**
 * MediPact Backend Server
 * 
 * Main server for patient identity management and hospital registry.
 */

import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { generalLimiter, authLimiter, apiKeyLimiter, queryLimiter, purchaseLimiter } from './middleware/rate-limiter.js';
import patientRoutes from './routes/patient-api.js';
import patientPreferencesRoutes from './routes/patient-preferences-api.js';
import hospitalRoutes from './routes/hospital-api.js';
import hospitalPatientsRoutes from './routes/hospital-patients-api.js';
import temporaryAccessRoutes from './routes/temporary-access-api.js';
import adminRoutes from './routes/admin-api.js';
import adminAuthRoutes from './routes/admin-auth-api.js';
import researcherRoutes from './routes/researcher-api.js';
import marketplaceRoutes from './routes/marketplace-api.js';
import revenueRoutes from './routes/revenue-api.js';
import adapterRoutes from './routes/adapter-api.js';
import fhirStorageRoutes from './routes/fhir-storage-api.js';
import walletRoutes from './routes/wallet-api.js';
import paymentMethodRoutes from './routes/payment-method-api.js';
import { initDatabase, closeDatabase } from './db/database.js';
import { initializeDefaultAdmin } from './services/admin-init-service.js';
import { startExpirationCleanupJob } from './services/expiration-cleanup-service.js';
import { startAutomaticWithdrawalJob } from './services/automatic-withdrawal-job.js';
import { initializeExchangeRate } from './services/exchange-rate-service.js';
import { validateEnvironment } from './config/env-validation.js';
import { logInfo, logError, logWarn, logSecurityEvent } from './utils/logger.js';

const app = express();
const PORT = process.env.PORT || 3002; // Default to 3002 to avoid conflicts

// Trust proxy for Railway/reverse proxy environments (required for rate limiting)
// Trust only the first proxy (Railway) to avoid security warnings
app.set('trust proxy', 1);

// Middleware - CORS configuration
const allowedOrigins = [
  'https://www.medipact.space',
  'https://medipact.space',
  'http://localhost:3000',
  'http://localhost:3001',
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? allowedOrigins
    : true, // Allow all in development
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Hospital-ID', 'X-API-Key', 'X-Researcher-ID', 'x-admin-token'],
};

app.use(cors(corsOptions));
// Increase body size limit to handle base64-encoded documents (50mb allows ~37mb original files)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Apply general rate limiting to all routes
app.use(generalLimiter);

// Swagger UI Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'MediPact API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    tryItOutEnabled: true,
  },
}));

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the health status of the API server
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: healthy
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 service:
 *                   type: string
 *                   example: MediPact Backend API
 */
// Health check - available immediately, even before database initialization
let dbReady = false;
app.get('/health', (req, res) => {
  res.json({ 
    status: dbReady ? 'healthy' : 'initializing',
    timestamp: new Date().toISOString(),
    service: 'MediPact Backend API',
    database: dbReady ? 'connected' : 'connecting'
  });
});

// API Routes with rate limiting
app.use('/api/admin/auth', authLimiter, adminAuthRoutes); // Admin authentication routes (strict rate limit)
app.use('/api/patient', patientRoutes);
app.use('/api/patient', patientPreferencesRoutes); // Patient preferences routes
app.use('/api/hospital', apiKeyLimiter, hospitalRoutes); // Hospital routes (API key rate limit)
app.use('/api/hospital', apiKeyLimiter, hospitalPatientsRoutes); // Hospital patient management routes
app.use('/api', temporaryAccessRoutes); // Temporary access routes (for hospitals and patients)
app.use('/api/admin', adminRoutes); // Admin routes (protected)
app.use('/api/researcher', apiKeyLimiter, researcherRoutes); // Researcher routes (API key rate limit)
app.use('/api/marketplace', apiKeyLimiter, marketplaceRoutes); // Data marketplace routes (API key rate limit)
app.use('/api/revenue', apiKeyLimiter, revenueRoutes); // Revenue distribution routes (API key rate limit)
app.use('/api/adapter', apiKeyLimiter, adapterRoutes); // Adapter integration routes (API key rate limit)
app.use('/api/adapter', apiKeyLimiter, fhirStorageRoutes); // FHIR resource storage routes (API key rate limit)
app.use('/api', walletRoutes); // Wallet routes (balance, withdrawals)
app.use('/api', paymentMethodRoutes); // Payment method routes

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Security headers middleware (production)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    // Security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });
}

// Error handler
app.use((err, req, res, next) => {
  logError('Request error', err, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    statusCode: err.status || 500
  });
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
if (import.meta.url === `file://${process.argv[1]}`) {
  // Validate environment variables first
  // Note: In production, ensure all required env vars are set in Railway
  try {
    validateEnvironment();
  } catch (error) {
    logError('Environment validation failed', error);
    // In production, exit on validation failure
    // In development, log warning but continue (for local testing)
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      logWarn('Continuing despite validation errors (development mode)');
    }
  }
  
  // Start server listening immediately (for health checks)
  // Database initialization happens asynchronously
  app.listen(PORT, '0.0.0.0', () => {
    logInfo('MediPact Backend Server started', {
      port: PORT,
      nodeEnv: process.env.NODE_ENV,
      apiDocs: `/api-docs`,
      healthCheck: `/health`
    });
    
    // Only log detailed info in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`🚀 MediPact Backend Server running on port ${PORT}`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
      console.log(`📋 Health check: http://localhost:${PORT}/health`);
    }
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logError(`Port ${PORT} is already in use`, err);
      process.exit(1);
    } else {
      throw err;
    }
  });

  // Initialize database asynchronously
  initDatabase()
    .then(async () => {
      dbReady = true;
      logInfo('Server initialization started', {
        nodeEnv: process.env.NODE_ENV,
        port: PORT,
        hederaNetwork: process.env.HEDERA_NETWORK || 'auto-detected'
      });
      
      // Initialize default admin account if it doesn't exist
      await initializeDefaultAdmin();
      
      // Initialize exchange rate service
      await initializeExchangeRate();
      
      // Start expiration cleanup job (runs every 5 minutes)
      startExpirationCleanupJob(5);
      
      // Start automatic withdrawal job (runs daily, can be triggered manually by admin)
      // Set AUTOMATIC_WITHDRAWAL_ENABLED=false to disable automatic runs
      if (process.env.AUTOMATIC_WITHDRAWAL_ENABLED !== 'false') {
        const withdrawalInterval = parseInt(process.env.AUTOMATIC_WITHDRAWAL_INTERVAL_MINUTES || '1440'); // Default: daily
        startAutomaticWithdrawalJob(withdrawalInterval);
        logInfo('Automatic withdrawal job started', { intervalMinutes: withdrawalInterval });
      }
      
      logInfo('Database initialization complete');

      // Graceful shutdown handlers
      const gracefulShutdown = async (signal) => {
        logInfo(`Received ${signal}, shutting down gracefully...`);
        await closeDatabase();
        process.exit(0);
      };
      
      process.on('SIGINT', () => gracefulShutdown('SIGINT'));
      process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
      
      // Handle uncaught exceptions
      process.on('uncaughtException', (error) => {
        logError('Uncaught exception', error);
        gracefulShutdown('uncaughtException');
      });
      
      // Handle unhandled promise rejections
      process.on('unhandledRejection', (reason, promise) => {
        logError('Unhandled promise rejection', new Error(String(reason)), {
          promise: String(promise)
        });
      });
    })
    .catch((err) => {
      logError('Failed to initialize database/services', err);
      // Server is already listening, so health check can still work
      // In production, log error but don't exit (allows debugging via logs)
      // In development, exit for faster feedback
      if (process.env.NODE_ENV === 'development') {
        process.exit(1);
      }
      // In production, continue running - health check will show 'initializing' status
    });
}

export default app;

