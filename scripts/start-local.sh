#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

export NODE_OPTIONS='--max-old-space-size=512'
export PRICELY_USE_MOCK_DATA="${PRICELY_USE_MOCK_DATA:-1}"

echo "Pricely start-local — production build + server (~150 MB RAM)."
echo "Rebuild runs only when you start this script (after code changes)."
echo "Mock data is enabled by default to avoid local Playwright scraper load."
echo "For live prices: PRICELY_USE_MOCK_DATA=0 ./scripts/start-local.sh"
echo ""

npm run build
exec npm run start
