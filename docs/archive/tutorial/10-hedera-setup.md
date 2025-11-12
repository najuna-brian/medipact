# Lesson 10: Hedera Account Setup

## Creating and Funding Your Testnet Account

This lesson guides you through creating a Hedera testnet account and getting it ready for MediPact.

## Why Hedera Testnet?

### Benefits of Testnet

- ✅ **Free**: No cost to use
- ✅ **Real Network**: Same as mainnet, just free
- ✅ **Safe**: Can't lose real money
- ✅ **Unlimited**: Get free HBAR anytime
- ✅ **Full Features**: All Hedera services available

### Testnet vs Mainnet

| Feature | Testnet | Mainnet |
|---------|---------|---------|
| **Cost** | Free | Real HBAR |
| **HBAR** | Free from faucet | Must purchase |
| **Purpose** | Development/Testing | Production |
| **Network** | testnet | mainnet |

## Step 1: Create Hedera Portal Account

### Visit Hedera Portal

1. Go to: https://portal.hedera.com/
2. Click **"Sign Up"** or **"Get Started"**
3. Create account with email
4. Verify email address

### Login

1. Go to: https://portal.hedera.com/dashboard
2. Login with your credentials
3. You'll see the dashboard

✅ **Checkpoint**: Portal account created

## Step 2: Create Testnet Account

### Navigate to Accounts

1. In dashboard, click **"Accounts"** or **"Create Account"**
2. Select **"Testnet"** network
3. Click **"Create Account"**

### Save Your Credentials

**You'll receive**:
- **Account ID**: Format `0.0.xxxxx`
- **Private Key**: Format `0x...` (hex string)
- **Public Key**: Format `0x...` (hex string)

⚠️ **CRITICAL**: Save these immediately!

**Save to secure location**:
- Password manager
- Encrypted file
- Secure note app

**Never**:
- Share publicly
- Commit to Git
- Email unencrypted

✅ **Checkpoint**: Testnet account created, credentials saved

## Step 3: Fund Your Account

### Get Free HBAR from Faucet

1. In dashboard, find your account
2. Click **"Get Test HBAR"** or **"Faucet"**
3. Enter your Account ID
4. Click **"Request"**

### Alternative: Hedera Faucet

1. Visit: https://portal.hedera.com/faucet
2. Enter your Account ID (`0.0.xxxxx`)
3. Complete captcha
4. Click **"Request"**

### Verify Balance

1. Go to dashboard
2. Find your account
3. Check balance

**Minimum needed**: ~10 HBAR for testing

**You can request**:
- Up to 10,000 HBAR per request
- Multiple requests allowed
- Usually instant

✅ **Checkpoint**: Account funded with HBAR

## Step 4: Configure MediPact

### Update .env File

Navigate to adapter directory:

```bash
cd medipact/adapter
```

Edit `.env` file:

```env
# Hedera Configuration
OPERATOR_ID="0.0.xxxxx"        # Your Account ID
OPERATOR_KEY="0x..."           # Your Private Key (full hex string)
HEDERA_NETWORK="testnet"       # Network name
```

### Verify Configuration

```bash
# Check .env file (don't show values!)
grep -E "OPERATOR_ID|OPERATOR_KEY|HEDERA_NETWORK" .env

# Should show variable names (values hidden)
```

### Test Connection

```bash
# Test HCS connection
npm run test:hcs
```

**Expected output**:
```
Creating test topic...
Topic created: 0.0.xxxxx
Submitting test message...
Message submitted successfully!
Transaction ID: 0.0.xxxxx@1234567890.123456789
HashScan: https://hashscan.io/testnet/transaction/...
✅ HCS test successful!
```

✅ **Checkpoint**: Connection to Hedera working

## Step 5: Understand Your Credentials

### Account ID

**Format**: `0.0.xxxxx`

**Example**: `0.0.1234567`

**What it is**:
- Your account identifier
- Public (can be shared)
- Used to receive HBAR
- Visible on HashScan

### Private Key

**Format**: `0x` followed by hex string

**Example**: `0x1234567890abcdef...`

**What it is**:
- Secret key (never share!)
- Used to sign transactions
- Proves you own the account
- Required for all operations

### Public Key

**Format**: `0x` followed by hex string

**What it is**:
- Derived from private key
- Can be shared
- Used to verify signatures
- Not needed for MediPact

## Step 6: Security Best Practices

### Protect Your Private Key

✅ **Do**:
- Store in password manager
- Use encrypted files
- Never share publicly
- Backup securely

❌ **Don't**:
- Commit to Git
- Share in chat/email
- Store in plain text
- Leave in screenshots

### .env File Security

```bash
# Ensure .env is in .gitignore
grep .env .gitignore

# Should show: .env

# Check .env permissions (Linux/Mac)
ls -la .env
# Should show: -rw------- (read/write for owner only)
```

### Backup Credentials

**Store securely**:
1. Password manager entry
2. Encrypted file (with password)
3. Secure note app
4. Physical backup (locked safe)

**Include**:
- Account ID
- Private Key
- Public Key (optional)
- Network (testnet)

## Step 7: Verify Account on HashScan

### View Your Account

1. Go to: https://hashscan.io/testnet
2. Search for your Account ID
3. View account details

**You'll see**:
- Account balance
- Transaction history
- Account info
- Recent activity

### Test Transaction

After running `npm run test:hcs`, you should see:
- Transaction on HashScan
- Topic created
- Message submitted

✅ **Checkpoint**: Account visible on HashScan

## Troubleshooting

### Can't Create Account

**Problem**: Portal errors

**Solutions**:
- Try different browser
- Clear cache/cookies
- Check internet connection
- Try again later

### Can't Get HBAR

**Problem**: Faucet not working

**Solutions**:
- Wait a few minutes, try again
- Check account ID is correct
- Try different faucet
- Contact Hedera support

### Connection Fails

**Problem**: Can't connect to testnet

**Solutions**:
```bash
# Check .env file
cat .env

# Verify network name
# Should be: HEDERA_NETWORK="testnet"

# Check account has HBAR
# Visit HashScan and search Account ID
```

### Wrong Network

**Problem**: Using mainnet instead of testnet

**Solutions**:
```env
# In .env file, ensure:
HEDERA_NETWORK="testnet"
# NOT "mainnet"
```

## Account Setup Checklist

Before running MediPact, verify:

- [ ] Hedera Portal account created
- [ ] Testnet account created
- [ ] Account ID saved securely
- [ ] Private Key saved securely
- [ ] Account funded with HBAR (10+ HBAR)
- [ ] `.env` file configured
- [ ] Connection test successful
- [ ] Account visible on HashScan

## Understanding Costs

### Testnet Costs (Free)

- **Account creation**: Free
- **HBAR**: Free from faucet
- **Transactions**: Free
- **Topics**: Free
- **Smart contracts**: Free

### Mainnet Costs (Real Money)

- **Account creation**: ~$1 USD
- **HBAR**: Must purchase
- **Transactions**: ~$0.0001 USD each
- **Topics**: ~$0.01 USD
- **Smart contracts**: Gas fees apply

**For development**: Always use testnet!

## Next Steps

Now that your Hedera account is set up:

- **Next Lesson**: [Data Flow Overview](./11-data-flow.md) - How data moves through the system

---

**Key Takeaways:**
- Create free testnet account on Hedera Portal
- Get free HBAR from faucet
- Save credentials securely
- Configure `.env` file
- Test connection works
- Use testnet for development

**Security Reminders:**
- Never share private key
- Don't commit `.env` to Git
- Backup credentials securely
- Use testnet for testing

