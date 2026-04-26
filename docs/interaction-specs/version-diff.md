# Policy Template Version Diff — Interaction Spec

The strategy doc claims "template inheritance with auditable per-tenant diffs" as a competitive wedge. This UI is what makes that claim demonstrable. The reference is Google Docs version history, not GitHub diff.

## Where this lives

Inside the Edit Template dialog (opened from a card on `/policies`). The dialog has tabs:

```
[ General ] [ Protection Rules ] [ Storage ] [ Security ] [ Compliance ] [ Versions ]
```

The Versions tab is the focus of this spec.

## Layout — Versions tab

Two-pane layout:

```
┌──────────────────────────┬─────────────────────────────────────┐
│ Version list             │ Diff viewer                         │
│ (320px sticky left)      │ (flex-1)                            │
│                          │                                     │
│ ▼ v3.2 (current)         │  Comparing v3.1 → v3.2              │
│   2 days ago             │                                     │
│   by Sarah Chen          │  Protection Rules                   │
│   [12 tenants affected]  │  + RPO: 4h → 1h                     │
│                          │  + Backup frequency: daily → 4x/day │
│   v3.1                   │                                     │
│   3 weeks ago            │  Security                           │
│   by Marcus Patel        │  ~ Encryption: AES-256 (unchanged)  │
│   [12 tenants affected]  │  + Immutability: 7d → 30d           │
│                          │                                     │
│   v3.0                   │  Compliance Mappings                │
│   2 months ago           │  + Added: HIPAA §164.312(c)(1)      │
│   by Sarah Chen          │                                     │
│   [10 tenants affected]  │  ─────────────────────────────────  │
│                          │  Change impact preview:             │
│   v2.4                   │  This version affects 12 tenants.   │
│   ...                    │  3 will hit overage on new RPO.     │
│                          │  See affected tenants ↓             │
│                          │                                     │
│                          │  [Discard] [Save as draft] [Publish]│
└──────────────────────────┴─────────────────────────────────────┘
```

## Version list — left pane

Each version is a card, 72px tall:

- Top line: version number (`v3.2`), bold. If current published version: small `current` pill in primary color.
- Middle: relative time, secondary text color.
- Bottom: editor name with avatar, tenants-affected count.

Hover: `bg-slate-50`. Selected: `bg-emerald-50` with a 2px left border in primary color. Click selects that version as the **comparison base** — the right pane updates to show "Comparing [selected] → [current]".

You can select two versions to compare arbitrary pairs (Cmd+click the second one). The compare label updates accordingly.

A small "Compare with current" button in the top-right of each card resets the comparison to "[this version] → current".

## Diff viewer — right pane

This is **not** a line-by-line code diff. It is a structured semantic diff. The user is a Service Delivery Manager, not a developer. They need to see "what changed about the policy", not "what bytes changed in YAML".

Sections of the diff, in order:

1. **Protection Rules** (RPO, RTO, backup frequency, retention)
2. **Storage** (primary, archive, replication targets)
3. **Security** (encryption algorithm, immutability lock, air-gap)
4. **Compliance Mappings**
5. **Metadata** (name, description, tags) — collapsed by default

Each row in a section is a single change, with a glyph and color:

- `+` green: value added or increased
- `-` red: value removed
- `~` slate: value modified (shown as `before → after`)
- ` ` (no glyph) slate-tertiary: shown only when explicitly toggled with a "Show unchanged" switch at the top

For numeric changes that improve protection (lower RPO, longer immutability), use `+` green. For numeric changes that loosen protection, use `-` red even if the number is larger — semantics, not arithmetic.

If a section has no changes, the section header is rendered in `text-slate-400` with text "No changes" inline. Don't omit the section.

## YAML view toggle

Top-right of the diff viewer, a segmented control: `[ Semantic ] [ YAML ]`.

In YAML mode, render a unified diff with line numbers, monospace font, syntax-highlighted (use `react-syntax-highlighter` with a Linear-style theme — light slate background, conservative palette, no neon colors). This is for the rare power user who wants raw fidelity.

The Semantic view is the default. Hold the line on this — most users will never click YAML, and that's correct.

## Change impact preview

Below the diff sections, before the action buttons. A small panel:

```
Change impact preview
─────────────────────
This version will affect 12 tenants.
3 tenants will exceed their commit on the new RPO.
1 tenant has a per-tenant override that will be preserved.
0 tenants are currently mid-backup.

[See affected tenants ▼]
```

The expand chevron reveals a table:

| Tenant                  | Tier   | Override status     | Impact                |
|-------------------------|--------|---------------------|-----------------------|
| Mercy General Hospital  | Gold   | None                | Will adopt new RPO    |
| Crawford & Associates   | Silver | Custom retention    | Override preserved    |
| Northbridge Capital     | Gold   | None                | Will exceed commit    |
| ...                     |        |                     |                       |

This table is read-only, scrollable, max 320px tall.

## Per-tenant override — handled in the same UI

When a tenant has a per-tenant override of a template, that override has its own micro-version log shown on the **tenant detail page** under the Policies tab. Same diff component, scoped.

Override states:

- **Inherited**: tenant uses the template directly. Card shows template version and an "Override" button.
- **Overridden**: tenant has diverged. Card shows "Custom (forked from v3.1)" and a "Reset to template" button. Below: a mini-diff showing what differs from the template.

When the parent template publishes a new version, overridden tenants are **not** auto-updated. Instead, the tenant detail page surfaces a banner: "Parent template updated to v3.2. Review and merge." Clicking shows the standard 3-way diff: template v3.1 → template v3.2, alongside the override delta. The user can choose:

- **Merge new template, keep override** (default)
- **Merge new template, discard override**
- **Stay on v3.1**

This is the kind of flow that signals "this person has thought about real MSP operations." Build it. It's small and it's the difference.

## Publishing

The Publish button at the bottom of the diff viewer is gated:

- Disabled if no changes
- Shows a confirm dialog: "Publish v3.3? This will affect 12 tenants. 3 will exceed commit on the new RPO."
- On confirm: 600ms animation across affected tenants — small green pulse on each tenant in the impact table, sequenced left-to-right (subtle, not distracting). Then a toast: "v3.3 published. 12 tenants updated."

Discard wipes the draft. Save as draft creates an unpublished version visible only to the editor.

## Keyboard

- `Cmd+S` — save as draft
- `Cmd+Shift+P` — publish (with confirm)
- `Cmd+/` — toggle Semantic / YAML view
- `Esc` — close the dialog (with unsaved-changes confirm if dirty)

## What you do not build here

- A real Git-style branching model. There is one linear version history per template.
- Inline commenting / review threads. (Phase 2.)
- Rollback to old version. (Pin a "Restore this version as draft" button on each old version card; clicking creates a new draft from that version. Not the same as true rollback.)

## Test-the-cut checklist

1. Open `/policies`, click any template card → edit dialog
2. Click Versions tab. List of versions visible.
3. Click an older version. Right pane shows semantic diff.
4. Cmd+click another version. Compare label updates to that pair.
5. Toggle to YAML view. Real syntax-highlighted diff renders.
6. Toggle back. Make a change in any other tab (e.g., change RPO).
7. Return to Versions. Diff now shows current draft vs. published.
8. Click Publish. Confirm dialog with impact summary.
9. Confirm. Tenant pulse animation runs. Toast appears.
10. Navigate to a tenant that uses this template. Banner says "Parent template updated."

If any step stalls, it's not done.
