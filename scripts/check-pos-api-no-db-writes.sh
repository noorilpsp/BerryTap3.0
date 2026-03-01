#!/usr/bin/env bash
# POS Mutation Guardrail
# Ensures scoped routes perform no direct DB writes. All writes must go through @/domain.
#
# Scope: src/app/api/{orders,payments,tables,reservations,sessions}
# Allowed: auth queries, membership checks (db.query.*, findFirst, findMany, etc.)
# Disallowed: db.insert, db.update, db.delete, db.upsert (and tx/prisma equivalents)
#
# Sessions: src/app/api/sessions/** (ensure, [sessionId]/close, waves/next, waves/.../fire, waves/.../advance)
set -euo pipefail

TARGETS=(
  "src/app/api/orders"
  "src/app/api/payments"
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
