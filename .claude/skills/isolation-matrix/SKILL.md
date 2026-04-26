---
name: isolation-matrix
description: Use this skill when building the Isolation Verification Matrix on /security in the Rubrik MSP project. This is the hero feature of the demo. Triggers when working on the matrix grid, cell drill-down sheets, remediate animation, or attestation report export. Pairs with /docs/interaction-specs/isolation-drilldown.md.
---

# Isolation Matrix Skill — Rubrik MSP

This skill complements `/docs/interaction-specs/isolation-drilldown.md` — read both before any work on the matrix. The interaction spec defines the user-visible behavior. This file defines the implementation patterns and what good looks like as code.

## Why a separate skill

The matrix is the only feature in the app that is **the** competitive wedge per the strategy doc. Veeam, Druva, and Acronis all have multi-tenant dashboards. None of them have an auditor-grade isolation matrix. If the demo's other features are 90% as good as a competitor's, that's fine. The matrix needs to be 100% — the equivalent of "this is the moment that signals enterprise depth" in the context handoff.

If the matrix is the polished one and nothing else is, the candidate still wins. If the rest of the app is polished and the matrix is rough, the candidate loses. Build accordingly.

## Architecture

Three components, in order of responsibility:

```
<IsolationMatrix>           — the page-level component, manages filters and selection
  <MatrixGrid>              — the CSS grid, renders rows and cells, handles keyboard nav
    <MatrixCell>            — single cell, renders state, owns click handler
  <CellDrillSheet>          — right-side sheet, opens on cell click
    <ViolationCard>         — single violation, owns Remediate handler
    <EvidencePanel>         — read-only YAML/JSON snippet, sparkline
    <RemediationSteps>      — numbered list (or audit feed if Pass)
    <FrameworkChips>        — clickable framework mappings
```

State boundary:
- Filters and the *selected cell* live in URL search params (`?tier=gold&framework=hipaa&cell=mercy-general:network`). Reload preserves the open sheet.
- Remediation in-flight state lives in the sheet's own `useState`.
- The matrix data itself is read from `mock-data.ts` via a Zustand selector.

## CSS Grid layout

Don't use a `<table>`. The matrix is semantically a grid, not tabular data — there's no header row beyond column labels, and cells need rich keyboard navigation that table elements complicate.

```tsx
<div
  role="grid"
  aria-label="Tenant isolation posture matrix"
  className="grid grid-cols-[280px_repeat(5,minmax(120px,1fr))] gap-px bg-slate-200 rounded-lg overflow-hidden border border-slate-200"
>
  {/* header row */}
  <div role="row" className="contents">
    <div role="columnheader" className="bg-white px-4 py-3 text-xs font-medium text-slate-500">Tenant</div>
    <div role="columnheader" className="bg-white px-4 py-3 text-xs font-medium text-slate-500 text-center">Network</div>
    {/* … 4 more */}
  </div>
  {/* data rows */}
  {tenants.map((t) => <MatrixRow key={t.id} tenant={t} />)}
</div>
```

The 280px first column accommodates "Mercy General Hospital" + tier badge without truncation. The `repeat(5, minmax(120px, 1fr))` makes control columns equal-width and responsive.

`gap-px` + `bg-slate-200` is the trick that gives you crisp 1px borders between cells without per-cell `border` rules.

## Cell render

Each cell is a `<button>` (not a div) so it's keyboard-focusable by default.

```tsx
<button
  role="gridcell"
  aria-label={`${tenant.name} ${control.label}: ${cell.status}`}
  onClick={() => openSheet(tenant.id, control.id)}
  className={cn(
    "bg-white px-4 py-3 text-sm flex items-center justify-center gap-2 transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-inset",
    "hover:bg-slate-50",
    cell.status === "fail" && "bg-red-50/50 hover:bg-red-50",
    cell.status === "warn" && "bg-amber-50/50 hover:bg-amber-50",
    cell.status === "pass" && "bg-white"
  )}
>
  <StatusIcon status={cell.status} />
  <span className={statusTextClass(cell.status)}>{statusLabel(cell.status)}</span>
</button>
```

Don't animate the cell on hover beyond color transition. Don't scale, don't translate, don't shadow. The cell is a calm, dense unit; movement breaks the "auditor reviewing posture" feel.

## Keyboard navigation

The grid implements roving tabindex: only one cell has `tabIndex={0}` at a time, the rest are `tabIndex={-1}`. Arrow keys move focus across cells, updating which one has `tabIndex={0}`. This is the standard pattern for grid widgets and is what assistive tech expects.

```tsx
const onKeyDown = (e: React.KeyboardEvent) => {
  switch (e.key) {
    case "ArrowRight": move(0, 1); break;
    case "ArrowLeft":  move(0, -1); break;
    case "ArrowDown":  move(1, 0); break;
    case "ArrowUp":    move(-1, 0); break;
    case "Home":       moveTo(currentRow, 0); break;
    case "End":        moveTo(currentRow, 4); break;
    case "Enter":
    case " ":          openSheet(currentTenant, currentControl); e.preventDefault(); break;
  }
};
```

