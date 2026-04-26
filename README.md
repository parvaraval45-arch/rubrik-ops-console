# Rubrik MSP Scaffolding — How to Use

This bundle is the discipline scaffolding for the Rubrik MSP Operations Console build. Drop these files into your fresh Next.js project before running Claude Code's first prompt.

## What's in here

```
CLAUDE.md                                   ← project constitution, read every turn
.claude/
  skills/
    data-viz/SKILL.md                       ← charts and KPI cards
    forms/SKILL.md                          ← onboarding wizard, template editor
    tables/SKILL.md                         ← all tables app-wide
    isolation-matrix/SKILL.md               ← the hero feature
  commands/
    check-scope.md                          ← /check-scope slash command
    match-design.md                         ← /match-design slash command
    verify-build.md                         ← /verify-build slash command
docs/
  interaction-specs/
    isolation-drilldown.md                  ← matrix click-to-sheet UX
    deploy-animation.md                     ← onboarding deploy flow
    version-diff.md                         ← policy template versioning
    command-palette.md                      ← Cmd+K behavior
    autoplay-demo.md                        ← the hidden interview move
  references/
    README.md                               ← what screenshots to drop in
```

## Setup — do this once

1. Create your Next.js project (`pnpm create next-app rubrik-ops-console`).
2. Copy this entire scaffolding folder's contents into the project root, preserving structure. `CLAUDE.md` goes at root; `.claude/` and `docs/` go at root too.
3. Drop reference screenshots into `docs/references/` per that folder's README.
4. Commit. Title: `chore: project scaffolding and constitution`.

## Setup — verify Claude Code sees the skills

Open Claude Code in the project root. Ask: "What skills are available in this project?" It should list all four. If it doesn't, the folder structure is wrong — `.claude/skills/<name>/SKILL.md` is the exact path Claude Code expects.

Verify slash commands by typing `/`. You should see `check-scope`, `match-design`, `verify-build` in the autocomplete.

## How to use during the build

### Before any new feature

Run `/check-scope`. It forces you to confirm the work belongs to one of the five Phase 1 capabilities before any code is written.

### Before any styling

Run `/match-design`. It forces re-grounding in the design tokens and the relevant reference screenshot.

### Before declaring a screen done

Run `/verify-build`. It walks the definition-of-done checklist: build clean, no `any`, focus rings, empty states, etc.

### When starting one of the four tricky flows

Tell Claude Code: "Read `/docs/interaction-specs/[X].md` and the relevant SKILL.md before writing any code." This is the single most leverage-y instruction you can give. It compresses 1000-token prompts into 50-token prompts because all the design constraints already live in files Claude can read.

For example, instead of writing a giant prompt about the matrix, write:

> Build the Isolation Verification Matrix at `/security`. Read `/docs/interaction-specs/isolation-drilldown.md` and `.claude/skills/isolation-matrix/SKILL.md` first. Then implement, following both files exactly. When done, run `/verify-build`.

That's it. The files do the heavy lifting.

## How to use during the build — the rewritten 8-prompt sequence

Your existing 8 build prompts (Prompt 0 through Prompt 8) are aimed at breadth. With this scaffolding in place, they get shorter and depth-aimed. The prompts now reference the skills and specs by path instead of restating their contents.

Example — old Prompt 4 (Onboarding Wizard) was ~250 words restating the wizard structure. New Prompt 4 is ~60 words:

> Build the onboarding wizard at `/onboarding/new`. Follow `.claude/skills/forms/SKILL.md` for the form patterns and `/docs/interaction-specs/deploy-animation.md` for the deploy flow. The wizard's six steps are listed in CLAUDE.md's scope section. Mock data writes go through `src/lib/store.ts`. When done, run `/verify-build` and confirm the failure path works via the `?simulate=fail-step-3` query param.

The leverage compounds: every prompt is shorter, every prompt is more specific, every prompt re-grounds in the same source of truth.

## What to do when Claude Code drifts

It will drift. Even with all this scaffolding, around Prompt 5 or 6 the output starts to wobble — slightly off colors, slightly off spacing, slightly off interaction patterns. This is expected.

When it happens:

1. Stop. Don't accept the drift.
2. Tell Claude Code: "Re-read `CLAUDE.md` and the relevant skill. Compare the screen you just built against [reference screenshot]. Identify three specific drift points. Fix them."
3. This is a 5-minute correction that prevents an afternoon of accumulating drift.

## What this bundle is not

- It's not a code generator. Nothing here outputs Next.js code.
- It's not a substitute for thinking. You still own the strategic calls.
- It's not exhaustive. There are dozens of UX micro-decisions not specified here. Trust your judgment on those, and update CLAUDE.md if you make a recurring decision worth locking.

## The interview frame

You're being evaluated on judgment, not artifact volume. The hiring manager round at Rubrik with the CPO is about whether you have the discipline to ship Phase 1 and hold the line on scope. This scaffolding is the externalized version of that discipline. Use it.

When asked "why did you build it this way?" your answer is in these files. You can show them. That itself is a strong PM signal.
