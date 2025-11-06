# Lesson 18: Verifying on HashScan

## How to Verify Transactions on Hedera Explorer

This lesson shows you how to use HashScan to verify that your transactions were recorded on the Hedera blockchain.

## What is HashScan?

**HashScan** is the official Hedera blockchain explorer. It's like a search engine for Hedera transactions, accounts, and topics.

### Features

- 🔍 **Search**: Find transactions, accounts, topics
- 📊 **Details**: View transaction information
- 🔗 **Links**: Shareable URLs
- ✅ **Verification**: Confirm transactions succeeded
- 📈 **History**: View transaction history

### Networks

- **Testnet**: https://hashscan.io/testnet
- **Mainnet**: https://hashscan.io/mainnet
- **Previewnet**: https://hashscan.io/previewnet

## Types of HashScan Links

### 1. Transaction Links

**Format**: `https://hashscan.io/testnet/transaction/{transactionId}`

**Example**: `https://hashscan.io/testnet/transaction/0.0.123456@1234567890.123456789`

**Shows**:
- Transaction status
- Timestamp
- Sender account
- Transaction type
- Message content (for HCS)
- Transaction fee

### 2. Topic Links

**Format**: `https://hashscan.io/testnet/topic/{topicId}`

**Example**: `https://hashscan.io/testnet/topic/0.0.123456`

**Shows**:
- All messages in topic
- Message history
- Transaction timeline
- Message content (hashes)
- Message count

### 3. Account Links

**Format**: `https://hashscan.io/testnet/account/{accountId}`

**Example**: `https://hashscan.io/testnet/account/0.0.1234567`

**Shows**:
- Account balance
- Transaction history
- Account details
- Recent activity

## Step 1: Get HashScan Links from Adapter

### After Running Adapter

When you run `npm start`, you'll see output like:

```
6. Processing consent proofs...
   ✓ Consent proof for ID-12345 (PID-001): https://hashscan.io/testnet/transaction/0.0.123456@1234567890.123456789
   ✓ Consent proof for ID-12346 (PID-002): https://hashscan.io/testnet/transaction/0.0.123457@1234567891.123456789

7. Processing data proofs...
   ✓ Data proof for PID-001: https://hashscan.io/testnet/transaction/0.0.123458@1234567892.123456789

HCS Topics:
  Consent Topic: https://hashscan.io/testnet/topic/0.0.123456
  Data Topic: https://hashscan.io/testnet/topic/0.0.123457
```

### Copy Links

1. **Copy transaction links** - One per consent/data proof
2. **Copy topic links** - One for consent topic, one for data topic
3. **Save for verification** - Keep for your records

## Step 2: Open Transaction Link

### Click or Paste Link

1. Copy a transaction link from adapter output
2. Paste in browser address bar
3. Press Enter

### What You'll See

**Transaction Page Shows**:

1. **Transaction ID**
   - Format: `0.0.xxxxx@timestamp.sequence`
   - Unique identifier

2. **Status**
   - ✅ **SUCCESS** - Transaction completed
   - ❌ **FAILED** - Transaction failed (check error)

3. **Timestamp**
   - When transaction was recorded
   - Precise to nanoseconds

4. **Type**
   - **TopicMessageSubmitTransaction** - HCS message
   - **TopicCreateTransaction** - Topic creation
   - **ContractExecuteTransaction** - Smart contract call
   - **TransferTransaction** - HBAR transfer

5. **From Account**
   - Your account ID (operator)
   - Who paid for transaction

6. **Transaction Fee**
   - Cost in HBAR
   - Usually very small (fractions of a cent)

7. **Message Content** (for HCS)
   - The hash that was submitted
   - Hex string format

### Example Transaction Page

```
Transaction ID: 0.0.123456@1234567890.123456789
Status: ✅ SUCCESS
Timestamp: 2024-01-15 10:30:45.123456789 UTC
Type: TopicMessageSubmitTransaction
From: 0.0.1234567
Fee: 0.0001 HBAR

Message:
a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
```

## Step 3: Open Topic Link

### Click or Paste Link

1. Copy a topic link from adapter output
2. Paste in browser
3. Press Enter

### What You'll See

**Topic Page Shows**:

1. **Topic ID**
   - Format: `0.0.xxxxx`
   - Unique topic identifier

2. **Message Count**
   - Total messages in topic
   - Increases as you add more

3. **Message List**
   - All messages in chronological order
   - Most recent first

4. **Each Message Shows**:
   - Transaction ID
   - Timestamp
   - Message content (hash)
   - Link to transaction

### Example Topic Page

```
Topic ID: 0.0.123456
Type: Consensus Message
Message Count: 5

Messages:
1. 2024-01-15 10:30:45 - a1b2c3d4e5f6... [View Transaction]
2. 2024-01-15 10:30:44 - f6e5d4c3b2a1... [View Transaction]
3. 2024-01-15 10:30:43 - 1234567890ab... [View Transaction]
...
```

