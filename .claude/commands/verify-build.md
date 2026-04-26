---
description: Run the definition-of-done checks before declaring a screen complete
---

Before saying "I'm done" with any screen or feature, run this checklist. Do not skip steps. Do not declare done until every item passes.

## Build and lint

1. Run `pnpm build`. Zero TypeScript errors. Zero ESLint warnings. If anything fails, fix it. Don't suppress.
2. Run `pnpm lint` if configured separately. Zero issues.
3. Search the codebase for `any` (with word boundaries). Zero results in production code.
4. Search for `console.log`, `console.error`, `console.warn`. Zero results in committed code.
5. Search for `TODO`, `FIXME`, `XXX`. If any exist, list them and ask the user to confirm they're acceptable.

## Visual and interaction

6. Read CLAUDE.md's "Definition of done — per screen" section. Walk through every numbered item against the screen you just built.
7. Open the screen at 1280px viewport. Note any layout breaks.
8. Open the screen at 1440px viewport. Note any layout breaks.
9. Tab through every interactive element. Confirm focus rings are visible and tab order is logical.
10. Press Esc on any open dialog or sheet. It should close.
11. Confirm every chart has tooltip, legend, axis labels, and renders with empty data.
12. Confirm every table has empty state, loading skeleton, sort, filter, and pagination.
13. Confirm every form validates inline below fields, never in a banner.

## Data integrity

14. Confirm all numbers use the formatters from `src/lib/formatters.ts`. No raw `.toFixed()` or template-literal currency.
15. Confirm no tenant names, alerts, or other mock data are hardcoded inline. Everything reads from `mock-data.ts`.
16. Confirm `tabular-nums` class or `font-variant-numeric: tabular-nums` is applied wherever numbers appear in a list or grid.

## Scope

17. Look at what you built. Compare to the relevant interaction spec in `/docs/interaction-specs/` (if applicable). Did anything drift in?
18. If you added a feature not described in the spec or in CLAUDE.md's Phase 1 scope, surface it explicitly: "I also added X. This is out of spec — should I remove it?"

## Console

19. Open the browser console. Reload the page. Click through every interactive element. Zero errors. Zero warnings.

## Commit

20. The commit message follows conventional commits, lowercase, present tense, scope-prefixed. No emoji.

If any item fails, fix it before declaring done. If any item is ambiguous, ask the user. Don't ship soft "done" — ship hard "done."
