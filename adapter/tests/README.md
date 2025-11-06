# MediPact Adapter Test Suite

This directory contains comprehensive tests for the MediPact adapter using Vitest.

## Test Structure

```
tests/
├── unit/              # Unit tests for individual modules
│   ├── anonymize.test.js
│   ├── hash.test.js
│   ├── currency.test.js
│   ├── hcs-client.test.js
│   └── evm-client.test.js
├── integration/       # Integration tests for workflows
│   └── adapter-flow.test.js
├── utils/            # Test utilities and helpers
│   ├── test-helpers.js
│   └── mock-hedera.js
└── fixtures/         # Test data files
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Unit Tests Only
```bash
npm run test:unit
```

### Run Integration Tests Only
```bash
npm run test:integration
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with UI
```bash
npm run test:ui
```

### Generate Coverage Report
```bash
npm run test:coverage
```

Coverage reports are generated in the `coverage/` directory.

## Test Coverage Goals

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 75%
- **Statements**: 80%

## Writing Tests

### Unit Tests
Unit tests should:
- Test individual functions in isolation
- Use mocks for external dependencies (Hedera SDK)
- Be fast and deterministic
- Cover edge cases and error conditions

### Integration Tests
Integration tests should:
- Test complete workflows
- Verify data flows between modules
- Use real file I/O (with cleanup)
- Test error handling in realistic scenarios

### Test Utilities

#### `test-helpers.js`
- `createTempCSV()` - Create temporary CSV files for testing
- `cleanupTempFile()` - Clean up temporary files
- `createSampleRecords()` - Generate sample patient records
- `createSampleAnonymizedRecords()` - Generate anonymized records

#### `mock-hedera.js`
- `createMockClient()` - Mock Hedera client
- `createMockTransactionResponse()` - Mock transaction responses
- `createMockTopicCreateTransaction()` - Mock topic creation
- `createMockContractExecuteTransaction()` - Mock contract execution

## Best Practices

1. **Clean up resources**: Always clean up temporary files in `afterEach` hooks
2. **Use descriptive test names**: Test names should clearly describe what they test
3. **Test edge cases**: Include tests for empty inputs, null values, etc.
4. **Mock external dependencies**: Don't make real network calls in unit tests
5. **Keep tests independent**: Each test should be able to run in isolation
6. **Use fixtures**: Store test data in the `fixtures/` directory

## Continuous Integration

Tests are automatically run in CI/CD pipelines. All tests must pass before merging PRs.

## Troubleshooting

### Tests failing with "Cannot find module"
- Ensure all dependencies are installed: `npm install`
- Check that file paths are correct (use `import.meta.url` for ES modules)

### Mock issues
- Clear mocks between tests: `vi.clearAllMocks()` in `afterEach`
- Ensure mocks match the actual SDK structure

### Coverage not meeting thresholds
- Review uncovered lines in the coverage report
- Add tests for missing branches
- Consider if some code paths are unreachable



