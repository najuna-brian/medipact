#!/bin/bash
cd /home/najuna/medipact-workspace/medipact/frontend

echo "=== PROJECT STATUS ANALYSIS ==="
echo ""

# Current status
echo "📊 Current Status:"
echo "  Branch: $(git branch --show-current)"
echo "  Sync: $(git status -sb | head -1)"
echo ""

# Local branches
echo "📍 Local Branches:"
LOCAL_BRANCHES=($(git branch | sed 's/^[* ] //' | grep -v "main"))
if [ ${#LOCAL_BRANCHES[@]} -eq 0 ]; then
  echo "  None (only main)"
else
  for branch in "${LOCAL_BRANCHES[@]}"; do
    if git show-ref --verify --quiet refs/remotes/origin/$branch 2>/dev/null; then
      echo "  ✅ $branch (tracked on remote)"
    else
      echo "  📍 $branch (LOCAL ONLY - not pushed)"
    fi
  done
fi

echo ""

# Remote branches
echo "🌐 Remote Branches:"
REMOTE_BRANCHES=($(git branch -r | sed 's|origin/||' | grep -v "HEAD" | grep -v "main" | sort))
if [ ${#REMOTE_BRANCHES[@]} -eq 0 ]; then
  echo "  None (only main)"
else
  for branch in "${REMOTE_BRANCHES[@]}"; do
    if git show-ref --verify --quiet refs/heads/$branch 2>/dev/null; then
      echo "  ✅ $branch (exists locally)"
    else
      echo "  🌐 $branch (REMOTE ONLY - not local)"
    fi
  done
fi

echo ""

# Untracked files
echo "📁 Untracked Files:"
UNTRACKED=$(git status --short | grep "^??" | wc -l)
if [ $UNTRACKED -eq 0 ]; then
  echo "  ✅ No untracked files"
else
  echo "  ⚠️  $UNTRACKED untracked files:"
  git status --short | grep "^??" | head -10 | sed 's/^??/    /'
  if [ $UNTRACKED -gt 10 ]; then
    echo "    ... and $((UNTRACKED - 10)) more"
  fi
fi

echo ""

# Modified files
echo "📝 Modified Files:"
MODIFIED=$(git status --short | grep -v "^??" | wc -l)
if [ $MODIFIED -eq 0 ]; then
  echo "  ✅ No modified files"
else
  echo "  ⚠️  $MODIFIED modified files:"
  git status --short | grep -v "^??" | head -10 | sed 's/^/    /'
  if [ $MODIFIED -gt 10 ]; then
    echo "    ... and $((MODIFIED - 10)) more"
  fi
fi

echo ""
echo "=== RECOMMENDATIONS ==="
echo ""

# Local-only branches
LOCAL_ONLY=($(for branch in $(git branch | sed 's/^[* ] //' | grep -v "main"); do if ! git show-ref --verify --quiet refs/remotes/origin/$branch 2>/dev/null; then echo "$branch"; fi; done))
if [ ${#LOCAL_ONLY[@]} -gt 0 ]; then
  echo "📍 Local-only branches (keep for development):"
  for branch in "${LOCAL_ONLY[@]}"; do
    echo "  - $branch"
  done
  echo ""
fi

# Remote-only branches
REMOTE_ONLY=($(for branch in $(git branch -r | sed 's|origin/||' | grep -v "HEAD" | grep -v "main"); do if ! git show-ref --verify --quiet refs/heads/$branch 2>/dev/null; then echo "$branch"; fi; done))
if [ ${#REMOTE_ONLY[@]} -gt 0 ]; then
  echo "🌐 Remote-only branches (consider fetching or deleting):"
  for branch in "${REMOTE_ONLY[@]}"; do
    echo "  - $branch"
  done
  echo ""
fi

echo "✅ Project is clean and ready for development!"
