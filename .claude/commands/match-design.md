---
description: Re-ground in design tokens and references before any styling work
---

Before writing any styling, layout, or visual code, perform this re-grounding:

1. Read the "Design tokens" section of `CLAUDE.md` in full. Restate the locked color palette, radii, and shadow rules in your own words to confirm.

2. List the files in `/docs/references/`. For the screen you're about to build, identify the most relevant 1–2 reference screenshots. View them.

3. Read the relevant skill from `.claude/skills/`:
   - Building a chart, KPI, or dashboard tile → `data-viz/SKILL.md`
   - Building a form or wizard → `forms/SKILL.md`
   - Building a table or list → `tables/SKILL.md`
   - Building the matrix → `isolation-matrix/SKILL.md` and the matching interaction spec

4. State the visual contract you're going to follow in three sentences. Specifically: what color treatment, what spacing rhythm, and what reference you're matching.

5. Now begin styling work.

Why: Claude Code's failure mode in long projects is gradual visual drift — every screen looks slightly different from the last. This re-grounding step costs ~30 seconds and prevents an entire afternoon of "make it match" rework.

The user will trust your output if every screen looks like it came from the same design team. They will lose trust the moment two screens look like cousins instead of siblings.
