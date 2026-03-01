# Domain Events

The domain emits typed events via `src/domain/emitter.ts`. This is a **seam** for future integrations — no realtime, webhooks, or analytics are wired yet.

## Usage

```ts
import { emit } from "@/domain";

emit({
  type: "session.closed",
  payload: { sessionId: "…", closedAt: new Date().toISOString() },
  correlationId: "…",
});
```

## Event Types

| Type | Payload |
|------|---------|
| `session.closed` | sessionId, closedAt? |
| `wave.fired` | sessionId, orderId, wave, firedAt, itemCount?, affectedItems? |
| `wave.advanced` | sessionId, orderId, wave, status, updatedItemIds |
| `order.items_added` | sessionId, orderId, wave, addedItemIds, itemCount? |
| `item.status_changed` | itemId, orderId, sessionId?, status |

## Future Wiring

- **Supabase Realtime** — broadcast events to subscribed clients
- **Webhooks** — POST to configured URLs on domain events
- **Analytics** — send to Mixpanel, Amplitude, etc.

Replace the no-op `emitter` in `emitter.ts` or provide a custom implementation to enable these.
