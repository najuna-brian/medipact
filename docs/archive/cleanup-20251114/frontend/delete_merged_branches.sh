#!/bin/bash
# Script to delete merged branches

cd /home/najuna/medipact-workspace/medipact/frontend

echo "=== CONFIRMED MERGED BRANCHES ==="
echo ""

# Based on the merged PRs, these branches are confirmed merged:
MERGED_BRANCHES=(
  "feature/error-boundaries-loading-states"
  "feature/toast-notification-system"
  "feature/adapter-api-integration"
  "feature/hedera-mirror-node-integration"
  "feature/smart-contract-abis-integration"
  "feature/ui-components-fixes"
  "feature/core-pages-and-navigation"
  "feature/patient-portal-pages"
  "feature/hospital-portal-pages"
  "feature/researcher-portal-pages"
  "feature/admin-portal-pages"
  "feature/configuration-and-types"
  "feature/documentation-guides"
  "feature/remaining-components"
  "feature/missing-files-cleanup"
  "feature/pr-descriptions-doc"
  "feature/realtime-polling"
  "feature/add-branch-protection"
  "feature/add-comprehensive-tutorial"
  "feature/add-fhir-support"
  "feature/add-submission-materials"
  "feature/evm-integration"
)

echo "Branches to delete: ${#MERGED_BRANCHES[@]}"
echo ""

for branch in "${MERGED_BRANCHES[@]}"; do
  echo "Processing: $branch"
  
  # Delete local branch if it exists
  if git show-ref --verify --quiet refs/heads/$branch; then
    git branch -D $branch 2>/dev/null && echo "  ✅ Deleted local: $branch" || echo "  ⚠️  Could not delete local: $branch"
  else
    echo "  ℹ️  Local branch not found: $branch"
  fi
  
  # Delete remote branch
  if git show-ref --verify --quiet refs/remotes/origin/$branch; then
    git push origin --delete $branch 2>/dev/null && echo "  ✅ Deleted remote: $branch" || echo "  ⚠️  Could not delete remote: $branch"
  else
    echo "  ℹ️  Remote branch not found: $branch"
  fi
  
  echo ""
done

echo "=== COMPLETE ==="
