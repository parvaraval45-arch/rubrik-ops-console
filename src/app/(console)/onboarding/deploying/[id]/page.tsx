"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2, ShieldX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { TaskRow } from "@/components/onboarding/deploy/task-row";
import { TASKS, type TaskConfig } from "@/components/onboarding/deploy/tasks-config";
import { useConsoleStore } from "@/lib/store";
import { mockData, currentOperator } from "@/lib/mock-data";
import { formatCurrency, formatDuration, formatTB } from "@/lib/formatters";
import type {
  OnboardingDraft,
  ProvisioningTaskState,
  Tenant,
} from "@/types";

type Phase = "running" | "success" | "rollback" | "rolled-back";

export default function DeployingPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = params.id;
  const simulateFailure = searchParams.get("dev") === "true";

  const draft = useConsoleStore((s) => s.drafts.find((d) => d.id === draftId));
  const completeOnboarding = useConsoleStore((s) => s.completeOnboarding);
  const upsertDraft = useConsoleStore((s) => s.upsertDraft);

  const [phase, setPhase] = useState<Phase>("running");
  const [startedAt] = useState(() => Date.now());
  const [endedAt, setEndedAt] = useState<number | null>(null);
  const [createdTenant, setCreatedTenant] = useState<Tenant | null>(null);
  const completedRef = useRef(false);

  const [tasks, setTasks] = useState<ProvisioningTaskState[]>(() =>
    TASKS.map((t) => ({
      id: t.id,
      title: t.title,
      status: "pending",
      substepIndex: 0,
    })),
  );

  // Helper: update a single task immutably
  const updateTask = (
    id: string,
    patch: Partial<ProvisioningTaskState> | ((cur: ProvisioningTaskState) => Partial<ProvisioningTaskState>),
  ) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const p = typeof patch === "function" ? patch(t) : patch;
        return { ...t, ...p };
      }),
    );
  };

  // Drive the deploy state machine
  useEffect(() => {
    if (!draft) return;
    let cancelled = false;
    const startedAtPerTask = new Map<string, number>();

    const runTask = async (cfg: TaskConfig) => {
      if (cancelled) return;
      const ts = Date.now();
      startedAtPerTask.set(cfg.id, ts);
      updateTask(cfg.id, { status: "running", startedAt: ts, substepIndex: 0 });

      const total =
        cfg.durationMs[0] +
        Math.random() * (cfg.durationMs[1] - cfg.durationMs[0]);

      // Cycle substeps
      const stepDelay = total / cfg.substeps.length;
      for (let i = 0; i < cfg.substeps.length; i += 1) {
        if (cancelled) return;
        await delay(stepDelay);
        if (cancelled) return;
        updateTask(cfg.id, { substepIndex: i });
      }

      // Inject transient warning during the run
      if (cfg.warningSubstep) {
        const warningCfg = cfg.warningSubstep;
        const warningTimeout = setTimeout(() => {
          if (cancelled) return;
          updateTask(cfg.id, { warning: warningCfg.warning });
          setTimeout(() => {
            if (cancelled) return;
            updateTask(cfg.id, { warning: undefined });
          }, 1_500);
        }, warningCfg.afterMs);
        // ensure cleanup
        if (cancelled) clearTimeout(warningTimeout);
      }

      // If simulating failure, fail at IAM task ~3s into it
      if (simulateFailure && cfg.id === "iam") {
        await delay(3_000);
        if (cancelled) return;
        const ended = Date.now();
        updateTask(cfg.id, {
          status: "failed",
          endedAt: ended,
          durationMs: ended - ts,
          errorMessage:
            "Failed to assign operator Priya Sharma: account locked.",
        });
        throw new Error("simulated-failure");
      }

      const ended = Date.now();
      updateTask(cfg.id, {
        status: "complete",
        endedAt: ended,
        durationMs: ended - ts,
        substepIndex: cfg.substeps.length - 1,
        warning: undefined,
      });
    };

    const runDeploy = async () => {
      try {
        await runTask(TASKS[0]);
        if (cancelled) return;
        await runTask(TASKS[1]); // namespace depends on capacity
        if (cancelled) return;
        // Network and key can run in parallel after namespace, so sequence them quickly
        await Promise.all([runTask(TASKS[2]), runTask(TASKS[3]), runTask(TASKS[5])]);
        if (cancelled) return;
        await runTask(TASKS[4]); // policy after namespace + key
        if (cancelled) return;
        await runTask(TASKS[6]); // license after capacity + policy + iam
        if (cancelled) return;
        await runTask(TASKS[7]); // validation last

        if (cancelled || completedRef.current) return;
        completedRef.current = true;
        setPhase("success");
        const finishedAt = Date.now();
        setEndedAt(finishedAt);
        const tenant = buildTenantFromDraft(draft);
        setCreatedTenant(tenant);
        completeOnboarding({
          draft,
          tenant,
          durationSec: Math.round((finishedAt - startedAt) / 1000),
          deployedBy: currentOperator.name,
        });
        toast.success(`${tenant.name} deployed`, {
          description: `Tenant admin invite sent to ${tenant.contactEmail}`,
        });
      } catch (err) {
        if (cancelled) return;
        if ((err as Error).message === "simulated-failure") {
          // Trigger rollback
          setPhase("rollback");
          await rollbackAll();
          if (cancelled) return;
          setPhase("rolled-back");
          // restore draft so user can retry
          upsertDraft({ ...draft, status: "in-progress" });
        }
      }
    };

    const rollbackAll = async () => {
      const completed = ["policy", "network", "key", "namespace", "capacity"];
      for (const id of completed) {
        if (cancelled) return;
        updateTask(id, (cur) =>
          cur.status === "complete" ? { status: "rolling-back" } : {},
        );
        await delay(1_200);
        if (cancelled) return;
        updateTask(id, { status: "rolled-back" });
      }
    };

    const start = setTimeout(runDeploy, 400);
    return () => {
      cancelled = true;
      clearTimeout(start);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft, simulateFailure]);

  if (!draft) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-text-tertiary">
        Draft not found. Return to the onboarding queue.
      </div>
    );
  }

  if (phase === "success" && createdTenant) {
    return (
      <DeploySuccess
        tenant={createdTenant}
        startedAt={startedAt}
        endedAt={endedAt ?? startedAt}
        draft={draft}
      />
    );
  }

  if (phase === "rolled-back") {
    return (
      <RolledBackState
        draftId={draft.id}
        tenantName={draft.tenantName ?? "Tenant"}
        onResume={() => router.push(`/onboarding/draft/${draft.id}`)}
        onReturn={() => router.push("/onboarding")}
      />
    );
  }

  return (
    <DeployingView
      draft={draft}
      tasks={tasks}
      startedAt={startedAt}
      phase={phase}
    />
  );
}

