# Branch Protection Setup

This document explains how to protect the `main` branch in your GitHub repository.

## 🛡️ GitHub Branch Protection Rules

To enable branch protection on GitHub:

1. Go to your repository: `https://github.com/najuna-brian/medipact`
2. Navigate to **Settings** → **Branches**
3. Under **Branch protection rules**, click **Add rule**
4. Configure the following:

### Branch Name Pattern
```
main
```

### Protection Settings

**Required:**
- ✅ **Require a pull request before merging**
  - Require approvals: `1` (or more)
  - Dismiss stale pull request approvals when new commits are pushed: ✅
  
- ✅ **Require status checks to pass before merging**
  - Require branches to be up to date before merging: ✅
  - (Leave CI checks empty for now since we're using local tests)

- ✅ **Require conversation resolution before merging**: ✅

**Optional but Recommended:**
- ✅ **Do not allow bypassing the above settings**
- ✅ **Include administrators**: ✅ (prevents accidental merges)
- ✅ **Restrict who can push to matching branches**: (None - use PR workflow)

### Result
- ✅ No direct pushes to `main`
- ✅ All changes must go through Pull Requests
- ✅ Code review required before merging
- ✅ Pre-push hook provides local warning

## 🔧 Local Pre-Push Hook

A pre-push hook is already installed in `.git/hooks/pre-push` that:
- Warns when attempting to push to `main`
- Provides guidance on using feature branches
- Blocks the push automatically

## 📋 Workflow

### Feature Development
```bash
# 1. Create feature branch
git checkout -b feature/your-feature-name

# 2. Make changes and commit
git add .
git commit -m "feat: Add your feature"

# 3. Push feature branch
git push origin feature/your-feature-name

# 4. Create Pull Request on GitHub
# 5. Get code review approval
# 6. Merge via Pull Request
```

### Hotfixes
```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-fix

# 2. Make fix and commit
git add .
git commit -m "fix: Critical bug fix"

# 3. Push and create PR
git push origin hotfix/critical-fix
```

## ✅ Benefits

- **Code Quality**: All code reviewed before merging
- **Collaboration**: Team members review changes
- **Safety**: Prevents accidental breaking changes to main
- **History**: Clean commit history via PR merge
- **Documentation**: PR descriptions document changes

## 🚨 Emergency Override

If you absolutely must push directly to main (emergency only):
- Temporarily disable branch protection in GitHub settings
- Make the push
- Re-enable branch protection immediately

**Note**: This should be extremely rare and only for critical emergencies.

