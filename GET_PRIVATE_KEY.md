# How to Get Your Private Key for Deployment

## The Issue

The mnemonic you provided derives an **ED25519** key, but Hardhat needs an **ECDSA** key (format: `0x...`).

## Solution: Use the Private Key from HashPack

You already exported the private key from HashPack earlier. **Use that one** - it's in the correct format.

### Steps:

1. **Open HashPack**
2. **Go to your account** (`0.0.10093707`)
3. **Click the menu** (three lines or profile icon)
4. **Go to Settings → Security**
5. **Click "View Private Key"**
6. **Enter your password**
7. **Copy the private key** (it starts with `0x...`)
8. **Update the `.env` file:**

```bash
cd /home/najuna/medipact-workspace/medipact/contracts
```

Edit `.env` and replace `OPERATOR_KEY_HEX` with your actual private key:

```env
OPERATOR_KEY_HEX="0x..."  # Paste your actual private key here
```

## Alternative: If You Can't Find It

If you can't find the exported key, you can:

1. **Re-export from HashPack:**
   - Settings → Security → View Private Key
   - Copy it

2. **Or use HashPack's account details:**
   - The private key should be visible when you click "View Private Key"

## Important

- The private key from HashPack is in **ECDSA format** (`0x...`) - this is what Hardhat needs
- The mnemonic-derived key is **ED25519 format** - this won't work with Hardhat directly
- **Never share your private key publicly**

## After You Update .env

Run the deployment:

```bash
cd /home/najuna/medipact-workspace/medipact/contracts
npm run deploy:mainnet
```



