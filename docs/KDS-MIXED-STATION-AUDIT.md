# KDS Mixed-Station Consistency Audit

Full audit of where KDS still assumes one order = one global status vs station-specific status, after fixing station-scoped mutations and action button label.

---

## 1. Remaining Global-Order-Based Usages

### KDSTicket.tsx

| Line | Code | Issue | Fix? |
|------|------|-------|------|
| 741 | `order.isRecalled && order.status === "ready"` | Recalled flow uses global status | **Keep global** – recall is order-level; when recalled, the whole order is "ready" |
| 757 | `isStationComplete && order.status !== "ready"` | "Complete" button visibility uses global order.status | **Change** – should use station status. Use `statusForButton !== "ready"` so "Complete" shows when our station is ready but we haven’t bumped yet. Actually: `isStationComplete` means our station’s items are ready. The "Complete" button marks our items as served. The `order.status !== "ready"` is meant to avoid showing "Complete" when we should show "Bump" (all done). For mixed stations: when our station is ready but another isn’t, `order.status` = "preparing". We want to show "Complete". When all stations are ready, `order.status` = "ready". Then we’d show the recalled/Bump branch if recalled. So the condition is: show "Complete" when our station is done (isStationComplete) AND we’re not in the "all done" state. The "all done" state = all stations ready = order.status === "ready". So `order.status !== "ready"` is correct for "not all stations done". **Keep global** for this check. |

### AllDayView.tsx

| Line | Code | Issue | Fix? |
|------|------|-------|------|
| 163 | `status: order.status` in orderRefs | orderRef label shows global status | **Change** – AllDayView receives `allDayOrders` (station-filtered, pending for current station). Each order’s `order.status` can be "preparing" if another station started. Label would show "PREPARING" for Bar’s pending item when Kitchen started – misleading. Use station-specific status. |
| 178 | Same | Same | **Change** |

**Implementation:** Pass `activeStationId` to AllDayView (or a resolved `displayStatus` per order). In `groupItemsByCategory`, use `order.stationStatuses?.[activeStationId] ?? order.status` for the `status` field in orderRefs.

### useKdsView.ts

| Area | Status |
|------|--------|
| `groupItemsByStation` | Uses item-level station; **correct** |
| `orderIdToStation` | Order-level fallback; **correct** |

### kdsViewToOrders (page.tsx)

| Area | Status |
|------|--------|
| stationStatuses | Per-station from items; **correct** |
| order.status | Overall from all items; **correct** (used as fallback when no station filter) |

### KDSColumn.tsx

| Line | Code | Status |
|------|------|--------|
| 141–144 | Filter by `stationStatuses[currentStationId] ?? order.status` | **Correct** |
| 262–271 | stationStatus, isStationComplete, waitingStations | **Correct** (station-specific) |

### KDSColumns.tsx

| Line | Code | Status |
|------|------|--------|
| 77–80 | getOrdersByStatus filter | **Correct** (station-specific when currentStationId set) |

### PreparingLanes.tsx

| Line | Code | Status |
|------|------|--------|
| 289–297 | stationStatus, isStationComplete, waitingStations | **Correct** (station-specific) |

### page.tsx

| Area | Status |
|------|--------|
| filteredOrders | Filters by item.stationId; **correct** |
| allDayOrders | Uses stationStatus for pending filter; **correct** |
| orderCounts | Counts by item.stationId; **correct** |
| addToast | Uses `order.items.length` (station-filtered); **correct** if called with filtered order. Never called in codebase – dead or event-driven. |
| completedOrders | Order-level recall; **Keep global** (recall is per order) |

---

## 2. Correct to Keep Global

- **order.status** in kdsViewToOrders – overall order status; fallback when no station filter
- **order.isRecalled && order.status === "ready"** – recall is order-level
- **completedOrders / handleRecall** – recall is per order
- **Sorting** (KDSColumn sortByUrgency) – uses createdAt, isRemake, isSnoozed; no status dependency
- **getQueuePosition** – uses createdAt only
- **KDSBatchHints / detectBatches** – operates on items; no status used; **correct**
- **orderCounts** – already station-scoped via item.stationId

---

## 3. Must Become Station-Specific

| File | Location | Current | Required |
|------|----------|---------|----------|
| **AllDayView.tsx** | groupItemsByCategory, orderRefs (lines 163, 178) | `status: order.status` | `status: order.stationStatuses?.[stationId] ?? order.status` – need to pass stationId to AllDayView |

---

## 4. Exact Files and Code Areas

| File | Lines | Change |
|------|-------|--------|
| `src/components/kds/AllDayView.tsx` | 14–28 (AllDayOrder), 128–186 (groupItemsByCategory) | Add optional `stationId?: string` to `groupItemsByCategory(orders, stationId?)`. When building orderRefs, use `stationId && (order as AllDayOrder & { stationStatuses?: Record<string, string> }).stationStatuses?.[stationId] ?? order.status`. Add `stationStatuses?: Record<string, string>` to AllDayOrder. Make `AllDayView` accept `stationId?: string` and pass it to `groupItemsByCategory`. |
| `src/app/kds/page.tsx` | 566 | Change `<AllDayView orders={allDayOrders} />` to `<AllDayView orders={allDayOrders} stationId={activeStationId} />` |

---

## 5. Recommended Fix Order

1. **AllDayView** – Add `stationId` prop; use `order.stationStatuses?.[stationId] ?? order.status` for orderRef labels
2. **page.tsx** – Pass `stationId={activeStationId}` to AllDayView

---

## 6. Station Settings UI – Safe to Start?

**Yes, after the AllDayView fix.** The remaining global usages (recall, Complete button condition) are intentional. The only real bug is AllDayView showing global status in orderRef labels for mixed-station orders.

---

## Summary Table

| Component | Uses order.status | Uses stationStatuses | Correct? |
|-----------|-------------------|----------------------|----------|
| kdsViewToOrders | Yes (overall) | Yes (per station) | Yes |
| filteredOrders | No | No (item.stationId) | Yes |
| allDayOrders | Fallback | Yes | Yes |
| KDSColumn filter | Fallback | Yes | Yes |
| KDSColumns getOrdersByStatus | Fallback | Yes | Yes |
| KDSTicket button label | Fallback | Yes | Yes (fixed) |
| KDSTicket recalled/Bump | Yes | No | Yes (order-level) |
| KDSTicket Complete condition | Yes | No | Yes (order-level) |
| AllDayView orderRef status | Yes only | No | **No** – fix |
| useKdsMutations | N/A | N/A | Yes (station-scoped) |
| orderCounts | No | No | Yes (item.stationId) |
| KDSBatchHints | No | No | Yes |
