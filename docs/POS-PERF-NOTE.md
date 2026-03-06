# POS table view performance

Current warm **GET /api/tables/[id]/pos** target: **~170–200 ms**.

## Main query blocks and typical timings

| Block | Description | Typical (warm) |
|-------|-------------|-----------------|
| auth | getSession() or getUser(); getSession is cookie-only, getUser hits Auth server | ~1–5 ms (getSession) / ~65 ms (getUser) |
| ctx.total | Merchant/location context (cached 10 min) | ~0 ms after warm |
| tables.findFirst | Table by UUID or (location_id, display_id) | &lt;50 ms with index |
| sessions.findFirst | Open session for table | &lt;20 ms |
| parallel block 1 | seats + orders for session | ~20–40 ms |
| orderItems.findMany | Items for order IDs | ~30–60 ms |
| parallel block 2 | moneyAgg (bill + closeability) + delays | ~40–80 ms |
| outstanding compute pure | In-memory closeability from loaded data | &lt;1 ms |

## Future bottlenecks at scale

- **Auth policy choice**: getSession() vs getUser() tradeoff (latency vs revocation). Mutation routes must keep using getUser().
- **orderItems growth**: Single query by order IDs; consider pagination or limiting fields if sessions have many items.
- **Polling concurrency**: Many tablets polling /pos; consider caching, ETag, or longer intervals to reduce load.
