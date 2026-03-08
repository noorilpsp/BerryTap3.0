# KDS Notification / Toast Wiring Audit

Audit of new-order toasts, modification toasts, and station messages in the KDS page.

---

## 1. New Order Toasts (addToast)

| Item | Location | Status |
|------|----------|--------|
| `addToast` | `page.tsx:229` | **DEAD** – defined but never called |
| `toasts` state | `page.tsx:210` | Always `[]` |
| `handleToastView` | `page.tsx:254` | Defined, passed to KDSToastContainer; never used (no toasts) |
| `handleToastDismiss` | `page.tsx:273` | Same |
| `KDSToastContainer` | `page.tsx:576-580` | Renders; always receives empty array |
| `toastTimeoutRefs` | `page.tsx:216` | Used only by addToast; dead |

**Root cause:** No code compares previous vs new orders after refresh and calls `addToast` for newly-visible orders. No websocket, no polling that triggers toasts.

**Recommendation:** Keep UI and handlers (they work if wired). Wire by adding a `useEffect` that compares `orders` before/after refresh and calls `addToast` for new orders for the current station. Or defer until realtime/polling is implemented.

---

## 2. Modification Toasts (modificationToasts)

| Item | Location | Status |
|------|----------|--------|
| `modificationToasts` state | `page.tsx:211` | Always `[]` – never populated |
| `setModificationToasts` | `page.tsx:327, 335` | Only used to filter/remove; no push |
| `handleModificationToastView` | `page.tsx:324` | Defined, passed; never invoked (no toasts) |
| `handleModificationToastDismiss` | `page.tsx:332` | Same |
| `KDSModificationToastContainer` | `page.tsx:570-574` | Renders; always receives empty array |
| `modificationClearTimeoutsRef` | `page.tsx:217` | Never used |

**Root cause:** No code detects order modifications (item add/remove/change) and pushes to `modificationToasts`. Would require diffing previous vs current view or server push.

**Recommendation:** Keep UI and handlers. Wire when modification detection is implemented (diff on refresh or realtime events).

---

## 3. Station Messages (stationMessages)

| Item | Location | Status |
|------|----------|--------|
| `stationMessages` state | `page.tsx:222` | **LIVE** – populated by `handleSendMessage` |
| `setStationMessages` | `page.tsx:456, 462` | Add on send; update on mark read |
| `handleSendMessage` | `page.tsx:443` | **LIVE** – called from KDSMessagePanel |
| `handleMarkMessageRead` | `page.tsx:461` | **LIVE** – called from IncomingMessageToast, KDSMessageHistory |
| `incomingUnreadMessages` | `page.tsx:428` | Derived; filters unread for current station |
| `KDSMessagePanel` | `page.tsx:542-554` | **LIVE** – user can send messages |
| `KDSMessageHistory` | `page.tsx:556-565` | **LIVE** – shows sent messages |
| `IncomingMessageToast` | `page.tsx:608-616` | **LIVE** – shows when unread messages exist |

**Behavior:** All messages are in-memory. When user sends from Kitchen to Bar, the message is added with `fromStationId: "kitchen"`. When Bar tab is active, it appears in IncomingMessageToast (toStation=Bar, fromStationId≠activeStationId). No backend; works for single-user station switching.

**Recommendation:** Keep as-is. Add backend/websocket later for multi-device.

---

## 4. Completed Orders / Recall (completedOrders)

| Item | Location | Status |
|------|----------|--------|
| `completedOrders` state | `page.tsx:209` | **Never populated** – only ever filtered in handleRecall |
| `setCompletedOrders` | `page.tsx:312` | Only removes on recall; no add |
| `handleRecall` | `page.tsx:311` | **LIVE** – wired to KDSHeader dropdown |
| KDSHeader Recall dropdown | `KDSHeader.tsx:170-214` | Renders; always empty |

**Root cause:** Bump (handleMarkServed) does not add the order to `completedOrders`. The order leaves the view when items are served, but nothing pushes a snapshot to the Recall list.

**Recommendation:** Keep UI. Wire by having `handleMarkServed` or a success callback add the order to `completedOrders` when all items for the station (or order) are served. Or add an `onBump` callback from useKdsMutations that the page uses to push to completedOrders.

---

## 5. Summary Table

| Feature | State/Hook | Populated By | Rendered | Live? |
|---------|------------|--------------|----------|-------|
| New order toasts | addToast, toasts | Nothing | KDSToastContainer | **Dead** |
| Modification toasts | modificationToasts | Nothing | KDSModificationToastContainer | **Dead** |
| Station messages | stationMessages | handleSendMessage | KDSMessagePanel, IncomingMessageToast, KDSMessageHistory | **Live** |
| Recall list | completedOrders | Nothing | KDSHeader Recall dropdown | **Dead** (no Bump→add flow) |

---

## 6. Exact Files and Lines (Dead vs Live)

### Dead (defined, never populated / never triggers display)

| File | Lines | What |
|------|-------|------|
| `page.tsx` | 229-252 | addToast – never called |
| `page.tsx` | 210 | toasts – always [] |
| `page.tsx` | 211 | modificationToasts – always [] |
| `page.tsx` | 209 | completedOrders – never populated (Bump doesn't add) |
| `page.tsx` | 216 | toastTimeoutRefs – only used by addToast |
| `page.tsx` | 217 | modificationClearTimeoutsRef – never used |

### Live (actively used)

| File | Lines | What |
|------|-------|------|
| `page.tsx` | 443-458 | handleSendMessage – adds to stationMessages |
| `page.tsx` | 461-464 | handleMarkMessageRead – updates stationMessages |
| `page.tsx` | 222 | stationMessages – populated by user sends |
| `page.tsx` | 311-314 | handleRecall – removes from completedOrders (but list always empty) |

---

## 7. Recommended Cleanup vs Keep

| Feature | Recommendation |
|---------|----------------|
| **New order toasts** | Keep. Wire when refresh/realtime detects new orders. |
| **Modification toasts** | Keep. Wire when modification diff is implemented. |
| **Station messages** | Keep. Already live. |
| **Recall list** | Keep. Wire Bump success to push to completedOrders. |
| **toastTimeoutRefs** | Remove or leave – harmless. |
| **modificationClearTimeoutsRef** | Remove – unused. |