After arrow navigation, focus the new cell. Don't auto-open the sheet — that would be intrusive on browse-with-keyboard. Open is an explicit Enter/Space.

## The drill-down sheet

shadcn `Sheet` with `side="right"` and a fixed width:

```tsx
<Sheet open={selectedCell !== null} onOpenChange={(o) => !o && closeSheet()}>
  <SheetContent side="right" className="w-[480px] sm:max-w-[480px] p-0 flex flex-col">
    <SheetHeader>{/* ... */}</SheetHeader>
    <ScrollArea className="flex-1">{/* sections */}</ScrollArea>
  </SheetContent>
</Sheet>
```

Why 480px: anything narrower truncates violation descriptions awkwardly. Anything wider obscures the matrix behind it.

Why ScrollArea: the sheet has variable content. The header stays sticky, the body scrolls.

Why flex-col + flex-1: the body fills available height regardless of how much content there is.

## Violation cards — implementation

Each violation card is a self-contained component. It manages its own remediation state.

```tsx
type RemediationState = "idle" | "remediating" | "done" | "failed";

const [state, setState] = useState<RemediationState>("idle");

const onRemediate = async () => {
  setState("remediating");
  // animate the progress bar via Framer Motion
  await delay(1400);
  setState("done");
  // bubble up to parent: this violation is resolved
  onResolved(violation.id);
};
```

The progress bar is a Framer `motion.div` with `initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.4, ease: [0.4, 0, 0.2, 1] }}`.

The three sub-step lights ("Updating network policy", etc.) are timed: 0–550ms first, 550–950ms second, 950–1400ms third. Each lights up via opacity transition + a tiny check icon swap.

When `state === "done"`: the card animates out via Framer `<AnimatePresence>` with `exit={{ opacity: 0, height: 0, marginTop: 0 }}`. Total exit time ~380ms (200 fade + 180 collapse).

The parent `<CellDrillSheet>` listens to `onResolved`. When it confirms there are no more unresolved violations on this cell, it triggers the cell color change behind the sheet (background-color transition on the actual `<MatrixCell>`, no JS animation needed — just toggle the data and let CSS interpolate).

## The cell color transition (the moment)

When a violation is the *last* one resolved on a cell:

1. The cell's underlying status updates in mock state: `fail` → `pass`.
2. The `<MatrixCell>` re-renders with the new status class.
3. CSS `transition-colors duration-400 ease-out` on the cell handles the visual shift.
4. The status icon swaps (red x-octagon → green check) with a 180ms scale-from-0.8 inside Framer.

No imperative DOM manipulation. No `requestAnimationFrame`. Just state change + CSS transition. This is robust and fast.

## Attestation PDF

Library: `@react-pdf/renderer`. Lazy-loaded on first export click — don't bloat the initial bundle.

```tsx
const onExport = async () => {
  const { pdf } = await import("@react-pdf/renderer");
  const { AttestationDoc } = await import("./AttestationDoc");
  const blob = await pdf(<AttestationDoc data={data} />).toBlob();
  // trigger download
};
```

`AttestationDoc` is a separate file — it uses different primitives (`<Document>`, `<Page>`, `<View>`, `<Text>`) and shouldn't pollute the rest of the codebase. Keep it isolated.

3 pages, exactly as the interaction spec defines. Use Inter as the font (load it via `Font.register({ family: 'Inter', src: '/fonts/Inter-Regular.ttf' })`). No emojis in the PDF either (per CLAUDE.md).

## Mock data shape

In `mock-data.ts`, the matrix data is generated as:

```ts
type CellStatus = "pass" | "warn" | "fail";
type ControlId = "network" | "storage" | "iam" | "encryption" | "namespace";

type IsolationCell = {
  tenantId: string;
  controlId: ControlId;
  status: CellStatus;
  lastEvaluatedAt: Date;
  violations: Violation[];   // empty array if status === "pass"
  evidence: EvidenceSnippet;
  frameworkMappings: FrameworkMapping[];
};
```

For 62 tenants × 5 controls = 310 cells. Distribute statuses: ~70% pass, ~20% warn, ~10% fail. This is dense enough to make the matrix feel real and sparse enough that the demo doesn't read as "everything is broken".

Seed the faker generator deterministically — every developer running the project sees the same matrix.

## Performance — the only place this matters

310 cells in a CSS grid is trivial. Don't memoize the cells. Don't virtualize. Don't `React.memo()` everything.

The one place to be careful: the global Zustand selector for the matrix data should return a stable reference (use `shallow` from `zustand/shallow` if needed). Otherwise the entire grid re-renders on unrelated state changes and the cell color transitions glitch.

## What you don't do here

- A real-time matrix that updates live. The "Last evaluated" timestamps are static per session.
- A matrix that supports more than 5 controls. The strategy doc lists exactly 5 — Network, Storage, IAM, Encryption Key, Namespace. Don't expand.
- A matrix that supports custom controls. Phase 3.
- Drag-to-resize columns or rows. Out of scope.
- A "compact view" of the matrix. Density is global per the tables skill, but the matrix opts out — its information density is already maximal.
