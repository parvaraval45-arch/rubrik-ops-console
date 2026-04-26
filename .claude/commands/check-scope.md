---
description: Verify a proposed feature is in Phase 1 scope before building it
---

You are about to start work that may or may not be in scope. Before writing any code:

1. Read `CLAUDE.md` (project root). Re-read the "Phase 1 scope — the only five things that exist" section.
2. Identify which of the five capabilities the proposed work belongs to:
   - Onboarding wizard
   - Multi-tenant dashboard
   - Capacity & billing reconciliation
   - Isolation verification matrix
   - Policy templates with versioning
   - Polish layer (command palette, audit log, bulk actions, keyboard nav, density toggle, empty states)
   - Autoplay demo

3. If the proposed work fits one of these, say "In scope: [capability]" and proceed.

4. If the proposed work does **not** fit, do not improvise. Instead, write a short message to the user:

```
This is out of Phase 1 scope.

Requested: [describe what was asked]
Closest in-scope capability: [name it]
What it would look like in scope: [describe a smaller, in-scope version]
What it would look like in Phase 2/3: [describe the original ask, rephrased as future work]

Holding on this until you confirm.
```

5. Wait for the user to confirm before any file creation or edit.

This command exists because mid-build scope drift is the single biggest risk to the interview narrative. The candidate's thesis is "I shipped exactly what my strategy doc said." Every out-of-scope feature weakens that thesis. Every refused out-of-scope ask strengthens it.
