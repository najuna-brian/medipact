#!/bin/bash

# Setup Git Hooks for MediPact
# This script can be used to set up any git hooks if needed in the future

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

# Check if we're in a git repository
if [ ! -d "$PROJECT_ROOT/.git" ]; then
  echo "❌ Error: Not a git repository"
  exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p "$HOOKS_DIR"

echo "✅ Git hooks directory ready"
echo ""
echo "📋 You can now push directly to main branch if needed"
echo "   git push origin main"

