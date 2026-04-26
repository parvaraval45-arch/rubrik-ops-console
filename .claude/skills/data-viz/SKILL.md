---
name: data-viz
description: Use this skill whenever the user asks for a chart, KPI card, sparkline, donut, gauge, dashboard tile, metric tile, area chart, bar chart, or line chart in the Rubrik MSP project. Triggers on any visualization where data must be shown numerically or graphically. Establishes the chart palette, axis treatment, tooltip style, empty state behavior, and KPI card anatomy.
---

# Data Visualization Skill — Rubrik MSP

The reference standards are Linear (sparklines, KPI tiles), Datadog (time-series charts), Vercel (analytics dashboard). Look at `/docs/references/` before building anything new.

## Chart library decision

- **Recharts** for everything except the matrix and the gauge. Recharts handles area, bar, line, donut with low ceremony.
- **Hand-built SVG** only when recharts cannot deliver — currently: the global security score gauge on `/security` (a thick-stroke partial-circle with animated fill) and any heatmap (the matrix is CSS grid, not SVG).
- **No D3.** No Chart.js. No Plotly. No exceptions.

## The chart palette

Lock these. Don't introduce new colors.

```
Series 1 (primary):   #00B67A  (the brand green)
Series 2:             #2563EB  (info blue)
Series 3:             #D97706  (warning amber)
Series 4:             #94A3B8  (slate)
Series 5:             #059669  (success darker)

Status colors:
  Critical / Failed:  #DC2626
  Warning:            #D97706
  Healthy / Success:  #00B67A
  Neutral / Idle:     #94A3B8

Grid lines:           #E2E8F0 at 1px, only horizontal, only at major ticks
Axis labels:          #475569, 12px, font-weight 500
Tooltip text:         #0F172A on white surface, shadow-md, 8px radius
```

Area charts use a vertical gradient fill: solid at the top (50% opacity of the series color), fading to 0 at the bottom. Don't use solid fills — they look heavy.

## KPI card anatomy

Every KPI card on every dashboard uses the same component, `KpiCard`. Variation lives in the props, not in CSS.

```
┌────────────────────────────────────────┐
│ Active Alerts                          │  <- caption, 12px, slate-500
│                                        │
│ 47                ▲ +12  vs prev 30d   │  <- value 28px tabular-nums, delta inline
│                                        │
│   ╱╲    ╱╲                             │  <- 32px tall sparkline, no axes
│  ╱  ╲__╱  ╲___                         │
└────────────────────────────────────────┘
```

Anatomy contract:
- 16px padding, 8px radius, `shadow-sm`
- Caption never truncates; if it would, the parent layout is wrong, not the card
- Value uses `font-variant-numeric: tabular-nums`
- Delta arrow color: improvement is always `text-emerald-600`, regression is always `text-red-600`. **Improvement is context-dependent**: more alerts = bad (red), more tenants = good (green), higher backup success = good. The component takes a `direction: "more-is-good" | "less-is-good"` prop.
- Sparkline: 32px tall, no axes, no tooltip on hover (it's decorative — full chart lives below if user wants detail). Single-color line at series-1, no fill.
- If data is loading: skeleton with the same dimensions, animated `bg-slate-100` shimmer.
- If data is unavailable: caption shows, value renders as `—` (em dash) in `text-slate-300`, sparkline renders flat at the bottom.

## Tooltips

Recharts default tooltips are ugly. Always pass a custom `<Tooltip content={CustomTooltip} />`.

```
┌────────────────────────────┐
│ Mar 14, 2026               │  <- date, 11px slate-500
│ ━━━━━━━━━━━━━━━━━━━━━━━━━ │  <- divider line, 1px slate-200
│ ● Successful   1,247       │  <- series, value tabular-nums right-aligned
│ ● Failed           3       │
│ ● Running         12       │
└────────────────────────────┘
```

White background, `shadow-md`, 8px radius, 8px padding, no border. Series dots are 8px filled circles in series color.

## Axes

- X axis: never show every tick. Show start, end, and 3–5 in between. Date-based axes use `date-fns` `format()` with the format `MMM d` for short, `MMM d, yyyy` if year ambiguous.
- Y axis: do show grid lines. Format with `formatTB` / `formatPercent` / `formatCurrency` from `src/lib/formatters.ts`. Never raw numbers.
- Both axes: 12px labels, slate-600. No bold, no oversized.

## Legends

Most charts don't need them — the tooltip covers it. Only show a legend when there are 3+ series and the user might lose track. When shown: bottom of the chart, left-aligned, 12px text, dot-style indicators.

## Empty states for charts

A chart with no data is not blank. It renders the axes (faint, slate-200), a centered illustration (use a lucide icon at 32px in slate-300, e.g. `BarChart3`), and a message:

```
No backup activity in this range
Try expanding the date range or check back after the next scheduled job.
```

The illustration and message are vertically centered in the chart area. Don't show the recharts default "no data" treatment.

## Loading states

Use shadcn `Skeleton` shaped like the chart's bounding box. Don't render a partial chart with placeholder data — that misleads.

## Sparkline-specific rules

- Always 32px tall, never taller — sparklines are inline tile companions, not standalone charts.
- 7 to 30 data points only. Less than 7 is too sparse; more than 30 turns into noise at this size.
- Single line, no fill, no axes, no tooltip, no legend. If you want all that, you wanted a real chart.
- Color matches the metric: a sparkline next to "Backup Success Rate" trends toward green; next to "Failed Jobs" trends toward red. The sparkline is contextual signal, not a literal indicator.

## Animation

Recharts' default animations are fine. Don't disable them. Don't extend them past 600ms. Don't add `animate-on-scroll` — these are dashboards, not landing pages.

## Performance

Each dashboard page has 4–8 charts. With 500 backup jobs and 200 alerts in the dataset, you do not need virtualization, memoization, or `recharts` optimization tricks. Render plainly.

If a chart feels slow: it's almost certainly because the parent component is re-rendering on a Zustand selector that's too broad. Narrow the selector.

## Accessibility minimum

- Every chart has an `aria-label` describing what it shows ("Backup jobs over last 24 hours, three series")
- Every KPI card's value is exposed as text (don't render values inside SVG only)
- Tab focus moves into and out of the chart predictably (recharts handles this acceptably; don't override)
- Color is never the only signal — the tooltip and labels carry the meaning