## Step 4: Verify Consent Proofs

### Check Consent Topic

1. Open Consent Topic link
2. Verify message count matches patient count
3. Check each message is a consent hash
4. Verify timestamps are recent

### Check Individual Transactions

1. Click on each message
2. Verify status is SUCCESS
3. Check message content is a hash
4. Verify from account is yours

### What to Look For

✅ **Good Signs**:
- All transactions show SUCCESS
- Message count matches patient count
- Hashes are unique (different for each patient)
- Timestamps are recent

❌ **Warning Signs**:
- Any FAILED transactions
- Missing messages
- Duplicate hashes
- Old timestamps (if expecting new)

## Step 5: Verify Data Proofs

### Check Data Topic

1. Open Data Topic link
2. Verify message count matches record count
3. Check each message is a data hash
4. Verify timestamps are recent

### Check Individual Transactions

1. Click on each message
2. Verify status is SUCCESS
3. Check message content is a hash
4. Verify from account is yours

### What to Look For

✅ **Good Signs**:
- All transactions show SUCCESS
- Message count matches record count
- Hashes are unique (different for each record)
- Timestamps are recent

❌ **Warning Signs**:
- Any FAILED transactions
- Missing messages
- Duplicate hashes
- Old timestamps

## Step 6: Verify Smart Contract Transactions

### If You Deployed Contracts

1. Search for contract address on HashScan
2. View contract details
3. Check transaction history
4. Verify function calls

### ConsentManager Contract

**What to check**:
- Consent records created
- Function calls successful
- Events emitted
- Gas used

### RevenueSplitter Contract

**What to check**:
- Revenue received
- Distribution executed
- Payments sent
- Events emitted

## Step 7: Verify Account Activity

### View Your Account

1. Go to HashScan
2. Search for your Account ID
3. View account page

### What You'll See

- **Balance**: Current HBAR balance
- **Transactions**: All transactions from/to account
- **Topics**: Topics you created
- **Contracts**: Contracts you deployed

### Check Transaction History

1. Scroll through transactions
2. Verify recent transactions
3. Check transaction types
4. Confirm fees are reasonable

## Understanding Transaction IDs

### Format

```
0.0.xxxxx@timestamp.sequence
```

**Example**: `0.0.123456@1234567890.123456789`

**Parts**:
- `0.0.123456` - Account ID that created transaction
- `@` - Separator
- `1234567890` - Timestamp (seconds since epoch)
- `.` - Separator
- `123456789` - Sequence number (nanoseconds)

### Why It Matters

- **Unique**: Every transaction has unique ID
- **Verifiable**: Can look up on HashScan
- **Permanent**: Never changes
- **Traceable**: Can track transaction history

## Common Verification Tasks

### Verify All Transactions Succeeded

1. Get all transaction links from adapter output
2. Open each link
3. Check status is SUCCESS
4. Note any failures

### Verify Data Integrity

1. Get data hash from adapter output
2. Get hash from HashScan transaction
3. Compare - they should match
4. If different, data was altered

### Verify Consent Was Recorded

1. Check Consent Topic has messages
2. Count messages (should match patient count)
3. Verify each message is unique
4. Check timestamps are recent

### Verify Payout Was Executed

1. Check RevenueSplitter contract
2. View recent transactions
3. Verify HBAR was received
4. Check distribution events

## Troubleshooting

### Transaction Not Found

**Problem**: Link shows "Transaction not found"

**Solutions**:
- Wait a few seconds (may be processing)
- Check network (testnet vs mainnet)
- Verify transaction ID is correct
- Check if transaction actually succeeded

### Transaction Failed

**Problem**: Status shows FAILED

**Solutions**:
- Check error message on HashScan
- Verify account has enough HBAR
- Check network connectivity
- Verify credentials are correct

### Topic Empty

**Problem**: Topic shows no messages

**Solutions**:
- Check correct topic ID
- Verify transactions actually submitted
- Check network (testnet vs mainnet)
- Wait a few seconds for indexing

## Key Takeaways

- **HashScan**: Official Hedera explorer
- **Transaction Links**: Verify individual transactions
- **Topic Links**: View all messages in topic
- **Verification**: Check status, hashes, timestamps
- **Permanent**: All transactions permanently recorded

## Next Steps

Now that you can verify transactions:

- **Next Lesson**: [Testing Smart Contracts](./19-testing-contracts.md) - Deploying and testing contracts

---

**Verification Summary:**
- Use HashScan to verify transactions
- Check status is SUCCESS
- Verify hashes match
- Confirm all transactions recorded
- All permanently stored on blockchain

