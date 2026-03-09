# Table Page Loading / Empty-Table Flash Fix

## Problem

1. **Empty-table flash**: On refresh or initial entry, the page briefly showed the seat-party screen before real data loaded. Cause: `tableView === null` was treated as "needs seating" because `projectTableView(null)` returns `uiMode: "needs_seating"`.
2. **Double loading sequence**: Two sequential loading states made the page feel like it loaded twice: (a) OpsProviders full-screen "Loading...", then (b) table page shell + "Loading table..." in main content.

## Fix

1. **Early return for unresolved state**: When `tableView === null && !tableViewError`, the table page returns `<OpsLoadingFallback />` (full-screen loading) and does **not** render TopBar, page shell, or main content. This matches the OpsProviders loading UI for a continuous experience.
2. **Gate on real data**: The `uiMode`-based content (blocked / needs_seating / in_service) is only reached when `tableView !== null` or when there is an error (we fall through to show error banner).
3. **Initialize `tableViewLoading` to `true`**: Ensures loading state is active from the first frame.
4. **Single loading UI for initial load**: Both OpsProviders and the table page use the same `OpsLoadingFallback` component. Transition from provider loading to table loading is visually seamless.
5. **Later refresh**: When `tableView !== null && tableViewLoading`, the existing banner-style "Loading table..." shows above the page content. Initial load and later refresh remain distinct.

## Initial Load vs Later Refresh

| Phase        | Condition                      | Loading UI                                      |
|-------------|---------------------------------|-------------------------------------------------|
| Initial load| `tableView === null`            | Full-screen `OpsLoadingFallback` (early return) |
| Later refresh| `tableView !== null`, refresh  | Banner "Loading table..." below TopBar          |
| Error       | `tableViewError` set            | Error banner + Retry; page shell with error     |

## Semantics

- **`tableView === null`** → Unresolved / loading. Do not render page shell; return full-screen loading.
- **`uiMode === "needs_seating"`** → Only valid when derived from real loaded data (`tableView !== null`).
- Error handling is unchanged: `tableViewError` drives the error banner and Retry flow.
