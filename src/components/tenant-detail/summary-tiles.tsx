"use client";

import { ArrowUpRight, ShieldCheck, ShieldX, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatPercent } from "@/lib/formatters";
import type { JobSession, Tenant, Workload } from "@/types";

interface SummaryTilesProps {
  tenant: Tenant;
  jobs: JobSession[];
  workloads: Workload[];
  passingControls: number;
  totalControls: number;
  warningControls: number;
  failedControls: number;
  postureScore: number;
  onTileClick?: (
    target: "capacity" | "backups-failed" | "security" | "sla",
  ) => void;
}

export function SummaryTiles({
  tenant,
  jobs,
  passingControls,
  totalControls,
  warningControls,
  failedControls,
  postureScore,
  onTileClick,
}: SummaryTilesProps) {
  const monthJobs = jobs.slice(0, 435);
  const succeeded = monthJobs.filter((j) => j.status === "succeeded").length;
  const failed = monthJobs.filter((j) => j.status === "failed").length;
  const successRate =
    monthJobs.length > 0 ? (succeeded / monthJobs.length) * 100 : 100;
  const lastFailure = monthJobs.find((j) => j.status === "failed");
  const lastFailureLabel = lastFailure
    ? relativeHoursAgo(lastFailure.startedAt)
    : "no failures in 30 days";

  const usageRatio =
    tenant.capacityCommittedTB > 0
      ? tenant.capacityUsedTB / tenant.capacityCommittedTB
      : 0;
  const usageTone = usageRatio > 0.95 ? "critical" : usageRatio > 0.8 ? "warning" : "ok";
  const usageBarColor =
    usageTone === "critical"
      ? "bg-status-critical"
      : usageTone === "warning"
        ? "bg-status-warning"
        : "bg-brand-primary";

  const sla = tenant.slaCompliance;
  const slaTarget =
    tenant.tier === "Platinum"
      ? 99.9
      : tenant.tier === "Gold"
        ? 99.0
        : tenant.tier === "Silver"
          ? 97.5
          : 95.0;

  const postureTone =
    postureScore >= 85 ? "ok" : postureScore >= 70 ? "warning" : "critical";

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <Tile
        title="Protected Capacity"
        valuePrimary={`${tenant.capacityUsedTB.toFixed(1)} / ${tenant.capacityCommittedTB.toFixed(1)} TB`}
        onClick={() => onTileClick?.("capacity")}
      >
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className={cn("h-full rounded-full transition-all", usageBarColor)}
            style={{ width: `${Math.min(100, usageRatio * 100)}%` }}
          />
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-[12px] text-status-success">
          <TrendingUp className="h-3 w-3" />
          <span className="tabular-nums">+1.2 TB</span>
          <span className="text-text-tertiary">in last 7 days</span>
        </div>
      </Tile>

      <Tile
        title="Backup Success (30d)"
        valuePrimary={formatPercent(successRate)}
        onClick={() => onTileClick?.("backups-failed")}
      >
        <div className="mt-2 flex flex-col gap-0.5 text-[12px] text-text-secondary">
          <span className="tabular-nums">
            {succeeded} of {monthJobs.length} jobs succeeded · {failed} failed
          </span>
          <span className="text-text-tertiary">Last failure: {lastFailureLabel}</span>
        </div>
      </Tile>

      <Tile
        title="Security Posture Score"
        valuePrimary={postureScore.toString()}
        valueTone={postureTone}
        onClick={() => onTileClick?.("security")}
      >
        <div className="mt-2 flex items-center gap-1.5 text-[12px] text-text-secondary">
          {failedControls === 0 && warningControls === 0 ? (
            <ShieldCheck className="h-3.5 w-3.5 text-status-success" />
          ) : (
            <ShieldX className="h-3.5 w-3.5 text-status-warning" />
          )}
          <span className="tabular-nums">
            {passingControls} of {totalControls} controls passed · {warningControls} warning · {failedControls} failed
          </span>
        </div>
      </Tile>

      <Tile
        title="SLA Compliance"
        valuePrimary={formatPercent(sla)}
        valueTone={sla >= slaTarget ? "ok" : "critical"}
        onClick={() => onTileClick?.("sla")}
      >
        <div className="mt-2 flex flex-col gap-0.5 text-[12px] text-text-secondary">
          <span>0 SLA breaches in last 30 days</span>
          <span className="text-text-tertiary tabular-nums">
            Target: {formatPercent(slaTarget)} ({tenant.tier} tier)
          </span>
        </div>
      </Tile>
    </div>
  );
}

function Tile({
  title,
  valuePrimary,
  valueTone = "ok",
  children,
  onClick,
}: {
  title: string;
  valuePrimary: string;
  valueTone?: "ok" | "warning" | "critical";
  children?: React.ReactNode;
  onClick?: () => void;
}) {
  const valueColor =
    valueTone === "critical"
      ? "text-status-critical"
      : valueTone === "warning"
        ? "text-status-warning"
        : "text-text-primary";
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group relative flex flex-col items-start rounded-lg border border-border-subtle bg-surface p-4 text-left shadow-card transition-shadow",
        onClick ? "cursor-pointer hover:shadow-md" : "cursor-default",
      )}
    >
      <div className="flex w-full items-start justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
          {title}
        </span>
        {onClick ? (
          <ArrowUpRight className="h-3.5 w-3.5 text-text-tertiary opacity-0 transition-opacity group-hover:opacity-100" />
        ) : null}
      </div>
      <span className={cn("mt-2 text-[24px] font-semibold leading-none tracking-tight tabular-nums", valueColor)}>
        {valuePrimary}
      </span>
      {children}
    </button>
  );
}

function relativeHoursAgo(iso: string) {
  const ms = Date.now() - Date.parse(iso);
  const hours = Math.round(ms / (60 * 60 * 1000));
  if (hours < 1) return "less than 1 hour ago";
  if (hours < 24) return `${hours} hours ago`;
  const days = Math.round(hours / 24);
  return `${days} days ago`;
}
