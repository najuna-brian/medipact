# GitHub Actions Workflows

## CI Workflow

Standard continuous integration that runs on every push and pull request:

### Jobs

1. **Test Smart Contracts**
   - Compiles Solidity contracts
   - Runs full test suite (24 tests)

2. **Test Adapter**
   - Verifies all modules can be imported
   - Validates ESM module structure

### Features

- ✅ Automatic cancellation of outdated runs
- ✅ npm dependency caching for faster builds
- ✅ Node.js 20 LTS
- ✅ Runs on every push/PR to `main`

View runs: `https://github.com/[username]/medipact/actions`

