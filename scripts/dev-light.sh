#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

export NODE_OPTIONS='--max-old-space-size=1536'
export PRICELY_USE_MOCK_DATA="${PRICELY_USE_MOCK_DATA:-1}"

echo "Pricely dev-light — hot reload with 1.5 GB heap cap."
echo "Mock data is enabled by default to avoid local Playwright scraper load."
echo "For live prices: PRICELY_USE_MOCK_DATA=0 ./scripts/dev-light.sh"
echo ""

exec npm run dev
