# Lesson 9: Project Setup

## Cloning and Configuring the Project

This lesson guides you through getting the MediPact project set up on your local machine.

## Step 1: Clone the Repository

### Using SSH (Recommended)

```bash
# Clone the repository
git clone git@github.com:najuna-brian/medipact.git

# Navigate into project
cd medipact
```

### Using HTTPS (Alternative)

```bash
# Clone the repository
git clone https://github.com/najuna-brian/medipact.git

# Navigate into project
cd medipact
```

### Verify Clone

```bash
# Check you're in the right directory
pwd
# Should show: .../medipact

# List files
ls
# Should see: adapter/, contracts/, docs/, README.md, etc.
```

✅ **Checkpoint**: Repository cloned successfully

## Step 2: Explore Project Structure

### Main Directories

```bash
# View project structure
tree -L 2
# Or if tree not installed:
ls -la
```

**Key directories**:
- `adapter/` - Core adapter engine
- `contracts/` - Smart contracts
- `docs/` - Documentation (including this tutorial!)
- `frontend/` - Frontend components (optional)
- `backend/` - Backend services (optional)

### Important Files

- `README.md` - Main project documentation
- `QUICK_START.md` - Quick setup guide
- `env.example` - Environment variable template
- `.gitignore` - Git ignore rules

✅ **Checkpoint**: Project structure understood

## Step 3: Install Adapter Dependencies

### Navigate to Adapter

```bash
cd adapter
```

### Install Dependencies

```bash
npm install
```

**What this does**:
- Reads `package.json`
- Downloads all required packages
- Installs into `node_modules/`
- Creates `package-lock.json`

**Expected output**:
```
added 150 packages, and audited 151 packages in 5s
```

**Time**: Usually 1-2 minutes

### Verify Installation

```bash
# Check node_modules exists
ls node_modules

# Check package.json
cat package.json
```

✅ **Checkpoint**: Adapter dependencies installed

## Step 4: Install Contract Dependencies

### Navigate to Contracts

```bash
cd ../contracts
```

### Install Dependencies

```bash
npm install
```

**What this does**:
- Installs Hardhat (development environment)
- Installs testing libraries
- Installs contract dependencies

**Expected output**:
```
added 200 packages, and audited 201 packages in 10s
```

**Time**: Usually 2-3 minutes

### Verify Installation

```bash
# Check Hardhat is installed
npx hardhat --version

# Should show: Hardhat version number
```

✅ **Checkpoint**: Contract dependencies installed

## Step 5: Set Up Environment Variables

### Navigate Back to Adapter

```bash
cd ../adapter
```

### Copy Environment Template

```bash
# Copy example file
cp ../env.example .env
```

### Edit .env File

Open `.env` in your text editor:

```bash
# Using VS Code
code .env

# Using nano (Linux/Mac)
nano .env

# Using vim
vim .env
```

### Required Variables

Add your Hedera credentials:

```env
# Hedera Configuration
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"
```

**Where to get these**:
- Visit: https://portal.hedera.com/dashboard
- Create testnet account (free)
- Copy Account ID and Private Key

⚠️ **Security**: Never commit `.env` file to Git!

### Verify .env File

```bash
# Check file exists
ls -la .env

# Verify it has content (don't show values!)
grep -E "OPERATOR_ID|OPERATOR_KEY|HEDERA_NETWORK" .env
```

✅ **Checkpoint**: Environment variables configured

## Step 6: Verify Setup

### Test Adapter Setup

```bash
# Check Node.js can find modules
node -e "console.log('Node.js working')"

# Check adapter can be imported (will show errors if missing deps)
node -e "import('./src/index.js').catch(e => console.log('Need to configure .env'))"
```

### Test Contract Setup

```bash
cd ../contracts

# Check Hardhat works
npx hardhat --help

# Should show Hardhat help menu
```

### Check File Structure

```bash
# From project root
cd ..

# Verify key files exist
ls adapter/data/raw_data.csv
ls adapter/src/index.js
ls contracts/contracts/ConsentManager.sol
ls contracts/contracts/RevenueSplitter.sol
```

✅ **Checkpoint**: All files in place

## Step 7: Optional - Set Up Git Hooks

### Install Pre-Push Hook

```bash
# From project root
cd ..

# Run setup script
bash scripts/setup-git-hooks.sh
```

**What this does**:
- Installs pre-push hook
- Prevents direct pushes to `main` branch
- Guides you to use Pull Requests

### Verify Hook

```bash
# Check hook exists
ls -la .git/hooks/pre-push

# Should show executable file
```

✅ **Checkpoint**: Git hooks installed (optional)

## Step 8: Verify Everything Works

### Quick Test Run

```bash
# Navigate to adapter
cd adapter

# Try to run (will fail without Hedera credentials, but tests setup)
node src/index.js 2>&1 | head -n 5
```

**Expected behavior**:
- If `.env` not configured: Error about missing variables
- If configured: Starts connecting to Hedera

**This is normal** - we'll configure Hedera in the next lesson!

## Troubleshooting

### npm install Fails

**Problem**: Network errors, timeouts

**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Try again
npm install

# Or use different registry
npm install --registry https://registry.npmjs.org/
```

### Permission Errors

**Problem**: "EACCES" or permission denied

**Solutions**:
```bash
# Don't use sudo with npm!
# Fix npm permissions instead:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
export PATH=~/.npm-global/bin:$PATH
```

### Missing Files

**Problem**: Files not found

**Solutions**:
- Verify you're in correct directory
- Check file paths are correct
- Ensure repository cloned completely

### .env File Issues

**Problem**: Can't find or edit .env

**Solutions**:
```bash
# Create from template
cp env.example adapter/.env

# Check it exists
ls adapter/.env

# Edit with your editor
code adapter/.env
```

## Setup Checklist

Before moving to the next lesson, verify:

- [ ] Repository cloned successfully
- [ ] Adapter dependencies installed (`npm install` in adapter/)
- [ ] Contract dependencies installed (`npm install` in contracts/)
- [ ] `.env` file created in adapter/
- [ ] Environment variables template copied
- [ ] Project structure understood
- [ ] All files in place

## Next Steps

Now that the project is set up:

- **Next Lesson**: [Hedera Account Setup](./10-hedera-setup.md) - Creating and funding your testnet account

---

**Key Takeaways:**
- Clone repository from GitHub
- Install dependencies in both adapter and contracts
- Create `.env` file from template
- Verify all files are in place
- Ready to configure Hedera account

**Common Issues:**
- npm install fails → Check network, clear cache
- Permission errors → Fix npm permissions
- Missing files → Verify clone completed