function DeployingView({
  draft,
  tasks,
  startedAt,
  phase,
}: {
  draft: OnboardingDraft;
  tasks: ProvisioningTaskState[];
  startedAt: number;
  phase: Phase;
}) {
  const cluster = mockData.clusters.find((c) => c.id === draft.clusterId);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-3 border-b border-border-subtle pb-4">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
            {phase === "rollback" ? "Rolling Back" : "Provisioning"}
          </span>
          <h1 className="text-[22px] font-semibold tracking-tight text-text-primary">
            {phase === "rollback" ? "Rolling back" : "Deploying"} {draft.tenantName}
          </h1>
          <p className="text-[12.5px] text-text-secondary">
            {phase === "rollback"
              ? "Reverting partially-applied infrastructure to a clean state."
              : `Provisioning infrastructure across ${cluster?.name ?? "selected cluster"}`}
          </p>
        </div>
        <div className="text-right">
          <div className="text-[11px] uppercase tracking-wide text-text-tertiary">Elapsed</div>
          <div className="text-[20px] font-semibold tabular-nums text-text-primary">
            {formatDuration(Math.max(0, Math.floor((now - startedAt) / 1000)))}
          </div>
        </div>
      </header>

      <ol className="flex flex-col gap-3">
        {tasks.map((task, i) => (
          <TaskRow
            key={task.id}
            index={i}
            task={task}
            substeps={TASKS[i].substeps}
          />
        ))}
      </ol>
    </div>
  );
}

