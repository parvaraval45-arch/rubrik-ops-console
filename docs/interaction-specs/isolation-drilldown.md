# Isolation Verification Matrix — Interaction Spec

This is the hero feature. The single screen that signals "this person understands enterprise-grade product depth." Build it like the rest of the app exists to support it.

## Why this matters

The strategy doc's competitive wedge is a "verifiable isolation matrix, auditor-grade" — Veeam VSPC, Druva MSC, and Acronis do not have one. This is the moment in the demo where the interviewer should think: "She didn't just rebuild a competitor. She built the thing none of them have."

## Layout

Full-width page. No sidebar collapse, no extra chrome.

```
┌──────────────────────────────────────────────────────────────┐
│ Header: "Security & Isolation"                               │
│ Right: circular gauge (global score 0–100), last assessed    │
│        timestamp, "Run Assessment" secondary, "Export        │
│        Attestation Report" primary                           │
├──────────────────────────────────────────────────────────────┤
│ 5 KPI cards in a row:                                        │
│   Isolation Violations   Anomalies 24h   MFA Enforced %      │
│   Encryption Coverage %  Immutability Coverage %             │
├──────────────────────────────────────────────────────────────┤
│ Matrix (the hero):                                           │
│   Sticky-left tenant column. 5 control columns: Network,     │
│   Storage, IAM, Encryption Key, Namespace.                   │
│   First 20 tenants visible. "Load 20 more" at bottom.        │
│   Above matrix: filter chips (All / Failing / Warning /      │
│   Healthy), tier filter, framework filter (HIPAA/SOC2/PCI).  │
└──────────────────────────────────────────────────────────────┘
```

Below the matrix: Threat Detections table (Time, Tenant, Detection Type, Severity, Status, Assigned Analyst). Compliance posture strip at the bottom (HIPAA / SOC 2 / ISO 27001 / PCI-DSS / GDPR with % compliant).

## The cell

Each cell is 44px tall, 120px wide. Three states:

- **Pass (green)**: filled `bg-emerald-500/10`, border `border-emerald-500/30`, checkmark icon, text "Pass"
- **Warning (amber)**: filled `bg-amber-500/10`, border `border-amber-500/30`, alert-triangle icon, text "Warning"
- **Fail (red)**: filled `bg-red-500/10`, border `border-red-500/30`, x-octagon icon, text "Failing"

On hover: border darkens to `/60`, cursor pointer, subtle scale-[1.01] transform (120ms ease-out). Cells are buttons, not divs. Keyboard navigable.

A cell shows the **current state**, not the count of issues. If a tenant has multiple Network failures, the cell still says "Failing" — the drill-down sheet enumerates them.

## Click → side sheet (not dialog)

Clicking any cell opens a right-side sheet, 480px wide. Sheet header:

```
[control icon]  Mercy General Hospital — Network Isolation
[Pass | Warning | Failing pill]
Last evaluated: 4 minutes ago
```

Sheet body, four sections in this order:

### 1. Violations (only shown if Warning or Failing)

Each violation is a card. Top-left: severity badge. Top-right: framework tags (e.g., "SOC 2 CC6.1", "HIPAA §164.312(a)").

Body of card:
- **What**: one-sentence description ("Tenant network namespace permits egress to peer tenant subnet 10.42.0.0/16")
- **Affected resources**: 2–4 chips (e.g., "vlan-mercy-prod", "envoy-route-7c", "iam-role-mercy-ops")
- **Who has access**: avatar stack of operators with permission to remediate

Footer of card: a single primary button "Remediate".

### 2. Evidence

A read-only block showing the raw check that produced the result. Tabs: "Configuration", "Last 5 evaluations". Configuration shows a small YAML or JSON snippet (monospace, syntax-highlighted, max 12 lines). Evaluations shows a sparkline of pass/fail across the last 30 days.

### 3. Remediation steps

If Warning or Failing: a numbered list, 3–5 steps, written like an SRE runbook. Each step is one sentence. Last step is the button-triggered automated fix.

If Pass: replace this section with "Last 5 control changes" — an audit micro-feed (operator, action, timestamp).

### 4. Framework mappings

Read-only chips listing every framework control this cell maps to. Click a chip → filters the global compliance posture strip to highlight that framework.

## The remediate animation — this is the moment

User clicks "Remediate" inside a violation card. Sequence:

1. Button text changes to "Remediating…" with a small in-button spinner (this is one of two places spinners are allowed; the other is the deploy flow). Disable the button. **150ms.**
2. Sheet shows a thin progress bar at the top, 0–100% in 1.4 seconds, easing out. Below it, three sub-steps light up in sequence:
   - "Updating network policy" → check
   - "Re-evaluating control" → check
   - "Refreshing posture" → check
3. The violation card fades to 0 opacity (200ms), then collapses (180ms ease-out).
4. If this was the last violation in the cell: the cell behind the sheet animates from red → amber → green over 400ms (background-color transition, no JS animation library needed). The sheet header pill updates Pass.
5. A success toast appears bottom-right: "Network isolation restored for Mercy General Hospital. SOC 2 CC6.1 attested."
6. The "Last evaluated" timestamp updates to "just now".

Total time: ~2.2 seconds. If you make it faster it feels fake. If you make it slower it feels broken.

## Export Attestation Report

Header button "Export Attestation Report". Clicking opens a small dialog (this one earns a dialog because it interrupts intentionally):

- Framework selector (radio): HIPAA / SOC 2 / PCI-DSS / ISO 27001 / GDPR
- Scope selector (multi-select): All tenants / By tier / By region / Selected tenants
- Date range: Last assessment / Last 30 days / Last 90 days / Custom
- Format: PDF (default) / CSV / JSON

Click "Generate". Dialog shows a 1.8s progress animation, then the dialog closes and a real PDF downloads. The PDF is a 3-page document:

- **Page 1**: cover sheet — framework, scope summary, "Attestation prepared by Rubrik MSP Operations Console", date, an attestation statement signed by "Operations Lead" placeholder.
- **Page 2**: matrix snapshot as a table — every tenant in scope, every control, status, last evaluated.
- **Page 3**: violation appendix — any current Failing or Warning items with control mappings.

Use `@react-pdf/renderer` or `jspdf`. The PDF must actually render. This is the proof point.

## Keyboard interactions

- `Tab` cycles through cells row by row
- `Arrow keys` navigate the matrix grid (left/right within row, up/down between rows)
- `Enter` or `Space` opens the sheet for the focused cell
- `Esc` closes the sheet and returns focus to the cell that opened it
- `Cmd+E` from anywhere opens the Export Attestation dialog
- `R` while a violation card is focused triggers remediate (with a "Press R again to confirm" two-tap pattern, no destructive single-key actions)

## What you do not build here

- A real backend. All evaluations are deterministic from `mock-data.ts`.
- A real PDF signing flow. The "signature" is a styled monospace name.
- A real RBAC layer. The "Who has access" stack reads from the mock operator list.
- A history of attestation reports. One-shot export only. (Phase 2.)

## Test-the-cut checklist

Before declaring this screen done, click through this exact path with no errors:

1. Land on `/security`
2. Click any red cell on the matrix
3. Sheet opens with at least one violation card visible
4. Click Remediate on a violation
5. Animation completes in roughly 2 seconds
6. Cell behind the sheet has visibly changed color
7. Toast appeared and auto-dismissed at 4s
8. Close sheet with Esc, focus returns to the same cell
9. Click "Export Attestation Report"
10. PDF downloads, all 3 pages render with real content

If any step has a glitch, it is not done. This is the demo moment. Polish it past the point of comfort.
