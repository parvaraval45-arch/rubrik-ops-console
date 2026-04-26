# Autoplay Demo Mode — Interaction Spec

The autoplay button is the hidden interview move. It is not a feature for users — it is a feature for *you*, the candidate, in case the live demo runs long, the interviewer wants a quick overview, or you want to record a perfect screen capture for the thank-you email follow-up.

Build it last. It depends on every other piece working first.

## Where it lives

A small button in the top-right of the dashboard (only on `/`), next to the date range selector. Label: "Watch demo" with a `Play` icon (lucide-react). Secondary button styling — quiet, easy to miss for a casual user, easy for *you* to find on demo day.

Not a global element. Not in the sidebar. Not in the command palette (don't make it discoverable to the interviewer; let them find it organically or you offer it).

## What it does

A scripted, narrated, 110-second walk through Phase 1's five capabilities. The narration is on-screen text (not audio — audio in a UI demo is invasive). The cursor is simulated; the screen actually navigates and interacts as if a user is operating it.

## Sequence — 110 seconds total

The script is divided into five "scenes". Each scene has: a duration, a target route, a series of timed actions, and a caption.

### Scene 1 — The problem (12s)

- Caption (top-center, 12s): "MSPs hit four pain points on shared infrastructure. The Operations Console solves all four with one fleet-management layer on RSC."
- Route: `/` (dashboard)
- Action: cursor enters from off-screen, hovers over the Tenant Health donut. After 4s, hover the Top Alerts feed. After 8s, hover the Backup Jobs chart.
- The cursor is a 16px circle, primary-color filled, slight `shadow-md`, smooth easing between hover targets (cubic-bezier 0.4, 0, 0.2, 1, 800ms per move).

### Scene 2 — Onboarding (28s)

- Caption: "Onboarding: 15–30 minutes vs 1–3 days today. Template-driven, with safe defaults enforced."
- Cursor moves to "Onboard New Tenant" in the topbar / suggested actions card. Click. Route changes to `/onboarding/new`.
- Auto-fill the wizard: Step 1 (4s, fields populate left-to-right with a fast typewriter effect), Step 2 (3s, click cluster card), Step 3 (3s, click Healthcare-HIPAA template), Step 4 (3s, multi-select operators), Step 5 (2s, fill billing), Step 6 (1s, scroll through summary).
- Click Deploy. Run the deploy animation (12s, see deploy-animation.md).
- Click "View Tenant" — route to the new tenant's detail page.

### Scene 3 — The dashboard signal (15s)

- Caption: "Operations Lead lands here every morning. Health across the fleet, alerts ranked by tenant impact, capacity at a glance."
- Route back to `/`.
- Cursor clicks the donut "Critical" segment → filtered tenants list at `/tenants?status=critical`. 5s pause to read.
- Cursor clicks back to dashboard. Hovers a KPI card to show the trend tooltip. 4s.

### Scene 4 — The hero (32s)

- Caption: "Isolation matrix — auditor-grade, continuously verified. None of our competitors have this."
- Route to `/security`.
- Cursor hovers the matrix briefly. Clicks a red Network cell on Mercy General. Sheet opens (see isolation-drilldown.md).
- 4s pause to read the violation.
- Cursor clicks "Remediate". Run the remediation animation (~2.2s).
- Cursor closes the sheet.
- Cursor moves to "Export Attestation Report". Click. Dialog opens.
- Select "SOC 2", scope "All tenants", format "PDF". Click Generate. PDF downloads (in autoplay mode, suppress the actual download trigger; just show the dialog completing — we don't want a real file on the interviewer's machine mid-demo).
- Caption updates: "Auditor walks out with a signed PDF. SOC 2 review compresses from days to minutes."

### Scene 5 — Capacity & versioning (18s)

- Caption: "Capacity reconciliation and policy versioning, both with full audit trails."
- Route to `/capacity`. Cursor opens a tenant row's side sheet showing line items. 5s.
- Route to `/policies`. Click a template. Click Versions tab. Show the diff. 5s.
- Route back to `/`. Caption fades to: "Phase 1 ships in six months. Phases 2 and 3 cover PSA integrations, white-label portal, and AI-grounded workflows."

### Closing (5s)

- Full-screen fade to a card centered on `/` with the strategy doc thesis printed clean: "Every tool in Rubrik today is built for managing one customer at a time. This console is what makes shared infrastructure operable at scale." Below: "Built by Parva Raval · Phase 1 prototype."
- A single "Restart demo" button beneath the card.

Total: 12 + 28 + 15 + 32 + 18 + 5 = 110s.

## Implementation notes

- **State machine, not setTimeout chains.** Use a simple reducer with a `step` index and a tick that drives transitions. Each step has `duration`, `route`, `actions`. This makes pause/resume/skip trivial.
- **Pause / Resume / Skip controls** appear bottom-center when autoplay is active: `[‖ Pause]  [⏭ Skip scene]  [⏹ Stop]`. These are for *you* during the demo if the interviewer wants to ask a question mid-scene.
- **Cursor**: a single absolutely-positioned div at `z-50`, transforms via Framer Motion. Click events are simulated by also triggering the actual click handler (don't fake it visually — actually run the same code path the user would).
- **Captions**: a single fixed `top-4` centered card, 480px max-width, fades in/out with the scene. Caption text in `text-slate-900`, supporting text in `text-slate-500`.
- **Pointer-events**: while autoplay is running, the entire app is `pointer-events: none` *except* the autoplay control bar. This prevents the user clicking mid-demo and breaking state.
- **PDF download in autoplay mode**: replace the actual `download` trigger with a fake completion — show the dialog finishing and a toast "PDF generated (autoplay mode — download skipped)". The real download works when not in autoplay.

## Why this exists

You will be screen-sharing during the interview. There are three failure modes the autoplay protects against:

1. **You run out of time.** Click Watch Demo → 110 seconds, structured, no risk of fumbling.
2. **The interviewer asks "show me the punchline."** Skip to Scene 4 (the matrix).
3. **You want a perfect recording for the thank-you email.** Hit record, click Watch Demo, send the cleanest possible follow-up.

This feature is for you. Build it that way.

## Test-the-cut checklist

1. Click "Watch demo" from `/`. Cursor appears, captions appear. Backdrop is normal app, not greyed out.
2. The full 110s sequence runs without a single console error.
3. At any point, click Pause. The animation freezes including any in-flight Framer transitions.
4. Resume. Picks up where it left off.
5. Skip scene mid-Scene 2. Cursor jumps to the start of Scene 3, captions update.
6. Stop mid-demo. App returns to normal interactive state, all routes navigable.
7. Restart from the closing card. Demo runs again from Scene 1 with no leaked state.
8. Trigger a real onboarding manually after autoplay ends. The earlier autoplay-created tenant is still in the list (autoplay does not clean up its state — that's correct; it shows the system actually working).

If any of those breaks, fix it before showing the demo to anyone.

## What you do not build here

- An audio narration track. Tempting, do not.
- Multi-language captions. Hold scope.
- A "build your own demo" tool. Hold scope.
- A demo that uses fictional tenants distinct from the real mock data — same mock data, same Zustand store. Consistency is the point.
