# Rubrik MSP Operations Console — Project Constitution

You are building a production-quality enterprise SaaS demo for a Product Management internship interview at Rubrik. This file is your contract. Read it at the start of every task. If anything in a user prompt contradicts this file, surface the conflict before acting.

## What this is

A Phase 1 implementation of the "Rubrik MSP Operations Console" strategy doc. The interview narrative is: "I shipped exactly what my strategy doc said I'd ship in Phase 1. Nothing more, nothing less." Scope discipline is the product.

## Quality bar

Match Linear, Datadog, Vercel, Stripe Dashboard. Reference screenshots live in `/docs/references/`. Before styling any new screen, view at least one reference image. If the work does not visibly match that bar, it is not done.

Hard rules:
- No emojis anywhere in UI, code, comments, or commit messages
- No `any` types. Ever. Use `unknown` and narrow, or define the type
- No inline styles. Tailwind utility classes only
- No Lorem Ipsum, no "TODO" placeholders, no mock data outside `src/lib/mock-data.ts`
- No console.log in committed code
- Tabular-nums on every number (capacity, currency, percentages, counts)
- Inter font, loaded via `next/font`
- Loading skeletons, not spinners
- Empty states have intent, not just "No data"

## Stack lock

These are not suggestions. Do not substitute.

- Next.js 14+ App Router, TypeScript strict mode
- Tailwind CSS, shadcn/ui (only — no Material UI, Chakra, Mantine, Radix raw)
- lucide-react for icons (no other icon libraries)
- recharts for charts (or hand-built SVG only when recharts cannot deliver the polish)
- @tanstack/react-table for all tables
- react-hook-form + zod for all forms
- @faker-js/faker with deterministic seed for mock data
- date-fns for time formatting
- framer-motion for the deploy animation and matrix remediation only — not decoratively
- pnpm

## Design tokens

Locked. Do not invent new colors, radii, or shadows.

```
bg:        #F7F8FA
surface:   #FFFFFF
border:    #E2E8F0
text:      #0F172A (primary), #475569 (secondary), #94A3B8 (tertiary)
primary:   #00B67A (hover #009966)
critical:  #DC2626
warning:   #D97706
success:   #059669
info:      #2563EB

radius:    6px default, 8px cards
shadow:    shadow-sm on cards, none elsewhere
font:      Inter, tabular-nums on all numerics
```

## Phase 1 scope — the only five things that exist

Anything outside these five is rejected. If a prompt asks you to build something else, stop and surface the conflict.

1. **Onboarding wizard** that runs end-to-end. Creates a real tenant in mock state.
2. **Multi-tenant dashboard** with clickable health donut and drillable alerts.
3. **Capacity & billing reconciliation** with side-sheet line-item breakdowns.
4. **Isolation verification matrix** — the hero. Clickable cells, drill-down, remediate, attestation export.
5. **Policy templates with versioning** — diff view, change-impact preview, propagation.

Plus a polish layer (command palette, audit log, bulk actions, keyboard nav, density toggle) and an autoplay demo mode. Nothing else.

Explicitly out of scope:
- Ransomware recovery flows
- AI alert triage / agentic copilots / always-on operator copilot
- Workflow studio / n8n-style editors
- Post-incident AI report generators
- White-label end-customer portal
- PSA/RMM integrations beyond CSV export
- Anything described as "Phase 2" or "Phase 3" in the strategy doc

If you find yourself wanting to add something "small" that isn't on this list, stop. The interviewer will read scope creep as a thesis defense problem.

## Working directory contract

```
/src/app/                  Next.js routes, one folder per route
/src/components/shell/     Sidebar, topbar, command palette, breadcrumbs
/src/components/ui/        shadcn primitives (do not customize directly)
/src/components/charts/    Reusable chart wrappers
/src/components/data-table.tsx   Single generic table, all tables reuse it
/src/lib/mock-data.ts      All mock data, deterministic faker seed
/src/lib/formatters.ts     formatTB, formatPercent, formatCurrency, formatRelativeTime
/src/lib/store.ts          Zustand store for cross-screen state (new tenant after deploy, etc.)
/src/types/index.ts        All shared types
/src/hooks/                Reusable hooks
/.claude/skills/           Project-specific skills you must load before relevant work
/docs/interaction-specs/   The five interaction scripts. Read before building each one.
/docs/references/          Visual reference screenshots
```

## Skills — load before relevant work

Skills live in `.claude/skills/`. Before starting work in any of these areas, view the matching `SKILL.md`:

- Building any chart, KPI card, or data viz → `.claude/skills/data-viz/SKILL.md`
- Building any form (onboarding wizard, template editor, settings) → `.claude/skills/forms/SKILL.md`
- Building any table or list view → `.claude/skills/tables/SKILL.md`
- Building the isolation matrix → `.claude/skills/isolation-matrix/SKILL.md` AND `/docs/interaction-specs/isolation-drilldown.md`
- Building the onboarding deploy flow → `/docs/interaction-specs/deploy-animation.md`
- Building policy versioning → `/docs/interaction-specs/version-diff.md`
- Building the command palette → `/docs/interaction-specs/command-palette.md`
- Building the autoplay demo → `/docs/interaction-specs/autoplay-demo.md`

Failing to load the relevant SKILL.md before writing code is the single biggest cause of off-spec output. Do it every time.

## Definition of done — per screen

Before marking any screen complete:

1. `pnpm build` runs clean. Zero TypeScript errors. Zero ESLint warnings.
2. All numbers use tabular-nums and the formatters in `src/lib/formatters.ts`
3. Empty state, loading skeleton, error state all implemented
4. Every interactive element has a visible focus ring and a hover state
5. Escape closes any open dialog or sheet
6. Every form validates inline below fields, not in a banner
7. Every table has empty state, skeleton, sort, filter, pagination
8. Every chart has tooltip, legend, axis labels, and handles empty data
9. Responsive at 1280px and 1440px (this is a desktop product, ignore mobile)
10. Manually clicked through, no console errors or warnings

## Forbidden patterns

If you would otherwise reach for these, stop and ask.

- `as any` casts to silence TypeScript
- `dangerouslySetInnerHTML`
- Custom Tailwind plugins outside the design tokens
- Animations longer than 600ms (feels slow) or shorter than 120ms (feels broken)
- Modal dialogs for anything that could be a side sheet (sheets preserve context; dialogs interrupt)
- Toasts for anything destructive (use a confirm dialog)
- Spinners (use skeletons)
- Emoji in any commit message, comment, or string
- Repeating tenant names across screens (read from mock-data.ts; never hardcode)

## Commit hygiene

Conventional commits, lowercase, present tense, scope-prefixed.

Good: `feat(onboarding): wizard step 4 isolation preview`
Good: `fix(matrix): remediate animation duration`
Bad: `Updated stuff`
Bad: `feat: a bunch of polish 🎨`

One commit per logical unit. Do not bundle unrelated changes.

## When in doubt

The interviewer is the CPO of Rubrik (Anneka Gupta, ex-LiveRamp President, teaches PM at Stanford GSB). Build for her bar. She will not read 14 half-built screens. She will read two flows that work end-to-end and judge that as a higher signal of judgment than artifact volume.

Hold the line on scope. Hold the line on quality. Ask before adding.
