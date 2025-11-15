#!/bin/bash

# Run FHIR Complete Schema Migration
# This script migrates the database to support all FHIR R4 resources

set -e

echo "🚀 Running FHIR Complete Schema Migration"
echo "=========================================="
echo ""

# Check if we're in the backend directory
if [ ! -f "package.json" ]; then
    echo "Error: Must run from backend directory"
    exit 1
fi

# Run the migration script
echo "Running migration script..."
node scripts/migrate-fhir-complete-schema.js

echo ""
echo "✅ Migration complete!"
echo ""
echo "Next steps:"
echo "1. Verify tables were created: Check database for new FHIR tables"
echo "2. Test adapter: Run adapter to extract and store data"
echo "3. Verify data: Query database to confirm resources are stored"

