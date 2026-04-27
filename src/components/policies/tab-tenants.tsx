"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConsoleStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/formatters";
import { toast } from "sonner";
import { currentOperator } from "@/lib/mock-data";
import type { PolicyTemplate } from "@/types";

interface TabTenantsProps {
  template: PolicyTemplate;
}

export function TabTenants({ template }: TabTenantsProps) {
  const assignments = useConsoleStore((s) => s.policyTemplateAssignments);
  const overrides = useConsoleStore((s) => s.policyTemplateOverrides);
  const tenants = useConsoleStore((s) => s.tenants);
  const removePolicyTemplateOverride = useConsoleStore(
    (s) => s.removePolicyTemplateOverride,
  );
  const removePolicyTemplateFromTenant = useConsoleStore(
    (s) => s.removePolicyTemplateFromTenant,
  );

  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const rows = useMemo(() => {
    const list = assignments.filter((a) => a.templateId === template.id);
    return list.map((a) => {
      const tenant = tenants.find((t) => t.id === a.tenantId);
      const tenantOverrides = overrides.filter(
        (o) => o.templateId === template.id && o.tenantId === a.tenantId,
      );
      const onCurrent = a.appliedVersion === template.currentVersion;
      const hasOverrides = tenantOverrides.length > 0;
      const status: "in-sync" | "drift" | "pending" | "failed" = !onCurrent
        ? "pending"
        : hasOverrides
          ? "drift"
          : "in-sync";
      return {
        assignment: a,
        tenant,
        overrides: tenantOverrides,
        status,
      };
    });
  }, [assignments, overrides, tenants, template.id, template.currentVersion]);

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border-default bg-secondary/40 p-12 text-center">
        <CircleAlert className="h-6 w-6 text-text-tertiary" />
        <div className="text-[13px] font-medium text-text-secondary">
          No tenants assigned to this template
        </div>
        <div className="text-[12px] text-text-tertiary">
          Use Apply to Tenants from the template menu to add assignments.
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
      <div className="grid grid-cols-[1fr_90px_140px_140px_120px_140px_60px] gap-3 border-b border-border-subtle bg-secondary px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
        <span>Tenant</span>
        <span>Version</span>
        <span>Applied</span>
        <span>Status</span>
        <span>Overrides</span>
        <span>Last Modified</span>
        <span></span>
      </div>
      <div className="divide-y divide-border-subtle">
        {rows.map((row) => {
          if (!row.tenant) return null;
          const expanded = expandedRow === row.assignment.tenantId;
          return (
            <div key={row.assignment.tenantId}>
              <button
                type="button"
                onClick={() =>
                  setExpandedRow(expanded ? null : row.assignment.tenantId)
                }
                className="grid w-full grid-cols-[1fr_90px_140px_140px_120px_140px_60px] items-center gap-3 px-4 py-2.5 text-left text-[12.5px] transition-colors hover:bg-secondary/50"
              >
                <span className="flex items-center gap-2 truncate">
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 shrink-0 text-text-tertiary transition-transform",
                      expanded && "rotate-90",
                    )}
                  />
                  <Avatar className="h-6 w-6 text-[10px]">
                    <AvatarFallback className="bg-secondary text-text-secondary">
                      {row.tenant.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <Link
                    href={`/tenants/${row.tenant.id}?tab=policies`}
                    onClick={(e) => e.stopPropagation()}
                    className="truncate font-medium text-text-primary underline-offset-2 hover:text-brand-primary-hover hover:underline"
                  >
                    {row.tenant.name}
                  </Link>
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "w-fit px-1.5 py-0 text-[11px] tabular-nums",
                    row.assignment.appliedVersion === template.currentVersion
                      ? "border-brand-primary bg-brand-primary-subtle text-brand-primary-hover"
                      : "border-status-warning bg-status-warning-subtle text-status-warning",
                  )}
                >
                  v{row.assignment.appliedVersion}
                </Badge>
                <span className="tabular-nums text-text-secondary">
                  {formatRelativeShort(row.assignment.appliedAt)}
                </span>
                <StatusPill status={row.status} />
                <span className="tabular-nums text-text-secondary">
                  {row.overrides.length === 0
                    ? "0 overrides"
                    : `${row.overrides.length} override${row.overrides.length === 1 ? "" : "s"}`}
                </span>
                <span className="tabular-nums text-text-tertiary">
                  {formatRelativeShort(row.assignment.appliedAt)}
                </span>
                <span className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="flex h-7 w-7 items-center justify-center rounded text-text-tertiary hover:bg-secondary hover:text-text-primary"
                        aria-label="Tenant actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() =>
                          toast.success(`Re-applying v${template.currentVersion} to ${row.tenant?.name}`)
                        }
                      >
                        Force re-apply
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setExpandedRow(row.assignment.tenantId)}
                      >
                        View drift detail
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-status-critical"
                        onClick={() => {
                          if (!row.tenant) return;
                          removePolicyTemplateFromTenant(
                            template.id,
                            row.tenant.id,
                            currentOperator.name,
                          );
                          toast(`${row.tenant.name} removed from ${template.name}`);
                        }}
                      >
                        Remove from template
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </span>
              </button>
              {expanded ? (
                <div className="border-t border-border-subtle bg-secondary/30 px-12 py-3 text-[12px]">
                  {row.overrides.length === 0 ? (
                    <div className="text-text-tertiary">
                      No active overrides. Tenant is on template defaults for v
                      {row.assignment.appliedVersion}.
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {row.overrides.map((o) => (
                        <div
                          key={o.id}
                          className="flex items-center justify-between gap-3 rounded-md border border-border-subtle bg-surface px-3 py-2"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="text-[12.5px] font-medium text-text-primary">
                              Override on {o.fieldLabel}
                            </div>
                            <div className="mt-0.5 text-[11.5px] tabular-nums text-text-secondary">
                              Template:{" "}
                              <span className="line-through">{o.templateValue}</span>
                              {" → "}
                              Override:{" "}
                              <span className="font-medium text-status-warning">
                                {o.overrideValue}
                              </span>
                            </div>
                            <div className="mt-0.5 text-[11px] text-text-tertiary">
                              Applied {formatRelativeShort(o.appliedAt)} by{" "}
                              <span className="font-medium text-text-secondary">
                                {o.appliedBy}
                              </span>{" "}
                              · Reason: {o.reason}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 gap-1 text-[11px]"
                            onClick={() => {
                              removePolicyTemplateOverride(o.id, currentOperator.name);
                              toast.success("Override removed", {
                                description: `${o.fieldLabel} restored to template default`,
                              });
                            }}
                          >
                            <RefreshCw className="h-3 w-3" />
                            Remove override
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: "in-sync" | "drift" | "pending" | "failed" }) {
  if (status === "in-sync") {
    return (
      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-status-success-subtle px-2 py-0.5 text-[10.5px] font-medium text-status-success">
        <CircleCheck className="h-2.5 w-2.5" />
        In sync
      </span>
    );
  }
  if (status === "drift") {
    return (
      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-status-warning-subtle px-2 py-0.5 text-[10.5px] font-medium text-status-warning">
        <CircleAlert className="h-2.5 w-2.5" />
        Drift detected
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-status-info-subtle px-2 py-0.5 text-[10.5px] font-medium text-status-info">
        <Loader2 className="h-2.5 w-2.5" />
        Pending migration
      </span>
    );
  }
  return (
    <span className="inline-flex w-fit items-center gap-1 rounded-full bg-status-critical-subtle px-2 py-0.5 text-[10.5px] font-medium text-status-critical">
      <XCircle className="h-2.5 w-2.5" />
      Migration failed
    </span>
  );
}

function formatRelativeShort(date: string): string {
  const ms = Date.now() - Date.parse(date);
  const days = Math.round(ms / (24 * 60 * 60_000));
  if (days < 1) {
    const hours = Math.max(1, Math.round(ms / (60 * 60_000)));
    return `${hours}h ago`;
  }
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}

void formatDateTime;
