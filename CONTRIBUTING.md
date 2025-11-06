# Contributing to MediPact

Thank you for your interest in contributing to MediPact! This document outlines the development workflow and best practices.

## 🛡️ Branch Protection

The `main` branch is protected. **Direct pushes to `main` are not allowed.**

### Why?
- Ensures code quality through review
- Prevents accidental breaking changes
- Maintains clean commit history
- Enables collaboration and knowledge sharing

## 📋 Development Workflow

### 1. Create a Feature Branch

```bash
# Update your local main branch
git checkout main
git pull origin main

# Create a new feature branch
git checkout -b feature/your-feature-name
```

### Branch Naming Conventions

- **Features**: `feature/feature-name`
  - Example: `feature/add-user-authentication`
  
- **Bug Fixes**: `fix/bug-description`
  - Example: `fix/resolve-hcs-connection-issue`
  
- **Hotfixes**: `hotfix/critical-issue`
  - Example: `hotfix/security-patch`
  
- **Documentation**: `docs/topic`
  - Example: `docs/update-api-documentation`
  
- **Refactoring**: `refactor/component-name`
  - Example: `refactor/currency-utils`

### 2. Make Your Changes

```bash
# Make your code changes
# Test locally
npm test              # In contracts/
npm run validate      # In adapter/

# Stage your changes
git add .

# Commit with descriptive message
git commit -m "feat: Add new feature description"
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: Add revenue split calculation
fix: Resolve HCS topic creation error
docs: Update README with deployment steps
refactor: Simplify currency conversion logic
```

### 3. Push Your Branch

```bash
git push origin feature/your-feature-name
```

**Note**: If you try to push to `main`, the pre-push hook will block it and guide you.

### 4. Create a Pull Request

1. Go to: `https://github.com/najuna-brian/medipact`
2. Click **"New Pull Request"**
3. Select your feature branch
4. Fill out the PR template:
   - **Title**: Clear description
   - **Description**: What changes were made and why
   - **Testing**: How you tested the changes
   - **Checklist**: Review items

### 5. Code Review

- Wait for review approval
- Address any feedback
- Update PR if needed

### 6. Merge

Once approved:
- Merge via GitHub (squash merge recommended)
- Delete the feature branch after merge

## ✅ Pre-Push Checklist

Before pushing, ensure:

- [ ] Code compiles/works locally
- [ ] Tests pass (`npm test` in contracts/)
- [ ] Validation passes (`npm run validate` in adapter/)
- [ ] No sensitive data in commits (`.env` is gitignored)
- [ ] Commit messages follow conventions
- [ ] Branch name follows conventions

## 🧪 Testing

### Contracts
```bash
cd contracts
npm test
```

### Adapter
```bash
cd adapter
npm run validate
```

## 📝 Code Standards

- **JavaScript**: Follow ES6+ standards
- **Solidity**: Follow Solidity style guide
- **Comments**: Document complex logic
- **Naming**: Use descriptive, clear names
- **Formatting**: Consistent indentation and spacing

## 🐛 Reporting Issues

Use GitHub Issues to report:
- Bugs
- Feature requests
- Documentation improvements

Include:
- Clear description
- Steps to reproduce (for bugs)
- Expected vs actual behavior
- Environment details

## 💡 Questions?

- Check existing documentation
- Review existing code for patterns
- Ask in Pull Request comments

## 🙏 Thank You!

Your contributions help make MediPact better. We appreciate your time and effort!

