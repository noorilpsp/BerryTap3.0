# KDS Timestamp Correctness

Documents the lifecycle timestamp model for the Kitchen Display System, what is persisted, exposed, and any remaining limitations.

## Already Persisted (Before This Slice)

| Timestamp | Table | Level | Written on |
|-----------|-------|-------|------------|
| `createdAt` | orders, order_items | Order + Item | Insert (default) |
| `firedAt` | orders | Order | `fireWave` (dine-in only) |
| `sentToKitchenAt` | order_items | Item | `fireWave` (dine-in) |
| `startedAt` | order_items | Item | `markItemPreparing` |
| `readyAt` | order_items | Item | `markItemReady` |
| `servedAt` | order_items | Item | `markItemServed`; cleared on recall |

## Newly Exposed / Fixed (This Slice)

### 1. servedAt exposed to KDS

- **Change**: Added `servedAt` to `KdsOrderItem` and to GET /api/kds/view response.
- **Files**: `src/lib/kds/kdsView.ts`, `src/app/api/kds/view/route.ts`
- **Purpose**: KDS can use servedAt for READY column aging (time in pass/expo) and analytics.

### 2. sentToKitchenAt for pickup/delivery

- **Change**: When `markItemPreparing` runs and `sentToKitchenAt` is null, set it to now.
- **File**: `src/app/actions/order-item-lifecycle.ts`
- **Rule**: First kitchen touch = when status goes pending → preparing. Dine-in items already have sentToKitchenAt from `fireWave`; pickup/delivery get it on first touch.
- **Purpose**: Prep-time analytics (`readyAt - sentToKitchenAt`) work for all order types.

## Final Timestamp Model

| Timestamp | Set when | Cleared when | Dine-in | Pickup/delivery |
|-----------|----------|--------------|---------|-----------------|
| `createdAt` | Insert | Never | ✓ | ✓ |
| `firedAt` | Fire wave | Never | ✓ | N/A (null) |
| `sentToKitchenAt` | Fire wave **or** first kitchen touch | Never | ✓ (fire) | ✓ (mark preparing) |
| `startedAt` | Mark preparing | Never | ✓ | ✓ |
| `readyAt` | Mark ready | Never | ✓ | ✓ |
| `servedAt` | Mark served | Recall (served→ready) | ✓ | ✓ |

## Lifecycle Consistency

- **ready → served**: Writes `servedAt = now` (unchanged)
- **served → ready** (recall): Clears `servedAt = null` (unchanged)
- **sentToKitchenAt**: No longer left null once kitchen work begins; filled on first touch for pickup/delivery

## KDS View API

`KdsOrderItem` now includes:

- `sentToKitchenAt`
- `startedAt`
- `readyAt`
- `servedAt`
- `voidedAt`

All timestamps are ISO strings or null.

## Remaining Limitations

1. **KDS aging not yet using stage timestamps**  
   KDS timers and urgency still use `order.createdAt`. A future slice should use:
   - NEW: `order.firedAt ?? order.createdAt`
   - PREPARING: earliest `startedAt` / `sentToKitchenAt` of station items
   - READY: earliest `readyAt` (or served items `servedAt` for done)

2. **orders.completedAt**  
   Column exists but is not updated when all items are served.

3. **Order-level aggregate timestamps**  
   No single order-level `readyAt` or `servedAt`; aggregate per order must be derived from items.
