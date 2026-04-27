"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  CircleAlert,
  Loader2,
  PauseCircle,
  Play,
  Rocket,
  ShieldCheck,
  StopCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useConsoleStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { currentOperator } from "@/lib/mock-data";
import type { PolicyTemplate, PolicyTemplateRollout } from "@/types";

interface TabRolloutProps {
  template: PolicyTemplate;
}

export function TabRollout({ template }: TabRolloutProps) {
  const rollouts = useConsoleStore((s) => s.policyTemplateRollouts);
  const assignments = useConsoleStore((s) => s.policyTemplateAssignments);
  const tenants = useConsoleStore((s) => s.tenants);
  const startPolicyTemplateRollout = useConsoleStore(
    (s) => s.startPolicyTemplateRollout,
  );
  const promoteRolloutPhase = useConsoleStore((s) => s.promoteRolloutPhase);
  const abortPolicyRollout = useConsoleStore((s) => s.abortPolicyRollout);
  const pausePolicyRollout = useConsoleStore((s) => s.pausePolicyRollout);

  const activeRollout = useMemo(
    () =>
      rollouts.find(
        (r) =>
          r.templateId === template.id &&
          (r.status === "running" || r.status === "paused"),
      ),
    [rollouts, template.id],
  );

  const pendingAssignments = useMemo(
    () =>
      assignments.filter(
        (a) =>
          a.templateId === template.id && a.appliedVersion < template.currentVersion,
      ),
    [assignments, template.id, template.currentVersion],
  );

  const [strategy, setStrategy] = useState<
    "canary-staged-fleet" | "all-at-once" | "manual-per-tenant"
  >("canary-staged-fleet");
  const [validationStarted, setValidationStarted] = useState(false);
  const [validationStep, setValidationStep] = useState(0);
  const [startNote, setStartNote] = useState("");
  const [startConfirmOpen, setStartConfirmOpen] = useState(false);
  const [abortOpen, setAbortOpen] = useState(false);
  const [abortReason, setAbortReason] = useState("");

  const validationItems = [
    "All affected tenants currently in healthy state",
    "No active alarms on affected tenants",
    "Sufficient cluster capacity for re-encryption operations",
    "No conflicting policy changes in last 24h",
    "Compliance frameworks remain attested",
  ];

  useEffect(() => {
    if (!validationStarted) return;
    if (validationStep >= validationItems.length) return;
    const t = window.setTimeout(() => setValidationStep((s) => s + 1), 800);
    return () => window.clearTimeout(t);
  }, [validationStarted, validationStep, validationItems.length]);

  if (activeRollout) {
    return (
      <LiveRolloutMonitor
        rollout={activeRollout}
        template={template}
        onPromote={() => {
          promoteRolloutPhase(activeRollout.id, currentOperator.name);
          toast.success("Phase promoted", {
            description: "Migrating next phase tenants",
          });
        }}
        onPause={() => {
          pausePolicyRollout(activeRollout.id, currentOperator.name);
          toast("Rollout paused");
        }}
        onAbort={() => setAbortOpen(true)}
        abortOpen={abortOpen}
        onAbortClose={() => setAbortOpen(false)}
        abortReason={abortReason}
        setAbortReason={setAbortReason}
        onConfirmAbort={() => {
          if (!abortReason.trim()) return;
          abortPolicyRollout(activeRollout.id, abortReason.trim(), currentOperator.name);
          toast.success("Rollout aborted", {
            description: `Migrated tenants restored to v${activeRollout.fromVersion}.`,
          });
          setAbortOpen(false);
          setAbortReason("");
        }}
      />
    );
  }

  if (pendingAssignments.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-default bg-secondary/40 p-12 text-center">
        <ShieldCheck className="h-7 w-7 text-status-success" />
        <div className="text-[14px] font-semibold text-text-primary">
          No active rollouts
        </div>
        <div className="max-w-md text-[12.5px] text-text-secondary">
          The current version (v{template.currentVersion}) is in sync across all assigned
          tenants. Publish a new version to plan a rollout.
        </div>
      </div>
    );
  }

  const validationComplete = validationStep >= validationItems.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-status-info bg-status-info-subtle p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-status-info text-white">
            <Rocket className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <div className="text-[13px] font-semibold text-text-primary">
              Pending Rollout: v{template.currentVersion}
            </div>
            <div className="text-[12px] text-text-secondary">
              {pendingAssignments.length} tenants are still on older versions and will be
              migrated to v{template.currentVersion}.
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-lg border border-border-subtle bg-surface p-4">
        <h4 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-text-tertiary">
          Rollout Strategy
        </h4>
        <RadioGroup
          value={strategy}
          onValueChange={(v) =>
            setStrategy(v as "canary-staged-fleet" | "all-at-once" | "manual-per-tenant")
          }
          className="flex flex-col gap-2"
        >
          <StrategyOption
            value="canary-staged-fleet"
            title="Canary → Staged → Fleet"
            description="Recommended. Smallest tenant first, observation windows between phases, auto-rollback on failure."
          />
          <StrategyOption
            value="all-at-once"
            title="All Tenants Simultaneously"
            description="Faster, riskier. No observation windows, no per-phase health gates."
          />
          <StrategyOption
            value="manual-per-tenant"
            title="Manual Per-Tenant"
            description="Most control. Operator promotes each tenant explicitly."
          />
        </RadioGroup>
      </section>

      {strategy === "canary-staged-fleet" ? (
        <section className="rounded-lg border border-border-subtle bg-surface p-4">
          <h4 className="mb-3 text-[12px] font-semibold uppercase tracking-wide text-text-tertiary">
            Phase Configuration
          </h4>
          <div className="flex flex-col gap-2.5">
            <PhaseRow
              label="Phase 1 — Canary"
              tenantCount={1}
              durationLabel="24h observation window"
              checks={[
                "Backup success rate ≥95%",
                "No new alarms triggered",
                "Compliance posture unchanged",
                "No tenant complaints",
              ]}
              autoRollback
            />
            <PhaseRow
              label="Phase 2 — Staged"
              tenantCount={Math.max(1, Math.ceil((pendingAssignments.length - 1) / 2))}
              durationLabel="48h observation window"
              checks={[
                "Backup success rate ≥95%",
                "No new alarms triggered",
                "Compliance posture unchanged",
              ]}
              autoRollback
            />
            <PhaseRow
              label="Phase 3 — Fleet"
              tenantCount={Math.max(
                0,
                pendingAssignments.length -
                  1 -
                  Math.max(1, Math.ceil((pendingAssignments.length - 1) / 2)),
              )}
              durationLabel="Auto-execute after staged clears"
            />
          </div>
        </section>
      ) : null}

      <section className="rounded-lg border border-border-subtle bg-surface p-4">
        <div className="mb-3 flex items-center justify-between">
          <h4 className="text-[12px] font-semibold uppercase tracking-wide text-text-tertiary">
            Pre-Rollout Validation
          </h4>
          {!validationStarted ? (
            <Button
              variant="outline"
              size="sm"
              className="h-7 gap-1"
              onClick={() => {
                setValidationStarted(true);
                setValidationStep(0);
              }}
            >
              Run validation
            </Button>
          ) : null}
        </div>
        <ol className="flex flex-col gap-1.5">
          {validationItems.map((item, i) => {
            const isPass = validationStarted && i < validationStep;
            const isRunning = validationStarted && i === validationStep;
            return (
              <li
                key={item}
                className={cn(
                  "flex items-center gap-2 rounded-md border border-border-subtle bg-secondary/30 px-3 py-1.5 text-[12.5px]",
                  isPass ? "text-status-success" : "text-text-secondary",
                )}
              >
                {isPass ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-status-success" />
                ) : isRunning ? (
                  <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-status-info" />
                ) : (
                  <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-border-default" />
                )}
                <span>{item}</span>
              </li>
            );
          })}
        </ol>
      </section>

      <div className="sticky bottom-0 -mx-6 -mb-4 flex items-center justify-between border-t border-border-subtle bg-surface px-6 py-3">
        <div className="text-[12px] text-text-secondary">
          {pendingAssignments.length} tenants will receive v{template.currentVersion}.
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            Cancel
          </Button>
          <Button
            size="sm"
            disabled={!validationComplete}
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
            onClick={() => setStartConfirmOpen(true)}
          >
            <Play className="mr-1 h-3.5 w-3.5" />
            Start Rollout
          </Button>
        </div>
      </div>

      <AlertDialog open={startConfirmOpen} onOpenChange={setStartConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Begin canary rollout of v{template.currentVersion}?</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-relaxed">
              This will migrate 1 canary tenant (smallest by capacity) to v
              {template.currentVersion}. After the 24-hour observation window, you will
              be prompted to promote to the staged phase.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-1">
            <Label className="text-[12px] font-medium text-text-secondary">
              Rollout note for audit
            </Label>
            <Textarea
              value={startNote}
              onChange={(e) => setStartNote(e.target.value)}
              rows={3}
              placeholder="Required for compliance audit"
              className="text-[12px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={!startNote.trim()}
              onClick={() => {
                startPolicyTemplateRollout(
                  template.id,
                  startNote.trim(),
                  currentOperator.name,
                );
                setStartConfirmOpen(false);
                setStartNote("");
                toast.success("Rollout started", {
                  description: "Canary phase initiated. Live monitor opening.",
                });
              }}
              className="bg-brand-primary text-white hover:bg-brand-primary-hover"
            >
              Start Rollout
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
  void tenants;
}

