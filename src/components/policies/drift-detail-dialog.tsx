"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ageInDays } from "./policy-helpers";
import { ChevronRight, ShieldAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useConsoleStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { currentOperator } from "@/lib/mock-data";

interface DriftDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DriftDetailDialog({ open, onOpenChange }: DriftDetailDialogProps) {
  const overrides = useConsoleStore((s) => s.policyTemplateOverrides);
  const tenants = useConsoleStore((s) => s.tenants);
  const templates = useConsoleStore((s) => s.policyTemplates);
  const removePolicyTemplateOverride = useConsoleStore(
    (s) => s.removePolicyTemplateOverride,
  );
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [now] = useState(() => Date.now());

  const stats = useMemo(() => {
    const distinctTenants = new Set(overrides.map((o) => o.tenantId));
    const avgAge =
      overrides.length === 0
        ? 0
        : Math.round(
            overrides
              .map((o) => ageInDays(o.appliedAt, now))
              .reduce((a, b) => a + b, 0) / overrides.length,
          );
    return {
      total: overrides.length,
      tenantCount: distinctTenants.size,
      avgAge,
    };
  }, [overrides, now]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="grid h-[80vh] max-w-[1100px] grid-rows-[auto_1fr_auto] gap-0 p-0 sm:max-w-[1100px]">
        <header className="flex flex-col gap-1 border-b border-border-subtle px-6 py-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-status-warning" />
            <DialogTitle className="text-[17px] font-semibold leading-tight text-text-primary">
              Active Policy Overrides — Drift Report
            </DialogTitle>
          </div>
          <DialogDescription className="text-[12px] text-text-secondary">
            <span className="font-medium text-text-primary tabular-nums">
              {stats.total}
            </span>{" "}
            overrides across{" "}
            <span className="font-medium text-text-primary tabular-nums">
              {stats.tenantCount}
            </span>{" "}
            tenants. Avg drift age:{" "}
            <span className="font-medium text-text-primary tabular-nums">
              {stats.avgAge} days
            </span>
            .
          </DialogDescription>
        </header>

        <div className="overflow-y-auto px-6 py-4">
          <div className="overflow-hidden rounded-lg border border-border-subtle bg-surface">
            <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr_120px_100px] gap-3 border-b border-border-subtle bg-secondary px-4 py-2 text-[10.5px] font-semibold uppercase tracking-wide text-text-tertiary">
              <span>Tenant</span>
              <span>Template</span>
              <span>Field</span>
              <span>Template Value</span>
              <span>Override Value</span>
              <span>Applied By</span>
              <span>Applied</span>
            </div>
            <div className="divide-y divide-border-subtle">
              {overrides.map((o) => {
                const tenant = tenants.find((t) => t.id === o.tenantId);
                const template = templates.find((t) => t.id === o.templateId);
                const isExpanded = expandedId === o.id;
                return (
                  <div key={o.id}>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : o.id)}
                      className="grid w-full grid-cols-[1fr_1fr_1fr_1fr_1fr_120px_100px] items-start gap-3 px-4 py-2.5 text-left text-[12px] transition-colors hover:bg-secondary/40"
                    >
                      <span className="flex items-start gap-1 truncate font-medium text-text-primary">
                        <ChevronRight
                          className={cn(
                            "mt-0.5 h-3 w-3 shrink-0 text-text-tertiary transition-transform",
                            isExpanded && "rotate-90",
                          )}
                        />
                        {tenant ? (
                          <Link
                            href={`/tenants/${tenant.id}?tab=policies`}
                            onClick={(e) => e.stopPropagation()}
                            className="truncate underline-offset-2 hover:text-brand-primary-hover hover:underline"
                          >
                            {tenant.name}
                          </Link>
                        ) : (
                          <span className="truncate">{o.tenantId}</span>
                        )}
                      </span>
                      <span className="truncate text-text-secondary">
                        {template?.name ?? o.templateId} v{template?.currentVersion ?? "?"}
                      </span>
                      <span className="truncate text-text-secondary">{o.fieldLabel}</span>
                      <span className="truncate tabular-nums text-text-tertiary">
                        {o.templateValue}
                      </span>
                      <span className="truncate tabular-nums font-medium text-status-warning">
                        {o.overrideValue}
                      </span>
                      <span className="truncate text-text-secondary">{o.appliedBy}</span>
                      <span className="tabular-nums text-text-tertiary">
                        {formatRelativeShort(o.appliedAt)}
                      </span>
                    </button>
                    {isExpanded ? (
                      <div className="border-t border-border-subtle bg-secondary/30 px-12 py-3 text-[12px] text-text-secondary">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-text-tertiary">
                              Reason
                            </div>
                            <p className="mt-1 leading-relaxed text-text-primary">
                              {o.reason}
                            </p>
                            <div className="mt-2 grid grid-cols-3 gap-3 text-[11.5px] text-text-tertiary">
                              <span>
                                Applied{" "}
                                <span className="font-medium tabular-nums text-text-secondary">
                                  {formatRelativeShort(o.appliedAt)}
                                </span>
                              </span>
                              <span>
                                Operator{" "}
                                <span className="font-medium text-text-secondary">
                                  {o.appliedBy}
                                </span>
                              </span>
                              <span>
                                Override ID{" "}
                                <span className="font-mono tabular-nums text-text-secondary">
                                  {o.id.slice(-8)}
                                </span>
                              </span>
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
                            Remove override
                          </Button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-between border-t border-border-subtle px-6 py-3">
          <div className="text-[12px] text-text-secondary">
            Use Review All Overrides to package the full set into an attestation export.
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              toast.success("Review packaged", {
                description: "Drift report queued for compliance review.",
              })
            }
          >
            Review All Overrides
          </Button>
        </footer>
      </DialogContent>
    </Dialog>
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
