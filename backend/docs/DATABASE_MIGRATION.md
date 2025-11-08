# Database Migration Guide: SQLite → PostgreSQL

## Overview

The MediPact backend currently uses **SQLite for development** and will migrate to **PostgreSQL for production**.

## Why PostgreSQL for Production?

### Development (SQLite)
- ✅ Zero configuration
- ✅ File-based, easy to deploy
- ✅ Perfect for development and testing
- ✅ Fast for small datasets

### Production (PostgreSQL)
- ✅ **Better Concurrency**: Handles multiple simultaneous connections
- ✅ **Built-in Encryption**: pgcrypto extension for at-rest encryption
- ✅ **Row-Level Security**: Fine-grained access control
- ✅ **HIPAA Compliance**: Better suited for healthcare data
- ✅ **Scalability**: Handles large datasets and high traffic
- ✅ **Advanced Features**: JSON support, full-text search, etc.

## Current Implementation

### SQLite Setup (Current)
- **Location**: `backend/data/medipact.db`
- **Driver**: `sqlite3` npm package
- **Connection**: File-based, no server required
- **Status**: ✅ Active for development

### Database Schema
See `src/models/patient-identity-model.js` for the complete schema definition.

## Migration Plan

### Phase 1: Development (Current)
- ✅ SQLite implementation complete
- ✅ All CRUD operations working
- ✅ Database-agnostic code structure

### Phase 2: Production Preparation
- [ ] PostgreSQL schema setup
- [ ] Connection pooling configuration
- [ ] Encryption setup (pgcrypto)
- [ ] Row-level security policies
- [ ] Migration scripts

### Phase 3: Production Deployment
- [ ] PostgreSQL server setup
- [ ] Data migration from SQLite (if needed)
- [ ] Performance testing
- [ ] Security audit

## PostgreSQL Setup

### 1. Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# macOS
brew install postgresql

# Or use Docker
docker run --name medipact-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=medipact \
  -p 5432:5432 \
  -d postgres:15
```

### 2. Create Database

```sql
CREATE DATABASE medipact;
\c medipact
```

### 3. Enable Extensions

```sql
-- For encryption
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- For UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 4. Create Tables

The schema is defined in `src/models/patient-identity-model.js`. PostgreSQL version:

```sql
-- Patient Identities Table
CREATE TABLE patient_identities (
  upi VARCHAR(64) PRIMARY KEY,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  CHECK (status IN ('active', 'suspended', 'deleted'))
);

-- Hospitals Table
CREATE TABLE hospitals (
  hospital_id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  country VARCHAR(100) NOT NULL,
  location VARCHAR(255),
  fhir_endpoint VARCHAR(512),
  contact_email VARCHAR(255),
  api_key_hash VARCHAR(255) NOT NULL,
  registered_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  CHECK (status IN ('active', 'suspended', 'deleted'))
);

-- Hospital Linkages Table
CREATE TABLE hospital_linkages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upi VARCHAR(64) NOT NULL REFERENCES patient_identities(upi),
  hospital_id VARCHAR(32) NOT NULL REFERENCES hospitals(hospital_id),
  hospital_patient_id VARCHAR(128) NOT NULL,
  linked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  verified BOOLEAN NOT NULL DEFAULT false,
  verification_method VARCHAR(50) DEFAULT 'hospital_verification',
  encrypted_pii BYTEA,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  CHECK (status IN ('active', 'disconnected', 'deleted')),
  UNIQUE (upi, hospital_id)
);

-- Create indexes
CREATE INDEX idx_linkages_upi ON hospital_linkages(upi);
CREATE INDEX idx_linkages_hospital_id ON hospital_linkages(hospital_id);
CREATE INDEX idx_linkages_hospital_patient_id ON hospital_linkages(hospital_patient_id);
```

### 5. Row-Level Security (Optional but Recommended)

```sql
-- Enable RLS on patient_identities
ALTER TABLE patient_identities ENABLE ROW LEVEL SECURITY;

-- Policy: Patients can only see their own data
CREATE POLICY patient_own_data ON patient_identities
  FOR SELECT
  USING (upi = current_setting('app.current_upi', true));

-- Similar policies for hospital_linkages
ALTER TABLE hospital_linkages ENABLE ROW LEVEL SECURITY;
```

### 6. Encryption Setup

```sql
-- Example: Encrypt PII column
-- Note: Application-level encryption is also recommended

-- Create function to encrypt
CREATE OR REPLACE FUNCTION encrypt_pii(data TEXT)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(data, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql;
```

## Code Changes Required

### 1. Update `src/db/database.js`

Replace SQLite connection with PostgreSQL:

```javascript
// OLD (SQLite)
import sqlite3 from 'sqlite3';
const db = new sqlite3.Database(DB_PATH);

// NEW (PostgreSQL)
import pg from 'pg';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});
```

### 2. Update Database Operations

The CRUD operations in `src/db/*.js` use a database-agnostic pattern, so minimal changes needed:

```javascript
// SQLite
const run = promisify(db.run.bind(db));

// PostgreSQL
const run = async (query, params) => {
  const result = await pool.query(query, params);
  return result;
};
```

### 3. Environment Variables

Update `.env`:

```env
# Development (SQLite)
DATABASE_PATH=./data/medipact.db

# Production (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/medipact
```

## Migration Script

When ready to migrate data from SQLite to PostgreSQL:

```javascript
// scripts/migrate-to-postgresql.js
import sqlite3 from 'sqlite3';
import pg from 'pg';

// Read from SQLite
const sqliteDb = new sqlite3.Database('./data/medipact.db');
const postgresPool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Migrate data
// (Implementation depends on data volume and requirements)
```

## Testing

### Development Testing
- ✅ SQLite: Fast, no setup required
- ✅ All tests pass with SQLite

### Production Testing
- [ ] PostgreSQL: Test with production-like data
- [ ] Performance testing with concurrent connections
- [ ] Security testing with RLS policies
- [ ] Encryption/decryption testing

## Performance Considerations

### SQLite Limitations
- Single writer at a time
- Limited to file I/O speed
- Not suitable for high concurrency

### PostgreSQL Advantages
- Multiple concurrent connections
- Better query optimization
- Indexing strategies
- Connection pooling

## Security Considerations

### SQLite
- Application-level encryption required
- File permissions must be secured
- Backup strategy needed

### PostgreSQL
- Built-in encryption (pgcrypto)
- Row-level security policies
- SSL/TLS connections
- Audit logging capabilities

## Timeline

- **Phase 1 (Current)**: SQLite for development ✅
- **Phase 2 (Before Production)**: PostgreSQL setup and testing
- **Phase 3 (Production)**: PostgreSQL deployment with migration

## Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [node-postgres (pg)](https://node-postgres.com/)
- [PostgreSQL Encryption](https://www.postgresql.org/docs/current/pgcrypto.html)
- [Row-Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)

## Questions?

For questions about the migration, refer to:
- `src/models/patient-identity-model.js` - Schema definition
- `src/db/database.js` - Database connection
- `src/db/*.js` - CRUD operations

