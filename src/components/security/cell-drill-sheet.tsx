"use client";

import { useState } from "react";
import { format, parseISO } from "date-fns";
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ClipboardCheck,
  Clock,
  Download,
  Flag,
  Shield,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useConsoleStore } from "@/lib/store";
import { ISOLATION_CONTROLS, currentOperator, mockData } from "@/lib/mock-data";
import { formatRelativeTime } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { RemediationPanel } from "./remediation-panel";
import type {
  IsolationCell,
  IsolationCellStatus,
  Tenant,
} from "@/types";

interface CellDrillSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenant: Tenant | null;
  cell: IsolationCell | null;
}

const STATUS_BADGE: Record<IsolationCellStatus, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
  pass: { label: "PASS", cls: "bg-status-success-subtle text-status-success", icon: CheckCircle2 },
  warn: { label: "WARN · MEDIUM", cls: "bg-status-warning-subtle text-status-warning", icon: AlertTriangle },
  fail: { label: "FAIL · CRITICAL", cls: "bg-status-critical-subtle text-status-critical", icon: AlertOctagon },
  remediating: { label: "REMEDIATING", cls: "bg-brand-primary-subtle text-brand-primary-hover", icon: ClipboardCheck },
};

export function CellDrillSheet({ open, onOpenChange, tenant, cell }: CellDrillSheetProps) {
  const remediating = useConsoleStore(
    (s) =>
      cell &&
      tenant &&
      s.matrixCells.find((c) => c.tenantId === tenant.id && c.controlId === cell.controlId)
        ?.status === "remediating",
  );

  const setMatrixStatus = useConsoleStore((s) => s.setMatrixCellStatus);
  const markFalsePositive = useConsoleStore((s) => s.markCellFalsePositive);
  const snoozeCell = useConsoleStore((s) => s.snoozeCell);

  const [confirmRemediation, setConfirmRemediation] = useState<{ note: string; notified: boolean } | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [remediationActive, setRemediationActive] = useState(false);

  const [falsePositiveOpen, setFalsePositiveOpen] = useState(false);
  const [snoozeOpen, setSnoozeOpen] = useState(false);

  if (!tenant || !cell) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="flex w-full p-0 sm:max-w-[560px]">
          <div />
        </SheetContent>
      </Sheet>
    );
  }

  const control = ISOLATION_CONTROLS.find((c) => c.id === cell.controlId);
  const StatusIcon = STATUS_BADGE[cell.status].icon;

  const onCloseSheet = () => {
    if (remediationActive) return;
    onOpenChange(false);
  };

  const onStartRemediation = () => {
    setConfirmDialogOpen(true);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onCloseSheet}>
        <SheetContent
          side="right"
          className="flex w-full flex-col overflow-hidden p-0 sm:max-w-[560px]"
        >
          <SheetHeader className="border-b border-border-subtle p-6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-md",
                    cell.status === "fail"
                      ? "bg-status-critical-subtle"
                      : cell.status === "warn"
                        ? "bg-status-warning-subtle"
                        : "bg-status-success-subtle",
                  )}
                >
                  <StatusIcon
                    className={cn(
                      "h-5 w-5",
                      cell.status === "fail"
                        ? "text-status-critical"
                        : cell.status === "warn"
                          ? "text-status-warning"
                          : "text-status-success",
                    )}
                  />
                </span>
                <div className="flex flex-col gap-1">
                  <Badge
                    variant="outline"
                    className={cn(
                      "w-fit border-transparent text-[10.5px] uppercase tracking-wide",
                      STATUS_BADGE[cell.status].cls,
                    )}
                  >
                    {STATUS_BADGE[cell.status].label}
                  </Badge>
                  <h2 className="text-[15px] font-semibold leading-snug text-text-primary">
                    {tenant.name}
                  </h2>
                  <p className="text-[12px] text-text-tertiary">
                    {control?.label} Isolation · Last checked{" "}
                    <span suppressHydrationWarning>
                      {formatRelativeTime(cell.lastEvaluatedAt)}
                    </span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onCloseSheet}
                aria-label="Close"
                className="inline-flex h-7 w-7 items-center justify-center rounded-md text-text-tertiary hover:bg-secondary hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            {remediationActive || remediating ? (
              <RemediationPanel
                tenant={tenant}
                controlId={cell.controlId}
                steps={cell.violation?.remediationSteps ?? []}
                beforeScore={tenant.securityScore}
                beforeStatusLabel={STATUS_BADGE[cell.status].label}
                note={confirmRemediation?.note ?? ""}
                onComplete={() => {
                  setRemediationActive(false);
                  toast.success(`Isolation remediated for ${tenant.name}`, {
                    description: "Compliance ledger updated. Audit entry logged.",
                  });
                }}
              />
            ) : cell.status === "pass" ? (
              <PassEvidence cell={cell} />
            ) : (
              <ViolationView cell={cell} />
            )}
          </div>

          {!remediationActive && !remediating && cell.status !== "pass" ? (
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle p-4">
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-1.5">
                      <UserPlus className="h-3.5 w-3.5" />
                      Assign
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="start" className="w-56 p-2">
                    <div className="px-2 pb-1 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
                      Assign investigator
                    </div>
                    <ul>
                      {mockData.operators.map((op) => (
                        <li key={op.id}>
                          <button
                            type="button"
                            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[12px] hover:bg-secondary"
                            onClick={() =>
                              toast.success(`Assigned to ${op.name}`)
                            }
                          >
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="bg-brand-primary-subtle text-[9px] font-semibold text-brand-primary-hover">
                                {op.initials}
                              </AvatarFallback>
                            </Avatar>
                            {op.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </PopoverContent>
                </Popover>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSnoozeOpen(true)}
                  className="gap-1.5"
                >
                  <Clock className="h-3.5 w-3.5" />
                  Snooze 24h
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setFalsePositiveOpen(true)}
                  className="gap-1.5 text-text-tertiary"
                >
                  <Flag className="h-3.5 w-3.5" />
                  False Positive
                </Button>
              </div>
              <Button
                onClick={onStartRemediation}
                className="bg-brand-primary text-white hover:bg-brand-primary-hover"
              >
                <Shield className="mr-1.5 h-4 w-4" />
                Remediate
              </Button>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <RemediationConfirmDialog
        open={confirmDialogOpen}
        tenantName={tenant.name}
        controlLabel={control?.label ?? cell.controlId}
        onCancel={() => setConfirmDialogOpen(false)}
        onConfirm={(note, notified) => {
          setConfirmRemediation({ note, notified });
          setConfirmDialogOpen(false);
          setMatrixStatus(tenant.id, cell.controlId, "remediating");
          setRemediationActive(true);
        }}
      />

      <FalsePositiveDialog
        open={falsePositiveOpen}
        onCancel={() => setFalsePositiveOpen(false)}
        onConfirm={(reason) => {
          markFalsePositive(tenant.id, cell.controlId, currentOperator.name, reason);
          toast.success("Marked false positive", {
            description: "Cell removed from violations and audit logged.",
          });
          setFalsePositiveOpen(false);
          onOpenChange(false);
        }}
      />

      <SnoozeDialog
        open={snoozeOpen}
        onCancel={() => setSnoozeOpen(false)}
        onConfirm={(reason) => {
          snoozeCell(tenant.id, cell.controlId, currentOperator.name, reason);
          toast("Snoozed for 24 hours", {
            description: "Re-check deferred. Audit logged.",
          });
          setSnoozeOpen(false);
        }}
      />
    </>
  );
}

function ViolationView({ cell }: { cell: IsolationCell }) {
  const violation = cell.violation;
  if (!violation) return null;

  return (
    <div className="flex flex-col gap-4">
      <Section title="Violation Detail" defaultOpen icon={AlertOctagon}>
        <p className="text-[12.5px] leading-relaxed text-text-primary">
          {violation.description}
        </p>
        <dl className="mt-3 grid grid-cols-1 gap-1.5 text-[12px] sm:grid-cols-2">
          <KV label="Severity" value={violation.severity} />
          <KV label="First Detected" value={format(parseISO(violation.firstDetectedAt), "MMM d, yyyy HH:mm 'UTC'")} />
          <KV label="Detection Source" value={violation.detectionSource} />
          <KV label="Likelihood" value={violation.likelihood} />
        </dl>
        <div className="mt-3">
          <div className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
            Compliance Impact
          </div>
          <ul className="mt-1.5 flex flex-col gap-1.5 text-[12px] text-text-secondary">
            {violation.frameworkCitations.map((c) => (
              <li key={`${c.framework}-${c.section}`} className="flex items-start gap-2">
                <Badge
                  variant="outline"
                  className="border-transparent bg-brand-primary-subtle text-[10px] font-semibold text-brand-primary-hover"
                >
                  {c.framework}
                </Badge>
                <span>
                  <span className="font-medium text-text-primary">§{c.section}</span> — {c.description}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Section>

      <Section title="Affected Resources" defaultOpen icon={Shield}>
        <ul className="flex flex-col gap-2 text-[12.5px]">
          {violation.affectedResources.map((r) => (
            <li
              key={r.id}
              className="rounded-md border border-border-subtle bg-canvas px-3 py-2"
            >
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-transparent bg-secondary text-[10.5px] font-medium text-text-secondary"
                >
                  {r.type}
                </Badge>
                <span className="font-mono text-[11.5px] text-text-primary">{r.id}</span>
              </div>
              <div className="mt-1 text-[12px] text-text-secondary">
                {r.description}
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Risk Assessment" defaultOpen>
        <ul className="flex flex-col gap-2 text-[12.5px]">
          <li>
            <span className="font-semibold text-text-primary">Blast Radius:</span>{" "}
            <span className="text-text-secondary">{violation.blastRadius}</span>
          </li>
          <li>
            <span className="font-semibold text-text-primary">Customer Notification:</span>{" "}
            <span className="text-text-secondary">{violation.customerNotificationTrigger}</span>
          </li>
          <li>
            <span className="font-semibold text-text-primary">Estimated Remediation:</span>{" "}
            <span className="tabular-nums text-text-secondary">{violation.estimatedRemediationLabel}</span>
          </li>
          <li>
            <span className="font-semibold text-text-primary">Recommended Action:</span>{" "}
            <span className="text-text-secondary">{violation.recommendedAction}</span>
          </li>
        </ul>
      </Section>

      <Section title="Remediation Steps">
        <ol className="flex flex-col gap-2 text-[12.5px]">
          {violation.remediationSteps.map((s, i) => (
            <li
              key={s.id}
              className="rounded-md border border-border-subtle bg-canvas px-3 py-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-text-primary">
                  {i + 1}. {s.title}
                </span>
                <span className="text-[11px] text-text-tertiary tabular-nums">
                  {s.estimatedDurationLabel}
                </span>
              </div>
              <div className="text-[11.5px] text-text-secondary">{s.description}</div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Evidence & Logs">
        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
          Latest Scan Output
        </div>
        <pre className="mt-1.5 overflow-x-auto rounded-md border border-border-subtle bg-canvas p-3 font-mono text-[11px] leading-relaxed text-text-primary">
          {violation.evidenceLog}
        </pre>
        <div className="mt-3 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
          Configuration Snapshot
        </div>
        <pre className="mt-1.5 overflow-x-auto rounded-md border border-border-subtle bg-canvas p-3 font-mono text-[11px] leading-relaxed text-text-primary">
          {violation.configurationSnapshot}
        </pre>
        <Button
          variant="outline"
          size="sm"
          className="mt-3 gap-1.5"
          onClick={() =>
            toast.success("Evidence package downloaded", {
              description: violation.evidencePackageId,
            })
          }
        >
          <Download className="h-3.5 w-3.5" />
          {violation.evidencePackageId} (signed)
        </Button>
      </Section>

      <Section title="Historical Context">
        <ul className="flex flex-col gap-1.5 text-[12.5px]">
          <KVRow label="First detected" value={format(parseISO(violation.history.firstDetectedAt), "MMM d, yyyy")} />
          <KVRow label="Times this control failed (30d)" value={String(violation.history.failsLast30d)} />
          <KVRow label="Successful remediations" value={String(violation.history.successfulRemediations)} />
          <KVRow label="Last successful pass" value={format(parseISO(violation.history.lastSuccessfulPassAt), "MMM d, yyyy")} />
          <KVRow label="Pattern" value={violation.history.pattern} />
        </ul>
      </Section>
    </div>
  );
}

function PassEvidence({ cell }: { cell: IsolationCell }) {
  return (
    <div className="flex flex-col gap-3 text-[12.5px] text-text-secondary">
      <div className="rounded-md border border-status-success/30 bg-status-success-subtle px-4 py-3 text-status-success">
        <span className="font-semibold">Control passing.</span> {cell.evidence}
      </div>
      <div>
        <div className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
          Last evaluation
        </div>
        <div className="mt-0.5 text-text-primary tabular-nums" suppressHydrationWarning>
          {formatRelativeTime(cell.lastEvaluatedAt)}
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
}: {
  title: string;
  icon?: typeof CheckCircle2;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-lg border border-border-subtle bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-2 border-b border-border-subtle px-4 py-2.5 text-left"
      >
        <span className="flex items-center gap-2 text-[13px] font-semibold text-text-primary">
          {Icon ? <Icon className="h-3.5 w-3.5 text-text-tertiary" /> : null}
          {title}
        </span>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
        ) : (
          <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
        )}
      </button>
      {open ? <div className="p-4">{children}</div> : null}
    </section>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
        {label}
      </dt>
      <dd className="mt-0.5 text-[12.5px] text-text-primary">{value}</dd>
    </div>
  );
}

function KVRow({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-center justify-between border-b border-border-subtle pb-1 last:border-0 last:pb-0">
      <span className="text-text-tertiary">{label}</span>
      <span className="text-right text-text-primary">{value}</span>
    </li>
  );
}

function RemediationConfirmDialog({
  open,
  tenantName,
  controlLabel,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  tenantName: string;
  controlLabel: string;
  onCancel: () => void;
  onConfirm: (note: string, notified: boolean) => void;
}) {
  const [note, setNote] = useState("");
  const [notified, setNotified] = useState(false);
  const [touched, setTouched] = useState(false);
  const error =
    touched && note.trim().length < 8
      ? "Remediation note must be at least 8 characters."
      : null;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onCancel();
          setNote("");
          setTouched(false);
          setNotified(false);
        }
      }}
    >
      <AlertDialogContent className="max-w-[520px]">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Execute Remediation: {tenantName} — {controlLabel} Isolation
          </AlertDialogTitle>
          <AlertDialogDescription className="text-[13px] leading-relaxed text-text-secondary">
            This will execute the remediation steps automatically. Tenant
            operations may be briefly impacted during the migration.
            Estimated duration: 12 minutes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex flex-col gap-3 py-2">
          <label className="flex items-start gap-2 rounded-md bg-canvas px-3 py-2 text-[12.5px] text-text-primary">
            <Checkbox
              checked={notified}
              onCheckedChange={(v) => setNotified(v === true)}
            />
            <span>
              I have notified the tenant admin (recommended for production).
            </span>
          </label>
          <div>
            <Label className="text-[12px] font-medium text-text-primary">
              Remediation note for audit log
            </Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              onBlur={() => setTouched(true)}
              rows={3}
              placeholder="e.g., Coordinating with Crawford operations team. Migration window approved by tenant."
              className={error ? "border-status-critical" : ""}
            />
            {error ? (
              <span className="text-[11.5px] text-status-critical">{error}</span>
            ) : null}
          </div>
        </div>
        <AlertDialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (note.trim().length < 8) {
                setTouched(true);
                return;
              }
              onConfirm(note.trim(), notified);
            }}
            className="bg-status-critical text-white hover:bg-status-critical/90"
          >
            Execute Remediation
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function FalsePositiveDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const error =
    touched && reason.trim().length < 8
      ? "Reason must be at least 8 characters."
      : null;
  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onCancel();
          setReason("");
          setTouched(false);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mark as false positive?</AlertDialogTitle>
          <AlertDialogDescription>
            Removes the violation from the active list. Logged on the audit trail
            so compliance can audit the dismissal.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onBlur={() => setTouched(true)}
          rows={3}
          placeholder="Why is this not a real violation?"
          className={error ? "border-status-critical" : ""}
        />
        {error ? <span className="text-[11.5px] text-status-critical">{error}</span> : null}
        <AlertDialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
            onClick={() => {
              if (reason.trim().length < 8) {
                setTouched(true);
                return;
              }
              onConfirm(reason.trim());
            }}
          >
            Confirm
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function SnoozeDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const error =
    touched && reason.trim().length < 6
      ? "Reason must be at least 6 characters."
      : null;
  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          onCancel();
          setReason("");
          setTouched(false);
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Snooze for 24 hours?</AlertDialogTitle>
          <AlertDialogDescription>
            Defers the next re-check by 24 hours. Useful when remediation is
            scheduled in a future change window.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          onBlur={() => setTouched(true)}
          rows={3}
          placeholder="e.g., Remediation scheduled in tomorrow's change window."
          className={error ? "border-status-critical" : ""}
        />
        {error ? <span className="text-[11.5px] text-status-critical">{error}</span> : null}
        <AlertDialogFooter>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
            onClick={() => {
              if (reason.trim().length < 6) {
                setTouched(true);
                return;
              }
              onConfirm(reason.trim());
            }}
          >
            Snooze
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
