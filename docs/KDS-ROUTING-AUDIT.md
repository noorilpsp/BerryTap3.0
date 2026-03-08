# KDS / POS Item-to-Station Routing Audit

**Purpose:** Audit the current station/routing data model and behavior to determine the canonical source of truth for item-to-station assignment. No implementation; decision doc only.

---

## 1. Current Station-Related Data Model

### 1.1 Menu / Product Schema

**File:** `src/lib/db/schema/menus.ts`

| Model | Field | Meaning | Persisted? |
|-------|-------|---------|------------|
| `items` (menu items) | — | **No station-related field exists** | N/A |

Menu items have: id, locationId, name, description, price, photoUrl, calories, status, useCustomHours, customSchedule, displayOrder. No `station`, `prepStation`, `prepArea`, or category-derived station.

**File:** `src/lib/db/schema/menus.ts` (categories)

| Model | Field | Meaning | Persisted? |
|-------|-------|---------|------------|
| `categories` | — | **No station-related field exists** | N/A |

---

### 1.2 Order Schema

**File:** `src/lib/db/schema/orders.ts` (lines 455–456)

| Model | Field | Type | Meaning | Persisted? |
|-------|-------|------|---------|------------|
| `orders` | `station` | `varchar(50)` | Order-level station assignment (e.g. kitchen, bar) | Yes, in DB |

- **When set:** `createNextWave` and `createOrderWithItemsForPickupDelivery` set `station: null`. `fireWave` (in `src/domain/serviceActions.ts`) can optionally set it via `options.station` when firing.
- **Who sets it:** Only `fireWave` when `options.station` is passed. Table page and KDS fire flow do **not** pass `station`.
- **Effective value today:** Always `null` for dine-in waves; never written for pickup/delivery.

---

### 1.3 Order Items Schema

**File:** `src/lib/db/schema/orders.ts` (line 541)

| Model | Field | Type | Meaning | Persisted? |
|-------|-------|------|---------|------------|
| `order_items` | `stationOverride` | `varchar(50)` | Per-item station override (e.g. bar, grill) | Yes, column exists |

- **When set:** `addItemsToOrder` in `src/domain/serviceActions.ts` inserts order items without `stationOverride` (lines 767–782). No other code path writes this column.
- **Effective value today:** Always `null`.

---

### 1.4 Station-Related Schema (Dedicated Tables)

**None.** There is no `stations` or `substations` table. Station IDs are freeform strings (e.g. `"kitchen"`, `"bar"`).

---

### 1.5 Kitchen/KDS Types

**File:** `src/lib/kds/kdsView.ts`

| Type | Field | Meaning | Persisted? |
|------|-------|---------|------------|
| `KdsOrder` | `station` | Order-level station (from DB `orders.station`) | From DB |
| `KdsOrderItem` | `stationOverride` | Per-item override (from DB `order_items.station_override`) | From DB |
| `KdsStation` | `id`, `name`, `displayOrder` | Station metadata for UI | **Derived only** |

**File:** `src/lib/pos/computeKitchenDelays.ts` (lines 8, 28, 66–67)

- Inputs: `orderIdToStation` (order → station), `item.stationOverride`
- Resolution: `station = item.stationOverride ?? orderStation` for delay attribution

---

### 1.6 Routes/Views Deriving Station Info

| File | What it does |
|------|---------------|
| `src/app/api/kds/view/route.ts` | Fetches `orders.station`, `order_items.station_override`. Builds `stations` list from distinct `order.station` + `item.stationOverride`; if empty, adds `"kitchen"`. Passes both to KdsView. |
| `src/app/api/tables/[id]/pos/route.ts` | Fetches `orders.station`, `order_items.station_override`; builds `orderIdToStation`; uses for delays and item mapping. |
| `src/app/actions/kitchen-delay-detection.ts` | Same resolution: `item.stationOverride ?? order.station` for delay attribution. |
| `src/lib/hooks/useKdsView.ts` | `groupItemsByStation`: `stationId = item.stationOverride ?? orderIdToStation.get(item.orderId) ?? "kitchen"` |
| `src/app/kds/page.tsx` | `kdsViewToOrders` adapter: `stationId = o.station ?? "kitchen"` for order; `stationId = i.stationOverride ?? o.station ?? "kitchen"` per item. |
| `src/app/kds/page.tsx` (line 167–168) | `STATIONS`: from `view.stations` if present, else `DEFAULT_STATIONS` (kitchen, bar, dessert). |
| `src/components/kds/PreparingLanes.tsx` (lines 54–86) | `SUB_STATIONS`: grill, fryer, cold_prep. `assignSubStation(order)` uses **order ID hash** to pick one. **Pure UI mock**; not from DB. |

