---
name: forms
description: Use this skill when building any form, wizard, or input flow in the Rubrik MSP project. Triggers on the onboarding wizard, policy template editor, settings, billing config, or any input collection. Establishes the form library, validation pattern, error display, multi-step navigation, and review step conventions.
---

# Forms Skill — Rubrik MSP

Reference standard: Stripe Dashboard's settings, Linear's issue creation, Vercel's project setup. Forms in this app should feel like state-of-the-art SaaS, not like a 2015 admin panel.

## The stack

- **react-hook-form** for state and submission
- **zod** for schema and validation, integrated via `@hookform/resolvers/zod`
- **shadcn/ui Form components** for layout (Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage)
- No Formik. No raw `useState`-driven forms. No HTML5 validation alone.

## Single-form pattern

```tsx
const schema = z.object({
  tenantName: z.string().min(2).max(80),
  region: z.enum(["us-east", "us-west", "eu-central", "apac-singapore"]),
  tier: z.enum(["gold", "silver", "bronze"]),
  capacityCommitTB: z.number().min(1).max(500),
});

type FormValues = z.infer<typeof schema>;

const form = useForm<FormValues>({
  resolver: zodResolver(schema),
  defaultValues: { /* … */ },
  mode: "onBlur",
});
```

`mode: "onBlur"` for validation. Not `onChange` (too noisy), not `onSubmit` (too late).

## Validation messages

Validation messages are written in plain language. They match what a Service Delivery Manager would expect to read.

Bad: `String must contain at least 2 character(s)`
Good: `Tenant name must be at least 2 characters`

Bad: `Required`
Good: `Choose a region`

Bad: `Invalid input`
Good: `Capacity commit must be between 1 and 500 TB`

Define custom messages in the zod schema using `.min(2, { message: "Tenant name must be at least 2 characters" })`. Don't rely on defaults.

## Error display

- Inline, **below** the field, in `text-red-600` 12px
- Never in a banner at the top
- Never in a toast
- Never in a modal
- The field's border becomes `border-red-500` on error
- The label color does not change

Show errors only after blur on the first interaction. After the first submit attempt, show errors on every change (the user is now actively trying to submit, so help them).

## Required vs optional

All fields are assumed required. Optional fields are explicitly marked with `(optional)` in the label, in `text-slate-400`. Don't use asterisks for required — that's the wrong default.

## Field ordering

Fields are ordered by reading flow, not by data model. For onboarding step 1: name → legal entity → industry → region → contact → tier. Not name → contact → tier → region → legal entity, even if that matches the database schema.

## Wizard layout — the onboarding case

The wizard uses a **left vertical stepper, right content panel, sticky footer** layout.

```
┌────────────────┬─────────────────────────────────────────────┐
│ ✓ 1. Tenant    │  Step 3 of 6 — Policy Template              │
│ ✓ 2. Infra     │                                             │
│ ◐ 3. Policy    │  [content for step 3]                       │
│ ○ 4. Isolation │                                             │
│ ○ 5. Billing   │                                             │
│ ○ 6. Review    │                                             │
│                │                                             │
├────────────────┴─────────────────────────────────────────────┤
│ [< Back]                          [Save draft]  [Next >]     │
└──────────────────────────────────────────────────────────────┘
```

Stepper item states:
- **Done**: filled green circle with check, label `text-slate-900`
- **Active**: outlined primary-color circle with the step number, label `text-slate-900` semibold
- **Pending**: outlined slate-300 circle with the step number, label `text-slate-400`

You can click any *Done* step to revisit it. Pending steps are not clickable. The current step's Next button is disabled until validation passes.

## Multi-step state

Use a single react-hook-form instance for the entire wizard, with the schema as a discriminated union per step. Don't create six separate forms — that loses cross-step values.

`form.trigger(["fieldA", "fieldB"])` to validate just the current step's fields before advancing. If validation fails, scroll the first error into view and focus its field.

## Save draft

Every wizard has a Save Draft button in the footer. Clicking saves current values to Zustand's drafts slice with a timestamp. On wizard mount, if a draft exists, show a banner: "Continue from where you left off — last saved 14 minutes ago. [Resume] [Start over]".

For Phase 1: drafts persist in memory only (no localStorage per CLAUDE.md). That's fine — surface the limitation in the UI: "Drafts are kept for this session only."

## Review step

The final step before submit is always a structured review, never a "click submit and pray" moment. Review step rules:

- Sections collapsible, all expanded by default
- Each section has an "Edit" link in the top-right that jumps back to that step (preserving entered values)
- Estimated outcomes are surfaced: "Estimated provisioning time: 18 minutes", "This tenant will consume ~12 TB of cluster prod-east-2"
- The submit button is disabled until any unresolved warnings are acknowledged via checkboxes

## Field types — patterns

### Text input
shadcn `Input`. Placeholder is example-style ("e.g., Mercy General Hospital"), never instruction ("Enter tenant name").

### Numeric input
shadcn `Input` with `type="number"`. Always paired with a unit label inline-right (e.g., `[ 100 ] TB`). Use `inputMode="numeric"` for mobile.

### Select
shadcn `Select`. Limit to 5–8 options before switching to Combobox.

### Combobox (searchable select)
shadcn `Command` inside `Popover`. Use this for "Industry", "Region" if it ever exceeds 8, and any tenant or operator picker.

### Multi-select
shadcn `Command` with checkboxes. Selected items appear as removable chips above the input.

### Card-based selectors (tier, cluster, template)
For high-stakes selections where the choice matters, use cards instead of dropdowns. Each card is selectable, shows the option's key attributes, and the selected card has a primary-color border + faint primary background. Tier selection is the canonical example — Gold/Silver/Bronze each as a card showing SLA, RPO, RTO, retention, encryption.

### Toggle
shadcn `Switch`. Use only for boolean, immediate-effect settings (e.g., "Enforce MFA"). Never for branching form logic — use a radio for that.

### Radio
shadcn `RadioGroup`. Use for 2–4 mutually exclusive options that materially branch the form.

## Save and submit

The submit button label is action-specific:
- Onboarding: "Deploy Tenant"
- Template editor: "Publish v3.3"
- Settings: "Save changes"

Never just "Submit". Never just "OK".

After submit:
- Disable the button
- Replace the label with the verb in progress tense: "Deploying…", "Publishing…", "Saving…"
- Show an inline spinner inside the button (16px, slate-500)
- On success: navigate or show a success state (specific to the form)
- On error: re-enable the button, show an inline error above the form footer in `text-red-600`

## What you do not do

- No "Are you sure?" confirms for non-destructive saves
- No "Form validation failed" toasts — the inline errors are the message
- No fields hidden by default and revealed by toggles, *unless* genuinely advanced (encryption algorithm choice). When you do hide: use a `Show advanced options` collapsible link, never a tiny gear icon.
- No `<form onSubmit={...}>` with `<button>Submit</button>` — react-hook-form's `<Form>` and `form.handleSubmit` is the only path.
