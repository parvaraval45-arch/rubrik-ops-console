---
name: tables
description: Use this skill when building any table or list view in the Rubrik MSP project — tenants list, capacity per-tenant table, threat detections table, audit log, invoices, policy template lists, or any tabular data display. Establishes the table library, row anatomy, sort/filter/pagination conventions, empty and loading states, and bulk action patterns.
---

# Tables Skill — Rubrik MSP

Reference standards: Linear's issues table, Datadog's hosts list, Stripe's payments table. These tables are dense, scannable, and never feel like a Bootstrap admin template.

## The library

`@tanstack/react-table` for everything. Wrap it once in `src/components/data-table.tsx` as a generic `<DataTable<T>>` component. Every table in the app uses this wrapper. Do not roll a second table implementation.

The wrapper handles:
- Column definitions
- Sort state (synced to URL search params)
- Filter state (synced to URL search params)
- Pagination (25 / 50 / 100, default 25)
- Row selection (when bulk actions are needed)
- Empty state slot
- Loading state slot
- Sticky header

It does not handle:
- Inline editing (out of scope)
- Drag-to-reorder columns (out of scope)
- Resizable columns (out of scope)

## Row anatomy

```
─────────────────────────────────────────────────────────────────
☐  ◯ Mercy General Hospital   ● Healthy   42  ━━━━ 87%   12.4/20 TB   2 min ago   ⋯
─────────────────────────────────────────────────────────────────
```

Rules:
- 48px row height. Not taller. Not shorter unless density is set to Compact (40px).
- 16px horizontal padding inside cells.
- 1px `border-slate-200` divider between rows. No outer table border.
- Hover: `bg-slate-50`. The whole row is hoverable, even if not all cells are.
- Click anywhere on the row (except interactive sub-elements) navigates to the detail view.
- Last column is always actions: kebab menu (lucide `MoreHorizontal`), opens a dropdown with row-specific actions.

## Cell types — patterns

### Identifier cell (always first content column)
Avatar (32px circle with 2-letter initials in slate-100 bg) + name + (optional) sub-label. Tenant: avatar + tenant name + tier badge inline. Operator: avatar + operator name + role.

### Status cell
A `StatusDot` component: 8px filled circle + label. Healthy = emerald-500, Warning = amber-500, Critical = red-500, Idle = slate-400. The colors come from the design tokens.

### Numeric cell
Right-aligned. `font-variant-numeric: tabular-nums`. Always formatted via `src/lib/formatters.ts` — never raw numbers.

### Progress cell
For "Capacity Used 12.4 / 20 TB" or similar. Inline 80px progress bar (slate-200 track, primary-color fill) + text "12.4 / 20 TB". If over 90%: bar fill turns warning amber. If over 100%: critical red.

### Sparkline cell
32px tall inline sparkline (per data-viz skill). For trends like "7d backup success".

### Relative time cell
"2 min ago", "3 hours ago", "yesterday". Use `date-fns/formatDistanceToNow`. Always `text-slate-500`.

### Badge cell
For tier ("Gold", "Silver", "Bronze") or compliance frameworks ("HIPAA", "SOC 2"). shadcn `Badge` with variants. Don't use stock colors — use the design tokens.

### Actions cell
Always last. Kebab `MoreHorizontal` icon, opens a `DropdownMenu`. Items vary per row context. First item is usually "View [thing]" which is redundant with row click — keep it for discoverability.

## Sorting

- Sort indicators are subtle: 12px `ArrowUp` / `ArrowDown` icons next to the column header, in `text-slate-500`. No giant up/down arrows.
- Default sort: per-table. Tenants list defaults to last activity desc. Audit log defaults to time desc. Invoices default to issue date desc.
- Three-state sort: asc → desc → none (back to default). Don't lock to two states.
- Multi-column sort: don't bother. Single-column is sufficient for this demo.

## Filtering

The filter bar lives **above** the table, inside the same container. Layout:

```
┌──────────────────────────────────────────────────────────────┐
│ [Search...        ]  [Status ▾]  [Region ▾]  [Tier ▾]   [⋯]  │
├──────────────────────────────────────────────────────────────┤
│ Active filters:  [Status: Critical ✕]  [Tier: Gold ✕]   Clear all │
├──────────────────────────────────────────────────────────────┤
│ Showing 17 of 62 tenants                                     │
├──────────────────────────────────────────────────────────────┤
│ ... rows ...                                                 │
└──────────────────────────────────────────────────────────────┘
```

- Search is fuzzy across the primary identifier columns. Debounce 200ms.
- Multi-select filter dropdowns. Each filter dropdown is a shadcn `Popover` with a checkbox list.
- Active filters appear as removable chips below the bar. Clear all link on the right.
- The "Showing X of Y" counter updates live.

URL contract: every filter state is in the URL as search params. `?status=critical,warning&tier=gold`. Reload preserves filters. Sharing a URL shares the view.

## Pagination

Bottom-right of the table:

```
                                    Rows per page: 25 ▾   1–25 of 62   ‹  ›
```

- Page size selector: 25, 50, 100 only.
- Range readout: `1–25 of 62`, with `tabular-nums`.
- Prev / Next icon buttons. No page numbers — for 62 tenants we don't need a page picker.
- If 1 page only: hide pagination entirely.

## Empty states

Empty states have intent. They tell the user what to do next.

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│                       [icon at 40px]                         │
│                                                              │
│                  No tenants match these filters              │
│           Try clearing filters or adjusting your search.     │
│                                                              │
│                       [Clear filters]                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

For a *truly* empty list (no data ever), use a creation prompt:

```
                  No tenants yet
        Onboard your first tenant to start managing
                 backups across the fleet.

                    [Onboard tenant]
```

Icon options (lucide): `Inbox` for empty queues, `Search` for filtered-empty, `Plus` for never-created.

## Loading states

Skeleton rows that match the shape of real rows. 8 skeleton rows is enough — more is wasteful.

```
☐  ▮▮▮▮  ▮▮▮▮  ▮▮▮  ▮▮▮▮▮▮  ▮▮▮▮  ▮▮▮▮  ⋯
```

Each `▮` is a `Skeleton` block with the right width for that column. Animation: shadcn's default shimmer (subtle, not distracting).

## Bulk actions

When row selection is enabled (checkboxes in the first column), a bulk action bar appears as a sticky bottom bar when ≥1 row is selected:

```
┌──────────────────────────────────────────────────────────────┐
│  3 tenants selected                  [Apply policy] [Export] │
│                                      [Suspend ▾]  [Cancel]   │
└──────────────────────────────────────────────────────────────┘
```

- Bar slides up from the bottom (200ms ease-out)
- "Cancel" deselects all and dismisses the bar
- Destructive actions (Suspend, Delete) require a confirm dialog
- Non-destructive (Apply policy, Export) execute and show a toast

## Density

Settings exposes a Compact / Comfortable toggle that affects every table:
- Comfortable (default): 48px rows, 16px padding
- Compact: 40px rows, 12px padding, 13px text instead of 14px

Stored in Zustand. Applies app-wide.

## Sticky headers and scroll

- Header is sticky inside the table container, never sticky to the viewport.
- The first column (identifier) is **not** sticky-left for normal tables — it adds clutter at this scale. Only sticky-left for the isolation matrix (which has its own component anyway).

## Accessibility

- Every column header has scope="col"
- Sortable columns have aria-sort
- Selected rows have aria-selected
- The table has a caption (visually hidden via sr-only) describing what it lists
