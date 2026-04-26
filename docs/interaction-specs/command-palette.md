# Command Palette — Interaction Spec

The command palette is the single biggest polish signal in the entire app. Linear, Vercel, Notion, and Raycast all have one. If yours is well-built, the whole app feels enterprise-grade. If yours is half-built, the whole app feels like a prototype.

## Activation

- `Cmd+K` (Mac) / `Ctrl+K` (Windows) opens it
- `/` opens it (industry standard, respect it)
- The "Search…" input in the topbar (placeholder: "Search or jump to… ⌘K") opens it on click
- Esc closes it

## Layout

Centered modal, 640px wide, 480px tall max. Backdrop: `bg-slate-900/40` with backdrop-blur-sm. The palette itself: white surface, 12px radius, shadow-lg.

```
┌─────────────────────────────────────────────────────────┐
│ 🔍  Search or jump to…                            ⌘K   │
├─────────────────────────────────────────────────────────┤
│ Suggestions                                             │
│   ↳ Onboard a new tenant                          ⌘N    │
│   ↳ Run posture assessment on all tenants               │
│   ↳ Export attestation report                     ⌘E    │
│                                                         │
│ Tenants                                                 │
│   ◉ Mercy General Hospital     Gold · prod-east-2      │
│   ◉ Crawford & Associates      Silver · prod-west-1    │
│                                                         │
│ Pages                                                   │
│   →  Dashboard                                    G D   │
│   →  Tenants                                      G T   │
│   →  Capacity & Billing                           G C   │
│                                                         │
│ Recent                                                  │
│   ⏱ Northbridge Capital — viewed 2m ago                │
└─────────────────────────────────────────────────────────┘
```

Replace the search icon and arrow glyphs with lucide-react `Search`, `CornerDownLeft`, `ArrowRight`, `Clock` — no emoji.

## Sections — in this exact order

1. **Suggestions** — context-aware top picks. On `/tenants`, suggest "Onboard a new tenant" and "Bulk apply policy". On `/security`, suggest "Run posture assessment" and "Export attestation report". On `/capacity`, suggest "Generate invoices". Three suggestions max.
2. **Tenants** — fuzzy match on tenant name, alias, region. Show top 5.
3. **Pages** — every nav route, with a `G [letter]` shortcut hint (G then D for Dashboard, etc. — implement these as keyboard shortcuts globally).
4. **Actions** — actions that aren't tied to a tenant or page: "Generate invoices", "Create policy template", "Open audit log", "Toggle density", etc.
5. **Recent** — last 5 visited tenants or pages, persisted in Zustand session state.

If a query is typed, fuzzy-rank across all sections and re-group results. Empty query → show the layout above.

## Fuzzy match

Use `fuse.js`. Fields to search:
- Tenants: name, alias, region, tier, assigned cluster
- Pages: title, route path
- Actions: name, synonyms (give "Onboard" the synonyms ["new tenant", "create tenant", "add tenant"])

Match score threshold: 0.4. Highlight matched characters in the result label with `<mark>` styled as `bg-emerald-100 text-emerald-900`.

## Keyboard

- `↑` / `↓` move selection (wraps within the open list)
- `Enter` executes the selected item
- `Tab` does nothing — Tab and Enter doing different things is a common bug; don't have it
- `Esc` closes the palette
- `Cmd+Backspace` clears the query
- Letter keys after a `G` press globally (outside the palette) trigger nav: `G` then `D` → Dashboard, `G` then `T` → Tenants, etc. Show a brief 600ms toast "Press D, T, C…" if the user holds G alone.

## Selection

The selected row has `bg-slate-100` background, primary-color left border (3px), and the right side shows a small `↵` glyph indicating Enter executes. No box-shadow, no scale.

Mouse hover changes selection — keyboard and mouse stay in sync. Don't have separate `:hover` and `[aria-selected]` styles.

## Item shape

```ts
type CommandItem = {
  id: string;
  section: 'suggestions' | 'tenants' | 'pages' | 'actions' | 'recent';
  label: string;
  hint?: string;          // e.g. "Gold · prod-east-2"
  shortcut?: string[];    // e.g. ["⌘", "N"]
  icon: LucideIcon;
  execute: () => void;    // navigation, action, etc.
  keywords?: string[];    // for fuzzy match
};
```

The execute function handles its own side effects. Most items navigate (`router.push`); some open dialogs (the "Generate invoices" item routes to `/capacity` and triggers the dialog via search params).

## Closing behavior

After an item executes:
- For navigation items: palette closes immediately (no animation needed; the route change is the feedback)
- For action items that open another dialog: palette closes with a 100ms fade, then the dialog opens after a 50ms gap (so they don't visually overlap mid-animation)
- For action items that perform a synchronous task (toggle density): palette closes immediately and a small toast confirms

## What goes in Actions — the full list

This is small. Build all of them.

- **Onboard a new tenant** → `/onboarding/new`
- **Run posture assessment on all tenants** → triggers a 4-second progress toast that finishes with "Assessment complete. 2 new violations found." then deep-links to `/security?filter=new`
- **Export attestation report** → opens the export dialog on `/security` (route there if not already)
- **Generate invoices** → routes to `/capacity` and opens the generate-invoices dialog
- **Create policy template** → opens the create-template dialog on `/policies`
- **Open audit log** → `/audit`
- **Toggle density** → flips Compact / Comfortable in Settings (via Zustand) and shows a toast "Density: Compact"
- **Toggle theme** → only if you build dark mode (skip — hold scope)

That's it. Eight actions. Don't add more for the demo.

## Why this matters in the interview

The interviewer will Cmd+K within the first 30 seconds of looking at your demo. If it doesn't open, every other piece of polish you built doesn't matter — they've already filed your prototype as "not actually production grade." If it opens and works smoothly, they'll spend the next 5 minutes exploring instead of asking what's underneath.

This is one of the highest leverage screens in the entire app, and it's the easiest one to get wrong by underbuilding it. Build it past comfortable.

## Test-the-cut checklist

1. Press Cmd+K from any route. Palette opens centered.
2. Empty query shows all five sections in order.
3. Type "merc". Mercy General Hospital is the top result, with "merc" highlighted.
4. Arrow down twice. Selection visibly tracks. Mouse-hover another row mid-keypress: selection follows mouse.
5. Press Enter on a tenant. Palette closes. Route is `/tenants/[id]`.
6. Reopen palette. Type "ats". "Run posture assessment" matches via synonyms.
7. Press Enter. Toast appears. Posture assessment runs (4s progress). Routes to `/security?filter=new`.
8. Reopen. Press Esc. Palette closes. Focus returns to where it was.
9. From any page, press G then T (with no palette open). Routes to `/tenants`.
10. Press G alone, hold for 700ms. A hint toast appears showing available letters.

If any of those is missing or janky, it is not done.