function DeploySuccess({
  tenant,
  startedAt,
  endedAt,
  draft,
}: {
  tenant: Tenant;
  startedAt: number;
  endedAt: number;
  draft: OnboardingDraft;
}) {
  const durationSec = Math.round((endedAt - startedAt) / 1000);
  const totalOnboardingSec = Math.round(
    (endedAt - Date.parse(draft.createdAt)) / 1000,
  );
  const monthly = (draft.billing?.capacityCommitTB ?? 25) * (draft.billing?.ratePerTB ?? 65);
  const [validationDates] = useState(() => ({
    day3: new Date(endedAt + 3 * 24 * 60 * 60_000).toLocaleDateString(),
    day7: new Date(endedAt + 7 * 24 * 60 * 60_000).toLocaleDateString(),
  }));

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 py-6 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        className="flex h-16 w-16 items-center justify-center rounded-full bg-status-success-subtle"
      >
        <CheckCircle2 className="h-9 w-9 text-status-success" />
      </motion.div>
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-[26px] font-semibold tracking-tight text-text-primary">
          Tenant Deployed Successfully
        </h1>
        <p className="text-[14px] text-text-secondary">
          {tenant.name} is now provisioned and protected.
        </p>
      </div>

      <div className="grid w-full grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Deploy time" value={`${durationSec}s`} />
        <Stat label="Total onboarding" value={formatDuration(totalOnboardingSec)} />
        <Stat label="Capacity" value={formatTB(tenant.capacityCommittedTB)} />
        <Stat label="Workloads" value="0" subtitle="awaiting first backup" />
        <Stat label="Estimated MRR" value={formatCurrency(monthly)} />
      </div>

      <section className="w-full rounded-lg border border-status-info/30 bg-status-info-subtle p-5 text-left">
        <div className="text-[14px] font-semibold text-text-primary">
          Post-Deploy Validation Window Active
        </div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-text-secondary">
          This tenant will be monitored for 7 days. Daily health checks will
          verify policy enforcement, isolation integrity, backup success, and
          capacity drift. Issues will appear in the Onboarding queue.
        </p>
        <ul className="mt-3 space-y-1 text-[12px] text-text-secondary">
          <li>· Day 1 check: scheduled for tomorrow 04:00 UTC</li>
          <li>· Day 3 check: scheduled for {validationDates.day3} 04:00 UTC</li>
          <li>· Day 7 check: scheduled for {validationDates.day7} 04:00 UTC</li>
        </ul>
      </section>

      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button asChild className="bg-brand-primary text-white hover:bg-brand-primary-hover">
          <Link href={`/tenants/${tenant.id}`}>View Tenant</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/onboarding/new">Onboard Another</Link>
        </Button>
        <Button asChild variant="ghost">
          <Link href="/onboarding">Return to Queue</Link>
        </Button>
      </div>
    </div>
  );
}

function RolledBackState({
  draftId,
  tenantName,
  onResume,
  onReturn,
}: {
  draftId: string;
  tenantName: string;
  onResume: () => void;
  onReturn: () => void;
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center gap-5 py-12 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-status-warning-subtle">
        <ShieldX className="h-8 w-8 text-status-warning" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <h1 className="text-[22px] font-semibold tracking-tight text-text-primary">
          Deployment rolled back
        </h1>
        <p className="text-[13px] text-text-secondary">
          Tenant {tenantName} returned to draft state. Reason: IAM operator unavailable.
        </p>
      </div>
      <p className="max-w-md text-[12.5px] text-text-tertiary">
        All partial state was reversed cluster-side. Re-assign the IAM step or
        replace the unavailable operator, then redeploy.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={onResume} className="bg-brand-primary text-white hover:bg-brand-primary-hover">
          Resume Draft
        </Button>
        <Button variant="outline" onClick={onReturn}>
          Return to Queue
        </Button>
      </div>
      <span className="text-[11px] text-text-tertiary">Draft ID: {draftId}</span>
    </div>
  );
}

function Stat({
  label,
  value,
  subtitle,
}: {
  label: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-lg border border-border-subtle bg-surface p-4 text-left shadow-card">
      <div className="text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
        {label}
      </div>
      <div className="mt-1 text-[18px] font-semibold tabular-nums text-text-primary">
        {value}
      </div>
      {subtitle ? (
        <div className="mt-0.5 text-[10.5px] text-text-tertiary">{subtitle}</div>
      ) : null}
    </div>
  );
}

function buildTenantFromDraft(draft: OnboardingDraft): Tenant {
  const id = `t_new_${Math.random().toString(36).slice(2, 8)}`;
  const namespace = draft.isolation?.namespace ?? `tenant-${id}`;
  return {
    id,
    name: draft.tenantName ?? "Untitled tenant",
    legalEntity: draft.legalEntity ?? `${draft.tenantName ?? "Untitled"}, Inc.`,
    industry: draft.industry ?? "Technology",
    region: draft.region ?? "us-east-1",
    tier: draft.tier ?? "Gold",
    status: "Active",
    assignedClusterId: draft.clusterId ?? "cls_us_east_1",
    namespaceId: namespace,
    workloadCount: 0,
    capacityUsedTB: 0,
    capacityCommittedTB: draft.billing?.capacityCommitTB ?? draft.allocationTB ?? 25,
    lastBackupAt: new Date().toISOString(),
    securityScore: 95,
    slaCompliance: 99.5,
    backupSuccess7d: [100, 100, 100, 100, 100, 100, 100],
    createdAt: new Date().toISOString(),
    primaryContact: draft.primaryContact ?? "—",
    contactEmail: draft.contactEmail ?? "admin@example.com",
  };
}

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}