---

### 1.7 Summary of Fields

| Field | Model | File | Persisted? | Who writes? | Effective value today |
|-------|-------|------|------------|-------------|------------------------|
| `station` | orders | `src/lib/db/schema/orders.ts` | Yes | Only `fireWave` when `options.station` passed | `null` (never set) |
| `stationOverride` | order_items | `src/lib/db/schema/orders.ts` | Yes | Nobody | `null` (never set) |
| `stations` (list) | KdsView | `src/app/api/kds/view/route.ts` | No (derived) | Built from order.station + item.stationOverride; fallback `["kitchen"]` | `["kitchen"]` only |
| `SUB_STATIONS` | PreparingLanes | `src/components/kds/PreparingLanes.tsx` | No (hardcoded) | N/A | grill, fryer, cold_prep (mock) |
| `DEFAULT_STATIONS` | KDS page | `src/app/kds/page.tsx` | No (hardcoded) | N/A | kitchen, bar, dessert |

---

## 2. Current Routing Behavior

### 2.1 Full Path

1. **Menu item creation**  
   - No station data stored. `items` table has no routing fields.

2. **Order creation**  
   - Dine-in: `createNextWave` / `addItemsToOrder` → `orders.station = null`, `order_items.station_override` not set (defaults to null).  
   - Pickup/delivery: `createOrderWithItemsForPickupDelivery` → `orders` have no station; `order_items` not used in same way for POS.

3. **Order item creation (add items)**  
   - `addItemsToOrder` in `src/domain/serviceActions.ts` (lines 767–782): inserts `orderId`, `itemId`, `itemName`, `itemPrice`, `quantity`, `seat`, `seatId`, `customizationsTotal`, `lineTotal`, `notes`, `status`. **Does not set `stationOverride`.**

4. **Fire wave**  
   - `fireWave` can set `orders.station` via `options.station`, but table page and KDS do not pass it. So `orders.station` stays `null`.

5. **Table page**  
   - Does not read or display station. No routing logic.

6. **KDS GET `/api/kds/view`**  
   - Loads `orders.station`, `order_items.station_override`.  
   - Builds `stations` from distinct values; if none, adds `"kitchen"`.  
   - Passes both to `KdsView`.

7. **KDS adapter / grouping**  
   - `kdsViewToOrders`: `item.stationId = item.stationOverride ?? o.station ?? "kitchen"` → effectively always `"kitchen"`.  
   - `useKdsView.groupItemsByStation`: same resolution.  
   - `filteredOrders` filters by `item.stationId === activeStationId`. With all items `"kitchen"`, switching to "bar" or "dessert" shows nothing.

8. **PreparingLanes substations**  
   - `assignSubStation(order)`: hash of `order.id` → grill / fryer / cold_prep.  
   - Purely UI; not from DB. Same order always maps to same lane.

### 2.2 Conclusion

**Routing today is weak and mostly guessed:**
- No menu-level station.
- `orders.station` and `order_items.station_override` exist but are never written.
- Effective resolution is always `"kitchen"`.
- Substations (grill, fryer, cold_prep) are UI-only mock, not persisted or driven by item type.
- Station switcher shows kitchen/bar/dessert, but only "kitchen" has items.

---

## 3. Source-of-Truth Options

### A. Menu-item default station only

- **Idea:** Add `station` (or `defaultStation`) to `items`; each menu item has one default station.
- **Pros:** Single source, simple, works for “this item always goes to X”.
- **Cons:** No per-order or per-item override; no substation.
- **Fits now?** Yes, as a base.
- **First-class or deferred?** First-class. Menu is the natural default.

### B. Menu-item default station + substation

- **Idea:** Add `station` and `substation` (or `prepArea`) to `items`.
- **Pros:** Supports kitchen lanes (e.g. fryer vs grill).
- **Cons:** More schema, more complexity; substations may be location-specific.
- **Fits now?** Partial. Good if kitchen lanes are needed soon.
- **First-class or deferred?** Defer substation until station filtering works.

### C. Order-level station only

- **Idea:** Use only `orders.station`; ignore item-level.
- **Pros:** Simple; one station per order/wave.
- **Cons:** Wrong for mixed stations (e.g. drinks + food). Current schema already has per-item override.
- **Fits now?** No. Orders often have mixed items.
- **First-class or deferred?** Defer; keep as optional override, not primary.

### D. Order-item-level station override on top of menu-item default

