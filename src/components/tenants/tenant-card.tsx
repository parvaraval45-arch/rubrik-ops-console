"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkline } from "@/components/data/sparkline";
import { StatusDot } from "@/components/data/status-dot";
import { formatPercent, formatRelativeTime, formatTB } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import type { Tenant, Tier } from "@/types";

const TIER_BADGE: Record<Tier, string> = {
  Platinum: "bg-slate-900 text-white",
  Gold: "bg-amber-100 text-amber-900",
  Silver: "bg-slate-200 text-slate-700",
  Bronze: "bg-orange-100 text-orange-900",
};

const STATUS_TONE: Record<Tenant["status"], "success" | "info" | "warning" | "critical"> = {
  Active: "success",
  Onboarding: "info",
  Suspended: "warning",
  Churned: "critical",
};

export function TenantCard({
  tenant,
  selected,
  onToggleSelect,
}: {
  tenant: Tenant;
  selected: boolean;
  onToggleSelect: () => void;
}) {
  const successAvg =
    tenant.backupSuccess7d.reduce((s, n) => s + n, 0) / Math.max(1, tenant.backupSuccess7d.length);
  const utilization =
    tenant.capacityCommittedTB > 0 ? (tenant.capacityUsedTB / tenant.capacityCommittedTB) * 100 : 0;
  const dim = tenant.status === "Suspended" || tenant.status === "Churned";

  return (
    <Link
      href={`/tenants/${tenant.id}`}
      className={cn(
        "group relative flex flex-col gap-3 rounded-lg border border-border-subtle bg-surface p-4 shadow-card transition-shadow hover:shadow-md",
        dim && "opacity-70",
        selected && "ring-2 ring-brand-primary",
      )}
    >
      <div className="absolute right-3 top-3 z-[1] flex items-center gap-1" data-stop-row-click="true">
        <Checkbox
          checked={selected}
          onCheckedChange={(v) => {
            void v;
            onToggleSelect();
          }}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onToggleSelect();
          }}
        />
      </div>

      <div className="flex items-start gap-3">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-brand-primary-subtle text-[12px] font-semibold text-brand-primary-hover">
            {initials(tenant.name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex min-w-0 flex-col">
          <div className="flex items-center gap-2">
            <span className="truncate text-[14px] font-semibold text-text-primary">
              {tenant.name}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "border-transparent text-[10px] font-semibold uppercase",
                TIER_BADGE[tenant.tier],
              )}
            >
              {tenant.tier}
            </Badge>
          </div>
          <span className="text-[11.5px] text-text-tertiary">
            {tenant.industry} · {tenant.region}
          </span>
          <StatusDot tone={STATUS_TONE[tenant.status]} label={tenant.status} className="mt-1" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-[12px]">
        <Mini label="Capacity" value={formatPercent(utilization, 0)} tone={utilization >= 95 ? "critical" : utilization >= 80 ? "warning" : "default"} />
        <Mini label="Backup" value={formatPercent(successAvg, 1)} tone={successAvg >= 95 ? "default" : successAvg >= 85 ? "warning" : "critical"} />
        <Mini label="Security" value={tenant.securityScore.toString()} tone={tenant.securityScore >= 85 ? "default" : tenant.securityScore >= 70 ? "warning" : "critical"} />
        <Mini label="SLA" value={formatPercent(tenant.slaCompliance, 1)} tone={tenant.slaCompliance >= 99 ? "default" : "warning"} />
      </div>

      <Sparkline values={tenant.backupSuccess7d} width={220} height={28} stroke="var(--brand-primary)" />

      <div className="flex items-center justify-between text-[11.5px] text-text-tertiary">
        <span>{tenant.workloadCount} workloads · {formatTB(tenant.capacityCommittedTB)}</span>
        <span suppressHydrationWarning>{formatRelativeTime(tenant.lastBackupAt)}</span>
      </div>
    </Link>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "default" | "warning" | "critical";
}) {
  return (
    <div className="rounded-md border border-border-subtle bg-canvas p-2.5">
      <div className="text-[10px] font-semibold uppercase tracking-wide text-text-tertiary">
        {label}
      </div>
      <div
        className={cn(
          "mt-0.5 text-[14px] font-semibold tabular-nums",
          tone === "critical" && "text-status-critical",
          tone === "warning" && "text-status-warning",
          tone === "default" && "text-text-primary",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter((c) => /[A-Za-z]/.test(c))
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

void Button;
void MoreHorizontal;
