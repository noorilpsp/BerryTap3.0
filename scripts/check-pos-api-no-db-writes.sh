#!/usr/bin/env bash
set -euo pipefail

TARGETS=(
  "src/app/api/orders"
  "src/app/api/payments/[id]/route.ts"
  "src/app/api/tables"
  "src/app/api/reservations"
  "src/app/api/sessions"
)

# Reads are allowed. This check only blocks direct write calls in scoped POS routes.
WRITE_PATTERN='(db|tx|prisma)\.(insert|update|delete|upsert)'

if command -v rg >/dev/null 2>&1; then
  MATCHES="$(rg -n --pcre2 "${WRITE_PATTERN}" "${TARGETS[@]}" || true)"
elif command -v grep >/dev/null 2>&1; then
  MATCHES="$(grep -R -n -E "${WRITE_PATTERN}" "${TARGETS[@]}" 2>/dev/null || true)"
else
  echo "check-pos-api-no-db-writes: requires either rg or grep" >&2
  exit 2
fi

if [[ -n "${MATCHES}" ]]; then
  echo "Direct DB writes are not allowed in scoped POS mutation routes." >&2
  echo "Delegate writes through @/domain instead." >&2
  echo >&2
  echo "${MATCHES}" >&2
  exit 1
fi

echo "check-pos-api-no-db-writes: PASS"