function StrategyOption({
  value,
  title,
  description,
}: {
  value: string;
  title: string;
  description: string;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-md border border-border-subtle bg-surface p-3 hover:bg-secondary/40">
      <RadioGroupItem value={value} className="mt-0.5 h-4 w-4" />
      <div>
        <div className="text-[13px] font-medium text-text-primary">{title}</div>
        <div className="mt-0.5 text-[12px] text-text-secondary">{description}</div>
      </div>
    </label>
  );
}

function PhaseRow({
  label,
  tenantCount,
  durationLabel,
  checks,
  autoRollback,
}: {
  label: string;
  tenantCount: number;
  durationLabel: string;
  checks?: string[];
  autoRollback?: boolean;
}) {
  return (
    <div className="rounded-md border border-border-subtle bg-secondary/30 p-3">
      <div className="flex items-center justify-between">
        <div className="text-[12.5px] font-semibold text-text-primary">{label}</div>
        <Badge
          variant="outline"
          className="border-border-default bg-white px-1.5 py-0 text-[11px] tabular-nums text-text-secondary"
        >
          {tenantCount} tenant{tenantCount === 1 ? "" : "s"}
        </Badge>
      </div>
      <div className="mt-1 text-[11.5px] text-text-tertiary">{durationLabel}</div>
      {checks ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {checks.map((c) => (
            <Badge
              key={c}
              variant="outline"
              className="border-status-success-subtle bg-status-success-subtle px-1.5 py-0 text-[10.5px] text-status-success"
            >
              <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" />
              {c}
            </Badge>
          ))}
        </div>
      ) : null}
      {autoRollback ? (
        <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-status-warning">
          <CircleAlert className="h-3 w-3" />
          Auto-rollback if any check fails
        </div>
      ) : null}
    </div>
  );
}

