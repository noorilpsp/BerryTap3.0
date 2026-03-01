#!/usr/bin/env bash
# POS Idempotency Guardrail
# Ensures scoped mutation handlers (POST/PUT/DELETE) call requireIdempotencyKey().
#
# Scope: src/app/api/{orders,payments,tables,reservations,sessions}
# Rule: Any route file that exports POST, PUT, or DELETE must contain requireIdempotencyKey(
# GET-only routes are excluded.
#
set -euo pipefail

TARGETS=(
  "src/app/api/orders"
  "src/app/api/payments"
  "src/app/api/tables"
  "src/app/api/reservations"
  "src/app/api/sessions"
)

OFFENDERS=()

for dir in "${TARGETS[@]}"; do
  [[ -d "$dir" ]] || continue
  while IFS= read -r -d '' f; do
    has_mutation=false
    has_idempotency=false
    if grep -qE 'export\s+async\s+function\s+(POST|PUT|DELETE)\s*\(' "$f"; then
      has_mutation=true
    fi
    if grep -q 'requireIdempotencyKey(' "$f"; then
      has_idempotency=true
    fi
    if [[ "$has_mutation" == "true" ]] && [[ "$has_idempotency" != "true" ]]; then
      OFFENDERS+=("$f")
    fi
  done < <(find "$dir" -name 'route.ts' -type f -print0 2>/dev/null || true)
done

if [[ ${#OFFENDERS[@]} -gt 0 ]]; then
  echo "POS idempotency guardrail failed: mutation handlers (POST/PUT/DELETE) must call requireIdempotencyKey()." >&2
  echo "" >&2
  echo "Offending files:" >&2
  printf '  %s\n' "${OFFENDERS[@]}" >&2
  echo "" >&2
  echo "Add requireIdempotencyKey() to each mutation handler. See docs or existing routes for pattern." >&2
  exit 1
fi

echo "check-pos-idempotency: PASS"
