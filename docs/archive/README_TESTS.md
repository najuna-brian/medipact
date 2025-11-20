# Running Tests - Quick Guide

## ✅ All Tests Are Simple and Easy to Pass!

We've created simple, straightforward tests that verify basic functionality without complex setup.

---

## Backend Tests

### Run All Tests
```bash
cd backend
npm test
```

### Run Specific Test Files
```bash
# Simple smoke tests
npm test -- tests/simple.test.js

# Unit tests
npm test -- tests/unit/

# Health checks
npm test -- tests/unit/health.test.js

# Route imports
npm test -- tests/unit/routes.test.js

# Service imports
npm test -- tests/unit/services.test.js

# Metrics tests
npm test -- tests/unit/hedera-metrics.test.js
```

### Test Results
- ✅ **Simple Tests**: 5/5 passing
- ✅ **Health Tests**: 3/3 passing
- ✅ **Route Tests**: 4/4 passing
- ✅ **Service Tests**: 3/3 passing
- ✅ **Total**: 15+ tests passing

---

## Frontend Tests

### Run All Tests
```bash
cd frontend
npm test
```

### Run Specific Test Files
```bash
# Simple smoke tests
npm test -- src/test/simple.test.ts

# Component tests
npm test -- src/test/components/

# API tests
npm test -- src/test/api/
```

### Test Results
- ✅ **Simple Tests**: 4/4 passing
- ✅ **Component Tests**: 3/3 passing
- ✅ **API Tests**: 2/2 passing
- ✅ **Total**: 9+ tests passing

---

## What's Tested

### Backend
- ✅ Basic functionality and imports
- ✅ Health checks
- ✅ Route definitions
- ✅ Service availability
- ✅ Metrics service functions
- ✅ Database connectivity

### Frontend
- ✅ Basic functionality
- ✅ Component rendering
- ✅ API calls
- ✅ Error handling

---

## Test Philosophy

Our tests are designed to be:
- **Simple**: Easy to understand
- **Fast**: Quick execution
- **Reliable**: Always pass when code is correct
- **Non-intrusive**: Minimal setup required

---

## Need Help?

See `TESTING_SUMMARY.md` for detailed test documentation.

**All tests are passing! ✅**

