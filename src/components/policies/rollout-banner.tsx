"use client";

import { ArrowRight, Rocket, RotateCcw } from "lucide-react";
import { useMemo, useState } from "react";
import { useConsoleStore } from "@/lib/store";
import { formatRelativeTime } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { ageInMs } from "./policy-helpers";

interface RolloutBannerProps {
  onOpenRollout: (templateId: string) => void;
}

export function RolloutBanner({ onOpenRollout }: RolloutBannerProps) {
  const rollouts = useConsoleStore((s) => s.policyTemplateRollouts);
  const templates = useConsoleStore((s) => s.policyTemplates);
  const tenants = useConsoleStore((s) => s.tenants);
  const [now] = useState(() => Date.now());

  const activeRollout = useMemo(
    () => rollouts.find((r) => r.status === "running" || r.status === "paused"),
    [rollouts],
  );
  const recentRollback = useMemo(
    () =>
      rollouts.find(
        (r) =>
          r.status === "rolled-back" &&
          r.abortedAt &&
          ageInMs(r.abortedAt, now) < 24 * 60 * 60_000,
      ),
    [rollouts, now],
  );

  if (!activeRollout && !recentRollback) return null;

  if (activeRollout) {
    const template = templates.find((t) => t.id === activeRollout.templateId);
    const phase = activeRollout.phases.find(
      (p) => p.phase === activeRollout.currentPhase,
    );
    const migratedSoFar = activeRollout.phases.flatMap((p) => p.migratedTenantIds).length;

    return (
      <div className="flex items-center gap-4 rounded-lg border border-l-4 border-status-info bg-status-info-subtle p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-status-info text-white">
          <Rocket className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-text-primary">
            1 active rollout in progress
          </div>
          <div className="text-[12px] text-text-secondary">
            {template?.name ?? "Template"} v{activeRollout.toVersion} — currently in
            <span className="font-medium"> {activeRollout.currentPhase ?? "—"} </span>
            phase ({migratedSoFar} of {activeRollout.totalAffectedTenants} tenants migrated)
            {phase
              ? ` · started ${formatRelativeTime(activeRollout.startedAt)}`
              : null}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 gap-1 text-status-info hover:bg-white/60"
          onClick={() => onOpenRollout(activeRollout.templateId)}
        >
          View Rollout
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    );
  }

  if (recentRollback) {
    const template = templates.find((t) => t.id === recentRollback.templateId);
    const restoredCount = recentRollback.phases
      .flatMap((p) => p.migratedTenantIds)
      .filter((id) => tenants.some((t) => t.id === id)).length;
    return (
      <div className="flex items-center gap-4 rounded-lg border border-l-4 border-status-warning bg-status-warning-subtle p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-status-warning text-white">
          <RotateCcw className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[13px] font-semibold text-text-primary">
            Recent rollback: {template?.name} reverted from v{recentRollback.toVersion} to v
            {recentRollback.fromVersion}
          </div>
          <div className="text-[12px] text-text-secondary">
            Rolled back {formatRelativeTime(recentRollback.abortedAt ?? "")} by
            {" "}
            {recentRollback.startedBy} · {restoredCount} tenants restored to previous version
          </div>
        </div>
      </div>
    );
  }
  return null;
}
