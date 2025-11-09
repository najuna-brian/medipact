/**
 * MediPact Backend Server
 * 
 * Main server for patient identity management and hospital registry.
 */

import express from 'express';
import cors from 'cors';
import patientRoutes from './routes/patient-api.js';
import hospitalRoutes from './routes/hospital-api.js';
import hospitalPatientsRoutes from './routes/hospital-patients-api.js';
import adminRoutes from './routes/admin-api.js';
import adminAuthRoutes from './routes/admin-auth-api.js';
import { initDatabase, closeDatabase } from './db/database.js';

const app = express();
const PORT = process.env.PORT || 3002; // Default to 3002 to avoid conflicts

// Middleware
app.use(cors());
// Increase body size limit to handle base64-encoded documents (50mb allows ~37mb original files)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'MediPact Backend API'
  });
});

// API Routes
app.use('/api/patient', patientRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/hospital', hospitalPatientsRoutes); // Hospital patient management routes
app.use('/api/admin/auth', adminAuthRoutes); // Admin authentication routes (public)
app.use('/api/admin', adminRoutes); // Admin routes (protected)

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Start server
if (import.meta.url === `file://${process.argv[1]}`) {
  // Initialize database
  initDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 MediPact Backend Server running on port ${PORT}`);
        console.log(`📋 Health check: http://localhost:${PORT}/health`);
        console.log(`👤 Patient API: http://localhost:${PORT}/api/patient`);
        console.log(`🏥 Hospital API: http://localhost:${PORT}/api/hospital`);
        console.log(`👨‍💼 Admin API: http://localhost:${PORT}/api/admin`);
      }).on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          console.error(`\n❌ Port ${PORT} is already in use.`);
          console.error(`\n💡 Solutions:`);
          console.error(`   1. Use a different port: PORT=3002 npm start`);
          console.error(`   2. Find and stop the process using port ${PORT}:`);
          console.error(`      lsof -ti:${PORT} | xargs kill -9`);
          console.error(`   3. Or check what's running: lsof -i :${PORT}\n`);
          process.exit(1);
        } else {
          throw err;
        }
      });

      // Graceful shutdown
      process.on('SIGINT', async () => {
        console.log('\n🛑 Shutting down server...');
        await closeDatabase();
        process.exit(0);
      });
    })
    .catch((err) => {
      console.error('❌ Failed to initialize database:', err);
      process.exit(1);
    });
}

export default app;

