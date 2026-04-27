"use client";

import { motion } from "framer-motion";
import {
  Clock,
  GitBranch,
  MoreHorizontal,
  Rocket,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/formatters";
import { rollupTemplateStatus } from "./policy-helpers";
import { useConsoleStore } from "@/lib/store";
import type { PolicyTemplate } from "@/types";

interface TemplateCardProps {
  template: PolicyTemplate;
  index: number;
  onOpen: (templateId: string) => void;
}

export function TemplateCard({ template, index, onOpen }: TemplateCardProps) {
  const assignments = useConsoleStore((s) => s.policyTemplateAssignments);
  const overrides = useConsoleStore((s) => s.policyTemplateOverrides);
  const rollouts = useConsoleStore((s) => s.policyTemplateRollouts);
  const status = rollupTemplateStatus(template, assignments, overrides, rollouts);
  const visibleFrameworks = template.complianceFrameworks.slice(0, 4);
  const moreCount = template.complianceFrameworks.length - visibleFrameworks.length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.03, ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex h-full cursor-pointer flex-col gap-3 rounded-lg border border-border-subtle bg-surface p-4 shadow-card transition-shadow hover:shadow-md"
      onClick={() => onOpen(template.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold leading-tight text-text-primary">
              {template.name}
            </h3>
            <Badge
              variant="outline"
              className="shrink-0 border-border-default bg-secondary px-1.5 py-0 text-[11px] font-medium tabular-nums text-text-secondary"
            >
              v{template.currentVersion}
            </Badge>
          </div>
          <div className="mt-0.5 text-[11px] uppercase tracking-wide text-text-tertiary">
            {template.industry}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="-mr-1 -mt-1 flex h-7 w-7 items-center justify-center rounded text-text-tertiary opacity-0 transition-opacity hover:bg-secondary hover:text-text-primary group-hover:opacity-100"
              aria-label="Template actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onOpen(template.id)}>
              Edit template
            </DropdownMenuItem>
            <DropdownMenuItem>Clone template</DropdownMenuItem>
            <DropdownMenuItem>Apply to tenants</DropdownMenuItem>
            <DropdownMenuItem>Export YAML</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-status-critical">
              Archive
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <p className="line-clamp-2 text-[12px] leading-relaxed text-text-secondary">
        {template.description}
      </p>

      <div className="flex flex-wrap gap-1">
        {visibleFrameworks.map((f) => (
          <Badge
            key={f}
            variant="outline"
            className="border-border-subtle bg-secondary px-1.5 py-0 text-[10px] font-medium uppercase tracking-wide text-text-secondary"
          >
            {f}
          </Badge>
        ))}
        {moreCount > 0 ? (
          <Badge
            variant="outline"
            className="border-border-subtle bg-secondary px-1.5 py-0 text-[10px] font-medium text-text-tertiary"
          >
            +{moreCount} more
          </Badge>
        ) : null}
      </div>

      <div className="grid grid-cols-3 gap-2 border-t border-border-subtle pt-3 text-[11px] text-text-tertiary">
        <Stat icon={<Users className="h-3 w-3" />} label={`${status.totalAssignments} tenants`} />
        <Stat
          icon={<GitBranch className="h-3 w-3" />}
          label={`v${template.currentVersion}`}
        />
        <Stat
          icon={<Clock className="h-3 w-3" />}
          label={`Updated ${formatRelativeAbbr(template.updatedAt)}`}
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {status.inSync ? (
          <StatusBadge tone="success">In sync</StatusBadge>
        ) : null}
        {status.pendingMigration > 0 ? (
          <StatusBadge tone="warning">
            {status.pendingMigration} pending migration
          </StatusBadge>
        ) : null}
        {status.hasActiveRollout ? (
          <StatusBadge tone="info">
            <Rocket className="h-2.5 w-2.5" /> Rollout active
          </StatusBadge>
        ) : null}
        {status.overrideCount > 0 ? (
          <StatusBadge tone="amber">
            <ShieldAlert className="h-2.5 w-2.5" />
            {status.overrideCount} override{status.overrideCount === 1 ? "" : "s"} active
          </StatusBadge>
        ) : null}
      </div>
    </motion.div>
  );
}

function Stat({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 truncate">
      <span className="text-text-tertiary">{icon}</span>
      <span className="truncate font-medium text-text-secondary">{label}</span>
    </span>
  );
}

interface StatusBadgeProps {
  tone: "success" | "warning" | "info" | "amber";
  children: React.ReactNode;
}

function StatusBadge({ tone, children }: StatusBadgeProps) {
  const STYLES: Record<StatusBadgeProps["tone"], string> = {
    success: "bg-status-success-subtle text-status-success",
    warning: "bg-status-warning-subtle text-status-warning",
    info: "bg-status-info-subtle text-status-info",
    amber: "bg-status-warning-subtle text-status-warning",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10.5px] font-medium",
        STYLES[tone],
      )}
    >
      {children}
    </span>
  );
}

function formatRelativeAbbr(date: string): string {
  const ms = Date.now() - Date.parse(date);
  const days = Math.round(ms / (24 * 60 * 60_000));
  if (days < 1) return formatRelativeTime(date);
  if (days < 30) return `${days}d ago`;
  if (days < 365) return `${Math.round(days / 30)}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}
