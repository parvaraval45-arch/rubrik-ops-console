"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import { Plus, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useConsoleStore } from "@/lib/store";
import { mockData, currentOperator } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/formatters";
import type { PolicyAssignment, Tenant } from "@/types";
import Link from "next/link";

const POLICY_FIELDS = [
  { field: "RPO", template: "1 hour" },
  { field: "RTO", template: "4 hours" },
  { field: "Retention", template: "7 years (2,555 days)" },
  { field: "Backup Frequency", template: "Hourly business / 4h overnight" },
  { field: "Encryption", template: "AES-256-GCM" },
  { field: "Immutability", template: "90-day compliance lock" },
  { field: "Air-gap", template: "Logical via Envoy" },
  { field: "Replication", template: "us-east-1 → us-west-2" },
];

interface PoliciesTabProps {
  tenant: Tenant;
  assignment: PolicyAssignment;
}

export function PoliciesTab({ tenant, assignment }: PoliciesTabProps) {
  const policy = mockData.policies.find((p) => p.id === assignment.policyId);
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  const addOverride = useConsoleStore((s) => s.addPolicyOverride);
  const resetOverrides = useConsoleStore((s) => s.resetPolicyOverrides);

  const inSync = assignment.overrides.length === 0;

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-lg border border-border-subtle bg-surface p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
              Applied Policy
            </div>
            <h2 className="mt-1 text-[18px] font-semibold text-text-primary">
              {policy?.name} v{assignment.policyVersion}
            </h2>
            <p className="mt-1 text-[12.5px] text-text-secondary">
              <span suppressHydrationWarning>
                Applied {formatRelativeTime(assignment.appliedAt)}
              </span>{" "}
              by {assignment.appliedBy}
            </p>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {["HIPAA", "NIST 800-66", "ISO-27001"].map((b) => (
                <Badge
                  key={b}
                  variant="outline"
                  className="border-transparent bg-brand-primary-subtle text-[11px] font-medium text-brand-primary-hover"
                >
                  {b}
                </Badge>
              ))}
            </div>
          </div>
          <Button asChild variant="outline" className="border-border-default">
            <Link href={`/policies?policyId=${assignment.policyId}`}>View Template</Link>
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {POLICY_FIELDS.map((f) => {
            const override = assignment.overrides.find((o) => o.field === f.field);
            return (
              <div
                key={f.field}
                className="rounded-md border border-border-subtle bg-canvas px-3 py-2.5"
              >
                <div className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
                  {f.field}
                </div>
                <div className="mt-1 text-[13px] text-text-primary">
                  {override ? override.overrideValue : f.template}
                </div>
                {override ? (
                  <div className="mt-1 text-[11px] text-status-warning">
                    Override · was {f.template}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle p-5">
          <div>
            <h3 className="text-[14px] font-semibold text-text-primary">Policy Drift</h3>
            <p className="mt-0.5 text-[12.5px] text-text-secondary">
              {inSync
                ? `In sync with template v${assignment.policyVersion}.`
                : `${assignment.overrides.length} override active.`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-2 border-border-default"
              onClick={() => setOverrideOpen(true)}
            >
              <Plus className="h-4 w-4" />
              Add Override
            </Button>
            {!inSync ? (
              <Button
                variant="outline"
                className="gap-2 border-border-default"
                onClick={() => setResetOpen(true)}
              >
                <RotateCcw className="h-4 w-4" />
                Reset to Template
              </Button>
            ) : null}
          </div>
        </div>

        {inSync ? (
          <div className="px-5 py-6 text-center text-[13px] text-text-tertiary">
            No overrides — every value matches the applied template.
          </div>
        ) : (
          <ul className="flex flex-col">
            {assignment.overrides.map((o) => (
              <li
                key={o.id}
                className="flex flex-col gap-1 border-b border-border-subtle px-5 py-3 last:border-0"
              >
                <span className="text-[13px] font-semibold text-text-primary">
                  {o.field}: {o.templateValue} → {o.overrideValue}
                </span>
                <span className="text-[12px] text-text-tertiary">
                  Overridden{" "}
                  <span suppressHydrationWarning>{formatRelativeTime(o.appliedAt)}</span>{" "}
                  by {o.appliedBy} · Reason: {o.reason}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="rounded-lg border border-border-subtle bg-surface shadow-card">
        <div className="border-b border-border-subtle px-5 py-4">
          <h3 className="text-[14px] font-semibold text-text-primary">
            Policy Change History
          </h3>
        </div>
        <ol className="flex flex-col">
          {assignment.history.map((event) => (
            <li
              key={event.id}
              className="flex items-start gap-3 border-b border-border-subtle px-5 py-3 last:border-0"
            >
              <span
                className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-primary"
                aria-hidden
              />
              <div className="flex flex-col gap-0.5 text-[12.5px]">
                <span className="font-medium text-text-primary">
                  {event.description}
                </span>
                <span className="text-text-tertiary tabular-nums" suppressHydrationWarning>
                  {format(parseISO(event.occurredAt), "MMM d, yyyy 'at' HH:mm")} ·{" "}
                  {event.actor}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <AddOverrideDialog
        open={overrideOpen}
        onOpenChange={setOverrideOpen}
        existingFields={new Set(assignment.overrides.map((o) => o.field))}
        onConfirm={(field, value, reason) => {
          const tpl = POLICY_FIELDS.find((f) => f.field === field);
          addOverride(tenant.id, {
            field,
            templateValue: tpl?.template ?? "",
            overrideValue: value,
            appliedBy: currentOperator.name,
            reason,
          });
          toast.success("Override applied", {
            description: `${field} now diverges from template — drift surfaced on /security.`,
          });
          setOverrideOpen(false);
        }}
      />

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset to Template?</AlertDialogTitle>
            <AlertDialogDescription>
              All overrides will be cleared. The tenant returns to template defaults.
              This action is logged.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="ghost" onClick={() => setResetOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-brand-primary text-white hover:bg-brand-primary-hover"
              onClick={() => {
                resetOverrides(tenant.id, currentOperator.name);
                toast.success("Reset to template");
                setResetOpen(false);
              }}
            >
              Reset
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function AddOverrideDialog({
  open,
  onOpenChange,
  onConfirm,
  existingFields,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (field: string, value: string, reason: string) => void;
  existingFields: Set<string>;
}) {
  const [field, setField] = useState<string>("");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);

  const errors = touched
    ? {
        field: !field ? "Choose a field." : null,
        value: value.trim().length < 2 ? "New value is required." : null,
        reason: reason.trim().length < 6 ? "Reason must be at least 6 characters." : null,
      }
    : { field: null, value: null, reason: null };

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) {
          setField("");
          setValue("");
          setReason("");
          setTouched(false);
        }
      }}
    >
      <AlertDialogContent className="max-w-[480px]">
        <AlertDialogHeader>
          <AlertDialogTitle>Add policy override</AlertDialogTitle>
          <AlertDialogDescription>
            Overrides take precedence over the applied template. Drift is logged
            and visible on this tenant&apos;s security posture.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <div>
            <Label className="text-[12px] font-medium text-text-primary">Field</Label>
            <Select value={field} onValueChange={setField}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Choose a field" />
              </SelectTrigger>
              <SelectContent>
                {POLICY_FIELDS.filter((f) => !existingFields.has(f.field)).map((f) => (
                  <SelectItem key={f.field} value={f.field}>
                    {f.field} <span className="text-text-tertiary">· template: {f.template}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.field ? (
              <span className="text-[12px] text-status-critical">{errors.field}</span>
            ) : null}
          </div>
          <div>
            <Label htmlFor="ovr-value" className="text-[12px] font-medium text-text-primary">
              New value
            </Label>
            <Input
              id="ovr-value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g., 10 years (3,650 days)"
              onBlur={() => setTouched(true)}
              className={errors.value ? "border-status-critical" : ""}
            />
            {errors.value ? (
              <span className="text-[12px] text-status-critical">{errors.value}</span>
            ) : null}
          </div>
          <div>
            <Label htmlFor="ovr-reason" className="text-[12px] font-medium text-text-primary">
              Reason
            </Label>
            <Textarea
              id="ovr-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g., Customer audit requires extended retention per legal hold."
              onBlur={() => setTouched(true)}
              className={errors.reason ? "border-status-critical" : ""}
            />
            {errors.reason ? (
              <span className="text-[12px] text-status-critical">{errors.reason}</span>
            ) : null}
          </div>
        </div>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
            onClick={() => {
              if (!field || value.trim().length < 2 || reason.trim().length < 6) {
                setTouched(true);
                return;
              }
              onConfirm(field, value.trim(), reason.trim());
            }}
          >
            Add Override
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
