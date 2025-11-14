# Hedera JavaScript SDK Information

## SDK Package

**Package Name**: `@hashgraph/sdk`  
**Version in package.json**: `^2.68.0`  
**Version Installed**: `2.76.0` (latest compatible)

## Installation

The SDK is installed via npm:

```bash
npm install --save @hashgraph/sdk
```

## Official Repository

**GitHub Repository**: https://github.com/hiero-ledger/hiero-sdk-js

> **Note**: The repository has been migrated to `hiero-ledger/hiero-sdk-js` (previously `hashgraph/hedera-sdk-js`). This is the official Hedera JavaScript SDK maintained by Hiero.

## NPM Package

**NPM Package**: https://www.npmjs.com/package/@hashgraph/sdk

## Usage in MediPact

### Import Location

The SDK is imported in `adapter/src/hedera/hcs-client.js`:

```javascript
import { 
  Client, 
  PrivateKey, 
  TopicCreateTransaction, 
  TopicMessageSubmitTransaction, 
  Status 
} from '@hashgraph/sdk';
```

### Used Components

1. **Client** - Main Hedera network client
2. **PrivateKey** - For signing transactions
3. **TopicCreateTransaction** - Creating HCS topics
4. **TopicMessageSubmitTransaction** - Submitting messages to HCS topics
5. **Status** - Transaction status checking

## Documentation

- **Official Hedera Docs**: https://docs.hedera.com/
- **SDK Documentation**: https://docs.hedera.com/sdks-and-apis/sdks
- **JavaScript SDK Guide**: https://docs.hedera.com/getting-started-hedera-native-developers

## Features Used

### HCS (Hedera Consensus Service)
- Topic creation
- Message submission
- Transaction status checking

### Network Configuration
- Testnet connection
- Account authentication
- Transaction execution

## Example Usage

```javascript
import { Client, PrivateKey, TopicCreateTransaction } from '@hashgraph/sdk';

// Initialize client
const client = Client.forTestnet();
client.setOperator(accountId, PrivateKey.fromStringECDSA(privateKey));

// Create topic
const txResponse = await new TopicCreateTransaction()
  .setTopicMemo('MediPact Topic')
  .execute(client);

const receipt = await txResponse.getReceipt(client);
const topicId = receipt.topicId;
```

## Version Compatibility

- **Node.js**: v18+ required
- **ES Modules**: Enabled (`"type": "module"` in package.json)
- **License**: Apache 2.0

## Related Files

- `adapter/package.json` - Package dependency definition
- `adapter/src/hedera/hcs-client.js` - SDK usage implementation
- `adapter/scripts/test-hcs.js` - SDK testing script

## Reference Resources

For detailed reference and examples:

- **SDK Repository**: https://github.com/hiero-ledger/hiero-sdk-js
- **SDK Examples**: https://github.com/hiero-ledger/hiero-sdk-js/tree/main/examples
- **SDK Source Code**: https://github.com/hiero-ledger/hiero-sdk-js/tree/main/src
- **Official Documentation**: https://docs.hedera.com/
- **HCS Documentation**: https://docs.hedera.com/getting-started-hedera-native-developers/create-a-topic
- **SDK Documentation**: https://docs.hedera.com/sdks-and-apis/sdks


