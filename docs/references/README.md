# Reference Screenshots

This folder anchors visual quality. Drop screenshots here before starting Prompt 1, and reference them by path in any styling-related prompt.

## Why this folder exists

Claude Code is dramatically better at matching visual quality when it has anchors. Saying "match Linear" is a vibe. Saying "match `/docs/references/linear-issues-list.png`" is a contract.

Without these references, every screen will look slightly different. With them, every screen will look like it came from the same design team.

## What to drop in

You need 6–8 screenshots minimum. Capture them at 1440px viewport width, 2x retina if you can. Save as PNG with descriptive kebab-case names.

### Required

- `linear-issues-list.png` — Linear's issues list view. Reference for: tenants table row density, status dots, hover states, sticky header.
- `linear-issue-detail.png` — Linear issue detail page. Reference for: tabs in URL, side panel, comment threads (we won't use threads but the layout discipline applies).
- `linear-cmd-k.png` — Linear's Cmd+K palette open with results. Reference for: command palette layout, fuzzy match highlighting, section grouping.
- `datadog-dashboard.png` — Datadog's main monitoring dashboard. Reference for: KPI tile layout, sparkline placement, chart density.
- `datadog-host-list.png` — Datadog's host or infrastructure list. Reference for: dense filterable tables with status indicators.
- `vercel-project-overview.png` — Vercel project page. Reference for: clean shadcn-adjacent visual rhythm, card spacing, typography hierarchy.
- `stripe-payments.png` — Stripe's payments table. Reference for: financial number formatting, status pills, side-sheet drill-down.
- `stripe-customer-detail.png` — Stripe's customer detail page. Reference for: side sheet anatomy, line-item breakdowns.

### Nice to have

- `linear-roadmap-timeline.png` — Reference if you want timeline-style audit log.
- `notion-database-table.png` — Reference for inline filter chips above a table.
- `raycast-actions-list.png` — Reference for command palette action item shapes.

## How to capture

1. Open each app in a logged-in state with realistic data (your own account, or your free trial).
2. Set the browser to 1440px wide. Use a tool like Window Resizer if needed.
3. Use macOS Screenshot (Cmd+Shift+4 then Space, click the window) for clean window captures, or full-page screenshots via DevTools.
4. Crop tightly. We don't need browser chrome or surrounding desktop.
5. Compress to ~300–500 KB per image. PNG is fine.

## How to reference these in prompts

When asking Claude Code to build a screen, include explicit references:

```
Build the tenants list at /tenants. Match the row density and status
treatment of /docs/references/linear-issues-list.png. The filter chip
pattern above the table should follow /docs/references/notion-database-table.png.
```

Don't say "make it look professional." Say "match this image."

## Compliance / privacy note

These reference screenshots are for your private use during development. Do not commit them to a public repository. Add `/docs/references/*.png` to `.gitignore` if you plan to push the project anywhere public. The reasoning is style transfer, not asset reuse — none of these images appear in shipped code.
