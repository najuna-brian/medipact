#!/bin/bash
# Script to check which branches are merged into main

cd /home/najuna/medipact-workspace/medipact/frontend

echo "Fetching latest from origin..."
git fetch origin

echo ""
echo "=== Checking merge status ==="
echo ""

NOT_MERGED=()
MERGED=()

for branch in $(git branch -r | grep "origin/feature/" | grep -v "HEAD" | sed 's|origin/||' | sort); do
    if [ -n "$(git log --oneline main..origin/$branch 2>/dev/null)" ]; then
        echo "❌ $branch - NOT merged"
        NOT_MERGED+=("$branch")
    else
        echo "✅ $branch - Already merged"
        MERGED+=("$branch")
    fi
done

echo ""
echo "=== Summary ==="
echo "Merged: ${#MERGED[@]} branches"
echo "Not merged: ${#NOT_MERGED[@]} branches"
echo ""
echo "=== Branches that need PRs ==="
for branch in "${NOT_MERGED[@]}"; do
    echo "  - $branch"
    echo "    PR Link: https://github.com/najuna-brian/medipact/compare/main...$branch"
done