- **Idea:** Resolve: `order_items.station_override ?? items.default_station ?? fallback`.
- **Pros:** Override when needed; default from menu; aligns with existing columns.
- **Cons:** Requires `items.default_station` (or equivalent). `stationOverride` exists but is never written today.
- **Fits now?** Yes. Uses existing override; adds menu default.
- **First-class or deferred?** First-class. This is the right direction.

### E. Rule-based routing layer

- **Idea:** Rules engine (e.g. category → station, tag → station, time-based).
- **Pros:** Flexible.
- **Cons:** Overkill for current scope; more moving parts.
- **Fits now?** No.
- **First-class or deferred?** Deferred.

---

## 4. Recommended Routing Hierarchy

**Recommended resolution order (for this project, given current schema):**

1. **`order_items.station_override`** — Per-item override (already in schema; needs a writer).
2. **`orders.station`** — Order-level override (already in schema; optional from fire).
3. **Menu item default station** — New field on `items` (e.g. `default_station` or `station_id`).
4. **Fallback station** — `"kitchen"` when nothing else is set.

**Rationale:**
- Overrides stay at order-item and order level.
- Default comes from menu when no override.
- Matches existing columns and extends minimally.

---

## 5. Screen vs Substation Model

### Recommendation

**Station** = Physical KDS screen / station (e.g. bar, kitchen, dessert).
- Separate KDS screens per station (e.g. Bar KDS, Kitchen KDS, Dessert KDS).
- Persisted or config: station id/name per location.
- Items routed to one station by default.

**Substation** = Lane within a station (e.g. fryer, grill, cold prep inside Kitchen).
- For UI grouping within a single KDS screen.
- Not a separate screen; used for layout (columns/lanes).

**Where to store what:**
- **Menu items:** `default_station` (required for routing). Optional: `default_substation` for lane hints.
- **Order items:** `station_override` (override station), optional `substation_override` if added.
- **Orders:** `station` optional (e.g. from expo at fire time).
- **KDS read model:** Return `stationId` (and optionally `substationId`) per item, plus `stations` and `substations` metadata.

**KDS read model shape (conceptual):**
- `orderItems[].stationId` — Resolved station (screen).
- `orderItems[].substationId` — Optional; for lane grouping.
- `stations` — List of station metadata.
- `substations` — Optional; list of substation metadata per station.

---

## 6. Gaps Blocking Correct Station Filtering

1. **Menu items have no routing**  
   - `items` has no `station` or `default_station`. Cannot route from menu.

2. **Order items never get `stationOverride`**  
   - Column exists; `addItemsToOrder` and other flows never set it. No override path.

3. **Order-level station is never set**  
   - `fireWave` can set it but no caller does. Always `null`.

4. **No substation field**  
   - No DB field for substation. PreparingLanes uses a mock hash.

5. **Stations list is effectively `["kitchen"]`**  
   - Derived only from order/item values, which are null. Fallback is `"kitchen"`.

6. **DEFAULT_STATIONS is hardcoded**  
   - kitchen, bar, dessert. Not from config or DB; no location-specific stations.

7. **Substations are UI-only**  
   - grill, fryer, cold_prep in PreparingLanes; no DB or config.

8. **Grouping is UI-level only**  
   - Station filter works off derived `item.stationId`; with all `"kitchen"` there is no real routing.

---

## 7. Recommendation: What to Do Before KDS Station Polish

**Recommended next step:**  
**Add a default station field to menu items.**

**Why:**
- Menu items are the natural default for “where does this go?”
- Single, clear source of truth.
- Enables: on add, copy `items.default_station` → `order_items.station_override` (or a new `station` if we split default vs override).
- Minimal schema change; no new entities.
- Order/order-item overrides can stay as future extensions.

**Concrete steps (for a later implementation slice):**
1. Migration: add `default_station` (e.g. `varchar(50)`) to `items`.
2. When adding items: resolve station as `input.stationOverride ?? menuItem.default_station ?? "kitchen"` and persist to `order_items.station_override` (or a dedicated `station` column if we prefer).
3. Seed or backfill `default_station` from category or manual config.
4. Keep KDS resolution as `item.stationOverride ?? order.station ?? "kitchen"` until menu default is used to populate one of those.

**Do not do yet (defer):**
- Substation model or DB fields.
- Rule-based routing.
- Location-specific station config (can add when multi-location matters).
- Changing the fire flow to set `orders.station` unless product requires it.

**Order of implementation:**
1. Add `default_station` to `items` (migration + schema).
2. Update `addItemsToOrder` (or equivalent) to set `order_items.station_override` from `items.default_station` when inserting.
3. Add a way to edit `default_station` in menu admin (or seed from category).
4. Verify KDS view and adapter already use `stationOverride` correctly; they do.
5. Optionally add location-level station config later.
