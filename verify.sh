#!/usr/bin/env bash
set -euo pipefail

echo "=== verify: type-check ==="
npx tsc --noEmit 2>&1 | grep -v "fetch-playwright" | grep "error TS" && { echo "FAIL: type errors"; exit 1; } || echo "OK"

echo "=== verify: build ==="
pnpm build
echo "OK"

echo "=== verify: test ==="
npx vitest run
echo "OK"

echo "=== verify: npm pack ==="
npm pack --dry-run 2>&1 | tail -5
echo "OK"

echo "=== verify: all checks passed ==="
