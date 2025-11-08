# End-to-End Testing Guide

This guide covers the comprehensive test suite for the MediPact frontend application.

## Test Structure

```
src/test/
├── setup.ts                    # Test configuration and setup
├── utils/
│   └── test-helpers.ts         # Test utilities and helpers
├── api/                        # API route tests
│   ├── adapter-process.test.ts
│   ├── adapter-status.test.ts
│   └── adapter-results.test.ts
├── integration/                # Integration tests
│   ├── file-upload.test.ts
│   └── hedera-integration.test.ts
└── error-scenarios.test.ts     # Error handling tests
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with UI
```bash
npm run test:ui
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Specific Test File
```bash
npm test adapter-process.test.ts
```

### Run Tests Matching a Pattern
```bash
npm test -- -t "file upload"
```

## Test Categories

### 1. API Route Tests

Tests for Next.js API routes that handle:
- File upload and processing (`/api/adapter/process`)
- Processing status checks (`/api/adapter/status`)
- Result retrieval (`/api/adapter/results`)
- Hedera transaction fetching (`/api/hedera/transactions`)
- Topic information (`/api/hedera/topics`)

**Key Test Cases:**
- ✅ Successful file processing
- ✅ Missing file validation
- ✅ Processing failures
- ✅ Revenue calculation
- ✅ Error handling and cleanup

### 2. Integration Tests

End-to-end tests for complete workflows:
- File upload flow
- Hedera integration
- Data processing pipeline

**Key Test Cases:**
- ✅ Complete upload and processing flow
- ✅ File validation
- ✅ Concurrent uploads
- ✅ Transaction retrieval
- ✅ Topic information fetching

### 3. Error Scenario Tests

Comprehensive error handling tests:
- Network failures
- Invalid API responses
- Missing data
- Timeout scenarios
- Invalid user inputs
- File system errors

**Key Test Cases:**
- ✅ Network timeout handling
- ✅ Connection refused errors
- ✅ Malformed JSON responses
- ✅ Missing environment variables
- ✅ Processing timeouts
- ✅ Invalid file types
- ✅ File permission errors

## Test Utilities

### `test-helpers.ts`

Provides helper functions for:
- Creating mock requests
- Generating sample CSV files
- Creating File objects
- Mocking Hedera responses
- Cleanup utilities

**Example Usage:**
```typescript
import { createSampleCSV, createFileFromPath } from '../utils/test-helpers';

// Create a sample CSV file
const csvPath = await createSampleCSV([
  { 'Patient ID': 'P001', 'Name': 'John Doe', 'Age': '35' }
]);

// Create a File object
const file = await createFileFromPath(csvPath, 'test.csv');
```

## Writing New Tests

### API Route Test Template

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { POST } from '@/app/api/your-route/route';
import { NextRequest } from 'next/server';

describe('POST /api/your-route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle successful requests', async () => {
    const request = new NextRequest('http://localhost:3000/api/your-route', {
      method: 'POST',
      body: JSON.stringify({ data: 'test' }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toBeDefined();
  });
});
```

### Integration Test Template

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cleanupTempFile } from '../utils/test-helpers';

describe('Integration: Your Feature', () => {
  let tempFiles: string[] = [];

  beforeEach(() => {
    tempFiles = [];
  });

  afterEach(async () => {
    for (const file of tempFiles) {
      await cleanupTempFile(file).catch(() => {});
    }
  });

  it('should handle complete workflow', async () => {
    // Test implementation
  });
});
```

## Test Coverage Goals

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 75%
- **Statements**: 80%

## Continuous Integration

Tests should be run:
- On every commit (unit tests)
- On pull requests (all tests)
- Before deployment (full test suite with coverage)

## Debugging Tests

### Run Single Test
```bash
npm test -- -t "should handle successful requests"
```

### Debug Mode
```bash
npm test -- --inspect-brk
```

### Verbose Output
```bash
npm test -- --reporter=verbose
```

## Common Issues

### Mock Not Working
- Ensure `vi.mock()` is called before imports
- Check that the module path is correct
- Verify the mock is in the correct scope

### Async Test Failures
- Use `await` for async operations
- Check for proper error handling
- Verify cleanup in `afterEach`

### File System Tests
- Always clean up temp files
- Use unique temp directories
- Handle permission errors gracefully

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up resources in `afterEach`
3. **Mocks**: Mock external dependencies (Hedera, file system)
4. **Assertions**: Use specific assertions, not just `toBeDefined()`
5. **Error Cases**: Test both success and failure scenarios
6. **Edge Cases**: Test empty files, large files, invalid inputs

## Next Steps

- [ ] Add component tests with React Testing Library
- [ ] Add E2E tests with Playwright or Cypress
- [ ] Add visual regression tests
- [ ] Add performance tests
- [ ] Set up CI/CD test pipeline

