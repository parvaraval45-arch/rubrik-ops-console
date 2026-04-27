"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useConsoleStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface PoliciesKpisProps {
  onPendingClick: () => void;
  onDriftClick: () => void;
}

export function PoliciesKpis({ onPendingClick, onDriftClick }: PoliciesKpisProps) {
  const templates = useConsoleStore((s) => s.policyTemplates);
  const assignments = useConsoleStore((s) => s.policyTemplateAssignments);
  const overrides = useConsoleStore((s) => s.policyTemplateOverrides);
  const tenants = useConsoleStore((s) => s.tenants);
  const [now] = useState(() => Date.now());

  const stats = useMemo(() => {
    const tenantCount = tenants.length;
    const assignedTenantIds = new Set(assignments.map((a) => a.tenantId));
    const pending = assignments.filter((a) => {
      const t = templates.find((x) => x.id === a.templateId);
      return t ? a.appliedVersion < t.currentVersion : false;
    });
    const driftTenants = new Set(overrides.map((o) => o.tenantId));
    const driftAgeDays =
      overrides.length === 0
        ? 0
        : Math.round(
            overrides
              .map((o) => (now - Date.parse(o.appliedAt)) / (24 * 60 * 60_000))
              .reduce((a, b) => a + b, 0) / overrides.length,
          );

    const tierCounts = templates.reduce<Record<string, number>>((acc, t) => {
      const tier = t.tags.includes("regulated")
        ? "Platinum-aligned"
        : t.tags.includes("silver")
          ? "Silver-aligned"
          : t.tags.includes("bronze")
            ? "Bronze-aligned"
            : "Gold-aligned";
      acc[tier] = (acc[tier] ?? 0) + 1;
      return acc;
    }, {});

    return {
      activeTemplates: templates.length,
      industriesCovered: new Set(templates.map((t) => t.industry)).size,
      assignedTenantCount: assignedTenantIds.size,
      defaultTenantCount: tenantCount - assignedTenantIds.size,
      totalTenantCount: tenantCount,
      pendingTenantCount: new Set(pending.map((a) => a.tenantId)).size,
      driftCount: overrides.length,
      driftTenantCount: driftTenants.size,
      driftAgeDays,
      tierCounts,
    };
  }, [templates, assignments, overrides, tenants, now]);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
      <KpiTile
        index={0}
        label="Active Templates"
        value={stats.activeTemplates}
        sublabel={`Across ${stats.industriesCovered} industries`}
        footer={
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] tabular-nums text-text-tertiary">
            {Object.entries(stats.tierCounts).map(([tier, count]) => (
              <span key={tier}>
                <span className="font-semibold text-text-secondary">{count}</span>{" "}
                {tier}
              </span>
            ))}
          </div>
        }
      />
      <KpiTile
        index={1}
        label="Tenant Assignments"
        value={stats.assignedTenantCount}
        sublabel={`of ${stats.totalTenantCount} active tenants have policies applied`}
        footer={
          <div className="text-[11px] text-text-tertiary">
            <span className="tabular-nums font-semibold text-text-secondary">
              {stats.defaultTenantCount}
            </span>{" "}
            tenants on default policy (auto-assigned)
          </div>
        }
      />
      <KpiTile
        index={2}
        label="Pending Migrations"
        value={`${stats.pendingTenantCount} tenants`}
        sublabel="Awaiting rollout to latest template versions"
        onClick={stats.pendingTenantCount > 0 ? onPendingClick : undefined}
      />
      <KpiTile
        index={3}
        label="Override Drift"
        value={`${stats.driftCount} overrides active`}
        sublabel={`Across ${stats.driftTenantCount} tenants`}
        footer={
          <div className="text-[11px] text-text-tertiary">
            Avg drift age:{" "}
            <span className="tabular-nums font-semibold text-text-secondary">
              {stats.driftAgeDays} days
            </span>
          </div>
        }
        onClick={stats.driftCount > 0 ? onDriftClick : undefined}
      />
    </div>
  );
}

interface KpiTileProps {
  label: string;
  value: number | string;
  sublabel?: string;
  footer?: React.ReactNode;
  onClick?: () => void;
  index: number;
}

function KpiTile({ label, value, sublabel, footer, onClick, index }: KpiTileProps) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative flex h-full flex-col gap-2 rounded-lg border border-border-subtle bg-surface p-4 text-left shadow-card transition-shadow",
        onClick ? "cursor-pointer hover:shadow-md" : "cursor-default",
      )}
    >
      <span className="line-clamp-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-text-tertiary">
        {label}
      </span>
      <div className="flex items-end gap-2">
        <span className="text-[26px] font-semibold leading-none tracking-tight tabular-nums text-text-primary">
          {value}
        </span>
      </div>
      {sublabel ? (
        <span className="text-[12px] leading-snug text-text-secondary">{sublabel}</span>
      ) : null}
      {footer}
    </motion.button>
  );
}
