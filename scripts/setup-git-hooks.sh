#!/bin/bash

# Setup Git Hooks for MediPact
# This script installs the pre-push hook to protect the main branch

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
HOOK_FILE="$HOOKS_DIR/pre-push"
HOOK_TEMPLATE="$PROJECT_ROOT/.git/hooks/pre-push"

# Check if we're in a git repository
if [ ! -d "$PROJECT_ROOT/.git" ]; then
  echo "❌ Error: Not a git repository"
  exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

# Copy pre-push hook if it exists as template
if [ -f "$HOOK_TEMPLATE" ]; then
  cp "$HOOK_TEMPLATE" "$HOOK_FILE"
  chmod +x "$HOOK_FILE"
  echo "✅ Pre-push hook installed successfully"
  echo ""
  echo "🛡️  The main branch is now protected from direct pushes."
  echo "   Use feature branches and Pull Requests instead."
else
  echo "⚠️  Warning: Pre-push hook template not found"
  echo "   The hook should be at: $HOOK_TEMPLATE"
fi

echo ""
echo "📋 To test the hook, try:"
echo "   git push origin main"
echo "   (It should be blocked with a helpful message)"