interface LiveRolloutMonitorProps {
  rollout: PolicyTemplateRollout;
  template: PolicyTemplate;
  onPromote: () => void;
  onPause: () => void;
  onAbort: () => void;
  abortOpen: boolean;
  onAbortClose: () => void;
  abortReason: string;
  setAbortReason: (v: string) => void;
  onConfirmAbort: () => void;
}

function LiveRolloutMonitor({
  rollout,
  template,
  onPromote,
  onPause,
  onAbort,
  abortOpen,
  onAbortClose,
  abortReason,
  setAbortReason,
  onConfirmAbort,
}: LiveRolloutMonitorProps) {
  const tenants = useConsoleStore((s) => s.tenants);
  const phases = rollout.phases;
  const currentPhase = phases.find((p) => p.phase === rollout.currentPhase);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (rollout.status !== "running") return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [rollout.status]);
  const elapsedMs = now - Date.parse(rollout.startedAt);
  const minutes = Math.max(0, Math.floor(elapsedMs / 60_000));
  const seconds = Math.max(0, Math.floor((elapsedMs % 60_000) / 1000));

  const totalMigrated = phases.flatMap((p) => p.migratedTenantIds).length;
  const isReadyToPromote =
    rollout.currentPhase !== null &&
    currentPhase?.migratedTenantIds.length === currentPhase?.tenantIds.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-status-info bg-surface p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[14px] font-semibold text-text-primary">
              Rollout in Progress: {template.name} v{rollout.toVersion}
            </div>
            <div className="text-[12px] text-text-secondary">
              Started by {rollout.startedBy} · Elapsed{" "}
              <span className="tabular-nums">
                {minutes}m {seconds}s
              </span>
            </div>
          </div>
          <Badge
            variant="outline"
            className="border-status-info bg-status-info-subtle px-2 py-0.5 text-[11px] capitalize text-status-info"
          >
            Phase {phases.findIndex((p) => p.phase === rollout.currentPhase) + 1} of{" "}
            {phases.length}: {rollout.currentPhase}
          </Badge>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          {phases.map((p) => {
            const isActive = p.phase === rollout.currentPhase;
            const isComplete = p.status === "complete";
            return (
              <div key={p.phase} className="flex flex-col gap-1">
                <div className="flex items-center justify-between text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                  <span>{p.phase}</span>
                  <span className="tabular-nums text-text-secondary">
                    {p.migratedTenantIds.length}/{p.tenantIds.length}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${
                        p.tenantIds.length === 0
                          ? 0
                          : (p.migratedTenantIds.length / p.tenantIds.length) * 100
                      }%`,
                    }}
                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                      "h-full",
                      isComplete
                        ? "bg-status-success"
                        : isActive
                          ? "bg-brand-primary"
                          : "bg-text-tertiary",
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {currentPhase ? (
        <div className="rounded-lg border border-border-subtle bg-surface p-4">
          <div className="text-[12px] font-semibold uppercase tracking-wide text-text-tertiary">
            Active phase: {rollout.currentPhase}
          </div>
          <div className="mt-2 flex flex-col gap-2">
            {currentPhase.tenantIds.map((tid) => {
              const tenant = tenants.find((t) => t.id === tid);
              const migrated = currentPhase.migratedTenantIds.includes(tid);
              const failed = currentPhase.failedTenantIds.includes(tid);
              return (
                <div
                  key={tid}
                  className="flex items-center justify-between rounded-md border border-border-subtle bg-secondary/30 px-3 py-2 text-[12.5px]"
                >
                  <span className="font-medium text-text-primary">
                    {tenant?.name ?? tid}
                  </span>
                  {migrated ? (
                    <Badge
                      variant="outline"
                      className="border-status-success bg-status-success-subtle px-1.5 py-0 text-[10.5px] text-status-success"
                    >
                      <CheckCircle2 className="mr-0.5 h-2.5 w-2.5" />
                      Migrated
                    </Badge>
                  ) : failed ? (
                    <Badge
                      variant="outline"
                      className="border-status-critical bg-status-critical-subtle px-1.5 py-0 text-[10.5px] text-status-critical"
                    >
                      Failed
                    </Badge>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] text-status-info">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Migrating
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {currentPhase.healthChecks.length > 0 ? (
            <div className="mt-3">
              <div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                Health check status
              </div>
              <div className="flex flex-wrap gap-1.5">
                {currentPhase.healthChecks.map((hc) => (
                  <Badge
                    key={hc.id}
                    variant="outline"
                    className={cn(
                      "px-1.5 py-0 text-[10.5px]",
                      hc.status === "pass"
                        ? "border-status-success-subtle bg-status-success-subtle text-status-success"
                        : hc.status === "warn"
                          ? "border-status-warning-subtle bg-status-warning-subtle text-status-warning"
                          : hc.status === "fail"
                            ? "border-status-critical-subtle bg-status-critical-subtle text-status-critical"
                            : "border-border-subtle bg-secondary text-text-secondary",
                    )}
                  >
                    {hc.label}
                    {hc.detail ? `: ${hc.detail}` : ""}
                  </Badge>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-lg border border-border-subtle bg-surface p-3 text-[12px] text-text-secondary">
        <span className="font-medium text-text-primary">Rollout note:</span>{" "}
        {rollout.note}
      </div>

      <div className="flex items-center justify-between rounded-lg border border-border-subtle bg-secondary/40 p-4">
        <div>
          <div className="text-[12px] font-medium text-text-secondary">
            {totalMigrated} of {rollout.totalAffectedTenants} tenants migrated
          </div>
          {isReadyToPromote ? (
            <div className="mt-0.5 text-[11.5px] text-status-success">
              Phase healthy. Ready to promote to next phase.
            </div>
          ) : (
            <div className="mt-0.5 text-[11.5px] text-text-tertiary">
              Awaiting phase completion before next promotion.
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onPromote}
            disabled={rollout.status !== "running"}
            className="bg-brand-primary text-white hover:bg-brand-primary-hover"
          >
            <Play className="mr-1 h-3.5 w-3.5" />
            Promote phase
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onPause}
            disabled={rollout.status !== "running"}
          >
            <PauseCircle className="mr-1 h-3.5 w-3.5" />
            Pause
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onAbort}
            className="border-status-critical text-status-critical hover:bg-status-critical-subtle"
          >
            <StopCircle className="mr-1 h-3.5 w-3.5" />
            Abort & rollback
          </Button>
        </div>
      </div>

      <AlertDialog open={abortOpen} onOpenChange={onAbortClose}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-status-critical">
              Abort rollout and rollback?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] leading-relaxed">
              Aborting will rollback {totalMigrated} migrated tenant
              {totalMigrated === 1 ? "" : "s"} to the previous version (v{rollout.fromVersion}).
              Health check evidence and rollback reasoning will be preserved in the audit
              trail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex flex-col gap-1">
            <Label className="text-[12px] font-medium text-text-secondary">
              Rollback reason (required for compliance)
            </Label>
            <Textarea
              value={abortReason}
              onChange={(e) => setAbortReason(e.target.value)}
              rows={3}
              className="text-[12px]"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onConfirmAbort}
              disabled={!abortReason.trim()}
              className="bg-status-critical text-white hover:bg-status-critical/90"
            >
              Abort & rollback
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
