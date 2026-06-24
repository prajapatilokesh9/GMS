#!/usr/bin/env bash
set -euo pipefail

echo "=== FitCore Pro — Security Audit Script ==="
echo "Date: $(date)"
echo ""

# 1. Dependency vulnerability scan
echo "--- npm audit ---"
npm audit --audit-level=high 2>&1 || echo "npm audit found issues (see above for details)"

echo ""
echo "--- pnpm audit ---"
pnpm audit --audit-level=high 2>&1 || echo "pnpm audit found issues (see above for details)"

# 2. Check for known vulnerabilities in production dependencies
echo ""
echo "--- Production dependency audit (backend) ---"
cd apps/backend
pnpm audit --prod --audit-level=high 2>&1 || true
cd ../..

# 3. Secrets detection (check for common secret patterns in code)
echo ""
echo "--- Secrets scan (checking for hardcoded secrets) ---"
SECRET_PATTERNS=(
  '-----BEGIN.*PRIVATE KEY-----'
  'AKIA[0-9A-Z]{16}'
  'sk_live_[0-9a-zA-Z]{24}'
  'sk_test_[0-9a-zA-Z]{24}'
  'xox[abps]-[0-9a-zA-Z]{10,48}'
  'ghp_[0-9a-zA-Z]{36}'
  'gho_[0-9a-zA-Z]{36}'
  'ghu_[0-9a-zA-Z]{36}'
)

IGNORE_DIRS="--exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist --exclude-dir=.next"
FOUND_SECRET=0
for pattern in "${SECRET_PATTERNS[@]}"; do
  RESULTS=$(grep -rn "$pattern" $IGNORE_DIRS . 2>/dev/null || true)
  if [ -n "$RESULTS" ]; then
    echo "WARNING: Potential secret found matching pattern: $pattern"
    echo "$RESULTS"
    FOUND_SECRET=1
  fi
done

if [ $FOUND_SECRET -eq 0 ]; then
  echo "No hardcoded secrets detected."
fi

# 4. Check for .env files committed
echo ""
echo "--- .env file check ---"
if git rev-parse --git-dir > /dev/null 2>&1; then
  ENV_FILES=$(git ls-files | grep '\.env$' || true)
  if [ -n "$ENV_FILES" ]; then
    echo "WARNING: .env files are tracked in git:"
    echo "$ENV_FILES"
  else
    echo "No .env files tracked in git."
  fi
else
  echo "Not a git repository — skipping .env check."
fi

# 5. Summary
echo ""
echo "=== Security Audit Complete ==="
