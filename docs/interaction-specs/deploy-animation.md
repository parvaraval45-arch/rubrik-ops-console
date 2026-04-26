# Onboarding Deploy Animation — Interaction Spec

The onboarding wizard's value proposition is "15–30 minutes vs 1–3 days today." The deploy step is where that promise becomes visible. If this animation is bad, the entire strategy doc's first claim looks bad.

## Context

The user has completed steps 1–5 of the wizard (Tenant Details, Infrastructure, Policy Template, Isolation & Access, Billing) and lands on Step 6: Review & Deploy. The right pane shows collapsible summary sections of every previous step. At the bottom: "Estimated provisioning time: 18 minutes" and a single primary button "Deploy Tenant".

Click "Deploy Tenant" → the wizard transitions to a deploy state. The stepper sidebar collapses. The right pane is replaced by the deploy animation.

## The five tasks

These are the five provisioning tasks, in order. The exact phrasing matters — keep it.

1. **Cluster assigned** — "Allocating capacity on cluster `prod-east-2`"
2. **Namespace created** — "Provisioning isolated namespace `mercy-general`"
3. **Policies applied** — "Applying Healthcare-HIPAA policy template (v3.2)"
4. **IAM configured** — "Configuring tenant IAM roles and operator access"
5. **Ready** — "Tenant ready"

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│        Provisioning Mercy General Hospital                   │
│        Estimated time remaining: 0:14                        │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ ◐  Allocating capacity on cluster prod-east-2          │  │
│  │ ○  Provisioning isolated namespace mercy-general       │  │
│  │ ○  Applying Healthcare-HIPAA policy template (v3.2)    │  │
│  │ ○  Configuring tenant IAM roles and operator access    │  │
│  │ ○  Tenant ready                                        │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│        [Cancel]  (greyed-out after 50% progress)             │
└──────────────────────────────────────────────────────────────┘
```

Each task row is 56px tall, full-width inside an 8px-radius card.

## Task row states

Three states, in this order:

- **Pending**: empty circle outline (`border-slate-300`), text in `text-slate-500`
- **Running**: filled circle with an inset spinner (the only legitimate spinner in the entire app, scoped to this exact case), text in `text-slate-900`, faint `bg-slate-50` row background
- **Complete**: filled green circle with check, text in `text-slate-900`, no background

When a task moves Pending → Running: 80ms cross-fade, no movement.
When a task moves Running → Complete: the spinner morphs into a check (just swap icons with a 120ms scale 0.8 → 1.0 ease-out on the check).

## Timing

Total deploy: 12 seconds. Not faster — the user needs time to read what's happening.

- Task 1: 0.0s start, completes at 2.2s
- Task 2: 2.2s start, completes at 4.4s
- Task 3: 4.4s start, completes at 7.0s (longer because policies are the most "complex" thing)
- Task 4: 7.0s start, completes at 9.4s
- Task 5: 9.4s start, completes at 12.0s

The header's "Estimated time remaining" countdown updates every 200ms, formatted `0:NN`.

## Success state

At 12.0s, all five rows are green-checked. After a 400ms pause:

- The card scales up slightly (1.0 → 1.02 over 200ms ease-out, then back to 1.0)
- A green checkmark badge appears below the card with the text "Tenant deployed successfully"
- Two buttons appear with a 200ms fade-in: secondary "View Tenant" and primary "Onboard Another"

Below the buttons: a 14px line of text "`Mercy General Hospital` is now active and protected. First scheduled backup runs at 02:00 UTC."

## What actually happens in code

When Deploy is clicked:

1. The new tenant object is constructed from the form state (react-hook-form values).
2. It is **not yet** added to the Zustand store. We add it incrementally as tasks complete, so if the user inspects mock state mid-animation, it reflects partial provisioning.
3. After Task 1: tenant added to store with status `provisioning`, cluster assigned.
4. After Task 2: namespace field populated.
5. After Task 3: policy template id attached.
6. After Task 4: IAM roles and operator list attached.
7. After Task 5: status flips to `active`, `created_at` timestamp set, tenant becomes visible in `/tenants` list.

Clicking "View Tenant" routes to `/tenants/[id]?tab=overview`. The new tenant is at the top of the tenants list, sorted by `created_at` desc.

Clicking "Onboard Another" resets the form and returns to Step 1.

## Failure path — required, even if rarely shown

There is a 0% baseline failure rate, but **add a `?simulate=fail-step-3` query param** that forces Task 3 to fail. This lets you demo the failure path on command without needing a flaky toggle.

When Task 3 fails:

- Spinner morphs into a red x-octagon icon (180ms)
- Row text changes to `text-red-700` and the row background becomes `bg-red-50`
- An expanded section appears below the failed row with: error message ("Policy template version 3.2 has unresolved dependencies"), a Retry button, and a Rollback button.
- All later tasks remain Pending — they do not auto-cancel (this is correct behavior; the user decides).

Clicking Rollback:
- All previously-completed tasks animate Complete → Pending in reverse order, 250ms each (cascade).
- The tenant object is removed from the Zustand store (rolled back).
- The wizard returns to Step 6 with the form data preserved and a banner: "Deployment rolled back. Review and try again."

Clicking Retry:
- Task 3 returns to Running with a fresh spinner.
- Completes successfully. Tasks 4–5 proceed as normal.

## Why the failure path matters

The interviewer may ask: "What happens when something breaks during onboarding?" Without this, the answer is hand-waved. With this, you click a query param and demonstrate the rollback in real time. That's the difference between "I thought about it" and "I built it."

## Test-the-cut checklist

1. Complete the wizard end-to-end from `/onboarding/new`
2. Click Deploy. Animation runs ~12 seconds.
3. New tenant appears at top of `/tenants` list with status `active`
4. Reload the page. Tenant persists (Zustand persisted to memory; not localStorage per CLAUDE.md)
5. Open `/onboarding/new?simulate=fail-step-3`, complete the wizard, click Deploy
6. Task 3 visibly fails. Rollback button appears. Click it.
7. Wizard returns to Step 6 with form data intact.
8. Tenant does not appear in `/tenants` list.

If any of those steps stalls or shows a console error, it is not done.
