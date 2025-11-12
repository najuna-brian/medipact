# Lesson 22: Troubleshooting Guide

## Common Issues and Solutions

This lesson covers common problems you might encounter and how to solve them.

## Setup Issues

### Problem: Node.js Not Found

**Error**: `node: command not found`

**Solutions**:
```bash
# Check if Node.js is installed
which node

# If not found, install Node.js
# Visit: https://nodejs.org/
# Download and install LTS version

# Verify installation
node --version
# Should show: v18.x.x or higher
```

### Problem: npm Install Fails

**Error**: Network errors, timeouts, or permission errors

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install

# If permission errors, fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH

# Then try again
npm install
```

### Problem: Git Not Found

**Error**: `git: command not found`

**Solutions**:
```bash
# macOS (Homebrew)
brew install git

# Linux (Ubuntu/Debian)
sudo apt install git

# Windows
# Download from: https://git-scm.com/

# Verify
git --version
```

## Configuration Issues

### Problem: Missing Environment Variables

**Error**: `OPERATOR_ID, HEDERA_NETWORK, and OPERATOR_KEY are required`

**Solutions**:
```bash
# Check .env file exists
ls -la adapter/.env

# If missing, create it
cd adapter
cp ../env.example .env

# Edit .env file
code .env
# Or: nano .env

# Add required variables:
# OPERATOR_ID="0.0.xxxxx"
# OPERATOR_KEY="0x..."
# HEDERA_NETWORK="testnet"
```

### Problem: Wrong Network

**Error**: Can't connect to network

**Solutions**:
```bash
# Check .env file
cat adapter/.env | grep HEDERA_NETWORK

# Should be: HEDERA_NETWORK="testnet"
# NOT: HEDERA_NETWORK="mainnet"

# Fix if wrong
# Edit .env and change to "testnet"
```

### Problem: Invalid Credentials

**Error**: Authentication failed

**Solutions**:
```bash
# Verify Account ID format
# Should be: 0.0.xxxxx

# Verify Private Key format
# Should be: 0x followed by hex string
# Example: 0x1234567890abcdef...

# Check for extra spaces or quotes
# In .env file, should be:
# OPERATOR_ID="0.0.1234567"
# OPERATOR_KEY="0x1234567890abcdef..."

# No spaces around = sign
```

## Hedera Connection Issues

### Problem: Insufficient HBAR Balance

**Error**: `INSUFFICIENT_PAYER_BALANCE` or transaction fails

**Solutions**:
```bash
# Check balance on HashScan
# Visit: https://hashscan.io/testnet
# Search for your Account ID

# Get more HBAR from faucet
# Visit: https://portal.hedera.com/faucet
# Enter Account ID and request HBAR

# Minimum needed: ~10 HBAR for testing
```

### Problem: Network Connection Failed

**Error**: Can't connect to Hedera network

**Solutions**:
```bash
# Check internet connection
ping google.com

# Check network setting in .env
cat adapter/.env | grep HEDERA_NETWORK
# Should be: HEDERA_NETWORK="testnet"

# Try test connection
cd adapter
npm run test:hcs

# If still fails, check Hedera status
# Visit: https://status.hedera.com/
```

### Problem: Transaction Timeout

**Error**: Transaction takes too long or times out

**Solutions**:
```bash
# Wait a bit longer (network may be slow)
# Transactions usually complete in 2-5 seconds

# Check network status
# Visit: https://status.hedera.com/

# Verify account has HBAR
# Low balance can cause delays

# Try again - sometimes network is temporarily slow
```

## Data Processing Issues

### Problem: File Not Found

**Error**: `Error: ENOENT: no such file or directory`

**Solutions**:
```bash
# Check you're in correct directory
pwd
# Should be: .../medipact/adapter

# Check file exists
ls data/raw_data.csv

# If missing, check file path
# Default: adapter/data/raw_data.csv

# Or specify custom path:
export INPUT_FILE=./path/to/your/file.csv
npm start
```

### Problem: CSV Parse Error

**Error**: `Error parsing CSV` or malformed data

**Solutions**:
```bash
# Check CSV format
head -n 3 data/raw_data.csv

# Should have:
# - Header row with column names
# - Data rows with matching columns
# - Proper comma separation

# Check for special characters
# Remove any unusual characters
# Ensure proper encoding (UTF-8)

# Verify CSV is valid
# Try opening in spreadsheet software
```

### Problem: Empty Output File

**Error**: Output file created but empty

**Solutions**:
```bash
# Check input file has data
wc -l data/raw_data.csv
# Should show more than 1 line (header + data)

# Check for errors in console
# Look for error messages during processing

# Verify anonymization worked
# Check console output for "Anonymized X records"

# Check file permissions
ls -la data/anonymized_data.csv
```

## Anonymization Issues

### Problem: PII Still in Output

**Error**: Output contains names or IDs

**Solutions**:
```bash
# Check anonymization worked
grep -i "john\|jane\|ID-" data/anonymized_data.csv
# Should find nothing

