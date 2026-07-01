#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

npx --yes tsx --test \
  src/lib/runtime/mockMode.test.ts \
  src/lib/mock/buildCompareMock.test.ts \
  src/lib/utils/productMatch.test.ts \
  src/services/verdictService.test.ts \
  src/lib/email/resend.test.ts \
  src/lib/hooks/usePendingAlert.test.ts \
  "$@"
