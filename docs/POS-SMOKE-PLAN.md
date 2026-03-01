# POS Smoke Test Plan (Manual, ~10 min)

A step-by-step manual smoke test to verify the table flow: ensure session → add items → fire wave → advance → serve → close.

---

## A) Preconditions Checklist

Before starting, confirm these exist. Run `npm run dev` and keep the terminal visible for server logs.

| Requirement | How to verify |
|-------------|---------------|
| **Location** | At least one row in `merchant_locations`. Create via Dashboard → Stores if needed. |
| **Tables** | At least one table with `table_number` matching the URL (e.g. `"1"`, `"6"`, `"T6"`). Run `npm run seed:orders` or create via Dashboard. |
| **Menu items** | At least one item for the location. Run `npm run seed:menu` if needed. |
| **Staff mapping** | Row in `staff` with `user_id` = your logged-in auth user ID and `location_id` = location ID. Without this, ensure session returns 403 "User is not staff for this location". |
| **Merchant user** | You are in `merchant_users` for the merchant that owns the location. |
| **Logged in** | You have an active Supabase session (e.g. via Dashboard or auth flow). |

**Quick DB check (optional):**
```sql
SELECT id FROM merchant_locations LIMIT 1;
SELECT id, table_number FROM tables WHERE location_id = '<location_id>';
SELECT id FROM staff WHERE location_id = '<location_id>' AND user_id = '<your_auth_user_id>';
SELECT id FROM items WHERE location_id = '<location_id>' LIMIT 1;
```

---

## B) Exact Steps

Use table ID that matches `table_number` in DB. If seed created tables 1–5, use `/table/1`. For `table_number` "6" or "T6", use `/table/6` or `/table/t6`.

### 1. Open table page

- Navigate to `/table/t6` (or `/table/1` if you have table 1).
- **Expect:** Table page loads. If table is "available", you see "Seat Party Here".

### 2. Ensure session

**Option A (recommended – avoids broken Seat Party flow):** Floor map → seat party

- Go to `/floor-map`.
- Find the table (e.g. table 6 or 1).
- Click the seat-party button or long-press a table for quick actions → Seat Party. Enter party size (e.g. 2), submit.
- **Expect:** Modal closes; table shows as occupied. Session created via domain `ensureSession`.
- Navigate back to `/table/t6` (or the table’s ID).

**Option B:** Seat from table page (currently broken)

- On table page, click "Seat Party Here", enter party size, submit.
- **Note:** This flow uses `fetch` without Idempotency-Key and returns 400. If you see no error but session is missing, this path is still broken.

### 3. Add item

- On table page, click "Add Items" or enter ordering view.
- Search or pick a menu item.
- (Optional) set seat, quantity, notes.
- Click "Send" / "Add to Order".
- **Expect:** Item appears in the order list with status "held" or "sent" (if wave 1 fires automatically).

### 4. Fire wave

- If items are "held", click "Fire W1" (or the Fire Wave button).
- **Expect:** Items move to "sent" / "cooking". Wave fired to kitchen.

### 5. Advance to ready

- Use the wave controls to advance status: Sent → Cooking → Ready (or the equivalent labels).
- **Expect:** Items show as "ready".

### 6. Serve item

- Click the serve action on an item (or "Mark as served" for the wave).
- **Expect:** Item status becomes "served".

### 7. Close session

- Click "Bill" or "Close Table".
- In the payment modal, enter amount (e.g. total shown), tip, method; submit.
- **Expect:** Table closes, redirect to floor map; table shows as free.

---

## C) Expected Server Logs & API Responses

### Successful responses (ok: true)

| Step | Endpoint | Expected response shape |
|------|----------|-------------------------|
| Ensure session | `POST /api/sessions/ensure` | `{ ok: true, data: { sessionId, tableUuid } }` |
| Add items | `POST /api/orders` | `{ ok: true, data: { order, orderId, sessionId, addedItemIds } }` |
| Fire wave | `POST /api/sessions/{sid}/waves/1/fire` | `{ ok: true, data: { sessionId, orderId, wave, firedAt, itemCount, affectedItems } }` |
| Advance wave | `POST /api/sessions/{sid}/waves/1/advance` | `{ ok: true, data: { sessionId, orderId, wave, updatedItemIds, failed } }` |
| Serve item | `PUT /api/orders/{oid}/items/{iid}` | `{ ok: true, data: <orderItem> }` |
| Close session | `POST /api/sessions/{sid}/close` | `{ ok: true, data: { sessionId } }` |

### Server log lines (success)

On success, routes generally do not log. You may see normal HTTP request logs (e.g. `POST /api/orders 201`).

### Server log lines (errors)

| Route | Log line pattern |
|-------|------------------|
| sessions/ensure | `[POST /api/sessions/ensure] Error:` |
| orders | `[POST /api/orders] Error:` |
| fire | `[POST /api/sessions/[sessionId]/waves/[waveNumber]/fire] Error:` |
| advance | `[POST /api/sessions/[sessionId]/waves/[waveNumber]/advance] Error:` |
| close | `[POST /api/sessions/[sessionId]/close] Error:` |
| orders/items | `[PUT /api/orders/[id]/items/[itemId]] Error:` |

---

## D) If It Fails: How to Interpret

| Symptom | Likely cause | Action |
|---------|--------------|--------|
| **400 "Missing Idempotency-Key"** | UI using raw `fetch` instead of `fetchPos` | Code bug. Check `docs/UI-POS-MUTATION-CALLS.md` for calls missing Idempotency-Key. |
| **403 "User is not staff for this location"** | No `staff` row for (userId, locationId) | Data: Insert or update `staff` so `user_id` = your auth user and `location_id` = location. |
| **403 "You don't have access to this location"** | Not in `merchant_users` for the merchant | Data: Add yourself to the merchant. |
| **404 "Location not found"** or **"Session not found"** | Wrong IDs or session not created | Data: Confirm location exists; ensure session completed (floor map seat party or add-items flow). |
| **404 "Order not found"** or **"Order item not found"** | Order/item IDs don’t exist or belong to another order | Code bug or stale UI state. Check order flow and IDs. |
| **"Table is Available" but no way to add items** | No session yet | Must seat party first (floor map works; table-page "Seat Party" is broken). |
| **Add items fails with "All items must have itemId"** | Menu item not found or wrong itemId | Data: Ensure menu items exist for the location; check item IDs. |
| **Close fails: "unfinished_items"** | Items not all served or voided | Finish or void all items before closing. |
| **Close fails: "unpaid_balance"** | Payment total < session total | Enter correct payment amount. |
| **No console.error but UI doesn’t update** | Client ignores `ok: false` (e.g. `.catch(()=>{})`) | Code bug: UI does not surface API errors. Inspect Network tab for 4xx/5xx. |

### Data vs code

- **Data missing:** 403 staff, 403 merchant, 404 location/session/order, empty menu. Fix with seeds or DB updates.
- **Code bug:** 400 Idempotency-Key, wrong IDs, client not handling errors. Fix in UI or API code.

---

*This plan documents how to verify the current system. No new features.*
