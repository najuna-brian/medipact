# Quick Test Guide

## Prerequisites

1. Backend server running: `cd backend && npm start`
2. Frontend server running: `cd frontend && npm run dev` (optional for API testing)

## Quick API Tests

### 1. Health Check
```bash
curl http://localhost:3002/health
```

### 2. Browse Datasets
```bash
curl http://localhost:3002/api/marketplace/datasets
```

### 3. Get Filter Options
```bash
curl http://localhost:3002/api/marketplace/filter-options
```

### 4. Test Query (Preview)
```bash
curl -X POST http://localhost:3002/api/marketplace/query \
  -H "Content-Type: application/json" \
  -H "x-researcher-id: RES-TEST001" \
  -d '{"country": "Uganda", "preview": true}'
```

## Automated Test Script

Run the test script:
```bash
cd backend
./scripts/test-endpoints.sh
```

## Frontend Testing

1. Start frontend: `cd frontend && npm run dev`
2. Navigate to: http://localhost:3000/researcher/catalog
3. Browse datasets (will show empty if no data yet)
4. Test search functionality

## Full Testing Guide

See `backend/TESTING_GUIDE.md` for comprehensive testing instructions.

## API Documentation

Interactive API docs: http://localhost:3002/api-docs

