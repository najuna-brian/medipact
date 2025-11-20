#!/bin/bash
cd /home/najuna/medipact-workspace/medipact/frontend

echo "=== COMPREHENSIVE FILE CHECK ==="
echo ""

MISSING=0
FOUND=0

# Check configuration
echo "📋 Configuration Files:"
CONFIG_FILES=("package.json" "tsconfig.json" "next.config.js" "tailwind.config.js" "postcss.config.js" ".eslintrc.json" ".prettierrc" ".gitignore")
for file in "${CONFIG_FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  ✅ $file"
    ((FOUND++))
  else
    echo "  ❌ $file - MISSING"
    ((MISSING++))
  fi
done

# Check components
echo ""
echo "🧩 Components:"
COMPONENTS=("ErrorBoundary/ErrorBoundary.tsx" "LoadingSkeleton/LoadingSkeleton.tsx" "Toast/Toast.tsx" "AdapterDemo/AdapterDemo.tsx" "ConsentForm/ConsentForm.tsx" "HashScanLink/HashScanLink.tsx" "ProcessingStatus/ProcessingStatus.tsx" "RevenueSplit/RevenueSplit.tsx" "TransactionList/TransactionList.tsx" "TopicViewer/TopicViewer.tsx" "DataViewer/DataViewer.tsx" "Navigation/Navigation.tsx")
for comp in "${COMPONENTS[@]}"; do
  if [ -f "src/components/$comp" ]; then
    echo "  ✅ $comp"
    ((FOUND++))
  else
    echo "  ❌ $comp - MISSING"
    ((MISSING++))
  fi
done

# Check UI components
echo ""
echo "🎨 UI Components:"
UI_COMPONENTS=("button.tsx" "card.tsx" "badge.tsx" "input.tsx" "modal.tsx" "toggle.tsx")
for comp in "${UI_COMPONENTS[@]}"; do
  if [ -f "src/components/ui/$comp" ]; then
    echo "  ✅ $comp"
    ((FOUND++))
  else
    echo "  ❌ $comp - MISSING"
    ((MISSING++))
  fi
done

# Check API routes
echo ""
echo "🔌 API Routes:"
API_ROUTES=("adapter/process/route.ts" "adapter/status/route.ts" "adapter/results/route.ts" "hedera/transactions/route.ts" "hedera/topics/route.ts" "hedera/messages/route.ts" "contracts/consent/route.ts" "contracts/revenue/route.ts")
for route in "${API_ROUTES[@]}"; do
  if [ -f "src/app/api/$route" ]; then
    echo "  ✅ $route"
    ((FOUND++))
  else
    echo "  ❌ $route - MISSING"
    ((MISSING++))
  fi
done

# Check library files
echo ""
echo "📚 Library Files:"
LIB_FILES=("adapter/processor.ts" "hedera/mirror-node.ts" "hedera/hashscan.ts" "contracts/abis.ts" "contracts/ethers.ts" "api/client.ts" "utils.ts")
for file in "${LIB_FILES[@]}"; do
  if [ -f "src/lib/$file" ]; then
    echo "  ✅ $file"
    ((FOUND++))
  else
    echo "  ❌ $file - MISSING"
    ((MISSING++))
  fi
done

# Check hooks
echo ""
echo "🪝 Hooks:"
HOOKS=("useAdapter.ts" "useHedera.ts" "useContracts.ts")
for hook in "${HOOKS[@]}"; do
  if [ -f "src/hooks/$hook" ]; then
    echo "  ✅ $hook"
    ((FOUND++))
  else
    echo "  ❌ $hook - MISSING"
    ((MISSING++))
  fi
done

# Check types
echo ""
echo "📝 Types:"
TYPES=("adapter.ts" "hedera.ts" "contracts.ts")
for type in "${TYPES[@]}"; do
  if [ -f "src/types/$type" ]; then
    echo "  ✅ $type"
    ((FOUND++))
  else
    echo "  ❌ $type - MISSING"
    ((MISSING++))
  fi
done

# Check store
echo ""
echo "💾 Store:"
if [ -f "src/store/ui-store.ts" ]; then
  echo "  ✅ ui-store.ts"
  ((FOUND++))
else
  echo "  ❌ ui-store.ts - MISSING"
  ((MISSING++))
fi

# Check key pages
echo ""
echo "📄 Key Pages:"
KEY_PAGES=("app/layout.tsx" "app/providers.tsx" "app/page.tsx" "app/admin/processing/page.tsx" "app/admin/transactions/page.tsx" "app/patient/dashboard/page.tsx" "app/hospital/dashboard/page.tsx" "app/researcher/dashboard/page.tsx")
for page in "${KEY_PAGES[@]}"; do
  if [ -f "src/$page" ]; then
    echo "  ✅ $page"
    ((FOUND++))
  else
    echo "  ❌ $page - MISSING"
    ((MISSING++))
  fi
done

echo ""
echo "=== SUMMARY ==="
echo "✅ Found: $FOUND files"
echo "❌ Missing: $MISSING files"
echo ""
if [ $MISSING -eq 0 ]; then
  echo "🎉 All files present!"
else
  echo "⚠️  Some files are missing. Check above."
fi
