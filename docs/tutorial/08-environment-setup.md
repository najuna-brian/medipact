# Lesson 8: Environment Setup

## Prerequisites Installation

This lesson guides you through setting up your development environment to work with MediPact.

## What You'll Need

### Required Software

1. **Node.js** (version 18 or higher)
2. **npm** (comes with Node.js)
3. **Git** (for cloning the repository)
4. **Text Editor** (VS Code recommended)
5. **Terminal/Command Line** access

### Optional but Recommended

6. **VS Code** with extensions
7. **GitHub account** (for cloning)
8. **Hedera Portal account** (for testnet access)

## Step 1: Install Node.js

### Check if Already Installed

```bash
node --version
npm --version
```

If you see version numbers (e.g., `v20.10.0`), you're good! Skip to Step 2.

### Installation Methods

#### Option A: Official Website (Recommended)

1. Visit: https://nodejs.org/
2. Download **LTS version** (Long Term Support)
3. Run installer
4. Follow installation wizard
5. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### Option B: Package Manager

**macOS (Homebrew)**:
```bash
brew install node
```

**Linux (Ubuntu/Debian)**:
```bash
sudo apt update
sudo apt install nodejs npm
```

**Windows (Chocolatey)**:
```bash
choco install nodejs
```

### Verify Installation

```bash
# Should show version 18.x or higher
node --version

# Should show version 9.x or higher
npm --version
```

✅ **Checkpoint**: Node.js and npm are installed

## Step 2: Install Git

### Check if Already Installed

```bash
git --version
```

If you see a version number, you're good! Skip to Step 3.

### Installation

**macOS**: Usually pre-installed. If not:
```bash
brew install git
```

**Linux**:
```bash
sudo apt install git
```

**Windows**: Download from https://git-scm.com/

### Configure Git (First Time)

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

✅ **Checkpoint**: Git is installed and configured

## Step 3: Install VS Code (Recommended)

### Why VS Code?

- Great JavaScript support
- Integrated terminal
- Git integration
- Extensions for development

### Installation

1. Visit: https://code.visualstudio.com/
2. Download for your OS
3. Install
4. Open VS Code

### Recommended Extensions

Install these in VS Code:

1. **ESLint** - JavaScript linting
2. **Prettier** - Code formatting
3. **GitLens** - Git integration
4. **JavaScript (ES6)** - Syntax highlighting

**How to install**:
1. Open VS Code
2. Click Extensions icon (left sidebar)
3. Search for extension name
4. Click Install

✅ **Checkpoint**: VS Code is installed with extensions

## Step 4: Verify Your Setup

### Create Test Directory

```bash
# Create a test directory
mkdir medipact-test
cd medipact-test

# Create a test file
echo "console.log('Hello MediPact!');" > test.js

# Run it
node test.js
```

**Expected output**: `Hello MediPact!`

### Test npm

```bash
# Initialize npm project
npm init -y

# Install a test package
npm install dotenv

# Check it installed
ls node_modules
```

✅ **Checkpoint**: npm is working

### Test Git

```bash
# Initialize git repo
git init

# Check status
git status
```

✅ **Checkpoint**: Git is working

## Step 5: System Requirements Check

### Check Available Space

You'll need at least:
- **500 MB** for Node.js and dependencies
- **100 MB** for project files
- **1 GB** free space recommended

**Check space**:
```bash
# macOS/Linux
df -h

# Windows
dir
```

### Check Internet Connection

You'll need internet for:
- Installing packages (npm)
- Connecting to Hedera testnet
- Cloning repository

**Test connection**:
```bash
# macOS/Linux
ping google.com

# Windows
ping google.com
```

## Step 6: Terminal Setup

### macOS/Linux

Use **Terminal** app (built-in)

**Tips**:
- `cd` - Change directory
- `ls` - List files
- `pwd` - Show current directory
- `mkdir` - Create directory
- `rm` - Remove file

### Windows

Use **PowerShell** or **Command Prompt**

**Tips**:
- `cd` - Change directory
- `dir` - List files
- `cd` - Show current directory
- `mkdir` - Create directory
- `del` - Remove file

### VS Code Integrated Terminal

1. Open VS Code
2. Press `` Ctrl+` `` (backtick) or `View → Terminal`
3. Terminal opens at bottom
4. Works in any directory you open

## Step 7: Environment Variables Setup

### Understanding .env Files

Environment variables store sensitive configuration:
- API keys
- Account IDs
- Private keys
- Network settings

### Create .env Template

We'll create this in the next lesson, but here's what it looks like:

```env
# Hedera Configuration
OPERATOR_ID="0.0.xxxxx"
OPERATOR_KEY="0x..."
HEDERA_NETWORK="testnet"

# Optional: Smart Contracts
CONSENT_MANAGER_ADDRESS="0x..."
REVENUE_SPLITTER_ADDRESS="0x..."

# Optional: Currency
LOCAL_CURRENCY_CODE="UGX"
USD_TO_LOCAL_RATE="3700"
```

⚠️ **Important**: Never commit `.env` files to Git!

## Troubleshooting

### Node.js Issues

**Problem**: `node: command not found`
**Solution**: 
- Add Node.js to PATH
- Restart terminal
- Reinstall Node.js

**Problem**: Wrong Node.js version
**Solution**:
- Install Node.js 18+ from official website
- Or use `nvm` (Node Version Manager)

### npm Issues

**Problem**: `npm: command not found`
**Solution**: npm comes with Node.js, reinstall Node.js

**Problem**: Permission errors
**Solution**:
```bash
# Don't use sudo with npm
# Instead, fix npm permissions:
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
```

### Git Issues

**Problem**: `git: command not found`
**Solution**: Install Git from https://git-scm.com/

**Problem**: Authentication errors
**Solution**: Set up SSH keys or use HTTPS

## Verification Checklist

Before moving to the next lesson, verify:

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm 9+ installed (`npm --version`)
- [ ] Git installed (`git --version`)
- [ ] VS Code installed (optional but recommended)
- [ ] Terminal/Command line working
- [ ] Internet connection working
- [ ] Can create and run test files

## Next Steps

Once your environment is set up:

- **Next Lesson**: [Project Setup](./09-project-setup.md) - Cloning and configuring the project

---

**Key Takeaways:**
- Node.js 18+ and npm required
- Git for version control
- VS Code recommended for development
- Terminal access essential
- Internet connection needed

**Common Issues:**
- Wrong Node.js version → Install 18+
- Permission errors → Fix npm permissions
- Git not found → Install Git

