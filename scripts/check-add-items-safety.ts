/**
 * POS Add-Items Safety Guardrail
 * Statically verifies that the table page add-items handler has:
 * 1. addItemsInFlightRef (concurrency protection)
 * 2. try/finally that clears addItemsInFlightRef
 * 3. fetchPos("/api/orders") for the add-items request
 * 4. Failure path: setWarningDialog + return (no partial state mutations)
 *
 * Run with: npm run check:pos-add-items-safety
 */

import { readFileSync } from "fs"
import { resolve } from "path"

const TABLE_PAGE = resolve(process.cwd(), "src/app/table/[id]/page.tsx")

function main() {
  const content = readFileSync(TABLE_PAGE, "utf-8")

  const hasAddItemsInFlightRef = /addItemsInFlightRef/.test(content)
  const hasFetchOrders = /fetchPos\s*\(\s*["']\/api\/orders["']/.test(content)
  const hasFailureDialog = /setWarningDialog\s*\(\s*\{[^}]*title:\s*["']Failed to add items["']/.test(content)
  const failedIdx = content.indexOf("Failed to add items")
  const hasReturnAfterFailure = failedIdx >= 0 && content.slice(failedIdx, failedIdx + 350).includes("return")

  const hasFinallyClearsRef =
    /addItemsInFlightRef\.current\s*=\s*false/.test(content) &&
    /finally\s*\{/.test(content)

  const errors: string[] = []
  if (!hasAddItemsInFlightRef) {
    errors.push("Missing addItemsInFlightRef (concurrency protection)")
  }
  if (!hasFinallyClearsRef) {
    errors.push("Missing try/finally that sets addItemsInFlightRef.current = false")
  }
  if (!hasFetchOrders) {
    errors.push("Missing fetchPos('/api/orders')")
  }
  if (!hasFailureDialog) {
    errors.push("Failure path must call setWarningDialog with title 'Failed to add items'")
  }
  if (!hasReturnAfterFailure) {
    errors.push("Failure path must return early after setWarningDialog")
  }

  if (errors.length > 0) {
    console.error("check-add-items-safety: FAIL")
    errors.forEach((e) => console.error("  -", e))
    process.exit(1)
  }

  console.log("check-add-items-safety: PASS")
}

main()