# Verify anonymization function
# Check adapter/src/anonymizer/anonymize.js

# Run validation
npm run validate

# Check for custom fields
# May need to add to anonymization list
```

### Problem: Medical Data Missing

**Error**: Output missing lab test results

**Solutions**:
```bash
# Check input file has medical data
head -n 2 data/raw_data.csv

# Verify column names
# Should include: Lab Test, Result, Unit, etc.

# Check anonymization preserves medical fields
# Medical data should NOT be removed

# Review anonymization logic
# Medical fields should be preserved
```

## Blockchain Issues

### Problem: Topic Creation Fails

**Error**: `Failed to create topic`

**Solutions**:
```bash
# Check account has HBAR
# Visit HashScan and check balance

# Verify network is correct
# Should be testnet for development

# Check account credentials
# Verify OPERATOR_ID and OPERATOR_KEY are correct

# Try again - sometimes network issues
```

### Problem: Message Submission Fails

**Error**: `Failed to submit message`

**Solutions**:
```bash
# Check topic ID is correct
# Should be format: 0.0.xxxxx

# Verify account has HBAR
# Each message costs a small fee

# Check message content
# Should be a hash (hex string)

# Verify network connectivity
# Try test connection: npm run test:hcs
```

### Problem: HashScan Links Don't Work

**Error**: Link shows "Transaction not found"

**Solutions**:
```bash
# Wait a few seconds
# Transactions may take time to index

# Check network (testnet vs mainnet)
# Link should match network in .env

# Verify transaction ID format
# Should be: 0.0.xxxxx@timestamp.sequence

# Check if transaction actually succeeded
# Look for error messages in console
```

## Smart Contract Issues

### Problem: Contract Deployment Fails

**Error**: Deployment error or gas issues

**Solutions**:
```bash
# Check account has enough HBAR
# Deployment costs HBAR

# Verify gas price setting
# Check contracts/hardhat.config.js
# Should be: gasPrice: 500000000000

# Check network configuration
# Verify RPC URL is correct

# Review deployment script
# Check contracts/scripts/deploy.js
```

### Problem: Contract Call Fails

**Error**: Contract execution fails

**Solutions**:
```bash
# Verify contract is deployed
# Check contract address in .env

# Check contract address format
# Should be: 0x... (EVM address)

# Verify account has HBAR for gas
# Contract calls cost gas

# Check function parameters
# Verify all required parameters provided
```

## Validation Issues

### Problem: Validation Fails

**Error**: Output validation shows errors

**Solutions**:
```bash
# Run validation to see specific errors
npm run validate

# Check each validation check:
# - File exists
# - No PII detected
# - Anonymous IDs formatted correctly
# - Medical data preserved
# - Record count matches

# Fix issues based on error messages
# Re-run adapter if needed
```

## Performance Issues

### Problem: Adapter Runs Slowly

**Error**: Takes too long to process

**Solutions**:
```bash
# Check number of records
# More records = longer processing

# Check network speed
# Blockchain transactions take time

# Consider batching
# Process in smaller batches

# Check for errors
# Errors can slow down processing
```

## Getting Help

### Check Documentation

1. **Tutorial**: Review relevant lesson
2. **README**: Check project README
3. **Error Messages**: Read error details
4. **Logs**: Check console output

### Debug Steps

1. **Verify Setup**: Check all prerequisites
2. **Check Configuration**: Verify .env file
3. **Test Connection**: Run `npm run test:hcs`
4. **Check Logs**: Review console output
5. **Verify Data**: Check input files

### Community Resources

- **GitHub Issues**: Report bugs
- **Hedera Discord**: Ask Hedera questions
- **Documentation**: Read official docs
- **Examples**: Check Hedera examples

## Prevention Tips

### Before Running

- ✅ Verify Node.js version (18+)
- ✅ Check all dependencies installed
- ✅ Verify .env file configured
- ✅ Check account has HBAR
- ✅ Verify input files exist

### During Development

- ✅ Test frequently
- ✅ Check console output
- ✅ Verify transactions on HashScan
- ✅ Keep .env file secure
- ✅ Backup important data

### Best Practices

- ✅ Use testnet for development
- ✅ Keep credentials secure
- ✅ Test with small datasets first
- ✅ Verify output before sharing
- ✅ Document any custom changes

## Key Takeaways

- **Common Issues**: Setup, configuration, connection, data
- **Solutions**: Step-by-step fixes for each issue
- **Prevention**: Best practices to avoid problems
- **Help**: Where to get assistance

## Next Steps

If you've resolved your issue:

- Continue with the tutorial
- Try running the demo again
- Experiment with customization

If you still have issues:

- Check GitHub Issues
- Ask in Hedera Discord
- Review documentation

---

**Troubleshooting Summary:**
- Check setup and configuration
- Verify Hedera connection
- Validate data files
- Check blockchain transactions
- Review error messages carefully

